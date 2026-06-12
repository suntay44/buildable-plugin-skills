"use client";

import { slugify, statusLabels } from "@/lib/post-utils";
import type { Post, PostStatus } from "@/types/post";

type Props = {
  post: Post | null;
  onChange: (post: Post) => void;
  onPublishToggle: (id: string) => void;
  onDelete: (id: string) => void;
};

export function PostEditor({ post, onChange, onPublishToggle, onDelete }: Props) {
  if (!post) {
    return (
      <section aria-label="Post editor" className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-12">
        <p className="max-w-xs text-center text-sm text-slate-500">
          Select a post from the list to edit it, or create a new post to start writing.
        </p>
      </section>
    );
  }

  const update = (patch: Partial<Post>) => onChange({ ...post, ...patch, updatedAt: new Date().toISOString() });

  return (
    <section aria-label="Post editor" className="grid content-start gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="text-sm font-semibold text-ink">Editing · {statusLabels[post.status]}</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onPublishToggle(post.id)}
            className="rounded-md bg-meadow px-3 py-2 text-sm font-semibold text-white hover:bg-meadow/90"
          >
            {post.status === "published" ? "Unpublish" : "Publish now"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Delete "${post.title}"? This cannot be undone.`)) onDelete(post.id);
            }}
            className="rounded-md border border-coral/40 px-3 py-2 text-sm font-semibold text-coral hover:bg-coral/5"
          >
            Delete
          </button>
        </div>
      </div>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Title
        <input
          value={post.title}
          onChange={(event) => update({ title: event.target.value, slug: slugify(event.target.value) })}
          className="h-11 rounded-md border border-slate-300 px-3 text-base"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Slug
          <input
            value={post.slug}
            onChange={(event) => update({ slug: event.target.value })}
            className="h-10 rounded-md border border-slate-300 px-3 font-mono text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Author
          <input
            value={post.author}
            onChange={(event) => update({ author: event.target.value })}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Category
          <input
            value={post.category}
            onChange={(event) => update({ category: event.target.value })}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Status
          <select
            value={post.status}
            onChange={(event) => update({ status: event.target.value as PostStatus })}
            className="h-10 rounded-md border border-slate-300 px-3 text-sm"
          >
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Excerpt
        <textarea
          value={post.excerpt}
          onChange={(event) => update({ excerpt: event.target.value })}
          rows={2}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Body
        <textarea
          value={post.body}
          onChange={(event) => update({ body: event.target.value })}
          rows={10}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm leading-relaxed"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Tags <span className="font-normal text-slate-400">(comma separated)</span>
        <input
          value={post.tags.join(", ")}
          onChange={(event) =>
            update({ tags: event.target.value.split(",").map((tag) => tag.trim()).filter(Boolean) })
          }
          className="h-10 rounded-md border border-slate-300 px-3 text-sm"
        />
      </label>
    </section>
  );
}
