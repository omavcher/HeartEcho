'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import api from '../config/api'; // Adjust path if needed
// Ensure you have the CSS available. 
// If hotStories.css is not global, import it here:
import '../app/hot-stories/hotStories.css'; 

// --- 1. Reusing your Skeleton Card for smooth loading ---
const SkeletonStoryCard = () => (
  <div className="story-card-djkei">
    <div className="card-header-djkei">
      <div className="story-image-container-djkei skeleton-image"></div>
    </div>
    <div className="card-content-djkei">
      <div className="skeleton-text skeleton-title-small" style={{width: '80%'}}></div>
      <div className="skeleton-text skeleton-excerpt"></div>
      <div className="character-info-djkei">
        <div className="character-avatar-container-djkei skeleton-avatar"></div>
        <div className="character-details-djkei">
          <div className="skeleton-text skeleton-name" style={{width: '60px'}}></div>
        </div>
      </div>
    </div>
  </div>
);

export default function HomeRandomStories() {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRandomStories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api.Url}/story`);
        
        if (response.data && response.data.success && response.data.data) {
          const allStories = response.data.data;
          
          // --- RANDOMIZATION LOGIC ---
          // Shuffle array and take the first 4
          const shuffled = [...allStories].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 4);
          
          setStories(selected);
        }
      } catch (err) {
        console.error('Error fetching home stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRandomStories();
  }, []);

  // Don't show the section if API fails or no stories
  if (!loading && stories.length === 0) return null;

  return (
    <section className="stories-section-djkei" style={{ padding: '40px 0' }}>
      <div className="container-djkei">
        
        {/* Header with "View All" Link */}
        <div className="section-header-djkei" style={{ marginBottom: '2rem' }}>
          <h2 className="section-title-djkei">
            <span className="title-icon-djkei">🎲</span>
            Trending Now
          </h2>
          <Link href="/hot-stories" className="view-all-link-djkei">
            View All Stories →
          </Link>
        </div>

        {/* Grid Display */}
        <div className="stories-grid-djkei">
          {loading ? (
            // Show 4 Skeletons while loading
            [1, 2, 3, 4].map((i) => <SkeletonStoryCard key={i} />)
          ) : (
            // Show Random Stories
            stories.map(story => (
              <div key={story.id || story._id} className="story-card-djkei">
                
                {/* Card Header / Image */}
                <div className="card-header-djkei">
                  <div className="story-image-container-djkei">
                    <img 
                      src={story.backgroundImage || story.image || '/api/placeholder/600/337.5'} 
                      alt={story.title}
                      className="story-background-image-djkei"
                      loading="lazy"
                      onError={(e) => { e.target.src = '/api/placeholder/600/337.5'; }}
                    />
                    <div className="image-overlay-djkei">
                      <div className="city-badge-small-djkei">{story.city}</div>
                    </div>
                  </div>
                  <div className="category-badge-djkei">{story.category}</div>
                </div>
                
                {/* Card Content */}
                <div className="card-content-djkei">
                  <h3 className="story-title-djkei">{story.title}</h3>
                  <p className="story-excerpt-djkei line-clamp-2">{story.excerpt}</p>
                  
                  {/* Character Info */}
                  <div className="character-info-djkei">
                    <div className="character-avatar-container-djkei">
                      <img 
                        src={story.characterAvatar || '/api/placeholder/400/711.11'}
                        alt={story.characterName}
                        className="character-avatar-image-djkei"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    </div>
                    <div className="character-details-djkei">
                      <div className="character-name-djkei">{story.characterName}</div>
                      <div className="character-age-djkei">{story.characterAge || story.age} years</div>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="card-actions-djkei" style={{marginTop: '1rem'}}>
                    <Link 
                      href={`/hot-stories/${story.slug || story.id}`}
                      className="read-story-button-djkei"
                      style={{ width: '100%', textAlign: 'center' }}
                    >
                      Read Story
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}