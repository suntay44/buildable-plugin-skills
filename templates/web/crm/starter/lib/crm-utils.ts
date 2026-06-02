import type { Lead, LeadFilters, LeadStage } from "@/types/crm";

export const stageOrder: LeadStage[] = ["new", "qualified", "proposal", "won", "lost"];

export const stageLabels: Record<LeadStage, string> = {
  new: "New",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
  lost: "Lost"
};

const openStages: LeadStage[] = ["new", "qualified", "proposal"];
const staleThresholdDays = 14;
const today = "2026-06-01";

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
}

export function daysSince(dateIso: string) {
  const then = new Date(dateIso).getTime();
  const now = new Date(today).getTime();
  return Math.max(0, Math.round((now - then) / 86_400_000));
}

export function isStale(lead: Lead) {
  return openStages.includes(lead.stage) && daysSince(lead.lastContactedAt) >= staleThresholdDays;
}

export function filterLeads(leads: Lead[], filters: LeadFilters) {
  const query = filters.query.trim().toLowerCase();

  return leads.filter((lead) => {
    const stageMatch = filters.stage === "all" || lead.stage === filters.stage;
    const sourceMatch = filters.source === "all" || lead.source === filters.source;
    const queryMatch =
      query.length === 0 ||
      lead.name.toLowerCase().includes(query) ||
      lead.company.toLowerCase().includes(query) ||
      lead.email.toLowerCase().includes(query);

    return stageMatch && sourceMatch && queryMatch;
  });
}

export function pipelineSummary(leads: Lead[]) {
  const byStage = stageOrder.map((stage) => {
    const stageLeads = leads.filter((lead) => lead.stage === stage);
    return {
      stage,
      label: stageLabels[stage],
      count: stageLeads.length,
      value: stageLeads.reduce((total, lead) => total + lead.value, 0)
    };
  });

  const openValue = leads.filter((lead) => openStages.includes(lead.stage)).reduce((total, lead) => total + lead.value, 0);
  const wonValue = leads.filter((lead) => lead.stage === "won").reduce((total, lead) => total + lead.value, 0);

  return {
    byStage,
    openValue,
    wonValue,
    staleCount: leads.filter(isStale).length,
    total: leads.length
  };
}

export function uniqueSources(leads: Lead[]) {
  return [...new Set(leads.map((lead) => lead.source))].sort();
}

export function createLeadId() {
  return `lead-${Date.now().toString(36)}`;
}
