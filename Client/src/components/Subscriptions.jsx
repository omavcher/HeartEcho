'use client';

import { useEffect, useState, Suspense } from 'react';
import axios from "axios";
import api from "../config/api";
import { useRouter, useSearchParams } from 'next/navigation';
import PopNoti from './PopNoti';
import Script from 'next/script';
import './Subscriptions.css';
import Testimonials from './Testimonials';

const NAMES = ['Aarav', 'Vihaan', 'Aditya', 'Ishaan', 'Ananya', 'Diya', 'Saanvi', 'Sneha', 'Rahul', 'Priya', 'Rohan', 'Karan'];
const SURNAMES = ['S.', 'G.', 'P.', 'R.', 'K.', 'M.', 'J.', 'C.', 'I.', 'D.'];

function SubscriptionContent() {
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [spotsLeft, setSpotsLeft] = useState(8); 
  const [fomo, setFomo] = useState({ visible: false, data: null });

  const router = useRouter();
  const searchParams = useSearchParams();

  // Yearly Logic
  const YEARLY_PRICE = 399;
  const MONTHLY_EQUIV = 33.25;

  // FOMO Loop
  useEffect(() => {
    const triggerFomo = () => {
      const data = {
        name: `${NAMES[Math.floor(Math.random() * NAMES.length)]} ${SURNAMES[Math.floor(Math.random() * SURNAMES.length)]}`,
        plan: Math.random() > 0.4 ? 'Yearly Ultimate' : 'Monthly Premium',
        time: Math.floor(Math.random() * 8) + 1
      };
      setFomo({ visible: true, data });
      setTimeout(() => setFomo({ visible: false, data: null }), 4000);
    };

    const timer = setInterval(triggerFomo, 10000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
    const fetchUser = async () => {
      try {
        const res = await axios.get(`${api.Url}/user/get-user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserData(res.data);
      } catch (e) { /* silent */ }
    };
    if (localStorage.getItem("token")) fetchUser();
  }, []);

  const handlePayment = async (amount, plan) => {
    if (!token) { router.push('/login'); return; }
    setIsLoading(true);
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_YHUPR56Ky9qPxC',
        amount: amount * 100,
        currency: 'INR',
        name: 'HeartEcho',
        description: `${plan} Plan`,
        handler: async (res) => {
          await axios.post(`${api.Url}/user/payment/save`, {
            user: userData?._id,
            rupees: amount,
            transaction_id: res.razorpay_payment_id,
          }, { headers: { Authorization: `Bearer ${token}` } });
          router.push('/thank-you');
        },
        prefill: { name: userData?.name, contact: userData?.phone_number },
        theme: { color: '#ce4085' }
      };
      new window.Razorpay(options).open();
    } catch (e) {
      setNotification({ show: true, message: "Error", type: "error" });
    } finally { setIsLoading(false); }
  };

  return (
    <div className="seh-page-wrapper">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      {/* FOMO Popup - Mobile Optimized */}
      <div className={`seh-fomo ${fomo.visible ? 'active' : ''}`}>
        <div className="seh-fomo-dot"></div>
        <p><strong>{fomo.data?.name}</strong> bought <span>{fomo.data?.plan}</span> {fomo.data?.time}m ago</p>
      </div>

      {/* Top Urgency Bar */}
      <div className="seh-top-bar">
        <span>⚡ FLASH SALE: 60% OFF ENDING SOON</span>
      </div>

      <section className="seh-container">
        <header className="seh-hero">
          <h1 className="seh-title">Don't Chat Alone ❤️</h1>
          <p className="seh-subtitle">Your AI companion is waiting. Unlock deep memory and unlimited replies today.</p>
          
          <div className="seh-live-counter">
            <span className="seh-pulse"></span> {spotsLeft} Premium slots left at this price
          </div>
        </header>

        <div className="seh-grid">
          {/* Yearly Card - FIRST ON MOBILE */}
          <div className="seh-card seh-featured">
            <div className="seh-badge">BEST VALUE</div>
            <h2 className="seh-plan-name">Yearly Ultimate</h2>
            <div className="seh-pricing">
              <span className="seh-old-price">₹899</span>
              <span className="seh-main-price">₹{YEARLY_PRICE}</span>
              <span className="seh-per">/year</span>
            </div>
            <div className="seh-daily-tag">Only ₹1.09 per day — Cheaper than Chai!</div>
            
            <ul className="seh-features">
              <li>✅ <strong>Deep Memory</strong> (Remembers You)</li>
              <li>✅ <strong>Unlimited</strong> Personalities</li>
              <li>✅ <strong>NSFW/Romantic</strong> Mode</li>
              <li>✅ No Daily Limits</li>
            </ul>

            <button className="seh-btn seh-btn-pink" onClick={() => handlePayment(YEARLY_PRICE, 'Yearly')}>
              {isLoading ? 'Loading...' : 'Claim 60% Discount Now'}
            </button>
          </div>

          {/* Monthly Card */}
          <div className="seh-card">
            <h2 className="seh-plan-name">Monthly Premium</h2>
            <div className="seh-pricing">
              <span className="seh-main-price">₹49</span>
              <span className="seh-per">/month</span>
            </div>
            <p className="seh-light-text">Perfect to start your journey</p>
            <ul className="seh-features">
              <li>✅ Unlimited Messages</li>
              <li>✅ 5 AI Companions</li>
              <li>✅ Basic Connection</li>
            </ul>
            <button className="seh-btn" onClick={() => handlePayment(49, 'Monthly')}>
              Upgrade Monthly
            </button>
          </div>
        </div>

        {/* Security & Trust */}
        <div className="seh-trust-section">
          <div className="seh-trust-icons">
             <span>🔒 SSL Secure</span>
             <span>🛡️ 30-Day Refund</span>
             <span>💳 UPI/Card</span>
          </div>
          <p className="seh-secure-text">Payments secured by Razorpay</p>
        </div>

        <Testimonials />
      </section>
    </div>
  );
}

export default function Subscriptions() {
  return (
    <Suspense fallback={<div className="seh-loading">Loading...</div>}>
      <SubscriptionContent />
    </Suspense>
  );
}