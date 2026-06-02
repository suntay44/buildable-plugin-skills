import { formatDelta, formatMetric } from "@/lib/dashboard-utils";
import type { Metric } from "@/types/dashboard";

const trendTone: Record<Metric["trend"], string> = {
  up: "text-meadow",
  down: "text-coral",
  flat: "text-slate-500"
};

const trendGlyph: Record<Metric["trend"], string> = {
  up: "▲",
  down: "▼",
  flat: "■"
};

export function MetricCards({ metrics }: { metrics: Metric[] }) {
  return (
    <section aria-label="Key metrics" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {metrics.map((metric) => (
        <div key={metric.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{metric.label}</p>
          <p className="mt-1 text-2xl font-semibold text-ink">{formatMetric(metric)}</p>
          <p className={`mt-1 text-sm font-medium ${trendTone[metric.trend]}`}>
            <span aria-hidden="true">{trendGlyph[metric.trend]}</span> {formatDelta(metric.delta)} vs prior period
          </p>
        </div>
      ))}
    </section>
  );
}
