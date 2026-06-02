"use client";

import { useMemo, useState } from "react";
import { ListingDetail } from "@/components/listing-detail";
import { ListingFiltersBar } from "@/components/listing-filters";
import { ListingGrid } from "@/components/listing-grid";
import { filterListings, uniqueCategories } from "@/lib/marketplace-utils";
import { sampleListings } from "@/lib/sample-listings";
import type { ListingFilters } from "@/types/marketplace";

const defaultFilters: ListingFilters = {
  category: "all",
  query: "",
  sort: "recommended"
};

export default function Home() {
  const [filters, setFilters] = useState<ListingFilters>(defaultFilters);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const categories = useMemo(() => uniqueCategories(sampleListings), []);
  const visibleListings = useMemo(() => filterListings(sampleListings, filters), [filters]);
  const selectedListing = sampleListings.find((listing) => listing.id === selectedId) ?? null;

  function toggleSave(id: string) {
    setSavedIds((current) => (current.includes(id) ? current.filter((value) => value !== id) : [...current, id]));
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean">Local-first prototype</p>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold text-ink sm:text-4xl">LocalMarket</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                Browse local services, filter by category, compare providers, and send an inquiry — all from local data with no accounts.
              </p>
            </div>
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-ocean">
              {visibleListings.length} of {sampleListings.length} listings · {savedIds.length} saved
            </p>
          </div>
        </header>

        <ListingFiltersBar filters={filters} listings={sampleListings} categories={categories} onChange={setFilters} />

        <ListingGrid
          listings={visibleListings}
          allListingsCount={sampleListings.length}
          savedIds={savedIds}
          onSelect={setSelectedId}
          onToggleSave={toggleSave}
          onClearFilters={() => setFilters(defaultFilters)}
        />
      </div>

      {selectedListing ? (
        <ListingDetail
          listing={selectedListing}
          saved={savedIds.includes(selectedListing.id)}
          onToggleSave={toggleSave}
          onClose={() => setSelectedId(null)}
        />
      ) : null}
    </main>
  );
}
