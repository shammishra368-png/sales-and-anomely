import Link from "next/link";
import type { ReactNode } from "react";
import GlassSurface from "@/components/GlassSurface";

/** Pill-shaped glass button. The link fills the whole surface so the full pill is clickable. */
export default function GlassLink({
  href,
  width = "100%",
  height = 48,
  primary = false,
  className = "",
  children,
}: {
  href: string;
  width?: number | string;
  height?: number;
  primary?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <GlassSurface width={width} height={height} borderRadius={90} distortionScale={-40} displace={3.3} backgroundOpacity={0.22} className={className}>
      <Link
        href={href}
        className={`-m-2 flex h-[calc(100%+1rem)] w-[calc(100%+1rem)] items-center justify-center gap-2 whitespace-nowrap rounded-full px-5 text-sm font-semibold text-white outline-none transition focus-visible:ring-2 focus-visible:ring-white/80 ${
          primary ? "bg-[#5227FF]/45 hover:bg-[#5227FF]/65" : "hover:bg-white/10"
        }`}
      >
        {children}
      </Link>
    </GlassSurface>
  );
}
