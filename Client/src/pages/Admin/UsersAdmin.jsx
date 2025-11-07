'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import "./UsersAdmin.css";
import {
  FaUser,
  FaTrash,
  FaEdit,
  FaStar,
  FaSearch,
  FaFilter,
  FaChartBar,
  FaChartPie,
  FaChartLine,
  FaCog,
  FaDownload,
  FaSync,
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import axios from "axios";
import api from "../../config/api";

const UsersAdmin = () => {
  const [users, setUsers] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [filterGender, setFilterGender] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const usersPerPage = 8;

  // Memoized colors for charts
  const colors = useMemo(() => [
    "#0071e3", "#7b61ff", "#30d158", "#ff9500", "#ff3b30", "#5856d6",
    "#af52de", "#ff2d55", "#32d74b", "#ffcc00"
  ], []);

  // Server-safe token access
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
    return "";
  }, []);

  // Data fetching functions
  const fetchUsers = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/user-dataw`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setUsers(response.data.userData || []);
    } catch (error) {
      console.error("Error fetching users:", error);
      setUsers([]);
    }
  }, [getToken]);

  const fetchUserStats = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/users-administr`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setUserStats(response.data.data || null);
    } catch (error) {
      console.error("Error fetching user stats:", error);
      setUserStats(null);
    }
  }, [getToken]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchUsers(), fetchUserStats()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchUsers, fetchUserStats]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Filter and search logic
  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === "all" || user.user_type === filterType;
      const matchesGender = filterGender === "all" || user.gender === filterGender;
      
      return matchesSearch && matchesType && matchesGender;
    });
  }, [users, searchTerm, filterType, filterGender]);

  // Pagination logic
  const paginatedUsers = useMemo(() => {
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    return filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  }, [filteredUsers, currentPage, usersPerPage]);

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  // Chart data preparation
  const userTypeData = useMemo(() => {
    if (!userStats?.userStats) return [];
    return [
      { name: "Subscribers", value: userStats.userStats.totalSubscribers || 0 },
      { name: "Free Members", value: userStats.userStats.totalFreeMembers || 0 },
    ];
  }, [userStats]);

  const messageQuotaData = useMemo(() => {
    return users
      .filter((user) => user.user_type === "free")
      .slice(0, 10)
      .map((user) => ({
        name: user.name?.split(' ')[0] || 'User',
        value: user.messageQuota || 0,
        fullName: user.name || 'Unknown User'
      }));
  }, [users]);

  const loginActivityData = useMemo(() => {
    if (!userStats?.loginStats) return [];
    return userStats.loginStats.map((stat) => ({
      day: stat.date ? new Date(stat.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : 'Unknown',
      logins: stat.loginCount || 0,
    }));
  }, [userStats]);

  const genderDistributionData = useMemo(() => {
    const genderCount = users.reduce((acc, user) => {
      const gender = user.gender || 'unknown';
      acc[gender] = (acc[gender] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(genderCount).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value
    }));
  }, [users]);

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Event handlers
  const handleRefresh = () => {
    fetchAllData();
  };

  const handleExportData = () => {
    // Implement export functionality
    console.log("Exporting user data...");
  };

  const handleUserAction = (userId, action) => {
    // Implement user actions (edit, delete, upgrade)
    console.log(`Performing ${action} on user ${userId}`);
  };

  // Loading state
  if (loading) {
    return (
      <div className="dex-loading">
        <div className="loading-spinner"></div>
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="dex-container">
      {/* Header Section */}
      <div className="dex-header">
        <div className="dex-header-content">
          <h2 className="dex-title">User Management</h2>
          <p className="dex-subtitle">Manage and analyze user accounts</p>
        </div>
        <div className="dex-header-actions">
          <button 
            className={`dex-refresh-button ${refreshing ? 'refreshing' : ''}`}
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <FaSync /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="dex-export-button" onClick={handleExportData}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="dex-stats-overview">
        <div className="dex-stat-card">
          <div className="stat-icon-wrapper total">
            <FaUser className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Users</h3>
            <p className="stat-value">{users.length}</p>
          </div>
        </div>
        <div className="dex-stat-card">
          <div className="stat-icon-wrapper subscribers">
            <FaStar className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Subscribers</h3>
            <p className="stat-value">{userStats?.userStats?.totalSubscribers || 0}</p>
          </div>
        </div>
        <div className="dex-stat-card">
          <div className="stat-icon-wrapper free">
            <FaUser className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Free Users</h3>
            <p className="stat-value">{userStats?.userStats?.totalFreeMembers || 0}</p>
          </div>
        </div>
        <div className="dex-stat-card">
          <div className="stat-icon-wrapper active">
            <FaChartLine className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Active Today</h3>
            <p className="stat-value">
              {userStats?.loginStats?.[0]?.loginCount || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="dex-filters-section">
        <div className="dex-search-container">
          <FaSearch className="dex-search-icon" />
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="dex-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="dex-filter-group">
          <select
            className="dex-filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="free">Free Users</option>
            <option value="subscriber">Subscribers</option>
          </select>
          <select
            className="dex-filter-select"
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="dex-charts-grid">
        <div className="dex-chart-card">
          <div className="chart-header">
            <FaChartPie className="chart-icon" />
            <h3>User Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={userTypeData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                innerRadius={60}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name}\n${(percent * 100).toFixed(0)}%`}
                labelLine={false}
              >
                {userTypeData.map((_, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]} 
                    stroke="var(--card-bg)"
                    strokeWidth={2}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="dex-chart-card">
          <div className="chart-header">
            <FaChartBar className="chart-icon" />
            <h3>Message Quota Usage</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={messageQuotaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value, name, props) => [
                  `${value} messages`,
                  props.payload.fullName ? `User: ${props.payload.fullName}` : ''
                ]}
              />
              <Bar 
                dataKey="value" 
                fill="#0071e3" 
                name="Messages"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="dex-chart-card">
          <div className="chart-header">
            <FaChartLine className="chart-icon" />
            <h3>Login Activity</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={loginActivityData}>
              <defs>
                <linearGradient id="loginGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#30d158" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#30d158" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis 
                dataKey="day" 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="logins"
                stroke="#30d158"
                strokeWidth={3}
                dot={{ r: 6, fill: "#30d158" }}
                activeDot={{ r: 8, fill: "#30d158" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="dex-chart-card">
          <div className="chart-header">
            <FaUser className="chart-icon" />
            <h3>Gender Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={genderDistributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="value" 
                fill="#7b61ff" 
                name="Users"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Users Grid */}
      <div className="dex-users-section">
        <div className="dex-section-header">
          <h3>User Accounts ({filteredUsers.length})</h3>
          <span className="dex-results-count">
            Showing {paginatedUsers.length} of {filteredUsers.length} users
          </span>
        </div>

        <div className="dex-users-grid">
          {paginatedUsers.map((user) => (
            <div key={user._id} className="dex-user-card">
              <div className="dex-user-header">
                <img
                  src={user.profile_picture || '/default-avatar.png'}
                  alt={user.name}
                  className="dex-user-avatar"
                  onError={(e) => {
                    e.target.src = '/default-avatar.png';
                  }}
                />
                <div className="dex-user-badge">
                  {user.user_type === 'subscriber' ? 'Pro' : 'Free'}
                </div>
              </div>
              
              <div className="dex-user-content">
                <h4 className="dex-user-name">{user.name || 'Unknown User'}</h4>
                <p className="dex-user-email">{user.email || 'No email'}</p>
                
                <div className="dex-user-details">
                  <div className="dex-user-detail">
                    <span className="detail-label">Gender:</span>
                    <span className="detail-value">{user.gender || 'Not specified'}</span>
                  </div>
                  <div className="dex-user-detail">
                    <span className="detail-label">Age:</span>
                    <span className="detail-value">{user.age || 'N/A'}</span>
                  </div>
                  <div className="dex-user-detail">
                    <span className="detail-label">Joined:</span>
                    <span className="detail-value">
                      {user.joinedAt ? new Date(user.joinedAt).toLocaleDateString() : 'Unknown'}
                    </span>
                  </div>
                  <div className="dex-user-detail">
                    <span className="detail-label">2FA:</span>
                    <span className={`detail-value ${user.twofactor ? 'enabled' : 'disabled'}`}>
                      {user.twofactor ? 'Enabled' : 'Disabled'}
                    </span>
                  </div>
                </div>

                {user.selectedInterests?.length > 0 && (
                  <div className="dex-user-interests">
                    <span className="interests-label">Interests:</span>
                    <div className="interests-tags">
                      {user.selectedInterests.slice(0, 3).map((interest, index) => (
                        <span key={index} className="interest-tag">
                          {interest}
                        </span>
                      ))}
                      {user.selectedInterests.length > 3 && (
                        <span className="interest-tag more">
                          +{user.selectedInterests.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="dex-user-actions">
                <button 
                  className="dex-action-button edit"
                  onClick={() => handleUserAction(user._id, 'edit')}
                >
                  <FaEdit />
                </button>
                <button 
                  className="dex-action-button upgrade"
                  onClick={() => handleUserAction(user._id, 'upgrade')}
                >
                  <FaStar />
                </button>
                <button 
                  className="dex-action-button delete"
                  onClick={() => handleUserAction(user._id, 'delete')}
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="dex-pagination">
            <button
              className="dex-pagination-button"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </button>
            
            <div className="dex-pagination-pages">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    className={`dex-pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                    onClick={() => setCurrentPage(pageNum)}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              className="dex-pagination-button"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersAdmin;