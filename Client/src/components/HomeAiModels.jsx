'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";
import "../styles/HomeAiModels.css";
import api from "../config/api";

function HomeAiModels() {
  const [activeTab, setActiveTab] = useState("girls");
  const [aiModels, setAiModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const router = useRouter();
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchAiModels = async () => {
      try {
        const response = await axios.get(`${api.Url}/user/get-pre-ai`);
        setAiModels(response.data.data);
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load AI models. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAiModels();
  }, []);

  const handleTabChange = (tab) => {
    if (tab === activeTab || isTransitioning) return;
    
    setIsTransitioning(true);
    setActiveTab(tab);
    
    // Smooth transition delay
    setTimeout(() => {
      setIsTransitioning(false);
    }, 400);
  };

  const getRandomModels = (models, count) => {
    return [...models]
      .sort(() => Math.random() - 0.5)
      .slice(0, count);
  };
  
  const filteredModels = getRandomModels(
    aiModels.filter((model) =>
      activeTab === "girls" ? model.gender === "female" : model.gender === "male"
    ),
    12
  );

  const handleModelClick = (modelId) => {
    // Add ripple effect
    router.push(`/chatbox?chatId=${modelId}`);
  };

  return (
    <section className="ai-models-container" ref={containerRef}>
      <div className="section-header">
        <h2 className="section-title">Meet Your Perfect AI Companion</h2>
        <p className="section-subtitle">Discover personalities that match your preferences</p>
        
        <div className="gender-toggle" data-active={activeTab}>
          <button
            className={`toggle-option ${activeTab === "girls" ? "active" : ""}`}
            onClick={() => handleTabChange("girls")}
            aria-label="Show female AI companions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M11 15.9339C7.33064 15.445 4.5 12.3031 4.5 8.5C4.5 4.35786 7.85786 1 12 1C16.1421 1 19.5 4.35786 19.5 8.5C19.5 12.3031 16.6694 15.445 13 15.9339V18H18V20H13V24H11V20H6V18H11V15.9339ZM12 14C15.0376 14 17.5 11.5376 17.5 8.5C17.5 5.46243 15.0376 3 12 3C8.96243 3 6.5 5.46243 6.5 8.5C6.5 11.5376 8.96243 14 12 14Z"></path>
            </svg>
            Female
          </button>
          <button
            className={`toggle-option ${activeTab === "boys" ? "active" : ""}`}
            onClick={() => handleTabChange("boys")}
            aria-label="Show male AI companions"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
              <path d="M15.0491 8.53666L18.5858 5H14V3H22V11H20V6.41421L16.4633 9.95088C17.4274 11.2127 18 12.7895 18 14.5C18 18.6421 14.6421 22 10.5 22C6.35786 22 3 18.6421 3 14.5C3 10.3579 6.35786 7 10.5 7C12.2105 7 13.7873 7.57264 15.0491 8.53666ZM10.5 20C13.5376 20 16 17.5376 16 14.5C16 11.4624 13.5376 9 10.5 9C7.46243 9 5 11.4624 5 14.5C5 17.5376 7.46243 20 10.5 20Z"></path>
            </svg>
            Male
          </button>
        </div>
      </div>

      <div className={`models-content ${isTransitioning ? 'transitioning' : ''}`}>
        {loading ? (
          <div className="models-grid">
            {[...Array(10)].map((_, index) => (
              <div className="model-card skeleton" key={index}>
                <div className="skeleton-image-container">
                  <Skeleton height="100%" containerClassName="skeleton-image" />
                </div>
                <div className="model-info">
                  <Skeleton width={80} height={24} />
                  <Skeleton height={20} width="70%" />
                  <Skeleton height={16} count={2} width="90%" />
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="error-message">
            <Image 
              src="/error-icon.svg" 
              alt="Error"
              width={80}
              height={80}
              className="error-icon"
            />
            <p>{error}</p>
            <button onClick={() => window.location.reload()} className="retry-button">
              Try Again
            </button>
          </div>
        ) : filteredModels.length === 0 ? (
          <div className="empty-state">
            <Image 
              src="/no-models.svg" 
              alt="No models found"
              width={200}
              height={200}
              className="empty-icon"
            />
            <p>No AI companions found in this category</p>
            <button onClick={() => window.location.reload()} className="refresh-button">
              Refresh
            </button>
          </div>
        ) : (
          <div className="models-grid">
            {filteredModels.map((model, index) => (
              <div 
                className="model-card" 
                key={model._id}
                onClick={() => handleModelClick(model._id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleModelClick(model._id)}
                style={{ 
                  animationDelay: `${index * 0.03}s`,
                  transitionDelay: `${index * 0.02}s`
                }}
              >
                <div className="model-image-container">
                  <Image 
                    src={model.avatar_img} 
                    alt={model.name}
                    width={180}
                    height={320}
                    className="model-image"
                    priority={index < 4}
                  />
                  <div className="model-overlay">
                    <span className="model-age">{model.age}</span>
                    <span className="model-gender">
                      {model.gender === 'female' ? '♀' : '♂'}
                    </span>
                  </div>
                  <div className="model-badge">
                    {index < 3 && (
                      <span className={`popular-tag ${index === 0 ? 'top-choice' : ''}`}>
                        {index === 0 ? '🌟 Top Choice' : '⭐ Popular'}
                      </span>
                    )}
                  </div>
                </div>
                <div className="model-info">
                  <h3 className="model-name">{model.name}</h3>
                  <div className="model-traits">
                    {model.personality?.split(',').slice(0, 3).map((trait, i) => (
                      <span key={i} className="trait-badge">{trait.trim()}</span>
                    ))}
                  </div>
                  <p className="model-description">
                    {model.description.split(" ").slice(0, 12).join(" ")}...
                  </p>
                  <button className="chat-button">
                    Start Chatting
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default HomeAiModels;