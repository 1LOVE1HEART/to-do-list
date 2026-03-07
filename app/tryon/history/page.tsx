import { auth } from "@/lib/auth";
import { db } from "@/db";
import { tryonResults } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { redirect } from "next/navigation";
import Link from "next/link";
import DeleteTryonButton from "./DeleteTryonButton";

const CATEGORY_LABEL: Record<string, string> = {
  upper_body: "Top",
  lower_body: "Bottom",
  dress: "Dress",
};

export default async function TryonHistoryPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const results = await db
    .select()
    .from(tryonResults)
    .where(eq(tryonResults.userId, session.user.id))
    .orderBy(desc(tryonResults.createdAt));

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)" }}>Fit Check History</span>
          <span style={{
            fontSize: "0.7rem", background: "var(--surface-2)", color: "var(--text-2)",
            padding: "2px 8px", borderRadius: 99, fontWeight: 600, border: "1px solid var(--border)",
          }}>
            {results.length} saved
          </span>
        </div>
        <Link href="/tryon" className="btn btn-secondary btn-sm">← Back</Link>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "32px 16px 64px" }}>
        {results.length === 0 ? (
          <div style={{
            textAlign: "center", padding: "80px 24px",
            background: "var(--surface)", border: "1px dashed var(--border)",
            borderRadius: "var(--radius-lg)", color: "var(--text-2)",
          }}>
            <div style={{ fontSize: "2.5rem", marginBottom: 16 }}>👗</div>
            <p style={{ fontWeight: 600, fontSize: "1rem", marginBottom: 8 }}>No fit checks yet</p>
            <p style={{ fontSize: "0.85rem", color: "var(--text-3)", marginBottom: 24 }}>
              Save some looks to see them here.
            </p>
            <Link href="/tryon" className="btn btn-primary">Start your first fit check</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(270px, 1fr))", gap: 18 }}>
            {results.map((r) => (
              <div key={r.id} className="card" style={{ overflow: "hidden" }}>
                {/* Result image */}
                <div style={{ position: "relative" }}>
                  <img
                    src={r.resultImgUrl}
                    alt="Result"
                    style={{ width: "100%", height: 280, objectFit: "cover", display: "block" }}
                  />
                  <span style={{
                    position: "absolute", top: 10, left: 10,
                    background: "var(--accent)", color: "#fff",
                    fontSize: "0.72rem", padding: "3px 10px", borderRadius: 99, fontWeight: 600,
                  }}>
                    {CATEGORY_LABEL[r.category] ?? r.category}
                  </span>
                </div>

                {/* Thumbnails */}
                <div style={{ display: "flex", borderTop: "1px solid var(--border)" }}>
                  <img src={r.personImgUrl} alt="Person" style={{ width: "50%", height: 80, objectFit: "cover", display: "block" }} />
                  <div style={{ width: 1, background: "var(--border)" }} />
                  <img src={r.garmentImgUrl} alt="Garment" style={{ width: "50%", height: 80, objectFit: "cover", display: "block" }} />
                </div>

                {/* Meta */}
                <div style={{
                  padding: "12px 14px", borderTop: "1px solid var(--border)",
                  display: "flex", justifyContent: "space-between", alignItems: "center",
                }}>
                  <span style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                    {new Date(r.createdAt).toLocaleDateString("zh-TW", {
                      month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
                    })}
                  </span>
                  <div style={{ display: "flex", gap: 4 }}>
                    <a
                      href={r.resultImgUrl}
                      download
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-ghost btn-icon btn-sm"
                      title="Download"
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
    </div>
  );
}
