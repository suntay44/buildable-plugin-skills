"use client";

import { useState } from "react";
import { formatPosted, typeLabels } from "@/lib/job-utils";
import type { Job } from "@/types/job";

type Props = {
  job: Job | null;
  saved: boolean;
  onToggleSave: (id: string) => void;
};

export function JobDetail({ job, saved, onToggleSave }: Props) {
  const [form, setForm] = useState({ name: "", email: "", note: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!job) {
    return (
      <section aria-label="Job detail" className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-12">
        <p className="max-w-xs text-center text-sm text-slate-500">Select a job to see the details and apply.</p>
      </section>
    );
  }

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!form.name.trim() || !form.email.trim()) {
      setError("Name and email are required to apply.");
      return;
    }
    setError(null);
    setSubmitted(true);
  };

  return (
    <section aria-label="Job detail" className="grid content-start gap-5 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
      <header className="grid gap-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-ink">{job.title}</h2>
            <p className="text-sm text-slate-600">
              {job.company} · {job.location}
            </p>
          </div>
          <button
            type="button"
            aria-pressed={saved}
            onClick={() => onToggleSave(job.id)}
            className={`shrink-0 rounded-md px-3 py-2 text-sm font-semibold ${
              saved ? "bg-meadow/10 text-meadow" : "border border-slate-300 text-ink hover:bg-mist"
            }`}
          >
            {saved ? "Saved ✓" : "Save job"}
          </button>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-mist px-2.5 py-1 font-medium text-slate-600">{typeLabels[job.type]}</span>
          {job.remote ? <span className="rounded-full bg-meadow/10 px-2.5 py-1 font-medium text-meadow">Remote</span> : null}
          <span className="rounded-full bg-mist px-2.5 py-1 font-medium text-slate-600">{job.salaryLabel}</span>
          <span className="rounded-full bg-mist px-2.5 py-1 font-medium text-slate-500">Posted {formatPosted(job.postedAt)}</span>
        </div>
      </header>

      <p className="text-sm leading-relaxed text-slate-700">{job.description}</p>

      <ul className="flex flex-wrap gap-1.5">
        {job.tags.map((tag) => (
          <li key={tag} className="rounded-full bg-mist px-2.5 py-1 text-xs font-medium text-slate-600">
            {tag}
          </li>
        ))}
      </ul>

      <div className="border-t border-slate-100 pt-5">
        {submitted ? (
          <div role="status" className="grid gap-2 rounded-md border border-meadow/30 bg-meadow/5 p-5 text-center">
            <p className="font-semibold text-meadow">Application submitted</p>
            <p className="text-sm text-slate-600">
              Thanks, {form.name}. {job.company} has your application for {job.title}. This is a local prototype — nothing was sent.
            </p>
            <button
              type="button"
              onClick={() => {
                setSubmitted(false);
                setForm({ name: "", email: "", note: "" });
              }}
              className="mx-auto mt-1 text-sm font-semibold text-meadow hover:underline"
            >
              Apply to another role
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="grid gap-3" noValidate>
            <h3 className="text-sm font-semibold text-ink">Apply for this role</h3>
            {error ? (
              <p role="alert" className="rounded-md bg-coral/10 px-3 py-2 text-sm text-coral">
                {error}
              </p>
            ) : null}
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Full name
              <input
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                className="h-11 rounded-md border border-slate-300 px-3 text-base"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Email
              <input
                type="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                className="h-11 rounded-md border border-slate-300 px-3 text-base"
              />
            </label>
            <label className="grid gap-1 text-sm font-medium text-slate-700">
              Note <span className="font-normal text-slate-400">(optional)</span>
              <textarea
                value={form.note}
                onChange={(event) => setForm((current) => ({ ...current, note: event.target.value }))}
                rows={3}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
            </label>
            <button type="submit" className="rounded-md bg-meadow px-5 py-2.5 text-sm font-semibold text-white hover:bg-meadow/90">
              Submit application
            </button>
          </form>
        )}
      </div>
    </section>
  );
}
