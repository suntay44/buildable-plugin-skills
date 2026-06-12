import type { Job } from "@/types/job";

export const sampleJobs: Job[] = [
  {
    id: "j1",
    title: "Senior Frontend Engineer",
    company: "Northbeam",
    location: "San Francisco, CA",
    type: "full-time",
    remote: true,
    salaryLabel: "$165k – $195k",
    description:
      "Own the component system and performance budget for our analytics product. You will pair with design on a tokens-first library and mentor two mid-level engineers.",
    tags: ["React", "TypeScript", "Design systems"],
    postedAt: "2026-06-09"
  },
  {
    id: "j2",
    title: "Product Designer",
    company: "Relay",
    location: "Remote (US)",
    type: "full-time",
    remote: true,
    salaryLabel: "$140k – $170k",
    description:
      "Lead end-to-end design for our field-service mobile app. Comfortable running discovery interviews and shipping production-ready specs.",
    tags: ["Figma", "Mobile", "Research"],
    postedAt: "2026-06-08"
  },
  {
    id: "j3",
    title: "Backend Engineer (Contract)",
    company: "Fieldstone",
    location: "Austin, TX",
    type: "contract",
    remote: false,
    salaryLabel: "$90 – $120 / hr",
    description:
      "Six-month contract to harden our invoicing service and migrate background jobs to a queue. Strong relational-database and observability experience required.",
    tags: ["Node", "SQL", "Queues"],
    postedAt: "2026-06-06"
  },
  {
    id: "j4",
    title: "Customer Success Manager",
    company: "Clarity",
    location: "New York, NY",
    type: "full-time",
    remote: false,
    salaryLabel: "$95k – $120k + comp",
    description:
      "Own a book of mid-market accounts, drive adoption of the roadmap product, and turn feature launches into renewal conversations.",
    tags: ["SaaS", "Onboarding", "Renewals"],
    postedAt: "2026-06-05"
  },
  {
    id: "j5",
    title: "Data Analyst Intern",
    company: "Harbor",
    location: "Remote (US)",
    type: "internship",
    remote: true,
    salaryLabel: "$32 / hr",
    description:
      "Summer internship analyzing operator dashboards. You will build comparison views and ship at least one insight that changes the roadmap.",
    tags: ["SQL", "Dashboards", "Python"],
    postedAt: "2026-06-03"
  },
  {
    id: "j6",
    title: "Part-time Content Designer",
    company: "Brightline",
    location: "Remote (US/EU)",
    type: "part-time",
    remote: true,
    salaryLabel: "$55 – $75 / hr",
    description:
      "20 hours/week owning UX copy and the help center voice. Turn dense feature docs into onboarding that converts.",
    tags: ["UX writing", "Docs", "Onboarding"],
    postedAt: "2026-06-01"
  },
  {
    id: "j7",
    title: "Platform Engineer",
    company: "Northbeam",
    location: "San Francisco, CA",
    type: "full-time",
    remote: false,
    salaryLabel: "$175k – $210k",
    description:
      "Build the internal deploy and preview tooling every product team depends on. You care about fast feedback loops and clear failure messages.",
    tags: ["Go", "CI/CD", "Tooling"],
    postedAt: "2026-05-29"
  },
  {
    id: "j8",
    title: "Sales Engineer (Contract)",
    company: "Relay",
    location: "Chicago, IL",
    type: "contract",
    remote: true,
    salaryLabel: "$85 – $110 / hr",
    description:
      "Three-month contract supporting enterprise evaluations: build demo environments, answer technical objections, and document the integration path.",
    tags: ["Demos", "Integrations", "Enterprise"],
    postedAt: "2026-05-27"
  }
];
