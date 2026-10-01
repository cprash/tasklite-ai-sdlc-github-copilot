import { useEffect, useRef } from "react";
import type { Task } from "../types/task";

interface TaskItemProps {
  task: Task;
  onToggleStatus: (task: Task) => void;
  onDelete: (task: Task) => void;
  disabled: boolean;
  isEditing: boolean;
  onStartEdit: (taskId: number) => void;
}

export function TaskItem({ task, onToggleStatus, onDelete, disabled, isEditing, onStartEdit }: TaskItemProps) {
  const isCompleted = task.status === "COMPLETED";
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing) {
      const input = editInputRef.current;
      if (input) {
        input.focus();
        input.setSelectionRange(input.value.length, input.value.length);
      }
    }
  }, [isEditing]);

  return (
    <li className={`task-item${isCompleted ? " task-item--completed" : ""}${isEditing ? " task-item--editing" : ""}`}>
      {isEditing ? (
        <input
          ref={editInputRef}
          type="text"
          className="task-item__edit-input"
          defaultValue={task.title}
          aria-label="Task title"
        />
      ) : (
        <span className="task-item__title">{task.title}</span>
      )}
      {isCompleted && <span className="task-item__badge">Completed</span>}
      <div className="task-item__actions">
        <button type="button" onClick={() => onStartEdit(task.id)} disabled={disabled}>
          Edit
        </button>
        <button type="button" onClick={() => onToggleStatus(task)} disabled={disabled}>
          {isCompleted ? "Mark Open" : "Mark Complete"}
        </button>
        <button type="button" onClick={() => onDelete(task)} disabled={disabled}>
          Delete
        </button>
      </div>
    </li>
  );
}
