'use client';

import Image from "next/image";
import { motion } from "framer-motion";
import "../styles/Home.css";
import HomeAiModels from "../components/HomeAiModels";
import StepsHome from "../components/StepsHome";
import HomeFAQ from "../components/HomeFAQ";
import HomeCosAi from "../components/HomeCosAi";
import Footer from "../components/Footer";
import HomeSubscriptions from "../components/HomeSubscriptions";

export default function Home() {
  return (
    <>
      <div className="home-container">
        {/* Hero Section */}
        <section className="home-hero-section">
          <div className="hero-background-pattern"></div>
          <div className="hero-content">
            <div className="hero-text">
              <motion.p 
                className="welcome-text"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Welcome to <span>HeartEcho</span>
              </motion.p>
              
              <motion.h1 
                className="home-hero-title"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
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
                transition={{ duration: 0.6, delay: 0.6 }}
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
                <span>🚀 Trusted by 200,000+ users in just 5 months!</span>
              </motion.div>
            </div>
            
            <motion.div 
              className="hero-image"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <Image 
                src="/hero-illustration.png" 
                alt="AI Companion Illustration"
                width={500}
                height={500}
                priority
              />
            </motion.div>
          </div>
        </section>

        

        <section className="ai-models-section-container">
          <HomeAiModels />
        </section>


{/* Social Proof Section */}
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
            
            <div className="milestone-cards">
              <motion.div 
                className="milestone-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <h3>200K+</h3>
                <p>Happy Users</p>
              </motion.div>
              
              <motion.div 
                className="milestone-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <h3>5M+</h3>
                <p>Daily Conversations</p>
              </motion.div>
              
              <motion.div 
                className="milestone-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <h3>95%</h3>
                <p>Positive Feedback</p>
              </motion.div>
              
              <motion.div 
                className="milestone-card"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
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
              transition={{ duration: 0.6, delay: 0.5 }}
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