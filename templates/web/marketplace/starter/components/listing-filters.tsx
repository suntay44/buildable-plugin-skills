import { categoryCounts, sortLabels } from "@/lib/marketplace-utils";
import type { Listing, ListingFilters, SortKey } from "@/types/marketplace";

type Props = {
  filters: ListingFilters;
  listings: Listing[];
  categories: string[];
  onChange: (filters: ListingFilters) => void;
};

const sorts: SortKey[] = ["recommended", "rating", "priceLow", "priceHigh"];

export function ListingFiltersBar({ filters, listings, categories, onChange }: Props) {
  const counts = categoryCounts(listings);

  return (
    <section aria-label="Listing filters" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_200px]">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Search listings
          <input
            value={filters.query}
            onChange={(event) => onChange({ ...filters, query: event.target.value })}
            placeholder="Search service, location, or tag"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Sort
          <select
            value={filters.sort}
            onChange={(event) => onChange({ ...filters, sort: event.target.value as SortKey })}
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          >
            {sorts.map((sort) => (
              <option key={sort} value={sort}>
                {sortLabels[sort]}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="flex flex-wrap gap-2">
        <CategoryChip
          label={`All (${listings.length})`}
          active={filters.category === "all"}
          onClick={() => onChange({ ...filters, category: "all" })}
        />
        {categories.map((category) => (
          <CategoryChip
            key={category}
            label={`${category} (${counts[category] ?? 0})`}
            active={filters.category === category}
            onClick={() => onChange({ ...filters, category })}
          />
        ))}
      </div>
    </section>
  );
}

function CategoryChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-3 py-1.5 text-sm font-medium ${
        active ? "border-ocean bg-ocean text-white" : "border-slate-300 text-slate-700 hover:bg-slate-50"
      }`}
    >
      {label}
    </button>
  );
}
