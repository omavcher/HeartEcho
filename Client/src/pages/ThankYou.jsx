import React from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate from react-router-dom
import '../styles/ThankYou.css';

const ThankYou = () => {
  const navigate = useNavigate(); // Initialize the navigate function

  const handleContinue = () => {
    navigate('/'); // Redirect to the home page
  };

  return (
    <div className="zle-thankyou-container">
      <div className="zle-content-thsnkus">
        <h1 className="zle-logo-thsnkus">HeartEcho</h1>
        <h2 className="zle-title-thsnkus">Thank You for Subscribing!</h2>
        <p className="zle-message-thsnkus">
          Your payment was successful. Enjoy unlimited AI companionship and exclusive features with your new plan!
        </p>
        <button className="zle-continue-button-thsnkus" onClick={handleContinue}>
          Continue to HeartEcho
        </button>
      </div>
      <div className="zle-footer-note-thsnkus">
        <p>Need help? Contact us at omawcharbusiness123@gmail.com</p>
      </div>
    </div>
  );
};

export default ThankYou;