'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";
import Image from "next/image";
import "../styles/HomeAiModels.css";
import api from "../config/api";

function HomeAiModels() {
  const [aiModels, setAiModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchAiModels = async () => {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      const CACHE_KEY = `ham_models_${token ? 'user' : 'guest'}`;
      const CACHE_TIME_KEY = `ham_models_time_${token ? 'user' : 'guest'}`;
      const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

      try {
        const cached = sessionStorage.getItem(CACHE_KEY);
        const cachedTime = sessionStorage.getItem(CACHE_TIME_KEY);
        const now = Date.now();

        if (cached && cachedTime && (now - parseInt(cachedTime)) < CACHE_TTL) {
          setAiModels(JSON.parse(cached));
          setLoading(false);
          return;
        }

        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${api.Url}/user/get-pre-ai`, { headers });
        const models = response.data.data;
        setAiModels(models);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(models));
        sessionStorage.setItem(CACHE_TIME_KEY, now.toString());
      } catch (error) {
        console.error("Error fetching data:", error);
        setError("Failed to load AI models. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAiModels();
  }, []);


  const filteredModels = aiModels.slice(0, 10);

  const handleModelClick = (modelId, isLocked) => {
    if (isLocked) {
      router.push('/subscribe');
      return;
    }
    router.push(`/chatbox?chatId=${modelId}`);
  };

  const getShortDescription = (description) => {
    const words = description.split(" ");
    return words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");
  };

  return (
    <section className="ai-models-container-d32ud">
      <div className="section-header-d32ud">
        <h2 className="explore-title-d32ud">Explore AI Personas</h2>
        <Link href="/discover" className="view-more-link-d32ud">
          <span>View More</span>
          <svg className="arrow-icon-d32ud" viewBox="0 0 24 24" width="16" height="16">
            <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
          </svg>
        </Link>
      </div>

      {loading ? (
        <div className="models-grid-d32ud">
          {[...Array(10)].map((_, index) => (
            <div className="model-card-d32ud skeleton-d32ud" key={index}>
              <div className="portrait-ratio-wrapper-d32ud">
                <div className="skeleton-image-container-d32ud">
                  <Skeleton height="100%" containerClassName="skeleton-image-d32ud" />
                </div>
              </div>
              <div className="model-floating-info-d32ud">
                <Skeleton width={120} height={24} />
                <Skeleton width={180} height={20} />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="error-message-d32ud">
          <Image 
            src="/error-icon.svg" 
            alt="Error"
            width={80}
            height={80}
            className="error-icon-d32ud"
          />
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-button-d32ud">
            Try Again
          </button>
        </div>
      ) : filteredModels.length === 0 ? (
        <div className="empty-state-d32ud">
          <Image 
            src="/no-models.svg" 
            alt="No models found"
            width={200}
            height={200}
            className="empty-icon-d32ud"
          />
          <p>No AI companions found in this category</p>
          <button onClick={() => window.location.reload()} className="refresh-button-d32ud">
            Refresh
          </button>
        </div>
      ) : (
        <div className="models-grid-d32ud">
          {filteredModels.map((model, index) => (
            <div 
              className="model-card-d32ud" 
              key={model._id}
              onClick={() => handleModelClick(model._id, model.isLocked)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleModelClick(model._id)}
              style={{ animationDelay: `${index * 0.05}s` }}
            >
              <div className="portrait-ratio-wrapper-d32ud">
                <div className="model-image-container-d32ud">
                  <Image 
                    src={model.avatar_img} 
                    alt={model.name}
                    width={270}
                    height={480}
                    className="model-image-d32ud portrait-image-d32ud image-visible-d32ud"
                   priority={index < 2}
                   loading={index < 2 ? 'eager' : 'lazy'}
                  />
                  
                  <div className="model-overlay-d32ud">
                    <span className="model-age-d32ud">{model.age}</span>
                    <span className="model-gender-d32ud">
                      {model.gender === 'female' ? '♀' : '♂'}
                    </span>
                  </div>
                  <div className="model-badge-d32ud">
                    {model.isLocked && (
                      <span className="premium-lock-tag-d32ud">
                        🔒 Premium
                      </span>
                    )}
                    {!model.isLocked && model.badge === "top_choice" && (
                      <span className="popular-tag-d32ud top-choice-d32ud">
                        🌟 Top Choice
                      </span>
                    )}
                    {!model.isLocked && model.badge === "popular" && (
                      <span className="popular-tag-d32ud">
                        ⭐ Popular
                      </span>
                    )}
                  </div>
                  
                  {/* Modern floating info at bottom */}
                  <div className="model-floating-info-d32ud">
                    <h3 className="model-name-d32ud">{model.name}</h3>
                    <p className="model-short-description-d32ud">
                      {getShortDescription(model.description)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export default HomeAiModels;