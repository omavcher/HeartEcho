'use client';

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import '../styles/AIFriends.css';
import Link from "next/link";
import "react-loading-skeleton/dist/skeleton.css";
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
  const videoRefs = useRef({});

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
    <div className="ai-container">
      {error && <div className="ai-error">{error}</div>}

      <div className="ai-filters">
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
          <label>Age: {ageRange[0]} - {ageRange[1]}</label>
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
          </div>
        </div>

        <div className="filter-group">
          <label>Personality</label>
          <select
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

      <div className="ai-grid">
        {loading ? (
          Array.from({ length: 8 }).map((_, index) => (
            <div className="ai-card skeleton" key={index}>
              <div className="portrait-ratio-wrapper">
                <div className="ai-card-image">
                  <Skeleton height="100%" containerClassName="skeleton-image" />
                </div>
              </div>
              <div className="ai-floating-info">
                <Skeleton width={120} height={24} />
                <Skeleton width={180} height={20} />
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
                <div className="ai-card-image">
                  {/* Video element - only show when hovering and video exists */}
                  {hasVideo(model) && (
                    <video
                      ref={el => videoRefs.current[model._id] = el}
                      src={model.avatar_motion_video}
                      className={`ai-model-video ${hoveredCard === model._id ? 'video-visible' : 'video-hidden'}`}
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
                    className={`${hasVideo(model) && hoveredCard === model._id ? 'image-hidden' : 'image-visible'}`}
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
              </div>
            </Link>
          ))
        ) : (
          <div className="ai-empty">
            No matches found. Try adjusting your filters.
          </div>
        )}
      </div>
    </div>
  );
}

export default AIFriends;