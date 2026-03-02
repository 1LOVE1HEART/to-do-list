"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Todo } from "@/db/schema";
import TodoItem from "@/components/TodoItem";
import TodoForm from "@/components/TodoForm";
import { useToast } from "@/components/Toast";

type Filter = "all" | "active" | "done";
type SortKey = "createdAt" | "dueDate" | "priority";

const PRIORITY_ORDER: Record<string, number> = { high: 0, normal: 1, low: 2 };

export default function HomePage() {
  const { toast } = useToast();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState("");

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/todos");
      if (res.ok) {
        const data = await res.json();
        setTodos(data);
      } else if (res.status === 401) {
        window.location.href = "/login";
      }
      // Get session user from header or session endpoint
      const sRes = await fetch("/api/auth/session");
      if (sRes.ok) {
        const s = await sRes.json();
        setUsername(s?.user?.username ?? "PLAYER");
      }
      setLoading(false);
    })();
  }, []);

  function handleCreated(todo: Todo) {
    setTodos((prev) => [todo, ...prev]);
  }

  function handleUpdate(updated: Todo) {
    setTodos((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
  }

  function handleDelete(id: string) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "priority") {
      return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
    }
    if (sort === "dueDate") {
      if (!a.dueDate) return 1;
      if (!b.dueDate) return -1;
      return a.dueDate.localeCompare(b.dueDate);
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const doneCount = todos.filter((t) => t.done).length;
  const totalCount = todos.length;

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div style={{ fontSize: 14, color: "var(--accent-green)", letterSpacing: 3, textShadow: "0 0 15px rgba(0,255,136,0.4)" }}>
            TRIPLE PLANCK
          </div>
          <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 4 }}>
            ▶ {username.toUpperCase()}
            <span style={{ color: "var(--text-muted)", marginLeft: 8 }}>
              {doneCount}/{totalCount} CLEARED
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <a
            href="/admin"
            className="pixel-btn pixel-btn-ghost"
            style={{ fontSize: 7, padding: "6px 10px" }}
          >
            ADMIN
          </a>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="pixel-btn pixel-btn-ghost"
            style={{ fontSize: 7, padding: "6px 10px" }}
          >
            LOG OUT
          </button>
        </div>
      </div>

      {/* Score bar */}
      {totalCount > 0 && (
        <div
          style={{
            height: 6,
            background: "var(--bg-card)",
            border: "1px solid var(--border)",
            marginBottom: 24,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${(doneCount / totalCount) * 100}%`,
              background: "var(--accent-green)",
              boxShadow: "0 0 8px var(--accent-green)",
              transition: "width 0.4s ease",
            }}
          />
        </div>
      )}

      {/* Add Form */}
      <div className="mb-6">
        <TodoForm onCreated={handleCreated} />
      </div>

      {/* Controls */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        {/* Filter */}
        <div className="flex gap-1">
          {(["all", "active", "done"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`filter-tab ${filter === f ? "active" : ""}`}
            >
              {f === "all" ? "ALL" : f === "active" ? "ACTIVE" : "CLEARED"}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex items-center gap-2">
          <span className="pixel-label" style={{ margin: 0 }}>SORT:</span>
          <select
            className="pixel-select"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
          >
            <option value="createdAt">NEWEST</option>
            <option value="priority">PRIORITY</option>
            <option value="dueDate">DUE DATE</option>
          </select>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", paddingTop: 60, color: "var(--text-dim)", fontSize: 9 }}>
          LOADING<span className="cursor-blink" />
        </div>
      ) : sorted.length === 0 ? (
        <div
          className="pixel-box"
          style={{
            padding: 40,
            textAlign: "center",
            color: "var(--text-muted)",
            fontSize: 9,
          }}
        >
          {filter === "all"
            ? "NO QUESTS YET. ADD ONE ABOVE."
            : filter === "active"
              ? "ALL QUESTS CLEARED!"
              : "NO CLEARED QUESTS."}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Stats */}
      {totalCount > 0 && (
        <div
          style={{
            marginTop: 24,
            fontSize: 8,
            color: "var(--text-muted)",
            display: "flex",
            gap: 16,
            justifyContent: "center",
          }}
        >
          <span>
            HIGH:{" "}
            <span className="text-pink">
              {todos.filter((t) => t.priority === "high" && !t.done).length}
            </span>
          </span>
          <span>
            MID:{" "}
            <span className="text-yellow">
              {todos.filter((t) => t.priority === "normal" && !t.done).length}
            </span>
          </span>
          <span>
            LOW:{" "}
            <span className="text-cyan">
              {todos.filter((t) => t.priority === "low" && !t.done).length}
            </span>
          </span>
        </div>
      )}
    </main>
  );
}
