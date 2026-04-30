'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FaUserPlus, FaMoneyBillWave, FaChartLine, FaUsers, 
  FaCoins, FaPercentage, FaSync, FaArrowUp, FaArrowDown,
  FaExternalLinkAlt, FaUserCheck, FaCommentDots
} from "react-icons/fa";
import {
  BarChart, Bar, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid, LineChart, Line,
  AreaChart, Area
} from "recharts";
import axios from "axios";
import api from "../../../config/api";

const styles = `
.analytics-root {
  color: #ffffff;
  background-color: #000000;
  min-height: 100vh;
  font-family: 'Outfit', sans-serif;
  padding: 30px;
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.analytics-header {
  margin-bottom: 40px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}
.analytics-title-area h1 {
  font-size: 36px;
  font-weight: 800;
  margin: 0;
  background: linear-gradient(135deg, #fff 0%, #ff69b4 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}
.analytics-subtitle {
  color: #888;
  font-size: 16px;
  margin-top: 8px;
}

/* ACTIONS */
.analytics-actions {
  display: flex;
  gap: 15px;
}
.analytics-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #fff;
  padding: 12px 24px;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.analytics-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: #ff69b4;
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -10px rgba(255, 105, 180, 0.3);
}
.analytics-btn.primary {
  background: #ff69b4;
  color: #000;
  border: none;
}
.analytics-btn.primary:hover {
  background: #ff85c2;
}

/* GRID LAYOUTS */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 24px;
  margin-bottom: 40px;
}
.charts-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 24px;
  margin-bottom: 40px;
}
@media (max-width: 1200px) {
  .charts-grid { grid-template-columns: 1fr; }
}

/* CARDS */
.analytics-card {
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  border-radius: 24px;
  padding: 28px;
  position: relative;
  overflow: hidden;
  transition: all 0.4s ease;
}
.analytics-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(255, 105, 180, 0.05), transparent);
  pointer-events: none;
}
.analytics-card:hover {
  border-color: rgba(255, 105, 180, 0.4);
  background: #0f0f0f;
  transform: translateY(-4px);
  box-shadow: 0 20px 40px -20px rgba(0,0,0,0.5);
}

/* STATS */
.stat-icon {
  width: 54px;
  height: 54px;
  background: rgba(255, 105, 180, 0.1);
  color: #ff69b4;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 20px;
}
.stat-label {
  color: #888;
  font-size: 14px;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.stat-value {
  font-size: 32px;
  font-weight: 800;
  margin: 10px 0;
  color: #fff;
}
.stat-trend {
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 5px;
}
.stat-trend.up { color: #00ff88; }
.stat-trend.down { color: #ff4444; }

/* TABLE */
.table-container {
  margin-top: 20px;
  overflow-x: auto;
}
.analytics-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0 12px;
}
.analytics-table th {
  text-align: left;
  padding: 15px 20px;
  color: #555;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 1px;
}
.analytics-table tr {
  background: #050505;
  transition: all 0.2s ease;
}
.analytics-table tr:hover {
  background: #111;
  transform: scale(1.005);
}
.analytics-table td {
  padding: 20px;
  font-size: 14px;
  border-top: 1px solid #1a1a1a;
  border-bottom: 1px solid #1a1a1a;
}
.analytics-table td:first-child {
  border-left: 1px solid #1a1a1a;
  border-radius: 16px 0 0 16px;
}
.analytics-table td:last-child {
  border-right: 1px solid #1a1a1a;
  border-radius: 0 16px 16px 0;
}

/* BADGES */
.badge {
  padding: 6px 12px;
  border-radius: 100px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
}
.badge.subscriber { background: rgba(255, 105, 180, 0.1); color: #ff69b4; border: 1px solid rgba(255, 105, 180, 0.2); }
.badge.free { background: rgba(255, 255, 255, 0.05); color: #888; border: 1px solid rgba(255, 255, 255, 0.1); }

/* LOADER */
.loader-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #000;
}
.loader {
  width: 48px;
  height: 48px;
  border: 4px solid #ff69b4;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  box-sizing: border-box;
  animation: rotation 1s linear infinite;
}
@keyframes rotation { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

.spin { animation: rotation 1s linear infinite; }
`;

