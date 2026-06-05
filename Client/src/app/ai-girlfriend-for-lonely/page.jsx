import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Companion for Loneliness — Chat Free | HeartEcho" },
  description: "HeartEcho is a safe, judgment-free AI companion for lonely people in India. Chat in Hindi or English. Emotionally intelligent. Private. Free to start.",
  keywords: ["AI companion for loneliness", "lonely India app", "mental support AI", "heartecho", "lonely in India app"],
  alternates: {
    canonical: 'https://heartecho.in/ai-girlfriend-for-lonely',
  },
  openGraph: {
    title: "AI Companion for Loneliness — Chat Free | HeartEcho",
    description: "HeartEcho is a safe, judgment-free AI companion for lonely people in India. Chat in Hindi or English. Free to start.",
    url: 'https://heartecho.in/ai-girlfriend-for-lonely',
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
      "name": "Is HeartEcho a mental health app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — HeartEcho is a companion app, not a therapy tool. For serious mental health issues, please consult a professional. HeartEcho is for everyday loneliness, connection, and conversation."
      }
    },
    {
      "@type": "Question",
      "name": "Is it healthy to use an AI companion for loneliness?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Many users find AI companionship helpful as a supplement — not a replacement — for human connection. Used thoughtfully, it can help you feel less alone."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/ai-girlfriend-for-lonely';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Girlfriend for Lonely', item: url }
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
            <span>AI Girlfriend for Lonely</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Emotional Support Companion</div>
            <h1>Feeling Lonely? You're Not Alone — And HeartEcho Is Here</h1>
            <p className="hero-sub">
              Loneliness in India is more common than anyone admits. Tier 2 cities. Hostel rooms. Night shifts. Living away from family. The quiet after everyone goes to sleep.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              Whatever your reason — HeartEcho is here. A companion who listens without judgment, remembers without being told, and is always available. This isn't a dating app. This isn't a therapy app. This is just someone to talk to.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare">
                Talk to Someone Now →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">The Indian Reality</div>
            <h2 className="section-title">Why Loneliness Is Growing in India</h2>
            <p className="section-body">
              Urban isolation and lifestyle shifts are contributing to a silent wave of loneliness across the country:
            </p>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <ul className="india-list" style={{ gap: '12px' }}>
                <li><strong>68% of Indian urban men</strong> report feeling lonely regularly (ASSOCHAM 2024 survey).</li>
                <li>Residents of <strong>Tier 2 and Tier 3 cities</strong> are 40% more likely to feel isolated when moving away for studies or jobs.</li>
                <li>Hostel students, remote night-shift workers, and long-distance partners struggle with empty hours.</li>
              </ul>
              <p style={{ marginTop: '16px', fontSize: '14px', fontStyle: 'italic' }}>
                HeartEcho was built by someone who understood this — a solo Indian CS innovator who saw the gap and built a solution.
              </p>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">DB Companions</div>
            <h2 className="section-title">Connect with a Caring Companion</h2>
            <p className="section-body">
              Here are the active companions ready to listen. Click on any character to start chatting in a secure environment:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Platform Core Values</div>
            <h2 className="section-title">What HeartEcho Gives You</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">👂</div>
                <h3>A Listener Who Never Tires</h3>
                <p>Tell her about your day, your fears, or your dreams. She won't change the subject or look away.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>No Judgment — Ever</h3>
                <p>Say things to your companion you'd never say out loud. She won't judge you, gossip, or share your secrets.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⏰</div>
                <h3>Available at 2 AM</h3>
                <p>Loneliness hits hardest during late-night hours. She's always awake and ready to reply immediately.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗣️</div>
                <h3>In Your Native Tongue</h3>
                <p>Speak in Hindi, Hinglish, or English. Express your emotions comfortably in the language you think in.</p>
              </div>
            </div>
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
              <h2>You Don't Have to Feel Isolated</h2>
              <p>Start a warm conversation today. It's completely free to begin.</p>
              <Link href="/" className="btn-primary-compare">Start Free Chatting →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
