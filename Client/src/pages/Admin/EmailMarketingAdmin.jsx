'use client';

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import api from "../../config/api";
import { 
  FaEnvelope, FaEnvelopeOpen, FaLink, FaCoins, FaCheckCircle, 
  FaTrash, FaPaperPlane, FaSpinner, FaPlus, FaWrench, 
  FaExclamationTriangle, FaList, FaRegChartBar, FaGlobe, FaEdit,
  FaRedo, FaPause, FaPlay, FaUsers, FaUserPlus, FaTimes
} from "react-icons/fa";
import "./EmailMarketingAdmin.css";

export default function EmailMarketingAdmin() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [stats, setStats] = useState(null);
  const [smtpList, setSmtpList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  const [followUps, setFollowUps] = useState([]);
  const [loading, setLoading] = useState(true);

  // SMTP Forms State
  const [smtpForm, setSmtpForm] = useState({
    email: "", pass: "", host: "smtp.gmail.com", port: 465, secure: true, limitDaily: 100
  });
  const [testingSmtpId, setTestingSmtpId] = useState(null);
  const [testEmailAddress, setTestEmailAddress] = useState("");

  // Template Form State
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: "", label: "", subject: "", html: ""
  });

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    name: "", templateId: "", targetAudience: "all", subjectOverride: "", targetValue: ""
  });

  // Single user autocomplete
  const [userSuggestions, setUserSuggestions] = useState([]);
  const [searchingUsers, setSearchingUsers] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [searchInput, setSearchInput] = useState("");
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Multi-user state
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [multiSearchInput, setMultiSearchInput] = useState("");
  const [multiSuggestions, setMultiSuggestions] = useState([]);
  const [searchingMulti, setSearchingMulti] = useState(false);
  const [multiHighlightedIndex, setMultiHighlightedIndex] = useState(-1);

  // Follow-Up Form State
  const [followUpForm, setFollowUpForm] = useState({
    name: "", parentCampaignId: "", templateId: "", triggerCondition: "not_opened", delayHours: 48, subjectOverride: ""
  });
  const [creatingFollowUp, setCreatingFollowUp] = useState(false);
  const [togglingFollowUpId, setTogglingFollowUpId] = useState(null);

  // Action feedback
  const [message, setMessage] = useState({ text: "", type: "" });

  // Find & Replace editor state
  const textareaRef = useRef(null);
  const [findText, setFindText] = useState("");
  const [replaceText, setReplaceText] = useState("");
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);

  // ==========================================
  // SINGLE USER AUTOCOMPLETE
  // ==========================================
  const handleUserSearch = async (val) => {
    setSearchInput(val);
    setCampaignForm(prev => ({ ...prev, targetValue: "" }));
    setHighlightedIndex(-1);
    if (val.trim().length < 2) { setUserSuggestions([]); return; }
    setSearchingUsers(true);
    try {
      const res = await axios.get(`${api.Url}/email-marketing/search-users?q=${val}`, getHeaders());
      if (res.data.success) setUserSuggestions(res.data.data);
    } catch (err) {
      console.error("Error searching users:", err);
    } finally { setSearchingUsers(false); }
  };

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setCampaignForm(prev => ({ ...prev, targetValue: user.email }));
    setSearchInput("");
    setUserSuggestions([]);
    setHighlightedIndex(-1);
  };

  const handleInputKeyDown = (e) => {
    if (userSuggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlightedIndex(prev => (prev + 1) % userSuggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlightedIndex(prev => (prev - 1 + userSuggestions.length) % userSuggestions.length); }
    else if (e.key === "Enter") { e.preventDefault(); const idx = highlightedIndex >= 0 ? highlightedIndex : 0; if (userSuggestions[idx]) handleSelectUser(userSuggestions[idx]); }
    else if (e.key === "Escape") { setUserSuggestions([]); setHighlightedIndex(-1); }
  };

  // ==========================================
  // MULTI USER AUTOCOMPLETE
  // ==========================================
  const handleMultiUserSearch = async (val) => {
    setMultiSearchInput(val);
    setMultiHighlightedIndex(-1);
    if (val.trim().length < 2) { setMultiSuggestions([]); return; }
    setSearchingMulti(true);
    try {
      const res = await axios.get(`${api.Url}/email-marketing/search-users?q=${val}`, getHeaders());
      if (res.data.success) {
        // Filter out already-selected users
        const selectedEmails = new Set(selectedUsers.map(u => u.email));
        setMultiSuggestions(res.data.data.filter(u => !selectedEmails.has(u.email)));
      }
    } catch (err) {
      console.error("Error searching users:", err);
    } finally { setSearchingMulti(false); }
  };

  const handleAddMultiUser = (user) => {
    if (!selectedUsers.find(u => u.email === user.email)) {
      setSelectedUsers(prev => [...prev, user]);
    }
    setMultiSearchInput("");
    setMultiSuggestions([]);
    setMultiHighlightedIndex(-1);
  };

  const handleRemoveMultiUser = (email) => {
    setSelectedUsers(prev => prev.filter(u => u.email !== email));
  };

  const handleMultiKeyDown = (e) => {
    if (multiSuggestions.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setMultiHighlightedIndex(prev => (prev + 1) % multiSuggestions.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setMultiHighlightedIndex(prev => (prev - 1 + multiSuggestions.length) % multiSuggestions.length); }
    else if (e.key === "Enter") { e.preventDefault(); const idx = multiHighlightedIndex >= 0 ? multiHighlightedIndex : 0; if (multiSuggestions[idx]) handleAddMultiUser(multiSuggestions[idx]); }
    else if (e.key === "Escape") { setMultiSuggestions([]); setMultiHighlightedIndex(-1); }
  };

  // ==========================================
  // FIND & REPLACE
  // ==========================================
  const handleFind = () => {
    if (!findText) { showFeedback("Please enter text to find", "error"); return; }
    const html = templateForm.html;
    const index = html.toLowerCase().indexOf(findText.toLowerCase(), currentMatchIndex + 1);
    if (index !== -1) {
      setCurrentMatchIndex(index);
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(index, index + findText.length);
        const row = html.substring(0, index).split("\n").length;
        textareaRef.current.scrollTop = (row - 5) * 18;
      }
    } else {
      const wrapIndex = html.toLowerCase().indexOf(findText.toLowerCase(), 0);
      if (wrapIndex !== -1) {
        setCurrentMatchIndex(wrapIndex);
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.setSelectionRange(wrapIndex, wrapIndex + findText.length);
          const row = html.substring(0, wrapIndex).split("\n").length;
          textareaRef.current.scrollTop = (row - 5) * 18;
        }
      } else { setCurrentMatchIndex(-1); showFeedback("No matches found", "error"); }
    }
  };

  const handleReplace = () => {
    if (!findText) { showFeedback("Please enter text to find and replace", "error"); return; }
    const html = templateForm.html;
    if (currentMatchIndex === -1) { handleFind(); return; }
    const prefix = html.substring(0, currentMatchIndex);
    const suffix = html.substring(currentMatchIndex + findText.length);
    const newHtml = prefix + replaceText + suffix;
    setTemplateForm({ ...templateForm, html: newHtml });
    setCurrentMatchIndex(currentMatchIndex + replaceText.length - 1);
    showFeedback("Replaced occurrence");
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(currentMatchIndex, currentMatchIndex + replaceText.length);
      }
    }, 50);
  };

  const handleReplaceAll = () => {
    if (!findText) { showFeedback("Please enter text to find", "error"); return; }
    const html = templateForm.html;
    const escaped = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = new RegExp(escaped, 'gi');
    const matches = html.match(regex);
    if (!matches || matches.length === 0) { showFeedback("No matches found to replace", "error"); return; }
    const newHtml = html.replace(regex, replaceText);
    setTemplateForm({ ...templateForm, html: newHtml });
    setCurrentMatchIndex(-1);
    showFeedback(`Replaced all ${matches.length} occurrences`);
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const showFeedback = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const getHeaders = () => {
    if (typeof window === 'undefined') return {};
    const token = localStorage.getItem("token");
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const headers = getHeaders();
      const [resStats, resSmtp, resTemplates, resCampaigns, resFollowUps] = await Promise.all([
        axios.get(`${api.Url}/email-marketing/dashboard`, headers),
        axios.get(`${api.Url}/email-marketing/smtp`, headers),
        axios.get(`${api.Url}/email-marketing/templates`, headers),
        axios.get(`${api.Url}/email-marketing/campaigns`, headers),
        axios.get(`${api.Url}/email-marketing/follow-ups`, headers)
      ]);
      if (resStats.data.success) setStats(resStats.data.data);
      if (resSmtp.data.success) setSmtpList(resSmtp.data.data);
      if (resTemplates.data.success) {
        setTemplates(resTemplates.data.data);
        if (resTemplates.data.data.length > 0 && !selectedTemplate) {
          handleSelectTemplate(resTemplates.data.data[0]);
        }
      }
      if (resCampaigns.data.success) setCampaigns(resCampaigns.data.data);
      if (resFollowUps.data.success) setFollowUps(resFollowUps.data.data);
    } catch (error) {
      console.error("Error loading email marketing data:", error);
      showFeedback("Failed to load marketing dashboard data", "error");
    } finally { setLoading(false); }
  };

  // ==========================================
  // SMTP ACCOUNT LOGIC
  // ==========================================
  const handleAddSmtp = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${api.Url}/email-marketing/smtp`, smtpForm, getHeaders());
      if (res.data.success) {
        showFeedback("SMTP account added successfully!");
        setSmtpForm({ email: "", pass: "", host: "smtp.gmail.com", port: 465, secure: true, limitDaily: 100 });
        fetchDashboardData();
      }
    } catch (err) { showFeedback(err.response?.data?.error || "Failed to add SMTP account", "error"); }
  };

  const handleToggleSmtpStatus = async (id, currentActive) => {
    try {
      await axios.put(`${api.Url}/email-marketing/smtp/${id}`, { active: !currentActive }, getHeaders());
      showFeedback("SMTP status updated!");
      fetchDashboardData();
    } catch (err) { showFeedback("Failed to update SMTP status", "error"); }
  };

  const handleDeleteSmtp = async (id) => {
    if (!window.confirm("Are you sure you want to delete this SMTP account?")) return;
    try {
      await axios.delete(`${api.Url}/email-marketing/smtp/${id}`, getHeaders());
      showFeedback("SMTP account deleted!");
      fetchDashboardData();
    } catch (err) { showFeedback("Failed to delete SMTP account", "error"); }
  };

  const handleTestSmtp = async (id) => {
    if (!testEmailAddress) { showFeedback("Please enter a test email address first", "error"); return; }
    setTestingSmtpId(id);
    try {
      const res = await axios.post(`${api.Url}/email-marketing/smtp/${id}/test`, { testEmail: testEmailAddress }, getHeaders());
      if (res.data.success) { showFeedback("SMTP connection test succeeded! Check inbox."); setTestEmailAddress(""); }
    } catch (err) { showFeedback(err.response?.data?.error || "SMTP verification failed", "error"); }
    finally { setTestingSmtpId(null); }
  };

  // ==========================================
  // TEMPLATES LOGIC
  // ==========================================
  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setTemplateForm({ name: tpl.name, label: tpl.label, subject: tpl.subject, html: tpl.html });
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    try {
      const res = await axios.put(`${api.Url}/email-marketing/templates/${selectedTemplate._id}`, templateForm, getHeaders());
      if (res.data.success) {
        showFeedback("Email template saved!");
        setTemplates(prev => prev.map(t => t._id === selectedTemplate._id ? res.data.data : t));
        setSelectedTemplate(res.data.data);
      }
    } catch (err) { showFeedback("Failed to save template", "error"); }
  };

  const getPreviewHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/{{first_name}}/g, "Om")
      .replace(/{{email}}/g, "omawchar07@gmail.com")
      .replace(/{{offer_end_date}}/g, new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
      }));
  };

  // ==========================================
  // CAMPAIGNS LOGIC
  // ==========================================
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.templateId) { showFeedback("Please select an email template", "error"); return; }
    if (campaignForm.targetAudience === "specific_user" && !selectedUser) {
      showFeedback("Please search and select a specific user from the autocomplete suggestions", "error");
      return;
    }
    if (campaignForm.targetAudience === "multiple_users" && selectedUsers.length === 0) {
      showFeedback("Please add at least one target user", "error");
      return;
    }
    setLoading(true);
    try {
      const payload = { ...campaignForm };
      if (campaignForm.targetAudience === "multiple_users") {
        payload.targetUsers = selectedUsers.map(u => u.email);
      }
      const res = await axios.post(`${api.Url}/email-marketing/campaigns`, payload, getHeaders());
      if (res.data.success) {
        showFeedback(res.data.message || "Campaign queued and triggered successfully!");
        setCampaignForm({ name: "", templateId: "", targetAudience: "all", subjectOverride: "", targetValue: "" });
        setSelectedUser(null);
        setSelectedUsers([]);
        setSearchInput("");
        setMultiSearchInput("");
        setUserSuggestions([]);
        setMultiSuggestions([]);
        fetchDashboardData();
      }
    } catch (err) {
      showFeedback(err.response?.data?.error || "Failed to trigger campaign", "error");
    } finally { setLoading(false); }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign? All queue items and logs will be deleted!")) return;
    try {
      await axios.delete(`${api.Url}/email-marketing/campaigns/${id}`, getHeaders());
      showFeedback("Campaign deleted successfully!");
      fetchDashboardData();
    } catch (err) { showFeedback("Failed to delete campaign", "error"); }
  };

  // ==========================================
  // FOLLOW-UP LOGIC
  // ==========================================
  const handleCreateFollowUp = async (e) => {
    e.preventDefault();
    if (!followUpForm.parentCampaignId) { showFeedback("Please select a parent campaign", "error"); return; }
    if (!followUpForm.templateId) { showFeedback("Please select a template", "error"); return; }
    setCreatingFollowUp(true);
    try {
      const res = await axios.post(`${api.Url}/email-marketing/follow-ups`, followUpForm, getHeaders());
      if (res.data.success) {
        showFeedback(res.data.message || "Follow-up sequence created!");
        setFollowUpForm({ name: "", parentCampaignId: "", templateId: "", triggerCondition: "not_opened", delayHours: 48, subjectOverride: "" });
        fetchDashboardData();
      }
    } catch (err) {
      showFeedback(err.response?.data?.error || "Failed to create follow-up", "error");
    } finally { setCreatingFollowUp(false); }
  };

  const handleToggleFollowUp = async (id) => {
    setTogglingFollowUpId(id);
    try {
      const res = await axios.patch(`${api.Url}/email-marketing/follow-ups/${id}/toggle`, {}, getHeaders());
      if (res.data.success) {
        showFeedback(res.data.message);
        setFollowUps(prev => prev.map(f => f._id === id ? res.data.data : f));
      }
    } catch (err) { showFeedback(err.response?.data?.error || "Failed to toggle follow-up", "error"); }
    finally { setTogglingFollowUpId(null); }
  };

  const handleDeleteFollowUp = async (id) => {
    if (!window.confirm("Delete this follow-up? Pending queue items will be removed.")) return;
    try {
      await axios.delete(`${api.Url}/email-marketing/follow-ups/${id}`, getHeaders());
      showFeedback("Follow-up deleted!");
      setFollowUps(prev => prev.filter(f => f._id !== id));
    } catch (err) { showFeedback("Failed to delete follow-up", "error"); }
  };

  const getTriggerLabel = (trigger) => {
    const labels = {
      opened: "📬 Opened email",
      clicked: "🖱️ Clicked a link",
      not_opened: "📭 Did NOT open",
      not_clicked: "⏭️ Did NOT click",
      not_converted: "💔 Clicked, not converted"
    };
    return labels[trigger] || trigger;
  };

  const getTriggerColor = (trigger) => {
    const colors = {
      opened: "#22c55e",
      clicked: "#3b82f6",
      not_opened: "#f59e0b",
      not_clicked: "#f97316",
      not_converted: "#e91e8c"
    };
    return colors[trigger] || "#888";
  };

  if (loading && !stats) {
    return (
      <div className="mkt-container" style={{ textAlign: "center", padding: "100px" }}>
        <FaSpinner className="fa-spin" style={{ fontSize: "50px", color: "#e91e8c" }} />
        <h3 style={{ marginTop: "20px" }}>Loading Email Marketing Panel...</h3>
      </div>
    );
  }

  return (
    <div className="mkt-container">
      {/* Title section */}
      <div className="mkt-header">
        <div className="mkt-title-row">
          <div>
            <h1 className="mkt-title">💌 HeartEcho Email Marketing</h1>
            <p className="mkt-desc">Manage rotating SMTP accounts, custom HTML templates, email campaign distribution, follow-up sequences, and conversion analytics.</p>
          </div>
          {loading && (
            <div>
              <FaSpinner className="fa-spin" style={{ color: "#e91e8c", marginRight: "10px" }} />
              Updating stats...
            </div>
          )}
        </div>
        {message.text && (
          <div 
            className="mkt-urgency" 
            style={{ 
              marginTop: "15px", 
              background: message.type === "error" ? "rgba(239, 68, 68, 0.1)" : "rgba(34, 197, 94, 0.1)",
              borderColor: message.type === "error" ? "rgba(239, 68, 68, 0.4)" : "rgba(34, 197, 94, 0.4)"
            }}
          >
            <strong style={{ color: message.type === "error" ? "#ef4444" : "#22c55e" }}>
              {message.type === "error" ? "⚠️ Error" : "✓ Success"}
            </strong>
            <span style={{ color: "#fff" }}> - {message.text}</span>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="mkt-tabs">
        <button className={`mkt-tab-btn ${activeTab === "campaigns" ? "active" : ""}`} onClick={() => setActiveTab("campaigns")}>
          <FaPaperPlane /> Campaigns & Stats
        </button>
        <button className={`mkt-tab-btn ${activeTab === "followups" ? "active" : ""}`} onClick={() => setActiveTab("followups")}>
          <FaRedo /> Follow-Ups {followUps.length > 0 && <span className="mkt-tab-badge">{followUps.length}</span>}
        </button>
        <button className={`mkt-tab-btn ${activeTab === "templates" ? "active" : ""}`} onClick={() => setActiveTab("templates")}>
          <FaEdit /> Email Templates
        </button>
        <button className={`mkt-tab-btn ${activeTab === "smtp" ? "active" : ""}`} onClick={() => setActiveTab("smtp")}>
          <FaWrench /> SMTP Accounts ({stats?.smtp?.active || 0} active)
        </button>
      </div>

      {/* Tab 1: Campaigns */}
      {activeTab === "campaigns" && (
        <div>
          {/* Top KPI Cards */}
          <div className="mkt-metrics-grid">
            <div className="mkt-metric-card">
              <FaPaperPlane className="mkt-metric-icon" />
              <div className="mkt-metric-val">{stats?.queue?.sent || 0}</div>
              <div className="mkt-metric-label">Emails Sent</div>
            </div>
            <div className="mkt-metric-card">
              <FaEnvelopeOpen className="mkt-metric-icon" />
              <div className="mkt-metric-val">{stats?.tracking?.opens || 0}</div>
              <div className="mkt-metric-label">Unique Opens ({stats?.tracking?.openRate || 0}%)</div>
            </div>
            <div className="mkt-metric-card">
              <FaLink className="mkt-metric-icon" />
              <div className="mkt-metric-val">{stats?.tracking?.clicks || 0}</div>
              <div className="mkt-metric-label">Clicks ({stats?.tracking?.clickRate || 0}%)</div>
            </div>
            <div className="mkt-metric-card">
              <FaCoins className="mkt-metric-icon" />
              <div className="mkt-metric-val">{stats?.tracking?.conversions || 0}</div>
              <div className="mkt-metric-label">Conversions ({stats?.tracking?.conversionRate || 0}%)</div>
            </div>
          </div>

          <div className="mkt-layout-split">
            {/* Create Campaign Panel */}
            <div className="mkt-panel">
              <h2 className="mkt-panel-title"><FaPlus /> Create New Campaign</h2>
              <form onSubmit={handleCreateCampaign}>
                <div className="mkt-form-group">
                  <label className="mkt-label">Campaign Name</label>
                  <input 
                    type="text" className="mkt-input" placeholder="e.g. Diwali Premium Push" 
                    value={campaignForm.name} onChange={e => setCampaignForm({...campaignForm, name: e.target.value})} required 
                  />
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Select Email Template</label>
                  <select className="mkt-select" value={campaignForm.templateId} onChange={e => setCampaignForm({...campaignForm, templateId: e.target.value})} required>
                    <option value="">-- Choose template --</option>
                    {templates.map(t => (<option key={t._id} value={t._id}>{t.label} ({t.name})</option>))}
                  </select>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Target Audience Segment</label>
                  <select 
                    className="mkt-select" value={campaignForm.targetAudience}
                    onChange={e => {
                      setCampaignForm({...campaignForm, targetAudience: e.target.value, targetValue: ""});
                      setSelectedUser(null); setSelectedUsers([]);
                      setSearchInput(""); setMultiSearchInput("");
                      setUserSuggestions([]); setMultiSuggestions([]);
                      setHighlightedIndex(-1); setMultiHighlightedIndex(-1);
                    }}
                  >
                    <option value="all">All Registered Users</option>
                    <option value="free">Free Tier Users Only</option>
                    <option value="subscribers">Subscribers Only</option>
                    <option value="new_users_today">New Users (Registered Today)</option>
                    <option value="new_users_7d">New Users (Registered Last 7 Days)</option>
                    <option value="free_today">New Free Users (Today)</option>
                    <option value="free_7d">New Free Users (Last 7 Days)</option>
                    <option value="subscribers_today">New Subscribers (Today)</option>
                    <option value="subscribers_7d">New Subscribers (Last 7 Days)</option>
                    <option value="free_no_chat">Free Users (Never chatted)</option>
                    <option value="free_chatted_no_sub">Free Users (Chatted, not subscribed)</option>
                    <option value="inactive_7d">Inactive (No logins last 7 days)</option>
                    <option value="inactive_30d">Inactive (No logins last 30 days)</option>
                    <option value="specific_user">Single User (Search by Email/Name)</option>
                    <option value="multiple_users">Multiple Users (Search & Select Many)</option>
                  </select>
                </div>

                {/* Single user picker */}
                {campaignForm.targetAudience === "specific_user" && (
                  <div className="mkt-form-group" style={{ position: "relative" }}>
                    <label className="mkt-label">Target User Email or Name</label>
                    {selectedUser ? (
                      <div className="mkt-selected-user-chip">
                        <div className="mkt-chip-avatar">{selectedUser.name ? selectedUser.name[0].toUpperCase() : "U"}</div>
                        <div className="mkt-chip-info">
                          <div className="mkt-chip-name">{selectedUser.name || "Unnamed User"}</div>
                          <div className="mkt-chip-email">{selectedUser.email}</div>
                        </div>
                        <button type="button" className="mkt-chip-clear" onClick={() => { setSelectedUser(null); setCampaignForm(prev => ({ ...prev, targetValue: "" })); setSearchInput(""); }} title="Clear selection">&times;</button>
                      </div>
                    ) : (
                      <>
                        <input 
                          type="text" className="mkt-input" placeholder="Type at least 2 chars to search..." 
                          value={searchInput} onChange={e => handleUserSearch(e.target.value)} onKeyDown={handleInputKeyDown} required 
                        />
                        {searchingUsers && <div style={{ position: "absolute", right: "12px", top: "35px" }}><FaSpinner className="fa-spin" style={{ color: "#e91e8c", fontSize: "14px" }} /></div>}
                        {userSuggestions.length > 0 && (
                          <div className="mkt-autocomplete-list">
                            {userSuggestions.map((user, idx) => (
                              <div key={user._id} className={`mkt-autocomplete-item ${highlightedIndex === idx ? "highlighted" : ""}`} onClick={() => handleSelectUser(user)} onMouseEnter={() => setHighlightedIndex(idx)}>
                                <span className="mkt-autocomplete-name">{user.name}</span>
                                <span className="mkt-autocomplete-email">{user.email}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Multi user picker */}
                {campaignForm.targetAudience === "multiple_users" && (
                  <div className="mkt-form-group">
                    <label className="mkt-label">
                      <FaUsers style={{ marginRight: "6px", color: "#ff6b9d" }} />
                      Select Multiple Target Users
                      {selectedUsers.length > 0 && (
                        <span className="mkt-multi-count">{selectedUsers.length} selected</span>
                      )}
                    </label>

                    {/* Selected users chips */}
                    {selectedUsers.length > 0 && (
                      <div className="mkt-chips-container">
                        {selectedUsers.map(user => (
                          <div key={user.email} className="mkt-user-chip-mini">
                            <div className="mkt-chip-mini-avatar">{user.name ? user.name[0].toUpperCase() : "U"}</div>
                            <span className="mkt-chip-mini-name">{user.name?.split(" ")[0] || user.email.split("@")[0]}</span>
                            <button type="button" className="mkt-chip-mini-remove" onClick={() => handleRemoveMultiUser(user.email)} title={`Remove ${user.email}`}>
                              <FaTimes />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Search input */}
                    <div style={{ position: "relative", marginTop: selectedUsers.length > 0 ? "10px" : "0" }}>
                      <div className="mkt-multi-search-wrap">
                        <FaUserPlus style={{ color: "#e91e8c", fontSize: "13px", flexShrink: 0 }} />
                        <input 
                          type="text" className="mkt-multi-search-input"
                          placeholder="Search and add users by name or email..." 
                          value={multiSearchInput} 
                          onChange={e => handleMultiUserSearch(e.target.value)} 
                          onKeyDown={handleMultiKeyDown}
                        />
                        {searchingMulti && <FaSpinner className="fa-spin" style={{ color: "#e91e8c", fontSize: "13px", flexShrink: 0 }} />}
                      </div>
                      {multiSuggestions.length > 0 && (
                        <div className="mkt-autocomplete-list">
                          {multiSuggestions.map((user, idx) => (
                            <div key={user._id} className={`mkt-autocomplete-item ${multiHighlightedIndex === idx ? "highlighted" : ""}`} onClick={() => handleAddMultiUser(user)} onMouseEnter={() => setMultiHighlightedIndex(idx)}>
                              <span className="mkt-autocomplete-name">{user.name}</span>
                              <span className="mkt-autocomplete-email">{user.email}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {selectedUsers.length === 0 && (
                      <p style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", marginTop: "6px" }}>Search and click users to add them to the target list.</p>
                    )}
                  </div>
                )}

                <div className="mkt-form-group">
                  <label className="mkt-label">Subject Line Override (Optional)</label>
                  <input 
                    type="text" className="mkt-input" placeholder="Default template subject will be used if left blank" 
                    value={campaignForm.subjectOverride} onChange={e => setCampaignForm({...campaignForm, subjectOverride: e.target.value})} 
                  />
                </div>

                <button type="submit" className="mkt-btn">
                  <FaPaperPlane /> Dispatch Campaign
                </button>
              </form>
            </div>

            {/* Past Campaigns */}
            <div className="mkt-panel">
              <h2 className="mkt-panel-title"><FaList /> Campaign History & Results</h2>
              {campaigns.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>No campaigns dispatched yet.</div>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="mkt-list-table">
                    <thead>
                      <tr>
                        <th>Campaign</th>
                        <th>Audience</th>
                        <th>Sent</th>
                        <th>Open/Click/Conv</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map(c => {
                        const openPct = c.sentCount > 0 ? ((c.openCount / c.sentCount) * 100).toFixed(0) : 0;
                        const clickPct = c.sentCount > 0 ? ((c.clickCount / c.sentCount) * 100).toFixed(0) : 0;
                        return (
                          <tr key={c._id}>
                            <td>
                              <strong>{c.name}</strong>
                              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>{c.template?.label || "Custom Template"}</div>
                            </td>
                            <td><span className={`badge-status pending`}>{c.targetAudience}</span></td>
                            <td>{c.sentCount} / {c.totalRecipients}</td>
                            <td>
                              <div style={{ fontSize: "12px" }}>
                                👁️ {c.openCount} ({openPct}%) <br />
                                🖱️ {c.clickCount} ({clickPct}%) <br />
                                💰 {c.conversionCount}
                              </div>
                            </td>
                            <td>
                              <button onClick={() => handleDeleteCampaign(c._id)} className="mkt-btn-danger" style={{ padding: "4px 8px" }}>
                                <FaTrash />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Follow-Ups */}
      {activeTab === "followups" && (
        <div>
          <div className="mkt-layout-split">
            {/* Create Follow-Up Form */}
            <div className="mkt-panel">
              <h2 className="mkt-panel-title"><FaRedo /> Create Follow-Up Sequence</h2>
              <div className="mkt-followup-explainer">
                <span>🎯</span>
                <p>Target users from a past campaign based on their behaviour — re-engage them with a follow-up email to drive conversions.</p>
              </div>
              <form onSubmit={handleCreateFollowUp}>
                <div className="mkt-form-group">
                  <label className="mkt-label">Sequence Name</label>
                  <input 
                    type="text" className="mkt-input" placeholder="e.g. Day-2 Re-engagement" 
                    value={followUpForm.name} onChange={e => setFollowUpForm({...followUpForm, name: e.target.value})} required 
                  />
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Parent Campaign</label>
                  <select className="mkt-select" value={followUpForm.parentCampaignId} onChange={e => setFollowUpForm({...followUpForm, parentCampaignId: e.target.value})} required>
                    <option value="">-- Select a sent campaign --</option>
                    {campaigns.map(c => (
                      <option key={c._id} value={c._id}>{c.name} ({c.sentCount} sent)</option>
                    ))}
                  </select>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Trigger Condition — Who gets this follow-up?</label>
                  <select className="mkt-select" value={followUpForm.triggerCondition} onChange={e => setFollowUpForm({...followUpForm, triggerCondition: e.target.value})}>
                    <option value="not_opened">📭 Did NOT open the email</option>
                    <option value="not_clicked">⏭️ Opened but did NOT click</option>
                    <option value="not_converted">💔 Clicked but did NOT convert (best for sales)</option>
                    <option value="opened">📬 Did open the email</option>
                    <option value="clicked">🖱️ Clicked a link</option>
                  </select>
                  <div className="mkt-trigger-preview" style={{ borderColor: getTriggerColor(followUpForm.triggerCondition) }}>
                    <span style={{ color: getTriggerColor(followUpForm.triggerCondition) }}>
                      {getTriggerLabel(followUpForm.triggerCondition)}
                    </span>
                    <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "11px", marginLeft: "8px" }}>
                      — users matching this will receive the follow-up
                    </span>
                  </div>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Delay Before Sending</label>
                  <div className="mkt-delay-row">
                    <input 
                      type="number" className="mkt-input" style={{ width: "100px" }}
                      min="0" value={followUpForm.delayHours} 
                      onChange={e => setFollowUpForm({...followUpForm, delayHours: Number(e.target.value)})} 
                    />
                    <span className="mkt-delay-unit">hours</span>
                    <span className="mkt-delay-hint">
                      {followUpForm.delayHours === 0 ? "⚡ Immediate" :
                       followUpForm.delayHours < 24 ? `≈ ${followUpForm.delayHours}h` :
                       `≈ ${(followUpForm.delayHours / 24).toFixed(1)} day${followUpForm.delayHours >= 48 ? "s" : ""}`}
                    </span>
                  </div>
                  <small style={{ fontSize: "11px", color: "rgba(255,255,255,0.35)", display: "block", marginTop: "4px" }}>
                    Note: Emails are queued immediately and sent by the email processor at the configured rate.
                  </small>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Follow-Up Email Template</label>
                  <select className="mkt-select" value={followUpForm.templateId} onChange={e => setFollowUpForm({...followUpForm, templateId: e.target.value})} required>
                    <option value="">-- Choose template --</option>
                    {templates.map(t => (<option key={t._id} value={t._id}>{t.label} ({t.name})</option>))}
                  </select>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Subject Override (Optional)</label>
                  <input 
                    type="text" className="mkt-input" placeholder="Leave blank to use template subject" 
                    value={followUpForm.subjectOverride} onChange={e => setFollowUpForm({...followUpForm, subjectOverride: e.target.value})} 
                  />
                </div>

                <button type="submit" className="mkt-btn" disabled={creatingFollowUp}>
                  {creatingFollowUp ? <><FaSpinner className="fa-spin" /> Creating...</> : <><FaRedo /> Launch Follow-Up Sequence</>}
                </button>
              </form>
            </div>

            {/* Follow-Up History */}
            <div className="mkt-panel">
              <h2 className="mkt-panel-title"><FaList /> Active Follow-Up Sequences</h2>
              {followUps.length === 0 ? (
                <div style={{ textAlign: "center", padding: "60px 20px", color: "rgba(255,255,255,0.4)" }}>
                  <FaRedo style={{ fontSize: "40px", marginBottom: "15px", opacity: 0.3 }} />
                  <p>No follow-up sequences created yet.</p>
                  <p style={{ fontSize: "12px", marginTop: "6px", opacity: 0.7 }}>Create your first follow-up on the left to re-engage users automatically.</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {followUps.map(fu => {
                    const openPct = fu.sentCount > 0 ? ((fu.openCount / fu.sentCount) * 100).toFixed(0) : 0;
                    const clickPct = fu.sentCount > 0 ? ((fu.clickCount / fu.sentCount) * 100).toFixed(0) : 0;
                    return (
                      <div key={fu._id} className="mkt-followup-card">
                        <div className="mkt-followup-card-header">
                          <div>
                            <div className="mkt-followup-name">{fu.name}</div>
                            <div className="mkt-followup-parent">↳ {fu.parentCampaign?.name || "Unknown campaign"}</div>
                          </div>
                          <span className={`mkt-fu-status-badge ${fu.status}`}>{fu.status}</span>
                        </div>

                        <div className="mkt-followup-trigger-row">
                          <span className="mkt-trigger-pill" style={{ borderColor: getTriggerColor(fu.triggerCondition), color: getTriggerColor(fu.triggerCondition) }}>
                            {getTriggerLabel(fu.triggerCondition)}
                          </span>
                          <span className="mkt-followup-delay">
                            ⏱️ {fu.delayHours === 0 ? "Immediate" : fu.delayHours < 24 ? `${fu.delayHours}h delay` : `${(fu.delayHours / 24).toFixed(1)}d delay`}
                          </span>
                          <span className="mkt-followup-template">📄 {fu.template?.label || "Template"}</span>
                        </div>

                        <div className="mkt-followup-stats">
                          <div className="mkt-fu-stat">
                            <div className="mkt-fu-stat-val">{fu.totalTargeted}</div>
                            <div className="mkt-fu-stat-label">Targeted</div>
                          </div>
                          <div className="mkt-fu-stat">
                            <div className="mkt-fu-stat-val">{fu.sentCount}</div>
                            <div className="mkt-fu-stat-label">Sent</div>
                          </div>
                          <div className="mkt-fu-stat">
                            <div className="mkt-fu-stat-val" style={{ color: "#22c55e" }}>{openPct}%</div>
                            <div className="mkt-fu-stat-label">Opens</div>
                          </div>
                          <div className="mkt-fu-stat">
                            <div className="mkt-fu-stat-val" style={{ color: "#3b82f6" }}>{clickPct}%</div>
                            <div className="mkt-fu-stat-label">Clicks</div>
                          </div>
                          <div className="mkt-fu-stat">
                            <div className="mkt-fu-stat-val" style={{ color: "#e91e8c" }}>{fu.conversionCount}</div>
                            <div className="mkt-fu-stat-label">Converted</div>
                          </div>
                        </div>

                        <div className="mkt-followup-actions">
                          {fu.status !== "completed" && (
                            <button 
                              className={`mkt-btn-secondary ${fu.status === "paused" ? "mkt-btn-resume" : ""}`}
                              style={{ padding: "5px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "5px" }}
                              onClick={() => handleToggleFollowUp(fu._id)}
                              disabled={togglingFollowUpId === fu._id}
                            >
                              {togglingFollowUpId === fu._id ? <FaSpinner className="fa-spin" /> : fu.status === "active" ? <><FaPause /> Pause</> : <><FaPlay /> Resume</>}
                            </button>
                          )}
                          <button className="mkt-btn-danger" style={{ padding: "5px 10px", fontSize: "12px" }} onClick={() => handleDeleteFollowUp(fu._id)}>
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Templates */}
      {activeTab === "templates" && (
        <div className="mkt-template-layout">
          {/* Templates sidebar */}
          <div className="mkt-template-list">
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Select Template</h3>
            {templates.map(t => (
              <div key={t._id} className={`mkt-template-item ${selectedTemplate?._id === t._id ? "active" : ""}`} onClick={() => handleSelectTemplate(t)}>
                <span>{t.label}</span>
              </div>
            ))}
          </div>

          {/* Template Edit Area */}
          {selectedTemplate ? (
            <div className="mkt-panel" style={{ padding: "20px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "15px" }}>
                <h2 style={{ fontSize: "18px", color: "#ff6b9d" }}>Edit: {selectedTemplate.label}</h2>
                <span className="smtp-tag">System Identifier: {selectedTemplate.name}</span>
              </div>
              <form onSubmit={handleSaveTemplate}>
                <div className="mkt-form-group">
                  <label className="mkt-label">Email Subject Line</label>
                  <input type="text" className="mkt-input" value={templateForm.subject} onChange={e => setTemplateForm({...templateForm, subject: e.target.value})} required />
                </div>
                <div className="mkt-editor-preview-split">
                  <div className="mkt-form-group">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                      <label className="mkt-label" style={{ margin: 0 }}>HTML Body Content</label>
                      <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>Variables allowed:</span>
                    </div>
                    <div className="variable-badge-list" style={{ marginBottom: "10px" }}>
                      <span className="variable-badge">{"{{first_name}}"}</span>
                      <span className="variable-badge">{"{{email}}"}</span>
                      <span className="variable-badge">{"{{offer_end_date}}"}</span>
                    </div>
                    <div className="mkt-find-replace-toolbar" style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", background: "rgba(255,255,255,0.03)", padding: "8px", borderRadius: "8px", border: "1px solid rgba(255,255,255,0.08)" }}>
                      <input type="text" placeholder="Find text..." className="mkt-input" style={{ width: "130px", padding: "4px 8px", fontSize: "12px", height: "30px" }} value={findText} onChange={e => { setFindText(e.target.value); setCurrentMatchIndex(-1); }} />
                      <input type="text" placeholder="Replace with..." className="mkt-input" style={{ width: "130px", padding: "4px 8px", fontSize: "12px", height: "30px" }} value={replaceText} onChange={e => setReplaceText(e.target.value)} />
                      <button type="button" className="mkt-btn-secondary" style={{ padding: "2px 8px", fontSize: "11px", height: "30px", background: "rgba(233, 30, 140, 0.1)", color: "#ff6b9d", borderColor: "rgba(233, 30, 140, 0.3)" }} onClick={handleFind}>Find Next</button>
                      <button type="button" className="mkt-btn-secondary" style={{ padding: "2px 8px", fontSize: "11px", height: "30px" }} onClick={handleReplace}>Replace</button>
                      <button type="button" className="mkt-btn-secondary" style={{ padding: "2px 8px", fontSize: "11px", height: "30px" }} onClick={handleReplaceAll}>Replace All</button>
                    </div>
                    <textarea ref={textareaRef} className="mkt-textarea" style={{ height: "450px", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.5" }} value={templateForm.html} onChange={e => { setTemplateForm({...templateForm, html: e.target.value}); setCurrentMatchIndex(-1); }} required />
                  </div>
                  <div>
                    <label className="mkt-label">Live Sandbox Preview</label>
                    <div className="mkt-preview-pane">
                      <div className="mkt-preview-header">
                        <span>Subject: {templateForm.subject}</span>
                        <span>Width: 600px</span>
                      </div>
                      <iframe className="mkt-preview-iframe" srcDoc={getPreviewHtml(templateForm.html)} title="email-preview" />
                    </div>
                  </div>
                </div>
                <div style={{ marginTop: "20px" }}>
                  <button type="submit" className="mkt-btn">Save Template Content</button>
                </div>
              </form>
            </div>
          ) : (
            <div className="mkt-panel" style={{ textAlign: "center", padding: "80px" }}>
              Please add or select an email template from the list on the left to edit it.
            </div>
          )}
        </div>
      )}

      {/* Tab 4: SMTP Accounts */}
      {activeTab === "smtp" && (
        <div>
          <div className="mkt-layout-split" style={{ gridTemplateColumns: "350px 1fr" }}>
            <div className="mkt-panel">
              <h2 className="mkt-panel-title"><FaPlus /> Add Gmail Account</h2>
              <form onSubmit={handleAddSmtp}>
                <div className="mkt-form-group">
                  <label className="mkt-label">Gmail Email Address</label>
                  <input type="email" className="mkt-input" placeholder="heartecho@gmail.com" value={smtpForm.email} onChange={e => setSmtpForm({...smtpForm, email: e.target.value})} required />
                </div>
                <div className="mkt-form-group">
                  <label className="mkt-label">Google App Password</label>
                  <input type="password" className="mkt-input" placeholder="xxxx xxxx xxxx xxxx" value={smtpForm.pass} onChange={e => setSmtpForm({...smtpForm, pass: e.target.value})} required />
                  <small style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", display: "block", marginTop: "4px" }}>Generate this in your Google Account Settings under Security &gt; App Passwords.</small>
                </div>
                <div className="mkt-form-group">
                  <label className="mkt-label">Daily Limit (Bans Safeguard)</label>
                  <input type="number" className="mkt-input" value={smtpForm.limitDaily} onChange={e => setSmtpForm({...smtpForm, limitDaily: Number(e.target.value)})} required />
                </div>
                <button type="submit" className="mkt-btn">Add SMTP Account</button>
              </form>
            </div>

            <div className="mkt-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h2 className="mkt-panel-title" style={{ margin: 0 }}><FaWrench /> Active SMTP Credential Rotation</h2>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input type="email" className="mkt-input" style={{ width: "220px", padding: "6px 12px", fontSize: "12px" }} placeholder="Test recipient email address" value={testEmailAddress} onChange={e => setTestEmailAddress(e.target.value)} />
                </div>
              </div>
              {smtpList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                  <p style={{ color: "rgba(255,255,255,0.4)" }}>No custom SMTP accounts registered.</p>
                </div>
              ) : (
                <div className="smtp-grid">
                  {smtpList.map(cred => (
                    <div key={cred._id} className={`smtp-card ${!cred.active ? "inactive" : ""} ${cred.errorMessage ? "error" : ""}`}>
                      <div className="smtp-card-header">
                        <div className="smtp-email">{cred.email}</div>
                        <span className="smtp-tag">{cred.port === 465 ? "SSL" : "TLS"}</span>
                      </div>
                      <div className="smtp-card-body">
                        <div className="smtp-detail-row"><span>Limit Daily:</span><strong>{cred.limitDaily}</strong></div>
                        <div className="smtp-detail-row"><span>Sent Today:</span><strong style={{ color: cred.emailsSentToday >= cred.limitDaily ? "#ef4444" : "#22c55e" }}>{cred.emailsSentToday}</strong></div>
                        <div className="smtp-detail-row"><span>Host:</span><span>{cred.host}</span></div>
                        <div className="smtp-detail-row"><span>Status:</span><span style={{ color: cred.active ? "#22c55e" : "#ef4444" }}>{cred.active ? "Active" : "Disabled"}</span></div>
                      </div>
                      {cred.errorMessage && (<div className="smtp-error-banner"><FaExclamationTriangle style={{ marginRight: "4px" }} /> {cred.errorMessage}</div>)}
                      <div className="smtp-actions">
                        <button onClick={() => handleToggleSmtpStatus(cred._id, cred.active)} className="mkt-btn-secondary" style={{ padding: "4px 8px", fontSize: "11px" }}>{cred.active ? "Disable" : "Enable"}</button>
                        <button onClick={() => handleTestSmtp(cred._id)} className="mkt-btn-secondary" style={{ padding: "4px 8px", fontSize: "11px", borderColor: "rgba(233,30,140,0.4)", color: "#ff6b9d" }} disabled={testingSmtpId === cred._id}>{testingSmtpId === cred._id ? <FaSpinner className="fa-spin" /> : "Test Send"}</button>
                        <button onClick={() => handleDeleteSmtp(cred._id)} className="mkt-btn-danger" style={{ padding: "4px 8px", fontSize: "11px" }}><FaTrash /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
