"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await signIn("credentials", { username, password, redirect: false });
    if (result?.error) {
      setError("Incorrect username or password, or account suspended.");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "var(--bg)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: 20,
    }}>
      {/* Brand */}
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <div style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 99,
          padding: "6px 16px",
          marginBottom: 16,
        }}>
          <span style={{ fontSize: "1.1rem" }}>📋</span>
          <span style={{ fontWeight: 700, fontSize: "0.95rem", color: "var(--text)" }}>Triple Planck</span>
        </div>
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, color: "var(--text)", letterSpacing: "-0.02em" }}>
          Welcome back
        </h1>
        <p style={{ marginTop: 6, fontSize: "0.875rem", color: "var(--text-2)" }}>
          Sign in to manage your tasks
        </p>
      </div>

      {/* Card */}
      <div className="card-lg" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label htmlFor="login-username" className="label">Username</label>
            <input
              id="login-username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="your username"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="label">Password</label>
            <input
              id="login-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div style={{
              fontSize: "0.82rem",
              color: "var(--danger)",
              background: "var(--danger-soft)",
              border: "1px solid var(--danger)",
              borderRadius: "var(--radius-sm)",
              padding: "10px 14px",
            }}>
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ justifyContent: "center", marginTop: 4 }}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: "0.82rem", color: "var(--text-2)" }}>
          New user?{" "}
          <Link href="/register" style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}>
            Create account
          </Link>
        </div>
      </div>
    </main>
  );
}
