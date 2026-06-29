'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FaUserPlus, FaMoneyBillWave, FaChartLine, FaSearch, 
  FaEdit, FaTrash, FaPlus, FaSync, FaUsers, 
  FaCoins, FaPercentage, FaRupeeSign, 
  FaCheck, FaTimes, FaInfoCircle
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from "recharts";
import axios from "axios";
import api from "../../config/api";

// ------------------- CSS STYLES (Pure Black, Glassmorphism, Pink & Purple) -------------------
const styles = `
.userref-root-x30sn {
  color: #fff;
  background-color: #030303;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: userref-fadeIn-x30sn 0.4s ease;
}
@keyframes userref-fadeIn-x30sn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.userref-header-x30sn {
  padding: 28px 32px;
  background: linear-gradient(180deg, #070707 0%, #030303 100%);
  border-bottom: 1px solid #161616;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.userref-title-group-x30sn h2 {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}
.userref-subtitle-x30sn {
  color: #a78bfa;
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* BUTTONS */
.userref-btn-x30sn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  border: 1px solid #222;
  background: #0c0c0c;
  color: #eee;
  transition: all 0.25s ease;
  text-decoration: none;
}
.userref-btn-x30sn:hover:not(:disabled) {
  border-color: #ff69b4;
  color: #ff69b4;
  background: rgba(255, 105, 180, 0.03);
  transform: translateY(-1px);
}
.userref-btn-x30sn.primary {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.userref-btn-x30sn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
  color: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.25);
}
.userref-btn-x30sn.danger {
  background: rgba(239, 68, 68, 0.1);
  border-color: rgba(239, 68, 68, 0.4);
  color: #ef4444;
}
.userref-btn-x30sn.danger:hover:not(:disabled) {
  background: rgba(239, 68, 68, 0.2);
  border-color: #ef4444;
}
.userref-btn-x30sn:disabled { opacity: 0.5; cursor: not-allowed; }

/* TABS */
.userref-tabs-container-x30sn {
  display: flex;
  gap: 8px;
  padding: 0 32px;
  margin-top: 24px;
  border-bottom: 1px solid #161616;
}
.userref-tab-x30sn {
  padding: 12px 24px;
  background: transparent;
  border: none;
  border-bottom: 2px solid transparent;
  color: #888;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
}
.userref-tab-x30sn:hover {
  color: #fff;
}
.userref-tab-x30sn.active {
  color: #ff69b4;
  border-bottom-color: #ff69b4;
}

/* KPI GRID */
.userref-stats-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}
.userref-stat-card-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}
.userref-stat-card-x30sn:hover {
  border-color: #262626;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.userref-stat-card-x30sn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(167,139,250,0.02), transparent 60%);
  pointer-events: none;
}
.userref-stat-icon-wrapper-x30sn {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(255, 105, 180, 0.08);
  color: #ff69b4;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 1px solid rgba(255, 105, 180, 0.15);
}
.userref-stat-label-x30sn { margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.8px; display: block; }
.userref-stat-value-x30sn { font-size: 24px; color: #fff; display: block; margin-top: 4px; font-weight: 800; }

/* FILTERS SECTION */
.userref-filters-x30sn {
  background: rgba(10, 10, 10, 0.4);
  border: 1px solid #161616;
  border-radius: 16px;
  padding: 20px 24px;
  margin: 0 32px 24px;
  backdrop-filter: blur(12px);
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.userref-search-container-x30sn {
  position: relative;
  flex: 2;
  min-width: 260px;
}
.userref-search-icon-x30sn {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
}
.userref-search-input-x30sn {
  width: 100%;
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px 14px 12px 42px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  transition: all 0.25s ease;
}
.userref-search-input-x30sn:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.15);
}
.userref-filter-select-x30sn {
  flex: 1;
  min-width: 140px;
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px 14px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.userref-filter-select-x30sn:focus { border-color: #ff69b4; }

/* TABLE SECTION */
.userref-table-wrap-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 20px;
  margin: 0 32px 24px;
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.userref-table-x30sn {
  width: 100%;
  border-collapse: collapse;
}
.userref-table-x30sn thead {
  background: rgba(4, 4, 4, 0.4);
  border-bottom: 1px solid #161616;
}
.userref-table-x30sn th {
  padding: 16px;
  text-align: left;
  color: #52525b;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.8px;
}
.userref-table-x30sn tbody tr {
  border-bottom: 1px solid #141414;
  transition: all 0.2s;
}
.userref-table-x30sn tbody tr:last-child { border-bottom: none; }
.userref-table-x30sn tbody tr:hover {
  background: rgba(255, 255, 255, 0.015);
}
.userref-table-x30sn td {
  padding: 14px 16px;
  vertical-align: middle;
  font-size: 13px;
  color: #d4d4d8;
}

.userref-user-cell-x30sn {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.userref-user-name-x30sn {
  font-weight: 700;
  color: #fff;
}
.userref-user-email-x30sn {
  font-size: 11px;
  color: #666;
}
.userref-reward-tag-x30sn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 10px;
  font-weight: 700;
  margin-right: 6px;
  margin-bottom: 4px;
}
.userref-reward-tag-x30sn.claimed {
  background: rgba(0, 255, 136, 0.08);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.15);
}
.userref-reward-tag-x30sn.pending {
  background: rgba(251, 191, 36, 0.08);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.15);
}

/* BADGES */
.userref-badge-x30sn {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.userref-badge-x30sn.pending {
  background: rgba(251, 191, 36, 0.08);
  color: #fbbf24;
  border: 1px solid rgba(251, 191, 36, 0.15);
}
.userref-badge-x30sn.active {
  background: rgba(59, 130, 246, 0.08);
  color: #3b82f6;
  border: 1px solid rgba(59, 130, 246, 0.15);
}
.userref-badge-x30sn.premium {
  background: rgba(167, 139, 250, 0.08);
  color: #a78bfa;
  border: 1px solid rgba(167, 139, 250, 0.15);
  box-shadow: 0 0 10px rgba(167, 139, 250, 0.15);
}
.userref-badge-x30sn.approved {
  background: rgba(0, 255, 136, 0.08);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.15);
}
.userref-badge-x30sn.rejected {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.15);
}
.userref-badge-x30sn.invalid {
  background: rgba(113, 113, 122, 0.08);
  color: #a1a1aa;
  border: 1px solid rgba(113, 113, 122, 0.15);
}

/* PAGINATION */
.userref-pagination-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 32px;
  border-top: 1px solid #161616;
}
.userref-page-info-x30sn {
  font-size: 13px;
  color: #666;
}
.userref-pagination-buttons-x30sn {
  display: flex;
  gap: 8px;
}

/* CHARTS SECTION */
.userref-charts-section-x30sn {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  padding: 0 32px 32px;
}
@media (max-width: 900px) { .userref-charts-section-x30sn { grid-template-columns: 1fr; } }
.userref-chart-card-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
}
.userref-chart-title-x30sn {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 20px;
}

/* MODAL */
.userref-modal-overlay-x30sn {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.userref-modal-content-x30sn {
  background: rgba(10, 10, 10, 0.98);
  border: 1px solid #262626;
  border-radius: 20px;
  width: 95%;
  max-width: 550px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  animation: userref-modalScale-x30sn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  max-height: 90vh;
  overflow-y: auto;
}
@keyframes userref-modalScale-x30sn {
  from { transform: scale(0.9) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
.userref-modal-header-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.userref-modal-header-x30sn h3 {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  color: #fff;
}
.userref-modal-close-x30sn {
  background: none;
  border: none;
  color: #666;
  font-size: 20px;
  cursor: pointer;
  transition: color 0.2s;
}
.userref-modal-close-x30sn:hover { color: #fff; }

.userref-form-group-x30sn {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.userref-form-group-x30sn label {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.8px;
}
.userref-form-input-x30sn {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  transition: all 0.25s ease;
}
.userref-form-input-x30sn:focus {
  border-color: #ff69b4;
}
.userref-form-checkbox-group-x30sn {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}
.userref-form-checkbox-x30sn {
  width: 16px;
  height: 16px;
  accent-color: #ff69b4;
  cursor: pointer;
}

.spin { animation: userref-spin-x30sn 1s linear infinite; }
@keyframes userref-spin-x30sn { 100% { transform: rotate(360deg); } }
`;

