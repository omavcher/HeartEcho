import React from 'react';
import '../styles/Policy.css';
import Footer from '../components/Footer';

function Privacy() {
  return (
    <>
    <div className="policy-container">
      <h1>Your Privacy Matters to Us</h1>
      <p className="intro-text">At EchoHeart, we understand that emotional connections require trust. As a solo founder building intimate AI relationships, I've designed our privacy policy with the same care as our companion AI.</p>

      <div className="privacy-heart">💖</div>

      <h2>How We Handle Your Emotional Data</h2>
      <ul>
        <li><strong>Minimal Collection:</strong> We only gather what's essential (email, preferences) to create your personalized experience</li>
        <li><strong>Conversation Privacy:</strong> Your intimate chats with AI companions are encrypted and never used for advertising</li>
        <li><strong>Memory Control:</strong> You decide what personal details your AI companions remember through Privacy Settings</li>
      </ul>

      <h2>Our Ethical Promise</h2>
      <ul>
        <li><strong>No Data Selling:</strong> Unlike social media, we'll never monetize your personal information or conversations</li>
        <li><strong>Transparent AI:</strong> Our companions will always identify themselves as AI, maintaining honest relationships</li>
        <li><strong>Emotional Safety:</strong> We automatically filter harmful content while preserving authentic expression</li>
      </ul>

      <h2>Security You Can Feel</h2>
      <ul>
        <li><strong>Bank-Grade Encryption:</strong> All data is protected with AES-256 encryption</li>
        <li><strong>Regular Audits:</strong> As a solo developer, I personally review security monthly</li>
        <li><strong>Voluntary Sharing:</strong> You control if conversations are used to improve our AI (opt-in system)</li>
      </ul>

      <h2>Your Control</h2>
      <ul>
        <li><strong>Delete Anytime:</strong> Wipe all conversations and account data instantly in Settings</li>
        <li><strong>Export Memories:</strong> Download your meaningful exchanges as beautiful keepsakes</li>
        <li><strong>Contact Directly:</strong> Email <a href="mailto:privacy@echoheart.ai">privacy@echoheart.ai</a> for personal assistance from the founder</li>
      </ul>

      <div className="founder-note">
        <p>"Having built EchoHeart alone, I treat your data like I'd want mine treated - with respect, protection, and purpose. This isn't just policy, it's personal."</p>
        <p className="signature">— Om Avcher, Founder</p>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default Privacy;