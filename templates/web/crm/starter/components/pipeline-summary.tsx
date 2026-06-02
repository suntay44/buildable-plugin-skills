import { formatCurrency, pipelineSummary } from "@/lib/crm-utils";
import type { Lead } from "@/types/crm";

export function PipelineSummary({ leads }: { leads: Lead[] }) {
  const summary = pipelineSummary(leads);
  const headline = [
    ["Open pipeline", formatCurrency(summary.openValue)],
    ["Won", formatCurrency(summary.wonValue)],
    ["Active leads", String(summary.total)],
    ["Stale (14d+)", String(summary.staleCount)]
  ];

  return (
    <section aria-label="Pipeline summary" className="grid gap-4">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {headline.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">{label}</p>
            <p className="mt-1 text-2xl font-semibold text-ink">{value}</p>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {summary.byStage.map((stage) => (
          <div key={stage.stage} className="rounded-lg border border-slate-200 bg-white p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{stage.label}</p>
            <p className="mt-1 text-lg font-semibold text-ink">{stage.count}</p>
            <p className="text-sm text-slate-500">{formatCurrency(stage.value)}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
