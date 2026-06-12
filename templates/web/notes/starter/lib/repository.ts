// The Buildable repository seam (knowledge/data-layer/repository-pattern.md):
// components depend on this interface, never on a storage engine. Swapping the
// persistence rung (in-memory -> localStorage -> SQLite -> a user-owned remote)
// changes only the factory wired in `notesRepository` below.
export interface Repository<T extends { id: string }> {
  load(): T[];
  saveAll(items: T[]): void;
}

// Rung 2 of the persistence ladder: browser-local storage, seeded from sample
// data on first run, SSR-safe (returns the seed until the browser is available).
export function createLocalRepository<T extends { id: string }>(storageKey: string, seed: T[]): Repository<T> {
  return {
    load() {
      if (typeof window === "undefined") return seed;
      try {
        const raw = window.localStorage.getItem(storageKey);
        return raw ? (JSON.parse(raw) as T[]) : seed;
      } catch {
        return seed;
      }
    },
    saveAll(items) {
      if (typeof window === "undefined") return;
      try {
        window.localStorage.setItem(storageKey, JSON.stringify(items));
      } catch {
        // Storage may be unavailable (private mode, quota); the app keeps working in memory.
      }
    }
  };
}
