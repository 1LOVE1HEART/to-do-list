"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";

type Status = "idle" | "uploading" | "classifying" | "processing" | "done" | "error";

interface UploadZoneProps {
  label: string;
  hint: string;
  preview: string | null;
  onFile: (file: File) => void;
  disabled?: boolean;
}

function UploadZone({ label, hint, preview, onFile, disabled }: UploadZoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith("image/")) onFile(file);
    },
    [disabled, onFile]
  );

  return (
    <div
      onClick={() => !disabled && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      style={{
        flex: 1,
        minHeight: 220,
        border: `2px dashed ${dragging ? "var(--accent-green)" : "var(--border)"}`,
        background: dragging ? "rgba(0,255,136,0.04)" : "var(--bg-card)",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s",
        imageRendering: "pixelated",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
      />
      {preview ? (
        <>
          <img
            src={preview}
            alt={label}
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 50%)",
          }} />
          <div style={{
            position: "absolute", bottom: 8,
            fontSize: 7, color: "var(--accent-green)",
            letterSpacing: 2, textShadow: "0 0 8px rgba(0,255,136,0.8)",
          }}>
            ✓ {label.toUpperCase()} LOADED
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 32, marginBottom: 8, opacity: 0.4 }}>▣</div>
          <div style={{ fontSize: 9, color: "var(--accent-green)", letterSpacing: 2, marginBottom: 6 }}>
            {label.toUpperCase()}
          </div>
          <div style={{ fontSize: 7, color: "var(--text-muted)", textAlign: "center", lineHeight: 1.8 }}>
            {hint}
          </div>
        </>
      )}
    </div>
  );
}

const STATUS_TEXT: Record<Status, string> = {
  idle: "",
  uploading: "UPLOADING IMAGES...",
  classifying: "ANALYZING GARMENT TYPE...",
  processing: "AI PROCESSING... (20-60 SEC)",
  done: "COMPLETE!",
  error: "ERROR",
};

