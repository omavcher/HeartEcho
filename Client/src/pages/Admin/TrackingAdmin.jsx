'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../config/api";
import { 
  FaSync, FaFilter, FaChartLine, FaMousePointer, 
  FaUsers, FaEye, FaShoppingBag, FaRobot, FaMobileAlt, FaDesktop
} from "react-icons/fa";
import { MdAdsClick } from "react-icons/md";
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend
} from "recharts";

// ------------------- CSS STYLES FOR TRACKING & ANALYTICS -------------------
const trackStyles = `
/* ROOT THEME */
.track-root-x30sn {
  color: #fff;
  font-family: 'Inter', sans-serif;
  animation: fadeIn-x30sn 0.5s ease;
}
@keyframes fadeIn-x30sn { from { opacity: 0; } to { opacity: 1; } }

/* HEADER */
.t-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; flex-wrap: wrap; gap: 15px;
}
.t-title-x30sn { font-size: 28px; font-weight: 800; color: #fff; margin: 0; }
.t-tagline-x30sn { color: #ff69b4; font-size: 13px; font-weight: 500; }

.t-sync-btn-x30sn {
  background: #000; border: 1px solid #333; color: #ff69b4; width: 42px; height: 42px;
  border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.t-sync-btn-x30sn:hover { background: #1a1a1a; transform: rotate(180deg); border-color: #ff69b4; }

/* KPI STRIP */
.kpi-strip-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;
}
.kpi-box-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 12px; padding: 20px; 
  display: flex; align-items: center; gap: 15px;
  transition: transform 0.2s, box-shadow 0.2s;
}
.kpi-box-x30sn:hover { transform: translateY(-3px); border-color: #ff69b4; box-shadow: 0 10px 20px rgba(0,0,0,0.3); }
.kpi-ico-x30sn {
  width: 50px; height: 50px; background: rgba(255,105,180,0.1); color: #ff69b4; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.kpi-txt-x30sn span { display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px; }
.kpi-txt-x30sn strong { font-size: 24px; color: #fff; font-weight: 800; }

/* CONTROLS */
.controls-x30sn {
  display: flex; gap: 15px; margin-bottom: 25px; flex-wrap: wrap; align-items: center;
  background: #050505; padding: 15px 20px; border-radius: 12px; border: 1px solid #222;
}
.search-wrap-x30sn {
  position: relative; flex: 1; min-width: 250px;
}
.date-inp-x30sn, .filter-sel-x30sn {
  background: #000; padding: 10px 15px; border: 1px solid #333; color: #fff;
  border-radius: 8px; outline: none; font-size: 13px; transition: 0.2s; color-scheme: dark;
}
.date-inp-x30sn:focus, .filter-sel-x30sn:focus { border-color: #ff69b4; }
.ctrl-lbl-x30sn { font-size: 11px; color: #666; text-transform: uppercase; padding-right: 8px; font-weight: 600; }

/* ANALYTICS GRID */
.analytics-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}
.chart-card-x30sn {
  background: #050505;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 20px;
  height: 320px;
  position: relative;
  overflow: hidden;
}
.chart-title-x30sn {
  font-size: 16px; font-weight: 600; color: #ddd; margin-bottom: 15px;
  display: flex; align-items: center; gap: 8px; justify-content: space-between;
}
.chart-title-icon-x30sn { display: flex; align-items: center; gap: 8px; }
.chart-title-icon-x30sn svg { color: #ff69b4; }

/* RECENT ACTIVITY TABLE */
.recent-events-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px;
}
.re-table-wrap { overflow-x: auto; margin-top: 15px; }
.re-table { width: 100%; text-align: left; border-collapse: collapse; min-width: 900px; }
.re-table th { padding: 12px 15px; color: #ff69b4; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #333; font-weight: 600; }
.re-table td { padding: 15px; border-bottom: 1px solid #1a1a1a; color: #ddd; font-size: 13px; vertical-align: middle; }
.re-table tr:hover td { background: #0a0a0a; }

.tag-x30sn { background: #111; border: 1px solid #333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: inline-flex; align-items: center; gap: 5px; }
.tag-fw { color: #fff; }
.tag-pv { color: #00bcd4; background: rgba(0, 188, 212, 0.1); border-color: rgba(0, 188, 212, 0.2); }
.tag-cl { color: #8bc34a; background: rgba(139, 195, 74, 0.1); border-color: rgba(139, 195, 74, 0.2); }
.tag-fc { color: #ffeb3b; background: rgba(255, 235, 59, 0.1); border-color: rgba(255, 235, 59, 0.2); }
.tag-sc { color: #ff69b4; background: rgba(255, 105, 180, 0.1); border-color: rgba(255, 105, 180, 0.2); }
.tag-ic { color: #ff9800; background: rgba(255, 152, 0, 0.1); border-color: rgba(255, 152, 0, 0.2); }
.tag-ls { color: #9c27b0; background: rgba(156, 39, 176, 0.1); border-color: rgba(156, 39, 176, 0.2); }

.code-block-x30sn {
  background: #000; border: 1px solid #222; padding: 8px; border-radius: 6px; 
  font-family: monospace; font-size: 11px; color: #aaa; max-height: 80px; overflow-y: auto;
  white-space: pre-wrap; word-break: break-all;
}

.user-cell-x30sn {
  display: flex; align-items: center; gap: 10px;
}
.user-avatar-x30sn {
  width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #333;
}
.user-type-badge {
  font-size: 9px; padding: 2px 6px; border-radius: 10px; margin-top: 2px;
  display: inline-block; text-transform: uppercase; font-weight: bold;
}
.ut-paid { background: #ff69b4; color: #000; }
.ut-free { background: #333; color: #aaa; }

/* PAGINATION */
.pg-wrap-x30sn { display: flex; justify-content: center; gap: 15px; margin-top: 20px; align-items: center; }
.pg-btn-x30sn { 
    background: #000; border: 1px solid #333; color: #fff; padding: 8px 18px; 
    border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 13px;
}
.pg-btn-x30sn:hover:not(:disabled) { border-color: #ff69b4; color: #ff69b4; }
.pg-btn-x30sn:disabled { opacity: 0.3; cursor: not-allowed; }

/* LOADING */
.loader-x30sn { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #444; }
.spinner-x30sn { width: 30px; height: 30px; border: 2px solid #222; border-top-color: #ff69b4; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* UTMS */
.utm-pill { background: rgba(255, 105, 180, 0.1); border: 1px solid rgba(255, 105, 180, 0.3); color: #ff69b4; padding: 2px 6px; border-radius: 4px; font-size: 9px; margin-right: 4px; display: inline-block; margin-top: 4px; }
`;

