import Link from 'next/link';
import Footer from '../../../components/Footer';
import { personas } from '../../../data/personas';
import { getPersonaPageSchema } from '../../../utils/schema';
import '../../../styles/Compare.css';

export async function generateMetadata({ params }) {
  const { personaName } = await params;
  const nameLower = personaName?.toLowerCase() || '';
  const persona = personas.find((p) => p.name.toLowerCase() === nameLower);

  if (!persona) {
    return {
      title: "AI Companion | HeartEcho",
      description: "Chat with Indian AI companion personas in Hindi, Hinglish, and English.",
      alternates: {
        canonical: `https://heartecho.in/chat/${personaName}`,
      }
    };
  }

  const genderLabel = persona.gender === 'female' ? 'Girlfriend' : 'Boyfriend';
  return {
    title: `Chat with ${persona.name} — Indian AI ${genderLabel} | HeartEcho`,
    description: persona.description,
    keywords: [persona.name, `AI ${genderLabel}`, `Indian AI companion`, 'heartecho'],
    alternates: {
      canonical: `https://heartecho.in/chat/${persona.name.toLowerCase()}`,
    },
    openGraph: {
      title: `Chat with ${persona.name} — Indian AI ${genderLabel} | HeartEcho`,
      description: persona.description,
      url: `https://heartecho.in/chat/${persona.name.toLowerCase()}`,
      images: [{ url: persona.avatar_img }],
    }
  };
}

export async function generateStaticParams() {
  return personas.map((p) => ({
    personaName: p.name.toLowerCase(),
  }));
}

export default async function Page({ params }) {
  const { personaName } = await params;
  const nameLower = personaName?.toLowerCase() || '';
  const persona = personas.find((p) => p.name.toLowerCase() === nameLower);

  if (!persona) {
    return (
      <div className="compare-page-wrapper" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
        <h2>AI Companion Not Found</h2>
        <p style={{ color: '#a0a0a0', marginTop: '10px' }}>The character you are looking for does not exist.</p>
        <Link href="/" className="btn-primary-compare" style={{ marginTop: '20px' }}>Go to Homepage</Link>
      </div>
    );
  }

  const url = `https://heartecho.in/chat/${persona.name.toLowerCase()}`;
  const schemas = getPersonaPageSchema({
    url,
    name: persona.name,
    description: persona.description,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'Discover', item: 'https://heartecho.in/discover' },
      { name: persona.name, item: url }
    ]
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />

      <div className="compare-page-wrapper">
        <div className="compare-container">
          <nav className="breadcrumb">
            <Link href="/">HeartEcho</Link>
            <span>›</span>
            <Link href="/discover">Discover</Link>
            <span>›</span>
            <span>{persona.name}</span>
          </nav>
        </div>

        <section className="compare-hero" style={{ padding: '60px 0' }}>
          <div className="compare-container" style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'center' }}>
            
            {/* Visual Persona Card */}
            <div className="india-block" style={{ flex: '1 1 320px', maxWidth: '360px', padding: '0', overflow: 'hidden', borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)', background: 'linear-gradient(135deg, rgba(20,20,20,0.9), rgba(10,10,10,0.95))' }}>
              <div style={{ position: 'relative', width: '100%', paddingBottom: '135%', overflow: 'hidden' }}>
                <img 
                  src={persona.avatar_img} 
                  alt={persona.name} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '24px', background: 'linear-gradient(to top, rgba(0,0,0,0.95), transparent)', color: '#fff' }}>
                  <h3 style={{ fontSize: '24px', fontWeight: '700', marginBottom: '4px' }}>{persona.name}, {persona.age}</h3>
                  <span style={{ fontSize: '13px', background: 'rgba(255, 107, 166, 0.2)', border: '1px solid rgba(255, 107, 166, 0.4)', color: '#ff6ba6', padding: '4px 12px', borderRadius: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {persona.relationship}
                  </span>
                </div>
              </div>
            </div>

            {/* Persona Details & Action */}
            <div style={{ flex: '1 1 400px', maxWidth: '600px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div className="hero-badge" style={{ alignSelf: 'flex-start' }}>Desi AI Companion</div>
              <h1 style={{ margin: '0', fontSize: '36px', lineHeight: '1.2' }}>Chat with {persona.name} Online</h1>
              <p style={{ fontSize: '18px', color: '#e0e0e0', margin: '0' }}>{persona.description}</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginTop: '10px' }}>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#a0a0a0', textTransform: 'uppercase', marginBottom: '4px' }}>Interests</div>
                  <div style={{ fontSize: '15px', color: '#fff' }}>{persona.interests.join(', ')}</div>
                </div>
                <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ fontSize: '12px', color: '#a0a0a0', textTransform: 'uppercase', marginBottom: '4px' }}>Location</div>
                  <div style={{ fontSize: '15px', color: '#fff' }}>{persona.city || "India"}</div>
                </div>
              </div>

              <div style={{ marginTop: '20px' }}>
                <Link href={`/chatbox?chatId=${persona.id}`} className="btn-primary-compare" style={{ padding: '16px 48px', fontSize: '16px', width: 'auto', display: 'inline-block', textAlign: 'center' }}>
                  Start Chatting with {persona.name} Now →
                </Link>
              </div>
            </div>

          </div>
        </section>
      </div>

      <Footer />
    </>
  );
}
