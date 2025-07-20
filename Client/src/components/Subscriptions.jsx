'use client';

import React, { useEffect, useState } from 'react';
import '../styles/Subscriptions.css';
import PopNoti from './PopNoti';
import axios from "axios";
import api from "../config/api";
import { useRouter, useSearchParams } from 'next/navigation';

const Subscriptions = () => {
  const [showQuotaMessage, setShowQuotaMessage] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Client-side only code
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
  };

  return (
    <div className="subscriptions-container">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <div className="hero">
        <h1 className="logo">HeartEcho</h1>
        <h2 className="title">Choose Your HeartEcho Plan</h2>
        <p className="subtitle">
          Unlimited AI companionship, personalized just for you. Start free today!
        </p>
        {showQuotaMessage && (
          <div className="quota-message">
            <p>Your daily quota is over. Please subscribe to a plan to continue enjoying HeartEcho!</p>
          </div>
        )}
      </div>

      <div className="plans">
        <div className="plan free">
          <h3>Free Trial</h3>
          <p className="price">₹0 <span className="duration">/ 7 days</span></p>
          <ul>
            <li>20 AI messages/day</li>
            <li>1 AI companion</li>
            <li>Basic chat features</li>
          </ul>
          <button className="subscribe-button">Start Free Trial</button>
        </div>

        <div className="plan premium">
          <h3>Monthly</h3>
          <p className="price">₹40 <span className="duration">/ month</span></p>
          <ul>
            <li>Unlimited AI messages</li>
            <li>Unlimited companions</li>
            <li>Exclusive features</li>
            <li>Priority response</li>
          </ul>
          <button 
            className="subscribe-button premium-button" 
            onClick={() => handlePayment(40, 'Monthly')}
          >
            Subscribe Now
          </button>
        </div>

        <div className="plan ultimate">
          <span className="popular">Best Value</span>
          <h3>Yearly</h3>
          <p className="price">₹400 <span className="duration">/ year</span></p>
          <p className="save">Save ₹80 – 2 months free!</p>
          <ul>
            <li>Unlimited AI messages</li>
            <li>Unlimited companions</li>
            <li>Exclusive features</li>
            <li>Priority response</li>
            <li>Advanced customization</li>
          </ul>
          <button 
            className="subscribe-button ultimate-button" 
            onClick={() => handlePayment(400, 'Yearly')}
          >
            Get Started
          </button>
        </div>
      </div>
    </div>
  );
};

export default Subscriptions;