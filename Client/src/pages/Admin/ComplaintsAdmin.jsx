'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  FaTicketAlt, FaTrash, FaEdit, FaSearch, FaCheckCircle, 
  FaTimesCircle, FaSync, FaDownload, FaChartBar, FaExclamationTriangle,
  FaEnvelope, FaTimes, FaMagic, FaPaperPlane, FaSpinner, FaEye
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from "recharts";
import api from "../../config/api";
import axios from "axios";

// ------------------- CSS STYLES -------------------
const styles = `
.cmp-root-x30sn {
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  animation: fade-in-x30sn 0.4s ease;
  background-color: #000;
  min-height: 100vh;
}
@keyframes fade-in-x30sn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

.cmp-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; flex-wrap: wrap; gap: 20px;
  background: #050505; padding: 20px; border-radius: 16px; border: 1px solid #222;
}
.cmp-title-group-x30sn h2 { font-size: 28px; font-weight: 800; margin: 0; color: #fff; letter-spacing: -0.5px; }
.cmp-title-group-x30sn p { color: #ff69b4; margin: 5px 0 0 0; font-size: 13px; font-weight: 500; }

.cmp-btn-x30sn {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #333;
  background: #111; color: #fff; transition: 0.2s;
}
.cmp-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }
.cmp-btn-x30sn.primary { background: #ff69b4; color: #000; border: none; }
.cmp-btn-x30sn.primary:hover { background: #ff4d9e; color: #000; }
.cmp-btn-x30sn:disabled { opacity: 0.5; cursor: not-allowed; }

.cmp-stats-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 30px;
}
.cmp-stat-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 14px; padding: 20px;
  display: flex; align-items: center; gap: 15px;
}
.cmp-stat-icon-x30sn {
  width: 48px; height: 48px; border-radius: 12px; background: rgba(255,105,180,0.1); color: #ff69b4;
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.cmp-stat-info-x30sn span { display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.cmp-stat-info-x30sn strong { font-size: 24px; color: #fff; font-weight: 700; }

.cmp-charts-row-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;
}
.cmp-chart-box-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px; height: 300px;
}

.cmp-filters-x30sn {
  background: #050505; padding: 15px; border-radius: 12px; border: 1px solid #222; margin-bottom: 25px;
  display: flex; gap: 15px; flex-wrap: wrap;
}
.cmp-search-wrap-x30sn { position: relative; flex: 1; min-width: 250px; }
.cmp-search-wrap-x30sn svg { position: absolute; left: 12px; top: 12px; color: #555; }
.cmp-input-x30sn {
  width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px 10px 10px 35px;
  border-radius: 8px; outline: none;
}
.cmp-select-x30sn { background: #000; color: #fff; border: 1px solid #333; padding: 10px 15px; border-radius: 8px; outline: none; }

.cmp-list-x30sn { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.cmp-ticket-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px;
  transition: 0.2s; position: relative; display: flex; flex-direction: column; justify-content: space-between;
}
.cmp-ticket-card-x30sn:hover { border-color: #ff69b4; }
.cmp-status-badge-x30sn {
  padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;
}
.cmp-status-badge-x30sn.pending { background: rgba(255,0,0,0.1); color: #ff4444; border: 1px solid rgba(255,0,0,0.2); }
.cmp-status-badge-x30sn.resolved { background: rgba(0,255,0,0.1); color: #00ff00; border: 1px solid rgba(0,255,0,0.2); }

.cmp-issue-text-x30sn { font-size: 15px; color: #fff; margin: 15px 0; line-height: 1.5; font-weight: 600; }
.cmp-user-data-x30sn { background: #000; padding: 12px; border-radius: 8px; font-size: 12px; color: #888; border: 1px solid #111; }
.cmp-user-data-x30sn div { margin-bottom: 4px; }
.cmp-user-data-x30sn strong { color: #ccc; }

.cmp-card-actions-x30sn { display: flex; gap: 8px; margin-top: 20px; justify-content: flex-end; }
.cmp-act-btn-x30sn {
  background: #111; color: #fff; border: 1px solid #222; width: 32px; height: 32px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;
}
.cmp-act-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }
.cmp-act-btn-x30sn.email-btn:hover { border-color: #a78bfa; color: #a78bfa; }

/* EDIT MODAL */
.cmp-modal-overlay-x30sn {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000;
  display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px);
}
.cmp-modal-content-x30sn {
  background: #000; border: 1px solid #333; border-radius: 20px; width: 90%; max-width: 500px; padding: 25px;
}
.cmp-modal-content-x30sn h3 { margin: 0 0 20px 0; font-size: 20px; color: #fff; }
.cmp-form-group-x30sn { margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px; }
.cmp-form-group-x30sn label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 700; }
.cmp-textarea-x30sn { background: #111; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 8px; resize: none; outline: none; }
.cmp-textarea-x30sn:focus { border-color: #ff69b4; }

/* EMAIL DIALOG */
.email-dialog-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 2000;
  display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px);
  padding: 20px;
}
.email-dialog-box {
  background: #080808; border: 1px solid #2a2a2a; border-radius: 20px;
  width: 100%; max-width: 1100px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(255,105,180,0.08);
}
.email-dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid #1a1a1a;
  background: #0d0d0d; flex-shrink: 0;
}
.email-dialog-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 17px; font-weight: 700; color: #fff;
}
.email-dialog-title svg { color: #a78bfa; font-size: 16px; }
.email-dialog-pill {
  background: rgba(167,139,250,0.1); color: #a78bfa; border: 1px solid rgba(167,139,250,0.2);
  padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-left: 8px;
}
.email-dialog-close {
  background: #1a1a1a; border: 1px solid #2a2a2a; color: #888; width: 32px; height: 32px;
  border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: 0.2s; font-size: 14px;
}
.email-dialog-close:hover { border-color: #ff4444; color: #ff4444; }

.email-dialog-body {
  display: grid; grid-template-columns: 1fr 1fr; flex: 1; overflow: hidden;
}
@media (max-width: 768px) { .email-dialog-body { grid-template-columns: 1fr; } }

/* LEFT: Preview */
.email-preview-panel {
  border-right: 1px solid #1a1a1a; display: flex; flex-direction: column; overflow: hidden;
}
.email-preview-header {
  padding: 12px 20px; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; flex-shrink: 0;
  display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 700;
}
.email-preview-header svg { color: #ff69b4; }
.email-preview-frame-wrap {
  flex: 1; overflow: auto; background: #120524;
}
.email-preview-frame {
  width: 100%; height: 100%; min-height: 500px; border: none; display: block;
}

/* RIGHT: Reply Editor */
.email-reply-panel {
  display: flex; flex-direction: column; overflow: hidden;
}
.email-reply-header {
  padding: 12px 20px; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; flex-shrink: 0;
  display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 700;
}
.email-reply-header svg { color: #a78bfa; }
.email-reply-body { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }

.email-ticket-info-strip {
  background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 10px; padding: 12px 14px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;
}
.einfo-item { color: #555; }
.einfo-item strong { color: #999; font-weight: 500; }

.email-complaint-box {
  background: rgba(255,68,68,0.04); border: 1px solid rgba(255,68,68,0.15);
  border-left: 3px solid #ff4444; border-radius: 8px; padding: 12px 14px;
}
.email-complaint-label { font-size: 10px; color: #ff6666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 6px; }
.email-complaint-text { font-size: 13px; color: #ddd; line-height: 1.5; font-style: italic; }

.email-reply-label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }
.email-reply-label svg { color: #a78bfa; }

.ai-reply-textarea {
  width: 100%; background: #0d0d0d; border: 1px solid #2a2a2a; color: #fff;
  padding: 14px; border-radius: 10px; outline: none; resize: vertical;
  font-size: 13px; line-height: 1.6; font-family: inherit; min-height: 160px;
  transition: 0.2s;
}
.ai-reply-textarea:focus { border-color: #a78bfa; box-shadow: 0 0 0 2px rgba(167,139,250,0.08); }

.ai-status-bar {
  display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 8px 12px;
  border-radius: 8px; font-weight: 500;
}
.ai-status-bar.loading { background: rgba(167,139,250,0.08); color: #a78bfa; }
.ai-status-bar.success { background: rgba(34,197,94,0.08); color: #22c55e; }
.ai-status-bar.error { background: rgba(239,68,68,0.08); color: #ef4444; }

.email-action-row {
  display: flex; gap: 10px; flex-wrap: wrap;
}
.btn-regenerate {
  display: flex; align-items: center; gap: 7px; padding: 9px 14px; border-radius: 8px;
  font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #2a2a2a;
  background: #111; color: #a78bfa; transition: 0.2s; flex: 1;
}
.btn-regenerate:hover:not(:disabled) { border-color: #a78bfa; background: rgba(167,139,250,0.08); }
.btn-regenerate:disabled { opacity: 0.5; cursor: not-allowed; }

.btn-send-email {
  display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 700; cursor: pointer; border: none;
  background: linear-gradient(135deg, #ff69b4, #e91e8c); color: #fff;
  transition: 0.2s; flex: 2;
  box-shadow: 0 4px 15px rgba(233,30,140,0.25);
}
.btn-send-email:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(233,30,140,0.35); }
.btn-send-email:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.spin { animation: spin-anim 1s linear infinite; }
@keyframes spin-anim { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }

.send-success-banner {
  background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25);
  border-radius: 10px; padding: 14px 16px; text-align: center;
  color: #22c55e; font-weight: 600; font-size: 14px;
}
.send-error-banner {
  background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25);
  border-radius: 10px; padding: 12px 14px; text-align: center;
  color: #ef4444; font-weight: 500; font-size: 13px;
}

/* PAGINATION */
.cmp-pagination-x30sn { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px; padding-bottom: 50px; }
.cmp-page-num-x30sn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px;
  background: #000; border: 1px solid #333; color: #888; cursor: pointer;
}
.cmp-page-num-x30sn.active { background: #ff69b4; color: #000; border-color: #ff69b4; font-weight: 700; }
`;

