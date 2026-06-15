'use client';

import { useState } from "react";
import "../styles/FaqSection.css";

function FaqSection({ onBackSBTNSelect, isSubComponent = false, onNavigateToLiveChat, onNavigateToTickets }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const faqs = [
    {
      category: "general",
      question: "What is HeartEcho and how does it work?",
      answer: "HeartEcho is an advanced AI companion platform designed to offer emotional support and engaging conversations. Using custom-trained language models, it understands tone, tracks recurring moods, and adapts to your style over time.",
    },
    {
      category: "general",
      question: "Is my data and chat history private?",
      answer: "Absolutely. We employ industry-standard encryption protocols. Your data is strictly confidential, stored securely, and is never shared with third parties.",
    },
    {
      category: "billing",
      question: "Will the charge show as 'HeartEcho' on my statement?",
      answer: "No. To protect your privacy, billing descriptors are entirely discrete. Charges will appear under generic billing names like 'HE* Services'.",
    },
    {
      category: "billing",
      question: "What happens when my daily quota runs out?",
      answer: "Free accounts get 5 messages daily. Once exhausted, you can upgrade to our Premium plan for completely unlimited text, audio, and companion training features.",
    },
    {
      category: "chat",
      question: "Can I customize the AI companion's personality?",
      answer: "Yes, our dashboard allows you to configure direct, empathetic, or motivational personas to adjust responses based on your mood.",
    },
    {
      category: "chat",
      question: "Does the AI have long-term memory?",
      answer: "Premium users enjoy persistent context memory. Your companion remembers past conversations, milestones, and details you share.",
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          faq.answer.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {!isSubComponent && (
        <header className="profile-setting-header-new">
          <button className="back-btn-new" onClick={() => onBackSBTNSelect(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"></path>
            </svg>
          </button>
          <h2>Help Center FAQ</h2>
        </header>
      )}

      <div className="faq-container-dwdjwd">
        {/* Search Bar */}
        <div className="faq-search-wrapper-dwdjwd">
          <svg className="search-icon-dwdjwd" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.031 16.6168L22.3137 20.8995L20.8995 22.3137L16.6168 18.031C15.0769 19.263 13.124 20 11 20C6.032 20 2 15.968 2 11C2 6.032 6.032 2 11 2C15.968 2 20 6.032 20 11C20 13.124 19.263 15.0769 18.031 16.6168ZM16.0247 15.8748C17.2475 14.6146 18 12.8956 18 11C18 7.1325 14.8675 4 11 4C7.1325 4 4 7.1325 4 11C4 14.8675 7.1325 18 11 18C12.8956 18 14.6146 17.2475 15.8748 16.0247L16.0247 15.8748Z"/>
          </svg>
          <input
            type="text"
            placeholder="Search help articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="faq-search-input-dwdjwd"
          />
          {searchTerm && (
            <button className="clear-search-dwdjwd" onClick={() => setSearchTerm("")}>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22C6.477 22 2 17.523 2 12S6.477 2 12 2s10 4.477 10 10-4.477 10-10 10zm0-11.414L9.172 7.757 7.757 9.172 10.586 12l-2.829 2.828 1.415 1.415L12 13.414l2.828 2.829 1.415-1.415L13.414 12l2.829-2.828-1.415-1.415L12 10.586z"/>
              </svg>
            </button>
          )}
        </div>

        {/* Categories Selector */}
        <div className="faq-categories-control">
          {["all", "general", "billing", "chat"].map((cat) => (
            <button 
              key={cat} 
              className={`faq-cat-btn ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => { setActiveCategory(cat); setActiveIndex(null); }}
            >
              {cat === 'all' ? 'All Questions' : cat === 'general' ? 'Account' : cat === 'billing' ? 'Billing' : 'AI Companion'}
            </button>
          ))}
        </div>

        {/* FAQ List */}
        <div className="faq-list-dwdjwd">
          {filteredFaqs.length === 0 ? (
            <div className="no-results-dwdjwd">
              <h3>No answers found</h3>
              <p>Try searching another keyword or contact live support.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, index) => (
              <div key={index} className="faq-item-dwdjwd">
                <button 
                  className={`faq-question-dwdjwd ${activeIndex === index ? 'active-dwdjwd' : ''}`}
                  onClick={() => setActiveIndex(activeIndex === index ? null : index)}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', color: 'var(--primary-pink-dwdjwd)' }}>
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                    </svg>
                    <span className="faq-question-text-dwdjwd">{faq.question}</span>
                  </div>
                  <span className={`faq-arrow-dwdjwd ${activeIndex === index ? 'arrow-up-dwdjwd' : 'arrow-down-dwdjwd'}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 13.1714L16.9497 8.22168L18.3639 9.63589L12 15.9998L5.63605 9.63589L7.05026 8.22168L12 13.1714Z"/>
                    </svg>
                  </span>
                </button>
                <div className={`faq-answer-dwdjwd ${activeIndex === index ? "show-dwdjwd" : ""}`}>
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
            <p>Our helpdesk is available 24/7. Switch over to live messaging or log a direct ticket.</p>
            <div className="cta-buttons-dwdjwd">
              <button className="cta-button-primary-dwdjwd" onClick={onNavigateToTickets}>
                Open Ticket
              </button>
              <button className="cta-button-secondary-dwdjwd" onClick={onNavigateToLiveChat}>
                Live Chat Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default FaqSection;