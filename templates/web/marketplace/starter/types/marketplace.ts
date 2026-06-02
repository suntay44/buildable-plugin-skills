export type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceLabel: string;
  priceValue: number;
  location: string;
  rating: number;
  sellerId: string;
  sellerName: string;
  responseTime: string;
  verified: boolean;
  tags: string[];
};

export type SortKey = "recommended" | "rating" | "priceLow" | "priceHigh";

export type ListingFilters = {
  category: "all" | string;
  query: string;
  sort: SortKey;
};

export type InquiryState = {
  listingId: string;
  message: string;
  submitted: boolean;
};
