'use client';

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import "./ReferralDashboard.css";
import {
  FaUsers,
  FaRupeeSign,
  FaUserPlus,
  FaShoppingCart,
  FaChartLine,
  FaShareAlt,
  FaCopy,
  FaQrcode,
  FaWallet,
  FaArrowUp,
  FaArrowDown,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaAmazon,
  FaMobileAlt,
  FaCrown,
  FaUserCheck,
  FaCalendarAlt,
  FaRocket,
  FaChevronLeft,
  FaChevronRight,
  FaSignOutAlt,
  FaShieldAlt
} from "react-icons/fa";
import axios from "axios";
import api from "../../../../config/api";

const ReferralDashboard = () => {
  const params = useParams();
  const router = useRouter();
  const referralId = params.referralId;
  
  const [creatorData, setCreatorData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [withdrawMethod, setWithdrawMethod] = useState(null);
  const [upiId, setUpiId] = useState("");
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  
  // Pagination state for subscription purchases
  const [currentSubPage, setCurrentSubPage] = useState(1);
  const itemsPerPage = 5;

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('referralToken');
      const storedCreator = localStorage.getItem('referralCreator');
      
      if (token && storedCreator) {
        try {
          const creator = JSON.parse(storedCreator);
          if (creator.referralId === referralId) {
            setAuthenticated(true);
            fetchDashboardData(token);
          } else {
            redirectToLogin();
          }
        } catch (error) {
          redirectToLogin();
        }
      } else {
        redirectToLogin();
      }
    };

    checkAuth();
  }, [referralId]);

  const redirectToLogin = () => {
    router.push(`/referral/${referralId}/login`);
  };

  const fetchDashboardData = async (token) => {
    try {
      const response = await axios.get(
        `${api.Url}/admin/referral-creators/dashboard`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setCreatorData(response.data.data);
      } else {
        throw new Error('Failed to fetch dashboard data');
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      // If token is invalid, redirect to login
      if (error.response?.status === 401) {
        localStorage.removeItem('referralToken');
        localStorage.removeItem('referralCreator');
        redirectToLogin();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('referralToken');
    localStorage.removeItem('referralCreator');
    router.push(`/referral/${referralId}/login`);
  };

  // Pagination functions for subscription purchases
  const getCurrentSubscriptions = () => {
    if (!creatorData?.subscriptionDetails) return [];
    
    const startIndex = (currentSubPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return creatorData.subscriptionDetails.slice(startIndex, endIndex);
  };

  const totalSubPages = creatorData?.subscriptionDetails 
    ? Math.ceil(creatorData.subscriptionDetails.length / itemsPerPage)
    : 0;

  const handleNextSubPage = () => {
    if (currentSubPage < totalSubPages) {
      setCurrentSubPage(currentSubPage + 1);
    }
  };

  const handlePrevSubPage = () => {
    if (currentSubPage > 1) {
      setCurrentSubPage(currentSubPage - 1);
    }
  };

  const copyReferralLink = () => {
    const link = `${window.location.origin}/signup?ref=${referralId}`;
    navigator.clipboard.writeText(link)
      .then(() => alert('Referral link copied to clipboard!'))
      .catch(err => console.error('Failed to copy:', err));
  };

  const handleWithdraw = (method) => {
    setWithdrawMethod(method);
    setShowWithdrawModal(true);
  };

  const submitWithdrawal = async (e) => {
    e.preventDefault();
    
    if (!creatorData) return;
    
    if (withdrawMethod === 'upi' && !upiId) {
      alert('Please enter your UPI ID');
      return;
    }
    
    try {
      const token = localStorage.getItem('referralToken');
      const response = await axios.post(
        `${api.Url}/admin/referral-payout`, 
        {
          creatorId: creatorData.creator._id,
          amount: creatorData.creator.pendingEarnings
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data.success) {
        setShowSuccessAnimation(true);
        setWithdrawSuccess(true);
        setShowWithdrawModal(false);
        setUpiId("");
        setWithdrawMethod(null);
        
        // Update local data
        setCreatorData(prev => prev ? {
          ...prev,
          creator: {
            ...prev.creator,
            pendingEarnings: 0,
            withdrawnAmount: (prev.creator.withdrawnAmount || 0) + prev.creator.pendingEarnings,
            payouts: [...(prev.creator.payouts || []), {
              amount: prev.creator.pendingEarnings,
              date: new Date(),
              status: 'processed'
            }]
          }
        } : null);
        
        setTimeout(() => setShowSuccessAnimation(false), 3000);
        setTimeout(() => setWithdrawSuccess(false), 5000);
      } else {
        throw new Error(response.data.message || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      alert(error.response?.data?.message || error.message || 'Error processing withdrawal. Please try again.');
    }
  };

  const closeModal = () => {
    setShowWithdrawModal(false);
    setWithdrawMethod(null);
    setUpiId("");
  };

  // Success SVG Animation Component
  const SuccessAnimation = () => (
    <div className="success-animation-overlay">
      <div className="success-animation-container">
        <div className="success-svg-animation">
          <svg viewBox="0 0 100 100" className="success-svg">
            <circle 
              cx="50" 
              cy="50" 
              r="45" 
              fill="none" 
              stroke="#34c759" 
              strokeWidth="3" 
              className="success-circle"
            />
            <path 
              d="M30,50 L45,65 L70,35" 
              fill="none" 
              stroke="#34c759" 
              strokeWidth="4" 
              className="success-check"
            />
          </svg>
        </div>
        <div className="success-content">
          <h3>Withdrawal Successful!</h3>
          <p>₹{creatorData?.creator.pendingEarnings} will be transferred within 24 working hours</p>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="ref-dashboard-loading">
        <div className="loading-spinner-large"></div>
        <p>Loading your secure dashboard...</p>
      </div>
    );
  }

  if (!authenticated || !creatorData) {
    return null; // Will redirect in useEffect
  }

  const analytics = creatorData.analytics || {};
  const creator = creatorData.creator;
  const canWithdraw = creator.pendingEarnings >= 1000;
  const progressPercentage = Math.min((creator.pendingEarnings / 1000) * 100, 100);
  const hasReferrals = analytics.totalReferredUsers > 0;
  const hasSubscriptions = analytics.activeSubscribers > 0;
  const currentSubscriptions = getCurrentSubscriptions();

  return (
    <div className="ref-dashboard-container">
      {/* Security Header */}
      <div className="ref-security-header">
        <div className="security-badge">
          <FaShieldAlt className="security-icon" />
          Secure Dashboard • Protected Access
        </div>
      </div>

      {/* SVG Success Animation */}
      {showSuccessAnimation && <SuccessAnimation />}

      {/* Success Message */}
      {withdrawSuccess && (
        <div className="ref-success-banner">
          <FaCheckCircle className="success-icon" />
          <div>
            <h3>Withdrawal Request Submitted!</h3>
            <p>You will receive ₹{creator.pendingEarnings} within 24 working hours.</p>
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="ref-dashboard-header">
        <div className="ref-header-content">
          <div className="ref-creator-info">
            <div className="ref-avatar">
              {creator.name.charAt(0).toUpperCase()}
            </div>
            <div className="ref-creator-details">
              <h1>{creator.name}</h1>
              <p>@{creator.username} • {creator.platform}</p>
              <div className="ref-referral-id">
                <span>Referral ID: </span>
                <code>{creator.referralId}</code>
                <button onClick={copyReferralLink} className="ref-copy-btn">
                  <FaCopy />
                </button>
              </div>
              <div className="ref-join-date">
                <FaCalendarAlt className="date-icon" />
                <span>Joined on {new Date(creator.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
          <div className="ref-header-actions">
            <div className="ref-header-stats">
              <div className="ref-stat-badge">
                <FaUserPlus className="stat-icon" />
                <span>{analytics.totalReferredUsers || 0} Referrals</span>
              </div>
              <div className="ref-stat-badge">
                <FaChartLine className="stat-icon" />
                <span>{analytics.conversionRate || 0}% Conversion</span>
              </div>
            </div>
            <button onClick={handleLogout} className="ref-logout-button">
              <FaSignOutAlt />
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="ref-quick-stats">
        <div className="ref-stat-card">
          <div className="stat-icon-wrapper total">
            <FaRupeeSign className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">₹{creator.totalEarnings || 0}</p>
            <span className="stat-change">
              {creator.totalEarnings > 0 ? (
                <>
                  <FaArrowUp className="change-icon" />
                  From {analytics.totalReferredUsers || 0} users
                </>
              ) : (
                "Start sharing to earn"
              )}
            </span>
          </div>
        </div>

        <div className="ref-stat-card">
          <div className="stat-icon-wrapper pending">
            <FaWallet className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Pending Balance</h3>
            <p className="stat-value">₹{creator.pendingEarnings || 0}</p>
            <span className="stat-change">
              {creator.pendingEarnings > 0 ? "Available for withdrawal" : "No pending earnings"}
            </span>
          </div>
        </div>

        <div className="ref-stat-card">
          <div className="stat-icon-wrapper subscribers">
            <FaUserCheck className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Active Subscribers</h3>
            <p className="stat-value">{analytics.activeSubscribers || 0}</p>
            <span className="stat-change">
              {analytics.activeSubscribers > 0 ? (
                <>
                  <FaCrown className="change-icon" />
                  {analytics.conversionRate || 0}% conversion
                </>
              ) : (
                "No subscribers yet"
              )}
            </span>
          </div>
        </div>

        <div className="ref-stat-card">
          <div className="stat-icon-wrapper revenue">
            <FaShoppingCart className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Subscription Revenue</h3>
            <p className="stat-value">₹{analytics.totalSubscriptionRevenue || 0}</p>
            <span className="stat-change">
              {analytics.totalSubscriptionRevenue > 0 ? (
                `From ${analytics.totalReferredUsers || 0} subscribers`
              ) : (
                "Share to get subscriptions"
              )}
            </span>
          </div>
        </div>
      </div>

      {/* Withdrawal Section */}
      <div className="ref-withdrawal-section">
        <div className="ref-section-header">
          <h2>Withdraw Earnings</h2>
          <p>Minimum withdrawal amount: ₹1000</p>
        </div>

        <div className="ref-withdrawal-card">
          <div className="withdrawal-info">
            <div className="balance-display">
              <span className="balance-label">Available Balance:</span>
              <span className="balance-amount">₹{creator.pendingEarnings || 0}</span>
            </div>
            
            <div className="progress-section">
              <div className="progress-header">
                <span>Progress to withdrawal limit</span>
                <span>{progressPercentage.toFixed(0)}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
              <div className="progress-labels">
                <span>₹0</span>
                <span>₹1000 required</span>
              </div>
            </div>

            {!canWithdraw && creator.pendingEarnings > 0 && (
              <div className="withdrawal-warning">
                <FaExclamationTriangle className="warning-icon" />
                <p>You need ₹{1000 - (creator.pendingEarnings || 0)} more to withdraw your earnings.</p>
              </div>
            )}

            {creator.pendingEarnings === 0 && (
              <div className="withdrawal-info-message">
                <FaRocket className="info-icon" />
                <p>Start sharing your referral link to earn money. You'll get ₹20 for each signup and 15% commission on subscriptions!</p>
              </div>
            )}
          </div>

          <div className="withdrawal-methods">
            <h4>Choose Withdrawal Method</h4>
            <div className="methods-grid">
              <button 
                className={`method-card ${!canWithdraw ? 'disabled' : ''}`}
                onClick={() => canWithdraw && handleWithdraw('upi')}
                disabled={!canWithdraw}
              >
                <div className="method-icon upi">
                  <FaMobileAlt />
                </div>
                <h5>UPI Transfer</h5>
                <p>Instant transfer to UPI ID</p>
              </button>

              <button 
                className={`method-card ${!canWithdraw ? 'disabled' : ''}`}
                onClick={() => canWithdraw && handleWithdraw('amazon')}
                disabled={!canWithdraw}
              >
                <div className="method-icon amazon">
                  <FaAmazon />
                </div>
                <h5>Amazon Redeem</h5>
                <p>Amazon Pay gift card</p>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="ref-analytics-section">
        <div className="ref-section-header">
          <h2>Earnings Analytics</h2>
          <p>Track your performance and growth</p>
        </div>

        {hasReferrals ? (
          <div className="analytics-grid">
            <div className="analytics-card">
              <h4>Earnings Trend</h4>
              <div className="earnings-chart">
                {creatorData.earningsHistory?.map((item, index) => (
                  <div key={index} className="chart-bar-container">
                    <div 
                      className="chart-bar" 
                      style={{ 
                        height: `${Math.max((item.totalEarnings / Math.max(...creatorData.earningsHistory.map(e => e.totalEarnings), 1)) * 100, 5)}%` 
                      }}
                    >
                      <span className="bar-value">₹{item.totalEarnings}</span>
                    </div>
                    <span className="bar-label">{item.month.split(' ')[0]}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="analytics-card">
              <h4>Revenue Sources</h4>
              <div className="revenue-sources">
                <div className="source-item">
                  <div className="source-color signup"></div>
                  <span>User Signups</span>
                  <strong>₹{analytics.signupEarnings || 0}</strong>
                </div>
                <div className="source-item">
                  <div className="source-color subscription"></div>
                  <span>Subscriptions</span>
                  <strong>₹{analytics.subscriptionEarnings || 0}</strong>
                </div>
                <div className="source-total">
                  <div className="source-color total"></div>
                  <span>Total Calculated</span>
                  <strong>₹{analytics.totalCalculatedEarnings || 0}</strong>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="analytics-empty-state">
            <div className="empty-analytics-icon">
              <FaChartLine />
            </div>
            <h3>No Analytics Data Yet</h3>
            <p>Start sharing your referral link to see your earnings analytics and performance metrics.</p>
          </div>
        )}
      </div>

      {/* Recent Referrals */}
      <div className="ref-recent-activity">
        <div className="ref-section-header">
          <h2>Recent Referrals</h2>
          <p>Users who joined through your link</p>
        </div>

        {hasReferrals ? (
          <div className="activity-list">
            {creatorData.referredUsers?.map((user, index) => (
              <div key={index} className="activity-item">
                <div className="activity-avatar">
                  {user.name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <div className="activity-details">
                  <h4>{user.name || 'Unknown User'}</h4>
                  <p>{user.email || 'No email provided'}</p>
                  <small>Joined {new Date(user.date).toLocaleDateString()}</small>
                </div>
                <div className="activity-earning">
                  <span className={`earning-type ${user.type}`}>
                    {user.type === 'subscriber' ? 'Subscriber' : 'Free User'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-referrals-state">
            <div className="empty-referrals-icon">
              <FaUserPlus />
            </div>
            <h3>No Referrals Yet</h3>
            <p>Share your referral link with your audience to get your first referral and start earning!</p>
            <div className="referral-tips">
              <h4>Quick Tips to Get Referrals:</h4>
              <ul>
                <li>Share on your social media profiles</li>
                <li>Include in your bio/description</li>
                <li>Share with friends and community</li>
                <li>Create content about the platform</li>
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Purchases */}
      <div className="ref-subscription-section">
        <div className="ref-section-header">
          <h2>Subscription Purchases</h2>
          <p>Detailed subscription purchases from your referrals</p>
        </div>

        {hasSubscriptions && creatorData.subscriptionDetails?.length > 0 ? (
          <>
            <div className="subscription-list">
              {currentSubscriptions.map((subscription, index) => (
                <div key={index} className="subscription-item">
                  <div className="subscription-avatar">
                    <FaCrown />
                  </div>
                  <div className="subscription-details">
                    <h4>{subscription.userName || 'Unknown User'}</h4>
                    <p>{subscription.userEmail || 'No email provided'}</p>
                    <div className="subscription-meta">
                      <span className="transaction-id">
                        Txn: {subscription.transactionId || 'N/A'}
                      </span>
                      <span className="purchase-date">
                        Purchased on {new Date(subscription.purchaseDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="subscription-info">
                    <span className={`subscription-status ${subscription.status}`}>
                      {subscription.status || 'Unknown'}
                    </span>
                    <span className="plan-type">{subscription.planType || 'Standard Plan'}</span>
                    <span className="subscription-amount">₹{subscription.amount || 0}</span>
                    <span className="expiry-date">
                      Expires: {new Date(subscription.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalSubPages > 1 && (
              <div className="subscription-pagination">
                <button 
                  onClick={handlePrevSubPage} 
                  disabled={currentSubPage === 1}
                  className="pagination-btn"
                >
                  <FaChevronLeft />
                  Previous
                </button>
                
                <span className="pagination-info">
                  Page {currentSubPage} of {totalSubPages}
                </span>
                
                <button 
                  onClick={handleNextSubPage} 
                  disabled={currentSubPage === totalSubPages}
                  className="pagination-btn"
                >
                  Next
                  <FaChevronRight />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="empty-subscriptions-state">
            <div className="empty-subscriptions-icon">
              <FaCrown />
            </div>
            <h3>No Subscription Purchases Yet</h3>
            <p>When users you refer purchase subscriptions, you'll earn 15% commission on each sale!</p>
          </div>
        )}
      </div>

      {/* Share Section */}
      <div className="ref-share-section">
        <div className="ref-section-header">
          <h2>Share Your Link</h2>
          <p>Spread your referral link to earn more</p>
        </div>

        <div className="share-card">
          <div className="share-link">
            <input 
              type="text" 
              value={`${window.location.origin}/signup?ref=${referralId}`}
              readOnly 
              className="share-input"
            />
            <button onClick={copyReferralLink} className="ref-primary-button">
              <FaCopy /> Copy Link
            </button>
          </div>
          <div className="share-tips">
            <h4>Earning Potential:</h4>
            <div className="earning-breakdown">
              <div className="earning-item">
                <span className="earning-type">User Signup</span>
                <span className="earning-amount">₹20 each</span>
              </div>
              <div className="earning-item">
                <span className="earning-type">Subscription Purchase</span>
                <span className="earning-amount">15% commission</span>
              </div>
              <div className="earning-item">
                <span className="earning-type">Minimum Withdrawal</span>
                <span className="earning-amount">₹1000</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Withdrawal Modal */}
      {showWithdrawModal && (
        <div className="ref-modal-overlay">
          <div className="ref-modal">
            <div className="modal-header">
              <h3>
                {withdrawMethod === 'upi' ? 'UPI Transfer' : 'Amazon Redeem'}
              </h3>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>

            <div className="modal-content">
              {withdrawMethod === 'upi' ? (
                <form onSubmit={submitWithdrawal}>
                  <div className="form-group">
                    <label>Enter Your UPI ID</label>
                    <input
                      type="text"
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="yourname@upi"
                      required
                      className="form-input"
                    />
                    <small>Example: john.doe@okicici</small>
                  </div>
                  
                  <div className="withdrawal-summary">
                    <div className="summary-item">
                      <span>Withdrawal Amount:</span>
                      <span>₹{creator.pendingEarnings || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span>Processing Time:</span>
                      <span>24 working hours</span>
                    </div>
                  </div>

                  <button type="submit" className="ref-primary-button full-width">
                    Confirm Withdrawal
                  </button>
                </form>
              ) : (
                <div className="amazon-redeem">
                  <div className="redeem-icon">
                    <FaAmazon />
                  </div>
                  <h4>Amazon Pay Gift Card</h4>
                  <p>You will receive an Amazon Pay gift card worth ₹{creator.pendingEarnings || 0} within 24 working hours.</p>
                  
                  <div className="withdrawal-summary">
                    <div className="summary-item">
                      <span>Redeem Amount:</span>
                      <span>₹{creator.pendingEarnings || 0}</span>
                    </div>
                    <div className="summary-item">
                      <span>Delivery:</span>
                      <span>Email within 24 hours</span>
                    </div>
                  </div>

                  <button onClick={submitWithdrawal} className="ref-primary-button full-width">
                    Redeem Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralDashboard;