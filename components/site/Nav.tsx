import Link from "next/link";
import GlassSurface from "@/components/GlassSurface";
import GlassLink from "./GlassLink";

const LINKS = [
  ["/#features", "Features"],
  ["/#how", "How it works"],
  ["/#detection", "Detection"],
  ["/#faq", "FAQ"],
  ["/about", "Under the hood"],
] as const;

export default function Nav() {
  return (
    <header className="sticky top-3 z-50 -mb-[72px] mx-auto max-w-6xl px-3 sm:px-4">
      <GlassSurface width="100%" height={60} borderRadius={30} distortionScale={-40} displace={3.3} backgroundOpacity={0.22}>
        <nav aria-label="Main" className="flex w-full items-center justify-between gap-4 px-3 sm:px-4">
          <Link href="/" aria-label="Retail Anomaly Engine home" className="flex items-center gap-2.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-white/80">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-[#5227FF] via-[#8166b0] to-rose-400">
              <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </span>
            <span className="hidden text-base font-extrabold tracking-tight text-white sm:inline">Retail Anomaly Engine</span>
          </Link>
          <ul className="hidden items-center gap-1 md:flex">
            {LINKS.map(([href, label]) => (
              <li key={href}>
                <Link href={href} className="rounded-lg px-3 py-2 text-sm font-medium text-slate-200 outline-none transition hover:text-white focus-visible:ring-2 focus-visible:ring-white/80">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="w-[160px] shrink-0">
            <GlassLink href="/dashboard" height={44} primary>Open dashboard</GlassLink>
          </div>
        </nav>
      </GlassSurface>
    </header>
  );
}
