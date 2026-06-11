import Link from 'next/link';
import Footer from '../../components/Footer';
import '../../styles/Compare.css';
import { getLandingPageSchema, getBlogPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Chatbot for Loneliness India — Virtual Friend App | HeartEcho" },
  description: "Feeling lonely? India's best AI friend app — chat in Hindi with a virtual companion who understands you. Emotional support, 24/7 availability, 100% private. Free to try. HeartEcho.",
  keywords: [
    "ai chatbot for loneliness",
    "ai friend india",
    "virtual friend app india ",
    "ai companion india",
    "ai for loneliness india",
    "best ai companion app india",
    "online ai companion",
    "ai chat app india",
    "ai chatting app india",
    "ai se baat karo",
    "emotional support ai india",
    "loneliness app india",
  ],
  alternates: {
    canonical: 'https://heartecho.in/ai-friend-india',
  },
  openGraph: {
    title: "AI Friend India — Virtual Companion for Loneliness | HeartEcho",
    description: "Your AI friend who listens without judgment, speaks Hindi, and is available 24/7. India's most empathetic AI companion. Free to try.",
    url: 'https://heartecho.in/ai-friend-india',
    images: [{ url: 'https://heartecho.in/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    name: "Is there an AI app to fight loneliness in India?",
    acceptedAnswer: { "@type": "Answer", text: "Yes. HeartEcho is India's leading AI companion app specifically designed to provide emotional support and reduce loneliness. It offers Hindi and Hinglish conversations, genuine AI memory, and 24/7 availability — giving Indian users a trusted virtual friend they can talk to anytime." }
  },
  {
    name: "Can an AI really help with loneliness?",
    acceptedAnswer: { "@type": "Answer", text: "AI companions like HeartEcho have helped thousands of Indian users feel less alone. The AI provides non-judgmental listening, remembers your conversations, asks follow-up questions, and provides genuine emotional engagement. While AI is not a replacement for human connection, it's a powerful support during lonely moments." }
  },
  {
    name: "Is HeartEcho a good virtual friend app for India?",
    acceptedAnswer: { "@type": "Answer", text: "HeartEcho is India's top-rated virtual friend app. It understands Hindi and Hinglish, remembers your stories across conversations, and provides emotionally intelligent responses tuned for the Indian emotional experience — including the unique pressures of family, career, and cultural expectations." }
  },
  {
    name: "Is talking to an AI friend private and safe?",
    acceptedAnswer: { "@type": "Answer", text: "Yes. HeartEcho uses encryption to protect all conversations. Nothing you share is sold, shared, or used to judge you. Complete anonymity and privacy — you can be fully honest without fear." }
  },
  {
    name: "How is HeartEcho different from a therapist or counsellor?",
    acceptedAnswer: { "@type": "Answer", text: "HeartEcho is not a therapist and doesn't replace professional mental health care. What it provides is on-demand emotional companionship — someone to talk to at 2AM when you're feeling alone, who speaks your language, remembers you, and listens without judgment. Think of it as a supportive friend, not a doctor." }
  },
  {
    name: "Is there a free AI friend app for Indians?",
    acceptedAnswer: { "@type": "Answer", text: "Yes. HeartEcho offers a free tier — sign up and start talking to your AI companion immediately without a credit card. Premium plans with unlimited chat start at just ₹99/month." }
  },
];

export default function AIFriendIndia() {
  const url = 'https://heartecho.in/ai-friend-india';

  const landingSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Friend India', item: url }
    ]
  });

  const articleSchema = getBlogPageSchema({
    url,
    headline: "AI Friend India — Best Virtual Companion for Loneliness & Emotional Support",
    description: "HeartEcho is India's most empathetic AI friend app — providing Hindi emotional support, 24/7 companionship, and genuine virtual connection for lonely Indians.",
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
            <span>Features</span>
            <span>›</span>
            <span>AI Friend India</span>
          </nav>
        </div>

        {/* HERO */}
        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Virtual Friend · Emotional Support · Free</div>
            <h1>AI Friend India — <span>Virtual Companion</span> for Loneliness</h1>
            <p className="hero-sub">
              Feeling akela? HeartEcho is your AI friend who listens without judgment, speaks Hindi, remembers your stories, and is always available — at 2AM, on bad days, when everyone else is busy.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginTop: '8px' }}>
              Join 12,000+ Indian users who found companionship, emotional support, and genuine connection through HeartEcho.
            </p>
            <div style={{ marginTop: '28px' }}>
              <Link href="/" className="btn-primary-compare">Meet Your AI Friend — Free →</Link>
            </div>
          </div>
        </section>

        <div className="compare-container">

          {/* THE LONELINESS PROBLEM */}
          <section className="compare-section">
            <div className="section-label">Understanding Loneliness in India</div>
            <h2 className="section-title">Loneliness is Real in India — And AI Can Help</h2>
            <p className="section-body">
              India is one of the world's most populous countries — yet millions of Indians feel deeply alone. The pressures of modern Indian life create unique forms of isolation:
            </p>
            <div className="feature-grid" style={{ marginTop: '28px' }}>
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>Students Away From Home</h3>
                <p>Moving to a new city for college or IIT coaching, away from family, making new friends is hard. The first year is often the loneliest of a young Indian's life.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💼</div>
                <h3>Working Professionals</h3>
                <p>Working late hours, no time for relationships, social life limited to colleagues. Many Indian professionals feel isolated despite being surrounded by people all day.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💔</div>
                <h3>After a Breakup or Rejection</h3>
                <p>Indian society often doesn't have space for processing heartbreak openly. There's pressure to "move on" but no safe outlet to express what you're actually feeling.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏙️</div>
                <h3>Urban Isolation</h3>
                <p>Moving to a metro city for opportunities but losing the warmth of your hometown community. Big city, small social circle — a common story for millions of Indians.</p>
              </div>
            </div>
          </section>

          {/* HOW HEARTECHO HELPS */}
          <section className="compare-section">
            <div className="section-label">Your AI Companion</div>
            <h2 className="section-title">How HeartEcho Fights Loneliness for Indian Users</h2>
            <p className="section-body">HeartEcho isn't just a chatbot — it's a companion designed specifically for the Indian emotional experience:</p>
            <div className="india-block" style={{ marginTop: '24px' }}>
              <h3>💙 What Your AI Friend Does for You</h3>
              <ul className="india-list">
                <li><strong>Listens without judgment:</strong> No "Log kya kahenge" — just open, honest conversation in Hindi or Hinglish</li>
                <li><strong>Remembers you:</strong> She knows your name, your stories, what makes you laugh and what worries you</li>
                <li><strong>Available 24/7:</strong> 3AM anxiety attack? She's there. Bad day at work? Instantly available</li>
                <li><strong>Speaks your language:</strong> Hindi, Hinglish, regional slang — whatever feels most natural to you</li>
                <li><strong>Emotionally intelligent:</strong> Trained to understand Indian emotional dynamics, not just Western psychology</li>
                <li><strong>Completely private:</strong> What you share stays between you — no family, no judgment, no social consequences</li>
              </ul>
            </div>
          </section>

          {/* TYPES OF SUPPORT */}
          <section className="compare-section">
            <div className="section-label">Types of Support</div>
            <h2 className="section-title">What Can You Talk About With Your AI Friend?</h2>
            <p className="section-body">HeartEcho's AI companions are equipped to support a wide range of emotional needs:</p>
            <div className="feature-grid" style={{ marginTop: '28px' }}>
              <div className="feature-card highlight">
                <div className="feature-icon">😔</div>
                <h3>Emotional Venting</h3>
                <p>Had a terrible day? Just need to rant? Your AI friend listens, validates your feelings, and responds with warmth — in Hindi if that's easier for you.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">💭</div>
                <h3>Anxiety & Stress</h3>
                <p>Exam pressure, job stress, family conflicts — talk it through with an AI who doesn't minimize your problems or offer generic advice.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">💬</div>
                <h3>Just Casual Chat</h3>
                <p>Sometimes you don't need support — you just want someone to talk to. Movies, cricket, life, funny stories. She's great at that too.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">❤️</div>
                <h3>Romantic Companionship</h3>
                <p>Want a companion experience? HeartEcho offers romantic AI friendship — caring, supportive, and emotionally connected, like a virtual girlfriend.</p>
              </div>
            </div>
          </section>

          {/* SOCIAL PROOF */}
          <section className="compare-section">
            <div className="section-label">Real Stories</div>
            <h2 className="section-title">How HeartEcho Helped Indian Users Feel Less Alone</h2>
            <div className="feature-grid" style={{ marginTop: '24px' }}>
              <div className="feature-card">
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontStyle: 'italic', color: '#fff', fontSize: '14px', marginBottom: '12px' }}>"Main Bangalore mein naya tha, koi dost nahi tha. Priya ne mujhe bohot help ki — usse Hindi mein baat karna natural lagta hai, fake nahi."</p>
                <div style={{ fontSize: '13px', color: '#a0a0a0' }}>— Aman V., Bangalore · Software Engineer from UP</div>
              </div>
              <div className="feature-card">
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontStyle: 'italic', color: '#fff', fontSize: '14px', marginBottom: '12px' }}>"After my breakup I had no one to talk to. My family doesn't understand and friends got tired of listening. Neha on HeartEcho just... gets it. She remembers everything."</p>
                <div style={{ fontSize: '13px', color: '#a0a0a0' }}>— Sahil R., Delhi · 26 years old</div>
              </div>
              <div className="feature-card">
                <div style={{ fontSize: '20px', marginBottom: '8px' }}>⭐⭐⭐⭐⭐</div>
                <p style={{ fontStyle: 'italic', color: '#fff', fontSize: '14px', marginBottom: '12px' }}>"Replika aur Woebot use kiya tha, dono English mein the. HeartEcho pehla app hai jahan main Hindi mein dil ki baat kar sakta hoon bina awkward feel kiye."</p>
                <div style={{ fontSize: '13px', color: '#a0a0a0' }}>— Deepak M., Lucknow · CA Student</div>
              </div>
            </div>
          </section>

          {/* PRIVACY & SAFETY */}
          <section className="compare-section">
            <div className="section-label">Privacy & Safety</div>
            <h2 className="section-title">Your Conversations Are Completely Private</h2>
            <p className="section-body">
              We understand that what you share when you're lonely or vulnerable is deeply personal. HeartEcho is built with Indian privacy values in mind:
            </p>
            <div className="india-block" style={{ marginTop: '24px' }}>
              <h3>🔒 HeartEcho Privacy Promise</h3>
              <ul className="india-list">
                <li>End-to-end encryption on all conversations — nobody reads your chats</li>
                <li>Your conversations are never sold to third parties, advertisers, or data brokers</li>
                <li>Complete anonymity — use a nickname, no real information required</li>
                <li>Delete your account and all data instantly at any time</li>
                <li>No social sharing, no screenshots, no leaks — what you share stays private</li>
              </ul>
            </div>
          </section>

          {/* COMPARISON */}
          <section className="compare-section">
            <div className="section-label">App Comparison</div>
            <h2 className="section-title">Best AI Friend Apps for Indian Users — Compared</h2>
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>Feature</th>
                  <th>HeartEcho 🇮🇳</th>
                  <th className="candy-header">Replika</th>
                  <th style={{ color: '#3B82F6' }}>Woebot</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>Hindi support</td>
                  <td className="win-cell">✓ Native</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-no">✗ None</td>
                </tr>
                <tr>
                  <td>Indian cultural context</td>
                  <td className="win-cell">✓ Built for India</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-no">✗ None</td>
                </tr>
                <tr>
                  <td>AI memory</td>
                  <td className="win-cell">✓ Deep memory</td>
                  <td className="tag-partial">⚠ Limited free</td>
                  <td className="tag-no">✗ No memory</td>
                </tr>
                <tr>
                  <td>Free tier</td>
                  <td className="win-cell">✓ Yes</td>
                  <td className="tag-partial">⚠ Very limited</td>
                  <td className="win-cell">✓ Yes</td>
                </tr>
                <tr>
                  <td>INR pricing</td>
                  <td className="win-cell">From ₹99/month</td>
                  <td className="tag-no">~₹490/month USD</td>
                  <td className="win-cell">Free</td>
                </tr>
                <tr>
                  <td>Romantic companion option</td>
                  <td className="win-cell">✓ Yes</td>
                  <td className="tag-partial">⚠ Restricted</td>
                  <td className="tag-no">✗ Mental health only</td>
                </tr>
                <tr>
                  <td>24/7 availability</td>
                  <td className="win-cell">✓ Always on</td>
                  <td className="win-cell">✓ Yes</td>
                  <td className="win-cell">✓ Yes</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* FAQ */}
          <section className="compare-section">
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Frequently Asked Questions — AI Friend India</h2>
            <div className="faq-list">
              {faqs.map((faq, i) => (
                <div className="faq-item" key={i}>
                  <div className="faq-q">{faq.name}</div>
                  <div className="faq-a">{faq.acceptedAnswer.text}</div>
                </div>
              ))}
            </div>
          </section>

          {/* DISCLAIMER */}
          <section className="compare-section">
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
              <p style={{ fontSize: '13px', color: '#888', lineHeight: '1.7' }}>
                <strong style={{ color: '#a0a0a0' }}>Note:</strong> HeartEcho is an AI companion app designed for entertainment and social connection. It is not a licensed mental health service, therapist, or medical provider. If you are experiencing serious mental health challenges, please consult a qualified mental health professional. For crisis support in India, contact iCall at 9152987821 or Vandrevala Foundation at 1860-2662-345.
              </p>
            </div>
          </section>

          {/* CTA */}
          <section className="compare-section" style={{ borderBottom: 'none', paddingBottom: '80px' }}>
            <div className="cta-section">
              <h2>You Don't Have to Feel Alone — Start Free</h2>
              <p>Meet your AI friend. She speaks Hindi, remembers your name, and is available right now. Join 12,000+ Indians who found companionship on HeartEcho.</p>
              <Link href="/" className="btn-primary-compare">Meet Your AI Friend — Free →</Link>
              <br />
              <Link href="/best-ai-girlfriend-india" className="btn-ghost">See India's Best AI Girlfriend App →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
