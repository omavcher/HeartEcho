'use client';

import { useState } from "react";
import AiLiveModal from "./AiLiveModal";
import "../styles/AiLiveView.css";

// ─────────────────────────────────────────────────────────────────────────────
// ALL DATA IS STANDALONE — NO BACKEND REQUIRED
// Each influencer has:
//   • 5-6 idle "loop" videos  (4-5 seconds each, 9:16 aspect ratio)
//   • per action: 2-3 reaction videos (played randomly)
// Replace the src paths with your real CDN/Cloudinary URLs.
// ─────────────────────────────────────────────────────────────────────────────

export const AI_INFLUENCERS = [
  {
    id: "janvi",
    name: "Janvi",
    tag: "Lifestyle",
    age: 22,
    gender: "female",
    avatar: "/live_models/janvi/avatar.jpg",
    // Idle loop videos — shown randomly when no action is triggered
    idleVideos: [
      "/live_models/janvi/idle_1.mp4",
      "/live_models/janvi/idle_2.mp4",
      "/live_models/janvi/idle_3.mp4",
      "/live_models/janvi/idle_4.mp4",
      "/live_models/janvi/idle_5.mp4",
    ],
    // Reaction videos per action (2-3 each)
    actionVideos: {
      wave:  ["/live_models/janvi/wave1.mp4", "/live_models/janvi/wave2.mp4"],
      dance: ["/live_models/janvi/dance1.mp4", "/live_models/janvi/dance2.mp4"],
      naughty:  ["/live_models/janvi/naughty1.mp4", "/live_models/janvi/naughty2.mp4"],
      kiss:  ["/live_models/janvi/kiss1.mp4", "/live_models/janvi/kiss2.mp4"],
      pose:  ["/live_models/janvi/pose1.mp4", "/live_models/janvi/pose2.mp4"],
      hot_show: ["/live_models/janvi/hot_show1.mp4", "/live_models/janvi/hot_show2.mp4"],
    },
  }
];

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
          <span className="alv-header-count">{AI_INFLUENCERS.length} LIVE</span>
        </div>
        <p className="alv-header-sub">
          Your AI companions are live — tap to interact
        </p>
      </div>

      {/* Scrollable row */}
      <div className="alv-scroll-row" role="list" aria-label="Live influencers">
        {AI_INFLUENCERS.map((model, i) => (
          <div key={model.id} role="listitem">
            <LiveCard model={model} index={i} onOpen={setActiveModel} />
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
