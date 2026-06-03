"use client";

import { useMemo, useState } from "react";
import { NoteEditor } from "@/components/note-editor";
import { NoteList } from "@/components/note-list";
import { NoteSidebar } from "@/components/note-sidebar";
import { collectionsOf, createNoteId, filterNotes, tagsOf, today } from "@/lib/note-utils";
import { sampleNotes } from "@/lib/sample-notes";
import type { Note, NoteFilters } from "@/types/note";

const defaultFilters: NoteFilters = {
  collection: "all",
  tag: "all",
  query: ""
};

export default function Home() {
  const [notes, setNotes] = useState<Note[]>(sampleNotes);
  const [filters, setFilters] = useState<NoteFilters>(defaultFilters);
  const [selectedId, setSelectedId] = useState<string | null>(sampleNotes[0]?.id ?? null);

  const visibleNotes = useMemo(() => filterNotes(notes, filters), [notes, filters]);
  const collections = useMemo(() => collectionsOf(notes), [notes]);
  const tags = useMemo(() => tagsOf(notes), [notes]);
  const selectedNote = notes.find((note) => note.id === selectedId) ?? null;

  function createNote() {
    const now = today();
    const note: Note = {
      id: createNoteId(),
      title: "Untitled note",
      body: "",
      tags: [],
      collection: filters.collection === "all" ? collections[0] ?? "Personal" : filters.collection,
      pinned: false,
      createdAt: now,
      updatedAt: now
    };
    setNotes((current) => [note, ...current]);
    setSelectedId(note.id);
  }

  function updateNote(next: Note) {
    setNotes((current) => current.map((note) => (note.id === next.id ? next : note)));
  }

  function deleteNote(id: string) {
    setNotes((current) => current.filter((note) => note.id !== id));
    setSelectedId((current) => (current === id ? null : current));
  }

  function togglePin(id: string) {
    setNotes((current) => current.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)));
  }

  return (
    <main className="min-h-screen bg-[#f7f8fb] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-6xl gap-6">
        <header className="grid gap-2">
          <p className="text-sm font-semibold uppercase tracking-wide text-ocean">Local-first prototype</p>
          <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <h1 className="text-3xl font-bold text-ink sm:text-4xl">NoteNest</h1>
              <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
                Capture notes, organize them by collection and tag, and edit in place — all stored locally with no account or sync.
              </p>
            </div>
            <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-medium text-ocean">
              {visibleNotes.length} of {notes.length} notes
            </p>
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)_minmax(0,1.2fr)] lg:items-start">
          <NoteSidebar
            notes={notes}
            collections={collections}
            tags={tags}
            filters={filters}
            onChange={setFilters}
            onNewNote={createNote}
          />
          <NoteList
            notes={visibleNotes}
            allNotesCount={notes.length}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onClearFilters={() => setFilters(defaultFilters)}
          />
          <NoteEditor note={selectedNote} onChange={updateNote} onDelete={deleteNote} onTogglePin={togglePin} />
        </div>
      </div>
    </main>
  );
}