export default function TryonPage() {
  const [personFile, setPersonFile] = useState<File | null>(null);
  const [garmentFile, setGarmentFile] = useState<File | null>(null);
  const [personPreview, setPersonPreview] = useState<string | null>(null);
  const [garmentPreview, setGarmentPreview] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [category, setCategory] = useState("");
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  function handlePersonFile(file: File) {
    setPersonFile(file);
    setPersonPreview(URL.createObjectURL(file));
  }

  function handleGarmentFile(file: File) {
    setGarmentFile(file);
    setGarmentPreview(URL.createObjectURL(file));
  }

  async function uploadFile(file: File): Promise<string> {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.url;
  }

  async function startTryon() {
    if (!personFile || !garmentFile) return;
    setStatus("uploading");
    setResultUrl(null);
    setErrorMsg("");

    try {
      const [personImgUrl, garmentImgUrl] = await Promise.all([
        uploadFile(personFile),
        uploadFile(garmentFile),
      ]);

      setStatus("classifying");
      const tryonRes = await fetch("/api/tryon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ personImgUrl, garmentImgUrl }),
      });

      if (!tryonRes.ok) {
        const err = await tryonRes.json();
        throw new Error(err.error ?? "換裝請求失敗");
      }

      const { predictionId, category: cat } = await tryonRes.json();
      setCategory(cat);
      setStatus("processing");

      // Polling
      const startTime = Date.now();
      const timer = setInterval(() => {
        setElapsedSeconds(Math.floor((Date.now() - startTime) / 1000));
      }, 1000);

      while (true) {
        await new Promise((r) => setTimeout(r, 3000));
        const statusRes = await fetch(
          `/api/tryon-status?predictionId=${predictionId}&personImgUrl=${encodeURIComponent(personImgUrl)}&garmentImgUrl=${encodeURIComponent(garmentImgUrl)}&category=${cat}`
        );
        const data = await statusRes.json();

        if (data.status === "succeeded") {
          clearInterval(timer);
          setResultUrl(data.resultImgUrl);
          setStatus("done");
          break;
        }
        if (data.status === "failed") {
          clearInterval(timer);
          throw new Error(data.error ?? "換裝失敗");
        }
      }
    } catch (e: any) {
      setStatus("error");
      setErrorMsg(e.message ?? "未知錯誤");
    }
  }

  const isProcessing = ["uploading", "classifying", "processing"].includes(status);
  const canStart = !!personFile && !!garmentFile && !isProcessing;

  const CATEGORY_LABEL: Record<string, string> = {
    upper_body: "上衣",
    lower_body: "下著",
    dress: "連身洋裝",
  };

  return (
    <main style={{ minHeight: "100vh", padding: "24px 16px", maxWidth: 720, margin: "0 auto" }}>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <div style={{ fontSize: 14, color: "var(--accent-green)", letterSpacing: 3, textShadow: "0 0 15px rgba(0,255,136,0.4)" }}>
            TRIPLE PLANCK
          </div>
          <div style={{ fontSize: 8, color: "var(--text-dim)", marginTop: 4, letterSpacing: 2 }}>
            ▶ FIT CHECK MODULE
          </div>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="pixel-btn pixel-btn-ghost" style={{ fontSize: 7, padding: "6px 10px" }}>
            ← BACK
          </Link>
          <Link href="/tryon/history" className="pixel-btn pixel-btn-ghost" style={{ fontSize: 7, padding: "6px 10px" }}>
            HISTORY
          </Link>
        </div>
      </div>

      {/* Tip */}
      <div className="pixel-box mb-6" style={{ fontSize: 8, color: "var(--text-dim)", lineHeight: 2, letterSpacing: 1 }}>
        💡 TIP: 人物照建議<span style={{ color: "var(--accent-green)" }}>全身正面、背景單純</span>，效果更佳
      </div>

      {/* Upload zones */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <UploadZone
          label="PERSON PHOTO"
          hint={"點擊或拖放圖片\n全身正面效果最佳"}
          preview={personPreview}
          onFile={handlePersonFile}
          disabled={isProcessing}
        />
        <UploadZone
          label="GARMENT PHOTO"
          hint={"點擊或拖放圖片\n正面平鋪效果最佳"}
          preview={garmentPreview}
          onFile={handleGarmentFile}
          disabled={isProcessing}
        />
      </div>

      {/* Start button */}
      <button
        onClick={startTryon}
        disabled={!canStart}
        className=""
        style={{
          width: "100%",
          color: "white",
          fontSize: 10,
          padding: "14px",
          opacity: canStart ? 1 : 0.4,
          cursor: canStart ? "pointer" : "not-allowed",
          letterSpacing: 3,
        }}
      >
        {isProcessing ? STATUS_TEXT[status] : "▶ START FIT CHECK"}
      </button>

      {/* Processing status */}
      {isProcessing && (
        <div className="pixel-box mt-4" style={{ textAlign: "center", padding: 20 }}>
          <div style={{ fontSize: 9, color: "var(--accent-green)", letterSpacing: 2, marginBottom: 8 }}>
            {STATUS_TEXT[status]}<span className="cursor-blink" />
          </div>
          {status === "processing" && (
            <>
              <div style={{ fontSize: 8, color: "var(--text-muted)", marginBottom: 12 }}>
                {elapsedSeconds}s elapsed
                {category && ` · 辨識為：${CATEGORY_LABEL[category] ?? category}`}
              </div>
              {/* Pixel progress animation */}
              <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                {Array.from({ length: 8 }).map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: 8, height: 8,
                      background: "var(--accent-green)",
                      animation: `pixelPulse 1.2s ${i * 0.15}s infinite`,
                      opacity: 0.3,
                    }}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {status === "error" && (
        <div className="pixel-box mt-4" style={{
          border: "1px solid var(--accent-pink)",
          padding: 16, textAlign: "center",
        }}>
          <div style={{ fontSize: 9, color: "var(--accent-pink)", letterSpacing: 2, marginBottom: 4 }}>
            ✕ ERROR
          </div>
          <div style={{ fontSize: 8, color: "var(--text-muted)" }}>{errorMsg}</div>
        </div>
      )}

      {/* Result */}
      {status === "done" && resultUrl && (
        <div className="pixel-box mt-6" style={{ overflow: "hidden", padding: 0 }}>
          <div style={{
            padding: "12px 16px",
            borderBottom: "1px solid var(--border)",
            fontSize: 8, letterSpacing: 2,
            color: "var(--accent-green)",
          }}>
            ✓ FIT CHECK COMPLETE · {CATEGORY_LABEL[category] ?? category}
          </div>
          <div style={{ display: "flex", gap: 0 }}>
            {/* Before */}
            <div style={{ flex: 1, position: "relative" }}>
              <img
                src={personPreview!}
                alt="Before"
                style={{ width: "100%", height: 400, objectFit: "cover", display: "block" }}
              />
              <div style={{
                position: "absolute", top: 8, left: 8,
                fontSize: 7, color: "var(--text-muted)",
                background: "rgba(0,0,0,0.7)", padding: "3px 8px", letterSpacing: 1,
              }}>BEFORE</div>
            </div>
            <div style={{ width: 1, background: "var(--border)" }} />
            {/* After */}
            <div style={{ flex: 1, position: "relative" }}>
              <img
                src={resultUrl}
                alt="After"
                style={{ width: "100%", height: 400, objectFit: "cover", display: "block" }}
              />
              <div style={{
                position: "absolute", top: 8, left: 8,
                fontSize: 7, color: "var(--accent-green)",
                background: "rgba(0,0,0,0.7)", padding: "3px 8px", letterSpacing: 1,
              }}>AFTER</div>
            </div>
          </div>
          <div style={{ padding: "12px 16px", display: "flex", gap: 8 }}>
            <a
              href={resultUrl}
              download="tryon-result.jpg"
              target="_blank"
              rel="noreferrer"
              className="pixel-btn"
              style={{ fontSize: 7, padding: "6px 12px", textDecoration: "none" }}
            >
              ↓ DOWNLOAD
            </a>
            <Link
              href="/tryon/history"
              className="pixel-btn pixel-btn-ghost"
              style={{ fontSize: 7, padding: "6px 12px" }}
            >
              VIEW HISTORY
            </Link>
            <button
              onClick={() => {
                setStatus("idle");
                setResultUrl(null);
                setPersonFile(null);
                setGarmentFile(null);
                setPersonPreview(null);
                setGarmentPreview(null);
                setElapsedSeconds(0);
              }}
              className="pixel-btn pixel-btn-ghost"
              style={{ fontSize: 7, padding: "6px 12px", marginLeft: "auto" }}
            >
              ↺ TRY AGAIN
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pixelPulse {
          0%, 100% { opacity: 0.2; }
          50% { opacity: 1; }
        }
      `}</style>
    </main>
  );
}
