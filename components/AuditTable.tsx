"use client";

import { useEffect, useMemo, useState } from "react";
import { impact, signed } from "@/lib/format";
import type { Rec } from "@/lib/types";
import { Card, Select, SevBadge } from "./ui";

const PAGE = 12;
const TYPES: [string, string][] = [
  ["ALL", "All Categories"],
  ["Sales Spike", "Sales Spike"],
  ["Sales Drop", "Sales Drop"],
  ["Inventory Shrinkage (Theft)", "Inventory Shrinkage"],
  ["Inventory Stockout", "Stockout"],
  ["Critical Low Stock", "Critical Low Stock"],
];
const HEAD = ["ID", "Date", "Product", "Sales", "14d Mean", "Z-Score", "Inventory", "Severity", "Category", "Impact (₹)"];
const RIGHT = new Set([3, 4, 5, 6, 9]);

export function AuditTable({ records, highlight }: { records: Rec[]; highlight?: number }) {
  const [sev, setSev] = useState("ALL");
  const [type, setType] = useState("ALL");
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    const s = q.toLowerCase();
    return records
      .filter((r) => (sev === "ALL" || r.severity === sev) && (type === "ALL" || r.anomaly_type === type) && (!s || r.item.toLowerCase().includes(s) || r.record_date.includes(s)))
      .reverse();
  }, [records, sev, type, q]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  useEffect(() => setPage(1), [sev, type, q]);
  const p = Math.min(page, pages);
  const view = rows.slice((p - 1) * PAGE, p * PAGE);

  const exportCsv = () => {
    const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
    const csv = [
      "ID,Date,Item,Sales,RollingMean,ZScore,Inventory,Severity,AnomalyType,FinancialImpact",
      ...rows.map((r) => [r.id, r.record_date, esc(r.item), r.sales, r.rolling_mean ?? "", r.z_score, r.inventory, r.severity, esc(r.anomaly_type), r.financial_impact].join(",")),
    ].join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `Retail_Anomaly_Audit_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-base font-bold text-white">Real-Time Anomaly Audit Table</h2>
        <div className="flex flex-wrap gap-2">
          <Select aria-label="Severity" value={sev} onChange={(e) => setSev(e.target.value)}>
            <option value="ALL">All Severities (Live Feed)</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="WARNING">Warning Only</option>
            <option value="NORMAL">Normal Only</option>
          </Select>
          <Select aria-label="Category" value={type} onChange={(e) => setType(e.target.value)}>
            {TYPES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
          </Select>
          <input
            aria-label="Search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search product or date..."
            className="rounded-xl border border-slate-600 bg-slate-950 px-3 py-2 text-xs text-slate-100 outline-none placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-indigo-400"
          />
          <button onClick={exportCsv} className="rounded-xl border border-slate-600 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-100 hover:bg-slate-700 focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none">
            Export CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-700">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-700 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-300">
            <tr>
              {HEAD.map((h, i) => (
                <th key={h} className={`px-4 py-3 ${RIGHT.has(i) ? "text-right" : i === 7 || i === 8 ? "text-center" : ""}`}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {view.length === 0 && (
              <tr><td colSpan={10} className="py-6 text-center text-slate-300">No records matching the selected criteria.</td></tr>
            )}
            {view.map((r) => (
              <tr key={r.id} className={`hover:bg-slate-900 ${r.id === highlight ? "row-new" : ""}`}>
                <td className="px-4 py-3 font-mono text-slate-300">#{r.id}</td>
                <td className="px-4 py-3 font-mono">{r.record_date}</td>
                <td className="px-4 py-3 font-semibold text-white">{r.item}</td>
                <td className="px-4 py-3 text-right font-bold">{r.sales}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-300">{r.rolling_mean || "-"}</td>
                <td className={`px-4 py-3 text-right font-mono ${Math.abs(r.z_score) > 2.5 ? "font-bold text-rose-300" : "text-slate-300"}`}>{signed(r.z_score)}</td>
                <td className="px-4 py-3 text-right font-mono text-slate-200">{r.inventory}</td>
                <td className="px-4 py-3 text-center"><SevBadge s={r.severity} /></td>
                <td className="px-4 py-3 text-center font-medium text-slate-200">{r.anomaly_type}</td>
                <td className={`px-4 py-3 text-right font-mono ${r.financial_impact < 0 ? "font-bold text-rose-300" : r.financial_impact > 0 ? "font-bold text-emerald-300" : "text-slate-300"}`}>{impact(r.financial_impact)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-300">
        <span>Showing {rows.length ? (p - 1) * PAGE + 1 : 0} to {Math.min(p * PAGE, rows.length)} of {rows.length} transactions</span>
        <div className="flex gap-2">
          {(["Previous", "Next"] as const).map((l) => {
            const prev = l === "Previous";
            return (
              <button key={l} disabled={prev ? p === 1 : p >= pages} onClick={() => setPage(p + (prev ? -1 : 1))} className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-slate-100 hover:bg-slate-800 disabled:opacity-40 focus-visible:ring-2 focus-visible:ring-indigo-400 outline-none">
                {l}
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
