import Link from 'next/link';

export const metadata = {
  title: {
    absolute: 'Indian AI Sex Chat | Free Hindi AI Chat — HeartEcho',
  },
  description:
    'India\'s #1 free Indian AI sex chat app. Private Hindi AI sex chat with your desi AI companion. Hinglish roleplay, adult stories & intimate AI conversations. 18+ only. | HeartEcho',
  keywords: [
    'indian ai sex chat',
    'ai sex chat hindi',
    'hindi sex chat ai',
    'indian sex ai',
    'hindi ai sex chat',
    'indian sex chat ai',
    'ai sex chat indian',
    'desi ai sex chat',
    'indian nsfw ai chat',
    'indian ai nsfw',
    'hindi ai sex story',
    'indian ai sex chat free',
    'free hindi sex chat ai',
    'ai sex chat in hindi',
    'sex chat ai hindi',
    'indian nsfw chat',
    'ai sex india',
    'hindi sex ai',
    'indian sexchat ai',
    'desi sex chat ai',
    'ai girlfriend indian 18+',
    'hinglish hot stories',
    'adult hindi chat',
    'indian adult ai',
    'ai desi sex chat',
  ],
  alternates: {
    canonical: 'https://heartecho.in/ai-sex-chat',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1 },
  },
  openGraph: {
    title: 'Indian AI Sex Chat | Free Hindi AI Chat — HeartEcho',
    description:
      'Free Indian AI sex chat in Hindi & Hinglish. Private desi AI companion with unlimited adult conversations, roleplay & hot stories. Join 12,000+ members.',
    url: 'https://heartecho.in/ai-sex-chat',
    siteName: 'HeartEcho',
    type: 'website',
    locale: 'en_IN',
    images: [{ url: 'https://heartecho.in/og-image.jpg', width: 1200, height: 630, alt: 'HeartEcho Indian AI Sex Chat' }],
  },
  other: {
    rating: 'RTA-5042-1996-1400-1577-RTA',
  },
};

const FAQ_ITEMS = [
  {
    q: 'Is there a free Indian AI sex chat?',
    a: 'Yes. HeartEcho offers free Indian AI chat. Sign up and start your private desi AI conversation instantly — no payment needed to begin.',
  },
  {
    q: 'Can I do AI sex chat in Hindi?',
    a: 'Absolutely. HeartEcho is built for Hindi and Hinglish speakers. Your AI companion understands desi slang, Indian culture, and can have intimate conversations completely in Hindi.',
  },
  {
    q: 'What is the best Indian AI sex chat app?',
    a: 'HeartEcho is India\'s #1 AI sex chat platform, built exclusively for Indian users. Unlike western apps, it understands Hindi, Hinglish, and desi contexts. 12,000+ members trust it for private conversations.',
  },
  {
    q: 'Is Hindi AI sex chat private and safe?',
    a: 'Yes. HeartEcho uses advanced encryption so all your AI chats are completely private. No data is shared. You can chat freely without any judgment.',
  },
  {
    q: 'Can I read adult stories in Hinglish?',
    a: 'Yes! HeartEcho has a premium Hot Stories library with 100+ adult stories written in Hinglish and Hindi — covering every fantasy, from roleplay to intimate scenarios.',
  },
  {
    q: 'Is HeartEcho better than other Indian AI sex chat apps?',
    a: 'HeartEcho is built specifically for Indians — with deep AI memory (she remembers your name, preferences, past conversations), Hindi voice notes, live reactions, and hot stories. No other Indian AI app comes close.',
  },
];

