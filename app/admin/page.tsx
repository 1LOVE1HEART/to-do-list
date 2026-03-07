"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface UserRow {
  id: string;
  username: string;
  role: string;
  isBanned: boolean;
  createdAt: string;
  todoCount: number;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [actionId, setActionId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/users?q=");
    if (res.ok) setUsers(await res.json());
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function toggleBan(user: UserRow) {
    setActionId(user.id);
    const res = await fetch(`/api/admin/users/${user.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isBanned: !user.isBanned }),
    });
    if (res.ok) {
      setUsers((prev) => prev.map((u) => u.id === user.id ? { ...u, isBanned: !u.isBanned } : u));
    }
    setActionId(null);
  }

  const filtered = users.filter((u) => u.username.toLowerCase().includes(query.toLowerCase()));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)" }}>Admin Panel</span>
          <span style={{
            fontSize: "0.7rem", background: "var(--danger-soft)", color: "var(--danger)",
            padding: "2px 8px", borderRadius: 99, fontWeight: 600, border: "1px solid var(--danger)",
          }}>
            {users.length} users
          </span>
        </div>
        <Link href="/" className="btn btn-secondary btn-sm">← Back</Link>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 64px" }}>
        {/* Search */}
        <div style={{ marginBottom: 24, maxWidth: 320 }}>
          <input
            className="input"
            placeholder="Search username…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Table */}
        <div className="card" style={{ overflow: "auto" }}>
          {loading ? (
            <div style={{ padding: 48, textAlign: "center", color: "var(--text-3)", fontSize: "0.85rem" }}>
              Loading…
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
              <thead>
                <tr style={{ background: "var(--surface-2)", borderBottom: "1px solid var(--border)" }}>
                  {["Username", "Role", "Tasks", "Joined", "Status", "Actions"].map((h) => (
                    <th key={h} style={{
                      padding: "10px 14px", textAlign: "left", fontWeight: 600,
                      fontSize: "0.75rem", color: "var(--text-2)", textTransform: "uppercase", letterSpacing: "0.04em",
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} style={{
                    borderBottom: "1px solid var(--border)",
                    opacity: u.isBanned ? 0.5 : 1,
                    transition: "background 0.12s",
                  }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={{ padding: "11px 14px" }}>
                      <Link href={`/admin/users/${u.id}`} style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
                        {u.username}
                      </Link>
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--text-2)", textTransform: "capitalize" }}>
                      {u.role}
                    </td>
                    <td style={{ padding: "11px 14px", fontWeight: 600, color: "var(--text)" }}>
                      {u.todoCount ?? 0}
                    </td>
                    <td style={{ padding: "11px 14px", color: "var(--text-3)", fontSize: "0.8rem" }}>
                      {new Date(u.createdAt).toLocaleDateString("zh-TW")}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      {u.isBanned ? (
                        <span style={{
                          background: "var(--danger-soft)", color: "var(--danger)",
                          padding: "2px 8px", borderRadius: 99, fontSize: "0.72rem", fontWeight: 600,
                          border: "1px solid var(--danger)",
                        }}>Banned</span>
                      ) : (
                        <span style={{
                          background: "var(--sage-soft)", color: "var(--sage)",
                          padding: "2px 8px", borderRadius: 99, fontSize: "0.72rem", fontWeight: 600,
                          border: "1px solid var(--sage)",
                        }}>Active</span>
                      )}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Link href={`/admin/users/${u.id}`} className="btn btn-ghost btn-sm">View</Link>
                        {u.role !== "admin" && (
                          <button
                            onClick={() => toggleBan(u)}
                            disabled={actionId === u.id}
                            className={u.isBanned ? "btn btn-sage btn-sm" : "btn btn-danger btn-sm"}
                          >
                            {u.isBanned ? "Unban" : "Ban"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ padding: 40, textAlign: "center", color: "var(--text-3)", fontSize: "0.85rem" }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </main>
    </div>
  );
}
