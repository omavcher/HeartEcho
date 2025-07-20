'use client';


import "../styles/FaqSection.css";

function FaqSection({ onBackSBTNSelect }) {
  const [activeIndex, setActiveIndex] = useState(null);

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
  
  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <>
      <header className='profile-setting-header3'>
        <h2>FAQ</h2>
        <button onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions (FAQs)</h2>
        <div className="faq-list">
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button 
                className="faq-question" 
                onClick={() => toggleFAQ(index)}
                aria-expanded={activeIndex === index}
                aria-controls={`faq-answer-${index}`}
              >
                {faq.question}
                <span className={activeIndex === index ? "arrow-up" : "arrow-down"}>▼</span>
              </button>
              <div 
                id={`faq-answer-${index}`}
                className={`faq-answer ${activeIndex === index ? "show" : ""}`}
              >
                {faq.answer}
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default FaqSection;