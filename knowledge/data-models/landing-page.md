# Landing Page Data Model

A landing page is content-driven, not record-driven: model the page as ordered sections so copy is data, the layout stays consistent, and the CTA story is explicit.

## Entities

```ts
type Section = {
  id: string;
  kind: "hero" | "features" | "social-proof" | "pricing" | "faq" | "cta";
  title: string;
  subtitle?: string;
  body?: string;
  ctaLabel?: string;
  ctaHref?: string;
  order: number;
};

type Feature = {
  id: string;
  title: string;
  description: string;
  icon?: string;
};

type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

type PricingTier = {
  id: string;
  name: string;
  price: string;
  cadence: "monthly" | "yearly" | "one-time";
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
};
```

## Derived Values

- sections sorted by `order`
- the highlighted pricing tier (exactly one)
- hero CTA repeated in the closing CTA section

## Notes

- Copy must be concrete product copy, never lorem ipsum.
- Keep one primary CTA action; secondary CTAs link to detail (docs, demo).
- Pricing is display data only — no checkout, billing, or payment integration unless requested.
