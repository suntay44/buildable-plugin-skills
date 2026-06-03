# Job Board Data Model

## Entities

```ts
type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: "full-time" | "part-time" | "contract" | "internship";
  remote: boolean;
  salaryLabel: string;
  description: string;
  tags: string[];
  postedAt: string;
};

type Application = {
  id: string;
  jobId: string;
  name: string;
  email: string;
  status: "applied" | "reviewing" | "interview" | "rejected" | "hired";
  submittedAt: string;
};
```

## Derived Values

- jobs filtered by type, location, remote, or search
- saved jobs
- application status counts
- newest-first ordering

## Notes

- Keep applications in local state for a prototype.
- Do not add accounts, payments, or external job-board APIs unless requested.
