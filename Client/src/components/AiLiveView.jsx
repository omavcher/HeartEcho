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
      const cacheKey = 'alv_influencers';
      const cacheTimeKey = 'alv_influencers_time';
      const cachedData = sessionStorage.getItem(cacheKey);
      const cachedTime = sessionStorage.getItem(cacheTimeKey);
      
      const now = new Date().getTime();
      const ONE_MINUTE_MS = 60000; // 1 minute
      
      if (cachedData && cachedTime && (now - parseInt(cachedTime)) < ONE_MINUTE_MS) {
        setInfluencers(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        const { data } = await axios.get(`${api.Url}/ai-live`);
        if (data.success) {
          const activeOnly = data.data.filter(inf => inf.isActive !== false);
          setInfluencers(activeOnly);
          sessionStorage.setItem(cacheKey, JSON.stringify(activeOnly));
          sessionStorage.setItem(cacheTimeKey, now.toString());
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

  const AiLiveSkeleton = () => (
    <section className="alv-section" aria-label="AI Live Studio">
      <div className="alv-header">
        <div className="alv-header-row">
          <span className="alv-header-dot" style={{background: '#333'}} aria-hidden />
          <h2 className="alv-header-title" style={{display: 'flex', alignItems: 'center'}}>
            <div style={{width: 150, height: 28, background: '#333', borderRadius: 4, animation: 'alv-pulse 1.5s infinite ease-in-out'}} />
          </h2>
        </div>
        <div style={{width: 250, height: 16, background: '#222', borderRadius: 4, marginTop: 10, animation: 'alv-pulse 1.5s infinite ease-in-out'}} />
      </div>

      <div className="alv-scroll-row" role="list">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} role="listitem" className="alv-circle-item">
            <div className="alv-ring" style={{border: '2px solid #333'}}>
              <div className="alv-ring-inner">
                <div style={{width: '100%', height: '100%', borderRadius: '50%', background: '#222', animation: 'alv-pulse 1.5s infinite ease-in-out'}} />
              </div>
            </div>
            <div style={{width: 60, height: 12, background: '#333', borderRadius: 4, marginTop: 14, alignSelf: 'center', animation: 'alv-pulse 1.5s infinite ease-in-out', margin: '14px auto 0'}} />
          </div>
        ))}
      </div>
      <style>{`@keyframes alv-pulse { 0% { opacity: 0.5; } 50% { opacity: 1; } 100% { opacity: 0.5; } }`}</style>
    </section>
  );

  if (loading) return <AiLiveSkeleton />;
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
