'use client';
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import {
  FaEdit, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle,
  FaSave, FaImage, FaFilm, FaUpload, FaSpinner, FaLink, FaTimes
} from "react-icons/fa";
import api from "../../config/api";
import "./LiveStoriesAdmin.css";

const CDN = "https://cdn.heartecho.in";

// ── Helper: upload one file directly to Cloudflare R2 ─────────────────────────
const uploadFileToR2 = async (file, folder, token, onProgress) => {
  // 1. Get a pre-signed PUT URL from our backend
  const { data } = await axios.post(
    `${api.Url}/live-story/admin/presign`,
    { folder, filename: file.name, contentType: file.type },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  if (!data.success) throw new Error("Failed to get upload URL");

  // 2. PUT the file directly to R2
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
  const [previews, setPreviews] = useState([]); // local blob URLs for instant preview
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState({});
  const [uploadedUrls, setUploadedUrls] = useState(multiple ? [] : null); // final CDN URLs

  // Reset when parent clears
  useEffect(() => {
    if (!value || (multiple && value.length === 0) || (!multiple && !value)) {
      setPreviews([]);
      setUploadedUrls(multiple ? [] : null);
      setProgress({});
    }
  }, [value, multiple]);

  const handleFiles = async (selectedFiles) => {
    const token = localStorage.getItem("token");
    const filesArr = Array.from(selectedFiles);
    if (!filesArr.length) return;

    // Show instant local previews
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

      const finalVal = multiple ? urls : urls[0];
      setUploadedUrls(finalVal);
      onChange(finalVal);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Upload failed. Please check your internet or bucket CORS settings.");
      setPreviews([]);
      setUploadedUrls(multiple ? [] : null);
    } finally {
      setUploading(false);
      if (onUploadStateChange) onUploadStateChange(false);
    }
  };

  const clearAll = () => {
    setPreviews([]);
    setUploadedUrls(multiple ? [] : null);
    setProgress({});
    if (inputRef.current) inputRef.current.value = "";
    if (onClear) onClear();
    onChange(multiple ? [] : null);
  };

  // Existing CDN URL when editing
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
          {/* New local previews (uploading) */}
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
              {!uploading && uploadedUrls && (
                <div className="upload-done-ls">
                  <FaCheckCircle />
                </div>
              )}
            </div>
          ))}

          {/* Existing saved CDN URLs (when editing) */}
          {previews.length === 0 &&
            existingUrls.map((url, i) => (
              <div className="preview-thumb-ls existing-ls" key={`existing-${i}`}>
                {isVideo ? (
                  <video src={url} className="thumb-media-ls" muted playsInline controls />
                ) : (
                  <img src={url} className="thumb-media-ls" alt="saved" />
                )}
                <div className="cdn-tag-ls">
                  <FaLink /> CDN
                </div>
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
              <FaUpload /> {showPreviews ? "Replace" : "Choose File"}
            </>
          )}
        </button>
        {showPreviews && !uploading && (
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
const LiveStoriesAdmin = () => {
  const [dbModels, setDbModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeUploads, setActiveUploads] = useState(0);

  const handleUploadStateChange = (isUploading) => {
    setActiveUploads(prev => isUploading ? prev + 1 : Math.max(0, prev - 1));
  };


  const [formData, setFormData] = useState({
    slug: "", title: "", description: "", category: "",
    views: "", storyInText: "", role: "", setting: "", instruction: ""
  });

  // Uploaded CDN URL state (set by MediaUploadField after direct R2 upload)
  const [mediaUrls, setMediaUrls] = useState({
    poster: null,
    banner: null,
    story_movie: null,
    chatting: []
  });

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api.Url}/live-story/admin/models`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) setDbModels(response.data.models);
    } catch (error) {
      console.error("Error fetching live story models:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const openModal = (story = null) => {
    if (story) {
      setFormData({
        slug: story.slug || "", title: story.title || "",
        description: story.description || "", category: story.category || "",
        views: story.views || "", storyInText: story.storyInText || "",
        role: story.role || "", setting: story.setting || "",
        instruction: story.instruction || ""
      });
      // Pre-fill with existing URLs so the user can see what's already uploaded
      setMediaUrls({
        poster: story.poster || null,
        banner: story.banner || null,
        story_movie: story.story_movie || null,
        chatting: story.chatting || []
      });
    } else {
      setFormData({
        slug: "", title: "", description: "", category: "",
        views: "", storyInText: "", role: "", setting: "", instruction: ""
      });
      setMediaUrls({ poster: null, banner: null, story_movie: null, chatting: [] });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        // Only send media fields that have a value
        ...(mediaUrls.poster     && { poster:       mediaUrls.poster }),
        ...(mediaUrls.banner     && { banner:       mediaUrls.banner }),
        ...(mediaUrls.story_movie && { story_movie:  mediaUrls.story_movie }),
        ...(mediaUrls.chatting?.length && { chatting: mediaUrls.chatting }),
      };

      const response = await axios.post(`${api.Url}/live-story/admin/models`, payload, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json"
        }
      });

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

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this story's backend configuration?")) return;
    try {
      const response = await axios.delete(`${api.Url}/live-story/admin/models/${slug}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) fetchModels();
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  if (loading) return <div className="loading-state">Loading stories…</div>;

  return (
    <div className="live-stories-admin-container">
      <div className="admin-header-ls">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2>Live Stories Management</h2>
            <p>Media uploads directly to Cloudflare R2 — instant preview, minimal backend load.</p>
          </div>
          <button className="sync-btn-ls" style={{ background: "#3b82f6" }} onClick={() => openModal(null)}>
            <FaPlus /> Create New Story
          </button>
        </div>
      </div>

      <div className="stories-grid-ls">
        {dbModels.map((story) => (
          <div className="story-card-ls configured" key={story._id || story.slug}>
            <div className="story-image-ls">
              <img src={story.poster || "https://via.placeholder.com/300x160"} alt={story.title} />
              <div className="status-badge-ls active">
                <FaCheckCircle />
                <span>Live</span>
              </div>
            </div>
            <div className="story-info-ls">
              <h3>{story.title}</h3>
              <span className="slug-tag-ls">Slug: {story.slug}</span>
              <div className="story-actions-ls">
                <button className="edit-btn-ls" onClick={() => openModal(story)}>
                  <FaEdit /> Edit
                </button>
                <button className="del-btn-ls" onClick={() => handleDelete(story.slug)}>
                  <FaTrash />
                </button>
              </div>
            </div>
          </div>
        ))}
        {dbModels.length === 0 && (
          <div style={{ color: "#aaa", padding: "20px" }}>No stories configured yet. Create one!</div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay-ls">
          <div className="modal-content-ls glass-panel-ls" style={{ maxWidth: 740 }}>
            <div className="modal-header-ls">
              <h3>{formData.slug ? "Edit Live Story" : "Create Live Story"}</h3>
              <button className="close-btn-ls" onClick={() => setIsModalOpen(false)}>
                <FaTimesCircle size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="setup-form-ls">
              {/* ── Text fields ── */}
              <div className="form-group-ls half-ls">
                <label>Story Slug</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleInputChange} required />
              </div>
              <div className="form-group-ls half-ls">
                <label>Theme / Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>
              <div className="form-group-ls half-ls">
                <label>Category</label>
                <input type="text" name="category" value={formData.category} onChange={handleInputChange} />
              </div>
              <div className="form-group-ls half-ls">
                <label>Initial Views</label>
                <input type="text" name="views" value={formData.views} onChange={handleInputChange} placeholder="e.g. 100K" />
              </div>
              <div className="form-group-ls full-ls">
                <label>Display Description (User Facing)</label>
                <textarea name="description" value={formData.description} onChange={handleInputChange} rows={2} />
              </div>

              <div className="form-group-ls full-ls" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10 }}>
                <label style={{ color: "#b862ff" }}>AI Details</label>
              </div>
              <div className="form-group-ls full-ls">
                <label>AI Secret Plot Summary (System Prompt)</label>
                <textarea name="storyInText" value={formData.storyInText} onChange={handleInputChange} rows={3} />
              </div>
              <div className="form-group-ls half-ls">
                <label>Character Role (AI)</label>
                <input type="text" name="role" value={formData.role} onChange={handleInputChange} placeholder="e.g. A shy ghost" />
              </div>
              <div className="form-group-ls half-ls">
                <label>Environment Context</label>
                <input type="text" name="setting" value={formData.setting} onChange={handleInputChange} placeholder="e.g. A dark dorm room" />
              </div>
              <div className="form-group-ls full-ls">
                <label>System Instructions (Crucial for AI behavior)</label>
                <textarea name="instruction" value={formData.instruction} onChange={handleInputChange} rows={4} required />
              </div>

              {/* ── Media Uploads ── */}
              <div className="form-group-ls full-ls" style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 10 }}>
                <label style={{ color: "#b862ff" }}>
                  Media Uploads — uploaded directly to Cloudflare R2
                </label>
              </div>

              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Poster Image (Grid View)"
                  icon={<FaImage />}
                  folder="live-stories/poster"
                  accept="image/*"
                  multiple={false}
                  value={mediaUrls.poster}
                  onChange={(url) => setMediaUrls((p) => ({ ...p, poster: url }))}
                  onClear={() => setMediaUrls((p) => ({ ...p, poster: null }))}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>

              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Banner Image (Carousel)"
                  icon={<FaImage />}
                  folder="live-stories/banner"
                  accept="image/*"
                  multiple={false}
                  value={mediaUrls.banner}
                  onChange={(url) => setMediaUrls((p) => ({ ...p, banner: url }))}
                  onClear={() => setMediaUrls((p) => ({ ...p, banner: null }))}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>

              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Story Intro Movie (Video)"
                  icon={<FaFilm />}
                  folder="live-stories/movie"
                  accept="video/*"
                  multiple={false}
                  value={mediaUrls.story_movie}
                  onChange={(url) => setMediaUrls((p) => ({ ...p, story_movie: url }))}
                  onClear={() => setMediaUrls((p) => ({ ...p, story_movie: null }))}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>

              <div className="form-group-ls half-ls">
                <MediaUploadField
                  label="Chatting Backgrounds (Multiple)"
                  icon={<FaImage />}
                  folder="live-stories/chatting"
                  accept="image/*"
                  multiple={true}
                  value={mediaUrls.chatting}
                  onChange={(urls) => setMediaUrls((p) => ({ ...p, chatting: urls }))}
                  onClear={() => setMediaUrls((p) => ({ ...p, chatting: [] }))}
                  onUploadStateChange={handleUploadStateChange}
                />
              </div>

              <div className="form-actions-ls">
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
                    <><FaSave /> Save Story</>
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

export default LiveStoriesAdmin;
