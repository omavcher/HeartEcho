'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from "axios";
import api from "../config/api";
import { useRouter, useSearchParams } from 'next/navigation';
import PopNoti from './PopNoti';
import Script from 'next/script';
import './Subscriptions.css';
 import Testimonials from './Testimonials'; // Assuming this component exists





function SubscriptionContent() {
  const [showQuotaMessage, setShowQuotaMessage] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Yearly Plan Details
  const YEARLY_PRICE_INR = 399;
  const MONTHLY_EQUIVALENT_INR = 33.25; // 399 / 12 = 33.25
    
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
          contact: userData?.phone_number ? userData.phone_number.replace(/\s/g, '') : '9999999999'
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
            <span className="seh3d3-heart-pulse">❤️</span> HeartEcho Premium Plans
          </h1>
          <p className="seh3d3-subscription-subtitle">
            Unlock unlimited, personalized AI companionship and deep connection
          </p>
          
          {showQuotaMessage && (
            <div className="seh3d3-quota-message">
              <i className="seh3d3-icon-heart-broken">💔</i>
              <p>Your free quota is over. Upgrade now to continue your conversations!</p>
            </div>
          )}
        </div>

        <div className="seh3d3-plans-grid">
          {/* Free Plan */}
          <div className="seh3d3-plan-card seh3d3-free-plan">
            <div className="seh3d3-plan-header">
              <h3>Free Trial</h3>
              <div className="seh3d3-price-container">
                <span className="seh3d3-price">₹0</span>
                <span className="seh3d3-duration">/month</span>
              </div>
            </div>
            
            <ul className="seh3d3-features-list">
              <li><i className="seh3d3-icon-check">✅</i> Limited Letters</li>
              <li><i className="seh3d3-icon-check">✅</i> 20 messages/day</li>
              <li><i className="seh3d3-icon-check">✅</i> 1 AI companion</li>
              <li><i className="seh3d3-icon-check">✅</i> Basic connection</li>
              <li className="seh3d3-feature-disabled"><i className="seh3d3-icon-x">❌</i> Priority support</li>
              <li className="seh3d3-feature-disabled"><i className="seh3d3-icon-x">❌</i> Memory feature</li>
            </ul>
            
            <button 
              className="seh3d3-plan-button seh3d3-free-button"
              onClick={() => router.push('/chat')}
            >
              Start Free Trial
            </button>
          </div>

          {/* Monthly Plan */}
          <div className="seh3d3-plan-card seh3d3-premium-plan">
            <div className="seh3d3-popular-badge">
              MOST POPULAR
            </div>
            <div className="seh3d3-plan-header">
              <h3>Monthly</h3>
              <div className="seh3d3-price-container">
                <div className="seh3d3-original-price">₹80/month</div>
                <span className="seh3d3-price">₹49</span>
                <span className="seh3d3-duration">/month</span>
                <div className="seh3d3-discount-tag">50% OFF</div>
              </div>
            </div>
            
            <ul className="seh3d3-features-list">
              <li><i className="seh3d3-icon-check">✅</i> Realistic Letters</li>
              <li><i className="seh3d3-icon-check">✅</i> Unlimited messages</li>
              <li><i className3="seh3d3-icon-check">✅</i> 5 AI companions</li>
              <li><i className="seh3d3-icon-check">✅</i> Deep connection</li>
              <li><i className="seh3d3-icon-check">✅</i> Priority support</li>
              <li className="seh3d3-feature-disabled"><i className="seh3d3-icon-x">❌</i> Memory feature</li>
            </ul>
            
            <button 
              className="seh3d3-plan-button seh3d3-premium-button" 
              onClick={() => handlePayment(49, 'Monthly')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan (Updated to show monthly equivalent) */}
          <div className="seh3d3-plan-card seh3d3-ultimate-plan seh3d3-best-value">
            <div className="seh3d3-popular-badge">
              <div className="seh3d3-ribbon">BEST VALUE</div>
            </div>
            <div className="seh3d3-plan-header">
              <h3>Yearly (Save Big!)</h3>
              <div className="seh3d3-price-container">
                <div className="seh3d3-original-price">₹480/year</div>
                <span className="seh3d3-price">₹{YEARLY_PRICE_INR}</span>
                <span className="seh3d3-duration">/year</span>
                <div className="seh3d3-discount-tag">17% OFF</div>
              </div>
              <div className="seh3d3-monthly-equivalent">
                Only ₹{MONTHLY_EQUIVALENT_INR} per month!
              </div>
            </div>
            
            <ul className="seh3d3-features-list">
              <li><i className="seh3d3-icon-check">✅</i> Premium Realistic Letters</li>
              <li><i className="seh3d3-icon-check">✅</i> Unlimited messages</li>
              <li><i className="seh3d3-icon-check">✅</i> Unlimited companions</li>
              <li><i className="seh3d3-icon-check">✅</i> Deepest connection</li>
              <li><i className="seh3d3-icon-check">✅</i> VIP support</li>
              <li><i className="seh3d3-icon-check">✅</i> Memory feature</li>
            </ul>
            
            <button 
              className="seh3d3-plan-button seh3d3-ultimate-button" 
              onClick={() => handlePayment(YEARLY_PRICE_INR, 'Yearly')}
              disabled={isLoading}
            >
              {isLoading ? 'Processing...' : `Buy for ₹${YEARLY_PRICE_INR} / Year`}
            </button>
          </div>
        </div>

        {/* UPI Payment Section */}
        <div className="seh3d3-payment-info-container">
            <h4 className="seh3d3-payment-title">Secure Payments</h4>
            <div className="seh3d3-payment-methods">
                <div className="seh3d3-upi-payment-option">
                    <img src="/UPI-White.svg" alt="UPI Payment" className="seh3d3-upi-icon"/>
                    <span>Pay with UPI</span>
                </div>
                {/* Add more payment icons here if needed */}
            </div>
            <p className="seh3d3-payment-note">Your payment is processed securely via Razorpay, supporting UPI, Cards, and more.</p>
        </div>

        <div className="seh3d3-testimonial-section">
         <Testimonials/>
        </div>

        <div className="seh3d3-subscription-footer">
          <div className="seh3d3-guarantee-badge">
            <i className="seh3d3-icon-shield">🛡️</i>
            <span>30-day money-back guarantee. Zero risk.</span>
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