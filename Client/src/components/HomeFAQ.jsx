import React, { useState } from 'react';
import '../styles/HomeFAQ.css';

function HomeFAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is HeartEcho AI?",
      answer: "HeartEcho is an advanced AI chatbot platform that lets you chat with AI-powered assistants, create custom AI characters, and personalize chatbot responses.",
    },
    {
      question: "How does HeartEcho AI chatbot work?",
      answer: "Our AI chatbots use natural language processing (NLP) and machine learning to understand user queries, provide human-like responses, and learn from conversations.",
    },
    {
      question: "Can I create my own AI chatbot?",
      answer: "Yes! With HeartEcho, you can customize and train your AI chatbot with unique personalities, knowledge, and response styles.",
    },
    {
      question: "Is HeartEcho free to use?",
      answer: "HeartEcho offers a free AI chatbot experience, but premium features are available with HeartEcho Pro.",
    },
    {
      question: "How do I get started with HeartEcho?",
      answer: "1. Sign up for free\n2. Choose or create an AI chatbot\n3. Start chatting instantly!",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <p className="faq-subtitle">Find quick answers to common questions about HeartEcho AI</p>
        
        <div className="faq-listxx">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
            >
              <div className="faq-question-container">
                <h3 className="faq-question">{faq.question}</h3>
                <span className={`faq-icon ${activeIndex === index ? 'active' : ''}`}>
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L8 8L15 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </span>
              </div>
              
              <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                {faq.answer.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HomeFAQ;