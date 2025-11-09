'use client';

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  FaUserPlus, 
  FaCoins, 
  FaChartLine, 
  FaRocket,
  FaArrowRight,
  FaStar,
  FaShieldAlt,
  FaUsers,
  FaMoneyBillWave
} from "react-icons/fa";
import "./HomeReferralSection.css";

const HomeReferralSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [counter, setCounter] = useState(0);
  const sectionRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          startCounter();
        }
      },
      { threshold: 0.3 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const startCounter = () => {
    let count = 0;
    const target = 500;
    const duration = 2000;
    const increment = target / (duration / 50);

    const timer = setInterval(() => {
      count += increment;
      if (count >= target) {
        count = target;
        clearInterval(timer);
      }
      setCounter(Math.floor(count));
    }, 50);
  };

  const handleJoinNow = () => {
    router.push('/referral');
  };

  const handleDashboardLogin = () => {
    router.push('/referral/login');
  };

  return (
    <section className="home-referral-section-k3dn9a" ref={sectionRef}>
      {/* Animated Background */}
      <div className="referral-background-k3dn9a">
        <div className="floating-shapes-k3dn9a">
          <div className="shape-k3dn9a shape-1-k3dn9a"></div>
          <div className="shape-k3dn9a shape-2-k3dn9a"></div>
          <div className="shape-k3dn9a shape-3-k3dn9a"></div>
          <div className="shape-k3dn9a shape-4-k3dn9a"></div>
        </div>
        <div className="gradient-orbs-k3dn9a">
          <div className="orb-k3dn9a orb-1-k3dn9a"></div>
          <div className="orb-k3dn9a orb-2-k3dn9a"></div>
        </div>
      </div>

      <div className="referral-container-k3dn9a">
        {/* Header Section */}
        <div className="referral-header-k3dn9a">
          <div className="badge-wrapper-k3dn9a">
            <span className="referral-badge-k3dn9a">
              <FaStar className="badge-icon-k3dn9a" />
              Limited Time Offer
            </span>
          </div>
          <h2 className="referral-title-k3dn9a">
            Join Our <span className="gradient-text-k3dn9a">Referral Program</span>
          </h2>
          <p className="referral-subtitle-k3dn9a">
            Turn your audience into earnings. Earn ₹20 per signup + 15% commission on every subscription.
            No follower requirements, just pure earning potential.
          </p>
        </div>

        <div className="referral-content-k3dn9a">
          {/* Left Side - Features & Stats */}
          <div className="referral-features-k3dn9a">
            {/* Stats Counter */}
            <div className="stats-grid-k3dn9a">
              <div className="stat-card-k3dn9a">
                <div className="stat-icon-k3dn9a">
                  <FaUsers />
                </div>
                <div className="stat-content-k3dn9a">
                  <h3 className="stat-number-k3dn9a">
                    {isVisible ? `${counter}+` : '0+'}
                  </h3>
                  <p className="stat-label-k3dn9a">Active Creators</p>
                </div>
              </div>
              <div className="stat-card-k3dn9a">
                <div className="stat-icon-k3dn9a">
                  <FaMoneyBillWave />
                </div>
                <div className="stat-content-k3dn9a">
                  <h3 className="stat-number-k3dn9a">₹2L+</h3>
                  <p className="stat-label-k3dn9a">Paid Out</p>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="features-list-k3dn9a">
              <div className="feature-item-k3dn9a">
                <div className="feature-icon-k3dn9a">
                  <FaCoins />
                </div>
                <div className="feature-content-k3dn9a">
                  <h4>Earn ₹20 Per Signup</h4>
                  <p>Get paid for every user who joins through your referral</p>
                </div>
              </div>
              <div className="feature-item-k3dn9a">
                <div className="feature-icon-k3dn9a">
                  <FaChartLine />
                </div>
                <div className="feature-content-k3dn9a">
                  <h4>15% Commission</h4>
                  <p>Earn 15% on all subscription purchases</p>
                </div>
              </div>
              <div className="feature-item-k3dn9a">
                <div className="feature-icon-k3dn9a">
                  <FaShieldAlt />
                </div>
                <div className="feature-content-k3dn9a">
                  <h4>Secure Dashboard</h4>
                  <p>Protected access to track your earnings</p>
                </div>
              </div>
              <div className="feature-item-k3dn9a">
                <div className="feature-icon-k3dn9a">
                  <FaRocket />
                </div>
                <div className="feature-content-k3dn9a">
                  <h4>Instant Setup</h4>
                  <p>Start earning in less than 2 minutes</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Visual & CTA */}
          <div className="referral-visual-k3dn9a">
            {/* Animated Card */}
            <div className={`visual-card-k3dn9a ${isVisible ? 'animate-in-k3dn9a' : ''}`}>
              <div className="card-header-k3dn9a">
                <div className="card-avatar-k3dn9a">
                  <FaCoins />
                </div>
                <div className="card-info-k3dn9a">
                  <h4>Your Earnings Potential</h4>
                  <p>Based on average performance</p>
                </div>
              </div>
              
              <div className="card-stats-k3dn9a">
                <div className="card-stat-k3dn9a">
                  <span className="stat-label-k3dn9a">Monthly Referrals</span>
                  <span className="stat-value-k3dn9a">25-50</span>
                </div>
                <div className="card-stat-k3dn9a">
                  <span className="stat-label-k3dn9a">Estimated Earnings</span>
                  <span className="stat-value-k3dn9a">₹5,000-15,000</span>
                </div>
              </div>

              {/* Animated Progress Bars */}
              <div className="progress-section-k3dn9a">
                <div className="progress-item-k3dn9a">
                  <div className="progress-label-k3dn9a">
                    <span>Signup Bonus</span>
                    <span>₹20 each</span>
                  </div>
                  <div className="progress-bar-k3dn9a">
                    <div 
                      className="progress-fill-k3dn9a signup-fill-k3dn9a"
                      style={{ width: isVisible ? '85%' : '0%' }}
                    ></div>
                  </div>
                </div>
                <div className="progress-item-k3dn9a">
                  <div className="progress-label-k3dn9a">
                    <span>Commission</span>
                    <span>15%</span>
                  </div>
                  <div className="progress-bar-k3dn9a">
                    <div 
                      className="progress-fill-k3dn9a commission-fill-k3dn9a"
                      style={{ width: isVisible ? '75%' : '0%' }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Interactive SVG Chart */}
              <div className="mini-chart-k3dn9a">
                <svg viewBox="0 0 200 80" className="chart-svg-k3dn9a">
                  <defs>
                    <linearGradient id="chartGradient-k3dn9a" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#b73a76" />
                      <stop offset="50%" stopColor="#ff6b9d" />
                      <stop offset="100%" stopColor="#34c759" />
                    </linearGradient>
                  </defs>
                  <path 
                    d="M10,60 L50,40 L90,50 L130,30 L170,40 L190,20" 
                    className="chart-line-k3dn9a"
                    strokeDasharray={isVisible ? "300" : "0"}
                    strokeDashoffset={isVisible ? "0" : "300"}
                  />
                  <circle cx="10" cy="60" r="3" className="chart-point-k3dn9a" />
                  <circle cx="50" cy="40" r="3" className="chart-point-k3dn9a" />
                  <circle cx="90" cy="50" r="3" className="chart-point-k3dn9a" />
                  <circle cx="130" cy="30" r="3" className="chart-point-k3dn9a" />
                  <circle cx="170" cy="40" r="3" className="chart-point-k3dn9a" />
                  <circle cx="190" cy="20" r="3" className="chart-point-k3dn9a" />
                </svg>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="referral-actions-k3dn9a">
              <button 
                className="primary-cta-btn-k3dn9a"
                onClick={handleJoinNow}
              >
                <FaUserPlus className="btn-icon-k3dn9a" />
                Join Program
              </button>
              <button 
                className="secondary-cta-btn-k3dn9a"
                onClick={handleDashboardLogin}
              >
                <FaChartLine className="btn-icon-k3dn9a" />
                Creator Login
              </button>
            </div>
          </div>
        </div>

        {/* Platform Support */}
        <div className="platform-support-k3dn9a">
          <p className="support-text-k3dn9a">Supported on all major platforms</p>
          <div className="platform-icons-k3dn9a">
            <div className="platform-icon-k3dn9a instagram-k3dn9a">
              <svg viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
              </svg>
              <span>Instagram</span>
            </div>
            <div className="platform-icon-k3dn9a youtube-k3dn9a">
              <svg viewBox="0 0 24 24">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              <span>YouTube</span>
            </div>
            <div className="platform-icon-k3dn9a tiktok-k3dn9a">
              <svg viewBox="0 0 24 24">
                <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001.002.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 10.692 6.33 6.33 0 0 0 10.857-4.424V8.687a8.182 8.182 0 0 0 4.773 1.526V6.79a4.831 4.831 0 0 1-1.003-.104z"/>
              </svg>
              <span>TikTok</span>
            </div>
            <div className="platform-icon-k3dn9a twitter-k3dn9a">
              <svg viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              <span>Twitter</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HomeReferralSection;