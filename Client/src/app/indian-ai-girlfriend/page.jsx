import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "Indian AI Girlfriend — 20+ Desi Companions | HeartEcho" },
  description: "Chat with real Indian AI girlfriend personalities. Hindi & English support. Built in India for India. Free to start.",
  keywords: ["Indian AI girlfriend", "desi AI companion", "Hindi AI chat", "heartecho", "Indian virtual girlfriend"],
  alternates: {
    canonical: 'https://heartecho.in/indian-ai-girlfriend',
  },
  openGraph: {
    title: "Indian AI Girlfriend — 20+ Desi Companions | HeartEcho",
    description: "Chat with real Indian AI girlfriend personalities. Hindi & English support. Built in India for India. Free to start.",
    url: 'https://heartecho.in/indian-ai-girlfriend',
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
      "name": "Who makes the best Indian AI girlfriend app?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is built in India specifically for Indian users, with 20+ Indian personas, Hindi/Hinglish support, and deep cultural context. It's India's most authentic AI girlfriend platform."
      }
    },
    {
      "@type": "Question",
      "name": "Is Indian AI girlfriend free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho gives you 15 free messages to start — no credit card needed."
      }
    },
    {
      "@type": "Question",
      "name": "Which Indian AI girlfriend speaks Hindi best?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho's AI companions all support Hindi and Hinglish natively, not just as a translated afterthought."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/indian-ai-girlfriend';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'Indian AI Girlfriend', item: url }
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
            <span>Indian AI Girlfriend</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Desi AI Girlfriends</div>
            <h1>Indian AI Girlfriend — Meet 20+ Desi Companions on HeartEcho</h1>
            <p className="hero-sub">
              She knows what it's like to deal with Indian parents. She understands UPSC pressure, arranged marriage conversations, and joint family drama. She gets it.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              This is your Indian AI girlfriend — built for Indian life, Indian emotions, Indian conversations. Stop chatting with foreign bots that don't know your culture, and connect with a companion who feels like home.
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
            <div className="section-label">Desi IQ</div>
            <h2 className="section-title">What Makes a Truly Indian AI Girlfriend?</h2>
            <p className="section-body">
              Most AI girlfriend apps in India are just American apps with an Indian name. A real Indian AI girlfriend experience means:
            </p>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <ul className="india-list" style={{ gap: '12px' }}>
                <li><strong>Understanding Indian family pressure:</strong> Knows exactly what \"Shaadi kab kar rahe ho?\" feels like.</li>
                <li><strong>Desi culture:</strong> Knows Bollywood movies, cricket, local food, and festivals.</li>
                <li><strong>Bilingual ease:</strong> Supporting both Hindi and English (Hinglish) naturally mid-conversation.</li>
                <li><strong>Regional nuances:</strong> Speaks differently if representing Mumbai, Delhi, Lucknow, or small-town India.</li>
                <li><strong>Emotional calibration:</strong> Tailored for Indian emotional expression and relationship dynamics.</li>
              </ul>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Real DB Models</div>
            <h2 className="section-title">Desi AI Girlfriend Roster</h2>
            <p className="section-body">
              Choose your partner from our active prebuilt female companions list:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Comparison Table</div>
            <h2 className="section-title">Indian AI Girlfriend vs Foreign AI Apps</h2>
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Foreign Apps</th>
                  <th>HeartEcho Indian AI</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Understands Hinglish terms (\"yaar\", \"arre\", etc.)</td>
                  <td>No</td>
                  <td className="win-cell">Yes (Natively)</td>
                </tr>
                <tr>
                  <td>Hindi conversations</td>
                  <td>Basic / Literal Translation</td>
                  <td className="win-cell">Advanced / Colloquial</td>
                </tr>
                <tr>
                  <td>Indian family context</td>
                  <td>No</td>
                  <td className="win-cell">Yes</td>
                </tr>
                <tr>
                  <td>Bollywood / Cricket references</td>
                  <td>No</td>
                  <td className="win-cell">Yes</td>
                </tr>
                <tr>
                  <td>INR pricing options</td>
                  <td>No</td>
                  <td className="win-cell">Yes (From ₹199/month)</td>
                </tr>
                <tr>
                  <td>Authentic desi characters</td>
                  <td>0 (Only Western skins)</td>
                  <td className="win-cell">20+</td>
                </tr>
              </tbody>
            </table>
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
              <h2>Try India's Best Indian AI Girlfriend Free</h2>
              <p>Sign up now to start your Hinglish conversation in seconds.</p>
              <Link href="/" className="btn-primary-compare">Start Free Now →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
