import type { Post, PostFilters, PostStatus } from "@/types/post";

export const statusLabels: Record<PostStatus, string> = {
  draft: "Draft",
  scheduled: "Scheduled",
  published: "Published"
};

export function filterPosts(posts: Post[], filters: PostFilters): Post[] {
  const query = filters.query.trim().toLowerCase();
  return posts
    .filter((post) => (filters.status === "all" ? true : post.status === filters.status))
    .filter((post) => (filters.category === "all" ? true : post.category === filters.category))
    .filter((post) =>
      query === ""
        ? true
        : [post.title, post.excerpt, post.author, ...post.tags].some((value) => value.toLowerCase().includes(query))
    )
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function categoriesOf(posts: Post[]): string[] {
  return [...new Set(posts.map((post) => post.category))].sort();
}

export function countByStatus(posts: Post[]): Record<PostStatus, number> {
  return {
    draft: posts.filter((post) => post.status === "draft").length,
    scheduled: posts.filter((post) => post.status === "scheduled").length,
    published: posts.filter((post) => post.status === "published").length
  };
}

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