const COLORS = ['#ff69b4', '#00bcd4', '#8bc34a', '#ff9800', '#ffeb3b', '#9c27b0'];
const DEVICE_COLORS = ['#3f51b5', '#e91e63', '#009688'];

export default function TrackingAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filter, setFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    eventType: "",
    page: 1,
    limit: 50
  });

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem("token") : "";
      const res = await axios.get(`${api.Url}/tracking/analytics`, {
        params: filter,
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
      setError(null);
    } catch (err) {
      setError(err.response?.data?.error || "Error fetching analytics data");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const handleFilterChange = (e) => {
    setFilter({ ...filter, [e.target.name]: e.target.value, page: 1 }); // reset page on filter change
  };

  const setPage = (newPage) => {
    setFilter(prev => ({ ...prev, page: newPage }));
  };

  const getTagClass = (type) => {
    switch(type) {
      case 'page_view': return 'tag-pv';
      case 'click': return 'tag-cl';
      case 'funnel_click': return 'tag-fc';
      case 'signup_complete': return 'tag-sc';
      case 'initiate_checkout': return 'tag-ic';
      case 'login_success': return 'tag-ls';
      default: return 'tag-fw';
    }
  };

  const getIconForType = (type) => {
    switch(type) {
      case 'page_view': return <FaEye />;
      case 'click': return <MdAdsClick />;
      case 'funnel_click': return <FaMousePointer />;
      case 'signup_complete': return <FaUsers />;
      case 'initiate_checkout': return <FaShoppingBag />;
      case 'login_success': return <FaRobot />;
      default: return <FaChartLine />;
    }
  };

  // Recharts formatters
  const barChartData = useMemo(() => {
    if (!data?.eventCounts) return [];
    return data.eventCounts.slice(0, 10).map(e => ({
      name: e._id.replace('_', ' ').toUpperCase(),
      amt: e.count
    }));
  }, [data]);

  const timeSeriesData = useMemo(() => {
    if (!data?.timeSeriesData) return [];
    return data.timeSeriesData.map(d => ({
        name: new Date(d._id).toLocaleDateString([], { month: 'short', day: 'numeric' }),
        events: d.count
    }));
  }, [data]);

  const userStatsData = useMemo(() => {
      if (!data?.userStats) return [];
      return data.userStats.map(u => ({
          name: u._id === 'subscriber' ? 'Paid Users' : 'Free Users',
          value: u.count
      }));
  }, [data]);

  const deviceData = useMemo(() => {
      if (!data?.deviceStats) return [];
      return data.deviceStats.map(d => ({
          name: d._id,
          value: d.count
      }));
  }, [data]);

  const sourceData = useMemo(() => {
      if (!data?.sourceStats) return [];
      return data.sourceStats.map(s => ({
          name: s._id,
          amt: s.count
      }));
  }, [data]);

  return (
    <>
      <style>{trackStyles}</style>
      <div className="track-root-x30sn">
        
        {/* HEADER */}
        <header className="t-header-x30sn">
          <div>
            <h1 className="t-title-x30sn">Tracking & Funnel Analytics</h1>
            <span className="t-tagline-x30sn">Monitor acquisition funnels, user behavior, AD campaigns, and transactions natively.</span>
          </div>
          <button className="t-sync-btn-x30sn" onClick={fetchAnalytics} title="Sync Analytics"><FaSync /></button>
        </header>

        {/* CONTROLS */}
        <div className="controls-x30sn">
          <FaFilter style={{color: '#ff69b4'}} />
          <div>
            <span className="ctrl-lbl-x30sn">From</span>
            <input type="date" className="date-inp-x30sn" name="startDate" value={filter.startDate} onChange={handleFilterChange} />
          </div>
          <div>
            <span className="ctrl-lbl-x30sn">To</span>
            <input type="date" className="date-inp-x30sn" name="endDate" value={filter.endDate} onChange={handleFilterChange} />
          </div>
          <div>
            <span className="ctrl-lbl-x30sn">Event Filter</span>
            <select className="filter-sel-x30sn" name="eventType" value={filter.eventType} onChange={handleFilterChange}>
              <option value="">All Events</option>
              <option value="page_view">Page Views</option>
              <option value="click">Clicks</option>
              <option value="funnel_click">Funnel Clicks</option>
              <option value="initiate_checkout">Initiate Checkout</option>
              <option value="signup_complete">Signup Complete</option>
              <option value="login_success">Logins</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loader-x30sn"><div className="spinner-x30sn"></div><p>Aggregating Millions of Metrics...</p></div>
        ) : error ? (
          <div style={{ color: '#ff4444', padding: '20px', background: 'rgba(255,68,68,0.1)', borderRadius: 10, border: '1px solid rgba(255,68,68,0.2)' }}>
             {error}
          </div>
        ) : data && (
          <>
            {/* KPI STRIP */}
            <div className="kpi-strip-x30sn">
              <div className="kpi-box-x30sn">
                <div className="kpi-ico-x30sn"><FaChartLine /></div>
                <div className="kpi-txt-x30sn"><span>Total Events</span><strong>{data.totalEventsExtracted.toLocaleString()}</strong></div>
              </div>
              
              {data.eventCounts?.slice(0, 4).map((evt, idx) => (
                <div key={evt._id} className="kpi-box-x30sn">
                   <div className="kpi-ico-x30sn" style={{ color: COLORS[idx%COLORS.length], background: COLORS[idx%COLORS.length]+'1A' }}>
                      {getIconForType(evt._id)}
                   </div>
                   <div className="kpi-txt-x30sn">
                      <span>{evt._id.replace('_', ' ')}</span>
                      <strong>{evt.count.toLocaleString()}</strong>
                   </div>
                </div>
              ))}
            </div>

            {/* CHARTS GRID */}
            <div className="analytics-grid-x30sn">
                {/* Time Series Area Chart */}
                <div className="chart-card-x30sn" style={{ gridColumn: '1 / -1' }}>
                    <div className="chart-title-x30sn">
                        <span className="chart-title-icon-x30sn"><FaChartLine/> Traffic Trend (Daily)</span>
                    </div>
                    <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={timeSeriesData}>
                        <defs>
                            <linearGradient id="colorEvts" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222"/>
                        <XAxis dataKey="name" stroke="#555" fontSize={11} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{backgroundColor:'#050505', borderColor:'#333', color:'#fff'}} itemStyle={{color:'#ff69b4'}}/>
                        <Area type="monotone" dataKey="events" stroke="#ff69b4" fillOpacity={1} fill="url(#colorEvts)" strokeWidth={2}/>
                    </AreaChart>
                    </ResponsiveContainer>
                </div>

              {/* Event Distribution Bar */}
              <div className="chart-card-x30sn">
                <div className="chart-title-x30sn">
                    <span className="chart-title-icon-x30sn"><FaRobot/> Top Events Triggered</span>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222"/>
                    <XAxis dataKey="name" stroke="#555" fontSize={9} axisLine={false} tickLine={false}/>
                    <Tooltip cursor={{fill: '#111'}} contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}}/>
                    <Bar dataKey="amt" fill="#ff69b4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

               {/* Traffic Sources Bar */}
               <div className="chart-card-x30sn">
                <div className="chart-title-x30sn">
                    <span className="chart-title-icon-x30sn"><MdAdsClick/> Top Paid Ads/UTM Sources</span>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={sourceData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#222"/>
                    <XAxis type="number" stroke="#555" fontSize={10} axisLine={false} tickLine={false}/>
                    <YAxis dataKey="name" type="category" stroke="#888" fontSize={10} width={80} axisLine={false} tickLine={false}/>
                    <Tooltip cursor={{fill: '#111'}} contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}}/>
                    <Bar dataKey="amt" fill="#00bcd4" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Composition Pie - Users Paid vs Free */}
              <div className="chart-card-x30sn">
                <div className="chart-title-x30sn">
                    <span className="chart-title-icon-x30sn"><FaUsers/> Authenticated Audience Type</span>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                        <Pie 
                            data={userStatsData} 
                            cx="50%" cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                        >
                            {userStatsData.map((entry, index) => (
                                <Cell key={index} fill={index === 0 ? '#ff69b4' : '#333'} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}}/>
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: '#aaa'}} />
                    </PieChart>
                </ResponsiveContainer>
              </div>

               {/* Composition Pie - Devices */}
               <div className="chart-card-x30sn">
                <div className="chart-title-x30sn">
                    <span className="chart-title-icon-x30sn"><FaMobileAlt/> Device Platforms</span>
                </div>
                <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                        <Pie 
                            data={deviceData} 
                            cx="50%" cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                        >
                            {deviceData.map((entry, index) => (
                                <Cell key={index} fill={DEVICE_COLORS[index % DEVICE_COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}}/>
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: '#aaa'}} />
                    </PieChart>
                </ResponsiveContainer>
              </div>

            </div>
            
            {/* RECENT EVENTS TABLE WITH PAGINATION */}
            <div className="recent-events-x30sn">
              <div className="chart-title-x30sn">
                <span className="chart-title-icon-x30sn"><FaRobot/> High-Priority Live Log Feed</span>
                <span style={{ fontSize: 12, color: '#666', fontWeight: 400 }}>Showing {data.recentEvents.length} events</span>
              </div>
              <div className="re-table-wrap">
                <table className="re-table">
                  <thead>
                    <tr>
                      <th>Event Type</th>
                      <th>User Account</th>
                      <th>Time & IP Context</th>
                      <th>Path & UTM Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents?.map(ev => {
                       const utms = Object.keys(ev.eventData || {}).filter(k => k.startsWith('utm_') || k === 'fbclid');
                       
                       return (
                      <tr key={ev._id}>
                        <td>
                          <span className={`tag-x30sn ${getTagClass(ev.eventType)}`}>
                            {getIconForType(ev.eventType)} {ev.eventType.replace('_', ' ')}
                          </span>
                          <div style={{ marginTop: 8, fontSize: 11, color: '#666' }}>Browser: {ev.deviceType}</div>
                        </td>
                        
                        <td>
                          {ev.user ? (
                             <div className="user-cell-x30sn">
                                <img src={ev.user.profile_picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} className="user-avatar-x30sn" alt="avatar" />
                                <div>
                                   <div style={{ fontWeight: 600, color: '#fff' }}>{ev.user.name}</div>
                                   <div style={{ fontSize: 10, color: '#aaa' }}>{ev.user.email}</div>
                                   <span className={`user-type-badge ${ev.user.user_type === 'subscriber' ? 'ut-paid' : 'ut-free'}`}>
                                      {ev.user.user_type === 'subscriber' ? 'Premium (Paid)' : 'Free User'}
                                   </span>
                                </div>
                             </div>
                          ) : (
                             <span style={{ color: '#555', fontStyle: 'italic', fontSize: 12 }}>Anonymous / Guest</span>
                          )}
                          <div style={{ fontSize: 10, color: '#444', marginTop: 5 }}>Session: {ev.sessionId.substring(0,18)}...</div>
                        </td>

                        <td style={{ color: '#aaa' }}>
                           <div>{new Date(ev.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}</div>
                           <div style={{ fontSize: 10, color: '#555', marginTop: 4 }}>IP: {ev.ip?.split(',')[0]}</div>
                        </td>

                        <td style={{ wordBreak: 'break-all' }}>
                          <div style={{ color: '#00bcd4', fontWeight: 500, marginBottom: 4 }}>{ev.path}</div>
                          
                          {utms.length > 0 && (
                             <div style={{ marginBottom: 6 }}>
                                {utms.map(k => (
                                   <span key={k} className="utm-pill"><strong>{k.replace('utm_','')}:</strong> {ev.eventData[k]}</span>
                                ))}
                             </div>
                          )}

                          <div className="code-block-x30sn">
                             {JSON.stringify(Object.fromEntries(Object.entries(ev.eventData || {}).filter(([k]) => !k.startsWith('utm_') && k !== 'fbclid')), null, 2)}
                          </div>
                        </td>
                      </tr>
                    )})}
                    {data.recentEvents?.length === 0 && (
                      <tr><td colSpan="4" style={{ textAlign: 'center', padding: '50px', color: '#555', fontSize: 18 }}>No matching analytics logs found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination Controls */}
              {data.totalPages > 1 && (
                <div className="pg-wrap-x30sn">
                    <button className="pg-btn-x30sn" disabled={data.currentPage <= 1} onClick={() => setPage(data.currentPage - 1)}>Prev Page</button>
                    <span style={{color:'#888', fontSize:13, fontWeight:600}}>
                        Page <span style={{color: '#fff'}}>{data.currentPage}</span> of {data.totalPages}
                    </span>
                    <button className="pg-btn-x30sn" disabled={data.currentPage >= data.totalPages} onClick={() => setPage(data.currentPage + 1)}>Next Page</button>
                </div>
              )}
            </div>

          </>
        )}
      </div>
    </>
  );
}
