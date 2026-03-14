'use client';
import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaEdit, FaPlus, FaTrash, FaCheckCircle, FaTimesCircle, FaSave } from "react-icons/fa";
import api from "../../config/api";
import { liveStoriesData } from "../../data/liveStoriesData"; // Front-end schema
import "./LiveStoriesAdmin.css";

const LiveStoriesAdmin = () => {
  const [dbModels, setDbModels] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal / Form state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  
  // Form fields
  const [formData, setFormData] = useState({
    slug: "",
    title: "",
    storyInText: "",
    role: "",
    setting: "",
    instruction: ""
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

  const handleSync = async () => {
    try {
      const storiesToSync = liveStoriesData.map(s => ({
        slug: s.slug,
        title: s.title,
        description: s.description
      }));
      const response = await axios.post(`${api.Url}/live-story/admin/sync`, { stories: storiesToSync }, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
      });
      if (response.data.success) {
        alert(`Sync complete: ${response.data.results.created} created, ${response.data.results.skipped} skipped.`);
        fetchModels();
      }
    } catch (error) {
      console.error("Sync error:", error);
    }
  };

  useEffect(() => {
    fetchModels();
  }, []);

  // Compute status for each frontend story
  const enrichedStories = liveStoriesData.map(frontendStory => {
    const dbModel = dbModels.find(m => m.slug === frontendStory.slug);
    return {
      ...frontendStory,
      isConfigured: !!dbModel,
      backendData: dbModel || null
    };
  });

  const handleEditClick = (story) => {
    setEditingStory(story);
    if (story.isConfigured) {
      setFormData({
        slug: story.backendData.slug,
        title: story.backendData.title,
        storyInText: story.backendData.storyInText || "",
        role: story.backendData.role || "",
        setting: story.backendData.setting || "",
        instruction: story.backendData.instruction || ""
      });
    } else {
      setFormData({
        slug: story.slug,
        title: story.title,
        storyInText: story.description || "",
        role: "",
        setting: "",
        instruction: ""
      });
    }
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${api.Url}/live-story/admin/models`, formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
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
              <h2>Live Stories AI Management</h2>
              <p>Configure backend prompt mapping for your frontend interactive stories.</p>
           </div>
           <button className="sync-btn-ls" onClick={handleSync}>
             Sync Missing Stories
           </button>
        </div>
      </div>

      <div className="stories-grid-ls">
        {enrichedStories.map((story) => (
          <div className={`story-card-ls ${story.isConfigured ? 'configured' : 'unconfigured'}`} key={story.id}>
             <div className="story-image-ls">
               <img src={story.poster} alt={story.title} />
               <div className={`status-badge-ls ${story.isConfigured ? 'active' : 'pending'}`}>
                 {story.isConfigured ? <FaCheckCircle /> : <FaTimesCircle />}
                 <span>{story.isConfigured ? 'Configured' : 'Needs Config'}</span>
               </div>
             </div>
             
             <div className="story-info-ls">
               <h3>{story.title}</h3>
               <span className="slug-tag-ls">Slug: {story.slug}</span>
               
               <div className="story-actions-ls">
                 {story.isConfigured ? (
                   <>
                     <button className="edit-btn-ls" onClick={() => handleEditClick(story)}>
                       <FaEdit /> Edit Setup
                     </button>
                     <button className="del-btn-ls" onClick={() => handleDelete(story.slug)}>
                       <FaTrash />
                     </button>
                   </>
                 ) : (
                   <button className="create-btn-ls" onClick={() => handleEditClick(story)}>
                     <FaPlus /> Configure AI
                   </button>
                 )}
               </div>
             </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="modal-overlay-ls">
          <div className="modal-content-ls glass-panel-ls">
            <div className="modal-header-ls">
              <h3>{editingStory?.isConfigured ? 'Edit AI Setup' : 'Configure AI Prompt'}</h3>
              <button className="close-btn-ls" onClick={() => setIsModalOpen(false)}>
                <FaTimesCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="setup-form-ls">
              <div className="form-group-ls">
                <label>Story Slug (Read Only)</label>
                <input type="text" name="slug" value={formData.slug} disabled className="disabled-input" />
              </div>

              <div className="form-group-ls">
                <label>Theme / AI Character Title</label>
                <input type="text" name="title" value={formData.title} onChange={handleInputChange} required />
              </div>

              <div className="form-group-ls">
                <label>Context / Plot summary</label>
                <textarea 
                  name="storyInText" 
                  value={formData.storyInText} 
                  onChange={handleInputChange} 
                  rows={3} 
                  placeholder="The user and AI are talking because..."
                />
              </div>

              <div className="form-group-ls half-ls">
                <label>Character Role (AI)</label>
                <input 
                  type="text" 
                  name="role" 
                  value={formData.role} 
                  onChange={handleInputChange} 
                  placeholder="e.g. A shy ghost, mysterious stranger"
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
                  placeholder="Instruct the model how it should reply, tone, language, guidelines, constraints..."
                  required
                />
              </div>

              <div className="form-actions-ls">
                <button type="submit" className="save-btn-ls">
                  <FaSave /> Save Configuration
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
