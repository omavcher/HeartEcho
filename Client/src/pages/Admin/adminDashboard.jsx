import React, { useState, useEffect, useCallback } from "react";
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
  LineChart,
  Line,
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
  FaTicketAlt,
} from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import api from "../../config/api";
import PopNoti from "../../components/PopNoti";

const AdminDashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [timePeriod, setTimePeriod] = useState("month");
  const [notifications, setNotifications] = useState([]);
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
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const token = localStorage.getItem("token") || "";

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip" style={{
          backgroundColor: 'rgba(30, 30, 30, 0.9)',
          padding: '10px',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '8px'
        }}>
          <p style={{ margin: '0 0 5px 0', color: '#e0e0e0' }}>{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ margin: '0', color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Fetch stats data
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.post(
        `${api.Url}/admin/dashboard-data`,
        { timePeriod },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const { usersData, activeUsers, paymentsData, messageQuotaData } = response.data;

      setStatsData({
        totalUsers: usersData || 0,
        activeUsers: activeUsers || 0,
        totalRevenue: paymentsData || 0,
        messagesSent: messageQuotaData || 0,
      });

      setNotification({
        show: true,
        message: "Stats data updated successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Stats fetch error:", err.message);
      setError(err.message);
      setNotification({
        show: true,
        message: err.message,
        type: "error",
      });
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [timePeriod, refresh, token]);

  // Fetch graphs data
  const fetchGraphsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await axios.get(
        `${api.Url}/admin/users-breakdown`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 10000,
        }
      );

      const { roleBreakdown, payments, messageQuota, revenueTrend, userEngagement } = response.data;

      setGraphData({
        roleBreakdown: roleBreakdown.map(item => ({
          name: item._id || "Users",
          value: item.count
        })),
        paymentsData: payments.map((item, index) => ({
          name: `Payment ${index + 1}`,
          value: item.rupees,
          date: new Date(item.date).toLocaleTimeString()
        })),
        messageQuotaData: messageQuota.map(item => ({
          name: item._id.slice(-6),
          value: item.count
        })),
        revenueTrend: revenueTrend.map(item => ({
          date: item._id,
          revenue: item.totalRevenue
        })),
        userEngagement: userEngagement.map(item => ({
          name: item.name,
          messages: item.totalMessages,
          payments: item.totalPayments,
          logins: item.totalLogins
        }))
      });

      setNotifications([]); // Add notification logic if needed
      setNotification({
        show: true,
        message: "Graph data updated successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Graphs fetch error:", err.message);
      setError(err.message);
      setNotification({
        show: true,
        message: err.message,
        type: "error",
      });
      if (retryCount < maxRetries) {
        setRetryCount((prev) => prev + 1);
      }
    } finally {
      setLoading(false);
    }
  }, [timePeriod, refresh, token]);

  useEffect(() => {
    fetchDashboardData();
    fetchGraphsData();

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchGraphsData();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData, fetchGraphsData]);

  const colors = ["#cf4185", "#00c49f", "#4a90e2", "#ffcc00", "#ff4b5c", "#6ab0ff"];

  const handleRefresh = () => {
    setRefresh((prev) => !prev);
    setRetryCount(0);
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
    setRetryCount(0);
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, show: false });
  };

  if (loading && retryCount === 0) return <div className="dash-loading">Loading...</div>;
  if (error && retryCount >= maxRetries) return (
    <div className="dash-error">
      <p>Error: {error}</p>
      <button className="dash-retry-button" onClick={() => { fetchDashboardData(); fetchGraphsData(); }}>
        Retry
      </button>
    </div>
  );

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
          <button className="dash-refresh-button" onClick={handleRefresh}>
            <IoMdRefresh /> Refresh Data
          </button>
          <select className="dash-time-period-select" value={timePeriod} onChange={handleTimePeriodChange}>
            <option value="day">Last 24 Hours</option>
            <option value="week">Last 7 Days</option>
            <option value="month">Last 30 Days</option>
          </select>
          <button className="dash-notifications-button">
            <FaBell />
            <span className="dash-notification-count">{notifications.length}</span>
          </button>
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
            <small>{((statsData.activeUsers / statsData.totalUsers) * 100).toFixed(1)}% of total</small>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaEnvelope className="dash-icon messages" />
          <div className="dash-stat-content">
            <h3>Messages Sent</h3>
            <p>{statsData.messagesSent}</p>
            <small>Avg: {(statsData.messagesSent / statsData.activeUsers).toFixed(1)} per user</small>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaMoneyBillWave className="dash-icon revenue" />
          <div className="dash-stat-content">
            <h3>Total Revenue</h3>
            <p>₹{statsData.totalRevenue}</p>
            <small>Avg: ₹{(statsData.totalRevenue / statsData.totalUsers).toFixed(2)} per user</small>
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
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                startAngle={90}
                endAngle={-270}
              >
                {graphData.roleBreakdown.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3><FaChartLine /> Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={graphData.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#cf4185"
                fill="#cf4185"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3><FaChartBar /> User Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.userEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ color: '#e0e0e0' }} />
              <Bar dataKey="messages" fill="#4a90e2" name="Messages" />
              <Bar dataKey="payments" fill="#00c49f" name="Payments" />
              <Bar dataKey="logins" fill="#ffcc00" name="Logins" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3><FaRobot /> AI Friend Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.messageQuotaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#ff4b5c" name="Messages" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {loading && <div className="dash-loading">Loading dashboard data...</div>}
      {error && retryCount >= maxRetries && (
        <div className="dash-error">
          <p>Error: {error}</p>
          <button className="dash-retry-button" onClick={() => { fetchDashboardData(); fetchGraphsData(); }}>
            Retry
          </button>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;