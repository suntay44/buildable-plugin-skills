import { stageLabels, stageOrder } from "@/lib/crm-utils";
import type { LeadFilters } from "@/types/crm";

type Props = {
  filters: LeadFilters;
  sources: string[];
  onChange: (filters: LeadFilters) => void;
};

export function LeadFiltersBar({ filters, sources, onChange }: Props) {
  return (
    <section aria-label="Lead filters" className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Search
          <input
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Search lead, company, or email"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Stage
          <select
            value={filters.stage}
            onChange={(event) => onChange({ ...filters, stage: event.target.value as LeadFilters["stage"] })}
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          >
            <option value="all">All stages</option>
            {stageOrder.map((stage) => (
              <option key={stage} value={stage}>
                {stageLabels[stage]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Source
          <select
            value={filters.source}
            onChange={(event) => onChange({ ...filters, source: event.target.value })}
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          >
            <option value="all">All sources</option>
            {sources.map((source) => (
              <option key={source} value={source}>
                {source}
              </option>
            ))}
          </select>
        </label>
      </div>
    </section>
  );
}
