'use client';

import Image from "next/image";
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
          <div className="hero-content">
            <div className="hero-text">
              <p className="welcome-text">Welcome to <span>HeartEcho</span></p>
              <h1 className="home-hero-title">
                Your AI <Image 
                  className="heart-icon" 
                  src="/heartechor.png" 
                  alt="HeartEcho"
                  width={48}
                  height={48}
                  priority
                /> Companion, Your Rules
              </h1>
              <h2 className="home-hero-subtitle">
                Experience emotional connection with AI companions tailored to your personality and needs.
              </h2>
              <div className="hero-cta">
                <button className="primary-cta">Start Chatting</button>
                <button className="secondary-cta">Meet Our AI</button>
              </div>
            </div>
            <div className="hero-image">
              <Image 
                src="/hero-illustration.png" 
                alt="AI Companion Illustration"
                width={500}
                height={500}
                priority
              />
            </div>
          </div>
        </section>

        {/* Rest of your components remain the same */}
        <section className="ai-models-section-container">
          <div className="section-header">
            <h2>Choose Your Perfect Companion</h2>
            <p>Select from our diverse range of AI personalities</p>
          </div>
          <HomeAiModels />
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
          <div className="section-header">
            <h2>Frequently Asked Questions</h2>
            <p>Everything you need to know about HeartEcho</p>
          </div>
          <HomeFAQ />
        </section>

        <footer className="footer">
          <Footer />
        </footer>
      </div>
    </>
  );
}