"use client";

import { useState } from "react";
import Link from "next/link";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import "../portfolio.css";

const CATEGORIES = ["All", "Editing", "Grading"];

// Mock dataset with before and after images
const PHOTOS = [
  {
    id: 1,
    beforeUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80&sat=-100", 
    afterUrl: "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=800&q=80", 
    title: "Neon Tokyo", 
    category: "Grading"
  },
  {
    id: 2,
    beforeUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=60&bri=-20", 
    afterUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80", 
    title: "Warm Coffee", 
    category: "Editing"
  },
  {
    id: 3,
    beforeUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=60&con=-20", 
    afterUrl: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=800&q=80", 
    title: "Alpine Peaks", 
    category: "Grading"
  },
  {
    id: 4,
    beforeUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80&sat=-50", 
    afterUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80", 
    title: "Studio Light", 
    category: "Editing"
  },
  {
    id: 5,
    beforeUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&sat=-80", 
    afterUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80", 
    title: "Concrete Jungle", 
    category: "Grading"
  },
  {
    id: 6,
    beforeUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80&con=-30", 
    afterUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", 
    title: "Autumn Road", 
    category: "Grading"
  },
  {
    id: 7,
    beforeUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=60&bri=-20", 
    afterUrl: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=800&q=80", 
title: "Autumn Road", 
    category: "Editing"
  },
  {
    id: 8,
    beforeUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80&sat=-80", 
    afterUrl: "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&q=80", 
    title: "Concrete Jungle", 
    category: "Grading"
  },
  {
    id: 9,
    beforeUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80&con=-30", 
    afterUrl: "https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=800&q=80", 
    title: "Autumn Road", 
    category: "Editing"
  },
];

export default function PortfolioPage() {
  const [filter, setFilter] = useState("All");
  const [activePhotoId, setActivePhotoId] = useState<number>(PHOTOS[0].id);

  const filteredPhotos = filter === "All" ? PHOTOS : PHOTOS.filter((p) => p.category === filter);
  const activePhoto = PHOTOS.find((p) => p.id === activePhotoId) || PHOTOS[0];

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
            Cook's 
          </span>
          <span style={{
            fontSize: "0.7rem", background: "var(--accent-soft)", color: "var(--accent)",
            padding: "2px 8px", borderRadius: 99, fontWeight: 600,
          }}>
            Portfolio
          </span>
        </div>
        {/* <div style={{ display: "flex", gap: 8 }}>
          <Link href="/" className="btn btn-secondary btn-sm">← Back to Tasks</Link>
        </div> */}
      </header>

      <main style={{ maxWidth: 1400, margin: "0 auto", padding: "24px 16px 10px", }}>
        
        {/* Split Layout Container */}
        <div className="flex flex-col md:flex-row gap-3 sm:gap-8">
          
          {/* Left Pane: Before / After Slider */}
          <div style={{ flex: 2, position: "relative" }}>
            <div style={{ position: "sticky", top: 80 }}>
              <BeforeAfterSlider 
                key={activePhoto.id}
                beforeUrl={activePhoto.beforeUrl} 
                afterUrl={activePhoto.afterUrl} 
              />
              <div style={{ marginTop: "0.5rem", textAlign: "center" }}>
                <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>{activePhoto.title}</h2>
                <p style={{ color: "var(--text-2)", fontSize: "0.9rem" }}>{activePhoto.category}</p>
              </div>
            </div>
          </div>

          {/* Right Pane: Filters & Gallery Grid */}
          <div className="flex-1 min-w-0 flex flex-col md:max-h-[80vh]">
            
            {/* Filters */}
            <div className="gap-2 mb-2 sm:mb-6" style={{ display: "flex", marginBottom: "0.8rem", flexWrap: "wrap", justifyContent: "center", flexShrink: 0 }}>
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

            {/* Gallery Grid */}
            <div className="portfolio-grid" style={{ minHeight: 0 }}>
              {filteredPhotos.map((photo) => (
                <div
                  key={photo.id}
                  className="portfolio-item card"
                  onClick={() => setActivePhotoId(photo.id)}
                  style={{
                    border: activePhotoId === photo.id ? "3px solid var(--accent)" : "1px solid var(--border)",
                    boxShadow: activePhotoId === photo.id ? "0 4px 16px rgba(196,119,58,0.3)" : "var(--shadow-sm)",
                  }}
                >
                  <img src={photo.afterUrl} alt={photo.title} loading="lazy" />
                  <div className="portfolio-overlay">
                    <div className="portfolio-title">{photo.title}</div>
                    <div className="portfolio-category">{photo.category}</div>
                  </div>
                </div>
              ))}
            </div>

            {filteredPhotos.length === 0 && (
              <div style={{ textAlign: "center", padding: "80px 24px", color: "var(--text-2)", background: "var(--surface)", borderRadius: "var(--radius-lg)", border: "1px dashed var(--border)" }}>
                <span style={{ fontSize: "2rem", display: "block", marginBottom: 12 }}>📷</span>
                <p>No photos found in this category.</p>
              </div>
            )}
            
          </div>
        </div>

      </main>
    </div>
  );
}
