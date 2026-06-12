"use client";

import { useState } from "react";
import { JobDetail } from "@/components/job-detail";
import { JobFiltersBar } from "@/components/job-filters";
import { filterJobs, formatPosted, typeLabels } from "@/lib/job-utils";
import { sampleJobs } from "@/lib/sample-jobs";
import type { JobFilters } from "@/types/job";

const emptyFilters: JobFilters = { query: "", type: "all", remoteOnly: false };

export default function JobBoard() {
  const [filters, setFilters] = useState<JobFilters>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(sampleJobs[0]?.id ?? null);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const visible = filterJobs(sampleJobs, filters);
  const selected = sampleJobs.find((job) => job.id === selectedId) ?? null;

  const toggleSave = (id: string) =>
    setSavedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Openings</h1>
            <p className="text-sm text-slate-500">Browse roles, filter by type, and apply — all on local data.</p>
          </div>
          <span className="rounded-md bg-white px-3 py-2 text-sm font-medium text-slate-600 shadow-sm">
            {savedIds.length} saved
          </span>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          <div className="grid gap-4">
            <JobFiltersBar filters={filters} resultCount={visible.length} onChange={setFilters} />

            {visible.length === 0 ? (
              <p className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500">
                No jobs match these filters.{" "}
                <button type="button" onClick={() => setFilters(emptyFilters)} className="font-semibold text-meadow hover:underline">
                  Clear filters
                </button>
              </p>
            ) : (
              <ul className="grid gap-2">
                {visible.map((job) => (
                  <li key={job.id}>
                    <button
                      type="button"
                      onClick={() => setSelectedId(job.id)}
                      aria-current={selectedId === job.id}
                      className={`grid w-full gap-1 rounded-md border p-3 text-left ${
                        selectedId === job.id ? "border-meadow bg-meadow/5" : "border-slate-200 bg-white hover:bg-mist"
                      }`}
                    >
                      <span className="flex items-start justify-between gap-2">
                        <span className="font-medium text-ink">{job.title}</span>
                        {savedIds.includes(job.id) ? <span className="shrink-0 text-xs font-semibold text-meadow">Saved</span> : null}
                      </span>
                      <span className="text-sm text-slate-600">
                        {job.company} · {job.location}
                      </span>
                      <span className="text-xs text-slate-400">
                        {typeLabels[job.type]}
                        {job.remote ? " · Remote" : ""} · {job.salaryLabel} · {formatPosted(job.postedAt)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <JobDetail job={selected} saved={selected ? savedIds.includes(selected.id) : false} onToggleSave={toggleSave} />
        </div>
      </div>
    </main>
  );
}
