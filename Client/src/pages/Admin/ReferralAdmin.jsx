'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FaUserPlus, FaLink, FaMoneyBillWave, FaChartLine, FaSearch, 
  FaEdit, FaTrash, FaPlus, FaSync, FaCopy, FaShare, FaUsers, 
  FaCoins, FaPercentage, FaDownload, FaRupeeSign, FaEye, FaEyeSlash
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";
import axios from "axios";
import api from "../../config/api";

// ------------------- CSS STYLES (Pure Black, Glassmorphism, Pink & Purple) -------------------
const styles = `
.ref-root-x30sn {
  color: #fff;
  background-color: #030303;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ref-fadeIn-x30sn 0.4s ease;
}
@keyframes ref-fadeIn-x30sn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.ref-header-x30sn {
  padding: 28px 32px;
  background: linear-gradient(180deg, #070707 0%, #030303 100%);
  border-bottom: 1px solid #161616;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.ref-title-group-x30sn h2 {
  font-size: 26px;
  font-weight: 800;
  margin: 0;
  letter-spacing: -0.5px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 12px;
}
.ref-subtitle-x30sn {
  color: #a78bfa;
  margin: 6px 0 0;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* BUTTONS */
.ref-btn-x30sn {
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
.ref-btn-x30sn:hover:not(:disabled) {
  border-color: #ff69b4;
  color: #ff69b4;
  background: rgba(255, 105, 180, 0.03);
  transform: translateY(-1px);
}
.ref-btn-x30sn.primary {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.ref-btn-x30sn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
  color: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.25);
}
.ref-btn-x30sn:disabled { opacity: 0.5; cursor: not-allowed; }

/* KPI GRID */
.ref-stats-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}
.ref-stat-card-x30sn {
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
.ref-stat-card-x30sn:hover {
  border-color: #262626;
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.ref-stat-card-x30sn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(167,139,250,0.02), transparent 60%);
  pointer-events: none;
}
.stat-icon-wrapper-x30sn {
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(167, 139, 250, 0.08);
  color: #a78bfa;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 1px solid rgba(167, 139, 250, 0.15);
}
.stat-label-x30sn { margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.8px; display: block; }
.stat-value-x30sn { font-size: 24px; color: #fff; display: block; margin-top: 4px; font-weight: 800; }
.stat-change-x30sn { font-size: 11px; color: #ff69b4; display: block; margin-top: 2px; font-weight: 500; }

/* CHARTS SECTION */
.ref-charts-section-x30sn {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
  padding: 0 32px 24px;
}
@media (max-width: 900px) { .ref-charts-section-x30sn { grid-template-columns: 1fr; } }

.ref-chart-card-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
}
.chart-header-x30sn {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.analytics-period-select-x30sn {
  background: #0f0f0f;
  color: #ff69b4;
  border: 1px solid #222;
  padding: 6px 12px;
  border-radius: 8px;
  font-size: 12px;
  outline: none;
  cursor: pointer;
}

/* FILTERS SECTION */
.ref-filters-x30sn {
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
.ref-search-container-x30sn {
  position: relative;
  flex: 2;
  min-width: 260px;
}
.ref-search-icon-x30sn {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
}
.ref-search-input-x30sn {
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
.ref-search-input-x30sn:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.15);
}
.ref-filter-select-x30sn {
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
.ref-filter-select-x30sn:focus { border-color: #ff69b4; }

/* CREATORS PARTNER GRID */
.ref-creators-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 24px;
  padding: 0 32px 32px;
}
.ref-creator-card-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 20px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  position: relative;
}
.ref-creator-card-x30sn:hover {
  border-color: #ff69b4;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}

.ref-creator-header-x30sn {
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  align-items: center;
}
.ref-creator-avatar-x30sn {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 950;
  font-size: 20px;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.2);
}
.ref-creator-name-x30sn {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin: 0;
}
.ref-creator-platform-x30sn {
  font-size: 12px;
  color: #a78bfa;
  font-weight: 600;
  margin-top: 2px;
  text-transform: capitalize;
}

.ref-creator-stats-x30sn {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.04);
  padding: 12px;
  border-radius: 12px;
  margin-bottom: 16px;
}
.ref-stat-item-x30sn { text-align: center; }
.ref-stat-item-x30sn .stat-label { font-size: 9px; color: #52525b; text-transform: uppercase; font-weight: 700; display: block; margin-bottom: 2px; }
.ref-stat-item-x30sn .stat-value { font-size: 14px; font-weight: 800; color: #fff; }

.ref-payout-box-x30sn {
  background: rgba(0, 255, 136, 0.04);
  border: 1px solid rgba(0, 255, 136, 0.15);
  padding: 12px 16px;
  border-radius: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.payout-info-x30sn {
  font-size: 12px;
  color: #00ff88;
  font-weight: 700;
}

.ref-link-area-x30sn {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.03);
  padding: 14px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
}
.link-text-x30sn {
  font-size: 11px;
  color: #888;
  font-family: monospace;
}

/* MODAL */
.ref-modal-overlay-x30sn {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}
.ref-modal-content-x30sn {
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid #262626;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  padding: 32px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  animation: ref-modalScale-x30sn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes ref-modalScale-x30sn {
  from { transform: scale(0.9) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.ref-form-group-x30sn {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 16px;
}
.ref-form-group-x30sn label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.8px;
}
.ref-form-input-x30sn {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  transition: all 0.25s ease;
}
.ref-form-input-x30sn:focus {
  border-color: #ff69b4;
}

/* RECENT REFERRAL LOG */
.ref-table-wrap-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 20px;
  margin: 0 32px 40px;
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.ref-table-x30sn {
  width: 100%;
  border-collapse: collapse;
}
.ref-table-x30sn thead {
  background: rgba(4, 4, 4, 0.4);
  border-bottom: 1px solid #161616;
}
.ref-table-x30sn th {
  padding: 16px;
  text-align: left;
  color: #52525b;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.8px;
}
.ref-table-x30sn tbody tr {
  border-bottom: 1px solid #141414;
  transition: all 0.2s;
}
.ref-table-x30sn tbody tr:last-child { border-bottom: none; }
.ref-table-x30sn tbody tr:hover {
  background: rgba(255, 255, 255, 0.015);
}
.ref-table-x30sn td {
  padding: 14px 16px;
  vertical-align: middle;
  font-size: 13px;
  color: #d4d4d8;
}

.spin { animation: ref-spin-x30sn 1s linear infinite; }
@keyframes ref-spin-x30sn { 100% { transform: rotate(360deg); } }

/* REFERRED USERS LIST MODAL styles */
.ref-users-modal-content-x30sn {
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid rgba(255, 105, 180, 0.25);
  border-radius: 24px;
  width: 95%;
  max-width: 850px;
  max-height: 85vh;
  padding: 28px;
  box-shadow: 0 15px 50px rgba(0, 0, 0, 0.95), 0 0 30px rgba(255, 105, 180, 0.05);
  animation: ref-modalScale-x30sn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  backdrop-filter: blur(25px);
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
}
.ref-modal-header-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  border-bottom: 1px solid #161616;
  padding-bottom: 16px;
}
.ref-modal-header-x30sn h3 {
  font-size: 22px;
  font-weight: 800;
  margin: 0;
  color: #fff;
  letter-spacing: -0.5px;
}
.ref-modal-header-x30sn p {
  margin: 6px 0 0 0;
  font-size: 13px;
  color: #a78bfa;
  font-weight: 500;
}

.ref-modal-summary-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
  gap: 12px;
  margin-bottom: 20px;
}
.ref-modal-summary-card-x30sn {
  background: rgba(15, 15, 15, 0.6);
  border: 1px solid #1c1c1c;
  padding: 12px 16px;
  border-radius: 12px;
  text-align: center;
  transition: all 0.25s ease;
  backdrop-filter: blur(10px);
}
.ref-modal-summary-card-x30sn:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 105, 180, 0.2);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
.ref-modal-summary-label-x30sn {
  display: block;
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin-bottom: 4px;
  font-weight: 600;
}
.ref-modal-summary-value-x30sn {
  display: block;
  font-size: 18px;
  font-weight: 800;
  color: #fff;
}

.ref-users-table-container-x30sn {
  flex: 1;
  overflow-y: auto;
  border: 1px solid #161616;
  border-radius: 14px;
  background: rgba(4, 4, 4, 0.4);
  margin-bottom: 16px;
  min-height: 200px;
}
.ref-users-table-container-x30sn::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.ref-users-table-container-x30sn::-webkit-scrollbar-track {
  background: rgba(0, 0, 0, 0.2);
}
.ref-users-table-container-x30sn::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #ff69b4 0%, #da22ff 100%);
  border-radius: 3px;
}

.ref-users-table-x30sn {
  width: 100%;
  border-collapse: collapse;
  text-align: left;
}
.ref-users-table-x30sn th {
  padding: 14px 18px;
  background: #070707;
  border-bottom: 1px solid #161616;
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.8px;
  position: sticky;
  top: 0;
  z-index: 2;
}
.ref-users-table-x30sn td {
  padding: 14px 18px;
  border-bottom: 1px solid #141414;
  font-size: 13px;
  color: #d4d4d8;
  vertical-align: middle;
}
.ref-users-table-x30sn tr:last-child td {
  border-bottom: none;
}
.ref-users-table-x30sn tr.expanded-row-x30sn td {
  background: rgba(12, 12, 12, 0.4);
  border-bottom: 1px solid #161616;
}
.ref-users-table-x30sn tr.user-row-x30sn:hover td {
  background: rgba(255, 255, 255, 0.01);
  color: #fff;
}

/* BADGES */
.ref-badge-x30sn {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.5px;
  text-transform: uppercase;
}
.ref-badge-x30sn.active {
  background: rgba(0, 255, 136, 0.08);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.15);
  box-shadow: 0 0 8px rgba(0, 255, 136, 0.1);
}
.ref-badge-x30sn.expired {
  background: rgba(239, 68, 68, 0.08);
  color: #ef4444;
  border: 1px solid rgba(239, 68, 68, 0.15);
}
.ref-badge-x30sn.free {
  background: rgba(113, 113, 122, 0.08);
  color: #a1a1aa;
  border: 1px solid rgba(113, 113, 122, 0.15);
}

/* EXPANDABLE LOGS */
.ref-payment-details-box-x30sn {
  padding: 18px 24px;
  background: rgba(5, 5, 5, 0.85);
  border: 1px solid #1c1c1c;
  border-radius: 12px;
  margin: 6px 12px 14px 12px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.5);
  animation: ref-fadeIn-x30sn 0.2s ease;
}
.ref-payment-details-title-x30sn {
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  color: #ff69b4;
  margin-bottom: 12px;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.ref-payment-details-table-x30sn {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
  text-align: left;
}
.ref-payment-details-table-x30sn th {
  padding: 8px 12px;
  border-bottom: 1px solid #222;
  color: #666;
  font-weight: 800;
  text-transform: uppercase;
  font-size: 9px;
  letter-spacing: 0.8px;
  background: transparent !important;
}
.ref-payment-details-table-x30sn td {
  padding: 10px 12px;
  border-bottom: 1px solid #161616;
  color: #aaa;
  background: transparent !important;
}
.ref-payment-details-table-x30sn tr:last-child td {
  border-bottom: none;
}
`;

