'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaUser, FaTrash, FaEdit, FaSearch, FaSync, 
  FaUserPlus, FaRobot, FaDownload, FaPhone, FaIdBadge, FaChartPie,
  FaGlobe, FaMobileAlt, FaThLarge, FaList, FaEnvelope
} from "react-icons/fa";
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import axios from "axios";
import api from "../../config/api";

// ------------------- CSS STYLES (Premium Black, Gold, Pink & Glassmorphism) -------------------
const userStyles = `
/* ROOT THEME */
.ua-root {
  color: #fff;
  background-color: #030303;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: ua-fadeIn 0.4s ease;
}
@keyframes ua-fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.ua-header {
  padding: 28px 32px;
  background: linear-gradient(180deg, #070707 0%, #030303 100%);
  border-bottom: 1px solid #161616;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.ua-title h1 { 
  font-size: 26px; 
  font-weight: 800; 
  margin: 0; 
  letter-spacing: -0.5px;
  color: #fff; 
  display: flex;
  align-items: center;
  gap: 12px;
}
.ua-tagline { 
  color: #888; 
  margin: 6px 0 0; 
  font-size: 14px; 
  font-weight: 500; 
  display: flex;
  align-items: center;
  gap: 8px;
}
.ua-actions-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
}

/* SYNC / BUTTONS */
.ua-btn {
  display: flex; 
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
}
.ua-btn:hover { 
  border-color: #ff69b4; 
  color: #ff69b4; 
  background: rgba(255, 105, 180, 0.03);
  transform: translateY(-1px);
}
.ua-btn.primary {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.ua-btn.primary:hover {
  filter: brightness(1.1);
  color: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.25);
}
.ua-btn.sync {
  width: 42px;
  height: 42px;
  padding: 0;
  justify-content: center;
  border-radius: 10px;
}
.ua-btn.sync:hover {
  transform: rotate(180deg) translateY(0);
}
.ua-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* KPI GRID */
.ua-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}
.ua-kpi-card {
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
.ua-kpi-card:hover { 
  border-color: #262626; 
  transform: translateY(-3px); 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.ua-kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(255,105,180,0.03), transparent 60%);
  pointer-events: none;
}
.ua-kpi-icon {
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
.ua-kpi-info h4 { margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.8px; }
.ua-kpi-info strong { font-size: 24px; color: #fff; display: block; margin-top: 4px; font-weight: 800; }
.ua-kpi-sub { font-size: 11px; color: #00ff88; margin-top: 4px; font-weight: 600; display: block; }
.ua-kpi-sub.muted { color: #666; }

/* CHARTS ROW */
.ua-charts-row {
  display: grid; 
  grid-template-columns: 1.2fr 1fr 1fr; 
  gap: 20px; 
  padding: 0 32px 24px;
}
.ua-chart-box {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 20px; 
  padding: 20px; 
  min-height: 300px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
}
.ua-chart-title { 
  font-size: 14px; 
  font-weight: 700; 
  margin-bottom: 20px; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  color: #eee;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.ua-chart-title svg { color: #ff69b4; }

/* CONTROLS SECTION */
.ua-controls-section {
  padding: 0 32px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ua-view-toggle-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #161616;
  padding-bottom: 16px;
}
.ua-toggle-buttons {
  display: flex;
  gap: 8px;
}
.ua-toggle-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: #0c0c0c;
  color: #888;
  border: 1px solid #1a1a1a;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.ua-toggle-btn:hover {
  color: #fff;
  border-color: #333;
}
.ua-toggle-btn.active {
  background: rgba(255, 105, 180, 0.08);
  color: #ff69b4;
  border-color: #ff69b4;
}

.ua-filters-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  background: rgba(10, 10, 10, 0.4);
  border: 1px solid #161616;
  padding: 16px;
  border-radius: 12px;
}
.ua-search-wrap {
  position: relative; 
  flex: 1;
  min-width: 280px;
}
.ua-search-icon { position: absolute; left: 14px; top: 13px; color: #555; }
.ua-input {
  width: 100%; 
  background: rgba(15, 15, 15, 0.7); 
  border: 1px solid #222; 
  color: #fff; 
  padding: 12px 12px 12px 42px;
  border-radius: 10px; 
  outline: none; 
  font-size: 13px;
  transition: all 0.25s ease;
}
.ua-input:focus { 
  border-color: #ff69b4; 
  background: #000;
  box-shadow: 0 0 12px rgba(255, 105, 180, 0.15);
}
.ua-select {
  background: rgba(15, 15, 15, 0.7);
  color: #ccc;
  border: 1px solid #222;
  padding: 12px 16px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  cursor: pointer;
  min-width: 140px;
  transition: all 0.25s ease;
}
.ua-select:focus {
  border-color: #ff69b4;
  color: #fff;
}

/* USER CARDS GRID */
.ua-user-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 20px;
  padding: 0 32px 32px;
}
.ua-user-card {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  padding: 20px;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}
.ua-user-card:hover { 
  border-color: #ff69b4; 
  transform: translateY(-3px); 
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}
.ua-user-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 4px;
  background: linear-gradient(90deg, transparent, rgba(255, 105, 180, 0.3), transparent);
  opacity: 0;
  transition: opacity 0.3s;
}
.ua-user-card:hover::before { opacity: 1; }

.uac-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.uac-avatar-wrap {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(45deg, #222, #111);
  border: 1px solid #333;
}
.uac-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  background: #151515;
}
.uac-badges {
  display: flex;
  flex-direction: column;
  gap: 6px;
  align-items: flex-end;
}
.uac-badge {
  font-size: 9px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 4px 8px;
  border-radius: 6px;
}
.uac-badge.free { background: #1a1a1a; color: #888; border: 1px solid #222; }
.uac-badge.sub { 
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%); 
  color: #000; 
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.15);
}
.uac-badge.platform {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 9px;
}
.uac-badge.platform.mobile {
  background: rgba(0, 255, 136, 0.05);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.15);
}
.uac-badge.platform.web {
  background: rgba(0, 122, 255, 0.05);
  color: #007aff;
  border: 1px solid rgba(0, 122, 255, 0.15);
}

.uac-info h4 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.uac-email {
  font-size: 12px;
  color: #666;
  margin: 4px 0 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.uac-details-box {
  background: rgba(5, 5, 5, 0.5);
  border: 1px solid #141414;
  border-radius: 10px;
  padding: 12px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-bottom: 14px;
}
.uac-detail-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.uac-detail-item span {
  font-size: 9px;
  color: #555;
  text-transform: uppercase;
  font-weight: 700;
}
.uac-detail-item strong {
  font-size: 12px;
  color: #ccc;
}
.uac-detail-item.full {
  grid-column: span 2;
}

.uac-quota-section {
  margin-bottom: 16px;
}
.uac-quota-lbl {
  display: flex;
  justify-content: space-between;
  font-size: 11px;
  color: #666;
  font-weight: 600;
  margin-bottom: 6px;
}
.uac-quota-lbl strong { color: #fff; }
.uac-quota-bar {
  height: 6px;
  background: #141414;
  border-radius: 3px;
  overflow: hidden;
}
.uac-quota-fill {
  height: 100%;
  background: linear-gradient(90deg, #ff69b4 0%, #da22ff 100%);
  border-radius: 3px;
  transition: width 0.4s ease;
}

.uac-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid #161616;
  margin-top: auto;
}
.uac-act-btn {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  background: #0f0f0f;
  border: 1px solid #222;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
}
.uac-act-btn:hover {
  transform: translateY(-1px);
}
.uac-act-btn.sub:hover { color: #ff69b4; border-color: rgba(255, 105, 180, 0.3); background: rgba(255, 105, 180, 0.04); }
.uac-act-btn.edit:hover { color: #007aff; border-color: rgba(0, 122, 255, 0.3); background: rgba(0, 122, 255, 0.04); }
.uac-act-btn.delete:hover { color: #ff4444; border-color: rgba(255, 68, 68, 0.3); background: rgba(255, 68, 68, 0.04); }

/* ENTERPRISE TABLE VIEW */
.ua-table-wrapper {
  padding: 0 32px 32px;
}
.ua-table-card {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.ua-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.ua-table th {
  padding: 16px 20px; 
  text-align: left; 
  color: #666; 
  font-weight: 700; 
  text-transform: uppercase; 
  font-size: 10px; 
  letter-spacing: 1.2px;
  border-bottom: 1px solid #1a1a1a;
  background: #070707;
}
.ua-table td {
  padding: 16px 20px; 
  border-bottom: 1px solid #111; 
  color: #ccc; 
  vertical-align: middle; 
  transition: all 0.2s ease;
}
.ua-table tr {
  position: relative;
  transition: all 0.2s ease;
}
.ua-table tr:hover td { 
  background: rgba(255, 105, 180, 0.015); 
  color: #fff;
}
.ua-table tr:hover::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ff69b4;
  box-shadow: 0 0 8px #ff69b4;
}

.ua-user-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}
.ua-user-img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #222;
  background: #111;
}
.ua-user-name-wrap div {
  font-weight: 700;
  color: #fff;
}
.ua-user-name-wrap span {
  font-size: 11px;
  color: #555;
}
.ua-mono-id {
  font-family: 'JetBrains Mono', monospace;
  color: #a0c0e0; 
  background: rgba(160, 192, 224, 0.04); 
  padding: 4px 8px; 
  border-radius: 6px; 
  font-size: 11px;
  border: 1px solid rgba(160, 192, 224, 0.08);
}
.ua-platform-cell {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
}
.ua-platform-icon {
  display: flex;
  align-items: center;
}

/* PAGINATION CONTAINER */
.ua-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 32px 40px;
}

/* PREMIUM MODAL */
.ua-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ua-fadeIn 0.25s ease;
}
.ua-modal-content {
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid #262626;
  padding: 28px;
  border-radius: 20px;
  width: 360px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  animation: ua-modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes ua-modalScale {
  from { transform: scale(0.9) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}
.ua-modal-title {
  margin: 0;
  color: #ff69b4;
  font-size: 20px;
  font-weight: 800;
  display: flex;
  align-items: center;
  gap: 10px;
}
.ua-modal-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.ua-modal-field label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.8px;
}
.ua-modal-input {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  transition: all 0.25s ease;
}
.ua-modal-input:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.15);
}
.ua-modal-select {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.ua-modal-select:focus {
  border-color: #ff69b4;
}
.ua-modal-actions {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}
.ua-modal-actions button {
  flex: 1;
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}
.ua-modal-btn-cancel {
  background: #1a1a1a;
  border: 1px solid #262626;
  color: #aaa;
}
.ua-modal-btn-cancel:hover {
  background: #222;
  color: #fff;
}
.ua-modal-btn-confirm {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.ua-modal-btn-confirm:hover {
  filter: brightness(1.1);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

/* LOADER & SPINNER */
.ua-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #444;
}
.ua-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #222;
  border-top-color: #ff69b4;
  border-radius: 50%;
  animation: ua-spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes ua-spin { to { transform: rotate(360deg); } }

/* RESPONSIVE LAYOUT */
@media (max-width: 1200px) {
  .ua-charts-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .ua-header {
    padding: 20px 24px;
    flex-direction: column;
    align-items: flex-start;
  }
  .ua-kpi-grid {
    padding: 16px 24px;
  }
  .ua-controls-section {
    padding: 0 24px 20px;
  }
  .ua-user-grid {
    padding: 0 24px 24px;
  }
  .ua-table-wrapper {
    padding: 0 24px 24px;
  }
  .ua-table th:nth-child(4), .ua-table td:nth-child(4),
  .ua-table th:nth-child(6), .ua-table td:nth-child(6) {
    display: none;
  }
}
`;

