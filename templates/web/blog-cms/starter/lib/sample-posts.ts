import type { Post } from "@/types/post";

export const samplePosts: Post[] = [
  {
    id: "p1",
    title: "How we cut onboarding time from 9 minutes to 90 seconds",
    slug: "cut-onboarding-time",
    excerpt: "The aha-moment audit that reshaped our first-run experience, and the three changes that mattered.",
    body: "When we mapped every click between signup and first value, the path was nine minutes long. This post walks through the audit method, the sample-data seeding that removed the empty-dashboard problem, and the progressive-disclosure setup form that did the rest.",
    author: "Maya Castillo",
    category: "Product",
    tags: ["onboarding", "activation"],
    status: "published",
    publishedAt: "2026-05-28T09:00:00.000Z",
    updatedAt: "2026-05-28T09:00:00.000Z"
  },
  {
    id: "p2",
    title: "Design tokens are a contract, not a palette",
    slug: "design-tokens-contract",
    excerpt: "Why token systems fail when they are treated as color lists, and the usage rules that keep them alive.",
    body: "A palette tells you which colors exist. A contract tells you which colors are allowed where, and what happens when someone bypasses them. This post covers the lint rules, review gates, and naming conventions that made our tokens stick across four teams.",
    author: "Dan Okafor",
    category: "Design",
    tags: ["design systems", "tokens"],
    status: "published",
    publishedAt: "2026-05-21T10:00:00.000Z",
    updatedAt: "2026-05-22T08:30:00.000Z"
  },
  {
    id: "p3",
    title: "The case for local-first prototypes",
    slug: "local-first-prototypes",
    excerpt: "Demos that need accounts and databases die in procurement. Local-first prototypes don't.",
    body: "Draft: collect the three customer stories where a zero-setup prototype closed the conversation, and the architecture seam that let us add a real backend later without a rewrite.",
    author: "Maya Castillo",
    category: "Engineering",
    tags: ["local-first", "prototyping"],
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-06-08T16:45:00.000Z"
  },
  {
    id: "p4",
    title: "Q3 changelog roundup",
    slug: "q3-changelog-roundup",
    excerpt: "Every shipped feature from the quarter, with the customer requests that drove each one.",
    body: "Scheduled for the first Monday of the quarter: the roundup format pairs each feature with the request thread that started it, closing the loop publicly.",
    author: "Priya Raman",
    category: "Company",
    tags: ["changelog"],
    status: "scheduled",
    publishedAt: "2026-07-06T09:00:00.000Z",
    updatedAt: "2026-06-05T11:20:00.000Z"
  },
  {
    id: "p5",
    title: "Reading list: data-dense dashboard design",
    slug: "reading-list-dashboards",
    excerpt: "Seven pieces that shaped how we think about scan efficiency, deltas, and comparison views.",
    body: "Draft: annotate each link with the one idea we stole from it. Current list covers fixed comparison views, metric context, and why configurable chart builders fail operators.",
    author: "Dan Okafor",
    category: "Design",
    tags: ["dashboards", "reading list"],
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-06-02T14:10:00.000Z"
  },
  {
    id: "p6",
    title: "Interviewing operators: 12 questions that actually work",
    slug: "interviewing-operators",
    excerpt: "The discovery script we use before any dashboard redesign, and what each question surfaces.",
    body: "Published version of the internal research playbook: recurring-question mapping, time-to-answer benchmarks, and how to spot the CSV-export workaround that signals a failed information architecture.",
    author: "Priya Raman",
    category: "Product",
    tags: ["research", "dashboards"],
    status: "published",
    publishedAt: "2026-04-30T09:00:00.000Z",
    updatedAt: "2026-04-30T09:00:00.000Z"
  },
  {
    id: "p7",
    title: "Accessibility regressions are a release problem",
    slug: "a11y-release-problem",
    excerpt: "Fourteen WCAG failures didn't appear at once — they leaked in one release at a time.",
    body: "Published: how we wired contrast and focus checks into the release gate so regressions surface in review, not in the annual audit.",
    author: "Maya Castillo",
    category: "Engineering",
    tags: ["accessibility", "ci"],
    status: "published",
    publishedAt: "2026-03-18T09:00:00.000Z",
    updatedAt: "2026-03-19T12:00:00.000Z"
  },
  {
    id: "p8",
    title: "Pricing pages that respect the reader",
    slug: "pricing-pages-respect",
    excerpt: "One highlighted tier, real feature lists, and no dark patterns — what converted better and why.",
    body: "Draft: pull the A/B numbers from the marketing site refresh before publishing. Outline covers tier anchoring, honest feature comparison, and the FAQ placement test.",
    author: "Dan Okafor",
    category: "Company",
    tags: ["pricing", "marketing"],
    status: "draft",
    publishedAt: null,
    updatedAt: "2026-05-30T09:40:00.000Z"
  }
];
