"use client";

import { useMemo, useState } from "react";
import { EventTable } from "@/components/event-table";
import { MetricCards } from "@/components/metric-cards";
import { RangeControl } from "@/components/range-control";
import { TrendChart } from "@/components/trend-chart";
import { filterEvents, rangeLabels, rangeSeries, statusCounts } from "@/lib/dashboard-utils";
import { sampleEvents, sampleMetrics, sampleSeries } from "@/lib/sample-data";
import type { DashboardFilters } from "@/types/dashboard";

const defaultFilters: DashboardFilters = {
  range: "30d",
  status: "all"
};

export default function Home() {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);

  const series = useMemo(() => rangeSeries(sampleSeries, filters.range), [filters.range]);
  const visibleEvents = useMemo(() => filterEvents(sampleEvents, filters), [filters]);
  const counts = statusCounts(sampleEvents);

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean">Local-first prototype</p>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold text-ink sm:text-4xl">SignalBoard</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                Track product health at a glance: key metrics, an active-usage trend, and recent account events — all from local mock data.
              </p>
            </div>
            <div className="grid gap-1">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500">Date range control</span>
              <RangeControl range={filters.range} onChange={(range) => setFilters((current) => ({ ...current, range }))} />
            </div>
          </div>
        </header>

        <MetricCards metrics={sampleMetrics} />

        <div className="grid gap-4 lg:grid-cols-[1fr_280px] lg:items-start">
          <TrendChart points={series} label={`Active usage · ${rangeLabels[filters.range]}`} />
          <section aria-label="Event health" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-ink">Event health</h2>
            {[
              ["Healthy", counts.healthy, "text-meadow"],
              ["Warning", counts.warning, "text-amber"],
              ["Critical", counts.critical, "text-coral"]
            ].map(([label, value, tone]) => (
              <div key={label as string} className="flex items-center justify-between">
                <span className="text-sm text-slate-600">{label}</span>
                <span className={`text-lg font-semibold ${tone as string}`}>{value}</span>
              </div>
            ))}
            <p className="text-xs leading-5 text-slate-500">
              Counts reflect all events regardless of the active table filter.
            </p>
          </section>
        </div>

        <EventTable
          events={visibleEvents}
          allEventsCount={sampleEvents.length}
          filters={filters}
          onStatusChange={(status) => setFilters((current) => ({ ...current, status }))}
          onClearFilters={() => setFilters((current) => ({ ...current, status: "all" }))}
        />
      </div>
    </main>
  );
}
