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
  border: 2px dashed #333; background: #0a0a0a; border-radius: 12px; padding: 20px; text-align: center;
  transition: 0.2s; position: relative;
}
.fif-upload-box-x30sn:hover { border-color: #555; background: #111; }
.fif-upload-btn-x30sn {
  background: #222; color: #fff; border: 1px solid #333; padding: 8px 16px; border-radius: 6px; cursor: pointer; font-size: 12px; margin-top: 10px; display: inline-flex; align-items: center; gap: 6px;
}
.fif-media-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(80px, 1fr)); gap: 10px; margin-top: 15px;
}
.fif-media-item-x30sn {
  position: relative; aspect-ratio: 1; border-radius: 8px; overflow: hidden; border: 1px solid #333;
}
.fif-media-item-x30sn img, .fif-media-item-x30sn video { width: 100%; height: 100%; object-fit: cover; }
.fif-media-remove-x30sn {
  position: absolute; top: 2px; right: 2px; background: rgba(0,0,0,0.7); color: #ff4444; border: none;
  width: 20px; height: 20px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 10px;
}

/* PROGRESS BAR */
.fif-progress-x30sn { height: 4px; background: #222; border-radius: 2px; overflow: hidden; margin-top: 10px; }
.fif-progress-fill-x30sn { height: 100%; background: #ff69b4; transition: width 0.3s ease; }

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

  const fileInputRef = useRef({ avatar: null, motionVideo: null, images: null, videos: null });

  const cloudinaryConfig = {
    cloudName: 'dieklmzt6', 
    uploadPreset: 'heartec_ai_compins_data_bolOm',
    apiUrl: 'https://api.cloudinary.com/v1_1'
  };

  const colors = useMemo(() => ["#4facfe", "#ff69b4", "#00F260", "#ff3b30", "#333333"], []);

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  // --- Upload Logic ---
  const uploadToCloudinary = async (file, type = 'image', onProgress = null) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('cloud_name', cloudinaryConfig.cloudName);
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.upload.addEventListener('progress', (event) => {
        if (onProgress && event.lengthComputable) {
          const percentComplete = Math.round((event.loaded / event.total) * 100);
          onProgress(percentComplete);
        }
      });
      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(JSON.parse(xhr.responseText).secure_url);
        } else { reject(new Error('Upload failed')); }
      });
      xhr.addEventListener('error', () => reject(new Error('Upload failed')));
      xhr.open('POST', `${cloudinaryConfig.apiUrl}/${cloudinaryConfig.cloudName}/${type === 'image' ? 'image' : 'video'}/upload`);
      xhr.send(formData);
    });
  };

  const handleFileUpload = async (event, field, index = null) => {
    const file = event.target.files[0];
    if (!file) return;
    const isImage = file.type.startsWith('image/');
    setUploading({ status: 'uploading', type: 'single', field, index, progress: 0, total: 1, completed: 0, errors: [] });

    try {
      const uploadUrl = await uploadToCloudinary(file, isImage ? 'image' : 'video', (progress) => {
        setUploading(prev => ({ ...prev, progress }));
      });
      
      if (field === 'avatar_img' || field === 'avatar_motion_video') {
        setEditFriend(prev => ({ ...prev, [field]: uploadUrl }));
      } else if (field === 'img_gallery' && index !== null) {
        setEditFriend(prev => ({ ...prev, img_gallery: prev.img_gallery.map((item, i) => i === index ? uploadUrl : item) }));
      } else if (field === 'video_gallery' && index !== null) {
        setEditFriend(prev => ({ ...prev, video_gallery: prev.video_gallery.map((item, i) => i === index ? uploadUrl : item) }));
      }
      setUploading(prev => ({ ...prev, status: 'completed', progress: 100 }));
      setTimeout(() => setUploading({ status: 'idle', type: null, field: null, index: null, progress: 0, total: 0, completed: 0, errors: [] }), 1500);
    } catch (error) {
      setUploading(prev => ({ ...prev, status: 'error' }));
      alert('Upload failed.');
    }
  };

  const uploadMultipleFiles = async (files, type) => {
    const urls = [];
    const errors = [];
    setUploading({ status: 'uploading', type: 'batch', field: type === 'image' ? 'img_gallery' : 'video_gallery', progress: 0, total: files.length, completed: 0, errors: [] });

    for (let i = 0; i < files.length; i++) {
      try {
        const url = await uploadToCloudinary(files[i], type, (p) => {
           // simple progress approximation
        });
        urls.push(url);
        setUploading(prev => ({ ...prev, completed: i + 1, progress: Math.round(((i + 1) / files.length) * 100) }));
      } catch (e) { errors.push(files[i].name); }
    }
    setUploading(prev => ({ ...prev, status: errors.length ? 'error' : 'completed' }));
    return { urls, errors };
  };

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
                            
                            {/* UPLOAD SECTIONS */}
                            <div className="fif-form-group-x30sn full">
                                <label className="fif-label-x30sn">Avatar</label>
                                <div style={{display:'flex', gap:10}}>
                                    <input className="fif-input-field-x30sn" value={editFriend.avatar_img} onChange={e => setEditFriend({...editFriend, avatar_img:e.target.value})} style={{flex:1}} />
                                    <button type="button" className="fif-btn-x30sn" onClick={() => fileInputRef.current.avatar.click()}>
                                        <FaCloudUploadAlt/>
                                    </button>
                                </div>
                                <input type="file" hidden ref={el => fileInputRef.current.avatar = el} onChange={e => handleFileUpload(e, 'avatar_img')} accept="image/*" />
                                {uploading.status === 'uploading' && uploading.field === 'avatar_img' && <div className="fif-progress-x30sn"><div className="fif-progress-fill-x30sn" style={{width:`${uploading.progress}%`}}/></div>}
                            </div>

                            <div className="fif-form-group-x30sn full">
                                <label className="fif-label-x30sn">Image Gallery</label>
                                <div className="fif-upload-box-x30sn">
                                    <p style={{margin:0, color:'#666', fontSize:12}}>Drag & drop images or use button</p>
                                    <input type="file" hidden multiple ref={el => fileInputRef.current.images = el} onChange={e => handleBatchFileSelect('image', e)} accept="image/*" />
                                    <button type="button" className="fif-upload-btn-x30sn" onClick={() => fileInputRef.current.images.click()}><FaPlus/> Select</button>
                                    
                                    {batchUploadFiles.images.length > 0 && (
                                        <button type="button" className="fif-upload-btn-x30sn" style={{background:'#ff69b4', color:'#000', border:'none', marginLeft:10}} onClick={() => handleBatchUpload('image')}>
                                            {uploading.status === 'uploading' ? 'Uploading...' : 'Upload All'}
                                        </button>
                                    )}
                                </div>
                                <div className="fif-media-grid-x30sn">
                                    {editFriend.img_gallery?.map((url, i) => (
                                        <div key={i} className="fif-media-item-x30sn">
                                            <img src={url} alt=""/>
                                            <button type="button" className="fif-media-remove-x30sn" onClick={() => {
                                                const newGal = [...editFriend.img_gallery];
                                                newGal.splice(i, 1);
                                                setEditFriend({...editFriend, img_gallery: newGal});
                                            }}>×</button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="fif-form-group-x30sn full">
                                <label className="fif-label-x30sn">Video Gallery</label>
                                <div className="fif-upload-box-x30sn">
                                    <p style={{margin:0, color:'#666', fontSize:12}}>Upload MP4s</p>
                                    <input type="file" hidden multiple ref={el => fileInputRef.current.videos = el} onChange={e => handleBatchFileSelect('video', e)} accept="video/*" />
                                    <button type="button" className="fif-upload-btn-x30sn" onClick={() => fileInputRef.current.videos.click()}><FaPlus/> Select</button>
                                    
                                    {batchUploadFiles.videos.length > 0 && (
                                        <button type="button" className="fif-upload-btn-x30sn" style={{background:'#ff69b4', color:'#000', border:'none', marginLeft:10}} onClick={() => handleBatchUpload('video')}>
                                            {uploading.status === 'uploading' ? 'Uploading...' : 'Upload All'}
                                        </button>
                                    )}
                                </div>
                                <div className="fif-media-grid-x30sn">
                                    {editFriend.video_gallery?.map((url, i) => (
                                        <div key={i} className="fif-media-item-x30sn">
                                            <video src={url} />
                                            <button type="button" className="fif-media-remove-x30sn" onClick={() => {
                                                const newGal = [...editFriend.video_gallery];
                                                newGal.splice(i, 1);
                                                setEditFriend({...editFriend, video_gallery: newGal});
                                            }}>×</button>
                                        </div>
                                    ))}
                                </div>
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