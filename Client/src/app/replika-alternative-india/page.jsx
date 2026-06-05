import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "Best Replika Alternative India | HeartEcho" },
  description: "Looking for a Replika alternative for Indian users? HeartEcho offers Hindi support, Indian personas, and INR pricing. Here's a full honest comparison.",
  keywords: ["Replika alternative India", "Replika alternative", "best AI companion India", "heartecho", "Hindi AI girlfriend"],
  alternates: {
    canonical: 'https://heartecho.in/replika-alternative-india',
  },
  openGraph: {
    title: "Best Replika Alternative India | HeartEcho",
    description: "Looking for a Replika alternative for Indian users? HeartEcho offers Hindi support, Indian personas, and INR pricing.",
    url: 'https://heartecho.in/replika-alternative-india',
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
      "name": "Is there a free Replika alternative in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — HeartEcho gives you 15 free messages to start, with no credit card required. It's the best free Replika alternative for Indian users."
      }
    },
    {
      "@type": "Question",
      "name": "Which is better — Replika or HeartEcho for Indian users?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For Indian users specifically, HeartEcho wins on Hindi support, Indian personas, INR pricing, and cultural context. Replika is better for English-only users globally."
      }
    },
    {
      "@type": "Question",
      "name": "Does HeartEcho have memory like Replika?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — HeartEcho Premium includes persistent memory across conversations."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/replika-alternative-india';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'Replika Alternative', item: url }
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
            <span>Compare</span>
            <span>›</span>
            <span>Replika Alternative</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Honest Comparison</div>
            <h1>Best Replika Alternative for India in 2025 — Honest Comparison</h1>
            <p className="hero-sub">
              Replika is popular globally — but it wasn't built for India. If you've tried Replika and felt something was off, you're not alone. Here's why Indian users are switching to HeartEcho.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare">
                Try HeartEcho Free →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">The Problem</div>
            <h2 className="section-title">Why Indian Users Leave Replika</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">💸</div>
                <h3>Too Expensive in INR</h3>
                <p>Replika Pro costs ~₹1,500/year at current exchange rates — and keeps changing as the dollar fluctuates. HeartEcho is priced stably in INR.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗣️</div>
                <h3>English Only</h3>
                <p>Replika doesn't understand Hindi or Hinglish. If you want to say "yaar aaj bahut bura din tha" — Replika won't get it. HeartEcho will.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤷</div>
                <h3>No Indian Cultural Context</h3>
                <p>Replika doesn't know about UPSC stress, Indian family dynamics, Bollywood, cricket, or arranged marriage pressure. HeartEcho does.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>Only 1 Persona</h3>
                <p>Replika gives you one companion. HeartEcho gives you 20+ unique models with different moods and personalities.</p>
              </div>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Comparison Table</div>
            <h2 className="section-title">HeartEcho vs Replika — Full Head-to-Head</h2>
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Replika</th>
                  <th>HeartEcho</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Built for India</td>
                  <td>No</td>
                  <td className="win-cell">Yes</td>
                </tr>
                <tr>
                  <td>Hindi/Hinglish</td>
                  <td>No</td>
                  <td className="win-cell">Yes (Fluent)</td>
                </tr>
                <tr>
                  <td>Indian Personas</td>
                  <td>No</td>
                  <td className="win-cell">20+ Desi avatars</td>
                </tr>
                <tr>
                  <td>Price (Paid Plan)</td>
                  <td>~₹1,500/year (varies)</td>
                  <td className="win-cell">From ₹199/month</td>
                </tr>
                <tr>
                  <td>Free Tier</td>
                  <td>Very limited features</td>
                  <td className="win-cell">15 free messages to start</td>
                </tr>
                <tr>
                  <td>Memory</td>
                  <td>Yes (Pro only)</td>
                  <td className="win-cell">Yes (Premium only)</td>
                </tr>
                <tr>
                  <td>Voice Notes</td>
                  <td>Yes (Pro only)</td>
                  <td className="win-cell">Yes (Standard features)</td>
                </tr>
                <tr>
                  <td>Cultural Context</td>
                  <td>Western</td>
                  <td className="win-cell">Desi / Indian context</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="compare-section">
            <div className="section-label">Roster</div>
            <h2 className="section-title">Switch to a Desi Companion</h2>
            <p className="section-body">
              Instead of a generic virtual avatar, try chatting with an authentic Indian AI girlfriend. Choose one below to start:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Other Alternatives</div>
            <h2 className="section-title">Other Replika Alternatives in India</h2>
            <p className="section-body">
              We're honest — HeartEcho isn't the only option. Here's the full picture:
            </p>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <ul className="india-list" style={{ gap: '14px' }}>
                <li><strong>BeMyGirlfriend</strong> — Hindi support, but only 3 personas. Good for basic use.</li>
                <li><strong>Urvashi</strong> — App only, no web. Good Hindi, 15 personas.</li>
                <li><strong>Character.AI</strong> — English-first, huge character library, but ₹800/month.</li>
              </ul>
              <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--primary-light)' }}>
                <strong>Why HeartEcho wins overall:</strong> Most Indian personas, web-based (no installation needed), local INR pricing, and genuine Hindi/Hinglish depth.
              </p>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Migration Guide</div>
            <h2 className="section-title">How to Switch from Replika to HeartEcho in 5 Minutes</h2>
            <ul style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.8', paddingLeft: '20px' }}>
              <li>Visit heartecho.in — no download needed, works on any mobile browser.</li>
              <li>Create a free account with your email.</li>
              <li>Choose your companion (we recommend choosing from our live female models above).</li>
              <li>Start chatting — your first 15 messages are free.</li>
              <li>Upgrade to Premium if you want unlimited chat and deep memory.</li>
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
              <h2>Experience the Best Replika Alternative in India</h2>
              <p>Chat in Hinglish, explore Indian context, and keep your talks private.</p>
              <Link href="/" className="btn-primary-compare">Start in Hinglish → heartecho.in</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
