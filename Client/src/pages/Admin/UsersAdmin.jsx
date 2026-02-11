'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaUser, FaTrash, FaEdit, FaSearch, FaSync, 
  FaUserPlus, FaRobot, FaDownload, FaPhone, FaIdBadge, FaChartPie
} from "react-icons/fa";
import { 
  AreaChart, Area, Tooltip, ResponsiveContainer, XAxis, YAxis, CartesianGrid,
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from "recharts";
import axios from "axios";
import api from "../../config/api";

// ------------------- CSS STYLES FOR USERS & CHARTS -------------------
const userStyles = `
/* ROOT THEME */
.users-root-x30sn {
  color: #fff;
  font-family: 'Inter', sans-serif;
  animation: fadeIn-x30sn 0.5s ease;
}
@keyframes fadeIn-x30sn { from { opacity: 0; } to { opacity: 1; } }

/* HEADER */
.u-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; flex-wrap: wrap; gap: 15px;
}
.u-title-x30sn { font-size: 28px; font-weight: 800; color: #fff; margin: 0; }
.u-tagline-x30sn { color: #ff69b4; font-size: 13px; font-weight: 500; }

.u-sync-btn-x30sn {
  background: #000; border: 1px solid #333; color: #ff69b4; width: 42px; height: 42px;
  border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.u-sync-btn-x30sn:hover { background: #1a1a1a; transform: rotate(180deg); border-color: #ff69b4; }

/* ANALYTICS GRID (NEW) */
.analytics-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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

/* KPI STRIP */
.kpi-strip-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 15px; margin-bottom: 30px;
}
.kpi-box-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 12px; padding: 15px; 
  display: flex; align-items: center; gap: 15px;
  transition: transform 0.2s;
}
.kpi-box-x30sn:hover { transform: translateY(-2px); border-color: #333; }
.kpi-ico-x30sn {
  width: 44px; height: 44px; background: rgba(255,105,180,0.1); color: #ff69b4; border-radius: 12px;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.kpi-txt-x30sn span { display: block; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
.kpi-txt-x30sn strong { font-size: 20px; color: #fff; font-weight: 700; }

/* CONTROLS */
.controls-x30sn {
  display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap;
  background: #050505; padding: 15px; border-radius: 12px; border: 1px solid #222;
}
.search-wrap-x30sn {
  position: relative; flex: 1; min-width: 250px;
}
.search-wrap-x30sn svg { position: absolute; left: 14px; top: 12px; color: #555; }
.search-inp-x30sn {
  width: 100%; padding: 10px 10px 10px 40px; background: #000; border: 1px solid #333;
  border-radius: 8px; color: #fff; outline: none; font-size: 14px;
}
.search-inp-x30sn:focus { border-color: #ff69b4; }
.filter-sel-x30sn {
  background: #000; color: #fff; border: 1px solid #333; padding: 0 15px; border-radius: 8px; outline: none; cursor: pointer;
}

/* USER GRID */
.u-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;
}
.u-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px;
  transition: all 0.3s; position: relative;
}
.u-card-x30sn:hover { border-color: #ff69b4; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transform: translateY(-3px); }

.uc-top-x30sn { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: flex-start; }
.img-wrap-x30sn {
    width: 56px; height: 56px; border-radius: 50%; padding: 2px;
    background: linear-gradient(45deg, #333, #000);
}
.uc-img-x30sn { 
    width: 100%; height: 100%; border-radius: 50%; object-fit: cover; 
    border: 2px solid #000;
}
.uc-badge-x30sn {
  font-size: 9px; padding: 5px 10px; border-radius: 20px; background: #1a1a1a; color: #888; 
  height: fit-content; text-transform: uppercase; font-weight: 700; border: 1px solid #333;
}
.uc-badge-x30sn.sub { background: #ff69b4; color: #000; border: none; box-shadow: 0 0 10px rgba(255,105,180,0.4); }

.uc-info-x30sn h4 { margin: 0 0 4px 0; color: #fff; font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uc-email-x30sn { color: #666; font-size: 12px; margin-bottom: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.uc-meta-x30sn {
  background: #000; padding: 12px; border-radius: 10px; display: grid; gap: 8px; margin-bottom: 15px; border: 1px solid #1a1a1a;
}
.uc-row-x30sn { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #999; }
.uc-row-x30sn svg { color: #ff69b4; font-size: 12px; }

.quota-bar-x30sn { height: 4px; background: #222; border-radius: 2px; margin: 10px 0; overflow: hidden; }
.quota-fill-x30sn { height: 100%; background: linear-gradient(90deg, #ff69b4, #b042ff); border-radius: 2px; }
.quota-lbl-x30sn { display: flex; justify-content: space-between; font-size: 10px; color: #555; font-weight: 600; }

.uc-actions-x30sn {
  display: flex; justify-content: flex-end; gap: 8px; margin-top: 15px; padding-top: 15px; border-top: 1px solid #222;
}
.act-btn-x30sn {
  background: #111; border: 1px solid #222; color: #ccc; width: 32px; height: 32px; 
  border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: 0.2s;
}
.act-btn-x30sn:hover { background: #ff69b4; color: #000; border-color: #ff69b4; }

/* PAGINATION */
.pg-wrap-x30sn { display: flex; justify-content: center; gap: 15px; margin-top: 40px; align-items: center; padding-bottom: 40px; }
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

@media (max-width: 768px) {
  .u-header-x30sn { flex-direction: column; align-items: flex-start; }
  .controls-x30sn { flex-direction: column; padding: 10px; }
  .chart-card-x30sn { height: 250px; }
}
`;

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [exportFilter, setExportFilter] = useState("all");
  const usersPerPage = 8;

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchAllData = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/user-dataw`, { headers: { Authorization: `Bearer ${token}` } });
      setUsers(response.data.userData || []);
    } catch (error) { console.error("Fetch Error:", error); } 
    finally { setLoading(false); }
  }, [getToken]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // --- ANALYTICS DATA PREPARATION ---
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    return {
      joinedToday: users.filter(u => u.joinedAt?.split('T')[0] === todayStr).length,
      premiumUsers: users.filter(u => u.user_type === 'subscriber').length,
      totalLogins: users.reduce((acc, u) => acc + (u.login_details?.length || 0), 0),
      avgAge: users.length > 0 ? (users.reduce((acc, u) => acc + (u.age || 0), 0) / users.length).toFixed(1) : 0
    };
  }, [users]);

  // Chart 1: Join Trend (Last 7 Days)
  const growthData = useMemo(() => {
    const data = [];
    for(let i=6; i>=0; i--){
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const count = users.filter(u => u.joinedAt?.startsWith(dateStr)).length;
        data.push({ name: d.toLocaleDateString('en-US',{weekday:'short'}), count: count });
    }
    return data;
  }, [users]);

  // Chart 2: User Types Pie
  const userTypeData = useMemo(() => [
    { name: 'Free', value: users.filter(u => u.user_type !== 'subscriber').length },
    { name: 'Premium', value: users.filter(u => u.user_type === 'subscriber').length }
  ], [users]);

  // Chart 3: Message Activity (Top 5 users by usage today)
  const activityData = useMemo(() => {
    return users
        .sort((a,b) => (b.messagesUsedToday || 0) - (a.messagesUsedToday || 0))
        .slice(0, 5)
        .map(u => ({ name: u.name?.split(' ')[0] || 'User', msg: u.messagesUsedToday || 0 }));
  }, [users]);

  const COLORS = ['#333', '#ff69b4'];

  // --- FILTER LOGIC ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u._id?.includes(searchTerm);
      const matchType = filterType === "all" || u.user_type === filterType;
      return matchSearch && matchType;
    });
  }, [users, searchTerm, filterType]);

  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const exportUsersForEmail = () => {
     alert("Downloading JSON for: " + exportFilter);
     // Add your JSON download logic here
  };

  if (loading) return <div className="loader-x30sn"><div className="spinner-x30sn"></div><p>Syncing Database...</p></div>;

  return (
    <>
      <style>{userStyles}</style>
      <div className="users-root-x30sn">
        
        {/* HEADER */}
        <header className="u-header-x30sn">
          <div>
            <h1 className="u-title-x30sn">Users & Analytics</h1>
            <span className="u-tagline-x30sn">Platform Intelligence • {users.length} Total Accounts</span>
          </div>
          <button className="u-sync-btn-x30sn" onClick={fetchAllData}><FaSync /></button>
        </header>

        {/* KPI STRIP */}
        <div className="kpi-strip-x30sn">
          <div className="kpi-box-x30sn">
            <div className="kpi-ico-x30sn"><FaUserPlus /></div>
            <div className="kpi-txt-x30sn"><span>New Today</span><strong>{stats.joinedToday}</strong></div>
          </div>
          <div className="kpi-box-x30sn">
            <div className="kpi-ico-x30sn"><FaUser /></div>
            <div className="kpi-txt-x30sn"><span>Premium Users</span><strong>{stats.premiumUsers}</strong></div>
          </div>
          <div className="kpi-box-x30sn">
            <div className="kpi-ico-x30sn"><FaRobot /></div>
            <div className="kpi-txt-x30sn"><span>Total Logins</span><strong>{stats.totalLogins}</strong></div>
          </div>
        </div>

        {/* CHARTS SECTION */}
        <div className="analytics-grid-x30sn">
            {/* 1. Growth Chart */}
            <div className="chart-card-x30sn">
                <div className="chart-title-x30sn"><FaUserPlus/> Weekly Growth</div>
                <ResponsiveContainer width="100%" height="85%">
                    <AreaChart data={growthData}>
                        <defs>
                            <linearGradient id="growthGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#ff69b4" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#ff69b4" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222"/>
                        <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false}/>
                        <Tooltip contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}} itemStyle={{color:'#ff69b4'}}/>
                        <Area type="monotone" dataKey="count" stroke="#ff69b4" fill="url(#growthGrad)" strokeWidth={2}/>
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* 2. User Types Pie */}
            <div className="chart-card-x30sn">
                <div className="chart-title-x30sn"><FaChartPie/> Subscription Split</div>
                <ResponsiveContainer width="100%" height="85%">
                    <PieChart>
                        <Pie 
                            data={userTypeData} 
                            cx="50%" cy="50%" 
                            innerRadius={60} 
                            outerRadius={80} 
                            paddingAngle={5} 
                            dataKey="value"
                        >
                            {userTypeData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}}/>
                        <Legend verticalAlign="bottom" iconType="circle" />
                    </PieChart>
                </ResponsiveContainer>
            </div>

             {/* 3. Top Activity Bar */}
             <div className="chart-card-x30sn">
                <div className="chart-title-x30sn"><FaRobot/> Top Daily Users (Msg)</div>
                <ResponsiveContainer width="100%" height="85%">
                    <BarChart data={activityData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222"/>
                        <XAxis dataKey="name" stroke="#555" fontSize={10} axisLine={false} tickLine={false}/>
                        <Tooltip cursor={{fill: '#111'}} contentStyle={{backgroundColor:'#000', borderColor:'#333', color:'#fff'}}/>
                        <Bar dataKey="msg" fill="#333" radius={[4, 4, 0, 0]} activeBar={{fill: '#ff69b4'}} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* CONTROLS */}
        <div className="controls-x30sn">
          <div className="search-wrap-x30sn">
            <FaSearch />
            <input type="text" className="search-inp-x30sn" placeholder="Search by name, email or ID..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="filter-sel-x30sn" onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Tiers</option>
            <option value="subscriber">Premium</option>
            <option value="free">Free</option>
          </select>
          <button className="u-sync-btn-x30sn" style={{width:'auto', padding:'0 15px', borderRadius:8, fontSize:12, gap:8}} onClick={exportUsersForEmail}>
             <FaDownload/> Export
          </button>
        </div>

        {/* USER LIST GRID */}
        <div className="u-grid-x30sn">
          {paginatedUsers.map(user => (
            <div key={user._id} className="u-card-x30sn">
              <div className="uc-top-x30sn">
                <div className="img-wrap-x30sn">
                    {/* Fixed Image Tag for Google Avatars */}
                    <img 
                        src={user.profile_picture || user.picture || user.avatar || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                        className="uc-img-x30sn" 
                        alt="Profile"
                        referrerPolicy="no-referrer"
                        onError={(e) => { e.target.onerror = null; e.target.src = "https://cdn-icons-png.flaticon.com/512/149/149071.png"; }}
                    />
                </div>
                <span className={`uc-badge-x30sn ${user.user_type === 'subscriber' ? 'sub' : ''}`}>
                    {user.user_type === 'subscriber' ? 'Premium' : 'Free'}
                </span>
              </div>
              
              <div className="uc-info-x30sn">
                <h4>{user.name || "Unknown User"}</h4>
                <div className="uc-email-x30sn">{user.email || "No Email"}</div>
                
                <div className="uc-meta-x30sn">
                    <div className="uc-row-x30sn"><FaIdBadge/> {user._id ? user._id.slice(-6).toUpperCase() : '---'}</div>
                    <div className="uc-row-x30sn"><FaPhone/> {user.phone_number || 'N/A'}</div>
                </div>

                <div className="quota-lbl-x30sn">
                    <span>Daily Usage</span>
                    <span>{user.messagesUsedToday || 0} / {user.messageQuota || 10}</span>
                </div>
                <div className="quota-bar-x30sn">
                    <div className="quota-fill-x30sn" style={{width: `${Math.min(((user.messagesUsedToday||0)/(user.messageQuota||10))*100, 100)}%`}}></div>
                </div>
              </div>

              <div className="uc-actions-x30sn">
                <button className="act-btn-x30sn" title="Edit User"><FaEdit /></button>
                <button className="act-btn-x30sn" style={{color:'#ff4444', borderColor:'rgba(255,68,68,0.2)'}} title="Delete User"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        <div className="pg-wrap-x30sn">
            <button className="pg-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
            <span style={{color:'#666', fontSize:13, fontWeight:600}}>Page {currentPage}</span>
            <button className="pg-btn-x30sn" disabled={paginatedUsers.length < usersPerPage} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </div>
    </>
  );
};

export default UsersAdmin;