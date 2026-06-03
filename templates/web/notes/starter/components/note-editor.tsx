"use client";

import { useEffect, useState } from "react";
import type { Note } from "@/types/note";

type Props = {
  note: Note | null;
  onChange: (note: Note) => void;
  onDelete: (id: string) => void;
  onTogglePin: (id: string) => void;
};

export function NoteEditor({ note, onChange, onDelete, onTogglePin }: Props) {
  const [title, setTitle] = useState(note?.title ?? "");
  const [body, setBody] = useState(note?.body ?? "");
  const [tagText, setTagText] = useState(note?.tags.join(", ") ?? "");

  useEffect(() => {
    setTitle(note?.title ?? "");
    setBody(note?.body ?? "");
    setTagText(note?.tags.join(", ") ?? "");
  }, [note?.id]);

  if (!note) {
    return (
      <section className="grid place-items-center rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        Select a note on the left, or create a new one to start writing.
      </section>
    );
  }

  function commit(next: Partial<Note>) {
    if (!note) return;
    onChange({ ...note, ...next, updatedAt: new Date().toISOString().slice(0, 10) });
  }

  function commitTags(value: string) {
    const tags = value
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
    commit({ tags });
  }

  return (
    <section aria-label="Note editor" className="grid gap-3 rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <input
          aria-label="Note title"
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            commit({ title: event.target.value });
          }}
          placeholder="Note title"
          className="w-full rounded-md border border-transparent px-1 text-xl font-semibold text-ink focus:border-slate-300"
        />
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onTogglePin(note.id)}
            aria-pressed={note.pinned}
            className={`rounded-md border px-3 py-1.5 text-sm font-semibold ${note.pinned ? "border-amber text-amber" : "border-slate-300 text-slate-600"}`}
          >
            {note.pinned ? "★ Pinned" : "☆ Pin"}
          </button>
          <button
            type="button"
            onClick={() => onDelete(note.id)}
            className="rounded-md border border-red-200 px-3 py-1.5 text-sm font-semibold text-coral"
          >
            Delete
          </button>
        </div>
      </div>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Tags (comma separated)
        <input
          value={tagText}
          onChange={(event) => {
            setTagText(event.target.value);
            commitTags(event.target.value);
          }}
          placeholder="product, planning"
          className="h-10 rounded-md border border-slate-300 px-3 text-base"
        />
      </label>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Body
        <textarea
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
            commit({ body: event.target.value });
          }}
          rows={14}
          placeholder="Start writing…"
          className="rounded-md border border-slate-300 px-3 py-2 text-base leading-7"
        />
      </label>

      <p className="text-xs text-slate-400">Collection: {note.collection} · Updated {note.updatedAt}</p>
    </section>
  );
}
