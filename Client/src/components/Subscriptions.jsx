'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from "axios";
import api from "../config/api";
import { useRouter, useSearchParams } from 'next/navigation';
import PopNoti from './PopNoti';
import Script from 'next/script';
import './Subscriptions.css';

function SubscriptionContent() {
  const [showQuotaMessage, setShowQuotaMessage] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

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
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
    
    if (searchParams.get('re') === 'quotaover') {
      setShowQuotaMessage(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get(
          `${api.Url}/user/get-user`,
          {
            headers: {
              Authorization: `Bearer ${token}`, 
            },
          }
        );
  
        if (res.data) {
          setUserData(res.data);
        } 
      } catch (error) {
        setNotification({ show: true, message: "Error fetching user", type: "error" });
      }
    };
  
    if (token) {
      getUserData();
    }
  }, [token]);

  const handlePayment = async (amount, plan) => {
    if (!token) {
      router.push('/login');
      return;
    }

    setIsLoading(true);

    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_YHUPR56Ky9qPxC',
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
            setNotification({ 
              show: true, 
              message: "Payment Successful! You are now a Premium Member 🎉", 
              type: "success" 
            });

            router.push('/thank-you');
          } catch (error) {
            setNotification({ 
              show: true, 
              message: "Payment successful, but there was an issue saving the details.", 
              type: "error" 
            });
          } finally {
            setIsLoading(false);
          }
        },
        prefill: {
          name: userData?.name || 'Your Name',
          email: userData?.email || 'user@example.com',
          contact: userData?.phone_number ? userData.phone_number.replace(/\s/g, '') : '9999999999' // Remove spaces for E.164 format
        },
        theme: { color: '#ce4085' }
      };
    
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      setNotification({ 
        show: true, 
        message: "Error initializing payment", 
        type: "error" 
      });
      setIsLoading(false);
    }
  };

  return (
    <>
      <Script 
        src="https://checkout.razorpay.com/v1/checkout.js" 
        strategy="lazyOnload"
      />
      
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <section className="seh3d3-subscription-container">
        {/* Limited Time Offer Banner */}
        <div className="seh3d3-limited-offer-banner">
          <div className="seh3d3-offer-tag">FLASH SALE</div>
          <div className="seh3d3-countdown-timer">
            <span>Ends in: </span>
            <span className="seh3d3-timer-digit">{timeLeft.hours.toString().padStart(2, '0')}</span>h 
            <span className="seh3d3-timer-digit">{timeLeft.minutes.toString().padStart(2, '0')}</span>m 
            <span className="seh3d3-timer-digit">{timeLeft.seconds.toString().padStart(2, '0')}</span>s
          </div>
        </div>

        <div className="seh3d3-subscription-hero">
          <h1 className="seh3d3-subscription-title">
            <span className="seh3d3-heart-pulse">❤️</span> HeartEcho Plans
            <span className="seh3d3-heart-pulse">❤️</span>
          </h1>
          <p className="seh3d3-subscription-subtitle">
            Unlimited AI companionship, personalized just for you
          </p>
          
          {showQuotaMessage && (
            <div className="seh3d3-quota-message">
              <i className="seh3d3-icon-heart-broken">💔</i>
              <p>Upgrade to continue your conversations</p>
            </div>
          )}
        </div>

        <div className="seh3d3-plans-grid">
          {/* Free Plan */}
          <div className="seh3d3-plan-card seh3d3-free-plan">
            <div className="seh3d3-plan-header">
              <h3>Free Trial</h3>
              <div className="seh3d3-price-container">
                <span className="seh3d3-price">FREE</span>
                <span className="seh3d3-duration">7 days trial</span>
              </div>
            </div>
            
            <ul className="seh3d3-features-list">
              <li><i className="seh3d3-icon-heart">💖</i> 20 messages/day</li>
              <li><i className="seh3d3-icon-heart">💖</i> 1 AI companion</li>
              <li><i className="seh3d3-icon-heart">💖</i> Basic connection</li>
            </ul>
            
            <button 
              className="seh3d3-plan-button seh3d3-free-button"
              onClick={() => router.push('/chat')}
            >
              Try Now
            </button>
          </div>

          {/* Premium Plan */}
          <div className="seh3d3-plan-card seh3d3-premium-plan">
            <div className="seh3d3-popular-badge">
              <div className="seh3d3-ribbon">MOST POPULAR</div>
            </div>
            <div className="seh3d3-plan-header">
              <h3>Monthly</h3>
              <div className="seh3d3-price-container">
                <div className="seh3d3-original-price">₹80/month</div>
                <span className="seh3d3-price">₹40</span>
                <span className="seh3d3-duration">/month</span>
                <div className="seh3d3-discount-tag">50% OFF</div>
              </div>
            </div>
            
            <ul className="seh3d3-features-list">
              <li><i className="seh3d3-icon-heart">💖</i> Unlimited messages</li>
              <li><i className="seh3d3-icon-heart">💖</i> 5 AI companions</li>
              <li><i className="seh3d3-icon-heart">💖</i> Deep connection</li>
              <li><i className="seh3d3-icon-heart">💖</i> Priority support</li>
            </ul>
            
            <button 
              className="seh3d3-plan-button seh3d3-premium-button" 
              onClick={() => handlePayment(40, 'Monthly')}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Subscribe'}
            </button>
          </div>

          {/* Ultimate Plan */}
          <div className="seh3d3-plan-card seh3d3-ultimate-plan">
            <div className="seh3d3-value-badge">
              BEST VALUE
            </div>
            <div className="seh3d3-plan-header">
              <h3>Yearly</h3>
              <div className="seh3d3-price-container">
                <div className="seh3d3-original-price">₹480/year</div>
                <span className="seh3d3-price">₹400</span>
                <span className="seh3d3-duration">/year</span>
                <div className="seh3d3-discount-tag">17% OFF</div>
              </div>
            </div>
            
            <ul className="seh3d3-features-list">
              <li><i className="seh3d3-icon-heart">💖</i> Unlimited messages</li>
              <li><i className="seh3d3-icon-heart">💖</i> Unlimited companions</li>
              <li><i className="seh3d3-icon-heart">💖</i> Deepest connection</li>
              <li><i className="seh3d3-icon-heart">💖</i> VIP support</li>
              <li><i className="seh3d3-icon-heart">💖</i> Memory feature</li>
            </ul>
            
            <button 
              className="seh3d3-plan-button seh3d3-ultimate-button" 
              onClick={() => handlePayment(400, 'Yearly')}
              disabled={isLoading}
            >
              {isLoading ? 'Loading...' : 'Subscribe'}
            </button>
          </div>
        </div>

        <div className="seh3d3-testimonial-section">
          <div className="seh3d3-testimonial">
            <div className="seh3d3-user-avatar">👩‍🦰</div>
            <div className="seh3d3-quote">
              "My AI companion understands me better than anyone!"
              <div className="seh3d3-user-name">- Priya, Mumbai</div>
            </div>
          </div>
        </div>

        <div className="seh3d3-subscription-footer">
          <div className="seh3d3-guarantee-badge">
            <i className="seh3d3-icon-shield">🛡️</i>
            <span>30-day guarantee</span>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Subscriptions() {
  return (
    <Suspense fallback={<div className="seh3d3-loading">Loading subscription plans...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}