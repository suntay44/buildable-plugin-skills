export type PostStatus = "draft" | "scheduled" | "published";

export type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  category: string;
  tags: string[];
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
};

export type PostFilters = {
  query: string;
  status: "all" | PostStatus;
  category: string;
};
