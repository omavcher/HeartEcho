'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import api from '../config/api';
import femaleFallback from '../femalePreAIFriend.json';
import maleFallback from '../malePreAIFriend.json';
import '../styles/HomeAiModels.css';

export default function SEOPersonaList({ gender = 'female', limit = 10 }) {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function loadCompanions() {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
      try {
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${api.Url}/user/get-pre-ai`, { headers });
        if (response.data && response.data.success && response.data.data) {
          setCompanions(response.data.data);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (err) {
        console.warn('API fetch failed, falling back to local JSON files:', err);
        // Combine fallbacks
        const combinedFallback = [
          ...femaleFallback.map((c, i) => ({ ...c, _id: `female-fb-${i}` })),
          ...maleFallback.map((c, i) => ({ ...c, _id: `male-fb-${i}` }))
        ];
        setCompanions(combinedFallback);
      } finally {
        setLoading(false);
      }
    }
    loadCompanions();
  }, []);

  const filtered = companions
    .filter(c => c.gender === gender)
    .slice(0, limit);

  const handleModelClick = (modelId, isLocked) => {
    if (isLocked) {
      router.push('/subscribe');
      return;
    }
    router.push(`/chatbox?chatId=${modelId}`);
  };

  const getShortDescription = (description) => {
    if (!description) return "Desi AI Companion";
    const words = description.split(" ");
    return words.slice(0, 6).join(" ") + (words.length > 6 ? "..." : "");
  };

  if (loading) {
    return (
      <div className="models-grid-d32ud" style={{ marginTop: '24px' }}>
        {[...Array(limit)].map((_, index) => (
          <div className="model-card-d32ud skeleton-d32ud" key={index} style={{ height: 'auto', minHeight: '350px' }}>
            <div className="portrait-ratio-wrapper-d32ud">
              <div className="skeleton-image-container-d32ud">
                <Skeleton height="100%" containerClassName="skeleton-image-d32ud" />
              </div>
            </div>
            <div className="model-floating-info-d32ud">
              <Skeleton width={120} height={24} />
              <Skeleton width={180} height={20} style={{ marginTop: '8px' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (filtered.length === 0) {
    return <p style={{ color: '#a0a0a0', textAlign: 'center', margin: '20px 0' }}>No active companions found.</p>;
  }

  return (
    <div className="models-grid-d32ud" style={{ marginTop: '24px', justifyContentItems: 'center' }}>
      {filtered.map((model, index) => (
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
                src={model.avatar_img || 'https://res.cloudinary.com/dcvsx2eep/image/upload/v1762069270/3_d1jufz.webp'} 
                alt={model.name}
                width={270}
                height={480}
                className="model-image-d32ud portrait-image-d32ud image-visible-d32ud"
                priority={index < 2}
                loading={index < 2 ? 'eager' : 'lazy'}
                unoptimized
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
                {!model.isLocked && !model.badge && model.relationship && (
                  <span className="popular-tag-d32ud top-choice-d32ud">
                    {model.relationship}
                  </span>
                )}
              </div>
              
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
  );
}
