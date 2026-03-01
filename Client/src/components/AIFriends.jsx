'use client';

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Link from "next/link";
import { Filter, Search, Play, Pause } from "lucide-react";
import api from "../config/api";

function AIFriends() {
  const [aiModels, setAiModels] = useState([]);
  const [filteredModels, setFilteredModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [ageRange, setAgeRange] = useState([18, 50]);
  const [relationshipFilter, setRelationshipFilter] = useState("all");
  const [hoveredCard, setHoveredCard] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const videoRefs = useRef({});

  // --- STYLES INJECTION ---
  const styles = `
    :root {
      --af-bg:          #000000;
      --af-card:        #0a0a0a;
      --af-pink:        #ce4085;
      --af-pink-glow:   rgba(206,64,133,0.18);
      --af-pink-dim:    rgba(206,64,133,0.12);
      --af-border:      rgba(255,255,255,0.07);
      --af-glass:       rgba(14,14,14,0.8);
      --af-text:        #ffffff;
      --af-muted:       #888;
      --af-green:       #00e676;
    }

    .ai-friends-container-38f3a {
      min-height: 50vh;
      background-color: var(--af-bg);
      color: var(--af-text);
      font-family: 'Inter', system-ui, sans-serif;
      padding: 28px 20px 40px;
    }

    /* ── Section heading ─────────────────────────────────── */
    .ai-header-38f3a {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 0;
    }

    .ai-header-38f3a h1 {
      font-size: clamp(1.8rem, 5vw, 2.8rem);
      font-weight: 800;
      margin: 0 0 10px;
      letter-spacing: -1px;
      background: linear-gradient(135deg, #fff 40%, var(--af-pink));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .ai-header-38f3a p {
      color: var(--af-muted);
      font-size: 1rem;
      margin: 0;
      line-height: 1.5;
    }

    /* ── Filter toggle ───────────────────────────────────── */
    .filter-toggle-38f3a {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-toggle-btn-38f3a {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--af-glass);
      border: 1px solid var(--af-border);
      border-radius: 50px;
      color: var(--af-text);
      cursor: pointer;
      transition: all 0.25s;
      font-size: 0.88rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }

    .filter-toggle-btn-38f3a:hover {
      border-color: var(--af-pink);
      color: var(--af-pink);
      background: var(--af-pink-dim);
    }

    /* ── Filters panel ───────────────────────────────────── */
    .ai-filters-panel-38f3a {
      background: var(--af-glass);
      border: 1px solid var(--af-border);
      border-radius: 20px;
      padding: 24px;
      margin-bottom: 32px;
      backdrop-filter: blur(20px);
      animation: slideDown-38f3a 0.28s ease-out;
    }

    .filters-grid-38f3a {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 24px;
    }

    .filter-group-38f3a {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }

    .filter-group-38f3a label {
      font-weight: 700;
      color: var(--af-muted);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 1px;
    }

    .filter-options-38f3a {
      display: flex;
      gap: 7px;
      flex-wrap: wrap;
    }

    .filter-options-38f3a button {
      padding: 7px 15px;
      border: 1px solid var(--af-border);
      background: rgba(255,255,255,0.04);
      color: var(--af-muted);
      border-radius: 30px;
      cursor: pointer;
      transition: all 0.2s;
      font-size: 0.82rem;
      font-weight: 600;
    }

    .filter-options-38f3a button.active-38f3a {
      background: var(--af-pink);
      color: white;
      border-color: var(--af-pink);
    }

    .filter-options-38f3a button:hover:not(.active-38f3a) {
      border-color: var(--af-pink);
      color: var(--af-pink);
      background: var(--af-pink-dim);
    }

    .range-slider-38f3a { padding: 8px 0; }

    .range-slider-38f3a input[type="range"] {
      width: 100%; height: 4px;
      background: var(--af-border); border-radius: 2px;
      outline: none; -webkit-appearance: none;
    }

    .range-slider-38f3a input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px; height: 18px;
      background: var(--af-pink);
      border-radius: 50%; cursor: pointer; border: 2px solid #fff;
    }

    .range-values-38f3a {
      display: flex; justify-content: space-between;
      font-size: 0.8rem; color: var(--af-muted); margin-top: 6px;
    }

    .filter-select-38f3a {
      padding: 9px 14px;
      border: 1px solid var(--af-border);
      background: rgba(255,255,255,0.04);
      color: var(--af-text);
      border-radius: 12px; outline: none; cursor: pointer;
      font-size: 0.88rem; width: 100%;
    }

    .filter-select-38f3a:focus { border-color: var(--af-pink); }

    /* ── Card grid ───────────────────────────────────────── */
    .ai-grid-38f3a {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      padding: 4px 0;
    }

    @media (min-width: 640px) {
      .ai-grid-38f3a { grid-template-columns: repeat(3, 1fr); gap: 18px; }
    }
    @media (min-width: 900px) {
      .ai-grid-38f3a { grid-template-columns: repeat(4, 1fr); gap: 22px; }
    }
    @media (min-width: 1200px) {
      .ai-grid-38f3a { grid-template-columns: repeat(5, 1fr); gap: 22px; }
    }

    /* ── Individual card ─────────────────────────────────── */
    .ai-card-38f3a {
      position: relative;
      border-radius: 18px;
      overflow: hidden;
      background: var(--af-card);
      border: 1px solid var(--af-border);
      transition: all 0.32s cubic-bezier(0.175,0.885,0.32,1.275);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
      display: block;
    }

    .ai-card-38f3a:hover {
      transform: translateY(-8px) scale(1.015);
      border-color: rgba(206,64,133,0.5);
      box-shadow: 0 20px 48px rgba(206,64,133,0.2), 0 0 0 1px rgba(206,64,133,0.15);
    }

    /* Portrait image ratio */
    .portrait-ratio-wrapper-38f3a {
      position: relative;
      width: 100%;
      aspect-ratio: 9/16;
      overflow: hidden;
      background: #111;
    }

    .ai-card-media-38f3a {
      position: absolute;
      top: 0; left: 0;
      width: 100%; height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }

    .ai-model-video-38f3a { opacity: 0; }
    .ai-model-video-38f3a.video-visible-38f3a { opacity: 1; }
    .ai-model-image-38f3a { opacity: 1; }
    .ai-model-image-38f3a.image-hidden-38f3a { opacity: 0; }

    /* Bottom gradient overlay always visible */
    .portrait-ratio-wrapper-38f3a::after {
      content: '';
      position: absolute;
      bottom: 0; left: 0; right: 0;
      height: 55%;
      background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%);
      pointer-events: none;
      z-index: 1;
    }

    /* Quick-info always at bottom (not hidden on hover) */
    .ai-floating-info-38f3a {
      position: absolute;
      bottom: 0; left: 0; right: 0;
      padding: 14px 13px 13px;
      z-index: 2;
      color: white;
    }

    .ai-card-header-38f3a {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 6px;
    }

    .ai-card-header-38f3a h3 {
      margin: 0;
      font-size: 1rem;
      font-weight: 700;
      line-height: 1.2;
      flex: 1;
      text-shadow: 0 1px 4px rgba(0,0,0,0.5);
    }

    .ai-relationship-38f3a {
      background: rgba(206,64,133,0.85);
      backdrop-filter: blur(4px);
      color: white;
      padding: 3px 8px;
      border-radius: 6px;
      font-size: 0.65rem;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.3px;
      flex-shrink: 0;
    }

    .ai-short-description-38f3a {
      margin: 4px 0 0;
      font-size: 0.75rem;
      color: rgba(255,255,255,0.65);
      line-height: 1.35;
    }

    /* Badges */
    .ai-age-38f3a {
      position: absolute; top: 10px; left: 10px;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
      color: white; padding: 3px 8px;
      border-radius: 10px; font-size: 0.72rem; font-weight: 700;
      z-index: 2; border: 1px solid rgba(255,255,255,0.1);
    }

    .ai-gender-38f3a {
      position: absolute; top: 10px; right: 10px;
      background: rgba(0,0,0,0.7); backdrop-filter: blur(6px);
      color: white; width: 28px; height: 28px;
      border-radius: 50%; font-size: 0.8rem;
      display: flex; align-items: center; justify-content: center;
      z-index: 2; border: 1px solid rgba(255,255,255,0.1);
    }

    /* Video indicator */
    .video-indicator-38f3a {
      position: absolute; top: 50%; left: 50%;
      transform: translate(-50%,-50%);
      background: rgba(0,0,0,0.6);
      border-radius: 50%;
      width: 44px; height: 44px;
      display: flex; align-items: center; justify-content: center;
      opacity: 0; transition: opacity 0.25s;
      backdrop-filter: blur(8px); z-index: 2;
      border: 1px solid rgba(255,255,255,0.15);
    }

    .ai-card-38f3a:hover .video-indicator-38f3a { opacity: 1; }

    /* Skeletons */
    .ai-card-38f3a.skeleton-38f3a { pointer-events: none; }

    .skeleton-media-38f3a {
      width: 100%; height: 100%; border-radius: 18px;
      background: linear-gradient(90deg,
        rgba(255,255,255,0.04) 25%,
        rgba(255,255,255,0.08) 50%,
        rgba(255,255,255,0.04) 75%
      );
      background-size: 200% 100%;
      animation: loading-38f3a 1.6s infinite;
    }

    .skeleton-info-38f3a { padding: 12px; }
    .skeleton-line-38f3a {
      height: 11px; background: rgba(255,255,255,0.05);
      border-radius: 6px; margin-bottom: 8px;
      animation: loading-38f3a 1.6s infinite;
    }
    .skeleton-line-38f3a.short-38f3a { width: 55%; }
    .skeleton-line-38f3a.medium-38f3a { width: 78%; }

    /* Error / empty */
    .ai-error-38f3a {
      background: rgba(255,77,77,0.12); color: #ff6b6b;
      border: 1px solid rgba(255,77,77,0.25);
      padding: 14px 20px; border-radius: 12px;
      text-align: center; margin-bottom: 20px; font-size: 0.9rem;
    }

    .ai-empty-38f3a {
      grid-column: 1 / -1;
      text-align: center; padding: 70px 20px; color: var(--af-muted);
    }

    .ai-empty-38f3a h3 { font-size: 1.4rem; margin-bottom: 8px; color: #fff; }
    .ai-empty-38f3a p { font-size: 0.9rem; }

    /* Animations */
    @keyframes slideDown-38f3a {
      from { opacity: 0; transform: translateY(-15px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes loading-38f3a {
      0%   { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
  `;

  useEffect(() => {
    axios
      .get(`${api.Url}/user/get-pre-ai`)
      .then((response) => {
        setAiModels(response.data.data);
        setFilteredModels(response.data.data);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching data:", error);
        setError("Failed to load AI models. Please try again.");
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    let filtered = aiModels;
    
    if (activeTab !== "all") {
      filtered = filtered.filter(model => model.gender === activeTab);
    }
    
    filtered = filtered.filter(model => 
      model.age >= ageRange[0] && model.age <= ageRange[1]
    );
    
    if (relationshipFilter !== "all") {
      filtered = filtered.filter(model => 
        model.relationship.toLowerCase().includes(relationshipFilter.toLowerCase())
      );
    }
    
    setFilteredModels(filtered);
  }, [activeTab, ageRange, relationshipFilter, aiModels]);

  const relationshipTypes = [...new Set(aiModels.map(model => model.relationship))];

  const getShortDescription = (description) => {
    const words = description.split(" ");
    return words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");
  };

  const handleMouseEnter = (modelId) => {
    setHoveredCard(modelId);
    const video = videoRefs.current[modelId];
    if (video) {
      video.currentTime = 0;
      video.play().catch(error => {
        console.log("Video play failed:", error);
      });
    }
  };

  const handleMouseLeave = (modelId) => {
    setHoveredCard(null);
    const video = videoRefs.current[modelId];
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  };

  const hasVideo = (model) => {
    return model.avatar_motion_video && model.avatar_motion_video.trim() !== "";
  };

  return (
    <div className="ai-friends-container-38f3a">
      <style>{styles}</style>

      {/* Header */}
      <div className="ai-header-38f3a">
        <h1>Meet Your AI Companions</h1>
        <p>Discover amazing AI personalities ready to chat with you</p>
      </div>

      {/* Filter Toggle */}
      <div className="filter-toggle-38f3a">
        <button 
          className="filter-toggle-btn-38f3a"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="ai-filters-panel-38f3a">
          <div className="filters-grid-38f3a">
            <div className="filter-group-38f3a">
              <label>Gender</label>
              <div className="filter-options-38f3a">
                {['all', 'female', 'male'].map(gender => (
                  <button
                    key={gender}
                    className={activeTab === gender ? 'active-38f3a' : ''}
                    onClick={() => setActiveTab(gender)}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group-38f3a">
              <label>Age Range</label>
              <div className="range-slider-38f3a">
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={ageRange[0]}
                  onChange={(e) => setAgeRange([parseInt(e.target.value), ageRange[1]])}
                />
                <input
                  type="range"
                  min="18"
                  max="50"
                  value={ageRange[1]}
                  onChange={(e) => setAgeRange([ageRange[0], parseInt(e.target.value)])}
                />
                <div className="range-values-38f3a">
                  <span>{ageRange[0]}</span>
                  <span>{ageRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="filter-group-38f3a">
              <label>Personality Type</label>
              <select
                className="filter-select-38f3a"
                value={relationshipFilter}
                onChange={(e) => setRelationshipFilter(e.target.value)}
              >
                <option value="all">All Personalities</option>
                {relationshipTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && <div className="ai-error-38f3a">{error}</div>}

      {/* AI Models Grid */}
      <div className="ai-grid-38f3a">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div className="ai-card-38f3a skeleton-38f3a" key={index}>
              <div className="portrait-ratio-wrapper-38f3a">
                <div className="skeleton-media-38f3a"></div>
              </div>
              <div className="skeleton-info-38f3a">
                <div className="skeleton-line-38f3a short-38f3a"></div>
                <div className="skeleton-line-38f3a medium-38f3a"></div>
              </div>
            </div>
          ))
        ) : filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <Link 
              href={`/chatbox?chatId=${model._id}`} 
              className="ai-card-38f3a" 
              key={model._id}
              onMouseEnter={() => handleMouseEnter(model._id)}
              onMouseLeave={() => handleMouseLeave(model._id)}
            >
              <div className="portrait-ratio-wrapper-38f3a">
                {/* Video element - only show when hovering and video exists */}
                {hasVideo(model) && (
                  <video
                    ref={el => videoRefs.current[model._id] = el}
                    src={model.avatar_motion_video}
                    className={`ai-card-media-38f3a ai-model-video-38f3a ${hoveredCard === model._id ? 'video-visible-38f3a' : 'video-hidden-38f3a'}`}
                    loop
                    muted
                    playsInline
                    preload="metadata"
                  />
                )}
                
                {/* Fallback image - show when not hovering or no video */}
                <img 
                  src={model.avatar_img} 
                  alt={model.name}
                  className={`ai-card-media-38f3a ai-model-image-38f3a ${hasVideo(model) && hoveredCard === model._id ? 'image-hidden-38f3a' : 'image-visible-38f3a'}`}
                />

                
                <span className="ai-age-38f3a">{model.age}</span>
                <span className="ai-gender-38f3a">
                  {model.gender === 'female' ? '♀' : '♂'}
                </span>
                
                {/* Floating info at bottom */}
                <div className="ai-floating-info-38f3a">
                  <div className="ai-card-header-38f3a">
                    <h3>{model.name}</h3>
                    <span className="ai-relationship-38f3a">{model.relationship}</span>
                  </div>
                  <p className="ai-short-description-38f3a">
                    {getShortDescription(model.description)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="ai-empty-38f3a">
            <h3>No matches found</h3>
            <p>Try adjusting your filters to discover more AI companions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFriends;