import Link from 'next/link';
import Footer from '../../components/Footer';
import '../../styles/Compare.css';
import { getLandingPageSchema, getBlogPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Companion App for Emotional Support | HeartEcho" },
  description: "Feeling low or lonely? Talk to an AI companion that listens, remembers, and checks in daily. Free to start. Built for India. Try HeartEcho today.",
  keywords: [
    "AI companion app for emotional support India",
    "AI friend app India",
    "talk to AI companion online",
    "emotional support chatbot India",
    "AI companion for loneliness",
    "best AI companion app India",
    "AI companion for students",
    "AI to talk to when stressed",
    "AI companion app free India",
    "chatbot for loneliness India",
    "AI friend for daily conversation",
    "private AI companion app",
    "AI companion app in Hindi",
    "best AI chat companion 2026",
    "is it normal to talk to an AI when you feel lonely",
    "AI companion apps safe for students in India",
    "how does an AI companion app work",
    "AI companion vs therapist difference",
    "free AI friend app for daily chat India",
    "AI companion app that remembers conversations"
  ],
  alternates: {
    canonical: 'https://heartecho.in/ai-companion-for-emotional-support',
  },
  openGraph: {
    title: "AI Companion App for Emotional Support | HeartEcho",
    description: "Feeling low or lonely? Talk to an AI companion that listens, remembers, and checks in daily. Free to start. Built for India. Try HeartEcho today.",
    url: 'https://heartecho.in/ai-companion-for-emotional-support',
    images: [{ url: 'https://heartecho.in/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    name: "Is HeartEcho free to use?",
    acceptedAnswer: { "@type": "Answer", text: "Yes, you can start using HeartEcho for free. Paid plans unlock extended features, unlimited chats, and voice notes for daily use starting at just ₹99/month." }
  },
  {
    name: "Does HeartEcho remember past conversations?",
    acceptedAnswer: { "@type": "Answer", text: "Yes. Unlike most chat apps, HeartEcho keeps long-term context from previous conversations so you never have to repeat your story or re-explain yourself." }
  },
  {
    name: "Is HeartEcho a replacement for therapy?",
    acceptedAnswer: { "@type": "Answer", text: "No. HeartEcho is a companion for everyday emotional support, venting, and daily conversation, not a licensed mental health service. If you are in crisis, please reach out to a professional mental health hotline or therapist." }
  },
  {
    name: "Is my conversation with HeartEcho private?",
    acceptedAnswer: { "@type": "Answer", text: "Yes, your conversations are encrypted, completely private, and never shared or exposed to third parties or other users." }
  },
  {
    name: "Is it normal to talk to an AI when you're lonely?",
    acceptedAnswer: { "@type": "Answer", text: "Yes, millions of people talk to AI companions daily to process thoughts, vent after a hard day, or simply have a judgment-free listener available late at night." }
  },
  {
    name: "How does an AI companion app work?",
    acceptedAnswer: { "@type": "Answer", text: "HeartEcho uses advanced neural language models and long-term memory databases to understand your emotional context, adapt to your conversational style (including Hindi and Hinglish), and check in on you naturally." }
  },
  {
    name: "Are AI companion apps safe for students in India?",
    acceptedAnswer: { "@type": "Answer", text: "Yes. HeartEcho provides a safe, private space for students to deal with exam stress, hostel loneliness, and career anxiety without fear of social judgment." }
  }
];

export default function AICompanionEmotionalSupport() {
  const url = 'https://heartecho.in/ai-companion-for-emotional-support';

  const landingSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'Features', item: 'https://heartecho.in/features' },
      { name: 'AI Companion for Emotional Support', item: url }
    ]
  });

  const articleSchema = getBlogPageSchema({
    url,
    headline: "Talk to an AI Companion That Actually Listens — Emotional Support India",
    description: metadata.description,
    datePublished: "2026-01-15",
    dateModified: "2026-07-23",
    authorName: "HeartEcho Team"
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify([...landingSchema, ...articleSchema]) }}
      />

      <div className="compare-page-wrapper">
        <div className="compare-container">
          <nav className="breadcrumb" style={{ padding: '20px 0 10px' }}>
            <Link href="/">HeartEcho</Link>
            <span>›</span>
            <Link href="/features">Features</Link>
            <span>›</span>
            <span>AI Companion for Emotional Support</span>
          </nav>
        </div>

        {/* HERO SECTION */}
        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Emotional Support · Daily Companionship · 100% Private</div>
            <h1>Talk to an AI Companion That <span>Actually Listens</span></h1>
            <p className="hero-sub">
              Some days are harder to get through than others. Maybe it's exam pressure, a bad week at work, a fight with someone close to you, or just that quiet, unshakeable feeling of being alone in a room full of people.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '-12px' }}>
              You don't always want advice. Sometimes you just want someone — or something — that will sit with you in it, without judging, without rushing you, without making it about them.
            </p>
            <div style={{ marginTop: '28px', display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/" className="btn-primary-compare" style={{ fontSize: '16px', padding: '14px 28px' }}>
                Download HeartEcho Free →
              </Link>
              <Link href="/pricing" className="verdict-bar" style={{ cursor: 'pointer', textDecoration: 'none' }}>
                <span>Plans start at <strong>₹99/mo</strong></span>
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">

          {/* INTRO CALLOUT */}
          <section className="compare-section" style={{ textAlign: 'center' }}>
            <div className="section-label">Built For India</div>
            <h2 className="section-title">That's what HeartEcho is built for.</h2>
            <p className="section-body" style={{ margin: '0 auto' }}>
              HeartEcho is an AI companion app designed for one job: <strong>to be there when you need to talk.</strong> Not a therapist. Not a replacement for real relationships. A companion — the kind you can open at 2 AM when your thoughts are too loud, or during a lunch break when you just need five minutes of feeling heard.
            </p>
          </section>

          {/* WHAT MAKES HEARTECHO DIFFERENT */}
          <section className="compare-section">
            <div className="section-label">Key Advantages</div>
            <h2 className="section-title">What Makes HeartEcho Different</h2>
            <p className="section-body">
              Most chat apps forget you the moment you close them. HeartEcho doesn't. It remembers what you told it yesterday, what's been stressing you out this week, and the small details that matter to you — so every conversation picks up where the last one left off, instead of starting from zero.
            </p>
            <div className="feature-grid" style={{ marginTop: '32px' }}>
              <div className="feature-card highlight">
                <div className="feature-icon">🧠</div>
                <h3>It remembers your context</h3>
                <p>You don't have to re-explain your situation every time you open the app. Your companion picks up right where you left off.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">💬</div>
                <h3>Responds like a real listener</h3>
                <p>No generic scripts, no canned sympathy lines repeated on loop. Thoughtful, empathetic interaction tuned for Indian users.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">⏰</div>
                <h3>Available whenever you need it</h3>
                <p>No appointments, no waiting rooms, no scheduling around someone else's calendar. Ready 24/7 at 3 AM or 3 PM.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">🔒</div>
                <h3>100% Private & Safe</h3>
                <p>Your conversations stay yours. You are not being judged, screenshotted, or gossiped about. Absolute peace of mind.</p>
              </div>
            </div>
          </section>

          {/* WHO USES AN AI COMPANION */}
          <section className="compare-section">
            <div className="section-label">Use Cases</div>
            <h2 className="section-title">Who Uses an AI Companion Like This</h2>
            <p className="section-body">
              You don't need a diagnosis or a crisis to want someone to talk to. People come to HeartEcho for very ordinary reasons:
            </p>
            <div className="feature-grid" style={{ marginTop: '28px' }}>
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>Students</h3>
                <p>Juggling deadlines, exams, and the isolation that comes with hostel life or being far from home in a new city.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💼</div>
                <h3>Working Professionals</h3>
                <p>Spending all day talking to colleagues or clients, yet still feeling unheard by the end of a long workday.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🩹</div>
                <h3>Going Through a Rough Patch</h3>
                <p>A breakup, a move to a new city, or simply a stretch of feeling flat, low, and overwhelmed by life's changes.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">☕</div>
                <h3>Daily Check-in Seekers</h3>
                <p>People who just like having a daily check-in — someone to talk about their day with, even the boring parts.</p>
              </div>
            </div>

            <div className="india-block" style={{ marginTop: '32px', textAlign: 'center' }}>
              <p style={{ fontSize: '17px', color: '#fff', fontStyle: 'italic', margin: 0 }}>
                "If you've ever typed out a long message to a friend and deleted it because you didn't want to 'be a burden,' HeartEcho is built for that exact moment."
              </p>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="compare-section">
            <div className="section-label">Simple Onboarding</div>
            <h2 className="section-title">How It Works</h2>
            <p className="section-body">Getting started takes less than two minutes:</p>
            
            <div className="feature-grid" style={{ marginTop: '28px' }}>
              <div className="feature-card" style={{ borderTop: '3px solid var(--primary)' }}>
                <div className="feature-icon" style={{ background: 'var(--primary-muted)', color: '#fff', fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>1</div>
                <h3>Download & Open</h3>
                <p>Download HeartEcho and open the app — no long, exhausting sign-up forms or invasive surveys required.</p>
              </div>
              <div className="feature-card" style={{ borderTop: '3px solid var(--primary)' }}>
                <div className="feature-icon" style={{ background: 'var(--primary-muted)', color: '#fff', fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>2</div>
                <h3>Express Yourself</h3>
                <p>Start talking, in your own words, about whatever's on your mind. Speak in English, Hindi, or Hinglish.</p>
              </div>
              <div className="feature-card" style={{ borderTop: '3px solid var(--primary)' }}>
                <div className="feature-icon" style={{ background: 'var(--primary-muted)', color: '#fff', fontSize: '20px', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>3</div>
                <h3>Build Context Over Time</h3>
                <p>HeartEcho responds, remembers, and checks in over time — the more you talk, the better it understands how to support you.</p>
              </div>
            </div>

            <p className="section-body" style={{ marginTop: '24px' }}>
              There's no "right way" to use it. Some people write a few lines before bed. Others have long conversations working through a hard day. Both are completely normal.
            </p>
          </section>

          {/* NORMALIZING LONELINESS */}
          <section className="compare-section">
            <div className="section-label">Honest Perspective</div>
            <h2 className="section-title">Is It Normal to Talk to an AI When You're Lonely?</h2>
            <p className="section-body" style={{ fontSize: '16px', lineHeight: '1.8' }}>
              <strong>Yes — and it's more common than most people admit out loud.</strong> Loneliness doesn't wait for the "right" kind of support to be available, and not everyone has someone to call at midnight.
            </p>
            <p className="section-body" style={{ fontSize: '16px', lineHeight: '1.8', marginTop: '14px' }}>
              An AI companion isn't a substitute for human connection, but it can be a genuine, judgment-free space to process what you're feeling until you're ready to talk to someone in your life, or simply because you want somewhere safe to put your thoughts.
            </p>
          </section>

          {/* PRICING SECTION */}
          <section className="compare-section">
            <div className="section-label">Transparent Plans</div>
            <h2 className="section-title">Simple, Affordable Pricing</h2>
            <p className="section-body">HeartEcho is free to start, so you can try a real conversation before deciding anything.</p>

            <div className="feature-grid" style={{ marginTop: '32px' }}>
              <div className="feature-card">
                <div className="feature-icon">✨</div>
                <h3>Free Plan</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '8px 0' }}>₹0</p>
                <p>Get started immediately. No credit card or payment details required.</p>
              </div>

              <div className="feature-card highlight" style={{ border: '2px solid var(--primary)' }}>
                <div className="feature-badge" style={{ background: 'var(--primary)', color: '#fff', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', textTransform: 'uppercase', width: 'fit-content', marginBottom: '8px' }}>Popular</div>
                <div className="feature-icon">💙</div>
                <h3>Monthly Companion</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '8px 0' }}>₹99 <span style={{ fontSize: '14px', color: 'var(--muted)' }}>/ month</span></p>
                <p>Daily companionship, long-term memory, and unlocked core features.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">🔥</div>
                <h3>Yearly Value</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '8px 0' }}>₹599 <span style={{ fontSize: '14px', color: 'var(--muted)' }}>/ year</span></p>
                <p>Best value for regular daily use. Save over 50% on monthly rates.</p>
              </div>

              <div className="feature-card">
                <div className="feature-icon">👑</div>
                <h3>Ultimate Tier</h3>
                <p style={{ fontSize: '24px', fontWeight: 'bold', color: '#fff', margin: '8px 0' }}>₹1,499 <span style={{ fontSize: '14px', color: 'var(--muted)' }}>/ year</span></p>
                <p>The complete experience with priority memory, voice notes, and custom personas.</p>
              </div>
            </div>
          </section>

          {/* CTA BLOCK */}
          <section className="compare-section" style={{ textAlign: 'center', background: 'var(--dark2)', padding: '56px 24px', borderRadius: '16px', margin: '40px 0' }}>
            <div className="section-label">Take the First Step</div>
            <h2 className="section-title">Start the Conversation</h2>
            <p className="section-body" style={{ margin: '0 auto 24px' }}>
              You don't need to have the right words ready. You don't need to know exactly what's wrong. Open HeartEcho and just start typing — that's the whole first step.
            </p>
            <Link href="/" className="btn-primary-compare" style={{ fontSize: '18px', padding: '16px 36px', display: 'inline-block' }}>
              Download HeartEcho Free →
            </Link>
          </section>

          {/* FAQ SECTION */}
          <section className="compare-section">
            <div className="section-label">Got Questions?</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div style={{ marginTop: '28px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
              {faqs.map((faq, index) => (
                <div key={index} style={{ background: 'var(--dark3)', border: '1px solid var(--border)', padding: '20px 24px', borderRadius: '12px' }}>
                  <h3 style={{ fontSize: '17px', color: '#fff', marginBottom: '8px' }}>{faq.name}</h3>
                  <p style={{ color: 'var(--muted)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>{faq.acceptedAnswer.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* INTERNAL LINKS CLUSTER */}
          <section className="compare-section" style={{ borderBottom: 'none' }}>
            <div className="section-label">Explore HeartEcho</div>
            <h3 style={{ fontSize: '18px', color: '#fff', marginBottom: '14px' }}>Related Pages & Resources</h3>
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link href="/ai-friend-india" style={{ color: 'var(--primary-light)', textDecoration: 'none', background: 'var(--dark3)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>AI Friend India</Link>
              <Link href="/ai-chat-hindi" style={{ color: 'var(--primary-light)', textDecoration: 'none', background: 'var(--dark3)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>AI Chat Hindi</Link>
              <Link href="/replika-alternative-india" style={{ color: 'var(--primary-light)', textDecoration: 'none', background: 'var(--dark3)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>Replika Alternative India</Link>
              <Link href="/pricing" style={{ color: 'var(--primary-light)', textDecoration: 'none', background: 'var(--dark3)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>Pricing Plans</Link>
              <Link href="/blog" style={{ color: 'var(--primary-light)', textDecoration: 'none', background: 'var(--dark3)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border)' }}>HeartEcho Blog</Link>
            </div>
          </section>

        </div>

        <Footer />
      </div>
    </>
  );
}
