"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Todo } from "@/db/schema";
import TodoItem from "@/components/TodoItem";
import TodoForm from "@/components/TodoForm";
import { useToast } from "@/components/Toast";
import Link from "next/link";

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
        setTodos(await res.json());
      } else if (res.status === 401) {
        window.location.href = "/login";
      }
      const sRes = await fetch("/api/auth/session");
      if (sRes.ok) {
        const s = await sRes.json();
        setUsername(s?.user?.username ?? "User");
      }
      setLoading(false);
    })();
  }, []);

  function handleCreated(todo: Todo) { setTodos((p) => [todo, ...p]); }
  function handleUpdate(updated: Todo) { setTodos((p) => p.map((t) => (t.id === updated.id ? updated : t))); }
  function handleDelete(id: string) { setTodos((p) => p.filter((t) => t.id !== id)); }

  const filtered = todos.filter((t) => {
    if (filter === "active") return !t.done;
    if (filter === "done") return t.done;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === "priority") return (PRIORITY_ORDER[a.priority] ?? 1) - (PRIORITY_ORDER[b.priority] ?? 1);
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
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* ── Nav ── */}
      <header style={{
        background: "var(--surface)",
        borderBottom: "1px solid var(--border)",
        padding: "0 24px",
        height: 56,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            Triple Planck
          </span>
          <span style={{
            fontSize: "0.7rem", background: "var(--accent-soft)", color: "var(--accent)",
            padding: "2px 8px", borderRadius: 99, fontWeight: 600,
          }}>
            Tasks
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link href="/portfolio" className="btn btn-ghost btn-sm hide-sm">Portfolio</Link>
          <Link href="/tryon" className="btn btn-ghost btn-sm hide-sm">Fit Check</Link>
          <Link href="/admin" className="btn btn-ghost btn-sm hide-sm">Admin</Link>
          <div style={{
            width: 1, height: 20, background: "var(--border)", margin: "0 4px",
          }} className="hide-sm" />
          <span style={{ fontSize: "0.85rem", color: "var(--text-2)", fontWeight: 500 }} className="hide-sm">
            {username}
          </span>
          <button onClick={() => signOut({ callbackUrl: "/login" })} className="btn btn-secondary btn-sm">
            Sign Out
          </button>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "32px 16px 64px" }}>

        {/* Page header */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
            My Tasks
          </h1>
          {totalCount > 0 && (
            <p style={{ fontSize: "0.85rem", color: "var(--text-2)", marginTop: 4 }}>
              {doneCount} of {totalCount} completed
            </p>
          )}
        </div>

        {/* Progress */}
        {totalCount > 0 && (
          <div className="progress-track" style={{ marginBottom: 28 }}>
            <div
              className="progress-fill"
              style={{ width: `${(doneCount / totalCount) * 100}%` }}
            />
          </div>
        )}

        {/* Add form */}
        <div style={{ marginBottom: 28 }}>
          <TodoForm onCreated={handleCreated} />
        </div>

        {/* Controls */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
          <div style={{ display: "flex", gap: 6 }}>
            {(["all", "active", "done"] as Filter[]).map((f) => (
              <button key={f} onClick={() => setFilter(f)} className={`tab ${filter === f ? "active" : ""}`}>
                {f === "all" ? "All" : f === "active" ? "Active" : "Done"}
                {f === "all" && (
                  <span style={{
                    marginLeft: 6, fontSize: "0.7rem", background: filter === "all" ? "rgba(255,255,255,0.3)" : "var(--surface-2)",
                    color: filter === "all" ? "#fff" : "var(--text-2)",
                    padding: "1px 6px", borderRadius: 99, fontWeight: 600,
                  }}>
                    {totalCount}
                  </span>
                )}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: "0.8rem", color: "var(--text-2)" }}>Sort:</span>
            <select className="select" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} style={{ width: "auto" }}>
              <option value="createdAt">Newest</option>
              <option value="priority">Priority</option>
              <option value="dueDate">Due date</option>
            </select>
          </div>
        </div>

        {/* List */}
        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 0", color: "var(--text-3)", fontSize: "0.85rem" }}>
            Loading…
          </div>
        ) : sorted.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "60px 24px",
            background: "var(--surface)", border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)", color: "var(--text-2)",
          }}>
            <div style={{ fontSize: "2rem", marginBottom: 12 }}>📋</div>
            <p style={{ fontWeight: 600, marginBottom: 6 }}>
              {filter === "all" ? "No tasks yet" : filter === "active" ? "All done! 🎉" : "Nothing completed yet"}
            </p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>
              {filter === "all" && "Add your first task above."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {sorted.map((todo) => (
              <TodoItem key={todo.id} todo={todo} onUpdate={handleUpdate} onDelete={handleDelete} />
            ))}
          </div>
        )}

        {/* Footer stats */}
        {totalCount > 0 && (
          <div style={{
            marginTop: 32, paddingTop: 16, borderTop: "1px solid var(--border)",
            display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap",
          }}>
            {[
              { label: "Urgent", count: todos.filter((t) => t.priority === "high" && !t.done).length, color: "var(--p-high)" },
              { label: "Normal", count: todos.filter((t) => t.priority === "normal" && !t.done).length, color: "var(--p-normal)" },
              { label: "Low", count: todos.filter((t) => t.priority === "low" && !t.done).length, color: "var(--p-low)" },
            ].map(({ label, count, color }) => (
              <div key={label} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem", color: "var(--text-2)" }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: color, display: "inline-block" }} />
                {label}: <strong style={{ color }}>{count}</strong>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
    
  );
}
