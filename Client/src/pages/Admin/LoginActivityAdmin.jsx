'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../config/api";
import { 
  FaGlobe, FaDesktop, FaMobileAlt, FaLinux, FaWindows, FaApple, FaAndroid,
  FaUserClock, FaChartLine, FaSearch, FaSync, FaShieldAlt, FaDownload, FaFilter 
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from "recharts";

// ------------------- CSS STYLES (Premium Black, Gold, Pink & Glassmorphism) -------------------
const styles = `
/* ROOT & LAYOUT */
.la-root-x30sn {
  color: #fff;
  background-color: #030303;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* HEADER */
.la-header-x30sn {
  padding: 28px 32px;
  background: linear-gradient(180deg, #070707 0%, #030303 100%);
  border-bottom: 1px solid #161616;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.la-title-x30sn h2 { 
  font-size: 26px; 
  font-weight: 800; 
  margin: 0; 
  letter-spacing: -0.5px;
  color: #fff; 
  display: flex;
  align-items: center;
  gap: 12px;
}
.la-title-x30sn p { 
  color: #888; 
  margin: 6px 0 0; 
  font-size: 14px; 
  font-weight: 500; 
  display: flex;
  align-items: center;
  gap: 8px;
}

/* LIVE STATUS PULSE INDICATOR */
.la-pulse-dot-x30sn {
  width: 8px;
  height: 8px;
  background-color: #00ff88;
  border-radius: 50%;
  box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
  animation: la-pulse-x30sn 1.6s infinite;
}
@keyframes la-pulse-x30sn {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 8px rgba(0, 255, 136, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(0, 255, 136, 0);
  }
}

.la-header-actions-x30sn {
  display: flex;
  align-items: center;
  gap: 12px;
}

.la-btn-x30sn {
  display: flex; 
  align-items: center; 
  gap: 8px; 
  padding: 10px 20px; 
  border-radius: 10px;
  font-size: 13px; 
  font-weight: 600; 
  cursor: pointer; 
  border: 1px solid #222;
  background: #0c0c0c; 
  color: #eee; 
  transition: all 0.25s ease;
}
.la-btn-x30sn:hover { 
  border-color: #ff69b4; 
  color: #ff69b4; 
  background: rgba(255, 105, 180, 0.03);
  transform: translateY(-1px);
}
.la-btn-x30sn.primary {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.la-btn-x30sn.primary:hover {
  filter: brightness(1.1);
  color: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.25);
}
.la-btn-x30sn:disabled { opacity: 0.5; cursor: wait; }

/* DEVICE RATIO BAR */
.la-ratio-section-x30sn {
  padding: 24px 32px 0;
}
.la-ratio-container-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  backdrop-filter: blur(12px);
}
.la-ratio-title-x30sn { 
  font-size: 12px; 
  color: #666; 
  font-weight: 700; 
  text-transform: uppercase; 
  letter-spacing: 1.2px; 
}

.la-progress-bar-x30sn {
  display: flex;
  height: 18px;
  border-radius: 9px;
  overflow: hidden;
  background: #151515;
}
.la-progress-segment-x30sn {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  font-weight: 800;
  color: #000;
  transition: width 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

.la-legend-row-x30sn {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.la-legend-item-x30sn {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #aaa;
  font-weight: 500;
}
.la-dot-x30sn { width: 10px; height: 10px; border-radius: 50%; }

/* KPI GRID */
.la-kpi-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}
.la-kpi-card-x30sn {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  padding: 24px;
  display: flex; 
  align-items: center; 
  gap: 18px; 
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
}
.la-kpi-card-x30sn:hover { 
  border-color: #262626; 
  transform: translateY(-3px); 
  box-shadow: 0 6px 20px rgba(0,0,0,0.4);
}
.la-kpi-icon-x30sn {
  width: 50px; 
  height: 50px; 
  border-radius: 12px; 
  background: rgba(255,105,180,0.08); 
  color: #ff69b4;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 22px;
  border: 1px solid rgba(255,105,180,0.15);
}
.la-kpi-info-x30sn h4 { margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.8px; }
.la-kpi-info-x30sn strong { font-size: 26px; color: #fff; display: block; margin-top: 4px; font-weight: 800; }
.la-kpi-sub-x30sn { font-size: 11px; color: #00ff88; margin-top: 4px; font-weight: 600; display: block; }

/* CHARTS SECTION */
.la-charts-row-x30sn {
  display: grid; 
  grid-template-columns: 1.5fr 1fr; 
  gap: 20px; 
  padding: 0 32px 24px;
}
.la-chart-box-x30sn {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 20px; 
  padding: 24px; 
  min-height: 320px;
  backdrop-filter: blur(12px);
}
.la-chart-title-x30sn { 
  font-size: 15px; 
  font-weight: 700; 
  margin-bottom: 24px; 
  display: flex; 
  align-items: center; 
  gap: 10px; 
  color: #eee;
  text-transform: uppercase;
  letter-spacing: 0.8px;
}

/* FILTER TABS */
.la-tabs-row-x30sn {
  display: flex;
  gap: 8px;
  padding: 0 32px 20px;
  flex-wrap: wrap;
  border-bottom: 1px solid #161616;
}
.la-tab-btn-x30sn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: #0c0c0c;
  color: #888;
  border: 1px solid #1a1a1a;
  transition: all 0.2s ease;
}
.la-tab-btn-x30sn:hover {
  color: #fff;
  border-color: #333;
}
.la-tab-btn-x30sn.active {
  background: rgba(255, 105, 180, 0.08);
  color: #ff69b4;
  border-color: #ff69b4;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.08);
}

/* TABLE SECTION */
.la-table-section-x30sn {
  flex: 1; 
  padding: 24px 32px 32px; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
}

.la-controls-x30sn {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 16px;
}
.la-search-wrap-x30sn {
  position: relative; 
  width: 320px;
}
.la-search-icon-x30sn { position: absolute; left: 14px; top: 13px; color: #555; }
.la-input-x30sn {
  width: 100%; 
  background: rgba(15,15,15,0.7); 
  border: 1px solid #222; 
  color: #fff; 
  padding: 12px 12px 12px 42px;
  border-radius: 10px; 
  outline: none; 
  font-size: 13px;
  transition: all 0.25s ease;
}
.la-input-x30sn:focus { 
  border-color: #ff69b4; 
  background: #000;
  box-shadow: 0 0 12px rgba(255, 105, 180, 0.15);
}
.la-table-info-x30sn {
  font-size: 13px;
  color: #555;
  font-weight: 500;
}

.la-table-container-x30sn {
  background: rgba(5, 5, 5, 0.8); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  overflow-y: auto; 
  flex: 1;
}
.la-table-x30sn { width: 100%; border-collapse: collapse; font-size: 13px; }
.la-table-x30sn thead { position: sticky; top: 0; background: #070707; z-index: 10; }
.la-table-x30sn th {
  padding: 16px 20px; 
  text-align: left; 
  color: #666; 
  font-weight: 700; 
  text-transform: uppercase; 
  font-size: 10px; 
  letter-spacing: 1.2px;
  border-bottom: 1px solid #1a1a1a;
}
.la-table-x30sn td { 
  padding: 16px 20px; 
  border-bottom: 1px solid #111; 
  color: #ccc; 
  vertical-align: middle; 
  transition: all 0.2s ease;
}
.la-table-x30sn tr {
  position: relative;
  transition: all 0.2s ease;
}
.la-table-x30sn tr:hover td { 
  background: rgba(255, 105, 180, 0.015); 
  color: #fff;
}
.la-table-x30sn tr:hover::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ff69b4;
  box-shadow: 0 0 8px #ff69b4;
}

/* TABLE CELLS */
.la-user-cell-x30sn { display: flex; align-items: center; gap: 12px; }
.la-user-img-x30sn { 
  width: 36px; 
  height: 36px; 
  border-radius: 50%; 
  object-fit: cover; 
  border: 2px solid #222; 
  background: #111;
}
.la-user-info-x30sn div { font-weight: 700; color: #fff; font-size: 14px; }
.la-user-info-x30sn span { font-size: 11px; color: #555; }

.la-badge-x30sn {
  padding: 3px 8px; 
  border-radius: 6px; 
  font-size: 9px; 
  font-weight: 800; 
  text-transform: uppercase;
  letter-spacing: 0.8px;
}
.la-badge-x30sn.sub { 
  background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%); 
  color: #000; 
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.15);
}
.la-badge-x30sn.free { background: #1a1a1a; color: #888; border: 1px solid #222; }

.la-platform-cell-x30sn { display: flex; align-items: center; gap: 10px; font-weight: 600; }
.la-platform-icon-x30sn { font-size: 18px; display: flex; align-items: center; }
.la-ip-cell-x30sn { 
  font-family: 'JetBrains Mono', monospace; 
  color: #a0c0e0; 
  background: rgba(160, 192, 224, 0.04); 
  padding: 4px 8px; 
  border-radius: 6px; 
  font-size: 12px;
  border: 1px solid rgba(160, 192, 224, 0.08);
}

.la-load-more-container {
  display: flex;
  justify-content: center;
  padding: 20px 0 0;
}

/* LOADING */
.la-loading-x30sn { height: 100vh; display: flex; align-items: center; justify-content: center; background: #030303; color: #ff69b4; }
.la-spin-x30sn { animation: spin 1s linear infinite; font-size: 32px; }
@keyframes spin { 100% { transform: rotate(360deg); } }

/* RESPONSIVE */
@media (max-width: 1024px) {
  .la-charts-row-x30sn { grid-template-columns: 1fr; }
  .la-table-x30sn th:nth-child(4), .la-table-x30sn td:nth-child(4) { display: none; }
}
@media (max-width: 768px) {
  .la-header-x30sn { flex-direction: column; align-items: flex-start; padding: 20px 24px; }
  .la-search-wrap-x30sn { width: 100%; }
  .la-controls-x30sn { flex-direction: column; align-items: stretch; }
  .la-table-x30sn th:nth-child(3), .la-table-x30sn td:nth-child(3) { display: none; }
  .la-ratio-section-x30sn { padding: 20px 24px 0; }
  .la-kpi-grid-x30sn { padding: 16px 24px; }
  .la-charts-row-x30sn { padding: 0 24px 20px; }
  .la-table-section-x30sn { padding: 20px 24px; }
}
`;

// Recharts Custom Tooltip
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: 'rgba(5, 5, 5, 0.9)',
        border: '1px solid #ff69b4',
        borderRadius: '10px',
        padding: '12px 16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#666', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {payload[0].name}
        </p>
        <p style={{ margin: '6px 0 0 0', fontSize: '16px', color: '#ff69b4', fontWeight: 800 }}>
          {payload[0].value.toLocaleString()} {payload[0].value === 1 ? 'session' : 'sessions'}
        </p>
      </div>
    );
  }
  return null;
};

