# Web Marketplace Golden Template Plan

## Product Shape

One browse-first marketplace prototype with listing discovery, filtering, detail inspection, and inquiry.

## Proposed File Structure

```txt
app/
  layout.tsx
  page.tsx
components/
  listing-card.tsx
  listing-detail.tsx
  listing-filters.tsx
  listing-grid.tsx
  inquiry-form.tsx
lib/
  sample-listings.ts
  marketplace-utils.ts
types/
  marketplace.ts
```

## Required Features

- browse listings
- search listings
- filter by category/location
- inspect listing detail
- save or mark interest locally
- submit local inquiry
- show filtered empty state

## Sample Data

Include 8 to 12 listings across at least 4 categories with varied seller metadata.

## Validation Hints

- Listing detail works on mobile without a cramped two-column layout.
- Inquiry confirmation is visible.
- No payment, account, map, or hosted marketplace infrastructure appears unless requested.

