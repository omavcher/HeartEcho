import React from 'react';
import '../styles/Policy.css';
import Footer from '../components/Footer';

function Contact() {
  return (
    <>
    <div className="policy-container">
      <h1>Connect With EchoHeart</h1>
      <p>As a solo founder, I personally value every connection. Reach out directly for support, partnership opportunities, or just to share your EchoHeart experience.</p>

      <div className="contact-heart">
        <span>💖</span>
      </div>

      <h2>Direct Contact</h2>
      <ul>
        <li><strong>Email:</strong> <a href="mailto:hello@echoheart.ai">hello@echoheart.ai</a> (fastest response)</li>
        <li><strong>Twitter/X:</strong> <a href="https://twitter.com/echoheartai" target="_blank" rel="noopener noreferrer">@echoheartai</a></li>
      </ul>

      <h2>Response Times</h2>
      <ul>
        <li>Typically within 24 hours for urgent matters</li>
        <li>Within 3 business days for general inquiries</li>
        <li>Weekend responses may be delayed as I recharge</li>
      </ul>

      <h2>Your Voice Matters</h2>
      <p>Having built EchoHeart entirely alone, I especially appreciate user feedback. Whether it's a bug report, feature idea, or personal story about how EchoHeart has helped you - I read every message personally.</p>

      <div className="founder-note">
        <p>"Building connections is why EchoHeart exists. Don't hesitate to reach out - your message might inspire our next breakthrough in emotional AI."</p>
        <p className="signature">— Om Avcher, Founder</p>
      </div>
    </div>
    <Footer/>
    </>
  );
}

export default Contact;