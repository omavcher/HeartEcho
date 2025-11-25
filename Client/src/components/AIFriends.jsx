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
      --bg-dark-38f3a: #000000ff;
      --bg-card-38f3a: #000000ff;
      --primary-38f3a: #cf4185;
      --primary-dark-38f3a: #9d2f63;
      --text-main-38f3a: #ffffff;
      --text-muted-38f3a: #a1a1a1;
      --glass-bg-38f3a: rgba(20, 20, 20, 0.7);
      --glass-border-38f3a: rgba(255, 255, 255, 0.08);
      --accent-38f3a: #00e676;
    }

    .ai-friends-container-38f3a {
      min-height: 100vh;
      background-color: var(--bg-dark-38f3a);
      color: var(--text-main-38f3a);
      font-family: 'Inter', sans-serif;
      padding: 20px;
      background-image: 
        radial-gradient(circle at 20% 80%, rgba(207, 65, 133, 0.1) 0%, transparent 50%),
        radial-gradient(circle at 80% 20%, rgba(65, 105, 225, 0.1) 0%, transparent 50%);
    }

    /* Header */
    .ai-header-38f3a {
      text-align: center;
      margin-bottom: 30px;
    }

    .ai-header-38f3a h1 {
      font-size: 2.5rem;
      font-weight: 800;
      margin: 0;
      background: linear-gradient(135deg, var(--primary-38f3a), var(--accent-38f3a));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      letter-spacing: -1px;
    }

    .ai-header-38f3a p {
      color: var(--text-muted-38f3a);
      font-size: 1.1rem;
      margin-top: 10px;
    }

    /* Filter Toggle */
    .filter-toggle-38f3a {
      display: flex;
      justify-content: center;
      margin-bottom: 20px;
    }

    .filter-toggle-btn-38f3a {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 10px 20px;
      background: var(--glass-bg-38f3a);
      border: 1px solid var(--glass-border-38f3a);
      border-radius: 25px;
      color: var(--text-main-38f3a);
      cursor: pointer;
      transition: all 0.3s ease;
      backdrop-filter: blur(10px);
    }

    .filter-toggle-btn-38f3a:hover {
      border-color: var(--primary-38f3a);
      transform: translateY(-2px);
    }

    /* Filters Panel */
    .ai-filters-panel-38f3a {
      background: var(--glass-bg-38f3a);
      border: 1px solid var(--glass-border-38f3a);
      border-radius: 20px;
      padding: 25px;
      margin-bottom: 30px;
      backdrop-filter: blur(20px);
      animation: slideDown-38f3a 0.3s ease-out;
    }

    .filters-grid-38f3a {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 25px;
    }

    .filter-group-38f3a {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }

    .filter-group-38f3a label {
      font-weight: 600;
      color: var(--text-main-38f3a);
      font-size: 0.9rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .filter-options-38f3a {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
    }

    .filter-options-38f3a button {
      padding: 8px 16px;
      border: 1px solid var(--glass-border-38f3a);
      background: rgba(255,255,255,0.05);
      color: var(--text-muted-38f3a);
      border-radius: 15px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 0.85rem;
    }

    .filter-options-38f3a button.active-38f3a {
      background: var(--primary-38f3a);
      color: white;
      border-color: var(--primary-38f3a);
    }

    .filter-options-38f3a button:hover:not(.active-38f3a) {
      border-color: var(--primary-38f3a);
      color: var(--primary-38f3a);
    }

    .range-slider-38f3a {
      position: relative;
      padding: 10px 0;
    }

    .range-slider-38f3a input[type="range"] {
      width: 100%;
      height: 4px;
      background: var(--glass-border-38f3a);
      border-radius: 2px;
      outline: none;
      -webkit-appearance: none;
    }

    .range-slider-38f3a input[type="range"]::-webkit-slider-thumb {
      -webkit-appearance: none;
      width: 18px;
      height: 18px;
      background: var(--primary-38f3a);
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid white;
    }

    .range-values-38f3a {
      display: flex;
      justify-content: space-between;
      font-size: 0.8rem;
      color: var(--text-muted-38f3a);
      margin-top: 5px;
    }

    .filter-select-38f3a {
      padding: 10px 15px;
      border: 1px solid var(--glass-border-38f3a);
      background: rgba(255,255,255,0.05);
      color: var(--text-main-38f3a);
      border-radius: 12px;
      outline: none;
      cursor: pointer;
    }

    .filter-select-38f3a:focus {
      border-color: var(--primary-38f3a);
    }

    /* Grid - Updated for 2 cards per row on mobile */
    .ai-grid-38f3a {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: 25px;
      padding: 20px 0;
    }

    /* AI Card */
    .ai-card-38f3a {
      position: relative;
      border-radius: 20px;
      overflow: hidden;
      background: var(--bg-card-38f3a);
      border: 1px solid var(--glass-border-38f3a);
      transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      cursor: pointer;
      text-decoration: none;
      color: inherit;
    }

    .ai-card-38f3a:hover {
      transform: translateY(-10px) scale(1.02);
      border-color: var(--primary-38f3a);
      box-shadow: 0 20px 40px rgba(207, 65, 133, 0.2);
    }

    .portrait-ratio-wrapper-38f3a {
      position: relative;
      width: 100%;
      aspect-ratio: 9/16;
      overflow: hidden;
    }

    .ai-card-media-38f3a {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }

    .ai-model-video-38f3a {
      opacity: 0;
    }

    .ai-model-video-38f3a.video-visible-38f3a {
      opacity: 1;
    }

    .ai-model-image-38f3a {
      opacity: 1;
    }

    .ai-model-image-38f3a.image-hidden-38f3a {
      opacity: 0;
    }

    /* Card Badges */
    .ai-age-38f3a {
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

    .ai-gender-38f3a {
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
    .ai-floating-info-38f3a {
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

    .ai-card-38f3a:hover .ai-floating-info-38f3a {
      transform: translateY(0);
    }

    .ai-card-header-38f3a {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }

    .ai-card-header-38f3a h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 700;
    }

    .ai-relationship-38f3a {
      background: var(--primary-38f3a);
      color: white;
      padding: 4px 8px;
      border-radius: 8px;
      font-size: 0.7rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .ai-short-description-38f3a {
      margin: 0;
      font-size: 0.85rem;
      opacity: 0.9;
      line-height: 1.4;
    }

    /* Video Play Indicator */
    .video-indicator-38f3a {
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

    .ai-card-38f3a:hover .video-indicator-38f3a {
      opacity: 1;
    }

    /* Loading States */
    .ai-card-38f3a.skeleton-38f3a {
      pointer-events: none;
    }

    .skeleton-media-38f3a {
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, rgba(255,255,255,0.05) 25%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.05) 75%);
      background-size: 200% 100%;
      animation: loading-38f3a 1.5s infinite;
      border-radius: 20px;
    }

    .skeleton-info-38f3a {
      padding: 15px;
    }

    .skeleton-line-38f3a {
      height: 12px;
      background: rgba(255,255,255,0.05);
      border-radius: 6px;
      margin-bottom: 8px;
      animation: loading-38f3a 1.5s infinite;
    }

    .skeleton-line-38f3a.short-38f3a {
      width: 60%;
    }

    .skeleton-line-38f3a.medium-38f3a {
      width: 80%;
    }

    /* Error & Empty States */
    .ai-error-38f3a {
      background: #ff4d4d;
      color: white;
      padding: 15px 20px;
      border-radius: 12px;
      text-align: center;
      margin-bottom: 20px;
    }

    .ai-empty-38f3a {
      grid-column: 1 / -1;
      text-align: center;
      padding: 60px 20px;
      color: var(--text-muted-38f3a);
    }

    .ai-empty-38f3a h3 {
      font-size: 1.5rem;
      margin-bottom: 10px;
    }

    /* Animations */
    @keyframes slideDown-38f3a {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @keyframes loading-38f3a {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Responsive - Updated for 2 cards per row on mobile */
    @media (max-width: 768px) {
      .ai-grid-38f3a {
        grid-template-columns: repeat(2, 1fr);
        gap: 15px;
      }
      
      .filters-grid-38f3a {
        grid-template-columns: 1fr;
      }
      
      .ai-header-38f3a h1 {
        font-size: 2rem;
      }
      
      .ai-card-38f3a {
        max-width: 100%;
      }
      
      .portrait-ratio-wrapper-38f3a {
        aspect-ratio: 9/16;
      }
      
      .ai-floating-info-38f3a {
        padding: 15px 10px 10px;
      }
      
      .ai-card-header-38f3a h3 {
        font-size: 1rem;
      }
      
      .ai-relationship-38f3a {
        font-size: 0.6rem;
        padding: 3px 6px;
      }
      
      .ai-short-description-38f3a {
        font-size: 0.75rem;
      }
    }

    @media (max-width: 480px) {
      .ai-grid-38f3a {
        grid-template-columns: repeat(2, 1fr);
        gap: 12px;
      }
      
      .ai-friends-container-38f3a {
        padding: 15px;
      }
      
      .ai-card-38f3a:hover {
        transform: translateY(-5px) scale(1.01);
      }
      
      .ai-age-38f3a,
      .ai-gender-38f3a {
        top: 8px;
        font-size: 0.7rem;
        padding: 3px 6px;
      }
    }

    /* Tablet Styles */
    @media (min-width: 769px) and (max-width: 1024px) {
      .ai-grid-38f3a {
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
      }
    }

    /* Large Desktop */
    @media (min-width: 1200px) {
      .ai-grid-38f3a {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      }
    }

    /* Small mobile devices */
    @media (max-width: 360px) {
      .ai-grid-38f3a {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
      }
      
      .ai-friends-container-38f3a {
        padding: 10px;
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