const ReferralAdmin = () => {
  const [creators, setCreators] = useState([]);
  const [referralStats, setReferralStats] = useState({});
  const [referralAnalytics, setReferralAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCreator, setEditCreator] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d");
  const [visiblePasswords, setVisiblePasswords] = useState({});
  const [showUsersModal, setShowUsersModal] = useState(false);
  const [selectedCreatorForUsers, setSelectedCreatorForUsers] = useState(null);
  const [referredUsersData, setReferredUsersData] = useState([]);
  const [loadingReferredUsers, setLoadingReferredUsers] = useState(false);
  const [usersSearchTerm, setUsersSearchTerm] = useState("");
  const [usersFilterSub, setUsersFilterSub] = useState("all");
  const [expandedUserRows, setExpandedUserRows] = useState({});

  const toggleUserRowExpanded = (userId) => {
    setExpandedUserRows(prev => ({ ...prev, [userId]: !prev[userId] }));
  };

  const fetchReferredUsers = async (creatorId) => {
    setLoadingReferredUsers(true);
    setExpandedUserRows({});
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/referral-creators/${creatorId}/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setReferredUsersData(res.data.users || []);
      }
    } catch (e) {
      console.error(e);
      alert("Error fetching referred users data.");
    }
    setLoadingReferredUsers(false);
  };

  const filteredReferredUsers = useMemo(() => {
    return referredUsersData.filter(user => {
      const matchesSearch = user.name?.toLowerCase().includes(usersSearchTerm.toLowerCase()) || 
                            user.email?.toLowerCase().includes(usersSearchTerm.toLowerCase());
      
      if (usersFilterSub === 'active') {
        return matchesSearch && user.isSubscribed;
      }
      if (usersFilterSub === 'expired') {
        return matchesSearch && user.user_type === 'subscriber' && !user.isSubscribed;
      }
      if (usersFilterSub === 'free') {
        return matchesSearch && user.user_type !== 'subscriber';
      }
      return matchesSearch;
    });
  }, [referredUsersData, usersSearchTerm, usersFilterSub]);

  const usersSummaryStats = useMemo(() => {
    let total = referredUsersData.length;
    let active = 0;
    let expired = 0;
    let free = 0;
    let totalRevenue = 0;
    let totalCommission = 0;

    referredUsersData.forEach(user => {
      if (user.isSubscribed) active++;
      else if (user.user_type === 'subscriber') expired++;
      else free++;

      if (user.payments && user.payments.length > 0) {
        user.payments.forEach(payment => {
          totalRevenue += payment.actualAmount;
          totalCommission += payment.commission;
        });
      }
    });

    const formatToTwo = (num) => parseFloat((num || 0).toFixed(2));

    return {
      total,
      active,
      expired,
      free,
      totalRevenue: formatToTwo(totalRevenue),
      totalCommission: formatToTwo(totalCommission)
    };
  }, [referredUsersData]);

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [newCreator, setNewCreator] = useState({
    name: "", platform: "instagram", username: "", commissionRate: 15, email: "", phone: ""
  });

  const colors = useMemo(() => ["#ff69b4", "#da22ff", "#a78bfa", "#ff85c2"], []);

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = getToken();
      const [resC, resS, resA] = await Promise.all([
        axios.get(`${api.Url}/admin/referral-creators`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${api.Url}/admin/referral-stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${api.Url}/admin/referral-analytics?period=${analyticsPeriod}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCreators(resC.data.creators || []);
      setReferralStats(resS.data.stats || {});
      setReferralAnalytics(resA.data.analytics || {});
    } catch (e) { console.error(e); }
    setRefreshing(false);
    setLoading(false);
  }, [analyticsPeriod, getToken]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const stats = useMemo(() => {
    const b = referralStats.summary || {};
    const totalCount = creators.length;
    const activeCount = creators.filter(c => c.isActive !== false).length;
    const totalRefs = b.totalReferrals || 0;
    const totalEarn = b.totalEarnings || 0;
    const totalPend = b.pendingEarnings || 0;
    
    // Average rate computation
    const totalRatesSum = creators.reduce((acc, c) => acc + (c.commissionRate || 0), 0);
    const avgRate = totalCount ? Math.round(totalRatesSum / totalCount) : 0;
    
    return {
      total: totalCount,
      active: activeCount,
      refs: totalRefs,
      earn: totalEarn,
      pend: totalPend,
      avgRate
    };
  }, [referralStats, creators]);

  const platformData = useMemo(() => {
    const counts = creators.reduce((acc, c) => {
      const p = c.platform || 'other';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value], idx) => ({
      name: name.toUpperCase(), value, color: colors[idx % colors.length]
    }));
  }, [creators, colors]);

  const referralTrendData = useMemo(() => {
    if (referralAnalytics.referralTrend?.length > 0) {
      return referralAnalytics.referralTrend.map(i => ({
        day: new Date(i._id).toLocaleDateString('en-US', { weekday: 'short' }), referrals: i.count
      }));
    }
    return [ {day:'Mon', referrals:0}, {day:'Sun', referrals:0} ];
  }, [referralAnalytics]);

  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      const searchMatch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.referralId?.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterStatus === "all" || (filterStatus === "active" ? c.isActive : !c.isActive);
      return searchMatch && statusMatch;
    });
  }, [creators, searchTerm, filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`${api.Url}/admin/referral-creators`, newCreator, { headers: { Authorization: `Bearer ${token}` } });
      setShowCreateModal(false);
      fetchAllData();
    } catch (e) { alert("Error creating creator"); }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const payload = { ...editCreator };
      if (payload.newPassword) {
        payload.password = payload.newPassword;
      } else {
        delete payload.password;
      }
      await axios.put(`${api.Url}/admin/referral-creators/${editCreator._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      setEditCreator(null);
      fetchAllData();
    } catch (e) { alert("Error updating creator"); }
  };

  const handleDeleteCreator = async (id) => {
    if (!confirm("Delete creator?")) return;
    try {
      const token = getToken();
      await axios.delete(`${api.Url}/admin/referral-creators/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAllData();
    } catch (e) { alert("Error deleting"); }
  };

  const handleToggleStatus = async (creator) => {
    try {
      const token = getToken();
      await axios.put(`${api.Url}/admin/referral-creators/${creator._id}`, { isActive: !creator.isActive }, { headers: { Authorization: `Bearer ${token}` } });
      fetchAllData();
    } catch (e) { alert("Update failed"); }
  };

  const handleProcessPayout = async (id, amount) => {
    if (!confirm(`Process payout of ₹${amount}?`)) return;
    try {
      const token = getToken();
      await axios.post(`${api.Url}/admin/referral-creators/${id}/payout`, { amount }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Payout processed!");
      fetchAllData();
    } catch (e) {
      alert("Payout failed or route not configured. Setting balance locally.");
    }
  };

  if (loading) {
    return (
      <div className="ref-root-x30sn" style={{ height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <style>{styles}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #222',
            borderTopColor: '#ff69b4',
            borderRadius: '50%',
            animation: 'ref-spin-x30sn 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <style>{`@keyframes ref-spin-x30sn { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 600, color: '#666' }}>Loading Referral Intelligence Console…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ref-root-x30sn">
      <style>{styles}</style>
      
      {/* HEADER */}
      <header className="ref-header-x30sn">
        <div className="ref-title-group-x30sn">
          <h2>Referral Intelligence</h2>
          <p className="ref-subtitle-x30sn"><FaUserPlus /> Influencer Partners & Conversion Audits</p>
        </div>
        <div className="ref-header-actions-x30sn">
          <button className="ref-btn-x30sn" onClick={fetchAllData}>
            <FaSync className={refreshing ? 'spin' : ''}/> Sync
          </button>
          <button className="ref-btn-x30sn primary" onClick={() => setShowCreateModal(true)}>
            <FaPlus /> Add Creator
          </button>
        </div>
      </header>

      {/* STATS STRIP - 5 KPIs */}
      <div className="ref-stats-grid-x30sn">
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaUsers /></div>
          <div className="stat-info-x30sn">
            <span className="stat-label-x30sn">Total Partners</span>
            <strong className="stat-value-x30sn">{stats.total}</strong>
            <span className="stat-change-x30sn">{stats.active} Active Creator Accounts</span>
          </div>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaUserPlus /></div>
          <div className="stat-info-x30sn">
            <span className="stat-label-x30sn">Total Referrals</span>
            <strong className="stat-value-x30sn">{stats.refs.toLocaleString()}</strong>
            <span className="stat-change-x30sn">{(stats.total > 0 ? (stats.refs / stats.total).toFixed(1) : 0)} average / creator</span>
          </div>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaRupeeSign /></div>
          <div className="stat-info-x30sn">
            <span className="stat-label-x30sn">Total Earnings</span>
            <strong className="stat-value-x30sn">₹{stats.earn.toLocaleString()}</strong>
            <span className="stat-change-x30sn">Exchanged Commissions</span>
          </div>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn" style={{ color: '#00ff88', background: 'rgba(0,255,136,0.08)', borderColor: 'rgba(0,255,136,0.15)' }}><FaCoins /></div>
          <div className="stat-info-x30sn">
            <span className="stat-label-x30sn">Pending Payouts</span>
            <strong className="stat-value-x30sn" style={{ color: '#00ff88' }}>₹{stats.pend.toLocaleString()}</strong>
            <span className="stat-change-x30sn" style={{ color: '#a1a1aa' }}>Due for processing</span>
          </div>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn" style={{ color: '#da22ff', background: 'rgba(218,34,255,0.08)', borderColor: 'rgba(218,34,255,0.15)' }}><FaPercentage /></div>
          <div className="stat-info-x30sn">
            <span className="stat-label-x30sn">Avg. Comm. Rate</span>
            <strong className="stat-value-x30sn">{stats.avgRate}%</strong>
            <span className="stat-change-x30sn">Per-creator average</span>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="ref-charts-section-x30sn">
        <div className="ref-chart-card-x30sn">
          <div className="chart-header-x30sn"><FaChartLine /> Platform Split</div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={platformData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                  {platformData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', color: '#fff' }} />
                <Legend verticalAlign="bottom" tick={{ fill: '#888', fontSize: 10 }} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="ref-chart-card-x30sn">
          <div className="chart-header-x30sn">
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaChartLine /> Referral Trend</div>
            <select value={analyticsPeriod} onChange={e => setAnalyticsPeriod(e.target.value)} className="analytics-period-select-x30sn">
              <option value="30d">Last 30 Days</option>
              <option value="7d">Last 7 Days</option>
            </select>
          </div>
          <div style={{ width: '100%', height: 220 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={referralTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#161616" vertical={false} />
                <XAxis dataKey="day" stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <YAxis stroke="#666" fontSize={10} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={{ background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', color: '#fff' }} />
                <Line type="monotone" dataKey="referrals" stroke="#ff69b4" strokeWidth={3} dot={{ r: 4, fill: '#ff69b4' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div className="ref-filters-x30sn">
        <div className="ref-search-container-x30sn">
          <FaSearch className="ref-search-icon-x30sn" />
          <input 
            className="ref-search-input-x30sn" 
            placeholder="Search creator by name or Referral ID…" 
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)} 
          />
        </div>
        <select className="ref-filter-select-x30sn" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Creator Statuses</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* CREATORS LIST GRID */}
      <div className="ref-creators-grid-x30sn">
        {filteredCreators.map((creator) => (
          <article key={creator._id} className="ref-creator-card-x30sn">
            <div style={{ flex: 1 }}>
              <div className="ref-creator-header-x30sn">
                <div className="ref-creator-avatar-x30sn">{creator.name?.charAt(0)}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 className="ref-creator-name-x30sn" style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{creator.name}</h4>
                  <p className="ref-creator-platform-x30sn">{creator.platform} • @{creator.username}</p>
                </div>
                <button className="ref-btn-x30sn" style={{ padding: '8px 10px', minWidth: 0 }} onClick={() => { navigator.clipboard.writeText(creator.referralId); alert("Referral ID Copied!"); }} title="Copy Referral ID"><FaCopy/></button>
              </div>

              <div className="ref-creator-stats-x30sn">
                <div className="ref-stat-item-x30sn">
                  <span className="stat-label">Referrals</span>
                  <span className="stat-value">{creator.referralCount || 0}</span>
                </div>
                <div className="ref-stat-item-x30sn">
                  <span className="stat-label">Earned</span>
                  <span className="stat-value">₹{(creator.totalEarnings || 0).toLocaleString()}</span>
                </div>
                <div className="ref-stat-item-x30sn">
                  <span className="stat-label">Comm. Rate</span>
                  <span className="stat-value">{creator.commissionRate}%</span>
                </div>
              </div>

              {creator.pendingEarnings > 0 && (
                <div className="ref-payout-box-x30sn">
                  <span className="payout-info-x30sn">₹{creator.pendingEarnings.toLocaleString()} Pending</span>
                  <button 
                    className="ref-btn-x30sn primary" 
                    style={{ padding: '6px 12px', fontSize: '11px', minWidth: 0 }} 
                    onClick={() => handleProcessPayout(creator._id, creator.pendingEarnings)}
                  >
                    Pay Creator
                  </button>
                </div>
              )}

              <div className="ref-link-area-x30sn">
                <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 4 }}>
                  <span className="link-text-x30sn">ID: {creator.referralId}</span>
                  <span className="link-text-x30sn">User: {creator.username}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <span className="link-text-x30sn" style={{ display: 'inline', marginBottom: 0, overflow: 'visible' }}>
                    Pass: {visiblePasswords[creator._id] ? (creator.plainPassword || "[Not recorded]") : "••••••••"}
                  </span>
                  <button type="button" style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', padding: 0, display: 'flex' }} onClick={() => togglePasswordVisibility(creator._id)}>
                    {visiblePasswords[creator._id] ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                  </button>
                </div>
                <div style={{ marginTop: '10px', padding: '8px 12px', background: '#090909', border: '1px solid #222', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '11px', color: '#ff69b4', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', userSelect: 'all', flex: 1, marginRight: 8 }}>
                    https://heartecho.in/?ref={creator.referralId}
                  </span>
                  <button 
                    type="button" 
                    style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '4px', display: 'flex' }} 
                    onClick={(e) => { 
                      navigator.clipboard.writeText(`https://heartecho.in/?ref=${creator.referralId}`); 
                      alert("Tracking Link Copied!");
                    }} 
                    title="Copy Tracking URL"
                  >
                    <FaCopy size={13} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 8, marginTop: 'auto', paddingTop: 10, justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <button 
                className="ref-btn-x30sn primary" 
                style={{ flex: 1, minWidth: '120px' }} 
                onClick={() => { 
                  setSelectedCreatorForUsers(creator); 
                  fetchReferredUsers(creator._id); 
                  setShowUsersModal(true); 
                }}
              >
                View Referrals
              </button>
              <button className="ref-btn-x30sn" style={{ flex: 1, minWidth: '120px' }} onClick={() => handleToggleStatus(creator)}>
                {creator.isActive ? 'Deactivate' : 'Activate'}
              </button>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="ref-btn-x30sn" style={{ padding: '10px' }} onClick={() => setEditCreator(creator)} title="Edit partner creator"><FaEdit/></button>
                <button className="ref-btn-x30sn" style={{ color: '#ff4444', borderColor: 'rgba(255,68,68,0.2)', padding: '10px' }} onClick={() => handleDeleteCreator(creator._id)} title="Delete partner creator"><FaTrash/></button>
              </div>
            </div>
          </article>
        ))}
        {filteredCreators.length === 0 && (
          <div style={{ color: "#444", padding: "40px", gridColumn: 'span 3', textAlign: 'center', fontWeight: 600 }}>
            No creators match the active filter configurations.
          </div>
        )}
      </div>

      {/* RECENT REFERRAL LOGS */}
      <div className="ref-table-wrap-x30sn">
        <div className="chart-header-x30sn" style={{ padding: '20px 24px', margin: 0, borderBottom: '1px solid #161616' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><FaUserPlus /> Recent Referral Activity</div>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table className="ref-table-x30sn">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Influencer Partner</th>
                <th>Joined Date</th>
              </tr>
            </thead>
            <tbody>
              {referralStats.recentReferrals && referralStats.recentReferrals.length > 0 ? (
                referralStats.recentReferrals.map((ref, idx) => (
                  <tr key={idx}>
                    <td style={{ fontWeight: '700', color: '#fff' }}>{ref.name || 'Anonymous User'}</td>
                    <td style={{ color: '#a1a1aa', fontFamily: 'monospace' }}>{ref.email}</td>
                    <td>
                      <div style={{ fontWeight: '700', color: '#fff' }}>{ref.referredBy?.name || 'N/A'}</div>
                      <div style={{ fontSize: '11px', color: '#ff69b4', fontWeight: 600 }}>
                        @{ref.referredBy?.username || 'N/A'} ({ref.referredBy?.platform || 'N/A'})
                      </div>
                    </td>
                    <td style={{ color: '#71717a' }}>
                      {new Date(ref.createdAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ padding: '32px', textAlign: 'center', color: '#666', fontWeight: 600 }}>
                    No recent referral sign-ups tracked.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="ref-modal-overlay-x30sn" onClick={() => setShowCreateModal(false)}>
          <div className="ref-modal-content-x30sn" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ff69b4', fontWeight: 800, margin: '0 0 20px' }}>Create Partner Creator</h3>
            <form onSubmit={handleCreate}>
              <div className="ref-form-group-x30sn">
                <label>Full Name</label>
                <input className="ref-form-input-x30sn" type="text" required onChange={e => setNewCreator({...newCreator, name:e.target.value})} placeholder="e.g. Shreya Sen" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="ref-form-group-x30sn">
                  <label>Platform</label>
                  <select className="ref-form-input-x30sn" style={{ cursor: 'pointer' }} defaultValue="instagram" onChange={e => setNewCreator({...newCreator, platform:e.target.value})}>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="ref-form-group-x30sn">
                  <label>Commission Rate %</label>
                  <input className="ref-form-input-x30sn" type="number" defaultValue="15" min="1" max="50" onChange={e => setNewCreator({...newCreator, commissionRate:parseInt(e.target.value) || 15})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="ref-form-group-x30sn">
                  <label>Username</label>
                  <input className="ref-form-input-x30sn" type="text" required onChange={e => setNewCreator({...newCreator, username:e.target.value})} placeholder="e.g. shreyasen" />
                </div>
                <div className="ref-form-group-x30sn">
                  <label>Portal Password</label>
                  <input className="ref-form-input-x30sn" type="text" required onChange={e => setNewCreator({...newCreator, password:e.target.value})} placeholder="Password" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="ref-btn-x30sn" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="ref-btn-x30sn primary">Create Partner</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {editCreator && (
        <div className="ref-modal-overlay-x30sn" onClick={() => setEditCreator(null)}>
          <div className="ref-modal-content-x30sn" onClick={e => e.stopPropagation()}>
            <h3 style={{ color: '#ff69b4', fontWeight: 800, margin: '0 0 20px' }}>Edit Partner Creator</h3>
            <form onSubmit={handleEdit}>
              <div className="ref-form-group-x30sn">
                <label>Full Name</label>
                <input className="ref-form-input-x30sn" type="text" required value={editCreator.name} onChange={e => setEditCreator({...editCreator, name:e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="ref-form-group-x30sn">
                  <label>Platform</label>
                  <select className="ref-form-input-x30sn" style={{ cursor: 'pointer' }} value={editCreator.platform} onChange={e => setEditCreator({...editCreator, platform:e.target.value})}>
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="website">Website</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="ref-form-group-x30sn">
                  <label>Commission %</label>
                  <input className="ref-form-input-x30sn" type="number" value={editCreator.commissionRate} min="1" max="50" onChange={e => setEditCreator({...editCreator, commissionRate:parseInt(e.target.value) || 15})} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="ref-form-group-x30sn">
                  <label>Username</label>
                  <input className="ref-form-input-x30sn" type="text" required value={editCreator.username} onChange={e => setEditCreator({...editCreator, username:e.target.value})} />
                </div>
                <div className="ref-form-group-x30sn">
                  <label>Portal Password (Leave blank to keep)</label>
                  <input className="ref-form-input-x30sn" type="text" onChange={e => setEditCreator({...editCreator, newPassword:e.target.value})} placeholder="New password" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 24, justifyContent: 'flex-end' }}>
                <button type="button" className="ref-btn-x30sn" onClick={() => setEditCreator(null)}>Cancel</button>
                <button type="submit" className="ref-btn-x30sn primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* REFERRED USERS DETAIL MODAL */}
      {showUsersModal && selectedCreatorForUsers && (
        <div className="ref-modal-overlay-x30sn" onClick={() => setShowUsersModal(false)}>
          <div className="ref-users-modal-content-x30sn" onClick={e => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="ref-modal-header-x30sn">
              <div>
                <h3>{selectedCreatorForUsers.name}'s Referrals</h3>
                <p>Platform: <span style={{ textTransform: 'capitalize' }}>{selectedCreatorForUsers.platform}</span> • @{selectedCreatorForUsers.username} • Comm. Rate: {selectedCreatorForUsers.commissionRate}%</p>
              </div>
              <button className="ref-btn-x30sn" style={{ padding: '6px 12px' }} onClick={() => setShowUsersModal(false)}>Close</button>
            </div>

            {/* Loading Indicator */}
            {loadingReferredUsers ? (
              <div style={{ padding: '60px 0', textAlign: 'center' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  border: '2px solid #222',
                  borderTopColor: '#ff69b4',
                  borderRadius: '50%',
                  animation: 'ref-spin-x30sn 0.8s linear infinite',
                  margin: '0 auto 12px'
                }} />
                <p style={{ color: '#666', fontWeight: 600 }}>Loading referred users list...</p>
              </div>
            ) : (
              <>
                {/* Statistics Grid */}
                <div className="ref-modal-summary-grid-x30sn">
                  <div className="ref-modal-summary-card-x30sn">
                    <span className="ref-modal-summary-label-x30sn">Total Referrals</span>
                    <strong className="ref-modal-summary-value-x30sn">{usersSummaryStats.total}</strong>
                  </div>
                  <div className="ref-modal-summary-card-x30sn">
                    <span className="ref-modal-summary-label-x30sn" style={{ color: '#00ff88' }}>Active Subscribers</span>
                    <strong className="ref-modal-summary-value-x30sn" style={{ color: '#00ff88' }}>{usersSummaryStats.active}</strong>
                  </div>
                  <div className="ref-modal-summary-card-x30sn">
                    <span className="ref-modal-summary-label-x30sn" style={{ color: '#ef4444' }}>Expired Subs</span>
                    <strong className="ref-modal-summary-value-x30sn" style={{ color: '#ef4444' }}>{usersSummaryStats.expired}</strong>
                  </div>
                  <div className="ref-modal-summary-card-x30sn">
                    <span className="ref-modal-summary-label-x30sn" style={{ color: '#a1a1aa' }}>Free Members</span>
                    <strong className="ref-modal-summary-value-x30sn" style={{ color: '#a1a1aa' }}>{usersSummaryStats.free}</strong>
                  </div>
                  <div className="ref-modal-summary-card-x30sn">
                    <span className="ref-modal-summary-label-x30sn" style={{ color: '#ffd700' }}>Actual Paid</span>
                    <strong className="ref-modal-summary-value-x30sn" style={{ color: '#ffd700' }}>₹{usersSummaryStats.totalRevenue.toLocaleString()}</strong>
                  </div>
                  <div className="ref-modal-summary-card-x30sn">
                    <span className="ref-modal-summary-label-x30sn" style={{ color: '#ff69b4' }}>Comm. Earned</span>
                    <strong className="ref-modal-summary-value-x30sn" style={{ color: '#ff69b4' }}>₹{usersSummaryStats.totalCommission.toLocaleString()}</strong>
                  </div>
                </div>

                {/* Filters Row */}
                <div className="ref-filters-x30sn" style={{ margin: '0 0 16px 0', padding: '12px 16px' }}>
                  <div className="ref-search-container-x30sn" style={{ flex: 1.5, minWidth: '200px' }}>
                    <FaSearch className="ref-search-icon-x30sn" />
                    <input 
                      className="ref-search-input-x30sn" 
                      style={{ padding: '10px 10px 10px 36px' }}
                      placeholder="Search user by name or email…" 
                      value={usersSearchTerm} 
                      onChange={e => setUsersSearchTerm(e.target.value)} 
                    />
                  </div>
                  <select 
                    className="ref-filter-select-x30sn" 
                    style={{ padding: '10px 14px' }}
                    value={usersFilterSub} 
                    onChange={e => setUsersFilterSub(e.target.value)}
                  >
                    <option value="all">All Subscription Types</option>
                    <option value="active">Active Subscribers</option>
                    <option value="expired">Expired Subscribers</option>
                    <option value="free">Free Members</option>
                  </select>
                </div>

                {/* Users Table */}
                <div className="ref-users-table-container-x30sn">
                  <table className="ref-users-table-x30sn">
                    <thead>
                      <tr>
                        <th>User Profile</th>
                        <th>Joined Date</th>
                        <th>Subscription Status</th>
                        <th>Actual Paid</th>
                        <th>Commission</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReferredUsers.length > 0 ? (
                        filteredReferredUsers.map((user) => {
                          const isExpanded = expandedUserRows[user._id];
                          const formatToTwoDecimals = (num) => parseFloat((num || 0).toFixed(2));
                          return (
                            <optgroup key={user._id} label={user.name} style={{ display: 'contents' }}>
                              <tr 
                                className="user-row-x30sn"
                                onClick={() => toggleUserRowExpanded(user._id)}
                              >
                                <td>
                                  <div style={{ fontWeight: '700', color: '#fff' }}>{user.name}</div>
                                  <div style={{ fontSize: '11px', color: '#888', fontFamily: 'monospace', marginTop: 2 }}>{user.email}</div>
                                </td>
                                <td style={{ color: '#a1a1aa' }}>
                                  {new Date(user.joinedAt).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                  })}
                                </td>
                                <td>
                                  {user.isSubscribed ? (
                                    <span className="ref-badge-x30sn active">Active Sub</span>
                                  ) : user.user_type === 'subscriber' ? (
                                    <span className="ref-badge-x30sn expired">Expired Sub</span>
                                  ) : (
                                    <span className="ref-badge-x30sn free">Free User</span>
                                  )}
                                  {user.payments && user.payments.length > 0 && (
                                    <span style={{ fontSize: '10px', color: '#a78bfa', marginLeft: 8, fontWeight: 600 }}>
                                      ({user.payments.length} Tx)
                                    </span>
                                  )}
                                </td>
                                <td style={{ fontWeight: '700', color: '#ffd700' }}>
                                  ₹{(user.totalAmountPaid || 0).toLocaleString()}
                                </td>
                                <td style={{ fontWeight: '700', color: '#ff69b4' }}>
                                  ₹{formatToTwoDecimals(
                                    user.payments.reduce((acc, p) => acc + p.commission, 0)
                                  ).toLocaleString()}
                                </td>
                              </tr>
                              
                              {/* Expandable row for transaction details */}
                              {isExpanded && (
                                <tr className="expanded-row-x30sn">
                                  <td colSpan="5">
                                    <div className="ref-payment-details-box-x30sn">
                                      <div className="ref-payment-details-title-x30sn">
                                        <FaCoins /> Transaction Activity Log
                                      </div>
                                      {user.payments && user.payments.length > 0 ? (
                                        <table className="ref-payment-details-table-x30sn">
                                          <thead>
                                            <tr>
                                              <th>Plan Tier</th>
                                              <th>Amount Paid</th>
                                              <th>Commission (Mapped)</th>
                                              <th>Transaction ID</th>
                                              <th>Date Paid</th>
                                              <th>Status</th>
                                            </tr>
                                          </thead>
                                          <tbody>
                                            {user.payments.map((pay, pIdx) => (
                                              <tr key={pIdx}>
                                                <td style={{ fontWeight: 700, color: '#fff' }}>{pay.planType}</td>
                                                <td style={{ color: '#ffd700', fontWeight: 600 }}>₹{pay.actualAmount}</td>
                                                <td>
                                                  <span style={{ color: '#ff69b4', fontWeight: 600 }}>₹{pay.commission}</span>
                                                  <span style={{ fontSize: '10px', color: '#666', marginLeft: 6 }}>
                                                    (on ₹{pay.mappedAmount})
                                                  </span>
                                                </td>
                                                <td style={{ fontFamily: 'monospace', fontSize: '11px', color: '#888' }}>
                                                  {pay.transactionId || 'N/A'}
                                                </td>
                                                <td>
                                                  {new Date(pay.date).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric',
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                  })}
                                                </td>
                                                <td>
                                                  {pay.expiryDate && new Date(pay.expiryDate) > new Date() ? (
                                                    <span style={{ color: '#00ff88', fontWeight: 600 }}>Active</span>
                                                  ) : (
                                                    <span style={{ color: '#ef4444' }}>Expired</span>
                                                  )}
                                                </td>
                                              </tr>
                                            ))}
                                          </tbody>
                                        </table>
                                      ) : (
                                        <div style={{ color: '#666', fontSize: '12px', padding: '4px 0' }}>
                                          No payments recorded for this user.
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </optgroup>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan="5" style={{ padding: '32px', textAlign: 'center', color: '#666', fontWeight: 600 }}>
                            No referred users found matching current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralAdmin;