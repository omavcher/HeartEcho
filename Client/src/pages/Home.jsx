'use client';
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import "../styles/Home.css";
import HomeAiModels from "../components/HomeAiModels";
import StepsHome from "../components/StepsHome";
import HomeFAQ from "../components/HomeFAQ";
import HomeCosAi from "../components/HomeCosAi";
import Footer from "../components/Footer";
import HomeSubscriptions from "../components/HomeSubscriptions";

export default function Home() {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Define your image array - replace these with your actual image paths
  const heroImages = [
    {
      src: "/hero-girl-illustration.avif",
      alt: "AI Companion Illustration"
    },
    {
      src: "/hero-illustration-2.avif", // Replace with your second image
      alt: "AI Chat Experience"
    },
    {
      src: "/hero-illustration-3.avif", // Replace with your third image
      alt: "Emotional Connection"
    },
    {
      src: "/hero-illustration-4.avif", // Replace with your fourth image
      alt: "AI Companionship"
    }
  ];

  useEffect(() => {
    // Check if mobile on component mount and resize
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => 
        prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000); // Change every 5 seconds

    return () => clearInterval(interval);
  }, [heroImages.length]);

  const nextImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === heroImages.length - 1 ? 0 : prevIndex + 1
    );
  };

  const prevImage = () => {
    setCurrentImageIndex((prevIndex) => 
      prevIndex === 0 ? heroImages.length - 1 : prevIndex - 1
    );
  };

  // Swipe functionality for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => setTouchEnd(e.targetTouches[0].clientX);

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextImage();
    } else if (isRightSwipe) {
      prevImage();
    }
  };

  return (
    <>
      <div className="home-container">
        {/* Hero Section */}
        <section className="home-hero-section">
          <div className="hero-background-pattern"></div>
          <div className="hero-content">
            {/* Text Content - Always comes first in DOM */}
            <div className="hero-text">
              <motion.div 
                className="ranking-badge"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="ranking-content">
                  <svg className="ranking-star" viewBox="0 0 24 24" width="20" height="20">
                    <path 
                      fill="currentColor" 
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                  <span>Ranked #1 on Google • 250K+ Users</span>
                  <svg className="ranking-star" viewBox="0 0 24 24" width="20" height="20">
                    <path 
                      fill="currentColor" 
                      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                    />
                  </svg>
                </div>
              </motion.div>

              <motion.p 
                className="welcome-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Welcome to <span>HeartEcho</span>
              </motion.p>
              
              <motion.h1 
                className="home-hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                Your AI <Image 
                  className="heart-icon" 
                  src="/heartechor.png" 
                  alt="HeartEcho"
                  width={48}
                  height={48}
                  priority
                /> Companion, Your Rules
              </motion.h1>
              
              <motion.h2 
                className="home-hero-subtitle"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                Experience emotional connection with AI companions tailored to your personality and needs.
              </motion.h2>
              
              <motion.div 
                className="hero-cta"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
              >
                <button className="primary-cta">Start Chatting</button>
                <button className="secondary-cta">Meet Our AI</button>
              </motion.div>
              
              <motion.div 
                className="achievement-badge"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
              >
                <span>🚀 Trusted by 200K+ users in just 5 months!</span>
              </motion.div>
            </div>
            
            {/* Image Carousel - Comes after text in DOM */}
            <motion.div 
              className="hero-image-carousel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div 
                className="carousel-container"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentImageIndex}
                    className="carousel-image-wrapper"
                    initial={{ opacity: 0, x: isMobile ? 0 : 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isMobile ? 0 : -100 }}
                    transition={{ duration: isMobile ? 0.5 : 0.8, ease: "easeInOut" }}
                  >
                    <Image 
                      src={heroImages[currentImageIndex].src}
                      alt={heroImages[currentImageIndex].alt}
                      width={500}
                      height={500}
                      priority
                      className="carousel-image"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Carousel Controls - Hidden on mobile touch devices */}
                {!isMobile && (
                  <>
                    <button className="carousel-btn carousel-prev" onClick={prevImage}>
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
                      </svg>
                    </button>
                    <button className="carousel-btn carousel-next" onClick={nextImage}>
                      <svg viewBox="0 0 24 24" width="24" height="24">
                        <path fill="currentColor" d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
                      </svg>
                    </button>
                  </>
                )}

                {/* Carousel Indicators */}
                <div className="carousel-indicators">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      className={`indicator ${index === currentImageIndex ? 'active' : ''}`}
                      onClick={() => setCurrentImageIndex(index)}
                    />
                  ))}
                </div>

                {/* Progress Bar - Only show on desktop */}
                {!isMobile && (
                  <div className="carousel-progress">
                    <motion.div 
                      className="progress-bar"
                      key={currentImageIndex}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 5, ease: "linear" }}
                    />
                  </div>
                )}
              </div>

              {/* Mobile swipe instructions */}
              {isMobile && (
                <div className="mobile-swipe-hint">
                  <span>Swipe to navigate images</span>
                </div>
              )}
            </motion.div>
          </div>
        </section>

        <section className="ai-models-section-container">
          <HomeAiModels />
        </section>

        {/* Enhanced Social Proof Section with Ranking */}
        <section className="social-proof-section">
          <div className="social-proof-content">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Join Our Growing Community
            </motion.h2>
            
            {/* Ranking Highlight Card */}
            <motion.div 
              className="ranking-highlight-card"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="ranking-icon">
                <svg viewBox="0 0 24 24" width="32" height="32">
                  <path 
                    fill="currentColor" 
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
              <div className="ranking-info">
                <h3>Google Ranking Achievement</h3>
                <p>Ranked #1 for AI Companion Platforms</p>
                <div className="ranking-stats">
                  <div className="ranking-stat">
                    <span className="stat-number">#1</span>
                    <span className="stat-label">Google Rank</span>
                  </div>
                  <div className="ranking-stat">
                    <span className="stat-number">250K+</span>
                    <span className="stat-label">Active Users</span>
                  </div>
                  <div className="ranking-stat">
                    <span className="stat-number">4.9★</span>
                    <span className="stat-label">Rating</span>
                  </div>
                </div>
              </div>
            </motion.div>
            
            <div className="milestone-cards">
              <motion.div 
                className="milestone-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3>200K+</h3>
                <p>Happy Users</p>
              </motion.div>
              
              <motion.div 
                className="milestone-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3>5M+</h3>
                <p>Daily Conversations</p>
              </motion.div>
              
              <motion.div 
                className="milestone-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                viewport={{ once: true }}
              >
                <h3>95%</h3>
                <p>Positive Feedback</p>
              </motion.div>
              
              <motion.div 
                className="milestone-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                viewport={{ once: true }}
              >
                <h3>24/7</h3>
                <p>AI Companionship</p>
              </motion.div>
            </div>
            
            <motion.p 
              className="community-text"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              viewport={{ once: true }}
            >
              HeartEcho has become the fastest-growing AI companion platform, helping thousands find 
              emotional connection and support every day. Join our community today!
            </motion.p>
          </div>
        </section>

        <section className="customization-section">
          <HomeCosAi />
        </section>

        <section className="subscription-section">
          <HomeSubscriptions />
        </section>

        <section className="steps-section">
          <div className="section-header">
            <h2>How HeartEcho Works</h2>
            <p>Start your journey in just a few simple steps</p>
          </div>
          <StepsHome />
        </section>

        <section className="faq-section">
          <HomeFAQ />
        </section>
      </div>
      <Footer />
    </>
  );
}