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

const priorityLabel: Record<string, string> = {
  low: "LOW",
  normal: "MID",
  high: "HIGH",
};

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
      toast(updated.done ? "完成！" : "取消完成");
    } else {
      toast("更新失敗", "error");
    }
    setLoading(false);
  }

  async function saveEdit() {
    if (!editTitle.trim()) return;
    setLoading(true);
    const res = await fetch(`/api/todos/${todo.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editTitle.trim(),
        priority: editPriority,
        dueDate: editDueDate || null,
      }),
    });
    if (res.ok) {
      const updated = await res.json();
      onUpdate(updated);
      setEditing(false);
      toast("已更新");
    } else {
      toast("更新失敗", "error");
    }
    setLoading(false);
  }

  async function handleDelete() {
    setLoading(true);
    const res = await fetch(`/api/todos/${todo.id}`, { method: "DELETE" });
    if (res.ok) {
      onDelete(todo.id);
      toast("已刪除");
    } else {
      toast("刪除失敗", "error");
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
        className="pixel-box"
        style={{
          padding: "14px 16px",
          opacity: loading ? 0.6 : 1,
          borderColor: todo.done
            ? "var(--border)"
            : isOverdue
              ? "var(--accent-pink)"
              : undefined,
          transition: "opacity 0.15s",
        }}
      >
        <div className="flex items-center gap-2">
          {/* Checkbox */}
          <button
            onClick={toggleDone}
            disabled={loading}
            aria-label={todo.done ? "Mark incomplete" : "Mark complete"}
            style={{ background: "none", border: "none", padding: 0, cursor: "pointer" }}
          >
            <div className={`pixel-checkbox ${todo.done ? "checked" : ""}`} />
          </button>

          {/* Title */}
          <span
            className="flex-1"
            style={{
              fontSize: 9,
              wordBreak: "break-word",
              textDecoration: todo.done ? "line-through" : "none",
              opacity: todo.done ? 0.45 : 1,
              color: "var(--text)",
            }}
          >
            {todo.title}
          </span>

          {/* Badges */}
          <div className="flex items-center gap-2" style={{ flexShrink: 0 }}>
            <span className={`priority-badge priority-${todo.priority}`}>
              {priorityLabel[todo.priority] ?? todo.priority}
            </span>
            {todo.dueDate && (
              <span
                style={{
                  fontSize: 7,
                  color: isOverdue ? "var(--accent-pink)" : "var(--text-dim)",
                }}
              >
                {todo.dueDate}
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={() => setEditing(true)}
              disabled={loading}
              className="pixel-btn pixel-btn-cyan"
              style={{ padding: "4px 8px", fontSize: 7 }}
              aria-label="Edit"
            >
              EDIT
            </button>
            <button
              onClick={handleDelete}
              disabled={loading}
              className="pixel-btn pixel-btn-pink"
              style={{ padding: "4px 8px", fontSize: 7 }}
              aria-label="Delete"
            >
              DEL
            </button>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <PixelModal title="Edit Quest" onClose={() => setEditing(false)}>
          <div className="flex flex-col gap-4">
            <div>
              <label className="pixel-label">任務內容</label>
              <textarea
                className="pixel-input"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                rows={3}
                style={{ resize: "vertical" }}
              />
            </div>
            <div className="flex gap-4">
              <div style={{ flex: 1 }}>
                <label className="pixel-label">優先度</label>
                <select
                  className="pixel-select w-full"
                  value={editPriority}
                  onChange={(e) => setEditPriority(e.target.value as any)}
                >
                  <option value="low">LOW</option>
                  <option value="normal">NORMAL</option>
                  <option value="high">HIGH</option>
                </select>
              </div>
              <div style={{ flex: 1 }}>
                <label className="pixel-label">到期日</label>
                <input
                  type="date"
                  className="pixel-input"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <button
                onClick={() => setEditing(false)}
                className="pixel-btn pixel-btn-ghost"
              >
                CANCEL
              </button>
              <button
                onClick={saveEdit}
                disabled={loading || !editTitle.trim()}
                className="pixel-btn pixel-btn-green"
              >
                SAVE
              </button>
            </div>
          </div>
        </PixelModal>
      )}
    </>
  );
}
