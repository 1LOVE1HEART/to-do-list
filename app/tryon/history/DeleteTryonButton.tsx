"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTryonButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("確定要刪除這筆記錄嗎？")) return;
    setLoading(true);
    await fetch(`/api/tryon-history/${id}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="pixel-btn pixel-btn-ghost"
      style={{ fontSize: 7, padding: "4px 8px", color: "var(--accent-pink)" }}
    >
      {loading ? "..." : "✕"}
    </button>
  );
}
