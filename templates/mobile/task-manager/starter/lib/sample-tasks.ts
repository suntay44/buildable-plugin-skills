import type { Task } from "@/types/task";

export const sampleTasks: Task[] = [
  { id: "task-1", title: "Reply to design feedback", notes: "Close out the copy decisions from the stakeholder pass.", status: "in-progress", priority: "high", createdAt: "2026-05-31" },
  { id: "task-2", title: "Plan tomorrow's standup", notes: "Pull blockers and candidate tasks.", status: "todo", priority: "medium", createdAt: "2026-05-31" },
  { id: "task-3", title: "Send invoice", notes: "Attach the May statement.", status: "todo", priority: "high", createdAt: "2026-05-30" },
  { id: "task-4", title: "Water the plants", notes: "", status: "todo", priority: "low", createdAt: "2026-05-30" },
  { id: "task-5", title: "Archive old notes", notes: "Move approved discovery notes to shared.", status: "done", priority: "low", createdAt: "2026-05-29" }
];
