import Link from 'next/link';
import Footer from '../../components/Footer';
import '../../styles/Compare.css';
import { getLandingPageSchema, getBlogPageSchema } from '../../utils/schema';

export const metadata = {
  title: "HeartEcho vs Candy.ai – Best for India? | 2026",
  description: "HeartEcho vs Candy.ai: Honest comparison for Indian users. HeartEcho is India's only Hindi-native AI girlfriend app — desi culture, Hinglish chat, free to try. Candy.ai is English-only and expensive.",
  keywords: ["heartecho vs candy ai", "best ai girlfriend india", "hindi ai chat app", "indian ai girlfriend", "desi ai companion chat", "candy ai india alternative", "ai girlfriend hindi"],
  alternates: {
    canonical: 'https://heartecho.in/heartecho-vs-candyai',
  },
  openGraph: {
    title: "HeartEcho vs Candy.ai – Best AI Girlfriend for India?",
    description: "Comparing HeartEcho and Candy.ai for Indian users. Hindi chat, desi culture, free tier — see why HeartEcho wins in India.",
    url: 'https://heartecho.in/heartecho-vs-candyai',
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
      "name": "Is HeartEcho better than Candy.ai for Indian users?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. HeartEcho is built specifically for India — it supports Hindi and Hinglish chat, understands Indian culture and references, and has a free tier. Candy.ai is English-only, does not understand Indian culture, and requires a paid subscription to access most features."
      }
    },
    {
      "@type": "Question",
      "name": "Can I chat in Hindi on HeartEcho?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes. HeartEcho is India's only Hindi-native AI girlfriend platform. You can chat in Hindi, Hinglish, or English. Candy.ai only supports English."
      }
    },
    {
      "@type": "Question",
      "name": "Is HeartEcho free compared to Candy.ai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho offers a free tier so Indian users can try it without paying. Candy.ai locks most features behind a paid subscription that starts at around $9.99/month."
      }
    },
    {
      "@type": "Question",
      "name": "Which AI girlfriend app is best in India in 2026?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "For Indian users, HeartEcho is the best AI girlfriend app in 2026. It is the only platform built specifically for India with Hindi/Hinglish chat, desi AI personas, and Indian cultural understanding. Candy.ai is a global platform not designed for Indian users."
      }
    },
    {
      "@type": "Question",
      "name": "Does Candy.ai work in India?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Candy.ai technically works in India but it only supports English and has no Indian cultural context. Indian users often find the conversations feel foreign and disconnected from desi culture."
      }
    },
    {
      "@type": "Question",
      "name": "What makes HeartEcho different from Candy.ai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho is India-first: built for Indian users, supports Hindi and Hinglish, understands desi culture and references, has Indian AI personas, and is more affordable. Candy.ai is a Western platform with no India-specific features."
      }
    }
  ]
};

