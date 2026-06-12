"use client";

import { typeLabels } from "@/lib/job-utils";
import type { JobFilters } from "@/types/job";

type Props = {
  filters: JobFilters;
  resultCount: number;
  onChange: (filters: JobFilters) => void;
};

const types: ("all" | JobFilters["type"])[] = ["all", "full-time", "part-time", "contract", "internship"];

export function JobFiltersBar({ filters, resultCount, onChange }: Props) {
  return (
    <section aria-label="Job filters" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Search jobs
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search title, company, location, or tag"
          className="h-11 rounded-md border border-slate-300 px-3 text-base"
        />
      </label>

      <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Employment type
          <select
            value={filters.type}
            onChange={(event) => onChange({ ...filters, type: event.target.value as JobFilters["type"] })}
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          >
            {types.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All types" : typeLabels[type]}
              </option>
            ))}
          </select>
        </label>

        <label className="flex h-11 items-center gap-2 rounded-md border border-slate-300 px-3 text-sm font-medium text-slate-700">
          <input
            type="checkbox"
            checked={filters.remoteOnly}
            onChange={(event) => onChange({ ...filters, remoteOnly: event.target.checked })}
            className="h-4 w-4"
          />
          Remote only
        </label>
      </div>

      <p className="text-sm text-slate-500">
        {resultCount} job{resultCount === 1 ? "" : "s"} match
      </p>
    </section>
  );
}
