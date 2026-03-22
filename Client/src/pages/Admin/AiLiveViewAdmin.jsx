'use client';
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaEdit, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle,
  FaSave, FaImage, FaFilm, FaUpload, FaSpinner, FaLink, FaTimes
} from "react-icons/fa";
import api from "../../config/api";
import "./LiveStoriesAdmin.css"; // Reusing the same CSS

// ── Helper: upload one file directly to Cloudflare R2 ─────────────────────────
const uploadFileToR2 = async (file, folder, token, onProgress) => {
  const { data } = await axios.post(
    `${api.Url}/live-story/admin/presign`,
    { folder, filename: file.name, contentType: file.type },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!data.success) throw new Error("Failed to get upload URL");

  await axios.put(data.uploadUrl, file, {
    headers: { "Content-Type": file.type },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  return data.cdnUrl; // Final public CDN URL
};

// ── MediaUploadField ───────────────────────────────────────────────────────────
const MediaUploadField = ({ label, icon, folder, accept, multiple, value, onChange, onClear, onUploadStateChange }) => {
  const inputRef = useRef(null);
  const [previews, setPreviews] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  
  useEffect(() => {
    if (!value || (multiple && value.length === 0) || (!multiple && !value)) {
      setPreviews([]);
      setProgress({});
    }
  }, [value, multiple]);

  const handleFiles = async (selectedFiles) => {
    const token = localStorage.getItem("token");
    const filesArr = Array.from(selectedFiles);
    if (!filesArr.length) return;

    const blobUrls = filesArr.map((f) => URL.createObjectURL(f));
    setPreviews(blobUrls);
    
    setUploading(true);
    if (onUploadStateChange) onUploadStateChange(true);
    
    setProgress({});

    try {
      const urls = [];
      for (let i = 0; i < filesArr.length; i++) {
        const url = await uploadFileToR2(filesArr[i], folder, token, (pct) =>
          setProgress((p) => ({ ...p, [i]: pct }))
        );
        urls.push(url);
      }

      if (multiple) {
        onChange([...(value || []), ...urls]);
      } else {
        onChange(urls[0]);
      }
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please check your internet or bucket settings.");
    } finally {
      setUploading(false);
      setPreviews([]); // remove local previews since it's uploaded
      if (onUploadStateChange) onUploadStateChange(false);
    }
  };

  const clearAll = () => {
    setPreviews([]);
    setProgress({});
    if (inputRef.current) inputRef.current.value = "";
    if (onClear) onClear();
    onChange(multiple ? [] : null);
  };

  const removeAt = (indexToRemove) => {
    if (!multiple) return;
    const newVal = [...(value || [])];
    newVal.splice(indexToRemove, 1);
    onChange(newVal);
  }

  const existingUrls = value
    ? multiple
      ? Array.isArray(value) ? value : [value]
      : [value]
    : [];

  const isVideo = accept && accept.includes("video");
  const showPreviews = previews.length > 0 || existingUrls.length > 0;

  return (
    <div className="media-field-ls">
      <label className="media-label-ls">
        {icon} {label}
      </label>

      {showPreviews && (
        <div className="media-previews-ls">
          {previews.map((src, i) => (
            <div className="preview-thumb-ls" key={`new-${i}`}>
              {isVideo ? (
                <video src={src} className="thumb-media-ls" muted playsInline />
              ) : (
                <img src={src} className="thumb-media-ls" alt="preview" />
              )}
              {uploading && (
                <div className="upload-overlay-ls">
                  <div className="upload-progress-ls">
                    <div
                      className="upload-progress-bar-ls"
                      style={{ width: `${progress[i] || 0}%` }}
                    />
                  </div>
                  <span>{progress[i] || 0}%</span>
                </div>
              )}
            </div>
          ))}

          {previews.length === 0 &&
            existingUrls.map((url, i) => (
              <div className="preview-thumb-ls existing-ls" key={`existing-${i}`}>
                {isVideo ? (
                  <video src={url} className="thumb-media-ls" muted playsInline />
                ) : (
                  <img src={url} className="thumb-media-ls" alt="saved" />
                )}
                <div className="cdn-tag-ls">
                  <FaLink /> CDN
                </div>
                {multiple && !uploading && (
                  <button type="button" className="clear-file-btn-ls" style={{position:'absolute', top: 2, right: 2, padding: 2, fontSize: 10, minWidth:0}} onClick={() => removeAt(i)}>
                    <FaTimes />
                  </button>
                )}
              </div>
            ))}
        </div>
      )}

      <div className="media-actions-ls">
        <button
          type="button"
          className="pick-file-btn-ls"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <>
              <FaSpinner className="spin-ls" /> Uploading…
            </>
          ) : (
            <>
              <FaUpload /> {multiple ? "Add Files" : (showPreviews ? "Replace" : "Choose File")}
            </>
          )}
        </button>
        {existingUrls.length > 0 && !uploading && !multiple && (
          <button type="button" className="clear-file-btn-ls" onClick={clearAll}>
            <FaTimes /> Clear
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        style={{ display: "none" }}
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const AiLiveViewAdmin = () => {
  const [dbModels, setDbModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);

  const handleUploadStateChange = (isUploading) => {
    setActiveUploads(prev => isUploading ? prev + 1 : Math.max(0, prev - 1));
  };

  const [formData, setFormData] = useState({
    _id: null, id: "", name: "", tag: "", age: "", gender: "female",
    avatar: null, isActive: true, views: 0,
    idleVideos: [],
    actionVideos: {
      wave: [], dance: [], naughty: [], kiss: [], pose: [], hot_show: []
    }
  });

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api.Url}/ai-live`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) {
        // Fallback to empty array if no data
        setDbModels(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching AI Live models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const openModal = (story = null) => {
    if (story) {
      setFormData({
        _id: story._id,
        id: story.id || "",
        name: story.name || "",
        tag: story.tag || "",
        age: story.age || "",
        gender: story.gender || "female",
        avatar: story.avatar || null,
        isActive: story.isActive !== false,
        idleVideos: story.idleVideos || [],
        actionVideos: story.actionVideos || {
          wave: [], dance: [], naughty: [], kiss: [], pose: [], hot_show: []
        }
      });
    } else {
      setFormData({
        _id: null, id: "", name: "", tag: "", age: "", gender: "female",
        avatar: null, isActive: true, idleVideos: [],
        actionVideos: {
          wave: [], dance: [], naughty: [], kiss: [], pose: [], hot_show: []
        }
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const setActionVideo = (action, urls) => {
    setFormData(prev => ({
      ...prev,
      actionVideos: {
        ...prev.actionVideos,
        [action]: urls
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...formData };
      
      let response;
      if (formData._id) {
        response = await axios.put(`${api.Url}/ai-live/${formData._id}`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        });
      } else {
        response = await axios.post(`${api.Url}/ai-live`, payload, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json"
          }
        });
      }

      if (response.data.success) {
        setIsModalOpen(false);
        fetchModels();
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save configuration.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (deleteId) => {
    if (!window.confirm("Are you sure you want to delete this AI Live Influencer?")) return;
    try {
      const response = await axios.delete(`${api.Url}/ai-live/${deleteId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) fetchModels();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) return <div className="loading-state">Loading AI Live Models…</div>;

  return (
    <div className="live-stories-admin-container">
      <div className="admin-header-ls">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>AI Live Studio Admin</h2>
            <p>Manage AI Live streaming influencers directly via Cloudflare R2 CDN</p>
          </div>
          <button className="sync-btn-ls" style={{ background: "#3b82f6" }} onClick={() => openModal(null)}>
            <FaPlus /> Add Influencer
          </button>
        </div>
      </div>

      <div className="stories-grid-ls">
        {dbModels.map((story) => (
          <div className="story-card-ls configured" key={story._id}>
            <div className="story-image-ls">
              <img src={story.avatar || "https://via.placeholder.com/300x160"} alt={story.name} style={{ opacity: story.isActive === false ? 0.5 : 1 }} />
              <div className={`status-badge-ls ${story.isActive !== false ? "active" : ""}`} style={{ background: story.isActive === false ? '#666' : ''}}>
                {story.isActive !== false ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{story.isActive !== false ? "Live" : "Disabled"}</span>
              </div>
            </div>
            <div className="story-info-ls">
              <h3>{story.name}</h3>
              <span className="slug-tag-ls">ID: {story.id} • Views: {story.views || 0}</span>
              <div className="story-actions-ls">
                <button className="edit-btn-ls" onClick={() => openModal(story)}>
                  <FaEdit /> Edit
                </button>
                <button className="del-btn-ls" onClick={() => handleDelete(story._id)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
        {dbModels.length === 0 && (
          <div style={{ color: "#aaa", padding: "20px" }}>No AI Influencers found. Create one!</div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay-ls" style={{ zIndex: 1000 }}>
          <div className="modal-content-ls glass-panel-ls" style={{ maxWidth: 840, maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="modal-header-ls">
              <h3>{formData._id ? "Edit AI Influencer" : "Add AI Influencer"}</h3>
              <button className="close-btn-ls" onClick={() => setIsModalOpen(false)}>
                <FaTimesCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="setup-form-ls">
              {/* ── Text fields ── */}
              <div className="form-group-ls half-ls">
                <label>Unique ID (e.g. janvi)</label>
                <input type="text" name="id" value={formData.id} onChange={handleInputChange} required />
              </div>
              <div className="form-group-ls half-ls">
                <label>Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required />
              </div>
              <div className="form-group-ls half-ls">
                <label>Tag (e.g. Lifestyle)</label>
                <input type="text" name="tag" value={formData.tag} onChange={handleInputChange} />
              </div>
              <div className="form-group-ls half-ls">
                <label>Age</label>
                <input type="number" name="age" value={formData.age} onChange={handleInputChange} />
              </div>
              <div className="form-group-ls half-ls">
                <label>Gender</label>
                <select name="gender" value={formData.gender} onChange={handleInputChange} style={{background:'#111', color:'#fff', padding:10, borderRadius:8, width:'100%', border:'1px solid #333'}}>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                </select>
              </div>
              <div className="form-group-ls full-ls" style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 10, background: 'rgba(255,105,180,0.1)', borderRadius: 8, border: '1px solid #ff69b4' }}>
                <input type="checkbox" name="isActive" checked={formData.isActive} onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} style={{ width: 20, height: 20, accentColor: '#ff69b4' }} />
                <label style={{ fontSize: 14, fontWeight: 'bold', margin: 0, color: '#fff' }}>Enable this AI Influencer for Live View</label>
              </div>
              
              <div className="form-group-ls full-ls">
                <MediaUploadField
                  label="Avatar Photo"
                  icon={<FaImage />}
                  folder={`ai-live/${formData.id || 'new'}`}
                  accept="image/*"
                  multiple={false}
                  value={formData.avatar}
                  onChange={(url) => setFormData(p => ({ ...p, avatar: url }))}
                  onClear={() => setFormData(p => ({ ...p, avatar: null }))}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>

              {/* ── Media Uploads ── */}
              <div className="form-group-ls full-ls" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10 }}>
                <label style={{ color: "#b862ff" }}>Idle Videos (Loops randomly)</label>
              </div>

              <div className="form-group-ls full-ls">
                <MediaUploadField
                  label="Idle Loop Videos (Add multiple)"
                  icon={<FaFilm />}
                  folder={`ai-live/${formData.id || 'new'}/idle`}
                  accept="video/*"
                  multiple={true}
                  value={formData.idleVideos}
                  onChange={(urls) => setFormData(p => ({ ...p, idleVideos: urls }))}
                  onClear={() => setFormData(p => ({ ...p, idleVideos: [] }))}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>

              <div className="form-group-ls full-ls" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10 }}>
                <label style={{ color: "#b862ff" }}>Action Reaction Videos</label>
              </div>

              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Wave"
                  icon={<FaFilm />} folder={`ai-live/${formData.id || 'new'}/wave`} accept="video/*" multiple={true}
                  value={formData.actionVideos?.wave} onChange={(urls) => setActionVideo('wave', urls)}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>
              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Dance"
                  icon={<FaFilm />} folder={`ai-live/${formData.id || 'new'}/dance`} accept="video/*" multiple={true}
                  value={formData.actionVideos?.dance} onChange={(urls) => setActionVideo('dance', urls)}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>
              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Naughty"
                  icon={<FaFilm />} folder={`ai-live/${formData.id || 'new'}/naughty`} accept="video/*" multiple={true}
                  value={formData.actionVideos?.naughty} onChange={(urls) => setActionVideo('naughty', urls)}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>
              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Kiss"
                  icon={<FaFilm />} folder={`ai-live/${formData.id || 'new'}/kiss`} accept="video/*" multiple={true}
                  value={formData.actionVideos?.kiss} onChange={(urls) => setActionVideo('kiss', urls)}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>
              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Pose"
                  icon={<FaFilm />} folder={`ai-live/${formData.id || 'new'}/pose`} accept="video/*" multiple={true}
                  value={formData.actionVideos?.pose} onChange={(urls) => setActionVideo('pose', urls)}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>
              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Hot Show"
                  icon={<FaFilm />} folder={`ai-live/${formData.id || 'new'}/hot_show`} accept="video/*" multiple={true}
                  value={formData.actionVideos?.hot_show} onChange={(urls) => setActionVideo('hot_show', urls)}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>


              <div className="form-actions-ls full-ls" style={{marginTop: 20}}>
                <button 
                  type="submit" 
                  className="save-btn-ls" 
                  disabled={saving || activeUploads > 0}
                >
                  {saving ? (
                    <><FaSpinner className="spin-ls" /> Saving…</>
                  ) : activeUploads > 0 ? (
                    <><FaSpinner className="spin-ls" /> Uploading files ({activeUploads})…</>
                  ) : (
                    <><FaSave /> Save Influencer</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AiLiveViewAdmin;
