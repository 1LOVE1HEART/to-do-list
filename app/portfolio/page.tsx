"use client";

import { useState } from "react";
import Link from "next/link";
import Lightbox from "@/components/Lightbox";
import "../portfolio.css"; // Ensure styles are loaded

const CATEGORIES = ["All", "Portrait", "Travel", "Nature", "Urban"];

// Mock dataset
const PHOTOS = [
  { id: 1, url: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80", title: "Neon Tokyo", category: "Urban" },
  { id: 2, url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80", title: "Coffee & Contemplation", category: "Portrait" },
  { id: 3, url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", title: "Alpine Peaks", category: "Nature" },
  { id: 4, url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", title: "Studio Light", category: "Portrait" },
  { id: 5, url: "https://images.unsplash.com/photo-1761839258044-e59f324b5a7f?q=80", title: "Morning Mist", category: "Travel" },
  { id: 6, url: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80", title: "Concrete Jungle", category: "Urban" },
  { id: 7, url: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", title: "Autumn Road", category: "Nature" },
  { id: 8, url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80", title: "Wanderlust", category: "Travel" },
];

export default function PortfolioPage() {
  const [filter, setFilter] = useState("All");
  const [lightboxObj, setLightboxObj] = useState<{ id: number; url: string; title: string } | null>(null);

  const filteredPhotos = filter === "All" ? PHOTOS : PHOTOS.filter((p) => p.category === filter);

  function handleOpenLightbox(id: number) {
    const photo = PHOTOS.find((p) => p.id === id);
    if (photo) setLightboxObj(photo);
  }

  function handleNext() {
    if (!lightboxObj) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === lightboxObj.id);
    const nextPhoto = filteredPhotos[(currentIndex + 1) % filteredPhotos.length];
    setLightboxObj(nextPhoto);
  }

  function handlePrev() {
    if (!lightboxObj) return;
    const currentIndex = filteredPhotos.findIndex((p) => p.id === lightboxObj.id);
    const prevPhoto = filteredPhotos[(currentIndex - 1 + filteredPhotos.length) % filteredPhotos.length];
    setLightboxObj(prevPhoto);
  }

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)" }}>
      {/* Header */}
      <header style={{
        background: "var(--surface)", borderBottom: "1px solid var(--border)",
        padding: "0 24px", height: 56, display: "flex", alignItems: "center",
        justifyContent: "space-between", position: "sticky", top: 0, zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.02em" }}>
            Cook's Profile
          </span>
          <span style={{
            fontSize: "0.7rem", background: "var(--accent-soft)", color: "var(--accent)",
            padding: "2px 8px", borderRadius: 99, fontWeight: 600,
          }}>
            Portfolio
          </span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" className="btn btn-secondary btn-sm">← Back to Tasks</Link>
        </div>
      </header>

      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "48px 24px 80px" }}>
        {/* Page Title */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <h1 style={{ fontSize: "2.4rem", fontWeight: 700, marginBottom: 8, letterSpacing: "-0.03em" }}>
            Visual Stories
          </h1>
          <p style={{ color: "var(--text-2)", fontSize: "0.95rem" }}>
            A collection of moments captured across various journeys.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", justifyContent: "center", gap: 8, flexWrap: "wrap", marginBottom: 40 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`tab ${filter === cat ? "active" : ""}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Masonry Grid */}
        <div className="portfolio-grid">
          {filteredPhotos.map((photo) => (
            <div
              key={photo.id}
              className="portfolio-item card"
              onClick={() => handleOpenLightbox(photo.id)}
            >
              {/* Using img tag directly for the masonry layout to work properly with natural heights 
                  Next.js Image component often forces specific aspect ratios unless configured correctly */}
              <img src={photo.url} alt={photo.title} loading="lazy" />
              <div className="portfolio-overlay">
                <div className="portfolio-title">{photo.title}</div>
                <div className="portfolio-category">{photo.category}</div>
              </div>
            </div>
          ))}
        </div>

        {filteredPhotos.length === 0 && (
          <div style={{
            textAlign: "center", padding: "80px 24px", color: "var(--text-2)",
            background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)"
          }}>
            <span style={{ fontSize: "2rem", display: "block", marginBottom: 12 }}>📷</span>
            <p>No photos found in this category.</p>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxObj && (
        <Lightbox
          src={lightboxObj.url.replace("&q=80", "&q=100")} // slightly higher quality in lightbox
          alt={lightboxObj.title}
          onClose={() => setLightboxObj(null)}
          onNext={filteredPhotos.length > 1 ? handleNext : undefined}
          onPrev={filteredPhotos.length > 1 ? handlePrev : undefined}
        />
      )}
    </div>
  );
}
