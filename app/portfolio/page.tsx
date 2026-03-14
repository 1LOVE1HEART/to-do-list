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
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773458518/2026-01-04-023_b4_qcmtr2.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773459247/2026-01-04-023-%E7%B7%A8%E8%BC%AF_e9gfdr.jpg", 
    title: "拍攝＆修圖", 
    category: "Editing"
  },
  {
    id: 2,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207448/body1_b4_jo2wk2.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207453/body1_ck80hc.jpg", 
    title: "上胸修飾", 
    category: "Editing"
  },
  {
    id: 3,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207445/body2_b4_iq4mwf.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207448/body2_kn92ed.jpg", 
    title: "頸紋修飾", 
    category: "Editing"
  },
  {
    id: 4,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207433/kurosaki_b4_xwhdns.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207443/kurosaki_c9cd65.jpg", 
    title: "青橙色調", 
    category: "Grading"
  },
  {
    id: 5,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773459895/man-with-blue-glasses-looking-up_b4_wcr0kx.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773458535/man-with-blue-glasses-looking-up_zn51zj.jpg", 
    title: "皺摺處理", 
    category: "Editing"
  },
  {
    id: 6,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207432/1_n2_plan_yitxix.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207445/1_n2_plan%E8%AA%BF%E8%89%B2_tltyts.jpg", 
    title: "日系人像", 
    category: "Grading"
  },
  {
    id: 7,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773458713/young-happy-bride-wedding-dress-groom_b4_rrljl0.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773458719/young-happy-bride-wedding-dress-groom_euqbjs.jpg", 
    title: "增添光源", 
    category: "Editing"
  },
  {
    id: 8,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773458457/brides-stands-park-holds-wedding-bouquet-her-back-without-face_b4_l8qnws.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773458452/brides-stands-park-holds-wedding-bouquet-her-back-without-face_um3lih.jpg", 
    title: "裙擺延伸", 
    category: "Editing"
  },
  {
    id: 9,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207442/%E7%A3%A8%E7%9A%AE%E5%94%87%E8%89%B2_xi4uew.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207443/%E7%A3%A8%E7%9A%AE%E5%94%87%E8%89%B2_%E6%8B%B7%E8%B2%9D_fwgco1.jpg", 
    title: "磨膚唇色", 
    category: "Editing"
  },
  {
    id: 10,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207440/rain_b4_a3l2is.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207443/rain_xs8ffv.jpg", 
    title: "青橙色調", 
    category: "Grading"
  },
  {
    id: 11,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207443/orin4_b4_jwacqg.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207437/orin4_bacjyj.png", 
    title: "通透感", 
    category: "Grading"
  },
  {
    id: 12,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207432/2_n2_plan_nw9h72.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207436/2_n2_plan%E8%AA%BF%E8%89%B2_ih3pc5.jpg", 
    title: "日系人像", 
    category: "Grading"
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
