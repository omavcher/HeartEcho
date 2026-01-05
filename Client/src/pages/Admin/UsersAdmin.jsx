'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import "./UsersAdmin.css";
import {
  FaUser, FaTrash, FaEdit, FaStar, FaSearch, FaSync, FaShieldAlt, 
  FaUserPlus, FaRobot, FaCircle, FaArrowUp, FaArrowDown
} from "react-icons/fa";
import {
  BarChart, Bar, AreaChart, Area, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Cell
} from "recharts";
import axios from "axios";
import api from "../../config/api";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const usersPerPage = 8;

  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') return localStorage.getItem("token") || "";
    return "";
  }, []);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/user-dataw`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      setUsers(response.data.userData || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // --- BUSINESS INTELLIGENCE CALCULATIONS ---

  const intelligence = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(now.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let joinedToday = 0;
    let joinedYesterday = 0;

    users.forEach(u => {
      const joinDate = u.joinedAt?.split('T')[0];
      if (joinDate === todayStr) joinedToday++;
      if (joinDate === yesterdayStr) joinedYesterday++;
    });

    // Calculate Growth %
    let growth = 0;
    if (joinedYesterday > 0) {
      growth = ((joinedToday - joinedYesterday) / joinedYesterday) * 100;
    } else if (joinedToday > 0) {
      growth = 100; // First growth spike
    }

    // Top Users by Message Usage Today
    const powerUsers = [...users]
      .sort((a, b) => (b.messagesUsedToday || 0) - (a.messagesUsedToday || 0))
      .slice(0, 8)
      .map(u => ({
        name: u.name.split(' ')[0],
        usage: u.messagesUsedToday || 0,
        fullName: u.name
      }));

    return { joinedToday, growth, powerUsers };
  }, [users]);

  // General Trend Data (Monthly)
  const trendData = useMemo(() => {
    const counts = {};
    users.forEach(u => {
      const date = new Date(u.joinedAt).toLocaleDateString('en-US', { month: 'short' });
      counts[date] = (counts[date] || 0) + 1;
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [users]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          u.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = filterType === "all" || u.user_type === filterType;
      return matchSearch && matchType;
    });
  }, [users, searchTerm, filterType]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, currentPage]);

  if (loading) return <div className="loading-state-3244f"><span></span><p>Syncing Neural Network...</p></div>;

  return (
    <div className="dex-dark-root-3244f">
      <header className="dex-header-3244f">
        <div className="header-text-3244f">
          <h1 className="dex-main-title-3244f">Admin Insight</h1>
          <p className="dex-status-3244f"><FaCircle className="status-online-3244f" /> System Online: {users.length} Users</p>
        </div>
        <div className="header-actions-3244f">
          <button className={`btn-sync-3244f ${refreshing ? 'spinning-3244f' : ''}`} onClick={fetchAllData}><FaSync /></button>
        </div>
      </header>

      {/* Dynamic Intelligence Cards */}
      <section className="dex-kpi-grid-3244f">
        <div className="kpi-card-3244f">
          <div className="kpi-icon-wrapper-3244f blue-bg-3244f"><FaUserPlus /></div>
          <div className="kpi-val-group-3244f">
            <span>New Today</span>
            <strong>{intelligence.joinedToday}</strong>
          </div>
        </div>
        <div className="kpi-card-3244f">
          <div className="kpi-icon-wrapper-3244f green-bg-3244f">
            {intelligence.growth >= 0 ? <FaArrowUp /> : <FaArrowDown />}
          </div>
          <div className="kpi-val-group-3244f">
            <span>Growth vs Yesterday</span>
            <strong className={intelligence.growth >= 0 ? 'text-green-3244f' : 'text-red-3244f'}>
              {intelligence.growth.toFixed(1)}%
            </strong>
          </div>
        </div>
        <div className="kpi-card-3244f">
          <div className="kpi-icon-wrapper-3244f purple-bg-3244f"><FaRobot /></div>
          <div className="kpi-val-group-3244f">
            <span>Power Sessions</span>
            <strong>{users.filter(u => u.messagesUsedToday > 5).length} Users</strong>
          </div>
        </div>
      </section>

      {/* Analytics Visualization */}
      <section className="dex-visuals-grid-3244f">
        <div className="visual-card-3244f">
          <h3>Activity Leaderboard (Today's Usage)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={intelligence.powerUsers}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2c2c2e" />
              <XAxis dataKey="name" stroke="#8e8e93" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{fill: '#2c2c2e'}} 
                contentStyle={{backgroundColor: '#1c1c1e', border: '1px solid #38383a', borderRadius: '10px'}} 
              />
              <Bar dataKey="usage" radius={[5, 5, 0, 0]} barSize={30}>
                {intelligence.powerUsers.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={index === 0 ? '#30D158' : '#0A84FF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="visual-card-3244f">
          <h3>Onboarding Trend</h3>
          <ResponsiveContainer width="100%" height={250}>
            <AreaChart data={trendData}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#BF5AF2" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#BF5AF2" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#8e8e93" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{backgroundColor: '#1c1c1e', border: '1px solid #38383a'}} />
              <Area type="monotone" dataKey="value" stroke="#BF5AF2" fillOpacity={1} fill="url(#colorVal)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* User Management Section */}
      <section className="dex-table-section-3244f">
        <div className="table-controls-3244f">
          <div className="search-box-3244f">
            <FaSearch />
            <input type="text" placeholder="Identity search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="filter-select-3244f" onChange={e => setFilterType(e.target.value)}>
            <option value="all">Full Access</option>
            <option value="free">Free Tier</option>
            <option value="subscriber">Subscribers</option>
          </select>
        </div>

        <div className="user-grid-3244f">
          {paginatedUsers.map(user => (
            <div key={user._id} className="user-pro-card-3244f">
              <div className="user-pro-top-3244f">
                <img src={user.profile_picture || 'https://via.placeholder.com/150'} alt="" />
                <span className={`badge-3244f ${user.user_type === 'subscriber' ? 'subscriber-3244f' : ''}`}>
                  {user.user_type}
                </span>
              </div>
              <div className="user-pro-body-3244f">
                <h4>{user.name}</h4>
                <p className="email-label-3244f">{user.email}</p>
                
                <div className="mini-quota-3244f">
                  <div className="mini-quota-labels-3244f">
                    <span>Usage Index</span>
                    <span>{user.messagesUsedToday} / {user.messageQuota}</span>
                  </div>
                  <div className="mini-quota-track-3244f">
                    <div className="mini-quota-fill-3244f" style={{width: `${Math.min((user.messagesUsedToday/user.messageQuota)*100, 100)}%`}}></div>
                  </div>
                </div>

                <div className="user-pro-tags-3244f">
                  <div className="tag-3244f"><FaRobot /> {user.ai_friends?.length}</div>
                  <div className={`tag-3244f ${user.twofactor ? 'active-tag-3244f' : ''}`}><FaShieldAlt /> 2FA</div>
                  <div className={`tag-3244f ${user.hasUsedReferral ? 'active-tag-3244f' : ''}`}><FaUserPlus /> Ref</div>
                </div>
              </div>
             
            </div>
          ))}
        </div>

        <div className="pagination-3244f">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Back</button>
          <span>Cluster {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}</span>
          <button disabled={currentPage >= Math.ceil(filteredUsers.length / usersPerPage)} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
};

export default UsersAdmin;