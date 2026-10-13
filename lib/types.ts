export type Severity = "CRITICAL" | "WARNING" | "NORMAL";

export interface Rec {
  id: number;
  record_date: string;
  item: string;
  sales: number;
  inventory: number;
  unit_price: number;
  revenue: number;
  stock_value: number;
  rolling_mean: number | null;
  rolling_std: number;
  z_score: number;
  inv_rolling_mean: number | null;
  inv_rolling_std: number;
  inv_z_score: number;
  anomaly_type: string;
  is_flagged: 0 | 1;
  severity: Severity;
  financial_impact: number;
  ml_anomaly_flag?: 0 | 1;
  ml_anomaly_score?: number;
}

export interface Stats {
  total_records: number;
  total_units_sold: number;
  total_revenue: number;
  total_anomalies: number;
  anomaly_rate: number;
  critical_anomalies: number;
  warning_anomalies: number;
  sales_spikes: number;
  sales_drops: number;
  stockouts: number;
  critical_stock: number;
  shrinkage_count: number;
  total_loss: number;
  health_score: number;
}

export interface ProductSummary {
  item: string;
  total: number;
  anomalies: number;
  critical: number;
  warning: number;
  spikes: number;
  drops: number;
  shrinkage: number;
  stockouts: number;
  avg_sales: number;
  avg_inv: number;
  revenue: number;
  impact: number;
}

export interface MlMetrics {
  sql_precision: number; sql_recall: number; sql_f1: number; sql_flagged: number;
  ml_precision: number; ml_recall: number; ml_f1: number; ml_flagged: number;
  total_records: number;
}

export interface Snapshot {
  stats: Stats;
  products_summary: ProductSummary[];
}

export type StreamMsg =
  | { type: "HANDSHAKE"; is_streaming: boolean; interval: number }
  | ({ type: "LIVE_RECORD"; record: Rec; injected?: boolean } & Snapshot)
  | { type: "STREAM_STATUS"; is_streaming: boolean; interval: number }
  | { type: "STREAM_SPEED"; interval: number };

export type AnomalyKind = "spike" | "drop" | "shrinkage" | "stockout";
