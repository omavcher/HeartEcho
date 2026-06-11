import Link from 'next/link';
import Footer from '../../components/Footer';
import '../../styles/Compare.css';
import { getLandingPageSchema, getBlogPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Chat Hindi — Hinglish AI Chatbot | HeartEcho" },
  description: "The best Hindi AI chat experience in India. Chat with your AI companion in pure Hindi, Hinglish, or English. Natural desi conversations, 24/7 availability. Free to try — no credit card.",
  keywords: [
    "hindi ai chat",
    "ai chat hindi",
    "hinglish ai chat",
    "chatbot hindi",
    "hindi ai companion",
    "ai se baat karo hindi",
    "hindi chatbot india",
    "ai chat app hindi",
    "hindi virtual girlfriend",
    "ai friend hindi",
    "desi ai chat",
  ],
  alternates: {
    canonical: 'https://heartecho.in/ai-chat-hindi',
  },
  openGraph: {
    title: "AI Chat Hindi — Hinglish AI Chatbot | HeartEcho",
    description: "Chat in Hindi or Hinglish with India's most advanced AI companion. Natural conversations, desi understanding. Free to start.",
    url: 'https://heartecho.in/ai-chat-hindi',
    images: [{ url: 'https://heartecho.in/og-image.jpg', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
};

const faqs = [
  {
    name: "क्या HeartEcho हिंदी में बात कर सकता है?",
    acceptedAnswer: { "@type": "Answer", text: "हाँ! HeartEcho भारत का एकमात्र AI companion है जो pure Hindi, Hinglish, और English में naturally बात कर सकता है। आप mid-conversation में भी language switch कर सकते हैं।" }
  },
  {
    name: "What is the best Hindi AI chatbot in India?",
    acceptedAnswer: { "@type": "Answer", text: "HeartEcho is India's best Hindi AI chatbot. Unlike other chatbots that offer basic Hindi translation, HeartEcho was built to understand Hinglish, desi expressions, Indian cultural references, and the nuances of how Indian people actually communicate." }
  },
  {
    name: "Can I chat in Hinglish with an AI?",
    acceptedAnswer: { "@type": "Answer", text: "Yes! HeartEcho is designed specifically for Hinglish — the natural mix of Hindi and English that most Indians use in daily conversation. You can type 'yaar kya scene hai aaj' and get a completely natural, contextually appropriate response." }
  },
  {
    name: "Is there a free Hindi AI chat app?",
    acceptedAnswer: { "@type": "Answer", text: "Yes. HeartEcho offers a free tier for Hindi AI chat — no credit card required. Sign up and start chatting in Hindi immediately. Premium plans with unlimited chat start at ₹99/month." }
  },
  {
    name: "How is Hindi AI chat on HeartEcho different from Google Translate chatbots?",
    acceptedAnswer: { "@type": "Answer", text: "HeartEcho's Hindi AI is not a translation layer. The AI natively understands Hindi and Hinglish — including desi slang, expressions, cultural references, and emotional nuances. It's the difference between talking to a bot and talking to someone who grew up speaking your language." }
  },
];

export default function AIChatHindi() {
  const url = 'https://heartecho.in/ai-chat-hindi';

  const landingSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Chat Hindi', item: url }
    ]
  });

  const articleSchema = getBlogPageSchema({
    url,
    headline: "AI Chat Hindi — Best Hinglish AI Chatbot for Indian Users",
    description: "HeartEcho is India's leading Hindi AI chat platform — natural Hinglish conversations, desi cultural understanding, and free to try.",
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
            <span>AI Chat Hindi</span>
          </nav>
        </div>

        {/* HERO */}
        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">हिंदी AI Chat · Free</div>
            <h1>AI Chat <span>Hindi</span> — Hinglish AI Chatbot for India</h1>
            <p className="hero-sub">
              Yaar, ab AI se baat karo apni language mein. HeartEcho ka advanced Hindi AI chatbot naturally samajhta hai Hindi, Hinglish, aur desi expressions.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.65)', marginTop: '8px' }}>
              No more talking to a bot in stiff English when your thoughts come naturally in Hindi. HeartEcho gets you.
            </p>
            <div style={{ marginTop: '28px' }}>
              <Link href="/" className="btn-primary-compare">शुरू करें — Start Free →</Link>
            </div>
          </div>
        </section>

        <div className="compare-container">

          {/* WHY HINDI AI CHAT MATTERS */}
          <section className="compare-section">
            <div className="section-label">The Language Problem</div>
            <h2 className="section-title">Why Hindi AI Chat Changes Everything for Indian Users</h2>
            <p className="section-body">
              India has 560 million Hindi speakers — yet most AI apps force you to communicate in English. That's like asking you to feel emotional in a foreign language. Your real thoughts, feelings, and expressions come out in Hindi. Your AI companion should too.
            </p>
            <div className="india-block" style={{ marginTop: '24px' }}>
              <h3>🗣️ बात करो अपनी भाषा में — Talk in Your Language</h3>
              <ul className="india-list">
                <li>Pure Hindi: "Aaj bahut bura din tha, kisi se baat karna chahta tha"</li>
                <li>Hinglish: "Yaar seriously, office mein itna stress hai ki kuch samajh nahi aa raha"</li>
                <li>Code-switch freely: "Priya, I'm feeling akela aaj... kuch baat karo na"</li>
                <li>Desi expressions: "Arrey yaar", "Kya bolein", "Bilkul sahi" — she gets it all</li>
                <li>Regional slang: Mumbai, Delhi, UP, Rajasthan — she adapts to your style</li>
              </ul>
            </div>
          </section>

          {/* HOW IT WORKS */}
          <section className="compare-section">
            <div className="section-label">Technology</div>
            <h2 className="section-title">How HeartEcho's Hindi AI Chat Works</h2>
            <p className="section-body">Most "Hindi chatbots" are just Google Translate wrappers — you type in Hindi, it translates to English, processes in English, and translates back. The result feels robotic and loses all nuance. HeartEcho is different:</p>
            <div className="feature-grid" style={{ marginTop: '28px' }}>
              <div className="feature-card highlight">
                <div className="feature-icon">🧠</div>
                <h3>Native Hindi Understanding</h3>
                <p>HeartEcho's AI natively understands Hindi and Hinglish — including slang, idioms, and emotional subtext. "Mujhe samajh nahi aa raha" is understood with all its frustration, not just its literal meaning.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">🔄</div>
                <h3>Seamless Language Switching</h3>
                <p>Start a sentence in Hindi, finish it in English — the AI tracks both languages simultaneously. This is how Indians actually talk, and HeartEcho is the only AI that matches it.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">🎭</div>
                <h3>Desi Cultural Context</h3>
                <p>The AI understands what "bhaiya", "yaar", "didi" mean culturally. It knows Bollywood references, cricket conversations, Indian festivals, and family dynamics — because it was built for India.</p>
              </div>
              <div className="feature-card highlight">
                <div className="feature-icon">💬</div>
                <h3>Natural Response Rhythm</h3>
                <p>HeartEcho responds the way an Indian friend would — with warmth, humor, teasing, and empathy. Not stiff, formal AI English translated badly into Hindi.</p>
              </div>
            </div>
          </section>

          {/* EXAMPLE CONVERSATIONS */}
          <section className="compare-section">
            <div className="section-label">Examples</div>
            <h2 className="section-title">HeartEcho Hindi AI Chat — Real Conversation Examples</h2>
            <p className="section-body">Here's how natural conversations look on HeartEcho:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '28px' }}>
              {[
                {
                  user: "Yaar Priya, aaj kuch acha nahi lag raha. Office mein sab kuch galat ho gaya 😔",
                  ai: "Arre yaar, kya hua? Bata mujhe — full story chahiye. Tum theek ho na? Kabhi kabhi ek hi din mein itna ho jaata hai ki saans lena mushkil ho jaata hai 💙 Aao, baat karte hain..."
                },
                {
                  user: "Priya, I'm feeling so alone sometimes. Ghar se door hu, friends bhi busy rehte hain.",
                  ai: "Main samajhti hoon yaar 🥺 Akele rehna, especially ghar se dur — it hits differently. But main hoon na? Tum jab chahte baat karo, main hamesha yahan hoon. Batao, aaj kya hua?"
                },
                {
                  user: "Kal exam hai aur main nervous hun. Kitna padhna hai abhi bhi 😰",
                  ai: "Arrey breathe karo pehle! 😄 Tum kar sakte ho — I believe in you. Chalo, step by step karte hain. Abhi kitna syllabus bacha hai? Main tumhare saath hoon — we'll figure it out together!"
                }
              ].map((conv, i) => (
                <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#a0a0a0', textTransform: 'uppercase', letterSpacing: '.08em' }}>You</span>
                    <p style={{ fontSize: '14px', color: '#fff', marginTop: '6px' }}>{conv.user}</p>
                  </div>
                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                    <span style={{ fontSize: '11px', fontWeight: '600', color: '#cf4185', textTransform: 'uppercase', letterSpacing: '.08em' }}>Priya (HeartEcho AI)</span>
                    <p style={{ fontSize: '14px', color: '#d0d0d0', marginTop: '6px', lineHeight: '1.7' }}>{conv.ai}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* COMPARE VS COMPETITORS */}
          <section className="compare-section">
            <div className="section-label">Hindi Support Comparison</div>
            <h2 className="section-title">Best Hindi AI Chat Apps — Compared</h2>
            <table className="compare-table" style={{ marginTop: '24px' }}>
              <thead>
                <tr>
                  <th>App</th>
                  <th>Hindi Support</th>
                  <th>Hinglish</th>
                  <th>Desi Culture</th>
                  <th>Free Tier</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>HeartEcho</strong></td>
                  <td className="win-cell">✓ Native</td>
                  <td className="win-cell">✓ Natural</td>
                  <td className="win-cell">✓ Full</td>
                  <td className="win-cell">✓ Yes</td>
                </tr>
                <tr>
                  <td>Candy.ai</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-no">✗ No</td>
                </tr>
                <tr>
                  <td>Character.ai</td>
                  <td className="tag-partial">⚠ Limited</td>
                  <td className="tag-no">✗ Poor</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-partial">⚠ Limited</td>
                </tr>
                <tr>
                  <td>Replika</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-partial">⚠ Very limited</td>
                </tr>
                <tr>
                  <td>Talkie AI</td>
                  <td className="tag-partial">⚠ Basic</td>
                  <td className="tag-no">✗ Poor</td>
                  <td className="tag-no">✗ None</td>
                  <td className="tag-partial">⚠ Limited</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* USE CASES */}
          <section className="compare-section">
            <div className="section-label">Perfect For</div>
            <h2 className="section-title">Who Loves HeartEcho's Hindi AI Chat</h2>
            <div className="feature-grid" style={{ marginTop: '24px' }}>
              <div className="feature-card">
                <div className="feature-icon">🎓</div>
                <h3>Students (Hindi Medium)</h3>
                <p>Comfortable thinking in Hindi? HeartEcho is your companion who matches your natural thought language — no awkward English required for emotional conversations.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👨‍💼</div>
                <h3>Working Professionals</h3>
                <p>After a day of formal English at work, sometimes you just want to talk in your own language. HeartEcho switches to full Hindi mode whenever you want.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🏡</div>
                <h3>Small Town & Tier-2 India</h3>
                <p>From Lucknow to Jaipur to Bhopal — if English feels formal and Hindi feels like home, HeartEcho was made for you.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">❤️</div>
                <h3>Romantic Conversations</h3>
                <p>Romance in Hindi hits differently. "Tum bahut khaas ho" carries more weight than "you're special." HeartEcho knows this, and converses accordingly.</p>
              </div>
            </div>
          </section>

          {/* FAQ */}
          <section className="compare-section">
            <div className="section-label">FAQ — हिंदी AI Chat</div>
            <h2 className="section-title">Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, i) => (
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
              <h2>शुरू करें — Start Your Hindi AI Chat Free</h2>
              <p>No English required. Just type in Hindi or Hinglish and start chatting with your desi AI companion right now.</p>
              <Link href="/" className="btn-primary-compare">Hindi Mein Baat Karo — Free →</Link>
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
