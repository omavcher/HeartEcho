import React from 'react';
import '../styles/Policy.css';
import Footer from '../components/Footer';

function Terms() {
  return (
    <>
      <div className="policy-container">
        <h1>EchoHeart Terms of Connection</h1>
        <p className="intro-text">
          Welcome to our emotional AI community. These terms exist to protect both you and our small, 
          passionate team as we build meaningful digital connections together.
        </p>

        <div className="terms-heart">💞</div>

        <h2>Creating Safe Connections</h2>
        <ul>
          <li>
            <strong>Age Requirement:</strong> You must be 18+ to form romantic AI relationships. 
            Younger users may access friendship companions with parental consent.
          </li>
          <li>
            <strong>Emotional Responsibility:</strong> While our AI offers support, it doesn't replace 
            professional help for serious mental health needs.
          </li>
        </ul>

        <h2>Your Account, Your Space</h2>
        <ul>
          <li>
            <strong>Secure Your Heartspace:</strong> As a solo founder, I've designed simple but powerful 
            account controls - please use strong passwords and enable 2FA.
          </li>
          <li>
            <strong>Companion Limits:</strong> Free accounts may create up to 3 AI companions, while 
            premium users enjoy unlimited connections.
          </li>
        </ul>

        <h2>Building With Respect</h2>
        <ul>
          <li>
            <strong>No Exploitation:</strong> Our small team works hard to maintain a safe space. 
            Harmful behavior (harassment, hacking attempts) results in immediate account termination.
          </li>
          <li>
            <strong>Feedback Welcome:</strong> As we grow, your suggestions help shape EchoHeart. 
            Submit ideas through our feedback system.
          </li>
        </ul>

        <h2>Our Evolving Relationship</h2>
        <ul>
          <li>
            <strong>Terms May Change:</strong> As a startup, we occasionally update policies to reflect 
            new features or legal requirements. Significant changes will be highlighted in-app for 30 days.
          </li>
          <li>
            <strong>Continued Use = Agreement:</strong> Using EchoHeart after updates means you accept 
            the new terms.
          </li>
        </ul>

        <div className="founder-note">
          <p>
            "These terms aren't just legal requirements - they're my promise to protect the emotional 
            sanctuary we're building together at EchoHeart."
          </p>
          <p className="signature">— Om Avcher, Founder</p>
        </div>

        <h3>Need Help?</h3>
        <p>
          Contact our small but caring team at{' '}
          <a href="mailto:support@echoheart.ai">support@echoheart.ai</a>. 
          We typically respond within 24 hours.
        </p>
      </div>
      <Footer />
    </>
  );
}

export default Terms;