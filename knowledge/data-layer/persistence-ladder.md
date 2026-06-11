# Persistence Ladder

Buildable apps are local-first by default. When a user asks to **save**, **persist**, **remember**, or **store** data, do not reach for a hosted database. Climb the smallest rung of this ladder that satisfies the request, and always put it behind the repository seam (`knowledge/data-layer/repository-pattern.md`) so the choice stays reversible.

## The Ladder

1. **In-memory / local state** (default for prototypes)
   - React state, `useReducer`, or a small store. Data resets on reload.
   - Use when the request is "build the UI/flow" with no durability ask.

2. **Browser-local: `localStorage` / `IndexedDB`**
   - `localStorage` for small, synchronous, serializable state (filters, a list of records).
   - `IndexedDB` (via a tiny wrapper) for larger collections, blobs, or many records.
   - Use when the user wants data to **survive a refresh** with zero backend. This is the default rung for "save my data" on web.

3. **Local file / on-device database**
   - Web/desktop: a local SQLite file (e.g. through a local driver) when relational queries matter.
   - Mobile (Expo): on-device storage (AsyncStorage for key-value, SQLite for relational).
   - Use when there is real relational/query need but still **no network**.

4. **User-owned remote (opt-in only)**
   - A remote database or BaaS the **user explicitly names and owns** (their Postgres, their Supabase project).
   - Only climb here when the user asks for multi-device, multi-user, or shared data — and keep it behind the same repository seam so the app still runs against a local rung in development.

## Rules

- Default to the **lowest rung** that meets the durability ask; do not pre-emptively add a database.
- Never introduce a hosted backend, account system, or paid service the user did not name.
- A user naming a provider (e.g. "use my Supabase") is permission for **rung 4 behind the seam** — not permission to scatter vendor SDK calls through the UI.
- Keep all seed/mock data working at rung 1 so the app runs with zero setup.
- Climbing a rung must change only the repository implementation, never the components or screens.

## Handoff

When persistence is requested, state which rung you chose and why, implement it behind the repository seam, and keep the app runnable with no external services unless the user named one.
