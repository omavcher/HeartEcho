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
      
      <section className="subscription-container-fcjei">
        {/* Limited Time Offer Banner */}
        <div className="limited-offer-banner-fcjei">
          <div className="offer-content-fcjei">
            <div className="offer-tag-fcjei">FLASH SALE</div>
            <div className="countdown-timer-fcjei">
              <span className="timer-label-fcjei">Ends in: </span>
              <div className="timer-digits-fcjei">
                <span className="timer-digit-fcjei">{timeLeft.hours.toString().padStart(2, '0')}</span>
                <span className="timer-separator-fcjei">:</span>
                <span className="timer-digit-fcjei">{timeLeft.minutes.toString().padStart(2, '0')}</span>
                <span className="timer-separator-fcjei">:</span>
                <span className="timer-digit-fcjei">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              </div>
            </div>
          </div>
          <div className="offer-sparkle-fcjei">✨</div>
        </div>

        <div className="subscription-hero-fcjei">
          <h1 className="subscription-title-fcjei">
            <span className="heart-pulse-fcjei">❤️</span> 
            <span className="title-text-fcjei">AI Soulmate Plans</span>
            <span className="heart-pulse-fcjei">❤️</span>
          </h1>
          <p className="subscription-subtitle-fcjei">
            Choose your perfect connection level
          </p>
          
          {showQuotaMessage && (
            <div className="quota-message-fcjei">
              <div className="quota-icon-fcjei">💔</div>
              <div className="quota-text-fcjei">
                <p>Upgrade to continue your conversations</p>
              </div>
            </div>
          )}
        </div>

        <div className="plans-grid-fcjei">
          {/* Free Plan */}
          <div 
            className={`plan-card-fcjei free-plan-fcjei ${hoveredPlan === 'free' ? 'hovered-fcjei' : ''}`}
            onMouseEnter={() => setHoveredPlan('free')}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            <div className="plan-glow-fcjei"></div>
            <div className="plan-header-fcjei">
              <h3>Starter</h3>
              <div className="price-container-fcjei">
                <span className="price-fcjei">FREE</span>
                <span className="duration-fcjei">no card needed</span>
              </div>
            </div>
            
            <ul className="features-list-fcjei">
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Unlimited Letters</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>20 messages/day</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>1 AI companion</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Basic connection</span>
              </li>
            </ul>
            
            <button 
              className="plan-button-fcjei free-button-fcjei"
              onClick={() => router.push('/chat')}
            >
              <span className="button-text-fcjei">Try Now</span>
              <span className="button-arrow-fcjei">→</span>
            </button>
          </div>

          {/* Premium Plan */}
          <div 
            className={`plan-card-fcjei premium-plan-fcjei ${hoveredPlan === 'premium' ? 'hovered-fcjei' : ''}`}
            onMouseEnter={() => setHoveredPlan('premium')}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            <div className="plan-glow-fcjei"></div>
            <div className="popular-badge-fcjei">
              <div className="ribbon-fcjei">MOST POPULAR</div>
            </div>
            <div className="plan-header-fcjei">
              <h3>Premium</h3>
              <div className="price-container-fcjei">
                <div className="original-price-fcjei">₹80/month</div>
                <span className="price-fcjei">₹29</span>
                <span className="duration-fcjei">/month</span>
                <div className="discount-tag-fcjei">64% OFF</div>
              </div>
            </div>
            
            <ul className="features-list-fcjei">
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Realistic Letters</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Unlimited messages</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>5 AI companions</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Deep connection</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Priority support</span>
              </li>
            </ul>
            
            <button 
              className="plan-button-fcjei premium-button-fcjei" 
              onClick={() => handlePayment(29, 'Monthly')}
              disabled={isLoading}
            >
              <span className="button-text-fcjei">
                {isLoading ? 'Processing...' : 'Subscribe'}
              </span>
              {!isLoading && <span className="button-sparkle-fcjei">✨</span>}
            </button>
          </div>

          {/* Ultimate Plan */}
          <div 
            className={`plan-card-fcjei ultimate-plan-fcjei ${hoveredPlan === 'ultimate' ? 'hovered-fcjei' : ''}`}
            onMouseEnter={() => setHoveredPlan('ultimate')}
            onMouseLeave={() => setHoveredPlan(null)}
          >
            <div className="plan-glow-fcjei"></div>
            <div className="value-badge-fcjei">
              BEST VALUE
            </div>
            <div className="plan-header-fcjei">
              <h3>Ultimate</h3>
              <div className="price-container-fcjei">
                <div className="original-price-fcjei">₹960/year</div>
                <span className="price-fcjei">₹399</span>
                <span className="duration-fcjei">/year</span>
                <div className="discount-tag-fcjei">58% OFF</div>
              </div>
            </div>
            
            <ul className="features-list-fcjei">
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Premium Realistic Letters</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Unlimited messages</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Unlimited companions</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Deepest connection</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>VIP support</span>
              </li>
              <li>
                <i className="icon-heart-fcjei">💖</i>
                <span>Memory feature</span>
              </li>
            </ul>
            
            <button 
              className="plan-button-fcjei ultimate-button-fcjei" 
              onClick={() => handlePayment(399, 'Yearly')}
              disabled={isLoading}
            >
              <span className="button-text-fcjei">
                {isLoading ? 'Processing...' : 'Subscribe'}
              </span>
              {!isLoading && <span className="button-crown-fcjei">👑</span>}
            </button>
          </div>
        </div>

        <div className="testimonial-section-fcjei">
          <Testimonials/>
        </div>

        <div className="subscription-footer-fcjei">
          <div className="guarantee-badge-fcjei">
            <i className="icon-shield-fcjei">🛡️</i>
            <span>30-day money-back guarantee</span>
          </div>
        </div>
      </section>
    </>
  );
};

export default HomeSubscriptions;