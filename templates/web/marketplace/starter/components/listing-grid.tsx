"use client";

import type { Listing } from "@/types/marketplace";

type Props = {
  listings: Listing[];
  allListingsCount: number;
  savedIds: string[];
  onSelect: (id: string) => void;
  onToggleSave: (id: string) => void;
  onClearFilters: () => void;
};

export function ListingGrid({ listings, allListingsCount, savedIds, onSelect, onToggleSave, onClearFilters }: Props) {
  if (listings.length === 0) {
    return (
      <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-ink">No listings match your search</h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">
          {allListingsCount} services are available in total. Clear the category and search to browse everything again.
        </p>
        <button onClick={onClearFilters} className="mt-4 rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
          Clear filters
        </button>
      </section>
    );
  }

  return (
    <section aria-label="Listings" className="grid gap-4 sm:grid-cols-2">
      {listings.map((listing) => {
        const saved = savedIds.includes(listing.id);
        return (
          <article key={listing.id} className="flex flex-col gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <button type="button" onClick={() => onSelect(listing.id)} className="text-left">
                  <h2 className="text-base font-semibold text-ink hover:text-ocean">{listing.title}</h2>
                </button>
                <p className="mt-0.5 text-xs text-slate-500">
                  {listing.location} · {listing.sellerName}
                  {listing.verified ? <span className="ml-1 text-meadow">✓ Verified</span> : null}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onToggleSave(listing.id)}
                aria-pressed={saved}
                aria-label={saved ? "Remove from saved" : "Save listing"}
                className={`rounded-md border px-2 py-1 text-sm ${saved ? "border-coral text-coral" : "border-slate-300 text-slate-500"}`}
              >
                {saved ? "♥ Saved" : "♡ Save"}
              </button>
            </div>
            <p className="line-clamp-3 text-sm leading-6 text-slate-600">{listing.description}</p>
            <div className="mt-auto flex items-center justify-between">
              <span className="text-sm font-semibold text-ink">{listing.priceLabel}</span>
              <span className="text-sm text-amber">★ {listing.rating.toFixed(1)}</span>
            </div>
            <button
              type="button"
              onClick={() => onSelect(listing.id)}
              className="rounded-md border border-slate-300 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              View detail
            </button>
          </article>
        );
      })}
    </section>
  );
}
