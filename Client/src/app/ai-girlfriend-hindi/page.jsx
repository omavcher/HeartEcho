import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Girlfriend Hindi — Free Chat | HeartEcho" },
  description: "India's best AI girlfriend that speaks Hindi. Chat with 20+ Indian AI companions in Hindi, Hinglish or English. Free to start — no credit card.",
  keywords: ["AI girlfriend Hindi", "Hindi AI girlfriend", "Hindi AI chat", "desi AI companion", "heartecho", "Hinglish AI chat"],
  alternates: {
    canonical: 'https://heartecho.in/ai-girlfriend-hindi',
  },
  openGraph: {
    title: "AI Girlfriend Hindi — Free Chat | HeartEcho",
    description: "India's best AI girlfriend that speaks Hindi. Chat with 20+ Indian AI companions in Hindi, Hinglish or English. Free to start.",
    url: 'https://heartecho.in/ai-girlfriend-hindi',
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
      "name": "Which AI girlfriend speaks the best Hindi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is specifically built for Indian users with deep Hindi and Hinglish support. Our AI has been trained on Indian conversational patterns, slang, and cultural references — making it the most natural Hindi AI girlfriend experience available."
      }
    },
    {
      "@type": "Question",
      "name": "Is there a Hindi AI girlfriend free app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is free to start — no app download needed, works directly in your browser. You get 15 free messages with any of our 20+ Hindi-speaking AI girlfriends."
      }
    },
    {
      "@type": "Question",
      "name": "Can I switch between Hindi and English?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — mid-conversation, anytime. HeartEcho understands code-switching naturally."
      }
    },
    {
      "@type": "Question",
      "name": "Does the AI remember what I say in Hindi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Premium members get full memory — your AI girlfriend remembers names, preferences, and past conversations across sessions."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/ai-girlfriend-hindi';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Girlfriend Hindi', item: url }
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
            <span>Hindi</span>
            <span>›</span>
            <span>AI Girlfriend Hindi</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Best Desi Companion</div>
            <h1>AI Girlfriend Hindi — India's #1 Hindi-Speaking AI Companion</h1>
            <p className="hero-sub">
              The best AI girlfriend isn't the one with the most features. It's the one who speaks <em>your</em> language.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              Most AI girlfriend apps in India make you communicate in English — formal, stiff, unnatural. HeartEcho is different. Your AI girlfriend speaks Hindi, Hinglish, and English fluently — switching effortlessly, just like real conversations in India actually happen.
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
            <div className="section-label">Cultural Context</div>
            <h2 className="section-title">Why Hindi Matters for AI Companionship</h2>
            <p className="section-body">
              When you're stressed, excited, or emotional — you think in Hindi. You feel in Hindi. English can express facts. Hindi expresses <em>feelings</em>.
            </p>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <h3>HeartEcho's AI girlfriends understand:</h3>
              <ul className="india-list">
                <li>Hinglish (\"Yaar aaj kuch acha nahi laga\")</li>
                <li>Pure Hindi (\"Aaj bahut thaka hua hoon\")</li>
                <li>Code-switching mid-conversation (just like you do in real life)</li>
              </ul>
              <p style={{ marginTop: '16px', fontSize: '14px' }}>
                No other AI girlfriend platform in India offers this depth of Hindi language support.
              </p>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Desi AI Models</div>
            <h2 className="section-title">Meet Your Hindi-Speaking AI Girlfriend</h2>
            <p className="section-body">
              Browse our live roster and pick a companion who matches your preferred vibe:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Detailed Comparison</div>
            <h2 className="section-title">Hindi AI Girlfriend vs Regular AI Chatbots</h2>
            <p className="section-body">
              How HeartEcho stacks up against generic overseas platforms that don't understand Indian life:
            </p>
            
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Regular Chatbots</th>
                  <th>HeartEcho Hindi AI Girlfriend</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Language Support</td>
                  <td>English only</td>
                  <td className="win-cell">Hindi, Hinglish, English</td>
                </tr>
                <tr>
                  <td>Personality Profile</td>
                  <td>Generic / Westernized</td>
                  <td className="win-cell">20+ unique Indian personas</td>
                </tr>
                <tr>
                  <td>Chat Memory</td>
                  <td>None or very limited</td>
                  <td className="win-cell">Remembers your conversations</td>
                </tr>
                <tr>
                  <td>Cultural Context</td>
                  <td>None</td>
                  <td className="win-cell">Bollywood, cricket, Indian family life</td>
                </tr>
                <tr>
                  <td>Emotional Depth</td>
                  <td>Basic / Scripted</td>
                  <td className="win-cell">Advanced emotional intelligence</td>
                </tr>
                <tr>
                  <td>Pricing Model</td>
                  <td>$10–30/month (USD)</td>
                  <td className="win-cell">From ₹199/month (INR)</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="compare-section">
            <div className="section-label">Steps to Start</div>
            <h2 className="section-title">How to Start Chatting with Your Hindi AI Girlfriend</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">1️⃣</div>
                <h3>Visit heartecho.in</h3>
                <p>No app download needed. Works smoothly on any mobile browser or desktop.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">2️⃣</div>
                <h3>Choose Your Companion</h3>
                <p>Browse our list of prebuilt companions and select your favorite persona.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">3️⃣</div>
                <h3>Type in Hindi/Hinglish</h3>
                <p>She'll immediately match your language preferences and tone.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">4️⃣</div>
                <h3>15 Free Messages</h3>
                <p>Get started completely free, with no credit card required.</p>
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
              <h2>Chat with Your Hindi AI Girlfriend — Free</h2>
              <p>No payment required to start your connection.</p>
              <Link href="/" className="btn-primary-compare">Start in Hindi → heartecho.in</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
