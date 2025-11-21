'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import "./AIFriendsAdmin.css";
import { 
  FaRobot, 
  FaTrash, 
  FaEdit, 
  FaSearch, 
  FaPlus, 
  FaSync,
  FaDownload,
  FaChartPie,
  FaFilter,
  FaPlay,
  FaTimes,
  FaImage,
  FaVideo
} from "react-icons/fa";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend
} from "recharts";
import api from '../../config/api';
import axios from "axios";

const AIFriendsAdmin = () => {
  const [aiFriends, setAIFriends] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [editFriend, setEditFriend] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [previewMedia, setPreviewMedia] = useState({ type: null, url: null });

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
  const fetchAIFriends = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/aiuser-data`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setAIFriends(response.data.aiusers || []);
    } catch (error) {
      console.error("Error fetching AI friends:", error);
      setAIFriends([]);
    }
  }, [getToken]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchAIFriends();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchAIFriends]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = aiFriends.length;
    const maleCount = aiFriends.filter(friend => friend.gender === "male").length;
    const femaleCount = aiFriends.filter(friend => friend.gender === "female").length;
    const activeCount = aiFriends.filter(friend => friend.isActive !== false).length;

    return {
      totalCount,
      maleCount,
      femaleCount,
      activeCount,
      inactiveCount: totalCount - activeCount
    };
  }, [aiFriends]);

  // Chart data
  const genderChartData = useMemo(() => [
    { name: "Male", value: stats.maleCount, color: colors[0] },
    { name: "Female", value: stats.femaleCount, color: colors[1] }
  ], [stats.maleCount, stats.femaleCount, colors]);

  const statusChartData = useMemo(() => [
    { name: "Active", value: stats.activeCount, color: colors[2] },
    { name: "Inactive", value: stats.inactiveCount, color: colors[4] }
  ], [stats.activeCount, stats.inactiveCount, colors]);

  // Filter AI friends
  const filteredAIFriends = useMemo(() => {
    return aiFriends.filter((friend) => {
      const matchesGender = selectedGender === "all" || friend.gender === selectedGender;
      const matchesStatus = selectedStatus === "all" || 
        (selectedStatus === "active" ? friend.isActive !== false : friend.isActive === false);
      const matchesSearch = friend.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           friend.description?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesGender && matchesStatus && matchesSearch;
    });
  }, [aiFriends, selectedGender, selectedStatus, searchTerm]);

  // Media Preview Handlers
  const handleImagePreview = (url) => {
    setPreviewMedia({ type: 'image', url });
  };

  const handleVideoPreview = (url) => {
    setPreviewMedia({ type: 'video', url });
  };

  const closePreview = () => {
    setPreviewMedia({ type: null, url: null });
  };

  // Media Array Handlers
  const addImageGalleryItem = () => {
    setEditFriend(prev => ({
      ...prev,
      img_gallery: [...(prev.img_gallery || []), ""]
    }));
  };

  const updateImageGalleryItem = (index, value) => {
    setEditFriend(prev => ({
      ...prev,
      img_gallery: prev.img_gallery.map((item, i) => i === index ? value : item)
    }));
  };

  const removeImageGalleryItem = (index) => {
    setEditFriend(prev => ({
      ...prev,
      img_gallery: prev.img_gallery.filter((_, i) => i !== index)
    }));
  };

  const addVideoGalleryItem = () => {
    setEditFriend(prev => ({
      ...prev,
      video_gallery: [...(prev.video_gallery || []), ""]
    }));
  };

  const updateVideoGalleryItem = (index, value) => {
    setEditFriend(prev => ({
      ...prev,
      video_gallery: prev.video_gallery.map((item, i) => i === index ? value : item)
    }));
  };

  const removeVideoGalleryItem = (index) => {
    setEditFriend(prev => ({
      ...prev,
      video_gallery: prev.video_gallery.filter((_, i) => i !== index)
    }));
  };

  // Handlers
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this AI Friend?");
    if (confirmDelete) {
      try {
        const token = getToken();
        await axios.delete(`${api.Url}/admin/aiuser-data/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAIFriends(aiFriends.filter((friend) => friend._id !== id));
      } catch (error) {
        console.error("Error deleting AI Friend:", error);
        alert("Failed to delete AI Friend.");
      }
    }
  };

  const handleEdit = (friend) => {
    setEditFriend({ 
      ...friend,
      interests: friend.interests?.join(", ") || "",
      img_gallery: friend.img_gallery || [],
      video_gallery: friend.video_gallery || []
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const submissionData = {
        ...editFriend,
        interests: editFriend.interests.split(",").map(item => item.trim()).filter(item => item),
        img_gallery: editFriend.img_gallery.filter(item => item.trim() !== ""),
        video_gallery: editFriend.video_gallery.filter(item => item.trim() !== "")
      };

      const response = await axios.put(
        `${api.Url}/admin/aiuser-data/${editFriend._id}`,
        submissionData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      
      setAIFriends(aiFriends.map((f) =>
        f._id === editFriend._id ? response.data : f
      ));
      setEditFriend(null);
    } catch (error) {
      console.error("Error updating AI Friend:", error);
      alert("Failed to update AI Friend.");
    }
  };

  const handleAddMultiple = async () => {
    if (!jsonInput.trim()) {
      alert("Please enter JSON data");
      return;
    }

    try {
      const token = getToken();
      const parsedData = JSON.parse(jsonInput);
      const response = await axios.post(
        `${api.Url}/admin/put-alldata/multipel`,
        parsedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setAIFriends([...aiFriends, ...response.data.data]);
      setJsonInput("");
      setShowAddSection(false);
    } catch (error) {
      console.error("Error adding multiple AI Friends:", error);
      alert("Failed to add AI Friends. Please check your JSON format.");
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(aiFriends, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-friends-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{payload[0].name}</p>
          <p style={{ color: payload[0].color }}>
            Count: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="fif-loading">
        <div className="loading-spinner"></div>
        <p>Loading AI Friends...</p>
      </div>
    );
  }

  return (
    <div className="fif-container">
      {/* Media Preview Modal */}
      {previewMedia.type && (
        <div className="fif-media-preview">
          <div className="fif-media-preview-content">
            <button className="fif-media-close" onClick={closePreview}>
              <FaTimes />
            </button>
            {previewMedia.type === 'image' && (
              <img src={previewMedia.url} alt="Preview" className="fif-preview-image" />
            )}
            {previewMedia.type === 'video' && (
              <video src={previewMedia.url} controls autoPlay className="fif-preview-video" />
            )}
          </div>
        </div>
      )}

      {/* Header Section */}
      <div className="fif-header">
        <div className="fif-header-content">
          <h2 className="fif-title">AI Friends Management</h2>
          <p className="fif-subtitle">Manage and analyze AI companion profiles</p>
        </div>
        <div className="fif-header-actions">
          <button 
            className={`fif-action-button fif-refresh ${refreshing ? 'refreshing' : ''}`}
            onClick={fetchAllData}
            disabled={refreshing}
          >
            <FaSync /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="fif-action-button fif-export" onClick={handleExportData}>
            <FaDownload /> Export
          </button>
          <button
            className="fif-action-button fif-add"
            onClick={() => setShowAddSection(!showAddSection)}
          >
            <FaPlus /> Add Multiple
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="fif-stats-overview">
        <div className="fif-stat-card">
          <div className="stat-icon-wrapper total">
            <FaRobot className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total AI Friends</h3>
            <p className="stat-value">{stats.totalCount}</p>
          </div>
        </div>
        <div className="fif-stat-card">
          <div className="stat-icon-wrapper male">
            <FaRobot className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Male</h3>
            <p className="stat-value">{stats.maleCount}</p>
          </div>
        </div>
        <div className="fif-stat-card">
          <div className="stat-icon-wrapper female">
            <FaRobot className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Female</h3>
            <p className="stat-value">{stats.femaleCount}</p>
          </div>
        </div>
        <div className="fif-stat-card">
          <div className="stat-icon-wrapper active">
            <FaChartPie className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Active</h3>
            <p className="stat-value">{stats.activeCount}</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="fif-charts-section">
        <div className="fif-chart-card">
          <div className="chart-header">
            <FaChartPie className="chart-icon" />
            <h3>Gender Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={genderChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {genderChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="fif-chart-card">
          <div className="chart-header">
            <FaChartPie className="chart-icon" />
            <h3>Status Distribution</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters Section */}
      <div className="fif-filters-section">
        <div className="fif-search-container">
          <FaSearch className="fif-search-icon" />
          <input
            type="text"
            placeholder="Search AI friends by name or description..."
            className="fif-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="fif-filter-group">
          <select
            className="fif-filter-select"
            value={selectedGender}
            onChange={(e) => setSelectedGender(e.target.value)}
          >
            <option value="all">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
          <select
            className="fif-filter-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Add Multiple Section */}
      {showAddSection && (
        <div className="fif-add-section">
          <div className="add-section-header">
            <h3>Add Multiple AI Friends</h3>
            <p>Paste JSON array containing AI friend data</p>
          </div>
          <textarea
            className="fif-json-input"
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`[
  {
    "gender": "female",
    "name": "Aaradhya",
    "relationship": "Friend",
    "age": 25,
    "interests": ["Reading", "Music"],
    "description": "Friendly and caring AI companion",
    "initial_message": "Hello! How can I help you today?",
    "avatar_img": "https://example.com/avatar.jpg",
    "avatar_motion_video": "https://example.com/motion-video.mp4",
    "img_gallery": [
      "https://example.com/gallery1.jpg",
      "https://example.com/gallery2.jpg"
    ],
    "video_gallery": [
      "https://example.com/video1.mp4",
      "https://example.com/video2.mp4"
    ],
    "settings": {
      "persona": "Friendly Companion",
      "setting": "Casual Conversation"
    }
  }
]`}
            rows="12"
          />
          <div className="add-section-actions">
            <button
              className="fif-action-button fif-save"
              onClick={handleAddMultiple}
            >
              Save AI Friends
            </button>
            <button
              className="fif-action-button fif-cancel"
              onClick={() => setShowAddSection(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* AI Friends Grid */}
      <div className="fif-content-section">
        <div className="fif-section-header">
          <h3>AI Friends ({filteredAIFriends.length})</h3>
          <span className="fif-results-count">
            Showing {filteredAIFriends.length} of {stats.totalCount} AI friends
          </span>
        </div>

        <div className="fif-friends-grid">
          {filteredAIFriends.length > 0 ? (
            filteredAIFriends.map((friend) => (
              <div key={friend._id} className="fif-friend-card">
                <div className="fif-friend-header">
                  <img 
                    src={friend.avatar_img} 
                    alt={friend.name} 
                    className="fif-friend-avatar" 
                    onError={(e) => {
                      e.target.src = '/default-avatar.png';
                    }}
                  />
                  <div className="fif-friend-badge">
                    {friend.gender === 'male' ? 'Male' : 'Female'}
                  </div>
                </div>
                
                <div className="fif-friend-content">
                  <h4 className="fif-friend-name">{friend.name}</h4>
                  <p className="fif-friend-relationship">{friend.relationship}</p>
                  
                  <div className="fif-friend-details">
                    <div className="fif-friend-detail">
                      <span className="detail-label">Age:</span>
                      <span className="detail-value">{friend.age}</span>
                    </div>
                    <div className="fif-friend-detail">
                      <span className="detail-label">Status:</span>
                      <span className={`detail-value ${friend.isActive === false ? 'inactive' : 'active'}`}>
                        {friend.isActive === false ? 'Inactive' : 'Active'}
                      </span>
                    </div>
                  </div>

                  {friend.interests?.length > 0 && (
                    <div className="fif-friend-interests">
                      <span className="interests-label">Interests:</span>
                      <div className="interests-tags">
                        {friend.interests.slice(0, 3).map((interest, index) => (
                          <span key={index} className="interest-tag">
                            {interest}
                          </span>
                        ))}
                        {friend.interests.length > 3 && (
                          <span className="interest-tag more">
                            +{friend.interests.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Motion Video Preview */}
                  {friend.avatar_motion_video && (
                    <div className="fif-media-section">
                      <span className="media-label">Motion Video:</span>
                      <div className="fif-media-preview-item">
                        <video 
                          className="fif-media-thumbnail"
                          onClick={() => handleVideoPreview(friend.avatar_motion_video)}
                        >
                          <source src={friend.avatar_motion_video} type="video/mp4" />
                        </video>
                        <button 
                          className="fif-media-play-btn"
                          onClick={() => handleVideoPreview(friend.avatar_motion_video)}
                        >
                          <FaPlay />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Image Gallery Preview */}
                  {friend.img_gallery?.length > 0 && (
                    <div className="fif-media-section">
                      <span className="media-label">Image Gallery ({friend.img_gallery.length}):</span>
                      <div className="fif-media-grid">
                        {friend.img_gallery.slice(0, 3).map((img, index) => (
                          <div key={index} className="fif-media-preview-item">
                            <img 
                              src={img} 
                              alt={`Gallery ${index + 1}`}
                              className="fif-media-thumbnail"
                              onClick={() => handleImagePreview(img)}
                            />
                            {index === 2 && friend.img_gallery.length > 3 && (
                              <div className="fif-media-more">
                                +{friend.img_gallery.length - 3}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Video Gallery Preview */}
                  {friend.video_gallery?.length > 0 && (
                    <div className="fif-media-section">
                      <span className="media-label">Video Gallery ({friend.video_gallery.length}):</span>
                      <div className="fif-media-grid">
                        {friend.video_gallery.slice(0, 2).map((video, index) => (
                          <div key={index} className="fif-media-preview-item">
                            <video 
                              className="fif-media-thumbnail"
                              onClick={() => handleVideoPreview(video)}
                            >
                              <source src={video} type="video/mp4" />
                            </video>
                            <button 
                              className="fif-media-play-btn"
                              onClick={() => handleVideoPreview(video)}
                            >
                              <FaPlay />
                            </button>
                            {index === 1 && friend.video_gallery.length > 2 && (
                              <div className="fif-media-more">
                                +{friend.video_gallery.length - 2}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <p className="fif-friend-description">
                    {friend.description}
                  </p>

                  <div className="fif-friend-meta">
                    <p className="fif-friend-initial">
                      <strong>First message:</strong> {friend.initial_message}
                    </p>
                    {friend.settings?.persona && (
                      <p className="fif-friend-persona">
                        <strong>Persona:</strong> {friend.settings.persona}
                      </p>
                    )}
                  </div>
                </div>

                <div className="fif-friend-actions">
                  <button
                    className="fif-action-button fif-edit"
                    onClick={() => handleEdit(friend)}
                  >
                    <FaEdit /> Edit
                  </button>
                  <button
                    className="fif-action-button fif-delete"
                    onClick={() => handleDelete(friend._id)}
                  >
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="fif-empty-state">
              <FaRobot className="empty-icon" />
              <h3>No AI Friends Found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {editFriend && (
        <div className="fif-modal">
          <div className="fif-modal-content">
            <div className="fif-modal-header">
              <h3>Edit AI Friend</h3>
              <button 
                className="fif-modal-close"
                onClick={() => setEditFriend(null)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="fif-modal-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Name</label>
                  <input
                    type="text"
                    value={editFriend.name}
                    onChange={(e) => setEditFriend({ ...editFriend, name: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <select
                    value={editFriend.gender}
                    onChange={(e) => setEditFriend({ ...editFriend, gender: e.target.value })}
                    required
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Relationship</label>
                  <input
                    type="text"
                    value={editFriend.relationship}
                    onChange={(e) => setEditFriend({ ...editFriend, relationship: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Age</label>
                  <input
                    type="number"
                    value={editFriend.age}
                    onChange={(e) => setEditFriend({ ...editFriend, age: e.target.value })}
                    min="18"
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Interests (comma-separated)</label>
                  <input
                    type="text"
                    value={editFriend.interests}
                    onChange={(e) => setEditFriend({ ...editFriend, interests: e.target.value })}
                    placeholder="Reading, Music, Sports"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea
                    value={editFriend.description}
                    onChange={(e) => setEditFriend({ ...editFriend, description: e.target.value })}
                    required
                    rows="3"
                  />
                </div>

                <div className="form-group full-width">
                  <label>Initial Message</label>
                  <input
                    type="text"
                    value={editFriend.initial_message}
                    onChange={(e) => setEditFriend({ ...editFriend, initial_message: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Persona</label>
                  <input
                    type="text"
                    value={editFriend.settings?.persona || ""}
                    onChange={(e) => setEditFriend({ 
                      ...editFriend, 
                      settings: { 
                        ...editFriend.settings, 
                        persona: e.target.value 
                      } 
                    })}
                  />
                </div>

                <div className="form-group">
                  <label>Setting</label>
                  <input
                    type="text"
                    value={editFriend.settings?.setting || ""}
                    onChange={(e) => setEditFriend({ 
                      ...editFriend, 
                      settings: { 
                        ...editFriend.settings, 
                        setting: e.target.value 
                      } 
                    })}
                  />
                </div>

                <div className="form-group full-width">
                  <label>Avatar URL</label>
                  <input
                    type="text"
                    value={editFriend.avatar_img}
                    onChange={(e) => setEditFriend({ ...editFriend, avatar_img: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group full-width">
                  <label>Motion Video URL</label>
                  <input
                    type="text"
                    value={editFriend.avatar_motion_video || ""}
                    onChange={(e) => setEditFriend({ ...editFriend, avatar_motion_video: e.target.value })}
                    placeholder="https://example.com/motion-video.mp4"
                  />
                </div>

                {/* Image Gallery Section */}
                <div className="form-group full-width">
                  <div className="fif-array-section">
                    <label>Image Gallery URLs</label>
                    <div className="fif-array-items">
                      {editFriend.img_gallery?.map((url, index) => (
                        <div key={index} className="fif-array-item">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => updateImageGalleryItem(index, e.target.value)}
                            placeholder="https://example.com/image.jpg"
                            className="fif-array-input"
                          />
                          <button
                            type="button"
                            className="fif-array-remove"
                            onClick={() => removeImageGalleryItem(index)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="fif-array-add"
                      onClick={addImageGalleryItem}
                    >
                      <FaPlus /> Add Image URL
                    </button>
                  </div>
                </div>

                {/* Video Gallery Section */}
                <div className="form-group full-width">
                  <div className="fif-array-section">
                    <label>Video Gallery URLs</label>
                    <div className="fif-array-items">
                      {editFriend.video_gallery?.map((url, index) => (
                        <div key={index} className="fif-array-item">
                          <input
                            type="text"
                            value={url}
                            onChange={(e) => updateVideoGalleryItem(index, e.target.value)}
                            placeholder="https://example.com/video.mp4"
                            className="fif-array-input"
                          />
                          <button
                            type="button"
                            className="fif-array-remove"
                            onClick={() => removeVideoGalleryItem(index)}
                          >
                            <FaTimes />
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      type="button"
                      className="fif-array-add"
                      onClick={addVideoGalleryItem}
                    >
                      <FaPlus /> Add Video URL
                    </button>
                  </div>
                </div>
              </div>

              <div className="fif-modal-actions">
                <button type="submit" className="fif-action-button fif-save">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="fif-action-button fif-cancel"
                  onClick={() => setEditFriend(null)}
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

export default AIFriendsAdmin;