import { faqCategories } from '../../data/faqs';
import './faqs.css';
import Footer from '../../components/Footer';
import { FaChevronDown, FaSearch } from 'react-icons/fa';

export const metadata = {
  title: "HeartEcho FAQ — AI Girlfriend Questions Answered | Hindi AI Chat Help",
  description: "Got questions about HeartEcho? Find answers about Hindi AI girlfriend chat, privacy, pricing, how it works, and more. India's #1 AI companion — free to try.",
  keywords: [
    "HeartEcho FAQ", "AI girlfriend FAQ India", "hindi AI chat help", "AI companion questions",
    "is AI girlfriend safe", "how to chat with AI girlfriend", "HeartEcho pricing",
    "virtual girlfriend questions India", "AI girlfriend privacy", "free AI girlfriend India"
  ],
  alternates: {
    canonical: 'https://heartecho.in/faq',
  }
};

export default function FAQPage() {
  // JSON-LD Structured Data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqCategories.flatMap(category => 
      category.items.map(item => ({
        "@type": "Question",
        "name": item.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": item.answer
        }
      }))
    )
  };

  return (
    <>
      {/* Structured Data Script */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="faq-root-x30sn">
        {/* Background Glow Effect */}
        <div className="faq-bg-glow-x30sn"></div>

        <div className="faq-container-x30sn">
          
          {/* Header */}
          <header className="faq-header-x30sn">
            <span className="faq-badge-x30sn">Help Center</span>
            <h1 className="faq-title-x30sn">Frequently Asked <span className="text-pink-x30sn">Questions</span> About HeartEcho AI</h1>
            <p className="faq-subtitle-x30sn">Everything you need to know about the platform and billing.</p>
            
            {/* Search Bar (Visual Only) */}
            <div className="faq-search-box-x30sn">
                <FaSearch className="search-icon-x30sn"/>
                <input type="text" placeholder="Search for answers..." className="faq-input-x30sn" />
            </div>
          </header>

          {/* FAQ Content */}
          <div className="faq-content-x30sn">
            {faqCategories.map((category) => (
              <section key={category.id} className="faq-category-x30sn">
                <h2 className="faq-cat-title-x30sn">{category.title}</h2>
                <div className="faq-grid-x30sn">
                  {category.items.map((item, index) => (
                    <details key={index} className="faq-item-x30sn">
                      <summary className="faq-question-x30sn">
                        <span>{item.question}</span>
                        <FaChevronDown className="faq-toggle-icon-x30sn" />
                      </summary>
                      <div className="faq-answer-x30sn">
                        <p>{item.answer}</p>
                      </div>
                    </details>
                  ))}
                </div>
              </section>
            ))}
          </div>

          {/* Support CTA */}
          <div className="faq-support-x30sn">
            <div className="support-content-x30sn">
                <h3 className="support-title-x30sn">Still have questions?</h3>
                <p className="support-text-x30sn">Can't find the answer you're looking for? Our team is here to help.</p>
            </div>
            <a href="/contact" className="support-btn-x30sn">Contact Support</a>
          </div>

        </div>
      </div>
      <Footer/>
    </>
  );
}