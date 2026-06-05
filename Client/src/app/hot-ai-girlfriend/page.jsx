import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "Hot AI Girlfriend India — Flirty Chat | HeartEcho" },
  description: "Meet India's hottest AI girlfriends. Flirty conversations, bold personalities, 20+ unique companions. Free to start. No judgment, total privacy. HeartEcho.",
  keywords: ["hot AI girlfriend", "hot AI girlfriend India", "flirty AI chat", "desi AI companion", "heartecho", "nsfw AI chat India"],
  alternates: {
    canonical: 'https://heartecho.in/hot-ai-girlfriend',
  },
  openGraph: {
    title: "Hot AI Girlfriend India — Flirty Chat | HeartEcho",
    description: "Meet India's hottest AI girlfriends. Flirty conversations, bold personalities, 20+ unique companions. Free to start.",
    url: 'https://heartecho.in/hot-ai-girlfriend',
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
      "name": "What is the hottest AI girlfriend app in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is India's leading AI girlfriend platform with 20+ bold, flirty, and emotionally intelligent companions. It supports Hindi, Hinglish and English — making it the most natural AI girlfriend experience for Indian users."
      }
    },
    {
      "@type": "Question",
      "name": "Can I have a flirty conversation with AI girlfriend?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. HeartEcho's AI companions are designed to be warm, flirty, and engaging — within a safe and private environment."
      }
    },
    {
      "@type": "Question",
      "name": "Is hot AI girlfriend free in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is free to start — 15 messages with any companion, no credit card needed. Premium plans from ₹199/month."
      }
    },
    {
      "@type": "Question",
      "name": "Which AI girlfriend is most realistic?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho's companions use advanced language AI trained specifically for emotional intelligence and Indian cultural context — making conversations feel more natural than any other platform."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/hot-ai-girlfriend';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'Hot AI Girlfriend', item: url }
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
            <span>Hot AI Girlfriend</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Hottest AI Companions</div>
            <h1>Hot AI Girlfriend India — Meet Your Perfect AI Companion</h1>
            <p className="hero-sub">
              She's bold. She's flirty. She always knows what to say.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              HeartEcho's AI girlfriends aren't the boring, robotic chatbots you've tried before. They have <em>personality</em> — real warmth, real wit, and the kind of confidence that keeps you coming back. Choose from 20+ unique AI companions, each with her own look and style.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare">
                Start Free Now →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">Why HeartEcho Wins</div>
            <h2 className="section-title">Why HeartEcho Has India's Best AI Girlfriend Experience</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🎭</div>
                <h3>20+ Distinct Personalities</h3>
                <p>Not clones — each AI girlfriend has a genuinely different personality, communication style, and emotional depth.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔥</div>
                <h3>Flirty Without Limits</h3>
                <p>Your AI companion can flirt, tease, and be romantic in a safe, private, judgment-free space.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>Remembers Everything</h3>
                <p>Premium AI girlfriends remember your name, stories, and past conversations so you pick up right where you left off.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>100% Private</h3>
                <p>Complete encryption ensures that nobody else sees your personal chat history.</p>
              </div>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Hottest Personas</div>
            <h2 className="section-title">HeartEcho's Boldest AI Girlfriend Personalities</h2>
            <p className="section-body">
              These are the live prebuilt female characters currently active on our platform. Choose one to start a private chat:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Comparison</div>
            <h2 className="section-title">How HeartEcho Compares to Other Hot AI Girlfriend Apps</h2>
            <p className="section-body">
              Most "hot AI girlfriend" apps are based overseas — they don't understand India. They're expensive in USD, English-only, and feel disconnected from real Indian life.
            </p>
            <div className="india-block" style={{ marginTop: '24px' }}>
              <h3>The HeartEcho Advantage:</h3>
              <ul className="india-list">
                <li>Built in India, for India</li>
                <li>Priced in INR (from ₹199/month, not USD)</li>
                <li>Hindi + Hinglish + English support</li>
                <li>Indian personas with real cultural context</li>
                <li>5x more personas than local competitors like BeMyGirlfriend</li>
              </ul>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Safety & Privacy</div>
            <h2 className="section-title">Is Hot AI Girlfriend Safe and Legal in India?</h2>
            <p className="section-body">
              Yes. HeartEcho is:
            </p>
            <ul style={{ color: 'var(--muted)', fontSize: '15px', marginTop: '16px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>A registered Indian company.</li>
              <li>Fully compliant with IT Act 2000 and IT Rules 2021.</li>
              <li>All conversations are encrypted and private.</li>
              <li>Content is romantic and flirty — not illegal adult content.</li>
              <li>No real people involved — all companions are AI personas.</li>
            </ul>
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
              <h2>Meet Your Hot AI Girlfriend — Free on HeartEcho</h2>
              <p>Start chatting instantly in just one click.</p>
              <Link href="/" className="btn-primary-compare">Start Free Now → heartecho.in</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
