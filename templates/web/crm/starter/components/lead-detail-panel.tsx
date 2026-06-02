"use client";

import { useEffect, useState } from "react";
import { daysSince, formatCurrency, isStale, stageLabels, stageOrder } from "@/lib/crm-utils";
import type { Lead, LeadStage } from "@/types/crm";

type Props = {
  lead: Lead | null;
  onUpdate: (lead: Lead) => void;
  onDelete: (id: string) => void;
};

export function LeadDetailPanel({ lead, onUpdate, onDelete }: Props) {
  const [nextAction, setNextAction] = useState(lead?.nextAction ?? "");

  useEffect(() => {
    setNextAction(lead?.nextAction ?? "");
  }, [lead?.id, lead?.nextAction]);

  if (!lead) {
    return (
      <aside className="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center text-sm text-slate-500">
        Select a lead to see details, move it between stages, and record the next action.
      </aside>
    );
  }

  function touch(changes: Partial<Lead>) {
    if (!lead) return;
    onUpdate({ ...lead, ...changes, updatedAt: new Date().toISOString().slice(0, 10) });
  }

  function moveStage(stage: LeadStage) {
    touch({ stage });
  }

  function saveNextAction() {
    const trimmed = nextAction.trim();
    if (!trimmed) return;
    touch({ nextAction: trimmed, lastContactedAt: new Date().toISOString().slice(0, 10) });
  }

  return (
    <aside aria-label="Lead detail" className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-ink">{lead.name}</h2>
            <p className="text-sm text-slate-500">{lead.company}</p>
          </div>
          <span className="text-right text-lg font-semibold text-ink">{formatCurrency(lead.value)}</span>
        </div>
        <p className="mt-1 text-sm text-slate-500">{lead.email}</p>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-mist px-2.5 py-1 font-medium text-slate-600">Source: {lead.source}</span>
          <span className="rounded-full bg-mist px-2.5 py-1 font-medium text-slate-600">
            Last contact {daysSince(lead.lastContactedAt)}d ago
          </span>
          {isStale(lead) ? <span className="rounded-full bg-red-50 px-2.5 py-1 font-medium text-coral">Stale</span> : null}
        </div>
      </div>

      <div>
        <p className="text-sm font-semibold text-ink">Move stage</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {stageOrder.map((stage) => (
            <button
              key={stage}
              type="button"
              onClick={() => moveStage(stage)}
              aria-pressed={lead.stage === stage}
              className={`rounded-md border px-3 py-1.5 text-sm font-medium ${
                lead.stage === stage ? "border-ocean bg-ocean text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"
              }`}
            >
              {stageLabels[stage]}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-semibold text-ink" htmlFor={`${lead.id}-next-action`}>
          Next action
        </label>
        <textarea
          id={`${lead.id}-next-action`}
          value={nextAction}
          onChange={(event) => setNextAction(event.target.value)}
          rows={2}
          className="rounded-md border border-slate-300 px-3 py-2 text-base"
        />
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={saveNextAction} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
            Save next action
          </button>
          <button
            type="button"
            onClick={() => onDelete(lead.id)}
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-semibold text-coral"
          >
            Delete lead
          </button>
        </div>
      </div>
    </aside>
  );
}
