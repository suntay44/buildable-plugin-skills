export type LeadStage = "new" | "qualified" | "proposal" | "won" | "lost";

export type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: LeadStage;
  value: number;
  source: string;
  nextAction: string;
  lastContactedAt: string;
  createdAt: string;
  updatedAt: string;
};

export type LeadFilters = {
  stage: "all" | LeadStage;
  source: "all" | string;
  query: string;
};
