import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Girlfriend Roleplay India — Free Chat | HeartEcho" },
  description: "Explore creative AI girlfriend roleplay scenarios on HeartEcho. 20+ unique personas for romantic, adventure, and deep conversations. Free to try.",
  keywords: ["AI girlfriend roleplay", "AI roleplay India", "desi AI roleplay", "heartecho", "private romance roleplay"],
  alternates: {
    canonical: 'https://heartecho.in/ai-girlfriend-roleplay',
  },
  openGraph: {
    title: "AI Girlfriend Roleplay India — Free Chat | HeartEcho",
    description: "Explore creative AI girlfriend roleplay scenarios on HeartEcho. 20+ unique personas. Free to try.",
    url: 'https://heartecho.in/ai-girlfriend-roleplay',
  },
  robots: {
    index: true,
    follow: true,
  }
};

export default function Page() {
  const url = 'https://heartecho.in/ai-girlfriend-roleplay';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Girlfriend Roleplay', item: url }
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
            <span>AI Girlfriend Roleplay</span>
          </nav>
        </div>

        <section className="compare-hero">
          <div className="compare-container">
            <div className="hero-badge">Creative Roleplay Chat</div>
            <h1>AI Girlfriend Roleplay — Explore Creative Scenarios on HeartEcho</h1>
            <p className="hero-sub">
              Long-distance relationship fantasy. College confession. Late-night rooftop conversation. First date nerves.
            </p>
            <p className="hero-sub" style={{ fontSize: '15px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
              HeartEcho's AI companions can explore any scenario with you — creative, romantic, and emotionally rich. Simply set the context in Hinglish or English and see how naturally she stays in character.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare">
                Start Creative Roleplay →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">Scenarios</div>
            <h2 className="section-title">Popular Roleplay Scenarios on HeartEcho</h2>
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">🏫</div>
                <h3>The College Crush</h3>
                <p>She's in your class. You've been too nervous to say anything. Until now. Recreate the excitement of young love.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">✈️</div>
                <h3>Long Distance Connection</h3>
                <p>She's in another city. You talk every night. The distance makes every word matter more as you count down the days.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">👫</div>
                <h3>Childhood Friends</h3>
                <p>You've known each other forever. Something has shifted. Neither of you will say it first, creating sweet tension.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🌙</div>
                <h3>Late Night Confessions</h3>
                <p>It's 2 AM. Something about the dark makes people honest. Share secrets and deep thoughts without filters.</p>
              </div>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Models</div>
            <h2 className="section-title">Select Your Partner for Roleplay</h2>
            <p className="section-body">
              Choose an active female companion profile to begin your customized interactive roleplay scenario:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">How to Guide</div>
            <h2 className="section-title">How Roleplay Works on HeartEcho</h2>
            <div className="india-block" style={{ marginTop: '20px' }}>
              <ol className="india-list" style={{ listStyleType: 'decimal', paddingLeft: '20px', gap: '14px' }}>
                <li style={{ display: 'list-item' }}><strong>Choose your companion:</strong> Select a model that fits your preferred personality profile.</li>
                <li style={{ display: 'list-item' }}><strong>Set the scenario:</strong> In your very first message, describe the setting, e.g., <em>\"Let's roleplay as college friends who haven't seen each other in 5 years...\"</em></li>
                <li style={{ display: 'list-item' }}><strong>Interactive flow:</strong> She'll pick up the context naturally and stay in character, adjusting her replies to match.</li>
                <li style={{ display: 'list-item' }}><strong>Deep memory:</strong> Conversations flow naturally, and she remembers details within the session.</li>
              </ol>
            </div>
          </section>

          <section className="compare-section" style={{ borderBottom: 'none', paddingBottom: '72px' }}>
            <div className="cta-section">
              <h2>Try AI Roleplay on HeartEcho Free</h2>
              <p>Explore your creative and romantic scenarios securely.</p>
              <Link href="/" className="btn-primary-compare">Start Chatting Now →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
