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

    const result = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (result?.error) {
      setError("帳號或密碼錯誤，或帳號已被封鎖");
      setLoading(false);
    } else {
      router.push("/");
      router.refresh();
    }
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* Logo */}
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div
          style={{
            fontSize: 22,
            color: "var(--accent-green)",
            letterSpacing: 4,
            textShadow: "0 0 20px rgba(0,255,136,0.5)",
            marginBottom: 8,
          }}
        >
          TRIPLE PLANCK
        </div>
        <div style={{ fontSize: 8, color: "var(--text-dim)" }}>
          QUEST MANAGER v1.0
        </div>
        <div
          style={{
            marginTop: 12,
            fontSize: 8,
            color: "var(--accent-yellow)",
          }}
        >
          ▶ INSERT COIN TO CONTINUE
          <span className="cursor-blink" />
        </div>
      </div>

      {/* Login Box */}
      <div className="pixel-box" style={{ width: "100%", maxWidth: 400, padding: 28 }}>
        <div
          style={{
            fontSize: 10,
            color: "var(--accent-cyan)",
            marginBottom: 24,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          ▶ Player Login
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="login-username" className="pixel-label">Username</label>
            <input
              id="login-username"
              className="pixel-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter username"
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label htmlFor="login-password" className="pixel-label">Password</label>
            <input
              id="login-password"
              className="pixel-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <div
              style={{
                fontSize: 8,
                color: "var(--accent-pink)",
                padding: "8px 10px",
                border: "1px solid var(--accent-pink)",
                background: "rgba(255,45,120,0.05)",
              }}
            >
              ✕ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="pixel-btn pixel-btn-green w-full"
            style={{ justifyContent: "center", marginTop: 8 }}
          >
            {loading ? "LOADING..." : "▶ START GAME"}
          </button>
        </form>

        <div style={{ marginTop: 20, fontSize: 8, color: "var(--text-muted)", textAlign: "center" }}>
          新玩家？{" "}
          <Link
            href="/register"
            style={{ color: "var(--accent-yellow)", textDecoration: "none" }}
          >
            CREATE ACCOUNT
          </Link>
        </div>
      </div>
    </main>
  );
}
