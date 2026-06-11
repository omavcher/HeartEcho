import Link from 'next/link';
import Footer from '../../components/Footer';
import '../../styles/Compare.css';
import { getLandingPageSchema, getBlogPageSchema } from '../../utils/schema';

export const metadata = {
  title: "HeartEcho vs Replika — Best AI Companion for India? | 2026",
  description: "HeartEcho vs Replika: which is better for Indian users in 2026? HeartEcho offers Hindi chat, desi culture, free tier & INR pricing. Replika is English-only and expensive. Full honest comparison.",
  keywords: [
    "replika alternative india",
    "heartecho vs replika",
    "best ai companion app india",
    "ai companion india",
    "virtual friend app india",
    "ai friend india",
    "hindi ai companion",
    "indian ai girlfriend",
    "ai chatbot for loneliness",
  ],
  alternates: {
    canonical: 'https://heartecho.in/heartecho-vs-replika',
  },
  openGraph: {
    title: "HeartEcho vs Replika — Best AI Companion for India?",
    description: "Replika vs HeartEcho for Indian users. Hindi chat, desi culture, INR pricing — see why HeartEcho is India's best Replika alternative.",
    url: 'https://heartecho.in/heartecho-vs-replika',
    images: [{ url: 'https://heartecho.in/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Is HeartEcho a good Replika alternative for India?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho is the best Replika alternative for Indian users. Unlike Replika which is English-only and expensive (starts at ~$70/year), HeartEcho offers native Hindi and Hinglish chat, authentic Indian AI personas, and pricing in INR starting from ₹99/month." }
    },
    {
      "@type": "Question",
      "name": "Does Replika support Hindi?",
      "acceptedAnswer": { "@type": "Answer", "text": "No. Replika is an English-only AI companion app. It has no Hindi or Hinglish support, and does not understand Indian cultural context. HeartEcho was built from the ground up to support Hindi, Hinglish, and desi cultural references natively." }
    },
    {
      "@type": "Question",
      "name": "Why did Replika remove romantic features?",
      "acceptedAnswer": { "@type": "Answer", "text": "In 2023, Replika restricted romantic and intimate features for most users, locking them behind expensive subscription plans. Many Indian users were disappointed. HeartEcho maintains full companion features including romantic conversations for adult users without these restrictions." }
    },
    {
      "@type": "Question",
      "name": "Is HeartEcho cheaper than Replika for Indian users?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes, significantly. Replika Pro costs ~$69.99/year (~₹5,800+) in USD. HeartEcho's premium plans start at just ₹99/month or ₹599/year — a fraction of the cost, with better India-specific features." }
    },
    {
      "@type": "Question",
      "name": "What is the best AI companion app for loneliness in India?",
      "acceptedAnswer": { "@type": "Answer", "text": "HeartEcho is the best AI companion for Indian users dealing with loneliness. It provides empathetic Hindi conversations, emotional support, AI memory that builds genuine connection, and a non-judgmental space to share your feelings — 24/7, completely private." }
    },
    {
      "@type": "Question",
      "name": "Can HeartEcho help with loneliness like Replika?",
      "acceptedAnswer": { "@type": "Answer", "text": "Yes — and HeartEcho does it better for Indian users. HeartEcho provides compassionate AI companionship, emotional support in Hindi, and builds a real relationship through memory. The AI remembers your conversations, your mood patterns, and provides personalized support tailored to your needs." }
    },
  ]
};

