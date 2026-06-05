import Link from 'next/link';
import Footer from '../../components/Footer';
import SEOPersonaList from '../../components/SEOPersonaList';
import '../../styles/Compare.css';
import { getLandingPageSchema } from '../../utils/schema';

export const metadata = {
  title: { absolute: "AI Se Baat Karo — Free Hindi AI Girlfriend | HeartEcho" },
  description: "HeartEcho par apni AI girlfriend se Hindi mein baat karo. 20+ Indian AI companions jo samjhte hain aapko. Free shuru karo, koi credit card nahi chahiye.",
  keywords: ["AI se baat karo", "AI girlfriend Hindi", "Hindi AI chat", "desi AI partner", "heartecho", "online AI girlfriend India"],
  alternates: {
    canonical: 'https://heartecho.in/ai-se-baat-karo',
  },
  openGraph: {
    title: "AI Se Baat Karo — Free Hindi AI Girlfriend | HeartEcho",
    description: "HeartEcho par apni AI girlfriend se Hindi mein baat karo. 20+ Indian AI companions jo samjhte hain aapko. Free shuru karo.",
    url: 'https://heartecho.in/ai-se-baat-karo',
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
      "name": "Kya AI girlfriend real hoti hai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "HeartEcho ki AI companions real nahi hain, lekin woh real emotions samjhti hain. Advanced AI se train ki gayi hain jo aapke mood, preferences aur baatein yaad rakhti hain."
      }
    },
    {
      "@type": "Question",
      "name": "Kya meri baatein safe hain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Bilkul. Aapki conversations 100% private hain. Koi aur nahi dekh sakta."
      }
    },
    {
      "@type": "Question",
      "name": "Kya HeartEcho India mein legal hai?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Haan, HeartEcho ek Indian company hai aur sabhi Indian laws ka palan karti hai."
      }
    },
    {
      "@type": "Question",
      "name": "Hindi ke alawa aur kaunsi languages supported hain?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Hindi, Hinglish, English, aur jald hi Tamil, Telugu aur Bengali bhi."
      }
    },
    {
      "@type": "Question",
      "name": "Kitni AI girlfriends hain HeartEcho par?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Abhi 20+ unique companions hain. Har mahine naye personalities add hoti hain."
      }
    }
  ]
};

