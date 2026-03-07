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

    // @ts-expect-error global callback
    window.onTurnstileSuccess = (token: string) => setCfToken(token);

    return () => {
      document.body.removeChild(script);
      // @ts-expect-error global cleanup
      delete window.onTurnstileSuccess;
    };
  }, [siteKey]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (siteKey && !cfToken) {
      setError("Please complete the security check.");
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
      setError(data.error ?? "Registration failed");
      setLoading(false);
      // Reset Turnstile
      // @ts-expect-error global variable
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
        background: "var(--bg)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
      }}
    >
      {/* Logo */}
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
          Create an account
        </h1>
        <p style={{ marginTop: 6, fontSize: "0.875rem", color: "var(--text-2)" }}>
          Join us to start managing your tasks
        </p>
      </div>

      {/* Register Box */}
      <div className="card-lg" style={{ width: "100%", maxWidth: 400, padding: 32 }}>
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div>
            <label htmlFor="reg-username" className="label">
              Username
            </label>
            <input
              id="reg-username"
              className="input"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="3-32 chars (alphanumeric)"
              autoComplete="username"
              required
              minLength={3}
              maxLength={32}
              pattern="[a-zA-Z0-9_]+"
            />
          </div>
          <div>
            <label htmlFor="reg-password" className="label">
              Password
            </label>
            <input
              id="reg-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
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
              data-theme="light"
            />
          )}

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

          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ justifyContent: "center", marginTop: 4 }}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div style={{ marginTop: 20, textAlign: "center", fontSize: "0.82rem", color: "var(--text-2)" }}>
          Already have an account?{" "}
          <Link
            href="/login"
            style={{ color: "var(--accent)", fontWeight: 600, textDecoration: "none" }}
          >
            Sign in
          </Link>
        </div>
      </div>
    </main>
  );
}
