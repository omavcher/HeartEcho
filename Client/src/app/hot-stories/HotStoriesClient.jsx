'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Search, Filter, Flame, MapPin, X, ChevronRight } from 'lucide-react';
import './MainHotStories.css';

export function HotStoriesClient({ 
  initialStories = [], 
  initialCategories = [], 
  initialCities = [] 
}) {
  const [stories] = useState(initialStories);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [sortBy, setSortBy] = useState('newest');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);

  // Load recently viewed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const viewed = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(viewed);
    }
  }, []);

  // Filter & Sort Logic
  const filteredStories = useMemo(() => {
    return stories
      .filter(s => {
        const matchesCat = selectedCategory === 'All' || s.category === selectedCategory;
        const matchesCity = selectedCity === 'All Cities' || s.city === selectedCity;
        const matchesSearch = !searchQuery || 
                             s.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                             s.characterName?.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCat && matchesCity && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'popularity') return (b.readCount || 0) - (a.readCount || 0);
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
  }, [stories, selectedCategory, selectedCity, searchQuery, sortBy]);

  const handleStoryClick = (story) => {
    const updated = [story, ...recentlyViewed.filter(s => s._id !== story._id)].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
    setRecentlyViewed(updated);
  };

  return (
    <div className="hot-stories-wrapper-hotde4">
      
      {/* HEADER SECTION */}
      <section className="hero-section-hotde4">
        <div className="title-box-hotde4">
          <h1>Hot Stories</h1>
          <p>The web's most engaging interactive tales</p>
        </div>
        
        <div className="controls-row-hotde4">
          <div className="search-container-hotde4">
            <Search size={18} color="#666" />
            <input 
              type="text" 
              placeholder="Search characters or titles..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="filter-btn-hotde4" onClick={() => setIsFilterOpen(true)}>
            <Filter size={20} />
          </button>
        </div>
      </section>

      {/* RECENTLY VIEWED SCROLL */}
      {recentlyViewed.length > 0 && (
        <section className="recent-section-hotde4">
          <div className="recent-title-hotde4">Continue Reading</div>
          <div className="recent-scroll-hotde4">
            {recentlyViewed.map(item => (
              <Link 
                href={`/hot-stories/${item.slug}`} 
                key={item._id} 
                className="recent-item-hotde4"
              >
                <div className="recent-avatar-hotde4">
                  <img src={item.backgroundImage} alt="" />
                </div>
                <span className="recent-name-hotde4">{item.characterName}</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* FEED CONTENT */}
      <main className="feed-container-hotde4">
        <div className="feed-header-hotde4">
          <span className="feed-count-hotde4">{filteredStories.length} Stories available</span>
          <div className="sort-chips-hotde4">
            <button 
              className={sortBy === 'newest' ? 'active-hotde4' : ''} 
              onClick={() => setSortBy('newest')}
            >
              New
            </button>
            <button 
              className={sortBy === 'popularity' ? 'active-hotde4' : ''} 
              onClick={() => setSortBy('popularity')}
            >
              Trending
            </button>
          </div>
        </div>

        <div className="stories-grid-hotde4">
          {filteredStories.map((story) => (
            <Link 
              href={`/hot-stories/${story.slug}`} 
              key={story._id} 
              className="card-hotde4"
              onClick={() => handleStoryClick(story)}
            >
              <div className="image-box-hotde4">
                <img src={story.backgroundImage} alt={story.title} loading="lazy" />
                <div className="badge-layer-hotde4">
                  {story.readCount > 100 && (
                    <span className="hot-label-hotde4">
                       <Flame size={10} fill="currentColor" /> Trending
                    </span>
                  )}
                  <span className="city-label-hotde4">
                    <MapPin size={10} /> {story.city}
                  </span>
                </div>
              </div>
              <div className="content-info-hotde4">
                <h4>{story.title}</h4>
                <div className="card-meta-hotde4">
                  <span className="category-tag-hotde4">{story.category}</span>
                  <span className="read-stat-hotde4">{story.readCount || 0}K reads</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      {/* FILTER BOTTOM SHEET */}
      {isFilterOpen && (
        <div className="modal-overlay-hotde4" onClick={() => setIsFilterOpen(false)}>
          <div className="modal-sheet-hotde4" onClick={e => e.stopPropagation()}>
            <div className="modal-header-hotde4">
              <h3>Customize Feed</h3>
              <button className="filter-btn-hotde4" onClick={() => setIsFilterOpen(false)}>
                <X size={20} />
              </button>
            </div>
            
            <div className="modal-body-hotde4">
              <h5>Categories</h5>
              <div className="pill-grid-hotde4">
                {['All', ...initialCategories].map(cat => (
                  <button 
                    key={cat} 
                    className={`pill-hotde4 ${selectedCategory === cat ? 'active-hotde4' : ''}`}
                    onClick={() => setSelectedCategory(cat)}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              <h5>Explore Cities</h5>
              <div className="pill-grid-hotde4">
                {['All Cities', ...initialCities].map(city => (
                  <button 
                    key={city} 
                    className={`pill-hotde4 ${selectedCity === city ? 'active-hotde4' : ''}`}
                    onClick={() => setSelectedCity(city)}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
            
            <button className="apply-btn-hotde4" onClick={() => setIsFilterOpen(false)}>
              Show Stories
            </button>
          </div>
        </div>
      )}
    </div>
  );
}