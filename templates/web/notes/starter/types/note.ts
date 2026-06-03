export type Note = {
  id: string;
  title: string;
  body: string;
  tags: string[];
  collection: string;
  pinned: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteFilters = {
  collection: "all" | string;
  tag: "all" | string;
  query: string;
};
