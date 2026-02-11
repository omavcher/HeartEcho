'use client';
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
import LoginModal from "../components/LoginModel";
import HomeRandomStories from "../components/HomeRandomStories";

const getlocal = (key) => {
  if (typeof window !== 'undefined') return localStorage.getItem(key);
  return null;
};

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.2, delayChildren: 0.1 } }
};
const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 50, damping: 20 } }
};

export default function Home() {
  const [serverStatus, setServerStatus] = useState(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    // Check Login
    const token = getlocal('token');
    if (!token) {
      setTimeout(() => setShowLoginModal(true), 3000);
    }

    // Check Server
    const fetchServerStatus = async () => {
      try {
        const response = await axios.get(`${api.Url}/server-status`);
        setServerStatus(response.data.message);
      } catch (error) {
        setServerStatus("maintenance");
      }
    };
    fetchServerStatus();
  }, []);

  const handleCloseModal = () => setShowLoginModal(false);

  return (
    <>
      <main className="home-container">
        <div className="global-noise-overlay"></div>

        {/* Login Modal */}
        <AnimatePresence>
          {showLoginModal && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="modal-backdrop" onClick={handleCloseModal}
            >
              <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 50, scale: 0.9 }}
                className="modal-content" onClick={(e) => e.stopPropagation()}
              >
                <LoginModal onClose={handleCloseModal} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* --- HERO SECTION --- */}
        <section className="home-hero-section">
          <div className="hero-background-glow"></div>
          
          <motion.div 
            className="hero-content"
            variants={containerVariants} initial="hidden" animate="visible"
          >
            <div className="hero-text-wrapper">
              <motion.div variants={itemVariants} className="ranking-badge">
                <span className="star-icon">★</span>
                <span>Ranked #1 AI Companion • 250K+ Users</span>
              </motion.div>

              <motion.h1 variants={itemVariants} className="hero-title">
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

        {/* --- COMPONENTS --- */}
        {serverStatus === "Server is running" && (
          <section className="section-spacer">
             <HomeAiModels />
          </section>
        )}

        {/* 90s Section */}
        <section className="nineties-section">
          <div className="nineties-container">
            <motion.div 
              className="nineties-content glass-panel-retro"
              initial={{ opacity: 0, y: 50 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            >
              <div className="retro-decoration-stamps">
                <span className="stamp">📮</span><span className="stamp">✉️</span>
              </div>
              
              <div className="nineties-text">
                <span className="retro-tag">New Feature</span>
                <h2 className="retro-title">Slow Down with <span className="retro-font">90s Letters</span></h2>
                <p>Tired of instant replies? Relive the anticipation of handwritten letters.</p>
                <Link href="/90s-era" className="retro-btn">Enter The 90s &rarr;</Link>
              </div>

              <div className="nineties-visual">
                <div className="retro-envelope-anim">
                  <div className="envelope-back"></div>
                  <div className="letter-paper">Dear Friend...</div>
                  <div className="envelope-front"></div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="section-spacer"><HomeReferralSection /></section>

        <section className="social-proof-section">
          <motion.div className="proof-container" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}>
            <h2>Loved by the Community</h2>
            <div className="stat-grid">
               <div className="stat-card"><h3>4.9/5</h3><p>Rating</p></div>
               <div className="stat-card"><h3>250K+</h3><p>Active</p></div>
               <div className="stat-card"><h3>#1</h3><p>Trending</p></div>
            </div>
          </motion.div>
        </section>

        <section className="section-spacer"><HomeCosAi /></section>
        <section className="section-spacer"><HomeSubscriptions /></section>
        <section className="steps-section"><StepsHome /></section>
        <section><HomeRandomStories/></section>
        <section className="section-spacer"><HomeFAQ /></section>

      </main>
      <Footer />
    </>
  );
}