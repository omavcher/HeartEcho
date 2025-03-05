import React from 'react';
import '../styles/Policy.css';
import Footer from '../components/Footer';
import HomeCosAi from '../components/HomeCosAi';

function Refund() {
  return (
    <div className="policy-container">
      <h1>Cancellation and Refund Policy</h1>
      <p>At HeartEcho, we strive to provide a seamless experience. Here’s how our cancellation and refund process works:</p>

      <h2>Trial Period</h2>
      <ul>
        <li><strong>7-Day Free Trial:</strong> Cancel within the trial period to avoid charges. No payment details required upfront.</li>
      </ul>

      <h2>Subscription Cancellations</h2>
      <ul>
        <li><strong>Monthly & Yearly Plans:</strong> Cancellations take effect at the end of your current billing cycle. Partial months or unused periods are non-refundable.</li>
      </ul>

      <h2>Refund Eligibility</h2>
      <ul>
        <li>Refunds are granted only for billing errors (e.g., duplicate charges) or significant service malfunctions confirmed by our team.</li>
        <li>Refunds are processed within 7 working days of approval.</li>
      </ul>

      <h2>How to Request a Refund</h2>
      <ul>
        <li>Contact our support team at <a href="mailto:omawcharbusiness123@gmail.com">omawcharbusiness123@gmail.com</a> or call <strong>+91 82379 73040</strong>.</li>
        <li>Submit your request within 7 days of the issue for prompt resolution.</li>
      </ul>

      <p>We’re here to assist you! Reach out with any questions, and we’ll resolve your concerns as quickly as possible.</p>

      <Footer/>
    </div>
  );
}

export default Refund;