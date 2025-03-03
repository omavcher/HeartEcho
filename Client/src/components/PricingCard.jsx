import React from 'react';
import '../styles/PricingCard.css';

const PricingCard = () => {
  return (
    <div className="pricing-container">
      <div className="card basic">
        <div className="card-icon">🟡</div>
        <h2>Basic</h2>
        <p className="subtitle">Best for personal use</p>
        <div className="price">$240 /Per Month</div>
        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>✓ No fee ATM withdrawal</li>
            <li>✓ Personalised cards</li>
            <li>✓ Exclusive Metal card</li>
            <li>✓ Discounted transfers</li>
          </ul>
        </div>
        <button className="upgrade-btn">Upgrade</button>
        <p className="contact">Contact Sale</p>
      </div>

      <div className="card enterprise">
        <div className="card-icon">🌱</div>
        <div className="best-offer">★ BEST OFFER</div>
        <h2>Enterprise</h2>
        <p className="subtitle">For large teams & Corporations</p>
        <div className="price">$390 /Per Month</div>
        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>✓ No fee ATM withdrawal</li>
            <li>✓ Personalised cards</li>
            <li>✓ Cashback on card payments</li>
            <li>✓ Exclusive Metal card</li>
            <li>✓ Discounted transfers</li>
            <li>✓ Cashback on card payments</li>
          </ul>
        </div>
        <button className="upgrade-btn">Upgrade</button>
        <p className="contact">Contact Sale</p>
      </div>

      <div className="card business">
        <div className="card-icon">🟩</div>
        <h2>Business</h2>
        <p className="subtitle">Best for Business owners</p>
        <div className="price">$640 /Per Month</div>
        <div className="features">
          <h3>Features</h3>
          <ul>
            <li>✓ No fee ATM withdrawal</li>
            <li>✓ Personalised cards</li>
            <li>✓ Exclusive Metal card</li>
            <li>✓ Discounted transfers</li>
            <li>✓ Cashback on card payments</li>
            <li>✓ Discounted international transfers</li>
            <li>✓ Free card delivery</li>
          </ul>
        </div>
        <button className="upgrade-btn">Upgrade</button>
        <p className="contact">Contact Sale</p>
      </div>
    </div>
  );
};

export default PricingCard;