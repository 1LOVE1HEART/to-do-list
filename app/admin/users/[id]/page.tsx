"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Todo, User } from "@/db/schema";

const priorityLabel: Record<string, string> = { low: "LOW", normal: "MID", high: "HIGH" };

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<{ user: User; todos: Todo[] } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/admin/users/${id}`);
      if (res.ok) setData(await res.json());
      setLoading(false);
    })();
  }, [id]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 9, color: "var(--text-dim)" }}>
          LOADING<span className="cursor-blink" />
        </span>
      </main>
    );
  }

  if (!data) {
    return (
      <main style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <span style={{ fontSize: 9, color: "var(--accent-pink)" }}>404 — PLAYER NOT FOUND</span>
      </main>
    );
  }

  const { user, todos } = data;
  const doneCount = todos.filter((t) => t.done).length;

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div style={{ fontSize: 12, color: "var(--accent-cyan)", letterSpacing: 2 }}>
            {user.username.toUpperCase()}
          </div>
          <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 4 }}>
            {doneCount}/{todos.length} CLEARED &nbsp;|&nbsp;
            {user.isBanned ? (
              <span style={{ color: "var(--accent-pink)" }}>BANNED</span>
            ) : (
              <span style={{ color: "var(--accent-green)" }}>ACTIVE</span>
            )}
            &nbsp;|&nbsp;{user.role.toUpperCase()}
          </div>
        </div>
        <Link href="/admin" className="pixel-btn pixel-btn-ghost" style={{ fontSize: 7 }}>
          ← BACK
        </Link>
      </div>

      {/* Todos (read-only) */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {todos.length === 0 ? (
          <div className="pixel-box" style={{ padding: 40, textAlign: "center", fontSize: 9, color: "var(--text-muted)" }}>
            NO QUESTS
          </div>
        ) : (
          todos.map((todo) => (
            <div
              key={todo.id}
              className="pixel-box"
              style={{
                padding: "12px 16px",
                opacity: todo.done ? 0.5 : 1,
              }}
            >
              <div className="flex items-center gap-2">
                <div className={`pixel-checkbox ${todo.done ? "checked" : ""}`} style={{ cursor: "default" }} />
                <span
                  style={{
                    flex: 1,
                    fontSize: 9,
                    textDecoration: todo.done ? "line-through" : "none",
                    wordBreak: "break-word",
                  }}
                >
                  {todo.title}
                </span>
                <div className="flex gap-2" style={{ flexShrink: 0 }}>
                  <span className={`priority-badge priority-${todo.priority}`}>
                    {priorityLabel[todo.priority]}
                  </span>
                  {todo.dueDate && (
                    <span style={{ fontSize: 7, color: "var(--text-dim)" }}>{todo.dueDate}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  );
}
