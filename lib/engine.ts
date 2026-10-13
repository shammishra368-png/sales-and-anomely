import { db } from "./db";
import ml from "../data/ml_metrics.json";
import { IsolationForest } from "./iforest";
import type { AnomalyKind, MlMetrics, ProductSummary, Rec, Snapshot, Stats } from "./types";

export const ITEMS = [
  { name: "Amul Taaza Milk (1L)", mean: 85, std: 8, inv: 550, price: 66 },
  { name: "Aashirvaad Atta (10kg)", mean: 38, std: 4, inv: 280, price: 420 },
  { name: "Fortune Sunflower Oil (1L)", mean: 44, std: 5, inv: 320, price: 145 },
  { name: "India Gate Rice (5kg)", mean: 30, std: 4, inv: 240, price: 380 },
  { name: "Tata Tea Gold (500g)", mean: 40, std: 4, inv: 260, price: 260 },
  { name: "Madhur Pure Sugar (1kg)", mean: 55, std: 6, inv: 360, price: 46 },
  { name: "Tata Toor Dal (1kg)", mean: 32, std: 4, inv: 230, price: 175 },
  { name: "Amul Butter (500g)", mean: 48, std: 5, inv: 310, price: 285 },
  { name: "Surf Excel Detergent (1kg)", mean: 34, std: 4, inv: 250, price: 140 },
  { name: "Fresh Farm Eggs (Tray 30)", mean: 42, std: 4, inv: 280, price: 210 },
  { name: "Britannia Good Day Cookies", mean: 65, std: 6, inv: 420, price: 40 },
  { name: "Maggi Noodles (Pack of 8)", mean: 58, std: 6, inv: 380, price: 112 },
];

const g = globalThis as unknown as {
  __eng?: { itemIndex: number; day: number; logged: Set<number>; model: IsolationForest | null };
};
const S = (g.__eng ??= { itemIndex: 0, day: 0, logged: new Set(), model: null });

const gauss = (mu: number, sd: number) =>
  mu + sd * Math.sqrt(-2 * Math.log(1 - Math.random())) * Math.cos(2 * Math.PI * Math.random());
const uniform = (a: number, b: number) => a + Math.random() * (b - a);

const PAGE = 1000; // PostgREST caps a response at 1000 rows by default

/** One evaluation of the SQL view = every record with z-scores, severity, impact. */
export async function allRows(): Promise<Rec[]> {
  const rows: Rec[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await db().from("zscore_live_view").select("*").order("id").range(from, from + PAGE - 1);
    if (error) throw new Error(`zscore_live_view: ${error.message}`);
    rows.push(...(data as Rec[]));
    if (data.length < PAGE) return rows;
  }
}

const feat = (r: Pick<Rec, "sales" | "inventory" | "revenue" | "rolling_mean" | "rolling_std">) => {
  const diff = r.sales - (r.rolling_mean ?? r.sales);
  return [r.sales, r.inventory, r.revenue, r.sales / (r.inventory + 1), diff, r.rolling_std > 0 ? diff / r.rolling_std : 0];
};

function model(rows: Rec[]) {
  if (!S.model) {
    const train = rows.filter((r) => r.rolling_mean !== null);
    if (train.length > 50) S.model = new IsolationForest(train.map(feat));
  }
  return S.model;
}

export function summarize(rows: Rec[]): Snapshot {
  const n = rows.length;
  const count = (f: (r: Rec) => boolean) => rows.reduce((s, r) => s + (f(r) ? 1 : 0), 0);
  const type = (t: string) => count((r) => r.anomaly_type === t);
  const critical = count((r) => r.severity === "CRITICAL");
  const warning = count((r) => r.severity === "WARNING");
  const flagged = count((r) => r.is_flagged === 1);
  const loss = rows.reduce((s, r) => s + (r.financial_impact < 0 ? r.financial_impact : 0), 0);
  const round = (v: number, d = 2) => +v.toFixed(d);

  const stats: Stats = {
    total_records: n,
    total_units_sold: rows.reduce((s, r) => s + r.sales, 0),
    total_revenue: round(rows.reduce((s, r) => s + r.revenue, 0)),
    total_anomalies: flagged,
    anomaly_rate: n ? round((flagged / n) * 100) : 0,
    critical_anomalies: critical,
    warning_anomalies: warning,
    sales_spikes: type("Sales Spike"),
    sales_drops: type("Sales Drop"),
    stockouts: type("Inventory Stockout"),
    critical_stock: type("Critical Low Stock"),
    shrinkage_count: type("Inventory Shrinkage (Theft)"),
    total_loss: Math.abs(round(loss)),
    health_score: n
      ? Math.max(72, Math.min(99.5, round((1 - (critical * 1.5 + warning * 0.5) / n) * 100, 1)))
      : 98.5,
  };

  const by = new Map<string, Rec[]>();
  for (const r of rows) (by.get(r.item) ?? by.set(r.item, []).get(r.item)!).push(r);
  const products_summary: ProductSummary[] = [...by].map(([item, rs]) => {
    const c = (f: (r: Rec) => boolean) => rs.filter(f).length;
    const sum = (f: (r: Rec) => number) => rs.reduce((s, r) => s + f(r), 0);
    return {
      item,
      total: rs.length,
      anomalies: c((r) => r.is_flagged === 1),
      critical: c((r) => r.severity === "CRITICAL"),
      warning: c((r) => r.severity === "WARNING"),
      spikes: c((r) => r.anomaly_type === "Sales Spike"),
      drops: c((r) => r.anomaly_type === "Sales Drop"),
      shrinkage: c((r) => r.anomaly_type === "Inventory Shrinkage (Theft)"),
      stockouts: c((r) => r.anomaly_type === "Inventory Stockout"),
      avg_sales: round(sum((r) => r.sales) / rs.length, 1),
      avg_inv: round(sum((r) => r.inventory) / rs.length, 1),
      revenue: round(sum((r) => r.revenue)),
      impact: round(sum((r) => r.financial_impact)),
    };
  });
  products_summary.sort((a, b) => b.anomalies - a.anomalies);
  return { stats, products_summary };
}

