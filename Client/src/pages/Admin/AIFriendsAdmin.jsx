'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  FaVideo,
  FaUpload,
  FaCloudUploadAlt,
  FaFileImage,
  FaFileVideo,
  FaCheck,
  FaSpinner
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
  const [uploading, setUploading] = useState({ 
    status: 'idle', // 'idle', 'uploading', 'completed', 'error'
    type: null, // 'single' or 'batch'
    field: null,
    index: null,
    progress: 0,
    total: 0,
    completed: 0,
    errors: []
  });

  // Batch upload states
  const [batchUploadFiles, setBatchUploadFiles] = useState({
    images: [],
    videos: []
  });
  const [batchUploadPreviews, setBatchUploadPreviews] = useState({
    images: [],
    videos: []
  });

  const fileInputRef = useRef({
    avatar: null,
    motionVideo: null,
    images: null,
    videos: null
  });

  // Cloudinary configuration
  const cloudinaryConfig = {
    cloudName: 'dieklmzt6', // Replace with your Cloudinary cloud name
    uploadPreset: 'heartec_ai_compins_data_bolOm', // Replace with your upload preset
    apiUrl: 'https://api.cloudinary.com/v1_1'
  };

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

  // Cloudinary upload function
  const uploadToCloudinary = async (file, type = 'image', onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('cloud_name', cloudinaryConfig.cloudName);
    
    try {
      const xhr = new XMLHttpRequest();
      
      return new Promise((resolve, reject) => {
        xhr.upload.addEventListener('progress', (event) => {
          if (onProgress && event.lengthComputable) {
            const percentComplete = Math.round((event.loaded / event.total) * 100);
            onProgress(percentComplete);
          }
        });

        xhr.addEventListener('load', () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            const data = JSON.parse(xhr.responseText);
            resolve(data.secure_url);
          } else {
            reject(new Error('Upload failed'));
          }
        });

        xhr.addEventListener('error', () => {
          reject(new Error('Upload failed'));
        });

        xhr.open('POST', `${cloudinaryConfig.apiUrl}/${cloudinaryConfig.cloudName}/${type === 'image' ? 'image' : 'video'}/upload`);
        xhr.send(formData);
      });
    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw error;
    }
  };

  // Batch upload function
  const uploadMultipleFiles = async (files, type) => {
    const urls = [];
    const errors = [];
    
    setUploading({
      status: 'uploading',
      type: 'batch',
      field: type === 'image' ? 'img_gallery' : 'video_gallery',
      index: null,
      progress: 0,
      total: files.length,
      completed: 0,
      errors: []
    });

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const url = await uploadToCloudinary(file, type, (progress) => {
          // Calculate overall progress
          const overallProgress = Math.round(((i) / files.length) * 100 + (progress / files.length));
          setUploading(prev => ({
            ...prev,
            progress: overallProgress,
            completed: i
          }));
        });
        
        urls.push(url);
        
        // Update progress
        setUploading(prev => ({
          ...prev,
          completed: i + 1,
          progress: Math.round(((i + 1) / files.length) * 100)
        }));
      } catch (error) {
        errors.push({
          fileName: file.name,
          error: error.message
        });
        console.error(`Failed to upload ${file.name}:`, error);
      }
    }

    setUploading(prev => ({
      ...prev,
      status: errors.length > 0 ? 'error' : 'completed',
      errors
    }));

    return { urls, errors };
  };

  // Handle batch file selection
  const handleBatchFileSelect = (type, event) => {
    const files = Array.from(event.target.files);
    
    // Validate files
    const validFiles = files.filter(file => {
      const isValidType = type === 'image' 
        ? file.type.startsWith('image/')
        : file.type.startsWith('video/');
      
      const maxSize = type === 'image' ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
      const isValidSize = file.size <= maxSize;
      
      return isValidType && isValidSize;
    });

    // Create previews
    const previews = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type,
      url: URL.createObjectURL(file)
    }));

    if (type === 'image') {
      setBatchUploadFiles(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
      setBatchUploadPreviews(prev => ({
        ...prev,
        images: [...prev.images, ...previews]
      }));
    } else {
      setBatchUploadFiles(prev => ({
        ...prev,
        videos: [...prev.videos, ...validFiles]
      }));
      setBatchUploadPreviews(prev => ({
        ...prev,
        videos: [...prev.videos, ...previews]
      }));
    }

    // Reset file input
    event.target.value = '';
  };

  // Remove batch file
  const removeBatchFile = (type, index) => {
    if (type === 'image') {
      // Revoke object URL
      URL.revokeObjectURL(batchUploadPreviews.images[index].url);
      
      setBatchUploadFiles(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
      setBatchUploadPreviews(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== index)
      }));
    } else {
      URL.revokeObjectURL(batchUploadPreviews.videos[index].url);
      
      setBatchUploadFiles(prev => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== index)
      }));
      setBatchUploadPreviews(prev => ({
        ...prev,
        videos: prev.videos.filter((_, i) => i !== index)
      }));
    }
  };

  // Upload batch files
  const handleBatchUpload = async (type) => {
    const files = type === 'image' ? batchUploadFiles.images : batchUploadFiles.videos;
    
    if (files.length === 0) {
      alert(`Please select ${type} files to upload`);
      return;
    }

    const { urls, errors } = await uploadMultipleFiles(files, type);

    if (urls.length > 0) {
      // Add URLs to the appropriate gallery
      if (type === 'image') {
        setEditFriend(prev => ({
          ...prev,
          img_gallery: [...(prev.img_gallery || []), ...urls]
        }));
      } else {
        setEditFriend(prev => ({
          ...prev,
          video_gallery: [...(prev.video_gallery || []), ...urls]
        }));
      }

      // Clear batch files
      if (type === 'image') {
        // Revoke all image preview URLs
        batchUploadPreviews.images.forEach(preview => {
          URL.revokeObjectURL(preview.url);
        });
        
        setBatchUploadFiles(prev => ({ ...prev, images: [] }));
        setBatchUploadPreviews(prev => ({ ...prev, images: [] }));
      } else {
        batchUploadPreviews.videos.forEach(preview => {
          URL.revokeObjectURL(preview.url);
        });
        
        setBatchUploadFiles(prev => ({ ...prev, videos: [] }));
        setBatchUploadPreviews(prev => ({ ...prev, videos: [] }));
      }
    }

    if (errors.length > 0) {
      alert(`Failed to upload ${errors.length} file(s). Check console for details.`);
    }
  };

  // Clear batch upload
  const clearBatchUpload = (type) => {
    if (type === 'image') {
      batchUploadPreviews.images.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
      setBatchUploadFiles(prev => ({ ...prev, images: [] }));
      setBatchUploadPreviews(prev => ({ ...prev, images: [] }));
    } else {
      batchUploadPreviews.videos.forEach(preview => {
        URL.revokeObjectURL(preview.url);
      });
      setBatchUploadFiles(prev => ({ ...prev, videos: [] }));
      setBatchUploadPreviews(prev => ({ ...prev, videos: [] }));
    }
  };

  // Single file upload handler
  const handleFileUpload = async (event, field, index = null) => {
    const file = event.target.files[0];
    if (!file) return;

    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    
    if (!isImage && !isVideo) {
      alert('Please upload only image or video files');
      return;
    }

    const maxSize = isImage ? 10 * 1024 * 1024 : 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert(`File size too large. Maximum size: ${isImage ? '10MB' : '50MB'}`);
      return;
    }

    setUploading({
      status: 'uploading',
      type: 'single',
      field,
      index,
      progress: 0,
      total: 1,
      completed: 0,
      errors: []
    });

    try {
      const uploadUrl = await uploadToCloudinary(file, isImage ? 'image' : 'video', (progress) => {
        setUploading(prev => ({ ...prev, progress }));
      });
      
      if (field === 'avatar_img') {
        setEditFriend(prev => ({ ...prev, [field]: uploadUrl }));
      } else if (field === 'avatar_motion_video') {
        setEditFriend(prev => ({ ...prev, [field]: uploadUrl }));
      } else if (field === 'img_gallery' && index !== null) {
        updateImageGalleryItem(index, uploadUrl);
      } else if (field === 'video_gallery' && index !== null) {
        updateVideoGalleryItem(index, uploadUrl);
      }

      setUploading(prev => ({ ...prev, status: 'completed', progress: 100 }));
      
      // Reset uploading state after 2 seconds
      setTimeout(() => {
        setUploading({
          status: 'idle',
          type: null,
          field: null,
          index: null,
          progress: 0,
          total: 0,
          completed: 0,
          errors: []
        });
      }, 2000);
    } catch (error) {
      setUploading(prev => ({
        ...prev,
        status: 'error',
        errors: [{ fileName: file.name, error: error.message }]
      }));
      alert('Failed to upload file. Please try again.');
    }
  };

  // Trigger file input
  const triggerFileInput = (type, field, index = null) => {
    const inputKey = field === 'avatar_img' ? 'avatar' 
                   : field === 'avatar_motion_video' ? 'motionVideo'
                   : field === 'img_gallery' ? 'images'
                   : 'videos';
    
    if (fileInputRef.current[inputKey]) {
      fileInputRef.current[inputKey].click();
    }
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

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
    // Clean up preview URLs on unmount
    return () => {
      batchUploadPreviews.images.forEach(preview => URL.revokeObjectURL(preview.url));
      batchUploadPreviews.videos.forEach(preview => URL.revokeObjectURL(preview.url));
    };
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
    
    // Clear any existing batch uploads
    clearBatchUpload('image');
    clearBatchUpload('video');
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
                onClick={() => {
                  // Clean up preview URLs
                  clearBatchUpload('image');
                  clearBatchUpload('video');
                  setEditFriend(null);
                }}
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

                {/* Avatar Image Section */}
                <div className="form-group full-width">
                  <div className="fif-upload-section">
                    <label>Avatar Image</label>
                    <div className="fif-upload-group">
                      <input
                        type="text"
                        value={editFriend.avatar_img}
                        onChange={(e) => setEditFriend({ ...editFriend, avatar_img: e.target.value })}
                        required
                        className="fif-upload-input"
                        placeholder="Avatar URL or upload image"
                      />
                      <input
                        ref={el => fileInputRef.current.avatar = el}
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, 'avatar_img')}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="fif-upload-button"
                        onClick={() => triggerFileInput('image', 'avatar_img')}
                      >
                        <FaUpload />
                      </button>
                    </div>
                    {uploading.field === 'avatar_img' && uploading.type === 'single' && (
                      <div className="fif-upload-status">
                        {uploading.status === 'uploading' && (
                          <div className="fif-upload-progress">
                            <div className="fif-progress-bar">
                              <div 
                                className="fif-progress-fill" 
                                style={{ width: `${uploading.progress}%` }}
                              ></div>
                            </div>
                            <span>{uploading.progress}%</span>
                          </div>
                        )}
                        {uploading.status === 'completed' && (
                          <div className="fif-upload-success">
                            <FaCheck /> Uploaded successfully!
                          </div>
                        )}
                      </div>
                    )}
                    {editFriend.avatar_img && (
                      <div className="fif-preview-container">
                        <img 
                          src={editFriend.avatar_img} 
                          alt="Avatar preview" 
                          className="fif-preview-thumbnail"
                          onClick={() => handleImagePreview(editFriend.avatar_img)}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Motion Video Section */}
                <div className="form-group full-width">
                  <div className="fif-upload-section">
                    <label>Motion Video</label>
                    <div className="fif-upload-group">
                      <input
                        type="text"
                        value={editFriend.avatar_motion_video || ""}
                        onChange={(e) => setEditFriend({ ...editFriend, avatar_motion_video: e.target.value })}
                        placeholder="Motion video URL or upload video"
                        className="fif-upload-input"
                      />
                      <input
                        ref={el => fileInputRef.current.motionVideo = el}
                        type="file"
                        accept="video/*"
                        onChange={(e) => handleFileUpload(e, 'avatar_motion_video')}
                        style={{ display: 'none' }}
                      />
                      <button
                        type="button"
                        className="fif-upload-button"
                        onClick={() => triggerFileInput('video', 'avatar_motion_video')}
                      >
                        <FaVideo />
                      </button>
                    </div>
                    {uploading.field === 'avatar_motion_video' && uploading.type === 'single' && (
                      <div className="fif-upload-status">
                        {uploading.status === 'uploading' && (
                          <div className="fif-upload-progress">
                            <div className="fif-progress-bar">
                              <div 
                                className="fif-progress-fill" 
                                style={{ width: `${uploading.progress}%` }}
                              ></div>
                            </div>
                            <span>{uploading.progress}%</span>
                          </div>
                        )}
                        {uploading.status === 'completed' && (
                          <div className="fif-upload-success">
                            <FaCheck /> Uploaded successfully!
                          </div>
                        )}
                      </div>
                    )}
                    {editFriend.avatar_motion_video && (
                      <div className="fif-preview-container">
                        <video 
                          src={editFriend.avatar_motion_video} 
                          className="fif-preview-thumbnail"
                          onClick={() => handleVideoPreview(editFriend.avatar_motion_video)}
                        />
                        <button 
                          className="fif-preview-play"
                          onClick={() => handleVideoPreview(editFriend.avatar_motion_video)}
                        >
                          <FaPlay />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Gallery Section */}
                <div className="form-group full-width">
                  <div className="fif-upload-section">
                    <label>Image Gallery</label>
                    
                    {/* Existing Images */}
                    {editFriend.img_gallery?.length > 0 && (
                      <div className="fif-gallery-list">
                        <h4>Existing Images ({editFriend.img_gallery.length})</h4>
                        <div className="fif-preview-grid">
                          {editFriend.img_gallery.map((url, index) => (
                            <div key={`existing-img-${index}`} className="fif-gallery-item">
                              <div className="fif-gallery-preview">
                                <img 
                                  src={url} 
                                  alt={`Gallery ${index + 1}`}
                                  className="fif-preview-thumbnail"
                                  onClick={() => handleImagePreview(url)}
                                />
                                <button
                                  type="button"
                                  className="fif-gallery-remove"
                                  onClick={() => removeImageGalleryItem(index)}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => updateImageGalleryItem(index, e.target.value)}
                                className="fif-gallery-url"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Batch Image Upload */}
                    <div className="fif-batch-upload">
                      <div className="fif-batch-header">
                        <h4>Upload Multiple Images</h4>
                        <div className="fif-batch-actions">
                          <input
                            ref={el => fileInputRef.current.images = el}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleBatchFileSelect('image', e)}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            className="fif-action-button"
                            onClick={() => fileInputRef.current.images?.click()}
                          >
                            <FaPlus /> Select Images
                          </button>
                          {batchUploadPreviews.images.length > 0 && (
                            <>
                              <button
                                type="button"
                                className="fif-action-button fif-save"
                                onClick={() => handleBatchUpload('image')}
                                disabled={uploading.status === 'uploading'}
                              >
                                {uploading.status === 'uploading' && uploading.field === 'img_gallery' ? (
                                  <>
                                    <FaSpinner className="spinner" /> Uploading...
                                  </>
                                ) : (
                                  <>
                                    <FaCloudUploadAlt /> Upload All ({batchUploadPreviews.images.length})
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                className="fif-action-button fif-cancel"
                                onClick={() => clearBatchUpload('image')}
                              >
                                <FaTimes /> Clear
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Batch Upload Progress */}
                      {uploading.field === 'img_gallery' && uploading.type === 'batch' && (
                        <div className="fif-batch-progress">
                          <div className="fif-progress-info">
                            <span>Uploading {uploading.completed}/{uploading.total} files</span>
                            <span>{uploading.progress}%</span>
                          </div>
                          <div className="fif-progress-bar">
                            <div 
                              className="fif-progress-fill" 
                              style={{ width: `${uploading.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Image Previews */}
                      {batchUploadPreviews.images.length > 0 && (
                        <div className="fif-preview-grid">
                          {batchUploadPreviews.images.map((preview, index) => (
                            <div key={`batch-img-${index}`} className="fif-batch-preview">
                              <div className="fif-preview-content">
                                <img 
                                  src={preview.url} 
                                  alt={preview.name}
                                  className="fif-preview-thumbnail"
                                />
                                <button
                                  type="button"
                                  className="fif-preview-remove"
                                  onClick={() => removeBatchFile('image', index)}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                              <div className="fif-preview-info">
                                <span className="fif-preview-name" title={preview.name}>
                                  {preview.name.length > 15 ? preview.name.substring(0, 15) + '...' : preview.name}
                                </span>
                                <span className="fif-preview-size">
                                  {formatFileSize(preview.size)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Single URL */}
                      <div className="fif-single-url">
                        <button
                          type="button"
                          className="fif-action-button"
                          onClick={addImageGalleryItem}
                        >
                          <FaPlus /> Add Single Image URL
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Video Gallery Section */}
                <div className="form-group full-width">
                  <div className="fif-upload-section">
                    <label>Video Gallery</label>
                    
                    {/* Existing Videos */}
                    {editFriend.video_gallery?.length > 0 && (
                      <div className="fif-gallery-list">
                        <h4>Existing Videos ({editFriend.video_gallery.length})</h4>
                        <div className="fif-preview-grid">
                          {editFriend.video_gallery.map((url, index) => (
                            <div key={`existing-video-${index}`} className="fif-gallery-item">
                              <div className="fif-gallery-preview">
                                <video 
                                  src={url}
                                  className="fif-preview-thumbnail"
                                  onClick={() => handleVideoPreview(url)}
                                />
                                <button
                                  type="button"
                                  className="fif-preview-play"
                                  onClick={() => handleVideoPreview(url)}
                                >
                                  <FaPlay />
                                </button>
                                <button
                                  type="button"
                                  className="fif-gallery-remove"
                                  onClick={() => removeVideoGalleryItem(index)}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                              <input
                                type="text"
                                value={url}
                                onChange={(e) => updateVideoGalleryItem(index, e.target.value)}
                                className="fif-gallery-url"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Batch Video Upload */}
                    <div className="fif-batch-upload">
                      <div className="fif-batch-header">
                        <h4>Upload Multiple Videos</h4>
                        <div className="fif-batch-actions">
                          <input
                            ref={el => fileInputRef.current.videos = el}
                            type="file"
                            accept="video/*"
                            multiple
                            onChange={(e) => handleBatchFileSelect('video', e)}
                            style={{ display: 'none' }}
                          />
                          <button
                            type="button"
                            className="fif-action-button"
                            onClick={() => fileInputRef.current.videos?.click()}
                          >
                            <FaPlus /> Select Videos
                          </button>
                          {batchUploadPreviews.videos.length > 0 && (
                            <>
                              <button
                                type="button"
                                className="fif-action-button fif-save"
                                onClick={() => handleBatchUpload('video')}
                                disabled={uploading.status === 'uploading'}
                              >
                                {uploading.status === 'uploading' && uploading.field === 'video_gallery' ? (
                                  <>
                                    <FaSpinner className="spinner" /> Uploading...
                                  </>
                                ) : (
                                  <>
                                    <FaCloudUploadAlt /> Upload All ({batchUploadPreviews.videos.length})
                                  </>
                                )}
                              </button>
                              <button
                                type="button"
                                className="fif-action-button fif-cancel"
                                onClick={() => clearBatchUpload('video')}
                              >
                                <FaTimes /> Clear
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Batch Upload Progress */}
                      {uploading.field === 'video_gallery' && uploading.type === 'batch' && (
                        <div className="fif-batch-progress">
                          <div className="fif-progress-info">
                            <span>Uploading {uploading.completed}/{uploading.total} files</span>
                            <span>{uploading.progress}%</span>
                          </div>
                          <div className="fif-progress-bar">
                            <div 
                              className="fif-progress-fill" 
                              style={{ width: `${uploading.progress}%` }}
                            ></div>
                          </div>
                        </div>
                      )}

                      {/* Video Previews */}
                      {batchUploadPreviews.videos.length > 0 && (
                        <div className="fif-preview-grid">
                          {batchUploadPreviews.videos.map((preview, index) => (
                            <div key={`batch-video-${index}`} className="fif-batch-preview">
                              <div className="fif-preview-content">
                                <video 
                                  src={preview.url}
                                  className="fif-preview-thumbnail"
                                />
                                <button
                                  type="button"
                                  className="fif-preview-play"
                                  onClick={() => {
                                    setPreviewMedia({ type: 'video', url: preview.url });
                                  }}
                                >
                                  <FaPlay />
                                </button>
                                <button
                                  type="button"
                                  className="fif-preview-remove"
                                  onClick={() => removeBatchFile('video', index)}
                                >
                                  <FaTimes />
                                </button>
                              </div>
                              <div className="fif-preview-info">
                                <span className="fif-preview-name" title={preview.name}>
                                  {preview.name.length > 15 ? preview.name.substring(0, 15) + '...' : preview.name}
                                </span>
                                <span className="fif-preview-size">
                                  {formatFileSize(preview.size)}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Add Single URL */}
                      <div className="fif-single-url">
                        <button
                          type="button"
                          className="fif-action-button"
                          onClick={addVideoGalleryItem}
                        >
                          <FaPlus /> Add Single Video URL
                        </button>
                      </div>
                    </div>
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
                  onClick={() => {
                    clearBatchUpload('image');
                    clearBatchUpload('video');
                    setEditFriend(null);
                  }}
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