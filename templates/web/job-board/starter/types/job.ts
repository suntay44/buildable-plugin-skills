export type JobType = "full-time" | "part-time" | "contract" | "internship";

export type Job = {
  id: string;
  title: string;
  company: string;
  location: string;
  type: JobType;
  remote: boolean;
  salaryLabel: string;
  description: string;
  tags: string[];
  postedAt: string;
};

export type JobFilters = {
  query: string;
  type: "all" | JobType;
  remoteOnly: boolean;
};

export type Application = {
  name: string;
  email: string;
  note: string;
};
