import type { ReactNode } from "react";
import type { Severity } from "@/lib/types";

export const glass =
  "rounded-2xl border border-white/15 bg-slate-950/60 backdrop-blur-xl shadow-[inset_0_1px_0_rgba(255,255,255,.14),0_8px_32px_rgba(0,0,0,.35)]";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <section className={`${glass} p-6 ${className}`}>{children}</section>;
}

export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className={`rounded-xl border border-slate-600 bg-slate-950 px-3 py-1.5 text-xs text-slate-100 outline-none focus-visible:ring-2 focus-visible:ring-indigo-400 ${props.className ?? ""}`}
    />
  );
}

const SEV: Record<Severity, string> = {
  CRITICAL: "bg-rose-500/20 text-rose-200 border border-rose-400/50",
  WARNING: "bg-amber-500/20 text-amber-200 border border-amber-400/50",
  NORMAL: "bg-slate-800 text-slate-300",
};

export const SevBadge = ({ s }: { s: Severity }) => (
  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${SEV[s]}`}>{s}</span>
);

const I = { fill: "currentColor", width: 12, height: 12, viewBox: "0 0 12 12", "aria-hidden": true } as const;
export const IconPause = () => <svg {...I}><rect x="2" y="1" width="3" height="10" /><rect x="7" y="1" width="3" height="10" /></svg>;
export const IconPlay = () => <svg {...I}><path d="M2 1l9 5-9 5z" /></svg>;
export const IconStep = () => <svg {...I}><path d="M1 1l7 5-7 5zM9 1h2v10H9z" /></svg>;
