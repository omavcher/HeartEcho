'use client';

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { liveStoriesData } from "../data/liveStoriesData";
import { FaPlay, FaFire, FaLayerGroup } from "react-icons/fa";
import AdvancedLoader from "../components/AdvancedLoader";

const STYLES = `
.lsl-page {
    min-height: 100vh;
    background-color: #000;
    color: #fff;
    font-family: 'Inter', system-ui, sans-serif;
    padding-bottom: 90px;
    position: relative;
    overflow-x: hidden;
}

.lsl-glow {
    position: absolute;
    top: 0; left: 50%;
    transform: translateX(-50%);
    width: 800px;
    height: 400px;
    background: radial-gradient(ellipse, rgba(144, 19, 254, 0.15) 0%, transparent 70%);
    z-index: 0;
    pointer-events: none;
}

.lsl-content {
    position: relative;
    z-index: 1;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 16px;
}

/* --- TOP HEADER --- */
.lsl-top-header {
    padding: 30px 0 24px;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
}
.lsl-title {
    font-size: clamp(34px, 8vw, 54px);
    font-weight: 900;
    margin: 0 0 10px 0;
    color: #fff;
    line-height: 1.1;
    letter-spacing: -1.5px;
}
.lsl-title-glow {
    background: linear-gradient(135deg, #b862ff, #ff85c2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    display: inline-block;
}
.lsl-subtitle {
    color: #a1a1aa;
    font-size: 16px;
    max-width: 600px;
    margin: 0;
    font-weight: 500;
}

/* --- CAROUSEL REEL (HERO) --- */
.lsl-carousel-section {
    position: relative;
    margin-bottom: 40px;
    width: 100%;
}
.lsl-carousel-container {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    width: 100%; /* Force exact bounding wrapper */
}
.lsl-carousel-container::-webkit-scrollbar { display: none; }

.lsl-hero-card {
    scroll-snap-align: start;
    min-width: 100%;
    width: 100%;
    aspect-ratio: 16/9;
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.05);
    box-shadow: 0 10px 30px rgba(0,0,0,0.5);
    display: block;
    text-decoration: none;
    -webkit-user-drag: none;
}
@media (min-width: 768px) {
    .lsl-hero-card {
        border-radius: 20px;
        aspect-ratio: 21/9;
    }
}
@media (min-width: 1024px) {
    .lsl-hero-card {
        aspect-ratio: 2.5 / 1;
        max-height: 420px;
    }
}
.lsl-hero-img {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.6s ease;
}
.lsl-hero-card:hover .lsl-hero-img {
    transform: scale(1.02);
}

/* --- CAROUSEL DOTS --- */
.lsl-dots-wrapper {
    display: flex;
    justify-content: center;
    gap: 8px;
    margin-top: 16px;
    margin-bottom: 10px;
}
.lsl-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: rgba(255,255,255,0.2);
    cursor: pointer;
    transition: all 0.3s ease;
}
.lsl-dot.active {
    background: #b862ff;
    width: 24px;
    border-radius: 4px;
}


/* --- SECTION HEADERS --- */
.lsl-section-title {
    font-size: 22px;
    font-weight: 800;
    margin: 0 0 16px 0;
    display: flex;
    align-items: center;
    gap: 8px;
    color: #fff;
}
.lsl-section-icon { color: #b862ff; }

/* --- TRENDING LIST (HORIZONTAL) --- */
.lsl-trending-list {
    display: flex;
    gap: 16px;
    overflow-x: auto;
    padding-bottom: 20px;
    margin-bottom: 40px;
    scrollbar-width: none;
}
.lsl-trending-list::-webkit-scrollbar { display: none; }

.lsl-trend-card {
    min-width: 160px;
    max-width: 160px;
    aspect-ratio: 9/16;
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    flex-shrink: 0;
    display: block;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.05);
}
@media (min-width: 768px) {
    .lsl-trend-card {
        min-width: 200px;
        max-width: 200px;
    }
}
.lsl-trend-card:hover {
    transform: translateY(-5px);
    border-color: rgba(144, 19, 254, 0.4);
    box-shadow: 0 10px 20px rgba(144, 19, 254, 0.2);
}
.lsl-trend-rank {
    position: absolute;
    top: -2px; left: 8px;
    font-size: 48px;
    font-weight: 900;
    -webkit-text-stroke: 1px rgba(255,255,255,0.8);
    color: transparent;
    z-index: 2;
    font-family: 'Arial Black', sans-serif;
    text-shadow: 2px 4px 6px rgba(0,0,0,0.6);
}

/* --- ALL LISTINGS GRID --- */
.lsl-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
}
@media (min-width: 600px) { .lsl-grid { grid-template-columns: repeat(3, 1fr); gap: 20px; } }
@media (min-width: 1024px) { .lsl-grid { grid-template-columns: repeat(5, 1fr); gap: 24px; } }

.lsl-grid-card {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 9/16;
    display: block;
    text-decoration: none;
    border: 1px solid rgba(255,255,255,0.05);
    transition: all 0.3s;
}
.lsl-grid-card:hover {
    transform: scale(1.03);
    border-color: rgba(144, 19, 254, 0.3);
    z-index: 10;
    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
}
.lsl-card-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.lsl-card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.1) 50%, transparent 100%);
    padding: 14px;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
}
.lsl-card-title {
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    margin: 0;
    line-height: 1.2;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}
.lsl-card-cat {
    font-size: 10px;
    color: #b862ff;
    font-weight: 700;
    text-transform: uppercase;
    margin-top: 4px;
}
`;