// ── Build email HTML for preview iframe ──────────────────────
const buildEmailHtml = (ticket, adminReply) => {
  const user = ticket.user || {};
  const ticketIdShort = ticket._id?.toString().substring(0, 8) || "--------";
  const dateStr = new Date(ticket.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const tierMap = { none: "Free", monthly: "Monthly", yearly: "Yearly", yearly_pro: "Yearly Pro" };
  const tierDisplay = tierMap[user.subscriptionTier] || "Free";

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Ticket Update - HeartEcho</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    html, body { margin: 0; padding: 0; height: 100%; width: 100%; -webkit-text-size-adjust: 100%; background-color: #120524; }
    * { box-sizing: border-box; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; color: #e2d8f0; padding: 20px 10px; font-size: 14px; line-height: 1.6; }
    .container { max-width: 540px; margin: 0 auto; background-color: #0f0620; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
    .header { background-color: #160a2b; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
    .brand { font-weight: 600; font-size: 16px; color: #fff; }
    .brand span { color: #ff4099; }
    .ticket-id { font-size: 13px; color: #a395b5; }
    .content { padding: 24px; }
    .greeting { font-size: 16px; font-weight: 500; color: #fff; margin-bottom: 16px; }
    .ticket-info { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 16px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 12px; font-size: 13px; }
    .info-item { color: #a395b5; }
    .info-item strong { color: #fff; font-weight: 500; }
    .status-badge { background: rgba(233,30,140,0.15); color: #ff6b9d; padding: 2px 6px; border-radius: 4px; font-size: 11px; font-weight: 600; text-transform: uppercase; }
    .thread { margin-bottom: 24px; }
    .message-block { margin-bottom: 16px; padding: 16px; border-radius: 8px; }
    .message-header { font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px; }
    .msg-user { background: rgba(255,255,255,0.03); border-left: 3px solid #5a4b70; }
    .msg-user .message-header { color: #a395b5; }
    .msg-user p { margin: 0; color: #cfc2df; font-style: italic; }
    .msg-admin { background: linear-gradient(180deg, rgba(233,30,140,0.05) 0%, rgba(233,30,140,0.01) 100%); border-left: 3px solid #e91e8c; }
    .msg-admin .message-header { color: #ff6b9d; }
    .msg-admin p { margin: 0; color: #fff; white-space: pre-wrap; }
    .footer { background-color: #160a2b; padding: 20px 24px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 13px; color: #a395b5; text-align: center; }
    .help-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.1); padding: 12px; border-radius: 6px; margin-bottom: 12px; }
    .footer a { color: #ff6b9d; text-decoration: none; font-weight: 500; }
    @media (max-width: 480px) { .ticket-info { grid-template-columns: 1fr; } }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Heart<span>Echo</span> Support</div>
      <div class="ticket-id">ID: #${ticketIdShort}</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${user.name || "there"},</div>
      <p style="margin-top: 0;">Your support ticket has been updated by our team. Please review the response below.</p>
      <div class="ticket-info">
        <div class="info-item">Date: <strong>${dateStr}</strong></div>
        <div class="info-item">Status: <span class="status-badge">Replied</span></div>
        <div class="info-item">Account: <strong>${user.email || "N/A"}</strong></div>
        <div class="info-item">Tier: <strong>${tierDisplay}</strong></div>
      </div>
      <div class="thread">
        <div class="message-block msg-user">
          <div class="message-header">Your Report</div>
          <p>"${(ticket.issue || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</p>
        </div>
        <div class="message-block msg-admin">
          <div class="message-header">Our Reply</div>
          <p>${(adminReply || "Your reply will appear here...").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="help-box">
        Still having issues? Email us directly at <br>
        <a href="mailto:heartecho.help@gmail.com?subject=Ticket #${ticketIdShort}">heartecho.help@gmail.com</a>
        <br><span style="font-size: 12px; opacity: 0.8; display: inline-block; margin-top: 4px;">*Please include your Ticket ID <strong>#${ticketIdShort}</strong> in the email.</span>
      </div>
      <p style="margin: 0;">HeartEcho Support Team</p>
    </div>
  </div>
</body>
</html>`;
};

// ── Email Reply Dialog Component ──────────────────────────────
const EmailReplyDialog = ({ ticket, onClose, onSent, token }) => {
  const [adminReply, setAdminReply] = useState("");
  const [aiStatus, setAiStatus] = useState("idle"); // idle | loading | done | error
  const [sendStatus, setSendStatus] = useState("idle"); // idle | sending | success | error
  const [sendMsg, setSendMsg] = useState("");
  const iframeRef = useRef(null);

  // Auto-fetch AI reply on mount
  useEffect(() => {
    fetchAiReply();
  }, []);

  // Update iframe whenever adminReply changes
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(buildEmailHtml(ticket, adminReply));
        doc.close();
      }
    }
  }, [adminReply, ticket]);

  const fetchAiReply = async () => {
    setAiStatus("loading");
    try {
      const res = await axios.post(
        `${api.Url}/admin/tickets/ai-suggest`,
        {
          issue: ticket.issue,
          userName: ticket.user?.name,
          tier: ticket.user?.subscriptionTier,
          ticketId: ticket._id?.toString().substring(0, 8)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAdminReply(res.data.reply);
        setAiStatus("done");
      } else {
        setAiStatus("error");
      }
    } catch (err) {
      console.error("AI suggest error:", err);
      setAiStatus("error");
      setAdminReply(`Hi ${ticket.user?.name || "there"}, thank you for reaching out to HeartEcho Support! We've reviewed your complaint and our team is working on a fix. Please try restarting the app and clearing the cache. If the issue persists, we'll resolve it within 24 hours.\n\n— HeartEcho Support Team`);
    }
  };

  const handleSend = async () => {
    if (!adminReply.trim()) return;
    setSendStatus("sending");
    setSendMsg("");
    try {
      const res = await axios.post(
        `${api.Url}/admin/tickets/${ticket._id}/email-reply`,
        { adminReply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSendStatus("success");
        setSendMsg(`✅ Email sent to ${ticket.user?.email} — Ticket marked Resolved!`);
        setTimeout(() => { onSent(ticket._id); onClose(); }, 2200);
      } else {
        setSendStatus("error");
        setSendMsg("Failed to send email. Try again.");
      }
    } catch (err) {
      setSendStatus("error");
      setSendMsg(err.response?.data?.message || "Error sending email.");
    }
  };

  const ticketIdShort = ticket._id?.toString().substring(0, 8) || "--------";
  const tierMap = { none: "Free", monthly: "Monthly", yearly: "Yearly", yearly_pro: "Yearly Pro" };

  return (
    <div className="email-dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="email-dialog-box">
        {/* Header */}
        <div className="email-dialog-header">
          <div className="email-dialog-title">
            <FaEnvelope />
            Email Reply to Complaint
            <span className="email-dialog-pill">#{ticketIdShort}</span>
          </div>
          <button className="email-dialog-close" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Body */}
        <div className="email-dialog-body">
          {/* LEFT — Email Preview */}
          <div className="email-preview-panel">
            <div className="email-preview-header">
              <FaEye /> Live Email Preview
            </div>
            <div className="email-preview-frame-wrap">
              <iframe
                ref={iframeRef}
                className="email-preview-frame"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>

          {/* RIGHT — Reply Editor */}
          <div className="email-reply-panel">
            <div className="email-reply-header">
              <FaMagic /> AI Reply Editor
            </div>
            <div className="email-reply-body">
              {/* Ticket Info Strip */}
              <div className="email-ticket-info-strip">
                <div className="einfo-item">To: <strong>{ticket.user?.email || "N/A"}</strong></div>
                <div className="einfo-item">User: <strong>{ticket.user?.name || "Anonymous"}</strong></div>
                <div className="einfo-item">Tier: <strong>{tierMap[ticket.user?.subscriptionTier] || "Free"}</strong></div>
                <div className="einfo-item">Date: <strong>{new Date(ticket.date).toLocaleDateString()}</strong></div>
              </div>

              {/* Complaint */}
              <div className="email-complaint-box">
                <div className="email-complaint-label">User's Complaint</div>
                <div className="email-complaint-text">"{ticket.issue}"</div>
              </div>

              {/* AI Status */}
              {aiStatus === "loading" && (
                <div className="ai-status-bar loading">
                  <FaSpinner className="spin" /> Generating AI reply using free OpenRouter model...
                </div>
              )}
              {aiStatus === "done" && (
                <div className="ai-status-bar success">
                  ✨ AI reply ready — review and edit before sending
                </div>
              )}
              {aiStatus === "error" && (
                <div className="ai-status-bar error">
                  ⚠️ AI fallback reply loaded — you can edit it
                </div>
              )}

              {/* Reply Textarea */}
              <div>
                <div className="email-reply-label">
                  <FaMagic /> Your Reply (editable)
                </div>
                <textarea
                  className="ai-reply-textarea"
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Reply will appear here after AI generates it..."
                  rows={7}
                />
              </div>

              {/* Action Buttons */}
              <div className="email-action-row">
                <button
                  className="btn-regenerate"
                  onClick={fetchAiReply}
                  disabled={aiStatus === "loading" || sendStatus === "sending" || sendStatus === "success"}
                >
                  {aiStatus === "loading" ? <FaSpinner className="spin" /> : <FaMagic />}
                  Regenerate
                </button>
                <button
                  className="btn-send-email"
                  onClick={handleSend}
                  disabled={!adminReply.trim() || sendStatus === "sending" || sendStatus === "success"}
                >
                  {sendStatus === "sending" ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                  {sendStatus === "sending" ? "Sending..." : "Send Email"}
                </button>
              </div>

              {/* Send Status */}
              {sendStatus === "success" && <div className="send-success-banner">{sendMsg}</div>}
              {sendStatus === "error" && <div className="send-error-banner">{sendMsg}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const ComplaintsAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editTicket, setEditTicket] = useState(null);
  const [emailTicket, setEmailTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const ticketsPerPage = 6;

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchTickets = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setTickets(response.data.data || []);
    } catch (error) {
      console.error(error);
      setTickets([]);
    }
  }, [getToken]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try { await fetchTickets(); } 
    catch (error) { console.error(error); } 
    finally { setRefreshing(false); setLoading(false); }
  }, [fetchTickets]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const stats = useMemo(() => {
    const totalCount = tickets.length;
    const pendingCount = tickets.filter(t => t.status === "Pending").length;
    const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
    return { totalCount, pendingCount, resolvedCount, resolutionRate: totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0 };
  }, [tickets]);

  const dailyTicketsData = useMemo(() => {
    const dailyCounts = tickets.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dailyCounts).slice(-7).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tickets: count
    }));
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const name = t.user?.name || "Unknown";
      const email = t.user?.email || "";
      const matchesSearch = t.issue?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, filterStatus]);

  const paginatedTickets = filteredTickets.slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const handleDelete = async (id) => {
    if (!confirm("Delete this complaint?")) return;
    try {
      const token = getToken();
      await axios.delete(`${api.Url}/admin/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTickets(tickets.filter(t => t._id !== id));
    } catch (e) { alert("Delete failed"); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await axios.put(`${api.Url}/admin/tickets/${editTicket._id}`, editTicket, { headers: { Authorization: `Bearer ${token}` } });
      setTickets(tickets.map(t => t._id === editTicket._id ? response.data.data : t));
      setEditTicket(null);
    } catch (e) { alert("Update failed"); }
  };

  // Called after email is sent — mark ticket resolved in local state
  const handleEmailSent = (ticketId) => {
    setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status: "Resolved" } : t));
  };

  if (loading) return <div className="cmp-root-x30sn" style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'100vh'}}><FaSync style={{color:'#ff69b4', fontSize: 30}} className="spin"/></div>;

  return (
    <>
      <style>{styles}</style>
      <div className="cmp-root-x30sn">
        
        {/* HEADER */}
        <div className="cmp-header-x30sn">
          <div className="cmp-title-group-x30sn">
            <h2>Complaints Center</h2>
            <p>User Support & Ticketing — click 📧 to email reply a ticket</p>
          </div>
        </div>

        {/* STATS */}
        <div className="cmp-stats-grid-x30sn">
          <div className="cmp-stat-card-x30sn">
            <div className="cmp-stat-icon-x30sn"><FaTicketAlt/></div>
            <div className="cmp-stat-info-x30sn"><span>Total</span><strong>{stats.totalCount}</strong></div>
          </div>
          <div className="cmp-stat-card-x30sn">
            <div className="cmp-stat-icon-x30sn" style={{color:'#ff4444'}}><FaExclamationTriangle/></div>
            <div className="cmp-stat-info-x30sn"><span>Pending</span><strong>{stats.pendingCount}</strong></div>
          </div>
          <div className="cmp-stat-card-x30sn">
            <div className="cmp-stat-icon-x30sn" style={{color:'#00ff00'}}><FaCheckCircle/></div>
            <div className="cmp-stat-info-x30sn"><span>Resolved</span><strong>{stats.resolvedCount}</strong></div>
          </div>
          <div className="cmp-stat-card-x30sn">
            <div className="cmp-stat-icon-x30sn" style={{color:'#ff69b4'}}><FaChartBar/></div>
            <div className="cmp-stat-info-x30sn"><span>Resolution</span><strong>{stats.resolutionRate.toFixed(0)}%</strong></div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="cmp-charts-row-x30sn">
          <div className="cmp-chart-box-x30sn">
            <h4 style={{margin:'0 0 15px 0', fontSize:14}}>Status Distribution</h4>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={[{name:'Pending', value:stats.pendingCount}, {name:'Resolved', value:stats.resolvedCount}]} innerRadius={60} outerRadius={80} dataKey="value">
                  <Cell fill="#ff4444" /><Cell fill="#00ff00" />
                </Pie>
                <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="cmp-chart-box-x30sn">
            <h4 style={{margin:'0 0 15px 0', fontSize:14}}>Ticket Flow (Daily)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={dailyTicketsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222"/>
                <XAxis dataKey="date" stroke="#555" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,105,180,0.1)'}} contentStyle={{background:'#000', border:'1px solid #333'}} />
                <Bar dataKey="tickets" fill="#ff69b4" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILTERS */}
        <div className="cmp-filters-x30sn">
          <div className="cmp-search-wrap-x30sn">
            <FaSearch />
            <input className="cmp-input-x30sn" placeholder="Search by issue, user name, or email..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="cmp-select-x30sn" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Tickets</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* TICKET LIST */}
        <div className="cmp-list-x30sn">
          {paginatedTickets.map(ticket => (
            <div key={ticket._id} className="cmp-ticket-card-x30sn">
              <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span className={`cmp-status-badge-x30sn ${ticket.status?.toLowerCase()}`}>{ticket.status}</span>
                  <span style={{fontSize:11, color:'#555'}}>{new Date(ticket.date).toLocaleDateString()}</span>
                </div>
                <div className="cmp-issue-text-x30sn">{ticket.issue}</div>
                
                <div className="cmp-user-data-x30sn" style={{display:'flex', flexDirection:'column', gap:'6px'}}>
                  <div style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #1a1a1a', paddingBottom:'4px'}}>
                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'70%'}}>
                      <strong style={{color:'#ff69b4'}}>User:</strong> {ticket.user?.name || "Anonymous"}
                    </span>
                    <span style={{color: ticket.user?.user_type === 'subscriber' ? '#00ff00' : '#888', textTransform:'capitalize', fontSize:'11px', fontWeight:'bold'}}>
                      {ticket.user?.user_type || "Free"}
                    </span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <span style={{whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%'}}>
                      <strong>Email:</strong> {ticket.user?.email || "N/A"}
                    </span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between'}}>
                    <span><strong>Phone:</strong> {ticket.user?.phone_number || "N/A"}</span>
                    <span><strong>Age:</strong> {ticket.user?.age || "N/A"} • <span style={{textTransform:'capitalize'}}>{ticket.user?.gender || "N/A"}</span></span>
                  </div>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                    <span><strong>Tier:</strong> <span style={{textTransform:'capitalize'}}>{ticket.user?.subscriptionTier || "none"}</span></span>
                    <span style={{fontSize:'10px'}}><strong>ID:</strong> {ticket.user?._id ? ticket.user._id.toString().substring(0,8) + '...' : "N/A"}</span>
                  </div>
                </div>
              </div>
              <div className="cmp-card-actions-x30sn">
                {/* Email Reply Button */}
                <button
                  className="cmp-act-btn-x30sn email-btn"
                  onClick={() => setEmailTicket(ticket)}
                  title="Send Email Reply"
                  style={{width:'auto', padding:'0 10px', gap:'5px', fontSize:12, fontWeight:600}}
                >
                  <FaEnvelope style={{fontSize:12}} />
                  <span>Email</span>
                </button>
                <button className="cmp-act-btn-x30sn" onClick={() => setEditTicket(ticket)} title="Edit Status"><FaEdit/></button>
                <button className="cmp-act-btn-x30sn del" onClick={() => handleDelete(ticket._id)} title="Delete Ticket"><FaTrash/></button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="cmp-pagination-x30sn">
            <button className="cmp-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`cmp-page-num-x30sn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="cmp-btn-x30sn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        )}

        {/* EDIT MODAL */}
        {editTicket && (
          <div className="cmp-modal-overlay-x30sn">
            <form onSubmit={handleEditSubmit} className="cmp-modal-content-x30sn">
              <h3>Edit Complaint</h3>
              <div className="cmp-form-group-x30sn">
                <label>Status</label>
                <select className="cmp-select-x30sn" value={editTicket.status} onChange={e => setEditTicket({...editTicket, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="cmp-form-group-x30sn">
                <label>Issue Description</label>
                <textarea className="cmp-textarea-x30sn" rows={5} value={editTicket.issue} onChange={e => setEditTicket({...editTicket, issue: e.target.value})} />
              </div>
              <div style={{display:'flex', gap:10, marginTop:20, justifyContent:'flex-end'}}>
                <button type="button" className="cmp-btn-x30sn" onClick={() => setEditTicket(null)}>Cancel</button>
                <button type="submit" className="cmp-btn-x30sn primary">Update Ticket</button>
              </div>
            </form>
          </div>
        )}

        {/* EMAIL REPLY DIALOG */}
        {emailTicket && (
          <EmailReplyDialog
            ticket={emailTicket}
            token={getToken()}
            onClose={() => setEmailTicket(null)}
            onSent={handleEmailSent}
          />
        )}
      </div>
    </>
  );
};

export default ComplaintsAdmin;