export const mlMetrics = (): MlMetrics => ml;

async function log(r: Rec) {
  if (!r.is_flagged || S.logged.has(r.id)) return;
  S.logged.add(r.id);
  const { error } = await db().from("anomaly_log").upsert(
    { record_id: r.id, record_date: r.record_date, item: r.item, severity: r.severity, anomaly_type: r.anomaly_type,
      sales: r.sales, rolling_mean: r.rolling_mean, z_score: r.z_score, inventory: r.inventory, financial_impact: r.financial_impact },
    { onConflict: "record_id", ignoreDuplicates: true },
  );
  if (error) console.error("[anomaly_log]", error.message); // logging must never break the live stream
}

/** Generate one POS transaction, insert it, evaluate it with the SQL view + Isolation Forest. */
export async function step(itemName?: string, forced?: AnomalyKind) {
  const d = db();
  const item = ITEMS.find((i) => i.name.toLowerCase() === itemName?.toLowerCase()) ?? ITEMS[S.itemIndex];

  let sales = Math.max(0, Math.round(gauss(item.mean, item.std)));
  const { data: last, error: lastErr } = await d
    .from("sales_data").select("inventory").eq("item", item.name).order("id", { ascending: false }).limit(1).maybeSingle();
  if (lastErr) throw new Error(`sales_data read: ${lastErr.message}`);
  let inventory = (last?.inventory ?? item.inv) - sales;
  if (S.day % 7 === 0) inventory += item.mean * 8;

  const kind = forced ?? (Math.random() < 0.1 ? (["spike", "drop", "shrinkage", "stockout"] as const)[Math.floor(Math.random() * 4)] : undefined);
  if (kind === "spike") {
    sales = Math.round(item.mean * uniform(5, 7.5));
    inventory = Math.max(0, inventory - (sales - item.mean));
  } else if (kind === "drop") sales = 0;
  else if (kind === "shrinkage") inventory = Math.round(item.mean * 0.15);
  else if (kind === "stockout") { inventory = 0; sales = 0; }

  inventory = Math.max(0, inventory);
  const today = new Date().toLocaleDateString("en-CA");
  const { data: ins, error: insErr } = await d
    .from("sales_data")
    .insert({
      record_date: today, item: item.name, sales, inventory, unit_price: item.price,
      revenue: +(sales * item.price).toFixed(2), stock_value: +(inventory * item.price).toFixed(2), is_injected_anomaly: kind ? 1 : 0,
    })
    .select("id")
    .single();
  if (insErr) throw new Error(`sales_data insert: ${insErr.message}`);

  if (!itemName && !forced) {
    S.itemIndex = (S.itemIndex + 1) % ITEMS.length;
    S.day++;
  }

  const rows = await allRows();
  const record = rows.find((r) => r.id === Number(ins.id))!;
  const m = model(rows);
  if (m) {
    const p = m.predict(feat({ ...record, rolling_std: record.rolling_std || 1 }));
    record.ml_anomaly_flag = p.flag as 0 | 1;
    record.ml_anomaly_score = p.score;
  }
  await log(record);
  return { record, ...summarize(rows) };
}

export async function snapshot(limit = 500) {
  const rows = await allRows();
  return { ...summarize(rows), ml_metrics: mlMetrics(), records: rows.slice(-limit) };
}
