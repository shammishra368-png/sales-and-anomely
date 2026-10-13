"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { impact, inr, signed } from "@/lib/format";
import { playAlert } from "@/lib/sound";
import type { AnomalyKind, MlMetrics, ProductSummary, Rec, Stats, StreamMsg } from "@/lib/types";
import { ArchTab, MlTab } from "./InfoTabs";
import { AuditTable } from "./AuditTable";
import { Inventory } from "./Inventory";
import { Overview } from "./Overview";
import { IconPause, IconPlay, IconStep, glass } from "./ui";

const TABS = [
  ["overview", "Overview & Trends"],
  ["inventory", "Inventory & Shrinkage"],
  ["table", "Live Anomaly Audit"],
  ["ml", "ML Benchmark (Isolation Forest)"],
  ["arch", "Architecture & Math"],
] as const;
type Tab = (typeof TABS)[number][0];

const INJECT: [AnomalyKind, string, string][] = [
  ["spike", "Spike (+400%)", "border-purple-400/50 bg-purple-500/20 text-purple-100"],
  ["drop", "Drop (0 Sales)", "border-amber-400/50 bg-amber-500/20 text-amber-100"],
  ["shrinkage", "Theft / Shrinkage", "border-rose-400/50 bg-rose-500/20 text-rose-100"],
  ["stockout", "Stockout (0 Stock)", "border-red-400/50 bg-red-500/20 text-red-100"],
];

const MAX_ROWS = 2000;
const btn = "flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none";