export default function CompareCandyAI() {
  const url = 'https://heartecho.in/heartecho-vs-candyai';
  
  // Generating landing page schemas (WebPage, FAQPage, Breadcrumbs)
  const landingSchema = getLandingPageSchema({
    url,
    title: metadata.title,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'HeartEcho vs Candy.ai', item: url }
    ]
  });

  // Generating Article schema
  const articleSchema = getBlogPageSchema({
    url,
    headline: "HeartEcho vs Candy.ai – Which AI Girlfriend App is Best for India?",
    description: "A detailed comparison of HeartEcho and Candy.ai for Indian users, covering Hindi support, pricing, features, and cultural fit.",
    datePublished: "2026-01-01",
    dateModified: "2026-05-01",
    authorName: "HeartEcho"
  });

  const combinedSchemas = [...landingSchema, ...articleSchema];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(combinedSchemas) }}
      />
      
      <div className="compare-page-wrapper">
        <div className="compare-container">
          <nav className="breadcrumb">
            <Link href="/">HeartEcho</Link>
            <span>›</span>
            <span>Compare</span>
            <span>›</span>
            <span>HeartEcho vs Candy.ai</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">India's Honest Comparison · 2026</div>
            <h1>HeartEcho vs <span>Candy.ai</span><br/>Which AI Girlfriend Wins in India?</h1>
            <p className="hero-sub">If you're Indian, want to chat in Hindi or Hinglish, and don't want to pay ₹800/month for an app that doesn't understand desi culture — read this first.</p>
            <div className="verdict-bar">
              <span>Winner for India:</span>
              <span className="verdict-winner">HeartEcho ✓</span>
              <span>vs</span>
              <span className="verdict-loser">Candy.ai</span>
            </div>
          </div>
        </section>

        <div className="compare-container">

          {/* Quick Score */}
          <section className="compare-section">
            <div className="section-label">Overall Score for Indian Users</div>
            <div className="section-title">Our Verdict at a Glance</div>
            <p className="section-body">We compared both platforms across 6 categories that matter most to Indian users — language, cultural fit, pricing, content, privacy, and features.</p>
            <div className="score-grid">
              <div className="score-card heartecho">
                <div className="score-name heartecho-name">HeartEcho</div>
                <div className="score-num heartecho-score">9.1</div>
                <div className="score-label">/ 10 for Indian users</div>
              </div>
              <div className="score-card candy">
                <div className="score-name candy-name">Candy.ai</div>
                <div className="score-num candy-score">4.8</div>
                <div className="score-label">/ 10 for Indian users</div>
              </div>
            </div>
          </section>

          {/* Comparison Table */}
          <section className="compare-section">
            <div className="section-label">Head-to-Head Comparison</div>
            <div className="section-title">HeartEcho vs Candy.ai — Full Feature Table</div>
            <p className="section-body">Here's exactly how both platforms compare across every feature Indian users care about.</p>

            <table className="compare-table">
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>HeartEcho 🇮🇳</th>
                  <th className="candy-header">Candy.ai 🌍</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Chat in Hindi</td>
                  <td className="win-cell">✓ Full Hindi support</td>
                  <td className="tag-no">✗ English only</td>
                </tr>
                <tr>
                  <td>Hinglish chat</td>
                  <td className="win-cell">✓ Native Hinglish</td>
                  <td className="tag-no">✗ Not supported</td>
                </tr>
                <tr>
                  <td>Indian AI personas (Priya, Neha, Sunita…)</td>
                  <td className="win-cell">✓ Desi characters</td>
                  <td className="tag-no">✗ Western personas only</td>
                </tr>
                <tr>
                  <td>Understands Indian culture</td>
                  <td className="win-cell">✓ Built for India</td>
                  <td className="tag-no">✗ No India context</td>
                </tr>
                <tr>
                  <td>Free tier available</td>
                  <td className="win-cell">✓ Free to start</td>
                  <td className="tag-no">✗ Paid only</td>
                </tr>
                <tr>
                  <td>Monthly price (paid plan)</td>
                  <td className="win-cell">More affordable</td>
                  <td className="tag-no">~₹850/month</td>
                </tr>
                <tr>
                  <td>Private / adult content</td>
                  <td className="tag-yes">✓ Available</td>
                  <td className="tag-yes">✓ Available (paid)</td>
                </tr>
                <tr>
                  <td>Desi erotica & romantic stories</td>
                  <td className="win-cell">✓ Indian-flavoured</td>
                  <td className="tag-no">✗ Generic Western content</td>
                </tr>
                <tr>
                  <td>Roleplay chat</td>
                  <td className="tag-yes">✓ Yes</td>
                  <td className="tag-yes">✓ Yes</td>
                </tr>
                <tr>
                  <td>Private & anonymous</td>
                  <td className="tag-yes">✓ Yes</td>
                  <td className="tag-partial">⚠ US-based servers</td>
                </tr>
                <tr>
                  <td>Mobile-friendly</td>
                  <td className="tag-yes">✓ Yes</td>
                  <td className="tag-yes">✓ Yes</td>
                </tr>
                <tr>
                  <td>Built for India</td>
                  <td className="win-cell">✓ India-first</td>
                  <td className="tag-no">✗ US/Europe focused</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Why India */}
          <section className="compare-section">
            <div className="section-label">The India Problem with Candy.ai</div>
            <div className="section-title">Why Candy.ai Doesn't Work for Indian Users</div>
            <p className="section-body">Candy.ai is built for Western users — primarily American and European. When Indian users try it, they run into the same problems every time.</p>

            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🗣️</div>
                <h3>English-Only Interface</h3>
                <p>Candy.ai only understands and responds in English. If you switch to Hindi or mix Hinglish, the AI gets confused or responds in broken English. HeartEcho was built for this from day one.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🤷</div>
                <h3>Zero Desi Cultural Context</h3>
                <p>Candy.ai doesn't know who Babita ji is, what a "bhabhi" means culturally, or the difference between a Punjabi and Mallu reference. HeartEcho gets it — because it's made in India, for India.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💸</div>
                <h3>Expensive for Indian Pockets</h3>
                <p>Candy.ai charges ~$9.99/month which is ₹850+ for Indian users. Most features are locked behind this paywall. HeartEcho has a free tier — you can start chatting without paying anything.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👩</div>
                <h3>No Indian AI Personas</h3>
                <p>Candy.ai's characters have names like "Emma", "Sophia", and "Isabella." There's no Priya, no Neha, no Anita. HeartEcho gives you genuine Indian AI girlfriends that feel real and relatable.</p>
              </div>
            </div>
          </section>

          {/* India Advantage */}
          <section className="compare-section">
            <div className="section-label">Why HeartEcho Wins</div>
            <div className="section-title">The Only AI Girlfriend Built for Bharat</div>
            <p className="section-body">HeartEcho isn't just a Candy.ai alternative — it's a completely different product designed specifically for Indian users from the ground up.</p>

            <div className="india-block">
              <h3>🇮🇳 Made in India. Speaks India.</h3>
              <p>From Hinglish roleplay to desi fantasies to cultural references only an Indian would get — HeartEcho was built for you, not for an American audience.</p>
              <ul className="india-list">
                <li>Chat freely in Hindi, Hinglish, or English — switch mid-conversation, the AI keeps up</li>
                <li>Indian AI characters with desi names, personalities, and cultural awareness</li>
                <li>Understands Indian relationship dynamics — saas-bahu, bhabhi, college crush, office romance</li>
                <li>Desi erotica and romantic stories in Hindi — not generic Western content</li>
                <li>Free to start — no ₹850/month paywall just to say hello</li>
                <li>Privacy-first — your conversations stay private, no data sold</li>
              </ul>
            </div>
          </section>

          {/* FAQ */}
          <section className="compare-section">
            <div className="section-label">Common Questions</div>
            <div className="section-title">HeartEcho vs Candy.ai — FAQs</div>

            <div className="faq-list">
              <div className="faq-item">
                <div className="faq-q">Is HeartEcho better than Candy.ai for Indian users?</div>
                <div className="faq-a">Yes — by a wide margin. HeartEcho is India's only Hindi-native AI girlfriend platform. It supports Hindi and Hinglish chat, understands desi culture, and has a free tier. Candy.ai is English-only, has no Indian context, and charges ₹850+/month for most features.</div>
              </div>
              <div className="faq-item">
                <div className="faq-q">Can I chat in Hindi on HeartEcho?</div>
                <div className="faq-a">Yes. This is HeartEcho's biggest strength. You can chat in pure Hindi, Hinglish, or English — or mix all three in the same conversation. Candy.ai supports English only.</div>
              </div>
              <div className="faq-item">
                <div className="faq-q">Is HeartEcho free? How does it compare to Candy.ai's pricing?</div>
                <div className="faq-a">HeartEcho has a free tier so you can start chatting without entering your credit card. Candy.ai locks almost everything behind a paid plan (~$9.99/month or ₹850+). For Indian users on a budget, HeartEcho is clearly more accessible.</div>
              </div>
              <div className="faq-item">
                <div className="faq-q">Does Candy.ai work in India?</div>
                <div className="faq-a">Candy.ai is accessible in India but it wasn't designed for Indian users. There's no Hindi support, no desi personas, no cultural understanding of Indian contexts. Indian users consistently feel the conversations feel "foreign" and out of touch.</div>
              </div>
              <div className="faq-item">
                <div className="faq-q">Which is the best AI girlfriend app in India?</div>
                <div className="faq-a">HeartEcho is India's top AI girlfriend platform. It's the only app that does private companion chat in Hindi and Hinglish with culturally relevant Indian characters. Candy.ai offers virtual companion content but only in English, with no Indian context.</div>
              </div>
              <div className="faq-item">
                <div className="faq-q">Is HeartEcho safe and private?</div>
                <div className="faq-a">Yes. HeartEcho is built with privacy as a priority. Your conversations are private and not shared or sold. Candy.ai is US-based which means your data is stored on American servers under different privacy laws.</div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="compare-section" style={{ borderBottom: 'none', paddingBottom: '72px' }}>
            <div className="cta-section">
              <h2>Try India's #1 AI Girlfriend — Free</h2>
              <p>No credit card. No English-only limitation. Just chat in Hindi, Hinglish, or English with a desi AI girl who actually gets you.</p>
              <Link href="/" className="btn-primary-compare">Start Chatting Free →</Link>
              <br/>
              <Link href="/heartecho-vs-talkie" className="btn-ghost">Also compare: HeartEcho vs Talkie AI →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
