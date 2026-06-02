import { seriesSummary } from "@/lib/dashboard-utils";
import type { TimeSeriesPoint } from "@/types/dashboard";

type Props = {
  points: TimeSeriesPoint[];
  label: string;
};

export function TrendChart({ points, label }: Props) {
  const summary = seriesSummary(points);

  if (points.length === 0) {
    return (
      <section aria-label="Trend" className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">No trend data for this range</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          Pick a wider date range to see activity. This empty state ships with the template so the chart never renders blank.
        </p>
      </section>
    );
  }

  const width = 720;
  const height = 220;
  const padding = 16;
  const span = Math.max(1, summary.max - summary.min);
  const step = points.length > 1 ? (width - padding * 2) / (points.length - 1) : 0;

  const coords = points.map((point, index) => {
    const x = padding + index * step;
    const y = padding + (1 - (point.value - summary.min) / span) * (height - padding * 2);
    return { x, y };
  });

  const line = coords.map((coord, index) => `${index === 0 ? "M" : "L"}${coord.x.toFixed(1)},${coord.y.toFixed(1)}`).join(" ");
  const area = `${line} L${coords[coords.length - 1].x.toFixed(1)},${height - padding} L${coords[0].x.toFixed(1)},${height - padding} Z`;

  return (
    <section aria-label="Trend region" className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-ink">{label}</h2>
          <p className="text-2xl font-semibold text-ink">{summary.latest.toLocaleString()}</p>
        </div>
        <dl className="flex gap-4 text-sm text-slate-500">
          <div>
            <dt className="text-xs uppercase tracking-wide">Avg</dt>
            <dd className="font-medium text-ink">{summary.average.toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide">Peak</dt>
            <dd className="font-medium text-ink">{summary.max.toLocaleString()}</dd>
          </div>
        </dl>
      </div>
      <svg
        role="img"
        aria-label={`${label} trend line`}
        viewBox={`0 0 ${width} ${height}`}
        className="mt-4 h-48 w-full"
        preserveAspectRatio="none"
      >
        <path d={area} fill="rgba(37, 99, 235, 0.10)" />
        <path d={line} fill="none" stroke="#2563eb" strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
      </svg>
    </section>
  );
}
