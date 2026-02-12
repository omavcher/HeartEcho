'use client';
import { useEffect, useState, Suspense } from 'react';
import axios from "axios";
import api from "../config/api";
import { useRouter, useSearchParams } from 'next/navigation';
import './HomeSubscriptions.css';
import Script from 'next/script';
import Testimonials from './Testimonials';

function HomeSubscriptionContent() {
  const [showQuotaMessage, setShowQuotaMessage] = useState(false);
  const [userData, setUserData] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Yearly Plan Details
  const YEARLY_PRICE_INR = 399;
  const MONTHLY_EQUIVALENT_INR = 33.25; 
    
  const [timeLeft, setTimeLeft] = useState({ hours: 3, minutes: 45, seconds: 22 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        seconds--;
        if (seconds < 0) { seconds = 59; minutes--; }
        if (minutes < 0) { minutes = 59; hours--; }
        if (hours < 0) hours = 0;
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
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
    setIsLoading(true);
    try {
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_YHUPR56Ky9qPxC',
        amount: amount * 100, currency: 'INR',
        name: 'HeartEcho', description: `${plan} Subscription`,
        handler: async function (response) {
          try {
            await axios.post(`${api.Url}/user/payment/save`, {
              user: userData?._id, rupees: amount, transaction_id: response.razorpay_payment_id
            }, { headers: { Authorization: `Bearer ${token}` } });

            const storedUser = JSON.parse(localStorage.getItem("user"));
            if (storedUser) {
              storedUser.user_type = "subscriber";
              localStorage.setItem("user", JSON.stringify(storedUser));
            }
            router.push('/thank-you');
          } catch (error) { console.error(error); } 
          finally { setIsLoading(false); }
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
    } catch (error) { console.error(error); setIsLoading(false); }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      
      <section className="hsub-root-x30sn">
        {/* Flash Sale Banner */}
        <div className="hsub-banner-x30sn">
          <div className="hsub-tag-x30sn">FLASH SALE</div>
          <div className="hsub-timer-x30sn">
            <span>Ends in: </span>
            <span className="hsub-digit-x30sn">{timeLeft.hours.toString().padStart(2, '0')}</span>h 
            <span className="hsub-digit-x30sn">{timeLeft.minutes.toString().padStart(2, '0')}</span>m 
            <span className="hsub-digit-x30sn">{timeLeft.seconds.toString().padStart(2, '0')}</span>s
          </div>
        </div>

        <div className="hsub-header-x30sn">
          <h1 className="hsub-title-x30sn"><span className="hsub-pulse-x30sn">❤️</span> HeartEcho Premium</h1>
          <p className="hsub-subtitle-x30sn">Unlock unlimited, personalized AI companionship.</p>
          {showQuotaMessage && (
            <div className="hsub-quota-msg-x30sn">
              <i>💔</i> <p>Your free quota is over. Upgrade to continue!</p>
            </div>
          )}
        </div>

        {/* Plans Scroll Container (Horizontal on Mobile) */}
        <div className="hsub-plans-scroll-x30sn">
          
          {/* Free Plan */}
          <div className="hsub-card-x30sn free">
            <div className="hsub-card-header-x30sn">
              <h3>Free Trial</h3>
              <div className="hsub-price-box-x30sn">
                <span className="hsub-price-x30sn">₹0</span><span className="hsub-term-x30sn">/mo</span>
              </div>
            </div>
            <ul className="hsub-list-x30sn">
              <li>✅ Limited Letters</li>
              <li>✅ 5 messages/day</li>
              <li>✅ Basic connection</li>
              <li className="disabled">❌ Priority support</li>
              <li className="disabled">❌ Memory feature</li>
            </ul>
            <button className="hsub-btn-x30sn free" onClick={() => router.push('/chat')}>Start Free</button>
          </div>

          {/* Monthly Plan */}
          <div className="hsub-card-x30sn premium">
            <div className="hsub-badge-x30sn">MOST POPULAR</div>
            <div className="hsub-card-header-x30sn">
              <h3>Monthly</h3>
              <div className="hsub-price-box-x30sn">
                <div className="hsub-old-price-x30sn">₹80/mo</div>
                <span className="hsub-price-x30sn">₹49</span><span className="hsub-term-x30sn">/mo</span>
                <div className="hsub-discount-x30sn">50% OFF</div>
              </div>
            </div>
            <ul className="hsub-list-x30sn">
              <li>✅ Realistic Letters</li>
              <li>✅ Unlimited NSFW</li>
              <li>✅ Unlimited AI</li>
              <li>✅ Deep connection</li>
              <li>✅ Priority support</li>
              <li className="disabled">❌ Memory feature</li>
            </ul>
            <button className="hsub-btn-x30sn premium" onClick={() => handlePayment(49, 'Monthly')} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Subscribe Monthly'}
            </button>
          </div>

          {/* Yearly Plan */}
          <div className="hsub-card-x30sn ultimate best-value">
            <div className="hsub-badge-x30sn glow">BEST VALUE</div>
            <div className="hsub-card-header-x30sn">
              <h3>Yearly</h3>
              <div className="hsub-price-box-x30sn">
                <div className="hsub-old-price-x30sn">₹480/yr</div>
                <span className="hsub-price-x30sn">₹{YEARLY_PRICE_INR}</span><span className="hsub-term-x30sn">/yr</span>
                <div className="hsub-discount-x30sn">17% OFF</div>
              </div>
              <div className="hsub-monthly-equiv-x30sn">Only ₹{MONTHLY_EQUIVALENT_INR} / mo!</div>
            </div>
            <ul className="hsub-list-x30sn">
              <li>✅ Premium Realistic Letters</li>
              <li>✅ Unlimited NSFW</li>
              <li>✅ Unlimited AI</li>
              <li>✅ Deepest connection</li>
              <li>✅ VIP support</li>
              <li>✅ Deep Memory</li>
            </ul>
            <button className="hsub-btn-x30sn ultimate" onClick={() => handlePayment(YEARLY_PRICE_INR, 'Yearly')} disabled={isLoading}>
              {isLoading ? 'Processing...' : `Buy for ₹${YEARLY_PRICE_INR}`}
            </button>
          </div>

        </div>

        {/* UPI Info */}
        <div className="hsub-upi-box-x30sn">
            <h4 className="hsub-upi-title-x30sn">Secure Payments</h4>
            <div className="hsub-upi-option-x30sn">
                <img src="/UPI-White.svg" alt="UPI" width="40"/> <span>Pay with UPI</span>
            </div>
            <p className="hsub-note-x30sn">Processed via Razorpay (UPI, Cards, NetBanking)</p>
        </div>

        <div className="hsub-testimonials-x30sn">
          <Testimonials/>
        </div>

        <div className="hsub-footer-x30sn">
          <div className="hsub-guarantee-x30sn">
            <i>🛡️</i> <span>30-day money-back guarantee. Zero risk.</span>
          </div>
        </div>
      </section>
    </>
  );
}

export default function HomeSubscriptions() {
  return (
    <Suspense fallback={<div className="hsub-loading-x30sn">Loading plans...</div>}>
      <HomeSubscriptionContent />
    </Suspense>
  );
}