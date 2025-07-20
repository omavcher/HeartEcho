// components/ThankYou.tsx
'use client';

import { useRouter } from 'next/navigation';
import '../styles/ThankYou.css';

const ThankYou = () => {
  const router = useRouter();

  const handleContinue = () => {
    router.push('/');
  };

  return (
    <div className="sxse3f-container">
      <div className="sxse3f-background"></div>
      <div className="sxse3f-content">
        <div className="sxse3f-card">
          <div className="sxse3f-checkmark-circle">
            <svg className="sxse3f-checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
              <circle className="sxse3f-checkmark-circle-bg" cx="26" cy="26" r="25" fill="none"/>
              <path className="sxse3f-checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
            </svg>
          </div>
          <h1 className="sxse3f-logo">HeartEcho</h1>
          <h2 className="sxse3f-title">Thank You for Subscribing!</h2>
          <p className="sxse3f-message">
            Your payment was successful. Enjoy unlimited AI companionship and exclusive features with your new plan!
          </p>
          <button className="sxse3f-continue-button" onClick={handleContinue}>
            Continue to HeartEcho
          </button>
        </div>
      </div>
      <div className="sxse3f-footer-note">
        <p>Need help? Contact us at <a href="mailto:omawcharbusiness123@gmail.com">omawcharbusiness123@gmail.com</a></p>
      </div>
    </div>
  );
};

export default ThankYou;