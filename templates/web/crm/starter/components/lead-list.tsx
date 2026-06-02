"use client";

import { formatCurrency, isStale, stageLabels } from "@/lib/crm-utils";
import type { Lead } from "@/types/crm";

type Props = {
  leads: Lead[];
  allLeadsCount: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClearFilters: () => void;
};

const stageTone: Record<Lead["stage"], string> = {
  new: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-50 text-ocean",
  proposal: "bg-amber/10 text-amber",
  won: "bg-emerald-50 text-meadow",
  lost: "bg-red-50 text-coral"
};

export function LeadList({ leads, allLeadsCount, selectedId, onSelect, onClearFilters }: Props) {
  if (allLeadsCount === 0) {
    return (
      <EmptyState
        title="No leads yet"
        body="Add your first lead to start building the pipeline. Sample data normally shows every stage so the workspace never looks empty after edits."
      />
    );
  }

  if (leads.length === 0) {
    return (
      <EmptyState
        title="No leads match these filters"
        body="Clear the search, stage, or source filters to see the full pipeline again."
        action={
          <button onClick={onClearFilters} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
            Clear filters
          </button>
        }
      />
    );
  }

  return (
    <section aria-label="Leads" className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <table className="w-full border-collapse text-left text-sm">
        <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3 font-semibold">Lead</th>
            <th className="hidden px-4 py-3 font-semibold sm:table-cell">Stage</th>
            <th className="hidden px-4 py-3 font-semibold md:table-cell">Next action</th>
            <th className="px-4 py-3 text-right font-semibold">Value</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead) => {
            const selected = lead.id === selectedId;
            return (
              <tr
                key={lead.id}
                onClick={() => onSelect(lead.id)}
                className={`cursor-pointer border-t border-slate-100 transition-colors ${selected ? "bg-blue-50/60" : "hover:bg-slate-50"}`}
              >
                <td className="px-4 py-3">
                  <button type="button" className="text-left" onClick={() => onSelect(lead.id)}>
                    <span className="font-semibold text-ink">{lead.name}</span>
                    <span className="block text-xs text-slate-500">{lead.company}</span>
                  </button>
                  <div className="mt-1 flex flex-wrap gap-1.5 sm:hidden">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${stageTone[lead.stage]}`}>{stageLabels[lead.stage]}</span>
                    {isStale(lead) ? <span className="rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-coral">Stale</span> : null}
                  </div>
                </td>
                <td className="hidden px-4 py-3 sm:table-cell">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${stageTone[lead.stage]}`}>{stageLabels[lead.stage]}</span>
                  {isStale(lead) ? <span className="ml-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-coral">Stale</span> : null}
                </td>
                <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{lead.nextAction}</td>
                <td className="px-4 py-3 text-right font-semibold text-ink">{formatCurrency(lead.value)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </section>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-600">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
