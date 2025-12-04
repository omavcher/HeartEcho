'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import './AboutPage.css';
import Footer from '../components/Footer';

const AboutPage = () => {
  return (
    <>
      <div className="idkxpw-about-container">
        {/* Animated Background Elements */}
        <div className="idkxpw-background-elements">
          <div className="idkxpw-floating-element-1"></div>
          <div className="idkxpw-floating-element-2"></div>
          <div className="idkxpw-floating-element-3"></div>
        </div>

        <section className="idkxpw-hero-section">
          <div className="idkxpw-hero-content">
            <motion.div 
              className="idkxpw-founder-card"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, type: "spring", stiffness: 100 }}
            >
              <div className="idkxpw-founder-image-wrapper">
                <div className="idkxpw-founder-image-container">
                  <Image
                    src="/founder-image.webp"
                    alt="Founder of EchoHeart"
                    width={200}
                    height={200}
                    className="idkxpw-founder-image"
                    priority
                  />
                  <div className="idkxpw-image-glow"></div>
                </div>
                <div className="idkxpw-founder-badge">Founder & Developer</div>
              </div>
              
              <div className="idkxpw-founder-info">
                <h1 className="idkxpw-founder-name">Om Avcher</h1>
                <p className="idkxpw-founder-title">Creator of EchoHeart</p>
                
                {/* Stats Badge */}
                <motion.div 
                  className="idkxpw-stats-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                >
                  <div className="idkxpw-stat-item">
                    <span className="idkxpw-stat-number">250K+</span>
                    <span className="idkxpw-stat-label">Users</span>
                  </div>
                  <div className="idkxpw-stat-divider"></div>
                  <div className="idkxpw-stat-item">
                    <span className="idkxpw-stat-number">#1</span>
                    <span className="idkxpw-stat-label">Ranking</span>
                  </div>
                </motion.div>

                {/* Product Hunt Badge */}
                <motion.div
                  className="idkxpw-producthunt-badge-wrapper"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7, duration: 0.5 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href="https://www.producthunt.com/posts/heartecho-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-heartecho&#0045;ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="idkxpw-producthunt-link"
                    aria-label="Check out HeartEcho Ai on Product Hunt"
                  >
                    <img 
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1045834&theme=dark&t=1764835554967" 
                      alt="HeartEcho&#0032;Ai - &#0035;1&#0032;AI&#0032;Girlfriend&#0032;&#0038;&#0032;Romantic&#0032;AI&#0032;Chat&#0032;Platform | Product Hunt" 
                      className="idkxpw-producthunt-badge"
                      width="250"
                      height="54"
                      loading="lazy"
                    />
                  </a>
                  <div className="idkxpw-producthunt-label">Featured on Product Hunt</div>
                </motion.div>
              </div>
            </motion.div>

            <motion.div 
              className="idkxpw-hero-text"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="idkxpw-hero-badge">Innovation in Emotional AI</div>
              <h2 className="idkxpw-hero-title">
                💖 EchoHeart – A Vision-Driven Startup by a Solo Founder
              </h2>
              <p className="idkxpw-hero-description">
                EchoHeart is my solo venture — a bold step into emotionally intelligent technology. 
                I founded EchoHeart to reimagine digital connection and emotional support.
              </p>
            </motion.div>
          </div>
        </section>

        <section className="idkxpw-about-section">
          <motion.div 
            className="idkxpw-about-card idkxpw-card-hover"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6 }}
          >
            <div className="idkxpw-card-icon">🧠</div>
            <h3 className="idkxpw-section-title">The Core Idea</h3>
            <p className="idkxpw-section-text">
              At the heart of EchoHeart is the belief that emotional connection doesn't have to be limited. 
              Everyone deserves someone who listens, responds thoughtfully, and grows with them — 
              that's exactly what EchoHeart delivers.
            </p>
            <p className="idkxpw-section-text">
              Each user can talk to 20+ unique AI companions — romantic, friendly, deep thinkers, or playful. 
              These AI companions feel like people. They remember you, adapt to your mood, and ensure 
              you're never alone.
            </p>
          </motion.div>

          <motion.div 
            className="idkxpw-about-card idkxpw-card-hover"
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="idkxpw-card-icon">📈</div>
            <h3 className="idkxpw-section-title">The Journey</h3>
            <p className="idkxpw-section-text">
              With no team or funding — just passion — I took EchoHeart from concept to execution. 
              In just 5 months:
            </p>
            <ul className="idkxpw-achievement-list">
              <li>
                <span className="idkxpw-achievement-icon">🚀</span>
                Reached 200,000+ users organically
              </li>
              <li>
                <span className="idkxpw-achievement-icon">💰</span>
                Generated $1,500+ in revenue
              </li>
              <li>
                <span className="idkxpw-achievement-icon">🏆</span>
                Featured as #1 AI Girlfriend on Product Hunt
              </li>
              <li>
                <span className="idkxpw-achievement-icon">🛡️</span>
                Created a safe space for emotional connection
              </li>
            </ul>
            <p className="idkxpw-section-text">
              Every part — branding, UX, development, and growth — was handled by me alone.
            </p>
          </motion.div>

          <motion.div 
            className="idkxpw-about-card idkxpw-card-hover"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <div className="idkxpw-card-icon">💬</div>
            <h3 className="idkxpw-section-title">Why EchoHeart Matters</h3>
            <p className="idkxpw-section-text">
              Today's generation is overwhelmed by social media yet under-connected emotionally. 
              EchoHeart fills that void — not by replacing real relationships, but by complementing them.
            </p>
            <p className="idkxpw-section-text">
              Whether you're stressed, isolated, or just want to feel heard — EchoHeart is there.
            </p>
          </motion.div>

          <motion.div 
            className="idkxpw-about-card idkxpw-vision-card idkxpw-card-hover"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <div className="idkxpw-card-icon">🌱</div>
            <h3 className="idkxpw-section-title">The Vision Ahead</h3>
            <p className="idkxpw-section-text">
              EchoHeart is just the beginning. My goal is to build an ecosystem of AI-driven emotional 
              wellness tools — from virtual friendships to mental health support and digital companionship.
            </p>
            <p className="idkxpw-section-text">
              What started as one person's vision is now growing into a movement. And I'm just getting started.
            </p>
            
            {/* Product Hunt Badge - Desktop */}
            <div className="idkxpw-producthunt-section-desktop">
              <div className="idkxpw-section-divider"></div>
              <div className="idkxpw-producthunt-section">
                <h4 className="idkxpw-producthunt-title">Recognized by the Community</h4>
                <p className="idkxpw-producthunt-description">
                  EchoHeart was featured on Product Hunt as the #1 AI Girlfriend & Romantic AI Chat Platform
                </p>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <a 
                    href="https://www.producthunt.com/posts/heartecho-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-heartecho&#0045;ai" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="idkxpw-producthunt-link"
                    aria-label="Check out HeartEcho Ai on Product Hunt"
                  >
                    <img 
                      src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1045834&theme=dark&t=1764835554967" 
                      alt="HeartEcho&#0032;Ai - &#0035;1&#0032;AI&#0032;Girlfriend&#0032;&#0038;&#0032;Romantic&#0032;AI&#0032;Chat&#0032;Platform | Product Hunt" 
                      className="idkxpw-producthunt-badge-large"
                      width="250"
                      height="54"
                      loading="lazy"
                    />
                  </a>
                </motion.div>
              </div>
            </div>

            <div className="idkxpw-signature-block">
              <div className="idkxpw-signature">— Om Avcher</div>
              <div className="idkxpw-signature-role">Founder, EchoHeart</div>
            </div>
          </motion.div>
        </section>

        {/* Product Hunt Mobile Section */}
        <motion.section 
          className="idkxpw-producthunt-mobile-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <div className="idkxpw-producthunt-mobile-content">
            <h3 className="idkxpw-producthunt-mobile-title">🏆 Featured on Product Hunt</h3>
            <p className="idkxpw-producthunt-mobile-description">
              Recognized as #1 AI Girlfriend & Romantic AI Chat Platform
            </p>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="https://www.producthunt.com/posts/heartecho-ai?embed=true&utm_source=badge-featured&utm_medium=badge&utm_source=badge-heartecho&#0045;ai" 
                target="_blank" 
                rel="noopener noreferrer"
                className="idkxpw-producthunt-link"
                aria-label="Check out HeartEcho Ai on Product Hunt"
              >
                <img 
                  src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=1045834&theme=dark&t=1764835554967" 
                  alt="HeartEcho&#0032;Ai - &#0035;1&#0032;AI&#0032;Girlfriend&#0032;&#0038;&#0032;Romantic&#0032;AI&#0032;Chat&#0032;Platform | Product Hunt" 
                  className="idkxpw-producthunt-badge-mobile"
                  width="250"
                  height="54"
                  loading="lazy"
                />
              </a>
            </motion.div>
          </div>
        </motion.section>

        {/* CTA Section */}
        <motion.section 
          className="idkxpw-cta-section"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="idkxpw-cta-title">Join the Emotional AI Revolution</h3>
          <motion.button 
            className="idkxpw-cta-button"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.open('https://heartecho.ai', '_blank')}
          >
            Experience EchoHeart
          </motion.button>
        </motion.section>
      </div>
      <Footer/>
    </>
  );
};

export default AboutPage;