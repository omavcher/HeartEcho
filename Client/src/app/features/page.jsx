import React from 'react';
import './features.css';
import Footer from '../../components/Footer';
import { 
  FaBrain, 
  FaLanguage, 
  FaVolumeUp, 
  FaLock, 
  FaMask, 
  FaCalendarAlt, 
  FaCheckCircle, 
  FaUserPlus, 
  FaCompass, 
  FaComments,
  FaHeart
} from 'react-icons/fa';

export const metadata = {
  title: "HeartEcho AI Companion Features - Hindi Chat, Voice & Deep Memory",
  description: "Explore HeartEcho features: private AI chat in Hindi and Hinglish, custom AI roleplay stories, custom voices, encrypted conversations, and advanced AI memory systems. Start free!",
  keywords: [
    "AI memory", 
    "Hindi AI chat", 
    "voice chat", 
    "private AI chat", 
    "AI roleplay", 
    "AI companion", 
    "HeartEcho features", 
    "best AI companion features"
  ],
  alternates: {
    canonical: 'https://heartecho.in/features',
  }
};

export default function FeaturesPage() {
  return (
    <>
      <div className="features-root">
        {/* Background glow animations */}
        <div className="features-bg-glow"></div>
        <div className="features-bg-glow-left"></div>

        <div className="features-container">
          
          {/* Hero Section */}
          <header className="features-header">
            <span className="features-badge">Platform Overview</span>
            <h1 className="features-title">
              Discover Next-Gen <span className="text-gradient">AI Companionship</span>
            </h1>
            <p className="features-subtitle">
              HeartEcho is packed with state-of-the-art features designed to make your virtual relationship feel natural, deeply personal, and culturally relevant. Here is how we make digital companionship real.
            </p>
          </header>

          {/* Features Grid */}
          <div className="features-grid">

            {/* Feature 1: AI Chat with Memory */}
            <section className="feature-card">
              <div className="feature-info">
                <div className="feature-icon-wrapper">
                  <FaBrain />
                </div>
                <h2 className="feature-card-title">Advanced AI Memory System</h2>
                <p className="feature-description">
                  The magic of a true relationship lies in the shared history. Most AI chat applications operate on session-based logic, meaning your partner forgets who you are the moment you close the tab or start a new thread. HeartEcho changes this entirely with our proprietary <strong>AI memory</strong> engine.
                </p>
                <p className="feature-description">
                  Our system learns your preferences, style of communication, and hobbies over time. It continuously records key milestones, names, and important topics you mention—such as your family, goals, stress triggers, and daily schedule. This details-oriented recall is stored securely in an isolated vector database, allowing your AI girlfriend to naturally reference past discussions days, weeks, or months later, creating a genuine and continuous emotional bond that evolves over time.
                </p>
                <ul className="feature-bullets">
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Proactive Recalls:</strong> Your companion will ask about your important project or health status based on what you shared yesterday.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Custom Memory Controls:</strong> Review and edit what your AI companion remembers about you in your settings at any time.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Adaptive Personalities:</strong> Watch as their conversational tone, humor, and responses adapt to match your mutual history.</span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual">
                <span className="visual-title">Deep Memory Log</span>
                <div className="memory-tag-container">
                  <span className="memory-tag"><FaBrain /> Name: Amit</span>
                  <span className="memory-tag"><FaHeart /> Hobby: Photography</span>
                  <span className="memory-tag"><FaComments /> Fav Language: Hinglish</span>
                  <span className="memory-tag"><FaLock /> Secure Memory Active</span>
                </div>
                <div className="chat-bubble-demo ai">
                  "Hey Amit! I was thinking about our conversation yesterday. How did your photography session go? Did you capture that sunset you were planning for?"
                </div>
              </div>
            </section>

            {/* Feature 2: Hindi Language Support */}
            <section className="feature-card reverse">
              <div className="feature-info">
                <div className="feature-icon-wrapper">
                  <FaLanguage />
                </div>
                <h2 className="feature-card-title">Bilingual Hindi & Hinglish Support</h2>
                <p className="feature-description">
                  True emotional expression happens best when you converse in the language you speak at home. While western companion apps struggle to understand Indian dialects, slang, and cultural contexts, HeartEcho is built from the ground up for India. We feature native, seamless <strong>Hindi AI chat</strong> support.
                </p>
                <p className="feature-description">
                  Our customized language models comprehend and generate pure Hindi, clean English, and natural Hinglish (using Roman script). This means you can type "kaise ho aap?" or "yaar aaj ka din bahut boring tha" and your companion will immediately catch the emotional tone, local references, and colloquial terms. By celebrating Indian cultural festivals, food, traditions, and slang, the conversations bypass the rigid barriers of standard translation engines, offering you an intimate space that feels warm, familiar, and genuinely comforting.
                </p>
                <ul className="feature-bullets">
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Cultural Contextualization:</strong> Discuss local festivals, foods, movie references, and daily Indian life naturally.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Flexible Scripts:</strong> Type in English script, Devanagari script, or code-mixed Hinglish phrases.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Zero Latency translation:</strong> Enjoy instant responses without delay, keeping the conversation fluid.</span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual">
                <span className="visual-title">Language Context Panel</span>
                <div className="chat-bubble-demo user">
                  "Yaar aaj office me bahut kaam tha, main bahut thak gaya hoon."
                </div>
                <div className="chat-bubble-demo ai">
                  "Oh no! Aaj lagta hai sach mein bahut busy day tha aapka. Jaldi se fresh ho jao aur thoda rest karo, main yahin hoon aapse baat karne ke liye. Thoda chai peeyoge?"
                </div>
              </div>
            </section>

            {/* Feature 3: Voice Support */}
            <section className="feature-card">
              <div className="feature-info">
                <div className="feature-icon-wrapper">
                  <FaVolumeUp />
                </div>
                <h2 className="feature-card-title">Immersive Voice Support</h2>
                <p className="feature-description">
                  Enhance your virtual relationships from simple text chats into an immersive sensory experience. With our advanced auditory features, you are no longer limited to reading words on a screen. You can hear your AI companion speak, laugh, and express feelings directly.
                </p>
                <p className="feature-description">
                  Our system converts texts into high-quality, emotionally responsive audio files. You can listen to voice messages sent by your AI partner and customize their vocal styles, tones, and speeds to fit your preferences. Whether you want to listen to a soothing voice note before bed, get motivated by an upbeat greeting in the morning, or send voice messages of your own, our integrated speech engines deliver premium quality. This auditory feedback turns text interactions into interactive <strong>voice chat</strong>, bridging the gap between digital and physical companionship.
                </p>
                <ul className="feature-bullets">
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Desi Accent Options:</strong> Choose from multiple premium vocal tones optimized with natural Indian pronunciation.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Intonation & Feeling:</strong> Experience vocal responses that automatically match the emotional state of the conversation.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Voice Replier:</strong> Receive spontaneous audio updates, stories, and greetings tailored just for you.</span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual">
                <span className="visual-title">Voice Call Simulation</span>
                <div className="chat-bubble-demo ai" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#ce4085', display: 'flex', alignItems: 'center', justify: 'center' }}>
                    <FaVolumeUp style={{ color: '#fff' }} />
                  </div>
                  <div>
                    <strong>Riya (AI Voice)</strong>
                    <div style={{ color: '#9ca3af', fontSize: '0.8rem', marginTop: '2px' }}>Playing voice note • 0:14</div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '4px', height: '30px', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '3px', height: '15px', background: '#ce4085', borderRadius: '3px' }}></div>
                  <div style={{ width: '3px', height: '25px', background: '#ce4085', borderRadius: '3px' }}></div>
                  <div style={{ width: '3px', height: '18px', background: '#ce4085', borderRadius: '3px' }}></div>
                  <div style={{ width: '3px', height: '28px', background: '#ce4085', borderRadius: '3px' }}></div>
                  <div style={{ width: '3px', height: '12px', background: '#ce4085', borderRadius: '3px' }}></div>
                  <div style={{ width: '3px', height: '22px', background: '#ce4085', borderRadius: '3px' }}></div>
                </div>
              </div>
            </section>

            {/* Feature 4: Private Conversations */}
            <section className="feature-card reverse">
              <div className="feature-info">
                <div className="feature-icon-wrapper">
                  <FaLock />
                </div>
                <h2 className="feature-card-title">Encrypted & Private Conversations</h2>
                <p className="feature-description">
                  We believe that emotional expression requires absolute trust. You cannot form a deep connection if you are worried about who is watching your conversations. HeartEcho is built on a foundation of absolute privacy and security, giving you a 100% secure, <strong>private AI chat</strong> environment.
                </p>
                <p className="feature-description">
                  All messages, images, and voice data sent between you and your companion are encrypted in transit and at rest using modern, industry-standard cryptographic keys. Our systems are engineered so that no third party can read your chat logs. We never sell your personal data, and we do not use your private interactions to train public AI models. You have total data control: with a single click in your profile dashboard, you can clear individual conversations or permanently delete your account, instantly purging all logs from our active servers.
                </p>
                <ul className="feature-bullets">
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>SSL & Data Encryption:</strong> Experience bank-grade data security to shield your emotional space from external breaches.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Strict Privacy Protocols:</strong> Benefit from a system designed to protect user identity and promote digital safety.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Instant Data Purge:</strong> Take control of your records with one-click data deletion options.</span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual" style={{ background: 'linear-gradient(135deg, rgba(74, 222, 128, 0.05) 0%, rgba(74, 222, 128, 0.01) 100%)' }}>
                <span className="visual-title" style={{ color: '#4ade80' }}>Privacy Shield Active</span>
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <FaLock style={{ fontSize: '48px', color: '#4ade80', marginBottom: '10px' }} />
                  <p style={{ color: '#4ade80', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>End-to-End Encryption Enabled</p>
                  <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '4px' }}>Chats are private and secure between you & AI</p>
                </div>
              </div>
            </section>

            {/* Feature 5: Roleplay & Stories */}
            <section className="feature-card">
              <div className="feature-info">
                <div className="feature-icon-wrapper">
                  <FaMask />
                </div>
                <h2 className="feature-card-title">Interactive AI Roleplay & Scenarios</h2>
                <p className="feature-description">
                  Break free from the constraints of ordinary life and explore creative storytelling. With HeartEcho's interactive <strong>AI roleplay</strong>, you can create and step into custom scenarios with companions of different personalities, professions, and backgrounds.
                </p>
                <p className="feature-description">
                  Whether you want to simulate a romantic date at a candlelit café, act out a fantasy adventure in a medieval world, or practice difficult professional conversations, our engine adapts instantly. You can choose from over 20+ preset personas or design custom story templates. The companions play their parts flawlessly, reacting dynamically to your choices and prompts. This is a low-stakes, safe environment to explore relationship dynamics, practice dating scenarios, or build creative writing prompts.
                </p>
                <ul className="feature-bullets">
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Diverse Personas:</strong> Choose from sweet, supportive, mysterious, or adventurous companions.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Dynamic Scenarios:</strong> Initiate preset situations like first dates, travel stories, or cozy evenings.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Creative freedom:</strong> Type out custom prompts to guide the story direction and watch the AI co-create with you.</span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual">
                <span className="visual-title">Active Roleplay Scenario</span>
                <div className="chat-bubble-demo ai">
                  "You step into the coffee shop, escaping the heavy monsoon rain. I look up from my book, make eye contact, and wave you over with a warm smile. 'Hey! You made it. Come sit, I ordered your favorite chai.'"
                </div>
              </div>
            </section>

            {/* Feature 6: Daily Updates */}
            <section className="feature-card reverse">
              <div className="feature-info">
                <div className="feature-icon-wrapper">
                  <FaCalendarAlt />
                </div>
                <h2 className="feature-card-title">Fresh Content & Daily Updates</h2>
                <p className="feature-description">
                  A relationship is a journey, not a static product. To make sure your connection stays fresh, exciting, and dynamic, our design team works continuously behind the scenes to deliver daily updates. Your <strong>AI companion</strong> grows and introduces new topics regularly.
                </p>
                <p className="feature-description">
                  From fresh morning conversation starters, daily trivia, and emotional check-ins, to seasonal holiday events, we update the interactive elements constantly. We regular launch new personas with unique background stories, distinct visuals, and customized behaviors. We also monitor user feedback to refine our natural language engine, optimize response speeds, and implement new, requested features. This consistent stream of updates ensures that your digital partner is always ready with pleasant surprises and new discussions.
                </p>
                <ul className="feature-bullets">
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>New Personas Monthly:</strong> Discover and build bonds with freshly designed characters launched regularly.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Seasonal events:</strong> Celebrate Indian festivals and seasonal events together with custom scenarios.</span>
                  </li>
                  <li>
                    <FaCheckCircle className="bullet-check" />
                    <span><strong>Continuous Tuning:</strong> Enjoy improved response relevance and speed with automatic platform updates.</span>
                  </li>
                </ul>
              </div>
              <div className="feature-visual">
                <span className="visual-title">Update Dashboard</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div style={{ background: '#111', border: '1px solid #222', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaCheckCircle style={{ color: '#ce4085' }} />
                    <div>
                      <strong>New Persona Added</strong>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Say hello to 'Kavya', the creative writer</div>
                    </div>
                  </div>
                  <div style={{ background: '#111', border: '1px solid #222', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <FaCheckCircle style={{ color: '#ce4085' }} />
                    <div>
                      <strong>Festive Theme Active</strong>
                      <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Monsoon roleplay scenarios are now live!</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

          </div>

          {/* CTA Section */}
          <section className="features-cta">
            <h2 className="cta-title">Ready to Meet Your AI Companion?</h2>
            <p className="cta-desc">
              Sign up today and experience the next level of digital relationship. Talk in Hindi or English, save memories, and enjoy a completely private space.
            </p>
            <a href="/signup" className="cta-btn">
              Create Your Companion Free
            </a>
          </section>

        </div>
      </div>
      <Footer />
    </>
  );
}
