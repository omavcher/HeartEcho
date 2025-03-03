import React from 'react';
import '../styles/Subscriptions.css';

const Subscriptions = () => {
  return (
    <div className="subscriptions-container">
      <div className="header">
        <span className="nav-item">Subscriptions</span>
        <span className="nav-item">Credits</span>
        <span className="nav-item premium">Premium+</span>
      </div>
      
      <div className="title">Subscriptions</div>
      <div className="subtitle">
        Upgrade Your Nectar Experience. Join 500,000+ users and take your journey to the next level
        by creating unlimited fantasies, characters, and images.
      </div>

      <div className="billing-options">
        <button className="billing-button yearly">Yearly<br /><span className="discount">50% off</span></button>
        <button className="billing-button monthly">Monthly</button>
      </div>

      <div className="note">
        Note that some crypto transactions may take time to reflect properly. Messaging quotas are for basic roleplay.
      </div>

      <div className="plans">
        <div className="plan free">
          <h2>FREE</h2>
          <p className="price">$0/mo</p>
          <ul>
            <li>10 Generations / Day</li>
            <li>4 customizations</li>
            <li>15 Messages / Day</li>
            <li>15 Messages in Memory</li>
            <li>1 Photo Message</li>
            <li>1 Customized Persona</li>
            <li>Create 1 Custom Girl</li>
          </ul>
          <button className="subscribe-button">Subscribe</button>
        </div>

        <div className="plan premium">
          <h2>PREMIUM</h2>
          <p className="price">$9.99/mo<br /><span className="save">Save $9/mo</span></p>
          <ul>
            <li>100 Generations / Day</li>
            <li>45+ additional customizations</li>
            <li>6000 Messages/Mo</li>
            <li>25 Messages in Memory</li>
            <li>Faster Messaging Time</li>
            <li>600 Photo Messages</li>
            <li>1 Customized Persona</li>
            <li>Create Unlimited Custom Fantasies with Girls</li>
          </ul>
          <button className="subscribe-button">Subscribe</button>
        </div>

        <div className="plan pro">
          <h2>PRO</h2>
          <p className="price">$19.99/mo<br /><span className="save">Save $10/mo</span></p>
          <ul>
            <li>Unlimited Generations</li>
            <li>95+ additional customizations</li>
            <li>HD Generations</li>
            <li>9000 Messages/Mo</li>
            <li>35 Messages in Memory</li>
            <li>Faster Messaging Time</li>
            <li>900 Photo Messages</li>
            <li>3 Customized Personas</li>
            <li>Create and Edit Unlimited Custom Girls</li>
          </ul>
          <button className="subscribe-button">Subscribe</button>
        </div>

        <div className="plan ultimate">
          <h2>ULTIMATE</h2>
          <p className="price">$34.99/mo<br /><span className="save">Save $15/mo</span></p>
          <span className="popular">MOST POPULAR</span>
          <ul>
            <li>Unlimited HD Generations</li>
            <li>Create Unlimited Photos of Custom Girls</li>
            <li>Best models & all 350+ customizations</li>
            <li>Landscape and portrait modes</li>
            <li>Unlimited messaging (incl photos)</li>
            <li>2500 Advanced Roleplay Credits</li>
            <li>45 Messages in Memory</li>
            <li>Fastest Messaging Time</li>
            <li>Video Generation</li>
            <li>10 Customized Personas</li>
            <li>Priority Customer Support</li>
            <li>Voice Chat</li>
          </ul>
          <button className="subscribe-button ultimate">Subscribe</button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;