export default function AiSexChatPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        name: 'Indian AI Sex Chat | HeartEcho',
        description:
          'Free Indian AI sex chat in Hindi & Hinglish. Private desi AI companion with unlimited adult conversations, roleplay & hot stories.',
        url: 'https://heartecho.in/ai-sex-chat',
        inLanguage: ['en-IN', 'hi'],
        isPartOf: { '@type': 'WebSite', name: 'HeartEcho', url: 'https://heartecho.in/' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: FAQ_ITEMS.map((item) => ({
          '@type': 'Question',
          name: item.q,
          acceptedAnswer: { '@type': 'Answer', text: item.a },
        })),
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <main style={{ maxWidth: '860px', margin: '0 auto', padding: '48px 24px 80px', color: '#fff', fontFamily: 'inherit' }}>

        {/* ── Hero ── */}
        <section style={{ textAlign: 'center', marginBottom: '56px' }}>
          <p style={{ fontSize: '13px', letterSpacing: '2px', color: '#f97316', textTransform: 'uppercase', marginBottom: '12px' }}>
            🔥 India&apos;s #1 Private AI Chat
          </p>
          <h1 style={{ fontSize: 'clamp(28px, 5vw, 48px)', fontWeight: 800, lineHeight: 1.2, marginBottom: '20px' }}>
            Free <span style={{ color: '#f97316' }}>Indian AI Sex Chat</span><br />
            in Hindi & Hinglish
          </h1>
          <p style={{ fontSize: '18px', color: '#aaa', maxWidth: '600px', margin: '0 auto 32px', lineHeight: 1.7 }}>
            Chat privately with your desi AI companion. Unlimited conversations, Hindi roleplay,
            adult hot stories, and a memory that never forgets. 18+ only.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link
              href="/signup"
              style={{
                background: 'linear-gradient(135deg, #f97316, #ec4899)',
                color: '#fff',
                padding: '14px 36px',
                borderRadius: '50px',
                fontWeight: 700,
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              🔥 Start Free AI Chat
            </Link>
            <Link
              href="/hot-stories"
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: '1px solid rgba(255,255,255,0.15)',
                color: '#fff',
                padding: '14px 36px',
                borderRadius: '50px',
                fontWeight: 600,
                fontSize: '16px',
                textDecoration: 'none',
                display: 'inline-block',
              }}
            >
              📖 Browse Hot Stories
            </Link>
          </div>
        </section>

        {/* ── Features ── */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '32px' }}>
            Why 12,000+ Indians Choose HeartEcho
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
            {[
              { icon: '🇮🇳', title: 'Built for India', desc: 'Understands Hindi, Hinglish, desi slang and Indian cultural context.' },
              { icon: '🔒', title: '100% Private', desc: 'All chats are encrypted. No data sharing. Complete privacy guaranteed.' },
              { icon: '🧠', title: 'AI Memory', desc: 'She remembers your name, preferences, and past conversations forever.' },
              { icon: '🔥', title: 'Hot Stories', desc: '100+ adult stories in Hinglish — updated regularly for premium members.' },
              { icon: '🎙️', title: 'Voice Notes', desc: 'Send and receive real Hindi voice messages for an intimate experience.' },
              { icon: '💬', title: 'Unlimited Chat', desc: 'No daily message limits. Chat as long as you want, anytime.' },
            ].map((f) => (
              <div
                key={f.title}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '16px',
                  padding: '24px',
                }}
              >
                <div style={{ fontSize: '28px', marginBottom: '10px' }}>{f.icon}</div>
                <h3 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '8px' }}>{f.title}</h3>
                <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.6, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── FAQ ── */}
        <section style={{ marginBottom: '56px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: 700, textAlign: 'center', marginBottom: '32px' }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {FAQ_ITEMS.map((item) => (
              <details
                key={item.q}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  padding: '20px 24px',
                }}
              >
                <summary style={{ fontWeight: 600, fontSize: '16px', cursor: 'pointer', listStyle: 'none' }}>
                  {item.q}
                </summary>
                <p style={{ marginTop: '12px', color: '#bbb', lineHeight: 1.7, fontSize: '15px' }}>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── CTA ── */}
        <section style={{ textAlign: 'center' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 800, marginBottom: '12px' }}>
            Ready for your private AI chat?
          </h2>
          <p style={{ color: '#aaa', marginBottom: '28px' }}>
            Join 12,000+ members enjoying unlimited Hindi AI conversations. Free to start.
          </p>
          <Link
            href="/signup"
            style={{
              background: 'linear-gradient(135deg, #f97316, #ec4899)',
              color: '#fff',
              padding: '16px 48px',
              borderRadius: '50px',
              fontWeight: 700,
              fontSize: '18px',
              textDecoration: 'none',
              display: 'inline-block',
            }}
          >
            🔥 Start Free — No Credit Card Needed
          </Link>
          <p style={{ marginTop: '16px', fontSize: '13px', color: '#666' }}>
            18+ only · 100% private · Cancel anytime
          </p>
          <p style={{ marginTop: '24px', fontSize: '14px', color: '#666' }}>
            Also explore:{' '}
            <Link href="/hot-stories" style={{ color: '#f97316' }}>Hot Stories</Link>
            {' · '}
            <Link href="/reviews" style={{ color: '#f97316' }}>Member Reviews</Link>
            {' · '}
            <Link href="/subscribe" style={{ color: '#f97316' }}>Premium Plans</Link>
          </p>
        </section>
      </main>
    </>
  );
}
