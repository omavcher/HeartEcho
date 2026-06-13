'use client';
import React, { useState, useEffect, useRef, useMemo } from "react";
import axios from "axios";
import {
  FaEdit, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle,
  FaSave, FaImage, FaFilm, FaUpload, FaSpinner, FaLink, FaTimes, FaGlobe, FaPlay,
  FaUsers
} from "react-icons/fa";
import api from "../../config/api";
import { applyWatermark } from "../../utils/mediaUtils";

// ------------------- CSS STYLES (Pure Black, Glassmorphism, Purple & Pink) -------------------
const styles = `
/* ROOT & THEME */
.alv-root {
  color: #fff;
  background-color: #030303;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: alv-fadeIn 0.4s ease;
}
@keyframes alv-fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.alv-header {
  padding: 28px 32px;
  background: linear-gradient(180deg, #070707 0%, #030303 100%);
  border-bottom: 1px solid #161616;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.alv-title h2 { 
  font-size: 26px; 
  font-weight: 800; 
  margin: 0; 
  letter-spacing: -0.5px;
  color: #fff; 
  display: flex;
  align-items: center;
  gap: 12px;
}
.alv-tagline { 
  color: #a78bfa; 
  margin: 6px 0 0; 
  font-size: 13px; 
  font-weight: 500; 
  display: flex;
  align-items: center;
  gap: 8px;
}

/* BUTTONS */
.alv-btn {
  display: flex; 
  align-items: center; 
  gap: 8px; 
  padding: 10px 20px; 
  border-radius: 10px;
  font-size: 13px; 
  font-weight: 600; 
  cursor: pointer; 
  border: 1px solid #222;
  background: #0c0c0c; 
  color: #eee; 
  transition: all 0.25s ease;
}
.alv-btn:hover:not(:disabled) { 
  border-color: #ff69b4; 
  color: #ff69b4; 
  background: rgba(255, 105, 180, 0.03);
  transform: translateY(-1px);
}
.alv-btn.primary {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.alv-btn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
  color: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.25);
}
.alv-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* KPI GRID */
.alv-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}
.alv-kpi-card {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  padding: 20px;
  display: flex; 
  align-items: center; 
  gap: 16px; 
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}
.alv-kpi-card:hover { 
  border-color: #262626; 
  transform: translateY(-3px); 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.alv-kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(167,139,250,0.02), transparent 60%);
  pointer-events: none;
}
.alv-kpi-icon {
  width: 46px; 
  height: 46px; 
  border-radius: 12px; 
  background: rgba(167, 139, 250, 0.08); 
  color: #a78bfa;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 20px;
  border: 1px solid rgba(167, 139, 250, 0.15);
}
.alv-kpi-info span { margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.8px; display: block; }
.alv-kpi-info strong { font-size: 24px; color: #fff; display: block; margin-top: 4px; font-weight: 800; }

/* INFLUENCER CARDS GRID */
.alv-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
  gap: 20px;
  padding: 0 32px 32px;
}
.alv-card {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  position: relative;
}
.alv-card:hover { 
  border-color: #ff69b4; 
  transform: translateY(-3px); 
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.alv-img-wrap {
  height: 180px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #161616;
}
.alv-img-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.4s ease;
}
.alv-card:hover .alv-img-wrap img {
  transform: scale(1.04);
}

.alv-status-badge {
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  backdrop-filter: blur(10px);
}
.alv-status-badge.active {
  background: rgba(0, 255, 136, 0.1);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.3);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.1);
}
.alv-status-badge.disabled {
  background: rgba(255, 255, 255, 0.05);
  color: #888;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.alv-info {
  padding: 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.alv-info h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.alv-info-tag {
  font-family: monospace;
  background: rgba(255,255,255,0.03);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #a1a1aa;
  align-self: flex-start;
  margin: 12px 0 18px;
  border: 1px solid rgba(255,255,255,0.05);
}

.alv-actions {
  margin-top: auto;
  display: flex;
  gap: 8px;
  border-top: 1px solid #161616;
  padding-top: 16px;
}
.alv-act-btn {
  flex: 1;
  height: 36px;
  border-radius: 8px;
  background: #0f0f0f;
  border: 1px solid #222;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 13px;
  font-weight: 600;
  gap: 6px;
}
.alv-act-btn:hover {
  transform: translateY(-1px);
}
.alv-act-btn.edit:hover { color: #ff69b4; border-color: rgba(255, 105, 180, 0.3); background: rgba(255, 105, 180, 0.04); }
.alv-act-btn.delete { width: 44px; flex: none; }
.alv-act-btn.delete:hover { color: #ff4444; border-color: rgba(255, 68, 68, 0.3); background: rgba(255, 68, 68, 0.04); }

/* WIZARD SETUP MODAL */
.alv-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: alv-fadeIn 0.25s ease;
}
.alv-modal-content {
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid #262626;
  border-radius: 20px;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  animation: alv-modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes alv-modalScale {
  from { transform: scale(0.9) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.alv-modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid #1a1a1a;
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #070707;
}
.alv-modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 800;
  color: #ff69b4;
}
.alv-modal-close {
  background: none;
  border: none;
  color: #888;
  cursor: pointer;
  transition: color 0.2s;
  display: flex;
  align-items: center;
}
.alv-modal-close:hover { color: #fff; }

/* TAB BAR WIZARD */
.alv-modal-tabs {
  display: flex;
  background: #090909;
  border-bottom: 1px solid #161616;
  padding: 0 12px;
}
.alv-tab-btn {
  padding: 14px 20px;
  background: none;
  border: none;
  color: #666;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
  display: flex;
  align-items: center;
  gap: 8px;
}
.alv-tab-btn:hover {
  color: #aaa;
}
.alv-tab-btn.active {
  color: #ff69b4;
  border-bottom-color: #ff69b4;
}

.alv-setup-form {
  padding: 24px;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.alv-form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 600px) { .alv-form-grid { grid-template-columns: 1fr; } }

.alv-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.alv-form-group.full {
  grid-column: span 2;
}
@media (max-width: 600px) { .alv-form-group.full { grid-column: span 1; } }

.alv-form-group label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.8px;
}
.alv-input {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  transition: all 0.25s ease;
}
.alv-input:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.15);
}
.alv-select {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.alv-select:focus {
  border-color: #ff69b4;
}

.alv-checkbox-wrap {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: rgba(255, 105, 180, 0.04);
  border: 1px solid rgba(255, 105, 180, 0.15);
  border-radius: 10px;
  cursor: pointer;
}
.alv-checkbox-wrap input {
  width: 18px;
  height: 18px;
  accent-color: #ff69b4;
  cursor: pointer;
}
.alv-checkbox-wrap span {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

/* WIZARD ACTIONS */
.alv-form-actions {
  padding: 16px 24px;
  background: #070707;
  border-top: 1px solid #1a1a1a;
  display: flex;
  justify-content: flex-end;
}

/* UPLOAD FIELDS (MEDIA FIELD REDESIGN) */
.media-field-ls {
  background: rgba(5,5,5,0.4);
  border: 1px solid #161616;
  border-radius: 12px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.media-label-ls {
  font-size: 11px !important;
  color: #666 !important;
  text-transform: uppercase !important;
  font-weight: 700 !important;
  letter-spacing: 0.8px !important;
  display: flex;
  align-items: center;
  gap: 6px;
}
.media-previews-ls {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.preview-thumb-ls {
  position: relative;
  width: 90px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #222;
  background: #000;
}
.thumb-media-ls {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cdn-tag-ls {
  position: absolute;
  bottom: 4px;
  left: 4px;
  background: rgba(0, 122, 255, 0.1) !important;
  color: #007aff !important;
  border: 1px solid rgba(0,122,255,0.2) !important;
  border-radius: 4px;
  font-size: 9px;
  font-weight: 700;
  padding: 1px 5px;
  display: flex;
  align-items: center;
  gap: 3px;
  backdrop-filter: blur(4px);
}
.pick-file-btn-ls {
  display: flex;
  align-items: center;
  gap: 6px;
  background: #0f0f0f !important;
  border: 1px solid #222 !important;
  color: #aaa !important;
  padding: 8px 14px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s !important;
}
.pick-file-btn-ls:hover:not(:disabled) {
  border-color: #ff69b4 !important;
  color: #ff69b4 !important;
  background: rgba(255,105,180,0.04) !important;
}
.pick-file-btn-ls:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.clear-file-btn-ls {
  display: flex;
  align-items: center;
  gap: 5px;
  background: rgba(239, 68, 68, 0.08) !important;
  border: 1px solid rgba(239, 68, 68, 0.2) !important;
  color: #f87171 !important;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s;
}
.clear-file-btn-ls:hover {
  background: rgba(239, 68, 68, 0.15) !important;
}

/* REACTION GRID IN FORM */
.alv-reactions-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
@media (max-width: 600px) { .alv-reactions-grid { grid-template-columns: 1fr; } }

/* LOADER & SPIN */
.alv-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}
.alv-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #222;
  border-top-color: #ff69b4;
  border-radius: 50%;
  animation: alv-spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes alv-spin { to { transform: rotate(360deg); } }
.upload-overlay-ls {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: #fff;
  font-size: 10px;
  font-weight: 600;
}
.upload-progress-ls {
  width: 70%;
  height: 4px;
  background: rgba(255,255,255,0.2);
  border-radius: 2px;
  overflow: hidden;
}
.upload-progress-bar-ls {
  height: 100%;
  background: linear-gradient(90deg, #ff69b4, #da22ff);
  border-radius: 2px;
  transition: width 0.2s ease;
}
`;

