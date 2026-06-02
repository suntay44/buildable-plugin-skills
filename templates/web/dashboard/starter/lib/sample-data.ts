import type { EventRow, Metric, TimeSeriesPoint } from "@/types/dashboard";

export const sampleMetrics: Metric[] = [
  { id: "mrr", label: "MRR", value: 48250, unit: "currency", delta: 6.4, trend: "up" },
  { id: "active", label: "Active accounts", value: 1284, unit: "number", delta: 2.1, trend: "up" },
  { id: "churn", label: "Churn rate", value: 2.8, unit: "percent", delta: -0.5, trend: "down" },
  { id: "nps", label: "NPS", value: 52, unit: "number", delta: 0, trend: "flat" }
];

function buildSeries(base: number, swing: number): TimeSeriesPoint[] {
  const points: TimeSeriesPoint[] = [];
  const start = new Date("2026-03-04");
  for (let day = 0; day < 90; day += 1) {
    const date = new Date(start.getTime() + day * 86_400_000);
    const wave = Math.sin(day / 6) * swing;
    const drift = day * (swing / 90);
    const value = Math.round(base + wave + drift);
    points.push({ date: date.toISOString().slice(0, 10), value });
  }
  return points;
}

export const sampleSeries: TimeSeriesPoint[] = buildSeries(1600, 280);

export const sampleEvents: EventRow[] = [
  { id: "evt-1", account: "Northwind Studio", event: "Upgraded to Scale plan", status: "healthy", timestamp: "2026-06-01 09:12" },
  { id: "evt-2", account: "Brightpath Logistics", event: "Payment retry failed", status: "critical", timestamp: "2026-06-01 08:47" },
  { id: "evt-3", account: "Cedar & Co", event: "Usage near plan limit", status: "warning", timestamp: "2026-05-31 22:30" },
  { id: "evt-4", account: "Lumen Health", event: "Invited 4 teammates", status: "healthy", timestamp: "2026-05-31 17:05" },
  { id: "evt-5", account: "Pier 9 Retail", event: "Support ticket escalated", status: "warning", timestamp: "2026-05-31 14:18" },
  { id: "evt-6", account: "Atlas Fabrication", event: "Completed onboarding", status: "healthy", timestamp: "2026-05-30 11:54" },
  { id: "evt-7", account: "Verde Interiors", event: "Downgraded plan", status: "warning", timestamp: "2026-05-30 09:40" },
  { id: "evt-8", account: "Summit Analytics", event: "API error rate spike", status: "critical", timestamp: "2026-05-29 19:22" }
];
