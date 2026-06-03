"use client";

import { preview } from "@/lib/note-utils";
import type { Note } from "@/types/note";

type Props = {
  notes: Note[];
  allNotesCount: number;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onClearFilters: () => void;
};

export function NoteList({ notes, allNotesCount, selectedId, onSelect, onClearFilters }: Props) {
  if (allNotesCount === 0) {
    return (
      <EmptyState
        title="No notes yet"
        body="Create your first note to get started. Your notes stay on this device — no account or sync required."
      />
    );
  }

  if (notes.length === 0) {
    return (
      <EmptyState
        title="No notes match your filters"
        body="Try a different search, collection, or tag."
        action={
          <button onClick={onClearFilters} className="rounded-md bg-ink px-4 py-2 text-sm font-semibold text-white">
            Clear filters
          </button>
        }
      />
    );
  }

  return (
    <section aria-label="Notes" className="grid gap-2">
      {notes.map((note) => {
        const selected = note.id === selectedId;
        return (
          <button
            key={note.id}
            type="button"
            onClick={() => onSelect(note.id)}
            aria-pressed={selected}
            className={`rounded-lg border p-4 text-left shadow-sm transition-colors ${
              selected ? "border-ocean bg-blue-50/50" : "border-slate-200 bg-white hover:bg-slate-50"
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <h2 className="truncate font-semibold text-ink">{note.title || "Untitled note"}</h2>
              {note.pinned ? <span className="text-xs font-medium text-amber">★ Pinned</span> : null}
            </div>
            <p className="mt-1 line-clamp-2 text-sm text-slate-600">{preview(note.body)}</p>
            <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
              <span className="rounded-full bg-mist px-2 py-0.5 text-slate-600">{note.collection}</span>
              {note.tags.map((tag) => (
                <span key={tag} className="rounded-full bg-blue-50 px-2 py-0.5 text-ocean">
                  {tag}
                </span>
              ))}
              <span className="ml-auto text-slate-400">{note.updatedAt}</span>
            </div>
          </button>
        );
      })}
    </section>
  );
}

function EmptyState({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-dashed border-slate-300 bg-white p-8 text-center">
      <h2 className="text-lg font-semibold text-ink">{title}</h2>
      <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">{body}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </section>
  );
}
