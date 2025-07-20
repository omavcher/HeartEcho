'use client';

import { useState, useEffect, useCallback } from "react";
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

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  const safeCalculatePercentage = (numerator, denominator) => {
    if (denominator <= 0) return 0;
    return (numerator / denominator) * 100;
  };

  const safeCalculateAverage = (total, count) => {
    if (count <= 0) return 0;
    return total / count;
  };

  const processDashboardData = (data) => {
    // Total users should come from userEngagement array length
    const totalUsers = data.userEngagement?.length || 0;
    
    // Active users from the API response
    const activeUsers = data.activeUsers || 0;
    
    // Calculate total revenue from payments
    const totalRevenue = data.payments?.reduce((sum, payment) => sum + (payment.rupees || 0), 0) || 0;
    
    // Calculate total messages from messageQuota
    const totalMessages = data.messageQuota?.reduce((sum, quota) => sum + (quota.count || 0), 0) || 0;

    return {
      totalUsers,
      activeUsers,
      totalRevenue,
      messagesSent: totalMessages,
    };
  };

  const processGraphData = (data) => {
    // Format role breakdown data
    const subscribersCount = data.userEngagement?.filter(u => u.totalPayments > 0).length || 0;
    const freeUsersCount = (data.userEngagement?.length || 0) - subscribersCount;
    const roleBreakdown = [
      { name: "Subscribers", value: subscribersCount },
      { name: "Free Users", value: freeUsersCount }
    ];

    // Format payments data for chart
    const paymentsData = data.payments?.map(payment => ({
      name: `Payment ${payment._id?.slice(-4) || ''}`,
      value: payment.rupees || 0,
      date: payment.date ? new Date(payment.date).toLocaleDateString() : 'Unknown date'
    })) || [];

    // Format message quota data
    const messageQuotaData = data.messageQuota
      ?.sort((a, b) => (b.count || 0) - (a.count || 0))
      .slice(0, 10)
      .map(quota => ({
        name: quota._id?.slice(-6) || '',
        value: quota.count || 0,
        user: quota.user?.name || "Unknown"
      })) || [];

    // Format revenue trend
    const revenueTrend = data.revenueTrend?.map(item => ({
      date: item._id ? new Date(item._id).toLocaleDateString() : 'Unknown date',
      revenue: item.totalRevenue || 0
    })) || [];

    // Format user engagement
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
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();

      const response = await axios.post(
        `${api.Url}/admin/dashboard-data`,
        { timePeriod },
        { headers: { Authorization: `Bearer ${token}` } }
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
      setError(err.message);
      setNotification({
        show: true,
        message: "Failed to load dashboard data",
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [timePeriod, refresh]);

  useEffect(() => {
    fetchDashboardData();

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const colors = ["#cf4185", "#00c49f", "#4a90e2", "#ffcc00", "#ff4b5c", "#6ab0ff"];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-item-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const handleRefresh = () => {
    setRefresh(prev => !prev);
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
  };

  const handleNotificationClose = () => {
    setNotification(prev => ({ ...prev, show: false }));
  };

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
        <p>Error: {error}</p>
        <button 
          className="dash-retry-button" 
          onClick={fetchDashboardData}
        >
          Retry
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
        <h2 className="dash-title">Admin Dashboard</h2>
        <div className="dash-header-actions">
          <button 
            className="dash-refresh-button" 
            onClick={handleRefresh}
            disabled={loading}
          >
            <IoMdRefresh /> Refresh Data
          </button>
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
        </div>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <FaUsers className="dash-icon users" />
          <div className="dash-stat-content">
            <h3>Total Users</h3>
            <p>{statsData.totalUsers}</p>
            <small>Active: {statsData.activeUsers}</small>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaUserCheck className="dash-icon active-users" />
          <div className="dash-stat-content">
            <h3>Active Users</h3>
            <p>{statsData.activeUsers}</p>
            <small>
              {safeCalculatePercentage(statsData.activeUsers, statsData.totalUsers).toFixed(1)}% of total
            </small>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaEnvelope className="dash-icon messages" />
          <div className="dash-stat-content">
            <h3>Messages Sent</h3>
            <p>{statsData.messagesSent}</p>
            <small>
              Avg: {safeCalculateAverage(statsData.messagesSent, statsData.activeUsers).toFixed(1)} per user
            </small>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaMoneyBillWave className="dash-icon revenue" />
          <div className="dash-stat-content">
            <h3>Total Revenue</h3>
            <p>₹{statsData.totalRevenue.toLocaleString()}</p>
            <small>
              Avg: ₹{safeCalculateAverage(statsData.totalRevenue, statsData.totalUsers).toFixed(2)} per user
            </small>
          </div>
        </div>
      </div>

      <div className="dash-charts-grid">
        <div className="dash-chart-card">
          <h3><FaChartPie /> User Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={graphData.roleBreakdown}
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={60}
                paddingAngle={5}
                dataKey="value"
                label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {graphData.roleBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3><FaChartLine /> Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={graphData.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: '#666' }}
              />
              <YAxis 
                tick={{ fill: '#666' }}
                tickFormatter={(value) => `₹${value}`}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => [`₹${value}`, "Revenue"]}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#4a90e2"
                fill="#4a90e2"
                fillOpacity={0.2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3><FaChartBar /> User Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.userEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: '#666' }}
              />
              <YAxis 
                tick={{ fill: '#666' }}
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
                fill="#8884d8" 
                name="Payments" 
                radius={[4, 4, 0, 0]}
              />
              <Bar 
                dataKey="logins" 
                fill="#ffcc00" 
                name="Logins" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3><FaRobot /> Top AI Friends</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart 
              data={graphData.messageQuotaData}
              layout="vertical"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" />
              <XAxis 
                type="number" 
                tick={{ fill: '#666' }}
              />
              <YAxis 
                dataKey="name" 
                type="category" 
                width={80}
                tick={{ fill: '#666' }}
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
                fill="#ff4b5c" 
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