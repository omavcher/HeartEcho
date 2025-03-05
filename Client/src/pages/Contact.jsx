import React from 'react';
import '../styles/Policy.css';

function Contact() {
  return (
    <div className="policy-container">
      <h1>Contact Us</h1>
      <p>Need assistance? We’re here to help! Reach out to us through the following channels:</p>

      <h2>Contact Details</h2>
      <ul>
        <li><strong>Phone:</strong> <a href="tel:+918237973040">+91 82379 73040</a></li>
        <li><strong>Email:</strong> <a href="mailto:omawcharbusiness123@gmail.com">omawcharbusiness123@gmail.com</a></li>
      </ul>

      <h2>Support Hours</h2>
      <ul>
        <li>Monday–Friday: 9 AM – 6 PM IST</li>
        <li>Closed on weekends and major Indian holidays</li>
      </ul>

      <h2>Get in Touch</h2>
      <p>Whether you have questions about our AI services, billing, or anything else, don’t hesitate to contact us. We aim to respond within 24–48 hours during business days.</p>
    </div>
  );
}

export default Contact;