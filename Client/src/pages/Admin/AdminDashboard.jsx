'use client';
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from "recharts";
import {
  FaUsers, FaMoneyBillWave, FaEnvelope, FaUserCheck, FaChartLine
} from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import api from "../../config/api";
import PopNoti from "../../components/PopNoti";

// ------------------- CSS STYLES FOR DASHBOARD -------------------
const dashboardStyles = `
.dash-container-x30sn {
  color: #fff;
}
.dash-header-x30sn {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 20px;
  margin-bottom: 30px;
}
.dash-title-x30sn { font-size: 28px; font-weight: 700; color: #fff; margin: 0; }
.dash-subtitle-x30sn { color: #ff69b4; font-size: 14px; margin-top: 5px; }

.dash-actions-x30sn { display: flex; gap: 10px; }
.dash-select-x30sn {
  background: #111;
  color: #fff;
  border: 1px solid #333;
  padding: 8px 12px;
  border-radius: 8px;
  outline: none;
}
.dash-btn-x30sn {
  background: #ff69b4;
  color: #000;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
}
.dash-btn-x30sn:hover { opacity: 0.8; }

.dash-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card-x30sn {
  background: #111;
  border: 1px solid #333;
  padding: 24px;
  border-radius: 16px;
  position: relative;
  overflow: hidden;
}
.stat-card-x30sn::after {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 4px; height: 100%;
  background: #ff69b4;
}

.stat-header-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 15px;
}
.stat-icon-x30sn {
  width: 44px; height: 44px;
  border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  font-size: 20px;
  background: rgba(255, 105, 180, 0.1);
  color: #ff69b4;
}
.stat-label-x30sn { color: #888; font-size: 14px; font-weight: 500; }
.stat-value-x30sn { font-size: 32px; font-weight: 700; color: #fff; margin: 0; }

.chart-section-x30sn {
  background: #111;
  border: 1px solid #333;
  border-radius: 16px;
  padding: 24px;
}
.chart-head-x30sn {
  display: flex; align-items: center; gap: 10px; margin-bottom: 20px;
}
.chart-head-x30sn h3 { margin: 0; font-size: 18px; color: #fff; }
.chart-area-x30sn { height: 350px; width: 100%; }

/* Loading */
.loading-x30sn {
  height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.spinner-x30sn {
  width: 40px; height: 40px; border: 3px solid #333; border-top-color: #ff69b4;
  border-radius: 50%; animation: spin 1s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
`;

const AdminDashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [timePeriod, setTimePeriod] = useState("month");
  const [statsData, setStatsData] = useState({ totalUsers: 0, activeUsers: 0, totalRevenue: 0, messagesSent: 0 });
  const [graphData, setGraphData] = useState({ revenueTrend: [] });
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "error" });

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const safeCalculatePercentage = (numerator, denominator) => {
    if (denominator <= 0) return 0;
    return (numerator / denominator) * 100;
  };

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.post(`${api.Url}/admin/dashboard-data`, { timePeriod }, { 
        headers: { Authorization: `Bearer ${token}` }, timeout: 10000 
      });

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
      setNotification({ show: true, message: "Dashboard Updated", type: "success" });
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [timePeriod, getToken]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData, refresh]);

  return (
    <>
      <style>{dashboardStyles}</style>
      <div className="dash-container-x30sn">
        <PopNoti message={notification.message} type={notification.type} isVisible={notification.show} onClose={() => setNotification(p => ({ ...p, show: false }))} />
        
        {loading ? (
          <div className="loading-x30sn"><div className="spinner-x30sn"></div><p style={{marginTop:10, color:'#888'}}>Analyzing Data...</p></div>
        ) : (
          <>
            <div className="dash-header-x30sn">
              <div>
                <h2 className="dash-title-x30sn">Dashboard</h2>
                <p className="dash-subtitle-x30sn">Overview & Analytics</p>
              </div>
              <div className="dash-actions-x30sn">
                <select className="dash-select-x30sn" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
                  <option value="day">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
                <button className="dash-btn-x30sn" onClick={() => setRefresh(!refresh)}><IoMdRefresh /></button>
              </div>
            </div>

            <div className="dash-grid-x30sn">
              {/* Card 1 */}
              <div className="stat-card-x30sn">
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn"><FaUsers /></div>
                  <span className="stat-label-x30sn">Total Users</span>
                </div>
                <h3 className="stat-value-x30sn">{statsData.totalUsers}</h3>
              </div>
              
              {/* Card 2 */}
              <div className="stat-card-x30sn">
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn"><FaUserCheck /></div>
                  <span className="stat-label-x30sn">Active Users</span>
                </div>
                <h3 className="stat-value-x30sn">{statsData.activeUsers} <span style={{fontSize:14, color:'#ff69b4'}}>({safeCalculatePercentage(statsData.activeUsers, statsData.totalUsers).toFixed(0)}%)</span></h3>
              </div>

              {/* Card 3 */}
              <div className="stat-card-x30sn">
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn"><FaEnvelope /></div>
                  <span className="stat-label-x30sn">Messages</span>
                </div>
                <h3 className="stat-value-x30sn">{statsData.messagesSent}</h3>
              </div>

              {/* Card 4 */}
              <div className="stat-card-x30sn">
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn"><FaMoneyBillWave /></div>
                  <span className="stat-label-x30sn">Revenue</span>
                </div>
                <h3 className="stat-value-x30sn">₹{statsData.totalRevenue}</h3>
              </div>
            </div>

            <div className="chart-section-x30sn">
              <div className="chart-head-x30sn">
                <FaChartLine style={{color:'#ff69b4'}} />
                <h3>Revenue Growth</h3>
              </div>
              <div className="chart-area-x30sn">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={graphData.revenueTrend}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                    <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} itemStyle={{color:'#ff69b4'}} />
                    <Area type="monotone" dataKey="revenue" stroke="#ff69b4" fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;