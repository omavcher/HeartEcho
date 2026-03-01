'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import axios from 'axios';
import api from '../config/api';
import { FaFire, FaMapMarkerAlt, FaBookOpen, FaCommentDots, FaChevronRight, FaLayerGroup } from 'react-icons/fa';

// ------------------- CSS STYLES (Premium Black & Pink) -------------------
const styles = `
.hss-root-x30sn {
  position: relative;
  padding: 80px 20px;
  background-color: #000;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* Ambient glow */
.hss-bg-glow-x30sn {
  position: absolute; top: -80px; left: 50%; transform: translateX(-50%);
  width: 900px; height: 600px;
  background: radial-gradient(ellipse at center, rgba(206,64,133,0.12) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
}

.hss-container-x30sn {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* â”€â”€ SECTION HEADER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.hss-header-x30sn {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 40px; flex-wrap: wrap; gap: 16px;
}
.hss-badge-x30sn {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(206,64,133,0.12); border: 1px solid rgba(206,64,133,0.35);
  color: #ce4085; padding: 5px 13px; border-radius: 30px;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; margin-bottom: 14px;
}
.hss-title-x30sn {
  font-size: clamp(26px, 5vw, 38px); font-weight: 800; line-height: 1.1;
  margin: 0 0 10px 0; color: #fff; letter-spacing: -1px;
}
.hss-title-highlight-x30sn {
  background: linear-gradient(135deg, #ce4085, #ff85c2);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hss-desc-x30sn { color: #777; font-size: 14px; max-width: 520px; line-height: 1.55; margin: 0; }

.hss-view-all-btn-x30sn {
  display: inline-flex; align-items: center; gap: 7px;
  color: #fff; text-decoration: none; font-weight: 600; font-size: 13px;
  padding: 10px 20px; border: 1px solid #2a2a2a; border-radius: 50px;
  background: #0d0d0d; transition: all 0.25s; white-space: nowrap; flex-shrink: 0;
}
.hss-view-all-btn-x30sn:hover {
  border-color: #ce4085; background: rgba(206,64,133,0.12); color: #ce4085;
  transform: translateY(-2px);
}

/* â”€â”€ FEATURED / HERO CARD â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.hss-hero-card-x30sn {
  display: grid; grid-template-columns: 1fr 1.1fr; gap: 0;
  background: #0a0a0a; border: 1px solid #1e1e1e; border-radius: 20px;
  margin-bottom: 48px; overflow: hidden; position: relative;
  transition: border-color 0.3s;
}
.hss-hero-card-x30sn:hover { border-color: #333; }
.hss-hero-content-x30sn {
  display: flex; flex-direction: column; justify-content: center;
  padding: 36px;
}
.hss-hero-label-x30sn {
  color: #00e676; font-size: 11px; font-weight: 700; text-transform: uppercase;
  display: inline-flex; align-items: center; gap: 7px; margin-bottom: 16px; letter-spacing: 0.6px;
}
.hss-dot-x30sn {
  width: 7px; height: 7px; background: #00e676; border-radius: 50%;
  box-shadow: 0 0 10px #00e676; animation: hss-blink 2s infinite;
}
@keyframes hss-blink { 0%,100%{opacity:1} 50%{opacity:0.4} }
.hss-hero-title-x30sn {
  font-size: clamp(20px, 3vw, 28px); font-weight: 800; color: #fff;
  margin: 0 0 12px 0; line-height: 1.25;
}
.hss-hero-text-x30sn {
  color: #999; font-size: 14px; line-height: 1.6; margin-bottom: 22px;
  display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;
}
.hss-hero-meta-x30sn { display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap; }
.hss-meta-item-x30sn {
  display: flex; align-items: center; gap: 5px; font-size: 12px; color: #aaa;
  background: #141414; border: 1px solid #222; padding: 5px 11px; border-radius: 8px;
}
.hss-hero-actions-x30sn { display: flex; gap: 10px; flex-wrap: wrap; }
.hss-btn-primary-x30sn {
  background: linear-gradient(135deg, #ce4085, #ff69b4);
  color: #fff; padding: 12px 22px; border-radius: 12px;
  font-weight: 700; text-decoration: none; display: flex; align-items: center;
  gap: 7px; transition: all 0.25s; font-size: 13px;
}
.hss-btn-primary-x30sn:hover {
  transform: translateY(-2px); box-shadow: 0 10px 24px rgba(206,64,133,0.35); filter: brightness(1.1);
}
.hss-btn-secondary-x30sn {
  background: transparent; border: 1px solid #2a2a2a; color: #ccc;
  padding: 12px 22px; border-radius: 12px; font-weight: 600;
  text-decoration: none; display: flex; align-items: center; gap: 7px;
  transition: all 0.25s; font-size: 13px;
}
.hss-btn-secondary-x30sn:hover { border-color: #ce4085; color: #ce4085; }
.hss-hero-img-wrap-x30sn {
  position: relative; overflow: hidden; min-height: 340px;
}
.hss-hero-img-x30sn { width: 100%; height: 100%; object-fit: cover; transition: transform 0.6s; display: block; }
.hss-hero-card-x30sn:hover .hss-hero-img-x30sn { transform: scale(1.04); }
.hss-hero-overlay-x30sn {
  position: absolute; bottom: 0; left: 0; width: 100%; padding: 20px 18px;
  background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, transparent 100%);
  display: flex; align-items: center; gap: 12px;
}
.hss-char-avatar-x30sn {
  width: 44px; height: 44px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,0.3); object-fit: cover; flex-shrink: 0;
}
.hss-char-info-x30sn h4 { color: #fff; margin: 0; font-size: 14px; font-weight: 700; }
.hss-char-info-x30sn p { color: rgba(255,255,255,0.55); margin: 2px 0 0; font-size: 11.5px; }

/* â”€â”€ CATEGORY TABS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.hss-tabs-x30sn {
  display: flex; gap: 6px; margin-bottom: 28px; overflow-x: auto; padding-bottom: 2px;
  scrollbar-width: none; -ms-overflow-style: none;
}
.hss-tabs-x30sn::-webkit-scrollbar { display: none; }
.hss-tab-btn-x30sn {
  background: transparent; color: #666; border: 1px solid transparent;
  padding: 7px 16px; font-size: 13px; font-weight: 600; cursor: pointer;
  border-radius: 30px; white-space: nowrap; transition: all 0.2s; flex-shrink: 0;
}
.hss-tab-btn-x30sn:hover { color: #fff; border-color: #2a2a2a; }
.hss-tab-btn-x30sn.active {
  background: rgba(206,64,133,0.12); color: #ce4085; border-color: rgba(206,64,133,0.35);
}

/* â”€â”€ STORY CARD GRID â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.hss-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 14px;
}
@media (min-width: 640px)  { .hss-grid-x30sn { grid-template-columns: repeat(3, 1fr); gap: 18px; } }
@media (min-width: 1024px) { .hss-grid-x30sn { grid-template-columns: repeat(4, 1fr); gap: 22px; } }

.hss-card-x30sn {
  background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 14px;
  overflow: hidden; transition: all 0.28s; display: flex; flex-direction: column;
  text-decoration: none; animation: hss-fadeup 0.4s ease both;
}
@keyframes hss-fadeup { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:none; } }
.hss-card-x30sn:hover {
  transform: translateY(-5px); border-color: rgba(206,64,133,0.4);
  box-shadow: 0 12px 32px rgba(206,64,133,0.12);
}

.hss-card-img-box-x30sn {
  position: relative; width: 100%; padding-top: 58%; overflow: hidden; background: #111;
}
.hss-card-img-x30sn {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover; transition: transform 0.5s;
}
.hss-card-x30sn:hover .hss-card-img-x30sn { transform: scale(1.06); }
.hss-card-img-box-x30sn::after {
  content: ''; position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 55%);
  pointer-events: none;
}

.hss-card-badges-x30sn {
  position: absolute; top: 9px; left: 9px; display: flex; gap: 5px; z-index: 1;
}
.hss-mini-badge-x30sn {
  background: rgba(0,0,0,0.75); backdrop-filter: blur(6px); color: #fff;
  font-size: 9px; font-weight: 700; padding: 3px 7px; border-radius: 5px;
  display: flex; align-items: center; gap: 3px; border: 1px solid rgba(255,255,255,0.08);
}

.hss-card-content-x30sn {
  padding: 13px 13px 14px; flex: 1; display: flex; flex-direction: column;
}
.hss-card-cat-x30sn {
  color: #ce4085; font-size: 10px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.5px; margin-bottom: 5px;
}
.hss-card-title-x30sn {
  color: #f0f0f0; font-size: 14px; font-weight: 700; margin: 0 0 6px 0;
  line-height: 1.35; display: -webkit-box; -webkit-line-clamp: 2;
  -webkit-box-orient: vertical; overflow: hidden;
}
.hss-card-excerpt-x30sn {
  color: #777; font-size: 12px; line-height: 1.45; margin-bottom: 10px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}
.hss-card-footer-x30sn {
  margin-top: auto; display: flex; align-items: center; gap: 8px;
  padding-top: 10px; border-top: 1px solid #181818;
}
.hss-small-avatar-x30sn {
  width: 26px; height: 26px; border-radius: 50%;
  object-fit: cover; border: 1px solid #2a2a2a; flex-shrink: 0;
}
.hss-footer-info-x30sn {
  font-size: 12px; color: #e0e0e0; font-weight: 600;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 90px;
}
.hss-footer-sub-x30sn { font-size: 10px; color: #555; font-weight: 400; }

/* â”€â”€ SKELETONS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.hss-skeleton-card-x30sn {
  background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 14px; overflow: hidden;
}
.hss-sk-img-x30sn { width: 100%; padding-top: 58%; background: #131313; animation: hss-pulse 1.5s ease infinite; }
.hss-sk-content-x30sn { padding: 13px; }
.hss-sk-line-x30sn {
  height: 10px; background: #161616; border-radius: 6px; margin-bottom: 9px;
  animation: hss-pulse 1.5s ease infinite;
}
@keyframes hss-pulse { 0%,100%{opacity:0.5} 50%{opacity:1} }

/* â”€â”€ BOTTOM CTA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
.hss-bottom-cta-x30sn {
  display: flex; align-items: center; justify-content: center;
  margin-top: 42px;
}
.hss-bottom-link-x30sn {
  display: inline-flex; align-items: center; gap: 9px;
  background: linear-gradient(135deg, #ce4085, #e0529a);
  color: #fff; text-decoration: none; font-weight: 700; font-size: 14px;
  padding: 14px 30px; border-radius: 50px; transition: all 0.25s;
}
.hss-bottom-link-x30sn:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 30px rgba(206,64,133,0.35);
  filter: brightness(1.08);
}

/* â”€â”€ RESPONSIVE â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
@media (max-width: 900px) {
  .hss-hero-card-x30sn { grid-template-columns: 1fr; }
  .hss-hero-img-wrap-x30sn { order: -1; min-height: 220px; }
  .hss-hero-content-x30sn { padding: 24px 22px 26px; }
}
@media (max-width: 600px) {
  .hss-root-x30sn { padding: 56px 16px; }
  .hss-header-x30sn { flex-direction: column; align-items: flex-start; gap: 8px; }
  .hss-view-all-btn-x30sn { width: 100%; justify-content: center; }
  .hss-hero-actions-x30sn { flex-direction: column; }
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
                  <p>{featuredStory.characterAge}y â€¢ {featuredStory.city}</p>
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

        {/* BOTTOM CTA */}
        {!loading && (
          <div className="hss-bottom-cta-x30sn">
            <Link href="/hot-stories" className="hss-bottom-link-x30sn">
               Browse All Hot Stories 
            </Link>
          </div>
        )}

      </div>
    </section>
  );
}
