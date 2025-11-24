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
      --bg-dark: #000000ff;
      --bg-card: #000000ff;
      --primary: #cf4185;
      --primary-dark: #9d2f63;
      --text-main: #ffffff;
      --text-muted: #a1a1a1;
      --glass-bg: rgba(20, 20, 20, 0.7);
      --glass-border: rgba(255, 255, 255, 0.08);
      --accent: #00e676;
    }

    .ai-friends-container {
      min-height: 100vh;
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Inter', sans-serif;
      padding: 20px;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(207, 65, 133, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(65, 105, 225, 0.1) 0%, transparent 50%);
    }

    /* Header */
    .ai-header {
      text-align: center;
      margin-bottom: 30px;
    }

    .ai-header h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, var(--primary), var(--accent));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -1px;
    }

    .ai-header p {
      color: var(--text-muted);
      font-size: 1.1rem;
      margin-top: 10px;
    }

    /* Filter Toggle */
    .filter-toggle {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .filter-toggle-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 25px;
      color: var(--text-main);
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .filter-toggle-btn:hover {
      border-color: var(--primary);
      transform: translateY(-2px);
    }

    /* Filters Panel */
    .ai-filters-panel {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 20px;
      padding: 25px;
      margin-bottom: 30px;
      backdrop-filter: blur(20px);
      animation: slideDown 0.3s ease-out;
    }

    .filters-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 25px;
    }

    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .filter-group label {
      font-weight: 600;
      color: var(--text-main);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-options {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-options button {
      padding: 8px 16px;
      border: 1px solid var(--glass-border);
      background: rgba(255,255,255,0.05);
      color: var(--text-muted);
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.85rem;
    }

    .filter-options button.active {
      background: var(--primary);
      color: white;
      border-color: var(--primary);
    }

    .filter-options button:hover:not(.active) {
      border-color: var(--primary);
      color: var(--primary);
    }

    .range-slider {
      position: relative;
      padding: 10px 0;
    }

    .range-slider input[type="range"] {
      width: 100%;
      height: 4px;
      background: var(--glass-border);
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
    }

    .range-slider input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--primary);
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid white;
    }

    .range-values {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-muted);
      margin-top: 5px;
    }

    .filter-select {
      padding: 10px 15px;
      border: 1px solid var(--glass-border);
      background: rgba(255,255,255,0.05);
      color: var(--text-main);
      border-radius: 12px;
      outline: none;
      cursor: pointer;
    }

    .filter-select:focus {
      border-color: var(--primary);
    }

    /* Grid */
    .ai-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
      padding: 20px 0;
    }

    /* AI Card */
    .ai-card {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .ai-card:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: var(--primary);
      box-shadow: 0 20px 40px rgba(207, 65, 133, 0.2);
    }

    .portrait-ratio-wrapper {
      position: relative;
      width: 100%;
      aspect-ratio: 9/16;
      overflow: hidden;
    }

    .ai-card-media {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }

    .ai-model-video {
      opacity: 0;
    }

    .ai-model-video.video-visible {
      opacity: 1;
    }

    .ai-model-image {
      opacity: 1;
    }

    .ai-model-image.image-hidden {
      opacity: 0;
    }

    /* Card Badges */
    .ai-age {
      position: absolute;
      top: 12px;
      left: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 600;
      backdrop-filter: blur(10px);
    }

    .ai-gender {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(0,0,0,0.7);
      color: white;
      padding: 4px 8px;
      border-radius: 50%;
      font-size: 0.8rem;
      backdrop-filter: blur(10px);
    }

    /* Floating Info */
    .ai-floating-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      background: linear-gradient(transparent, rgba(0,0,0,0.9));
      padding: 20px 15px 15px;
      color: white;
      transform: translateY(100%);
      transition: transform 0.3s ease;
    }

    .ai-card:hover .ai-floating-info {
      transform: translateY(0);
    }

    .ai-card-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .ai-card-header h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .ai-relationship {
      background: var(--primary);
      color: white;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ai-short-description {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.9;
      line-height: 1.4;
    }

    /* Video Play Indicator */
    .video-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0,0,0,0.7);
      border-radius: 50%;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .ai-card:hover .video-indicator {
      opacity: 1;
    }

    /* Loading States */
    .ai-card.skeleton {
      pointer-events: none;
    }

    .skeleton-media {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
      background-size: 200% 100%;
      animation: loading 1.5s infinite;
      border-radius: 20px;
    }

    .skeleton-info {
      padding: 15px;
    }

    .skeleton-line {
      height: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 6px;
      margin-bottom: 8px;
      animation: loading 1.5s infinite;
    }

    .skeleton-line.short {
      width: 60%;
    }

    .skeleton-line.medium {
      width: 80%;
    }

    /* Error & Empty States */
    .ai-error {
      background: #ff4d4d;
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 20px;
    }

    .ai-empty {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted);
    }

    .ai-empty h3 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    /* Animations */
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes loading {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .ai-grid {
        grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
        gap: 20px;
      }
      
      .filters-grid {
        grid-template-columns: 1fr;
      }
      
      .ai-header h1 {
        font-size: 2rem;
      }
    }

    @media (max-width: 480px) {
      .ai-grid {
        grid-template-columns: 1fr;
      }
      
      .ai-friends-container {
        padding: 15px;
      }
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
    <div className="ai-friends-container">
      <style>{styles}</style>

      {/* Header */}
      <div className="ai-header">
        <h1>Meet Your AI Companions</h1>
        <p>Discover amazing AI personalities ready to chat with you</p>
      </div>

      {/* Filter Toggle */}
      <div className="filter-toggle">
        <button 
          className="filter-toggle-btn"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="ai-filters-panel">
          <div className="filters-grid">
            <div className="filter-group">
              <label>Gender</label>
              <div className="filter-options">
                {['all', 'female', 'male'].map(gender => (
                  <button
                    key={gender}
                    className={activeTab === gender ? 'active' : ''}
                    onClick={() => setActiveTab(gender)}
                  >
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div className="filter-group">
              <label>Age Range</label>
              <div className="range-slider">
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
                <div className="range-values">
                  <span>{ageRange[0]}</span>
                  <span>{ageRange[1]}</span>
                </div>
              </div>
            </div>

            <div className="filter-group">
              <label>Personality Type</label>
              <select
                className="filter-select"
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
      {error && <div className="ai-error">{error}</div>}

      {/* AI Models Grid */}
      <div className="ai-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div className="ai-card skeleton" key={index}>
              <div className="portrait-ratio-wrapper">
                <div className="skeleton-media"></div>
              </div>
              <div className="skeleton-info">
                <div className="skeleton-line short"></div>
                <div className="skeleton-line medium"></div>
              </div>
            </div>
          ))
        ) : filteredModels.length > 0 ? (
          filteredModels.map((model) => (
            <Link 
              href={`/chatbox?chatId=${model._id}`} 
              className="ai-card" 
              key={model._id}
              onMouseEnter={() => handleMouseEnter(model._id)}
              onMouseLeave={() => handleMouseLeave(model._id)}
            >
              <div className="portrait-ratio-wrapper">
                {/* Video element - only show when hovering and video exists */}
                {hasVideo(model) && (
                  <video
                    ref={el => videoRefs.current[model._id] = el}
                    src={model.avatar_motion_video}
                    className={`ai-card-media ai-model-video ${hoveredCard === model._id ? 'video-visible' : 'video-hidden'}`}
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
                  className={`ai-card-media ai-model-image ${hasVideo(model) && hoveredCard === model._id ? 'image-hidden' : 'image-visible'}`}
                />

                
                <span className="ai-age">{model.age}</span>
                <span className="ai-gender">
                  {model.gender === 'female' ? '♀' : '♂'}
                </span>
                
                {/* Floating info at bottom */}
                <div className="ai-floating-info">
                  <div className="ai-card-header">
                    <h3>{model.name}</h3>
                    <span className="ai-relationship">{model.relationship}</span>
                  </div>
                  <p className="ai-short-description">
                    {getShortDescription(model.description)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="ai-empty">
            <h3>No matches found</h3>
            <p>Try adjusting your filters to discover more AI companions</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFriends;