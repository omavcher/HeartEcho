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
  FaChartLine,
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
    revenueTrend: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "error",
  });

  const colors = useMemo(() => [
    "#0071e3", "#7b61ff", "#00c49f", "#ff9500", "#ff3b30"
  ], []);

  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
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

      // Mapping the specific flat API response to state
      setStatsData({
        totalUsers: data.usersData || 0,
        activeUsers: data.activeUsers || 0,
        totalRevenue: data.paymentsData || 0,
        messagesSent: data.messageQuotaData || 0,
      });

      // Mapping revenue trend array
      const revenueTrendMapped = data.revenueTrend?.map(item => ({
        date: item._id ? new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        revenue: item.revenue || 0
      })) || [];

      setGraphData({
        revenueTrend: revenueTrendMapped
      });

      setNotification({
        show: true,
        message: "Intelligence updated",
        type: "success",
      });
    } catch (err) {
      console.error("Dashboard Error:", err);
      setError(err.response?.data?.message || "Connection failed");
    } finally {
      setLoading(false);
    }
  }, [timePeriod, getToken]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, refresh]);

  const handleNotificationClose = () => setNotification(prev => ({ ...prev, show: false }));

  if (loading) {
    return (
      <div className="dash-loading-d7h33d">
        <div className="loading-spinner-d7h33d"></div>
        <p>Syncing Command Center...</p>
      </div>
    );
  }

  return (
    <div className="dash-container-d7h33d">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={handleNotificationClose}
      />

      <div className="dash-header-d7h33d">
        <div className="dash-header-content-d7h33d">
          <h2 className="dash-title-d7h33d">Command Center</h2>
          <p className="dash-subtitle-d7h33d">Operational overview for Om Avcher</p>
        </div>
        <div className="dash-header-actions-d7h33d">
          <select 
            className="dash-time-period-select-d7h33d" 
            value={timePeriod} 
            onChange={(e) => setTimePeriod(e.target.value)}
          >
            <option value="day">24h</option>
            <option value="week">7 Days</option>
            <option value="month">30 Days</option>
          </select>
          <button 
            className="dash-refresh-button-d7h33d" 
            onClick={() => setRefresh(!refresh)}
          >
            <IoMdRefresh /> Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="dash-stats-grid-d7h33d">
        <div className="dash-stat-card-d7h33d">
          <div className="stat-card-header-d7h33d">
            <div className="stat-icon-wrapper-d7h33d users-d7h33d"><FaUsers /></div>
            <div className="stat-trend-d7h33d positive-d7h33d">Live</div>
          </div>
          <div className="stat-card-content-d7h33d">
            <h3>Total Registry</h3>
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
            <h3>Active Sessions</h3>
            <p className="stat-value-d7h33d">{statsData.activeUsers}</p>
          </div>
        </div>

        <div className="dash-stat-card-d7h33d">
          <div className="stat-card-header-d7h33d">
            <div className="stat-icon-wrapper-d7h33d messages-d7h33d"><FaEnvelope /></div>
          </div>
          <div className="stat-card-content-d7h33d">
            <h3>Total Message Send</h3>
            <p className="stat-value-d7h33d">{statsData.messagesSent}</p>
          </div>
        </div>

        <div className="dash-stat-card-d7h33d">
          <div className="stat-card-header-d7h33d">
            <div className="stat-icon-wrapper-d7h33d revenue-d7h33d"><FaMoneyBillWave /></div>
          </div>
          <div className="stat-card-content-d7h33d">
            <h3>Net Revenue</h3>
            <p className="stat-value-d7h33d">₹{statsData.totalRevenue}</p>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="dash-charts-grid-d7h33d">
        <div className="dash-chart-card-d7h33d full-width-d7h33d">
          <div className="chart-header-d7h33d">
            <FaChartLine className="chart-icon-d7h33d" />
            <h3>Financial Trajectory</h3>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={graphData.revenueTrend}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0071e3" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0071e3" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
              <XAxis dataKey="date" stroke="#888" fontSize={12} />
              <YAxis stroke="#888" fontSize={12} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #333' }}
                itemStyle={{ color: '#0071e3' }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#0071e3" fill="url(#revenueGradient)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;