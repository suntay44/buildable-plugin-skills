import { tagCounts } from "@/lib/note-utils";
import type { Note, NoteFilters } from "@/types/note";

type Props = {
  notes: Note[];
  collections: string[];
  tags: string[];
  filters: NoteFilters;
  onChange: (filters: NoteFilters) => void;
  onNewNote: () => void;
};

export function NoteSidebar({ notes, collections, tags, filters, onChange, onNewNote }: Props) {
  const counts = tagCounts(notes);

  return (
    <aside aria-label="Filters" className="grid gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <button onClick={onNewNote} className="h-11 rounded-md bg-ocean px-4 font-semibold text-white hover:bg-blue-700" type="button">
        + New note
      </button>

      <label className="grid gap-1 text-sm font-medium text-slate-700">
        Search
        <input
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          placeholder="Search notes and tags"
          className="h-11 rounded-md border border-slate-300 px-3 text-base"
        />
      </label>

      <div className="grid gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Collections</p>
        <div className="grid gap-1">
          <SidebarItem label="All notes" active={filters.collection === "all"} onClick={() => onChange({ ...filters, collection: "all" })} />
          {collections.map((collection) => (
            <SidebarItem
              key={collection}
              label={collection}
              active={filters.collection === collection}
              onClick={() => onChange({ ...filters, collection })}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tags</p>
        <div className="flex flex-wrap gap-2">
          <TagChip label="All" active={filters.tag === "all"} onClick={() => onChange({ ...filters, tag: "all" })} />
          {tags.map((tag) => (
            <TagChip
              key={tag}
              label={`${tag} (${counts[tag] ?? 0})`}
              active={filters.tag === tag}
              onClick={() => onChange({ ...filters, tag })}
            />
          ))}
        </div>
      </div>
    </aside>
  );
}

function SidebarItem({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-md px-3 py-2 text-left text-sm font-medium ${active ? "bg-blue-50 text-ocean" : "text-slate-700 hover:bg-slate-50"}`}
    >
      {label}
    </button>
  );
}

function TagChip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-full border px-2.5 py-1 text-xs font-medium ${active ? "border-ocean bg-ocean text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50"}`}
    >
      {label}
    </button>
  );
}
