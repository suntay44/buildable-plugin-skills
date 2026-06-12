import type { Job, JobFilters, JobType } from "@/types/job";

export const typeLabels: Record<JobType, string> = {
  "full-time": "Full-time",
  "part-time": "Part-time",
  contract: "Contract",
  internship: "Internship"
};

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  const query = filters.query.trim().toLowerCase();
  return jobs
    .filter((job) => (filters.type === "all" ? true : job.type === filters.type))
    .filter((job) => (filters.remoteOnly ? job.remote : true))
    .filter((job) =>
      query === ""
        ? true
        : [job.title, job.company, job.location, ...job.tags].some((value) => value.toLowerCase().includes(query))
    )
    .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
}

export function formatPosted(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
