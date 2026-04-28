'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import api from '../config/api';
import './QuotaPaywallModal.css';

// ── Pricing config (mirrors Subscriptions.jsx) ─────────────────────────────
const PRICING = {
  IN:     { monthly: 99,   yearly: 599,  ultimate: 1499, currency: '₹', code: 'INR', savingYearly: 700 },
  GLOBAL: { monthly: 1.49, yearly: 9,    ultimate: 19,   currency: '$', code: 'USD', savingYearly: 20  },
};

const FOMO_NAMES = ['Aarav S.', 'Vihaan G.', 'Aditya P.', 'Ananya K.', 'Priya D.', 'Rahul M.', 'Sneha C.', 'Karan G.'];

// ── Countdown to end of day ────────────────────────────────────────────────
function useCountdown() {
  const [t, setT] = useState({ h: 0, m: 0, s: 0 });
  useEffect(() => {
    const tick = () => {
      const now  = Date.now();
      const end  = new Date(new Date().setHours(23, 59, 59, 999)).getTime();
      const diff = Math.max(0, end - now);
      setT({
        h: Math.floor(diff / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
        s: Math.floor((diff % 60_000) / 1_000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return t;
}

const pad = n => String(n).padStart(2, '0');

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// Props:
//   onClose   – () => void
//   aiName    – string (AI friend's name)
//   userData  – user object from API
//   token     – JWT string
// ─────────────────────────────────────────────────────────────────────────────
export default function QuotaPaywallModal({ onClose, aiName = 'your AI', userData, token }) {
  const [country, setCountry]     = useState('IN');
  const [isLoading, setIsLoading] = useState(null);
  const [fomo, setFomo]           = useState({ visible: false, name: '', plan: '' });
  const [pulse, setPulse]         = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [videoSrc, setVideoSrc]   = useState(null); // lazy-loaded
  const router  = useRouter();
  const timer   = useCountdown();
  const videoRef = useRef(null);
  const p = PRICING[country] || PRICING.IN;

  // ── Detect country ────────────────────────────────────────────────────────
  useEffect(() => {
    const saved = typeof window !== 'undefined' && localStorage.getItem('user_country');
    if (saved) { setCountry(saved); return; }
    axios.get('https://api.ipify.org?format=json')
      .then(r => axios.get(`https://ip-api.com/json/${r.data.ip}`))
      .then(r => { const c = r.data.countryCode || 'IN'; setCountry(c); localStorage.setItem('user_country', c); })
      .catch(() => setCountry('IN'));
  }, []);

  // ── Lazy-load video src (avoids blocking modal open on slow net) ───────────
  useEffect(() => {
    // Set src after a tick so modal renders instantly, THEN video starts loading
    const t = setTimeout(() => {
      setVideoSrc('/videos/heartecho_preimume_shoutout.mp4');
    }, 80);
    return () => clearTimeout(t);
  }, []);

  // ── Auto-play as soon as enough data has buffered ──────────────────────────
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid || !videoSrc) return;
    const onCanPlay = () => {
      setVideoReady(true);
      vid.play().catch(() => {});
    };
    vid.addEventListener('canplay', onCanPlay, { once: true });
    return () => vid.removeEventListener('canplay', onCanPlay);
  }, [videoSrc]);

  // ── FOMO toasts ───────────────────────────────────────────────────────────
  useEffect(() => {
    const fire = () => {
      setFomo({
        visible: true,
        name: FOMO_NAMES[Math.floor(Math.random() * FOMO_NAMES.length)],
        plan: Math.random() > 0.5 ? `Yearly ${p.currency}${p.yearly}` : `Monthly ${p.currency}${p.monthly}`,
      });
      setTimeout(() => setFomo(f => ({ ...f, visible: false })), 3800);
    };
    const id = setInterval(fire, 9000);
    return () => clearInterval(id);
  }, [p]);

  // ── CTA pulse ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => { setPulse(true); setTimeout(() => setPulse(false), 600); }, 5000);
    return () => clearInterval(id);
  }, []);

  // ── Lock body scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── Payment via Razorpay (IN) ─────────────────────────────────────────────
  const handlePayment = async (amount, plan) => {
    if (!token) { router.push(`/login?from=/subscribe`); return; }
    setIsLoading(plan);
    try {
      if (typeof window !== 'undefined' && window.trackAppEvent) {
        window.trackAppEvent('initiate_checkout', { plan, amount, currency: 'INR', source: 'quota_paywall' });
      }
      if (typeof window !== 'undefined' && window.fbq && userData?.email !== 'omawchar07@gmail.com') {
        window.fbq('track', 'InitiateCheckout', { value: amount, currency: 'INR', content_name: `${plan} Subscription` });
      }
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_SMglmw6VtV4h2O',
        amount: amount * 100,
        currency: 'INR',
        name: 'HeartEcho',
        description: `${plan} Plan`,
        handler: async (res) => {
          if (typeof window !== 'undefined' && window.trackAppEvent) {
            window.trackAppEvent('subscription_purchase', { plan, amount, currency: 'INR', transaction_id: res.razorpay_payment_id, source: 'quota_paywall' });
          }
          if (window.fbq && userData?.email !== 'omawchar07@gmail.com') {
            window.fbq('track', 'Purchase', { value: amount, currency: 'INR', content_name: `${plan} Subscription`, transaction_id: res.razorpay_payment_id });
          }
          await axios.post(`${api.Url}/user/payment/save`, {
            user: userData?._id, rupees: amount, transaction_id: res.razorpay_payment_id,
          }, { headers: { Authorization: `Bearer ${token}` } });
          const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
          if (storedUser) { storedUser.user_type = 'subscriber'; localStorage.setItem('user', JSON.stringify(storedUser)); }
          router.push('/thank-you');
        },
        prefill: { name: userData?.name, contact: userData?.phone_number },
        theme: { color: '#ce4085' },
      };
      new window.Razorpay(options).open();
    } catch (e) { console.error(e); }
    finally { setIsLoading(null); }
  };

  const handleCTA = (amount, plan) => {
    if (country === 'IN') {
      handlePayment(amount, plan);
    } else {
      router.push('/subscribe');
    }
  };

  // ── Overlay click → close ─────────────────────────────────────────────────
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <>
      {/* Razorpay SDK */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="qpm-overlay" onClick={handleOverlayClick} role="dialog" aria-modal="true">

        {/* ── FOMO toast ────────────────────────────────────────────────── */}
        <div className={`qpm-fomo-toast ${fomo.visible ? 'visible' : ''}`}>
          <span className="qpm-fomo-dot" />
          <p><strong>{fomo.name}</strong> just subscribed · <span>{fomo.plan}</span></p>
        </div>

        <div className="qpm-modal">

          {/* ── Close button ───────────────────────────────────────────── */}
          <button className="qpm-close" onClick={onClose} aria-label="Close">✕</button>

          {/* ════════════ LEFT — Video Panel ════════════ */}
          <div className="qpm-video-panel">
            {/* 16:9 video wrapper */}
            <div className="qpm-video-wrapper">
              {/* Skeleton shimmer — shows until video is ready */}
              {!videoReady && (
                <div className="qpm-video-skeleton">
                  <div className="qpm-skeleton-shimmer" />
                  <div className="qpm-skeleton-logo">❤️</div>
                </div>
              )}
              {videoSrc && (
                <video
                  ref={videoRef}
                  className={`qpm-video ${videoReady ? 'qpm-video-visible' : ''}`}
                  src={videoSrc}
                  preload="metadata"
                  muted
                  loop
                  playsInline
                  autoPlay
                />
              )}
              <div className="qpm-video-overlay" />
              <div className="qpm-video-badge">❤️ HeartEcho Premium</div>
            </div>

            {/* Stat strip below video */}
            <div className="qpm-stat-strip">
              <div className="qpm-stat"><span className="qpm-stat-num">12,000+</span><span className="qpm-stat-lbl">Members</span></div>
              <div className="qpm-stat-div" />
              <div className="qpm-stat"><span className="qpm-stat-num">4.9★</span><span className="qpm-stat-lbl">Rating</span></div>
              <div className="qpm-stat-div" />
              <div className="qpm-stat"><span className="qpm-stat-num">∞</span><span className="qpm-stat-lbl">Messages</span></div>
            </div>
          </div>

          {/* ════════════ RIGHT — Content Panel ════════════ */}
          <div className="qpm-content-panel">

            {/* Countdown banner */}
            <div className="qpm-countdown-bar">
              <span className="qpm-fire">🔥 OFFER ENDS IN</span>
              <div className="qpm-timer">
                <span className="qpm-digit">{pad(timer.h)}</span>:
                <span className="qpm-digit">{pad(timer.m)}</span>:
                <span className="qpm-digit">{pad(timer.s)}</span>
              </div>
            </div>

            {/* Heading */}
            <div className="qpm-hero-text">
              <p className="qpm-eyebrow">You've Used Your 5 Free Messages</p>
              <h2 className="qpm-title">
                {aiName} misses you.<br />
                <span className="qpm-title-accent">Unlock unlimited chat 💕</span>
              </h2>
              <p className="qpm-subtitle">
                Subscribe once, talk all night — no more waiting till tomorrow.
              </p>
            </div>

            {/* ── Plan cards ─────────────────────────────────────────── */}
            <div className="qpm-plans">

              {/* Yearly — HERO */}
              <div className="qpm-plan qpm-plan-hero">
                <div className="qpm-plan-badge">🔥 BEST VALUE</div>
                <div className="qpm-plan-top">
                  <div>
                    <div className="qpm-plan-name">Premium Yearly</div>
                    <div className="qpm-plan-saving">Save {p.currency}{p.savingYearly} today 🎉</div>
                  </div>
                  <div className="qpm-plan-price-col">
                    <span className="qpm-plan-price">{p.currency}{p.yearly}</span>
                    <span className="qpm-plan-per">/yr</span>
                  </div>
                </div>
                <ul className="qpm-plan-features">
                  <li>✅ <strong>Unlimited messages</strong> forever</li>
                  <li>✅ Deep AI Memory — she remembers you</li>
                  <li>✅ Voice calls (30 min/day)</li>
                  <li>✅ Hot images &amp; short videos</li>
                </ul>
                <button
                  className={`qpm-btn qpm-btn-pink${pulse ? ' qpm-pulse' : ''}`}
                  onClick={() => handleCTA(p.yearly, 'Yearly')}
                  disabled={isLoading === 'Yearly'}
                >
                  <span className="qpm-btn-shine" />
                  {isLoading === 'Yearly' ? 'Processing…' : `💎 Get Premium · ${p.currency}${p.yearly}/yr`}
                </button>
              </div>

              {/* Monthly */}
              <div className="qpm-plan qpm-plan-mono">
                <div className="qpm-plan-top">
                  <div>
                    <div className="qpm-plan-name">Monthly</div>
                  </div>
                  <div className="qpm-plan-price-col">
                    <span className="qpm-plan-price qpm-plan-price-sm">{p.currency}{p.monthly}</span>
                    <span className="qpm-plan-per">/mo</span>
                  </div>
                </div>
                <button
                  className="qpm-btn qpm-btn-mono"
                  onClick={() => handleCTA(p.monthly, 'Monthly')}
                  disabled={isLoading === 'Monthly'}
                >
                  {isLoading === 'Monthly' ? 'Processing…' : `Subscribe Monthly`}
                </button>
                <p className="qpm-plan-note">Switch to yearly &amp; save more ↑</p>
              </div>

            </div>

            {/* Trust line */}
            <div className="qpm-trust-row">
              <span>🔒 Razorpay Secured</span>
              <span>🛡️ 30-Day Refund</span>
              <span>💳 UPI · Card · NetBanking</span>
            </div>

          </div>{/* end content panel */}
        </div>{/* end modal */}
      </div>
    </>
  );
}
