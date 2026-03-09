"use client";

import { useState, useRef, useEffect, MouseEvent, TouchEvent } from "react";

interface Props {
  beforeUrl: string;
  afterUrl: string;
}

export default function BeforeAfterSlider({ beforeUrl, afterUrl }: Props) {
  const [position, setPosition] = useState(50);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  function handleMove(clientX: number) {
    if (!containerRef.current || !isDragging) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    const percentage = (x / rect.width) * 100;
    setPosition(percentage);
  }

  function onMouseMove(e: globalThis.MouseEvent) { handleMove(e.clientX); }
  function onTouchMove(e: globalThis.TouchEvent) { handleMove(e.touches[0].clientX); }

  function stopDragging() { setIsDragging(false); }

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", stopDragging);
      window.addEventListener("touchmove", onTouchMove, { passive: false });
      window.addEventListener("touchend", stopDragging);
    } else {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopDragging);
    }
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", stopDragging);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", stopDragging);
    };
  }, [isDragging]);

  return (
    <div
      ref={containerRef}
      className="card-lg h-[45vh] sm:h-[80vh]"
      style={{
        position: "relative",
        width: "100%",
        // height: "80dvh",
        display: "flex",
        aspectRatio: "1 / 1",
        overflow: "hidden",
        cursor: isDragging ? "grabbing" : "ew-resize",
        userSelect: "none",
        touchAction: "none",
        background:"black",
      }}
      onMouseDown={(e: MouseEvent) => {
        setIsDragging(true);
        handleMove(e.clientX);
      }}
      onTouchStart={(e: TouchEvent) => {
        setIsDragging(true);
        handleMove(e.touches[0].clientX);
      }}
    >
      {/* Before Image (Background) */}
      <img
        src={beforeUrl}
        alt="Before"
        draggable={false}
        style={{ width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0 }}
      />

      {/* Before Label */}
      <div style={{
        position: "absolute", top: 16, left: 16,
        background: "rgba(144,136,132,0.6)", color: "#fff",
        padding: "4px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600,
        backdropFilter: "blur(4px)",
      }}>
        ←Before
      </div>

      {/* After Image (Foreground/Clipped) */}
      <img
        src={afterUrl}
        alt="After"
        draggable={false}
        style={{
          width: "100%", height: "100%", objectFit: "contain", position: "absolute", top: 0, left: 0,
          clipPath: `polygon(0 0, ${position}% 0, ${position}% 100%, 0 100%)`
        }}
      />

      {/* After Label */}
      <div style={{
        position: "absolute", top: 16, right: 16,
        background: "var(--accent)", color: "#fff",
        padding: "4px 10px", borderRadius: 99, fontSize: "0.75rem", fontWeight: 600,
        boxShadow: "var(--shadow-sm)"
      }}>
        After→
      </div>

      {/* Slider Divider Line */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        left: `${position}%`, width: 2, background: "#fff",
        transform: "translateX(-50%)",
        boxShadow: "0 0 10px rgba(0,0,0,0.3)",
      }}>
        {/* Slider Handle */}
        <div style={{
          position: "absolute", top: "50%", left: "50%",
          transform: "translate(-50%, -50%)",
          width: 32, height: 32, borderRadius: "50%",
          background: "#fff", boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "var(--text)", fontSize: "0.9rem",
        }}>
          ◂▸
        </div>
      </div>
    </div>
  );
}
