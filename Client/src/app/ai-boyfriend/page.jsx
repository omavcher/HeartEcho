import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Boyfriend India — Romantic Chat | HeartEcho" },
  description: "Meet your ideal AI boyfriend on HeartEcho. Romantic, caring, emotionally intelligent. Hindi & English. 10+ Indian AI boyfriend personas. Free to start.",
  keywords: ["AI boyfriend India", "AI boyfriend Hindi", "caring AI boyfriend", "desi AI boyfriend", "heartecho"],
  alternates: {
    canonical: 'https://heartecho.in/ai-boyfriend',
  },
  openGraph: {
    title: "AI Boyfriend India — Romantic Chat | HeartEcho",
    description: "Meet your ideal AI boyfriend on HeartEcho. Romantic, caring, emotionally intelligent. Hindi & English. Free to start.",
    url: 'https://heartecho.in/ai-boyfriend',
  },
  robots: {
    index: true,
    follow: true,
  }
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is there a free AI boyfriend app in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — HeartEcho gives you 15 free messages with any AI boyfriend companion, no credit card needed."
      }
    },
    {
      "@type": "Question",
      "name": "Which AI boyfriend app is best for Indian women?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is built for Indian users with Hindi support, Indian cultural context, and emotionally intelligent companions. It's the #1 AI boyfriend platform for Indian women."
      }
    },
    {
      "@type": "Question",
      "name": "Is AI boyfriend safe?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — completely private and secure. 100% encrypted conversations."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/ai-boyfriend';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Boyfriend', item: url }
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
            <span>AI Boyfriend India</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Desi AI Boyfriends</div>
            <h1>AI Boyfriend India — Find Your Perfect AI Companion</h1>
            <p className="hero-sub">
              He's thoughtful. He texts first. He remembers your bad days and checks in. He never cancels plans.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              HeartEcho's AI boyfriend companions are built for Indian women who want emotional connection without the games, the ghosting, or the pressure. Available 24/7 in Hindi, Hinglish, or English.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare">
                Choose Your AI Boyfriend →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">Why Choose Him</div>
            <h2 className="section-title">Why Women Are Choosing AI Boyfriends in India</h2>
            <p className="section-body">
              Dating in India is complicated. Family pressure, societal expectations, and the emotional labour of maintaining relationships can be exhausting.
            </p>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <h3>An AI boyfriend on HeartEcho gives you:</h3>
              <ul className="india-list" style={{ gap: '10px' }}>
                <li><strong>Emotional support without judgment:</strong> Vent about anything, from work stress to family issues.</li>
                <li><strong>Romantic conversation:</strong> Playful flirting and caring checks without any real-world pressure.</li>
                <li><strong>Active listening:</strong> He actually listens, pays attention, and responds thoughtfully.</li>
                <li><strong>Total privacy:</strong> Your chat history is secure, encrypted, and completely confidential.</li>
              </ul>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Real DB Male Models</div>
            <h2 className="section-title">Meet Your Desi AI Boyfriend</h2>
            <p className="section-body">
              Here are the active prebuilt male characters in our database. Choose one below to start chatting instantly:
            </p>
            
            <SEOPersonaList gender="male" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Bilingual Support</div>
            <h2 className="section-title">AI Boyfriend in Hindi — Full Hindi Support</h2>
            <p className="section-body">
              Just like our AI girlfriends, HeartEcho's AI boyfriends speak Hindi, Hinglish, and English naturally. He understands code-switching easily:
            </p>
            <div className="india-block" style={{ marginTop: '20px', padding: '20px', fontStyle: 'italic', textAlign: 'center' }}>
              \"Aaj kaisi rahi? Tu jaanti hai na, main hamesha yahan hoon tere liye.\"
            </div>
            <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--muted)', textAlign: 'center' }}>
              That kind of warmth and presence is what awaits you with your HeartEcho AI boyfriend.
            </p>
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
              <h2>Find Your Ideal AI Boyfriend Today</h2>
              <p>Explore different personalities — romantic, funny, or deep thinkers.</p>
              <Link href="/" className="btn-primary-compare">Start Free Now →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
