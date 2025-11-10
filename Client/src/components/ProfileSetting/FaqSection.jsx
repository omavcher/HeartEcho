'use client';

import { useState } from "react";
import "../styles/FaqSection.css";

function FaqSection({ onBackSBTNSelect }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      question: "What is HeartEcho and how does it work?",
      answer:
        "HeartEcho is an advanced AI-powered conversational platform designed to help users reflect on their thoughts and emotions. Using cutting-edge Natural Language Processing (NLP) and sentiment analysis, it provides personalized insights, mood tracking, and AI-driven journaling to enhance self-awareness.",
    },
    {
      question: "Is HeartEcho a chatbot or a personal AI assistant?",
      answer:
        "HeartEcho is more than just a chatbot – it's your AI-powered emotional companion. Unlike traditional chatbots, it adapts to your personality, understands your emotions, and offers tailored suggestions for self-improvement, mental wellness, and goal tracking.",
    },
    {
      question: "How does HeartEcho ensure privacy and data security?",
      answer:
        "We prioritize user privacy with end-to-end encryption, secure cloud storage, and compliance with GDPR & CCPA regulations. Your conversations are confidential and never shared with third parties.",
    },
    {
      question: "Can HeartEcho replace therapy or professional counseling?",
      answer:
        "No, HeartEcho is an AI-based self-reflection tool designed for mental wellness and self-growth. It does not provide medical or psychological advice. If you're experiencing severe mental health issues, we recommend consulting a licensed professional.",
    },
    {
      question: "Does HeartEcho support voice interactions?",
      answer:
        "Yes! Our AI is equipped with voice recognition technology, allowing users to talk naturally instead of typing. This feature enhances accessibility and provides a more immersive experience.",
    },
    {
      question: "Is HeartEcho free to use?",
      answer:
        "HeartEcho offers a freemium model. Basic features like AI journaling and mood tracking are free, while advanced features such as AI-driven therapy insights, premium chatbot personalities, and deep emotional analytics are available in the premium version.",
    },
    {
      question: "How does HeartEcho personalize AI conversations?",
      answer:
        "Our AI adapts to your communication style, tracks recurring emotions, and learns from past conversations using machine learning algorithms. This ensures every interaction feels tailored and meaningful.",
    },
    {
      question: "Can I use HeartEcho for self-improvement and habit tracking?",
      answer:
        "Absolutely! HeartEcho offers AI-powered habit tracking, motivational reminders, and personalized goal-setting to help you build positive routines and improve productivity.",
    },
    {
      question: "Does HeartEcho integrate with other apps?",
      answer:
        "Yes! We are working on integrations with Google Calendar, Apple Health, and Notion, allowing seamless tracking of your mental wellness journey across multiple platforms.",
    },
    {
      question: "Is my data stored permanently?",
      answer:
        "You have full control over your data. You can delete past conversations, export your journaling insights, or deactivate your account at any time. Your privacy is our top priority.",
    },
    {
      question: "Can I customize the AI's personality?",
      answer:
        "Yes! HeartEcho offers customizable AI personalities with different tones – choose between Empathetic, Motivational, or Direct responses based on your preference.",
    },
    {
      question: "What makes HeartEcho different from other AI chatbots?",
      answer:
        "HeartEcho is not just an AI chatbot – it's an intelligent journaling assistant, mood tracker, and self-improvement guide. Unlike generic AI bots, it provides deep emotional insights, long-term memory, and adaptive responses to help users grow mentally and emotionally.",
    },
    {
      question: "How can I get early access to new HeartEcho features?",
      answer:
        "Join our beta tester program to access exclusive features before they are publicly released. Sign up on our website and be the first to experience the future of AI-driven emotional intelligence.",
    },
    {
      question: "Is HeartEcho available on mobile?",
      answer:
        "Yes! HeartEcho is available as a progressive web app (PWA), allowing seamless access from mobile browsers. A dedicated iOS and Android app is coming soon!",
    },
    {
      question: "How can I contact support if I face issues?",
      answer:
        "Our support team is available 24/7. You can reach us via live chat, email, or our AI-powered helpdesk for instant assistance.",
    },
  ];

  // Filter FAQs based on search term
  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const clearSearch = () => {
    setSearchTerm("");
  };

  return (
    <>
      <header className='profile-setting-header3-dwdjwd'>
        <h2 className="faq-header-title-dwdjwd">FAQ & Help Center</h2>
        <button className="back-button-dwdjwd" onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon-dwdjwd">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="faq-container-dwdjwd">
        <div className="faq-hero-dwdjwd">
          <div className="faq-hero-icon-dwdjwd">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v-8h2v8h-2zm0 4v-2h2v2h-2z"/>
            </svg>
          </div>
          <h1 className="faq-title-dwdjwd">Frequently Asked Questions</h1>
          <p className="faq-subtitle-dwdjwd">
            Find quick answers to common questions about HeartEcho
          </p>
        </div>

        {/* Search Bar */}
        <div className="faq-search-container-dwdjwd">
          <div className="faq-search-wrapper-dwdjwd">
            <svg className="search-icon-dwdjwd" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"/>
            </svg>
            <input
              type="text"
              placeholder="Search questions or keywords..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="faq-search-input-dwdjwd"
            />
            {searchTerm && (
              <button className="clear-search-dwdjwd" onClick={clearSearch}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-11.414L9.172 7.757 7.757 9.172 10.586 12l-2.829 2.828 1.415 1.415L12 13.414l2.828 2.829 1.415-1.415L13.414 12l2.829-2.828-1.415-1.415L12 10.586z"/>
                </svg>
              </button>
            )}
          </div>
          <div className="search-results-count-dwdjwd">
            {searchTerm && (
              <span>
                Found {filteredFaqs.length} result{filteredFaqs.length !== 1 ? 's' : ''} for "{searchTerm}"
              </span>
            )}
          </div>
        </div>

        {/* FAQ List */}
        <div className="faq-list-dwdjwd">
          {filteredFaqs.length === 0 ? (
            <div className="no-results-dwdjwd">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm-1-7v-8h2v8h-2zm0 4v-2h2v2h-2z"/>
              </svg>
              <h3>No results found</h3>
              <p>Try different keywords or browse all questions below</p>
              <button className="show-all-faqs-dwdjwd" onClick={clearSearch}>
                Show All FAQs
              </button>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="faq-item-dwdjwd">
                <button 
                  className={`faq-question-dwdjwd ${activeIndex === index ? 'active-dwdjwd' : ''}`}
                  onClick={() => toggleFAQ(index)}
                  aria-expanded={activeIndex === index}
                  aria-controls={`faq-answer-${index}`}
                >
                  <span className="faq-question-text-dwdjwd">{faq.question}</span>
                  <span className={`faq-arrow-dwdjwd ${activeIndex === index ? 'arrow-up-dwdjwd' : 'arrow-down-dwdjwd'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 13.1714L16.9497 8.22168L18.3639 9.63589L12 15.9998L5.63605 9.63589L7.05026 8.22168L12 13.1714Z"/>
                    </svg>
                  </span>
                </button>
                <div 
                  id={`faq-answer-${index}`}
                  className={`faq-answer-dwdjwd ${activeIndex === index ? "show-dwdjwd" : ""}`}
                >
                  <div className="faq-answer-content-dwdjwd">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Support CTA */}
        <div className="faq-support-cta-dwdjwd">
          <div className="cta-content-dwdjwd">
            <h3>Still need help?</h3>
            <p>Can't find what you're looking for? Our support team is here to assist you.</p>
            <div className="cta-buttons-dwdjwd">
              <button className="cta-button-primary-dwdjwd">
                Contact Support
              </button>
              <button className="cta-button-secondary-dwdjwd">
                Live Chat
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FaqSection;