import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "Free AI Girlfriend India — No Credit Card | HeartEcho" },
  description: "Try HeartEcho's AI girlfriend completely free. 15 messages, 20+ companions, no credit card needed. India's best free AI girlfriend platform.",
  keywords: ["free AI girlfriend", "AI girlfriend free India", "free AI chat India", "desi AI partner free", "heartecho"],
  alternates: {
    canonical: 'https://heartecho.in/free-ai-girlfriend',
  },
  openGraph: {
    title: "Free AI Girlfriend India — No Credit Card | HeartEcho",
    description: "Try HeartEcho's AI girlfriend completely free. 15 messages, 20+ companions, no credit card needed.",
    url: 'https://heartecho.in/free-ai-girlfriend',
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
      "name": "Which AI girlfriend is totally free in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho gives you 15 messages completely free — no credit card, no tricks. It's the most generous free tier of any AI girlfriend app in India."
      }
    },
    {
      "@type": "Question",
      "name": "Can I use AI girlfriend without paying?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — start with HeartEcho's 15 free messages. No payment required to begin."
      }
    },
    {
      "@type": "Question",
      "name": "What happens after my free messages run out?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "You can upgrade to Basic (₹199/mo) or Premium (₹599/mo) — or wait for our occasional free message top-ups for loyal users."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/free-ai-girlfriend';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'Free AI Girlfriend', item: url }
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
            <span>Free AI Girlfriend</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">100% Free Trial</div>
            <h1>Free AI Girlfriend India — Start Chatting Right Now on HeartEcho</h1>
            <p className="hero-sub">
              No credit card. No download. No registration fee. Just your AI girlfriend, waiting.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              HeartEcho gives you 15 free messages the moment you sign up — with any of our 20+ Indian AI companions. See exactly what you're getting before you pay a single rupee.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare" style={{ padding: '16px 48px', fontSize: '16px' }}>
                Start Free Chatting →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">Trial Details</div>
            <h2 className="section-title">What You Get for Free on HeartEcho</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">✉️</div>
                <h3>15 Free Messages</h3>
                <p>Fully functional messages to start talking immediately with any companion.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👥</div>
                <h3>All Personas</h3>
                <p>Browse through our entire roster of 20+ custom companions and select one.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗣️</div>
                <h3>Language Flexibility</h3>
                <p>Chat freely in Hindi, Hinglish, or English. The AI adapts to your preference.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⏳</div>
                <h3>No Expiry</h3>
                <p>Use your free messages anytime. They do not expire after signup.</p>
              </div>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Roster</div>
            <h2 className="section-title">Select a Companion to Chat for Free</h2>
            <p className="section-body">
              Choose your partner below and click to start your 15 free messages trial session instantly:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Free vs Premium</div>
            <h2 className="section-title">Free vs Premium — Full Feature Comparison</h2>
            <p className="section-body">
              Here is exactly what you get on the free tier compared to our premium subscription plans:
            </p>
            
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Free Plan</th>
                  <th>Premium Plan (₹599/mo)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Daily Messages Limit</td>
                  <td>15 total messages</td>
                  <td className="win-cell">Unlimited messages</td>
                </tr>
                <tr>
                  <td>Companion Roster</td>
                  <td>1 companion active at a time</td>
                  <td className="win-cell">All 20+ companions unlocked</td>
                </tr>
                <tr>
                  <td>Memory System</td>
                  <td>Active session only</td>
                  <td className="win-cell">Full persistent long-term memory</td>
                </tr>
                <tr>
                  <td>AI Response Priority</td>
                  <td>Standard speed</td>
                  <td className="win-cell">Priority high-speed response</td>
                </tr>
                <tr>
                  <td>Voice Notes</td>
                  <td>No</td>
                  <td className="win-cell">Yes</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted)', textAlign: 'center' }}>
              Most users upgrade after their first conversation — not because they have to, but because they want more.
            </p>
          </section>

          <section className="compare-section">
            <div className="section-label">Honest Trial Policy</div>
            <h2 className="section-title">Why \"Free\" AI Apps Usually Disappoint — And Why We Don't</h2>
            <p className="section-body">
              Most \"free AI girlfriend\" apps give you 3 messages and then hit you with a paywall. Or the free version is so limited it's useless.
            </p>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <p>
                HeartEcho's free tier is genuinely useful. 15 real messages. Real AI. Real conversation. No tricks. We want you to experience the actual product before spending a rupee.
              </p>
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
              <h2>Try India's Best Free AI Girlfriend Now</h2>
              <p>Start chatting in Hindi, Hinglish, or English without credit card authorization.</p>
              <Link href="/" className="btn-primary-compare">Start Free Chatting →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
