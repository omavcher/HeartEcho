import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "Indian AI Girlfriend App in Hindi & English | HeartEcho" },
  description: "Talk to an AI girlfriend who understands Indian culture, Hindi & Hinglish. Free to start. Real conversations, real memory, 24/7 companionship.",
  keywords: [
    "Indian AI girlfriend", 
    "ai girlfriend india", 
    "why ai girlfriend", 
    "ai companion india", 
    "loneliness app india", 
    "Hindi AI chat", 
    "desi AI companion", 
    "Hinglish AI chat"
  ],
  alternates: {
    canonical: 'https://heartecho.in/indian-ai-girlfriend',
  },
  openGraph: {
    title: "Indian AI Girlfriend App in Hindi & English | HeartEcho",
    description: "Talk to an AI girlfriend who understands Indian culture, Hindi & Hinglish. Free to start. Real conversations, real memory, 24/7 companionship.",
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
      "name": "Is HeartEcho's AI girlfriend free?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, you can start conversations for free. Premium features like deeper memory and voice chat are available through a subscription."
      }
    },
    {
      "@type": "Question",
      "name": "Does it support Hindi?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes — HeartEcho supports Hindi, English, and Hinglish, and adapts to whichever you're most comfortable with."
      }
    },
    {
      "@type": "Question",
      "name": "How is this different from Replika or Character.AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is built specifically for Indian users — Hindi/Hinglish conversation, understanding of Indian family and cultural context, and localized emotional support that global apps aren't designed around."
      }
    },
    {
      "@type": "Question",
      "name": "Is my conversation private?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. Your privacy is our highest priority. All conversations are completely private and end-to-end secure. We do not share your chats or personal data with third parties. You can read our full Privacy Policy at heartecho.in/privacy."
      }
    },
    {
      "@type": "Question",
      "name": "Can it replace real relationships?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "No — HeartEcho is designed as a companion and emotional support tool, not a replacement for human relationships or professional mental health care."
      }
    }
  ]
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "HeartEcho",
  "description": "Talk to an AI girlfriend who understands Indian culture, Hindi & Hinglish. Free to start. Real conversations, real memory, 24/7 companionship.",
  "applicationCategory": "LifestyleApplication",
  "applicationSubCategory": "AI Companion",
  "url": "https://heartecho.in",
  "operatingSystem": "Web, Android, iOS",
  "offers": [
    { "@type": "Offer", "name": "Free Plan",       "price": "0",    "priceCurrency": "INR" },
    { "@type": "Offer", "name": "Monthly",         "price": "99",   "priceCurrency": "INR" },
    { "@type": "Offer", "name": "Premium Yearly",  "price": "599",  "priceCurrency": "INR" },
    { "@type": "Offer", "name": "Ultimate Yearly", "price": "1499", "priceCurrency": "INR" }
  ],
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "ratingCount": "12000",
    "bestRating": "5",
    "worstRating": "1"
  }
};