// Recharts Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    let title = label || data.name || "";
    let value = data.value;
    
    if (data.name === 'count') title = "New signups";
    if (data.name === 'msg') title = "Messages sent";

    return (
      <div style={{
        background: 'rgba(5, 5, 5, 0.9)',
        border: '1px solid #ff69b4',
        borderRadius: '10px',
        padding: '12px 16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {title}
        </p>
        <p style={{ margin: '6px 0 0 0', fontSize: '16px', color: '#ff69b4', fontWeight: 800 }}>
          {value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [dashboardStats, setDashboardStats] = useState({ newUsersToday: 0, todaySignIns: 0 });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("card"); // "card" or "table"
  const [subModal, setSubModal] = useState({ open: false, userId: null, tier: "yearly_pro", password: "" });

  const usersPerPage = useMemo(() => (viewMode === "table" ? 12 : 8), [viewMode]);

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchAllData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/user-dataw`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(response.data.userData || []);
      setDashboardStats({
        newUsersToday: response.data.newUsersToday || 0,
        todaySignIns: response.data.todaySignIns || 0,
      });
    } catch (error) { 
      console.error("Fetch Error:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [getToken]);

  useEffect(() => { 
    fetchAllData(); 
  }, [fetchAllData]);

  // --- COMPUTE ADVANCED STATS ---
  const stats = useMemo(() => {
    const totalUsers = users.length;
    const premiumCount = users.filter(u => u.user_type === 'subscriber').length;
    const mobileCount = users.filter(u => u.isMobileUser).length;
    
    const premiumPercentage = totalUsers > 0 ? ((premiumCount / totalUsers) * 100).toFixed(1) + "%" : "0%";
    const mobilePercentage = totalUsers > 0 ? ((mobileCount / totalUsers) * 100).toFixed(0) : 0;
    const webPercentage = totalUsers > 0 ? (100 - parseFloat(mobilePercentage)).toFixed(0) : 0;
    
    const totalChats = users.reduce((acc, u) => acc + (u.chats?.length || 0), 0);
    const totalFriends = users.reduce((acc, u) => acc + (u.ai_friends?.length || 0), 0);
    const averageChats = totalUsers > 0 ? (totalChats / totalUsers).toFixed(1) : 0;
    const averageFriends = totalUsers > 0 ? (totalFriends / totalUsers).toFixed(1) : 0;
    
    const totalMessagesToday = users.reduce((acc, u) => acc + (u.messagesUsedToday || 0), 0);

    return {
      joinedToday: dashboardStats.newUsersToday,
      premiumUsers: premiumCount,
      premiumPercentage,
      todaySignIns: dashboardStats.todaySignIns,
      mobileUsers: mobileCount,
      mobilePercentage,
      webPercentage,
      averageChats,
      averageFriends,
      totalMessagesToday,
      avgAge: totalUsers > 0 ? (users.reduce((acc, u) => acc + (u.age || 0), 0) / totalUsers).toFixed(1) : 0
    };
  }, [users, dashboardStats]);

  // Chart 1: Join Trend (Last 7 Days)
  const growthData = useMemo(() => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const count = users.filter(u => u.createdAt?.startsWith(dateStr) || u.joinedAt?.startsWith(dateStr)).length;
      data.push({ name: d.toLocaleDateString('en-US', { weekday: 'short' }), count: count });
    }
    return data;
  }, [users]);

  // Chart 2: User Types Pie
  const userTypeData = useMemo(() => [
    { name: 'Free Users', value: users.filter(u => u.user_type !== 'subscriber').length },
    { name: 'Premium Users', value: users.filter(u => u.user_type === 'subscriber').length }
  ], [users]);

  // Chart 3: Message Activity (Top 5 users by usage today)
  const activityData = useMemo(() => {
    return users
      .slice()
      .sort((a, b) => (b.messagesUsedToday || 0) - (a.messagesUsedToday || 0))
      .slice(0, 5)
      .map(u => ({ name: u.name?.split(' ')[0] || 'User', msg: u.messagesUsedToday || 0 }));
  }, [users]);

  const PIE_COLORS = ['#262626', '#ff69b4'];

  // --- FILTER LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = (u.name || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (u.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                          (u._id || "").includes(searchTerm);
      const matchType = filterType === "all" || u.user_type === filterType;
      
      let matchPlatform = true;
      if (platformFilter === "mobile") {
        matchPlatform = u.isMobileUser === true;
      } else if (platformFilter === "web") {
        matchPlatform = !u.isMobileUser;
      }

      let matchDate = true;
      const dateField = u.createdAt || u.joinedAt;
      if (dateFilter !== "all" && dateField) {
        const userDate = new Date(dateField);
        const now = new Date();
        const diffMs = now - userDate;
        const oneDay = 24 * 60 * 60 * 1000;
        if (dateFilter === "week") matchDate = diffMs <= 7 * oneDay;
        else if (dateFilter === "month") matchDate = diffMs <= 30 * oneDay;
        else if (dateFilter === "6months") matchDate = diffMs <= 180 * oneDay;
        else if (dateFilter === "year") matchDate = diffMs <= 365 * oneDay;
      }
      return matchSearch && matchType && matchPlatform && matchDate;
    });
  }, [users, searchTerm, filterType, platformFilter, dateFilter]);

  const paginatedUsers = useMemo(() => {
    return filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);
  }, [filteredUsers, currentPage, usersPerPage]);

  // Export Utilities
  const exportUsersJSON = () => {
     const dataToExport = filteredUsers.map(u => ({
         id: u._id || "",
         name: u.name || "N/A",
         email: u.email || "N/A",
         phone: u.phone_number || "N/A",
         age: u.age || "N/A",
         gender: u.gender || "N/A",
         user_type: u.user_type || "free",
         platform: u.isMobileUser ? "Mobile" : "Web",
         chatsCount: u.chats?.length || 0,
         friendsCount: u.ai_friends?.length || 0,
         messagesUsedToday: u.messagesUsedToday || 0,
         messageQuota: u.messageQuota || 10,
         joinedAt: u.createdAt || u.joinedAt || ""
     }));

     const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
     const downloadAnchorNode = document.createElement('a');
     downloadAnchorNode.setAttribute("href", dataStr);
     downloadAnchorNode.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.json`);
     document.body.appendChild(downloadAnchorNode);
     downloadAnchorNode.click();
     downloadAnchorNode.remove();
  };

  const exportUsersCSV = () => {
    const headers = ["User ID", "Name", "Email", "Phone", "Age", "Gender", "Tier", "Platform", "Chats", "AI Friends", "Messages Today", "Quota", "Joined At"];
    const rows = filteredUsers.map(u => [
      u._id || "",
      u.name || "N/A",
      u.email || "N/A",
      u.phone_number || "N/A",
      u.age || "N/A",
      u.gender || "N/A",
      u.user_type === 'subscriber' ? "Premium" : "Free",
      u.isMobileUser ? "Mobile" : "Web",
      u.chats?.length || 0,
      u.ai_friends?.length || 0,
      u.messagesUsedToday || 0,
      u.messageQuota || 10,
      u.createdAt || u.joinedAt || ""
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `users_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleManualSub = async () => {
    if (!subModal.password || !subModal.tier) return alert("Fill all fields");
    try {
      const token = getToken();
      await axios.post(`${api.Url}/admin/manual-subscribe/${subModal.userId}`, {
        password: subModal.password,
        tier: subModal.tier
      }, { headers: { Authorization: `Bearer ${token}` } });
      alert(`Success! User is now ${subModal.tier}`);
      setSubModal({ open: false, userId: null, tier: "yearly_pro", password: "" });
      fetchAllData();
    } catch (e) {
      alert(e.response?.data?.message || "Error subscribing user");
    }
  };

  const formatDate = (iso) => {
    if (!iso) return "N/A";
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const getPlatformIcon = (isMobile) => {
    return isMobile ? <FaMobileAlt style={{ color: '#00ff88' }} /> : <FaGlobe style={{ color: '#007aff' }} />;
  };

  if (loading) {
    return (
      <div className="ua-loader">
        <style>{userStyles}</style>
        <div className="ua-spinner"></div>
        <p style={{ fontWeight: 600, color: '#666' }}>Syncing Database...</p>
      </div>
    );
  }

  return (
    <>
      <style>{userStyles}</style>
      <div className="ua-root">
        
        {/* HEADER */}
        <header className="ua-header">
          <div className="ua-title">
            <h1>Users & Accounts</h1>
            <p className="ua-tagline"><FaUser /> Platform intelligence • {users.length} total profiles</p>
          </div>
          <div className="ua-actions-wrap">
            <button className="ua-btn sync" onClick={fetchAllData} title="Sync database cache">
              <FaSync />
            </button>
          </div>
        </header>

        {/* KPI STRIP */}
        <div className="ua-kpi-grid">
          <div className="ua-kpi-card">
            <div className="ua-kpi-icon"><FaUserPlus /></div>
            <div className="ua-kpi-info">
              <h4>New Today</h4>
              <strong>{stats.joinedToday}</strong>
            </div>
          </div>
          <div className="ua-kpi-card">
            <div className="ua-kpi-icon" style={{ color: '#ff69b4' }}><FaUser /></div>
            <div className="ua-kpi-info">
              <h4>Subscribers</h4>
              <strong>{stats.premiumUsers}</strong>
              <span className="ua-kpi-sub">{stats.premiumPercentage} Premium</span>
            </div>
          </div>
          <div className="ua-kpi-card">
            <div className="ua-kpi-icon" style={{ color: '#00ff88', background: 'rgba(0,255,136,0.04)', border: '1px solid rgba(0,255,136,0.1)' }}><FaRobot /></div>
            <div className="ua-kpi-info">
              <h4>Today Sign-Ins</h4>
              <strong>{stats.todaySignIns}</strong>
            </div>
          </div>
          <div className="ua-kpi-card">
            <div className="ua-kpi-icon" style={{ color: '#007aff', background: 'rgba(0,122,255,0.04)', border: '1px solid rgba(0,122,255,0.1)' }}><FaMobileAlt /></div>
            <div className="ua-kpi-info">
              <h4>Platform Mix</h4>
              <strong>{stats.mobileUsers} Mob</strong>
              <span className="ua-kpi-sub muted">{stats.mobilePercentage}% Mobile | {stats.webPercentage}% Web</span>
            </div>
          </div>
          <div className="ua-kpi-card">
            <div className="ua-kpi-icon" style={{ color: '#ffea00', background: 'rgba(255,234,0,0.04)', border: '1px solid rgba(255,234,0,0.1)' }}><FaChartPie /></div>
            <div className="ua-kpi-info">
              <h4>Avg Engagement</h4>
              <strong>{stats.averageChats} ch</strong>
              <span className="ua-kpi-sub muted">Avg {stats.averageFriends} AI buddies</span>
            </div>
          </div>
          <div className="ua-kpi-card">
            <div className="ua-kpi-icon" style={{ color: '#ff4444', background: 'rgba(255,68,68,0.04)', border: '1px solid rgba(255,68,68,0.1)' }}><FaEnvelope /></div>
            <div className="ua-kpi-info">
              <h4>Messages Today</h4>
              <strong>{stats.totalMessagesToday}</strong>
            </div>
          </div>
        </div>

        {/* CHARTS ROW */}
        <div className="ua-charts-row">
          {/* 1. Growth Area Chart */}
          <div className="ua-chart-box">
            <div className="ua-chart-title"><FaUserPlus /> Signup Growth (7d)</div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#181818"/>
                <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false}/>
                <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false}/>
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" stroke="#ff69b4" fill="url(#growthGrad)" strokeWidth={2}/>
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* 2. User Types Pie */}
          <div className="ua-chart-box">
            <div className="ua-chart-title"><FaChartPie /> Subscription Split</div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie 
                  data={userTypeData} 
                  cx="50%" cy="50%" 
                  innerRadius={55} 
                  outerRadius={75} 
                  paddingAngle={4} 
                  dataKey="value"
                >
                  {userTypeData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* 3. Top Daily Users Bar */}
          <div className="ua-chart-box">
            <div className="ua-chart-title"><FaRobot /> Daily Chat Activity (Top 5)</div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#181818"/>
                <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false}/>
                <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false}/>
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                <Bar dataKey="msg" fill="#222" radius={[6, 6, 0, 0]} activeBar={{ fill: '#ff69b4' }} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* CONTROLS & VIEWS SECTION */}
        <div className="ua-controls-section">
          <div className="ua-view-toggle-bar">
            <div style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
              Showing {Math.min(paginatedUsers.length, filteredUsers.length)} of {filteredUsers.length} matching profiles
            </div>
            <div className="ua-toggle-buttons">
              <button 
                className={`ua-toggle-btn ${viewMode === "card" ? "active" : ""}`}
                onClick={() => { setViewMode("card"); setCurrentPage(1); }}
              >
                <FaThLarge /> Grid View
              </button>
              <button 
                className={`ua-toggle-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => { setViewMode("table"); setCurrentPage(1); }}
              >
                <FaList /> Table View
              </button>
            </div>
          </div>

          <div className="ua-filters-bar">
            <div className="ua-search-wrap">
              <FaSearch className="ua-search-icon" />
              <input 
                type="text" 
                className="ua-input" 
                placeholder="Search by User, Email, ID..." 
                value={searchTerm} 
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              />
            </div>
            <select className="ua-select" value={filterType} onChange={e => { setFilterType(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Tiers</option>
              <option value="subscriber">Premium Only</option>
              <option value="free">Free Members</option>
            </select>
            <select className="ua-select" value={platformFilter} onChange={e => { setPlatformFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Devices</option>
              <option value="mobile">Mobile App</option>
              <option value="web">Web Browser</option>
            </select>
            <select className="ua-select" value={dateFilter} onChange={e => { setDateFilter(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Join Dates</option>
              <option value="week">Joined Last Week</option>
              <option value="month">Joined Last Month</option>
              <option value="6months">Joined Last 6 M</option>
              <option value="year">Joined Last Year</option>
            </select>
            <button className="ua-btn" onClick={exportUsersJSON} title="Export JSON format">
              JSON
            </button>
            <button className="ua-btn" onClick={exportUsersCSV} title="Export CSV format for Excel">
              CSV
            </button>
          </div>
        </div>

        {/* USER LIST GRID (CARD VIEW) */}
        {viewMode === "card" && (
          <div className="ua-user-grid">
            {paginatedUsers.map(user => (
              <div key={user._id} className="ua-user-card">
                <div className="uac-header">
                  <div className="uac-avatar-wrap">
                    <img 
                      src={user.profile_picture || user.picture || user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                      className="uac-avatar" 
                      alt="Profile"
                      referrerPolicy="no-referrer"
                      onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                    />
                  </div>
                  <div className="uac-badges">
                    <span className={`uac-badge ${user.user_type === 'subscriber' ? 'sub' : 'free'}`}>
                      {user.user_type === 'subscriber' ? 'Premium' : 'Free'}
                    </span>
                    <span className={`uac-badge platform ${user.isMobileUser ? 'mobile' : 'web'}`}>
                      {getPlatformIcon(user.isMobileUser)}
                      {user.isMobileUser ? 'Mobile' : 'Web'}
                    </span>
                  </div>
                </div>
                
                <div className="uac-info">
                  <h4>{user.name || "Unknown User"}</h4>
                  <div className="uac-email">{user.email || "No Email Address"}</div>
                  
                  <div className="uac-details-box">
                    <div className="uac-detail-item">
                      <span>User ID</span>
                      <strong className="ua-mono-id">{user._id ? user._id.slice(-6).toUpperCase() : '---'}</strong>
                    </div>
                    <div className="uac-detail-item">
                      <span>Phone</span>
                      <strong>{user.phone_number || 'N/A'}</strong>
                    </div>
                    <div className="uac-detail-item">
                      <span>Chats</span>
                      <strong>{user.chats?.length || 0}</strong>
                    </div>
                    <div className="uac-detail-item">
                      <span>AI Buddies</span>
                      <strong>{user.ai_friends?.length || 0}</strong>
                    </div>
                    <div className="uac-detail-item full">
                      <span>Last Activity</span>
                      <strong style={{ color: '#ff69b4' }}>{formatDate(user.updatedAt)}</strong>
                    </div>
                  </div>

                  <div className="uac-quota-section">
                    <div className="uac-quota-lbl">
                      <span>Today Usage</span>
                      <span><strong>{user.messagesUsedToday || 0}</strong> / {user.messageQuota || 10} msgs</span>
                    </div>
                    <div className="uac-quota-bar">
                      <div 
                        className="uac-quota-fill" 
                        style={{ width: `${Math.min(((user.messagesUsedToday || 0) / (user.messageQuota || 10)) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                <div className="uac-actions">
                  <button 
                    className="uac-act-btn sub" 
                    title="Manual Subscription" 
                    onClick={() => setSubModal({ open: true, userId: user._id, tier: "yearly_pro", password: "" })}
                  >
                    <FaUserPlus />
                  </button>
                  <button className="uac-act-btn edit" title="Edit User Details"><FaEdit /></button>
                  <button className="uac-act-btn delete" title="Delete Account"><FaTrash /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ENTERPRISE TABLE VIEW */}
        {viewMode === "table" && (
          <div className="ua-table-wrapper">
            <div className="ua-table-card">
              <table className="ua-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>User ID</th>
                    <th>Tier</th>
                    <th>Device</th>
                    <th>Activity & Daily Quota</th>
                    <th>Last Active</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedUsers.map((user) => (
                    <tr key={user._id}>
                      <td>
                        <div className="ua-user-cell">
                          <img 
                            src={user.profile_picture || user.picture || user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                            alt="Profile" 
                            className="ua-user-img"
                            referrerPolicy="no-referrer"
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                          />
                          <div className="ua-user-name-wrap">
                            <div>{user.name || "Unknown User"}</div>
                            <span>{user.email || "No Email"}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="ua-mono-id">{user._id || "N/A"}</span>
                      </td>
                      <td>
                        <span className={`uac-badge ${user.user_type === 'subscriber' ? 'sub' : 'free'}`}>
                          {user.user_type === 'subscriber' ? 'Premium' : 'Free'}
                        </span>
                      </td>
                      <td>
                        <div className="ua-platform-cell">
                          <span className="ua-platform-icon">
                            {getPlatformIcon(user.isMobileUser)}
                          </span>
                          <span style={{ fontSize: 12, fontWeight: 500 }}>
                            {user.isMobileUser ? 'Mobile' : 'Web'}
                          </span>
                        </div>
                      </td>
                      <td style={{ minWidth: 160 }}>
                        <div style={{ display: 'flex', gap: '12px', fontSize: 11, color: '#888', marginBottom: 4 }}>
                          <span>Chats: <strong style={{ color: '#fff' }}>{user.chats?.length || 0}</strong></span>
                          <span>AI: <strong style={{ color: '#fff' }}>{user.ai_friends?.length || 0}</strong></span>
                          <span>Msg: <strong style={{ color: '#ff69b4' }}>{user.messagesUsedToday || 0}</strong>/{user.messageQuota || 10}</span>
                        </div>
                        <div className="uac-quota-bar" style={{ height: 4 }}>
                          <div 
                            className="uac-quota-fill" 
                            style={{ width: `${Math.min(((user.messagesUsedToday || 0) / (user.messageQuota || 10)) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </td>
                      <td style={{ fontSize: 12, color: '#ff69b4', fontWeight: 600 }}>
                        {formatDate(user.updatedAt)}
                      </td>
                      <td>
                        <div className="uac-actions" style={{ border: 'none', margin: 0, padding: 0 }}>
                          <button 
                            className="uac-act-btn sub" 
                            title="Manual Subscription" 
                            onClick={() => setSubModal({ open: true, userId: user._id, tier: "yearly_pro", password: "" })}
                          >
                            <FaUserPlus />
                          </button>
                          <button className="uac-act-btn edit" title="Edit User"><FaEdit /></button>
                          <button className="uac-act-btn delete" title="Delete User"><FaTrash /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                 <div style={{ padding: 60, textAlign: 'center', color: '#444', fontWeight: 600 }}>
                   No users found matching your search or filters.
                 </div>
              )}
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {filteredUsers.length > usersPerPage && (
          <div className="ua-pagination">
            <button 
              className="ua-btn" 
              disabled={currentPage === 1} 
              onClick={() => setCurrentPage(p => p - 1)}
            >
              Previous
            </button>
            <span style={{ color: '#666', fontSize: 13, fontWeight: 600 }}>
              Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}
            </span>
            <button 
              className="ua-btn" 
              disabled={currentPage * usersPerPage >= filteredUsers.length} 
              onClick={() => setCurrentPage(p => p + 1)}
            >
              Next
            </button>
          </div>
        )}

        {/* MANUAL SUB MODAL */}
        {subModal.open && (
           <div className="ua-modal-overlay" onClick={() => setSubModal({ open: false, userId: null, tier: "yearly_pro", password: "" })}>
              <div className="ua-modal-content" onClick={e => e.stopPropagation()}>
                 <h3 className="ua-modal-title"><FaUserPlus /> Manual Subscription</h3>
                 
                 <div className="ua-modal-field">
                   <label>Select Tier Plan</label>
                   <select 
                     className="ua-modal-select"
                     value={subModal.tier} 
                     onChange={e => setSubModal({ ...subModal, tier: e.target.value })}
                   >
                     <option value="monthly">Monthly (₹99 / $1.49)</option>
                     <option value="yearly">Yearly (₹599 / $9)</option>
                     <option value="yearly_pro">Ultimate (₹1499 / $19)</option>
                   </select>
                 </div>
 
                 <div className="ua-modal-field">
                   <label>Admin Security Password</label>
                   <input 
                     type="password"
                     className="ua-modal-input"
                     placeholder="Enter admin verification password..."
                     value={subModal.password}
                     onChange={e => setSubModal({ ...subModal, password: e.target.value })}
                   />
                 </div>
 
                 <div className="ua-modal-actions">
                   <button className="ua-modal-btn-cancel" onClick={() => setSubModal({ open: false, userId: null, tier: "yearly_pro", password: "" })}>
                     Cancel
                   </button>
                   <button className="ua-modal-btn-confirm" onClick={handleManualSub}>
                     Confirm Upgrade
                   </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </>
  );
};

export default UsersAdmin;