'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Image from 'next/image';
import api from '../config/api';
import femaleFallback from '../femalePreAIFriend.json';
import maleFallback from '../malePreAIFriend.json';
import '../styles/HomeAiModels.css';

export default function SEOPersonaList({ gender = 'female', limit = 10 }) {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadCompanions() {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const response = await axios.get(`${api.Url}/user/get-pre-ai`, { headers });
        if (response.data && response.data.success && response.data.data) {
          setCompanions(response.data.data);
        } else {
          throw new Error('Invalid response structure');
        }
      } catch (error) {
        console.warn('API fetch failed, falling back to local JSON files:', error);
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

  if (loading) {
    return (
      <div className="models-grid-d32ud" style={{ marginTop: '24px' }}>
        {[...Array(3)].map((_, i) => (
          <div className="model-card-d32ud skeleton-d32ud" key={i} style={{ height: '380px' }}>
            <div className="portrait-ratio-wrapper-d32ud">
              <div className="skeleton-image-container-d32ud" style={{ backgroundColor: '#1a1a1a' }} />
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
      {filtered.map((model) => (
        <Link 
          href={`/chatbox?chatId=${model._id}`} 
          key={model._id} 
          className="model-card-d32ud"
          style={{ textDecoration: 'none' }}
        >
          <div className="portrait-ratio-wrapper-d32ud">
            <div className="model-image-container-d32ud">
              <Image 
                src={model.avatar_img || 'https://res.cloudinary.com/dcvsx2eep/image/upload/v1762069270/3_d1jufz.webp'} 
                alt={`${model.name} - ${model.relationship}`}
                width={270}
                height={480}
                className="model-image-d32ud portrait-image-d32ud image-visible-d32ud"
                priority
              />
              
              <div className="model-overlay-d32ud">
                <span className="model-age-d32ud">{model.age} Yrs</span>
                <span className="model-gender-d32ud">
                  {model.gender === 'female' ? '♀' : '♂'}
                </span>
              </div>

              <div className="model-badge-d32ud">
                <span className="popular-tag-d32ud top-choice-d32ud">
                  {model.relationship}
                </span>
              </div>
              
              <div className="model-floating-info-d32ud">
                <h3 className="model-name-d32ud" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
                  {model.name}
                </h3>
                <p className="model-short-description-d32ud" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.9)' }}>
                  {model.description ? (model.description.length > 65 ? model.description.slice(0, 65) + '...' : model.description) : 'Desi AI Companion'}
                </p>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
