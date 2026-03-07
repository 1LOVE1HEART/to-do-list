"use client";

import { useEffect } from "react";
import Image from "next/image";

interface Props {
  src: string;
  alt: string;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
}

export default function Lightbox({ src, alt, onClose, onNext, onPrev }: Props) {
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && onNext) onNext();
      if (e.key === "ArrowLeft" && onPrev) onPrev();
    };
    window.addEventListener("keydown", handleKey);
    // Prevent background scrolling
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, onNext, onPrev]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 10000,
        backgroundColor: "rgba(20, 15, 12, 0.95)", // dark warm
        backdropFilter: "blur(8px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        animation: "fade-in 0.2s ease-out",
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{
          position: "absolute", top: 24, right: 24,
          background: "transparent", border: "none", color: "#fff",
          fontSize: "2rem", cursor: "pointer", padding: 8, zIndex: 10001,
          opacity: 0.7, transition: "opacity 0.2s",
        }}
        onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
        onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
        title="Close (Esc)"
      >
        ×
      </button>

      {onPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          style={{
            position: "absolute", left: 24, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
            fontSize: "2rem", cursor: "pointer", padding: "16px 20px", borderRadius: "50%",
            zIndex: 10001, opacity: 0.7, transition: "opacity 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          title="Previous (Left Arrow)"
        >
          ‹
        </button>
      )}

      <div
        onClick={(e) => e.stopPropagation()}
        style={{ position: "relative", width: "90vw", height: "90vh", display: "flex", justifyContent: "center", alignItems: "center" }}
      >
         <img
            src={src}
            alt={alt}
            style={{
              maxWidth: "100%", maxHeight: "100%", width: "auto", height: "auto",
              objectFit: "contain", borderRadius: "8px", boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
            }}
          />
      </div>

      {onNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          style={{
            position: "absolute", right: 24, top: "50%", transform: "translateY(-50%)",
            background: "rgba(255,255,255,0.1)", border: "none", color: "#fff",
            fontSize: "2rem", cursor: "pointer", padding: "16px 20px", borderRadius: "50%",
            zIndex: 10001, opacity: 0.7, transition: "opacity 0.2s, background 0.2s",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.background = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = "0.7"; e.currentTarget.style.background = "rgba(255,255,255,0.1)"; }}
          title="Next (Right Arrow)"
        >
          ›
        </button>
      )}
    </div>
  );
}