export default function ReferralAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    referralTrend: [],
    creatorPerformance: [],
    detailedActivity: [],
    period: '30d'
  });
  const [stats, setStats] = useState({
    totalCreators: 0,
    activeCreators: 0,
    totalReferrals: 0,
    totalEarnings: 0,
    pendingEarnings: 0,
    conversionRate: 0
  });

  const fetchData = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const [resA, resS] = await Promise.all([
        axios.get(`${api.Url}/admin/referral-analytics?period=30d`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${api.Url}/admin/referral-stats`, { headers: { Authorization: `Bearer ${token}` } })
      ]);

      setData(resA.data.analytics || {});
      const s = resS.data.stats || {};
      setStats({
        totalCreators: s.summary?.totalCreators || 0,
        activeCreators: s.summary?.activeCreators || 0,
        totalReferrals: s.summary?.totalReferrals || 0,
        totalEarnings: s.summary?.totalEarnings || 0,
        pendingEarnings: s.summary?.pendingEarnings || 0,
        conversionRate: s.summary?.totalReferrals > 0 ? ((s.summary?.totalEarnings / s.summary?.totalReferrals) * 10).toFixed(1) : 0
      });
      setLoading(false);
    } catch (error) {
      console.error("Error fetching analytics:", error);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const trendData = useMemo(() => {
    return data.referralTrend?.map(item => ({
      name: new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: item.count
    })) || [];
  }, [data.referralTrend]);

  if (loading) {
    return (
      <div className="loader-container">
        <style>{styles}</style>
        <span className="loader"></span>
        <p style={{ color: '#ff69b4', marginTop: '20px', fontWeight: '600' }}>Loading Data Engine...</p>
      </div>
    );
  }

  return (
    <div className="analytics-root">
      <style>{styles}</style>
      
      <div className="analytics-header">
        <div className="analytics-title-area">
          <h1>Referral Intelligence</h1>
          <p className="analytics-subtitle">Track end-to-end partner performance & conversion rates</p>
        </div>
        <div className="analytics-actions">
          <button className="analytics-btn" onClick={fetchData}>
            <FaSync /> Sync Data
          </button>
          <button className="analytics-btn primary">
            Export Report
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="analytics-card">
          <div className="stat-icon"><FaUserPlus /></div>
          <div className="stat-label">Total Referrals</div>
          <div className="stat-value">{stats.totalReferrals}</div>
          <div className="stat-trend up"><FaArrowUp /> 12% vs last month</div>
        </div>
        <div className="analytics-card">
          <div className="stat-icon"><FaMoneyBillWave /></div>
          <div className="stat-label">Total Commissions</div>
          <div className="stat-value">₹{stats.totalEarnings.toLocaleString()}</div>
          <div className="stat-trend up"><FaArrowUp /> 8.4% growth</div>
        </div>
        <div className="analytics-card">
          <div className="stat-icon"><FaPercentage /></div>
          <div className="stat-label">Conversion Rate</div>
          <div className="stat-value">{stats.conversionRate}%</div>
          <div className="stat-trend down"><FaArrowDown /> 0.5% decrease</div>
        </div>
        <div className="analytics-card">
          <div className="stat-icon"><FaUsers /></div>
          <div className="stat-label">Active Creators</div>
          <div className="stat-value">{stats.activeCreators}</div>
          <div className="stat-trend up"><FaUserCheck /> {stats.totalCreators} total registered</div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="analytics-card">
          <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaChartLine style={{ color: '#ff69b4' }} /> Referral Growth Trend
          </h3>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1a1a1a" vertical={false} />
              <XAxis dataKey="name" stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{ background: '#000', border: '1px solid #333', borderRadius: '12px' }}
                itemStyle={{ color: '#ff69b4' }}
              />
              <Area type="monotone" dataKey="value" stroke="#ff69b4" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="analytics-card">
          <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <FaExternalLinkAlt style={{ color: '#ff69b4' }} /> Partner Performance
          </h3>
          <div className="table-container">
            <table className="analytics-table" style={{ borderSpacing: '0 5px' }}>
              <thead>
                <tr>
                  <th>Partner</th>
                  <th style={{ textAlign: 'right' }}>Refs</th>
                  <th style={{ textAlign: 'right' }}>Earnings</th>
                </tr>
              </thead>
              <tbody>
                {data.creatorPerformance?.slice(0, 5).map((creator, i) => (
                  <tr key={i}>
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: '600' }}>{creator.name}</div>
                      <div style={{ fontSize: '11px', color: '#666' }}>@{creator.username}</div>
                    </td>
                    <td style={{ textAlign: 'right', padding: '12px', fontWeight: '700' }}>{creator.referralCount}</td>
                    <td style={{ textAlign: 'right', padding: '12px', color: '#ff69b4', fontWeight: '700' }}>₹{creator.totalEarnings}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="analytics-card">
        <h3 style={{ marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <FaCommentDots style={{ color: '#ff69b4' }} /> End-to-End User Activity Tracking
        </h3>
        <p style={{ color: '#666', fontSize: '14px', marginBottom: '20px' }}>Real-time activity of users acquired through referral partners.</p>
        
        <div className="table-container">
          <table className="analytics-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Partner Source</th>
                <th>Type</th>
                <th>Joined</th>
                <th style={{ textAlign: 'center' }}>Activity Today</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.detailedActivity?.map((user, i) => (
                <tr key={i}>
                  <td>
                    <div style={{ fontWeight: '600' }}>{user.name}</div>
                    <div style={{ fontSize: '12px', color: '#888' }}>{user.email}</div>
                  </td>
                  <td>
                    <div style={{ color: '#ff69b4', fontWeight: '600' }}>{user.referredBy?.name || 'Unknown'}</div>
                    <div style={{ fontSize: '11px', color: '#666' }}>@{user.referredBy?.username}</div>
                  </td>
                  <td>
                    <span className={`badge ${user.user_type}`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td>{new Date(user.joinedAt).toLocaleDateString()}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '16px', fontWeight: '700' }}>{user.messagesUsedToday}</div>
                    <div style={{ fontSize: '10px', color: '#666', textTransform: 'uppercase' }}>Messages Sent</div>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ color: user.messagesUsedToday > 0 ? '#00ff88' : '#666' }}>
                      ● {user.messagesUsedToday > 0 ? 'Active' : 'Idle'}
                    </div>
                    <div style={{ fontSize: '11px', color: '#666' }}>
                      Quota: {user.messageQuota - user.messagesUsedToday} left
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
