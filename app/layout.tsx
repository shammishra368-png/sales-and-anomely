import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Retail Anomaly Engine",
  description: "Live sales & inventory anomaly detection: rolling Z-score SQL view + Isolation Forest.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen font-sans text-slate-100">{children}</body>
    </html>
  );
}
