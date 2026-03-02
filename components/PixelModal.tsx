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
      <div className="modal-box pixel-box">
        <div
          className="flex justify-between items-center mb-4"
          style={{ borderBottom: "1px solid var(--border)", paddingBottom: 12 }}
        >
          <span
            style={{
              fontSize: 9,
              color: "var(--accent-cyan)",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            ▶ {title}
          </span>
          <button
            onClick={onClose}
            className="pixel-btn pixel-btn-ghost"
            style={{ padding: "4px 8px", fontSize: 10 }}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