// ── Helper: upload one file directly to Cloudflare R2 ─────────────────────────
const uploadFileToR2 = async (file, folder, token, onProgress) => {
  const processedFile = await applyWatermark(file);

  const { data } = await axios.post(
    `${api.Url}/live-story/admin/presign`,
    { folder, filename: processedFile.name, contentType: processedFile.type },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!data.success) throw new Error("Failed to get upload URL");

  await axios.put(data.uploadUrl, processedFile, {
    headers: { "Content-Type": processedFile.type },
    onUploadProgress: (e) => {
      if (onProgress) onProgress(Math.round((e.loaded / e.total) * 100));
    },
  });

  return data.cdnUrl;
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
      setPreviews([]);
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
  };

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
                <video 
                  src={src} 
                  className="thumb-media-ls" 
                  muted 
                  playsInline 
                  controlsList="nodownload"
                  onContextMenu={(e) => e.preventDefault()}
                />
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
                  <video 
                    src={url} 
                    className="thumb-media-ls" 
                    muted 
                    playsInline 
                    controlsList="nodownload"
                    onContextMenu={(e) => e.preventDefault()}
                  />
                ) : (
                  <img src={url} className="thumb-media-ls" alt="saved" />
                )}
                <div className="cdn-tag-ls">
                  <FaLink /> CDN
                </div>
                {multiple && !uploading && (
                  <button type="button" className="clear-file-btn-ls" style={{ position: 'absolute', top: 2, right: 2, padding: 2, fontSize: 10, minWidth: 0 }} onClick={() => removeAt(i)}>
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
  const [activeFormTab, setActiveFormTab] = useState("profile"); // profile | idle | reactions
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
        setDbModels(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching AI Live models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    fetchModels(); 
  }, []);

  // --- STATS COMPUTATION ---
  const stats = useMemo(() => {
    const totalCount = dbModels.length;
    const activeCount = dbModels.filter(m => m.isActive !== false).length;
    const viewsCount = dbModels.reduce((acc, m) => acc + (m.views || 0), 0);
    const loopsCount = dbModels.reduce((acc, m) => acc + (m.idleVideos?.length || 0), 0);
    
    const actionsCount = dbModels.reduce((acc, m) => {
      let count = 0;
      if (m.actionVideos) {
        Object.values(m.actionVideos).forEach(arr => {
          if (Array.isArray(arr)) count += arr.length;
        });
      }
      return acc + count;
    }, 0);

    const femaleCount = dbModels.filter(m => m.gender === "female").length;
    const maleCount = totalCount - femaleCount;

    return {
      totalCount,
      activeCount,
      viewsCount,
      loopsCount,
      actionsCount,
      femaleCount,
      maleCount
    };
  }, [dbModels]);

  const openModal = (story = null) => {
    setActiveFormTab("profile");
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

  if (loading) {
    return (
      <div className="alv-loader">
        <style>{styles}</style>
        <div className="alv-spinner"></div>
        <p style={{ fontWeight: 600, color: '#666' }}>Loading AI Live Models…</p>
      </div>
    );
  }

  return (
    <div className="alv-root">
      <style>{styles}</style>

      {/* HEADER */}
      <header className="alv-header">
        <div className="alv-title">
          <h2>AI Live Studio Admin</h2>
          <p className="alv-tagline"><FaPlay /> Manage AI Live streams & watermark video CDN</p>
        </div>
        <button className="alv-btn primary" onClick={() => openModal(null)}>
          <FaPlus /> Add Influencer
        </button>
      </header>

      {/* KPI GRID */}
      <div className="alv-kpi-grid">
        <div className="alv-kpi-card">
          <div className="alv-kpi-icon"><FaUsers/></div>
          <div className="alv-kpi-info">
            <span>Total AI Models</span>
            <strong>{stats.totalCount}</strong>
          </div>
        </div>
        <div className="alv-kpi-card">
          <div className="alv-kpi-icon" style={{ color: '#00ff88', background: 'rgba(0,255,136,0.04)', borderColor: 'rgba(0,255,136,0.15)' }}><FaCheckCircle /></div>
          <div className="alv-kpi-info">
            <span>Active Live</span>
            <strong>{stats.activeCount}</strong>
          </div>
        </div>
        <div className="alv-kpi-card">
          <div className="alv-kpi-icon" style={{ color: '#ffea00', background: 'rgba(255,234,0,0.04)', borderColor: 'rgba(255,234,0,0.15)' }}><FaGlobe /></div>
          <div className="alv-kpi-info">
            <span>Stream Views</span>
            <strong>{stats.viewsCount.toLocaleString()}</strong>
          </div>
        </div>
        <div className="alv-kpi-card">
          <div className="alv-kpi-icon" style={{ color: '#ff69b4', background: 'rgba(255,105,180,0.04)', borderColor: 'rgba(255,105,180,0.15)' }}><FaFilm /></div>
          <div className="alv-kpi-info">
            <span>Idle Loop Videos</span>
            <strong>{stats.loopsCount} clips</strong>
          </div>
        </div>
        <div className="alv-kpi-card">
          <div className="alv-kpi-icon" style={{ color: '#007aff', background: 'rgba(0,122,255,0.04)', borderColor: 'rgba(0,122,255,0.15)' }}><FaPlay /></div>
          <div className="alv-kpi-info">
            <span>Action Reactions</span>
            <strong>{stats.actionsCount} clips</strong>
          </div>
        </div>
        <div className="alv-kpi-card">
          <div className="alv-kpi-icon" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.04)', borderColor: 'rgba(167,139,250,0.15)' }}><FaUsers /></div>
          <div className="alv-kpi-info">
            <span>Gender Ratio</span>
            <strong>{stats.femaleCount} F / {stats.maleCount} M</strong>
          </div>
        </div>
      </div>

      {/* STREAMERS GRID */}
      <div className="alv-grid">
        {dbModels.map((story) => (
          <div className="alv-card" key={story._id}>
            <div className="alv-img-wrap">
              <img 
                src={story.avatar || "https://via.placeholder.com/300x160"} 
                alt={story.name} 
                style={{ opacity: story.isActive === false ? 0.4 : 1 }} 
              />
              <div className={`alv-status-badge ${story.isActive !== false ? "active" : "disabled"}`}>
                {story.isActive !== false ? <FaCheckCircle /> : <FaTimesCircle />}
                <span>{story.isActive !== false ? "Live" : "Offline"}</span>
              </div>
            </div>
            
            <div className="alv-info">
              <h3>{story.name}</h3>
              <div className="alv-info-tag">
                ID: {story.id} • Views: {(story.views || 0).toLocaleString()} • Age: {story.age || 'N/A'}
              </div>
              
              <div className="alv-actions">
                <button className="alv-act-btn edit" onClick={() => openModal(story)}>
                  <FaEdit /> Config Live Studio
                </button>
                <button className="alv-act-btn delete" onClick={() => handleDelete(story._id)} title="Delete AI Influencer">
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
        {dbModels.length === 0 && (
          <div style={{ color: "#444", padding: "40px", gridColumn: 'span 3', textAlign: 'center', fontWeight: 600 }}>
            No AI Live Streamers configured. Add your first influencer!
          </div>
        )}
      </div>

      {/* CONFIGURATION MODAL */}
      {isModalOpen && (
        <div className="alv-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="alv-modal-content" onClick={e => e.stopPropagation()}>
            
            <div className="alv-modal-header">
              <h3>{formData._id ? "Edit AI Studio Config" : "Create AI Influencer"}</h3>
              <button className="alv-modal-close" onClick={() => setIsModalOpen(false)}>
                <FaTimes size={18} />
              </button>
            </div>

            {/* TAB SELECTOR WIZARD */}
            <div className="alv-modal-tabs">
              <button 
                type="button" 
                className={`alv-tab-btn ${activeFormTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveFormTab("profile")}
              >
                <FaImage /> Profile & Identity
              </button>
              <button 
                type="button" 
                className={`alv-tab-btn ${activeFormTab === "idle" ? "active" : ""}`}
                onClick={() => setActiveFormTab("idle")}
              >
                <FaFilm /> Idle loops ({formData.idleVideos?.length || 0})
              </button>
              <button 
                type="button" 
                className={`alv-tab-btn ${activeFormTab === "reactions" ? "active" : ""}`}
                onClick={() => setActiveFormTab("reactions")}
              >
                <FaPlay /> Reaction Clips
              </button>
            </div>

            <form onSubmit={handleSubmit} className="alv-setup-form">
              {/* TAB 1: Profile & Identity */}
              {activeFormTab === "profile" && (
                <div className="alv-form-grid">
                  <div className="alv-form-group">
                    <label>Unique ID identifier (e.g. janvi)</label>
                    <input 
                      type="text" 
                      name="id" 
                      className="alv-input" 
                      value={formData.id} 
                      onChange={handleInputChange} 
                      required 
                      disabled={!!formData._id}
                    />
                  </div>
                  <div className="alv-form-group">
                    <label>Name</label>
                    <input 
                      type="text" 
                      name="name" 
                      className="alv-input" 
                      value={formData.name} 
                      onChange={handleInputChange} 
                      required 
                    />
                  </div>
                  <div className="alv-form-group">
                    <label>Tag description (e.g. Hot, Desi, Manipuri)</label>
                    <input 
                      type="text" 
                      name="tag" 
                      className="alv-input" 
                      value={formData.tag} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="alv-form-group">
                    <label>Age</label>
                    <input 
                      type="number" 
                      name="age" 
                      className="alv-input" 
                      value={formData.age} 
                      onChange={handleInputChange} 
                    />
                  </div>
                  <div className="alv-form-group">
                    <label>Gender</label>
                    <select 
                      name="gender" 
                      className="alv-select" 
                      value={formData.gender} 
                      onChange={handleInputChange}
                    >
                      <option value="female">Female</option>
                      <option value="male">Male</option>
                    </select>
                  </div>
                  <div className="alv-form-group" style={{ justifyContent: 'center' }}>
                    <div 
                      className="alv-checkbox-wrap" 
                      onClick={() => setFormData(p => ({ ...p, isActive: !p.isActive }))}
                    >
                      <input 
                        type="checkbox" 
                        name="isActive" 
                        checked={formData.isActive} 
                        onChange={(e) => setFormData(p => ({ ...p, isActive: e.target.checked }))} 
                        onClick={e => e.stopPropagation()}
                      />
                      <span>Active for Live Streaming</span>
                    </div>
                  </div>
                  
                  <div className="alv-form-group full">
                    <MediaUploadField
                      label="Avatar Cover Photo (Image)"
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
                </div>
              )}

              {/* TAB 2: Idle Loops */}
              {activeFormTab === "idle" && (
                <div className="alv-form-group full">
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '10px', lineHeight: 1.5 }}>
                    Idle loop videos are streamed in a continuous, random cycle while the influencer is waiting for user chat actions. Upload short (e.g. 5-15s) loopable vertical videos.
                  </div>
                  <MediaUploadField
                    label="Idle Loop Video Tracks"
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
              )}

              {/* TAB 3: Action Reaction Clips */}
              {activeFormTab === "reactions" && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px', lineHeight: 1.5 }}>
                    Configure target reaction clips for users triggering interactive live streaming events. Videos will play once, then return to the idle loops.
                  </div>
                  <div className="alv-reactions-grid">
                    <div className="alv-form-group">
                      <MediaUploadField
                        label="Wave Reaction Video"
                        icon={<FaFilm />} 
                        folder={`ai-live/${formData.id || 'new'}/wave`} 
                        accept="video/*" 
                        multiple={true}
                        value={formData.actionVideos?.wave} 
                        onChange={(urls) => setActionVideo('wave', urls)}
                        onUploadStateChange={handleUploadStateChange}
                      />
                    </div>
                    <div className="alv-form-group">
                      <MediaUploadField
                        label="Dance Reaction Video"
                        icon={<FaFilm />} 
                        folder={`ai-live/${formData.id || 'new'}/dance`} 
                        accept="video/*" 
                        multiple={true}
                        value={formData.actionVideos?.dance} 
                        onChange={(urls) => setActionVideo('dance', urls)}
                        onUploadStateChange={handleUploadStateChange}
                      />
                    </div>
                    <div className="alv-form-group">
                      <MediaUploadField
                        label="Naughty Reaction Video"
                        icon={<FaFilm />} 
                        folder={`ai-live/${formData.id || 'new'}/naughty`} 
                        accept="video/*" 
                        multiple={true}
                        value={formData.actionVideos?.naughty} 
                        onChange={(urls) => setActionVideo('naughty', urls)}
                        onUploadStateChange={handleUploadStateChange}
                      />
                    </div>
                    <div className="alv-form-group">
                      <MediaUploadField
                        label="Kiss Reaction Video"
                        icon={<FaFilm />} 
                        folder={`ai-live/${formData.id || 'new'}/kiss`} 
                        accept="video/*" 
                        multiple={true}
                        value={formData.actionVideos?.kiss} 
                        onChange={(urls) => setActionVideo('kiss', urls)}
                        onUploadStateChange={handleUploadStateChange}
                      />
                    </div>
                    <div className="alv-form-group">
                      <MediaUploadField
                        label="Pose Reaction Video"
                        icon={<FaFilm />} 
                        folder={`ai-live/${formData.id || 'new'}/pose`} 
                        accept="video/*" 
                        multiple={true}
                        value={formData.actionVideos?.pose} 
                        onChange={(urls) => setActionVideo('pose', urls)}
                        onUploadStateChange={handleUploadStateChange}
                      />
                    </div>
                    <div className="alv-form-group">
                      <MediaUploadField
                        label="Hot Show Reaction Video"
                        icon={<FaFilm />} 
                        folder={`ai-live/${formData.id || 'new'}/hot_show`} 
                        accept="video/*" 
                        multiple={true}
                        value={formData.actionVideos?.hot_show} 
                        onChange={(urls) => setActionVideo('hot_show', urls)}
                        onUploadStateChange={handleUploadStateChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SAVE / FOOTER ACTIONS */}
              <div className="alv-form-actions" style={{ padding: '16px 0 0' }}>
                <button 
                  type="submit" 
                  className="alv-btn primary" 
                  disabled={saving || activeUploads > 0}
                >
                  {saving ? (
                    <><FaSpinner className="spin-ls" /> Saving…</>
                  ) : activeUploads > 0 ? (
                    <><FaSpinner className="spin-ls" /> Uploading ({activeUploads})…</>
                  ) : (
                    <><FaSave /> Save configuration</>
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
