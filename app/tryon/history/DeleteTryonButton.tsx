"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteTryonButton({ id }: { id: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleDelete() {
    if (!confirm("Delete this fit check?")) return;
    setLoading(true);
    const res = await fetch(`/api/tryon-history/${id}`, { method: "DELETE" });
    if (res.ok) {
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="btn btn-ghost btn-icon btn-sm"
      title="Delete"
      style={{ color: "var(--danger)" }}
    >
      🗑
    </button>
  );
}
