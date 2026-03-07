"use client";

import { useState } from "react";
import { Todo } from "@/db/schema";
import PixelModal from "./PixelModal";
import { useToast } from "./Toast";

interface Props {
  todo: Todo;
  onUpdate: (updated: Todo) => void;
  onDelete: (id: string) => void;
}

const priorityLabel: Record<string, string> = { low: "Low", normal: "Normal", high: "High" };

export default function TodoItem({ todo, onUpdate, onDelete }: Props) {
  const { toast } = useToast();
  const [editing, setEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(todo.title);
  const [editPriority, setEditPriority] = useState(todo.priority);
  const [editDueDate, setEditDueDate] = useState(todo.dueDate ?? "");
  const [loading, setLoading] = useState(false);

  async function toggleDone() {
    setLoading(true);
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ done: !todo.done }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
      toast(updated.done ? "Completed! ✓" : "Marked active");
    } else {
      toast("Update failed", "error");
    }
    setLoading(false);
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim(), priority: editPriority, dueDate: editDueDate || null }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
      setEditing(false);
      toast("Saved");
    } else {
      toast("Update failed", "error");
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/todos/${todo.id}`, { method: "DELETE" });
    if (res.ok) {
      onDelete(todo.id);
      toast("Deleted");
    } else {
      toast("Delete failed", "error");
    }
    setLoading(false);
  }

  const isOverdue =
    todo.dueDate &&
    !todo.done &&
    new Date(todo.dueDate) < new Date(new Date().toDateString());

  return (
    <>
      <div
        className="card"
        style={{
          padding: "12px 16px",
          opacity: loading ? 0.6 : 1,
          transition: "opacity 0.15s",
          ...(isOverdue ? { borderColor: "var(--danger)", borderLeftWidth: 3 } : {}),
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {/* Checkbox */}
          <button
            onClick={toggleDone}
            disabled={loading}
            aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer", flexShrink: 0 }}
          >
            <div className={`check-box ${todo.done ? "checked" : ""}`} />
          </button>

          {/* Title */}
          <span
            style={{
              flex: 1,
              fontSize: "0.9rem",
              wordBreak: "break-word",
              color: todo.done ? "var(--text-3)" : "var(--text)",
              textDecoration: todo.done ? "line-through" : "none",
            }}
          >
            {todo.title}
          </span>

          {/* Badges & date */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
            {todo.dueDate && (
              <span style={{
                fontSize: "0.73rem",
                color: isOverdue ? "var(--danger)" : "var(--text-3)",
                fontWeight: isOverdue ? 600 : 400,
              }}>
                {todo.dueDate}
              </span>
            )}
            <span className={`badge badge-${todo.priority}`}>
              {priorityLabel[todo.priority] ?? todo.priority}
            </span>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
            <button
              onClick={() => setEditing(true)}
              disabled={loading}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Edit"
              title="Edit"
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="btn btn-ghost btn-icon btn-sm"
              aria-label="Delete"
              title="Delete"
              style={{ color: "var(--danger)" }}
            >
              🗑
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <PixelModal title="Edit Task" onClose={() => setEditing(false)}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label className="label">Task title</label>
              <textarea
                className="input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
            <div style={{ display: "flex", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <label className="label">Priority</label>
                <select
                  className="select"
                  style={{ width: "100%" }}
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="label">Due date</label>
                <input
                  type="date"
                  className="input"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 4 }}>
              <button onClick={() => setEditing(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button onClick={saveEdit} disabled={loading || !editTitle.trim()} className="btn btn-primary">
                Save changes
              </button>
            </div>
          </div>
        </PixelModal>
      )}
    </>
  );
}
