"use client";

import { Line } from "react-chartjs-2";
import { GRID, TICK, baseOptions, legend } from "@/lib/chart";
import type { Rec, Stats } from "@/lib/types";
import { Card } from "./ui";

const ITEM = "Amul Taaza Milk (1L)";

export function Inventory({ records, stats }: { records: Rec[]; stats: Stats | null }) {
  const rows = records.filter((r) => r.item === ITEM).slice(-40);
  const cards = [
    { dot: "bg-rose-500", tone: "text-rose-300", title: "Inventory Shrinkage (Theft)", sub: "Unexplained stock depletion", n: stats?.shrinkage_count },
    { dot: "bg-red-500", tone: "text-red-300", title: "Inventory Stockout", sub: "Zero inventory remaining", n: stats?.stockouts },
    { dot: "bg-amber-500", tone: "text-amber-300", title: "Critical Low Stock", sub: "< 2 days of rolling sales", n: stats?.critical_stock },
  ];
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card>
        <h2 className="mb-2 text-base font-bold text-white">Inventory Discrepancy Breakdown</h2>
        <p className="mb-6 text-xs text-slate-300">Operational classification of warehouse stock anomalies.</p>
        <div className="space-y-4">
          {cards.map((c) => (
            <div key={c.title} className="flex items-center justify-between rounded-xl border border-slate-700 bg-slate-950/60 p-3.5">
              <div className="flex items-center gap-3">
                <span className={`h-3 w-3 rounded-full ${c.dot}`} />
                <div>
                  <div className="text-xs font-bold text-white">{c.title}</div>
                  <div className="text-[11px] text-slate-300">{c.sub}</div>
                </div>
              </div>
              <span className={`text-sm font-black ${c.tone}`}>{c.n ?? "—"} events</span>
            </div>
          ))}
        </div>
      </Card>

      <Card className="lg:col-span-2">
        <h2 className="text-base font-bold text-white">Warehouse Stock Trajectory</h2>
        <p className="mb-6 text-xs text-slate-300">Current stock vs rolling inventory threshold.</p>
        <div className="h-80" role="img" aria-label="Line chart of inventory level against its rolling baseline">
          <Line
            data={{
              labels: rows.map((r) => r.record_date),
              datasets: [
                { label: "Inventory Level (Amul Milk)", data: rows.map((r) => r.inventory), borderColor: "#38bdf8", backgroundColor: "rgba(56,189,248,.1)", fill: true, tension: 0.3 },
                { label: "Rolling Baseline", data: rows.map((r) => r.inv_rolling_mean), borderColor: "#94a3b8", borderDash: [4, 4], pointRadius: 0 },
              ],
            }}
            options={{
              ...baseOptions,
              scales: {
                x: { grid: { color: GRID }, ticks: { color: TICK, maxTicksLimit: 10 } },
                y: { grid: { color: GRID }, ticks: { color: TICK } },
              },
              plugins: { legend },
            }}
          />
        </div>
      </Card>
    </div>
  );
}
