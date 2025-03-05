import React, { useEffect, useState } from 'react';
import axios from "axios";
import api from "../config/api";
import './HomeSubscriptions.css';

const HomeSubscriptions = () => {
  const [showQuotaMessage, setShowQuotaMessage] = useState(false);
  const [userData, setUserData] = useState(null);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('re') === 'quotaover') {
      setShowQuotaMessage(true);
    }
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!token) return;
      try {
        const res = await axios.get(`${api.Url}/user/get-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) {
          setUserData(res.data);
        }
      } catch (error) {
        console.error("Error fetching user data", error);
      }
    };
    
    fetchUserData();
  }, [token]);

  const handlePayment = async (amount, plan) => {
    if (!token) {
      window.location.href = '/login';
      return;
    }

    const options = {
      key: 'rzp_test_y6rhmgP580s3Yc',
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
        }
      },
      prefill: {
        name: userData?.name || 'Your Name',
        email: userData?.email || 'user@example.com',
        contact: userData?.phone_number || '9999999999'
      },
      theme: { color: '#FB4B04' }
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <section className="lixw-container">
      <div className="lixw-hero">
        <h1 className="lixw-title">Explore HeartEcho Plans</h1>
        <p className="lixw-subtitle">
          Connect with your perfect AI companion. Affordable plans for everyone!
        </p>
        {showQuotaMessage && (
          <div className="lixw-quota-message">
            <p>Your daily quota is over. Subscribe to keep the conversation going!</p>
          </div>
        )}
      </div>

      <div className="lixw-plans">
        <div className="lixw-plan lixw-free">
          <h3>Free Trial</h3>
          <p className="lixw-price">₹0 <span className="lixw-duration">/ 7 days</span></p>
          <ul>
            <li>20 AI messages/day</li>
            <li>1 AI companion</li>
            <li>Basic chat features</li>
          </ul>
          <button className="lixw-subscribe-button">Try Free</button>
        </div>

        <div className="lixw-plan lixw-premium">
          <h3>Monthly</h3>
          <p className="lixw-price">₹40 <span className="lixw-duration">/ month</span></p>
          <ul>
            <li>Unlimited AI messages</li>
            <li>Unlimited companions</li>
            <li>Exclusive features</li>
            <li>Priority response</li>
          </ul>
          <button className="lixw-subscribe-button lixw-premium-button" onClick={() => handlePayment(40, 'Monthly')}>Get Monthly</button>
        </div>

        <div className="lixw-plan lixw-ultimate">
          <span className="lixw-popular">Best Deal</span>
          <h3>Yearly</h3>
          <p className="lixw-price">₹400 <span className="lixw-duration">/ year</span></p>
          <p className="lixw-save">Save ₹80 – 2 months free!</p>
          <ul>
            <li>Unlimited AI messages</li>
            <li>Unlimited companions</li>
            <li>Exclusive features</li>
            <li>Priority response</li>
            <li>Advanced customization</li>
          </ul>
          <button className="lixw-subscribe-button lixw-ultimate-button" onClick={() => handlePayment(400, 'Yearly')}>Go Yearly</button>
        </div>
      </div>

      <div className="lixw-footer-note">
        <p>Flexible plans with no commitment. Prices in INR (₹).</p>
      </div>
    </section>
  );
};

export default HomeSubscriptions;
