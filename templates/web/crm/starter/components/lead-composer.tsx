"use client";

import { useState } from "react";
import { createLeadId } from "@/lib/crm-utils";
import type { Lead } from "@/types/crm";

type Props = {
  onCreate: (lead: Lead) => void;
};

export function LeadComposer({ onCreate }: Props) {
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [value, setValue] = useState("");
  const [source, setSource] = useState("Website");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedName = name.trim();
    const trimmedCompany = company.trim();

    if (!trimmedName || !trimmedCompany) {
      setError("Add a contact name and company before creating the lead.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);
    onCreate({
      id: createLeadId(),
      name: trimmedName,
      company: trimmedCompany,
      email: email.trim() || "no-email@example.com",
      stage: "new",
      value: Number(value) > 0 ? Number(value) : 0,
      source,
      nextAction: "Qualify budget and timeline",
      lastContactedAt: now,
      createdAt: now,
      updatedAt: now
    });
    setName("");
    setCompany("");
    setEmail("");
    setValue("");
    setSource("Website");
    setError("");
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-sm font-semibold text-ink">Add lead</h2>
      <div className="mt-3 grid gap-3">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Contact name
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Who is the contact?"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Company
          <input
            value={company}
            onChange={(event) => setCompany(event.target.value)}
            placeholder="Company name"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="name@company.com"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Deal value (USD)
            <input
              inputMode="numeric"
              value={value}
              onChange={(event) => setValue(event.target.value.replace(/[^0-9]/g, ""))}
              placeholder="0"
              className="h-11 rounded-md border border-slate-300 px-3 text-base"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Source
            <select
              value={source}
              onChange={(event) => setSource(event.target.value)}
              className="h-11 rounded-md border border-slate-300 px-3 text-base"
            >
              <option>Website</option>
              <option>Referral</option>
              <option>Outbound</option>
              <option>Event</option>
            </select>
          </label>
        </div>
        <button className="h-11 rounded-md bg-ocean px-5 font-semibold text-white hover:bg-blue-700" type="submit">
          Add lead
        </button>
        {error ? <p className="text-sm font-medium text-coral">{error}</p> : null}
      </div>
    </form>
  );
}
