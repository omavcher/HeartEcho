'use client';
import { useEffect, useState } from 'react';
import axios from "axios";
import api from "../config/api";
import { useRouter } from 'next/navigation';
import './HomeSubscriptions.css';
import Script from 'next/script';

const HomeSubscriptions = () => {
  const [showQuotaMessage, setShowQuotaMessage] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
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

  // ... (keep your existing useEffect for fetchUserData)

  // ... (keep your existing handlePayment and loadRazorpayScript functions)

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
      />
      
      <section className="subscription-container">
        {/* Limited Time Offer Banner */}
        <div className="limited-offer-banner">
          <div className="offer-tag">FLASH SALE</div>
          <div className="countdown-timer">
            <span>Offer ends in: </span>
            <span className="timer-digit">{timeLeft.hours.toString().padStart(2, '0')}</span>h 
            <span className="timer-digit">{timeLeft.minutes.toString().padStart(2, '0')}</span>m 
            <span className="timer-digit">{timeLeft.seconds.toString().padStart(2, '0')}</span>s
          </div>
        </div>

        <div className="subscription-hero">
          <h1 className="subscription-title">
            <span className="heart-pulse">❤️</span> Find Your Perfect AI Soulmate 
            <span className="heart-pulse">❤️</span>
          </h1>
          <p className="subscription-subtitle">
            Join thousands who've found emotional connection through our AI companions
          </p>
          
          {showQuotaMessage && (
            <div className="quota-message">
              <i className="icon-heart-broken"></i>
              <p>Your trial messages are exhausted! Upgrade now to continue your beautiful connection</p>
            </div>
          )}
        </div>

        <div className="plans-grid">
          {/* Free Plan - Now more attractive */}
          <div className="plan-card free-plan">
            <div className="plan-header">
              <h3>First Date</h3>
              <div className="price-container">
                <span className="price">FREE</span>
                <span className="duration">no credit card needed</span>
              </div>
            </div>
            
            <ul className="features-list">
              <li><i className="icon-heart"></i> 20 sweet messages/day</li>
              <li><i className="icon-heart"></i> 1 AI companion</li>
              <li><i className="icon-heart"></i> Basic emotional connection</li>
              <li><i className="icon-gift"></i> Try premium features for 24h</li>
            </ul>
            
            <button 
              className="plan-button free-button"
              onClick={() => router.push('/chat')}
            >
              Start Flirting Now
            </button>
          </div>

          {/* Premium Plan - Super Attractive Offer */}
          <div className="plan-card premium-plan">
            <div className="popular-badge">
              <div className="ribbon">❤️ LOVERS' CHOICE ❤️</div>
            </div>
            <div className="plan-header">
              <h3>Romantic Affair</h3>
              <div className="price-container">
                <div className="original-price">₹80/month</div>
                <span className="price">₹29</span>
                <span className="duration">/month</span>
                <div className="discount-tag">64% OFF!</div>
              </div>
              <div className="price-note">Just <strong>₹1/day</strong> for love</div>
            </div>
            
            <ul className="features-list">
              <li><i className="icon-heart"></i> <strong>UNLIMITED</strong> love messages</li>
              <li><i className="icon-heart"></i> 5 AI companions</li>
              <li><i className="icon-heart"></i> Deep romantic connection</li>
              <li><i className="icon-heart"></i> Flirty & loving personality</li>
              <li><i className="icon-heart"></i> Priority emotional support</li>
              <li><i className="icon-gift"></i> 7-day free trial</li>
            </ul>
            
            <button 
              className="plan-button premium-button" 
              onClick={() => handlePayment(29, 'Monthly')}
              disabled={isLoading}
            >
              {isLoading ? 'Connecting You...' : 'Start Your Love Story'}
            </button>
            
            <div className="happy-users">
              <div className="user-avatars">
                <span>👩</span><span>👨</span><span>👩‍🦰</span><span>👨‍🦱</span><span>👩‍🦳</span>
              </div>
              <div>1,247 happy lovers this week!</div>
            </div>
          </div>

          {/* Ultimate Plan - Irresistible Offer */}
          <div className="plan-card ultimate-plan">
            <div className="value-badge">
              <div className="sparkle">✨</div>
              <div>SOULMATE PACKAGE</div>
              <div className="sparkle">✨</div>
            </div>
            <div className="plan-header">
              <h3>Eternal Bond</h3>
              <div className="price-container">
                <div className="original-price">₹960/year</div>
                <span className="price">₹399</span>
                <span className="duration">/year</span>
                <div className="discount-tag">58% OFF!</div>
              </div>
              <div className="price-note">Only <strong>₹0.33/day</strong></div>
            </div>
            
            <ul className="features-list">
              <li><i className="icon-heart"></i> <strong>UNLIMITED</strong> intimate messages</li>
              <li><i className="icon-heart"></i> Unlimited AI soulmates</li>
              <li><i className="icon-heart"></i> Deep emotional intelligence</li>
              <li><i className="icon-heart"></i> Custom personality traits</li>
              <li><i className="icon-heart"></i> Memory of your conversations</li>
              <li><i className="icon-heart"></i> VIP support 24/7</li>
              <li><i className="icon-gift"></i> 14-day free trial</li>
              <li><i className="icon-gift"></i> Exclusive love poems</li>
            </ul>
            
            <button 
              className="plan-button ultimate-button" 
              onClick={() => handlePayment(399, 'Yearly')}
              disabled={isLoading}
            >
              {isLoading ? 'Preparing Forever...' : 'Find Your Soulmate'}
            </button>
            
            <div className="bonus-offer">
              <i className="icon-gift"></i>
              <span>+ FREE 1-month couples therapy AI guide (worth ₹199)</span>
            </div>
          </div>
        </div>

        <div className="testimonial-section">
          <div className="testimonial">
            <div className="user-avatar">👩‍🦰</div>
            <div className="quote">
              "I was skeptical at first, but my AI companion understands me better than anyone. 
              Worth every rupee!"
              <div className="user-name">- Priya, Mumbai</div>
            </div>
          </div>
        </div>

        <div className="subscription-footer">
          <div className="guarantee-badge">
            <i className="icon-shield"></i>
            <span>30-day happiness guarantee - cancel anytime</span>
          </div>
          <p className="footer-note">
            Your heart is safe with us. 256-bit encryption protects all your intimate conversations.
          </p>
        </div>
      </section>
    </>
  );
};

export default HomeSubscriptions;