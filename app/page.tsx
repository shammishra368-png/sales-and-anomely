import Link from "next/link";
import Aurora from "@/components/Aurora";
import Footer from "@/components/site/Footer";
import GlassLink from "@/components/site/GlassLink";
import GlassSurface from "@/components/GlassSurface";
import Nav from "@/components/site/Nav";

const glassCard = "rounded-2xl border border-white/15 bg-white/[0.06] shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_8px_32px_rgba(0,0,0,.3)] backdrop-blur-xl";

const FEATURES = [
  { t: "Rolling Z-score view", d: "A 14-record baseline per product, computed in Postgres window functions. Every sale and stock level is scored against its own recent history.", p: "M3 17l6-6 4 4 8-8M14 7h7v7" },
  { t: "Isolation Forest", d: "A 100-tree forest, ported to TypeScript, scores each record on sales, stock, revenue and deviation. It catches combinations the Z-score alone misses.", p: "M12 3v6m0 0l-4 4m4-4l4 4m-8 4v4m8-4v4M5 21h14" },
  { t: "Live POS stream", d: "New transactions arrive over Server-Sent Events. Charts, KPIs and the audit table update without a refresh.", p: "M5 12h3l2-6 4 12 2-6h3" },
  { t: "Severity and rupee impact", d: "Every flag is CRITICAL or WARNING and carries an estimated revenue gain or loss in ₹, so you fix the costly problems first.", p: "M9 8h6M9 12h6m-6 4l6-4M7 4h10M7 4c3 0 5 1.5 5 4" },
  { t: "Inject and test", d: "Fire a spike, a zero-sales drop, a theft pattern or a stockout on any product, and watch the engine react in real time.", p: "M13 3L4 14h7l-1 7 9-11h-7l1-7z" },
  { t: "Cloud-native on Supabase", d: "Managed Postgres, server-side API routes and an audit log table. No local files, so it deploys cleanly.", p: "M7 18a5 5 0 010-10 6 6 0 0111.5 1.5A4 4 0 0117 18H7z" },
];

const STEPS = [
  ["Ingest", "Each point-of-sale transaction lands in the sales_data table with its product, units sold and stock left."],
  ["Score", "One query reads the Z-score view; the Isolation Forest scores the new record against the full history."],
  ["Alert", "Flagged records pop up with sound and a toast, show in the audit table, and are written to the anomaly log."],
];

const CLASSES = [
  ["Sales Spike", "Z-score above 2.5", "Unusual demand, promotion effect, or a bulk or fraudulent order."],
  ["Sales Drop", "Z-score below −2.2, or zero sales on a product that normally sells 15+ a day", "Lost footfall, a pricing error, or a broken till."],
  ["Inventory Shrinkage", "Stock Z-score below −2, or stock under half its recent average, without a matching sales surge", "Stock disappearing without being sold: theft or loss."],
  ["Inventory Stockout", "Stock at zero", "Shelves empty: every hour is lost revenue."],
  ["Critical Low Stock", "Stock below two days of average sales", "Reorder before you run out."],
];

const FAQ = [
  ["How does the detection work?", "Two engines run side by side. A SQL view computes a rolling Z-score against the last 14 records of each product. An Isolation Forest, trained on the history, scores each record on several features at once. You see both verdicts."],
  ["Is the data real?", "The seed data and the live feed are simulated point-of-sale transactions for 12 common Indian grocery products, with occasional injected anomalies so the detection has something to find."],
  ["Where does the data live?", "In a Supabase Postgres database. The browser never talks to it directly: all reads and writes go through server-side API routes using a service-role key."],
  ["Can I plug in my own sales data?", "Yes. Load rows into the sales_data table (date, item, units, stock, price). The view and dashboard work on whatever is there."],
];

