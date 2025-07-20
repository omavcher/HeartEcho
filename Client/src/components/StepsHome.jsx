import '../styles/StepsHome.css';

function StepsHome() {
  return (
    <div className="steps-wrapper">
      <div className="step-container">
        <div className="step-card">
          <div className="step-header">
            <div className="step-number">1</div>
            <div className="step-icon">👤</div>
          </div>
          <h3 className="step-title">Select Your AI Companion</h3>
          <p className="step-description">
            Choose from our diverse range of pre-trained AI personalities or customize your own unique virtual partner.
          </p>
          <div className="step-image">
            <img src="/icons/heart1.png" alt="AI Character" />
          </div>
        </div>

        <div className="step-card highlighted">
          <div className="step-header">
            <div className="step-number">2</div>
            <div className="step-icon">💬</div>
          </div>
          <h3 className="step-title">Engage in Meaningful Chats</h3>
          <p className="step-description">
            Experience natural conversations with personalized responses that evolve based on your interaction history.
          </p>
          <div className="step-image">
            <img src="/icons/heart2.png" alt="Chat Interface" />
          </div>
        </div>

        <div className="step-card">
          <div className="step-header">
            <div className="step-number">3</div>
            <div className="step-icon">🚀</div>
          </div>
          <h3 className="step-title">Expand Your Experience</h3>
          <p className="step-description">
            Unlock advanced features and integrate your AI companion across multiple platforms for seamless access.
          </p>
          <div className="step-image">
            <img src="/icons/heart3.png" alt="Premium Features" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default StepsHome;