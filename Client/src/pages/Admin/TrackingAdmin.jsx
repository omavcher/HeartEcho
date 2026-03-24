'use client';

import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../config/api";
import {
  FaSync, FaFilter, FaChartLine, FaMousePointer,
  FaUsers, FaEye, FaShoppingBag, FaRobot, FaMobileAlt,
  FaFacebook, FaBullhorn, FaFunnelDollar, FaTrophy,
  FaArrowRight, FaGlobe, FaLink, FaUserPlus, FaCrown,
  FaInstagram, FaTag, FaAd, FaSortAmountDown
} from "react-icons/fa";
import { MdAdsClick, MdTrendingUp, MdLandscape } from "react-icons/md";
import { BiTargetLock } from "react-icons/bi";
import {
  AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  BarChart, Bar, Cell, PieChart, Pie, Legend, LineChart, Line, ComposedChart
} from "recharts";

/* ─────────── STYLES ─────────── */
const S = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
.trk-root {
  font-family: 'Inter', sans-serif;
  color: #fff;
  animation: trk-fade 0.5s ease;
}
@keyframes trk-fade { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }

/* HEADER */
.trk-header { display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:28px; flex-wrap:wrap; gap:14px; }
.trk-title { font-size:26px; font-weight:900; color:#fff; margin:0; letter-spacing:-0.5px; }
.trk-sub { color:#ff69b4; font-size:12px; font-weight:600; margin-top:4px; text-transform:uppercase; letter-spacing:1px; }
.trk-sync { background:#0a0a0a; border:1px solid #222; color:#ff69b4; width:40px; height:40px; border-radius:10px; display:flex; align-items:center; justify-content:center; cursor:pointer; transition:all .3s; flex-shrink:0; }
.trk-sync:hover { background:#1a0a12; transform:rotate(180deg); border-color:#ff69b4; }

/* TABS */
.trk-tabs { display:flex; gap:6px; margin-bottom:24px; background:#050505; border:1px solid #1a1a1a; border-radius:12px; padding:6px; flex-wrap:wrap; }
.trk-tab { padding:8px 16px; border-radius:8px; border:none; background:transparent; color:#666; font-size:12px; font-weight:600; cursor:pointer; transition:all .2s; white-space:nowrap; display:flex; align-items:center; gap:6px; }
.trk-tab.active { background:linear-gradient(135deg,#ff69b4,#d63384); color:#fff; box-shadow:0 4px 12px rgba(255,105,180,.3); }
.trk-tab:hover:not(.active) { color:#fff; background:#111; }

/* CONTROLS */
.trk-ctrl { display:flex; gap:12px; margin-bottom:22px; flex-wrap:wrap; align-items:center; background:#050505; padding:14px 18px; border-radius:12px; border:1px solid #1a1a1a; }
.trk-inp { background:#0a0a0a; padding:8px 13px; border:1px solid #2a2a2a; color:#fff; border-radius:8px; outline:none; font-size:12px; transition:.2s; color-scheme:dark; font-family:inherit; }
.trk-inp:focus { border-color:#ff69b4; }
.trk-lbl { font-size:10px; color:#555; text-transform:uppercase; letter-spacing:.8px; font-weight:700; margin-bottom:4px; display:block; }

/* KPI GRID */
.trk-kpi { display:grid; grid-template-columns:repeat(auto-fit,minmax(170px,1fr)); gap:14px; margin-bottom:24px; }
.trk-kpi-box { background:#050505; border:1px solid #1a1a1a; border-radius:14px; padding:18px; display:flex; align-items:flex-start; gap:14px; transition:all .25s; position:relative; overflow:hidden; }
.trk-kpi-box::before { content:''; position:absolute; top:0; left:0; width:3px; height:100%; }
.trk-kpi-box.c0::before{background:#ff69b4;}
.trk-kpi-box.c1::before{background:#00bcd4;}
.trk-kpi-box.c2::before{background:#8bc34a;}
.trk-kpi-box.c3::before{background:#ff9800;}
.trk-kpi-box.c4::before{background:#9c27b0;}
.trk-kpi-box.c5::before{background:#ffeb3b;}
.trk-kpi-box.c6::before{background:#f44336;}
.trk-kpi-box.c7::before{background:#4caf50;}
.trk-kpi-box:hover { transform:translateY(-3px); border-color:#333; box-shadow:0 8px 24px rgba(0,0,0,.4); }
.trk-kpi-ico { width:44px; height:44px; border-radius:10px; display:flex; align-items:center; justify-content:center; font-size:19px; flex-shrink:0; }
.trk-kpi-lbl { font-size:10px; color:#666; text-transform:uppercase; letter-spacing:.6px; font-weight:700; margin-bottom:4px; }
.trk-kpi-val { font-size:22px; color:#fff; font-weight:900; line-height:1; }
.trk-kpi-chg { font-size:10px; color:#8bc34a; margin-top:4px; font-weight:600; }

/* FUNNEL */
.trk-funnel { background:#050505; border:1px solid #1a1a1a; border-radius:16px; padding:22px; margin-bottom:24px; }
.trk-section-title { font-size:15px; font-weight:700; color:#ddd; margin-bottom:18px; display:flex; align-items:center; gap:9px; }
.trk-section-title svg { color:#ff69b4; }
.funnel-steps { display:flex; align-items:center; gap:0; flex-wrap:wrap; }
.funnel-step { flex:1; min-width:120px; text-align:center; position:relative; }
.funnel-step:not(:last-child)::after { content:''; position:absolute; right:-1px; top:50%; transform:translateY(-50%); width:0; height:0; border-top:20px solid transparent; border-bottom:20px solid transparent; border-left:14px solid #0a0a0a; z-index:2; }
.funnel-bar { height:80px; border-radius:8px; display:flex; flex-direction:column; align-items:center; justify-content:center; margin:0 4px; transition:all .3s; cursor:default; }
.funnel-bar:hover { filter:brightness(1.2); }
.funnel-count { font-size:20px; font-weight:900; color:#fff; }
.funnel-label { font-size:10px; color:rgba(255,255,255,.7); margin-top:3px; text-transform:uppercase; letter-spacing:.6px; }
.funnel-pct { font-size:10px; color:#aaa; margin-top:6px; font-weight:600; }
.funnel-arrow { color:#333; font-size:18px; padding:0 2px; align-self:center; }

/* CHARTS GRID */
.trk-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(340px,1fr)); gap:18px; margin-bottom:24px; }
.trk-card { background:#050505; border:1px solid #1a1a1a; border-radius:16px; padding:20px; }
.trk-card.full { grid-column:1/-1; }
.trk-card-h { height:280px; }

/* AD TRAFFIC CARD */
.ad-source-row { display:flex; align-items:center; gap:10px; padding:10px 0; border-bottom:1px solid #111; }
.ad-source-row:last-child { border-bottom:none; }
.ad-source-bar-wrap { flex:1; height:6px; background:#111; border-radius:3px; overflow:hidden; }
.ad-source-bar { height:100%; border-radius:3px; transition:width .6s ease; }
.ad-source-name { font-size:12px; color:#ccc; min-width:130px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.ad-source-count { font-size:12px; color:#ff69b4; font-weight:700; min-width:40px; text-align:right; }

/* LANDING TABLE */
.trk-table { width:100%; border-collapse:collapse; }
.trk-table th { padding:10px 13px; color:#ff69b4; font-size:10px; text-transform:uppercase; border-bottom:1px solid #1a1a1a; font-weight:700; letter-spacing:.6px; text-align:left; }
.trk-table td { padding:10px 13px; border-bottom:1px solid #0d0d0d; color:#ccc; font-size:12px; }
.trk-table tr:hover td { background:#070707; }
.trk-table tr:last-child td { border-bottom:none; }

/* EVENT LOG */
.trk-log { background:#050505; border:1px solid #1a1a1a; border-radius:16px; padding:20px; }
.log-table { width:100%; border-collapse:collapse; min-width:860px; }
.log-table th { padding:10px 14px; color:#ff69b4; font-size:10px; text-transform:uppercase; border-bottom:1px solid #1a1a1a; font-weight:700; letter-spacing:.6px; }
.log-table td { padding:12px 14px; border-bottom:1px solid #0d0d0d; color:#ccc; font-size:12px; vertical-align:middle; }
.log-table tr:hover td { background:#070707; }

/* BADGES */
.badge { display:inline-flex; align-items:center; gap:4px; padding:3px 9px; border-radius:20px; font-size:10px; font-weight:700; text-transform:uppercase; letter-spacing:.5px; }
.badge-pv { color:#00bcd4; background:rgba(0,188,212,.1); border:1px solid rgba(0,188,212,.2); }
.badge-cl { color:#8bc34a; background:rgba(139,195,74,.1); border:1px solid rgba(139,195,74,.2); }
.badge-sc { color:#ff69b4; background:rgba(255,105,180,.1); border:1px solid rgba(255,105,180,.2); }
.badge-ic { color:#ff9800; background:rgba(255,152,0,.1); border:1px solid rgba(255,152,0,.2); }
.badge-ls { color:#9c27b0; background:rgba(156,39,176,.1); border:1px solid rgba(156,39,176,.2); }
.badge-sp { color:#4caf50; background:rgba(76,175,80,.1); border:1px solid rgba(76,175,80,.2); }
.badge-fc { color:#ffeb3b; background:rgba(255,235,59,.1); border:1px solid rgba(255,235,59,.2); }
.badge-def { color:#aaa; background:#111; border:1px solid #222; }
.badge-paid { background:#ff69b4; color:#000; }
.badge-free { background:#222; color:#888; }
.badge-fb { background:rgba(24,119,242,.15); color:#4a90d9; border:1px solid rgba(24,119,242,.25); }
.badge-organic { background:rgba(139,195,74,.1); color:#8bc34a; border:1px solid rgba(139,195,74,.2); }
.badge-direct { background:rgba(158,158,158,.1); color:#aaa; border:1px solid rgba(158,158,158,.2); }

/* UTM PILLS */
.utm-pill { background:rgba(255,105,180,.08); border:1px solid rgba(255,105,180,.2); color:#ff69b4; padding:1px 6px; border-radius:4px; font-size:9px; margin:2px 2px 0 0; display:inline-block; }

/* USER AVATAR */
.user-cell { display:flex; align-items:center; gap:9px; }
.u-avatar { width:30px; height:30px; border-radius:50%; object-fit:cover; border:1px solid #2a2a2a; flex-shrink:0; }

/* LOADING */
.trk-loader { display:flex; flex-direction:column; align-items:center; justify-content:center; height:380px; color:#444; gap:12px; }
.trk-spinner { width:32px; height:32px; border:2px solid #1a1a1a; border-top-color:#ff69b4; border-radius:50%; animation:trk-spin .8s linear infinite; }
@keyframes trk-spin { to{transform:rotate(360deg)} }

/* PAGINATION */
.trk-pg { display:flex; justify-content:center; gap:12px; margin-top:18px; align-items:center; }
.trk-pg-btn { background:#0a0a0a; border:1px solid #2a2a2a; color:#fff; padding:7px 16px; border-radius:8px; cursor:pointer; font-size:12px; transition:.2s; font-family:inherit; }
.trk-pg-btn:hover:not(:disabled) { border-color:#ff69b4; color:#ff69b4; }
.trk-pg-btn:disabled { opacity:.3; cursor:not-allowed; }

/* CAMPAIGN TABLE */
.camp-row { padding:12px 0; border-bottom:1px solid #0d0d0d; }
.camp-row:last-child { border-bottom:none; }
.camp-name { font-size:12px; color:#fff; font-weight:600; }
.camp-meta { font-size:10px; color:#555; margin-top:2px; }
.camp-stats { display:flex; gap:16px; margin-top:8px; }
.camp-stat { text-align:center; }
.camp-stat-val { font-size:14px; font-weight:800; }
.camp-stat-lbl { font-size:9px; color:#555; text-transform:uppercase; }

/* GLOWING NUMBERS */
.glow-pink { color:#ff69b4; text-shadow:0 0 16px rgba(255,105,180,.4); }
.glow-cyan { color:#00bcd4; text-shadow:0 0 16px rgba(0,188,212,.4); }
.glow-green { color:#8bc34a; text-shadow:0 0 16px rgba(139,195,74,.4); }

/* TWO-PANEL LAYOUT */
.trk-two { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:24px; }
@media(max-width:900px){ .trk-two{grid-template-columns:1fr;} }

/* SCROLLABLE */
.trk-scroll { overflow-x:auto; }

/* CAMPAIGN DETAIL TABLE */
.camp-tbl { width:100%; border-collapse:collapse; }
.camp-tbl th { padding:10px 14px; color:#ff69b4; font-size:10px; text-transform:uppercase; border-bottom:1px solid #1a1a1a; font-weight:700; letter-spacing:.6px; text-align:left; white-space:nowrap; }
.camp-tbl td { padding:11px 14px; border-bottom:1px solid #0d0d0d; color:#ccc; font-size:12px; vertical-align:middle; }
.camp-tbl tr:hover td { background:#070707; }
.camp-tbl tr:last-child td { border-bottom:none; }
.camp-name-cell { max-width:220px; }
.camp-full-name { font-size:11px; color:#fff; font-weight:700; word-break:break-word; line-height:1.3; }
.camp-full-name .segment { display:inline-block; background:rgba(255,105,180,.08); border:1px solid rgba(255,105,180,.15); border-radius:4px; padding:1px 5px; margin:2px 2px 0 0; font-size:9px; color:#ff69b4; }
.src-badge { display:inline-flex; align-items:center; gap:5px; padding:4px 9px; border-radius:6px; font-size:10px; font-weight:700; }
.src-fb { background:rgba(24,119,242,.12); color:#4a90d9; border:1px solid rgba(24,119,242,.2); }
.src-ig { background:rgba(225,48,108,.12); color:#e1306c; border:1px solid rgba(225,48,108,.2); }
.src-paid { background:rgba(255,152,0,.12); color:#ff9800; border:1px solid rgba(255,152,0,.2); }
.src-gen { background:rgba(139,195,74,.12); color:#8bc34a; border:1px solid rgba(139,195,74,.2); }
.conv-rate { font-size:13px; font-weight:800; }
.conv-bar-wrap { height:4px; background:#1a1a1a; border-radius:2px; overflow:hidden; margin-top:4px; }
.conv-bar { height:100%; border-radius:2px; }
`;

const COLORS6 = ['#ff69b4','#00bcd4','#8bc34a','#ff9800','#ffeb3b','#9c27b0'];
const FUNNEL_COLORS = ['#ff69b4','#e91e63','#ff5722','#ff9800','#4caf50'];

const getBadgeClass = t => {
  const m = { page_view:'pv', click:'cl', signup_complete:'sc', initiate_checkout:'ic',
    login_success:'ls', subscription_purchase:'sp', funnel_click:'fc' };
  return `badge badge-${m[t]||'def'}`;
};

const getIcon = t => {
  const m = { page_view:<FaEye/>, click:<MdAdsClick/>, signup_complete:<FaUserPlus/>,
    initiate_checkout:<FaShoppingBag/>, login_success:<FaRobot/>,
    subscription_purchase:<FaCrown/>, funnel_click:<FaMousePointer/> };
  return m[t] || <FaChartLine/>;
};

const fmtNum = n => n >= 1000 ? `${(n/1000).toFixed(1)}k` : String(n||0);
const pct = (a,b) => b > 0 ? ((a/b)*100).toFixed(1)+'%' : '0%';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{background:'#0a0a0a',border:'1px solid #222',borderRadius:10,padding:'10px 14px',fontSize:12}}>
      <div style={{color:'#888',marginBottom:6}}>{label}</div>
      {payload.map((p,i)=>(
        <div key={i} style={{color:p.color||'#fff', fontWeight:700}}>{p.name}: {p.value?.toLocaleString()}</div>
      ))}
    </div>
  );
};

/* ─────────── MAIN COMPONENT ─────────── */
export default function TrackingAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState('overview');
  const [filter, setFilter] = useState({
    startDate: new Date(Date.now() - 30*24*60*60*1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0],
    eventType: '', page: 1, limit: 50
  });

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token') || '';
      const res = await axios.get(`${api.Url}/tracking/analytics`, {
        params: filter,
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data.data);
      setError(null);
    } catch(e) {
      setError(e.response?.data?.error || 'Failed to load analytics');
    } finally { setLoading(false); }
  }, [filter]);

  useEffect(() => { fetch(); }, [fetch]);

  const handleFilter = e => setFilter(p => ({ ...p, [e.target.name]: e.target.value, page: 1 }));

  /* Derived Data */
  const timeSeriesData = useMemo(() => {
    if (!data) return [];
    const adMap = {};
    (data.dailyAdVsOrganicStats||[]).forEach(d => {
      adMap[d._id] = { ad:0, organic:0 };
      (d.data||[]).forEach(x => { adMap[d._id][x.type] = x.sessions; });
    });
    return (data.timeSeriesData||[]).map(d => ({
      name: new Date(d._id).toLocaleDateString([],{month:'short',day:'numeric'}),
      events: d.count,
      ad: adMap[d._id]?.ad || 0,
      organic: adMap[d._id]?.organic || 0
    }));
  }, [data]);

  const barData = useMemo(() =>
    (data?.eventCounts||[]).slice(0,8).map(e => ({
      name: e._id.replace(/_/g,' ').replace(/\b\w/g,c=>c.toUpperCase()),
      count: e.count
    })), [data]);

  const funnelData = useMemo(() => {
    const f = data?.conversionFunnelSessions;
    if (!f) return [];
    const registered = f.totalRegistered || f.totalUsers || 0;
    return [
      { label:'All Registered Users', count: registered,       color: FUNNEL_COLORS[0], desc:'All-time users' },
      { label:'New Signups (Period)',  count: f.signedUp || 0,  color: FUNNEL_COLORS[1], desc:'Registered in date range' },
      { label:'Logged In',           count: f.loggedIn || 0,  color: FUNNEL_COLORS[2], desc:'Unique users who logged in' },
      { label:'Used Chat (Quota)',    count: f.chatted || 0,   color: FUNNEL_COLORS[3], desc:'Sent a chat message' },
      { label:'Paid Subscribers',    count: f.subscribed || f.paidUserCount || 0, color: FUNNEL_COLORS[4], desc:'All-time paid' },
    ];
  }, [data]);

  const adSources = useMemo(() =>
    (data?.adTrafficBreakdown||[]).slice(0,8), [data]);
  const maxAdSource = useMemo(() =>
    adSources.reduce((m,s) => Math.max(m, s.uniqueSessions||0), 1), [adSources]);

  const deviceData = useMemo(() =>
    (data?.deviceStats||[]).map(d => ({ name: d._id||'Unknown', value: d.count })), [data]);
  const userPieData = useMemo(() =>
    (data?.userStats||[]).map(u => ({
      name: u._id === 'subscriber' ? 'Paid' : 'Free', value: u.count
    })), [data]);

  const f = data?.conversionFunnelSessions || {};
  const registered = f.totalRegistered || f.totalUsers || 1;
  const convRate = pct(f.subscribed || f.paidUserCount || 0, registered);
  const loginRate = pct(f.loggedIn || 0, registered);
  const chatRate  = pct(f.chatted || 0, f.loggedIn || 1);
  const subRate   = pct(f.subscribed || f.paidUserCount || 0, f.chatted || 1);

  const TABS = [
    { id:'overview',   label:'Overview',          icon:<FaChartLine/> },
    { id:'campaigns',  label:'Campaigns & UTM',   icon:<FaAd/> },
    { id:'funnel',     label:'Conversion Funnel', icon:<FaFunnelDollar/> },
    { id:'ads',        label:'Ad Sources',        icon:<FaFacebook/> },
    { id:'landing',    label:'Landing Pages',     icon:<MdLandscape/> },
    { id:'log',        label:'Event Log',         icon:<FaEye/> },
  ];

  return (
    <>
      <style>{S}</style>
      <div className="trk-root">

        {/* HEADER */}
        <header className="trk-header">
          <div>
            <h1 className="trk-title">Marketing Intelligence</h1>
            <div className="trk-sub">Ad attribution · Conversion funnel · User journey · Growth analytics</div>
          </div>
          <button className="trk-sync" onClick={fetch} title="Refresh"><FaSync/></button>
        </header>

        {/* TABS */}
        <div className="trk-tabs">
          {TABS.map(t => (
            <button key={t.id} className={`trk-tab${tab===t.id?' active':''}`} onClick={() => setTab(t.id)}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* FILTERS */}
        <div className="trk-ctrl">
          <FaFilter style={{color:'#ff69b4', flexShrink:0}}/>
          <div>
            <span className="trk-lbl">From</span>
            <input type="date" className="trk-inp" name="startDate" value={filter.startDate} onChange={handleFilter}/>
          </div>
          <div>
            <span className="trk-lbl">To</span>
            <input type="date" className="trk-inp" name="endDate" value={filter.endDate} onChange={handleFilter}/>
          </div>
          <div>
            <span className="trk-lbl">Event Type</span>
            <select className="trk-inp" name="eventType" value={filter.eventType} onChange={handleFilter}>
              <option value="">All Events</option>
              <option value="page_view">Page Views</option>
              <option value="click">Clicks</option>
              <option value="login_success">Logins</option>
              <option value="signup_complete">Signups</option>
              <option value="initiate_checkout">Checkout</option>
              <option value="subscription_purchase">Subscription</option>
              <option value="funnel_click">Funnel Click</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="trk-loader">
            <div className="trk-spinner"/>
            <span style={{color:'#444', fontSize:13}}>Crunching your marketing data...</span>
          </div>
        ) : error ? (
          <div style={{color:'#ff4444',padding:20,background:'rgba(255,68,68,.08)',borderRadius:12,border:'1px solid rgba(255,68,68,.2)'}}>{error}</div>
        ) : data && (
          <>
            {/* ══════════ OVERVIEW TAB ══════════ */}
            {tab === 'overview' && (
              <>
                {/* KPIs */}
                <div className="trk-kpi">
                  {[
                    { lbl:'Total Events', val: fmtNum(data.totalEventsExtracted), ico:<FaChartLine/>, c:'c0', bg:'rgba(255,105,180,.1)', col:'#ff69b4' },
                    { lbl:'Total Users', val: fmtNum(f.totalUsers||0), ico:<FaUsers/>, c:'c1', bg:'rgba(0,188,212,.1)', col:'#00bcd4' },
                    { lbl:'Paid Subscribers', val: fmtNum(f.paidUserCount||0), ico:<FaCrown/>, c:'c2', bg:'rgba(139,195,74,.1)', col:'#8bc34a', chg:`${convRate} conversion` },
                    { lbl:'Free Users', val: fmtNum(f.freeUserCount||0), ico:<FaUsers/>, c:'c3', bg:'rgba(255,152,0,.1)', col:'#ff9800' },
                    { lbl:'Visitor → Login', val: loginRate, ico:<FaUserPlus/>, c:'c4', bg:'rgba(156,39,176,.1)', col:'#9c27b0' },
                    { lbl:'Session Signups', val: fmtNum(f.signedUp||0), ico:<FaUserPlus/>, c:'c5', bg:'rgba(255,235,59,.1)', col:'#ffeb3b' },
                    { lbl:'Checkout Started', val: fmtNum(f.checkoutInit||0), ico:<FaShoppingBag/>, c:'c6', bg:'rgba(244,67,54,.1)', col:'#f44336' },
                    { lbl:'Purchases (Period)', val: fmtNum(f.recentPaidUsers||0), ico:<FaTrophy/>, c:'c7', bg:'rgba(76,175,80,.1)', col:'#4caf50' },
                  ].map((k,i) => (
                    <div key={i} className={`trk-kpi-box ${k.c}`}>
                      <div className="trk-kpi-ico" style={{background:k.bg, color:k.col}}>{k.ico}</div>
                      <div>
                        <div className="trk-kpi-lbl">{k.lbl}</div>
                        <div className="trk-kpi-val">{k.val}</div>
                        {k.chg && <div className="trk-kpi-chg">{k.chg}</div>}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Traffic Trend */}
                <div className="trk-card full" style={{marginBottom:18}}>
                  <div className="trk-section-title"><FaChartLine/> Daily Traffic: Events vs Ad vs Organic Sessions</div>
                  <div style={{height:260}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={timeSeriesData}>
                        <defs>
                          <linearGradient id="gEvt" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111"/>
                        <XAxis dataKey="name" stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                        <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend wrapperStyle={{fontSize:11,color:'#888'}}/>
                        <Area type="monotone" name="Total Events" dataKey="events" stroke="#ff69b4" fill="url(#gEvt)" strokeWidth={2}/>
                        <Line type="monotone" name="Ad Sessions" dataKey="ad" stroke="#1877f2" strokeWidth={2} dot={false}/>
                        <Line type="monotone" name="Organic Sessions" dataKey="organic" stroke="#8bc34a" strokeWidth={2} dot={false}/>
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bottom row: bar + pies */}
                <div className="trk-grid">
                  <div className="trk-card">
                    <div className="trk-section-title"><FaBullhorn/> Event Distribution</div>
                    <div style={{height:220}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={barData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111"/>
                          <XAxis dataKey="name" stroke="#444" fontSize={8} axisLine={false} tickLine={false}/>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Bar dataKey="count" radius={[4,4,0,0]}>
                            {barData.map((_,i) => <Cell key={i} fill={COLORS6[i%COLORS6.length]}/>)}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="trk-card">
                    <div className="trk-section-title"><FaUsers/> Paid vs Free Events</div>
                    <div style={{height:220}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={userPieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                            {userPieData.map((_,i) => <Cell key={i} fill={i===0?'#ff69b4':'#222'}/>)}
                          </Pie>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Legend wrapperStyle={{fontSize:11,color:'#888'}} iconType="circle"/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  <div className="trk-card">
                    <div className="trk-section-title"><FaMobileAlt/> Device Split</div>
                    <div style={{height:220}}>
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie data={deviceData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="value">
                            {deviceData.map((_,i) => <Cell key={i} fill={['#3f51b5','#e91e63','#009688','#ff9800'][i%4]}/>)}
                          </Pie>
                          <Tooltip content={<CustomTooltip/>}/>
                          <Legend wrapperStyle={{fontSize:11,color:'#888'}} iconType="circle"/>
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* ══════════ CAMPAIGNS TAB ══════════ */}
            {tab === 'campaigns' && (() => {
              const campaigns = data.utmCampaignStats || [];
              const maxSess = campaigns.reduce((m, c) => Math.max(m, c.uniqueSessions || 0), 1);
              const totalPaid = f.paidUserCount || 0;

              const getSourceBadge = (source) => {
                const s = (source || '').toLowerCase();
                if (s.includes('instagram') || s.includes('ig')) return <span className="src-badge src-ig"><FaInstagram/>Instagram</span>;
                if (s.includes('facebook') || s.includes('fb')) return <span className="src-badge src-fb"><FaFacebook/>Facebook</span>;
                if (s.includes('paid_ad') || s.includes('paid')) return <span className="src-badge src-paid"><FaTag/>Paid Ad</span>;
                return <span className="src-badge src-gen"><FaGlobe/>{source || 'Unknown'}</span>;
              };

              // Parse campaign name into readable segments (split by __ and _)
              const parseCampaignName = (name) => {
                if (!name) return <span style={{color:'#555',fontStyle:'italic'}}>Unknown</span>;
                const parts = name.split('__');
                return (
                  <div className="camp-full-name">
                    <div style={{marginBottom:4,color:'#fff'}}>{parts[0] || name}</div>
                    {parts.slice(1).map((seg, i) => (
                      <span key={i} className="segment">{seg.replace(/_/g,' ')}</span>
                    ))}
                  </div>
                );
              };

              return (
                <>
                  {/* KPI row */}
                  <div className="trk-kpi" style={{marginBottom:20}}>
                    {[
                      { lbl:'Active Campaigns', val: campaigns.length, ico:<FaBullhorn/>, c:'c0', bg:'rgba(255,105,180,.1)', col:'#ff69b4' },
                      { lbl:'Total Ad Sessions', val: fmtNum(campaigns.reduce((s,c)=>s+(c.uniqueSessions||0),0)), ico:<FaAd/>, c:'c1', bg:'rgba(0,188,212,.1)', col:'#00bcd4' },
                      { lbl:'Ad Reached Users', val: fmtNum(campaigns.reduce((s,c)=>s+(c.uniqueUsers||0),0)), ico:<FaUsers/>, c:'c2', bg:'rgba(139,195,74,.1)', col:'#8bc34a' },
                      { lbl:'Paid Subscribers', val: fmtNum(totalPaid), ico:<FaCrown/>, c:'c3', bg:'rgba(255,152,0,.1)', col:'#ff9800', chg:'all-time' },
                    ].map((k,i) => (
                      <div key={i} className={`trk-kpi-box ${k.c}`}>
                        <div className="trk-kpi-ico" style={{background:k.bg, color:k.col}}>{k.ico}</div>
                        <div>
                          <div className="trk-kpi-lbl">{k.lbl}</div>
                          <div className="trk-kpi-val">{k.val}</div>
                          {k.chg && <div className="trk-kpi-chg">{k.chg}</div>}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Campaign Table */}
                  <div className="trk-card full" style={{marginBottom:18}}>
                    <div className="trk-section-title"><FaSortAmountDown/> All Campaigns — Performance Breakdown</div>
                    {campaigns.length === 0 ? (
                      <div style={{color:'#444',fontSize:13,textAlign:'center',padding:'40px 0',lineHeight:2}}>
                        No UTM campaign data yet.<br/>
                        <span style={{fontSize:11,color:'#333'}}>Make sure your ad URLs include <code style={{color:'#ff69b4',background:'#0a0a0a',padding:'2px 6px',borderRadius:4}}>utm_campaign=YOUR_CAMPAIGN</code></span>
                      </div>
                    ) : (
                      <div className="trk-scroll">
                        <table className="camp-tbl">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Campaign Name</th>
                              <th>Source</th>
                              <th>Medium</th>
                              <th>Sessions</th>
                              <th>Events</th>
                              <th>Users Reached</th>
                              <th>Reach %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {campaigns.map((c, i) => {
                              const reachPct = maxSess > 0 ? ((c.uniqueSessions||0)/maxSess*100) : 0;
                              return (
                                <tr key={i}>
                                  <td style={{color:'#444',fontWeight:700,width:32}}>{i+1}</td>
                                  <td className="camp-name-cell">
                                    {parseCampaignName(c._id?.campaign)}
                                  </td>
                                  <td>{getSourceBadge(c._id?.source)}</td>
                                  <td>
                                    <span style={{background:'rgba(255,235,59,.08)',border:'1px solid rgba(255,235,59,.15)',color:'#ffeb3b',padding:'3px 8px',borderRadius:5,fontSize:10,fontWeight:700}}>
                                      {c._id?.medium || 'unknown'}
                                    </span>
                                  </td>
                                  <td>
                                    <div style={{fontWeight:900,fontSize:16,color:'#ff69b4'}}>{fmtNum(c.uniqueSessions||0)}</div>
                                    <div className="conv-bar-wrap">
                                      <div className="conv-bar" style={{width:`${reachPct}%`,background:'#ff69b4'}}/>
                                    </div>
                                  </td>
                                  <td style={{color:'#00bcd4',fontWeight:700}}>{fmtNum(c.events||0)}</td>
                                  <td style={{color:'#8bc34a',fontWeight:700}}>{fmtNum(c.uniqueUsers||0)}</td>
                                  <td>
                                    <div className="conv-rate" style={{color: reachPct>50?'#8bc34a':reachPct>20?'#ff9800':'#ff69b4'}}>
                                      {reachPct.toFixed(1)}%
                                    </div>
                                    <div style={{fontSize:9,color:'#444'}}>of top campaign</div>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Source split chart */}
                  <div className="trk-two">
                    <div className="trk-card">
                      <div className="trk-section-title"><FaGlobe/> Sessions by Source</div>
                      <div style={{height:220}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={adSources}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111"/>
                            <XAxis dataKey="_id" stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                            <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Bar dataKey="uniqueSessions" name="Sessions" radius={[6,6,0,0]}>
                              {adSources.map((_,i) => <Cell key={i} fill={COLORS6[i%COLORS6.length]}/>)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    <div className="trk-card">
                      <div className="trk-section-title"><FaChartLine/> Daily Ad vs Organic</div>
                      <div style={{height:220}}>
                        <ResponsiveContainer width="100%" height="100%">
                          <ComposedChart data={timeSeriesData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111"/>
                            <XAxis dataKey="name" stroke="#444" fontSize={9} axisLine={false} tickLine={false}/>
                            <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                            <Tooltip content={<CustomTooltip/>}/>
                            <Legend wrapperStyle={{fontSize:11,color:'#888'}}/>
                            <Line type="monotone" name="Ad" dataKey="ad" stroke="#e1306c" strokeWidth={2} dot={false}/>
                            <Line type="monotone" name="Organic" dataKey="organic" stroke="#8bc34a" strokeWidth={2} dot={false}/>
                          </ComposedChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>

                  {/* UTM Setup Guide */}
                  <div style={{background:'rgba(225,48,108,.05)',border:'1px solid rgba(225,48,108,.15)',borderRadius:12,padding:'16px 20px',fontSize:12,color:'#aaa',lineHeight:1.8}}>
                    <strong style={{color:'#e1306c',display:'flex',alignItems:'center',gap:8,marginBottom:10}}>
                      <FaInstagram/> UTM Tracking Setup — Use This URL Format for All Paid Ads
                    </strong>
                    <div style={{marginBottom:8}}>Your current campaign URL format (from the ad):</div>
                    <code style={{background:'#000',padding:'8px 12px',borderRadius:6,display:'block',marginBottom:10,color:'#8bc34a',fontSize:11,wordBreak:'break-all'}}>
                      https://www.heartecho.in/?utm_source=instagram&utm_medium=paid&utm_campaign=HeartEcho_Awareness_Tier23__Gaming_Otaku_20-28__DressInfu4
                    </code>
                    <div style={{marginBottom:6,color:'#666',fontSize:11}}>⚠️ <strong style={{color:'#ffeb3b'}}>Common Issue:</strong> If your ad platform generates links with <code style={{color:'#ff69b4',background:'#111',padding:'1px 4px',borderRadius:3}}>&amp;amp;</code> instead of <code style={{color:'#ff69b4',background:'#111',padding:'1px 4px',borderRadius:3}}>&amp;</code>, HeartEcho now automatically fixes this. All UTM data will be tracked correctly.</div>
                    <div style={{display:'flex',gap:8,flexWrap:'wrap',marginTop:8}}>
                      {['utm_source=instagram','utm_medium=paid','utm_campaign=CAMPAIGN_NAME'].map((p,i) => (
                        <span key={i} className="utm-pill" style={{fontSize:10,padding:'3px 8px'}}>{p}</span>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}

            {tab === 'funnel' && (
              <>
                <div className="trk-funnel">
                  <div className="trk-section-title"><FaFunnelDollar/> Full Conversion Funnel — Visitor to Paid Subscriber</div>
                  <div className="funnel-steps">
                  {funnelData.map((step, i) => {
                      const base = funnelData[0]?.count || 1;
                      const basePct = pct(step.count, base);
                      const widthPct = Math.max(8, (step.count / base) * 100);
                      return (
                        <React.Fragment key={i}>
                          <div className="funnel-step">
                            <div className="funnel-bar" style={{background: step.color+'22', border:`1px solid ${step.color}44`}}>
                              <div className="funnel-count" style={{color:step.color}}>{fmtNum(step.count)}</div>
                              <div className="funnel-label">{step.label}</div>
                              {step.desc && <div style={{fontSize:9,color:'#444',marginTop:3}}>{step.desc}</div>}
                            </div>
                            <div className="funnel-pct">{basePct} of total</div>
                            {/* Mini progress bar */}
                            <div style={{height:4, background:'#111', borderRadius:2, marginTop:8, overflow:'hidden'}}>
                              <div style={{width:`${widthPct}%`, height:'100%', background:step.color, borderRadius:2, transition:'width .6s'}}/>
                            </div>
                          </div>
                          {i < funnelData.length-1 && (
                            <div className="funnel-arrow"><FaArrowRight style={{color:'#333'}}/></div>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </div>
                </div>

                {/* Conversion Rates Summary */}
                <div className="trk-kpi">
                  {[
                    { lbl:'Registration Rate',    val: loginRate, desc:'Logged-in users out of all registered', col:'#ff69b4' },
                    { lbl:'Login → Chat Rate',    val: chatRate,  desc:'Logged-in users who sent messages',     col:'#00bcd4' },
                    { lbl:'Chat → Subscribe',     val: subRate,   desc:'Chatters who became paid subscribers',  col:'#ff9800' },
                    { lbl:'Overall Conversion',   val: convRate,  desc:'All users who became paid',              col:'#8bc34a' },
                  ].map((k,i) => (
                    <div key={i} className={`trk-kpi-box c${i}`}>
                      <div>
                        <div className="trk-kpi-lbl">{k.lbl}</div>
                        <div className="trk-kpi-val" style={{color:k.col, fontSize:26, textShadow:`0 0 20px ${k.col}44`}}>{k.val}</div>
                        <div style={{fontSize:10,color:'#555',marginTop:4}}>{k.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Funnel by event sessions */}
                <div className="trk-card full">
                  <div className="trk-section-title"><BiTargetLock/> Sessions Per Funnel Stage (Unique Sessions)</div>
                  <div style={{height:250}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(data.funnelStats||[]).map(f=>({name:f._id?.replace(/_/g,' '), sessions:f.uniqueSessions}))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111"/>
                        <XAxis dataKey="name" stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                        <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Bar dataKey="sessions" radius={[6,6,0,0]}>
                          {(data.funnelStats||[]).map((_,i)=><Cell key={i} fill={COLORS6[i%COLORS6.length]}/>)}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* ══════════ ADS TAB ══════════ */}
            {tab === 'ads' && (
              <>
                <div className="trk-two">
                  {/* Traffic Sources */}
                  <div className="trk-card">
                    <div className="trk-section-title"><MdAdsClick/> Traffic Sources (Unique Sessions)</div>
                    {adSources.length === 0 ? (
                      <div style={{color:'#444',fontSize:12,textAlign:'center',padding:30}}>No ad traffic data yet. Add UTM params or fbclid to your ad links.</div>
                    ) : adSources.map((s,i) => (
                      <div key={i} className="ad-source-row">
                        <div className="ad-source-name" title={s._id||'Unknown'}>
                          {s._id?.includes('Facebook') || s._id?.includes('facebook') ? <FaFacebook style={{color:'#4a90d9',marginRight:5}}/> : null}
                          {s._id || 'Direct'}
                        </div>
                        <div className="ad-source-bar-wrap">
                          <div className="ad-source-bar" style={{width:`${((s.uniqueSessions||0)/maxAdSource)*100}%`, background: COLORS6[i%COLORS6.length]}}/>
                        </div>
                        <div className="ad-source-count">{s.uniqueSessions||0}</div>
                      </div>
                    ))}
                  </div>

                  {/* UTM Campaigns */}
                  <div className="trk-card">
                    <div className="trk-section-title"><FaBullhorn/> UTM Campaign Performance</div>
                    {(data.utmCampaignStats||[]).length === 0 ? (
                      <div style={{color:'#444',fontSize:12,textAlign:'center',padding:30}}>No UTM data found. Add utm_campaign to your Facebook ad links.</div>
                    ) : (data.utmCampaignStats||[]).slice(0,8).map((c,i) => (
                      <div key={i} className="camp-row">
                        <div className="camp-name">{c._id?.campaign || 'Unknown Campaign'}</div>
                        <div className="camp-meta">
                          <span className="utm-pill">src:{c._id?.source}</span>
                          <span className="utm-pill">med:{c._id?.medium}</span>
                        </div>
                        <div className="camp-stats">
                          <div className="camp-stat">
                            <div className="camp-stat-val glow-pink">{c.uniqueSessions}</div>
                            <div className="camp-stat-lbl">Sessions</div>
                          </div>
                          <div className="camp-stat">
                            <div className="camp-stat-val glow-cyan">{c.events}</div>
                            <div className="camp-stat-lbl">Events</div>
                          </div>
                          <div className="camp-stat">
                            <div className="camp-stat-val glow-green">{c.uniqueUsers}</div>
                            <div className="camp-stat-lbl">Users</div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Daily Ad vs Organic */}
                <div className="trk-card full" style={{marginBottom:18}}>
                  <div className="trk-section-title"><FaFacebook style={{color:'#4a90d9'}}/> Daily: Facebook Ad Sessions vs Organic Sessions</div>
                  <div style={{height:240}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={timeSeriesData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111"/>
                        <XAxis dataKey="name" stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                        <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend wrapperStyle={{fontSize:11,color:'#888'}}/>
                        <Bar name="Ad Sessions" dataKey="ad" fill="#1877f2" radius={[4,4,0,0]} stackId="a"/>
                        <Bar name="Organic Sessions" dataKey="organic" fill="#8bc34a" radius={[4,4,0,0]} stackId="a"/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Pro tip for FB Ad setup */}
                <div style={{background:'rgba(24,119,242,.06)',border:'1px solid rgba(24,119,242,.15)',borderRadius:12,padding:'16px 20px',fontSize:12,color:'#aaa',lineHeight:1.7}}>
                  <strong style={{color:'#4a90d9',display:'flex',alignItems:'center',gap:8,marginBottom:8}}><FaFacebook/> Facebook Ads Setup Guide</strong>
                  Add these params to ALL your Facebook Ad destination URLs:<br/>
                  <code style={{background:'#000',padding:'6px 10px',borderRadius:6,display:'block',marginTop:8,color:'#ff69b4',fontSize:11}}>
                    ?utm_source=facebook&utm_medium=paid&utm_campaign=YOUR_CAMPAIGN_NAME&fbclid={'{{'}fbclid{'}}'}
                  </code>
                  <span style={{color:'#555',fontSize:11,marginTop:6,display:'block'}}>
                    Replace {'{{fbclid}}'} with Facebook's dynamic parameter. HeartEcho will then automatically track all your paid ad conversions.
                  </span>
                </div>
              </>
            )}

            {/* ══════════ LANDING PAGES TAB ══════════ */}
            {tab === 'landing' && (
              <>
                <div className="trk-two">
                  {/* Landing Page Traffic */}
                  <div className="trk-card">
                    <div className="trk-section-title"><FaGlobe/> Top Landing Pages (Entry Points)</div>






                    <div className="trk-scroll">
                      <table className="trk-table">
                        <thead>
                          <tr>
                            <th>Page</th>
                            <th>Sessions</th>
                            <th>Ad Sessions</th>
                            <th>Users</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(data.landingPageStats||[]).map((p,i) => (
                            <tr key={i}>
                              <td>
                                <div style={{color:'#00bcd4',fontWeight:600,fontSize:11}}>{p._id||'/'}</div>
                              </td>
                              <td><span style={{color:'#fff',fontWeight:700}}>{p.sessions}</span></td>
                              <td>
                                <span style={{color:p.adSessions>0?'#1877f2':'#333', fontWeight:600}}>
                                  {p.adSessions||0}
                                  {p.adSessions>0 && <FaFacebook style={{marginLeft:4,fontSize:9}}/>}
                                </span>
                              </td>
                              <td style={{color:'#8bc34a', fontWeight:700}}>{p.uniqueUsers}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Converting Landing Pages */}
                  <div className="trk-card">
                    <div className="trk-section-title"><FaTrophy/> Pages That Converted to Subscriptions</div>
                    {(data.topConvertedLandingPages||[]).length === 0 ? (
                      <div style={{color:'#444',fontSize:12,textAlign:'center',padding:30}}>
                        Track <code style={{color:'#ff69b4',background:'#111',padding:'1px 5px',borderRadius:4}}>subscription_purchase</code> events to see which landing pages drive paid conversions.
                      </div>
                    ) : (
                      <div className="trk-scroll">
                        <table className="trk-table">
                          <thead>
                            <tr><th>Landing Page</th><th>Conversions</th></tr>
                          </thead>
                          <tbody>
                            {(data.topConvertedLandingPages||[]).map((p,i) => (
                              <tr key={i}>
                                <td style={{color:'#00bcd4'}}>{p._id||'/'}</td>
                                <td><span className="badge badge-sp">{p.conversions} <FaCrown style={{fontSize:9}}/></span></td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>

                {/* Landing page bar chart */}
                <div className="trk-card full">
                  <div className="trk-section-title"><FaLink/> Landing Page Sessions Comparison</div>
                  <div style={{height:240}}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={(data.landingPageStats||[]).slice(0,10).map(p=>({name:(p._id||'/').slice(0,22), sessions:p.sessions, ad:p.adSessions||0}))}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#111"/>
                        <XAxis dataKey="name" stroke="#444" fontSize={9} axisLine={false} tickLine={false}/>
                        <YAxis stroke="#444" fontSize={10} axisLine={false} tickLine={false}/>
                        <Tooltip content={<CustomTooltip/>}/>
                        <Legend wrapperStyle={{fontSize:11,color:'#888'}}/>
                        <Bar name="All Sessions" dataKey="sessions" fill="#00bcd4" radius={[4,4,0,0]}/>
                        <Bar name="Ad Sessions" dataKey="ad" fill="#1877f2" radius={[4,4,0,0]}/>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            )}

            {/* ══════════ USER JOURNEY TAB ══════════ */}
            {tab === 'log' && (
              <div className="trk-log">
                <div className="trk-section-title">
                  <FaUsers/> User Activity Log
                  <span style={{fontSize:11,color:'#444',fontWeight:400,marginLeft:'auto'}}>
                    {data.userJourney?.length} unique users/sessions · Page {data.currentPage}/{data.totalPages}
                  </span>
                </div>
                <div className="trk-scroll">
                  <table className="log-table">
                    <thead>
                      <tr>
                        <th>User / Session</th>
                        <th>Events Triggered</th>
                        <th>Landing → Last Page</th>
                        <th>Source</th>
                        <th>First Seen → Last Seen</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(data.userJourney||[]).map((u, i) => {
                        const isAd = u.hasFbclid || u.utmMedium === 'paid' || u.utmMedium === 'cpc';
                        const isOrganic = u.referrer && !isAd;
                        const timeDiff = u.lastSeen && u.firstSeen
                          ? Math.round((new Date(u.lastSeen) - new Date(u.firstSeen)) / 1000) : 0;
                        const dur = timeDiff < 60 ? `${timeDiff}s` : timeDiff < 3600 ? `${Math.round(timeDiff/60)}m` : `${(timeDiff/3600).toFixed(1)}h`;
                        return (
                          <tr key={i}>
                            {/* IDENTITY */}
                            <td>
                              {u.user ? (
                                <div className="user-cell">
                                  <img src={u.user.profile_picture||'https://cdn-icons-png.flaticon.com/512/149/149071.png'} className="u-avatar" alt=""/>
                                  <div>
                                    <div style={{fontWeight:700,color:'#fff',fontSize:12}}>{u.user.name}</div>
                                    <div style={{fontSize:10,color:'#555'}}>{u.user.email}</div>
                                    <span className={`badge badge-${u.user.user_type==='subscriber'?'paid':'free'}`} style={{fontSize:9,marginTop:3}}>
                                      {u.user.user_type==='subscriber'?'Premium':'Free'}
                                    </span>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div style={{color:'#888',fontStyle:'italic',fontSize:12}}>Anonymous</div>
                                  <div style={{fontSize:9,color:'#333',marginTop:2}}>{u.deviceType} · {u.ip?.split(',')[0]}</div>
                                </div>
                              )}
                              <div style={{fontSize:9,color:'#333',marginTop:3}}>sess: {String(u.sessionId||'').substring(0,16)}…</div>
                            </td>

                            {/* EVENTS */}
                            <td>
                              <div style={{fontWeight:900,fontSize:20,color:'#ff69b4',lineHeight:1}}>{u.totalEvents}</div>
                              <div style={{fontSize:9,color:'#555',marginBottom:7}}>total events</div>
                              <div style={{display:'flex',flexWrap:'wrap',gap:3}}>
                                {(u.eventTypes||[]).map(et => (
                                  <span key={et} className={getBadgeClass(et)} style={{fontSize:8,padding:'2px 5px'}}>
                                    {et.replace(/_/g,' ')}
                                  </span>
                                ))}
                              </div>
                              {timeDiff > 0 && <div style={{fontSize:9,color:'#444',marginTop:5}}>⏱ {dur} on site</div>}
                            </td>

                            {/* PAGES */}
                            <td>
                              <div style={{fontSize:11,color:'#00bcd4',fontWeight:600,marginBottom:4}}>↳ {u.landingPage||'/'}</div>
                              {u.lastPage && u.lastPage !== u.landingPage && (
                                <div style={{fontSize:10,color:'#555'}}>last: {u.lastPage}</div>
                              )}
                            </td>

                            {/* SOURCE */}
                            <td>
                              {isAd ? (
                                <span className="badge badge-fb"><FaFacebook/> FB Ad</span>
                              ) : isOrganic ? (
                                <span className="badge badge-organic"><FaGlobe style={{fontSize:9}}/> Organic</span>
                              ) : (
                                <span className="badge badge-direct">Direct</span>
                              )}
                              {u.utmCampaign && <div style={{marginTop:5}}><span className="utm-pill">camp: {u.utmCampaign}</span></div>}
                              {u.utmSource && <div><span className="utm-pill">src: {u.utmSource}</span></div>}
                            </td>

                            {/* TIMES */}
                            <td style={{color:'#888',fontSize:11}}>
                              <div>{u.firstSeen ? new Date(u.firstSeen).toLocaleString([],{dateStyle:'short',timeStyle:'short'}) : '—'}</div>
                              <div style={{color:'#333',margin:'3px 0',fontSize:10}}>↓</div>
                              <div style={{color:'#ccc'}}>{u.lastSeen ? new Date(u.lastSeen).toLocaleString([],{dateStyle:'short',timeStyle:'short'}) : '—'}</div>
                            </td>

                            {/* STATUS */}
                            <td>
                              <div style={{display:'flex',flexDirection:'column',gap:4}}>
                                {u.user?.user_type === 'subscriber' || u.converted ? (
                                  <span className="badge badge-paid" style={{fontSize:9}}><FaCrown style={{fontSize:8}}/> Paid</span>
                                ) : (
                                  <span className="badge badge-free" style={{fontSize:9}}>Free</span>
                                )}
                                {u.loggedIn ? <span className="badge badge-ls" style={{fontSize:9}}>Logged In</span> : null}
                                {u.signedUp ? <span className="badge badge-sc" style={{fontSize:9}}>Signed Up</span> : null}
                                {u.converted ? <span className="badge badge-sp" style={{fontSize:9}}>Converted ✓</span> : null}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {(!data.userJourney || data.userJourney.length === 0) && (
                        <tr><td colSpan="6" style={{textAlign:'center',padding:50,color:'#444'}}>No user activity found for selected filters</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {data.totalPages > 1 && (
                  <div className="trk-pg">
                    <button className="trk-pg-btn" disabled={data.currentPage<=1} onClick={()=>setFilter(p=>({...p,page:p.page-1}))}>← Prev</button>
                    <span style={{color:'#666',fontSize:12}}>Page <strong style={{color:'#fff'}}>{data.currentPage}</strong> of {data.totalPages}</span>
                    <button className="trk-pg-btn" disabled={data.currentPage>=data.totalPages} onClick={()=>setFilter(p=>({...p,page:p.page+1}))}>Next →</button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
