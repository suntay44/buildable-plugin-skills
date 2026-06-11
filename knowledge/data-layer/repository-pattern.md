# Repository Seam

The repository seam is the one pattern that makes Buildable's persistence story vendor-neutral and reversible. The UI depends on an **interface**, never on a storage engine. Swapping rungs on the persistence ladder (`knowledge/data-layer/persistence-ladder.md`) changes one file — the implementation — and never touches a component.

## The Interface

Define a typed contract per entity. Components call only this:

```ts
// lib/repository.ts
export interface Repository<T extends { id: string }> {
  list(): Promise<T[]>;
  get(id: string): Promise<T | null>;
  create(input: Omit<T, "id">): Promise<T>;
  update(id: string, patch: Partial<T>): Promise<T>;
  remove(id: string): Promise<void>;
}
```

## Implementations Are Interchangeable

Each rung is one implementation of the same interface:

```ts
// rung 1-2: runs with zero backend, seeded from local sample data
export function createLocalRepository<T extends { id: string }>(key: string, seed: T[]): Repository<T> { /* localStorage/IndexedDB */ }

// rung 4: only when the user names and owns the backend
export function createRemoteRepository<T extends { id: string }>(table: string): Repository<T> { /* the user's database, behind the same interface */ }
```

The app wires one factory in a single place (e.g. `lib/data.ts`); switching rung is a one-line change there.

## Rules

- Components, screens, and hooks import the **interface and the wired instance** — never a storage SDK directly.
- Keep methods async (`Promise`) even at local rungs, so climbing to a remote rung needs no signature changes.
- Seed every repository from the existing local sample data so the app runs immediately with no setup.
- Validation, sorting, and filtering live in the UI/domain layer, not inside a specific storage engine, so they survive a rung change.
- Do not leak vendor types (no `SupabaseClient`, no ORM row types) past the repository boundary.

## Why This Beats a Hosted Builder

The user owns the seam. They can start fully local, demo with zero accounts, and later point rung 4 at **their own** database without a rewrite or lock-in. `buildable review` keeps this honest: unrequested hosted vendors are flagged unless the spec recorded that the user opted into that backend.
