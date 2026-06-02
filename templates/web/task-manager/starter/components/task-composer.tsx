"use client";

import { useState } from "react";
import { createTaskId } from "@/lib/task-utils";
import type { Task, TaskPriority } from "@/types/task";

type Props = {
  onCreate: (task: Task) => void;
};

export function TaskComposer({ onCreate }: Props) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [error, setError] = useState("");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      setError("Add a task title before creating the task.");
      return;
    }

    const now = new Date().toISOString().slice(0, 10);
    onCreate({
      id: createTaskId(),
      title: trimmedTitle,
      description: description.trim() || "No description yet.",
      status: "todo",
      priority,
      dueDate: null,
      tags: ["new"],
      createdAt: now,
      updatedAt: now
    });
    setTitle("");
    setDescription("");
    setPriority("medium");
    setError("");
  }

  return (
    <form onSubmit={submit} className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3">
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Task title
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add a concrete next action"
            className="h-11 rounded-md border border-slate-300 px-3 text-base"
          />
        </label>
        <label className="grid gap-1 text-sm font-medium text-slate-700">
          Description
          <textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Optional context"
            rows={3}
            className="rounded-md border border-slate-300 px-3 py-2 text-base"
          />
        </label>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <label className="grid gap-1 text-sm font-medium text-slate-700">
            Priority
            <select
              value={priority}
              onChange={(event) => setPriority(event.target.value as TaskPriority)}
              className="h-11 rounded-md border border-slate-300 px-3 text-base"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </label>
          <button className="h-11 rounded-md bg-meadow px-5 font-semibold text-white hover:bg-emerald-700" type="submit">
            Add task
          </button>
        </div>
        {error ? <p className="text-sm font-medium text-coral">{error}</p> : null}
      </div>
    </form>
  );
}
