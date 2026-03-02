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

  async function load(q = "") {
    setLoading(true);
    const res = await fetch(`/api/admin/users?q=${encodeURIComponent(q)}`);
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
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id ? { ...u, isBanned: !u.isBanned } : u
        )
      );
    }
    setActionId(null);
  }

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div style={{ fontSize: 12, color: "var(--accent-purple)", letterSpacing: 3 }}>
            ADMIN PANEL
          </div>
          <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 4 }}>
            {users.length} PLAYERS REGISTERED
          </div>
        </div>
        <Link href="/" className="pixel-btn pixel-btn-ghost" style={{ fontSize: 7 }}>
          ← BACK
        </Link>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          className="pixel-input"
          placeholder="SEARCH PLAYER..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 320 }}
        />
      </div>

      {/* Table */}
      <div className="pixel-box" style={{ overflow: "auto" }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: "center", fontSize: 9, color: "var(--text-dim)" }}>
            LOADING<span className="cursor-blink" />
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 8 }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--border)", color: "var(--text-dim)" }}>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>USERNAME</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>ROLE</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>QUESTS</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>JOINED</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>STATUS</th>
                <th style={{ padding: "10px 12px", textAlign: "left" }}>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  style={{
                    borderBottom: "1px solid var(--border)",
                    opacity: u.isBanned ? 0.5 : 1,
                  }}
                >
                  <td style={{ padding: "10px 12px" }}>
                    <Link
                      href={`/admin/users/${u.id}`}
                      style={{ color: "var(--accent-cyan)", textDecoration: "none" }}
                    >
                      {u.username}
                    </Link>
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <span
                      style={{
                        color: u.role === "admin" ? "var(--accent-purple)" : "var(--text-dim)",
                      }}
                    >
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--accent-yellow)" }}>
                    {u.todoCount ?? 0}
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-muted)" }}>
                    {new Date(u.createdAt).toLocaleDateString("zh-TW")}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    {u.isBanned ? (
                      <span style={{ color: "var(--accent-pink)" }}>BANNED</span>
                    ) : (
                      <span style={{ color: "var(--accent-green)" }}>ACTIVE</span>
                    )}
                  </td>
                  <td style={{ padding: "10px 12px" }}>
                    <div className="flex gap-2">
                      <Link
                        href={`/admin/users/${u.id}`}
                        className="pixel-btn pixel-btn-cyan"
                        style={{ padding: "4px 8px", fontSize: 7 }}
                      >
                        VIEW
                      </Link>
                      {u.role !== "admin" && (
                        <button
                          onClick={() => toggleBan(u)}
                          disabled={actionId === u.id}
                          className={`pixel-btn ${u.isBanned ? "pixel-btn-green" : "pixel-btn-pink"}`}
                          style={{ padding: "4px 8px", fontSize: 7 }}
                        >
                          {u.isBanned ? "UNBAN" : "BAN"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--text-muted)" }}>
                    NO PLAYERS FOUND
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </main>
  );
}
