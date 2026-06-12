import type { Faq, Feature, PricingTier, Section, Testimonial } from "@/types/content";

export const sections: Section[] = [
  {
    id: "hero",
    kind: "hero",
    title: "Customer feedback that writes the roadmap",
    subtitle:
      "Clarity collects feature requests from support, sales, and surveys into one ranked list — so your team builds what customers actually ask for.",
    ctaLabel: "Start free trial",
    ctaHref: "#pricing",
    order: 1
  },
  {
    id: "features",
    kind: "features",
    title: "Everything between \"we should\" and \"we shipped\"",
    subtitle: "Concrete workflows for product teams, not another suggestion box.",
    order: 2
  },
  {
    id: "social-proof",
    kind: "social-proof",
    title: "Product teams ship faster with Clarity",
    order: 3
  },
  {
    id: "pricing",
    kind: "pricing",
    title: "Simple pricing that scales with your team",
    subtitle: "Every plan includes unlimited feedback sources and a 14-day trial.",
    order: 4
  },
  {
    id: "faq",
    kind: "faq",
    title: "Frequently asked questions",
    order: 5
  },
  {
    id: "cta",
    kind: "cta",
    title: "Stop guessing what to build next",
    subtitle: "Connect your first feedback source in under five minutes.",
    ctaLabel: "Start free trial",
    ctaHref: "#pricing",
    order: 6
  }
];

export const features: Feature[] = [
  {
    id: "f1",
    title: "One ranked backlog",
    description: "Duplicate requests merge automatically, so 40 tickets about CSV export become one item with 40 votes."
  },
  {
    id: "f2",
    title: "Revenue-weighted priority",
    description: "See which requests come from your biggest accounts before you commit the quarter."
  },
  {
    id: "f3",
    title: "Close the loop",
    description: "When a feature ships, every customer who asked gets notified — without anyone writing emails."
  },
  {
    id: "f4",
    title: "Roadmap views",
    description: "Share a now/next/later board publicly or keep it internal. Status syncs from your issue tracker."
  },
  {
    id: "f5",
    title: "Source integrations",
    description: "Pull requests in from support tickets, sales notes, NPS comments, and in-app widgets."
  },
  {
    id: "f6",
    title: "Decision history",
    description: "Every \"why did we build this?\" has an answer: the requests, the accounts, and the call that shipped it."
  }
];

export const testimonials: Testimonial[] = [
  {
    id: "t1",
    quote: "We cut roadmap meetings in half. The ranked list ends the loudest-voice-wins debate before it starts.",
    author: "Priya Raman",
    role: "VP Product, Northbeam"
  },
  {
    id: "t2",
    quote: "Closing the loop automatically turned our feature launches into renewal conversations.",
    author: "Dan Okafor",
    role: "Head of Customer Success, Relay"
  },
  {
    id: "t3",
    quote: "Sales finally trusts the roadmap because they can see their deals' requests moving through it.",
    author: "Mara Lindqvist",
    role: "CRO, Fieldstone"
  }
];

export const pricingTiers: PricingTier[] = [
  {
    id: "starter",
    name: "Starter",
    price: "$0",
    cadence: "monthly",
    features: ["1 feedback source", "Up to 200 requests", "Internal roadmap board", "Community support"],
    highlighted: false,
    ctaLabel: "Get started"
  },
  {
    id: "growth",
    name: "Growth",
    price: "$49",
    cadence: "monthly",
    features: [
      "Unlimited feedback sources",
      "Revenue-weighted ranking",
      "Public roadmap + changelog",
      "Close-the-loop notifications",
      "Priority support"
    ],
    highlighted: true,
    ctaLabel: "Start free trial"
  },
  {
    id: "scale",
    name: "Scale",
    price: "$199",
    cadence: "monthly",
    features: ["Everything in Growth", "SSO & roles", "Multiple workspaces", "Custom integrations", "Dedicated onboarding"],
    highlighted: false,
    ctaLabel: "Talk to sales"
  }
];

export const faqs: Faq[] = [
  {
    id: "q1",
    question: "How do feedback sources connect?",
    answer:
      "Each plan includes native connectors for support and survey tools plus an in-app widget; you can also forward email or import a CSV."
  },
  {
    id: "q2",
    question: "Can customers see our internal notes?",
    answer: "No. The public roadmap shows only the fields you choose; internal scoring and account data stay private."
  },
  {
    id: "q3",
    question: "What happens after the 14-day trial?",
    answer: "You drop to the Starter plan automatically — no card required, nothing is deleted."
  },
  {
    id: "q4",
    question: "Do you support self-serve data export?",
    answer: "Yes. Every plan can export requests, votes, and decisions as CSV at any time."
  }
];

export const navLinks = [
  { label: "Features", href: "#features" },
  { label: "Customers", href: "#social-proof" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" }
];
