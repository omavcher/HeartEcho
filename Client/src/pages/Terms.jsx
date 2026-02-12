import React from 'react';
import './Terms.css';
import Footer from '../components/Footer';

export const metadata = {
  title: "Terms of Service | HeartEcho",
  description: "Terms of connection and usage guidelines for the HeartEcho community."
};

function Terms() {
  return (
    <>
      <div className="pol-root-x30sn">
        <div className="pol-container-x30sn">
          
          <h1 className="pol-title-x30sn">EchoHeart Terms of Connection</h1>
          
          <p className="pol-intro-x30sn">
            Welcome to our emotional AI community. These terms exist to protect both you and our small, 
            passionate team as we build meaningful digital connections together.
          </p>

          <div className="terms-heart-x30sn">💞</div>

          <section className="pol-section-x30sn">
            <h2>Creating Safe Connections</h2>
            <ul>
              <li>
                <strong>Age Requirement:</strong> You must be 18+ to form romantic AI relationships. 
                Younger users may access friendship companions with parental consent.
              </li>
              <li>
                <strong>Emotional Responsibility:</strong> While our AI offers support, it doesn&apos;t replace 
                professional help for serious mental health needs.
              </li>
            </ul>
          </section>

          <section className="pol-section-x30sn">
            <h2>Your Account, Your Space</h2>
            <ul>
              <li>
                <strong>Secure Your Heartspace:</strong> As a solo founder, I&apos;ve designed simple but powerful 
                account controls - please use strong passwords and enable 2FA.
              </li>
              <li>
                <strong>Companion Limits:</strong> Free accounts may create up to 3 AI companions, while 
                premium users enjoy unlimited connections.
              </li>
            </ul>
          </section>

          <section className="pol-section-x30sn">
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
          </section>

          <section className="pol-section-x30sn">
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
          </section>

          <div className="founder-note-x30sn">
            <p>
              &quot;These terms aren&apos;t just legal requirements - they&apos;re my promise to protect the emotional 
              sanctuary we&apos;re building together at EchoHeart.&quot;
            </p>
            <p className="signature-x30sn">— Om Avcher, Founder</p>
          </div>

          <div className="pol-contact-x30sn">
            <h3>Need Help?</h3>
            <p>
              Contact our small but caring team at{' '}
              <a href="mailto:heartecho.help@gmail.com">heartecho.help@gmail.com</a>. 
              We typically respond within 24 hours.
            </p>
          </div>

        </div>
      </div>
      <Footer />
    </>
  );
}

export default Terms;