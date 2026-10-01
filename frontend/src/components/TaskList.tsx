import { useState } from "react";
import type { Task } from "../types/task";
import { TaskItem } from "./TaskItem";

interface TaskListProps {
  tasks: Task[];
  loading: boolean;
  onToggleStatus: (task: Task) => void;
  onDelete: (task: Task) => void;
  busyTaskId: number | null;
}

export function TaskList({ tasks, loading, onToggleStatus, onDelete, busyTaskId }: TaskListProps) {
  // Lifted here (not per-item) so only one task can be in edit mode at a time.
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null);

  if (loading) {
    return <p role="status">Loading tasks…</p>;
  }

  if (tasks.length === 0) {
    return <p>No tasks yet. Add one above.</p>;
  }

  return (
    <ul className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onToggleStatus={onToggleStatus}
          onDelete={onDelete}
          disabled={busyTaskId === task.id}
          isEditing={editingTaskId === task.id}
          onStartEdit={setEditingTaskId}
        />
      ))}
    </ul>
  );
}
