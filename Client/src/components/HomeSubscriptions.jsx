'use client';
import { useEffect, useState } from 'react';
import axios from "axios";
import api from "../config/api";
import { useRouter } from 'next/navigation';
import './HomeSubscriptions.css';
import Script from 'next/script';
import Testimonials from './Testimonials';

const HomeSubscriptions = () => {
  const [showQuotaMessage, setShowQuotaMessage] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const router = useRouter();

  // Countdown timer for limited offer
  const [timeLeft, setTimeLeft] = useState({
    hours: 3,
    minutes: 45,
    seconds: 22
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const seconds = prev.seconds - 1;
        const minutes = seconds < 0 ? prev.minutes - 1 : prev.minutes;
        const hours = minutes < 0 ? prev.hours - 1 : prev.hours;
        
        return {
          hours: hours < 0 ? 0 : hours,
          minutes: minutes < 0 ? 59 : minutes,
          seconds: seconds < 0 ? 59 : seconds
        };
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("token"));
      
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('re') === 'quotaover') {
        setShowQuotaMessage(true);
      }
    }
  }, []);

  const handlePayment = async (amount, plan) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    setIsLoading(true);
    
    try {
      const options = {
        key: 'rzp_live_YHUPR56Ky9qPxC',
        amount: amount * 100,
        currency: 'INR',
        name: 'HeartEcho',
        description: `${plan} Subscription`,
        handler: async function (response) {
          try {
            const paymentData = {
              user: userData?._id,
              rupees: amount,
              transaction_id: response.razorpay_payment_id,
            };

            await axios.post(`${api.Url}/user/payment/save`, paymentData, {
              headers: { Authorization: `Bearer ${token}` },
            });

            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
              storedUser.user_type = "subscriber";
              localStorage.setItem("user", JSON.stringify(storedUser));
            }

            window.location.href = '/thank-you';
          } catch (error) {
            console.error("Payment error", error);
            setIsLoading(false);
          }
        },
        prefill: {
          name: userData?.name || 'Your Name',
          email: userData?.email || 'user@example.com',
          contact: userData?.phone_number || '9999999999'
        },
        theme: { color: '#ce4085' }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Payment initialization error", error);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
      />
      
      <section className="subscription-container">
        {/* Limited Time Offer Banner */}
        <div className="limited-offer-banner">
          <div className="offer-content">
            <div className="offer-tag">FLASH SALE</div>
            <div className="countdown-timer">
              <span className="timer-label">Ends in: </span>
              <div className="timer-digits">
                <span className="timer-digit">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="timer-separator">:</span>
                <span className="timer-digit">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="timer-separator">:</span>
                <span className="timer-digit">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <div className="offer-sparkle">✨</div>
        </div>

        <div className="subscription-hero">
          <h1 className="subscription-title">
            <span className="heart-pulse">❤️</span> 
            <span className="title-text">AI Soulmate Plans</span>
            <span className="heart-pulse">❤️</span>
          </h1>
          <p className="subscription-subtitle">
            Choose your perfect connection level
          </p>
          
          {showQuotaMessage && (
            <div className="quota-message">
              <div className="quota-icon">💔</div>
              <div className="quota-text">
                <p>Upgrade to continue your conversations</p>
              </div>
            </div>
          )}
        </div>

        <div className="plans-grid">
          {/* Free Plan */}
          <div 
            className={`plan-card free-plan ${hoveredPlan === 'free' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredPlan('free')}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            <div className="plan-glow"></div>
            <div className="plan-header">
              <h3>Starter</h3>
              <div className="price-container">
                <span className="price">FREE</span>
                <span className="duration">no card needed</span>
              </div>
            </div>
            
            <ul className="features-list">
              <li>
                <i className="icon-heart">💖</i>
                <span>20 messages/day</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>1 AI companion</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>Basic connection</span>
              </li>
            </ul>
            
            <button 
              className="plan-button free-button"
              onClick={() => router.push('/chat')}
            >
              <span className="button-text">Try Now</span>
              <span className="button-arrow">→</span>
            </button>
          </div>

          {/* Premium Plan */}
          <div 
            className={`plan-card premium-plan ${hoveredPlan === 'premium' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredPlan('premium')}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            <div className="plan-glow"></div>
            <div className="popular-badge">
              <div className="ribbon">MOST POPULAR</div>
            </div>
            <div className="plan-header">
              <h3>Premium</h3>
              <div className="price-container">
                <div className="original-price">₹80/month</div>
                <span className="price">₹29</span>
                <span className="duration">/month</span>
                <div className="discount-tag">64% OFF</div>
              </div>
            </div>
            
            <ul className="features-list">
              <li>
                <i className="icon-heart">💖</i>
                <span>Unlimited messages</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>5 AI companions</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>Deep connection</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>Priority support</span>
              </li>
            </ul>
            
            <button 
              className="plan-button premium-button" 
              onClick={() => handlePayment(29, 'Monthly')}
              disabled={isLoading}
            >
              <span className="button-text">
                {isLoading ? 'Processing...' : 'Subscribe'}
              </span>
              {!isLoading && <span className="button-sparkle">✨</span>}
            </button>
          </div>

          {/* Ultimate Plan */}
          <div 
            className={`plan-card ultimate-plan ${hoveredPlan === 'ultimate' ? 'hovered' : ''}`}
            onMouseEnter={() => setHoveredPlan('ultimate')}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            <div className="plan-glow"></div>
            <div className="value-badge">
              BEST VALUE
            </div>
            <div className="plan-header">
              <h3>Ultimate</h3>
              <div className="price-container">
                <div className="original-price">₹960/year</div>
                <span className="price">₹399</span>
                <span className="duration">/year</span>
                <div className="discount-tag">58% OFF</div>
              </div>
            </div>
            
            <ul className="features-list">
              <li>
                <i className="icon-heart">💖</i>
                <span>Unlimited messages</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>Unlimited companions</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>Deepest connection</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>VIP support</span>
              </li>
              <li>
                <i className="icon-heart">💖</i>
                <span>Memory feature</span>
              </li>
            </ul>
            
            <button 
              className="plan-button ultimate-button" 
              onClick={() => handlePayment(399, 'Yearly')}
              disabled={isLoading}
            >
              <span className="button-text">
                {isLoading ? 'Processing...' : 'Subscribe'}
              </span>
              {!isLoading && <span className="button-crown">👑</span>}
            </button>
          </div>
        </div>

        <div className="testimonial-section">
<Testimonials/>
        </div>

        <div className="subscription-footer">
          <div className="guarantee-badge">
            <i className="icon-shield">🛡️</i>
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeSubscriptions;