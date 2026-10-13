import {
  BarElement, CategoryScale, Chart, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip,
} from "chart.js";

Chart.register(BarElement, CategoryScale, Filler, Legend, LinearScale, LineElement, PointElement, Tooltip);

export const GRID = "rgba(148,163,184,.18)";
export const TICK = "#cbd5e1";
export const baseOptions = {
  responsive: true,
  maintainAspectRatio: false,
  animation: false,
} as const;
export const legend = { labels: { color: TICK, usePointStyle: true, boxWidth: 8 } };
