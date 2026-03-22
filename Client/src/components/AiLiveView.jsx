'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import api from "../config/api";
import AiLiveModal from "./AiLiveModal";
import "../styles/AiLiveView.css";

// ─────────────────────────────────────────────────────────────────────────────
// ALL DATA IS STANDALONE — NO BACKEND REQUIRED
// Each influencer has:
//   • 5-6 idle "loop" videos  (4-5 seconds each, 9:16 aspect ratio)
//   • per action: 2-3 reaction videos (played randomly)
// Replace the src paths with your real CDN/Cloudinary URLs.
// ─────────────────────────────────────────────────────────────────────────────

// removed hardcoded AI_INFLUENCERS

// ── Instagram-style Live circle card ─────────────────────────────────────────
function LiveCard({ model, index, onOpen }) {
  return (
    <div
      className="alv-circle-item"
      style={{ animationDelay: `${index * 0.06}s` }}
      onClick={() => onOpen(model)}
      role="button"
      tabIndex={0}
      aria-label={`Watch ${model.name} LIVE`}
      onKeyDown={e => e.key === "Enter" && onOpen(model)}
    >
      {/* Gradient ring — the "live" glow */}
      <div className="alv-ring">
        <div className="alv-ring-inner">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={model.avatar}
            alt={model.name}
            className="alv-circle-img"
            loading="lazy"
            onError={e => { e.target.src = `https://ui-avatars.com/api/?name=${model.name}&background=cf4185&color=fff&size=128`; }}
          />
        </div>
      </div>

      {/* LIVE pill below avatar */}
      <div className="alv-circle-live-pill">
        <span className="alv-circle-live-dot" />LIVE
      </div>

      {/* Name */}
      <span className="alv-circle-name">{model.name}</span>
    </div>
  );
}

// ── Main section ──────────────────────────────────────────────────────────────
export default function AiLiveView() {
  const [activeModel, setActiveModel] = useState(null);
  const [influencers, setInfluencers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInfluencers = async () => {
      try {
        const { data } = await axios.get(`${api.Url}/ai-live`);
        if (data.success) {
          const activeOnly = data.data.filter(inf => inf.isActive !== false);
          setInfluencers(activeOnly);
        }
      } catch (error) {
        console.error("Error fetching AI Live Influencers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInfluencers();
  }, []);

  const handleOpenModel = async (model) => {
    setActiveModel(model);
    try {
      if (model._id) {
        await axios.post(`${api.Url}/ai-live/${model._id}/view`);
      }
    } catch (error) {
      console.error("Failed to increment view:", error);
    }
  };

  if (loading) return <div style={{ color: "white", padding: "20px", textAlign: "center" }}>Loading AI Live Studio...</div>;
  if (!influencers || influencers.length === 0) return null;

  return (
    <section className="alv-section" aria-label="AI Live Studio">
      {/* Header */}
      <div className="alv-header">
        <div className="alv-header-row">
          <span className="alv-header-dot" aria-hidden />
          <h2 className="alv-header-title">
            AI Live <span className="alv-title-accent">Studio</span>
          </h2>
          <span className="alv-beta-badge" aria-label="Beta">Beta</span>
          <span className="alv-header-count">{influencers.length} LIVE</span>
        </div>
        <p className="alv-header-sub">
          Your AI companions are live — tap to interact
        </p>
      </div>

      {/* Scrollable row */}
      <div className="alv-scroll-row" role="list" aria-label="Live influencers">
        {influencers.map((model, i) => (
          <div key={model.id} role="listitem">
            <LiveCard model={model} index={i} onOpen={handleOpenModel} />
          </div>
        ))}
      </div>

      {/* Modal */}
      {activeModel && (
        <AiLiveModal
          model={activeModel}
          onClose={() => setActiveModel(null)}
        />
      )}
    </section>
  );
}
