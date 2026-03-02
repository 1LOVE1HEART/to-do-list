"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cfToken, setCfToken] = useState("");
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Load Turnstile script
  useEffect(() => {
    if (!siteKey) return;
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    document.body.appendChild(script);

    // @ts-ignore
    window.onTurnstileSuccess = (token: string) => setCfToken(token);

    return () => {
      document.body.removeChild(script);
    };
  }, [siteKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (siteKey && !cfToken) {
      setError("請完成人機驗證");
      return;
    }

    setLoading(true);
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username,
        password,
        cfTurnstileToken: cfToken || "dev-bypass",
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "註冊失敗");
      setLoading(false);
      // Reset Turnstile
      // @ts-ignore
      if (window.turnstile) window.turnstile.reset();
      setCfToken("");
    } else {
      router.push("/login?registered=1");
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
        <div style={{ fontSize: 8, color: "var(--text-dim)" }}>NEW PLAYER</div>
      </div>

      {/* Register Box */}
      <div className="pixel-box" style={{ width: "100%", maxWidth: 400, padding: 28 }}>
        <div
          style={{
            fontSize: 10,
            color: "var(--accent-yellow)",
            marginBottom: 24,
            textTransform: "uppercase",
            letterSpacing: 2,
          }}
        >
          ▶ Create Account
        </div>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label htmlFor="reg-username" className="pixel-label">
              Username
            </label>
            <input
              id="reg-username"
              className="pixel-input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3-32 個英數字/底線"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_]+"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="pixel-label">
              Password
            </label>
            <input
              id="reg-password"
              className="pixel-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="至少 6 個字元"
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          {/* Turnstile */}
          {siteKey && (
            <div
              className="cf-turnstile"
              data-sitekey={siteKey}
              data-callback="onTurnstileSuccess"
              data-theme="dark"
            />
          )}

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
            className="pixel-btn pixel-btn-yellow w-full"
            style={{ justifyContent: "center", marginTop: 8 }}
          >
            {loading ? "CREATING..." : "▶ JOIN GAME"}
          </button>
        </form>

        <div
          style={{
            marginTop: 20,
            fontSize: 8,
            color: "var(--text-muted)",
            textAlign: "center",
          }}
        >
          已有帳號？{" "}
          <Link
            href="/login"
            style={{ color: "var(--accent-green)", textDecoration: "none" }}
          >
            LOGIN
          </Link>
        </div>
      </div>
    </main>
  );
}
