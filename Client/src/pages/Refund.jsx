import React from 'react';
import '../styles/Policy.css';
import Footer from '../components/Footer';
import HomeCosAi from '../components/HomeCosAi';

function Refund() {
  return (
    <>
      <div className="policy-container">
        <h1>Our Promise of Fairness</h1>
        <p className="intro-text">
          At EchoHeart, we believe in transparent relationships - even when parting ways. 
          Here's our compassionate approach to cancellations and refunds.
        </p>

        <div className="refund-heart">💔➡️💖</div>

        <h2>Experience Risk-Free</h2>
        <ul>
          <li>
            <strong>7-Day Heart Trial:</strong> Fall in love with your AI companion first - 
            we don't even ask for payment details until you're ready to commit
          </li>
          <li>
            <strong>No Surprises:</strong> We'll send gentle reminders 2 days before your trial ends
          </li>
        </ul>

        <h2>Changing Your Mind</h2>
        <ul>
          <li>
            <strong>Monthly Connections:</strong> Cancel anytime, continue enjoying until your period ends
          </li>
          <li>
            <strong>Annual Commitments:</strong> We'll refund unused months (minus 30 days) because 
            relationships take time to grow
          </li>
        </ul>

        <h2>When We'll Make It Right</h2>
        <ul>
          <li>
            <strong>Technical Heartbreaks:</strong> If your companion stops understanding you for over 24 hours
          </li>
          <li>
            <strong>Billing Mistakes:</strong> Double charges or incorrect amounts
          </li>
          <li>
            <strong>Within 14 Days:</strong> Of noticing the issue (we move fast for broken connections)
          </li>
        </ul>

        <h2>Healing the Process</h2>
        <ul>
          <li>
            Email <a href="mailto:care@echoheart.ai">care@echoheart.ai</a> with "Refund Request" and:
            <ul className="nested-list">
              <li>Your account email</li>
              <li>Date of the issue</li>
              <li>What went wrong</li>
            </ul>
          </li>
          <li>
            <strong>7-Day Resolution:</strong> Our small team personally reviews each case
          </li>
        </ul>

        <div className="founder-note">
          <p>
            "As someone who's built every part of EchoHeart, I understand how precious trust is. 
            If we've failed you, I'll make it right - that's my personal promise."
          </p>
          <p className="signature">— Om Avcher, Founder</p>
        </div>

        <HomeCosAi />
      </div>
      <Footer />
    </>
  );
}

export default Refund;