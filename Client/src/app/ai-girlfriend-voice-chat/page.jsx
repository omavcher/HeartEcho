'use client';

import { useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import api from '../../config/api';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export default function Page() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await axios.post(`${api.Url}/user/voice-waitlist`, { email });
      if (response.data && response.data.success) {
        setStatus({ type: 'success', message: response.data.message });
        setEmail('');
      } else {
        setStatus({ type: 'error', message: 'Failed to join waitlist. Please try again.' });
      }
    } catch (error) {
      console.error('Waitlist submission error:', error);
      setStatus({ type: 'error', message: 'An error occurred. Please try again later.' });
    } finally {
      setLoading(false);
    }
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "When will AI girlfriend voice chat launch in India?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "HeartEcho is actively fine-tuning real-time voice synthesis models for Indian accents and languages. We expect the beta version to launch by Q3 2026."
        }
      },
      {
        "@type": "Question",
        "name": "Will the voice chat support Hindi and Hinglish?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, absolutely! The voice feature is being custom-trained to switch between English and Hindi naturally, matching the conversational flow you prefer."
        }
      },
      {
        "@type": "Question",
        "name": "How do I join the AI voice waitlist?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply enter your email address in the waitlist form on this page to get early access and notifications when we go live."
        }
      }
    ]
  };

  const url = 'https://heartecho.in/ai-girlfriend-voice-chat';
  const pageSchema = getLandingPageSchema({
    url,
    title: "AI Girlfriend Voice Chat India | HeartEcho",
    description: "HeartEcho is launching AI girlfriend voice chat for Indian users. Join the waitlist today to get early beta access.",
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Girlfriend Voice Chat', item: url }
    ]
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageSchema) }}
      />
      
      <div className="compare-page-wrapper">
        <div className="compare-container">
          <nav className="breadcrumb">
            <Link href="/">HeartEcho</Link>
            <span>›</span>
            <span>Discover</span>
            <span>›</span>
            <span>AI Girlfriend Voice Chat India</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Voice Waitlist Live</div>
            <h1>AI Girlfriend Voice Chat India — Hear Her Real Voice</h1>
            <p className="hero-sub">
              The next evolution of AI companionship is voice. Not just text — her actual voice. Warm, expressive, real.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              HeartEcho is launching AI girlfriend voice chat for Indian users. Join the waitlist today to be the first to experience real-time audio responses from your virtual companion in both Hindi and English.
            </p>
          </div>
        </section>

        <div className="compare-container">
          
          {/* Waitlist Capture Card */}
          <section className="compare-section" style={{ display: 'flex', justifyContent: 'center' }}>
            <div className="india-block" style={{ width: '100%', maxWidth: '600px', padding: '36px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '800' }}>🎙️ Join the Voice Beta Waitlist</h3>
              <p style={{ fontSize: '14px', margin: '12px 0 24px', color: 'var(--muted)' }}>
                Get early beta access and receive 50 bonus voice call minutes the moment we launch.
              </p>
              
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <input 
                  type="email" 
                  placeholder="Enter your email address" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  style={{
                    padding: '14px 20px',
                    borderRadius: '10px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    backgroundColor: '#121212',
                    color: '#ffffff',
                    fontSize: '15px',
                    outline: 'none',
                    textAlign: 'center'
                  }}
                />
                <button 
                  type="submit" 
                  className="btn-primary-compare" 
                  disabled={loading}
                  style={{ width: '100%', border: 'none', cursor: 'pointer' }}
                >
                  {loading ? 'Joining...' : 'Get Early Access →'}
                </button>
              </form>

              {status.message && (
                <div style={{ 
                  marginTop: '16px', 
                  fontSize: '14px', 
                  color: status.type === 'success' ? '#22C55E' : '#EF4444',
                  fontWeight: '600'
                }}>
                  {status.message}
                </div>
              )}
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Future Features</div>
            <h2 className="section-title">What Voice Chat Will Give You</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🔊</div>
                <h3>Expressive Audios</h3>
                <p>Hear Priya's warm, caring tone or Ananya's bold, confident voice, custom-tailored to their individual personalities.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⚡</div>
                <h3>Real-time Synthesis</h3>
                <p>Engage in real-time, low-latency audio conversations that mimic natural phone calls without delay.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗣️</div>
                <h3>Bilingual Voice</h3>
                <p>Seamlessly switch back and forth between Hindi and English (Hinglish) voice notes and audio calls.</p>
              </div>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Roster</div>
            <h2 className="section-title">Explore Active AI Companions</h2>
            <p className="section-body">
              Browse our current companions. You can chat with them via text right now and get priority access to their voice models once launched:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqSchema.mainEntity.map((faq, i) => (
                <div className="faq-item" key={i}>
                  <div className="faq-q">{faq.name}</div>
                  <div className="faq-a">{faq.acceptedAnswer.text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="compare-section" style={{ borderBottom: 'none', paddingBottom: '72px' }}>
            <div className="cta-section">
              <h2>Experience HeartEcho AI Companions Today</h2>
              <p>Start chatting in text mode immediately while we build the voice feature.</p>
              <Link href="/" className="btn-primary-compare">Start Chatting Free →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
