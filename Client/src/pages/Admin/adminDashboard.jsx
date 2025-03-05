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
} from "recharts";
import {
  FaUsers,
  FaMoneyBillWave,
  FaEnvelope,
  FaUserCheck,
  FaBell,
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
            <option value="day">Day</option>
            <option value="week">Week</option>
            <option value="month">Month</option>
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
          </div>
        </div>
        <div className="dash-stat-card">
          <FaUserCheck className="dash-icon active-users" />
          <div className="dash-stat-content">
            <h3>Active Users</h3>
            <p>{statsData.activeUsers}</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaEnvelope className="dash-icon messages" />
          <div className="dash-stat-content">
            <h3>Messages Sent</h3>
            <p>{statsData.messagesSent}</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaMoneyBillWave className="dash-icon revenue" />
          <div className="dash-stat-content">
            <h3>Total Revenue</h3>
            <p>₹{statsData.totalRevenue}</p>
          </div>
        </div>
      </div>

      <div className="dash-charts-grid">
        <div className="dash-chart-card">
          <h3>Users Breakdown</h3>
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
              <Tooltip contentStyle={{ background: "#2d2d2d", border: "none", color: "#e0e0e0" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>Payments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.paymentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip contentStyle={{ background: "#2d2d2d", border: "none", color: "#e0e0e0" }} />
              <Legend wrapperStyle={{ color: "#e0e0e0" }} />
              <Bar dataKey="value" fill="#cf4185" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>Message Quota Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={graphData.messageQuotaData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                startAngle={90}
                endAngle={-270}
              >
                {graphData.messageQuotaData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: "#2d2d2d", border: "none", color: "#e0e0e0" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={graphData.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip contentStyle={{ background: "#2d2d2d", border: "none", color: "#e0e0e0" }} />
              <Legend wrapperStyle={{ color: "#e0e0e0" }} />
              <Line type="monotone" dataKey="revenue" stroke="#ffcc00" strokeWidth={3} dot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>User Engagement</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={graphData.userEngagement}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="name" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip contentStyle={{ background: "#2d2d2d", border: "none", color: "#e0e0e0" }} />
              <Legend wrapperStyle={{ color: "#e0e0e0" }} />
              <Bar dataKey="messages" fill="#4a90e2" barSize={20} />
              <Bar dataKey="payments" fill="#00c49f" barSize={20} />
              <Bar dataKey="logins" fill="#ffcc00" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;