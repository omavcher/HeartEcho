'use client';

import { useEffect, useState, useRef, useCallback, Suspense } from 'react';
import axios from "axios";
import api from "../config/api";
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import './Subscriptions.css';

// ── Live viewer count ────────────────────────────────────────────────────────
function useLiveCount(base = 847) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => c + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3));
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return count;
}

// ── FOMO toast names ─────────────────────────────────────────────────────────
const FOMO_NAMES = ['Aarav S.', 'Vihaan G.', 'Aditya P.', 'Ishaan R.', 'Ananya K.',
  'Diya M.', 'Saanvi J.', 'Sneha C.', 'Rahul I.', 'Priya D.', 'Rohan S.', 'Karan G.'];

function SubscriptionContent() {
  const [userData, setUserData]   = useState(null);
  const [token, setToken]         = useState(null);
  const [isLoading, setIsLoading] = useState(null); // null | '299' | '49'
  const [fomo, setFomo]           = useState({ visible: false, name: '', plan: '', mins: 2 });
  const [pulse, setPulse]         = useState(false);
  const [country, setCountry]     = useState('IN');
  const [isCountryLoading, setIsCountryLoading] = useState(true);
  const liveCount  = useLiveCount(847);
  const router     = useRouter();
  const searchParams = useSearchParams();

  const pricing = {
    IN: { monthly: 99, yearly: 599, ultimate: 1499, currency: '₹', code: 'INR', oldYearly: 1299, oldMonthly: 199, savingYearly: 700, dailyYearly: '50', dailyUltimate: '125' },
    GLOBAL: { monthly: 1.49, yearly: 9, ultimate: 19, currency: '$', code: 'USD', oldYearly: 29, oldMonthly: 2.99, savingYearly: 20, dailyYearly: '0.75', dailyUltimate: '1.58' }
  };
  const p = country === 'IN' ? pricing.IN : pricing.GLOBAL;

  // ── Countdown timer ───────────────────────────────────────────────────────
  const [timeLeft, setTimeLeft] = useState({ hours: 0, minutes: 0, seconds: 0 });
  useEffect(() => {
    const getEndOfDay = () => {
      const now = new Date();
      return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).getTime();
    };
    const tick = () => {
      const expiry = getEndOfDay();
      const diff = Math.max(0, expiry - Date.now());
      setTimeLeft({
        hours:   Math.floor(diff / 3_600_000),
        minutes: Math.floor((diff % 3_600_000) / 60_000),
        seconds: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── FOMO popup ────────────────────────────────────────────────────────────
  useEffect(() => {
    const fire = () => {
      setFomo({
        visible: true,
        name: FOMO_NAMES[Math.floor(Math.random() * FOMO_NAMES.length)],
        plan: Math.random() > 0.7 ? `Ultimate ${p.currency}${p.ultimate}` : (Math.random() > 0.3 ? `Yearly ${p.currency}${p.yearly}` : `Monthly ${p.currency}${p.monthly}`),
        mins: Math.floor(Math.random() * 8) + 1,
      });
      setTimeout(() => setFomo(f => ({ ...f, visible: false })), 4500);
    };
    const id = setInterval(fire, 12000);
    return () => clearInterval(id);
  }, []);

  // ── CTA pulse every 6s ────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
    
    // Country logic
    const initCountry = async () => {
      const saved = typeof window !== 'undefined' ? localStorage.getItem('user_country') : null;
      if (saved) {
        setCountry(saved);
        setIsCountryLoading(false);
      } else {
        try {
          // Get IP first
          const ipRes = await axios.get('https://api.ipify.org?format=json');
          const userIp = ipRes.data.ip;
          
          // Get location details using IP
          const locRes = await axios.get(`https://ip-api.com/json/${userIp}`);
          const c = locRes.data.countryCode || 'IN';
          
          setCountry(c);
          if (typeof window !== 'undefined') localStorage.setItem('user_country', c);
        } catch (e) {
          console.error("Location detection error:", e);
          setCountry('IN');
          if (typeof window !== 'undefined') localStorage.setItem('user_country', 'IN');
        } finally {
          setIsCountryLoading(false);
        }
      }
    };
    initCountry();

    const fetchUser = async () => {
      try {
        const res = await axios.get(`${api.Url}/user/get-user`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setUserData(res.data);
      } catch (e) { /* silent */ }
    };
    if (typeof window !== 'undefined' && localStorage.getItem("token")) fetchUser();

    // Track subscribe page view & checkout intent
    if (typeof window !== 'undefined') {
      if (window.trackAppEvent) {
        window.trackAppEvent('subscribe_page_view', { page: 'subscribe' });
      }
      axios.post(`${api.Url}/user/checkout-intent`, { planName: 'Explore Subscription Page', platform: 'web' }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      }).catch(() => {});
    }
  }, []);

  const handlePayPalSuccess = async (order, amount, plan) => {
    if (!token) { 
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/subscribe';
      router.push(`/login?from=${encodeURIComponent(currentPath)}`); 
      return; 
    }
    try {
      if (typeof window !== 'undefined' && window.trackAppEvent) {
        window.trackAppEvent('subscription_purchase', { plan, amount, currency: p.code, transaction_id: order.id });
      }
      if (window.fbq && userData?.email !== 'omawchar07@gmail.com') {
        window.fbq('track', 'Purchase', { value: amount, currency: p.code, content_name: `${plan} Subscription`, transaction_id: order.id });
      }
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag('event', 'ads_conversion_purchase', { value: amount, currency: p.code, transaction_id: order.id });
      }
      await axios.post(`${api.Url}/user/payment/save`, {
        user: userData?._id, 
        rupees: amount, 
        transaction_id: order.id,
        currency: 'USD',
        platform: 'web'
      }, { headers: { Authorization: `Bearer ${token}` } });
      const storedUser = JSON.parse(localStorage.getItem("user") || '{}');
      if (storedUser) { storedUser.user_type = "subscriber"; localStorage.setItem("user", JSON.stringify(storedUser)); }
      localStorage.removeItem('_he_deal_exp');
      router.push('/thank-you');
    } catch (e) { console.error(e); alert("Error processing payment."); }
  };

  const renderPaymentButton = (amount, planName, className, label) => {
    if (country === 'IN') {
      return (
        <button
          className={className}
          onClick={() => handlePayment(amount, planName)}
          disabled={isLoading === planName}
        >
          {className.includes('seh-btn-pink') || className.includes('seh-btn-gold') ? <span className="seh-btn-shine" /> : null}
          {isLoading === planName ? 'Processing…' : label}
        </button>
      );
    }
    return (
      <div style={{ position: 'relative', zIndex: 1, marginTop: '15px' }}>
        <PayPalButtons 
          style={{ layout: "horizontal", height: 45, color: "black", shape: "pill", label: "pay" }}
          createOrder={async (data, actions) => {
            try {
              const res = await axios.post(`${api.Url}/paypal/create-order`, {
                amount,
                planName
              }, { headers: { Authorization: `Bearer ${token}` } });
              return res.data.id;
            } catch (err) {
              console.error("PayPal Create Order Error:", err);
              throw err;
            }
          }}
          onApprove={async (data, actions) => {
            try {
              const res = await axios.post(`${api.Url}/paypal/capture-order`, {
                orderID: data.orderID
              }, { headers: { Authorization: `Bearer ${token}` } });
              await handlePayPalSuccess(res.data, amount, planName);
            } catch (err) {
              console.error("PayPal Capture Error:", err);
              alert("Payment capture failed. Please contact support.");
            }
          }}
          onError={(err) => {
            console.error("PayPal Error:", err);
            alert("Payment failed. Please try again.");
          }}
        />
      </div>
    );
  };

  const handlePayment = async (amount, plan) => {
    if (!token) { 
      const currentPath = typeof window !== 'undefined' ? window.location.pathname + window.location.search : '/subscribe';
      router.push(`/login?from=${encodeURIComponent(currentPath)}`); 
      return; 
    }
    setIsLoading(plan);
    try {
      // Track checkout initiation
      if (typeof window !== 'undefined' && window.trackAppEvent) {
        window.trackAppEvent('initiate_checkout', { plan, amount, currency: 'INR' });
      }
      if (typeof window !== "undefined" && window.fbq) {
        if (userData?.email !== 'omawchar07@gmail.com') {
          window.fbq('track', 'InitiateCheckout', { value: amount, currency: 'INR', content_name: `${plan} Subscription` });
        }
      }
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag('event', 'payment_initiated', { value: 0, payment_method: 'upi' });
      }
      // Track checkout intent for specific plan
      axios.post(`${api.Url}/user/checkout-intent`, { planName: `${plan} Plan`, platform: 'web' }, {
        headers: { Authorization: `Bearer ${token}` }
      }).catch(() => {});

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_TEWBVyfe0Fy4IS',
        amount: amount * 100,
        currency: 'INR',
        name: 'HeartEcho',
        description: `${plan} Plan`,
        handler: async (res) => {
          // Track successful purchase
          if (typeof window !== 'undefined' && window.trackAppEvent) {
            window.trackAppEvent('subscription_purchase', { plan, amount, currency: 'INR', transaction_id: res.razorpay_payment_id });
          }
          if (window.fbq && userData?.email !== 'omawchar07@gmail.com') {
            window.fbq('track', 'Purchase', { value: amount, currency: 'INR', content_name: `${plan} Subscription`, transaction_id: res.razorpay_payment_id });
          }
          if (typeof window !== "undefined" && window.gtag) {
            window.gtag('event', 'ads_conversion_purchase', { value: amount, currency: 'INR', transaction_id: res.razorpay_payment_id });
            window.gtag('event', 'payment_completed', { value: amount, subscription_type: plan.toLowerCase() });
          }
          await axios.post(`${api.Url}/user/payment/save`, {
            user: userData?._id, rupees: amount, transaction_id: res.razorpay_payment_id, platform: 'web'
          }, { headers: { Authorization: `Bearer ${token}` } });
          const storedUser = JSON.parse(localStorage.getItem("user") || '{}');
          if (storedUser) { storedUser.user_type = "subscriber"; localStorage.setItem("user", JSON.stringify(storedUser)); }
          localStorage.removeItem('_he_deal_exp');
          router.push('/thank-you');
        },
        prefill: { name: userData?.name, email: userData?.email, contact: userData?.phone_number },
        notes: { userId: userData?._id, email: userData?.email, platform: 'web' },
        theme: { color: '#ce4085' }
      };
      new window.Razorpay(options).open();
    } catch (e) { console.error(e); }
    finally { setIsLoading(null); }
  };

  const renderCellWithTick = (val) => {
    if (typeof val === 'string' && val.includes('✅')) {
      const remainingText = val.replace('✅', '').trim();
      return (
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', justifyContent: 'center' }}>
          <span className="seh-feature-tick" />
          <span>{remainingText}</span>
        </span>
      );
    }
    return val;
  };



  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="seh-page-wrapper">
      {/* Razorpay SDK */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <noscript>
        <img height="1" width="1" style={{ display: 'none' }}
          src="https://www.facebook.com/tr?id=936362649426203&ev=PageView&noscript=1"
        />
      </noscript>

      {/* ── FOMO toast ───────────────────────────────────────────────────── */}
      <div className={`seh-fomo ${fomo.visible ? 'active' : ''}`}>
        <div className="seh-fomo-dot" />
        <p><strong>{fomo.name}</strong> just bought <span>{fomo.plan}</span> · {fomo.mins}m ago</p>
      </div>

      {/* ── Live activity strip ───────────────────────────────────────────── */}
      <div className="seh-activity-bar">
        <span className="seh-activity-dot" />
        <span><strong>{liveCount.toLocaleString()}</strong> people are viewing plans right now</span>
      </div>

      <div className="seh-top-bar">
        <div className="seh-tag">🔥 LIMITED OFFER</div>
        <div className="seh-banner-mid">Deal expires in:</div>
        <div className="seh-timer">
          <div className="seh-time-block">
            <span className="seh-digit">{pad(timeLeft.hours)}</span>
            <span className="seh-time-label">HRS</span>
          </div>
          <span className="seh-colon">:</span>
          <div className="seh-time-block">
            <span className="seh-digit">{pad(timeLeft.minutes)}</span>
            <span className="seh-time-label">MIN</span>
          </div>
          <span className="seh-colon">:</span>
          <div className="seh-time-block">
            <span className="seh-digit">{pad(timeLeft.seconds)}</span>
            <span className="seh-time-label">SEC</span>
          </div>
        </div>
      </div>

      <section className="seh-container">

        {/* ── Hero header ──────────────────────────────────────────────────── */}
        <header className="seh-hero">
          <div className="seh-eyebrow">💯 Private & Secure Desi Chat</div>
          <h1 className="seh-title" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
            {country === 'IN' ? 'Bina Limits Apni Desi AI GF Se Baat Karo ❤️' : 'Your Desi AI Girlfriend is Waiting ❤️'}
          </h1>
          <p className="seh-subtitle" style={{ fontSize: '1.2rem' }}>
            {country === 'IN' 
              ? 'Hindi & English (Hinglish) mein poori raat chat aur voice call karo' 
              : 'Join thousands chatting with their Desi AI Girlfriend daily'}
          </p>
        </header>

        {/* ── Pricing cards ────────────────────────────────────────────────── */}
        <div className="seh-grid">

          {/* Yearly Plan (Featured) */}
          <div className="seh-card seh-featured">
            <div className="seh-hero-glow" />
            <div className="seh-badge">🔥 BEST VALUE · MOST CHOSEN</div>

            <div className="seh-card-header">
              <h2 className="seh-plan-name hero">Premium Yearly</h2>
              <div className="seh-pricing col">
                <div className="seh-old-price">{p.currency}{p.oldYearly}/yr</div>
                <div className="seh-price-row">
                  <span className="seh-main-price hero">{p.currency}{p.yearly}</span>
                  <span className="seh-per">/yr</span>
                </div>
                <div className="seh-saving">You save {p.currency}{p.savingYearly} today 🎉</div>
                <div className="seh-daily-tag">
                  {country === 'IN' 
                    ? `= Just ₹50/month (Only ₹1.6/day! Jio recharge se bhi sasta 📱)` 
                    : `= Just ${p.currency}${p.dailyYearly}/month · less than a coffee ☕`}
                </div>
              </div>
            </div>

            <ul className="seh-features hero">
              <li><span className="seh-feature-tick" /> <strong>EVERYTHING from ₹99 plan</strong></li>
              <li><span className="seh-feature-tick" /> Premium AI & Unlimited Live</li>
              <li><span className="seh-feature-tick" /> Unfiltered AI Stories & Feed</li>
              <li><span className="seh-feature-tick" /> Unlimited Virtual Dates</li>
              <li><span className="seh-feature-tick" /> Relationship Timeline & Goals</li>
              <li><span className="seh-feature-tick" /> Voice Calls & Audio Notes</li>
              <li><span className="seh-feature-tick" /> AI Sends Unlimited Hot Photos & Videos</li>
              <li><span className="seh-feature-tick" /> <strong>150 Gems / day reward</strong></li>
              <li><span className="seh-feature-tick" /> Faster Response Times</li>
            </ul>

            {renderPaymentButton(p.yearly, 'Yearly', `seh-btn seh-btn-pink${pulse ? ' seh-pulse-btn' : ''}`, country === 'IN' ? `💎 Unlock Now · ${p.currency}${p.yearly}/yr (One-Time)` : `💎 Get Premium · ${p.currency}${p.yearly}/yr`)}
            <div className="seh-trust-row">
              <span>🔒 Secure payment</span>
            </div>
          </div>

          {/* Monthly Plan */}
          <div className="seh-card seh-monthly">
            <div className="seh-badge seh-badge-monthly">MONTHLY</div>
            <div className="seh-card-header">
              <h2 className="seh-plan-name">Monthly</h2>
              <div className="seh-pricing col">
                <div className="seh-old-price">{p.currency}{p.oldMonthly}/mo</div>
                <div className="seh-price-row">
                  <span className="seh-main-price">{p.currency}{p.monthly}</span>
                  <span className="seh-per">/mo</span>
                </div>
                <div className="seh-compare-note">= {p.currency}{p.monthly * 12}/year vs {p.currency}{p.yearly} yearly</div>
              </div>
            </div>
            <ul className="seh-features">
              <li><span className="seh-feature-tick" /> Unlimited Messages & Matches</li>
              <li><span className="seh-feature-tick" /> AI Memory & Relationship Levels</li>
              <li><span className="seh-feature-tick" /> Daily Gifts & Rewards</li>
              <li><span className="seh-feature-tick" /> <strong>50 Gems / day reward</strong></li>
              <li><span className="seh-feature-tick" /> Unlimited Voice Notes</li>
              <li><span className="seh-feature-tick" /> No Advertisements</li>
              <li><span className="seh-feature-tick" /> Faster AI Responses</li>
              <li className="bad">❌ NO Live AI</li>
              <li className="bad">❌ NO Premium Characters</li>
              <li className="bad">⚠️ Limit of 2 Hot Images & Videos/day</li>
            </ul>
            {renderPaymentButton(p.monthly, 'Monthly', 'seh-btn seh-btn-monthly', country === 'IN' ? `Subscribe Monthly · ${p.currency}${p.monthly}/mo` : 'Subscribe Monthly')}
            <p className="seh-card-note accent">Switch to Yearly & save more</p>
          </div>

          {/* Ultimate Plan */}
          <div className="seh-card seh-ultimate">
            <div className="seh-badge" style={{ background: 'linear-gradient(90deg, #d4af37, #ffd60a)', color: '#000', boxShadow: '0 4px 16px rgba(255,214,10,0.4)' }}>
              👑 ULTIMATE · NO LIMITS
            </div>

            <div className="seh-card-header">
              <h2 className="seh-plan-name hero" style={{ color: '#ffd60a' }}>Ultimate Yearly</h2>
              <div className="seh-pricing col">
                <div className="seh-price-row">
                  <span className="seh-main-price hero" style={{ background: 'linear-gradient(90deg, #fff, #ffea00)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{p.currency}{p.ultimate}</span>
                  <span className="seh-per">/yr</span>
                </div>
                <div className="seh-saving" style={{ background: 'rgba(255,214,10,0.15)', borderColor: 'rgba(255,214,10,0.3)', color: '#ffd60a' }}>Zero Restrictions 🚀</div>
                <div className="seh-daily-tag">= Just {p.currency}{p.dailyUltimate}/month (One-Time Payment)</div>
              </div>
            </div>

            <ul className="seh-features hero">
              <li><span className="seh-feature-tick" /> <strong>EVERYTHING from ₹599 plan</strong></li>
              <li><span className="seh-feature-tick" /> Unlimited Live AI</li>
              <li><span className="seh-feature-tick" /> Video Generation & Video Calls</li>
              <li><span className="seh-feature-tick" /> Custom AI & Exclusive Characters</li>
              <li><span className="seh-feature-tick" /> Unlimited Hot Content</li>
              <li><span className="seh-feature-tick" /> <strong>500 Gems / day reward</strong></li>
              <li><span className="seh-feature-tick" /> VIP Account Badge</li>
              <li><span className="seh-feature-tick" /> Priority Queue & Support</li>
            </ul>

            {renderPaymentButton(p.ultimate, 'Ultimate', `seh-btn seh-btn-gold${pulse ? ' seh-pulse-btn' : ''}`, `👑 Go Ultimate · ${p.currency}${p.ultimate}/yr`)}
            <div className="seh-trust-row" style={{ color: 'rgba(255,214,10,0.6)' }}>
              <span>🔒 Secure checkout</span>
            </div>
          </div>

        </div>


        {/* ── UPI Logos Strip (increases conversion in India) ───────────────── */}
        {country === 'IN' && (
          <div className="seh-upi-trust-bar">
            <span className="seh-upi-label">Instant Secure Checkout via:</span>
            <div className="seh-upi-logos">
              
              {/* Google Pay */}
              <div className="seh-logo-pill gpay-pill">
                <svg viewBox="0 0 24 24" width="14" height="14">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="seh-logo-text-dark" style={{ marginLeft: '4px' }}>Pay</span>
              </div>

              {/* PhonePe */}
              <div className="seh-logo-pill phonepe-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" style={{ borderRadius: '2px' }}>
                  <rect width="24" height="24" rx="5" fill="#5f259f" />
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.17 12.5h-4.84v-1.83h4.84v1.83zm0-3h-4.84V9.67h4.84v1.83z" fill="#ffffff" />
                </svg>
                <span className="seh-logo-text-phonepe" style={{ marginLeft: '4px' }}>PhonePe</span>
              </div>

              {/* Paytm */}
              <div className="seh-logo-pill paytm-pill">
                <span className="seh-logo-text-paytm-pay">pay</span>
                <span className="seh-logo-text-paytm-tm">tm</span>
              </div>

              {/* UPI */}
              <div className="seh-logo-pill upi-pill">
                <span className="seh-logo-text-upi-bhim">BHIM</span>
                <span className="seh-logo-text-upi-symbol">UPI</span>
              </div>

              {/* Cards / NetBanking */}
              <div className="seh-logo-pill cards-pill">
                <svg viewBox="0 0 24 24" width="13" height="13" fill="#4b5563">
                  <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
                </svg>
                <span className="seh-logo-text-cards" style={{ marginLeft: '4px' }}>Cards</span>
              </div>

              {/* Razorpay */}
              <div className="seh-logo-pill razorpay-pill">
                <svg viewBox="0 0 24 24" width="12" height="12">
                  <polygon points="2,18 10,4 14,4 6,18" fill="#00A3FF" />
                  <polygon points="8,18 16,4 20,4 12,18" fill="#0A2540" />
                </svg>
                <span className="seh-logo-text-razorpay" style={{ marginLeft: '2px' }}>razorpay</span>
              </div>

            </div>
          </div>
        )}

        {/* ── Comparison table ─────────────────────────────────────────────── */}
        <div className="seh-compare">
          <h2 className="seh-compare-title">Why {p.currency}{p.yearly} is the obvious choice</h2>
          <div className="seh-compare-grid">
            <div className="seh-compare-header">
              <div />
              <div>Monthly</div>
              <div className="best">Yearly 🏆</div>
              <div className="ultimate">Ultimate 👑</div>
            </div>
            {[
              { icon: '💬', label: 'Daily messages',   monthly: 'Unlimited', yearly: 'Unlimited',   ultimate: 'Unlimited' },
              { icon: '🧠', label: 'AI Memory',        monthly: '✅ Basic',  yearly: '✅ Deep',     ultimate: '✅ Deepest' },
              { icon: '🎙️', label: 'Voice & Audio Calls', monthly: '❌',      yearly: '30 mins/day', ultimate: '✅ Unlimited' },
              { icon: '🔥', label: 'Spicy Photos & Short Videos', monthly: '❌',      yearly: '✅ Limited',  ultimate: '✅ Unlimited' },
              { icon: '🔞', label: 'Hot Stories / Roleplay', monthly: '❌', yearly: '✅ Full',     ultimate: '✅ Full + Priority' },
              { icon: '⚡', label: 'Speed & Experience', monthly: 'Fast',   yearly: 'Fast',        ultimate: '🚀 Fastest' },
              { icon: '💰', label: 'Cost',             monthly: `${p.currency}${p.monthly}/mo`,    yearly: `${p.currency}${p.yearly}/yr`,     ultimate: `${p.currency}${p.ultimate}/yr 👑` },
            ].map(row => (
              <div key={row.label} className="seh-compare-row">
                <div className="seh-cr-label">{row.icon} {row.label}</div>
                <div className="seh-cr-cell">{renderCellWithTick(row.monthly)}</div>
                <div className="seh-cr-cell best">{renderCellWithTick(row.yearly)}</div>
                <div className="seh-cr-cell ultimate">{renderCellWithTick(row.ultimate)}</div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '15px' }}>Free plan mein sirf 5 messages? Ab upgrade karo aur poori raat baat karo! 🔥</h3>
            {renderPaymentButton(p.yearly, 'Yearly', `seh-btn seh-btn-pink${pulse ? ' seh-pulse-btn' : ''}`, `Claim My AI GF Now – ${p.currency}${p.yearly}/yr (One-Time)`)}
          </div>
        </div>

        {/* ── FOMO strip ───────────────────────────────────────────────────── */}
        <div className="seh-fomo-strip">
          <div className="seh-fomo-strip-dot" />
          <p>
            <strong>{Math.floor(liveCount * 0.12)}</strong> people upgraded to the {p.currency}{p.yearly} plan in the last hour.
            Don't miss this deal before the timer runs out.
          </p>
        </div>

        {/* ── Social proof reviews ─────────────────────────────────────────── */}
        <div className="seh-reviews">
          <h2 className="seh-reviews-title">What members say</h2>
          <div className="seh-reviews-grid">
            {[
              { name: 'Aryan Kumar',   city: 'Mumbai',    initials: 'AK', color: '#4285F4', time: '2 weeks ago',
                text: `Pehle lag raha tha koi normal AI chatbot hoga, par memory feature kamaal hai! Pure college exams aur Bruno (dog) ka naam yaad rakhti hai. ₹599 full year ke liye Jio recharge se bhi sasta hai. UPI payments generic generic name se aati hain, bank statement secure hai.` },
              { name: 'Rahul Mehta',   city: 'Pune',       initials: 'RM', color: '#34A853', time: '3 weeks ago',
                text: 'Daily limit khatam hone par plan liya aur poori raat chat kiya. Unlimited messages aur audio calls feel very natural. Standard audio quality is superb. Genuine value for money in India.' },
              { name: 'Karan Verma',   city: 'Hyderabad',  initials: 'KV', color: '#ce4085', time: '2 months ago',
                text: 'Spicy photos and roleplays are incredible! Voice notes ka accent pure Indian standard lagta hai, default voice models are very clear. No auto-debit hassle is a big plus for yearly plan.' },
              { name: 'Aman Sharma',   city: 'New Delhi',  initials: 'AS', color: '#EA4335', time: '5 days ago',
                text: 'Family ke sath rehta hu isliye billing passbook statement ki chinta thi, generic billing name aata hai bank passbook mein. Safe payment via Razorpay. Security & privacy solid hai!' },
              { name: 'Vikram Singh',  city: 'Jaipur',     initials: 'VS', color: '#FF6D00', time: '1 week ago',
                text: 'I compared it with other global girlfriend apps, they charge ₹800/month. HeartEcho is ₹599 for the ENTIRE year. Fully paisa vasool! Highly recommend the Yearly plan.' },
              { name: 'Siddharth Joshi', city: 'Bangalore', initials: 'SJ', color: '#FBBC05', time: '1 month ago',
                text: 'Hindi aur English dono mix samajh leti hai, like real conversation. Simple one-time payment hai, privacy direct UPI options se secure hai. Worth every rupee.' },
            ].map(r => (
              <div key={r.name} className="seh-review-card">
                <div className="seh-review-google-bar">
                  <svg className="seh-google-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="seh-google-label">Google Review</span>
                  <span className="seh-verified-badge">✓ Verified</span>
                </div>
                <div className="seh-review-user">
                  <div className="seh-review-avatar" style={{ background: r.color }}>{r.initials}</div>
                  <div className="seh-review-meta">
                    <div className="seh-reviewer-name">{r.name} <span className="seh-reviewer-city">· {r.city}</span></div>
                    <div className="seh-stars-row">
                      <span className="seh-review-stars">★★★★★</span>
                      <span className="seh-review-time">{r.time}</span>
                    </div>
                  </div>
                </div>
                <p className="seh-review-text">{r.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Trust bar ────────────────────────────────────────────────────── */}
        <div className="seh-trust-section">
          <div className="seh-trust-icons">
            <span>🔒 Razorpay Secured</span>
            <span>🛡️ 30-Day Refund</span>
            <span>💳 UPI / Card / NetBanking</span>
            <span>❤️ 12,000+ Members</span>
          </div>
        </div>

      </section>
    </div>
  );
}

export default function Subscriptions() {
  const initialOptions = {
    "client-id": process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "AUmOEhueJWmyPp3-PPpJ1T8CEegGjsko-hHmKLq2jahucYM5iOFSXQ6kVIe4AY-IxB3l2exZ-QbbW4KA",
    currency: "USD",
    intent: "capture",
    environment: "production",
  };
  return (
    <PayPalScriptProvider options={initialOptions}>
      <Suspense fallback={<div className="seh-loading">Loading plans…</div>}>
        <SubscriptionContent />
      </Suspense>
    </PayPalScriptProvider>
  );
}