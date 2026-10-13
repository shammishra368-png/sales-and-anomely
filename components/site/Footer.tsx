import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#080416]">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-slate-400 sm:flex-row sm:px-6">
        <p>
          Built by <strong className="text-slate-200">Krishna</strong> · B.Tech CSE (Data Science)
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[
            ["/dashboard", "Dashboard"],
            ["/about", "Under the hood"],
            ["/Executive_Anomaly_Report.html", "Executive report"],
          ].map(([href, label]) => (
            <li key={href}>
              <Link href={href} className="rounded outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white/80">
                {label}
              </Link>
            </li>
          ))}
        </ul>
        <p>Next.js · Supabase · Postgres</p>
      </div>
    </footer>
  );
}
