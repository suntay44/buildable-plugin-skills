"use client";

import { useMemo, useState } from "react";
import { LeadComposer } from "@/components/lead-composer";
import { LeadDetailPanel } from "@/components/lead-detail-panel";
import { LeadFiltersBar } from "@/components/lead-filters";
import { LeadList } from "@/components/lead-list";
import { PipelineSummary } from "@/components/pipeline-summary";
import { filterLeads, uniqueSources } from "@/lib/crm-utils";
import { sampleLeads } from "@/lib/sample-leads";
import type { Lead, LeadFilters } from "@/types/crm";

const defaultFilters: LeadFilters = {
  stage: "all",
  source: "all",
  query: ""
};

export default function Home() {
  const [leads, setLeads] = useState<Lead[]>(sampleLeads);
  const [filters, setFilters] = useState<LeadFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(sampleLeads[0]?.id ?? null);

  const visibleLeads = useMemo(() => filterLeads(leads, filters), [leads, filters]);
  const sources = useMemo(() => uniqueSources(leads), [leads]);
  const selectedLead = leads.find((lead) => lead.id === selectedId) ?? null;

  function createLead(lead: Lead) {
    setLeads((current) => [lead, ...current]);
    setSelectedId(lead.id);
  }

  function updateLead(nextLead: Lead) {
    setLeads((current) => current.map((lead) => (lead.id === nextLead.id ? nextLead : lead)));
  }

  function deleteLead(id: string) {
    setLeads((current) => current.filter((lead) => lead.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean">Local-first prototype</p>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold text-ink sm:text-4xl">PipelineCRM</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                Track leads, move them through the pipeline, and keep the next action visible — all from local data, no accounts or setup.
              </p>
            </div>
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-ocean">
              {visibleLeads.length} visible of {leads.length} leads
            </p>
          </div>
        </header>

        <PipelineSummary leads={leads} />

        <div className="grid gap-4 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start">
          <div className="grid min-w-0 gap-4">
            <LeadComposer onCreate={createLead} />
            <LeadFiltersBar filters={filters} sources={sources} onChange={setFilters} />
          </div>
          <div className="grid min-w-0 gap-4">
            <LeadList
              leads={visibleLeads}
              allLeadsCount={leads.length}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onClearFilters={() => setFilters(defaultFilters)}
            />
            <LeadDetailPanel lead={selectedLead} onUpdate={updateLead} onDelete={deleteLead} />
          </div>
        </div>
      </div>
    </main>
  );
}
