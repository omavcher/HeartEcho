'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import "./AIFriendsAdmin.css";
import { 
  FaRobot, FaTrash, FaEdit, FaSearch, FaPlus, FaSync, FaDownload, 
  FaChartPie, FaTimes, FaPlay, FaCloudUploadAlt, FaSpinner 
} from "react-icons/fa";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import api from '../../config/api';
import axios from "axios";

const AIFriendsAdmin = () => {
  // --- States ---
  const [aiFriends, setAIFriends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedGender, setSelectedGender] = useState("all");
  const [editFriend, setEditFriend] = useState(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [uploading, setUploading] = useState(false); // Track global upload status
  const [previewMedia, setPreviewMedia] = useState({ type: null, url: null });

  // Cloudinary Config (Move to .env in production)
  const CLOUDINARY_URL = "https://api.cloudinary.com/v1_1/dx6rjowfb/auto/upload";
  const UPLOAD_PRESET = "ml_default"; 

  // --- Data Fetching ---
  const fetchAIFriends = useCallback(async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem("token");
      const response = await axios.get(`${api.Url}/admin/aiuser-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAIFriends(response.data.aiusers || []);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAIFriends(); }, [fetchAIFriends]);

  // --- Cloudinary Upload Logic ---
  const uploadMedia = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    try {
      setUploading(true);
      const res = await axios.post(CLOUDINARY_URL, formData);
      return res.data.secure_url;
    } catch (err) {
      alert("Cloudinary Upload Failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e, field, isGallery = false, index = null) => {
    const file = e.target.files[0];
    if (!file) return;

    // 1. Upload to Cloudinary
    const remoteUrl = await uploadMedia(file);
    
    if (remoteUrl) {
      if (isGallery) {
        const newGallery = [...editFriend[field]];
        newGallery[index] = remoteUrl;
        setEditFriend({ ...editFriend, [field]: newGallery });
      } else {
        setEditFriend({ ...editFriend, [field]: remoteUrl });
      }
    }
  };

  // --- Stats Calculation ---
  const stats = useMemo(() => {
    const male = aiFriends.filter(f => f.gender === "male").length;
    const female = aiFriends.filter(f => f.gender === "female").length;
    return { total: aiFriends.length, male, female };
  }, [aiFriends]);

  const chartData = [
    { name: "Male", value: stats.male, color: "#0071e3" },
    { name: "Female", value: stats.female, color: "#ff2d55" }
  ];

  // --- CRUD Handlers ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const submissionData = {
        ...editFriend,
        interests: typeof editFriend.interests === 'string' 
          ? editFriend.interests.split(",").map(i => i.trim()) 
          : editFriend.interests
      };

      await axios.put(`${api.Url}/admin/aiuser-data/${editFriend._id}`, submissionData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setEditFriend(null);
      fetchAIFriends();
      alert("Character Updated!");
    } catch (err) {
      alert("Update Failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this character?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${api.Url}/admin/aiuser-data/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAIFriends();
    } catch (err) {
      alert("Delete Failed");
    }
  };

  // --- Filtered List ---
  const filteredFriends = aiFriends.filter(f => 
    (selectedGender === "all" || f.gender === selectedGender) &&
    (f.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) return <div className="fif-loading"><FaSpinner className="spin"/></div>;

  return (
    <div className="fif-container">
      {/* Header & Stats */}
      <div className="fif-header">
        <div>
          <h2 className="fif-title">HeartEcho Characters</h2>
          <p className="fif-subtitle">Manage AI Personalities and Media</p>
        </div>
        <div className="fif-header-actions">
          <button className="fif-action-button" onClick={() => setShowAddSection(!showAddSection)}>
            <FaPlus /> {showAddSection ? "Close" : "Add Multiple JSON"}
          </button>
          <button className="fif-action-button" onClick={fetchAIFriends} disabled={refreshing}>
            <FaSync className={refreshing ? "spin" : ""} /> Refresh
          </button>
        </div>
      </div>

      

      <div className="fif-stats-overview">
        <div className="fif-stat-card">
          <h3>Total Characters</h3>
          <p className="stat-value">{stats.total}</p>
        </div>
        <div className="fif-chart-card">
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={chartData} innerRadius={30} outerRadius={50} paddingAngle={5} dataKey="value">
                {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* JSON Bulk Add */}
      {showAddSection && (
        <div className="fif-add-section">
          <textarea 
            value={jsonInput} 
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste character JSON array here..."
          />
          <button className="fif-action-button fif-save" onClick={async () => {
             try {
               const parsed = JSON.parse(jsonInput);
               await axios.post(`${api.Url}/admin/put-alldata/multipel`, parsed, {
                 headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
               });
               fetchAIFriends();
               setShowAddSection(false);
             } catch (e) { alert("Invalid JSON"); }
          }}>Save Bulk Data</button>
        </div>
      )}

      {/* Filters & Grid */}
      <div className="fif-filters-section">
        <div className="fif-search-container">
          <FaSearch className="fif-search-icon" />
          <input 
            type="text" 
            placeholder="Search by name..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select value={selectedGender} onChange={(e) => setSelectedGender(e.target.value)}>
          <option value="all">All Genders</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="fif-friends-grid">
        {filteredFriends.map(friend => (
          <div key={friend._id} className="fif-friend-card">
            <img src={friend.avatar_img} alt="" className="fif-friend-avatar" />
            <div className="fif-friend-content">
              <h4>{friend.name} ({friend.age})</h4>
              <p className="relationship-tag">{friend.relationship}</p>
              <div className="fif-friend-actions">
                <button onClick={() => setEditFriend(friend)}><FaEdit /> Edit</button>
                <button onClick={() => handleDelete(friend._id)} className="delete-btn"><FaTrash /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- Edit Modal with Auto-Upload --- */}
      {editFriend && (
        <div className="fif-modal">
          <div className="fif-modal-content">
            <div className="fif-modal-header">
              <h3>Edit {editFriend.name}</h3>
              <button onClick={() => setEditFriend(null)}><FaTimes /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="fif-modal-form">
              <div className="form-grid">
                {/* Avatar Upload */}
                <div className="form-group full-width upload-box">
                  <label>Profile Avatar</label>
                  <div className="upload-preview">
                    <img src={editFriend.avatar_img} alt="Preview" />
                    <label className="upload-label">
                      {uploading ? <FaSpinner className="spin"/> : <FaCloudUploadAlt />} Change Photo
                      <input type="file" hidden onChange={(e) => handleFileChange(e, 'avatar_img')} />
                    </label>
                  </div>
                </div>

                <div className="form-group"><label>Name</label>
                  <input value={editFriend.name} onChange={e => setEditFriend({...editFriend, name: e.target.value})} />
                </div>
                
                <div className="form-group"><label>Age</label>
                  <input type="number" value={editFriend.age} onChange={e => setEditFriend({...editFriend, age: e.target.value})} />
                </div>

                {/* Gallery Uploads */}
                <div className="form-group full-width">
                  <label>Image Gallery (Cloudinary Sync)</label>
                  <div className="gallery-grid">
                    {editFriend.img_gallery?.map((img, idx) => (
                      <div key={idx} className="gallery-item">
                        <img src={img} alt="" />
                        <label className="mini-upload">
                          <FaSync />
                          <input type="file" hidden onChange={(e) => handleFileChange(e, 'img_gallery', true, idx)} />
                        </label>
                      </div>
                    ))}
                    <button type="button" className="add-gallery-btn" onClick={() => setEditFriend({...editFriend, img_gallery: [...editFriend.img_gallery, ""]})}>+</button>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>Description</label>
                  <textarea value={editFriend.description} onChange={e => setEditFriend({...editFriend, description: e.target.value})} />
                </div>
              </div>

              <div className="fif-modal-actions">
                <button type="submit" className="fif-save" disabled={uploading}>
                  {uploading ? "Uploading Media..." : "Save Character"}
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