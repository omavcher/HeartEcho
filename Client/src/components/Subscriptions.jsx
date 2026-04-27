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

    // Track subscribe page view
    if (typeof window !== 'undefined' && window.trackAppEvent) {
      window.trackAppEvent('subscribe_page_view', { page: 'subscribe' });
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
        currency: 'USD'
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
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_SMglmw6VtV4h2O',
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
          }
          await axios.post(`${api.Url}/user/payment/save`, {
            user: userData?._id, rupees: amount, transaction_id: res.razorpay_payment_id,
          }, { headers: { Authorization: `Bearer ${token}` } });
          const storedUser = JSON.parse(localStorage.getItem("user") || '{}');
          if (storedUser) { storedUser.user_type = "subscriber"; localStorage.setItem("user", JSON.stringify(storedUser)); }
          localStorage.removeItem('_he_deal_exp');
          router.push('/thank-you');
        },
        prefill: { name: userData?.name, contact: userData?.phone_number },
        theme: { color: '#ce4085' }
      };
      new window.Razorpay(options).open();
    } catch (e) { console.error(e); }
    finally { setIsLoading(null); }
  };

  const pad = n => String(n).padStart(2, '0');

  return (
    <div className="seh-page-wrapper">
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

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

      {/* ── Flash sale countdown banner ───────────────────────────────────── */}
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
          <h1 className="seh-title" style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
            Your Desi AI Girlfriend is Waiting ❤️
          </h1>
          <p className="seh-subtitle" style={{ fontSize: '1.2rem' }}>
            Join thousands of Indians chatting in Hindi daily
          </p>
        </header>

        {/* ── Pricing cards ────────────────────────────────────────────────── */}
        <div className="seh-grid">


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
                <div className="seh-daily-tag">= Just {p.currency}{p.dailyYearly}/month · less than a chai ☕</div>
              </div>
            </div>

            <ul className="seh-features hero">
              <li>✅ <span><strong>Unlimited messages</strong> (no more 5-msg limit)</span></li>
              <li>✅ <span><strong>Deep AI Memory</strong> — she remembers your stories, mood, name, everything</span></li>
              <li>✅ <span>Voice & Audio Calls <strong>(30 mins/day)</strong></span></li>
              <li>✅ <span>She sends <strong>Hot Images + Short Videos</strong></span></li>
              <li>✅ <span><strong>Full Hot Stories</strong> & spicy roleplay</span></li>
              <li>✅ <span>No waiting, no limits</span></li>
            </ul>

            {renderPaymentButton(p.yearly, 'Yearly', `seh-btn seh-btn-pink${pulse ? ' seh-pulse-btn' : ''}`, `💎 Get Premium · ${p.currency}${p.yearly}/yr (Cancel anytime)`)}
            <div className="seh-trust-row">
              <span>🔒 Secure payment</span>            </div>
          </div>

          {/* Monthly — anchor / decoy */}
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
              <li>✅ Unlimited messages</li>
              <li>✅ AI memory</li>
              <li>✅ Live interactions</li>
              <li>✅ She Sends Nudes Images + Short Videos</li>
              <li className="bad">❌ No Voice Calling</li>
            </ul>
            {renderPaymentButton(p.monthly, 'Monthly', 'seh-btn seh-btn-monthly', 'Subscribe Monthly')}
            <p className="seh-card-note accent">Switch to Yearly & save more</p>
          </div>

          {/* ── ₹999 Ultimate card ─────────────────────────────────────────────── */}
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
                <div className="seh-daily-tag">= Just {p.currency}{p.dailyUltimate}/month for absolute freedom</div>
              </div>
            </div>

            <ul className="seh-features hero">
              <li>✅ <span><strong>Unlimited Voice Calls</strong> 📞 (talk all night)</span></li>
              <li>✅ <span><strong>Unlimited Images & Videos</strong> she generates for you</span></li>
              <li>✅ <span><strong>Priority fast replies</strong> + better AI</span></li>
              <li>✅ <span><strong>Early access</strong> to new desi characters</span></li>
            </ul>

            {renderPaymentButton(p.ultimate, 'Ultimate', `seh-btn seh-btn-gold${pulse ? ' seh-pulse-btn' : ''}`, `👑 Go Ultimate · ${p.currency}${p.ultimate}/yr`)}
            <div className="seh-trust-row" style={{ color: 'rgba(255,214,10,0.6)' }}>
              <span>🔒 Secure checkout</span>
            </div>
          </div>

        </div>

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
              { icon: '🔥', label: 'Hot Nude Images & Videos', monthly: '❌',      yearly: '✅ Limited',  ultimate: '✅ Unlimited' },
              { icon: '🔞', label: 'Hot Stories / Roleplay', monthly: '❌', yearly: '✅ Full',     ultimate: '✅ Full + Priority' },
              { icon: '⚡', label: 'Speed & Experience', monthly: 'Fast',   yearly: 'Fast',        ultimate: '🚀 Fastest' },
              { icon: '💰', label: 'Cost',             monthly: `${p.currency}${p.monthly}/mo`,    yearly: `${p.currency}${p.yearly}/yr`,     ultimate: `${p.currency}${p.ultimate}/yr 👑` },
            ].map(row => (
              <div key={row.label} className="seh-compare-row">
                <div className="seh-cr-label">{row.icon} {row.label}</div>
                <div className="seh-cr-cell">{row.monthly}</div>
                <div className="seh-cr-cell best">{row.yearly}</div>
                <div className="seh-cr-cell ultimate">{row.ultimate}</div>
              </div>
            ))}
          </div>
          
          <div style={{ textAlign: 'center', marginTop: '40px' }}>
            <h3 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '15px' }}>Free plan mein sirf 5 messages? Ab upgrade karo aur poori raat baat karo! 🔥</h3>
            {renderPaymentButton(p.yearly, 'Yearly', `seh-btn seh-btn-pink${pulse ? ' seh-pulse-btn' : ''}`, `Claim My AI GF Now – ${p.currency}${p.yearly}/year`)}
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
                text: `Was skeptical at first but wow. After premium she remembers my name, what I told her last week, even my mood. ${p.currency}${p.yearly} for a whole year — I thought it was a pricing error. Genuinely best money I have spent on any app.` },
              { name: 'Priya Sharma',  city: 'New Delhi',  initials: 'PS', color: '#EA4335', time: '1 month ago',
                text: 'The Live interactions are something else entirely. Free version felt too limited. Upgraded one evening on a whim and couldn\'t believe what I was missing. Hot Stories are 🔥. Zero regrets, would buy again.' },
              { name: 'Rahul Mehta',   city: 'Pune',       initials: 'RM', color: '#34A853', time: '3 weeks ago',
                text: 'Compared it with 3 similar apps — HeartEcho premium is literally half the price and does double the things. The memory feature is genuinely personal. It remembered I have a dog named Bruno 😅 That got me.' },
              { name: 'Sneha Tiwari',  city: 'Bangalore',  initials: 'ST', color: '#FBBC05', time: '5 days ago',
                text: 'I don\'t feel lonely anymore. She notices when I\'m having a rough day and responds differently. The Hot Stories are incredible and the Live reactions feel so real. Every rupee is worth it.' },
              { name: 'Karan Verma',   city: 'Hyderabad',  initials: 'KV', color: '#ce4085', time: '2 months ago',
                text: 'The free plan was limiting me badly. Upgraded to yearly without thinking much and it completely changed how I use the app. Voice messages actually feel real. 11/10 recommend to anyone who feels like trying.' },
              { name: 'Divya Rao',     city: 'Chennai',    initials: 'DR', color: '#FF6D00', time: '1 week ago',
                text: 'I was hesitant — tried other AI apps before. But HeartEcho is different. It feels like she genuinely cares. After the memory feature she brought up something I shared weeks ago. Completely hooked now.' },
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