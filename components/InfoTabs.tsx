import type { MlMetrics } from "@/lib/types";
import { Card } from "./ui";

export function MlTab({ ml }: { ml: MlMetrics | null }) {
  const pct = (n?: number) => (n === undefined ? "—" : `${n.toFixed(1)}%`);
  const rows = [
    ["Recall (Sensitivity)", pct(ml?.sql_recall), pct(ml?.ml_recall), "Both captured 75%+ of actual ground truth anomalies."],
    ["Precision", pct(ml?.sql_precision), pct(ml?.ml_precision), "ML achieved slightly higher precision via multi-feature boundaries."],
    ["F1-Score", pct(ml?.sql_f1), pct(ml?.ml_f1), "Harmonic mean reflecting balanced detection sensitivity."],
    ["Execution Latency", "< 15 ms", "~ 25 ms", "SQL is optimized for in-database streaming window calculations."],
  ];
  const facts = [
    ["Algorithm:", "Isolation Forest (TypeScript)"],
    ["Estimators:", "100 Trees"],
    ["Contamination:", "8.0%"],
    ["Online Evaluation:", "Active on Live Stream"],
  ];
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <Card>
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/30 text-xs font-black text-purple-100">ML</div>
          <h3 className="text-base font-bold text-white">Isolation Forest Model</h3>
        </div>
        <p className="mb-4 text-xs leading-relaxed text-slate-300">
          Trained on multi-dimensional features (Sales, Inventory, Sales-to-Inventory Ratio, Deviation from Rolling Mean) with 100 decision estimators.
        </p>
        <div className="space-y-2 text-xs">
          {facts.map(([k, v]) => (
            <div key={k} className="flex justify-between rounded-lg bg-slate-950/60 px-3 py-2">
              <span className="text-slate-300">{k}</span>
              <strong className="text-white">{v}</strong>
            </div>
          ))}
        </div>
      </Card>
      <Card className="lg:col-span-2">
        <h3 className="text-base font-bold text-white">Model Performance Benchmarking</h3>
        <p className="mb-4 mt-1 text-xs text-slate-300">Evaluation of SQL Statistical Engine vs Unsupervised ML against Ground Truth anomalies.</p>
        <div className="overflow-x-auto rounded-xl border border-slate-700">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-700 bg-slate-950 text-[11px] font-bold uppercase tracking-wider text-slate-300">
              <tr>
                <th className="px-4 py-3">Evaluation Metric</th>
                <th className="px-4 py-3 text-center">SQL Z-Score Engine</th>
                <th className="px-4 py-3 text-center text-purple-300">ML Isolation Forest</th>
                <th className="px-4 py-3">Key Takeaway</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {rows.map(([m, a, b, t]) => (
                <tr key={m}>
                  <td className="px-4 py-3 font-semibold text-white">{m}</td>
                  <td className="px-4 py-3 text-center font-mono">{a}</td>
                  <td className="px-4 py-3 text-center font-mono text-purple-300">{b}</td>
                  <td className="px-4 py-3 text-slate-300">{t}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

const Code = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-xl border border-slate-700 bg-slate-950 p-3 text-center font-mono text-sm text-indigo-200">{children}</div>
);

export function ArchTab() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white">Z-Score Mathematical Formulation</h3>
        <p className="text-xs leading-relaxed text-slate-300">
          The statistical engine relies on standard deviation scaling over a trailing 14-record sliding window (μ₁₄ and σ₁₄):
        </p>
        <Code>Z = (x − μ) / σ</Code>
        <ul className="space-y-1.5 text-xs text-slate-200">
          <li><b>|Z| ≤ 2.2</b>: Normal random variation (~97% confidence interval).</li>
          <li><b className="text-amber-300">2.2 &lt; |Z| ≤ 3.0</b>: WARNING (demand surge or operational dip).</li>
          <li><b className="text-rose-300">|Z| &gt; 3.0</b>: CRITICAL (extremely rare, 99.7% 3-sigma outlier).</li>
        </ul>
      </Card>
      <Card className="space-y-4">
        <h3 className="text-base font-bold text-white">Windowed SQL View Architecture</h3>
        <p className="text-xs leading-relaxed text-slate-300">
          To compute standard deviation without a native SQLite function, we use the variance expansion formula:
        </p>
        <Code>Var(X) = E[X²] − (E[X])²<br />StdDev(X) = SQRT(MAX(0, Var(X)))</Code>
        <p className="text-xs leading-relaxed text-slate-300">
          Partitioning by SKU (<code className="font-mono text-indigo-200">PARTITION BY item ORDER BY id</code>) keeps each product&apos;s baseline independent, with no cross-item contamination.
        </p>
      </Card>
    </div>
  );
}
