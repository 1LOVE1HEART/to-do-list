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
        border: `2px dashed ${dragging ? "var(--accent)" : "var(--border-2)"}`,
        borderRadius: "var(--radius)",
        background: dragging ? "var(--accent-soft)" : "var(--surface-2)",
        cursor: disabled ? "default" : "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        transition: "border-color 0.2s, background 0.2s",
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
            background: "linear-gradient(to top, rgba(44,36,32,0.5) 0%, transparent 55%)",
          }} />
          <div style={{
            position: "absolute", bottom: 10,
            fontSize: "0.75rem", color: "#fff", fontWeight: 600,
            background: "rgba(44,36,32,0.5)", padding: "3px 10px", borderRadius: 99,
          }}>
            ✓ {label} loaded
          </div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 36, marginBottom: 10, opacity: 0.35 }}>🖼️</div>
          <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "var(--text)", marginBottom: 5 }}>
            {label}
          </div>
          <div style={{ fontSize: "0.78rem", color: "var(--text-2)", textAlign: "center", lineHeight: 1.6, padding: "0 16px" }}>
            {hint}
          </div>
        </>
      )}
    </div>
  );
}

const STATUS_LABEL: Record<Status, string> = {
  idle: "",
  uploading: "Uploading images…",
  classifying: "Identifying garment type…",
  processing: "AI generating result… (20–60s)",
  done: "Done!",
  error: "Error",
};

const CATEGORY_LABEL: Record<string, string> = {
  upper_body: "Top",
  lower_body: "Bottom",
  dress: "Dress",
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
        throw new Error(err.error ?? "Request failed");
      }

      const { predictionId, category: cat } = await tryonRes.json();
      setCategory(cat);
      setStatus("processing");

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
          throw new Error(data.error ?? "Generation failed");
        }
      }
    } catch (e: unknown) {
      setStatus("error");
      setErrorMsg(e instanceof Error ? e.message : "Unknown error");
    }
  }

  const isProcessing = ["uploading", "classifying", "processing"].includes(status);
  const canStart = !!personFile && !!garmentFile && !isProcessing;

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)" }}>Now Look</span>
          <span style={{
            fontSize: "0.7rem", background: "var(--accent-soft)", color: "var(--accent)",
            padding: "2px 8px", borderRadius: 99, fontWeight: 600,
          }}>
            Beta
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/tryon/history" className="btn btn-ghost btn-sm">History</Link>
          <Link href="/" className="btn btn-secondary btn-sm">← Back</Link>
        </div>
      </header>

      <main style={{ maxWidth: 700, margin: "0 auto", padding: "32px 16px 64px" }}>
        {/* Tip */}
        <div style={{
          background: "var(--accent-soft)", border: "1px solid var(--border)",
          borderRadius: "var(--radius)", padding: "12px 16px",
          fontSize: "1rem", color: "var(--accent)", marginBottom: 28,
        }}>
          💡 <strong>Tip:</strong> 人物照建議：全身正面、背景單純，效果更佳
        </div>

        {/* Upload zones */}
        <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
          <UploadZone
            label="Person photo"
            hint={"Click or drag & drop\nFull body works best"}
            preview={personPreview}
            onFile={handlePersonFile}
            disabled={isProcessing}
          />
          <UploadZone
            label="Garment photo"
            hint={"Click or drag & drop\nFlat lay works best"}
            preview={garmentPreview}
            onFile={handleGarmentFile}
            disabled={isProcessing}
          />
        </div>

        {/* Start button */}
        <button
          onClick={startTryon}
          disabled={!canStart}
          className="btn btn-primary"
          style={{ width: "100%", justifyContent: "center", padding: "13px", fontSize: "0.95rem", borderRadius: "var(--radius)" }}
        >
          {isProcessing ? STATUS_LABEL[status] : "▶ Start & Check"}
        </button>

        {/* Processing */}
        {isProcessing && (
          <div className="card" style={{ marginTop: 20, padding: 20, textAlign: "center" }}>
            <p style={{ fontSize: "0.85rem", color: "var(--text-2)", marginBottom: 12 }}>
              {STATUS_LABEL[status]}
              {status === "processing" && ` · ${elapsedSeconds}s`}
              {category && ` · ${CATEGORY_LABEL[category] ?? category}`}
            </p>
            <div style={{ height: 6, background: "var(--surface-2)", borderRadius: 99, overflow: "hidden" }}>
              <div style={{
                height: "100%", borderRadius: 99,
                background: "linear-gradient(90deg, var(--accent), var(--warning))",
                width: status === "uploading" ? "30%" : status === "classifying" ? "60%" : "85%",
                transition: "width 0.6s ease",
              }} />
            </div>
          </div>
        )}

        {/* Error */}
        {status === "error" && (
          <div style={{
            marginTop: 16, background: "var(--danger-soft)", border: "1px solid var(--danger)",
            borderRadius: "var(--radius)", padding: "14px 18px",
          }}>
            <p style={{ fontWeight: 600, color: "var(--danger)", marginBottom: 4 }}>Something went wrong</p>
            <p style={{ fontSize: "0.82rem", color: "var(--danger)" }}>{errorMsg}</p>
          </div>
        )}

        {/* Result */}
        {status === "done" && resultUrl && (
          <div className="card" style={{ marginTop: 24, overflow: "hidden" }}>
            <div style={{
              padding: "14px 18px", borderBottom: "1px solid var(--border)",
              display: "flex", justifyContent: "space-between", alignItems: "center",
            }}>
              <span style={{ fontWeight: 600, color: "var(--text)" }}>
                ✓ Result · {CATEGORY_LABEL[category] ?? category}
              </span>
            </div>
            <div style={{ display: "flex" }}>
              <div style={{ flex: 1, position: "relative" }}>
                <img src={personPreview!} alt="Before" style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }} />
                <span style={{
                  position: "absolute", top: 10, left: 10,
                  background: "rgba(44,36,32,0.55)", color: "#fff",
                  fontSize: "0.73rem", padding: "3px 10px", borderRadius: 99, fontWeight: 600,
                }}>Before</span>
              </div>
              <div style={{ width: 1, background: "var(--border)" }} />
              <div style={{ flex: 1, position: "relative" }}>
                <img src={resultUrl} alt="After" style={{ width: "100%", height: 380, objectFit: "cover", display: "block" }} />
                <span style={{
                  position: "absolute", top: 10, left: 10,
                  background: "var(--accent)", color: "#fff",
                  fontSize: "0.73rem", padding: "3px 10px", borderRadius: 99, fontWeight: 600,
                }}>After</span>
              </div>
            </div>
            <div style={{ padding: "14px 18px", display: "flex", gap: 8 }}>
              <a href={resultUrl} download="tryon-result.jpg" target="_blank" rel="noreferrer" className="btn btn-primary btn-sm">
                ↓ Download
              </a>
              <Link href="/tryon/history" className="btn btn-secondary btn-sm">View history</Link>
              <button onClick={() => {
                setStatus("idle"); setResultUrl(null);
                setPersonFile(null); setGarmentFile(null);
                setPersonPreview(null); setGarmentPreview(null);
                setElapsedSeconds(0);
              }} className="btn btn-ghost btn-sm" style={{ marginLeft: "auto" }}>
                ↺ Try again
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