export default function LiveStoryListingPage() {
    const [isLoading, setIsLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselRef = useRef(null);

    // Filter Stories
    const heroStories = liveStoriesData.slice(0, 3); 
    const trendingStories = [...liveStoriesData].sort((a,b) => parseFloat(b.views) - parseFloat(a.views)).slice(0, 10);
    const allStories = liveStoriesData;

    useEffect(() => {
        // Quick simulated load to ensure hydration completes safely
        const tmr = setTimeout(() => setIsLoading(false), 200);
        return () => clearTimeout(tmr);
    }, []);

    // Auto-Scroll Logic for Carousel
    useEffect(() => {
        if (heroStories.length <= 1) return;
        
        const interval = setInterval(() => {
            setCurrentSlide((prev) => {
                const nextSlide = (prev + 1) % heroStories.length;
                if (carouselRef.current) {
                    const slideWidth = carouselRef.current.offsetWidth;
                    // Disable standard scroll-behavior temporarily and use scrollTo for exact precision,
                    // or just rely on CSS smooth scrolling. CSS 'scroll-behavior: smooth' is applied.
                    carouselRef.current.scrollTo({
                        left: nextSlide * slideWidth,
                        behavior: 'smooth'
                    });
                }
                return nextSlide;
            });
        }, 4000); // 4 seconds interval

        return () => clearInterval(interval);
    }, [heroStories.length]);

    const handleCarouselScroll = () => {
        if (carouselRef.current) {
            const scrollLeft = carouselRef.current.scrollLeft;
            const slideWidth = carouselRef.current.offsetWidth;
            const index = Math.round(scrollLeft / slideWidth);
            setCurrentSlide(index);
        }
    };

    if (isLoading) return <AdvancedLoader />;

    return (
        <div className="lsl-page">
            <style>{STYLES}</style>
            <div className="lsl-glow"></div>
            
            <div className="lsl-content">
                {/* Header */}
                <div className="lsl-top-header">
                    <h1 className="lsl-title">Live A <span className="lsl-title-glow">Story</span></h1>
                    <p className="lsl-subtitle">Immerse yourself in cinematic interactive chatting experiences.</p>
                </div>

                {/* Top Image Consoler (Carousel) */}
                <div className="lsl-carousel-section">
                    <div 
                        className="lsl-carousel-container" 
                        ref={carouselRef}
                        onScroll={handleCarouselScroll}
                    >
                        {heroStories.map((story) => (
                            <Link href={`/live-a-story/${story.slug}`} key={story.id} className="lsl-hero-card">
                                <img 
                                    src={story.banner || story.poster} 
                                    alt={story.title} 
                                    className="lsl-hero-img" 
                                    onError={(e) => { e.target.style.display = 'none'; }} 
                                />
                            </Link>
                        ))}
                    </div>
                    {/* Carousel Dots / Map */}
                    <div className="lsl-dots-wrapper">
                        {heroStories.map((_, idx) => (
                            <div 
                                key={idx} 
                                className={`lsl-dot ${currentSlide === idx ? 'active' : ''}`}
                                onClick={() => {
                                    setCurrentSlide(idx);
                                    if(carouselRef.current) {
                                        carouselRef.current.scrollTo({
                                            left: idx * carouselRef.current.offsetWidth,
                                            behavior: 'smooth'
                                        });
                                    }
                                }}
                            ></div>
                        ))}
                    </div>
                </div>

                {/* Trending Top 10 */}
                {trendingStories.length > 0 && (
                    <div style={{marginBottom: '50px'}}>
                        <h2 className="lsl-section-title">
                            <FaFire className="lsl-section-icon" /> Trending Top 10
                        </h2>
                        <div className="lsl-trending-list">
                            {trendingStories.map((story, idx) => (
                                <Link href={`/live-a-story/${story.slug}`} key={`trend-${story.id}`} className="lsl-trend-card">
                                    <span className="lsl-trend-rank">{idx + 1}</span>
                                    <img src={story.poster} alt={story.title} className="lsl-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
                                    <div className="lsl-card-overlay">
                                        <h3 className="lsl-card-title">{story.title}</h3>
                                        <div className="lsl-card-cat">{story.category}</div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {/* All Listings */}
                <div>
                    <h2 className="lsl-section-title">
                        <FaLayerGroup className="lsl-section-icon" /> All Stories
                    </h2>
                    <div className="lsl-grid">
                        {allStories.map((story) => (
                            <Link href={`/live-a-story/${story.slug}`} key={`all-${story.id}`} className="lsl-grid-card">
                                <img src={story.poster} alt={story.title} className="lsl-card-img" onError={(e) => { e.target.style.display = 'none'; }} />
                                <div className="lsl-card-overlay">
                                    <h3 className="lsl-card-title">{story.title}</h3>
                                    <div className="lsl-card-cat">{story.category}</div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