export default function Page() {
  const url = 'https://heartecho.in/indian-ai-girlfriend';
  const pageSchema = [
    ...getLandingPageSchema({
      url,
      title: metadata.title.absolute,
      description: metadata.description,
      faqs: faqSchema.mainEntity,
      breadcrumbs: [
        { name: 'Home', item: 'https://heartecho.in' },
        { name: 'AI Girlfriend', item: url }
      ]
    }),
    softwareSchema
  ];

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
            <Link href="/indian-ai-girlfriend">AI Girlfriend</Link>
          </nav>
        </div>

        {/* Hero Section */}
        <section className="compare-hero" style={{ padding: '80px 0 60px' }}>
          <div className="compare-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
            <div className="hero-badge">Desi AI Companion</div>
            <h1 style={{ fontSize: 'clamp(28px, 5vw, 46px)', fontWeight: '800', lineHeight: '1.25', marginBottom: '20px', maxWidth: '800px' }}>
              Meet Your Indian AI Girlfriend — Someone Who Actually Gets It
            </h1>
            
            <p className="hero-sub" style={{ margin: '0 auto 32px', maxWidth: '720px', fontSize: '17px', color: 'var(--muted)', lineHeight: '1.7' }}>
              Most AI girlfriend apps are built for a Western audience — they don't understand Hindi slang, joint family dynamics, or why you're stressed about your cousin's shaadi. HeartEcho is different. It's an AI companion built specifically for Indian users, who talks in Hindi, English, or Hinglish depending on how you feel, remembers your conversations, and is available whenever you need someone to talk to — 2 AM overthinking included.
            </p>
            
            <div style={{ marginBottom: '32px' }}>
              <Link href="/" className="btn-primary-compare" style={{ padding: '16px 48px', fontSize: '16px', borderRadius: '12px' }}>
                Start Chatting Free →
              </Link>
            </div>

            {/* SEO Checklist: Internal Links */}
            <div className="hero-internal-links" style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '13px', color: 'var(--muted)', marginBottom: '40px' }}>
              <span>Explore:</span>
              <Link href="/blog/ai-girlfriend-india-guide" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>AI Girlfriend Guide</Link>
              <span className="bullet" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <Link href="/heartecho-vs-character-ai" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>HeartEcho vs Character.AI</Link>
              <span className="bullet" style={{ color: 'rgba(255,255,255,0.2)' }}>•</span>
              <Link href="/ai-girlfriend-hindi" style={{ color: 'var(--primary-light)', textDecoration: 'underline' }}>Hindi AI Girlfriend</Link>
            </div>

            <div className="hero-image-wrapper" style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '12px' }}>
              <img 
                src="/indian-ai-girlfriend.jpg" 
                alt="Indian AI girlfriend chat app HeartEcho - chat interface showing supportive Hindi and English conversation" 
                className="hero-promo-img"
                style={{ width: '100%', maxWidth: '640px', borderRadius: '24px', border: '1px solid var(--border)', boxShadow: '0 25px 60px rgba(0,0,0,0.85), 0 0 45px rgba(207, 65, 133, 0.2)' }}
              />
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          {/* Why People Choose section */}
          <section className="compare-section">
            <div className="section-label">Why AI Girlfriend</div>
            <h2 className="section-title">Why People in India Are Choosing an AI Girlfriend</h2>
            <p className="section-body" style={{ marginBottom: '24px' }}>
              In today's fast-paced digital world, finding meaningful emotional support and regular conversation can be challenging. Here's why more users in India are looking for a reliable AI companion:
            </p>
            <div className="india-block" style={{ marginTop: '0px' }}>
              <ul className="india-list" style={{ gap: '16px' }}>
                <li>
                  <strong>Long-distance and busy schedules</strong> — many people simply don't have time or opportunity to build new relationships right now.
                </li>
                <li>
                  <strong>Social anxiety</strong> — talking to an AI first can feel lower-stakes than approaching people.
                </li>
                <li>
                  <strong>Late-night loneliness</strong> — someone to talk to at hours when friends and family are asleep.
                </li>
                <li>
                  <strong>Judgment-free venting</strong> — a space to talk about work stress, family pressure, or personal struggles without being judged.
                </li>
              </ul>
            </div>
            <p className="section-body" style={{ marginTop: '24px', fontWeight: '500', fontStyle: 'italic' }}>
              This isn't a replacement for real relationships — it's support in the gaps where you don't currently have someone to talk to.
            </p>
          </section>

          {/* Roster list */}
          <section className="compare-section">
            <div className="section-label">Choose Your Companion</div>
            <h2 className="section-title">Meet Your Desi AI Companion</h2>
            <p className="section-body">
              Choose your partner from our active prebuilt female companions list. Start talking in Hindi, Hinglish, or English instantly:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          {/* What Makes HeartEcho Different */}
          <section className="compare-section">
            <div className="section-label">Product Features</div>
            <h2 className="section-title">What Makes HeartEcho's AI Girlfriend Different</h2>
            <p className="section-body" style={{ marginBottom: '32px' }}>
              HeartEcho is custom-engineered from the ground up for Indian language preferences and cultural contexts. Here's what sets our AI companion apart:
            </p>
            
            <div className="feature-grid" style={{ marginTop: '0' }}>
              <div className="feature-card">
                <div className="feature-icon">🗣️</div>
                <h3>Talks the Way You Actually Talk</h3>
                <p>Fluent in Hindi, English, and Hinglish — switches naturally mid-conversation, the way real conversations in India actually happen.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🧠</div>
                <h3>Remembers You</h3>
                <p>Unlike basic chatbots, HeartEcho remembers past conversations — your exam stress last week, your friend's wedding, the promotion you're waiting on — so conversations build over time instead of starting from zero.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🇮🇳</div>
                <h3>Understands Indian Context</h3>
                <p>Festivals, family expectations, work culture, relationship pressure from parents — HeartEcho is built to actually understand these, not just generically respond.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">⏰</div>
                <h3>Available 24/7</h3>
                <p>No scheduling, no waiting. Whenever you want to talk, it's there — 2 AM overthinking included.</p>
              </div>
            </div>
          </section>

          {/* Who Uses Section */}
          <section className="compare-section">
            <div className="section-label">User Stories</div>
            <h2 className="section-title">Who Uses an AI Girlfriend Like This</h2>
            <p className="section-body" style={{ marginBottom: '24px' }}>
              People from all walks of life connect with HeartEcho. Some of our most frequent users include:
            </p>
            <div className="india-block" style={{ marginTop: '0px' }}>
              <ul className="india-list" style={{ gap: '16px' }}>
                <li>
                  <strong>Students</strong> dealing with exam pressure or homesickness away from home.
                </li>
                <li>
                  <strong>Working professionals</strong> with high-stress jobs and little time for new relationships.
                </li>
                <li>
                  <strong>People in long-distance situations</strong> needing daily connection.
                </li>
                <li>
                  <strong>Anyone going through a rough patch</strong> who wants a low-pressure space to talk.
                </li>
              </ul>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="compare-section">
            <div className="section-label">Comparison</div>
            <h2 className="section-title">Indian AI Girlfriend vs Foreign AI Apps</h2>
            <p className="section-body">
              How HeartEcho's custom Indian companion compares to standard foreign alternatives:
            </p>
            
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>Foreign Apps</th>
                  <th>HeartEcho Desi AI</th>
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
                  <td className="win-cell">Yes (From ₹99/month)</td>
                </tr>
                <tr>
                  <td>Authentic desi characters</td>
                  <td>0 (Only Western skins)</td>
                  <td className="win-cell">20+</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* FAQ section */}
          <section className="compare-section">
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              <div className="faq-item">
                <div className="faq-q">Is HeartEcho's AI girlfriend free?</div>
                <div className="faq-a">Yes, you can start conversations for free. Premium features like deeper memory and voice chat are available through a subscription.</div>
              </div>
              
              <div className="faq-item">
                <div className="faq-q">Does it support Hindi?</div>
                <div className="faq-a">Yes — HeartEcho supports Hindi, English, and Hinglish, and adapts to whichever you're most comfortable with.</div>
              </div>
              
              <div className="faq-item">
                <div className="faq-q">How is this different from Replika or Character.AI?</div>
                <div className="faq-a">HeartEcho is built specifically for Indian users — Hindi/Hinglish conversation, understanding of Indian family and cultural context, and localized emotional support that global apps aren't designed around.</div>
              </div>
              
              <div className="faq-item">
                <div className="faq-q">Is my conversation private?</div>
                <div className="faq-a">Yes. Your privacy is our highest priority. All conversations are completely private and end-to-end secure. We do not share your chats or personal data with third parties. You can read our full <Link href="/privacy" style={{ textDecoration: 'underline' }}>Privacy Policy</Link> for more details.</div>
              </div>
              
              <div className="faq-item">
                <div className="faq-q">Can it replace real relationships?</div>
                <div className="faq-a">No — HeartEcho is designed as a companion and emotional support tool, not a replacement for human relationships or professional mental health care.</div>
              </div>
            </div>
          </section>

          {/* CTA section */}
          <section className="compare-section" style={{ borderBottom: 'none', paddingBottom: '72px' }}>
            <div className="cta-section">
              <h2>Start Talking to Your AI Girlfriend Today</h2>
              <p style={{ margin: '8px 0 24px 0' }}>No signup friction, no awkward first message. Just start talking.</p>
              <Link href="/" className="btn-primary-compare">Start Chatting Free →</Link>
            </div>
            
            {/* Additional bottom SEO internal navigation */}
            <div style={{ textAlign: 'center', marginTop: '40px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
              <span>Compare HeartEcho: </span>
              <Link href="/heartecho-vs-character-ai" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline', margin: '0 8px' }}>HeartEcho vs Character.AI</Link> | 
              <Link href="/ai-girlfriend-hindi" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline', margin: '0 8px' }}>Hindi AI Chat</Link> | 
              <Link href="/blog/ai-girlfriend-india-guide" style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'underline', margin: '0 8px' }}>India Companion Guide</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
