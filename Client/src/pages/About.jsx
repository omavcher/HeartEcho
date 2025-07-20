'use client';
import Image from 'next/image';
import { motion } from 'framer-motion';
import './AboutPage.css';
import Footer from '../components/Footer'

const AboutPage = () => {
  return (
    <>
    <div className="idkxpw-about-container">
      <section className="idkxpw-hero-section">
        <div className="idkxpw-hero-content">
          <motion.div 
            className="idkxpw-founder-card"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="idkxpw-founder-image-container">
              <Image
                src="/founder-image.webp" // Replace with your image path
                alt="Founder of EchoHeart"
                width={200}
                height={200}
                className="idkxpw-founder-image"
              />
              <div className="idkxpw-founder-badge">Founder & Developer</div>
            </div>
            <h1 className="idkxpw-founder-name">Om Avcher</h1>
            <p className="idkxpw-founder-title">Creator of EchoHeart</p>
          </motion.div>

          <motion.div 
            className="idkxpw-hero-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
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
          className="idkxpw-about-card"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          <h3 className="idkxpw-section-title">🧠 The Core Idea</h3>
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
          className="idkxpw-about-card"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="idkxpw-section-title">📈 The Journey</h3>
          <p className="idkxpw-section-text">
            With no team or funding — just passion — I took EchoHeart from concept to execution. 
            In just 5 months:
          </p>
          <ul className="idkxpw-achievement-list">
            <li>Reached 200,000+ users organically</li>
            <li>Generated $1,500+ in revenue</li>
            <li>Created a safe space for emotional connection</li>
          </ul>
          <p className="idkxpw-section-text">
            Every part — branding, UX, development, and growth — was handled by me alone.
          </p>
        </motion.div>

        <motion.div 
          className="idkxpw-about-card"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="idkxpw-section-title">💬 Why EchoHeart Matters</h3>
          <p className="idkxpw-section-text">
            Today's generation is overwhelmed by social media yet under-connected emotionally. 
            EchoHeart fills that void — not by replacing real relationships, but by complementing them.
          </p>
          <p className="idkxpw-section-text">
            Whether you're stressed, isolated, or just want to feel heard — EchoHeart is there.
          </p>
        </motion.div>

        <motion.div 
          className="idkxpw-about-card idkxpw-vision-card"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <h3 className="idkxpw-section-title">🌱 The Vision Ahead</h3>
          <p className="idkxpw-section-text">
            EchoHeart is just the beginning. My goal is to build an ecosystem of AI-driven emotional 
            wellness tools — from virtual friendships to mental health support and digital companionship.
          </p>
          <p className="idkxpw-section-text">
            What started as one person's vision is now growing into a movement. And I'm just getting started.
          </p>
          <div className="idkxpw-signature">— Om Avcher</div>
        </motion.div>
      </section>
    

    </div>    <Footer/>
    </>
  );
};

export default AboutPage;