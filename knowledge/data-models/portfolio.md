# Portfolio Data Model

## Entities

```ts
type Project = {
  id: string;
  title: string;
  summary: string;
  role: string;
  year: number;
  tags: string[];
  accentColor?: string;
  caseStudy?: {
    problem: string;
    approach: string;
    outcome: string;
  };
  featured: boolean;
};

type Profile = {
  name: string;
  tagline: string;
  bio: string;
  skills: string[];
  contactEmail: string;
  socialLinks: { label: string; href: string }[];
};
```

## Derived Values

- featured projects first, then by year descending
- projects filtered by tag
- distinct tag list for the filter row

## Notes

- Project summaries are specific outcomes ("Cut onboarding time 40%"), not duties.
- The contact CTA uses `Profile.contactEmail`; no contact-form backend unless requested.
- Case studies are optional per project; the grid card must stand alone without one.
