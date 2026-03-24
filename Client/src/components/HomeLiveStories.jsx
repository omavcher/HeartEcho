'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaFire, FaBookOpen, FaChevronRight } from 'react-icons/fa';
import api from '../config/api';

const styles = `
.hls-root {
  position: relative;
  padding: 80px 20px;
  background-color: #000;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  overflow: hidden;
}

/* Ambient glow */
.hls-bg-glow {
  position: absolute; top: 0px; left: 50%; transform: translateX(-50%);
  width: 900px; height: 600px;
  background: radial-gradient(ellipse at center, rgba(144, 19, 254, 0.15) 0%, transparent 70%);
  pointer-events: none; z-index: 0;
}

.hls-container {
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

/* ──── SECTION HEADER ──── */
.hls-header {
  display: flex; justify-content: space-between; align-items: flex-end;
  margin-bottom: 40px; flex-wrap: wrap; gap: 16px;
}
.hls-badge {
  display: inline-flex; align-items: center; gap: 7px;
  background: rgba(144, 19, 254, 0.15); border: 1px solid rgba(144, 19, 254, 0.35);
  color: #b862ff; padding: 5px 13px; border-radius: 30px;
  font-size: 11px; font-weight: 700; text-transform: uppercase;
  letter-spacing: 0.8px; margin-bottom: 14px;
}
.hls-title {
  font-size: clamp(26px, 5vw, 38px); font-weight: 800; line-height: 1.1;
  margin: 0 0 10px 0; color: #fff; letter-spacing: -1px;
}
.hls-title-highlight {
  background: linear-gradient(135deg, #b862ff, #ff85c2);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent;
}
.hls-desc { color: #777; font-size: 14px; max-width: 520px; line-height: 1.55; margin: 0; }

.hls-view-all-btn {
  display: inline-flex; align-items: center; gap: 7px;
  color: #fff; text-decoration: none; font-weight: 600; font-size: 13px;
  padding: 10px 20px; border: 1px solid #2a2a2a; border-radius: 50px;
  background: #0d0d0d; transition: all 0.25s; white-space: nowrap; flex-shrink: 0;
}
.hls-view-all-btn:hover {
  border-color: #b862ff; background: rgba(144, 19, 254, 0.15); color: #b862ff;
  transform: translateY(-2px);
}

/* ──── HORIZONTAL SCROLL GRID ──── */
.hls-grid {
  display: flex; gap: 20px;
  overflow-x: auto; padding-bottom: 20px;
  scrollbar-width: thin; scrollbar-color: rgba(255,255,255,0.2) transparent;
}
.hls-grid::-webkit-scrollbar { height: 8px; }
.hls-grid::-webkit-scrollbar-track { background: transparent; }
.hls-grid::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.2); border-radius: 10px; }
.hls-grid::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.4); }

.hls-card {
  min-width: 240px; max-width: 240px;
  background: #0a0a0a; border: 1px solid #1a1a1a; border-radius: 20px;
  overflow: hidden; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  display: flex; flex-direction: column; text-decoration: none; flex-shrink: 0;
}
.hls-card:hover {
  transform: translateY(-8px); border-color: rgba(144, 19, 254, 0.5);
  box-shadow: 0 15px 35px rgba(144, 19, 254, 0.2);
}

.hls-card-img-box {
  position: relative; width: 100%; aspect-ratio: 9/16; overflow: hidden; background: #111;
}
.hls-card-img {
  position: absolute; top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover; transition: transform 0.6s ease;
}
.hls-card:hover .hls-card-img { transform: scale(1.08); }

.hls-img-overlay {
  position: absolute; inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 50%, transparent 100%);
  pointer-events: none;
}

.hls-card-content {
  position: absolute; bottom: 0; left: 0; right: 0; padding: 20px;
  display: flex; flex-direction: column; z-index: 2;
}

.hls-card-cat {
  color: #b862ff; font-size: 11px; font-weight: 800; text-transform: uppercase;
  letter-spacing: 1px; margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.hls-card-title {
  color: #fff; font-size: 20px; font-weight: 700; margin: 0 0 6px 0;
  line-height: 1.2; text-shadow: 0 2px 5px rgba(0,0,0,0.8);
}

.hls-card-excerpt {
  color: #rgba(255,255,255,0.8); font-size: 13px; line-height: 1.4; margin-bottom: 12px;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
  text-shadow: 0 1px 3px rgba(0,0,0,0.8); color: #ccc;
}

.hls-card-footer {
  display: flex; align-items: center; justify-content: space-between;
  padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.15);
}
.hls-views { font-size: 12px; color: #aaa; font-weight: 600; display:flex; align-items:center; gap:5px; }

@media (max-width: 600px) {
  .hls-root { padding: 56px 16px; }
  .hls-header { flex-direction: column; align-items: flex-start; gap: 8px; }
  .hls-view-all-btn { width: 100%; justify-content: center; }
  .hls-card { min-width: 200px; max-width: 200px; }
}

@keyframes hls-pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}
`;

