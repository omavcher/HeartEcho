'use client';
import { useState, useEffect, useCallback, useRef } from "react";
import axios from "axios";
import {
  Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid, AreaChart, Area,
  BarChart, Bar, Legend, PieChart, Pie, Cell
} from "recharts";
import {
  FaUsers, FaMoneyBillWave, FaEnvelope, FaUserCheck, FaChartLine, FaMobileAlt, FaDesktop, FaMapMarkerAlt
} from "react-icons/fa";
import { IoMdRefresh } from "react-icons/io";
import api from "../../config/api";
import "mapbox-gl/dist/mapbox-gl.css";

const MAPBOX_TOKEN = "pk.eyJ1Ijoib21hd2NoYXIwNyIsImEiOiJjbHlmbGtwdmowMHhkMmtxeXAyNXdkeHB3In0.37j_dk9NgxtiPXqwCgsdQg";

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
@media (max-width: 600px) {
  .chart-grid-layout-x30sn {
    grid-template-columns: 1fr;
  }
}

.mapboxgl-popup-content {
  background: #000 !important;
  color: #fff !important;
  border: 1px solid #333 !important;
  border-radius: 8px !important;
  font-family: 'Inter', sans-serif !important;
}

.mapboxgl-popup-tip {
  border-top-color: #000 !important;
  border-bottom-color: #000 !important;
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
    countryBreakdown: [],
    userMapData: [] 
  });

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [graphData, setGraphData] = useState({ revenueTrend: [] });
  const [loading, setLoading] = useState(true);
  const [conversionData, setConversionData] = useState([]);
  const [conversionType, setConversionType] = useState("daily");
  const [notification, setNotification] = useState({ show: false, message: "", type: "error" });
  const [deviceStats, setDeviceStats] = useState({ mobileUsers: 0, webUsers: 0 });

  // Stable reference for onClose — prevents PopNoti's useEffect from firing on every parent re-render
  const handleCloseNotification = useCallback(() => {
    setNotification(p => ({ ...p, show: false }));
  }, []);

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
        countryBreakdown: data.countryBreakdown || [],
        userMapData: data.userMapData || []
      });

      const revenueTrendMapped = data.revenueTrend?.map(item => ({
        date: item._id ? new Date(item._id).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'N/A',
        revenue: Math.round(item.totalInINR || 0)
      })) || [];

      setGraphData({ revenueTrend: revenueTrendMapped });
      setNotification({ show: true, message: "Dashboard Updated", type: "success" });
      setTimeout(() => {
        setNotification(p => ({ ...p, show: false }));
      }, 4000);
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

  // Map init effect - fires when loading transitions from true to false
  useEffect(() => {
    if (loading) return;

    // Delay so React finishes painting the DOM before we touch the canvas
    const timer = setTimeout(() => {
      if (!mapContainerRef.current) return;

      // Clean up any previous map instance
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch(e) {}
        mapInstanceRef.current = null;
      }

      import("mapbox-gl").then((mapboxglModule) => {
        const mapboxgl = mapboxglModule.default;
        mapboxgl.accessToken = MAPBOX_TOKEN;

        const container = mapContainerRef.current;
        if (!container) return;

        // Validate coords
        const validCoords = (statsData.userMapData || []).filter(d => 
          d && typeof d.lat === 'number' && typeof d.lon === 'number' && 
          !isNaN(d.lat) && !isNaN(d.lon)
        );

        // Set center: average of all user locations, fallback India
        let center = [78.9629, 20.5937];
        if (validCoords.length > 0) {
          const sumLat = validCoords.reduce((sum, d) => sum + d.lat, 0);
          const sumLon = validCoords.reduce((sum, d) => sum + d.lon, 0);
          center = [sumLon / validCoords.length, sumLat / validCoords.length];
        }

        const map = new mapboxgl.Map({
          container: container,
          style: "mapbox://styles/mapbox/dark-v11",
          center: center,
          zoom: validCoords.length > 0 ? 4 : 3.5,
          attributionControl: false
        });

        mapInstanceRef.current = map;
        map.addControl(new mapboxgl.NavigationControl(), "top-right");
        map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

        map.on('load', () => {
          if (!mapInstanceRef.current) return;

          // Convert coordinates data to GeoJSON Format
          const geojson = {
            type: 'FeatureCollection',
            features: validCoords.map(city => ({
              type: 'Feature',
              properties: {
                cityName: city.cityName || 'Unknown',
                count: city.count || 1,
                paidCount: city.paidCount || 0
              },
              geometry: {
                type: 'Point',
                coordinates: [city.lon, city.lat]
              }
            }))
          };

          map.addSource('user-locations', {
            type: 'geojson',
            data: geojson
          });

          // 1. Density outer glow layer
          map.addLayer({
            id: 'user-glow',
            type: 'circle',
            source: 'user-locations',
            paint: {
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                2, ['interpolate', ['linear'], ['get', 'count'], 1, 14, 10, 24, 50, 38],
                6, ['interpolate', ['linear'], ['get', 'count'], 1, 24, 10, 38, 50, 52]
              ],
              'circle-color': [
                'case',
                ['>', ['get', 'paidCount'], 0],
                '#ffd700',
                '#ff69b4'
              ],
              'circle-opacity': 0.18,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': [
                'case',
                ['>', ['get', 'paidCount'], 0],
                'rgba(255, 215, 0, 0.45)',
                'rgba(255, 105, 180, 0.45)'
              ],
            }
          });

          // 2. Inner core pin layer
          map.addLayer({
            id: 'user-core',
            type: 'circle',
            source: 'user-locations',
            paint: {
              'circle-radius': [
                'interpolate', ['linear'], ['zoom'],
                2, ['interpolate', ['linear'], ['get', 'count'], 1, 5, 10, 8, 50, 11],
                6, ['interpolate', ['linear'], ['get', 'count'], 1, 7, 10, 11, 50, 15]
              ],
              'circle-color': [
                'case',
                ['>', ['get', 'paidCount'], 0],
                '#ffd700',
                '#ff69b4'
              ],
              'circle-opacity': 0.9,
              'circle-stroke-width': 1.5,
              'circle-stroke-color': [
                'case',
                ['>', ['get', 'paidCount'], 0],
                '#ffd700',
                '#ffffff'
              ],
            }
          });

          // 3. Precise typography label layer
          map.addLayer({
            id: 'user-labels',
            type: 'symbol',
            source: 'user-locations',
            layout: {
              'text-field': ['concat', ['get', 'cityName'], ' (', ['to-string', ['get', 'count']], ')'],
              'text-size': 11,
              'text-offset': [0, 1.5],
              'text-anchor': 'top',
              'text-optional': true,
              'text-allow-overlap': false
            },
            paint: {
              'text-color': [
                'case',
                ['>', ['get', 'paidCount'], 0],
                '#ffd700',
                '#ffffff'
              ],
              'text-halo-color': 'rgba(0,0,0,0.85)',
              'text-halo-width': 1.5
            }
          });

          // Reusable popup instance
          const popup = new mapboxgl.Popup({
            closeButton: false,
            closeOnClick: false,
            offset: 15
          });

          // Hover interaction handlers
          map.on('mouseenter', 'user-core', (e) => {
            map.getCanvas().style.cursor = 'pointer';
            
            const coordinates = e.features[0].geometry.coordinates.slice();
            const { cityName, count, paidCount: rawPaidCount } = e.features[0].properties;
            const paidCount = Number(rawPaidCount || 0);
            
            while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
              coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
            }

            popup.setLngLat(coordinates)
              .setHTML(`
                <div style="color:#fff; padding: 4px;">
                  <div style="font-size:14px; font-weight:700; color:${paidCount > 0 ? '#ffd700' : '#ff69b4'}; margin-bottom:4px;">📍 ${cityName}</div>
                  <div style="font-size:13px; color:#ccc;">${count} active user${count > 1 ? 's' : ''} here</div>
                  ${paidCount > 0 ? `<div style="font-size:12px; color:#ffd700; font-weight:600; margin-top:4px; display:flex; align-items:center; gap:4px;">👑 ${paidCount} Premium Subscriber${paidCount > 1 ? 's' : ''}</div>` : ''}
                </div>
              `)
              .addTo(map);
          });

          map.on('mouseleave', 'user-core', () => {
            map.getCanvas().style.cursor = '';
            popup.remove();
          });
        });

        // Add pulse animation to document if not already there
        if (!document.getElementById('mapPulseStyle')) {
          const style = document.createElement('style');
          style.id = 'mapPulseStyle';
          style.textContent = `
            @keyframes mapPulse {
              0%, 100% { transform: scale(1); opacity: 1; }
              50% { transform: scale(1.15); opacity: 0.7; }
            }
          `;
          document.head.appendChild(style);
        }

      }).catch((err) => {
        console.error("Error loading mapbox-gl dynamically:", err);
      });
    }, 300);

    return () => {
      clearTimeout(timer);
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove(); } catch(e) {}
        mapInstanceRef.current = null;
      }
    };
  }, [loading, statsData.userMapData]);

  // Top N cities for the sidebar list
  const topCities = [...(statsData.userMapData || [])]
    .filter(d => d.cityName)
    .sort((a, b) => (b.count || 0) - (a.count || 0))
    .slice(0, 8);

  const totalMapUsers = topCities.reduce((s, c) => s + (c.count || 0), 0);

  return (
    <>
      <style>{dashboardStyles}</style>
      <style>{`
        @keyframes popNotiEnter {
          0% { opacity: 0; transform: translateY(-100px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
      <div className="dash-container-x30sn">
        {notification.show && (
          <div style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 10000,
            background: notification.type === 'success' ? 'rgba(52, 199, 89, 0.95)' : 'rgba(255, 59, 48, 0.95)',
            color: 'white',
            borderRadius: '14px',
            padding: '16px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Inter", sans-serif',
            animation: 'popNotiEnter 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards'
          }}>
            <span style={{ fontSize: '18px' }}>{notification.type === 'success' ? '✅' : '❌'}</span>
            <span style={{ fontWeight: 600, fontSize: '14px' }}>{notification.message}</span>
            <button 
              onClick={handleCloseNotification} 
              style={{
                marginLeft: '8px',
                background: 'rgba(255, 255, 255, 0.2)',
                border: 'none',
                borderRadius: '6px',
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                cursor: 'pointer',
                fontSize: '11px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.3)'}
              onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            >✕</button>
          </div>
        )}
        
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

            {/* Stat Cards */}
            <div className="dash-grid-x30sn">
              <div className="stat-card-x30sn">
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn"><FaUsers /></div>
                  <span className="stat-label-x30sn">Total Users</span>
                </div>
                <h3 className="stat-value-x30sn">{statsData.totalUsers}</h3>
              </div>
              
              <div className="stat-card-x30sn">
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn"><FaUserCheck /></div>
                  <span className="stat-label-x30sn">Active Users</span>
                </div>
                <h3 className="stat-value-x30sn">{statsData.activeUsers} <span style={{fontSize:14, color:'#ff69b4'}}>({safeCalculatePercentage(statsData.activeUsers, statsData.totalUsers).toFixed(0)}%)</span></h3>
              </div>

              <div className="stat-card-x30sn">
                <div className="stat-header-x30sn">
                  <div className="stat-icon-x30sn"><FaEnvelope /></div>
                  <span className="stat-label-x30sn">Messages</span>
                </div>
                <h3 className="stat-value-x30sn">{statsData.messagesSent}</h3>
              </div>

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

            {/* Device Stats */}
            <div className="dash-grid-x30sn" style={{marginBottom: 30}}>
              <div className="stat-card-x30sn">
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

            {/* ======== FULL-WIDTH USER DENSITY MAP (MOVED UP & PROMINENT) ======== */}
            <div style={{
              background: '#0a0a0a',
              border: '1px solid #222',
              borderRadius: '20px',
              padding: '28px',
              marginBottom: '24px',
              overflow: 'hidden'
            }}>
              {/* Map Header */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '40px', height: '40px',
                    background: 'rgba(255,105,180,0.15)',
                    borderRadius: '12px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#ff69b4', fontSize: '18px'
                  }}>
                    <FaMapMarkerAlt />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>User Density by City</h3>
                    <p style={{ margin: '2px 0 0', fontSize: '13px', color: '#666' }}>
                      {topCities.length > 0 ? `${topCities.length} cities tracked · ${totalMapUsers} active users` : 'Real-time user distribution'}
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff69b4', boxShadow: '0 0 8px #ff69b4' }} />
                  <span style={{ fontSize: '12px', color: '#888' }}>Active City</span>
                </div>
              </div>

              {/* Map + City List Layout */}
              <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch', minHeight: '460px' }}>
                
                {/* Map Container — takes full width minus sidebar */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    ref={mapContainerRef}
                    style={{
                      width: '100%',
                      height: '460px',
                      borderRadius: '14px',
                      border: '1px solid #1a1a1a',
                      overflow: 'hidden',
                      background: '#111',
                      position: 'relative'
                    }}
                  />
                </div>

                {/* City Leaderboard Sidebar */}
                <div style={{
                  width: '220px',
                  flexShrink: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
                    Top Cities
                  </div>
                  {topCities.length > 0 ? topCities.map((city, idx) => {
                    const pct = totalMapUsers > 0 ? ((city.count / totalMapUsers) * 100).toFixed(0) : 0;
                    const colors = ['#ff69b4', '#ff8cc8', '#ff3d9a', '#e040fb', '#ce93d8', '#ff69b4', '#c2185b', '#ad1457'];
                    const hasPaid = city.paidCount > 0;
                    return (
                      <div key={idx} style={{
                        background: '#111',
                        border: hasPaid ? '1px solid rgba(255, 215, 0, 0.35)' : '1px solid #1e1e1e',
                        boxShadow: hasPaid ? '0 0 10px rgba(255, 215, 0, 0.05)' : 'none',
                        borderRadius: '10px',
                        padding: '10px 12px'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                            <div style={{
                              width: '8px', height: '8px',
                              borderRadius: '50%',
                              background: hasPaid ? '#ffd700' : colors[idx % colors.length],
                              boxShadow: hasPaid ? '0 0 5px #ffd700' : `0 0 5px ${colors[idx % colors.length]}`
                            }} />
                            <span style={{ color: hasPaid ? '#ffd700' : '#e0e0e0', fontSize: '13px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              {city.cityName} {hasPaid && <span title="Premium subscriber in city">👑</span>}
                            </span>
                          </div>
                          <span style={{ color: hasPaid ? '#ffd700' : '#ff69b4', fontSize: '12px', fontWeight: 700 }}>
                            {city.count}
                          </span>
                        </div>
                        {/* Progress bar */}
                        <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            background: hasPaid ? 'linear-gradient(90deg, #ffd700, #ffa500)' : `linear-gradient(90deg, ${colors[idx % colors.length]}, ${colors[(idx + 1) % colors.length]})`,
                            borderRadius: '2px',
                            transition: 'width 1s ease'
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                          <span style={{ fontSize: '11px', color: '#555' }}>{pct}% of active users</span>
                          {hasPaid && (
                            <span style={{ fontSize: '10px', color: '#ffd700', fontWeight: 'bold' }}>
                              {city.paidCount} Paid
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  }) : (
                    <div style={{ color: '#444', fontSize: '13px', padding: '10px', textAlign: 'center' }}>
                      No city data yet.<br/>Users will appear after they log in.
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Charts Grid */}
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

              {/* Country Breakdown — simplified table, full width */}
              <div className="chart-section-x30sn" style={{ gridColumn: '1 / -1' }}>
                <div className="chart-head-x30sn">
                  <FaUsers style={{color:'#ff69b4'}} />
                  <h3>User Distribution by Country</h3>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '40px', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: '260px', height: '260px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={statsData.countryBreakdown}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={100}
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
                  <div style={{ flex: '1', minWidth: '280px' }}>
                    {statsData.countryBreakdown.map((item, idx) => (
                      <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #1a1a1a' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: [ '#ff69b4', '#ffffff', '#888888', '#ff1493', '#ffc0cb' ][idx % 5] }}></div>
                          <span style={{ color: '#e0e0e0', fontSize: '15px' }}>{item.country}</span>
                        </div>
                        <div>
                          <span style={{ color: '#ff69b4', fontSize: '15px', fontWeight: 700, marginRight: 8 }}>{item.count} Users</span>
                          <span style={{ fontSize: '14px', color: '#666' }}>{item.percentage}%</span>
                        </div>
                      </div>
                    ))}
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