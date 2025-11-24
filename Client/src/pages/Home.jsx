'use client';
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import "../styles/Home.css";

// Components
import HomeAiModels from "../components/HomeAiModels";
import StepsHome from "../components/StepsHome";
import HomeFAQ from "../components/HomeFAQ";
import HomeCosAi from "../components/HomeCosAi";
import Footer from "../components/Footer";
import HomeSubscriptions from "../components/HomeSubscriptions";
import HomeReferralSection from "../components/HomeReferralSection";
import api from "../config/api";

// --- Animation Variants for Smooth Staggering ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 }
  }
};

// --- Hero Carousel Component ---
const HeroCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  // Replace these with your actual screenshots/images
  const images = ["/hero1.jpg", "/hero2.jpg", "/hero3.jpg"]; 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length]);

  return (
    <div className="carousel-container">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          className="carousel-image-wrapper"
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
        >
          {/* Fallback div if images aren't real yet, otherwise use Image component */}
          <div className={`carousel-placeholder gradient-bg-${currentIndex}`} />
          {/* <Image src={images[currentIndex]} alt="App Screenshot" fill className="carousel-image" priority /> */}
        </motion.div>
      </AnimatePresence>
      
      <div className="carousel-indicators">
        {images.map((_, idx) => (
          <button
            key={idx}
            className={`indicator ${idx === currentIndex ? 'active' : ''}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Home() {
  const [serverStatus, setServerStatus] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const [showCTADialog, setShowCTADialog] = useState(false);

  useEffect(() => {
    const fetchServerStatus = async () => {
      try {
        const response = await axios.get(`${api.Url}/server-status`);
        setServerStatus(response.data.message);
      } catch (error) {
        setServerStatus("maintenance");
      }
    };
    fetchServerStatus();

    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (serverStatus === "Server is running") {
      const timer = setTimeout(() => setShowCTADialog(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [serverStatus]);

  return (
    <>
      <main className="home-container">
        {/* Background Texture for "Premium" Feel */}
        <div className="global-noise-overlay"></div>

        {/* --- HERO SECTION --- */}
        <section className="home-hero-section" aria-labelledby="hero-title">
          <div className="hero-background-glow"></div>
          
          <motion.div 
            className="hero-content"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Left: Text Content */}
            <div className="hero-text-wrapper">
              <motion.div variants={itemVariants} className="ranking-badge glass-panel">
                <span className="star-icon">★</span>
                <span>Ranked #1 AI Companion • 250K+ Users</span>
              </motion.div>

              <motion.h1 variants={itemVariants} id="hero-title" className="hero-title">
                Your AI <span className="text-gradient">HeartEcho</span>, <br />
                <span className="text-highlight">Your Rules.</span>
              </motion.h1>

              <motion.p variants={itemVariants} className="hero-subtitle">
                Experience deep emotional connections with AI tailored to your personality. 
                The most advanced companion platform on the web.
              </motion.p>

            </div>

          </motion.div>
        </section>

        {/* --- AI MODELS (Load immediately if server is ready) --- */}
        {serverStatus === "Server is running" && (
          <section className="section-spacer">
             <HomeAiModels />
          </section>
        )}

        {/* --- 90s ERA SECTION (Feature Highlight) --- */}
        <section className="nineties-section" aria-labelledby="retro-heading">
          <div className="nineties-container">
            <motion.div 
              className="nineties-content glass-panel-retro"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
            >
              <div className="retro-decoration-stamps">
                <span className="stamp">📮</span>
                <span className="stamp">✉️</span>
              </div>
              
              <div className="nineties-text">
                <span className="retro-tag">New Feature</span>
                <h2 id="retro-heading" className="retro-title">Slow Down with <span className="retro-font">90s Letters</span></h2>
                <p>
                  Tired of instant replies? Relive the anticipation of handwritten letters. 
                  Collect stamps, wait for replies, and feel the nostalgia.
                </p>
                <Link href="/90s-era" className="retro-btn">
                  Enter The 90s &rarr;
                </Link>
              </div>

              <div className="nineties-visual">
                {/* CSS Encapsulated Envelope Animation */}
                <div className="retro-envelope-anim">
                  <div className="envelope-back"></div>
                  <div className="letter-paper">Dear Friend...</div>
                  <div className="envelope-front"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* --- REFERRAL & SOCIAL PROOF --- */}
        <section className="section-spacer">
          <HomeReferralSection />
        </section>

        <section className="social-proof-section">
          <motion.div 
            className="proof-container"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <h2>Loved by the Community</h2>
            <div className="stat-grid">
               <div className="stat-card">
                 <h3>4.9/5</h3>
                 <p>Average User Rating</p>
               </div>
               <div className="stat-card">
                 <h3>250K+</h3>
                 <p>Active Conversations</p>
               </div>
               <div className="stat-card">
                 <h3>#1</h3>
                 <p>Trending AI App</p>
               </div>
            </div>
          </motion.div>
        </section>

        {/* --- CUSTOMIZATION & SUBSCRIPTION --- */}
        <section className="section-spacer" aria-label="Customization">
          <HomeCosAi />
        </section>

        <section className="section-spacer" aria-label="Pricing">
          <HomeSubscriptions />
        </section>

        {/* --- HOW IT WORKS --- */}
        <section className="steps-section">
          <div className="section-header">
            <h2>Your Journey Begins Here</h2>
            <p>Three simple steps to your perfect companion</p>
          </div>
          <StepsHome />
        </section>

        <section className="section-spacer">
          <HomeFAQ />
        </section>

      </main>
      <Footer />
    </>
  );
}