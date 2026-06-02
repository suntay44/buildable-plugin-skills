export type Trend = "up" | "down" | "flat";
export type EventStatus = "healthy" | "warning" | "critical";
export type RangeKey = "7d" | "30d" | "90d";

export type Metric = {
  id: string;
  label: string;
  value: number;
  unit: "currency" | "number" | "percent";
  delta: number;
  trend: Trend;
};

export type TimeSeriesPoint = {
  date: string;
  value: number;
};

export type EventRow = {
  id: string;
  account: string;
  event: string;
  status: EventStatus;
  timestamp: string;
};

export type DashboardFilters = {
  range: RangeKey;
  status: "all" | EventStatus;
};
