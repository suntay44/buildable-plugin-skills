import type { Profile, Project } from "@/types/project";

export const profile: Profile = {
  name: "Maya Castillo",
  tagline: "Product designer who ships — design systems, onboarding flows, and data-heavy dashboards.",
  bio: "I spent the last eight years turning ambiguous product ideas into shipped interfaces at two startups and a design agency. I care about evidence over taste: every project below lists the outcome it moved.",
  skills: ["Design systems", "Onboarding & activation", "Data visualization", "Prototyping", "Design engineering", "Accessibility"],
  contactEmail: "hello@mayacastillo.design",
  socialLinks: [
    { label: "GitHub", href: "https://github.com" },
    { label: "LinkedIn", href: "https://linkedin.com" },
    { label: "Dribbble", href: "https://dribbble.com" }
  ]
};

export const projects: Project[] = [
  {
    id: "p1",
    title: "Atlas design system",
    summary: "Unified 4 product teams on one component library — UI defect reports dropped 38% in two quarters.",
    role: "Lead designer",
    year: 2025,
    tags: ["design systems", "design engineering"],
    featured: true,
    caseStudy: {
      problem: "Four teams shipped four button styles; every release audit found visual drift and accessibility regressions.",
      approach: "Built a tokens-first component library with usage lint rules, migrated screens by traffic priority, and paired with each team's engineers for the first sprint.",
      outcome: "38% fewer UI defects, new screens start from the system by default, and dark mode shipped in a week instead of a quarter."
    }
  },
  {
    id: "p2",
    title: "Lumen onboarding redesign",
    summary: "Rebuilt first-run experience around one aha-moment — activation rose from 22% to 41%.",
    role: "Product designer",
    year: 2025,
    tags: ["onboarding", "growth"],
    featured: true,
    caseStudy: {
      problem: "New users faced an empty dashboard and a 9-field setup form before seeing any value.",
      approach: "Mapped the shortest path to first insight, seeded the workspace with sample data, and moved configuration behind progressive disclosure.",
      outcome: "Activation nearly doubled (22% → 41%) and support tickets about setup fell by half."
    }
  },
  {
    id: "p3",
    title: "Harbor analytics dashboard",
    summary: "Designed a metrics workspace operators actually scan — time-to-answer for the top 5 questions cut from minutes to seconds.",
    role: "Design lead",
    year: 2024,
    tags: ["data visualization", "dashboards"],
    featured: true,
    caseStudy: {
      problem: "Operators exported CSVs because the old dashboard buried comparisons three clicks deep.",
      approach: "Interviewed 12 operators for their top recurring questions, then designed fixed comparison views with deltas and annotations instead of configurable chart soup.",
      outcome: "CSV exports dropped 70%; the five most common questions are now answerable on the first screen."
    }
  },
  {
    id: "p4",
    title: "Relay mobile field app",
    summary: "Touch-first redesign for technicians in gloves — task completion errors down 25%.",
    role: "Product designer",
    year: 2024,
    tags: ["mobile", "field service"],
    featured: false
  },
  {
    id: "p5",
    title: "Fieldstone accessibility audit",
    summary: "Took a B2B suite from 14 WCAG failures to zero criticals; renewals cited it in two enterprise deals.",
    role: "Accessibility consultant",
    year: 2023,
    tags: ["accessibility", "design systems"],
    featured: false
  },
  {
    id: "p6",
    title: "Brightline brand refresh",
    summary: "Editorial identity and marketing site that lifted demo signups 18% without paid spend.",
    role: "Designer",
    year: 2023,
    tags: ["branding", "marketing"],
    featured: false
  }
];

export const allTags = [...new Set(projects.flatMap((project) => project.tags))].sort();
