'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import api from '../config/api';
import { FaFire, FaMapMarkerAlt, FaBookOpen, FaCommentDots, FaChevronRight, FaLayerGroup } from 'react-icons/fa';

// ------------------- CSS STYLES (Pure Black & Pink) -------------------
const styles = `
.hss-root-x30sn {
  position: relative;
  padding: 40px 15px; /* Reduced padding for mobile */
  background-color: #000;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* Background Effects */
.hss-bg-glow-x30sn {
  position: absolute; top: 0; left: 50%; transform: translateX(-50%);
  width: 100%; height: 600px;
  background: radial-gradient(circle at center, rgba(255,105,180,0.15) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
}

.hss-container-x30sn {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* HEADER */
.hss-header-x30sn {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 30px; flex-wrap: wrap; gap: 15px;
}
.hss-badge-x30sn {
  display: inline-flex; align-items: center; gap: 6px;
  background: rgba(255,105,180,0.1); border: 1px solid rgba(255,105,180,0.3);
  color: #ff69b4; padding: 4px 10px; border-radius: 20px;
  font-size: 11px; font-weight: 700; text-transform: uppercase; margin-bottom: 10px;
}
.hss-title-x30sn {
  font-size: 28px; font-weight: 800; line-height: 1.1; margin: 0 0 8px 0;
  background: linear-gradient(90deg, #fff, #ccc); -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hss-title-highlight-x30sn { color: #ff69b4; -webkit-text-fill-color: #ff69b4; }
.hss-desc-x30sn { color: #888; font-size: 14px; max-width: 600px; line-height: 1.5; margin: 0; }

.hss-view-all-btn-x30sn {
  display: inline-flex; align-items: center; gap: 6px;
  color: #fff; text-decoration: none; font-weight: 600; font-size: 12px;
  padding: 8px 16px; border: 1px solid #333; border-radius: 30px;
  background: #0a0a0a; transition: 0.3s;
}
.hss-view-all-btn-x30sn:hover { border-color: #ff69b4; background: #ff69b4; color: #000; }

/* FEATURED STORY CARD */
.hss-hero-card-x30sn {
  display: grid; grid-template-columns: 1fr 1fr; gap: 30px;
  background: #0a0a0a; border: 1px solid #222; border-radius: 20px;
  padding: 25px; margin-bottom: 40px; position: relative; overflow: hidden;
}
.hss-hero-card-x30sn:hover { border-color: #333; }
.hss-hero-content-x30sn { display: flex; flex-direction: column; justify-content: center; }
.hss-hero-label-x30sn {
  color: #00ff88; font-size: 11px; font-weight: 700; text-transform: uppercase;
  display: flex; align-items: center; gap: 6px; margin-bottom: 12px;
}
.hss-dot-x30sn { width: 6px; height: 6px; background: #00ff88; border-radius: 50%; box-shadow: 0 0 8px #00ff88; }
.hss-hero-title-x30sn { font-size: 26px; font-weight: 800; color: #fff; margin: 0 0 10px 0; line-height: 1.2; }
.hss-hero-text-x30sn { color: #aaa; font-size: 14px; line-height: 1.5; margin-bottom: 20px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; }

.hss-hero-meta-x30sn { display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap; }
.hss-meta-item-x30sn {
  display: flex; align-items: center; gap: 5px; font-size: 12px; color: #888; background: #111; padding: 5px 10px; border-radius: 6px;
}
.hss-hero-actions-x30sn { display: flex; gap: 10px; flex-wrap: wrap; }
.hss-btn-primary-x30sn {
  background: #ff69b4; color: #000; padding: 12px 20px; border-radius: 10px;
  font-weight: 700; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: 0.3s; font-size: 13px;
}
.hss-btn-primary-x30sn:hover { background: #ff85c2; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(255,105,180,0.3); }
.hss-btn-secondary-x30sn {
  background: transparent; border: 2px solid #333; color: #fff; padding: 10px 20px; border-radius: 10px;
  font-weight: 600; text-decoration: none; display: flex; align-items: center; gap: 6px; transition: 0.3s; font-size: 13px;
}
.hss-btn-secondary-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }

.hss-hero-img-wrap-x30sn {
  position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16/9;
}
.hss-hero-img-x30sn { width: 100%; height: 100%; object-fit: cover; transition: 0.5s; }
.hss-hero-card-x30sn:hover .hss-hero-img-x30sn { transform: scale(1.03); }
.hss-hero-overlay-x30sn {
  position: absolute; bottom: 0; left: 0; width: 100%; padding: 15px;
  background: linear-gradient(transparent, rgba(0,0,0,0.9));
  display: flex; align-items: center; gap: 10px;
}
.hss-char-avatar-x30sn { width: 40px; height: 40px; border-radius: 50%; border: 2px solid #fff; object-fit: cover; }
.hss-char-info-x30sn h4 { color: #fff; margin: 0; font-size: 13px; }
.hss-char-info-x30sn p { color: #ccc; margin: 0; font-size: 11px; }

/* CATEGORY TABS */
.hss-tabs-x30sn {
  display: flex; gap: 8px; margin-bottom: 25px; overflow-x: auto; padding-bottom: 5px;
  scrollbar-width: none; border-bottom: 1px solid #222;
}
.hss-tab-btn-x30sn {
  background: transparent; color: #888; border: none; padding: 8px 16px;
  font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 20px; white-space: nowrap; transition: 0.2s;
}
.hss-tab-btn-x30sn:hover { color: #fff; }
.hss-tab-btn-x30sn.active { background: #1a1a1a; color: #ff69b4; border: 1px solid #333; }

/* STORY GRID - FORCED 2 COLUMNS ON MOBILE */
.hss-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* Default to 2 columns */
  gap: 12px; /* Smaller gap for mobile */
}

/* TABLET & DESKTOP ADJUSTMENTS */
@media (min-width: 768px) {
  .hss-grid-x30sn {
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
  }
}
@media (min-width: 1024px) {
  .hss-grid-x30sn {
    grid-template-columns: repeat(4, 1fr);
    gap: 24px;
  }
}

/* STORY CARD */
.hss-card-x30sn {
  background: #0a0a0a; border: 1px solid #222; border-radius: 12px; overflow: hidden;
  transition: 0.3s; display: flex; flex-direction: column; text-decoration: none;
}
.hss-card-x30sn:hover { transform: translateY(-4px); border-color: #ff69b4; box-shadow: 0 8px 20px rgba(0,0,0,0.5); }

/* THUMBNAIL 16:9 RATIO */
.hss-card-img-box-x30sn {
  position: relative;
  width: 100%;
  padding-top: 56.25%; /* 16:9 Aspect Ratio Force */
  overflow: hidden;
  background: #111;
}
.hss-card-img-x30sn {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover; transition: 0.5s;
}
.hss-card-x30sn:hover .hss-card-img-x30sn { transform: scale(1.05); }

.hss-card-badges-x30sn {
  position: absolute; top: 8px; left: 8px; display: flex; gap: 5px;
}
.hss-mini-badge-x30sn {
  background: rgba(0,0,0,0.8); color: #fff; font-size: 9px; font-weight: 700;
  padding: 3px 6px; border-radius: 4px; display: flex; align-items: center; gap: 3px; backdrop-filter: blur(4px);
}

.hss-card-content-x30sn {
  padding: 12px; flex: 1; display: flex; flex-direction: column;
}
.hss-card-cat-x30sn { color: #ff69b4; font-size: 10px; font-weight: 700; text-transform: uppercase; margin-bottom: 4px; }
.hss-card-title-x30sn {
  color: #fff; font-size: 14px; font-weight: 700; margin: 0 0 6px 0; line-height: 1.3;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.hss-card-excerpt-x30sn {
  color: #888; font-size: 11px; line-height: 1.4; margin-bottom: 10px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.hss-card-footer-x30sn {
  margin-top: auto; display: flex; align-items: center; gap: 8px; padding-top: 10px; border-top: 1px solid #1a1a1a;
}
.hss-small-avatar-x30sn { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; border: 1px solid #333; }
.hss-footer-info-x30sn { font-size: 11px; color: #fff; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 80px; }
.hss-footer-sub-x30sn { font-size: 10px; color: #666; font-weight: 400; }

/* SKELETONS */
.hss-skeleton-card-x30sn { background: #0a0a0a; border: 1px solid #222; border-radius: 12px; overflow: hidden; }
.hss-sk-img-x30sn { width: 100%; padding-top: 56.25%; background: #111; animation: pulse 1.5s infinite; }
.hss-sk-content-x30sn { padding: 12px; }
.hss-sk-line-x30sn { height: 10px; background: #111; border-radius: 6px; margin-bottom: 8px; animation: pulse 1.5s infinite; }
@keyframes pulse { 0% { opacity: 0.6; } 50% { opacity: 1; } 100% { opacity: 0.6; } }

/* RESPONSIVE LAYOUT */
@media (max-width: 1024px) {
  .hss-hero-card-x30sn { grid-template-columns: 1fr; padding: 20px; gap: 20px; }
  .hss-hero-img-wrap-x30sn { order: -1; }
  .hss-title-x30sn { font-size: 24px; }
}
@media (max-width: 600px) {
  .hss-header-x30sn { flex-direction: column; align-items: flex-start; gap: 10px; }
  .hss-view-all-btn-x30sn { width: 100%; justify-content: center; }
  .hss-hero-actions-x30sn { flex-direction: column; width: 100%; }
  .hss-btn-primary-x30sn, .hss-btn-secondary-x30sn { justify-content: center; }
}
`;

