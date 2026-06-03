# Blog/CMS Data Model

## Entities

```ts
type PostStatus = "draft" | "scheduled" | "published";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  category: string;
  tags: string[];
  status: PostStatus;
  publishedAt: string | null;
  updatedAt: string;
};
```

## Derived Values

- posts filtered by status, category, or search
- scheduled vs published counts
- most-recently-updated ordering
- tag and category counts

## Notes

- Keep the body as plain text or simple markdown for a local prototype.
- Do not add accounts, a hosted CMS backend, or publishing integrations unless requested.
