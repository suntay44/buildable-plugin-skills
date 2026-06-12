"use client";

import { categoriesOf, countByStatus, filterPosts, formatDate, statusLabels } from "@/lib/post-utils";
import type { Post, PostFilters, PostStatus } from "@/types/post";

type Props = {
  posts: Post[];
  filters: PostFilters;
  selectedId: string | null;
  onFilters: (filters: PostFilters) => void;
  onSelect: (id: string) => void;
  onCreate: () => void;
};

const statusTone: Record<PostStatus, string> = {
  draft: "bg-slate-100 text-slate-600",
  scheduled: "bg-amber/10 text-amber",
  published: "bg-meadow/10 text-meadow"
};

export function PostList({ posts, filters, selectedId, onFilters, onSelect, onCreate }: Props) {
  const visible = filterPosts(posts, filters);
  const counts = countByStatus(posts);
  const categories = categoriesOf(posts);

  return (
    <section aria-label="Post list" className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold text-ink">
          Posts <span className="font-normal text-slate-500">({visible.length} shown)</span>
        </h2>
        <button
          type="button"
          onClick={onCreate}
          className="rounded-md bg-meadow px-3 py-2 text-sm font-semibold text-white hover:bg-meadow/90"
        >
          New post
        </button>
      </div>

      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Search posts
          <input
            value={filters.query}
            onChange={(event) => onFilters({ ...filters, query: event.target.value })}
            placeholder="Search title, excerpt, author, or tag"
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Status
            <select
              value={filters.status}
              onChange={(event) => onFilters({ ...filters, status: event.target.value as PostFilters["status"] })}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="all">All ({posts.length})</option>
              <option value="draft">Drafts ({counts.draft})</option>
              <option value="scheduled">Scheduled ({counts.scheduled})</option>
              <option value="published">Published ({counts.published})</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Category
            <select
              value={filters.category}
              onChange={(event) => onFilters({ ...filters, category: event.target.value })}
              className="h-10 rounded-md border border-slate-300 px-3 text-sm"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No posts yet. Create your first post to start the blog.
        </p>
      ) : visible.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          No posts match these filters. Clear the search or filters to see all {posts.length} posts.
        </p>
      ) : (
        <ul className="grid gap-2">
          {visible.map((post) => (
            <li key={post.id}>
              <button
                type="button"
                onClick={() => onSelect(post.id)}
                aria-current={selectedId === post.id}
                className={`grid w-full gap-1 rounded-md border p-3 text-left ${
                  selectedId === post.id ? "border-meadow bg-meadow/5" : "border-slate-200 hover:bg-mist"
                }`}
              >
                <span className="flex items-start justify-between gap-2">
                  <span className="font-medium text-ink">{post.title}</span>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${statusTone[post.status]}`}>
                    {statusLabels[post.status]}
                  </span>
                </span>
                <span className="line-clamp-1 text-sm text-slate-500">{post.excerpt}</span>
                <span className="text-xs text-slate-400">
                  {post.author} · {post.category} · {post.status === "published" ? `Published ${formatDate(post.publishedAt)}` : `Updated ${formatDate(post.updatedAt)}`}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
