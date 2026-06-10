'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import {
  FaTrash, FaSearch, FaSync, FaUserSlash, FaIdBadge, FaPhone,
  FaHistory, FaCalendarAlt, FaEnvelope, FaTimes, FaMagic,
  FaPaperPlane, FaSpinner, FaEye, FaStar
} from "react-icons/fa";
import axios from "axios";
import api from "../../config/api";

const deletedStyles = `
/* ROOT THEME */
.deleted-root-x30sn {
  color: #fff;
  font-family: 'Inter', sans-serif;
  animation: fadeIn-x30sn 0.5s ease;
}
@keyframes fadeIn-x30sn { from { opacity: 0; } to { opacity: 1; } }

/* HEADER */
.u-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; flex-wrap: wrap; gap: 15px;
}
.u-title-x30sn { font-size: 28px; font-weight: 800; color: #fff; margin: 0; }
.u-tagline-x30sn { color: #ff4444; font-size: 13px; font-weight: 500; }

.u-sync-btn-x30sn {
  background: #000; border: 1px solid #333; color: #ff69b4; width: 42px; height: 42px;
  border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.u-sync-btn-x30sn:hover { background: #1a1a1a; transform: rotate(180deg); border-color: #ff69b4; }

/* CONTROLS */
.controls-x30sn {
  display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap;
  background: #050505; padding: 15px; border-radius: 12px; border: 1px solid #222;
}
.search-wrap-x30sn {
  position: relative; flex: 1; min-width: 250px;
}
.search-wrap-x30sn svg { position: absolute; left: 14px; top: 12px; color: #555; }
.search-inp-x30sn {
  width: 100%; padding: 10px 10px 10px 40px; background: #000; border: 1px solid #333;
  border-radius: 8px; color: #fff; outline: none; font-size: 14px;
}
.search-inp-x30sn:focus { border-color: #ff69b4; }

/* USER GRID */
.u-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;
}
.u-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px;
  transition: all 0.3s; position: relative;
}
.u-card-x30sn:hover { border-color: #ff4444; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transform: translateY(-3px); }

.uc-top-x30sn { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: flex-start; }
.img-wrap-x30sn {
    width: 56px; height: 56px; border-radius: 50%; padding: 2px;
    background: linear-gradient(45deg, #ff4444, #000);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; color: #fff;
}
.uc-badge-x30sn {
  font-size: 9px; padding: 5px 10px; border-radius: 20px; background: #1a1a1a; color: #888; 
  height: fit-content; text-transform: uppercase; font-weight: 700; border: 1px solid #333;
}
.uc-badge-x30sn.danger { background: #ff4444; color: #fff; border: none; box-shadow: 0 0 10px rgba(255,68,68,0.4); }

.uc-info-x30sn h4 { margin: 0 0 4px 0; color: #fff; font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uc-email-x30sn { display: flex; align-items: center; gap: 6px; color: #aaa; font-size: 13px; margin-bottom: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.uc-meta-x30sn {
  background: #000; padding: 12px; border-radius: 10px; display: grid; gap: 8px; margin-bottom: 15px; border: 1px solid #1a1a1a;
}
.uc-row-x30sn { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #999; }
.uc-row-x30sn svg { color: #ff4444; font-size: 12px; }

.stats-grid-x30sn {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: #0a0a0a; padding: 15px; border-radius: 10px; border: 1px dashed #333; margin-top: 15px;
}
.stat-box-x30sn { display: flex; flex-direction: column; gap: 4px; }
.stat-lbl-x30sn { font-size: 10px; color: #777; text-transform: uppercase; font-weight: 600; }
.stat-val-x30sn { font-size: 16px; font-weight: 700; color: #ddd; }

/* EMAIL BTN on card */
.card-email-btn {
  display: flex; align-items: center; gap: 6px; width: 100%; margin-top: 14px;
  padding: 9px 14px; border-radius: 8px; font-size: 12px; font-weight: 700;
  cursor: pointer; border: 1px solid rgba(167,139,250,0.3);
  background: rgba(167,139,250,0.06); color: #a78bfa; transition: 0.2s;
}
.card-email-btn:hover { background: rgba(167,139,250,0.14); border-color: #a78bfa; }

/* PAGINATION */
.pg-wrap-x30sn { display: flex; justify-content: center; gap: 15px; margin-top: 40px; align-items: center; padding-bottom: 40px; }
.pg-btn-x30sn { 
    background: #000; border: 1px solid #333; color: #fff; padding: 8px 18px; 
    border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 13px;
}
.pg-btn-x30sn:hover:not(:disabled) { border-color: #ff69b4; color: #ff69b4; }
.pg-btn-x30sn:disabled { opacity: 0.3; cursor: not-allowed; }

/* LOADING */
.loader-x30sn { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #444; }
.spinner-x30sn { width: 30px; height: 30px; border: 2px solid #222; border-top-color: #ff69b4; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* ── EMAIL DIALOG ── */
.da-dialog-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.92); z-index: 2000;
  display: flex; justify-content: center; align-items: center; backdrop-filter: blur(8px);
  padding: 20px;
}
.da-dialog-box {
  background: #080808; border: 1px solid #2a2a2a; border-radius: 20px;
  width: 100%; max-width: 1100px; max-height: 90vh;
  display: flex; flex-direction: column; overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.8), 0 0 0 1px rgba(167,139,250,0.06);
}
.da-dialog-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 18px 24px; border-bottom: 1px solid #1a1a1a;
  background: #0d0d0d; flex-shrink: 0;
}
.da-dialog-title {
  display: flex; align-items: center; gap: 10px;
  font-size: 17px; font-weight: 700; color: #fff;
}
.da-dialog-title svg { color: #a78bfa; font-size: 16px; }
.da-pill {
  background: rgba(167,139,250,0.1); color: #a78bfa; border: 1px solid rgba(167,139,250,0.2);
  padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 600; margin-left: 8px;
}
.da-pill.red { background: rgba(255,68,68,0.1); color: #ff6666; border-color: rgba(255,68,68,0.2); }
.da-close-btn {
  background: #1a1a1a; border: 1px solid #2a2a2a; color: #888; width: 32px; height: 32px;
  border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center;
  transition: 0.2s; font-size: 14px;
}
.da-close-btn:hover { border-color: #ff4444; color: #ff4444; }

.da-dialog-body {
  display: grid; grid-template-columns: 1fr 1fr; flex: 1; overflow: hidden;
}
@media (max-width: 768px) { .da-dialog-body { grid-template-columns: 1fr; } }

/* Left: Preview */
.da-preview-panel {
  border-right: 1px solid #1a1a1a; display: flex; flex-direction: column; overflow: hidden;
}
.da-panel-header {
  padding: 12px 20px; border-bottom: 1px solid #1a1a1a; background: #0a0a0a; flex-shrink: 0;
  display: flex; align-items: center; gap: 8px; font-size: 12px; color: #666; text-transform: uppercase; font-weight: 700;
}
.da-panel-header svg { color: #a78bfa; }
.da-preview-wrap { flex: 1; overflow: auto; background: #120524; }
.da-preview-frame { width: 100%; height: 100%; min-height: 500px; border: none; display: block; }

/* Right: Editor */
.da-reply-panel { display: flex; flex-direction: column; overflow: hidden; }
.da-reply-body { flex: 1; padding: 20px; display: flex; flex-direction: column; gap: 14px; overflow-y: auto; }

.da-user-strip {
  background: #0d0d0d; border: 1px solid #1a1a1a; border-radius: 10px; padding: 12px 14px;
  display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 12px;
}
.da-info-item { color: #555; }
.da-info-item strong { color: #999; font-weight: 500; }

.da-feedback-box {
  background: rgba(255,183,77,0.04); border: 1px solid rgba(255,183,77,0.15);
  border-left: 3px solid #ffb74d; border-radius: 8px; padding: 12px 14px;
}
.da-feedback-label { font-size: 10px; color: #ffb74d; text-transform: uppercase; font-weight: 700; letter-spacing: 0.06em; margin-bottom: 6px; display: flex; align-items: center; gap: 6px; }
.da-feedback-text { font-size: 13px; color: #ddd; line-height: 1.5; font-style: italic; margin-bottom: 6px; }
.da-stars { color: #ffb74d; font-size: 14px; letter-spacing: 2px; }

.da-feedback-input-label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; margin-bottom: 4px; }
.da-feedback-textarea {
  width: 100%; background: #0d0d0d; border: 1px solid #2a2a2a; color: #ddd;
  padding: 10px 12px; border-radius: 8px; outline: none; resize: vertical;
  font-size: 13px; line-height: 1.5; font-family: inherit; min-height: 60px; transition: 0.2s;
  font-style: italic;
}
.da-feedback-textarea:focus { border-color: #ffb74d; }
.da-rating-row { display: flex; align-items: center; gap: 8px; }
.da-rating-label { font-size: 12px; color: #666; }
.da-star-btn { background: none; border: none; cursor: pointer; font-size: 20px; transition: 0.1s; line-height: 1; }
.da-star-btn:hover { transform: scale(1.2); }

.da-ai-status {
  display: flex; align-items: center; gap: 8px; font-size: 12px; padding: 8px 12px;
  border-radius: 8px; font-weight: 500;
}
.da-ai-status.loading { background: rgba(167,139,250,0.08); color: #a78bfa; }
.da-ai-status.done { background: rgba(34,197,94,0.08); color: #22c55e; }
.da-ai-status.error { background: rgba(239,68,68,0.08); color: #ef4444; }

.da-reply-label { font-size: 11px; color: #666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.05em; display: flex; align-items: center; gap: 6px; }
.da-reply-label svg { color: #a78bfa; }
.da-reply-textarea {
  width: 100%; background: #0d0d0d; border: 1px solid #2a2a2a; color: #fff;
  padding: 14px; border-radius: 10px; outline: none; resize: vertical;
  font-size: 13px; line-height: 1.6; font-family: inherit; min-height: 130px; transition: 0.2s;
}
.da-reply-textarea:focus { border-color: #a78bfa; box-shadow: 0 0 0 2px rgba(167,139,250,0.08); }

.da-action-row { display: flex; gap: 10px; flex-wrap: wrap; }
.da-btn-regen {
  display: flex; align-items: center; gap: 7px; padding: 9px 14px; border-radius: 8px;
  font-size: 12px; font-weight: 600; cursor: pointer; border: 1px solid #2a2a2a;
  background: #111; color: #a78bfa; transition: 0.2s; flex: 1;
}
.da-btn-regen:hover:not(:disabled) { border-color: #a78bfa; background: rgba(167,139,250,0.08); }
.da-btn-regen:disabled { opacity: 0.4; cursor: not-allowed; }
.da-btn-send {
  display: flex; align-items: center; gap: 7px; padding: 9px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 700; cursor: pointer; border: none;
  background: linear-gradient(135deg, #a78bfa, #7c3aed); color: #fff;
  transition: 0.2s; flex: 2;
  box-shadow: 0 4px 15px rgba(124,58,237,0.25);
}
.da-btn-send:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(124,58,237,0.35); }
.da-btn-send:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }

.da-banner-success { background: rgba(34,197,94,0.08); border: 1px solid rgba(34,197,94,0.25); border-radius: 10px; padding: 14px 16px; text-align: center; color: #22c55e; font-weight: 600; font-size: 14px; }
.da-banner-error { background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); border-radius: 10px; padding: 12px 14px; text-align: center; color: #ef4444; font-weight: 500; font-size: 13px; }

.spin-da { animation: spin 1s linear infinite; }
`;