export default function Landing() {
  return (
    <div className="bg-[#0b0620]">
      <Nav />
      <main>
        {/* Hero */}
        <section className="relative isolate overflow-hidden">
          <div className="absolute inset-0 -z-10" aria-hidden>
            <Aurora
              colorStops={["#5227FF", "#8166b0", "#5227FF"]}
              amplitude={1.95}
              blend={0.68}
              height={0.65}
              speed={2.25}
              glow={1.15}
              scale={1.95}
              brightness={1}
              layers={1}
              direction="top"
              opacity={1}
              mouseInteraction
              intro
              lightMode={false}
            />
          </div>
          <div className="mx-auto flex min-h-[720px] max-w-4xl flex-col items-center justify-center px-4 pb-24 pt-40 text-center sm:px-6">
            <p className="mb-5 rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-indigo-100">
              Live dual-engine anomaly detection
            </p>
            <h1 className="text-balance text-4xl font-extrabold leading-tight tracking-tight text-white sm:text-6xl">
              Catch retail anomalies before they cost you.
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg text-slate-200">
              Rolling Z-scores in SQL and an Isolation Forest watch every sale and stock level in real time, flagging spikes, drops, theft and stockouts with the rupee impact attached.
            </p>
            <div className="mt-9 flex w-full flex-col items-center gap-3 sm:w-auto sm:flex-row">
              <div className="w-full max-w-[320px] sm:w-[260px]">
                <GlassLink href="/dashboard" primary>
                  Open live dashboard
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6l6 6-6 6" />
                  </svg>
                </GlassLink>
              </div>
              <div className="w-full max-w-[320px] sm:w-[200px]">
                <GlassLink href="#how">See how it works</GlassLink>
              </div>
            </div>
            <ul aria-label="Key numbers" className="mt-14 grid w-full grid-cols-2 gap-3 md:grid-cols-4">
              {[
                ["14", "record rolling baseline"],
                ["~22 ms", "to score every record"],
                ["12", "products tracked"],
                ["5", "anomaly classes"],
              ].map(([v, l]) => (
                <li key={l}>
                  <GlassSurface width="100%" height={96} borderRadius={24} borderWidth={0.07} brightness={64} opacity={0.93} blur={11} saturation={1.8} distortionScale={-40} displace={3.3} backgroundOpacity={0.22}>
                    <p className="text-center">
                      <span className="block text-2xl font-extrabold text-white sm:text-3xl">{v}</span>
                      <span className="mt-0.5 block text-xs text-slate-100 sm:text-sm">{l}</span>
                    </p>
                  </GlassSurface>
                </li>
              ))}
            </ul>
          </div>
        </section>

        {/* Features */}
        <section id="features" className="relative isolate mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-1/3 -z-10 flex justify-between"><span className="h-72 w-72 rounded-full bg-[#5227FF]/30 blur-3xl" /><span className="h-72 w-72 rounded-full bg-rose-500/20 blur-3xl" /></div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Everything the shop floor needs to know</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-300">Statistics you can audit, machine learning that finds the rest, and a live view that never needs a refresh.</p>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <li key={f.t} className={`${glassCard} p-6 transition hover:border-white/30 hover:bg-white/[0.1]`}>
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#5227FF]/25 text-indigo-200">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d={f.p} />
                  </svg>
                </span>
                <h3 className="mt-4 text-lg font-bold text-white">{f.t}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-300">{f.d}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-20 border-y border-white/10 bg-black/20">
          <div className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
            <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">From transaction to alert in three steps</h2>
            <ol className="mt-14 grid gap-8 md:grid-cols-3">
              {STEPS.map(([t, d], i) => (
                <li key={t} className={`relative ${glassCard} p-6`}>
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#5227FF] text-base font-extrabold text-white">{i + 1}</span>
                  <h3 className="mt-4 text-xl font-bold text-white">{t}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-300">{d}</p>
                </li>
              ))}
            </ol>
            <p className="mt-10 text-center">
              <Link href="/about" className="rounded font-semibold text-indigo-200 underline underline-offset-4 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/80">
                Read the technical deep dive
              </Link>
            </p>
          </div>
        </section>

        {/* Detection classes */}
        <section id="detection" className="mx-auto max-w-6xl scroll-mt-20 px-4 py-24 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Five kinds of trouble, each with a clear rule</h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-slate-300">Records at 3σ or beyond, stockouts and likely theft are CRITICAL. The rest are WARNING.</p>
          <div className="mt-12 overflow-x-auto rounded-2xl border border-white/10">
            <table className="w-full min-w-[640px] text-left text-sm">
              <caption className="sr-only">Anomaly classes, triggers and meaning</caption>
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-slate-300">
                <tr>
                  <th scope="col" className="px-5 py-3">Class</th>
                  <th scope="col" className="px-5 py-3">Triggers when</th>
                  <th scope="col" className="px-5 py-3">Usually means</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {CLASSES.map(([c, w, m]) => (
                  <tr key={c}>
                    <th scope="row" className="whitespace-nowrap px-5 py-4 font-bold text-white">{c}</th>
                    <td className="px-5 py-4 text-slate-200">{w}</td>
                    <td className="px-5 py-4 text-slate-300">{m}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-4 pb-24 sm:px-6">
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-white sm:text-4xl">Questions</h2>
          <div className={`mt-10 divide-y divide-white/10 ${glassCard}`}>
            {FAQ.map(([q, a]) => (
              <details key={q} className="group px-6 py-4">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 rounded font-semibold text-white outline-none focus-visible:ring-2 focus-visible:ring-white/80 [&::-webkit-details-marker]:hidden">
                  {q}
                  <svg className="h-4 w-4 shrink-0 transition group-open:rotate-180" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="pb-2 pt-2 text-sm leading-relaxed text-slate-300">{a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="relative isolate px-4 pb-24 sm:px-6">
          <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 -z-10 flex justify-center gap-10"><span className="h-72 w-72 rounded-full bg-[#5227FF]/60 blur-3xl" /><span className="h-72 w-72 rounded-full bg-fuchsia-500/35 blur-3xl" /></div>
          <div className="mx-auto max-w-4xl">
            <div className={`${glassCard} text-center`}>
              <div className="px-4 py-12 text-center sm:px-10 sm:py-14">
                <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">See it catch an anomaly live</h2>
                <p className="mx-auto mt-4 max-w-xl text-slate-100">Open the dashboard, inject a stockout or a theft pattern, and watch both engines flag it.</p>
                <div className="mx-auto mt-8 w-full max-w-[280px]">
                  <GlassLink href="/dashboard" primary>Open live dashboard</GlassLink>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
