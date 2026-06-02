"use client";

import { statusLabels } from "@/lib/dashboard-utils";
import type { DashboardFilters, EventRow } from "@/types/dashboard";

type Props = {
  events: EventRow[];
  allEventsCount: number;
  filters: DashboardFilters;
  onStatusChange: (status: DashboardFilters["status"]) => void;
  onClearFilters: () => void;
};

const statusTone: Record<EventRow["status"], string> = {
  healthy: "bg-emerald-50 text-meadow",
  warning: "bg-amber/10 text-amber",
  critical: "bg-red-50 text-coral"
};

const statusOptions: DashboardFilters["status"][] = ["all", "healthy", "warning", "critical"];

export function EventTable({ events, allEventsCount, filters, onStatusChange, onClearFilters }: Props) {
  return (
    <section aria-label="Recent events" className="rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-4">
        <h2 className="text-sm font-semibold text-ink">Recent account events</h2>
        <label className="flex items-center gap-2 text-sm text-slate-600">
          Status filtering
          <select
            value={filters.status}
            onChange={(event) => onStatusChange(event.target.value as DashboardFilters["status"])}
            className="h-9 rounded-md border border-slate-300 px-2 text-sm"
          >
            {statusOptions.map((status) => (
              <option key={status} value={status}>
                {status === "all" ? "All" : statusLabels[status]}
              </option>
            ))}
          </select>
        </label>
      </div>

      {events.length === 0 ? (
        <div className="p-8 text-center">
          <h3 className="text-base font-semibold text-ink">No events match this status</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
            {allEventsCount} events exist in total. Clear the status filter to see all account activity.
          </p>
          <button onClick={onClearFilters} className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
            Clear filter
          </button>
        </div>
      ) : (
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-mist text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3 font-semibold">Account</th>
              <th className="px-4 py-3 font-semibold">Event</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="hidden px-4 py-3 text-right font-semibold sm:table-cell">When</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-slate-100">
                <td className="px-4 py-3 font-medium text-ink">{event.account}</td>
                <td className="px-4 py-3 text-slate-600">{event.event}</td>
                <td className="px-4 py-3">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone[event.status]}`}>
                    {statusLabels[event.status]}
                  </span>
                </td>
                <td className="hidden px-4 py-3 text-right text-slate-500 sm:table-cell">{event.timestamp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  );
}
