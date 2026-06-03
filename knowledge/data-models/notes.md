# Notes Data Model

## Entities

```ts
type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  collection: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

type Collection = {
  id: string;
  name: string;
};
```

## Derived Values

- notes filtered by search query
- notes filtered by tag or collection
- pinned notes first
- tag counts
- last-updated ordering

## Notes

- Keep the body as plain text or simple markdown for a local prototype.
- Do not add sync, accounts, or a hosted database unless requested.