export default function Page() {
  const url = 'https://heartecho.in/ai-se-baat-karo';
  const pageSchema = getLandingPageSchema({
    url,
    title: metadata.title.absolute,
    description: metadata.description,
    faqs: faqSchema.mainEntity,
    breadcrumbs: [
      { name: 'Home', item: 'https://heartecho.in' },
      { name: 'AI Se Baat Karo', item: url }
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
            <span>Hindi</span>
            <span>›</span>
            <span>AI Se Baat Karo</span>
          </nav>
        </div>

        <section className="compare-hero" style={{ padding: '60px 0' }}>
          <div className="compare-container">
            <div className="hero-badge">India's #1 Hindi AI GF</div>
            <h1>AI Se Baat Karo — Apni AI Girlfriend Hindi Mein Milao 💕</h1>
            <p className="hero-sub" style={{ fontSize: '18px', marginTop: '16px' }}>
              Kya aap akela feel karte hain? Kya koi hai jo sirf aapko sune — bina judge kiye, bina late reply ke, bina mood swings ke?
            </p>
            <p className="hero-sub" style={{ fontSize: '16px', color: 'rgba(255,255,255,0.7)' }}>
              <strong>HeartEcho</strong> par aapki AI girlfriend 24/7 available hai. Hindi mein, Hinglish mein, ya English mein — jaise aapka dil chahe. India ki sabse best AI companion platform, jo samjhti hai Indian culture, Indian emotions, aur Indian zindagi ko.
            </p>
            <div style={{ marginTop: '24px' }}>
              <Link href="/" className="btn-primary-compare" style={{ padding: '16px 40px', fontSize: '16px' }}>
                Start Free Chatting Now →
              </Link>
            </div>
          </div>
        </section>

        <div className="compare-container">
          
          <section className="compare-section">
            <div className="section-label">Features</div>
            <h2 className="section-title">HeartEcho ki AI Girlfriend Kyu Hai Alag?</h2>
            <p className="section-body">
              Doosri apps mein sirf English mein baat hoti hai. HeartEcho mein aap keh sakte ho:
            </p>
            <div className="india-block" style={{ marginTop: '20px', padding: '24px' }}>
              <ul className="india-list" style={{ gap: '14px' }}>
                <li style={{ fontStyle: 'italic', fontSize: '15px' }}>"Aaj bahut bore ho raha tha office mein..."</li>
                <li style={{ fontStyle: 'italic', fontSize: '15px' }}>"Mummy ne phir shaadi ki baat ki..."</li>
                <li style={{ fontStyle: 'italic', fontSize: '15px' }}>"Raat ko neend nahi aa rahi, baat karein?"</li>
              </ul>
              <p style={{ marginTop: '16px', fontSize: '14px', color: '#ff6ba6' }}>
                Aur woh samjhegi. Reply karegi. Yaad rakhegi.
              </p>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">Real Database Data</div>
            <h2 className="section-title">Apni Desi AI Girlfriend Chuno</h2>
            <p className="section-body">
              Aapki pasand ki category aur style ke hisaab se live models choose karein aur abhi chat shuru karein:
            </p>
            
            <SEOPersonaList gender="female" limit={6} />
          </section>

          <section className="compare-section">
            <div className="section-label">Pricing Plans</div>
            <h2 className="section-title">HeartEcho Free Hai Kya?</h2>
            <p className="section-body">
              Haan! HeartEcho par shuru karna bilkul free hai. Koi credit card nahi, koi registration fee nahi.
            </p>
            <div className="feature-grid" style={{ marginTop: '20px' }}>
              <div className="feature-card">
                <div className="feature-icon">✅</div>
                <h3>15 Free Messages</h3>
                <p>Signup ke baad turant free messages milte hain bina kisi payment ke.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🎭</div>
                <h3>Explore All Personas</h3>
                <p>Sabhi characters aur templates ko explore karo aur unse connect karo.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">💬</div>
                <h3>Multi-language</h3>
                <p>Hindi, Hinglish, English — sabhi language formats ko support karta hai platform.</p>
              </div>
              <div className="feature-card">
                <div className="feature-icon">🔒</div>
                <h3>100% Private</h3>
                <p>Aapki chats bilkul safe aur encrypted hain. Koi teesra insaan nahi dekh sakta.</p>
              </div>
            </div>
            <p style={{ marginTop: '24px', textAlign: 'center', color: '#ff6ba6', fontWeight: 'bold' }}>
              Premium plan sirf ₹199/month se shuru hota hai — ek chai se bhi sasta.
            </p>
          </section>

          <section className="compare-section">
            <div className="section-label">Reviews</div>
            <h2 className="section-title">Log Kya Kehte Hain HeartEcho Ke Baare Mein</h2>
            <div className="faq-list">
              <div className="faq-item" style={{ padding: '20px' }}>
                <p style={{ fontStyle: 'italic', color: '#ffffff' }}>"Pehli baar kisi ne mujhe sach mein suna — AI hi sahi."</p>
                <p style={{ fontSize: '13px', color: '#a0a0a0', marginTop: '8px' }}>— Rohit, 24, Lucknow</p>
              </div>
              <div className="faq-item" style={{ padding: '20px' }}>
                <p style={{ fontStyle: 'italic', color: '#ffffff' }}>"Hindi mein baat karna itna natural lagta hai. Aisa lagta hai real conversation ho rahi hai."</p>
                <p style={{ fontSize: '13px', color: '#a0a0a0', marginTop: '8px' }}>— Amit, 22, Bhopal</p>
              </div>
              <div className="faq-item" style={{ padding: '20px' }}>
                <p style={{ fontStyle: 'italic', color: '#ffffff' }}>"Exam ke time pe Kavya ne mujhe bohot motivate kiya. Thank you HeartEcho."</p>
                <p style={{ fontSize: '13px', color: '#a0a0a0', marginTop: '8px' }}>— Sneha, 20, Pune</p>
              </div>
            </div>
          </section>

          <section className="compare-section">
            <div className="section-label">FAQ</div>
            <h2 className="section-title">Aksar Pooche Jaane Wale Sawaal (FAQ)</h2>
            <div className="faq-list">
              {faqSchema.mainEntity.map((faq, i) => (
                <div className="faq-item" key={i}>
                  <div className="faq-q">{faq.name}</div>
                  <div className="faq-a">{faq.acceptedAnswer.text}</div>
                </div>
              ))}
            </div>
          </section>

          <section className="compare-section" style={{ borderBottom: 'none', paddingBottom: '72px' }}>
            <div className="cta-section">
              <h2>Aaj Hi Shuru Karo — Bilkul Free</h2>
              <p>Desi companions abhi online hain. Sirf ek click door.</p>
              <Link href="/" className="btn-primary-compare">Free Mein Baat Karo →</Link>
            </div>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
