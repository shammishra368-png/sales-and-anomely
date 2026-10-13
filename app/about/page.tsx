import type { Metadata } from "next";
import Footer from "@/components/site/Footer";
import Nav from "@/components/site/Nav";
import ml from "@/data/ml_metrics.json";

export const metadata: Metadata = { title: "Under the Hood · Retail Anomaly Engine" };

const H2 = "mt-14 text-2xl font-extrabold tracking-tight text-white";
const P = "mt-3 leading-relaxed text-slate-300";
const code = "rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-indigo-100";

export default function About() {
  const rows = [
    ["SQL Z-score view", ml.sql_flagged, ml.sql_precision, ml.sql_recall, ml.sql_f1],
    ["Isolation Forest", ml.ml_flagged, ml.ml_precision, ml.ml_recall, ml.ml_f1],
  ];
  return (
    <div className="min-h-screen bg-[#0b0620]">
      <Nav />
      <main className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
        <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl">Under the hood</h1>
        <p className={`${P} text-lg`}>How the engine turns a stream of sales and stock numbers into trustworthy alerts.</p>

        <h2 className={H2}>1. Rolling Z-score in Postgres</h2>
        <p className={P}>
          The view <code className={code}>zscore_live_view</code> uses window functions to take, for every record, the 14 previous records of the same product. It computes their mean and standard deviation, then <code className={code}>z = (value − mean) / std</code>, for both units sold and stock on hand. One pass over the table does it all, which is why a full evaluation takes about 22 ms.
        </p>

        <h2 className={H2}>2. Classification and severity</h2>
        <p className={P}>
          The Z-scores feed fixed rules: spike above 2.5, drop below −2.2, shrinkage when stock falls sharply without a sales surge, stockout at zero, and critical low stock under two days of average sales. Anything at 3σ or beyond, any stockout, and likely theft is CRITICAL. The rest are WARNING. Each flagged record also gets an estimated impact in rupees: the revenue gained or lost against the rolling baseline.
        </p>

        <h2 className={H2}>3. Isolation Forest</h2>
        <p className={P}>
          A 100-tree Isolation Forest, written in TypeScript, scores each record on six features: units sold, stock, revenue, sales-to-stock ratio, deviation from the rolling mean, and the Z-score. It flags the most isolated 8% of the training data. Because it looks at features together, it can flag combinations that no single rule would.
        </p>

        <h2 className={H2}>4. Live stream</h2>
        <p className={P}>
          A server-side generator creates realistic transactions, with occasional injected anomalies, and inserts them into Supabase. Each new record is re-scored and pushed to every open dashboard over Server-Sent Events. You can pause, change speed, step manually, or inject a specific anomaly.
        </p>

        <h2 className={H2}>5. Engine comparison</h2>
        <p className={P}>Offline snapshot over {ml.total_records.toLocaleString("en-IN")} records. Higher is better for each metric (percent).</p>
        <div className="mt-5 overflow-x-auto rounded-2xl border border-white/10">
          <table className="w-full min-w-[520px] text-left text-sm">
            <caption className="sr-only">Precision, recall and F1 of each engine</caption>
            <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-300">
              <tr>
                {["Engine", "Flagged", "Precision", "Recall", "F1"].map((h) => (
                  <th key={h} scope="col" className="px-5 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-slate-200">
              {rows.map(([n, ...v]) => (
                <tr key={n as string}>
                  <th scope="row" className="px-5 py-3 font-bold text-white">{n}</th>
                  {v.map((x, i) => <td key={i} className="px-5 py-3 tabular-nums">{x}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 className={H2}>6. Stack</h2>
        <p className={P}>
          Next.js 15 and React 19 for the app; Supabase Postgres for storage, accessed only from server-side API routes with a service-role key; Chart.js for charts; Tailwind CSS for styling; WebGL for the animated backgrounds.
        </p>
      </main>
      <Footer />
    </div>
  );
}
