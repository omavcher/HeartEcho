'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../config/api";
import { 
  FaEnvelope, FaEnvelopeOpen, FaLink, FaCoins, FaCheckCircle, 
  FaTrash, FaPaperPlane, FaSpinner, FaPlus, FaWrench, 
  FaExclamationTriangle, FaList, FaRegChartBar, FaGlobe, FaEdit 
} from "react-icons/fa";
import "./EmailMarketingAdmin.css";

export default function EmailMarketingAdmin() {
  const [activeTab, setActiveTab] = useState("campaigns");
  const [stats, setStats] = useState(null);
  const [smtpList, setSmtpList] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
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
    name: "", templateId: "", targetAudience: "all", subjectOverride: ""
  });

  // Action feedback
  const [message, setMessage] = useState({ text: "", type: "" });

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
      const [resStats, resSmtp, resTemplates, resCampaigns] = await Promise.all([
        axios.get(`${api.Url}/email-marketing/dashboard`, headers),
        axios.get(`${api.Url}/email-marketing/smtp`, headers),
        axios.get(`${api.Url}/email-marketing/templates`, headers),
        axios.get(`${api.Url}/email-marketing/campaigns`, headers)
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
    } catch (error) {
      console.error("Error loading email marketing data:", error);
      showFeedback("Failed to load marketing dashboard data", "error");
    } finally {
      setLoading(false);
    }
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
    } catch (err) {
      showFeedback(err.response?.data?.error || "Failed to add SMTP account", "error");
    }
  };

  const handleToggleSmtpStatus = async (id, currentActive) => {
    try {
      await axios.put(`${api.Url}/email-marketing/smtp/${id}`, { active: !currentActive }, getHeaders());
      showFeedback("SMTP status updated!");
      fetchDashboardData();
    } catch (err) {
      showFeedback("Failed to update SMTP status", "error");
    }
  };

  const handleDeleteSmtp = async (id) => {
    if (!window.confirm("Are you sure you want to delete this SMTP account?")) return;
    try {
      await axios.delete(`${api.Url}/email-marketing/smtp/${id}`, getHeaders());
      showFeedback("SMTP account deleted!");
      fetchDashboardData();
    } catch (err) {
      showFeedback("Failed to delete SMTP account", "error");
    }
  };

  const handleTestSmtp = async (id) => {
    if (!testEmailAddress) {
      showFeedback("Please enter a test email address first", "error");
      return;
    }
    setTestingSmtpId(id);
    try {
      const res = await axios.post(
        `${api.Url}/email-marketing/smtp/${id}/test`, 
        { testEmail: testEmailAddress }, 
        getHeaders()
      );
      if (res.data.success) {
        showFeedback("SMTP connection test succeeded! Check inbox.");
        setTestEmailAddress("");
      }
    } catch (err) {
      showFeedback(err.response?.data?.error || "SMTP verification failed", "error");
    } finally {
      setTestingSmtpId(null);
    }
  };

  // ==========================================
  // TEMPLATES LOGIC
  // ==========================================
  const handleSelectTemplate = (tpl) => {
    setSelectedTemplate(tpl);
    setTemplateForm({
      name: tpl.name,
      label: tpl.label,
      subject: tpl.subject,
      html: tpl.html
    });
  };

  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!selectedTemplate) return;
    try {
      const res = await axios.put(
        `${api.Url}/email-marketing/templates/${selectedTemplate._id}`,
        templateForm,
        getHeaders()
      );
      if (res.data.success) {
        showFeedback("Email template saved!");
        // Update local list
        setTemplates(prev => prev.map(t => t._id === selectedTemplate._id ? res.data.data : t));
        setSelectedTemplate(res.data.data);
      }
    } catch (err) {
      showFeedback("Failed to save template", "error");
    }
  };

  // Get dynamic preview replacing brackets variables
  const getPreviewHtml = (html) => {
    if (!html) return "";
    return html
      .replace(/{{first_name}}/g, "Om")
      .replace(/{{email}}/g, "omawchar07@gmail.com")
      .replace(/{{offer_end_date}}/g, new Date(Date.now() + 2*24*60*60*1000).toLocaleDateString("en-IN", {
        day: "numeric", month: "long", year: "numeric"
      }));
  };

  // ==========================================
  // CAMPAIGNS LOGIC
  // ==========================================
  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.templateId) {
      showFeedback("Please select an email template", "error");
      return;
    }
    setLoading(true);
    try {
      const res = await axios.post(`${api.Url}/email-marketing/campaigns`, campaignForm, getHeaders());
      if (res.data.success) {
        showFeedback(res.data.message || "Campaign queued and triggered successfully!");
        setCampaignForm({ name: "", templateId: "", targetAudience: "all", subjectOverride: "" });
        fetchDashboardData();
      }
    } catch (err) {
      showFeedback(err.response?.data?.error || "Failed to trigger campaign", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCampaign = async (id) => {
    if (!window.confirm("Are you sure you want to delete this campaign? All queue items and logs will be deleted!")) return;
    try {
      await axios.delete(`${api.Url}/email-marketing/campaigns/${id}`, getHeaders());
      showFeedback("Campaign deleted successfully!");
      fetchDashboardData();
    } catch (err) {
      showFeedback("Failed to delete campaign", "error");
    }
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
            <p className="mkt-desc">Manage rotating SMTP accounts, custom HTML templates, email campaign distribution, and conversion analytics.</p>
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
                    type="text" 
                    className="mkt-input" 
                    placeholder="e.g. Diwali Premium Push" 
                    value={campaignForm.name} 
                    onChange={e => setCampaignForm({...campaignForm, name: e.target.value})} 
                    required 
                  />
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Select Email Template</label>
                  <select 
                    className="mkt-select" 
                    value={campaignForm.templateId} 
                    onChange={e => setCampaignForm({...campaignForm, templateId: e.target.value})}
                    required
                  >
                    <option value="">-- Choose template --</option>
                    {templates.map(t => (
                      <option key={t._id} value={t._id}>{t.label} ({t.name})</option>
                    ))}
                  </select>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Target Audience Segment</label>
                  <select 
                    className="mkt-select" 
                    value={campaignForm.targetAudience} 
                    onChange={e => setCampaignForm({...campaignForm, targetAudience: e.target.value})}
                  >
                    <option value="all">All Registered Users</option>
                    <option value="free">Free Tier Users Only</option>
                    <option value="subscribers">Subscribers Only</option>
                    <option value="inactive_7d">Inactive (No logins last 7 days)</option>
                    <option value="inactive_30d">Inactive (No logins last 30 days)</option>
                  </select>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Subject Line Override (Optional)</label>
                  <input 
                    type="text" 
                    className="mkt-input" 
                    placeholder="Default template subject will be used if left blank" 
                    value={campaignForm.subjectOverride} 
                    onChange={e => setCampaignForm({...campaignForm, subjectOverride: e.target.value})} 
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
                <div style={{ textAlign: "center", padding: "40px", color: "rgba(255,255,255,0.4)" }}>
                  No campaigns dispatched yet.
                </div>
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
                              <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.4)" }}>
                                {c.template?.label || "Custom Template"}
                              </div>
                            </td>
                            <td>
                              <span className={`badge-status pending`}>{c.targetAudience}</span>
                            </td>
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

      {/* Tab 2: Templates */}
      {activeTab === "templates" && (
        <div className="mkt-template-layout">
          {/* Templates sidebar */}
          <div className="mkt-template-list">
            <h3 style={{ fontSize: "14px", fontWeight: "600", marginBottom: "12px", textTransform: "uppercase", color: "rgba(255,255,255,0.4)" }}>Select Template</h3>
            {templates.map(t => (
              <div 
                key={t._id} 
                className={`mkt-template-item ${selectedTemplate?._id === t._id ? "active" : ""}`}
                onClick={() => handleSelectTemplate(t)}
              >
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
                  <input 
                    type="text" 
                    className="mkt-input" 
                    value={templateForm.subject} 
                    onChange={e => setTemplateForm({...templateForm, subject: e.target.value})} 
                    required 
                  />
                </div>

                <div className="mkt-editor-preview-split">
                  {/* Raw HTML Code */}
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
                    <textarea 
                      className="mkt-textarea" 
                      style={{ height: "450px", fontFamily: "monospace", fontSize: "12px", lineHeight: "1.5" }}
                      value={templateForm.html} 
                      onChange={e => setTemplateForm({...templateForm, html: e.target.value})} 
                      required 
                    />
                  </div>

                  {/* Render Preview Frame */}
                  <div>
                    <label className="mkt-label">Live Sandbox Preview</label>
                    <div className="mkt-preview-pane">
                      <div className="mkt-preview-header">
                        <span>Subject: {templateForm.subject}</span>
                        <span>Width: 600px</span>
                      </div>
                      <iframe 
                        className="mkt-preview-iframe"
                        srcDoc={getPreviewHtml(templateForm.html)}
                        title="email-preview"
                      />
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "20px" }}>
                  <button type="submit" className="mkt-btn">
                    Save Template Content
                  </button>
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

      {/* Tab 3: SMTP Accounts */}
      {activeTab === "smtp" && (
        <div>
          <div className="mkt-layout-split" style={{ gridTemplateColumns: "350px 1fr" }}>
            {/* Add SMTP form */}
            <div className="mkt-panel">
              <h2 className="mkt-panel-title"><FaPlus /> Add Gmail Account</h2>
              <form onSubmit={handleAddSmtp}>
                <div className="mkt-form-group">
                  <label className="mkt-label">Gmail Email Address</label>
                  <input 
                    type="email" 
                    className="mkt-input" 
                    placeholder="heartecho@gmail.com" 
                    value={smtpForm.email} 
                    onChange={e => setSmtpForm({...smtpForm, email: e.target.value})} 
                    required 
                  />
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Google App Password</label>
                  <input 
                    type="password" 
                    className="mkt-input" 
                    placeholder="xxxx xxxx xxxx xxxx" 
                    value={smtpForm.pass} 
                    onChange={e => setSmtpForm({...smtpForm, pass: e.target.value})} 
                    required 
                  />
                  <small style={{ fontSize: "11px", color: "rgba(255,255,255,0.45)", display: "block", marginTop: "4px" }}>
                    Generate this in your Google Account Settings under Security &gt; App Passwords.
                  </small>
                </div>

                <div className="mkt-form-group">
                  <label className="mkt-label">Daily Limit (Bans Safeguard)</label>
                  <input 
                    type="number" 
                    className="mkt-input" 
                    value={smtpForm.limitDaily} 
                    onChange={e => setSmtpForm({...smtpForm, limitDaily: Number(e.target.value)})} 
                    required 
                  />
                </div>

                <button type="submit" className="mkt-btn">
                  Add SMTP Account
                </button>
              </form>
            </div>

            {/* SMTP List & Health check */}
            <div className="mkt-panel">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                <h2 className="mkt-panel-title" style={{ margin: 0 }}><FaWrench /> Active SMTP Credential Rotation</h2>
                
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <input 
                    type="email" 
                    className="mkt-input" 
                    style={{ width: "220px", padding: "6px 12px", fontSize: "12px" }}
                    placeholder="Test recipient email address" 
                    value={testEmailAddress}
                    onChange={e => setTestEmailAddress(e.target.value)}
                  />
                </div>
              </div>

              {smtpList.length === 0 ? (
                <div style={{ textAlign: "center", padding: "50px", border: "1px dashed rgba(255,255,255,0.1)", borderRadius: "8px" }}>
                  <p style={{ color: "rgba(255,255,255,0.4)" }}>No custom SMTP accounts registered.</p>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.3)", marginTop: "6px" }}>
                    The system is currently using fallback credentials from your environment variables: <strong>{process.env.EMAIL_USER || "EMAIL_USER"}</strong>.
                  </p>
                </div>
              ) : (
                <div className="smtp-grid">
                  {smtpList.map(cred => (
                    <div 
                      key={cred._id} 
                      className={`smtp-card ${!cred.active ? "inactive" : ""} ${cred.errorMessage ? "error" : ""}`}
                    >
                      <div className="smtp-card-header">
                        <div className="smtp-email">{cred.email}</div>
                        <span className="smtp-tag">{cred.port === 465 ? "SSL" : "TLS"}</span>
                      </div>

                      <div className="smtp-card-body">
                        <div className="smtp-detail-row">
                          <span>Limit Daily:</span>
                          <strong>{cred.limitDaily}</strong>
                        </div>
                        <div className="smtp-detail-row">
                          <span>Sent Today:</span>
                          <strong style={{ color: cred.emailsSentToday >= cred.limitDaily ? "#ef4444" : "#22c55e" }}>
                            {cred.emailsSentToday}
                          </strong>
                        </div>
                        <div className="smtp-detail-row">
                          <span>Host:</span>
                          <span>{cred.host}</span>
                        </div>
                        <div className="smtp-detail-row">
                          <span>Status:</span>
                          <span style={{ color: cred.active ? "#22c55e" : "#ef4444" }}>
                            {cred.active ? "Active" : "Disabled"}
                          </span>
                        </div>
                      </div>

                      {cred.errorMessage && (
                        <div className="smtp-error-banner">
                          <FaExclamationTriangle style={{ marginRight: "4px" }} /> {cred.errorMessage}
                        </div>
                      )}

                      <div className="smtp-actions">
                        <button 
                          onClick={() => handleToggleSmtpStatus(cred._id, cred.active)} 
                          className="mkt-btn-secondary" 
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                        >
                          {cred.active ? "Disable" : "Enable"}
                        </button>
                        <button 
                          onClick={() => handleTestSmtp(cred._id)} 
                          className="mkt-btn-secondary" 
                          style={{ padding: "4px 8px", fontSize: "11px", borderColor: "rgba(233,30,140,0.4)", color: "#ff6b9d" }}
                          disabled={testingSmtpId === cred._id}
                        >
                          {testingSmtpId === cred._id ? <FaSpinner className="fa-spin" /> : "Test Send"}
                        </button>
                        <button 
                          onClick={() => handleDeleteSmtp(cred._id)} 
                          className="mkt-btn-danger" 
                          style={{ padding: "4px 8px", fontSize: "11px" }}
                        >
                          <FaTrash />
                        </button>
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
