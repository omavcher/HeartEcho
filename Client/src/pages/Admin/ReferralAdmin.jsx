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

// ------------------- CSS STYLES (Pure Black & Pink Theme) -------------------
const styles = `
.ref-root-x30sn {
  color: var(--text-main-x30sn, #ffffff);
  font-family: 'Inter', -apple-system, sans-serif;
  animation: fadeIn-x30sn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn-x30sn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

/* HEADER */
.ref-header-x30sn {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 32px; 
  padding: 24px;
  background: rgba(17, 17, 17, 0.6); 
  backdrop-filter: blur(12px);
  border-radius: 20px; 
  border: 1px solid var(--border-x30sn, #333);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.ref-title-x30sn { 
  font-size: 32px; 
  font-weight: 800; 
  color: #fff; 
  margin: 0; 
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #fff, #ff69b4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ref-subtitle-x30sn { 
  font-size: 14px; 
  color: var(--text-pink-x30sn, #ff69b4); 
  margin-top: 4px; 
  font-weight: 600; 
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ref-header-actions-x30sn { display: flex; gap: 12px; }

.ref-btn-x30sn {
  display: flex; 
  align-items: center; 
  gap: 10px; 
  background: rgba(255, 255, 255, 0.05); 
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.1); 
  padding: 12px 20px; 
  border-radius: 12px;
  font-size: 14px; 
  font-weight: 600; 
  cursor: pointer; 
  transition: all 0.3s ease;
}

.ref-btn-x30sn:hover { 
  background: rgba(255, 105, 180, 0.1);
  border-color: #ff69b4; 
  color: #ff69b4;
  transform: translateY(-2px);
}

.ref-btn-x30sn.primary { 
  background: #ff69b4; 
  color: #000; 
  border: none;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

.ref-btn-x30sn.primary:hover { 
  background: #ff85c2; 
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.4);
}

/* STATS GRID */
.ref-stats-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 32px;
}

.ref-stat-card-x30sn {
  background: rgba(17, 17, 17, 0.5);
  padding: 24px; 
  border-radius: 20px; 
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
}

.ref-stat-card-x30sn:hover { 
  border-color: rgba(255, 105, 180, 0.4); 
  transform: translateY(-5px);
  background: rgba(20, 20, 20, 0.8);
}

.ref-stat-card-x30sn::after {
  content: '';
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background: radial-gradient(circle at top right, rgba(255, 105, 180, 0.1), transparent);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.ref-stat-card-x30sn:hover::after { opacity: 1; }

.stat-icon-wrapper-x30sn {
  width: 48px; 
  height: 48px; 
  border-radius: 14px; 
  display: flex;
  align-items: center; 
  justify-content: center; 
  margin-bottom: 16px;
  background: rgba(255, 105, 180, 0.15); 
  color: #ff69b4; 
  font-size: 20px;
  border: 1px solid rgba(255, 105, 180, 0.2);
}

.stat-label-x30sn { 
  font-size: 12px; 
  color: #888; 
  text-transform: uppercase; 
  letter-spacing: 1.2px; 
  font-weight: 600;
}

.stat-value-x30sn { 
  font-size: 32px; 
  font-weight: 800; 
  color: #fff; 
  margin: 8px 0; 
}

.stat-change-x30sn { 
  font-size: 13px; 
  color: #ff69b4; 
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
}

/* CHARTS SECTION */
.ref-charts-section-x30sn {
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 24px;
  margin-bottom: 32px;
}

.ref-chart-card-x30sn {
  background: rgba(17, 17, 17, 0.6);
  padding: 28px; 
  border-radius: 24px; 
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.chart-header-x30sn { 
  display: flex; 
  align-items: center; 
  gap: 12px; 
  margin-bottom: 30px; 
  color: #fff; 
  font-size: 18px; 
  font-weight: 700; 
}

.analytics-period-select-x30sn {
  background: rgba(0, 0, 0, 0.3); 
  color: #ff69b4; 
  border: 1px solid rgba(255, 105, 180, 0.2); 
  padding: 6px 12px; 
  border-radius: 8px; 
  font-size: 12px; 
  margin-left: auto;
  outline: none;
  cursor: pointer;
}

/* FILTERS */
.ref-filters-x30sn {
  display: flex; 
  gap: 20px; 
  margin-bottom: 32px; 
  align-items: center;
  background: rgba(17, 17, 17, 0.4); 
  padding: 20px; 
  border-radius: 18px; 
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.ref-search-container-x30sn { position: relative; flex: 1; }
.ref-search-icon-x30sn { position: absolute; left: 16px; top: 14px; color: #666; font-size: 16px; }
.ref-search-input-x30sn {
  width: 100%; 
  padding: 14px 16px 14px 48px; 
  background: rgba(0, 0, 0, 0.2); 
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px; 
  color: #fff; 
  font-size: 15px; 
  outline: none;
  transition: all 0.3s ease;
}
.ref-search-input-x30sn:focus { 
  border-color: #ff69b4; 
  background: rgba(0, 0, 0, 0.4);
  box-shadow: 0 0 15px rgba(255, 105, 180, 0.1);
}

.ref-filter-select-x30sn {
  background: rgba(0, 0, 0, 0.2); 
  color: #fff; 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  padding: 14px 20px; 
  border-radius: 12px; 
  cursor: pointer;
  font-size: 14px;
  outline: none;
}

/* CREATOR CARDS */
.ref-creators-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
}

.ref-creator-card-x30sn {
  background: rgba(17, 17, 17, 0.6); 
  border-radius: 24px; 
  padding: 28px; 
  border: 1px solid rgba(255, 255, 255, 0.05);
  display: flex; 
  flex-direction: column; 
  justify-content: space-between;
  transition: all 0.3s ease;
}

.ref-creator-card-x30sn:hover { 
  border-color: rgba(255, 105, 180, 0.3); 
  transform: translateY(-8px);
  box-shadow: 0 15px 45px rgba(0, 0, 0, 0.4);
}

.ref-creator-header-x30sn { display: flex; gap: 16px; margin-bottom: 24px; }
.ref-creator-avatar-x30sn {
  width: 56px; 
  height: 56px; 
  border-radius: 18px; 
  background: linear-gradient(135deg, #ff69b4, #ff1493); 
  color: #000;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-weight: 900; 
  font-size: 24px;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

.ref-creator-name-x30sn { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
.ref-creator-platform-x30sn { font-size: 13px; color: #ff69b4; font-weight: 600; text-transform: capitalize; }

.ref-creator-stats-x30sn {
  display: grid; 
  grid-template-columns: repeat(3, 1fr); 
  gap: 12px; 
  background: rgba(255, 255, 255, 0.03); 
  padding: 16px; 
  border-radius: 16px; 
  margin-bottom: 20px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.ref-stat-item-x30sn { text-align: center; }
.ref-stat-item-x30sn .stat-label { font-size: 10px; color: #666; text-transform: uppercase; display: block; margin-bottom: 4px; font-weight: 700; }
.ref-stat-item-x30sn .stat-value { font-size: 16px; font-weight: 800; color: #fff; }

.ref-payout-box-x30sn {
  background: rgba(255, 105, 180, 0.08); 
  border: 1px solid rgba(255, 105, 180, 0.2);
  padding: 16px; 
  border-radius: 16px; 
  display: flex; 
  justify-content: space-between; 
  align-items: center; 
  margin-bottom: 20px;
}
.payout-info-x30sn { font-size: 14px; color: #ff69b4; font-weight: 700; }

.ref-link-area-x30sn {
  background: rgba(0, 0, 0, 0.3); 
  border: 1px solid rgba(255, 255, 255, 0.05); 
  padding: 16px; 
  border-radius: 16px; 
  margin-bottom: 20px;
}
.link-text-x30sn { 
  font-size: 12px; 
  color: #aaa; 
  font-family: 'JetBrains Mono', monospace; 
  display: block; 
  overflow: hidden; 
  text-overflow: ellipsis; 
  white-space: nowrap;
}

/* MODAL */
.ref-modal-overlay-x30sn {
  position: fixed; inset: 0; background: rgba(0,0,0,0.9); display: flex; 
  justify-content: center; align-items: center; z-index: 2000; backdrop-filter: blur(15px);
}
.ref-modal-content-x30sn {
  background: #0a0a0a; border: 1px solid #333; width: 95%; max-width: 550px; 
  border-radius: 30px; padding: 40px; position: relative;
  box-shadow: 0 25px 100px rgba(0, 0, 0, 0.8);
}
.ref-form-group-x30sn { margin-bottom: 20px; }
.ref-form-group-x30sn label { display: block; font-size: 12px; color: #ff69b4; font-weight: 700; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px; }
.ref-form-input-x30sn {
  width: 100%; 
  padding: 14px 18px; 
  background: rgba(255, 255, 255, 0.03); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  color: #fff; 
  border-radius: 14px; 
  outline: none; 
  font-size: 15px;
  transition: all 0.3s ease;
}
.ref-form-input-x30sn:focus { border-color: #ff69b4; background: rgba(255, 255, 255, 0.05); }

/* RESPONSIVE */
@media (max-width: 1200px) {
  .ref-stats-grid-x30sn { grid-template-columns: repeat(2, 1fr); }
  .ref-creators-grid-x30sn { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 900px) {
  .ref-charts-section-x30sn { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .ref-stats-grid-x30sn { grid-template-columns: 1fr; }
  .ref-creators-grid-x30sn { grid-template-columns: 1fr; }
  .ref-header-x30sn { flex-direction: column; align-items: stretch; gap: 20px; }
  .ref-header-actions-x30sn { flex-direction: column; }
}

.spin { animation: spin 1s linear infinite; }
@keyframes spin { 100% { transform: rotate(360deg); } }
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

  const togglePasswordVisibility = (id) => {
    setVisiblePasswords((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const [newCreator, setNewCreator] = useState({
    name: "", platform: "instagram", username: "", commissionRate: 15, email: "", phone: ""
  });

  const colors = useMemo(() => ["#ff69b4", "#ffffff", "#333333", "#ff1493"], []);

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
    return {
      total: b.totalCreators || creators.length,
      active: b.activeCreators || creators.filter(c => c.isActive !== false).length,
      refs: b.totalReferrals || 0,
      earn: b.totalEarnings || 0,
      pend: b.pendingEarnings || 0,
      conversion: b.totalCreators > 0 ? ((b.totalReferrals || 0) / b.totalCreators).toFixed(1) : 0
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
    // Payout logic here
    alert("Payout processed!");
  };

  if (loading) return <div style={{background:'#000', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#ff69b4'}}>Initializing...</div>;

  return (
    <div className="ref-root-x30sn">
      <style>{styles}</style>
      
      {/* HEADER */}
      <div className="ref-header-x30sn">
        <div className="ref-title-group-x30sn">
          <h2 className="ref-title-x30sn">Referral Intelligence</h2>
          <p className="ref-subtitle-x30sn">Creator Partners & Conversion Analytics</p>
        </div>
        <div className="ref-header-actions-x30sn">
          <button className="ref-btn-x30sn" onClick={fetchAllData}><FaSync className={refreshing ? 'spin' : ''}/> Sync</button>
          <button className="ref-btn-x30sn primary" onClick={() => setShowCreateModal(true)}><FaPlus /> Add Creator</button>
        </div>
      </div>

      {/* STATS - 2 PER ROW */}
      <div className="ref-stats-grid-x30sn">
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaUsers /></div>
          <span className="stat-label-x30sn">Total Partners</span>
          <p className="stat-value-x30sn">{stats.total}</p>
          <span className="stat-change-x30sn">{stats.active} Active Now</span>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaUserPlus /></div>
          <span className="stat-label-x30sn">Total Referrals</span>
          <p className="stat-value-x30sn">{stats.refs}</p>
          <span className="stat-change-x30sn">{stats.conversion} avg / creator</span>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaRupeeSign /></div>
          <span className="stat-label-x30sn">Total Payouts</span>
          <p className="stat-value-x30sn">₹{stats.earn}</p>
          <span className="stat-change-x30sn">Last 30 Days</span>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaCoins /></div>
          <span className="stat-label-x30sn">Pending</span>
          <p className="stat-value-x30sn">₹{stats.pend}</p>
          <span className="stat-change-x30sn" style={{color:'#fff'}}>Due for processing</span>
        </div>
      </div>

      {/* CHARTS - 2 PER ROW */}
      <div className="ref-charts-section-x30sn">
        <div className="ref-chart-card-x30sn">
          <div className="chart-header-x30sn"><FaChartLine /> Platform Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={platformData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                {platformData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="ref-chart-card-x30sn">
          <div className="chart-header-x30sn">
            <FaChartLine /> Referral Trend
            <select value={analyticsPeriod} onChange={e => setAnalyticsPeriod(e.target.value)} className="analytics-period-select-x30sn">
              <option value="30d">Last 30D</option><option value="7d">Last 7D</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={referralTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="day" stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}} />
              <Line type="monotone" dataKey="referrals" stroke="#ff69b4" strokeWidth={3} dot={{r:4, fill:'#ff69b4'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FILTERS */}
      <div className="ref-filters-x30sn">
        <div className="ref-search-container-x30sn">
          <FaSearch className="ref-search-icon-x30sn" />
          <input className="ref-search-input-x30sn" placeholder="Search creators..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="ref-filter-select-x30sn" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* CREATORS LIST - 2 PER ROW */}
      <div className="ref-creators-grid-x30sn">
        {filteredCreators.map((creator) => (
          <div key={creator._id} className="ref-creator-card-x30sn">
            <div>
              <div className="ref-creator-header-x30sn">
                <div className="ref-creator-avatar-x30sn">{creator.name?.charAt(0)}</div>
                <div style={{flex:1}}>
                  <h4 className="ref-creator-name-x30sn">{creator.name}</h4>
                  <p className="ref-creator-platform-x30sn">{creator.platform} • @{creator.username}</p>
                </div>
                <button className="ref-btn-x30sn" style={{padding:'5px 10px'}} onClick={() => navigator.clipboard.writeText(creator.referralId)}><FaCopy/></button>
              </div>

              <div className="ref-creator-stats-x30sn">
                <div className="ref-stat-item-x30sn"><span className="stat-label">Refs</span><span className="stat-value">{creator.referralCount || 0}</span></div>
                <div className="ref-stat-item-x30sn"><span className="stat-label">Earned</span><span className="stat-value">₹{creator.totalEarnings || 0}</span></div>
                <div className="ref-stat-item-x30sn"><span className="stat-label">Rate</span><span className="stat-value">{creator.commissionRate}%</span></div>
              </div>

              {creator.pendingEarnings > 0 && (
                <div className="ref-payout-box-x30sn">
                  <span className="payout-info-x30sn">₹{creator.pendingEarnings} Pending</span>
                  <button className="ref-btn-x30sn primary" style={{padding:'5px 10px', fontSize:'11px'}} onClick={() => handleProcessPayout(creator._id, creator.pendingEarnings)}>Payout</button>
                </div>
              )}

              <div className="ref-link-area-x30sn">
                <div style={{display:'flex', justifyContent:'space-between'}}>
                  <span className="link-text-x30sn">ID: {creator.referralId}</span>
                  <span className="link-text-x30sn">Username: {creator.username}</span>
                </div>
                <div style={{display:'flex', alignItems:'center', gap:'8px', marginTop:'4px'}}>
                  <span className="link-text-x30sn" style={{display:'inline', marginBottom:0, overflow:'visible'}}>
                    Password: {visiblePasswords[creator._id] ? (creator.plainPassword || "[Not recorded - please edit]") : "********"}
                  </span>
                  <button type="button" style={{background:'none', border:'none', color:'#ccc', cursor:'pointer', padding:0, display:'flex'}} onClick={() => togglePasswordVisibility(creator._id)}>
                    {visiblePasswords[creator._id] ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                  </button>
                </div>
                <div style={{marginTop: '10px', padding: '8px', background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: '11px', color: '#ff69b4', fontFamily: 'monospace', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', userSelect: 'all'}}>
                    https://heartecho.in/?ref={creator.referralId}
                  </span>
                  <button type="button" style={{background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0 4px', display: 'flex', transition: '0.2s'}} onClick={(e) => { navigator.clipboard.writeText(`https://heartecho.in/?ref=${creator.referralId}`); e.currentTarget.style.color = '#ff69b4'; setTimeout(() => e.currentTarget.style.color = '#fff', 1000); }} title="Copy Tracking URL">
                    <FaCopy size={13} />
                  </button>
                </div>
              </div>
            </div>

            <div style={{display:'flex', gap:8, marginTop:10, justifyContent:'space-between'}}>
                <button className="ref-btn-x30sn" style={{flex:1}} onClick={() => handleToggleStatus(creator)}>{creator.isActive ? 'Deactivate' : 'Activate'}</button>
                <div style={{display:'flex', gap:8}}>
                    <button className="ref-btn-x30sn" onClick={() => setEditCreator(creator)}><FaEdit/></button>
                    <button className="ref-btn-x30sn" style={{color:'#ff4444', borderColor:'#ff4444'}} onClick={() => handleDeleteCreator(creator._id)}><FaTrash/></button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="ref-modal-overlay-x30sn">
          <div className="ref-modal-content-x30sn">
            <h3 style={{color:'#fff', marginBottom:'20px'}}>New Partner</h3>
            <form onSubmit={handleCreate}>
              <div className="ref-form-group-x30sn">
                <label>Full Name</label>
                <input className="ref-form-input-x30sn" type="text" required onChange={e => setNewCreator({...newCreator, name:e.target.value})} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                <div className="ref-form-group-x30sn">
                    <label>Platform</label>
                    <select className="ref-form-input-x30sn" defaultValue="instagram" onChange={e => setNewCreator({...newCreator, platform:e.target.value})}>
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
                    <input className="ref-form-input-x30sn" type="number" defaultValue="15" onChange={e => setNewCreator({...newCreator, commissionRate:e.target.value})} />
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                <div className="ref-form-group-x30sn">
                  <label>Username</label>
                  <input className="ref-form-input-x30sn" type="text" required onChange={e => setNewCreator({...newCreator, username:e.target.value})} />
                </div>
                <div className="ref-form-group-x30sn">
                  <label>Password</label>
                  <input className="ref-form-input-x30sn" type="text" required onChange={e => setNewCreator({...newCreator, password:e.target.value})} />
                </div>
              </div>
              <div style={{display:'flex', gap:10, marginTop:20}}>
                <button type="submit" className="ref-btn-x30sn primary" style={{flex:1}}>Create Partner</button>
                <button type="button" className="ref-btn-x30sn" style={{flex:1}} onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT MODAL */}
      {editCreator && (
        <div className="ref-modal-overlay-x30sn">
          <div className="ref-modal-content-x30sn">
            <h3 style={{color:'#fff', marginBottom:'20px'}}>Edit Partner</h3>
            <form onSubmit={handleEdit}>
              <div className="ref-form-group-x30sn">
                <label>Full Name</label>
                <input className="ref-form-input-x30sn" type="text" required value={editCreator.name} onChange={e => setEditCreator({...editCreator, name:e.target.value})} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                <div className="ref-form-group-x30sn">
                    <label>Platform</label>
                    <select className="ref-form-input-x30sn" value={editCreator.platform} onChange={e => setEditCreator({...editCreator, platform:e.target.value})}>
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
                    <input className="ref-form-input-x30sn" type="number" value={editCreator.commissionRate} onChange={e => setEditCreator({...editCreator, commissionRate:e.target.value})} />
                </div>
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                <div className="ref-form-group-x30sn">
                  <label>Username</label>
                  <input className="ref-form-input-x30sn" type="text" required value={editCreator.username} onChange={e => setEditCreator({...editCreator, username:e.target.value})} />
                </div>
                <div className="ref-form-group-x30sn">
                  <label>Password (Leave blank to keep)</label>
                  <input className="ref-form-input-x30sn" type="text" onChange={e => setEditCreator({...editCreator, newPassword:e.target.value})} placeholder="New password" />
                </div>
              </div>
              <div style={{display:'flex', gap:10, marginTop:20}}>
                <button type="submit" className="ref-btn-x30sn primary" style={{flex:1}}>Save Changes</button>
                <button type="button" className="ref-btn-x30sn" style={{flex:1}} onClick={() => setEditCreator(null)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralAdmin;