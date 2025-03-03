import React, { useState } from 'react';
import '../styles/HomeFAQ.css'

function HomeFAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "What is HeartEcho AI?",
      answer:
        "HeartEcho is an advanced AI chatbot platform that lets you chat with AI-powered assistants, create custom AI characters, and personalize chatbot responses.",
    },
    {
      question: "How does HeartEcho AI chatbot work?",
      answer:
        "Our AI chatbots use natural language processing (NLP) and machine learning to understand user queries, provide human-like responses, and learn from conversations.",
    },
    {
      question: "Can I create my own AI chatbot?",
      answer:
        "Yes! With HeartEcho, you can customize and train your AI chatbot with unique personalities, knowledge, and response styles.",
    },
    {
      question: "Is HeartEcho free to use?",
      answer:
        "HeartEcho offers a free AI chatbot experience, but premium features are available with HeartEcho Pro.",
    },
    {
      question: "How do I get started with HeartEcho?",
      answer:
        " Sign up for free \n |  Choose or create an AI chatbot \n |  Start chatting instantly!",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };
  return (
    <>
     <div className="faq-container">
      <h2 className="faq-title">Frequently Asked Questions (FAQs)</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className="faq-item">
            <button className="faq-question" onClick={() => toggleFAQ(index)}>
              {faq.question}
              <span className={activeIndex === index ? "arrow-up" : "arrow-down"}>▼</span>
            </button>
            <p className={`faq-answer ${activeIndex === index ? "show" : ""}`}>
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
    </>
  )
}

export default HomeFAQ