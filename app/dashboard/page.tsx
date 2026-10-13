import type { Metadata } from "next";
import BackgroundWaves from "@/components/BackgroundWaves";
import Dashboard from "@/components/Dashboard";

export const metadata: Metadata = { title: "Live Dashboard · Retail Anomaly Engine" };

export default function Page() {
  return (
    <>
      <BackgroundWaves />
      <Dashboard />
    </>
  );
}