const UserOwnReferralsAdmin = () => {
  const [activeTab, setActiveTab] = useState("referrals");
  const [referrals, setReferrals] = useState([]);
  const [withdrawals, setWithdrawals] = useState([]);
  const [analytics, setAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [refStatusFilter, setRefStatusFilter] = useState("all");
  const [withdrawStatusFilter, setWithdrawStatusFilter] = useState("all");

  // Pagination for referrals
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  // Modal forms
  const [newReferral, setNewReferral] = useState({
    referrerEmail: "",
    referredUserEmail: "",
    status: "pending",
    signupRewardAmount: 2,
    activeRewardAmount: 3,
    subscriptionCommissionAmount: 0
  });

  const [editReferralObj, setEditReferralObj] = useState(null);
  const [withdrawalToReject, setWithdrawalToReject] = useState(null);
  const [rejectionMessage, setRejectionMessage] = useState("");

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  // Fetch functions
  const fetchReferrals = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(
        `${api.Url}/admin/referrals?page=${currentPage}&limit=${itemsPerPage}&search=${searchQuery}&status=${refStatusFilter}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setReferrals(res.data.referrals || []);
        setTotalPages(res.data.totalPages || 1);
        setTotalItems(res.data.total || 0);
      }
    } catch (e) {
      console.error("Error fetching referrals:", e);
    }
  }, [currentPage, searchQuery, refStatusFilter, getToken]);

  const fetchWithdrawals = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/referrals/withdrawals`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setWithdrawals(res.data.withdrawals || []);
      }
    } catch (e) {
      console.error("Error fetching withdrawals:", e);
    }
  }, [getToken]);

  const fetchAnalytics = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/referrals/analytics`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAnalytics(res.data.analytics || {});
      }
    } catch (e) {
      console.error("Error fetching analytics:", e);
    }
  }, [getToken]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchReferrals(), fetchWithdrawals(), fetchAnalytics()]);
    setRefreshing(false);
    setLoading(false);
  }, [fetchReferrals, fetchWithdrawals, fetchAnalytics]);

  useEffect(() => {
    fetchAllData();
  }, [currentPage, refStatusFilter, activeTab]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      setCurrentPage(1);
      fetchReferrals();
    }
  };

  // Actions
  const handleCreateReferral = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const res = await axios.post(`${api.Url}/admin/referrals`, newReferral, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Referral relationship created successfully!");
        setShowAddModal(false);
        setNewReferral({
          referrerEmail: "",
          referredUserEmail: "",
          status: "pending",
          signupRewardAmount: 2,
          activeRewardAmount: 3,
          subscriptionCommissionAmount: 0
        });
        fetchAllData();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to create referral");
    }
  };

  const handleUpdateReferral = async (e) => {
    e.preventDefault();
    if (!editReferralObj) return;
    try {
      const token = getToken();
      const res = await axios.put(`${api.Url}/admin/referrals/${editReferralObj._id}`, editReferralObj, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Referral updated successfully!");
        setShowEditModal(false);
        setEditReferralObj(null);
        fetchAllData();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to update referral");
    }
  };

  const handleDeleteReferral = async (id) => {
    if (!window.confirm("Are you sure you want to delete this referral? Referrer balances will be adjusted accordingly.")) return;
    try {
      const token = getToken();
      const res = await axios.delete(`${api.Url}/admin/referrals/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert("Referral deleted successfully!");
        fetchAllData();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to delete referral");
    }
  };

  const handleProcessWithdrawal = async (id, status, errorMsg = "") => {
    const confirmationText = status === 'approved' 
      ? "Are you sure you want to APPROVE this withdrawal request?" 
      : "Are you sure you want to REJECT this withdrawal request? The balance will be refunded to the user.";
    if (!window.confirm(confirmationText)) return;

    try {
      const token = getToken();
      const res = await axios.post(`${api.Url}/admin/referrals/withdrawals/${id}`, {
        status,
        errorMessage: errorMsg
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        alert(`Withdrawal request successfully ${status}!`);
        setShowRejectModal(false);
        setWithdrawalToReject(null);
        setRejectionMessage("");
        fetchAllData();
      }
    } catch (error) {
      console.error(error);
      alert(error.response?.data?.message || "Failed to process withdrawal");
    }
  };

  // Filtered withdrawals
  const filteredWithdrawals = useMemo(() => {
    return withdrawals.filter(w => {
      const matchStatus = withdrawStatusFilter === "all" || w.status === withdrawStatusFilter;
      const matchSearch = !searchQuery || 
        w.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.user?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.details?.upiId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        w.details?.accountNo?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [withdrawals, withdrawStatusFilter, searchQuery]);

  // Derived KPI Stats
  const kpiStats = useMemo(() => {
    const pendingWithdrawalCount = withdrawals.filter(w => w.status === 'pending').length;
    const pendingWithdrawalAmount = withdrawals
      .filter(w => w.status === 'pending')
      .reduce((sum, w) => sum + w.amount, 0);

    return {
      pendingWithdrawalCount,
      pendingWithdrawalAmount,
      totalRevenueGenerated: analytics.revenueGenerated || 0,
      totalPayoutsProcessed: analytics.payoutsProcessed || 0,
      signupRate: analytics.referralSignupRate || 0,
      activationRate: analytics.referralActivationRate || 0,
      purchaseRate: analytics.referralPurchaseRate || 0,
      profitMultiplier: analytics.profitMultiplier || "N/A"
    };
  }, [withdrawals, analytics]);

  // Chart Data
  const chartDataStatus = useMemo(() => {
    const counts = referrals.reduce((acc, r) => {
      acc[r.status] = (acc[r.status] || 0) + 1;
      return acc;
    }, { pending: 0, active: 0, premium: 0, invalid: 0 });

    return [
      { name: "Pending", value: counts.pending, color: "#fbbf24" },
      { name: "Active", value: counts.active, color: "#3b82f6" },
      { name: "Premium", value: counts.premium, color: "#a78bfa" },
      { name: "Invalid", value: counts.invalid, color: "#71717a" }
    ];
  }, [referrals]);

  const chartDataWithdrawals = useMemo(() => {
    const counts = withdrawals.reduce((acc, w) => {
      acc[w.status] = (acc[w.status] || 0) + 1;
      return acc;
    }, { pending: 0, approved: 0, rejected: 0 });

    return [
      { name: "Pending", count: counts.pending, color: "#fbbf24" },
      { name: "Approved", count: counts.approved, color: "#00ff88" },
      { name: "Rejected", count: counts.rejected, color: "#ef4444" }
    ];
  }, [withdrawals]);

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", color: "#fff" }}>
        <FaSync className="spin" style={{ fontSize: "28px" }} />
      </div>
    );
  }

  return (
    <div className="userref-root-x30sn">
      <style>{styles}</style>

      {/* HEADER */}
      <header className="userref-header-x30sn">
        <div className="userref-title-group-x30sn">
          <h2>User Referral Intelligence & Economy</h2>
          <p className="userref-subtitle-x30sn">
            <FaCoins /> Manage user invite loops, commissions, and withdrawal disbursements.
          </p>
        </div>
        <div>
          <button className="userref-btn-x30sn" onClick={fetchAllData} disabled={refreshing}>
            <FaSync className={refreshing ? "spin" : ""} /> Refresh Dashboard
          </button>
        </div>
      </header>

      {/* TABS */}
      <div className="userref-tabs-container-x30sn">
        <button 
          className={`userref-tab-x30sn ${activeTab === "referrals" ? "active" : ""}`}
          onClick={() => { setActiveTab("referrals"); setSearchQuery(""); }}
        >
          User Referrals ({totalItems})
        </button>
        <button 
          className={`userref-tab-x30sn ${activeTab === "withdrawals" ? "active" : ""}`}
          onClick={() => { setActiveTab("withdrawals"); setSearchQuery(""); }}
        >
          Withdrawals ({filteredWithdrawals.length})
        </button>
        <button 
          className={`userref-tab-x30sn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => setActiveTab("analytics")}
        >
          Analytics & Insights
        </button>
      </div>

      {/* STATS SUMMARY */}
      <section className="userref-stats-grid-x30sn">
        <div className="userref-stat-card-x30sn">
          <div className="userref-stat-icon-wrapper-x30sn"><FaUsers /></div>
          <div>
            <span className="userref-stat-label-x30sn">Signup Conv. Rate</span>
            <span className="userref-stat-value-x30sn">{kpiStats.signupRate}%</span>
          </div>
        </div>
        <div className="userref-stat-card-x30sn">
          <div className="userref-stat-icon-wrapper-x30sn"><FaPercentage /></div>
          <div>
            <span className="userref-stat-label-x30sn">Activation Rate</span>
            <span className="userref-stat-value-x30sn">{kpiStats.activationRate}%</span>
          </div>
        </div>
        <div className="userref-stat-card-x30sn">
          <div className="userref-stat-icon-wrapper-x30sn"><FaChartLine /></div>
          <div>
            <span className="userref-stat-label-x30sn">Purchase Conv. Rate</span>
            <span className="userref-stat-value-x30sn">{kpiStats.purchaseRate}%</span>
          </div>
        </div>
        <div className="userref-stat-card-x30sn">
          <div className="userref-stat-icon-wrapper-x30sn"><FaMoneyBillWave /></div>
          <div>
            <span className="userref-stat-label-x30sn">Pending Withdrawals</span>
            <span className="userref-stat-value-x30sn">
              ₹{kpiStats.pendingWithdrawalAmount} ({kpiStats.pendingWithdrawalCount})
            </span>
          </div>
        </div>
      </section>

      {/* TABS CONTENT */}
      {activeTab === "referrals" && (
        <>
          {/* FILTERS */}
          <div className="userref-filters-x30sn">
            <div className="userref-search-container-x30sn">
              <FaSearch className="userref-search-icon-x30sn" />
              <input 
                type="text" 
                placeholder="Search referrer / referred user (Press Enter)..." 
                className="userref-search-input-x30sn"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={handleSearchKeyPress}
              />
            </div>
            <select 
              className="userref-filter-select-x30sn"
              value={refStatusFilter}
              onChange={(e) => { setRefStatusFilter(e.target.value); setCurrentPage(1); }}
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="active">Active (Stage 2)</option>
              <option value="premium">Premium (Stage 3)</option>
              <option value="invalid">Invalid</option>
            </select>
            <button className="userref-btn-x30sn primary" onClick={() => setShowAddModal(true)}>
              <FaPlus /> Manual Referral
            </button>
          </div>

          {/* TABLE */}
          <div className="userref-table-wrap-x30sn">
            <table className="userref-table-x30sn">
              <thead>
                <tr>
                  <th>Referrer (inviter)</th>
                  <th>Referred User</th>
                  <th>Status</th>
                  <th>Stage</th>
                  <th>Rewards (Claim status)</th>
                  <th>IP / Device</th>
                  <th>Date Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {referrals.length === 0 ? (
                  <tr>
                    <td colSpan="8" style={{ textAlign: "center", padding: "24px", color: "#666" }}>
                      No referrals found matching the filter.
                    </td>
                  </tr>
                ) : (
                  referrals.map(r => (
                    <tr key={r._id}>
                      <td>
                        <div className="userref-user-cell-x30sn">
                          <span className="userref-user-name-x30sn">{r.referrer?.name || "N/A"}</span>
                          <span className="userref-user-email-x30sn">{r.referrer?.email || "N/A"}</span>
                          <span className="userref-user-email-x30sn" style={{ color: "#a78bfa" }}>
                            Bal: ₹{r.referrer?.referralBalance || 0} | Pend: ₹{r.referrer?.pendingReferralBalance || 0}
                          </span>
                        </div>
                      </td>
                      <td>
                        <div className="userref-user-cell-x30sn">
                          <span className="userref-user-name-x30sn">{r.referredUser?.name || "N/A"}</span>
                          <span className="userref-user-email-x30sn">{r.referredUser?.email || "N/A"}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`userref-badge-x30sn ${r.status}`}>
                          {r.status}
                        </span>
                        {r.status === 'invalid' && r.invalidReason && (
                          <div style={{ fontSize: "10px", color: "#ef4444", marginTop: "4px", maxWidth: "120px" }}>
                            Reason: {r.invalidReason}
                          </div>
                        )}
                      </td>
                      <td style={{ fontWeight: "700" }}>{r.stage}</td>
                      <td>
                        <div>
                          <span className={`userref-reward-tag-x30sn ${r.signupRewardClaimed ? 'claimed' : 'pending'}`}>
                            Reg: ₹{r.signupRewardAmount} ({r.signupRewardClaimed ? 'Claimed' : 'Pending'})
                          </span>
                          {(r.status === 'active' || r.status === 'premium' || r.activeRewardAmount > 0) && (
                            <span className={`userref-reward-tag-x30sn ${r.activeRewardClaimed ? 'claimed' : 'pending'}`}>
                              Act: ₹{r.activeRewardAmount} ({r.activeRewardClaimed ? 'Claimed' : 'Pending'})
                            </span>
                          )}
                          {(r.subscriptionPurchased || r.subscriptionCommissionAmount > 0) && (
                            <span className={`userref-reward-tag-x30sn ${r.commissionClaimed ? 'claimed' : 'pending'}`}>
                              Sub: ₹{r.subscriptionCommissionAmount} ({r.commissionClaimed ? 'Claimed' : 'Pending'})
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <div style={{ fontSize: "11px", color: "#888" }}>
                          <div>IP: {r.ipAddress || "N/A"}</div>
                          <div>ID: {r.deviceId ? `${r.deviceId.substring(0, 10)}...` : "N/A"}</div>
                        </div>
                      </td>
                      <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                      <td>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <button 
                            className="userref-btn-x30sn" 
                            style={{ padding: "6px 10px", borderColor: "#a78bfa", color: "#a78bfa" }}
                            onClick={() => { setEditReferralObj({ ...r }); setShowEditModal(true); }}
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="userref-btn-x30sn danger" 
                            style={{ padding: "6px 10px" }}
                            onClick={() => handleDeleteReferral(r._id)}
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          <div className="userref-pagination-x30sn">
            <span className="userref-page-info-x30sn">
              Showing page {currentPage} of {totalPages} (Total {totalItems} Invites)
            </span>
            <div className="userref-pagination-buttons-x30sn">
              <button 
                className="userref-btn-x30sn"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => prev - 1)}
              >
                Previous
              </button>
              <button 
                className="userref-btn-x30sn"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => prev + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {activeTab === "withdrawals" && (
        <>
          {/* FILTERS */}
          <div className="userref-filters-x30sn">
            <div className="userref-search-container-x30sn">
              <FaSearch className="userref-search-icon-x30sn" />
              <input 
                type="text" 
                placeholder="Search user email / name / details..." 
                className="userref-search-input-x30sn"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <select 
              className="userref-filter-select-x30sn"
              value={withdrawStatusFilter}
              onChange={(e) => setWithdrawStatusFilter(e.target.value)}
            >
              <option value="all">All Withdrawals</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* TABLE */}
          <div className="userref-table-wrap-x30sn">
            <table className="userref-table-x30sn">
              <thead>
                <tr>
                  <th>User Details</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Payment Details</th>
                  <th>Status</th>
                  <th>Date Requested</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: "center", padding: "24px", color: "#666" }}>
                      No withdrawal requests found.
                    </td>
                  </tr>
                ) : (
                  filteredWithdrawals.map(w => (
                    <tr key={w._id}>
                      <td>
                        <div className="userref-user-cell-x30sn">
                          <span className="userref-user-name-x30sn">{w.user?.name || "Anonymous User"}</span>
                          <span className="userref-user-email-x30sn">{w.user?.email || "N/A"}</span>
                          <span className="userref-user-email-x30sn" style={{ color: "#fbbf24" }}>
                            Current Bal: ₹{w.user?.referralBalance || 0}
                          </span>
                        </div>
                      </td>
                      <td style={{ fontWeight: "800", color: "#fff", fontSize: "15px" }}>₹{w.amount}</td>
                      <td style={{ textTransform: "uppercase", fontWeight: "600" }}>{w.method}</td>
                      <td>
                        {w.method === 'upi' ? (
                          <div style={{ fontSize: "12px" }}>
                            <strong>UPI ID:</strong> {w.details?.upiId || "N/A"}
                          </div>
                        ) : (
                          <div style={{ fontSize: "12px", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <div><strong>A/C Holder:</strong> {w.details?.holderName || "N/A"}</div>
                            <div><strong>A/C No:</strong> {w.details?.accountNo || "N/A"}</div>
                            <div><strong>IFSC:</strong> {w.details?.ifsc || "N/A"}</div>
                            <div><strong>Bank:</strong> {w.details?.bankName || "N/A"}</div>
                          </div>
                        )}
                      </td>
                      <td>
                        <span className={`userref-badge-x30sn ${w.status}`}>
                          {w.status}
                        </span>
                        {w.status === 'rejected' && w.errorMessage && (
                          <div style={{ fontSize: "11px", color: "#ef4444", marginTop: "4px", maxWidth: "150px" }}>
                            Error: {w.errorMessage}
                          </div>
                        )}
                        {w.status === 'approved' && w.processedAt && (
                          <div style={{ fontSize: "11px", color: "#888", marginTop: "4px" }}>
                            At: {new Date(w.processedAt).toLocaleString()}
                          </div>
                        )}
                      </td>
                      <td>{new Date(w.createdAt).toLocaleString()}</td>
                      <td>
                        {w.status === 'pending' ? (
                          <div style={{ display: "flex", gap: "8px" }}>
                            <button 
                              className="userref-btn-x30sn" 
                              style={{ borderColor: "#00ff88", color: "#00ff88", padding: "6px 12px" }}
                              onClick={() => handleProcessWithdrawal(w._id, 'approved')}
                            >
                              <FaCheck /> Approve
                            </button>
                            <button 
                              className="userref-btn-x30sn danger" 
                              style={{ padding: "6px 12px" }}
                              onClick={() => { setWithdrawalToReject(w); setShowRejectModal(true); }}
                            >
                              <FaTimes /> Reject
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: "12px", color: "#666" }}>Processed</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {activeTab === "analytics" && (
        <>
          {/* KPI EXTRA DETAILS */}
          <section className="userref-stats-grid-x30sn" style={{ paddingTop: "0" }}>
            <div className="userref-stat-card-x30sn">
              <div className="userref-stat-icon-wrapper-x30sn"><FaRupeeSign /></div>
              <div>
                <span className="userref-stat-label-x30sn">Total Sub. Revenue</span>
                <span className="userref-stat-value-x30sn">₹{kpiStats.totalRevenueGenerated}</span>
              </div>
            </div>
            <div className="userref-stat-card-x30sn">
              <div className="userref-stat-icon-wrapper-x30sn"><FaCoins /></div>
              <div>
                <span className="userref-stat-label-x30sn">Total Payouts Disbursed</span>
                <span className="userref-stat-value-x30sn">₹{kpiStats.totalPayoutsProcessed}</span>
              </div>
            </div>
            <div className="userref-stat-card-x30sn">
              <div className="userref-stat-icon-wrapper-x30sn"><FaChartLine /></div>
              <div>
                <span className="userref-stat-label-x30sn">LTV / Payout Multiplier</span>
                <span className="userref-stat-value-x30sn" style={{ color: "#a78bfa" }}>
                  {kpiStats.profitMultiplier}x
                </span>
              </div>
            </div>
          </section>

          {/* CHARTS */}
          <div className="userref-charts-section-x30sn">
            <div className="userref-chart-card-x30sn">
              <h3 className="userref-chart-title-x30sn">Referral Status Breakdown</h3>
              <div style={{ width: "100%", height: "250px" }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={chartDataStatus.filter(d => d.value > 0)}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartDataStatus.filter(d => d.value > 0).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "#222" }} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="userref-chart-card-x30sn">
              <h3 className="userref-chart-title-x30sn">Withdrawals Request Volume</h3>
              <div style={{ width: "100%", height: "250px" }}>
                <ResponsiveContainer>
                  <BarChart data={chartDataWithdrawals}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#222" />
                    <XAxis dataKey="name" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip contentStyle={{ backgroundColor: "#111", borderColor: "#222" }} />
                    <Bar dataKey="count" fill="#ff69b4" radius={[6, 6, 0, 0]}>
                      {chartDataWithdrawals.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ==================== MODALS ==================== */}

      {/* ADD MANUAL REFERRAL MODAL */}
      {showAddModal && (
        <div className="userref-modal-overlay-x30sn" onClick={() => setShowAddModal(false)}>
          <div className="userref-modal-content-x30sn" onClick={(e) => e.stopPropagation()}>
            <div className="userref-modal-header-x30sn">
              <h3>Create Manual Referral Link</h3>
              <button className="userref-modal-close-x30sn" onClick={() => setShowAddModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleCreateReferral}>
              <div className="userref-form-group-x30sn">
                <label>Referrer Email (who invited)</label>
                <input 
                  type="email" 
                  required
                  placeholder="referrer@example.com" 
                  className="userref-form-input-x30sn"
                  value={newReferral.referrerEmail}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, referrerEmail: e.target.value }))}
                />
              </div>
              <div className="userref-form-group-x30sn">
                <label>Referred User Email (invitee)</label>
                <input 
                  type="email" 
                  required
                  placeholder="referred@example.com" 
                  className="userref-form-input-x30sn"
                  value={newReferral.referredUserEmail}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, referredUserEmail: e.target.value }))}
                />
              </div>
              <div className="userref-form-group-x30sn">
                <label>Status</label>
                <select 
                  className="userref-form-input-x30sn"
                  value={newReferral.status}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="premium">Premium</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>
              <div className="userref-form-group-x30sn">
                <label>Signup Reward Amount (₹)</label>
                <input 
                  type="number" 
                  className="userref-form-input-x30sn"
                  value={newReferral.signupRewardAmount}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, signupRewardAmount: Number(e.target.value) }))}
                />
              </div>
              <div className="userref-form-group-x30sn">
                <label>Active Reward Amount (₹)</label>
                <input 
                  type="number" 
                  className="userref-form-input-x30sn"
                  value={newReferral.activeRewardAmount}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, activeRewardAmount: Number(e.target.value) }))}
                />
              </div>
              <div className="userref-form-group-x30sn">
                <label>Subscription Commission Amount (₹)</label>
                <input 
                  type="number" 
                  className="userref-form-input-x30sn"
                  value={newReferral.subscriptionCommissionAmount}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, subscriptionCommissionAmount: Number(e.target.value) }))}
                />
              </div>

              <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" className="userref-btn-x30sn" onClick={() => setShowAddModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="userref-btn-x30sn primary">
                  Create Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT REFERRAL MODAL */}
      {showEditModal && editReferralObj && (
        <div className="userref-modal-overlay-x30sn" onClick={() => setShowEditModal(false)}>
          <div className="userref-modal-content-x30sn" onClick={(e) => e.stopPropagation()}>
            <div className="userref-modal-header-x30sn">
              <h3>Edit Referral Details</h3>
              <button className="userref-modal-close-x30sn" onClick={() => setShowEditModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleUpdateReferral}>
              <div style={{ marginBottom: "16px", background: "#111", padding: "12px", borderRadius: "10px", fontSize: "12px" }}>
                <div><strong>Referrer:</strong> {editReferralObj.referrer?.email}</div>
                <div><strong>Referred:</strong> {editReferralObj.referredUser?.email}</div>
              </div>

              <div className="userref-form-group-x30sn">
                <label>Status</label>
                <select 
                  className="userref-form-input-x30sn"
                  value={editReferralObj.status}
                  onChange={(e) => setEditReferralObj(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="premium">Premium</option>
                  <option value="invalid">Invalid</option>
                </select>
              </div>

              {editReferralObj.status === 'invalid' && (
                <div className="userref-form-group-x30sn">
                  <label>Invalidation Reason</label>
                  <input 
                    type="text" 
                    className="userref-form-input-x30sn"
                    placeholder="e.g. Same device signup / fraud"
                    value={editReferralObj.invalidReason || ""}
                    onChange={(e) => setEditReferralObj(prev => ({ ...prev, invalidReason: e.target.value }))}
                  />
                </div>
              )}

              <div className="userref-form-group-x30sn">
                <label>Stage (1, 2, or 3)</label>
                <input 
                  type="number" 
                  min="1" max="3"
                  className="userref-form-input-x30sn"
                  value={editReferralObj.stage || 1}
                  onChange={(e) => setEditReferralObj(prev => ({ ...prev, stage: Number(e.target.value) }))}
                />
              </div>

              <h4 style={{ color: "#fff", fontSize: "14px", margin: "16px 0 10px" }}>Reward Values & Claims</h4>

              <div className="userref-form-group-x30sn">
                <label>Signup Reward (₹)</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input 
                    type="number" 
                    className="userref-form-input-x30sn"
                    style={{ flex: 1 }}
                    value={editReferralObj.signupRewardAmount}
                    onChange={(e) => setEditReferralObj(prev => ({ ...prev, signupRewardAmount: Number(e.target.value) }))}
                  />
                  <div className="userref-form-checkbox-group-x30sn" style={{ marginBottom: 0 }}>
                    <input 
                      type="checkbox" 
                      id="signupClaimed"
                      className="userref-form-checkbox-x30sn"
                      checked={editReferralObj.signupRewardClaimed}
                      onChange={(e) => setEditReferralObj(prev => ({ ...prev, signupRewardClaimed: e.target.checked }))}
                    />
                    <label htmlFor="signupClaimed" style={{ textTransform: "none", letterSpacing: 0 }}>Approved</label>
                  </div>
                </div>
              </div>

              <div className="userref-form-group-x30sn">
                <label>Active Reward (₹)</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input 
                    type="number" 
                    className="userref-form-input-x30sn"
                    style={{ flex: 1 }}
                    value={editReferralObj.activeRewardAmount}
                    onChange={(e) => setEditReferralObj(prev => ({ ...prev, activeRewardAmount: Number(e.target.value) }))}
                  />
                  <div className="userref-form-checkbox-group-x30sn" style={{ marginBottom: 0 }}>
                    <input 
                      type="checkbox" 
                      id="activeClaimed"
                      className="userref-form-checkbox-x30sn"
                      checked={editReferralObj.activeRewardClaimed}
                      onChange={(e) => setEditReferralObj(prev => ({ ...prev, activeRewardClaimed: e.target.checked }))}
                    />
                    <label htmlFor="activeClaimed" style={{ textTransform: "none", letterSpacing: 0 }}>Approved</label>
                  </div>
                </div>
              </div>

              <div className="userref-form-group-x30sn">
                <label>Subscription Commission (₹)</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input 
                    type="number" 
                    className="userref-form-input-x30sn"
                    style={{ flex: 1 }}
                    value={editReferralObj.subscriptionCommissionAmount}
                    onChange={(e) => setEditReferralObj(prev => ({ ...prev, subscriptionCommissionAmount: Number(e.target.value) }))}
                  />
                  <div className="userref-form-checkbox-group-x30sn" style={{ marginBottom: 0 }}>
                    <input 
                      type="checkbox" 
                      id="commissionClaimedCheck"
                      className="userref-form-checkbox-x30sn"
                      checked={editReferralObj.commissionClaimed}
                      onChange={(e) => setEditReferralObj(prev => ({ ...prev, commissionClaimed: e.target.checked }))}
                    />
                    <label htmlFor="commissionClaimedCheck" style={{ textTransform: "none", letterSpacing: 0 }}>Approved</label>
                  </div>
                </div>
              </div>

              <div style={{ background: "rgba(239, 68, 68, 0.05)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "10px", padding: "12px", display: "flex", gap: "10px", alignItems: "flex-start", marginTop: "16px" }}>
                <FaInfoCircle style={{ color: "#ef4444", marginTop: "2px", flexShrink: 0 }} />
                <p style={{ fontSize: "11px", color: "#a1a1aa", margin: 0 }}>
                  Saving will automatically adjust the referrer's <strong>referralBalance</strong> and <strong>pendingReferralBalance</strong> depending on which rewards are approved vs pending.
                </p>
              </div>

              <div style={{ marginTop: "24px", display: "flex", gap: "12px", justifyContent: "flex-end" }}>
                <button type="button" className="userref-btn-x30sn" onClick={() => setShowEditModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="userref-btn-x30sn primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REJECT WITHDRAWAL MODAL */}
      {showRejectModal && withdrawalToReject && (
        <div className="userref-modal-overlay-x30sn" onClick={() => setShowRejectModal(false)}>
          <div className="userref-modal-content-x30sn" onClick={(e) => e.stopPropagation()}>
            <div className="userref-modal-header-x30sn">
              <h3>Reject Withdrawal Request</h3>
              <button className="userref-modal-close-x30sn" onClick={() => setShowRejectModal(false)}>&times;</button>
            </div>
            <div className="userref-form-group-x30sn">
              <label>Rejection Reason / Message (Shown to User)</label>
              <textarea 
                rows="4"
                className="userref-form-input-x30sn"
                style={{ resize: "vertical", fontFamily: "inherit" }}
                placeholder="e.g. Invalid UPI ID / Account details incorrect. Refunded to balance."
                value={rejectionMessage}
                onChange={(e) => setRejectionMessage(e.target.value)}
              />
            </div>
            <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="userref-btn-x30sn" onClick={() => setShowRejectModal(false)}>
                Cancel
              </button>
              <button 
                className="userref-btn-x30sn danger"
                onClick={() => handleProcessWithdrawal(withdrawalToReject._id, 'rejected', rejectionMessage)}
              >
                Reject & Refund
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserOwnReferralsAdmin;
