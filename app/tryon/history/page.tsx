import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tryonResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteTryonButton from "./DeleteTryonButton";

export default async function TryonHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const results = await db
    .select()
    .from(tryonResults)
    .where(eq(tryonResults.userId, session.user.id))
    .orderBy(desc(tryonResults.createdAt));

  const CATEGORY_LABEL: Record<string, string> = {
    upper_body: "上衣",
    lower_body: "下著",
    dress: "連身洋裝",
  };

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", maxWidth: 900, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div style={{ fontSize: 14, color: "var(--accent-green)", letterSpacing: 3, textShadow: "0 0 15px rgba(0,255,136,0.4)" }}>
            TRIPLE PLANCK
          </div>
          <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 4, letterSpacing: 2 }}>
            ▶ FIT CHECK HISTORY · {results.length} RECORDS
          </div>
        </div>
        <Link href="/tryon" className="pixel-btn pixel-btn-ghost" style={{ fontSize: 7, padding: "6px 10px" }}>
          ← BACK
        </Link>
      </div>

      {results.length === 0 ? (
        <div
          className="pixel-box"
          style={{ padding: 60, textAlign: "center", color: "var(--text-muted)", fontSize: 9 }}
        >
          NO FIT CHECK RECORDS YET.<br />
          <Link href="/tryon" style={{ color: "var(--accent-green)", textDecoration: "none", fontSize: 8, marginTop: 12, display: "block" }}>
            ▶ START YOUR FIRST FIT CHECK
          </Link>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {results.map((r) => (
            <div key={r.id} className="pixel-box" style={{ padding: 0, overflow: "hidden" }}>
              {/* Result image */}
              <div style={{ position: "relative" }}>
                <img
                  src={r.resultImgUrl}
                  alt="Result"
                  style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }}
                />
                <div style={{
                  position: "absolute", top: 8, left: 8,
                  background: "rgba(0,0,0,0.8)", padding: "3px 8px",
                  fontSize: 7, color: "var(--accent-green)", letterSpacing: 1,
                }}>
                  {CATEGORY_LABEL[r.category] ?? r.category}
                </div>
              </div>

              {/* Before / Garment thumbnails */}
              <div style={{ display: "flex", gap: 0, borderTop: "1px solid var(--border)" }}>
                <img
                  src={r.personImgUrl}
                  alt="Person"
                  style={{ width: "50%", height: 80, objectFit: "cover", display: "block" }}
                />
                <div style={{ width: 1, background: "var(--border)" }} />
                <img
                  src={r.garmentImgUrl}
                  alt="Garment"
                  style={{ width: "50%", height: 80, objectFit: "cover", display: "block" }}
                />
              </div>

              {/* Meta */}
              <div style={{
                padding: "10px 12px",
                borderTop: "1px solid var(--border)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div style={{ fontSize: 7, color: "var(--text-muted)", letterSpacing: 1 }}>
                  {new Date(r.createdAt).toLocaleDateString("zh-TW", {
                    year: "numeric", month: "2-digit", day: "2-digit",
                    hour: "2-digit", minute: "2-digit",
                  })}
                </div>
                <div className="flex gap-2">
                  <a
                    href={r.resultImgUrl}
                    download
                    target="_blank"
                    rel="noreferrer"
                    className="pixel-btn pixel-btn-ghost"
                    style={{ fontSize: 7, padding: "4px 8px", textDecoration: "none" }}
                  >
                    ↓
                  </a>
                  <DeleteTryonButton id={r.id} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
