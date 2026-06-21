'use client';

import React, { useState, useEffect } from 'react';
import './ShareEarnSection.css';
import axios from 'axios';
import api from '../../config/api';
import { 
  FaCopy, 
  FaShareAlt, 
  FaWhatsapp, 
  FaTelegramPlane, 
  FaTwitter, 
  FaFacebookF, 
  FaWallet, 
  FaUserFriends, 
  FaTrophy, 
  FaInfoCircle, 
  FaCheckCircle, 
  FaChevronLeft, 
  FaExchangeAlt,
  FaArrowRight
} from 'react-icons/fa';

function ShareEarnSection({ onBackSBTNSelect }) {
  const [activeTab, setActiveTab] = useState('howItWorks'); // 'howItWorks', 'myReferrals', 'rewards'
  const [dashboardData, setDashboardData] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingWithdrawal, setSubmittingWithdrawal] = useState(false);
  const [submittingConversion, setSubmittingConversion] = useState(false);
  
  // Clipboard copied tooltips
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Withdrawal Form State
  const [withdrawalMethod, setWithdrawalMethod] = useState('upi'); // 'upi', 'bank'
  const [upiId, setUpiId] = useState('');
  const [bankAccount, setBankAccount] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [withdrawalAmount, setWithdrawalAmount] = useState('500');
  const [withdrawalMsg, setWithdrawalMsg] = useState({ text: '', type: '' });

  // Conversion State
  const [conversionOption, setConversionOption] = useState(50); // 50, 100, 200
  const [conversionMsg, setConversionMsg] = useState({ text: '', type: '' });

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const res = await axios.get(`${api.Url}/user/referrals/dashboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data && res.data.success) {
        setDashboardData(res.data.data);
      }

      // Fetch leaderboard
      const lbRes = await axios.get(`${api.Url}/user/referrals/leaderboard`);
      if (lbRes.data && lbRes.data.success) {
        setLeaderboard(lbRes.data.leaderboard);
      }
    } catch (err) {
      console.error('Error fetching referral details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const copyToClipboard = (text, type) => {
    navigator.clipboard.writeText(text);
    if (type === 'code') {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  const handleSocialShare = (platform) => {
    if (!dashboardData) return;
    const shareUrl = dashboardData.referralLink;
    const shareText = `Hey! Join HeartEcho AI to find your custom AI companion. Get +50 FREE messages when you sign up using my link: ${shareUrl}`;

    let url = '';
    switch (platform) {
      case 'whatsapp':
        url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
        break;
      case 'telegram':
        url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`;
        break;
      case 'twitter':
        url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        break;
      case 'facebook':
        url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'native':
        if (navigator.share) {
          navigator.share({
            title: 'HeartEcho Referral',
            text: shareText,
            url: shareUrl
          }).catch(console.error);
          return;
        }
        break;
    }
    if (url) window.open(url, '_blank');
  };

  const handleSubmitWithdrawal = async (e) => {
    e.preventDefault();
    setWithdrawalMsg({ text: '', type: '' });

    const amt = Number(withdrawalAmount);
    if (isNaN(amt) || amt < 500) {
      setWithdrawalMsg({ text: 'Minimum withdrawal amount is ₹500', type: 'error' });
      return;
    }

    if (dashboardData.stats.approvedEarnings < amt) {
      setWithdrawalMsg({ text: 'Insufficient withdrawable balance', type: 'error' });
      return;
    }

    setSubmittingWithdrawal(true);
    try {
      const token = localStorage.getItem('token');
      const details = withdrawalMethod === 'upi' 
        ? { upiId } 
        : { accountNo: bankAccount, ifsc: bankIfsc, bankName, holderName: accountHolder };

      const res = await axios.post(`${api.Url}/user/referrals/withdraw`, {
        amount: amt,
        method: withdrawalMethod,
        details
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setWithdrawalMsg({ text: 'Withdrawal request submitted successfully! Funds will arrive in 1-7 days.', type: 'success' });
        // Reset form
        setUpiId('');
        setBankAccount('');
        setBankIfsc('');
        setBankName('');
        setAccountHolder('');
        // Reload data
        fetchReferralData();
      }
    } catch (err) {
      setWithdrawalMsg({ text: err.response?.data?.message || 'Error processing request', type: 'error' });
    } finally {
      setSubmittingWithdrawal(false);
    }
  };

  const handleConvertPremium = async () => {
    setConversionMsg({ text: '', type: '' });
    if (dashboardData.stats.approvedEarnings < conversionOption) {
      setConversionMsg({ text: 'Insufficient approved balance to convert', type: 'error' });
      return;
    }

    setSubmittingConversion(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(`${api.Url}/user/referrals/convert`, {
        amount: conversionOption
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setConversionMsg({ text: res.data.message || 'Successfully converted to Premium!', type: 'success' });
        // Dispatch profile update event to update global stats
        window.dispatchEvent(new Event('userProfileUpdated'));
        fetchReferralData();
      }
    } catch (err) {
      setConversionMsg({ text: err.response?.data?.message || 'Conversion failed', type: 'error' });
    } finally {
      setSubmittingConversion(false);
    }
  };

  if (loading) {
    return (
      <div className="share-earn-loading">
        <div className="spinner-glow"></div>
        <p>Loading referral details...</p>
      </div>
    );
  }

  const { stats, referralCode, referralLink, referrals, withdrawals } = dashboardData || {
    stats: { totalInvites: 0, registeredUsers: 0, activeReferrals: 0, premiumReferrals: 0, pendingEarnings: 0, approvedEarnings: 0, withdrawableBalance: 0, lifetimeEarnings: 0 },
    referralCode: '',
    referralLink: '',
    referrals: [],
    withdrawals: []
  };

  return (
    <div className="share-earn-container">
      {/* Mobile Back Header */}
      <div className="share-earn-back-header" onClick={onBackSBTNSelect}>
        <FaChevronLeft />
        <span>Back to Settings</span>
      </div>

      {/* Premium Banner */}
      <div className="share-earn-banner">
        <div className="banner-left">
          <span className="banner-tag">LIMITED TIME OFFER</span>
          <h1>Refer Friends, <span className="banner-pink">Earn Cash!</span></h1>
          <p>Get ₹5 for every active friend + up to ₹200 on every subscription upgrade. Your friends get +50 free messages!</p>
        </div>
        <img 
          src="/referral-heart.png" 
          alt="Referral rewards illustration" 
          className="banner-image"
        />
      </div>

      {/* Invite Copy Code Box */}
      <div className="share-earn-invite-box">
        <div className="invite-row">
          <div className="invite-field">
            <span className="invite-label">YOUR REFERRAL LINK</span>
            <div className="copy-input-group">
              <input type="text" readOnly value={referralLink} />
              <button onClick={() => copyToClipboard(referralLink, 'link')}>
                <FaCopy /> {copiedLink ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
          <div className="invite-field code-field">
            <span className="invite-label">REFERRAL CODE</span>
            <div className="copy-input-group">
              <input type="text" readOnly value={referralCode} className="code-text" />
              <button onClick={() => copyToClipboard(referralCode, 'code')}>
                <FaCopy /> {copiedCode ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>
        </div>

        {/* Multi-Platform Sharing row */}
        <div className="platform-share-row">
          <span className="share-text">Share via:</span>
          <div className="share-buttons">
            <button className="share-btn whatsapp" onClick={() => handleSocialShare('whatsapp')} title="Share on WhatsApp">
              <FaWhatsapp /> WhatsApp
            </button>
            <button className="share-btn telegram" onClick={() => handleSocialShare('telegram')} title="Share on Telegram">
              <FaTelegramPlane /> Telegram
            </button>
            <button className="share-btn twitter" onClick={() => handleSocialShare('twitter')} title="Share on Twitter">
              <FaTwitter /> Twitter
            </button>
            <button className="share-btn facebook" onClick={() => handleSocialShare('facebook')} title="Share on Facebook">
              <FaFacebookF /> Facebook
            </button>
            <button className="share-btn native" onClick={() => handleSocialShare('native')} title="More Share Options">
              <FaShareAlt /> Share
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Menu */}
      <div className="share-earn-tabs">
        <button 
          className={`tab-btn ${activeTab === 'howItWorks' ? 'active' : ''}`}
          onClick={() => setActiveTab('howItWorks')}
        >
          <FaInfoCircle /> How It Works
        </button>
        <button 
          className={`tab-btn ${activeTab === 'myReferrals' ? 'active' : ''}`}
          onClick={() => setActiveTab('myReferrals')}
        >
          <FaUserFriends /> My Referrals ({referrals.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'rewards' ? 'active' : ''}`}
          onClick={() => setActiveTab('rewards')}
        >
          <FaWallet /> Rewards & Wallet
        </button>
      </div>

      {/* Tab Panels */}
      <div className="tab-content-panel">
        
        {/* Panel 1: How It Works */}
        {activeTab === 'howItWorks' && (
          <div className="panel-how-it-works">
            <h3 className="section-title">Rewards Timeline</h3>
            <div className="timeline-steps">
              <div className="step-card">
                <div className="step-number">1</div>
                <h4>Stage 1: Register</h4>
                <p className="highlight-reward">Referrer gets ₹2 | Friend gets +50 free messages</p>
                <span className="step-condition">Condition: New account signs up and verifies email.</span>
              </div>
              <div className="step-card">
                <div className="step-number">2</div>
                <h4>Stage 2: Active User</h4>
                <p className="highlight-reward">Referrer gets +₹3 (Total ₹5)</p>
                <span className="step-condition">Condition: Referred user chats with 10+ messages and remains active for 24 hours.</span>
              </div>
              <div className="step-card">
                <div className="step-number">3</div>
                <h4>Stage 3: Upgrades</h4>
                <p className="highlight-reward">Referrer gets subscription commission</p>
                <div className="subs-list">
                  <div><span>Monthly Plan:</span> <strong>₹10 Commission</strong></div>
                  <div><span>Premium Yearly:</span> <strong>₹75 Commission</strong></div>
                  <div><span>Ultimate Yearly:</span> <strong>₹200 Commission</strong></div>
                </div>
              </div>
            </div>

            <div className="fraud-warning-box">
              <h5>🛡️ Fraud Prevention Rules</h5>
              <ul>
                <li>Both accounts must be on different devices and IP addresses.</li>
                <li>Temporary / disposable email domains are strictly blacklisted.</li>
                <li>All earnings remain pending for a 7-day safety verification window.</li>
                <li>Earnings are forfeited if the referred user deletes their account within 7 days.</li>
              </ul>
            </div>
          </div>
        )}

        {/* Panel 2: My Referrals */}
        {activeTab === 'myReferrals' && (
          <div className="panel-my-referrals">
            {referrals.length === 0 ? (
              <div className="empty-referrals-state">
                <FaUserFriends className="empty-icon" />
                <h4>No referrals yet</h4>
                <p>Share your link above to invite your friends and start earning cash rewards today!</p>
              </div>
            ) : (
              <div className="referrals-table-container">
                <table className="referrals-table">
                  <thead>
                    <tr>
                      <th>Friend Name</th>
                      <th>Email</th>
                      <th>Joined Date</th>
                      <th>Messages</th>
                      <th>Status</th>
                      <th>Earnings Earned</th>
                    </tr>
                  </thead>
                  <tbody>
                    {referrals.map((ref) => (
                      <tr key={ref.id}>
                        <td>{ref.name}</td>
                        <td className="obfuscated-email">{ref.email}</td>
                        <td>{new Date(ref.joinedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                        <td>{ref.messagesSent}</td>
                        <td>
                          <span className={`status-badge ${ref.status}`}>
                            {ref.status === 'pending' && 'Pending Approval'}
                            {ref.status === 'active' && 'Active User'}
                            {ref.status === 'premium' && 'Premium Buyer'}
                            {ref.status === 'invalid' && 'Invalid'}
                          </span>
                        </td>
                        <td className="ref-earnings-cell">
                          {ref.status === 'invalid' ? (
                            <span className="invalid-earnings">₹0 (Disqualified)</span>
                          ) : (
                            <span className="approved-earnings">
                              ₹{ref.signupReward + (ref.status !== 'pending' ? ref.activeReward : 0) + ref.commission}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Panel 3: Rewards & Wallet */}
        {activeTab === 'rewards' && (
          <div className="panel-rewards">
            {/* Wallet Dashboard Cards */}
            <div className="wallet-grid">
              <div className="wallet-card pending">
                <span className="card-label">PENDING EARNINGS</span>
                <h3>₹{stats.pendingEarnings}</h3>
                <p className="card-desc">Held in review for 7-day fraud check.</p>
              </div>
              <div className="wallet-card approved">
                <span className="card-label">APPROVED BALANCE</span>
                <h3>₹{stats.approvedEarnings}</h3>
                <p className="card-desc">Withdrawable or convertable immediately.</p>
              </div>
              <div className="wallet-card lifetime">
                <span className="card-label">LIFETIME EARNINGS</span>
                <h3>₹{stats.lifetimeEarnings}</h3>
                <p className="card-desc">Total accumulated earnings till date.</p>
              </div>
            </div>

            {/* Split Section: Withdraw and Convert */}
            <div className="rewards-actions-split">
              {/* Cash Withdrawal Section */}
              <div className="reward-action-card withdrawal-box">
                <h4>💵 Cash Payout Request</h4>
                <p className="section-desc">Withdraw your approved rewards directly into your UPI ID or Bank Account. Minimum: ₹500.</p>

                {withdrawalMsg.text && (
                  <div className={`form-alert ${withdrawalMsg.type}`}>
                    {withdrawalMsg.text}
                  </div>
                )}

                <form onSubmit={handleSubmitWithdrawal}>
                  <div className="withdrawal-methods-select">
                    <label className={`method-pill ${withdrawalMethod === 'upi' ? 'active' : ''}`}>
                      <input type="radio" name="method" checked={withdrawalMethod === 'upi'} onChange={() => setWithdrawalMethod('upi')} />
                      UPI Transfer
                    </label>
                    <label className={`method-pill ${withdrawalMethod === 'bank' ? 'active' : ''}`}>
                      <input type="radio" name="method" checked={withdrawalMethod === 'bank'} onChange={() => setWithdrawalMethod('bank')} />
                      Bank Account
                    </label>
                  </div>

                  {withdrawalMethod === 'upi' ? (
                    <div className="form-group">
                      <label>UPI ID *</label>
                      <input 
                        type="text" 
                        placeholder="e.g. mobile@ybl, name@upi" 
                        required 
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                      />
                    </div>
                  ) : (
                    <div className="bank-fields-grid">
                      <div className="form-group">
                        <label>Bank Account Number *</label>
                        <input 
                          type="text" 
                          placeholder="Enter account number" 
                          required 
                          value={bankAccount}
                          onChange={(e) => setBankAccount(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>IFSC Code *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. SBIN0001234" 
                          required 
                          value={bankIfsc}
                          onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                        />
                      </div>
                      <div className="form-group">
                        <label>Bank Name *</label>
                        <input 
                          type="text" 
                          placeholder="e.g. State Bank of India" 
                          required 
                          value={bankName}
                          onChange={(e) => setBankName(e.target.value)}
                        />
                      </div>
                      <div className="form-group">
                        <label>Account Holder Name *</label>
                        <input 
                          type="text" 
                          placeholder="Name as in bank account" 
                          required 
                          value={accountHolder}
                          onChange={(e) => setAccountHolder(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  <div className="form-group amount-group">
                    <label>Amount to Withdraw (₹) *</label>
                    <input 
                      type="number" 
                      min="500" 
                      placeholder="Min ₹500" 
                      required 
                      value={withdrawalAmount}
                      onChange={(e) => setWithdrawalAmount(e.target.value)}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="action-btn-payout"
                    disabled={submittingWithdrawal || stats.approvedEarnings < 500}
                  >
                    {submittingWithdrawal ? 'Processing Withdrawal...' : 'Request Payout'}
                  </button>
                </form>
              </div>

              {/* Conversion Section */}
              <div className="reward-action-card convert-box">
                <h4>💎 Convert Earnings to Premium</h4>
                <p className="section-desc">Increase your chatting limits instantly! Convert your earnings directly into Premium days with zero processing delays.</p>

                {conversionMsg.text && (
                  <div className={`form-alert ${conversionMsg.type}`}>
                    {conversionMsg.text}
                  </div>
                )}

                <div className="conversion-cards-grid">
                  <div 
                    className={`convert-card-pill ${conversionOption === 50 ? 'active' : ''}`}
                    onClick={() => setConversionOption(50)}
                  >
                    <div className="pill-cost">₹50</div>
                    <FaExchangeAlt className="arrow-icon" />
                    <div className="pill-benefit">30 Days Premium</div>
                  </div>

                  <div 
                    className={`convert-card-pill ${conversionOption === 100 ? 'active' : ''}`}
                    onClick={() => setConversionOption(100)}
                  >
                    <div className="pill-cost">₹100</div>
                    <FaExchangeAlt className="arrow-icon" />
                    <div className="pill-benefit">60 Days Premium</div>
                  </div>

                  <div 
                    className={`convert-card-pill ${conversionOption === 200 ? 'active' : ''}`}
                    onClick={() => setConversionOption(200)}
                  >
                    <div className="pill-cost">₹200</div>
                    <FaExchangeAlt className="arrow-icon" />
                    <div className="pill-benefit">90 Days Premium</div>
                  </div>
                </div>

                <button 
                  onClick={handleConvertPremium} 
                  className="action-btn-convert"
                  disabled={submittingConversion || stats.approvedEarnings < conversionOption}
                >
                  {submittingConversion ? 'Converting...' : `Convert Balance (Cost: ₹${conversionOption})`}
                </button>
              </div>
            </div>

            {/* Payout History / Withdrawals table */}
            <div className="withdrawals-history-section">
              <h4 style={{ color: '#fff', marginBottom: '12px' }}>Withdrawals & Conversions Log</h4>
              {withdrawals.length === 0 ? (
                <p style={{ color: 'var(--ios-text-secondary)', fontSize: '0.9rem' }}>No withdrawal transactions logged yet.</p>
              ) : (
                <div className="referrals-table-container">
                  <table className="referrals-table">
                    <thead>
                      <tr>
                        <th>Date Requested</th>
                        <th>Amount</th>
                        <th>Method</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {withdrawals.map((w) => (
                        <tr key={w._id}>
                          <td>{new Date(w.createdAt).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                          <td style={{ color: '#ff2d55', fontWeight: 'bold' }}>₹{w.amount}</td>
                          <td style={{ textTransform: 'uppercase' }}>{w.method === 'upi' ? 'UPI' : 'Bank'}</td>
                          <td>
                            <span className={`status-badge ${w.status}`}>
                              {w.status === 'pending' && 'Pending processing'}
                              {w.status === 'approved' && 'Processed ✅'}
                              {w.status === 'rejected' && 'Failed/Rejected'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Monthly Leaderboard Display */}
            <div className="leaderboard-section">
              <div className="leaderboard-header">
                <FaTrophy className="leaderboard-trophy" />
                <div>
                  <h4>Monthly Leaderboard Contest</h4>
                  <p>Top referrers this month win direct cash prizes in their wallet!</p>
                </div>
              </div>

              <div className="leaderboard-prizes">
                <div className="prize-badge gold">Rank 1: ₹5000</div>
                <div className="prize-badge silver">Rank 2: ₹2000</div>
                <div className="prize-badge bronze">Rank 3: ₹1000</div>
              </div>

              {leaderboard.length === 0 ? (
                <p style={{ color: 'var(--ios-text-secondary)', fontSize: '0.9rem', marginTop: '10px' }}>Leaderboard is compiling, check back shortly.</p>
              ) : (
                <div className="leaderboard-list">
                  {leaderboard.map((user) => (
                    <div key={user.rank} className="leaderboard-row">
                      <span className="rank-num">{user.rank}</span>
                      <div className="leaderboard-user-details">
                        <span className="user-name">{user.name}</span>
                        <span className="user-email">{user.email}</span>
                      </div>
                      <div className="leaderboard-stats">
                        <span>Invites: <strong>{user.referralsCount}</strong></span>
                        <span>Active: <strong style={{ color: '#34c759' }}>{user.activeReferralsCount}</strong></span>
                      </div>
                      {user.prize && <span className="prize-badge-win">{user.prize}</span>}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default ShareEarnSection;