// --- SKELETON COMPONENT ---
const SkeletonCard = () => (
  <div className="hss-skeleton-card-x30sn">
    <div className="hss-sk-img-x30sn"></div>
    <div className="hss-sk-content-x30sn">
      <div className="hss-sk-line-x30sn" style={{width: '30%'}}></div>
      <div className="hss-sk-line-x30sn" style={{width: '80%', height: 16}}></div>
      <div className="hss-sk-line-x30sn"></div>
      <div className="hss-sk-line-x30sn" style={{marginTop: 10, width: '50%'}}></div>
    </div>
  </div>
);

// --- HERO SKELETON ---
const SkeletonHero = () => (
  <div className="hss-hero-card-x30sn">
    <div className="hss-hero-content-x30sn">
      <div className="hss-sk-line-x30sn" style={{width: 80, marginBottom: 15}}></div>
      <div className="hss-sk-line-x30sn" style={{width: '90%', height: 30, marginBottom: 15}}></div>
      <div className="hss-sk-line-x30sn" style={{width: '100%', height: 60}}></div>
    </div>
    <div className="hss-sk-img-x30sn" style={{borderRadius: 12}}></div>
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
          
          // Logic: Find featured (highest reads)
          const featured = allStories.length > 0 
            ? allStories.reduce((prev, current) => (prev.readCount || 0) > (current.readCount || 0) ? prev : current)
            : null;
          setFeaturedStory(featured);
          
          // Logic: Get random stories
          const otherStories = allStories.filter(s => s._id !== featured?._id);
          const shuffled = [...otherStories].sort(() => 0.5 - Math.random());
          setStories(shuffled.slice(0, 8)); // Show 8 stories to balance grid
        }
      } catch (err) {
        console.error('Error fetching stories:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStories();
  }, []);

  const categories = ['All', ...new Set(stories.map(s => s.category).filter(Boolean))];
  
  const filteredStories = activeCategory === 'All' 
    ? stories 
    : stories.filter(story => story.category === activeCategory);

  if (!loading && stories.length === 0 && !featuredStory) return null;

  return (
    <section className="hss-root-x30sn">
      <style>{styles}</style>
      <div className="hss-bg-glow-x30sn"></div>
      
      <div className="hss-container-x30sn">
        {/* HEADER */}
        <div className="hss-header-x30sn">
          <div>
            <div className="hss-badge-x30sn"><FaFire /> Trending Now</div>
            <h2 className="hss-title-x30sn">
              Interactive <span className="hss-title-highlight-x30sn">Stories</span>
            </h2>
            <p className="hss-desc-x30sn">
              Immerse yourself in captivating narratives from cities across India.
            </p>
          </div>
          <Link href="/hot-stories" className="hss-view-all-btn-x30sn">
            View All <FaChevronRight size={10} />
          </Link>
        </div>

        {/* FEATURED STORY */}
        {loading ? <SkeletonHero /> : featuredStory && (
          <div className="hss-hero-card-x30sn">
            <div className="hss-hero-content-x30sn">
              <div className="hss-hero-label-x30sn"><div className="hss-dot-x30sn"></div> Featured Story</div>
              <h3 className="hss-hero-title-x30sn">{featuredStory.title}</h3>
              <p className="hss-hero-text-x30sn">{featuredStory.excerpt || featuredStory.description}</p>
              
              <div className="hss-hero-meta-x30sn">
                <span className="hss-meta-item-x30sn"><FaMapMarkerAlt/> {featuredStory.city}</span>
                <span className="hss-meta-item-x30sn"><FaLayerGroup/> {featuredStory.category}</span>
              </div>

              <div className="hss-hero-actions-x30sn">
                <Link href={`/hot-stories/${featuredStory.slug || featuredStory._id}`} className="hss-btn-primary-x30sn">
                  <FaBookOpen /> Read Story
                </Link>
                <Link href={`/chatbox?chatId=${featuredStory.characterId || featuredStory._id}`} className="hss-btn-secondary-x30sn">
                  <FaCommentDots /> Chat
                </Link>
              </div>
            </div>
            
            <div className="hss-hero-img-wrap-x30sn">
              <img 
                src={featuredStory.backgroundImage || '/placeholder.jpg'} 
                alt={featuredStory.title} 
                className="hss-hero-img-x30sn"
              />
              <div className="hss-hero-overlay-x30sn">
                <img src={featuredStory.characterAvatar || '/placeholder.png'} className="hss-char-avatar-x30sn" alt="" />
                <div className="hss-char-info-x30sn">
                  <h4>{featuredStory.characterName}</h4>
                  <p>{featuredStory.characterAge}y • {featuredStory.city}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CATEGORY TABS */}
        <div className="hss-tabs-x30sn">
          {categories.map(cat => (
            <button 
              key={cat} 
              className={`hss-tab-btn-x30sn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* STORIES GRID (2 Items per row on mobile) */}
        <div className="hss-grid-x30sn">
          {loading ? [1,2,3,4].map(i => <SkeletonCard key={i}/>) : filteredStories.map(story => (
            <Link href={`/hot-stories/${story.slug || story._id}`} key={story._id} className="hss-card-x30sn">
              <div className="hss-card-img-box-x30sn">
                <img src={story.backgroundImage || '/placeholder.jpg'} className="hss-card-img-x30sn" alt={story.title} loading="lazy" />
                <div className="hss-card-badges-x30sn">
                  <div className="hss-mini-badge-x30sn"><FaMapMarkerAlt/> {story.city}</div>
                </div>
              </div>
              <div className="hss-card-content-x30sn">
                <div className="hss-card-cat-x30sn">{story.category}</div>
                <h4 className="hss-card-title-x30sn">{story.title}</h4>
                <p className="hss-card-excerpt-x30sn">{story.excerpt || "Interactive story..."}</p>
                
                <div className="hss-card-footer-x30sn">
                  <img src={story.characterAvatar || '/placeholder.png'} className="hss-small-avatar-x30sn" alt="" />
                  <div>
                    <div className="hss-footer-info-x30sn">{story.characterName}</div>
                    <div className="hss-footer-sub-x30sn">{story.characterAge}y</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {!loading && filteredStories.length === 0 && (
          <div style={{textAlign:'center', padding:40, color:'#666', border:'1px dashed #333', borderRadius:12}}>
            <h3>No stories found in this category</h3>
          </div>
        )}

      </div>
    </section>
  );
}