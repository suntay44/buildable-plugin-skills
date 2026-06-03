import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { QuickTaskInput } from "@/components/quick-task-input";
import { TaskCard } from "@/components/task-card";
import { TaskFilterBar } from "@/components/task-filter-bar";
import { TaskSummary } from "@/components/task-summary";
import { filterTasks, nextStatus } from "@/lib/task-utils";
import { sampleTasks } from "@/lib/sample-tasks";
import type { Task, TaskFilters } from "@/types/task";

const defaultFilters: TaskFilters = { status: "all", priority: "all", query: "" };

/**
 * Task list with: create task, edit task, delete task, mark complete,
 * reopen task, filter by status, filter by priority, search tasks, and an
 * empty state when filters match nothing.
 */
export default function TasksScreen() {
  const insets = useSafeAreaInsets();
  const [tasks, setTasks] = useState<Task[]>(sampleTasks);
  const [filters, setFilters] = useState<TaskFilters>(defaultFilters);

  const visibleTasks = useMemo(() => filterTasks(tasks, filters), [tasks, filters]);
  const filtering = filters.status !== "all" || filters.priority !== "all" || filters.query.trim().length > 0;

  function createTask(task: Task) {
    setTasks((current) => [task, ...current]);
  }

  function toggleTask(id: string) {
    setTasks((current) => current.map((task) => (task.id === id ? { ...task, status: nextStatus(task.status) } : task)));
  }

  function editTask(next: Task) {
    setTasks((current) => current.map((task) => (task.id === next.id ? next : task)));
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  return (
    <ScrollView className="flex-1 bg-[#f7f8fb]" contentContainerStyle={{ padding: 16, paddingBottom: insets.bottom + 32, gap: 16 }}>
      <TaskSummary tasks={tasks} />
      <QuickTaskInput onCreate={createTask} />
      <TaskFilterBar filters={filters} onChange={setFilters} />

      {visibleTasks.length === 0 ? (
        <View className="items-center rounded-2xl border border-dashed border-slate-300 bg-white p-8">
          <Text className="text-base font-semibold text-ink">{tasks.length === 0 ? "No tasks yet" : "No tasks match your filters"}</Text>
          <Text className="mt-2 text-center text-sm leading-6 text-slate-500">
            {tasks.length === 0
              ? "Add your first task above to get started."
              : filtering
                ? "Try clearing the search or filters to see every task."
                : ""}
          </Text>
        </View>
      ) : (
        <View className="gap-3">
          {visibleTasks.map((task) => (
            <TaskCard key={task.id} task={task} onToggle={toggleTask} onEdit={editTask} onDelete={deleteTask} />
          ))}
        </View>
      )}
    </ScrollView>
  );
}
