'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Head from "next/head";
import "./ReferralProgram.css";
import { 
  FaUserPlus, 
  FaLink, 
  FaMoneyBillWave, 
  FaShareAlt,
  FaUsers,
  FaCoins,
  FaChartLine,
  FaCheck,
  FaArrowRight,
  FaInstagram,
  FaYoutube,
  FaTiktok,
  FaTwitter,
  FaFacebook,
  FaStar,
  FaTimes,
  FaEye,
  FaEyeSlash
} from "react-icons/fa";
import axios from "axios";
import api from "../../config/api";
import Footer from "../../components/Footer";

const ReferralProgram = () => {
  const [showFormDialog, setShowFormDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    platform: "instagram",
    username: "",
    email: "",
    phone: "",
    notes: "",
    password: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const dialogRef = useRef(null);

  // SEO-optimized platform data
  const platforms = [
    { 
      value: "instagram", 
      label: "Instagram", 
      icon: <FaInstagram />, 
      color: "#E4405F",
      description: "Instagram influencer referral program"
    },
    { 
      value: "youtube", 
      label: "YouTube", 
      icon: <FaYoutube />, 
      color: "#FF0000",
      description: "YouTube creator affiliate program"
    },
    { 
      value: "tiktok", 
      label: "TikTok", 
      icon: <FaTiktok />, 
      color: "#000000",
      description: "TikTok content creator referrals"
    },
    { 
      value: "twitter", 
      label: "Twitter", 
      icon: <FaTwitter />, 
      color: "#1DA1F2",
      description: "Twitter influencer marketing program"
    },
    { 
      value: "facebook", 
      label: "Facebook", 
      icon: <FaFacebook />, 
      color: "#1877F2",
      description: "Facebook page owner referral system"
    }
  ];

  // SEO-optimized steps with keywords
  const steps = [
    {
      icon: <FaUserPlus />,
      title: "Sign Up as Content Creator",
      description: "Join our influencer referral program with simple registration"
    },
    {
      icon: <FaLink />,
      title: "Get Unique Referral ID",
      description: "Receive personalized referral code for affiliate tracking"
    },
    {
      icon: <FaCoins />,
      title: "Earn Commission",
      description: "Get paid for every signup and subscription referral"
    }
  ];

  // SEO-optimized earnings data
  const earnings = [
    { 
      type: "User Signup Bonus", 
      amount: "₹20", 
      description: "Earn ₹20 for every new user who joins through your referral link" 
    },
    { 
      type: "Subscription Commission", 
      amount: "15%", 
      description: "15% commission on all subscription purchases from your referrals" 
    },
    { 
      type: "Unlimited Earnings", 
      amount: "No Limits", 
      description: "No follower count requirements - earn from unlimited referrals" 
    }
  ];

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": "Influencer Referral Program",
    "description": "Join our affiliate program for content creators and earn commissions for referrals",
    "brand": {
      "@type": "Brand",
      "name": "AI Friend Platform"
    },
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR",
      "availability": "https://schema.org/InStock",
      "seller": {
        "@type": "Organization",
        "name": "AI Friend Platform"
      }
    }
  };

  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "How do I join the influencer referral program?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Simply fill out our registration form with your details, choose your primary platform, and create a secure password. You'll receive a unique referral ID to start earning."
        }
      },
      {
        "@type": "Question",
        "name": "How much can I earn with the referral program?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Earn ₹20 for every user signup and 15% commission on all subscription purchases. There are no limits on how much you can earn."
        }
      },
      {
        "@type": "Question",
        "name": "Which social media platforms are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support all major platforms including Instagram, YouTube, TikTok, Twitter, Facebook, and any other social media platform."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a minimum follower requirement?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, we believe in equal opportunity. Whether you have 100 or 1 million followers, you can join and earn commissions."
        }
      },
      {
        "@type": "Question",
        "name": "How often are referral payments made?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Payments are processed monthly and you'll receive your earnings by the 15th of each following month."
        }
      }
    ]
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      const response = await axios.post(
        `${api.Url}/admin/referral-creators`,
        formData,
        {
          headers: { 
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` })
          },
        }
      );

      if (response.data.success) {
        alert('Account created successfully! You can now login with your referral ID and password.');
        closeFormDialog();
        router.push(`/referral/${response.data.creator.referralId}/login`);
      } else {
        throw new Error(response.data.message || 'Submission failed');
      }
    } catch (error) {
      console.error('Submission error:', error);
      alert(error.response?.data?.message || error.message || 'Error submitting form. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const openFormDialog = () => {
    setShowFormDialog(true);
  };

  const closeFormDialog = () => {
    setShowFormDialog(false);
    setFormData({
      name: "",
      platform: "instagram",
      username: "",
      email: "",
      phone: "",
      notes: "",
      password: ""
    });
    setShowPassword(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dialogRef.current && !dialogRef.current.contains(event.target)) {
        closeFormDialog();
      }
    };

    if (showFormDialog) {
      document.addEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.body.style.overflow = 'unset';
    };
  }, [showFormDialog]);

  return (
    <>
      <Head>
        <title>Influencer Referral Program - Earn ₹20 per Signup + 15% Commission | AI Friend Platform</title>
        <meta 
          name="description" 
          content="Join our affiliate program for content creators. Earn ₹20 for every user signup and 15% commission on subscriptions. No follower requirements. Secure dashboard access." 
        />
        <meta 
          name="keywords" 
          content="referral program, influencer marketing, affiliate program, earn money online, content creator, social media earnings, commission based income, referral code, influencer partnership" 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta property="og:title" content="Influencer Referral Program - Earn Commissions | AI Friend Platform" />
        <meta property="og:description" content="Join our creator affiliate program and earn ₹20 per signup + 15% commission on subscriptions. Perfect for influencers and content creators." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://yourapp.com/referral" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Influencer Referral Program - Earn Money Online" />
        <meta name="twitter:description" content="Join our affiliate program and earn commissions for referrals. Perfect for social media influencers and content creators." />
        <link rel="canonical" href="https://yourapp.com/referral" />
        
        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      </Head>

      <div className="ref-program-container">
        {/* Hero Section with SEO-rich content */}
        <section className="ref-hero-section" itemScope itemType="https://schema.org/Product">
          <div className="ref-hero-background">
            <div className="ref-hero-glow"></div>
          </div>
          <div className="ref-hero-content">
            <div className="ref-hero-text">
              <div className="ref-badge">
                <FaStar className="badge-icon" />
                Top Rated Influencer Program
              </div>
              <h1 className="ref-hero-title" itemProp="name">
                Join Our <span className="ref-gradient-text">Influencer Referral Program</span>
              </h1>
              <p className="ref-hero-description" itemProp="description">
                Maximize your earning potential as a content creator. Our affiliate referral program helps 
                social media influencers, YouTubers, and digital creators generate passive income through 
                commission-based referrals. No minimum follower count required.
              </p>
              <div className="ref-hero-stats">
                <div className="ref-stat">
                  <FaUsers className="stat-icon" />
                  <div>
                    <h3>500+</h3>
                    <span>Active Content Creators</span>
                  </div>
                </div>
                <div className="ref-stat">
                  <FaCoins className="stat-icon" />
                  <div>
                    <h3>₹2L+</h3>
                    <span>Commission Paid Out</span>
                  </div>
                </div>
                <div className="ref-stat">
                  <FaChartLine className="stat-icon" />
                  <div>
                    <h3>24/7</h3>
                    <span>Creator Support</span>
                  </div>
                </div>
              </div>
              <button 
                className="ref-primary-button ref-cta-button"
                onClick={openFormDialog}
                aria-label="Join influencer referral program to start earning commissions"
              >
                Start Earning Commissions
                <FaArrowRight className="button-icon" />
              </button>
            </div>
            <div className="ref-hero-visual">
              <div className="ref-visual-card">
                <div className="ref-visual-header">
                  <div className="ref-visual-avatar">₹</div>
                  <div className="ref-visual-info">
                    <h4>Creator Earnings Potential</h4>
                    <p>Average Monthly Commission</p>
                  </div>
                </div>
                <div className="ref-visual-stats">
                  <div className="ref-visual-stat">
                    <span>Referral Bonus</span>
                    <strong>₹20/user</strong>
                  </div>
                  <div className="ref-visual-stat">
                    <span>Commission Rate</span>
                    <strong>15%</strong>
                  </div>
                  <div className="ref-visual-stat">
                    <span>Dashboard</span>
                    <strong>Secure</strong>
                  </div>
                </div>
                <div className="ref-visual-graph">
                  <div className="graph-bar" style={{ height: '80%' }}></div>
                  <div className="graph-bar" style={{ height: '60%' }}></div>
                  <div className="graph-bar" style={{ height: '90%' }}></div>
                  <div className="graph-bar" style={{ height: '70%' }}></div>
                  <div className="graph-bar" style={{ height: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section className="ref-existing-creators-section">
  <div className="ref-container">
    <div className="ref-existing-creators-content">
      <div className="existing-creators-text">
        <h2>Already a Creator?</h2>
        <p>Access your secure dashboard to track earnings, view analytics, and manage your referrals</p>
      </div>
      <button 
        className="ref-dashboard-login-button"
        onClick={() => router.push('/referral/login')}
      >
        <FaChartLine className="button-icon" />
        Login to Dashboard
        <FaArrowRight className="button-icon" />
      </button>
    </div>
  </div>
</section>


        {/* How It Works Section */}
        <section className="ref-steps-section">
          <div className="ref-container">
            <div className="ref-section-header">
              <h2>How Our Referral Program Works</h2>
              <p>Simple 4-step process to start earning affiliate commissions</p>
            </div>
            <div className="ref-steps-grid">
              {steps.map((step, index) => (
                <div key={index} className="ref-step-card">
                  <div className="ref-step-number">{index + 1}</div>
                  <div className="ref-step-icon">
                    {step.icon}
                  </div>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Earnings Section */}
        <section className="ref-earnings-section">
          <div className="ref-container">
            <div className="ref-section-header">
              <h2>Commission & Earnings Structure</h2>
              <p>Competitive rates designed for content creators and influencers</p>
            </div>
            <div className="ref-earnings-grid">
              {earnings.map((earning, index) => (
                <div key={index} className="ref-earning-card">
                  <div className="ref-earning-icon">
                    <FaMoneyBillWave />
                  </div>
                  <h3>{earning.type}</h3>
                  <div className="ref-earning-amount">{earning.amount}</div>
                  <p>{earning.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Platform Support Section */}
        <section className="ref-platforms-section">
          <div className="ref-container">
            <div className="ref-section-header">
              <h2>Supported Social Media Platforms</h2>
              <p>Perfect for influencers across all major digital platforms</p>
            </div>
            <div className="ref-platforms-grid">
              {platforms.map((platform) => (
                <div key={platform.value} className="ref-platform-card">
                  <div 
                    className="ref-platform-icon"
                    style={{ color: platform.color }}
                    aria-label={platform.description}
                  >
                    {platform.icon}
                  </div>
                  <h4>{platform.label}</h4>
                  <p className="platform-description">{platform.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="ref-cta-section">
          <div className="ref-container">
            <div className="ref-cta-content">
              <h2>Ready to Monetize Your Influence?</h2>
              <p>
                Join thousands of successful content creators who are earning consistent income through 
                our referral affiliate program. Whether you're a micro-influencer or have a large following, 
                our program offers equal earning opportunities with secure dashboard access.
              </p>
              <button 
                className="ref-primary-button ref-cta-button"
                onClick={openFormDialog}
                aria-label="Join affiliate program now to start earning commissions"
              >
                Join Affiliate Program Now
                <FaArrowRight className="button-icon" />
              </button>
            </div>
          </div>
        </section>

        {/* FAQ Section with Schema Markup */}
        <section className="ref-faq-section" itemScope itemType="https://schema.org/FAQPage">
          <div className="ref-container">
            <div className="ref-section-header">
              <h2>Frequently Asked Questions</h2>
              <p>Everything content creators need to know about our referral program</p>
            </div>
            <div className="ref-faq-grid">
              <div className="ref-faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 itemProp="name">How do I join the influencer referral program?</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text">
                    Simply fill out our registration form with your details, choose your primary platform, 
                    and create a secure password. You'll receive a unique referral ID to start earning 
                    commissions immediately.
                  </p>
                </div>
              </div>
              <div className="ref-faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 itemProp="name">How much can I earn with the referral program?</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text">
                    Earn ₹20 for every user signup and 15% commission on all subscription purchases. 
                    There are no limits on how much you can earn - your income potential depends on 
                    your audience reach and promotion efforts.
                  </p>
                </div>
              </div>
              <div className="ref-faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 itemProp="name">Which social media platforms are supported?</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text">
                    We support all major platforms including Instagram, YouTube, TikTok, Twitter, 
                    Facebook, and any other social media platform. Our program is designed for 
                    content creators across all digital channels.
                  </p>
                </div>
              </div>
              <div className="ref-faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 itemProp="name">Is there a minimum follower requirement?</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text">
                    No, we believe in equal opportunity for all creators. Whether you have 100 followers 
                    or 1 million, you can join our affiliate program and earn commissions. We value 
                    engagement and quality over follower count.
                  </p>
                </div>
              </div>
              <div className="ref-faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 itemProp="name">How often are referral payments made?</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text">
                    Commission payments are processed monthly. You'll receive your earnings by the 15th 
                    of each following month through your preferred payment method with a minimum 
                    withdrawal threshold of ₹1000.
                  </p>
                </div>
              </div>
              <div className="ref-faq-item" itemScope itemProp="mainEntity" itemType="https://schema.org/Question">
                <h3 itemProp="name">Can I track my referral performance?</h3>
                <div itemScope itemProp="acceptedAnswer" itemType="https://schema.org/Answer">
                  <p itemProp="text">
                    Yes, you get access to a secure, password-protected dashboard where you can track 
                    all your referrals, earnings, conversion rates, and performance analytics in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Additional SEO Content Section */}
        <section className="ref-seo-content-section">
          <div className="ref-container">
            <div className="seo-content-grid">
              <div className="seo-content-card">
                <h3>Why Choose Our Referral Program?</h3>
                <p>
                  Our influencer affiliate program stands out with its competitive commission structure, 
                  secure payment system, and dedicated support for content creators. Unlike other programs 
                  that require minimum follower counts, we focus on your ability to drive quality referrals.
                </p>
                <ul>
                  <li>✓ No minimum follower requirements</li>
                  <li>✓ Competitive ₹20 per signup + 15% commission</li>
                  <li>✓ Real-time performance tracking</li>
                  <li>✓ Secure monthly payments</li>
                  <li>✓ Multi-platform support</li>
                </ul>
              </div>
              <div className="seo-content-card">
                <h3>Perfect for Content Creators</h3>
                <p>
                  Whether you're a Instagram influencer, YouTube creator, TikTok content maker, or 
                  social media manager, our referral program provides a reliable income stream. 
                  Monetize your audience while providing value to your followers.
                </p>
                <div className="creator-types">
                  <span className="creator-tag">Instagram Influencers</span>
                  <span className="creator-tag">YouTube Creators</span>
                  <span className="creator-tag">TikTok Content Makers</span>
                  <span className="creator-tag">Twitter Personalities</span>
                  <span className="creator-tag">Facebook Page Owners</span>
                  <span className="creator-tag">Digital Marketers</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Form Dialog */}
        {showFormDialog && (
          <div className="ref-dialog-overlay">
            <div className="ref-dialog-container" ref={dialogRef}>
              <div className="ref-dialog-header">
                <h2>Join Influencer Referral Program</h2>
                <button 
                  className="ref-dialog-close"
                  onClick={closeFormDialog}
                  aria-label="Close registration form"
                >
                  <FaTimes />
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="ref-join-form">
                <div className="ref-form-grid">
                  <div className="ref-form-group">
                    <label htmlFor="name">Full Name *</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className="ref-form-input"
                    />
                  </div>

                  <div className="ref-form-group">
                    <label htmlFor="email">Email Address *</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="your@email.com"
                      className="ref-form-input"
                    />
                  </div>

                  <div className="ref-form-group">
                    <label htmlFor="phone">Phone Number</label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+91 1234567890"
                      className="ref-form-input"
                    />
                  </div>

                  <div className="ref-form-group">
                    <label htmlFor="platform">Primary Platform *</label>
                    <select
                      id="platform"
                      name="platform"
                      value={formData.platform}
                      onChange={handleInputChange}
                      required
                      className="ref-form-select"
                    >
                      {platforms.map(platform => (
                        <option key={platform.value} value={platform.value}>
                          {platform.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="ref-form-group">
                    <label htmlFor="username">Platform Username *</label>
                    <input
                      type="text"
                      id="username"
                      name="username"
                      value={formData.username}
                      onChange={handleInputChange}
                      required
                      placeholder="Your username on the platform"
                      className="ref-form-input"
                    />
                    <small className="ref-form-hint">
                      This will be used to generate your unique referral ID
                    </small>
                  </div>

                  <div className="ref-form-group">
                    <label htmlFor="password">Create Password *</label>
                    <div className="ref-password-input-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        minLength="6"
                        placeholder="Enter a secure password (min. 6 characters)"
                        className="ref-form-input ref-password-input"
                      />
                      <button
                        type="button"
                        className="ref-password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                    <small className="ref-form-hint">
                      You'll use this password with your referral ID to access your secure dashboard
                    </small>
                  </div>

                  <div className="ref-form-group ref-full-width">
                    <div className="ref-commission-info">
                      <FaChartLine className="commission-icon" />
                      <div>
                        <h4>Standard Commission Rate: 15%</h4>
                        <p>All creators receive the same fair commission rate with secure dashboard access.</p>
                      </div>
                    </div>
                  </div>

                  <div className="ref-form-group ref-full-width">
                    <label htmlFor="notes">Additional Information (Optional)</label>
                    <textarea
                      id="notes"
                      name="notes"
                      value={formData.notes}
                      onChange={handleInputChange}
                      placeholder="Tell us about your audience, content type, or any other relevant information..."
                      rows="3"
                      className="ref-form-textarea"
                    />
                  </div>
                </div>

                <div className="ref-form-footer">
                  <p className="ref-form-note">
                    By submitting this form, you agree to our referral program terms and conditions. 
                    You'll receive your referral ID and can access your secure dashboard immediately after signup.
                  </p>
                  <button 
                    type="submit" 
                    className="ref-primary-button ref-submit-button"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <div className="ref-spinner"></div>
                        Creating Your Account...
                      </>
                    ) : (
                      <>
                        Create Account & Start Earning
                        <FaArrowRight className="button-icon" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>


      <Footer/>
    </>
  );
};

export default ReferralProgram;