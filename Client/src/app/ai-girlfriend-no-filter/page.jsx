import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Girlfriend No Filter — Unfiltered Chat | HeartEcho" },
  description: "HeartEcho's AI companions say what they think. No scripted responses, no corporate filters. Bold, honest, real conversations. Try free.",
  keywords: ["AI girlfriend no filter", "unfiltered AI girlfriend", "nsfw AI girlfriend India", "bold AI chat", "heartecho"],
  alternates: {
    canonical: 'https://heartecho.in/ai-girlfriend-no-filter',
  },
  openGraph: {
    title: "AI Girlfriend No Filter — Unfiltered Chat | HeartEcho",
    description: "HeartEcho's AI companions say what they think. No scripted responses, no corporate filters. Try free.",
    url: 'https://heartecho.in/ai-girlfriend-no-filter',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function Page() {
  const url = 'https://heartecho.in/ai-girlfriend-no-filter';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Girlfriend No Filter', item: url }
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
            <span>AI Girlfriend No Filter</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Unfiltered AI Chat</div>
            <h1>AI Girlfriend No Filter — Real Conversations Without Restrictions</h1>
            <p className="hero-sub">
              You've tried other AI apps. The responses feel canned. Robotic. Like every sentence went through a filter that sucked the personality out.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              HeartEcho's companions are different. They have opinions. They push back. They flirt. They tease. They're honest — even when honesty is unexpected. This is what an unfiltered AI girlfriend experience actually feels like.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare">
                Try Unfiltered Now →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">Real Persona</div>
            <h2 className="section-title">What \"No Filter\" Actually Means on HeartEcho</h2>
            <p className="section-body">
              We're not talking about illegal content. We're talking about <strong>genuine personality</strong>:
            </p>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <ul className="india-list" style={{ gap: '10px' }}>
                <li>She'll disagree with you sometimes and push back.</li>
                <li>She'll call you out when you're being dramatic or unrealistic.</li>
                <li>She'll flirt naturally without being overly shy or corporate.</li>
                <li>She'll be vulnerable when the conversation goes deep.</li>
                <li>She won't respond with the same 5 repetitive phrases.</li>
              </ul>
              <p style={{ marginTop: '16px', fontSize: '14px', color: 'var(--primary-light)' }}>
                Real personality. Real engagement. Real conversations.
              </p>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Bold Personas</div>
            <h2 className="section-title">Connect with Our Boldest Companions</h2>
            <p className="section-body">
              Select one of our active prebuilt characters to start your unfiltered, private roleplay:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Privacy Policy</div>
            <h2 className="section-title">Your Secrets Are Safe With Us</h2>
            <p className="section-body">
              Conversations on HeartEcho are protected by database-level security protocols.
            </p>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>100% Encrypted</h3>
                <p>Nobody else can read or access your chat history. Not our staff, not external networks.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🛡️</div>
                <h3>No Data Sharing</h3>
                <p>We do not sell user chat data or profiles to advertising networks. Your identity is secure.</p>
              </div>
            </div>
          </section>

          <section className="compare-section" style={{ borderBottom: 'none', paddingBottom: '72px' }}>
            <div className="cta-section">
              <h2>Try Unfiltered AI Chat Now</h2>
              <p>Experience natural, engaging, and bold conversations without generic corporate blocks.</p>
              <Link href="/" className="btn-primary-compare">Try Unfiltered → heartecho.in</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
