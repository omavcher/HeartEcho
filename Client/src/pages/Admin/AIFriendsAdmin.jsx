'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  FaRobot, FaTrash, FaEdit, FaSearch, FaPlus, FaSync,
  FaDownload, FaChartPie, FaPlay, FaTimes, FaVideo,
  FaCloudUploadAlt, FaCheck, FaSpinner, FaMars, FaVenus, FaCircle
} from "react-icons/fa";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import axios from "axios";
import api from '../../config/api';
import { applyWatermark } from '../../utils/mediaUtils';

// ------------------- CSS STYLES (Pure Black & Pink Theme) -------------------
const styles = `
/* ROOT & ANIMATION */
.fif-root-x30sn {
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  animation: fade-in-x30sn 0.4s ease;
  min-height: 100vh;
  background-color: #000;
}
@keyframes fade-in-x30sn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.fif-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; flex-wrap: wrap; gap: 20px;
  background: #050505; padding: 20px; border-radius: 16px; border: 1px solid #222;
}
.fif-title-group-x30sn h2 { font-size: 28px; font-weight: 800; margin: 0; color: #fff; letter-spacing: -0.5px; }
.fif-title-group-x30sn p { color: #ff69b4; margin: 5px 0 0 0; font-size: 13px; font-weight: 500; }

.fif-header-actions-x30sn { display: flex; gap: 10px; flex-wrap: wrap; }
.fif-btn-x30sn {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #333;
  background: #111; color: #fff; transition: all 0.2s;
}
.fif-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }
.fif-btn-x30sn.primary { background: #ff69b4; color: #000; border: none; }
.fif-btn-x30sn.primary:hover { background: #ff85c2; transform: translateY(-2px); box-shadow: 0 4px 12px rgba(255,105,180,0.3); }
.fif-btn-x30sn:disabled { opacity: 0.5; cursor: not-allowed; }

/* STATS CARDS */
.fif-stats-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 30px;
}
.fif-stat-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 14px; padding: 20px;
  display: flex; align-items: center; gap: 15px; position: relative; overflow: hidden;
}
.fif-stat-icon-x30sn {
  width: 48px; height: 48px; border-radius: 12px; background: rgba(255,105,180,0.1); color: #ff69b4;
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.fif-stat-info-x30sn h3 { margin: 0; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.fif-stat-info-x30sn p { margin: 2px 0 0 0; font-size: 24px; color: #fff; font-weight: 700; }

/* CHARTS SECTION */
.fif-charts-row-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;
}
.fif-chart-box-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px; height: 300px;
}
.fif-chart-header-x30sn { display: flex; align-items: center; gap: 10px; margin-bottom: 15px; color: #fff; font-weight: 600; }

/* FILTERS */
.fif-filters-x30sn {
  background: #050505; padding: 15px; border-radius: 12px; border: 1px solid #222; margin-bottom: 25px;
  display: flex; gap: 15px; flex-wrap: wrap; align-items: center;
}
.fif-search-wrap-x30sn { position: relative; flex: 1; min-width: 250px; }
.fif-search-wrap-x30sn svg { position: absolute; left: 12px; top: 12px; color: #666; }
.fif-input-x30sn {
  width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px 10px 10px 35px;
  border-radius: 8px; outline: none; font-size: 14px;
}
.fif-input-x30sn:focus { border-color: #ff69b4; }
.fif-select-x30sn {
  background: #000; color: #fff; border: 1px solid #333; padding: 10px 15px; border-radius: 8px; outline: none; cursor: pointer;
}

/* GRID & CARDS */
.fif-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;
}
.fif-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; overflow: hidden;
  transition: transform 0.2s, border-color 0.2s; position: relative;
}
.fif-card-x30sn:hover { transform: translateY(-4px); border-color: #ff69b4; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }

.fif-card-head-x30sn {
  height: 100px; background: linear-gradient(45deg, #111, #000); position: relative;
  border-bottom: 1px solid #222;
}
.fif-card-avatar-x30sn {
  width: 70px; height: 70px; border-radius: 50%; border: 3px solid #000; object-fit: cover;
  position: absolute; bottom: -35px; left: 20px; background: #222;
}
.fif-card-badge-x30sn {
  position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.6); padding: 4px 10px;
  border-radius: 20px; font-size: 10px; color: #fff; border: 1px solid #333; backdrop-filter: blur(4px);
  text-transform: uppercase; font-weight: 700;
}
.fif-card-badge-x30sn.female { color: #ff69b4; border-color: #ff69b4; }
.fif-card-badge-x30sn.male { color: #4facfe; border-color: #4facfe; }

.fif-card-body-x30sn { padding: 45px 20px 20px 20px; }
.fif-card-name-x30sn { font-size: 18px; font-weight: 700; color: #fff; margin: 0; }
.fif-card-rel-x30sn { font-size: 12px; color: #ff69b4; margin-bottom: 10px; font-weight: 500; }
.fif-card-desc-x30sn { font-size: 12px; color: #888; margin-bottom: 15px; line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.fif-tags-x30sn { display: flex; flex-wrap: wrap; gap: 5px; margin-bottom: 15px; }
.fif-tag-x30sn { background: #111; color: #ccc; font-size: 10px; padding: 3px 8px; border-radius: 4px; border: 1px solid #333; }

.fif-card-actions-x30sn {
  padding: 15px 20px; border-top: 1px solid #222; display: flex; justify-content: flex-end; gap: 10px; background: #080808;
}
.fif-act-btn-x30sn {
  background: #111; color: #fff; border: 1px solid #333; width: 32px; height: 32px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;
}
.fif-act-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }
.fif-act-btn-x30sn.del:hover { border-color: #ff4444; color: #ff4444; }

/* MODAL & FORMS */
.fif-modal-overlay-x30sn {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000;
  display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px);
}
.fif-modal-content-x30sn {
  background: #000; width: 90%; max-width: 800px; max-height: 90vh; border-radius: 20px;
  border: 1px solid #333; display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.7);
}
.fif-modal-header-x30sn {
  padding: 20px; border-bottom: 1px solid #222; display: flex; justify-content: space-between; align-items: center; background: #050505;
}
.fif-modal-header-x30sn h3 { margin: 0; color: #fff; font-size: 18px; }
.fif-close-btn-x30sn { background: none; border: none; color: #666; font-size: 20px; cursor: pointer; }
.fif-close-btn-x30sn:hover { color: #fff; }

.fif-modal-body-x30sn { padding: 25px; overflow-y: auto; }
.fif-form-grid-x30sn { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.fif-form-group-x30sn { display: flex; flex-direction: column; gap: 8px; }
.fif-form-group-x30sn.full { grid-column: 1 / -1; }
.fif-label-x30sn { font-size: 12px; font-weight: 600; color: #888; text-transform: uppercase; }
.fif-input-field-x30sn {
  background: #111; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 8px; font-size: 14px; outline: none;
}
.fif-input-field-x30sn:focus { border-color: #ff69b4; }

/* UPLOAD SECTIONS */
.fif-upload-box-x30sn {
  border: 2px dashed #333; background: #0a0a0a; border-radius: 12px; padding: 24px; text-align: center;
  transition: all 0.25s ease; position: relative; cursor: pointer;
}
.fif-upload-box-x30sn:hover, .fif-upload-box-x30sn.drag-over-x30sn { border-color: #ff69b4; background: rgba(255,105,180,0.05); transform: scale(1.005); }
.fif-upload-box-x30sn.drag-over-x30sn { box-shadow: 0 0 0 3px rgba(255,105,180,0.2); }
.fif-upload-icon-x30sn { font-size: 32px; color: #444; margin-bottom: 8px; transition: color 0.2s; }
.fif-upload-box-x30sn.drag-over-x30sn .fif-upload-icon-x30sn { color: #ff69b4; }
.fif-upload-text-x30sn { color: #666; font-size: 13px; margin: 0 0 12px 0; }
.fif-upload-text-x30sn span { color: #ff69b4; font-weight: 600; }
.fif-upload-btn-x30sn {
  background: #1a1a1a; color: #fff; border: 1px solid #444; padding: 8px 18px; border-radius: 8px;
  cursor: pointer; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
  transition: all 0.2s;
}
.fif-upload-btn-x30sn:hover { background: #222; border-color: #ff69b4; color: #ff69b4; }
.fif-upload-btn-x30sn.primary-x30sn { background: linear-gradient(135deg, #ff69b4, #ff3d84); color: #000; border: none; }
.fif-upload-btn-x30sn.primary-x30sn:hover { opacity: 0.9; transform: translateY(-1px); }
.fif-upload-btn-x30sn:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

/* PENDING FILES */
.fif-pending-list-x30sn { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 14px; justify-content: center; }
.fif-pending-item-x30sn {
  background: #111; border: 1px solid #333; border-radius: 8px; padding: 6px 10px;
  font-size: 11px; color: #aaa; display: flex; align-items: center; gap: 6px; max-width: 160px;
}
.fif-pending-item-x30sn span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.fif-pending-remove-x30sn { color: #ff4444; cursor: pointer; flex-shrink: 0; font-size: 14px; line-height: 1; background: none; border: none; padding: 0; }
.fif-pending-count-x30sn { font-size: 12px; color: #888; margin-top: 6px; }

/* UPLOAD PROGRESS OVERLAY */
.fif-upload-progress-x30sn {
  margin-top: 14px; background: #0d0d0d; border: 1px solid #222; border-radius: 10px; padding: 14px;
  animation: fade-in-x30sn 0.2s ease;
}
.fif-upload-progress-header-x30sn { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
.fif-upload-progress-label-x30sn { font-size: 12px; color: #fff; font-weight: 600; display: flex; align-items: center; gap: 8px; }
.fif-upload-progress-count-x30sn { font-size: 11px; color: #888; }
.fif-progress-bar-track-x30sn { height: 6px; background: #222; border-radius: 3px; overflow: hidden; }
.fif-progress-bar-fill-x30sn {
  height: 100%; border-radius: 3px;
  background: linear-gradient(90deg, #ff69b4, #ff3d84);
  transition: width 0.3s ease;
  box-shadow: 0 0 8px rgba(255,105,180,0.5);
}
.fif-progress-bar-fill-x30sn.success { background: linear-gradient(90deg, #00d68f, #00F260); box-shadow: 0 0 8px rgba(0,242,96,0.4); }
.fif-progress-bar-fill-x30sn.error { background: linear-gradient(90deg, #ff4444, #ff7b00); box-shadow: none; }
.fif-upload-status-msg-x30sn { font-size: 11px; margin-top: 6px; }
.fif-upload-status-msg-x30sn.success { color: #00F260; }
.fif-upload-status-msg-x30sn.error { color: #ff4444; }
.fif-upload-status-msg-x30sn.uploading { color: #ff69b4; }

/* SPINNING ANIMATION */
@keyframes spin-x30sn { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
.fif-spin-x30sn { animation: spin-x30sn 0.8s linear infinite; display: inline-block; }

/* MEDIA GRID */
.fif-media-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-top: 15px;
}
.fif-media-item-x30sn {
  position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid #333;
  transition: transform 0.2s;
}
.fif-media-item-x30sn:hover { transform: scale(1.04); border-color: #ff69b4; }
.fif-media-item-x30sn img, .fif-media-item-x30sn video { width: 100%; height: 100%; object-fit: cover; }
.fif-media-remove-x30sn {
  position: absolute; top: 3px; right: 3px; background: rgba(0,0,0,0.75); color: #ff4444; border: none;
  width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; font-size: 10px; transition: 0.2s; opacity: 0;
}
.fif-media-item-x30sn:hover .fif-media-remove-x30sn { opacity: 1; }

/* PROGRESS BAR (single upload) */
.fif-progress-x30sn { height: 4px; background: #222; border-radius: 2px; overflow: hidden; margin-top: 10px; }
.fif-progress-fill-x30sn { height: 100%; background: linear-gradient(90deg,#ff69b4,#ff3d84); transition: width 0.3s ease; box-shadow: 0 0 6px rgba(255,105,180,0.5); }

/* JSON INPUT */
.fif-json-area-x30sn {
  width: 100%; height: 300px; background: #111; border: 1px solid #333; color: #0f0; 
  font-family: monospace; padding: 15px; border-radius: 8px; resize: vertical; outline: none;
}

/* MEDIA PREVIEW OVERLAY */
.fif-preview-overlay-x30sn {
  position: fixed; inset: 0; background: #000; z-index: 2000; display: flex; flex-direction: column; align-items: center; justify-content: center;
}
.fif-preview-close-x30sn {
  position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); color: #fff; 
  border: none; width: 40px; height: 40px; border-radius: 50%; font-size: 20px; cursor: pointer;
}
.fif-preview-content-x30sn { max-width: 90%; max-height: 80vh; border-radius: 12px; border: 1px solid #333; }

@media (max-width: 768px) {
  .fif-header-x30sn { flex-direction: column; align-items: flex-start; }
  .fif-filters-x30sn { flex-direction: column; align-items: stretch; }
  .fif-form-grid-x30sn { grid-template-columns: 1fr; }
}
`;

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
    status: 'idle', type: null, field: null, index: null, progress: 0, total: 0, completed: 0, errors: []
  });

  const [batchUploadFiles, setBatchUploadFiles] = useState({ images: [], videos: [] });
  const [batchUploadPreviews, setBatchUploadPreviews] = useState({ images: [], videos: [] });
  const [dragOver, setDragOver] = useState({ images: false, videos: false });
  const [uploadProgress, setUploadProgress] = useState({ images: null, videos: null, avatar: null });

  const fileInputRef = useRef({ avatar: null, motionVideo: null, images: null, videos: null });

  const colors = useMemo(() => ["#4facfe", "#ff69b4", "#00F260", "#ff3b30", "#333333"], []);

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  // ─── FIXED: Use 'ai_friends' (underscore) to match allowed server prefixes ───
  const uploadToCloudflareR2 = async (file, type = 'image', onProgress = null) => {
    const token = getToken();
    const folder = type === 'image' ? 'ai_friends/images' : 'ai_friends/videos';

    // Apply watermark before upload
    const processedFile = await applyWatermark(file);

    const { data } = await axios.post(
      `${api.Url}/live-story/admin/presign`,
      { folder, filename: processedFile.name, contentType: processedFile.type },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!data.success) throw new Error(data.message || "Failed to get upload URL");

    await axios.put(data.uploadUrl, processedFile, {
      headers: { "Content-Type": processedFile.type },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    });

    return data.cdnUrl;
  };

  // ─── Single file upload (Avatar / Motion Video) ──────────────────────────────
  const handleFileUpload = async (event, field) => {
    const file = event.target.files[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    const key = field === 'avatar_img' ? 'avatar' : 'motionVideo';
    setUploadProgress(p => ({ ...p, [key]: { status: 'uploading', progress: 0 } }));
    setUploading({ status: 'uploading', type: 'single', field, index: null, progress: 0, total: 1, completed: 0, errors: [] });
    try {
      const uploadUrl = await uploadToCloudflareR2(file, isImage ? 'image' : 'video', (progress) => {
        setUploadProgress(p => ({ ...p, [key]: { status: 'uploading', progress } }));
        setUploading(prev => ({ ...prev, progress }));
      });
      setEditFriend(prev => ({ ...prev, [field]: uploadUrl }));
      setUploadProgress(p => ({ ...p, [key]: { status: 'success', progress: 100 } }));
      setUploading(prev => ({ ...prev, status: 'completed', progress: 100 }));
      setTimeout(() => {
        setUploadProgress(p => ({ ...p, [key]: null }));
        setUploading({ status: 'idle', type: null, field: null, index: null, progress: 0, total: 0, completed: 0, errors: [] });
      }, 2000);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadProgress(p => ({ ...p, [key]: { status: 'error', progress: 0, message: error.message } }));
      setUploading(prev => ({ ...prev, status: 'error' }));
      setTimeout(() => setUploadProgress(p => ({ ...p, [key]: null })), 3000);
    }
    event.target.value = '';
  };

  // ─── Batch upload multiple files ──────────────────────────────────────────────
  const uploadMultipleFiles = async (files, type) => {
    const urls = [];
    const errors = [];
    const progressKey = type === 'image' ? 'images' : 'videos';
    setUploading({ status: 'uploading', type: 'batch', field: progressKey === 'images' ? 'img_gallery' : 'video_gallery', progress: 0, total: files.length, completed: 0, errors: [] });
    setUploadProgress(p => ({ ...p, [progressKey]: { status: 'uploading', progress: 0, current: 0, total: files.length } }));

    for (let i = 0; i < files.length; i++) {
      try {
        const pct = Math.round((i / files.length) * 100);
        setUploadProgress(p => ({ ...p, [progressKey]: { status: 'uploading', progress: pct, current: i + 1, total: files.length } }));
        const url = await uploadToCloudflareR2(files[i], type, (filePct) => {
          const overall = Math.round(((i + filePct / 100) / files.length) * 100);
          setUploadProgress(p => ({ ...p, [progressKey]: { status: 'uploading', progress: overall, current: i + 1, total: files.length } }));
          setUploading(prev => ({ ...prev, progress: overall, completed: i }));
        });
        urls.push(url);
        setUploading(prev => ({ ...prev, completed: i + 1, progress: Math.round(((i + 1) / files.length) * 100) }));
      } catch (e) {
        console.error('File upload error:', files[i].name, e);
        errors.push(files[i].name);
      }
    }

    const finalStatus = errors.length === files.length ? 'error' : errors.length > 0 ? 'partial' : 'success';
    setUploadProgress(p => ({ ...p, [progressKey]: { status: finalStatus, progress: 100, current: files.length, total: files.length, errors } }));
    setUploading(prev => ({ ...prev, status: finalStatus === 'success' ? 'completed' : 'error' }));
    setTimeout(() => setUploadProgress(p => ({ ...p, [progressKey]: null })), 3000);
    return { urls, errors };
  };

  // ─── File selection (via button or file input) ────────────────────────────────
  const handleBatchFileSelect = (type, e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(f => type === 'image' ? f.type.startsWith('image/') : f.type.startsWith('video/'));
    const previews = validFiles.map(f => ({ name: f.name, url: URL.createObjectURL(f), size: f.size }));
    if (type === 'image') {
      setBatchUploadFiles(p => ({ ...p, images: [...p.images, ...validFiles] }));
      setBatchUploadPreviews(p => ({ ...p, images: [...p.images, ...previews] }));
    } else {
      setBatchUploadFiles(p => ({ ...p, videos: [...p.videos, ...validFiles] }));
      setBatchUploadPreviews(p => ({ ...p, videos: [...p.videos, ...previews] }));
    }
    e.target.value = '';
  };

  // ─── Drag & Drop handlers ─────────────────────────────────────────────────────
  const handleDragOver = (e, type) => { e.preventDefault(); setDragOver(p => ({ ...p, [type]: true })); };
  const handleDragLeave = (type) => setDragOver(p => ({ ...p, [type]: false }));
  const handleDrop = (e, type) => {
    e.preventDefault();
    setDragOver(p => ({ ...p, [type]: false }));
    const files = Array.from(e.dataTransfer.files);
    const validFiles = files.filter(f => type === 'images' ? f.type.startsWith('image/') : f.type.startsWith('video/'));
    const previews = validFiles.map(f => ({ name: f.name, url: URL.createObjectURL(f), size: f.size }));
    if (type === 'images') {
      setBatchUploadFiles(p => ({ ...p, images: [...p.images, ...validFiles] }));
      setBatchUploadPreviews(p => ({ ...p, images: [...p.images, ...previews] }));
    } else {
      setBatchUploadFiles(p => ({ ...p, videos: [...p.videos, ...validFiles] }));
      setBatchUploadPreviews(p => ({ ...p, videos: [...p.videos, ...previews] }));
    }
  };

  const removePendingFile = (type, idx) => {
    if (type === 'image') {
      setBatchUploadFiles(p => ({ ...p, images: p.images.filter((_,i) => i !== idx) }));
      setBatchUploadPreviews(p => ({ ...p, images: p.images.filter((_,i) => i !== idx) }));
    } else {
      setBatchUploadFiles(p => ({ ...p, videos: p.videos.filter((_,i) => i !== idx) }));
      setBatchUploadPreviews(p => ({ ...p, videos: p.videos.filter((_,i) => i !== idx) }));
    }
  };

  const handleBatchUpload = async (type) => {
    const files = type === 'image' ? batchUploadFiles.images : batchUploadFiles.videos;
    if (!files.length) return;
    const { urls } = await uploadMultipleFiles(files, type);
    if (urls.length) {
      if (type === 'image') {
        setEditFriend(prev => ({ ...prev, img_gallery: [...(prev.img_gallery || []), ...urls] }));
        setBatchUploadFiles(p => ({ ...p, images: [] }));
        setBatchUploadPreviews(p => ({ ...p, images: [] }));
      } else {
        setEditFriend(prev => ({ ...prev, video_gallery: [...(prev.video_gallery || []), ...urls] }));
        setBatchUploadFiles(p => ({ ...p, videos: [] }));
        setBatchUploadPreviews(p => ({ ...p, videos: [] }));
      }
    }
  };

  // ─── Upload Progress Component ────────────────────────────────────────────────
  const UploadProgressBar = ({ progressData, label }) => {
    if (!progressData) return null;
    const { status, progress, current, total, errors } = progressData;
    const statusClass = status === 'success' ? 'success' : status === 'error' ? 'error' : '';
    const statusMsg = status === 'uploading'
      ? total > 1 ? `Uploading ${current} of ${total}…` : `Uploading… ${progress}%`
      : status === 'success' ? `✓ ${total > 1 ? `${total} files uploaded!` : 'Upload complete!'}`
      : status === 'partial' ? `⚠ ${urls?.length || (total - (errors?.length || 0))} uploaded, ${errors?.length || 0} failed`
      : `✗ Upload failed${errors?.length ? `: ${errors.join(', ')}` : ''}`;
    return (
      <div className="fif-upload-progress-x30sn">
        <div className="fif-upload-progress-header-x30sn">
          <span className="fif-upload-progress-label-x30sn">
            {status === 'uploading' && <span className="fif-spin-x30sn">⟳</span>}
            {label}
          </span>
          <span className="fif-upload-progress-count-x30sn">{progress}%</span>
        </div>
        <div className="fif-progress-bar-track-x30sn">
          <div className={`fif-progress-bar-fill-x30sn ${statusClass}`} style={{ width: `${progress}%` }} />
        </div>
        <div className={`fif-upload-status-msg-x30sn ${status === 'uploading' ? 'uploading' : statusClass}`}>
          {statusMsg}
        </div>
      </div>
    );
  };

  // --- Data Logic ---
  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/aiuser-data`, { headers: { Authorization: `Bearer ${token}` } });
      setAIFriends(res.data.aiusers || []);
    } catch (e) { console.error(e); } 
    finally { setRefreshing(false); setLoading(false); }
  }, [getToken]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const stats = useMemo(() => ({
    totalCount: aiFriends.length,
    maleCount: aiFriends.filter(f => f.gender === "male").length,
    femaleCount: aiFriends.filter(f => f.gender === "female").length,
    activeCount: aiFriends.filter(f => f.isActive !== false).length,
    inactiveCount: aiFriends.filter(f => f.isActive === false).length
  }), [aiFriends]);

  const filteredAIFriends = useMemo(() => {
    return aiFriends.filter(friend => {
      const matchGender = selectedGender === "all" || friend.gender === selectedGender;
      const matchStatus = selectedStatus === "all" || (selectedStatus === "active" ? friend.isActive !== false : friend.isActive === false);
      const matchSearch = friend.name?.toLowerCase().includes(searchTerm.toLowerCase());
      return matchGender && matchStatus && matchSearch;
    });
  }, [aiFriends, selectedGender, selectedStatus, searchTerm]);

  // --- Actions ---
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
        const token = getToken();
        // Clean data
        const payload = {
            ...editFriend,
            interests: typeof editFriend.interests === 'string' ? editFriend.interests.split(',').map(s=>s.trim()) : editFriend.interests,
            img_gallery: editFriend.img_gallery.filter(x=>x),
            video_gallery: editFriend.video_gallery.filter(x=>x)
        };
        await axios.put(`${api.Url}/admin/aiuser-data/${editFriend._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        setEditFriend(null);
        fetchAllData();
    } catch (e) { alert("Update failed"); }
  };

  const handleAddMultiple = async () => {
      if(!jsonInput.trim()) return alert("Empty JSON");
      try {
          const token = getToken();
          await axios.post(`${api.Url}/admin/put-alldata/multipel`, JSON.parse(jsonInput), { headers: { Authorization: `Bearer ${token}` } });
          setJsonInput(""); setShowAddSection(false); fetchAllData();
      } catch (e) { alert("Failed to add from JSON"); }
  };

  const handleDelete = async (id) => {
      if(!confirm("Delete AI Friend?")) return;
      try {
          const token = getToken();
          await axios.delete(`${api.Url}/admin/aiuser-data/${id}`, { headers: { Authorization: `Bearer ${token}` } });
          setAIFriends(prev => prev.filter(f => f._id !== id));
      } catch (e) { alert("Delete failed"); }
  };

  if (loading) return <div className="fif-root-x30sn" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><FaSpinner className="spinner" size={30} style={{color:'#ff69b4'}}/></div>;

  return (
    <>
      <style>{styles}</style>
      <div className="fif-root-x30sn">
        
        {/* PREVIEW MODAL */}
        {previewMedia.type && (
            <div className="fif-preview-overlay-x30sn" onClick={() => setPreviewMedia({type:null,url:null})}>
                <button className="fif-preview-close-x30sn">×</button>
                {previewMedia.type === 'image' ? 
                    <img src={previewMedia.url} className="fif-preview-content-x30sn" onClick={e=>e.stopPropagation()} /> :
                    <video src={previewMedia.url} controls autoPlay className="fif-preview-content-x30sn" onClick={e=>e.stopPropagation()} />
                }
            </div>
        )}

        {/* HEADER */}
        <div className="fif-header-x30sn">
            <div className="fif-title-group-x30sn">
                <h2>AI Companions</h2>
                <p>Manage Virtual Personas • Total {stats.totalCount}</p>
            </div>
            <div className="fif-header-actions-x30sn">
                <button className="fif-btn-x30sn" onClick={fetchAllData} disabled={refreshing}>
                    <FaSync className={refreshing ? 'spinner' : ''}/> Sync
                </button>
                <button className="fif-btn-x30sn" onClick={() => setShowAddSection(!showAddSection)}>
                    <FaPlus /> Bulk Add
                </button>
            </div>
        </div>

        {/* STATS */}
        <div className="fif-stats-grid-x30sn">
            <div className="fif-stat-card-x30sn">
                <div className="fif-stat-icon-x30sn"><FaRobot/></div>
                <div className="fif-stat-info-x30sn"><h3>Total</h3><p>{stats.totalCount}</p></div>
            </div>
            <div className="fif-stat-card-x30sn">
                <div className="fif-stat-icon-x30sn" style={{color:'#4facfe', background:'rgba(79,172,254,0.1)'}}><FaMars/></div>
                <div className="fif-stat-info-x30sn"><h3>Male</h3><p>{stats.maleCount}</p></div>
            </div>
            <div className="fif-stat-card-x30sn">
                <div className="fif-stat-icon-x30sn" style={{color:'#ff69b4', background:'rgba(255,105,180,0.1)'}}><FaVenus/></div>
                <div className="fif-stat-info-x30sn"><h3>Female</h3><p>{stats.femaleCount}</p></div>
            </div>
            <div className="fif-stat-card-x30sn">
                <div className="fif-stat-icon-x30sn" style={{color:'#00F260', background:'rgba(0,242,96,0.1)'}}><FaCircle size={14}/></div>
                <div className="fif-stat-info-x30sn"><h3>Active</h3><p>{stats.activeCount}</p></div>
            </div>
        </div>

        {/* CHARTS */}
        <div className="fif-charts-row-x30sn">
            <div className="fif-chart-box-x30sn">
                <div className="fif-chart-header-x30sn"><FaChartPie style={{color:'#ff69b4'}}/> Gender Split</div>
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie 
                            data={[{name:'Male', value:stats.maleCount}, {name:'Female', value:stats.femaleCount}]} 
                            cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                        >
                            <Cell fill="#4facfe" />
                            <Cell fill="#ff69b4" />
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #333', borderRadius:8}} />
                        <Legend verticalAlign="bottom"/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="fif-chart-box-x30sn">
                <div className="fif-chart-header-x30sn"><FaChartPie style={{color:'#00F260'}}/> Status</div>
                <ResponsiveContainer width="100%" height="90%">
                    <PieChart>
                        <Pie 
                            data={[{name:'Active', value:stats.activeCount}, {name:'Inactive', value:stats.inactiveCount}]} 
                            cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                        >
                            <Cell fill="#00F260" />
                            <Cell fill="#333" />
                        </Pie>
                        <Tooltip contentStyle={{backgroundColor:'#000', border:'1px solid #333', borderRadius:8}} />
                        <Legend verticalAlign="bottom"/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* BULK ADD */}
        {showAddSection && (
            <div className="fif-filters-x30sn" style={{flexDirection:'column', alignItems:'flex-start'}}>
                <h3 style={{margin:0, color:'#fff'}}>Paste JSON Data</h3>
                <textarea 
                    className="fif-json-area-x30sn" 
                    value={jsonInput} 
                    onChange={e => setJsonInput(e.target.value)}
                    placeholder='[{"name": "...", "gender": "female" ...}]'
                />
                <button className="fif-btn-x30sn primary" onClick={handleAddMultiple}>Process JSON</button>
            </div>
        )}

        {/* FILTERS */}
        <div className="fif-filters-x30sn">
            <div className="fif-search-wrap-x30sn">
                <FaSearch />
                <input 
                    className="fif-input-x30sn" 
                    placeholder="Search by name, description..." 
                    value={searchTerm} 
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>
            <select className="fif-select-x30sn" value={selectedGender} onChange={e => setSelectedGender(e.target.value)}>
                <option value="all">All Genders</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
            </select>
            <select className="fif-select-x30sn" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
            </select>
        </div>

        {/* GRID */}
        <div className="fif-grid-x30sn">
            {filteredAIFriends.map(friend => (
                <div key={friend._id} className="fif-card-x30sn">
                    <div className="fif-card-head-x30sn">
                        <span className={`fif-card-badge-x30sn ${friend.gender}`}>
                            {friend.gender}
                        </span>
                        <img 
                            src={friend.avatar_img || '/placeholder.png'} 
                            className="fif-card-avatar-x30sn" 
                            alt=""
                            onClick={() => setPreviewMedia({type:'image', url: friend.avatar_img})}
                        />
                    </div>
                    <div className="fif-card-body-x30sn">
                        <h4 className="fif-card-name-x30sn">{friend.name}</h4>
                        <div className="fif-card-rel-x30sn">{friend.relationship} • {friend.age}y</div>
                        <p className="fif-card-desc-x30sn">{friend.description}</p>
                        
                        <div className="fif-tags-x30sn">
                            {friend.interests?.slice(0,3).map((tag,i) => (
                                <span key={i} className="fif-tag-x30sn">{tag}</span>
                            ))}
                        </div>
                    </div>
                    <div className="fif-card-actions-x30sn">
                        {friend.avatar_motion_video && (
                            <button className="fif-act-btn-x30sn" onClick={() => setPreviewMedia({type:'video', url:friend.avatar_motion_video})}>
                                <FaPlay size={10}/>
                            </button>
                        )}
                        <button className="fif-act-btn-x30sn" onClick={() => setEditFriend({...friend, interests: friend.interests?.join(', ') || ''})}>
                            <FaEdit />
                        </button>
                        <button className="fif-act-btn-x30sn del" onClick={() => handleDelete(friend._id)}>
                            <FaTrash />
                        </button>
                    </div>
                </div>
            ))}
        </div>

        {/* EDIT MODAL */}
        {editFriend && (
            <div className="fif-modal-overlay-x30sn">
                <div className="fif-modal-content-x30sn">
                    <div className="fif-modal-header-x30sn">
                        <h3>Edit Profile</h3>
                        <button className="fif-close-btn-x30sn" onClick={() => setEditFriend(null)}>×</button>
                    </div>
                    <form onSubmit={handleEditSubmit} className="fif-modal-body-x30sn">
                        <div className="fif-form-grid-x30sn">
                            <div className="fif-form-group-x30sn">
                                <label className="fif-label-x30sn">Name</label>
                                <input className="fif-input-field-x30sn" value={editFriend.name} onChange={e => setEditFriend({...editFriend, name: e.target.value})} required />
                            </div>
                            <div className="fif-form-group-x30sn">
                                <label className="fif-label-x30sn">Relationship</label>
                                <input className="fif-input-field-x30sn" value={editFriend.relationship} onChange={e => setEditFriend({...editFriend, relationship: e.target.value})} />
                            </div>
                            <div className="fif-form-group-x30sn">
                                <label className="fif-label-x30sn">Gender</label>
                                <select className="fif-input-field-x30sn" value={editFriend.gender} onChange={e => setEditFriend({...editFriend, gender: e.target.value})}>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                </select>
                            </div>
                            <div className="fif-form-group-x30sn">
                                <label className="fif-label-x30sn">Age</label>
                                <input className="fif-input-field-x30sn" type="number" value={editFriend.age} onChange={e => setEditFriend({...editFriend, age: e.target.value})} />
                            </div>
                            <div className="fif-form-group-x30sn full">
                                <label className="fif-label-x30sn">Interests (Comma Separated)</label>
                                <input className="fif-input-field-x30sn" value={editFriend.interests} onChange={e => setEditFriend({...editFriend, interests: e.target.value})} />
                            </div>
                            <div className="fif-form-group-x30sn full">
                                <label className="fif-label-x30sn">Description</label>
                                <textarea className="fif-input-field-x30sn" rows={3} value={editFriend.description} onChange={e => setEditFriend({...editFriend, description: e.target.value})} />
                            </div>
                            
                            {/* ── AVATAR UPLOAD ─────────────────────────────── */}
                            <div className="fif-form-group-x30sn full">
                                <label className="fif-label-x30sn">Avatar</label>
                                <div style={{display:'flex', gap:10}}>
                                    <input className="fif-input-field-x30sn" value={editFriend.avatar_img || ''} onChange={e => setEditFriend({...editFriend, avatar_img:e.target.value})} style={{flex:1}} placeholder="Avatar URL or upload below" />
                                    <button type="button" className="fif-btn-x30sn" onClick={() => fileInputRef.current.avatar.click()} disabled={!!uploadProgress.avatar}>
                                        {uploadProgress.avatar?.status === 'uploading' ? <span className="fif-spin-x30sn"><FaSpinner/></span> : <FaCloudUploadAlt/>}
                                    </button>
                                </div>
                                <input type="file" hidden ref={el => fileInputRef.current.avatar = el} onChange={e => handleFileUpload(e, 'avatar_img')} accept="image/*" />
                                <UploadProgressBar progressData={uploadProgress.avatar} label="Avatar Upload" />
                            </div>

                            {/* ── IMAGE GALLERY ─────────────────────────────── */}
                            <div className="fif-form-group-x30sn full">
                                <label className="fif-label-x30sn">Image Gallery</label>
                                <div
                                    className={`fif-upload-box-x30sn ${dragOver.images ? 'drag-over-x30sn' : ''}`}
                                    onDragOver={e => handleDragOver(e, 'images')}
                                    onDragLeave={() => handleDragLeave('images')}
                                    onDrop={e => handleDrop(e, 'images')}
                                    onClick={() => !batchUploadFiles.images.length && fileInputRef.current.images.click()}
                                >
                                    <div className="fif-upload-icon-x30sn">🖼️</div>
                                    <p className="fif-upload-text-x30sn">
                                        Drag & drop images here or <span>browse files</span>
                                    </p>
                                    <input type="file" hidden multiple ref={el => fileInputRef.current.images = el} onChange={e => handleBatchFileSelect('image', e)} accept="image/*" />
                                    <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
                                        <button type="button" className="fif-upload-btn-x30sn" onClick={e => { e.stopPropagation(); fileInputRef.current.images.click(); }}>
                                            <FaPlus size={10}/> Select Files
                                        </button>
                                        {batchUploadFiles.images.length > 0 && (
                                            <button
                                                type="button"
                                                className="fif-upload-btn-x30sn primary-x30sn"
                                                onClick={e => { e.stopPropagation(); handleBatchUpload('image'); }}
                                                disabled={uploadProgress.images?.status === 'uploading'}
                                            >
                                                {uploadProgress.images?.status === 'uploading'
                                                    ? <><span className="fif-spin-x30sn"><FaSpinner/></span> Uploading…</>
                                                    : <><FaCloudUploadAlt/> Upload {batchUploadFiles.images.length} {batchUploadFiles.images.length === 1 ? 'Image' : 'Images'}</>
                                                }
                                            </button>
                                        )}
                                    </div>

                                    {/* Pending file chips */}
                                    {batchUploadPreviews.images.length > 0 && (
                                        <div className="fif-pending-list-x30sn" onClick={e => e.stopPropagation()}>
                                            {batchUploadPreviews.images.map((f, i) => (
                                                <div key={i} className="fif-pending-item-x30sn">
                                                    <span>🖼</span>
                                                    <span title={f.name}>{f.name}</span>
                                                    <button type="button" className="fif-pending-remove-x30sn" onClick={() => removePendingFile('image', i)}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Upload progress */}
                                <UploadProgressBar progressData={uploadProgress.images} label="Image Gallery Upload" />

                                {/* Existing gallery */}
                                {editFriend.img_gallery?.filter(Boolean).length > 0 && (
                                    <div className="fif-media-grid-x30sn">
                                        {editFriend.img_gallery.filter(Boolean).map((url, i) => (
                                            <div key={i} className="fif-media-item-x30sn">
                                                <img src={url} alt="" onClick={() => setPreviewMedia({type:'image', url})} style={{cursor:'pointer'}}/>
                                                <button type="button" className="fif-media-remove-x30sn" onClick={() => {
                                                    const newGal = [...editFriend.img_gallery];
                                                    newGal.splice(i, 1);
                                                    setEditFriend({...editFriend, img_gallery: newGal});
                                                }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* ── VIDEO GALLERY ─────────────────────────────── */}
                            <div className="fif-form-group-x30sn full">
                                <label className="fif-label-x30sn">Video Gallery</label>
                                <div
                                    className={`fif-upload-box-x30sn ${dragOver.videos ? 'drag-over-x30sn' : ''}`}
                                    onDragOver={e => handleDragOver(e, 'videos')}
                                    onDragLeave={() => handleDragLeave('videos')}
                                    onDrop={e => handleDrop(e, 'videos')}
                                    onClick={() => !batchUploadFiles.videos.length && fileInputRef.current.videos.click()}
                                >
                                    <div className="fif-upload-icon-x30sn">🎬</div>
                                    <p className="fif-upload-text-x30sn">
                                        Drag & drop videos here or <span>browse files</span>
                                    </p>
                                    <input type="file" hidden multiple ref={el => fileInputRef.current.videos = el} onChange={e => handleBatchFileSelect('video', e)} accept="video/*" />
                                    <div style={{display:'flex',gap:8,justifyContent:'center',flexWrap:'wrap'}}>
                                        <button type="button" className="fif-upload-btn-x30sn" onClick={e => { e.stopPropagation(); fileInputRef.current.videos.click(); }}>
                                            <FaPlus size={10}/> Select Files
                                        </button>
                                        {batchUploadFiles.videos.length > 0 && (
                                            <button
                                                type="button"
                                                className="fif-upload-btn-x30sn primary-x30sn"
                                                onClick={e => { e.stopPropagation(); handleBatchUpload('video'); }}
                                                disabled={uploadProgress.videos?.status === 'uploading'}
                                            >
                                                {uploadProgress.videos?.status === 'uploading'
                                                    ? <><span className="fif-spin-x30sn"><FaSpinner/></span> Uploading…</>
                                                    : <><FaCloudUploadAlt/> Upload {batchUploadFiles.videos.length} {batchUploadFiles.videos.length === 1 ? 'Video' : 'Videos'}</>
                                                }
                                            </button>
                                        )}
                                    </div>

                                    {/* Pending file chips */}
                                    {batchUploadPreviews.videos.length > 0 && (
                                        <div className="fif-pending-list-x30sn" onClick={e => e.stopPropagation()}>
                                            {batchUploadPreviews.videos.map((f, i) => (
                                                <div key={i} className="fif-pending-item-x30sn">
                                                    <span>🎬</span>
                                                    <span title={f.name}>{f.name}</span>
                                                    <button type="button" className="fif-pending-remove-x30sn" onClick={() => removePendingFile('video', i)}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Upload progress */}
                                <UploadProgressBar progressData={uploadProgress.videos} label="Video Gallery Upload" />

                                {/* Existing gallery */}
                                {editFriend.video_gallery?.filter(Boolean).length > 0 && (
                                    <div className="fif-media-grid-x30sn">
                                        {editFriend.video_gallery.filter(Boolean).map((url, i) => (
                                            <div key={i} className="fif-media-item-x30sn">
                                                <video src={url} onClick={() => setPreviewMedia({type:'video', url})} style={{cursor:'pointer'}}/>
                                                <button type="button" className="fif-media-remove-x30sn" onClick={() => {
                                                    const newGal = [...editFriend.video_gallery];
                                                    newGal.splice(i, 1);
                                                    setEditFriend({...editFriend, video_gallery: newGal});
                                                }}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                        </div>
                        
                        <div style={{marginTop:20, display:'flex', justifyContent:'flex-end', gap:10}}>
                            <button type="button" className="fif-btn-x30sn" onClick={() => setEditFriend(null)}>Cancel</button>
                            <button type="submit" className="fif-btn-x30sn primary">Save Changes</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </>
  );
};

export default AIFriendsAdmin;