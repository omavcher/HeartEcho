import React from 'react';
import '../styles/Policy.css';

function Products() {
  return (
    <div className="policy-container">
      <h1>Our Products and Services</h1>
      <p>Explore our range of AI-powered services designed to provide meaningful companionship and personalized interactions.</p>

      <h2>AI Chatbot Conversations</h2>
      <ul>
        <li>Engage in personalized, responsive chats with our advanced AI models, tailored to your preferences.</li>
        <li>Experience seamless conversations powered by cutting-edge technology.</li>
      </ul>

      <h2>Subscription Plans</h2>
      <ul>
        <li><strong>Free Plan:</strong> Enjoy a 7-day trial with 20 messages per day—no credit card required.</li>
        <li><strong>Monthly Plan:</strong> ₹40/month for unlimited chats and custom AI creation.</li>
        <li><strong>Yearly Plan:</strong> ₹400/year (save ₹80, equivalent to 2 free months).</li>
      </ul>

      <h2>Why Choose HeartEcho?</h2>
      <ul>
        <li>Accessible, affordable companionship at your fingertips.</li>
        <li>Continuous updates to enhance AI performance and user experience.</li>
      </ul>

      <p>Get started today and discover the joy of intelligent, engaging conversations with HeartEcho!</p>
    </div>
  );
}

export default Products;