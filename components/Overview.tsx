"use client";

import { useMemo, useState } from "react";
import { Bar, Line } from "react-chartjs-2";
import { GRID, TICK, baseOptions, legend } from "@/lib/chart";
import type { ProductSummary, Rec } from "@/lib/types";
import { Card, Select } from "./ui";

const COLOR = { CRITICAL: "#ef4444", WARNING: "#f59e0b", NORMAL: "#818cf8" } as const;

export function Overview({ records, products }: { records: Rec[]; products: ProductSummary[] }) {
  const [item, setItem] = useState("ALL");

  const rows = useMemo(
    () => (item === "ALL" ? records : records.filter((r) => r.item === item)).slice(-100),
    [records, item],
  );
  const colors = rows.map((r) => COLOR[r.severity]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-white">Dynamic Sales Outlier Detection</h2>
              <span className="rounded bg-indigo-500/20 px-2 py-0.5 text-[10px] font-bold text-indigo-200">Live 14d Z-Score</span>
            </div>
            <p className="mt-1 text-xs text-slate-300">Time-series tracking with 14-record rolling mean. Red dots indicate statistical outliers.</p>
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-300">
            Product:
            <Select value={item} onChange={(e) => setItem(e.target.value)}>
              <option value="ALL">All Items (Latest Feed)</option>
              {products.map((p) => <option key={p.item}>{p.item}</option>)}
            </Select>
          </label>
        </div>
        <div className="h-80" role="img" aria-label="Line chart of sales against the 14-record rolling mean">
          <Line
            data={{
              labels: rows.map((r) => (item === "ALL" ? `${r.record_date} (${r.item.split(" ")[0]})` : r.record_date)),
              datasets: [
                {
                  label: "Sales (Actual Units)",
                  data: rows.map((r) => r.sales),
                  borderColor: "#818cf8",
                  backgroundColor: "rgba(129,140,248,.12)",
                  pointBackgroundColor: colors,
                  pointBorderColor: colors,
                  pointRadius: rows.map((r) => (r.is_flagged ? 6 : 3)),
                  pointHoverRadius: rows.map((r) => (r.is_flagged ? 8 : 5)),
                  borderWidth: 2,
                  fill: true,
                  tension: 0.25,
                },
                {
                  label: "14-Record Baseline (Mean)",
                  data: rows.map((r) => r.rolling_mean ?? r.sales),
                  borderColor: "#94a3b8",
                  borderDash: [5, 5],
                  borderWidth: 1.5,
                  pointRadius: 0,
                  tension: 0.2,
                },
              ],
            }}
            options={{
              ...baseOptions,
              interaction: { mode: "index", intersect: false },
              scales: {
                x: { grid: { color: GRID }, ticks: { color: TICK, maxTicksLimit: 14, font: { size: 10 } } },
                y: { beginAtZero: true, grid: { color: GRID }, ticks: { color: TICK } },
              },
              plugins: { legend, tooltip: { backgroundColor: "#0f172a", borderColor: "#334155", borderWidth: 1, padding: 10 } },
            }}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-base font-bold text-white">Anomalies by Product</h2>
        <p className="mb-6 mt-1 text-xs text-slate-300">Total detected anomalies split by severity level.</p>
        <div className="h-80" role="img" aria-label="Stacked bar chart of critical and warning anomalies per product">
          <Bar
            data={{
              labels: products.map((p) => p.item),
              datasets: [
                { label: "Critical", data: products.map((p) => p.critical), backgroundColor: "#ef4444" },
                { label: "Warning", data: products.map((p) => p.warning), backgroundColor: "#f59e0b" },
              ],
            }}
            options={{
              ...baseOptions,
              indexAxis: "y",
              scales: {
                x: { stacked: true, grid: { color: GRID }, ticks: { color: TICK } },
                y: { stacked: true, grid: { display: false }, ticks: { color: TICK, font: { size: 10 } } },
              },
              plugins: { legend: { labels: { color: TICK } } },
            }}
          />
        </div>
      </Card>
    </div>
  );
}