export default function HomeLiveStories() {
  const [liveStories, setLiveStories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStories = async () => {
      const cacheKey = 'hls_stories';
      const cacheTimeKey = 'hls_stories_time';
      const cachedData = sessionStorage.getItem(cacheKey);
      const cachedTime = sessionStorage.getItem(cacheTimeKey);
      
      const now = new Date().getTime();
      const ONE_MINUTE_MS = 60000; // 1 minute
      
      if (cachedData && cachedTime && (now - parseInt(cachedTime)) < ONE_MINUTE_MS) {
        setLiveStories(JSON.parse(cachedData));
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${api.Url}/live-story/stories`);
        const data = await res.json();
        if (data.success) {
          setLiveStories(data.stories);
          sessionStorage.setItem(cacheKey, JSON.stringify(data.stories));
          sessionStorage.setItem(cacheTimeKey, now.toString());
        }
      } catch (error) {
        console.error("Failed to fetch live stories:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStories();
  }, []);

  return (
    <section className="hls-root">
      <style>{styles}</style>
      <div className="hls-bg-glow"></div>
      
      <div className="hls-container">
        {/* HEADER */}
        <div className="hls-header">
          <div>
            <div className="hls-badge"><FaFire /> Trending</div>
            <h2 className="hls-title">
              Live A <span className="hls-title-highlight">Story</span>
            </h2>
            <p className="hls-desc">
              Experience the stories through live chats. Jump right in and witness the drama unfold.
            </p>
          </div>
          <Link href="/live-a-story" className="hls-view-all-btn">
            View All <FaChevronRight size={10} />
          </Link>
        </div>

        {/* STORIES GRID */}
        <div className="hls-grid">
          {loading ? (
            [1, 2, 3, 4, 5].map(i => (
              <div key={i} className="hls-card" style={{borderColor: '#1a1a1a', background: '#0a0a0a'}}>
                <div className="hls-card-img-box" style={{background: '#111'}}>
                  <div style={{width: '100%', height: '100%', background: '#222', animation: 'hls-pulse 1.5s infinite ease-in-out'}} />
                  <div className="hls-img-overlay"></div>
                  
                  <div className="hls-card-content">
                    <div style={{width: 60, height: 12, background: 'rgba(184, 98, 255, 0.4)', borderRadius: 4, marginBottom: 8, animation: 'hls-pulse 1.5s infinite ease-in-out'}} />
                    <div style={{width: '90%', height: 20, background: '#333', borderRadius: 4, marginBottom: 6, animation: 'hls-pulse 1.5s infinite ease-in-out'}} />
                    <div style={{width: '60%', height: 20, background: '#333', borderRadius: 4, marginBottom: 16, animation: 'hls-pulse 1.5s infinite ease-in-out'}} />
                    
                    <div style={{width: '100%', height: 12, background: '#222', borderRadius: 4, marginBottom: 6, animation: 'hls-pulse 1.5s infinite ease-in-out'}} />
                    <div style={{width: '80%', height: 12, background: '#222', borderRadius: 4, marginBottom: 12, animation: 'hls-pulse 1.5s infinite ease-in-out'}} />
                    
                    <div className="hls-card-footer">
                      <div style={{width: 70, height: 12, background: '#333', borderRadius: 4, animation: 'hls-pulse 1.5s infinite ease-in-out'}} />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : liveStories.length > 0 ? (
            liveStories.map((story) => (
              <Link href={`/live-a-story/${story.slug}`} key={story._id || story.slug} className="hls-card">
                <div className="hls-card-img-box">
                  {/* Fallback pattern since images are dummy paths for now, will show nicely styled alt if missing */}
                  <div style={{position: 'absolute', inset: 0, background: 'linear-gradient(45deg, #111, #222)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', zIndex: 0}}>
                     <span style={{opacity: 0.1, fontSize: 60}}><FaBookOpen /></span>
                  </div>
                  {/* Actual poster */}
                  <img src={story.poster} className="hls-card-img" alt={story.title} loading="lazy" 
                       onError={(e) => { e.target.style.display = 'none'; }} />
                  <div className="hls-img-overlay"></div>
                  
                  <div className="hls-card-content">
                    <div className="hls-card-cat">{story.category}</div>
                    <h4 className="hls-card-title">{story.title}</h4>
                    <p className="hls-card-excerpt">{story.description}</p>
                    
                    <div className="hls-card-footer">
                      <span className="hls-views"><FaFire size={12}/> {story.views} views</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
             <div style={{padding: '20px', color: '#666'}}>No live stories available right now.</div>
          )}
        </div>
      </div>
    </section>
  );
}
