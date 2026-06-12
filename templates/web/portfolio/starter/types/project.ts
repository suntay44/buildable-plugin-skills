export type CaseStudy = {
  problem: string;
  approach: string;
  outcome: string;
};

export type Project = {
  id: string;
  title: string;
  summary: string;
  role: string;
  year: number;
  tags: string[];
  featured: boolean;
  caseStudy?: CaseStudy;
};

export type Profile = {
  name: string;
  tagline: string;
  bio: string;
  skills: string[];
  contactEmail: string;
  socialLinks: { label: string; href: string }[];
};
