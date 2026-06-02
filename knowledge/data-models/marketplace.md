# Marketplace Data Model

## Entities

```ts
type Listing = {
  id: string;
  title: string;
  description: string;
  category: string;
  priceLabel: string;
  location: string;
  rating: number;
  sellerId: string;
  tags: string[];
};

type Seller = {
  id: string;
  name: string;
  responseTime: string;
  verified: boolean;
};
```

## Derived Values

- filtered listings
- category counts
- saved listings
- inquiry draft state

