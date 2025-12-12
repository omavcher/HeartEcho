// app/components/HomeStoriesSection.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import api from '../config/api';
import './HomeStoriesSection.css';

// --- Skeleton Loaders ---
const SkeletonStoryCard = () => (
  <div className="story-card">
    <div className="card-header">
      <div className="story-image-container skeleton-image"></div>
    </div>
    <div className="card-content">
      <div className="skeleton-title"></div>
      <div className="skeleton-excerpt"></div>
      <div className="character-info">
        <div className="character-avatar skeleton-avatar"></div>
        <div className="character-details">
          <div className="skeleton-name"></div>
          <div className="skeleton-age"></div>
        </div>
      </div>
      <div className="skeleton-button"></div>
    </div>
  </div>
);

const SkeletonHeroCard = () => (
  <div className="hero-story-card skeleton">
    <div className="hero-image skeleton-image-large"></div>
    <div className="hero-content">
      <div className="skeleton-hero-title"></div>
      <div className="skeleton-hero-description"></div>
      <div className="hero-stats">
        <div className="skeleton-stat"></div>
        <div className="skeleton-stat"></div>
        <div className="skeleton-stat"></div>
      </div>
      <div className="skeleton-hero-button"></div>
    </div>
  </div>
);

export default function HomeStoriesSection() {
  const [stories, setStories] = useState([]);
  const [featuredStory, setFeaturedStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {
    const fetchStories = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${api.Url}/story`);
        
        if (response.data?.success && response.data.data) {
          const allStories = response.data.data;
          
          // Get featured story (most read or random)
          const featured = allStories.length > 0 
            ? allStories.reduce((prev, current) => 
                (prev.readCount || 0) > (current.readCount || 0) ? prev : current
              )
            : null;
          setFeaturedStory(featured);
          
          // Get 6 random stories (excluding featured)
          const otherStories = allStories.filter(s => s._id !== featured?._id);
          const shuffled = [...otherStories].sort(() => 0.5 - Math.random());
          const selected = shuffled.slice(0, 6);
          setStories(selected);
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  // Get unique categories
  const categories = ['All', ...new Set(stories.map(s => s.category).filter(Boolean))];
  
  // Filter stories by category
  const filteredStories = activeCategory === 'All' 
    ? stories 
    : stories.filter(story => story.category === activeCategory);

  // Don't show if no stories (except during loading)
  if (!loading && stories.length === 0 && !featuredStory) return null;

  return (
    <section className="home-stories-section">
      {/* Background Gradient */}
      <div className="background-gradient"></div>
      
      <div className="container">
        {/* Section Header */}
        <div className="section-header">
          <div className="header-content">
            <div className="badge">
              <span className="badge-icon">🔥</span>
              Trending Now
            </div>
            <h2 className="section-title">
              Discover Interactive Stories
              <span className="title-highlight"> From Indian Cities</span>
            </h2>
            <p className="section-description">
              Immerse yourself in captivating stories where your choices matter. 
              Explore narratives from cities across India.
            </p>
          </div>
          <Link href="/hot-stories" className="view-all-button">
            <span>View All Stories</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </Link>
        </div>

        {/* Featured Story */}
        {loading ? (
          <SkeletonHeroCard />
        ) : featuredStory && (
          <div className="featured-story">
            <div className="featured-content">
              <div className="featured-badge">
                <span className="live-dot"></span>
                Featured Story
              </div>
              <h3 className="featured-title">{featuredStory.title}</h3>
              <p className="featured-description">{featuredStory.excerpt || featuredStory.description}</p>
              
              <div className="featured-stats">
                <div className="stat">
                  <span className="stat-icon">📍</span>
                  <span className="stat-label">{featuredStory.city}</span>
                </div>
                <div className="stat">
                  <span className="stat-icon">👁️</span>
                  <span className="stat-label">
                    {formatReadCount(featuredStory.readCount || 0)} reads
                  </span>
                </div>
                <div className="stat">
                  <span className="stat-icon">⭐</span>
                  <span className="stat-label">4.8</span>
                </div>
              </div>

              <div className="featured-actions">
                <Link 
                  href={`/hot-stories/${featuredStory.slug || featuredStory._id}`}
                  className="primary-button"
                >
                  <span className="button-icon">📖</span>
                  Read Story
                </Link>
                <Link 
                  href={`/chatbox?chatId=${featuredStory.characterId || featuredStory._id}`}
                  className="secondary-button"
                >
                  <span className="button-icon">💬</span>
                  Chat Now
                </Link>
              </div>
            </div>
            
            <div className="featured-image">
              <img 
                src={featuredStory.backgroundImage || '/api/placeholder/800/450'}
                alt={featuredStory.title}
                className="featured-bg-image"
                loading="lazy"
              />
              <div className="image-overlay">
                <div className="character-card">
                  <div className="character-avatar-large">
                    <img 
                      src={featuredStory.characterAvatar || '/api/placeholder/100/100'}
                      alt={featuredStory.characterName}
                    />
                    <div className="online-status"></div>
                  </div>
                  <div className="character-info">
                    <h4>{featuredStory.characterName}</h4>
                    <p>{featuredStory.characterAge || '25'} years • {featuredStory.city}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Filter */}
        <div className="category-filter">
          <div className="filter-header">
            <h3 className="filter-title">Browse by Category</h3>
            <div className="filter-count">{filteredStories.length} stories</div>
          </div>
          <div className="category-scroll">
            {categories.map(category => (
              <button
                key={category}
                className={`category-button ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
                {category !== 'All' && (
                  <span className="category-count">
                    {stories.filter(s => s.category === category).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Stories Grid */}
        <div className="stories-grid">
          {loading ? (
            [1, 2, 3, 4, 5, 6].map(i => <SkeletonStoryCard key={i} />)
          ) : filteredStories.length > 0 ? (
            filteredStories.map(story => (
              <StoryCard key={story._id} story={story} />
            ))
          ) : (
            <div className="no-stories">
              <div className="no-stories-icon">📚</div>
              <h4>No stories found</h4>
              <p>Try selecting a different category</p>
            </div>
          )}
        </div>


      </div>
    </section>
  );
}

// Story Card Component
function StoryCard({ story }) {
  const formatReadCount = (count) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
    return count;
  };

  return (
    <div className="story-card">
      <Link href={`/hot-stories/${story.slug || story._id}`} className="card-link">
        <div className="card-header">
          <div className="image-container">
            <img 
              src={story.backgroundImage || '/api/placeholder/400/225'}
              alt={story.title}
              className="story-image"
              loading="lazy"
            />
            <div className="image-overlay">
              <div className="city-badge">
                <span className="city-icon">📍</span>
                {story.city}
              </div>
              <div className="live-indicator">
                <span className="live-dot-small"></span>
                Live
              </div>
            </div>
          </div>
          <div className="category-badge">{story.category}</div>
        </div>
        
        <div className="card-content">
          <h4 className="story-title">{story.title}</h4>
          <p className="story-excerpt">{story.excerpt || 'An interactive story where your choices matter...'}</p>
          
          <div className="character-info">
            <div className="character-avatar">
              <img 
                src={story.characterAvatar || '/api/placeholder/40/40'}
                alt={story.characterName}
              />
            </div>
            <div className="character-details">
              <div className="character-name">{story.characterName}</div>
              <div className="character-age">{story.characterAge || '25'} years</div>
            </div>
          </div>
          
          <div className="story-stats">
            <div className="stat">
              <span className="stat-icon">👁️</span>
              <span>{formatReadCount(story.readCount || 0)}</span>
            </div>
            <div className="stat">
              <span className="stat-icon">⭐</span>
              <span>{story.rating || '4.5'}</span>
            </div>
            <div className="stat">
              <span className="stat-icon">💬</span>
              <span>Chat</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Helper function
function formatReadCount(count) {
  if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
  if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
  return count;
}