'use client';
import { useState, useEffect, useCallback } from "react";
import axios from "axios";
import {
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import {
  FaUsers, FaMoneyBillWave, FaEnvelope, FaUserCheck, FaChartLine, FaMobileAlt, FaDesktop
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
.conversion-toggle-x30sn {
  display: flex;
  background: #222;
  border-radius: 8px;
  padding: 4px;
}
.toggle-btn-x30sn {
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  border: none;
  background: transparent;
  color: #888;
  transition: all 0.3s;
}
.toggle-btn-x30sn.active {
  background: #ff69b4;
  color: #000;
}
.chart-grid-layout-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.country-list-x30sn {
  margin-top: 20px;
  max-height: 200px;
  overflow-y: auto;
}
.country-item-x30sn {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #222;
}
.country-name-x30sn { color: #fff; font-weight: 500; }
.country-stats-x30sn { color: #888; font-size: 13px; }
.country-count-x30sn { color: #ff69b4; font-weight: 600; margin-right: 8px; }
@media (max-width: 600px) {
  .chart-grid-layout-x30sn {
    grid-template-columns: 1fr;
  }
}
`;

const AdminDashboard = () => {
  const [refresh, setRefresh] = useState(false);
  const [timePeriod, setTimePeriod] = useState("month");
  const [statsData, setStatsData] = useState({ 
    totalUsers: 0, 
    activeUsers: 0, 
    totalRevenue: 0, 
    messagesSent: 0, 
    revenueByCurrency: { INR: 0, USD: 0 },
    countryBreakdown: [] 
  });
  const [graphData, setGraphData] = useState({ revenueTrend: [] });
  const [loading, setLoading] = useState(true);
  const [conversionData, setConversionData] = useState([]);
  const [conversionType, setConversionType] = useState("daily"); // daily or monthly
  const [notification, setNotification] = useState({ show: false, message: "", type: "error" });
  const [deviceStats, setDeviceStats] = useState({ mobileUsers: 0, webUsers: 0 });

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
        revenueByCurrency: data.revenueByCurrency || { INR: 0, USD: 0 },
        countryBreakdown: data.countryBreakdown || []
      });

      const revenueTrendMapped = data.revenueTrend?.map(item => ({
        date: item._id ? new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        revenue: Math.round(item.totalInINR || 0)
      })) || [];

      setGraphData({ revenueTrend: revenueTrendMapped });
      setNotification({ show: true, message: "Dashboard Updated", type: "success" });
    } catch (err) {
      // Error handling
    } finally {
      setLoading(false);
    }
  }, [timePeriod, getToken]);

  const fetchDeviceStats = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/device-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) setDeviceStats(res.data.data);
    } catch (err) {
      console.error("Error fetching device stats", err);
    }
  }, [getToken]);

  const fetchConversionStats = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/signup-conversion-stats?type=${conversionType}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setConversionData(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching conversion stats", err);
    }
  }, [conversionType, getToken]);

  useEffect(() => { 
    fetchDashboardData();
    fetchConversionStats();
    fetchDeviceStats();
  }, [fetchDashboardData, fetchConversionStats, fetchDeviceStats, refresh]);

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
                  <span className="stat-label-x30sn">Revenue (Est. INR)</span>
                </div>
                <h3 className="stat-value-x30sn" style={{ fontSize: '24px' }}>₹{statsData.totalRevenue.toLocaleString()}</h3>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#888' }}>
                  ₹{statsData.revenueByCurrency.INR.toLocaleString()} + ${statsData.revenueByCurrency.USD.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Device Stats Row */}
            <div className="dash-grid-x30sn" style={{marginBottom: 30}}>
              <div className="stat-card-x30sn" style={{'--card-color': '#00b4d8'}}>
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn" style={{background:'rgba(0,180,216,0.1)', color:'#00b4d8'}}><FaMobileAlt /></div>
                  <span className="stat-label-x30sn">Mobile App Users</span>
                </div>
                <h3 className="stat-value-x30sn">{deviceStats.mobileUsers}</h3>
                <div style={{marginTop:8, fontSize:12, color:'#555'}}>
                  {deviceStats.mobileUsers + deviceStats.webUsers > 0
                    ? `${((deviceStats.mobileUsers / (deviceStats.mobileUsers + deviceStats.webUsers)) * 100).toFixed(1)}% of total`
                    : 'No data yet'}
                </div>
              </div>

              <div className="stat-card-x30sn">
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn"><FaDesktop /></div>
                  <span className="stat-label-x30sn">Web Users</span>
                </div>
                <h3 className="stat-value-x30sn">{deviceStats.webUsers}</h3>
                <div style={{marginTop:8, fontSize:12, color:'#555'}}>
                  {deviceStats.mobileUsers + deviceStats.webUsers > 0
                    ? `${((deviceStats.webUsers / (deviceStats.mobileUsers + deviceStats.webUsers)) * 100).toFixed(1)}% of total`
                    : 'No data yet'}
                </div>
              </div>
            </div>

            <div className="chart-grid-layout-x30sn">
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
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }} 
                        itemStyle={{color:'#ff69b4'}} 
                        formatter={(value) => [`₹${value.toLocaleString()}`, 'Total Revenue (Est. INR)']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#ff69b4" fillOpacity={1} fill="url(#colorRev)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-section-x30sn">
                <div className="chart-head-x30sn" style={{justifyContent: 'space-between'}}>
                  <div style={{display:'flex', alignItems:'center', gap:10}}>
                    <FaUsers style={{color:'#ff69b4'}} />
                    <h3>Signup vs Conversion</h3>
                  </div>
                  <div className="conversion-toggle-x30sn">
                    <button 
                      className={`toggle-btn-x30sn ${conversionType === 'daily' ? 'active' : ''}`}
                      onClick={() => setConversionType('daily')}
                    >Daily</button>
                    <button 
                      className={`toggle-btn-x30sn ${conversionType === 'monthly' ? 'active' : ''}`}
                      onClick={() => setConversionType('monthly')}
                    >Monthly</button>
                  </div>
                </div>
                <div className="chart-area-x30sn">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={conversionData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#333" />
                      <XAxis dataKey="date" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff' }}
                        cursor={{fill: 'rgba(255, 105, 180, 0.1)'}}
                      />
                      <Legend verticalAlign="top" height={36}/>
                      <Bar name="Signups" dataKey="signups" fill="#ff69b4" radius={[4, 4, 0, 0]} />
                      <Bar name="Premium Conversions" dataKey="conversions" fill="#fff" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="chart-section-x30sn" style={{ gridColumn: '1 / -1' }}>
                <div className="chart-head-x30sn">
                  <FaUsers style={{color:'#ff69b4'}} />
                  <h3>User Distribution by Country</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '300px', height: '300px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statsData.countryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={80}
                          outerRadius={110}
                          paddingAngle={5}
                          dataKey="count"
                          nameKey="country"
                        >
                          {statsData.countryBreakdown.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={[ '#ff69b4', '#ffffff', '#888888', '#ff1493', '#ffc0cb' ][index % 5]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#000', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div style={{ flex: '1', minWidth: '300px' }}>
                    <div className="country-list-x30sn" style={{ maxHeight: '300px' }}>
                      {statsData.countryBreakdown.map((item, idx) => (
                        <div key={idx} className="country-item-x30sn" style={{ padding: '12px 0' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: [ '#ff69b4', '#ffffff', '#888888', '#ff1493', '#ffc0cb' ][idx % 5] }}></div>
                            <span className="country-name-x30sn" style={{ fontSize: '16px' }}>{item.country}</span>
                          </div>
                          <div className="country-stats-x30sn">
                            <span className="country-count-x30sn" style={{ fontSize: '16px' }}>{item.count} Users</span>
                            <span style={{ fontSize: '16px', color: '#ff69b4' }}>{item.percentage}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default AdminDashboard;