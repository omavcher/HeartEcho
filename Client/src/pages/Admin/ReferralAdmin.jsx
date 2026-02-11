'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FaUserPlus, FaLink, FaMoneyBillWave, FaChartLine, FaSearch, 
  FaEdit, FaTrash, FaPlus, FaSync, FaCopy, FaShare, FaUsers, 
  FaCoins, FaPercentage, FaDownload, FaRupeeSign
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid, LineChart, Line
} from "recharts";
import axios from "axios";
import api from "../../config/api";

// ------------------- CSS STYLES (Pure Black & Pink Theme) -------------------
const styles = `
.ref-root-x30sn {
  color: #ffffff;
  background-color: #000000;
  min-height: 100vh;
  font-family: 'Inter', -apple-system, sans-serif;
  animation: fadeIn-x30sn 0.5s ease;
  padding: 20px;
}

@keyframes fadeIn-x30sn { from { opacity: 0; } to { opacity: 1; } }

/* HEADER */
.ref-header-x30sn {
  display: flex; justify-content: space-between; align-items: flex-start;
  margin-bottom: 32px; gap: 24px; padding: 24px;
  background: #050505; border-radius: 16px; border: 1px solid #222;
}
.ref-title-x30sn { font-size: 28px; font-weight: 800; color: #fff; margin: 0; }
.ref-subtitle-x30sn { font-size: 14px; color: #ff69b4; margin-top: 5px; font-weight: 500; }

.ref-header-actions-x30sn { display: flex; gap: 12px; flex-wrap: wrap; }
.ref-btn-x30sn {
  display: flex; align-items: center; gap: 8px; background: #111; color: #fff;
  border: 1px solid #333; padding: 10px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; transition: 0.3s;
}
.ref-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; background: #000; }
.ref-btn-x30sn.primary { background: #ff69b4; color: #000; border: none; }
.ref-btn-x30sn.primary:hover { background: #ff85c2; transform: translateY(-1px); }

/* TWO ITEMS PER ROW LAYOUT LOGIC */
.ref-stats-grid-x30sn, 
.ref-charts-section-x30sn, 
.ref-creators-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(2, 1fr); /* FORCED 2 ITEMS PER ROW */
  gap: 20px;
  margin-bottom: 32px;
}

/* STAT CARDS */
.ref-stat-card-x30sn {
  background: #0a0a0a; padding: 24px; border-radius: 16px; border: 1px solid #222;
  transition: 0.3s;
}
.ref-stat-card-x30sn:hover { border-color: #ff69b4; transform: translateY(-3px); }
.stat-icon-wrapper-x30sn {
  width: 40px; height: 40px; border-radius: 10px; display: flex;
  align-items: center; justify-content: center; margin-bottom: 12px;
  background: rgba(255, 105, 180, 0.1); color: #ff69b4; font-size: 18px;
}
.stat-label-x30sn { font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 1px; }
.stat-value-x30sn { font-size: 24px; font-weight: 700; color: #fff; margin: 4px 0; }
.stat-change-x30sn { font-size: 12px; color: #ff69b4; font-weight: 500; }

/* CHARTS */
.ref-chart-card-x30sn {
  background: #0a0a0a; padding: 24px; border-radius: 20px; border: 1px solid #222;
}
.chart-header-x30sn { display: flex; align-items: center; gap: 10px; margin-bottom: 25px; color: #fff; font-size: 16px; font-weight: 600; }
.analytics-period-select-x30sn {
  background: #000; color: #ff69b4; border: 1px solid #333; padding: 4px 8px; border-radius: 6px; font-size: 12px; margin-left: auto;
}

/* FILTERS */
.ref-filters-x30sn {
  display: flex; gap: 16px; margin-bottom: 24px; align-items: center; flex-wrap: wrap;
  background: #050505; padding: 15px; border-radius: 12px; border: 1px solid #222;
}
.ref-search-container-x30sn { position: relative; flex: 1; min-width: 200px; }
.ref-search-icon-x30sn { position: absolute; left: 12px; top: 13px; color: #666; }
.ref-search-input-x30sn {
  width: 100%; padding: 10px 10px 10px 40px; background: #000; border: 1px solid #333;
  border-radius: 8px; color: #fff; font-size: 14px; outline: none;
}
.ref-search-input-x30sn:focus { border-color: #ff69b4; }
.ref-filter-select-x30sn {
  background: #000; color: #fff; border: 1px solid #333; padding: 10px 15px; border-radius: 8px; cursor: pointer;
}

/* CREATOR CARDS */
.ref-creator-card-x30sn {
  background: #0a0a0a; border-radius: 16px; padding: 20px; border: 1px solid #222;
  display: flex; flex-direction: column; justify-content: space-between;
}
.ref-creator-card-x30sn:hover { border-color: #ff69b4; }
.ref-creator-header-x30sn { display: flex; gap: 12px; margin-bottom: 15px; }
.ref-creator-avatar-x30sn {
  width: 44px; height: 44px; border-radius: 50%; background: #ff69b4; color: #000;
  display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 18px;
}
.ref-creator-name-x30sn { font-size: 16px; font-weight: 700; color: #fff; margin: 0; }
.ref-creator-platform-x30sn { font-size: 12px; color: #ff69b4; }

.ref-creator-stats-x30sn {
  display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; 
  background: #111; padding: 12px; border-radius: 10px; margin-bottom: 15px;
}
.ref-stat-item-x30sn { text-align: center; }
.ref-stat-item-x30sn .stat-label { font-size: 9px; color: #666; text-transform: uppercase; display: block; }
.ref-stat-item-x30sn .stat-value { font-size: 13px; font-weight: 700; color: #fff; }

.ref-payout-box-x30sn {
  background: rgba(255, 105, 180, 0.05); border: 1px solid rgba(255, 105, 180, 0.2);
  padding: 10px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;
}
.payout-info-x30sn { font-size: 12px; color: #ff69b4; font-weight: 600; }

.ref-link-area-x30sn {
  background: #000; border: 1px solid #222; padding: 8px; border-radius: 8px; margin-bottom: 12px;
}
.link-text-x30sn { font-size: 10px; color: #888; font-family: monospace; display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;}

/* MODAL */
.ref-modal-overlay-x30sn {
  position: fixed; inset: 0; background: rgba(0,0,0,0.85); display: flex; 
  justify-content: center; align-items: center; z-index: 1000; backdrop-filter: blur(8px);
}
.ref-modal-content-x30sn {
  background: #0a0a0a; border: 1px solid #333; width: 90%; max-width: 500px; 
  border-radius: 20px; padding: 24px; position: relative;
}
.ref-form-group-x30sn { margin-bottom: 15px; }
.ref-form-group-x30sn label { display: block; font-size: 11px; color: #ff69b4; font-weight: 700; margin-bottom: 6px; text-transform: uppercase; }
.ref-form-input-x30sn {
  width: 100%; padding: 10px; background: #000; border: 1px solid #333; color: #fff; border-radius: 8px; outline: none; font-size: 13px;
}
.ref-form-input-x30sn:focus { border-color: #ff69b4; }

/* RESPONSIVE: 1 COLUMN FOR MOBILE ONLY */
@media (max-width: 768px) {
  .ref-stats-grid-x30sn, 
  .ref-charts-section-x30sn, 
  .ref-creators-grid-x30sn {
    grid-template-columns: 1fr;
  }
  .ref-header-x30sn { flex-direction: column; align-items: flex-start; padding: 15px;}
}
`;

