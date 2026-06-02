import type { DashboardFilters, EventRow, Metric, RangeKey, TimeSeriesPoint } from "@/types/dashboard";

export const rangeLabels: Record<RangeKey, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days"
};

export const rangeDays: Record<RangeKey, number> = {
  "7d": 7,
  "30d": 30,
  "90d": 90
};

export const statusLabels: Record<EventRow["status"], string> = {
  healthy: "Healthy",
  warning: "Warning",
  critical: "Critical"
};

export function formatMetric(metric: Metric) {
  if (metric.unit === "currency") {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(metric.value);
  }
  if (metric.unit === "percent") {
    return `${metric.value.toFixed(1)}%`;
  }
  return new Intl.NumberFormat("en-US").format(metric.value);
}

export function formatDelta(delta: number) {
  const sign = delta > 0 ? "+" : "";
  return `${sign}${delta.toFixed(1)}%`;
}

export function rangeSeries(series: TimeSeriesPoint[], range: RangeKey) {
  return series.slice(-rangeDays[range]);
}

export function seriesSummary(points: TimeSeriesPoint[]) {
  if (points.length === 0) return { min: 0, max: 0, latest: 0, average: 0 };
  const values = points.map((point) => point.value);
  const sum = values.reduce((total, value) => total + value, 0);
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    latest: values[values.length - 1],
    average: Math.round(sum / values.length)
  };
}

export function filterEvents(events: EventRow[], filters: DashboardFilters) {
  return events.filter((event) => filters.status === "all" || event.status === filters.status);
}

export function statusCounts(events: EventRow[]) {
  return {
    healthy: events.filter((event) => event.status === "healthy").length,
    warning: events.filter((event) => event.status === "warning").length,
    critical: events.filter((event) => event.status === "critical").length
  };
}