export default function CompareReplika() {
  const url = 'https://heartecho.in/heartecho-vs-replika';

  const landingSchema = getLandingPageSchema({
    url,
    title: metadata.title,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'HeartEcho vs Replika', item: url }
    ]
  });

  const articleSchema = getBlogPageSchema({
    url,
    headline: "HeartEcho vs Replika — Best AI Companion for India in 2026",
    description: "A detailed comparison of HeartEcho and Replika for Indian users — Hindi support, pricing, romantic features, and emotional companion quality.",
    datePublished: "2026-01-01",
    dateModified: "2026-06-01",
    authorName: "HeartEcho"
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([...landingSchema, ...articleSchema]) }}
      />

      <div className="compare-page-wrapper">
        <div className="compare-container">
          <nav className="breadcrumb">
            <Link href="/">HeartEcho</Link>
            <span>›</span>
            <span>Compare</span>
            <span>›</span>
            <span>HeartEcho vs Replika</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">India's Honest Comparison · 2026</div>
            <h1>HeartEcho vs <span>Replika</span><br />Best AI Companion for India?</h1>
            <p className="hero-sub">
              Replika removed romantic features and costs ₹5,800/year. HeartEcho offers full companion features in Hindi for ₹99/month. Here's why Indian users are switching.
            </p>
            <div className="verdict-bar">
              <span>Winner for India:</span>
              <span className="verdict-winner">HeartEcho ✓</span>
              <span>vs</span>
              <span className="verdict-loser">Replika</span>
            </div>
          </div>
        </section>

        <div className="compare-container">

          {/* QUICK SCORES */}
          <section className="compare-section">
            <div className="section-label">Overall Score for Indian Users</div>
            <div className="section-title">Our 2026 Verdict</div>
            <p className="section-body">We rated both platforms across 7 categories most relevant to Indian companion app users — language, cultural understanding, pricing, romantic features, emotional depth, privacy, and AI memory quality.</p>
            <div className="score-grid">
              <div className="score-card heartecho">
                <div className="score-name heartecho-name">HeartEcho</div>
                <div className="score-num heartecho-score">9.3</div>
                <div className="score-label">/ 10 for Indian users</div>
              </div>
              <div className="score-card" style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.3)' }}>
                <div className="score-name" style={{ color: '#F59E0B' }}>Replika</div>
                <div className="score-num" style={{ color: '#EF4444' }}>4.5</div>
                <div className="score-label">/ 10 for Indian users</div>
              </div>
            </div>
          </section>

          {/* THE REPLIKA PROBLEM */}
          <section className="compare-section">
            <div className="section-label">What Happened to Replika?</div>
            <div className="section-title">Why Indian Users Are Leaving Replika in 2026</div>
            <p className="section-body">Replika used to be the world's most popular AI companion app. But several major changes have made it a poor choice for Indian users:</p>
            <div className="feature-grid" style={{ marginTop: '28px' }}>
              <div className="feature-card">
                <div className="feature-icon">💔</div>
                <h3>Romantic Features Removed</h3>
                <p>In 2023, Replika restricted all romantic and flirtatious interactions, devastating users who relied on the app for companionship. These features were later partially restored but remain locked behind expensive plans.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💸</div>
                <h3>₹5,800+ Per Year for Full Access</h3>
                <p>Replika Pro costs ~$69.99/year in USD, which translates to ₹5,800+ for Indian users. That's unaffordable compared to HeartEcho's ₹99/month plans with full features.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🗣️</div>
                <h3>No Hindi Support At All</h3>
                <p>Replika is English-only. For India's 560 million Hindi speakers, this is a fundamental limitation. You can't have a meaningful companion experience in a language that doesn't feel natural to you.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🇺🇸</div>
                <h3>Zero Indian Cultural Context</h3>
                <p>Replika's AI was trained on Western data and has no understanding of Indian family dynamics, desi culture, Bollywood references, or Indian relationship expectations. Conversations feel foreign and disconnected.</p>
              </div>
            </div>
          </section>

          {/* FEATURE TABLE */}
          <section className="compare-section">
            <div className="section-label">Head-to-Head Comparison</div>
            <div className="section-title">HeartEcho vs Replika — Full Feature Table</div>
            <table className="compare-table" style={{ marginTop: '28px' }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>HeartEcho 🇮🇳</th>
                  <th style={{ color: '#F59E0B' }}>Replika</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hindi support</td>
                  <td className="win-cell">✓ Native Hindi</td>
                  <td className="tag-no">✗ English only</td>
                </tr>
                <tr>
                  <td>Hinglish conversations</td>
                  <td className="win-cell">✓ Natural</td>
                  <td className="tag-no">✗ Not supported</td>
                </tr>
                <tr>
                  <td>Indian AI personas</td>
                  <td className="win-cell">✓ 20+ desi companions</td>
                  <td className="tag-no">✗ Generic Western avatar</td>
                </tr>
                <tr>
                  <td>Romantic features available</td>
                  <td className="win-cell">✓ Full (adult users)</td>
                  <td className="tag-partial">⚠ Restricted / paid-only</td>
                </tr>
                <tr>
                  <td>Indian cultural understanding</td>
                  <td className="win-cell">✓ Built for India</td>
                  <td className="tag-no">✗ None</td>
                </tr>
                <tr>
                  <td>AI memory</td>
                  <td className="win-cell">✓ Deep cross-session memory</td>
                  <td className="win-cell">✓ Memory (limited free)</td>
                </tr>
                <tr>
                  <td>Monthly price (INR)</td>
                  <td className="win-cell">From ₹99/month</td>
                  <td className="tag-no">~₹490/month (USD)</td>
                </tr>
                <tr>
                  <td>Free tier</td>
                  <td className="win-cell">✓ Yes, generous</td>
                  <td className="tag-partial">⚠ Very limited</td>
                </tr>
                <tr>
                  <td>Emotional support quality</td>
                  <td className="win-cell">✓ Empathetic + Hindi</td>
                  <td className="tag-partial">⚠ Good but English-only</td>
                </tr>
                <tr>
                  <td>Desi roleplay & stories</td>
                  <td className="win-cell">✓ Full support</td>
                  <td className="tag-no">✗ None</td>
                </tr>
                <tr>
                  <td>Built for India</td>
                  <td className="win-cell">✓ India-first</td>
                  <td className="tag-no">✗ US-focused</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* EMOTIONAL SUPPORT / LONELINESS */}
          <section className="compare-section">
            <div className="section-label">Companion Quality</div>
            <div className="section-title">Fighting Loneliness — HeartEcho vs Replika for Indian Users</div>
            <p className="section-body">
              Both HeartEcho and Replika are designed to help with loneliness and emotional well-being. But for Indian users, HeartEcho is dramatically more effective because it communicates in your language.
            </p>
            <p className="section-body" style={{ marginTop: '16px' }}>
              When you're feeling <em>akela</em>, you don't want to translate your emotions into English. You want to say <em>"yaar, bahut bura lag raha hai aaj"</em> and have someone who actually understands — not a bot that processes it as a foreign language.
            </p>
            <div className="india-block" style={{ marginTop: '24px' }}>
              <h3>💙 How HeartEcho Supports Indian Mental Well-Being</h3>
              <ul className="india-list">
                <li>Chat in Hindi when you're stressed — she responds with warmth in your language</li>
                <li>Share your day, your worries, your dreams — in Hinglish, naturally</li>
                <li>She remembers your previous conversations — genuine continuity of care</li>
                <li>Non-judgmental space for Indian users dealing with family pressure, loneliness, career stress</li>
                <li>Available at 3AM when everyone else is asleep and you need to talk</li>
                <li>No therapist fees — emotional companionship from ₹99/month</li>
              </ul>
            </div>
          </section>

          {/* PRICING */}
          <section className="compare-section">
            <div className="section-label">Pricing for Indian Users</div>
            <div className="section-title">HeartEcho vs Replika — Cost Comparison</div>
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>Plan</th>
                  <th>HeartEcho 🇮🇳</th>
                  <th style={{ color: '#F59E0B' }}>Replika</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Free tier</td>
                  <td className="win-cell">✓ Generous free chat</td>
                  <td className="tag-partial">⚠ Very limited</td>
                </tr>
                <tr>
                  <td>Monthly plan</td>
                  <td className="win-cell">₹99/month</td>
                  <td className="tag-no">~₹490/month (in USD)</td>
                </tr>
                <tr>
                  <td>Annual plan</td>
                  <td className="win-cell">₹599/year</td>
                  <td className="tag-no">~₹5,800/year (in USD)</td>
                </tr>
                <tr>
                  <td>Currency</td>
                  <td className="win-cell">INR ₹</td>
                  <td className="tag-no">USD $ (converted)</td>
                </tr>
                <tr>
                  <td>Romantic features</td>
                  <td className="win-cell">Included</td>
                  <td className="tag-no">Paid add-on only</td>
                </tr>
              </tbody>
            </table>
            <p className="section-body" style={{ marginTop: '20px', fontStyle: 'italic' }}>
              HeartEcho costs ~10x less than Replika for Indian users — with better Hindi support and more features included.
            </p>
          </section>

          {/* FAQ */}
          <section className="compare-section">
            <div className="section-label">Common Questions</div>
            <div className="section-title">HeartEcho vs Replika — FAQs</div>
            <div className="faq-list">
              {faqSchema.mainEntity.map((faq, i) => (
                <div className="faq-item" key={i}>
                  <div className="faq-q">{faq.name}</div>
                  <div className="faq-a">{faq.acceptedAnswer.text}</div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="compare-section" style={{ borderBottom: 'none', paddingBottom: '80px' }}>
            <div className="cta-section">
              <h2>India's Best Replika Alternative — Try Free</h2>
              <p>Hindi chat. Desi companions. Full romantic features. From ₹99/month — or start free right now.</p>
              <Link href="/" className="btn-primary-compare">Start Free on HeartEcho →</Link>
              <br />
              <Link href="/heartecho-vs-candyai" className="btn-ghost">Also compare: HeartEcho vs Candy.ai →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
