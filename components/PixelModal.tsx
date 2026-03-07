"use client";

import { ReactNode, useEffect } from "react";

interface Props {
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export default function PixelModal({ title, onClose, children }: Props) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box">
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
          paddingBottom: 16,
          borderBottom: "1px solid var(--border)",
        }}>
          <h3 style={{ fontWeight: 600, color: "var(--text)" }}>{title}</h3>
          <button
            onClick={onClose}
            className="btn btn-ghost btn-icon btn-sm"
            aria-label="Close"
            style={{ fontSize: "1.1rem", color: "var(--text-2)" }}
          >
            ×
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
