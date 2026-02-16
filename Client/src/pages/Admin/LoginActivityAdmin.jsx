'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../config/api";
import { 
  FaGlobe, FaDesktop, FaMobileAlt, FaLinux, FaWindows, FaApple, FaAndroid,
  FaUserClock, FaChartLine, FaSearch, FaSync, FaShieldAlt 
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from "recharts";

// ------------------- CSS STYLES (Pure Black & Pink) -------------------
const styles = `
/* ROOT & LAYOUT */
.la-root-x30sn {
  color: #fff;
  background-color: #000;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  border-radius: 16px;
  border: 1px solid #222;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.la-header-x30sn {
  padding: 24px;
  background: #050505;
  border-bottom: 1px solid #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.la-title-x30sn h2 { font-size: 24px; font-weight: 800; margin: 0; color: #fff; }
.la-title-x30sn p { color: #ff69b4; margin: 4px 0 0; font-size: 13px; font-weight: 500; }

.la-btn-x30sn {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #333;
  background: #111; color: #fff; transition: 0.2s;
}
.la-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }
.la-btn-x30sn:disabled { opacity: 0.5; cursor: wait; }

/* RATIO BAR (NEW) */
.la-ratio-section-x30sn {
  padding: 20px 24px 0;
}
.la-ratio-container-x30sn {
  background: #0a0a0a;
  border: 1px solid #222;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.la-ratio-title-x30sn { font-size: 14px; color: #888; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; }

.la-progress-bar-x30sn {
  display: flex;
  height: 24px;
  border-radius: 12px;
  overflow: hidden;
  background: #222;
}
.la-progress-segment-x30sn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: #000;
  transition: width 0.5s ease;
}

.la-legend-row-x30sn {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.la-legend-item-x30sn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #ddd;
}
.la-dot-x30sn { width: 10px; height: 10px; border-radius: 50%; }

/* KPI GRID */
.la-kpi-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  padding: 24px;
}
.la-kpi-card-x30sn {
  background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 20px;
  display: flex; align-items: center; gap: 15px; transition: 0.2s;
}
.la-kpi-card-x30sn:hover { border-color: #333; transform: translateY(-2px); }
.la-kpi-icon-x30sn {
  width: 45px; height: 45px; border-radius: 10px; background: rgba(255,105,180,0.1); color: #ff69b4;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.la-kpi-info-x30sn h4 { margin: 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.la-kpi-info-x30sn strong { font-size: 22px; color: #fff; display: block; margin-top: 4px; }
.la-kpi-sub-x30sn { font-size: 11px; color: #00ff88; margin-top: 2px; }

/* CHARTS SECTION */
.la-charts-row-x30sn {
  display: grid; grid-template-columns: 2fr 1fr; gap: 20px; padding: 0 24px 24px;
}
.la-chart-box-x30sn {
  background: #0a0a0a; border: 1px solid #222; border-radius: 16px; padding: 20px; min-height: 300px;
}
.la-chart-title-x30sn { font-size: 16px; font-weight: 700; margin-bottom: 20px; display: flex; align-items: center; gap: 10px; }

/* TABLE SECTION */
.la-table-section-x30sn {
  flex: 1; padding: 0 24px 24px; display: flex; flex-direction: column; overflow: hidden;
}

.la-controls-x30sn {
  display: flex; justify-content: space-between; margin-bottom: 15px;
}
.la-search-wrap-x30sn {
  position: relative; width: 300px;
}
.la-search-icon-x30sn { position: absolute; left: 12px; top: 11px; color: #666; }
.la-input-x30sn {
  width: 100%; background: #0a0a0a; border: 1px solid #333; color: #fff; padding: 10px 10px 10px 35px;
  border-radius: 8px; outline: none; font-size: 13px;
}
.la-input-x30sn:focus { border-color: #ff69b4; }

.la-table-container-x30sn {
  background: #0a0a0a; border: 1px solid #222; border-radius: 12px; overflow-y: auto; flex: 1;
}
.la-table-x30sn { width: 100%; border-collapse: collapse; font-size: 13px; }
.la-table-x30sn thead { position: sticky; top: 0; background: #111; z-index: 10; }
.la-table-x30sn th {
  padding: 12px 16px; text-align: left; color: #888; font-weight: 600; text-transform: uppercase; font-size: 11px; border-bottom: 1px solid #333;
}
.la-table-x30sn td { padding: 12px 16px; border-bottom: 1px solid #1a1a1a; color: #ddd; vertical-align: middle; }
.la-table-x30sn tr:hover { background: rgba(255,255,255,0.02); }

/* TABLE CELLS */
.la-user-cell-x30sn { display: flex; align-items: center; gap: 10px; }
.la-user-img-x30sn { width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #333; }
.la-user-info-x30sn div { font-weight: 600; color: #fff; }
.la-user-info-x30sn span { font-size: 11px; color: #666; }

.la-badge-x30sn {
  padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase;
}
.la-badge-x30sn.sub { background: #ff69b4; color: #000; }
.la-badge-x30sn.free { background: #333; color: #aaa; }

.la-platform-cell-x30sn { display: flex; align-items: center; gap: 8px; }
.la-platform-icon-x30sn { font-size: 16px; color: #888; }
.la-ip-cell-x30sn { font-family: monospace; color: #888; background: #111; padding: 2px 6px; border-radius: 4px; }

/* LOADING */
.la-loading-x30sn { height: 100vh; display: flex; align-items: center; justify-content: center; color: #ff69b4; }
.la-spin-x30sn { animation: spin 1s linear infinite; font-size: 30px; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* RESPONSIVE */
@media (max-width: 1024px) {
  .la-charts-row-x30sn { grid-template-columns: 1fr; }
  .la-table-x30sn th:nth-child(4), .la-table-x30sn td:nth-child(4) { display: none; } /* Hide Coords on tablet */
}
@media (max-width: 768px) {
  .la-header-x30sn { flex-direction: column; align-items: flex-start; }
  .la-search-wrap-x30sn { width: 100%; }
  .la-table-x30sn th:nth-child(3), .la-table-x30sn td:nth-child(3) { display: none; } /* Hide IP on mobile */
}
`;

const LoginActivityAdmin = () => {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const IGNORED_EMAILS = ['omawchar07@gmail.com'];

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const formatPlatform = (plat) => {
    if (!plat) return 'Unknown';
    const p = plat.toLowerCase();
    
    // Logic: Map technical names to Friendly OS Names
    if (p.includes('linux armv8') || p.includes('aarch64') || p.includes('android')) return 'Android';
    if (p.includes('win32') || p.includes('windows')) return 'Windows';
    if (p.includes('iphone') || p.includes('ipad') || p.includes('ios')) return 'iPhone';
    if (p.includes('macintosh') || p.includes('mac')) return 'Mac';
    if (p.includes('linux')) return 'Linux'; // Generic Linux desktop
    
    return plat; 
  };

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/login-activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setData(response.data.summary);
        
        // --- FILTERING LOGIC ---
        // We filter out the specific email immediately so all charts/tables reflect this
        const cleanLogs = response.data.logs.filter(log => {
            const email = log.user?.email || "";
            return !IGNORED_EMAILS.includes(email);
        });
        
        setLogs(cleanLogs);
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- STATS CALCULATION (Based on FILTERED Logs) ---
  const osRatios = useMemo(() => {
    const stats = { Android: 0, Windows: 0, iPhone: 0, Others: 0, Total: 0 };
    
    logs.forEach(log => {
      const os = formatPlatform(log.platform);
      if (os === 'Android') stats.Android++;
      else if (os === 'Windows') stats.Windows++;
      else if (os === 'iPhone') stats.iPhone++;
      else stats.Others++;
      stats.Total++;
    });

    return {
      Android: ((stats.Android / stats.Total) * 100).toFixed(1),
      Windows: ((stats.Windows / stats.Total) * 100).toFixed(1),
      iPhone: ((stats.iPhone / stats.Total) * 100).toFixed(1),
      Others: ((stats.Others / stats.Total) * 100).toFixed(1),
      Counts: stats
    };
  }, [logs]);

  // Filter Logs for Search
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return logs;
    const lower = searchTerm.toLowerCase();
    return logs.filter(log => {
      const name = log.user?.name || "Unknown";
      const email = log.user?.email || "";
      const ip = log.ip || "";
      return name.toLowerCase().includes(lower) || email.toLowerCase().includes(lower) || ip.includes(lower);
    });
  }, [logs, searchTerm]);

  // Chart Data Preparation
  const platformChartData = useMemo(() => {
    // Recalculate platform counts from filtered logs to match the table
    const counts = {};
    logs.forEach(log => {
        const os = formatPlatform(log.platform);
        counts[os] = (counts[os] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [logs]);

  const userSegChartData = useMemo(() => {
    if (!data?.userSegments) return [];
    return [
      { name: 'Free Users', value: data.userSegments.free, color: '#333' },
      { name: 'Subscribers', value: data.userSegments.subscribers, color: '#ff69b4' }
    ];
  }, [data]);

  const getPlatformIcon = (plat) => {
    const os = formatPlatform(plat);
    if (os === 'Android') return <FaAndroid style={{color: '#3DDC84'}} />;
    if (os === 'Windows') return <FaWindows style={{color: '#0078D7'}} />;
    if (os === 'iPhone') return <FaApple style={{color: '#fff'}} />;
    if (os === 'Linux') return <FaLinux style={{color: '#FCC624'}} />;
    return <FaDesktop />;
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  if (loading) return (
    <div className="la-loading-x30sn">
       <style>{styles}</style>
       <FaSync className="la-spin-x30sn"/>
    </div>
  );

  return (
    <div className="la-root-x30sn">
      <style>{styles}</style>

      {/* HEADER */}
      <header className="la-header-x30sn">
        <div className="la-title-x30sn">
          <h2>Login Intelligence</h2>
          <p>Real-time Session Monitoring & Analysis</p>
        </div>
        <button className="la-btn-x30sn" onClick={fetchData}>
          <FaSync /> Refresh Data
        </button>
      </header>

      {/* RATIO BAR (NEW) */}
      <div className="la-ratio-section-x30sn">
        <div className="la-ratio-container-x30sn">
            <div className="la-ratio-title-x30sn">Device Ratio (Real-time)</div>
            
            {/* Visual Bar */}
            <div className="la-progress-bar-x30sn">
                <div className="la-progress-segment-x30sn" style={{width: `${osRatios.Android}%`, background: '#3DDC84'}} title={`Android: ${osRatios.Android}%`}>
                    {parseFloat(osRatios.Android) > 5 && `${osRatios.Android}%`}
                </div>
                <div className="la-progress-segment-x30sn" style={{width: `${osRatios.Windows}%`, background: '#0078D7'}} title={`Windows: ${osRatios.Windows}%`}>
                    {parseFloat(osRatios.Windows) > 5 && `${osRatios.Windows}%`}
                </div>
                <div className="la-progress-segment-x30sn" style={{width: `${osRatios.iPhone}%`, background: '#fff'}} title={`iPhone: ${osRatios.iPhone}%`}></div>
                <div className="la-progress-segment-x30sn" style={{width: `${osRatios.Others}%`, background: '#555'}} title="Others"></div>
            </div>

            {/* Legend */}
            <div className="la-legend-row-x30sn">
                <div className="la-legend-item-x30sn">
                    <div className="la-dot-x30sn" style={{background: '#3DDC84'}}></div> 
                    Android ({osRatios.Counts.Android})
                </div>
                <div className="la-legend-item-x30sn">
                    <div className="la-dot-x30sn" style={{background: '#0078D7'}}></div> 
                    Windows ({osRatios.Counts.Windows})
                </div>
                <div className="la-legend-item-x30sn">
                    <div className="la-dot-x30sn" style={{background: '#fff'}}></div> 
                    iPhone ({osRatios.Counts.iPhone})
                </div>
            </div>
        </div>
      </div>

      {/* KPIs */}
      <div className="la-kpi-grid-x30sn">
        <div className="la-kpi-card-x30sn">
          <div className="la-kpi-icon-x30sn"><FaUserClock/></div>
          <div className="la-kpi-info-x30sn">
            <h4>Daily Active (DAU)</h4>
            <strong>{data?.activeMetrics?.dau || 0}</strong>
          </div>
        </div>
        <div className="la-kpi-card-x30sn">
          <div className="la-kpi-icon-x30sn" style={{color:'#00ff88', background:'rgba(0,255,136,0.1)'}}><FaChartLine/></div>
          <div className="la-kpi-info-x30sn">
            <h4>Monthly Active (MAU)</h4>
            <strong>{data?.activeMetrics?.mau || 0}</strong>
            <span className="la-kpi-sub-x30sn">{data?.activeMetrics?.stickinessRatio} Sticky</span>
          </div>
        </div>
        <div className="la-kpi-card-x30sn">
          <div className="la-kpi-icon-x30sn" style={{color:'#ff3b30', background:'rgba(255,59,48,0.1)'}}><FaShieldAlt/></div>
          <div className="la-kpi-info-x30sn">
            <h4>Conversion Rate</h4>
            <strong>{data?.userSegments?.conversionRate || "0%"}</strong>
          </div>
        </div>
        <div className="la-kpi-card-x30sn">
          <div className="la-kpi-icon-x30sn" style={{color:'#4facfe', background:'rgba(79,172,254,0.1)'}}><FaGlobe/></div>
          <div className="la-kpi-info-x30sn">
            <h4>Total Logs</h4>
            <strong>{logs.length}</strong>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="la-charts-row-x30sn">
        <div className="la-chart-box-x30sn">
          <div className="la-chart-title-x30sn">Platform Distribution (Filtered)</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={platformChartData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
              <XAxis dataKey="name" stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background:'#000', border:'1px solid #333'}} />
              <Bar dataKey="value" fill="#ff69b4" radius={[4,4,0,0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="la-chart-box-x30sn">
          <div className="la-chart-title-x30sn">User Segments</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={userSegChartData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {userSegChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* LOGS TABLE */}
      <div className="la-table-section-x30sn">
        <div className="la-controls-x30sn">
          <div className="la-search-wrap-x30sn">
            <FaSearch className="la-search-icon-x30sn" />
            <input 
              type="text" 
              placeholder="Search by User, Email or IP..." 
              className="la-input-x30sn" 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="la-table-container-x30sn">
          <table className="la-table-x30sn">
            <thead>
              <tr>
                <th>User</th>
                <th>Device / OS</th>
                <th>IP Address</th>
                <th>Location (Lat,Lon)</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log._id}>
                  <td>
                    {log.user ? (
                      <div className="la-user-cell-x30sn">
                        <img 
                          src={log.user.profile_picture || '/placeholder.png'} 
                          alt="" 
                          className="la-user-img-x30sn"
                          onError={(e) => e.target.src='/placeholder.png'}
                        />
                        <div className="la-user-info-x30sn">
                          <div>{log.user.name}</div>
                          <span>{log.user.email}</span>
                        </div>
                        <span className={`la-badge-x30sn ${log.user.user_type === 'subscriber' ? 'sub' : 'free'}`}>
                          {log.user.user_type === 'subscriber' ? 'PRO' : 'FREE'}
                        </span>
                      </div>
                    ) : (
                      <div className="la-user-cell-x30sn" style={{opacity:0.5}}>
                         <div className="la-user-img-x30sn" style={{background:'#333'}}></div>
                         <span>Unknown / Deleted User</span>
                      </div>
                    )}
                  </td>
                  <td>
                    <div className="la-platform-cell-x30sn">
                      <span className="la-platform-icon-x30sn">
                        {getPlatformIcon(log.platform || '')}
                      </span>
                      <span>{formatPlatform(log.platform || 'Unknown')}</span>
                    </div>
                  </td>
                  <td>
                    <span className="la-ip-cell-x30sn">{log.ip}</span>
                  </td>
                  <td>
                    {log.coordinates?.lat ? (
                      <span style={{fontSize:12, color:'#888'}}>
                        {log.coordinates.lat?.toFixed(2)}, {log.coordinates.lon?.toFixed(2)}
                      </span>
                    ) : <span style={{color:'#444'}}>-</span>}
                  </td>
                  <td style={{color:'#ff69b4', fontSize:12}}>
                    {formatDate(log.time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
             <div style={{padding:40, textAlign:'center', color:'#555'}}>No logs found matching your search.</div>
          )}
        </div>
      </div>

    </div>
  );
};

export default LoginActivityAdmin;