// ── Build email preview HTML ──────────────────────────────────
const buildDeletedEmailHtml = (account, feedback, rating, aiReply) => {
  const dateStr = new Date(account.deletedAt || Date.now()).toLocaleDateString("en-IN", {
    day: "numeric", month: "long", year: "numeric"
  });
  const stars = rating ? "⭐".repeat(Math.min(rating, 5)) : "—";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Account Deleted - HeartEcho</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    html,body{margin:0;padding:0;background:#120524;}*{box-sizing:border-box;}
    body{font-family:'DM Sans',-apple-system,sans-serif;color:#e2d8f0;padding:20px 10px;font-size:14px;line-height:1.6;}
    .container{max-width:540px;margin:0 auto;background:#0f0620;border:1px solid rgba(255,255,255,0.08);border-radius:12px;overflow:hidden;}
    .header{background:#160a2b;padding:20px 24px;border-bottom:1px solid rgba(255,255,255,0.05);display:flex;justify-content:space-between;align-items:center;}
    .brand{font-weight:600;font-size:16px;color:#fff;}.brand span{color:#ff4099;}
    .header-badge{font-size:11px;background:rgba(255,255,255,0.1);color:#a395b5;padding:4px 8px;border-radius:4px;font-weight:600;text-transform:uppercase;}
    .content{padding:24px;}
    .greeting{font-size:16px;font-weight:500;color:#fff;margin-bottom:12px;}
    .ticket-info{background:rgba(255,255,255,0.02);border-radius:8px;padding:16px;margin-bottom:24px;display:grid;grid-template-columns:1fr 1fr;gap:12px;font-size:13px;}
    .info-item{color:#a395b5;}.info-item strong{color:#fff;font-weight:500;}
    .rating{color:#ffb74d;font-size:14px;letter-spacing:2px;}
    .thread{margin-bottom:24px;}
    .message-block{margin-bottom:16px;padding:16px;border-radius:8px;}
    .message-header{font-size:12px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;margin-bottom:8px;}
    .msg-user{background:rgba(255,255,255,0.03);border-left:3px solid #5a4b70;}
    .msg-user .message-header{color:#a395b5;}.msg-user p{margin:0;color:#cfc2df;font-style:italic;}
    .msg-admin{background:linear-gradient(180deg,rgba(233,30,140,0.05) 0%,rgba(233,30,140,0.01) 100%);border-left:3px solid #e91e8c;}
    .msg-admin .message-header{color:#ff6b9d;}.msg-admin p{margin:0;color:#fff;white-space:pre-wrap;}
    .footer{background:#160a2b;padding:24px;border-top:1px solid rgba(255,255,255,0.05);font-size:13px;color:#a395b5;text-align:center;}
    .footer strong{color:#fff;}
    @media(max-width:480px){.ticket-info{grid-template-columns:1fr;}}
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Heart<span>Echo</span></div>
      <div class="header-badge">Account Deleted</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${account.name || "there"},</div>
      <p style="margin-top:0;">We're confirming that your HeartEcho account has been successfully deleted, and your data has been securely removed from our servers. Thank you for trying our app.</p>
      <div class="ticket-info">
        <div class="info-item">Date: <strong>${dateStr}</strong></div>
        <div class="info-item">Your Rating: <span class="rating">${stars}</span></div>
        <div class="info-item">Status: <strong>Data Erased ✓</strong></div>
      </div>
      <div class="thread">
        <div class="message-block msg-user">
          <div class="message-header">Your Feedback</div>
          <p>"${(feedback || "No feedback provided").replace(/</g,"&lt;").replace(/>/g,"&gt;")}"</p>
        </div>
        <div class="message-block msg-admin">
          <div class="message-header">A Note From Our Team</div>
          <p>${(aiReply || "Our reply will appear here...").replace(/</g,"&lt;").replace(/>/g,"&gt;")}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <p style="margin:0 0 8px 0;">If you ever decide to return, your companion will be ready to start a fresh journey with you.</p>
      <p style="margin:0;"><strong>HeartEcho Team</strong> 💜</p>
    </div>
  </div>
</body>
</html>`;
};

// ── Email Dialog Component ────────────────────────────────────
const DeletedEmailDialog = ({ account, token, onClose }) => {
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState(0);
  const [city, setCity] = useState(account.city || "");
  const [aiReply, setAiReply] = useState("");
  const [aiStatus, setAiStatus] = useState("idle");
  const [sendStatus, setSendStatus] = useState("idle");
  const [sendMsg, setSendMsg] = useState("");
  const [feedbackLoading, setFeedbackLoading] = useState(true);
  const [feedbackSource, setFeedbackSource] = useState(""); // 'db' | 'none'
  const iframeRef = useRef(null);

  // Step 1: Auto-fetch feedback from DB on open
  useEffect(() => {
    const loadFeedback = async () => {
      if (!account.originalUserId) {
        setFeedbackLoading(false);
        fetchAiReply("", 0);
        return;
      }
      try {
        const res = await axios.get(
          `${api.Url}/admin/deleted-accounts/${account.originalUserId}/feedback`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (res.data.success && res.data.feedback) {
          setFeedback(res.data.feedback);
          setRating(res.data.rating || 0);
          if (res.data.city) setCity(res.data.city);
          setFeedbackSource("db");
          fetchAiReply(res.data.feedback, res.data.rating);
        } else {
          setFeedbackSource("none");
          fetchAiReply("", 0);
        }
      } catch {
        setFeedbackSource("none");
        fetchAiReply("", 0);
      } finally {
        setFeedbackLoading(false);
      }
    };
    loadFeedback();
  }, []);

  // Update iframe whenever reply or feedback changes
  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(buildDeletedEmailHtml({ ...account, city }, feedback, rating, aiReply));
        doc.close();
      }
    }
  }, [aiReply, feedback, rating, city]);

  const fetchAiReply = async (fb, rt) => {
    setAiStatus("loading");
    try {
      const res = await axios.post(
        `${api.Url}/admin/deleted-accounts/ai-suggest`,
        {
          feedback: fb !== undefined ? fb : feedback,
          rating: rt !== undefined ? rt : rating,
          userName: account.name
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setAiReply(res.data.reply);
        setAiStatus("done");
      } else setAiStatus("error");
    } catch {
      setAiStatus("error");
      setAiReply(`We're sorry to see you go, ${account.name?.split(" ")[0] || ""}. Your honest feedback means a lot to us and will help us improve HeartEcho. We hope to welcome you back someday. — HeartEcho Team 💜`);
    }
  };

  const handleSend = async () => {
    if (!aiReply.trim()) return;
    setSendStatus("sending");
    try {
      const res = await axios.post(
        `${api.Url}/admin/deleted-accounts/send-email`,
        { email: account.email, name: account.name, feedback, rating, city, deletedAt: account.deletedAt, aiReply },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        setSendStatus("success");
        setSendMsg(`✅ Farewell email sent to ${account.email}`);
      } else { setSendStatus("error"); setSendMsg("Failed to send. Try again."); }
    } catch (err) {
      setSendStatus("error");
      setSendMsg(err.response?.data?.message || "Error sending email.");
    }
  };

  const tierMap = { none: "Free", monthly: "Monthly", yearly: "Yearly", yearly_pro: "Yearly Pro" };

  return (
    <div className="da-dialog-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="da-dialog-box">
        {/* Header */}
        <div className="da-dialog-header">
          <div className="da-dialog-title">
            <FaEnvelope />
            Farewell Email
            <span className="da-pill">{account.name || "User"}</span>
            <span className="da-pill red">Deleted Account</span>
          </div>
          <button className="da-close-btn" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Body */}
        <div className="da-dialog-body">
          {/* LEFT — Email Preview */}
          <div className="da-preview-panel">
            <div className="da-panel-header"><FaEye /> Live Email Preview</div>
            <div className="da-preview-wrap">
              <iframe ref={iframeRef} className="da-preview-frame" title="Email Preview" sandbox="allow-same-origin" />
            </div>
          </div>

          {/* RIGHT — Reply Editor */}
          <div className="da-reply-panel">
            <div className="da-panel-header"><FaMagic /> AI Farewell Editor</div>
            <div className="da-reply-body">
              {/* User Info */}
              <div className="da-user-strip">
                <div className="da-info-item">To: <strong>{account.email}</strong></div>
                <div className="da-info-item">Name: <strong>{account.name || "—"}</strong></div>
                <div className="da-info-item">Tier: <strong>{tierMap[account.subscriptionTier] || "Free"}</strong></div>
                <div className="da-info-item">Deleted: <strong>{new Date(account.deletedAt).toLocaleDateString()}</strong></div>
              </div>

              {/* Feedback Section */}
              <div className="da-feedback-box">
                <div className="da-feedback-label">
                  <FaStar />
                  {feedbackLoading
                    ? "Loading feedback from database..."
                    : feedbackSource === "db"
                      ? "✅ Feedback auto-loaded from database"
                      : "No feedback found — enter manually if known"}
                </div>
                <textarea
                  className="da-feedback-textarea"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="e.g. too expensive, AI boring, app crash, privacy concern..."
                  rows={2}
                  disabled={feedbackLoading}
                />
                {/* Star Rating */}
                <div className="da-rating-row" style={{marginTop:8}}>
                  <span className="da-rating-label">Rating:</span>
                  {[1,2,3,4,5].map(s => (
                    <button key={s} className="da-star-btn" onClick={() => setRating(s)} title={`${s} star`}>
                      {s <= rating ? "⭐" : "☆"}
                    </button>
                  ))}
                  {rating > 0 && (
                    <button onClick={() => setRating(0)} style={{background:'none',border:'none',color:'#555',cursor:'pointer',fontSize:11,marginLeft:4}}>clear</button>
                  )}
                </div>
              </div>

              {/* AI Status */}
              {aiStatus === "loading" && <div className="da-ai-status loading"><FaSpinner className="spin-da" /> {feedbackLoading ? "Fetching feedback..." : "Generating farewell reply..."}</div>}
              {aiStatus === "done" && <div className="da-ai-status done">✨ AI farewell ready — review and edit before sending</div>}
              {aiStatus === "error" && <div className="da-ai-status error">⚠️ Fallback reply loaded — you can edit it</div>}

              {/* Reply Textarea */}
              <div>
                <div className="da-reply-label"><FaMagic /> Farewell Reply (editable)</div>
                <textarea className="da-reply-textarea" value={aiReply} onChange={(e) => setAiReply(e.target.value)}
                  placeholder="AI farewell reply will appear here..." rows={6} />
              </div>

              {/* Action Buttons */}
              <div className="da-action-row">
                <button className="da-btn-regen" onClick={() => fetchAiReply(feedback, rating)}
                  disabled={aiStatus === "loading" || sendStatus === "sending" || sendStatus === "success"}>
                  {aiStatus === "loading" ? <FaSpinner className="spin-da" /> : <FaMagic />} Regenerate
                </button>
                <button className="da-btn-send" onClick={handleSend}
                  disabled={!aiReply.trim() || sendStatus === "sending" || sendStatus === "success"}>
                  {sendStatus === "sending" ? <FaSpinner className="spin-da" /> : <FaPaperPlane />}
                  {sendStatus === "sending" ? "Sending..." : "Send Farewell"}
                </button>
              </div>

              {sendStatus === "success" && <div className="da-banner-success">{sendMsg}</div>}
              {sendStatus === "error" && <div className="da-banner-error">{sendMsg}</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const DeletedAccountsAdmin = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [emailAccount, setEmailAccount] = useState(null);
  const itemsPerPage = 6;

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchDeletedAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/deleted-accounts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) setAccounts(response.data.data);
    } catch (error) {
      console.error("Fetch Error:", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchDeletedAccounts(); }, [fetchDeletedAccounts]);

  const filteredAccounts = useMemo(() => {
    return accounts.filter(u => {
      const q = searchTerm.toLowerCase();
      return (u.name && u.name.toLowerCase().includes(q)) ||
             (u.email && u.email.toLowerCase().includes(q)) ||
             (u.originalUserId && u.originalUserId.includes(q)) ||
             (u.phone_number && u.phone_number.includes(q));
    });
  }, [accounts, searchTerm]);

  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="loader-x30sn">
      <div className="spinner-x30sn"></div>
      <p>Fetching Deleted Accounts...</p>
    </div>
  );

  return (
    <>
      <style>{deletedStyles}</style>
      <div className="deleted-root-x30sn">

        {/* HEADER */}
        <header className="u-header-x30sn">
          <div>
            <h1 className="u-title-x30sn">Deleted Accounts Archive</h1>
            <span className="u-tagline-x30sn">Permanent Deletion Logs • {accounts.length} Total Records — click 💜 to send farewell email</span>
          </div>
          <button className="u-sync-btn-x30sn" onClick={fetchDeletedAccounts}><FaSync /></button>
        </header>

        {/* CONTROLS */}
        <div className="controls-x30sn">
          <div className="search-wrap-x30sn">
            <FaSearch />
            <input
              type="text"
              className="search-inp-x30sn"
              placeholder="Search by name, email, phone or user ID..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* GRID */}
        <div className="u-grid-x30sn">
          {filteredAccounts.length === 0 ? (
            <div style={{gridColumn: "1 / -1", textAlign: "center", padding: "50px", color: "#555"}}>
              <FaUserSlash style={{fontSize: 48, marginBottom: 15, opacity: 0.5}} />
              <h3>No deleted accounts found</h3>
            </div>
          ) : paginatedAccounts.map(account => (
            <div key={account._id} className="u-card-x30sn">
              <div className="uc-top-x30sn">
                <div className="img-wrap-x30sn"><FaUserSlash /></div>
                <span className="uc-badge-x30sn danger">Deleted</span>
              </div>

              <div className="uc-info-x30sn">
                <h4>{account.name || "Unknown User"}</h4>
                <div className="uc-email-x30sn"><FaEnvelope style={{color:"#777"}}/> {account.email || "No Email"}</div>

                <div className="uc-meta-x30sn">
                  <div className="uc-row-x30sn"><FaIdBadge/> Orig ID: {account.originalUserId ? account.originalUserId.slice(-6).toUpperCase() : '---'}</div>
                  <div className="uc-row-x30sn"><FaPhone/> Phone: {account.phone_number || 'N/A'}</div>
                  <div className="uc-row-x30sn"><FaCalendarAlt/> Joined: {account.joinedAt ? new Date(account.joinedAt).toLocaleDateString() : 'N/A'}</div>
                  <div className="uc-row-x30sn"><FaHistory/> Deleted: {new Date(account.deletedAt).toLocaleString()}</div>
                </div>

                <div className="stats-grid-x30sn">
                  <div className="stat-box-x30sn"><span className="stat-lbl-x30sn">Total Chats</span><span className="stat-val-x30sn">{account.stats?.totalChats || 0}</span></div>
                  <div className="stat-box-x30sn"><span className="stat-lbl-x30sn">Total Msgs</span><span className="stat-val-x30sn">{account.stats?.totalMessages || 0}</span></div>
                  <div className="stat-box-x30sn"><span className="stat-lbl-x30sn">Payments</span><span className="stat-val-x30sn">{account.stats?.totalPayments || 0}</span></div>
                  <div className="stat-box-x30sn"><span className="stat-lbl-x30sn">AI Friends</span><span className="stat-val-x30sn">{account.stats?.totalAIFriends || 0}</span></div>
                </div>

                {account.lastPayment?.amount ? (
                  <div style={{marginTop:"15px", padding:"10px", background:"#1a0f0f", borderRadius:"8px", border:"1px solid #331f1f"}}>
                    <span style={{fontSize:"11px", color:"#ff8888", display:"block", marginBottom:"4px"}}>Last Payment Record</span>
                    <div style={{fontSize:"13px", color:"#ddd", display:"flex", justifyContent:"space-between"}}>
                      <span>{account.lastPayment.transaction_id || 'N/A'}</span>
                      <strong>₹{account.lastPayment.amount}</strong>
                    </div>
                  </div>
                ) : null}

                {/* Email Button */}
                {account.email && (
                  <button className="card-email-btn" onClick={() => setEmailAccount(account)}>
                    <FaEnvelope /> Send Farewell Email 💜
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {filteredAccounts.length > 0 && (
          <div className="pg-wrap-x30sn">
            <button className="pg-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
            <span style={{color:'#666', fontSize:13, fontWeight:600}}>Page {currentPage} of {Math.ceil(filteredAccounts.length / itemsPerPage)}</span>
            <button className="pg-btn-x30sn" disabled={currentPage >= Math.ceil(filteredAccounts.length / itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        )}

        {/* EMAIL DIALOG */}
        {emailAccount && (
          <DeletedEmailDialog
            account={emailAccount}
            token={getToken()}
            onClose={() => setEmailAccount(null)}
          />
        )}
      </div>
    </>
  );
};

export default DeletedAccountsAdmin;
