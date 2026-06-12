"use client";

import { useState } from "react";
import { PostEditor } from "@/components/post-editor";
import { PostList } from "@/components/post-list";
import { samplePosts } from "@/lib/sample-posts";
import type { Post, PostFilters } from "@/types/post";

const emptyFilters: PostFilters = { query: "", status: "all", category: "all" };

function newPost(): Post {
  const now = new Date().toISOString();
  return {
    id: `p-${Date.now()}`,
    title: "Untitled post",
    slug: "untitled-post",
    excerpt: "",
    body: "",
    author: "Maya Castillo",
    category: "Product",
    tags: [],
    status: "draft",
    publishedAt: null,
    updatedAt: now
  };
}

export default function BlogWorkspace() {
  const [posts, setPosts] = useState<Post[]>(samplePosts);
  const [filters, setFilters] = useState<PostFilters>(emptyFilters);
  const [selectedId, setSelectedId] = useState<string | null>(samplePosts[0]?.id ?? null);

  const selected = posts.find((post) => post.id === selectedId) ?? null;

  const createPost = () => {
    const post = newPost();
    setPosts((current) => [post, ...current]);
    setSelectedId(post.id);
    setFilters(emptyFilters);
  };

  const updatePost = (updated: Post) =>
    setPosts((current) => current.map((post) => (post.id === updated.id ? updated : post)));

  const togglePublish = (id: string) =>
    setPosts((current) =>
      current.map((post) =>
        post.id === id
          ? post.status === "published"
            ? { ...post, status: "draft", publishedAt: null, updatedAt: new Date().toISOString() }
            : { ...post, status: "published", publishedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : post
      )
    );

  const deletePost = (id: string) => {
    setPosts((current) => current.filter((post) => post.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  };

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6">
        <header className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-ink">Editorial</h1>
            <p className="text-sm text-slate-500">
              Write, edit, and publish posts — drafts, scheduled, and published, all local.
            </p>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-start">
          <PostList
            posts={posts}
            filters={filters}
            selectedId={selectedId}
            onFilters={setFilters}
            onSelect={setSelectedId}
            onCreate={createPost}
          />
          <PostEditor post={selected} onChange={updatePost} onPublishToggle={togglePublish} onDelete={deletePost} />
        </div>
      </div>
    </main>
  );
}
