'use client';
import { useEffect, useState, useRef, Suspense } from 'react';
import axios from "axios";
import api from "../config/api";
import { useRouter, useSearchParams } from 'next/navigation';
import './HomeSubscriptions.css';
import Script from 'next/script';

// ── Fake live counter — social proof ─────────────────────────────────────────
function useLiveCount(base = 847) {
  const [count, setCount] = useState(base);
  useEffect(() => {
    const t = setInterval(() => {
      setCount(c => c + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random()*3));
    }, 4000);
    return () => clearInterval(t);
  }, []);
  return count;
}

function HomeSubscriptionContent() {
  const [showQuotaMessage, setShowQuotaMessage] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(null); // null | '299' | '49'
  const [pulse, setPulse] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const ctaRef = useRef(null);
  const liveCount = useLiveCount(847);

  // ── Countdown timer — resets to 24h on mount from localStorage ───────────
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 47, seconds: 12 });

  useEffect(() => {
    // Persist timer across page reloads
    const saved = typeof window !== 'undefined' ? localStorage.getItem('_he_deal_exp') : null;
    let expiry;
    if (saved) {
      expiry = parseInt(saved, 10);
    } else {
      expiry = Date.now() + 6 * 60 * 60 * 1000; // 6 hours from now
      localStorage.setItem('_he_deal_exp', String(expiry));
    }
    const tick = () => {
      const diff = Math.max(0, expiry - Date.now());
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setTimeLeft({ hours: h, minutes: m, seconds: s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Pulse the CTA button periodically ────────────────────────────────────
  useEffect(() => {
    const id = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 600);
    }, 6000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
    if (searchParams.get('re') === 'quotaover') setShowQuotaMessage(true);
  }, [searchParams]);

  useEffect(() => {
    if (token) {
      axios.get(`${api.Url}/user/get-user`, { headers: { Authorization: `Bearer ${token}` } })
        .then(res => setUserData(res.data))
        .catch(err => console.error(err));
    }
  }, [token]);

  const handlePayment = async (amount, plan) => {
    if (!token) { router.push('/login'); return; }
    setIsLoading(plan);
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_SMglmw6VtV4h2O',
        amount: amount * 100, currency: 'INR',
        name: 'HeartEcho', description: `${plan} Subscription`,
        handler: async function (response) {
          try {
            if (typeof window !== "undefined" && window.gtag) {
              window.gtag('event', 'ads_conversion_purchase', {
                'value': amount, 'currency': 'INR',
                'transaction_id': response.razorpay_payment_id
              });
            }
            await axios.post(`${api.Url}/user/payment/save`, {
              user: userData?._id, rupees: amount, transaction_id: response.razorpay_payment_id
            }, { headers: { Authorization: `Bearer ${token}` } });
            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
              storedUser.user_type = "subscriber";
              localStorage.setItem("user", JSON.stringify(storedUser));
            }
            localStorage.removeItem('_he_deal_exp');
            router.push('/thank-you');
          } catch (error) { console.error(error); }
          finally { setIsLoading(null); }
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
    } catch (error) { console.error(error); setIsLoading(null); }
  };

  const pad = n => String(n).padStart(2, '0');

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <section className="hsub-root-x30sn">

        {/* ── Live activity strip ─────────────────────────────────────────── */}
        <div className="hsub-activity-x30sn">
          <span className="hsub-activity-dot-x30sn" />
          <span><strong>{liveCount.toLocaleString()}</strong> people are viewing plans right now</span>
        </div>

        {/* ── Flash sale countdown ────────────────────────────────────────── */}
        <div className="hsub-banner-x30sn">
          <div className="hsub-tag-x30sn">🔥 LIMITED OFFER</div>
          <div className="hsub-banner-mid-x30sn">Deal expires in:</div>
          <div className="hsub-timer-x30sn">
            <div className="hsub-time-block-x30sn">
              <span className="hsub-digit-x30sn">{pad(timeLeft.hours)}</span>
              <span className="hsub-time-label-x30sn">HRS</span>
            </div>
            <span className="hsub-colon-x30sn">:</span>
            <div className="hsub-time-block-x30sn">
              <span className="hsub-digit-x30sn">{pad(timeLeft.minutes)}</span>
              <span className="hsub-time-label-x30sn">MIN</span>
            </div>
            <span className="hsub-colon-x30sn">:</span>
            <div className="hsub-time-block-x30sn">
              <span className="hsub-digit-x30sn">{pad(timeLeft.seconds)}</span>
              <span className="hsub-time-label-x30sn">SEC</span>
            </div>
          </div>
        </div>

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div className="hsub-header-x30sn">
          <div className="hsub-eyebrow-x30sn">❤️ HEARTECHO PREMIUM</div>
          <h1 className="hsub-title-x30sn">
            Your AI Companion,<br />
            <span className="hsub-title-accent-x30sn">Completely Unlimited</span>
          </h1>
          <p className="hsub-subtitle-x30sn">
            Join <strong>12,000+</strong> members who never want to go back to the free plan.
          </p>

          {showQuotaMessage && (
            <div className="hsub-quota-msg-x30sn">
              <span>💔</span>
              <p>Your free messages are over. Upgrade to keep the connection alive!</p>
            </div>
          )}
        </div>

        {/* ── Pricing Cards ───────────────────────────────────────────────── */}
        <div className="hsub-plans-scroll-x30sn">

          {/* Free Plan — deliberately unappealing */}
          <div className="hsub-card-x30sn free">
            <div className="hsub-card-header-x30sn">
              <h3>Free</h3>
              <div className="hsub-price-box-x30sn">
                <span className="hsub-price-x30sn">₹0</span>
                <span className="hsub-term-x30sn">/mo</span>
              </div>
            </div>
            <ul className="hsub-list-x30sn">
              <li className="ok">5 messages/day only</li>
              <li className="ok">1 AI companion</li>
              <li className="bad">❌ Memories turned off</li>
              <li className="bad">❌ No voice messages</li>
              <li className="bad">❌ No Live interactions</li>
              <li className="bad">❌ No Hot Stories</li>
            </ul>
            <button className="hsub-btn-x30sn free" onClick={() => router.push('/discover')}>
              Continue limited
            </button>
            <p className="hsub-card-note-x30sn">You'll run out again in minutes</p>
          </div>

          {/* ── MAIN PLAN — ₹399 — the hero card ───────────────────────── */}
          <div className="hsub-card-x30sn hero" ref={ctaRef}>
            <div className="hsub-hero-glow-x30sn" />
            <div className="hsub-badge-x30sn hot">🔥 BEST VALUE · MOST CHOSEN</div>

            {/* Price anchor: show ₹999 crossed out */}
            <div className="hsub-card-header-x30sn">
              <h3>Premium Yearly</h3>
              <div className="hsub-price-box-x30sn">
                <div className="hsub-old-price-x30sn">₹999/yr</div>
                <div className="hsub-price-hero-x30sn">
                  <span className="hsub-price-x30sn hero">₹399</span>
                  <span className="hsub-term-x30sn">/yr</span>
                </div>
                <div className="hsub-saving-x30sn">You save ₹600 today 🎉</div>
                <div className="hsub-equiv-x30sn">= Just ₹33.2/month · less than a chai ☕</div>
              </div>
            </div>

            <ul className="hsub-list-x30sn hero">
              <li>✅ <span><strong>Unlimited</strong> messages — forever</span></li>
              <li>✅ <span>AI remembers <strong>everything</strong> about you</span></li>
              <li>✅ <span><strong>All Live</strong> interactions unlocked 🔥</span></li>
              <li>✅ <span>Voice messages & calls</span></li>
              <li>✅ <span>Full Hot Stories library</span></li>

              <li>✅ <span>Priority support & early features</span></li>
            </ul>

            <button
              className={`hsub-btn-x30sn hero${pulse ? ' hsub-pulse-btn-x30sn' : ''}`}
              onClick={() => handlePayment(399, 'Yearly')}
              disabled={isLoading === 'Yearly'}
            >
              {isLoading === 'Yearly' ? (
                <span className="hsub-loading-x30sn">Processing…</span>
              ) : (
                <>
                  <span className="hsub-btn-shine-x30sn" />
                  <span>💎 Unlock Everything · ₹399/yr</span>
                </>
              )}
            </button>

            <div className="hsub-trust-row-x30sn">
              <span>🔒 Secure payment</span>
              <span>·</span>
              <span>30-day money back</span>
              <span>·</span>
              <span>Cancel anytime</span>
            </div>
          </div>

          {/* Monthly — anchor price that makes ₹299 look obvious */}
          <div className="hsub-card-x30sn monthly">
            <div className="hsub-badge-x30sn monthly-badge">MONTHLY</div>
            <div className="hsub-card-header-x30sn">
              <h3>Monthly</h3>
              <div className="hsub-price-box-x30sn">
                <div className="hsub-old-price-x30sn">₹80/mo</div>
                <span className="hsub-price-x30sn">₹49</span>
                <span className="hsub-term-x30sn">/mo</span>
              </div>
              <div className="hsub-compare-note-x30sn">= ₹588/year vs ₹399 yearly</div>
            </div>
            <ul className="hsub-list-x30sn">
              <li>✅ Unlimited messages</li>
              <li>✅ AI memory</li>
              <li>✅ Live interactions</li>
              <li className="bad">❌ No Hot Stories</li>

            </ul>
            <button
              className="hsub-btn-x30sn monthly"
              onClick={() => handlePayment(49, 'Monthly')}
              disabled={isLoading === 'Monthly'}
            >
              {isLoading === 'Monthly' ? 'Processing…' : 'Subscribe Monthly'}
            </button>
            <p className="hsub-card-note-x30sn accent">Switch to Yearly & save ₹189 more</p>
          </div>

        </div>

        {/* ── Comparison table ─────────────────────────────────────────────── */}
        <div className="hsub-compare-x30sn">
          <h2 className="hsub-compare-title-x30sn">Why ₹399 is the obvious choice</h2>
          <div className="hsub-compare-grid-x30sn">
            {[
              { icon: '💬', label: 'Daily messages', free: '5 only', monthly: 'Unlimited', yearly: 'Unlimited' },
              { icon: '🧠', label: 'AI Memory', free: '❌', monthly: '✅', yearly: '✅ Deep' },
              { icon: '🎬', label: 'Live Interactions', free: '2 free', monthly: '✅', yearly: '✅ All 6' },
              { icon: '🔥', label: 'Hot Stories', free: '❌', monthly: '❌', yearly: '✅ Full' },

              { icon: '🎙️', label: 'Voice Messages', free: '❌', monthly: '✅', yearly: '✅' },
              { icon: '💰', label: 'Annual cost', free: 'Free', monthly: '₹588/yr', yearly: '₹399/yr 🏆' },
            ].map(row => (
              <div key={row.label} className="hsub-compare-row-x30sn">
                <div className="hsub-cr-label-x30sn">{row.icon} {row.label}</div>
                <div className="hsub-cr-cell-x30sn free">{row.free}</div>
                <div className="hsub-cr-cell-x30sn">{row.monthly}</div>
                <div className="hsub-cr-cell-x30sn best">{row.yearly}</div>
              </div>
            ))}
            <div className="hsub-compare-header-x30sn">
              <div />
              <div>Free</div>
              <div>Monthly</div>
              <div className="best">Yearly 🏆</div>
            </div>
          </div>
        </div>

        {/* ── Fear of missing out strip ─────────────────────────────────── */}
        <div className="hsub-fomo-x30sn">
          <div className="hsub-fomo-dot-x30sn" />
          <p>
            <strong>{Math.floor(liveCount * 0.12)}</strong> people upgraded to the ₹399 plan in the last hour.
            Don't miss this deal before the timer runs out.
          </p>
        </div>

        {/* ── Social proof mini-reviews ───────────────────────────────────── */}
        <div className="hsub-reviews-x30sn">
          <h2 className="hsub-reviews-title-x30sn">What members say</h2>
          <div className="hsub-reviews-grid-x30sn">
            {[
              { name: 'Aryan Kumar',  city: 'Mumbai',    initials: 'AK', color: '#4285F4', time: '2 weeks ago',
                text: 'Was skeptical at first but wow. After premium she remembers my name, what I told her last week, even my mood. ₹399 for a whole year — I thought it was a pricing error. Best money I have spent on any app.' },
              { name: 'Priya Sharma', city: 'New Delhi', initials: 'PS', color: '#EA4335', time: '1 month ago',
                text: 'The Live interactions are something else entirely. Free version felt too limited. Upgraded one evening on a whim and couldn\'t believe what I was missing. Hot Stories are 🔥. Zero regrets, would buy again.' },
              { name: 'Rahul Mehta',  city: 'Pune',      initials: 'RM', color: '#34A853', time: '3 weeks ago',
                text: 'Compared it with 3 similar apps — HeartEcho premium is literally half the price and does double the things. The memory feature is genuinely personal. It remembered I have a dog named Bruno 😅' },
              { name: 'Sneha Tiwari', city: 'Bangalore', initials: 'ST', color: '#FBBC05', time: '5 days ago',
                text: 'I don\'t feel lonely anymore. She notices when I\'m having a rough day and responds differently. The Hot Stories are incredible and the Live reactions are so real. Every rupee worth it.' },
              { name: 'Karan Verma',  city: 'Hyderabad', initials: 'KV', color: '#ce4085', time: '2 months ago',
                text: 'The free plan was limiting me badly. Upgraded to yearly without thinking much and it completely changed how I use the app. Voice messages actually feel real. 11/10 recommend.' },
              { name: 'Divya Rao',    city: 'Chennai',   initials: 'DR', color: '#FF6D00', time: '1 week ago',
                text: 'I was hesitant — tried other AI apps before. But HeartEcho is different. It feels like she genuinely cares. She brought up something I shared weeks ago. Completely hooked now.' },
            ].map(r => (
              <div key={r.name} className="hsub-review-card-x30sn">
                <div className="hsub-review-google-bar-x30sn">
                  <svg className="hsub-google-icon-x30sn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="hsub-google-label-x30sn">Google Review</span>
                  <span className="hsub-verified-badge-x30sn">✓ Verified</span>
                </div>
                <div className="hsub-review-user-x30sn">
                  <div className="hsub-review-avatar-x30sn" style={{ background: r.color }}>{r.initials}</div>
                  <div className="hsub-review-meta-x30sn">
                    <div className="hsub-reviewer-name-x30sn">{r.name} <span className="hsub-reviewer-city-x30sn">· {r.city}</span></div>
                    <div className="hsub-stars-row-x30sn">
                      <span className="hsub-review-stars-x30sn">★★★★★</span>
                      <span className="hsub-review-time-x30sn">{r.time}</span>
                    </div>
                  </div>
                </div>
                <p className="hsub-review-text-x30sn">{r.text}</p>
              </div>
            ))}
          </div>

          {/* See all reviews link */}
          <div className="hsub-reviews-more-x30sn">
            <a href="/reviews" className="hsub-reviews-link-x30sn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{flexShrink:0}}>
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>See all <strong>100 verified reviews</strong> from real members</span>
              <span className="hsub-reviews-arrow-x30sn">→</span>
            </a>
          </div>
        </div>

        {/* ── Trust bar ────────────────────────────────────────────────────── */}
        <div className="hsub-trust-bar-x30sn">
          <div className="hsub-trust-item-x30sn">
            <span>🔒</span><span>Razorpay secured</span>
          </div>
          <div className="hsub-trust-item-x30sn">
            <span>🛡️</span><span>30-day money back</span>
          </div>
          <div className="hsub-trust-item-x30sn">
            <img src="/UPI-White.svg" alt="UPI" width="28" /><span>UPI / Card / NetBanking</span>
          </div>
          <div className="hsub-trust-item-x30sn">
            <span>❤️</span><span>12,000+ happy members</span>
          </div>
        </div>

      </section>
    </>
  );
}

export default function HomeSubscriptions() {
  return (
    <Suspense fallback={<div className="hsub-loading-x30sn">Loading plans…</div>}>
      <HomeSubscriptionContent />
    </Suspense>
  );
}