import type { Listing, ListingFilters, SortKey } from "@/types/marketplace";

export const sortLabels: Record<SortKey, string> = {
  recommended: "Recommended",
  rating: "Top rated",
  priceLow: "Price: low to high",
  priceHigh: "Price: high to low"
};

export function uniqueCategories(listings: Listing[]) {
  return [...new Set(listings.map((listing) => listing.category))].sort();
}

export function categoryCounts(listings: Listing[]) {
  return listings.reduce<Record<string, number>>((counts, listing) => {
    counts[listing.category] = (counts[listing.category] ?? 0) + 1;
    return counts;
  }, {});
}

export function filterListings(listings: Listing[], filters: ListingFilters) {
  const query = filters.query.trim().toLowerCase();

  const matched = listings.filter((listing) => {
    const categoryMatch = filters.category === "all" || listing.category === filters.category;
    const queryMatch =
      query.length === 0 ||
      listing.title.toLowerCase().includes(query) ||
      listing.description.toLowerCase().includes(query) ||
      listing.location.toLowerCase().includes(query) ||
      listing.tags.some((tag) => tag.toLowerCase().includes(query));

    return categoryMatch && queryMatch;
  });

  return sortListings(matched, filters.sort);
}

export function sortListings(listings: Listing[], sort: SortKey) {
  const copy = [...listings];
  switch (sort) {
    case "rating":
      return copy.sort((a, b) => b.rating - a.rating);
    case "priceLow":
      return copy.sort((a, b) => a.priceValue - b.priceValue);
    case "priceHigh":
      return copy.sort((a, b) => b.priceValue - a.priceValue);
    default:
      return copy.sort((a, b) => Number(b.verified) - Number(a.verified) || b.rating - a.rating);
  }
}