const ReferralAdmin = () => {
  const [creators, setCreators] = useState([]);
  const [referralStats, setReferralStats] = useState({});
  const [referralAnalytics, setReferralAnalytics] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCreator, setEditCreator] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [analyticsPeriod, setAnalyticsPeriod] = useState("30d");

  const [newCreator, setNewCreator] = useState({
    name: "", platform: "instagram", username: "", commissionRate: 15, email: "", phone: ""
  });

  const colors = useMemo(() => ["#ff69b4", "#ffffff", "#333333", "#ff1493"], []);

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = getToken();
      const [resC, resS, resA] = await Promise.all([
        axios.get(`${api.Url}/admin/referral-creators`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${api.Url}/admin/referral-stats`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${api.Url}/admin/referral-analytics?period=${analyticsPeriod}`, { headers: { Authorization: `Bearer ${token}` } })
      ]);
      setCreators(resC.data.creators || []);
      setReferralStats(resS.data.stats || {});
      setReferralAnalytics(resA.data.analytics || {});
    } catch (e) { console.error(e); }
    setRefreshing(false);
    setLoading(false);
  }, [analyticsPeriod, getToken]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const stats = useMemo(() => {
    const b = referralStats.summary || {};
    return {
      total: b.totalCreators || creators.length,
      active: b.activeCreators || creators.filter(c => c.isActive !== false).length,
      refs: b.totalReferrals || 0,
      earn: b.totalEarnings || 0,
      pend: b.pendingEarnings || 0,
      conversion: b.totalCreators > 0 ? ((b.totalReferrals || 0) / b.totalCreators).toFixed(1) : 0
    };
  }, [referralStats, creators]);

  const platformData = useMemo(() => {
    const counts = creators.reduce((acc, c) => {
      const p = c.platform || 'other';
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(counts).map(([name, value], idx) => ({
      name: name.toUpperCase(), value, color: colors[idx % colors.length]
    }));
  }, [creators, colors]);

  const referralTrendData = useMemo(() => {
    if (referralAnalytics.referralTrend?.length > 0) {
      return referralAnalytics.referralTrend.map(i => ({
        day: new Date(i._id).toLocaleDateString('en-US', { weekday: 'short' }), referrals: i.count
      }));
    }
    return [ {day:'Mon', referrals:0}, {day:'Sun', referrals:0} ];
  }, [referralAnalytics]);

  const filteredCreators = useMemo(() => {
    return creators.filter((c) => {
      const searchMatch = c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.referralId?.toLowerCase().includes(searchTerm.toLowerCase());
      const statusMatch = filterStatus === "all" || (filterStatus === "active" ? c.isActive : !c.isActive);
      return searchMatch && statusMatch;
    });
  }, [creators, searchTerm, filterStatus]);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      await axios.post(`${api.Url}/admin/referral-creators`, newCreator, { headers: { Authorization: `Bearer ${token}` } });
      setShowCreateModal(false);
      fetchAllData();
    } catch (e) { alert("Error creating creator"); }
  };

  const handleDeleteCreator = async (id) => {
    if (!confirm("Delete creator?")) return;
    try {
      const token = getToken();
      await axios.delete(`${api.Url}/admin/referral-creators/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      fetchAllData();
    } catch (e) { alert("Error deleting"); }
  };

  const handleToggleStatus = async (creator) => {
    try {
      const token = getToken();
      await axios.put(`${api.Url}/admin/referral-creators/${creator._id}`, { isActive: !creator.isActive }, { headers: { Authorization: `Bearer ${token}` } });
      fetchAllData();
    } catch (e) { alert("Update failed"); }
  };

  const handleProcessPayout = async (id, amount) => {
    if (!confirm(`Process payout of ₹${amount}?`)) return;
    // Payout logic here
    alert("Payout processed!");
  };

  if (loading) return <div style={{background:'#000', height:'100vh', display:'flex', alignItems:'center', justifyContent:'center', color:'#ff69b4'}}>Initializing...</div>;

  return (
    <div className="ref-root-x30sn">
      <style>{styles}</style>
      
      {/* HEADER */}
      <div className="ref-header-x30sn">
        <div className="ref-title-group-x30sn">
          <h2 className="ref-title-x30sn">Referral Console</h2>
          <p className="ref-subtitle-x30sn">Creator Partners & Earnings</p>
        </div>
        <div className="ref-header-actions-x30sn">
          <button className="ref-btn-x30sn" onClick={fetchAllData}><FaSync className={refreshing ? 'spin' : ''}/> Sync</button>
          <button className="ref-btn-x30sn primary" onClick={() => setShowCreateModal(true)}><FaPlus /> Add Creator</button>
        </div>
      </div>

      {/* STATS - 2 PER ROW */}
      <div className="ref-stats-grid-x30sn">
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaUsers /></div>
          <span className="stat-label-x30sn">Total Partners</span>
          <p className="stat-value-x30sn">{stats.total}</p>
          <span className="stat-change-x30sn">{stats.active} Active Now</span>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaUserPlus /></div>
          <span className="stat-label-x30sn">Total Referrals</span>
          <p className="stat-value-x30sn">{stats.refs}</p>
          <span className="stat-change-x30sn">{stats.conversion} avg / creator</span>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaRupeeSign /></div>
          <span className="stat-label-x30sn">Total Payouts</span>
          <p className="stat-value-x30sn">₹{stats.earn}</p>
          <span className="stat-change-x30sn">Last 30 Days</span>
        </div>
        <div className="ref-stat-card-x30sn">
          <div className="stat-icon-wrapper-x30sn"><FaCoins /></div>
          <span className="stat-label-x30sn">Pending</span>
          <p className="stat-value-x30sn">₹{stats.pend}</p>
          <span className="stat-change-x30sn" style={{color:'#fff'}}>Due for processing</span>
        </div>
      </div>

      {/* CHARTS - 2 PER ROW */}
      <div className="ref-charts-section-x30sn">
        <div className="ref-chart-card-x30sn">
          <div className="chart-header-x30sn"><FaChartLine /> Platform Distribution</div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={platformData} innerRadius={60} outerRadius={85} paddingAngle={5} dataKey="value">
                {platformData.map((e, i) => <Cell key={i} fill={e.color} stroke="none" />)}
              </Pie>
              <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}} />
              <Legend verticalAlign="bottom" />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="ref-chart-card-x30sn">
          <div className="chart-header-x30sn">
            <FaChartLine /> Referral Trend
            <select value={analyticsPeriod} onChange={e => setAnalyticsPeriod(e.target.value)} className="analytics-period-select-x30sn">
              <option value="30d">Last 30D</option><option value="7d">Last 7D</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={referralTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
              <XAxis dataKey="day" stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
              <YAxis stroke="#555" fontSize={10} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}} />
              <Line type="monotone" dataKey="referrals" stroke="#ff69b4" strokeWidth={3} dot={{r:4, fill:'#ff69b4'}} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* FILTERS */}
      <div className="ref-filters-x30sn">
        <div className="ref-search-container-x30sn">
          <FaSearch className="ref-search-icon-x30sn" />
          <input className="ref-search-input-x30sn" placeholder="Search creators..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        </div>
        <select className="ref-filter-select-x30sn" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* CREATORS LIST - 2 PER ROW */}
      <div className="ref-creators-grid-x30sn">
        {filteredCreators.map((creator) => (
          <div key={creator._id} className="ref-creator-card-x30sn">
            <div>
              <div className="ref-creator-header-x30sn">
                <div className="ref-creator-avatar-x30sn">{creator.name?.charAt(0)}</div>
                <div style={{flex:1}}>
                  <h4 className="ref-creator-name-x30sn">{creator.name}</h4>
                  <p className="ref-creator-platform-x30sn">{creator.platform} • @{creator.username}</p>
                </div>
                <button className="ref-btn-x30sn" style={{padding:'5px 10px'}} onClick={() => navigator.clipboard.writeText(creator.referralId)}><FaCopy/></button>
              </div>

              <div className="ref-creator-stats-x30sn">
                <div className="ref-stat-item-x30sn"><span className="stat-label">Refs</span><span className="stat-value">{creator.referralCount || 0}</span></div>
                <div className="ref-stat-item-x30sn"><span className="stat-label">Earned</span><span className="stat-value">₹{creator.totalEarnings || 0}</span></div>
                <div className="ref-stat-item-x30sn"><span className="stat-label">Rate</span><span className="stat-value">{creator.commissionRate}%</span></div>
              </div>

              {creator.pendingEarnings > 0 && (
                <div className="ref-payout-box-x30sn">
                  <span className="payout-info-x30sn">₹{creator.pendingEarnings} Pending</span>
                  <button className="ref-btn-x30sn primary" style={{padding:'5px 10px', fontSize:'11px'}} onClick={() => handleProcessPayout(creator._id, creator.pendingEarnings)}>Payout</button>
                </div>
              )}

              <div className="ref-link-area-x30sn">
                <span className="link-text-x30sn">ID: {creator.referralId}</span>
              </div>
            </div>

            <div style={{display:'flex', gap:8, marginTop:10, justifyContent:'space-between'}}>
                <button className="ref-btn-x30sn" style={{flex:1}} onClick={() => handleToggleStatus(creator)}>{creator.isActive ? 'Deactivate' : 'Activate'}</button>
                <div style={{display:'flex', gap:8}}>
                    <button className="ref-btn-x30sn" onClick={() => setEditCreator(creator)}><FaEdit/></button>
                    <button className="ref-btn-x30sn" style={{color:'#ff4444', borderColor:'#ff4444'}} onClick={() => handleDeleteCreator(creator._id)}><FaTrash/></button>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="ref-modal-overlay-x30sn">
          <div className="ref-modal-content-x30sn">
            <h3 style={{color:'#fff', marginBottom:'20px'}}>New Partner</h3>
            <form onSubmit={handleCreate}>
              <div className="ref-form-group-x30sn">
                <label>Full Name</label>
                <input className="ref-form-input-x30sn" type="text" required onChange={e => setNewCreator({...newCreator, name:e.target.value})} />
              </div>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'15px'}}>
                <div className="ref-form-group-x30sn">
                    <label>Platform</label>
                    <select className="ref-form-input-x30sn" onChange={e => setNewCreator({...newCreator, platform:e.target.value})}>
                        <option value="instagram">Instagram</option><option value="youtube">YouTube</option>
                    </select>
                </div>
                <div className="ref-form-group-x30sn">
                    <label>Commission %</label>
                    <input className="ref-form-input-x30sn" type="number" defaultValue="15" onChange={e => setNewCreator({...newCreator, commissionRate:e.target.value})} />
                </div>
              </div>
              <div className="ref-form-group-x30sn">
                <label>Username</label>
                <input className="ref-form-input-x30sn" type="text" required onChange={e => setNewCreator({...newCreator, username:e.target.value})} />
              </div>
              <div style={{display:'flex', gap:10, marginTop:20}}>
                <button type="submit" className="ref-btn-x30sn primary" style={{flex:1}}>Create Partner</button>
                <button type="button" className="ref-btn-x30sn" style={{flex:1}} onClick={() => setShowCreateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralAdmin;