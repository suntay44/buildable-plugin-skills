"use client";

import { useState } from "react";
import { priorityLabels, statusLabels } from "@/lib/task-utils";
import type { Task, TaskStatus } from "@/types/task";

type Props = {
  task: Task;
  onUpdate: (task: Task) => void;
  onDelete: (id: string) => void;
};

export function TaskCard({ task, onUpdate, onDelete }: Props) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);

  function save() {
    if (!title.trim()) return;
    onUpdate({ ...task, title: title.trim(), description: description.trim(), updatedAt: new Date().toISOString().slice(0, 10) });
    setEditing(false);
  }

  function setStatus(status: TaskStatus) {
    onUpdate({ ...task, status, updatedAt: new Date().toISOString().slice(0, 10) });
  }

  return (
    <article className={`rounded-lg border bg-white p-4 shadow-sm ${task.status === "done" ? "border-slate-200 opacity-75" : "border-slate-200"}`}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          {editing ? (
            <div className="grid gap-2">
              <label className="sr-only" htmlFor={`${task.id}-title`}>
                Task title
              </label>
              <input
                id={`${task.id}-title`}
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-10 rounded-md border border-slate-300 px-3 text-base"
              />
              <label className="sr-only" htmlFor={`${task.id}-description`}>
                Task description
              </label>
              <textarea
                id={`${task.id}-description`}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={3}
                className="rounded-md border border-slate-300 px-3 py-2 text-base"
              />
            </div>
          ) : (
            <>
              <h2 className={`text-lg font-semibold text-ink ${task.status === "done" ? "line-through" : ""}`}>{task.title}</h2>
              <p className="mt-1 text-sm leading-6 text-slate-600">{task.description}</p>
            </>
          )}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-medium">
            <span className="rounded-full bg-mist px-2.5 py-1 text-slate-700">{statusLabels[task.status]}</span>
            <span className="rounded-full bg-amber/10 px-2.5 py-1 text-amber">{priorityLabels[task.priority]}</span>
            {task.dueDate ? <span className="rounded-full bg-slate-100 px-2.5 py-1 text-slate-600">Due {task.dueDate}</span> : null}
            {task.tags.map((tag) => (
              <span key={tag} className="rounded-full bg-emerald-50 px-2.5 py-1 text-meadow">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end">
          {editing ? (
            <>
              <button type="button" onClick={save} className="rounded-md bg-ink px-3 py-2 text-sm font-semibold text-white">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">
                Cancel
              </button>
            </>
          ) : (
            <>
              <button type="button" onClick={() => setStatus(task.status === "done" ? "todo" : "done")} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">
                {task.status === "done" ? "Reopen" : "Complete"}
              </button>
              <button type="button" onClick={() => setEditing(true)} className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold">
                Edit
              </button>
              <button type="button" onClick={() => onDelete(task.id)} className="rounded-md border border-red-200 px-3 py-2 text-sm font-semibold text-coral">
                Delete
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
