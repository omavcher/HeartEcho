import { faqCategories } from '../../data/faqs';
import Head from 'next/head';
import './faqs.css'
import Footer from '../../components/Footer';

export const metadata = {
  title: "FAQ",
};

export default function FAQPage() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://yourdomain.com/faq" />
        <meta name="robots" content="index, follow" />
        <script type="application/ld+json">
          {JSON.stringify({
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
          })}
        </script>
      </Head>

      <div className="i93d-faq-container">
        <header className="i93d-faq-header">
          <h1 className="i93d-faq-title">Frequently Asked Questions</h1>
          <p className="i93d-faq-subtitle">Find answers to common questions about our AI companions platform</p>
        </header>

        <div className="i93d-faq-content">
          {faqCategories.map(category => (
            <section key={category.id} className="i93d-faq-category">
              <h2 className="i93d-faq-category-title">{category.title}</h2>
              <div className="i93d-faq-items">
                {category.items.map((item, index) => (
                  <details key={index} className="i93d-faq-item">
                    <summary className="i93d-faq-question">
                      {item.question}
                      <span className="i93d-toggle-icon"></span>
                    </summary>
                    <div className="i93d-faq-answer">
                      <p>{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="i93d-faq-support">
          <h3 className="i93d-support-title">Still have questions?</h3>
          <p className="i93d-support-text">Contact our support team for personalized assistance.</p>
          <a href="/contact" className="i93d-support-button">Contact Support</a>
        </div>
      </div>
      <Footer/>
    </>
  );
}