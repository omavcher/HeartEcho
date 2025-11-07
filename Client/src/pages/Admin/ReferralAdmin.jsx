'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import "./ReferralAdmin.css";
import { 
  FaUserPlus, 
  FaLink, 
  FaMoneyBillWave, 
  FaChartLine,
  FaSearch,
  FaFilter,
  FaEdit,
  FaTrash,
  FaPlus,
  FaSync,
  FaCopy,
  FaShare,
  FaUsers,
  FaCoins,
  FaPercentage
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";
import axios from "axios";
import api from "../../config/api";

const ReferralAdmin = () => {
  const [creators, setCreators] = useState([]);
  const [referralStats, setReferralStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editCreator, setEditCreator] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");

  // New creator form state
  const [newCreator, setNewCreator] = useState({
    name: "",
    platform: "instagram",
    username: "",
    commissionRate: 15,
    email: "",
    phone: "",
    notes: ""
  });

  // Memoized colors for charts
  const colors = useMemo(() => [
    "#0071e3", "#7b61ff", "#30d158", "#ff9500", "#ff3b30", 
    "#5856d6", "#af52de", "#ff2d55", "#32d74b", "#ffcc00"
  ], []);

  // Server-safe token access
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
    return "";
  }, []);

  // Data fetching
  const fetchCreators = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/referral-creators`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setCreators(response.data.creators || []);
    } catch (error) {
      console.error("Error fetching creators:", error);
      setCreators([]);
    }
  }, [getToken]);

  const fetchReferralStats = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/referral-stats`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setReferralStats(response.data.stats || []);
    } catch (error) {
      console.error("Error fetching referral stats:", error);
      setReferralStats([]);
    }
  }, [getToken]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([fetchCreators(), fetchReferralStats()]);
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchCreators, fetchReferralStats]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Statistics
  const stats = useMemo(() => {
    const totalCreators = creators.length;
    const activeCreators = creators.filter(creator => creator.isActive !== false).length;
    const totalReferrals = creators.reduce((sum, creator) => sum + (creator.referralCount || 0), 0);
    const totalEarnings = creators.reduce((sum, creator) => sum + (creator.totalEarnings || 0), 0);
    const pendingEarnings = creators.reduce((sum, creator) => sum + (creator.pendingEarnings || 0), 0);

    return {
      totalCreators,
      activeCreators,
      totalReferrals,
      totalEarnings,
      pendingEarnings,
      conversionRate: totalCreators > 0 ? (totalReferrals / totalCreators).toFixed(1) : 0
    };
  }, [creators]);

  // Chart data
  const platformDistributionData = useMemo(() => {
    const platformCounts = creators.reduce((acc, creator) => {
      const platform = creator.platform || 'unknown';
      acc[platform] = (acc[platform] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(platformCounts).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      color: colors[index % colors.length]
    }));
  }, [creators, colors]);

  const topPerformersData = useMemo(() => {
    return creators
      .filter(creator => creator.referralCount > 0)
      .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
      .slice(0, 5)
      .map(creator => ({
        name: creator.name,
        referrals: creator.referralCount || 0,
        earnings: creator.totalEarnings || 0
      }));
  }, [creators]);

  const referralTrendData = useMemo(() => {
    // Mock data for referral trends - replace with actual API data
    return [
      { day: 'Mon', referrals: 12 },
      { day: 'Tue', referrals: 19 },
      { day: 'Wed', referrals: 8 },
      { day: 'Thu', referrals: 15 },
      { day: 'Fri', referrals: 22 },
      { day: 'Sat', referrals: 18 },
      { day: 'Sun', referrals: 14 }
    ];
  }, []);

  // Filter creators
  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      const matchesSearch = 
        creator.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        creator.platform?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || 
        (filterStatus === "active" ? creator.isActive !== false : creator.isActive === false);
      
      return matchesSearch && matchesStatus;
    });
  }, [creators, searchTerm, filterStatus]);

  // Handlers
  const handleCreateCreator = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await axios.post(
        `${api.Url}/admin/referral-creators`,
        newCreator,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setCreators([...creators, response.data.creator]);
      setShowCreateModal(false);
      setNewCreator({
        name: "",
        platform: "instagram",
        username: "",
        commissionRate: 15,
        email: "",
        phone: "",
        notes: ""
      });
    } catch (error) {
      console.error("Error creating creator:", error);
      alert("Failed to create creator.");
    }
  };

  const handleEditCreator = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await axios.put(
        `${api.Url}/admin/referral-creators/${editCreator._id}`,
        editCreator,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setCreators(creators.map(creator => 
        creator._id === editCreator._id ? response.data.creator : creator
      ));
      setEditCreator(null);
    } catch (error) {
      console.error("Error updating creator:", error);
      alert("Failed to update creator.");
    }
  };

  const handleDeleteCreator = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this creator?");
    if (confirmDelete) {
      try {
        const token = getToken();
        await axios.delete(`${api.Url}/admin/referral-creators/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCreators(creators.filter(creator => creator._id !== id));
      } catch (error) {
        console.error("Error deleting creator:", error);
        alert("Failed to delete creator.");
      }
    }
  };

  const handleToggleStatus = async (creator) => {
    try {
      const token = getToken();
      const updateData = {
        ...creator,
        isActive: !creator.isActive
      };

      const response = await axios.put(
        `${api.Url}/admin/referral-creators/${creator._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setCreators(creators.map(c => 
        c._id === creator._id ? response.data.creator : c
      ));
    } catch (error) {
      console.error("Error toggling creator status:", error);
      alert("Failed to update creator status.");
    }
  };

  const copyReferralLink = (creatorId) => {
    const referralLink = `${window.location.origin}/signup?ref=${creatorId}`;
    navigator.clipboard.writeText(referralLink)
      .then(() => alert('Referral link copied to clipboard!'))
      .catch(err => console.error('Failed to copy link:', err));
  };

  const shareReferralLink = (creator) => {
    const referralLink = `${window.location.origin}/signup?ref=${creator._id}`;
    const message = `Join using my referral link! You'll get special benefits and I'll earn a commission. Link: ${referralLink}`;
    
    if (navigator.share) {
      navigator.share({
        title: 'Referral Link',
        text: message,
        url: referralLink,
      });
    } else {
      navigator.clipboard.writeText(message)
        .then(() => alert('Referral message copied to clipboard!'))
        .catch(err => console.error('Failed to copy message:', err));
    }
  };

  const generateReferralReport = () => {
    const reportData = creators.map(creator => ({
      Name: creator.name,
      Platform: creator.platform,
      Username: creator.username,
      'Referral Count': creator.referralCount || 0,
      'Total Earnings': creator.totalEarnings || 0,
      'Pending Earnings': creator.pendingEarnings || 0,
      'Commission Rate': `₹ {creator.commissionRate}%`,
      Status: creator.isActive ? 'Active' : 'Inactive',
      'Join Date': new Date(creator.createdAt).toLocaleDateString()
    }));

    const csv = [
      Object.keys(reportData[0]).join(','),
      ...reportData.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'referral-report.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.name.includes('Earnings') ? `₹ ${entry.value}` : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="ref-loading">
        <div className="loading-spinner"></div>
        <p>Loading referral data...</p>
      </div>
    );
  }

  return (
    <div className="ref-container">
      {/* Header Section */}
      <div className="ref-header">
        <div className="ref-header-content">
          <h2 className="ref-title">Referral Management</h2>
          <p className="ref-subtitle">Track and manage creator referral programs</p>
        </div>
        <div className="ref-header-actions">
          <button 
            className={`ref-action-button ref-refresh ${refreshing ? 'refreshing' : ''}`}
            onClick={fetchAllData}
            disabled={refreshing}
          >
            <FaSync /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="ref-action-button ref-report" onClick={generateReferralReport}>
            <FaChartLine /> Export Report
          </button>
          <button
            className="ref-action-button ref-add"
            onClick={() => setShowCreateModal(true)}
          >
            <FaPlus /> Add Creator
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="ref-stats-overview">
        <div className="ref-stat-card">
          <div className="stat-icon-wrapper total">
            <FaUsers className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Creators</h3>
            <p className="stat-value">{stats.totalCreators}</p>
            <span className="stat-change">{stats.activeCreators} active</span>
          </div>
        </div>
        <div className="ref-stat-card">
          <div className="stat-icon-wrapper referrals">
            <FaUserPlus className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Referrals</h3>
            <p className="stat-value">{stats.totalReferrals}</p>
            <span className="stat-change">{stats.conversionRate} per creator</span>
          </div>
        </div>
        <div className="ref-stat-card">
          <div className="stat-icon-wrapper earnings">
            <FaMoneyBillWave className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Earnings</h3>
            <p className="stat-value">₹ {stats.totalEarnings}</p>
            <span className="stat-change">₹ {stats.pendingEarnings} pending</span>
          </div>
        </div>
        <div className="ref-stat-card">
          <div className="stat-icon-wrapper rate">
            <FaPercentage className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Avg Commission</h3>
            <p className="stat-value">15%</p>
            <span className="stat-change">Industry standard</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="ref-charts-section">
        <div className="ref-chart-card">
          <div className="chart-header">
            <FaChartLine className="chart-icon" />
            <h3>Platform Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={platformDistributionData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {platformDistributionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="ref-chart-card">
          <div className="chart-header">
            <FaChartLine className="chart-icon" />
            <h3>Top Performers</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={topPerformersData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis 
                dataKey="name" 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="referrals" 
                fill="#0071e3" 
                name="Referrals"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="ref-chart-card">
          <div className="chart-header">
            <FaChartLine className="chart-icon" />
            <h3>Referral Trends</h3>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={referralTrendData}>
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
                dataKey="referrals"
                stroke="#30d158"
                strokeWidth={3}
                dot={{ r: 6, fill: "#30d158" }}
                activeDot={{ r: 8, fill: "#30d158" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters Section */}
      <div className="ref-filters-section">
        <div className="ref-search-container">
          <FaSearch className="ref-search-icon" />
          <input
            type="text"
            placeholder="Search creators by name, platform, or username..."
            className="ref-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ref-filter-group">
          <select
            className="ref-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Creators Section */}
      <div className="ref-content-section">
        <div className="ref-section-header">
          <h3>Referral Creators ({filteredCreators.length})</h3>
          <span className="ref-results-count">
            Showing all creators with referral tracking
          </span>
        </div>

        {filteredCreators.length === 0 ? (
          <div className="ref-empty-state">
            <FaUsers className="empty-icon" />
            <h3>No Creators Found</h3>
            <p>Try adding your first creator or adjust your search filters</p>
            <button 
              className="ref-action-button ref-add"
              onClick={() => setShowCreateModal(true)}
            >
              <FaPlus /> Add First Creator
            </button>
          </div>
        ) : (
          <div className="ref-creators-grid">
            {filteredCreators.map((creator) => (
              <div key={creator._id} className="ref-creator-card">
                <div className="ref-creator-header">
                  <div className="ref-creator-avatar">
                    {creator.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="ref-creator-info">
                    <h4 className="ref-creator-name">{creator.name}</h4>
                    <p className="ref-creator-platform">
                      {creator.platform} • @{creator.username}
                    </p>
                  </div>
                  <div className="ref-creator-badge">
                    {creator.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="ref-creator-stats">
                  <div className="ref-stat-item">
                    <span className="stat-label">Referrals</span>
                    <span className="stat-value">{creator.referralCount || 0}</span>
                  </div>
                  <div className="ref-stat-item">
                    <span className="stat-label">Earnings</span>
                    <span className="stat-value">${creator.totalEarnings || 0}</span>
                  </div>
                  <div className="ref-stat-item">
                    <span className="stat-label">Commission</span>
                    <span className="stat-value">{creator.commissionRate}%</span>
                  </div>
                </div>

                <div className="ref-referral-link">
                  <div className="link-container">
                    <FaLink className="link-icon" />
                    <span className="link-text">
                      {`${window.location.origin}/signup?ref=${creator._id}`}
                    </span>
                  </div>
                  <div className="link-actions">
                    <button
                      className="ref-action-button ref-copy"
                      onClick={() => copyReferralLink(creator._id)}
                    >
                      <FaCopy /> Copy
                    </button>
                    <button
                      className="ref-action-button ref-share"
                      onClick={() => shareReferralLink(creator)}
                    >
                      <FaShare /> Share
                    </button>
                  </div>
                </div>

                <div className="ref-creator-actions">
                  <button
                    className="ref-action-button ref-toggle"
                    onClick={() => handleToggleStatus(creator)}
                  >
                    {creator.isActive ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="ref-action-button ref-edit"
                    onClick={() => setEditCreator(creator)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="ref-action-button ref-delete"
                    onClick={() => handleDeleteCreator(creator._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Creator Modal */}
      {showCreateModal && (
        <div className="ref-modal">
          <div className="ref-modal-content">
            <div className="ref-modal-header">
              <h3>Add New Creator</h3>
              <button 
                className="ref-modal-close"
                onClick={() => setShowCreateModal(false)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleCreateCreator} className="ref-modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Creator Name *</label>
                  <input
                    type="text"
                    value={newCreator.name}
                    onChange={(e) => setNewCreator({ ...newCreator, name: e.target.value })}
                    required
                    placeholder="Enter creator's full name"
                  />
                </div>

                <div className="form-group">
                  <label>Platform *</label>
                  <select
                    value={newCreator.platform}
                    onChange={(e) => setNewCreator({ ...newCreator, platform: e.target.value })}
                    required
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={newCreator.username}
                    onChange={(e) => setNewCreator({ ...newCreator, username: e.target.value })}
                    required
                    placeholder="Platform username"
                  />
                </div>

                <div className="form-group">
                  <label>Commission Rate (%) *</label>
                  <input
                    type="number"
                    value={newCreator.commissionRate}
                    onChange={(e) => setNewCreator({ ...newCreator, commissionRate: parseInt(e.target.value) })}
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={newCreator.email}
                    onChange={(e) => setNewCreator({ ...newCreator, email: e.target.value })}
                    placeholder="creator@example.com"
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={newCreator.phone}
                    onChange={(e) => setNewCreator({ ...newCreator, phone: e.target.value })}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={newCreator.notes}
                    onChange={(e) => setNewCreator({ ...newCreator, notes: e.target.value })}
                    placeholder="Additional notes about this creator..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="ref-modal-actions">
                <button type="submit" className="ref-action-button ref-save">
                  Create Creator
                </button>
                <button
                  type="button"
                  className="ref-action-button ref-cancel"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Creator Modal */}
      {editCreator && (
        <div className="ref-modal">
          <div className="ref-modal-content">
            <div className="ref-modal-header">
              <h3>Edit Creator</h3>
              <button 
                className="ref-modal-close"
                onClick={() => setEditCreator(null)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditCreator} className="ref-modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Creator Name *</label>
                  <input
                    type="text"
                    value={editCreator.name}
                    onChange={(e) => setEditCreator({ ...editCreator, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Platform *</label>
                  <select
                    value={editCreator.platform}
                    onChange={(e) => setEditCreator({ ...editCreator, platform: e.target.value })}
                    required
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="facebook">Facebook</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Username *</label>
                  <input
                    type="text"
                    value={editCreator.username}
                    onChange={(e) => setEditCreator({ ...editCreator, username: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Commission Rate (%) *</label>
                  <input
                    type="number"
                    value={editCreator.commissionRate}
                    onChange={(e) => setEditCreator({ ...editCreator, commissionRate: parseInt(e.target.value) })}
                    min="1"
                    max="50"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={editCreator.email}
                    onChange={(e) => setEditCreator({ ...editCreator, email: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label>Phone</label>
                  <input
                    type="tel"
                    value={editCreator.phone}
                    onChange={(e) => setEditCreator({ ...editCreator, phone: e.target.value })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Notes</label>
                  <textarea
                    value={editCreator.notes}
                    onChange={(e) => setEditCreator({ ...editCreator, notes: e.target.value })}
                    rows="3"
                  />
                </div>
              </div>

              <div className="ref-modal-actions">
                <button type="submit" className="ref-action-button ref-save">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="ref-action-button ref-cancel"
                  onClick={() => setEditCreator(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralAdmin;