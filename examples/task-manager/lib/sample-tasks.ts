import type { Task } from "@/types/task";

export const sampleTasks: Task[] = [
  {
    id: "task-1",
    title: "Finalize homepage feedback",
    description: "Review comments from the stakeholder pass and close the copy decisions.",
    status: "in-progress",
    priority: "high",
    dueDate: "2026-06-01",
    tags: ["client", "design"],
    createdAt: "2026-05-28",
    updatedAt: "2026-05-31"
  },
  {
    id: "task-2",
    title: "Draft onboarding checklist",
    description: "Capture the first-run tasks a new user should complete.",
    status: "todo",
    priority: "medium",
    dueDate: "2026-06-03",
    tags: ["product"],
    createdAt: "2026-05-29",
    updatedAt: "2026-05-29"
  },
  {
    id: "task-3",
    title: "Send invoice package",
    description: "Attach the May statement and confirm payment details.",
    status: "todo",
    priority: "high",
    dueDate: "2026-05-30",
    tags: ["admin"],
    createdAt: "2026-05-27",
    updatedAt: "2026-05-30"
  },
  {
    id: "task-4",
    title: "Archive completed research notes",
    description: "Move approved discovery notes into the shared knowledge folder.",
    status: "done",
    priority: "low",
    dueDate: "2026-05-31",
    tags: ["research"],
    createdAt: "2026-05-25",
    updatedAt: "2026-05-31"
  },
  {
    id: "task-5",
    title: "Prepare sprint planning agenda",
    description: "Collect candidate tasks and flag blockers before planning.",
    status: "todo",
    priority: "medium",
    dueDate: "2026-06-05",
    tags: ["team", "planning"],
    createdAt: "2026-05-31",
    updatedAt: "2026-05-31"
  }
];
