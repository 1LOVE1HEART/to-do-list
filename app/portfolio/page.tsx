"use client";

import { useState } from "react";
import Link from "next/link";
import BeforeAfterSlider from "@/components/BeforeAfterSlider";
import "../portfolio.css";

const CATEGORIES = ["修圖", "調色", "攝影", "全部"];

// Mock dataset with before and after images
const PHOTOS = [
  {
    id: 1,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773739338/2026-01-04-023_b4_up7mtj.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773740278/2026-01-04-023-%E7%B7%A8%E8%BC%AF_j19n20.jpg", 
    title: "拍攝＆人像精修", 
    category: "修圖"
  },
  {
    id: 2,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773802352/db_chin_b4_ozbaq1.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773802352/db_chin_yn95vu.jpg", 
    title: "雙下巴修飾", 
    category: "修圖"
  },
  {
    id: 3,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207445/body2_b4_iq4mwf.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207448/body2_kn92ed.jpg", 
    title: "頸部修飾", 
    category: "修圖"
  },
  {
    id: 4,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773740279/kurosaki_b4_ylcgpl.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773739358/kurosaki_dloa8w.jpg", 
    title: "青橙色調", 
    category: "調色"
  },
  {
    id: 5,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773739845/wedding-bouquet_b4_w4wfcr.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773739843/wedding-bouquet_rz4ze1.jpg", 
    title: "裙擺延伸", 
    category: "修圖"
  },
  {
    id: 6,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207432/1_n2_plan_yitxix.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207445/1_n2_plan%E8%AA%BF%E8%89%B2_tltyts.jpg", 
    title: "日系人像", 
    category: "調色"
  },
  {
    id: 7,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773740489/young-happy-bride-wedding-dress-groom_b4_nzva3d.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773740489/young-happy-bride-wedding-dress-groom_fbugxa.jpg", 
    title: "增添光源", 
    category: "調色"
  },
  {
    id: 9,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207442/%E7%A3%A8%E7%9A%AE%E5%94%87%E8%89%B2_xi4uew.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207443/%E7%A3%A8%E7%9A%AE%E5%94%87%E8%89%B2_%E6%8B%B7%E8%B2%9D_fwgco1.jpg", 
    title: "磨膚唇色", 
    category: "修圖"
  },
  {
    id: 8,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773739600/handsome-man-with-blue_b4_esg6bv.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773739599/handsome-man-with-blue_emuaew.jpg", 
    title: "衣服皺摺處理", 
    category: "修圖"
  },
  {
    id: 10,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207440/rain_b4_a3l2is.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207443/rain_xs8ffv.jpg", 
    title: "青橙色調", 
    category: "調色"
  },
  {
    id: 11,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207443/orin4_b4_jwacqg.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207437/orin4_bacjyj.png", 
    title: "通透感", 
    category: "調色"
  },
  {
    id: 12,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207432/2_n2_plan_nw9h72.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207436/2_n2_plan%E8%AA%BF%E8%89%B2_ih3pc5.jpg", 
    title: "日系人像", 
    category: "調色"
  },
  {
    id: 13,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207448/body1_b4_jo2wk2.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773207453/body1_ck80hc.jpg", 
    title: "曝光修飾", 
    category: "修圖"
  },
  {
    id: 14,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804220/z99-0_ym3ntd.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804220/z99-0_ym3ntd.jpg", 
    title: "人像攝影", 
    category: "攝影"
  },
  {
    id: 15,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804220/z99-6_kduysy.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804220/z99-6_kduysy.jpg", 
    title: "人像攝影", 
    category: "攝影"
  },
  {
    id: 16,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804224/z99-3_jb6diy.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804224/z99-3_jb6diy.jpg", 
    title: "人像攝影", 
    category: "攝影"
  },
  {
    id: 17,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804225/z99-4_hcj6fj.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804225/z99-4_hcj6fj.jpg", 
    title: "人像攝影", 
    category: "攝影"
  },
  {
    id: 18,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804225/z99-5_rwkcrx.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804225/z99-5_rwkcrx.jpg", 
    title: "人像攝影", 
    category: "攝影"
  },
  {
    id: 19,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804219/z99-2_lndh1p.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804219/z99-2_lndh1p.jpg", 
    title: "人像攝影", 
    category: "攝影"
  },
  {
    id: 20,
    beforeUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804218/z99-1_k9gcde.jpg", 
    afterUrl: "https://res.cloudinary.com/dkrjivn7z/image/upload/v1773804218/z99-1_k9gcde.jpg", 
    title: "人像攝影", 
    category: "攝影"
  },
];

export default function PortfolioPage() {
  const [filter, setFilter] = useState("修圖");
  const [activePhotoId, setActivePhotoId] = useState<number>(PHOTOS[0].id);

  const filteredPhotos = filter === "全部" ? PHOTOS : PHOTOS.filter((p) => p.category === filter);
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
