'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import "./AdminDashboard.css";
import axios from "axios";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  FaUsers,
  FaMoneyBillWave,
  FaEnvelope,
  FaUserCheck,
  FaBell,
  FaChartLine,
  FaChartPie,
  FaChartBar,
  FaRobot,
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
    roleBreakdown: [],
    paymentsData: [],
    messageQuotaData: [],
    revenueTrend: [],
    userEngagement: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });

  // Memoized colors for charts
  const colors = useMemo(() => [
    "#0071e3", "#7b61ff", "#00c49f", "#ff9500", "#ff3b30", "#5856d6",
    "#af52de", "#ff2d55", "#32d74b", "#ffcc00"
  ], []);

  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
    return "";
  }, []);

  // Utility functions
  const safeCalculatePercentage = useCallback((numerator, denominator) => {
    if (denominator <= 0) return 0;
    return (numerator / denominator) * 100;
  }, []);

  const safeCalculateAverage = useCallback((total, count) => {
    if (count <= 0) return 0;
    return total / count;
  }, []);

  // Data processing
  const processDashboardData = useCallback((data) => {
    const totalUsers = data.userEngagement?.length || 0;
    const activeUsers = data.activeUsers || 0;
    const totalRevenue = data.payments?.reduce((sum, payment) => sum + (payment.rupees || 0), 0) || 0;
    const totalMessages = data.messageQuota?.reduce((sum, quota) => sum + (quota.count || 0), 0) || 0;

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      messagesSent: totalMessages,
    };
  }, []);

  const processGraphData = useCallback((data) => {
    const subscribersCount = data.userEngagement?.filter(u => u.totalPayments > 0).length || 0;
    const freeUsersCount = (data.userEngagement?.length || 0) - subscribersCount;
    
    const roleBreakdown = [
      { name: "Subscribers", value: subscribersCount },
      { name: "Free Users", value: freeUsersCount }
    ];

    const paymentsData = data.payments?.map(payment => ({
      name: `Payment ${payment._id?.slice(-4) || ''}`,
      value: payment.rupees || 0,
      date: payment.date ? new Date(payment.date).toLocaleDateString() : 'Unknown date'
    })) || [];

    const messageQuotaData = data.messageQuota
      ?.sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10)
      .map(quota => ({
        name: quota._id?.slice(-6) || '',
        value: quota.count || 0,
        user: quota.user?.name || "Unknown"
      })) || [];

    const revenueTrend = data.revenueTrend?.map(item => ({
      date: item._id ? new Date(item._id).toLocaleDateString() : 'Unknown date',
      revenue: item.totalRevenue || 0
    })) || [];

    const userEngagement = data.userEngagement?.map(user => ({
      name: user.name || 'Unknown',
      messages: user.totalMessages || 0,
      payments: user.totalPayments || 0,
      logins: user.totalLogins || 0
    })) || [];

    return {
      roleBreakdown,
      paymentsData,
      messageQuotaData,
      revenueTrend,
      userEngagement
    };
  }, []);

  // Data fetching
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

      const dashboardData = processDashboardData(response.data);
      const graphsData = processGraphData(response.data);

      setStatsData(dashboardData);
      setGraphData(graphsData);

      setNotification({
        show: true,
        message: "Dashboard data updated successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load dashboard data";
      setError(errorMessage);
      setNotification({
        show: true,
        message: errorMessage,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [timePeriod, getToken, processDashboardData, processGraphData]);

  // Effects
  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Event Handlers
  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

  // Loading and Error States
  if (loading) {
    return (
      <div className="dash-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dash-error">
        <div className="error-icon">⚠️</div>
        <h3>Unable to Load Dashboard</h3>
        <p>{error}</p>
        <button 
          className="dash-retry-button" 
          onClick={fetchDashboardData}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="dash-container">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={handleNotificationClose}
      />

      <div className="dash-header">
        <div className="dash-header-content">
          <h2 className="dash-title">Dashboard Overview</h2>
          <p className="dash-subtitle">Real-time analytics and insights</p>
        </div>
        <div className="dash-header-actions">
          <select 
            className="dash-time-period-select" 
            value={timePeriod} 
            onChange={handleTimePeriodChange}
            disabled={loading}
          >
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button 
            className={`dash-refresh-button ${loading ? 'loading' : ''}`} 
            onClick={handleRefresh}
            disabled={loading}
          >
            <IoMdRefresh className={loading ? 'spinning' : ''} /> 
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper users">
              <FaUsers className="stat-icon" />
            </div>
            <div className="stat-trend positive">+12%</div>
          </div>
          <div className="stat-card-content">
            <h3>Total Users</h3>
            <p className="stat-value">{statsData.totalUsers.toLocaleString()}</p>
            <div className="stat-meta">
              <span className="stat-change">
                {statsData.activeUsers} active users
              </span>
            </div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper active-users">
              <FaUserCheck className="stat-icon" />
            </div>
            <div className="stat-trend positive">+8%</div>
          </div>
          <div className="stat-card-content">
            <h3>Active Users</h3>
            <p className="stat-value">{statsData.activeUsers.toLocaleString()}</p>
            <div className="stat-meta">
              <span className="stat-change">
                {safeCalculatePercentage(statsData.activeUsers, statsData.totalUsers).toFixed(1)}% of total
              </span>
            </div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper messages">
              <FaEnvelope className="stat-icon" />
            </div>
            <div className="stat-trend positive">+23%</div>
          </div>
          <div className="stat-card-content">
            <h3>Messages Sent</h3>
            <p className="stat-value">{statsData.messagesSent.toLocaleString()}</p>
            <div className="stat-meta">
              <span className="stat-change">
                Avg: {safeCalculateAverage(statsData.messagesSent, statsData.activeUsers).toFixed(1)} per user
              </span>
            </div>
          </div>
        </div>

        <div className="dash-stat-card">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper revenue">
              <FaMoneyBillWave className="stat-icon" />
            </div>
            <div className="stat-trend positive">+15%</div>
          </div>
          <div className="stat-card-content">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹{statsData.totalRevenue.toLocaleString()}</p>
            <div className="stat-meta">
              <span className="stat-change">
                Avg: ₹{safeCalculateAverage(statsData.totalRevenue, statsData.totalUsers).toFixed(2)} per user
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="dash-charts-grid">
        <div className="dash-chart-card">
          <div className="chart-header">
            <FaChartPie className="chart-icon" />
            <h3>User Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={graphData.roleBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {graphData.roleBreakdown.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                    stroke="var(--card-bg)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <div className="chart-header">
            <FaChartLine className="chart-icon" />
            <h3>Revenue Trend</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={graphData.revenueTrend}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => [`₹${value}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#0071e3"
                fill="url(#revenueGradient)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card full-width">
          <div className="chart-header">
            <FaChartBar className="chart-icon" />
            <h3>User Engagement</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.userEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="messages" 
                fill="#00c49f" 
                name="Messages" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="payments" 
                fill="#7b61ff" 
                name="Payments" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="logins" 
                fill="#ff9500" 
                name="Logins" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card full-width">
          <div className="chart-header">
            <FaRobot className="chart-icon" />
            <h3>Top AI Friends</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={graphData.messageQuotaData}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis 
                type="number" 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80}
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value, name, props) => [
                  `${value} messages`,
                  props.payload.user ? `User: ${props.payload.user}` : ''
                ]}
              />
              <Bar 
                dataKey="value" 
                fill="#ff3b30" 
                name="Messages"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;