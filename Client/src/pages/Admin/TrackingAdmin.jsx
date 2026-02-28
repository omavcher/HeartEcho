'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../config/api";
import { 
  FaSync, FaFilter, FaChartLine, FaMousePointer, 
  FaUsers, FaEye, FaShoppingBag, FaRobot
} from "react-icons/fa";
import { MdAdsClick } from "react-icons/md";
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, CartesianGrid,
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
  display: flex; align-items: center; gap: 8px;
}
.chart-title-x30sn svg { color: #ff69b4; }

/* RECENT ACTIVITY TABLE */
.recent-events-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px;
}
.re-table-wrap { overflow-x: auto; margin-top: 15px; }
.re-table { width: 100%; text-align: left; border-collapse: collapse; min-width: 700px; }
.re-table th { padding: 12px 15px; color: #ff69b4; font-size: 12px; text-transform: uppercase; border-bottom: 1px solid #333; font-weight: 600; }
.re-table td { padding: 15px; border-bottom: 1px solid #1a1a1a; color: #ddd; font-size: 13px; vertical-align: middle; }
.re-table tr:hover td { background: #0a0a0a; }

.tag-x30sn { background: #111; border: 1px solid #333; padding: 4px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; display: inline-block; }
.tag-fw { color: #fff; }
.tag-pv { color: #00bcd4; background: rgba(0, 188, 212, 0.1); border-color: rgba(0, 188, 212, 0.2); }
.tag-cl { color: #8bc34a; background: rgba(139, 195, 74, 0.1); border-color: rgba(139, 195, 74, 0.2); }
.tag-fc { color: #ffeb3b; background: rgba(255, 235, 59, 0.1); border-color: rgba(255, 235, 59, 0.2); }
.tag-sc { color: #ff69b4; background: rgba(255, 105, 180, 0.1); border-color: rgba(255, 105, 180, 0.2); }
.tag-ic { color: #ff9800; background: rgba(255, 152, 0, 0.1); border-color: rgba(255, 152, 0, 0.2); }

.code-block-x30sn {
  background: #000; border: 1px solid #222; padding: 8px; border-radius: 6px; 
  font-family: monospace; font-size: 11px; color: #aaa; max-height: 50px; overflow-y: auto;
  white-space: pre-wrap; word-break: break-all;
}

/* LOADING */
.loader-x30sn { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #444; }
.spinner-x30sn { width: 30px; height: 30px; border: 2px solid #222; border-top-color: #ff69b4; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
`;

const COLORS = ['#ff69b4', '#00bcd4', '#8bc34a', '#ff9800', '#ffeb3b', '#e91e63'];

export default function TrackingAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filter, setFilter] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    eventType: ""
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
    setFilter({ ...filter, [e.target.name]: e.target.value });
  };

  const getTagClass = (type) => {
    switch(type) {
      case 'page_view': return 'tag-pv';
      case 'click': return 'tag-cl';
      case 'funnel_click': return 'tag-fc';
      case 'signup_complete': return 'tag-sc';
      case 'initiate_checkout': return 'tag-ic';
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
      default: return <FaChartLine />;
    }
  };

  // Memoized Chart Data Formatting
  const barChartData = useMemo(() => {
    if (!data?.eventCounts) return [];
    return data.eventCounts.map(e => ({
      name: e._id.replace('_', ' ').toUpperCase(),
      amt: e.count
    }));
  }, [data]);

  const pieChartData = useMemo(() => {
    if (!data?.eventCounts) return [];
    return data.eventCounts.map(e => ({
      name: e._id.replace('_', ' ').toUpperCase(),
      value: e.count
    }));
  }, [data]);

  // Try extracting daily trends from recent events (Simplified mock aggregation)
  const lineChartData = useMemo(() => {
    if (!data?.recentEvents) return [];
    const datesMap = {};
    [...data.recentEvents].reverse().forEach(ev => {
      const day = new Date(ev.createdAt).toLocaleDateString();
      datesMap[day] = (datesMap[day] || 0) + 1;
    });
    return Object.keys(datesMap).map(k => ({ name: k, hits: datesMap[k] }));
  }, [data]);

  return (
    <>
      <style>{trackStyles}</style>
      <div className="track-root-x30sn">
        
        {/* HEADER */}
        <header className="t-header-x30sn">
          <div>
            <h1 className="t-title-x30sn">Tracking & Funnel Analytics</h1>
            <span className="t-tagline-x30sn">Monitor acquisition funnels, user behavior, and minide interactions securely.</span>
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
            <span className="ctrl-lbl-x30sn">Event</span>
            <select className="filter-sel-x30sn" name="eventType" value={filter.eventType} onChange={handleFilterChange}>
              <option value="">All Events</option>
              <option value="page_view">Page Views</option>
              <option value="click">Clicks</option>
              <option value="funnel_click">Funnel Clicks</option>
              <option value="initiate_checkout">Initiate Checkout</option>
              <option value="signup_complete">Signup Complete</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loader-x30sn"><div className="spinner-x30sn"></div><p>Aggregating Metrics...</p></div>
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
                <div className="kpi-txt-x30sn"><span>Total Extracted Events</span><strong>{data.totalEventsExtracted}</strong></div>
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
              {/* Event Distribution Bar */}
              <div className="chart-card-x30sn">
                <div className="chart-title-x30sn"><FaChartLine/> Event Distribution</div>
                <ResponsiveContainer width="100%" height="85%">
                  <BarChart data={barChartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222"/>
                    <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false}/>
                    <Tooltip cursor={{fill: '#111'}} contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}}/>
                    <Bar dataKey="amt" fill="#ff69b4" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Composition Pie */}
              <div className="chart-card-x30sn">
                <div className="chart-title-x30sn"><FaChartLine/> Funnel Composition</div>
                <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                        <Pie 
                            data={pieChartData} 
                            cx="50%" cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                        >
                            {pieChartData.map((entry, index) => (
                                <Cell key={index} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}}/>
                        <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 11, color: '#aaa'}} />
                    </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* RECENT EVENTS TABLE */}
            <div className="recent-events-x30sn">
              <div className="chart-title-x30sn"><FaRobot/> High-Priority Live Log Feed</div>
              <div className="re-table-wrap">
                <table className="re-table">
                  <thead>
                    <tr>
                      <th>Event Type</th>
                      <th>Time Extracted</th>
                      <th>User Path / Source Details</th>
                      <th>Device Context</th>
                      <th>Custom Payload</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentEvents?.map(ev => (
                      <tr key={ev._id}>
                        <td>
                          <span className={`tag-x30sn ${getTagClass(ev.eventType)}`}>
                            {ev.eventType.replace('_', ' ')}
                          </span>
                        </td>
                        <td style={{ color: '#888' }}>
                           {new Date(ev.createdAt).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                        </td>
                        <td style={{ wordBreak: 'break-all' }}>
                          <div style={{ color: '#fff', fontWeight: 500, marginBottom: 4 }}>{ev.path}</div>
                          {ev.referrer && <div style={{ fontSize: 10, color: '#ff69b4' }}>Ref: {ev.referrer.substring(0, 40)}...</div>}
                        </td>
                        <td>
                          <span style={{ background: '#222', padding: '4px 8px', borderRadius: 4, fontSize: 11 }}>
                             {ev.deviceType}
                          </span>
                        </td>
                        <td>
                          <div className="code-block-x30sn">
                             {JSON.stringify(ev.eventData, null, 2)}
                          </div>
                        </td>
                      </tr>
                    ))}
                    {data.recentEvents?.length === 0 && (
                      <tr><td colSpan="5" style={{ textAlign: 'center', padding: '30px', color: '#555' }}>No analytical data found for this period.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </>
        )}
      </div>
    </>
  );
}
