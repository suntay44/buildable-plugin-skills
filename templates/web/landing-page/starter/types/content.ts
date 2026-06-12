export type Section = {
  id: string;
  kind: "hero" | "features" | "social-proof" | "pricing" | "faq" | "cta";
  title: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaHref?: string;
  order: number;
};

export type Feature = {
  id: string;
  title: string;
  description: string;
};

export type Testimonial = {
  id: string;
  quote: string;
  author: string;
  role: string;
};

export type PricingTier = {
  id: string;
  name: string;
  price: string;
  cadence: "monthly" | "yearly" | "one-time";
  features: string[];
  highlighted: boolean;
  ctaLabel: string;
};

export type Faq = {
  id: string;
  question: string;
  answer: string;
};
