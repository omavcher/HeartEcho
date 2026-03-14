'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaSave, FaImage, FaFilm } from "react-icons/fa";
import api from "../../config/api";
import "./LiveStoriesAdmin.css";

const LiveStoriesAdmin = () => {
  const [dbModels, setDbModels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    description: "",
    category: "",
    views: "",
    storyInText: "",
    role: "",
    setting: "",
    instruction: ""
  });

  const [files, setFiles] = useState({
    poster: null,
    banner: null,
    story_movie: null,
    chatting: null
  });

  const fetchModels = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${api.Url}/live-story/admin/models`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) {
        setDbModels(response.data.models);
      }
    } catch (error) {
      console.error("Error fetching live story models:", error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchModels();
  }, []);

  const handleEditClick = (story) => {
    if (story) {
      setFormData({
        slug: story.slug || "",
        title: story.title || "",
        description: story.description || "",
        category: story.category || "",
        views: story.views || "",
        storyInText: story.storyInText || "",
        role: story.role || "",
        setting: story.setting || "",
        instruction: story.instruction || ""
      });
    } else {
      setFormData({
        slug: "",
        title: "",
        description: "",
        category: "",
        views: "",
        storyInText: "",
        role: "",
        setting: "",
        instruction: ""
      });
    }
    setFiles({
      poster: null,
      banner: null,
      story_movie: null,
      chatting: null
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files: selectedFiles } = e.target;
    setFiles(prev => ({ ...prev, [name]: name === "chatting" ? selectedFiles : selectedFiles[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        formDataToSend.append(key, formData[key] || "");
      });
      if (files.poster) formDataToSend.append("poster", files.poster);
      if (files.banner) formDataToSend.append("banner", files.banner);
      if (files.story_movie) formDataToSend.append("story_movie", files.story_movie);
      
      if (files.chatting) {
        Array.from(files.chatting).forEach(file => {
          formDataToSend.append("chatting", file);
        });
      }

      const response = await axios.post(`${api.Url}/live-story/admin/models`, formDataToSend, {
        headers: { 
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.data.success) {
        setIsModalOpen(false);
        fetchModels();
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Failed to save configuration.");
    }
  };

  const handleDelete = async (slug) => {
    if (!window.confirm("Are you sure you want to delete this story's backend configuration?")) return;
    try {
      const response = await axios.delete(`${api.Url}/live-story/admin/models/${slug}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) {
        fetchModels();
      }
    } catch (error) {
       console.error("Delete error:", error);
    }
  };

  if (loading) return <div className="loading-state">Loading stories...</div>;

  return (
    <div className="live-stories-admin-container">
      <div className="admin-header-ls">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
           <div>
              <h2>Live Stories Management</h2>
              <p>Configure Live Stories directly from the backend to load assets from Cloudflare R2.</p>
           </div>
           <button className="sync-btn-ls" style={{background: '#3b82f6'}} onClick={() => handleEditClick(null)}>
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
                   <button className="edit-btn-ls" onClick={() => handleEditClick(story)}>
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
          <div style={{ color: '#aaa', padding: '20px' }}>No stories configured yet. Create one!</div>
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay-ls">
          <div className="modal-content-ls glass-panel-ls" style={{maxWidth: 700}}>
            <div className="modal-header-ls">
              <h3>{formData.slug ? 'Edit Live Story' : 'Create Live Story'}</h3>
              <button className="close-btn-ls" onClick={() => setIsModalOpen(false)}>
                <FaTimesCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="setup-form-ls">
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
                <textarea 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  rows={2} 
                />
              </div>

              <div className="form-group-ls full-ls" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                <label style={{color: '#b862ff'}}>AI Details</label>
              </div>

              <div className="form-group-ls full-ls">
                <label>AI Secret Plot Summary (System Prompt)</label>
                <textarea 
                  name="storyInText" 
                  value={formData.storyInText} 
                  onChange={handleInputChange} 
                  rows={3} 
                />
              </div>

              <div className="form-group-ls half-ls">
                <label>Character Role (AI)</label>
                <input 
                  type="text" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange} 
                  placeholder="e.g. A shy ghost"
                />
              </div>

              <div className="form-group-ls half-ls">
                <label>Environment Context</label>
                <input 
                  type="text" 
                  name="setting" 
                  value={formData.setting} 
                  onChange={handleInputChange} 
                  placeholder="e.g. A dark dorm room"
                />
              </div>

              <div className="form-group-ls full-ls">
                <label>System Instructions (Crucial for AI behavior)</label>
                <textarea 
                  name="instruction" 
                  value={formData.instruction} 
                  onChange={handleInputChange} 
                  rows={4} 
                  required
                />
              </div>

              <div className="form-group-ls full-ls" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 10 }}>
                <label style={{color: '#b862ff'}}>Media Uploads (Cloudflare R2)</label>
              </div>
              
              <div className="form-group-ls half-ls">
                <label><FaImage /> Poster Image (Grid View)</label>
                <input type="file" name="poster" onChange={handleFileChange} accept="image/*" />
              </div>
              <div className="form-group-ls half-ls">
                <label><FaImage /> Banner Image (Carousel)</label>
                <input type="file" name="banner" onChange={handleFileChange} accept="image/*" />
              </div>
              <div className="form-group-ls half-ls">
                <label><FaFilm /> Story Intro Movie (Video)</label>
                <input type="file" name="story_movie" onChange={handleFileChange} accept="video/*" />
              </div>
              <div className="form-group-ls half-ls">
                <label><FaImage /> Chatting Backgrounds (Multiple)</label>
                <input type="file" name="chatting" onChange={handleFileChange} accept="image/*" multiple />
              </div>

              <div className="form-actions-ls">
                <button type="submit" className="save-btn-ls">
                  <FaSave /> Save Story
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
