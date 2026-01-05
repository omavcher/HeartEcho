// app/hot-stories/HotStoriesClient.jsx
'use client';

import React, { useState, useEffect, useRef } from 'react'; // Add React import here
import Link from 'next/link';
import axios from 'axios';
import api from '../../config/api';

export function HotStoriesClient({ 
  initialStories, 
  initialCategories, 
  initialCities,
  allIndianCities,
  cityInfo 
}) {
  const [stories, setStories] = useState(initialStories);
  const [categories, setCategories] = useState(initialCategories);
  const [cities, setCities] = useState(initialCities);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [activeFilters, setActiveFilters] = useState([]);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const filterSectionRef = useRef(null);

  // Load recently viewed from localStorage on client side
  useEffect(() => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    setRecentlyViewed(viewed);
  }, []);

  // Scroll listener for back-to-top button
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 500);
    };
    window.addEventListener('scroll', handleScroll);
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close filter dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (isFilterOpen && !e.target.closest('.filter-dropdown') && !e.target.closest('.mobile-filter-toggle')) {
        setIsFilterOpen(false);
      }
    };
    
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isFilterOpen]);

  // Get story count for each city
  const getCityStoryCount = (cityName) => {
    return stories.filter(story => 
      story.city?.toLowerCase() === cityName.toLowerCase()
    ).length;
  };

  // Filter and sort stories
  const filteredStories = stories
    .filter(story => {
      const matchesCategory = selectedCategory === 'All' || story.category === selectedCategory;
      const matchesCity = selectedCity === 'All Cities' || story.city === selectedCity;
      const matchesSearch = searchQuery === '' || 
        story.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.characterName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        story.city?.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesCategory && matchesCity && matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'newest':
          return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        case 'popularity':
        default:
          return (b.readCount || 0) - (a.readCount || 0);
      }
    });

  // Handle filter changes
  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    if (category !== 'All') {
      setActiveFilters(prev => [...new Set([...prev, `category:${category}`])]);
    }
  };

  const handleCityClick = (city) => {
    setSelectedCity(city);
    if (city !== 'All Cities') {
      setActiveFilters(prev => [...new Set([...prev, `city:${city}`])]);
    }
    setIsFilterOpen(false);
  };

  const clearAllFilters = () => {
    setSelectedCategory('All');
    setSelectedCity('All Cities');
    setSearchQuery('');
    setActiveFilters([]);
    setIsFilterOpen(false);
  };

  const removeFilter = (filter) => {
    setActiveFilters(prev => prev.filter(f => f !== filter));
  };

  // Handle story click for recently viewed
  const handleStoryClick = (story) => {
    const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const updated = [story, ...viewed.filter(s => s.id !== story.id)].slice(0, 5);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    setRecentlyViewed(updated);
  };

  // Scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Scroll to filters
  const scrollToFilters = () => {
    filterSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Refresh stories function
  const refreshStories = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${api.Url}/story`);
      if (response.data?.success) {
        setStories(response.data.data || []);
      }
    } catch (err) {
      console.error('Error refreshing stories:', err);
    } finally {
      setLoading(false);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <p className="error-text">{error}</p>
        <button onClick={refreshStories} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      {/* AD SCRIPT - Load once */}
      <script 
        async="async" 
        data-cfasync="false" 
        src="https://pl28409394.effectivegatecpm.com/192103d6879cc843368e47e4d3546f8f/invoke.js"
      ></script>

    

      {/* Enhanced Search Box */}
      <section className="search-section" ref={filterSectionRef}>
        <div className="search-box">
          <div className="search-icon">🔍</div>
          <input 
            type="text" 
            placeholder="Search stories..."
            className="search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>
        
        {/* Mobile Filter Toggle */}
        <button 
          className="mobile-filter-toggle"
          onClick={() => setIsFilterOpen(!isFilterOpen)}
        >
          <span className="filter-icon">⚙️</span>
          Filters {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>
      </section>

      {/* Active Filters Mobile */}
      {activeFilters.length > 0 && (
        <div className="active-filters-mobile">
          <div className="filters-list">
            {activeFilters.map(filter => (
              <button 
                key={filter}
                className="active-filter"
                onClick={() => removeFilter(filter)}
              >
                {filter.split(':')[1]} ✕
              </button>
            ))}
            <button 
              className="clear-all-filters"
              onClick={clearAllFilters}
            >
              Clear All
            </button>
          </div>
        </div>
      )}

      {/* Mobile Filter Dropdown */}
      {isFilterOpen && (
        <div className="filter-dropdown">
          <div className="dropdown-section">
            <h4>Category</h4>
            <div className="mobile-categories">
              {categories.slice(0, 6).map(category => {
                const count = stories.filter(s => s.category === category).length;
                return (
                  <button 
                    key={category} 
                    className={`mobile-category ${selectedCategory === category ? 'active' : ''}`}
                    onClick={() => handleCategoryClick(category)}
                  >
                    {category}
                    <span className="count-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
          
          <div className="dropdown-section">
            <h4>City</h4>
            <div className="mobile-cities">
              {cities.slice(0, 8).map(city => (
                <button 
                  key={city} 
                  className={`mobile-city ${selectedCity === city ? 'active' : ''}`}
                  onClick={() => handleCityClick(city)}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>
          
          <div className="dropdown-section">
            <h4>Sort By</h4>
            <div className="mobile-sort">
              {[
                { value: 'popularity', label: 'Most Popular', icon: '🔥' },
                { value: 'rating', label: 'Highest Rated', icon: '⭐' },
                { value: 'newest', label: 'Newest First', icon: '🆕' }
              ].map(option => (
                <button
                  key={option.value}
                  className={`mobile-sort-option ${sortBy === option.value ? 'active' : ''}`}
                  onClick={() => {
                    setSortBy(option.value);
                    setIsFilterOpen(false);
                  }}
                >
                  <span className="sort-icon">{option.icon}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* IN-ARTICLE AD */}
      <div className="ad-container in-article-ad">
        <div id="container-192103d6879cc843368e47e4d3546f8f"></div>
      </div>

      {/* Story Count and Sort Mobile */}
      <div className="mobile-stats-bar">
        <span className="story-count-badge">
          {filteredStories.length} {filteredStories.length === 1 ? 'story' : 'stories'}
        </span>
        <button className="sort-toggle" onClick={() => setIsFilterOpen(true)}>
          Sort: {sortBy === 'popularity' ? 'Popular' : sortBy === 'rating' ? 'Top Rated' : 'Newest'}
        </button>
      </div>

      {/* All Stories Grid - Optimized for mobile */}
      <section className="stories-section">
        {filteredStories.length > 0 ? (
          <>
            <div className="stories-grid">
              {filteredStories.map((story, index) => {
                const readCount = story.readCount || Math.floor(Math.random() * 50000) + 1000;
                const rating = story.rating || (4.0 + Math.random() * 0.9).toFixed(1);
                
                // Insert ad after every 4 stories
                if (index > 0 && index % 4 === 0) {
                  return (
                    <React.Fragment key={`ad-${index}`}>
                      {/* MID-GRID AD - Inserted after every 4 stories */}
                      <div className="ad-container grid-ad" style={{ gridColumn: '1 / -1' }}>
                        <div id="container-192103d6879cc843368e47e4d3546f8f"></div>
                      </div>
                      <Link 
                        href={`/hot-stories/${story.slug || story.id}`}
                        onClick={() => handleStoryClick(story)} 
                        key={story.id || story._id || index} 
                        className="story-card"
                        prefetch={false}
                      >
                        <div className="card-header">
                          <div className="story-image-container">
                            <img 
                              src={story.backgroundImage || story.image || `/api/placeholder/400/225?text=${encodeURIComponent(story.city || 'Story')}`} 
                              alt={story.title}
                              className="story-background-image"
                              loading="lazy"
                            />
                            <div className="image-overlay">
                              <div className="city-badge">
                                <span className="city-icon">📍</span>
                                {story.city}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card-content">
                          <div className="card-title-wrapper">
                            <h3 className="story-title">{story.title}</h3>
                            <div className="category-badge">
                              {story.category}
                            </div>
                          </div>
                          
                          <p className="story-excerpt">
                            {story.excerpt || 'An interactive story where your choices matter...'}
                          </p>
                          
                          <div className="story-meta">
                            <div className="meta-item">
                              <span className="meta-icon">👤</span>
                              <span>{story.characterName || 'Character'}</span>
                            </div>
                          </div>
                          
                          <div className="card-actions">
                            <Link 
                              href={`/hot-stories/${story.slug || story.id}`}
                              className="action-button read-button"
                              onClick={() => handleStoryClick(story)}
                              prefetch={false}
                            >
                              <span className="button-icon">📖</span>
                              Read
                            </Link>
                          </div>
                        </div>
                      </Link>
                    </React.Fragment>
                  );
                }
                
                return (
                  <Link 
                    href={`/hot-stories/${story.slug || story.id}`}
                    onClick={() => handleStoryClick(story)} 
                    key={story.id || story._id || index} 
                    className="story-card"
                    prefetch={false}
                  >
                    <div className="card-header">
                      <div className="story-image-container">
                        <img 
                          src={story.backgroundImage || story.image || `/api/placeholder/400/225?text=${encodeURIComponent(story.city || 'Story')}`} 
                          alt={story.title}
                          className="story-background-image"
                          loading="lazy"
                        />
                        <div className="image-overlay">
                          <div className="city-badge">
                            <span className="city-icon">📍</span>
                            {story.city}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="card-content">
                      <div className="card-title-wrapper">
                        <h3 className="story-title">{story.title}</h3>
                        <div className="category-badge">
                          {story.category}
                        </div>
                      </div>
                      
                      <p className="story-excerpt">
                        {story.excerpt || 'An interactive story where your choices matter...'}
                      </p>
                      
                      <div className="story-meta">
                        <div className="meta-item">
                          <span className="meta-icon">👤</span>
                          <span>{story.characterName || 'Character'}</span>
                        </div>
                      </div>
                      
                      <div className="card-actions">
                        <Link 
                          href={`/hot-stories/${story.slug || story.id}`}
                          className="action-button read-button"
                          onClick={() => handleStoryClick(story)}
                          prefetch={false}
                        >
                          <span className="button-icon">📖</span>
                          Read
                        </Link>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        ) : (
          <div className="no-stories">
            <div className="no-stories-icon">📚</div>
            <h3>No stories found</h3>
            <p>Try changing your filters or search term</p>
            <button onClick={clearAllFilters} className="clear-filters-button">
              Clear All Filters
            </button>
          </div>
        )}
      </section>

      {/* BOTTOM BANNER AD */}
      <div className="ad-container bottom-banner-ad">
        <div id="container-192103d6879cc843368e47e4d3546f8f"></div>
      </div>

      {/* All Indian Cities Section - Optimized grid */}
      <section className="all-cities-section">
        <div className="section-header">
          <h2 className="section-title">
            Explore Indian Cities
          </h2>
          <p className="section-description">
            Discover stories from major cities across India
          </p>
        </div>
        
        <div className="all-cities-grid">
          {allIndianCities.map((city, index) => {
            const cityData = cityInfo[city.key] || {
              image: `/api/placeholder/400/225?text=${encodeURIComponent(city.name)}`
            };
            const cityStoriesCount = getCityStoryCount(city.name);
            
            return (
              <Link 
                key={city.key}
                href={`/city/${city.key}`}
                className="all-city-card"
                prefetch={false}
              >
                <div className="all-city-image-container">
                  <img 
                    src={cityData.image} 
                    alt={`${city.name} - ${city.tagline}`}
                    className="all-city-image"
                    loading="lazy"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `/api/placeholder/400/225?text=${encodeURIComponent(city.name)}`;
                    }}
                  />
                  <div className="city-tag">{city.tagline}</div>
                </div>
                <div className="all-city-info">
                  <h3>{city.name}</h3>
                  <div className="city-meta">
                    <span className="story-count">{cityStoriesCount} stories</span>
                    <span className="live-indicator">● Live</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* CTA Section Mobile */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">Start Your Journey</h2>
          <p className="cta-description">
            Join thousands of readers shaping stories in real-time.
          </p>
          <div className="cta-buttons">
            <button onClick={scrollToFilters} className="cta-button primary">
              Explore Stories
            </button>
            <Link href="https://docs.google.com/forms/d/e/1FAIpQLSdIphDpWaWCr-mk5LrPrjQK-B9hT9UK6rUSuUX22RJSHFw9zw/viewform?usp=dialog" className="cta-button secondary">
              Create Story
            </Link>
          </div>
        </div>
      </section>

      {/* Back to Top Button Mobile */}
      {showScrollTop && (
        <button onClick={scrollToTop} className="scroll-top-button">
          ↑
        </button>
      )}

      {/* Add CSS for ad containers */}
      <style jsx>{`
        .ad-container {
          margin: 2rem auto;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50px;
          background-color: transparent;
          width: 100%;
          max-width: 100%;
        }
        
        .top-banner-ad {
          margin-top: 1rem;
          margin-bottom: 2rem;
        }
        
        .in-article-ad {
          margin: 2.5rem 0;
          padding: 1rem 0;
          border-top: 1px solid var(--medium-gray);
          border-bottom: 1px solid var(--medium-gray);
        }
        
        .grid-ad {
          margin: 2rem 0;
          padding: 1.5rem;
          background: rgba(255, 45, 149, 0.05);
          border: 1px solid rgba(255, 45, 149, 0.2);
          border-radius: var(--border-radius);
          grid-column: 1 / -1;
        }
        
        .bottom-banner-ad {
          margin: 3rem 0;
          padding: 1.5rem 0;
          border-top: 1px solid var(--medium-gray);
          border-bottom: 1px solid var(--medium-gray);
        }
        
        @media (max-width: 768px) {
          .ad-container {
            margin: 1.5rem auto;
          }
          
          .grid-ad {
            margin: 1rem 0;
            padding: 1rem;
          }
        }
      `}</style>
    </>
  );
}