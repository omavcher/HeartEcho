'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import "./AdminDashboard.css";
import axios from "axios";
import {
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  FaUsers,
  FaMoneyBillWave,
  FaEnvelope,
  FaUserCheck,
  FaChartLine,
} from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import api from "../../config/api";
import PopNoti from "../../components/PopNoti";

const AdminDashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [timePeriod, setTimePeriod] = useState("month");
  const [statsData, setStatsData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalRevenue: 0,
    messagesSent: 0,
  });
  const [graphData, setGraphData] = useState({
    revenueTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') return localStorage.getItem("token") || "";
    return "";
  }, []);

  const safeCalculatePercentage = useCallback((numerator, denominator) => {
    if (denominator <= 0) return 0;
    return (numerator / denominator) * 100;
  }, []);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      const response = await axios.post(
        `${api.Url}/admin/dashboard-data`,
        { timePeriod },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000
        }
      );

      const data = response.data;

      setStatsData({
        totalUsers: data.usersData || 0,
        activeUsers: data.activeUsers || 0,
        totalRevenue: data.paymentsData || 0,
        messagesSent: data.messageQuotaData || 0,
      });

      const revenueTrendMapped = data.revenueTrend?.map(item => ({
        date: item._id ? new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        revenue: item.revenue || 0
      })) || [];

      setGraphData({ revenueTrend: revenueTrendMapped });

      setNotification({
        show: true,
        message: "Stats Synchronized",
        type: "success",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  }, [timePeriod, getToken]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refresh]);

  if (loading) return <div className="dash-loading-d7h33d"><span></span><p>Loading Intel...</p></div>;

  return (
    <div className="dash-container-d7h33d">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification(p => ({ ...p, show: false }))}
      />

      <div className="dash-header-d7h33d">
        <div className="dash-header-content-d7h33d">
          <h2 className="dash-title-d7h33d">Command Center</h2>
          <p className="dash-subtitle-d7h33d">System Performance</p>
        </div>
        <div className="dash-header-actions-d7h33d">
          <select 
            className="dash-time-period-select-d7h33d" 
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="day">24h</option>
            <option value="week">7d</option>
            <option value="month">30d</option>
          </select>
          <button className="dash-refresh-button-d7h33d" onClick={() => setRefresh(!refresh)}>
            <IoMdRefresh />
          </button>
        </div>
      </div>

      <div className="dash-stats-grid-d7h33d">
        <div className="dash-stat-card-d7h33d">
          <div className="stat-card-header-d7h33d">
            <div className="stat-icon-wrapper-d7h33d users-d7h33d"><FaUsers /></div>
            <div className="stat-trend-d7h33d positive-d7h33d">Live</div>
          </div>
          <div className="stat-card-content-d7h33d">
            <h3>Registry</h3>
            <p className="stat-value-d7h33d">{statsData.totalUsers}</p>
          </div>
        </div>

        <div className="dash-stat-card-d7h33d">
          <div className="stat-card-header-d7h33d">
            <div className="stat-icon-wrapper-d7h33d active-users-d7h33d"><FaUserCheck /></div>
            <div className="stat-trend-d7h33d positive-d7h33d">
              {safeCalculatePercentage(statsData.activeUsers, statsData.totalUsers).toFixed(0)}%
            </div>
          </div>
          <div className="stat-card-content-d7h33d">
            <h3>Active</h3>
            <p className="stat-value-d7h33d">{statsData.activeUsers}</p>
          </div>
        </div>

        <div className="dash-stat-card-d7h33d">
          <div className="stat-card-header-d7h33d">
            <div className="stat-icon-wrapper-d7h33d messages-d7h33d"><FaEnvelope /></div>
          </div>
          <div className="stat-card-content-d7h33d">
            <h3>Messages</h3>
            <p className="stat-value-d7h33d">{statsData.messagesSent}</p>
          </div>
        </div>

        <div className="dash-stat-card-d7h33d">
          <div className="stat-card-header-d7h33d">
            <div className="stat-icon-wrapper-d7h33d revenue-d7h33d"><FaMoneyBillWave /></div>
          </div>
          <div className="stat-card-content-d7h33d">
            <h3>Revenue</h3>
            <p className="stat-value-d7h33d">₹{statsData.totalRevenue}</p>
          </div>
        </div>
      </div>

      <div className="dash-charts-grid-d7h33d">
        <div className="dash-chart-card-d7h33d">
          <div className="chart-header-d7h33d">
            <FaChartLine className="chart-icon-d7h33d" />
            <h3>Revenue Trajectory</h3>
          </div>
          <div className="chart-wrapper-d7h33d">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={graphData.revenueTrend}>
                <defs>
                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                <XAxis dataKey="date" stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis stroke="#888" fontSize={10} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333', fontSize: '12px' }} />
                <Area type="monotone" dataKey="revenue" stroke="#0071e3" fill="url(#revenueGradient)" strokeWidth={2} />
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;