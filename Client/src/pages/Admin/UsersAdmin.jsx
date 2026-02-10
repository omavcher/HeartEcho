'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import "./UsersAdmin.css";
import {
  FaUser, FaTrash, FaEdit, FaStar, FaSearch, FaSync, FaShieldAlt, 
  FaUserPlus, FaRobot, FaCircle, FaArrowUp, FaArrowDown, FaPhone, 
  FaIdBadge, FaCalendarAlt, FaTicketAlt, FaHistory, FaDownload, FaEnvelope
} from "react-icons/fa";
import {
  BarChart, Bar, AreaChart, Area, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid, Cell, Legend
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
  const [exportFilter, setExportFilter] = useState("all"); // "all", "today", "lastWeek", "lastMonth"
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

  // --- Email Promotion Export Function ---
  const exportUsersForEmail = () => {
    const now = new Date();
    let filteredUsers = [];

    switch(exportFilter) {
      case "today":
        const todayStr = now.toISOString().split('T')[0];
        filteredUsers = users.filter(user => 
          user.joinedAt?.split('T')[0] === todayStr
        );
        break;
      case "lastWeek":
        const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        filteredUsers = users.filter(user => {
          const userDate = new Date(user.joinedAt);
          return userDate >= lastWeek && userDate <= now;
        });
        break;
      case "lastMonth":
        const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        filteredUsers = users.filter(user => {
          const userDate = new Date(user.joinedAt);
          return userDate >= lastMonth && userDate <= now;
        });
        break;
      default:
        filteredUsers = users;
    }

    // Format data for export
    const exportData = filteredUsers.map(user => ({
      name: user.name || "N/A",
      email: user.email || "N/A",
      age: user.age || "N/A",
      gender: user.gender || "N/A",
      user_type: user.user_type || "free",
    }));

    // Create and trigger download
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    
    // Generate filename based on filter
    let filename = "users_";
    switch(exportFilter) {
      case "today": filename += "today_"; break;
      case "lastWeek": filename += "last_week_"; break;
      case "lastMonth": filename += "last_month_"; break;
      default: filename += "all_";
    }
    filename += `${new Date().toISOString().split('T')[0]}.json`;
    
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // --- Advanced Intelligence & Statistics ---
  const stats = useMemo(() => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    
    const joinedToday = users.filter(u => u.joinedAt?.split('T')[0] === todayStr).length;
    const premiumUsers = users.filter(u => u.user_type === 'subscriber').length;
    const totalLogins = users.reduce((acc, u) => acc + (u.login_details?.length || 0), 0);
    const avgAge = users.length > 0 
      ? (users.reduce((acc, u) => acc + (u.age || 0), 0) / users.length).toFixed(1) 
      : 0;

    return { joinedToday, premiumUsers, totalLogins, avgAge };
  }, [users]);

  // --- Day-Wise Join Growth Chart ---
  const growthTrendData = useMemo(() => {
    const dailyCounts = {};
    // Get last 14 days
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      dailyCounts[d.toISOString().split('T')[0]] = 0;
    }

    users.forEach(u => {
      const date = u.joinedAt?.split('T')[0];
      if (dailyCounts[date] !== undefined) {
        dailyCounts[date] += 1;
      }
    });

    return Object.entries(dailyCounts).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { day: 'numeric', month: 'short' }),
      joins: count
    }));
  }, [users]);

  // --- Filter & Pagination ---
  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchSearch = 
        u.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u._id?.includes(searchTerm) ||
        u.phone_number?.includes(searchTerm);
      const matchType = filterType === "all" || u.user_type === filterType;
      return matchSearch && matchType;
    });
  }, [users, searchTerm, filterType]);

  const paginatedUsers = useMemo(() => {
    const start = (currentPage - 1) * usersPerPage;
    return filteredUsers.slice(start, start + usersPerPage);
  }, [filteredUsers, currentPage]);

  if (loading) return <div className="loading-state-3244f"><span></span><p>Accessing Secure Database...</p></div>;

  return (
    <div className="dex-dark-root-3244f">
      <header className="dex-header-3244f">
        <div className="header-text-3244f">
          <h1 className="dex-main-title-3244f">User Intelligence</h1>
          <p className="dex-status-3244f">
            <FaCircle className="status-online-3244f" /> System Live: {users.length} Total Registered Nodes
          </p>
        </div>
        <div className="header-actions-3244f">
          <button className={`btn-sync-3244f ${refreshing ? 'spinning-3244f' : ''}`} onClick={fetchAllData}>
            <FaSync />
          </button>
        </div>
      </header>

      {/* Primary KPI Grid */}
      <section className="dex-kpi-grid-3244f">
        <div className="kpi-card-3244f">
          <div className="kpi-icon-wrapper-3244f blue-bg-3244f"><FaUserPlus /></div>
          <div className="kpi-val-group-3244f">
            <span>New Today</span>
            <strong>{stats.joinedToday}</strong>
          </div>
        </div>
        <div className="kpi-card-3244f">
          <div className="kpi-icon-wrapper-3244f green-bg-3244f"><FaStar /></div>
          <div className="kpi-val-group-3244f">
            <span>Premium Tier</span>
            <strong>{stats.premiumUsers}</strong>
          </div>
        </div>
        <div className="kpi-card-3244f">
          <div className="kpi-icon-wrapper-3244f purple-bg-3244f"><FaHistory /></div>
          <div className="kpi-val-group-3244f">
            <span>System Logins</span>
            <strong>{stats.totalLogins}</strong>
          </div>
        </div>
        <div className="kpi-card-3244f">
          <div className="kpi-icon-wrapper-3244f yellow-bg-3244f"><FaUser /></div>
          <div className="kpi-val-group-3244f">
            <span>Average Age</span>
            <strong>{stats.avgAge}</strong>
          </div>
        </div>
      </section>

      {/* Email Promotion Export Section */}
      <section className="email-export-section-3244f">
        <div className="export-card-3244f">
          <div className="export-header-3244f">
            <FaEnvelope className="export-icon-3244f" />
            <h3>Email Promotion Data Export</h3>
            <p>Download user data for email marketing campaigns</p>
          </div>
          <div className="export-controls-3244f">
            <div className="export-filter-group-3244f">
              <label>Export Users:</label>
              <select 
                className="export-select-3244f" 
                value={exportFilter}
                onChange={(e) => setExportFilter(e.target.value)}
              >
                <option value="all">All Users</option>
                <option value="today">Joined Today</option>
                <option value="lastWeek">Joined Last Week</option>
                <option value="lastMonth">Joined Last Month</option>
              </select>
            </div>
            <button 
              className="export-btn-3244f"
              onClick={exportUsersForEmail}
            >
              <FaDownload /> Download JSON
            </button>
          </div>
          <div className="export-info-3244f">
            <p><strong>Data includes:</strong> Name, Email, Age, Gender, Phone, User Type, Interests, Join Date</p>
            <p><strong>File format:</strong> JSON (Compatible with most email marketing tools)</p>
          </div>
        </div>
      </section>

      {/* Growth Visualization */}
      <section className="dex-visuals-grid-3244f">
        <div className="visual-card-3244f full-width-visual-3244f">
          <div className="visual-header-3244f">
            <h3>User Join Growth (Day-Wise)</h3>
            <p>Registration metrics for the last 14 days</p>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={growthTrendData}>
              <defs>
                <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0A84FF" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#0A84FF" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2c2c2e" />
              <XAxis dataKey="date" stroke="#8e8e93" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8e8e93" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip 
                contentStyle={{backgroundColor: '#1c1c1e', border: '1px solid #38383a', borderRadius: '12px'}} 
                itemStyle={{color: '#0A84FF'}}
              />
              <Area 
                type="monotone" 
                dataKey="joins" 
                stroke="#0A84FF" 
                fillOpacity={1} 
                fill="url(#growthGradient)" 
                strokeWidth={3} 
                animationDuration={1500}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* User Management */}
      <section className="dex-table-section-3244f">
        <div className="table-controls-3244f">
          <div className="search-box-3244f">
            <FaSearch />
            <input 
              type="text" 
              placeholder="Search Name, Email, Phone or ID..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
          <select className="filter-select-3244f" onChange={e => setFilterType(e.target.value)}>
            <option value="all">All Tiers</option>
            <option value="free">Free Users</option>
            <option value="subscriber">Subscribers</option>
          </select>
        </div>

        <div className="user-grid-3244f">
          {paginatedUsers.map(user => (
            <div key={user._id} className="user-pro-card-3244f">
              {/* Card Header */}
              <div className="user-pro-top-3244f">
                <div className="avatar-wrapper-3244f">
                  <img src={user.profile_picture || 'https://via.placeholder.com/150'} alt="" />
                  <div className={`status-indicator-3244f ${user.messagesUsedToday > 0 ? 'online' : ''}`}></div>
                </div>
                <div className="header-badges-3244f">
                   <span className={`badge-3244f ${user.user_type === 'subscriber' ? 'subscriber-3244f' : ''}`}>
                    {user.user_type}
                  </span>
                </div>
              </div>

              {/* Main Info */}
              <div className="user-pro-body-3244f">
                <h4>{user.name}</h4>
                <p className="email-label-3244f">{user.email}</p>
                
                <div className="detailed-info-grid-3244f">
                   <div className="detail-item-3244f">
                      <FaIdBadge title="User ID" />
                      <span>{user._id.slice(-8).toUpperCase()}...</span>
                   </div>
                   <div className="detail-item-3244f">
                      <FaPhone title="Phone" />
                      <span>{user.phone_number || 'N/A'}</span>
                   </div>
                   <div className="detail-item-3244f">
                      <FaCalendarAlt title="Age" />
                      <span>{user.age} Years • {user.gender}</span>
                   </div>
                </div>

                {/* Usage Quota */}
                <div className="mini-quota-3244f">
                  <div className="mini-quota-labels-3244f">
                    <span>Daily Quota</span>
                    <span>{user.messagesUsedToday}/{user.messageQuota}</span>
                  </div>
                  <div className="mini-quota-track-3244f">
                    <div className="mini-quota-fill-3244f" style={{width: `${Math.min((user.messagesUsedToday/user.messageQuota)*100, 100)}%`}}></div>
                  </div>
                </div>

                {/* Activity Tags */}
                <div className="user-pro-tags-3244f">
                  <div className="tag-3244f" title="AI Companions"><FaRobot /> {user.ai_friends?.length || 0}</div>
                  <div className="tag-3244f" title="Support Tickets"><FaTicketAlt /> {user.tickets?.length || 0}</div>
                  <div className={`tag-3244f ${user.twofactor ? 'active-tag-3244f' : ''}`} title="2FA Status"><FaShieldAlt /></div>
                </div>
                
                <div className="joined-date-footer-3244f">
                   Joined: {new Date(user.joinedAt).toLocaleDateString()}
                </div>
              </div>

              {/* Actions */}
              <div className="user-pro-actions-3244f">
                <button className="edit-btn-3244f"><FaEdit /></button>
                <button className="del-btn-3244f"><FaTrash /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="pagination-3244f">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
          <span className="page-indicator-3244f">Page {currentPage} of {Math.ceil(filteredUsers.length / usersPerPage)}</span>
          <button disabled={currentPage >= Math.ceil(filteredUsers.length / usersPerPage)} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
};

export default UsersAdmin;