const post = (body: object) =>
  fetch("/api/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

interface Toast { key: number; rec: Rec }

export default function Dashboard() {
  const [tab, setTab] = useState<Tab>("overview");
  const [records, setRecords] = useState<Rec[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [ml, setMl] = useState<MlMetrics | null>(null);
  const [streaming, setStreaming] = useState(true);
  const [interval, setIntervalSec] = useState(1.5);
  const [connected, setConnected] = useState(false);
  const [sound, setSound] = useState(true);
  const [injectItem, setInjectItem] = useState("");
  const [live, setLive] = useState({ n: 0, anomalies: 0 });
  const [last, setLast] = useState<Rec | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const soundRef = useRef(sound);
  soundRef.current = sound;

  const onMsg = useCallback((m: StreamMsg) => {
    if (m.type === "HANDSHAKE" || m.type === "STREAM_STATUS") {
      setStreaming(m.is_streaming);
      setIntervalSec(m.interval);
    } else if (m.type === "STREAM_SPEED") setIntervalSec(m.interval);
    else if (m.type === "LIVE_RECORD") {
      const r = m.record;
      setRecords((prev) => [...prev, r].slice(-MAX_ROWS));
      setStats(m.stats);
      setProducts(m.products_summary);
      setLast(r);
      setLive((l) => ({ n: l.n + 1, anomalies: l.anomalies + r.is_flagged }));
      if (r.is_flagged) {
        if (soundRef.current) playAlert(r.severity);
        const key = r.id;
        setToasts((t) => [...t.slice(-3), { key, rec: r }]);
        setTimeout(() => setToasts((t) => t.filter((x) => x.key !== key)), 4500);
      }
    }
  }, []);

  useEffect(() => {
    let dead = false;
    fetch("/api/snapshot?limit=500")
      .then((r) => r.json())
      .then((d) => {
        if (dead) return;
        setRecords(d.records);
        setStats(d.stats);
        setProducts(d.products_summary);
        setMl(d.ml_metrics);
      })
      .catch(() => {});
    const es = new EventSource("/api/stream/events");
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false); // EventSource reconnects on its own
    es.onmessage = (e) => onMsg(JSON.parse(e.data));
    return () => {
      dead = true;
      es.close();
    };
  }, [onMsg]);

  const toggle = () => {
    setStreaming(!streaming);
    void post({ action: streaming ? "pause" : "start" });
  };

  return (
    <>
      <div aria-live="polite" className="pointer-events-none fixed right-5 top-24 z-50 flex w-full max-w-sm flex-col gap-3">
        {toasts.map(({ key, rec }) => (
          <ToastCard key={key} rec={rec} close={() => setToasts((t) => t.filter((x) => x.key !== key))} />
        ))}
      </div>

      <header className={`${glass} z-40 md:sticky md:top-0 rounded-none border-x-0 border-t-0 px-6 py-4`}>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-rose-500 shadow-lg shadow-indigo-500/25">
              <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-extrabold tracking-tight text-white">Retail Anomaly Engine</h1>
                <span className="rounded-md border border-indigo-400/40 bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-indigo-200">
                  Live Dual-Engine
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Developed by <strong className="text-indigo-200">Krishna</strong> | B.Tech CSE (Data Science) 3rd Year
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link href="/" className={`${btn} border-white/20 bg-white/5 text-slate-200 hover:bg-white/10`}>
              ← Home
            </Link>
            <div
              className={`${btn} ${connected ? "border-emerald-400/40 bg-emerald-500/10 text-emerald-300" : "border-amber-400/40 bg-amber-500/10 text-amber-300"}`}
              role="status"
            >
              <span className={`h-2.5 w-2.5 animate-pulse rounded-full ${connected ? "bg-emerald-400" : "bg-amber-400"}`} />
              {connected ? "LIVE SERVER CONNECTED" : "RECONNECTING…"}
            </div>
            <button
              onClick={toggle}
              className={`${btn} ${streaming ? "border-rose-400/40 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20" : "border-emerald-400/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20"}`}
            >
              {streaming ? <><IconPause /> Pause Stream</> : <><IconPlay /> Resume Stream</>}
            </button>
            <label className="flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-950 px-2 py-1 text-[10px] font-bold text-slate-300">
              Speed:
              <select
                value={String(interval)}
                onChange={(e) => {
                  setIntervalSec(+e.target.value);
                  void post({ action: "speed", interval: +e.target.value });
                }}
                className="bg-transparent font-mono text-xs text-slate-100 outline-none"
              >
                {[3, 1.5, 0.5].map((s) => (
                  <option key={s} value={s} className="bg-slate-900">{s.toFixed(1)}s</option>
                ))}
              </select>
            </label>
            <button onClick={() => post({ action: "step" })} title="Execute 1 transaction on demand" className={`${btn} border-slate-600 bg-slate-800 text-slate-200 hover:bg-slate-700`}>
              <IconStep /> Step 1x
            </button>
            <button
              onClick={() => setSound(!sound)}
              aria-pressed={sound}
              className={`${btn} ${sound ? "border-indigo-400/40 bg-indigo-500/10 text-indigo-200 hover:bg-indigo-500/20" : "border-slate-600 bg-slate-800 text-slate-300"}`}
            >
              {sound ? "Sound ON" : "Muted"}
            </button>
            <a href="/Executive_Anomaly_Report.html" target="_blank" rel="noreferrer" className={`${btn} border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-500`}>
              Audit Report
            </a>
          </div>
        </div>

        <div className="mx-auto mt-3 flex max-w-7xl flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-3">
          <div className="flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span className="text-xs font-bold text-amber-200">Live Viva & Stress-Test Lab:</span>
            <span className="text-[11px] text-slate-300">Inject operational anomalies into the live feed on demand:</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <select
              aria-label="Product to inject into"
              value={injectItem}
              onChange={(e) => setInjectItem(e.target.value)}
              className="rounded-xl border border-slate-600 bg-slate-950 px-2.5 py-1 text-xs text-slate-100 outline-none"
            >
              <option value="">Auto / Current Product</option>
              {products.map((p) => <option key={p.item}>{p.item}</option>)}
            </select>
            {INJECT.map(([type, label, cls]) => (
              <button key={type} onClick={() => post({ action: "inject", type, item: injectItem })} className={`rounded-xl border px-2.5 py-1 text-xs font-bold transition hover:brightness-125 focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none ${cls}`}>
                {label}
              </button>
            ))}
          </div>
        </div>

        <div role="tablist" className="mx-auto mt-3 flex max-w-7xl gap-1 overflow-x-auto border-t border-white/10 pt-2">
          {TABS.map(([id, label]) => (
            <button
              key={id}
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-xs font-semibold outline-none transition focus-visible:ring-2 focus-visible:ring-indigo-400 ${tab === id ? "border-b-2 border-indigo-300 bg-indigo-500/15 text-indigo-200" : "text-slate-300 hover:text-white"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-6">
        <Kpis stats={stats} />
        <Ticker last={last} live={live} streaming={streaming} />
        {tab === "overview" && <Overview records={records} products={products} />}
        {tab === "inventory" && <Inventory records={records} stats={stats} />}
        {tab === "table" && <AuditTable records={records} highlight={last?.id} />}
        {tab === "ml" && <MlTab ml={ml} />}
        {tab === "arch" && <ArchTab />}
        <footer className="pb-4 text-center text-[11px] text-slate-300">
          Academic Capstone Project • B.Tech CSE (Data Science) • Designed & Implemented by Krishna
        </footer>
      </main>
    </>
  );
}

function Kpis({ stats: s }: { stats: Stats | null }) {
  const v = (f: (s: Stats) => string | number) => (s ? f(s) : "—");
  const items = [
    { label: "Store Health Index", val: v((s) => `${s.health_score}%`), sub: "Operational target > 80%", tone: "text-emerald-300", ring: "" },
    { label: "Total Revenue", val: v((s) => inr(s.total_revenue, 2)), sub: s ? `${s.total_units_sold.toLocaleString("en-IN")} units processed` : "", tone: "text-white", ring: "" },
    { label: "Total Anomalies", val: v((s) => s.total_anomalies), sub: s ? `Out of ${s.total_records.toLocaleString()} records` : "", tone: "text-rose-300", ring: "border-rose-400/30", badge: s ? `${s.anomaly_rate}% Rate` : "" },
    { label: "Critical (3σ+ / Theft)", val: v((s) => s.critical_anomalies), sub: "Requires immediate intervention", tone: "text-red-300", ring: "border-red-400/30" },
    { label: "Est. Revenue Loss", val: v((s) => `-${inr(s.total_loss, 2)}`), sub: "Lost sales & shrinkage", tone: "text-orange-300", ring: "border-orange-400/30" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {items.map((k) => (
        <div key={k.label} className={`${glass} p-4 ${k.ring}`}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">{k.label}</span>
            {k.badge && <span className="rounded bg-rose-500/20 px-1.5 py-0.5 text-[10px] font-bold text-rose-200">{k.badge}</span>}
          </div>
          <div className={`mt-2 text-2xl font-black ${k.tone}`}>{k.val}</div>
          <div className="mt-1 text-xs text-slate-300">{k.sub}</div>
        </div>
      ))}
    </div>
  );
}

function Ticker({ last, live, streaming }: { last: Rec | null; live: { n: number; anomalies: number }; streaming: boolean }) {
  const tone = last?.severity === "CRITICAL" ? "text-rose-300 font-bold" : last?.severity === "WARNING" ? "text-amber-300 font-bold" : "text-emerald-300";
  return (
    <div className={`${glass} flex flex-col items-start justify-between gap-3 border-indigo-400/40 p-4 md:flex-row md:items-center`}>
      <div className="flex items-center gap-3">
        <span className="relative flex h-3.5 w-3.5">
          {streaming && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />}
          <span className={`relative inline-flex h-3.5 w-3.5 rounded-full ${streaming ? "bg-emerald-500" : "bg-slate-500"}`} />
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-emerald-300">Live Stream & Outlier Ticker</span>
            <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-200">{streaming ? "STREAMING ACTIVE" : "PAUSED"}</span>
          </div>
          <div className="mt-0.5 font-mono text-xs text-slate-100">
            {last ? (
              <>
                #{last.id} • <strong>{last.item}</strong> • Sales: <b>{last.sales}</b> • Z: <span className={tone}>{signed(last.z_score)}</span> • Stock: {last.inventory} • <span className={tone}>{last.anomaly_type}</span>
                {last.ml_anomaly_flag ? <span className="text-purple-300"> • ML flagged</span> : null}
              </>
            ) : (
              "Waiting for first live transaction…"
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-4 font-mono text-xs">
        <Pill label="Live Processed:" v={live.n} tone="text-emerald-300" />
        <Pill label="Anomalies Detected:" v={live.anomalies} tone="text-rose-300" />
      </div>
    </div>
  );
}

const Pill = ({ label, v, tone }: { label: string; v: number; tone: string }) => (
  <div className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-1.5">
    <span className="text-slate-300">{label}</span>
    <span className={`text-sm font-bold ${tone}`}>{v}</span>
  </div>
);

function ToastCard({ rec, close }: { rec: Rec; close: () => void }) {
  const crit = rec.severity === "CRITICAL";
  return (
    <div className={`toast-in pointer-events-auto rounded-2xl border bg-slate-900/95 p-4 shadow-2xl backdrop-blur-md ${crit ? "border-rose-400/50" : "border-amber-400/50"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${crit ? "animate-ping bg-rose-500" : "bg-amber-500"}`} />
          <span className={`rounded px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${crit ? "bg-rose-500/20 text-rose-200" : "bg-amber-500/20 text-amber-200"}`}>{rec.severity}</span>
        </div>
        <button onClick={close} aria-label="Dismiss alert" className="text-sm text-slate-300 hover:text-white">×</button>
      </div>
      <h4 className="mt-2 text-sm font-bold text-white">{rec.item}</h4>
      <p className={`mt-0.5 text-xs font-semibold ${crit ? "text-rose-300" : "text-amber-300"}`}>{rec.anomaly_type}</p>
      <div className="mt-2.5 flex justify-between border-t border-slate-700 pt-2 font-mono text-[11px] text-slate-300">
        <span>Z-Score: <strong className="text-white">{signed(rec.z_score)}σ</strong></span>
        <span>Impact: <strong className={rec.financial_impact < 0 ? "text-rose-300" : "text-emerald-300"}>{rec.financial_impact ? impact(rec.financial_impact) : "Neutral"}</strong></span>
      </div>
    </div>
  );
}

