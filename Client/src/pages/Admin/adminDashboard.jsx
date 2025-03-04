import React, { useState, useEffect, useCallback } from "react";
import "./AdminDashboard.css"; // Import local CSS
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
  FaChartLine,
  FaBell,
} from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import api from "../../config/api"; // Assuming this is your API config file
import PopNoti from "../../components/PopNoti";

const AdminDashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [timePeriod, setTimePeriod] = useState("month"); // Filter for time period
  const [notifications, setNotifications] = useState([]);
  const [data, setData] = useState({
    usersData: [],
    paymentsData: [],
    messageQuotaData: [],
    activeUsers: [],
    revenueTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error", // Can be "error", "success", "warning"
  });
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  const token = localStorage.getItem("token") || ""; // Assuming token is stored in localStorage

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
  
      const response = await axios.post(`${api.Url}/admin/dashboard-data`, { timePeriod }, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000,
      });
  
      console.log("API Raw Response:", JSON.stringify(response.data, null, 2));
  
      const {
        usersData,
        paymentsData,
        messageQuotaData,
        activeUsers,
        revenueTrend,
        notifications: backendNotifications,
      } = response.data;
  
      // Convert numbers to arrays
      setData({
        usersData: Array.isArray(usersData) ? usersData : [{ value: usersData || 0 }],
        paymentsData: Array.isArray(paymentsData) ? paymentsData : [{ value: paymentsData || 0 }],
        messageQuotaData: Array.isArray(messageQuotaData) ? messageQuotaData : [{ value: messageQuotaData || 0 }],
        activeUsers: Array.isArray(activeUsers) ? activeUsers : [{ users: activeUsers || 0 }],
        revenueTrend: Array.isArray(revenueTrend) ? revenueTrend : [],
      });
  
      setNotifications(Array.isArray(backendNotifications) ? backendNotifications : []);
  
      setNotification({
        show: true,
        message: "Dashboard data updated successfully!",
        type: "success",
      });
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError(err.message);
      setNotification({
        show: true,
        message: err.message,
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  }, [timePeriod, refresh, token]);
  

  useEffect(() => {
    fetchDashboardData();

    // Real-time updates (optional, can be adjusted or removed based on backend support)
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000); // Refresh data every 30 seconds

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const colors = ["#cf4185", "#00c49f", "#4a90e2", "#ffcc00", "#ff4b5c", "#6ab0ff"];

  const handleRefresh = () => {
    setRefresh((prev) => !prev);
    setRetryCount(0); // Reset retry count on manual refresh
  };

  const handleTimePeriodChange = (e) => {
    setTimePeriod(e.target.value);
    setRetryCount(0); // Reset retry count on time period change
  };

  const handleNotificationClose = () => {
    setNotification({ ...notification, show: false });
  };

  if (loading && retryCount === 0) {
    return <div className="dash-loading">Loading...</div>;
  }

  if (error && retryCount >= maxRetries) {
    return (
      <div className="dash-error">
        <p>Error: {error}</p>
        <button className="dash-retry-button" onClick={fetchDashboardData}>
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
          <button className="dash-refresh-button" onClick={handleRefresh}>
            <IoMdRefresh /> Refresh Data
          </button>
          <select
            className="dash-time-period-select"
            value={timePeriod}
            onChange={handleTimePeriodChange}
          >
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

      {/* Notifications Panel */}
      <div className="dash-notifications-panel">
        <h3>Notifications</h3>
        <ul className="dash-notifications-list">
          {notifications.map((notif) => (
            <li key={notif.id} className="dash-notification-item">
              {notif.message} <span className="dash-notification-time">{notif.time}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="dash-stats-grid">
        <div className="dash-stat-card">
          <FaUsers className="dash-icon users" />
          <div className="dash-stat-content">
            <h3>Total Users</h3>
            <p>{data.usersData.reduce((sum, item) => sum + (item.value || 0), 0)}</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaUserCheck className="dash-icon active-users" />
          <div className="dash-stat-content">
            <h3>Active Users</h3>
            <p>{data.activeUsers.reduce((sum, item) => sum + (item.users || 0), 0) / 7 || 0}</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaEnvelope className="dash-icon messages" />
          <div className="dash-stat-content">
            <h3>Messages Sent</h3>
            <p>{data.messageQuotaData[0]?.value || 0}</p>
          </div>
        </div>
        <div className="dash-stat-card">
          <FaMoneyBillWave className="dash-icon revenue" />
          <div className="dash-stat-content">
            <h3>Total Revenue</h3>
            <p>₹{data.revenueTrend.reduce((sum, item) => sum + (item.revenue || 0), 0)}</p>
          </div>
        </div>
      </div>

      <div className="dash-charts-grid">
        <div className="dash-chart-card">
          <h3>Users Breakdown</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.usersData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  data.usersData.length > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : "No Data"
                }
                startAngle={90}
                endAngle={-270}
              >
                {data.usersData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value || "N/A"}`}
                contentStyle={{
                  background: "#2d2d2d",
                  border: "none",
                  color: "#e0e0e0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>Monthly Payments</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.paymentsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip
                contentStyle={{
                  background: "#2d2d2d",
                  border: "none",
                  color: "#e0e0e0",
                }}
              />
              <Legend wrapperStyle={{ color: "#e0e0e0" }} />
              <Bar dataKey="payments" fill="#cf4185" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>Message Quota Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data.messageQuotaData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) =>
                  data.messageQuotaData.length > 0 ? `${name} (${(percent * 100).toFixed(0)}%)` : "No Data"
                }
                startAngle={90}
                endAngle={-270}
              >
                {data.messageQuotaData.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={colors[index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => `${value || "N/A"}`}
                contentStyle={{
                  background: "#2d2d2d",
                  border: "none",
                  color: "#e0e0e0",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>Active Users Per Day</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.activeUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip
                contentStyle={{
                  background: "#2d2d2d",
                  border: "none",
                  color: "#e0e0e0",
                }}
              />
              <Legend wrapperStyle={{ color: "#e0e0e0" }} />
              <Bar dataKey="users" fill="#00c49f" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>Revenue Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data.revenueTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="month" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip
                contentStyle={{
                  background: "#2d2d2d",
                  border: "none",
                  color: "#e0e0e0",
                }}
              />
              <Legend wrapperStyle={{ color: "#e0e0e0" }} />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#ffcc00"
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dash-chart-card">
          <h3>User Engagement (Area Chart)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data.activeUsers}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="day" stroke="#e0e0e0" />
              <YAxis stroke="#e0e0e0" />
              <Tooltip
                contentStyle={{
                  background: "#2d2d2d",
                  border: "none",
                  color: "#e0e0e0",
                }}
              />
              <Legend wrapperStyle={{ color: "#e0e0e0" }} />
              <Area
                type="monotone"
                dataKey="users"
                stroke="#4a90e2"
                fill="#4a90e2"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;