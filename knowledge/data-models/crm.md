# CRM Data Model

## Entities

```ts
type LeadStage = "new" | "qualified" | "proposal" | "won" | "lost";

type Lead = {
  id: string;
  name: string;
  company: string;
  email: string;
  stage: LeadStage;
  value: number;
  source: string;
  nextAction: string;
  lastContactedAt: string;
};

type Activity = {
  id: string;
  leadId: string;
  type: "call" | "email" | "meeting" | "note";
  summary: string;
  createdAt: string;
};
```

## Derived Values

- pipeline value by stage
- active leads
- stale leads
- won value
- next actions due

