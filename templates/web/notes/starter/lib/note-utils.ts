import type { Note, NoteFilters } from "@/types/note";

export function filterNotes(notes: Note[], filters: NoteFilters) {
  const query = filters.query.trim().toLowerCase();

  return notes
    .filter((note) => {
      const collectionMatch = filters.collection === "all" || note.collection === filters.collection;
      const tagMatch = filters.tag === "all" || note.tags.includes(filters.tag);
      const queryMatch =
        query.length === 0 ||
        note.title.toLowerCase().includes(query) ||
        note.body.toLowerCase().includes(query) ||
        note.tags.some((tag) => tag.toLowerCase().includes(query));

      return collectionMatch && tagMatch && queryMatch;
    })
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt));
}

export function collectionsOf(notes: Note[]) {
  return [...new Set(notes.map((note) => note.collection))].sort();
}

export function tagsOf(notes: Note[]) {
  return [...new Set(notes.flatMap((note) => note.tags))].sort();
}

export function tagCounts(notes: Note[]) {
  return notes.flatMap((note) => note.tags).reduce<Record<string, number>>((counts, tag) => {
    counts[tag] = (counts[tag] ?? 0) + 1;
    return counts;
  }, {});
}

export function preview(body: string, length = 120) {
  const flat = body.replace(/\s+/g, " ").trim();
  return flat.length > length ? `${flat.slice(0, length)}…` : flat || "No content yet.";
}

export function today() {
  return new Date().toISOString().slice(0, 10);
}

export function createNoteId() {
  return `note-${Date.now().toString(36)}`;
}
