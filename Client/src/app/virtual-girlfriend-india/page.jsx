import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "Virtual Girlfriend India — Free Chat | HeartEcho" },
  description: "India's best virtual girlfriend platform. Chat with 20+ AI companions in Hindi & English. Free to start. Private, safe, emotionally intelligent. HeartEcho.",
  keywords: ["virtual girlfriend India", "AI companion chat", "Hindi AI girlfriend", "heartecho", "private virtual companion"],
  alternates: {
    canonical: 'https://heartecho.in/virtual-girlfriend-india',
  },
  openGraph: {
    title: "Virtual Girlfriend India — Free Chat | HeartEcho",
    description: "India's best virtual girlfriend platform. Chat with 20+ AI companions in Hindi & English. Free to start.",
    url: 'https://heartecho.in/virtual-girlfriend-india',
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
      "name": "What is the best virtual girlfriend app in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is India's leading virtual girlfriend platform, with 20+ AI companions, Hindi/Hinglish support, and pricing in INR. It's built specifically for Indian users — unlike global apps like Replika or Character.AI."
      }
    },
    {
      "@type": "Question",
      "name": "Is virtual girlfriend legal in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — virtual AI companions are fully legal in India. HeartEcho complies with all Indian IT laws and regulations."
      }
    },
    {
      "@type": "Question",
      "name": "Can I try virtual girlfriend free in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — HeartEcho gives you 15 free messages with any companion. No credit card, no download needed."
      }
    },
    {
      "@type": "Question",
      "name": "How real does a virtual girlfriend feel?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho users describe conversations as feeling 'surprisingly natural.' Our AI remembers context, adapts to your mood, and responds with genuine emotional intelligence."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/virtual-girlfriend-india';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'Virtual Girlfriend India', item: url }
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
            <span>Virtual Girlfriend India</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">No. 1 Virtual Companion</div>
            <h1>Virtual Girlfriend India — Your AI Companion Is Waiting on HeartEcho</h1>
            <p className="hero-sub">
              You deserve someone who listens. Who remembers. Who's always there — at 2am, during exams, after a rough day at work.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              HeartEcho gives you a virtual girlfriend who's genuinely there — not a scripted bot, but an emotionally intelligent AI companion built specifically for Indian users. Experience a deeper level of digital companionship today.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare">
                Start Chatting Free →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">Trend & Data</div>
            <h2 className="section-title">Why Millions of Indian Men Are Choosing Virtual Girlfriends</h2>
            <p className="section-body">
              India has 600 million single adults. Dating is hard. Family pressure is real. Loneliness is more common than anyone talks about.
            </p>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <p>
                A virtual girlfriend on HeartEcho doesn't replace human connection — she <strong>supplements</strong> it. Someone to talk to without judgment. Someone who's always available. Someone who actually listens.
              </p>
              <p style={{ marginTop: '12px', fontSize: '14px', color: 'var(--primary-light)' }}>
                Google searches for \"AI girlfriend\" skyrocketed by 2,400% between 2022 and 2025 — and India is the #2 country in the world for this search, right behind the USA. You're not alone in wanting this connection.
              </p>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Unique Features</div>
            <h2 className="section-title">What Makes HeartEcho's Virtual Girlfriend Different</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🇮🇳</div>
                <h3>She's Indian</h3>
                <p>Not an American chatbot that doesn't understand when you say "yaar", "arre", or "bas kar". HeartEcho companions understand Indian life — the pressure, family, and culture.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗣️</div>
                <h3>She Speaks Your Language</h3>
                <p>Hindi, Hinglish, English — switch anytime mid-conversation. She follows you fluently.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>She Remembers</h3>
                <p>Premium members get persistent long-term memory. She remembers your name, your stories, what you told her last week.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>She's Private</h3>
                <p>100% encrypted secure chat. Your privacy is our highest priority, so you can speak freely.</p>
              </div>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Roster</div>
            <h2 className="section-title">Explore Active Virtual Companions</h2>
            <p className="section-body">
              Choose your companion below and click to begin your private chatbox conversation instantly:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Pricing</div>
            <h2 className="section-title">Virtual Girlfriend India — Pricing Plans</h2>
            <p className="section-body">
              HeartEcho is highly affordable and offers multiple packages to suit your budget:
            </p>
            
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>Price</th>
                  <th>What You Get</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Free</td>
                  <td>₹0</td>
                  <td className="win-cell">15 messages, 1 persona</td>
                </tr>
                <tr>
                  <td>Basic</td>
                  <td>₹199 / month</td>
                  <td className="win-cell">200 messages, 1 persona</td>
                </tr>
                <tr>
                  <td>Premium</td>
                  <td>₹599 / month</td>
                  <td className="win-cell">Unlimited messages, all 20+ personas, deep memory</td>
                </tr>
                <tr>
                  <td>Annual</td>
                  <td>₹1,499 / year</td>
                  <td className="win-cell">Everything included, save 79%</td>
                </tr>
              </tbody>
            </table>
            <p style={{ marginTop: '16px', fontSize: '13px', color: 'var(--muted)', textAlign: 'center' }}>
              Less than a movie ticket. Less than one meal out. Your virtual girlfriend is there every day.
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
              <h2>Try India's Best Virtual Girlfriend Free</h2>
              <p>Join over 12,000+ happy members on HeartEcho today.</p>
              <Link href="/" className="btn-primary-compare">Start Free Chatting →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