const LoginActivityAdmin = () => {
  const [data, setData] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTab, setSelectedTab] = useState("all");
  const [visibleCount, setVisibleCount] = useState(25);

  const IGNORED_EMAILS = ['omawchar07@gmail.com'];

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const formatPlatform = (plat) => {
    if (!plat) return 'Unknown';
    const p = plat.toLowerCase();
    
    if (p.includes('linux armv8') || p.includes('aarch64') || p.includes('android')) return 'Android';
    if (p.includes('win32') || p.includes('windows')) return 'Windows';
    if (p.includes('iphone') || p.includes('ipad') || p.includes('ios')) return 'iPhone';
    if (p.includes('macintosh') || p.includes('mac')) return 'Mac';
    if (p.includes('linux')) return 'Linux';
    
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
        
        // Filter out specific test account immediately
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

  // Devices OS Stats (calculated from active logs)
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

    const total = stats.Total || 1;
    return {
      Android: ((stats.Android / total) * 100).toFixed(1),
      Windows: ((stats.Windows / total) * 100).toFixed(1),
      iPhone: ((stats.iPhone / total) * 100).toFixed(1),
      Others: ((stats.Others / total) * 100).toFixed(1),
      Counts: stats
    };
  }, [logs]);

  // Tab Filtering & Search Filtering Combination
  const filteredLogs = useMemo(() => {
    let result = logs;

    // 1. Tab segment filter
    if (selectedTab === "pro") {
      result = result.filter(log => log.user?.user_type === 'subscriber');
    } else if (selectedTab === "free") {
      result = result.filter(log => log.user?.user_type !== 'subscriber');
    } else if (selectedTab === "mobile") {
      result = result.filter(log => {
        const os = formatPlatform(log.platform || '').toLowerCase();
        return os === 'android' || os === 'iphone';
      });
    } else if (selectedTab === "web") {
      result = result.filter(log => {
        const os = formatPlatform(log.platform || '').toLowerCase();
        return os === 'windows' || os === 'mac' || os === 'linux' || os === 'unknown';
      });
    }

    // 2. Search term filter
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(log => {
        const name = log.user?.name || "Unknown";
        const email = log.user?.email || "";
        const ip = log.ip || "";
        const city = log.cityName || "";
        const country = log.country || "";
        return name.toLowerCase().includes(lower) || 
               email.toLowerCase().includes(lower) || 
               ip.includes(lower) ||
               city.toLowerCase().includes(lower) ||
               country.toLowerCase().includes(lower);
      });
    }

    return result;
  }, [logs, selectedTab, searchTerm]);

  // Paginated Logs
  const paginatedLogs = useMemo(() => {
    return filteredLogs.slice(0, visibleCount);
  }, [filteredLogs, visibleCount]);

  // Chart Data Preparation (based on selected tab filters)
  const platformChartData = useMemo(() => {
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
      { name: 'Free Users', value: data.userSegments.free, color: '#262626' },
      { name: 'Subscribers', value: data.userSegments.subscribers, color: '#ff69b4' }
    ];
  }, [data]);

  const getPlatformIcon = (plat) => {
    const os = formatPlatform(plat);
    if (os === 'Android') return <FaAndroid style={{color: '#3DDC84'}} />;
    if (os === 'Windows') return <FaWindows style={{color: '#0078D7'}} />;
    if (os === 'iPhone') return <FaApple style={{color: '#fff'}} />;
    if (os === 'Linux') return <FaLinux style={{color: '#FCC624'}} />;
    return <FaDesktop style={{color: '#888'}} />;
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleString('en-US', {
      month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  // CSV Export Utility
  const exportToCSV = () => {
    const headers = ["User Name", "Email", "Role", "Platform", "IP Address", "City", "Country", "Coordinates", "Time"];
    const rows = filteredLogs.map(log => [
      log.user?.name || "Unknown/Deleted",
      log.user?.email || "N/A",
      log.user?.user_type === 'subscriber' ? "PRO" : "FREE",
      formatPlatform(log.platform || ""),
      log.ip || "",
      log.cityName || "",
      log.country || "",
      log.coordinates?.lat ? `${log.coordinates.lat}, ${log.coordinates.lon}` : "",
      new Date(log.time).toISOString()
    ]);
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `login_activity_export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
          <p><span className="la-pulse-dot-x30sn"></span> Real-time Session Monitoring & Analysis</p>
        </div>
        <div className="la-header-actions-x30sn">
          <button className="la-btn-x30sn" onClick={exportToCSV} title="Export current filtered list to CSV">
            <FaDownload /> Export CSV
          </button>
          <button className="la-btn-x30sn primary" onClick={fetchData}>
            <FaSync /> Sync Data
          </button>
        </div>
      </header>

      {/* RATIO BAR */}
      <div className="la-ratio-section-x30sn">
        <div className="la-ratio-container-x30sn">
            <div className="la-ratio-title-x30sn">Device Distribution (All Sessions)</div>
            
            <div className="la-progress-bar-x30sn">
                <div className="la-progress-segment-x30sn" style={{width: `${osRatios.Android}%`, background: '#3DDC84'}} title={`Android: ${osRatios.Android}%`}>
                    {parseFloat(osRatios.Android) > 8 && `${osRatios.Android}%`}
                </div>
                <div className="la-progress-segment-x30sn" style={{width: `${osRatios.Windows}%`, background: '#0078D7'}} title={`Windows: ${osRatios.Windows}%`}>
                    {parseFloat(osRatios.Windows) > 8 && `${osRatios.Windows}%`}
                </div>
                <div className="la-progress-segment-x30sn" style={{width: `${osRatios.iPhone}%`, background: '#fff'}} title={`iPhone: ${osRatios.iPhone}%`}>
                    {parseFloat(osRatios.iPhone) > 8 && `${osRatios.iPhone}%`}
                </div>
                <div className="la-progress-segment-x30sn" style={{width: `${osRatios.Others}%`, background: '#555'}} title={`Others: ${osRatios.Others}%`}>
                    {parseFloat(osRatios.Others) > 8 && `${osRatios.Others}%`}
                </div>
            </div>

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
                <div className="la-legend-item-x30sn">
                    <div className="la-dot-x30sn" style={{background: '#555'}}></div> 
                    Others ({osRatios.Counts.Others})
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
          <div className="la-kpi-icon-x30sn" style={{color:'#00ff88', background:'rgba(0,255,136,0.04)', border:'1px solid rgba(0,255,136,0.1)'}}><FaChartLine/></div>
          <div className="la-kpi-info-x30sn">
            <h4>Monthly Active (MAU)</h4>
            <strong>{data?.activeMetrics?.mau || 0}</strong>
            <span className="la-kpi-sub-x30sn">{data?.activeMetrics?.stickinessRatio} Stickiness</span>
          </div>
        </div>
        <div className="la-kpi-card-x30sn">
          <div className="la-kpi-icon-x30sn" style={{color:'#ff5252', background:'rgba(255,82,82,0.04)', border:'1px solid rgba(255,82,82,0.1)'}}><FaShieldAlt/></div>
          <div className="la-kpi-info-x30sn">
            <h4>PRO Conversion Rate</h4>
            <strong>{data?.userSegments?.conversionRate || "0%"}</strong>
          </div>
        </div>
        <div className="la-kpi-card-x30sn">
          <div className="la-kpi-icon-x30sn" style={{color:'#00a2ff', background:'rgba(0,162,255,0.04)', border:'1px solid rgba(0,162,255,0.1)'}}><FaGlobe/></div>
          <div className="la-kpi-info-x30sn">
            <h4>Analyzed Logs</h4>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#181818" />
              <XAxis dataKey="name" stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.02)'}} content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#ff69b4" radius={[6,6,0,0]} barSize={35} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="la-chart-box-x30sn">
          <div className="la-chart-title-x30sn">User Segments</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={userSegChartData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                {userSegChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SEGMENT QUICK TABS */}
      <div className="la-tabs-row-x30sn">
        <button className={`la-tab-btn-x30sn ${selectedTab === "all" ? "active" : ""}`} onClick={() => { setSelectedTab("all"); setVisibleCount(25); }}>
          All Sessions
        </button>
        <button className={`la-tab-btn-x30sn ${selectedTab === "pro" ? "active" : ""}`} onClick={() => { setSelectedTab("pro"); setVisibleCount(25); }}>
          PRO Subscribers
        </button>
        <button className={`la-tab-btn-x30sn ${selectedTab === "free" ? "active" : ""}`} onClick={() => { setSelectedTab("free"); setVisibleCount(25); }}>
          FREE Members
        </button>
        <button className={`la-tab-btn-x30sn ${selectedTab === "mobile" ? "active" : ""}`} onClick={() => { setSelectedTab("mobile"); setVisibleCount(25); }}>
          Mobile Apps
        </button>
        <button className={`la-tab-btn-x30sn ${selectedTab === "web" ? "active" : ""}`} onClick={() => { setSelectedTab("web"); setVisibleCount(25); }}>
          Web Browsers
        </button>
      </div>

      {/* LOGS TABLE */}
      <div className="la-table-section-x30sn">
        <div className="la-controls-x30sn">
          <div className="la-search-wrap-x30sn">
            <FaSearch className="la-search-icon-x30sn" />
            <input 
              type="text" 
              placeholder="Search by User, Email, IP, City or Country..." 
              className="la-input-x30sn" 
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value); setVisibleCount(25); }}
            />
          </div>
          <div className="la-table-info-x30sn">
            Showing {Math.min(paginatedLogs.length, filteredLogs.length)} of {filteredLogs.length} matching sessions
          </div>
        </div>

        <div className="la-table-container-x30sn">
          <table className="la-table-x30sn">
            <thead>
              <tr>
                <th>User</th>
                <th>Device / OS</th>
                <th>IP Address</th>
                <th>Location</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {paginatedLogs.map((log) => (
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
                         <div className="la-user-img-x30sn" style={{background:'#222'}}></div>
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
                    {log.cityName && log.cityName !== "Unknown" ? (
                      <div>
                        <span style={{ fontWeight: 700, color: '#fff', display: 'block' }}>
                          {log.cityName}{log.country && log.country !== "Unknown" ? `, ${log.country}` : ''}
                        </span>
                        {log.coordinates?.lat && (
                          <span style={{ fontSize: '11px', color: '#555' }}>
                            {log.coordinates.lat.toFixed(2)}, {log.coordinates.lon.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ) : log.location && log.location !== "Unknown" ? (
                      <div>
                        <span style={{ color: '#ccc', display: 'block', fontWeight: 500 }}>{log.location}</span>
                        {log.coordinates?.lat && (
                          <span style={{ fontSize: '11px', color: '#555' }}>
                            {log.coordinates.lat.toFixed(2)}, {log.coordinates.lon.toFixed(2)}
                          </span>
                        )}
                      </div>
                    ) : log.coordinates?.lat ? (
                      <span style={{ fontSize: 12, color: '#888' }}>
                        {log.coordinates.lat.toFixed(2)}, {log.coordinates.lon.toFixed(2)}
                      </span>
                    ) : (
                      <span style={{ color: '#333' }}>-</span>
                    )}
                  </td>
                  <td style={{color: '#ff69b4', fontSize: 12, fontWeight: 600}}>
                    {formatDate(log.time)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredLogs.length === 0 && (
             <div style={{padding:60, textAlign:'center', color:'#444', fontWeight:600}}>No logs found matching your criteria.</div>
          )}
        </div>

        {/* LOAD MORE PAGINATION */}
        {filteredLogs.length > visibleCount && (
          <div className="la-load-more-container">
            <button className="la-btn-x30sn" onClick={() => setVisibleCount(prev => prev + 25)}>
              Load More Sessions
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default LoginActivityAdmin;