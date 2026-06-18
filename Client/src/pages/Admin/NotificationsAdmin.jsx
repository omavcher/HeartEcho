'use client';

import { useState, useEffect, useCallback, useMemo, Fragment } from "react";
import { 
  FaBell, FaUsers, FaUser, FaPaperPlane, FaSearch, 
  FaMobileAlt, FaInfoCircle, FaTrash, FaCheckCircle,
  FaExclamationTriangle, FaCog, FaPlay, FaCircle,
  FaRobot, FaMagic, FaHistory,
  FaGem
} from "react-icons/fa";
import axios from "axios";
import api from "../../config/api";

const notificationStyles = `
.tabs-wrap-x30sn {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  border-bottom: 1px solid #222;
  padding-bottom: 10px;
}

.tab-btn-x30sn {
  background: none;
  border: none;
  color: #666;
  font-size: 15px;
  font-weight: 700;
  padding: 10px 15px;
  cursor: pointer;
  position: relative;
  transition: color 0.3s;
}

.tab-btn-x30sn.active {
  color: #ff69b4;
}

.tab-btn-x30sn.active::after {
  content: '';
  position: absolute;
  bottom: -11px;
  left: 0;
  right: 0;
  height: 2px;
  background: #ff69b4;
}

.auto-campaigns-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.campaign-card-x30sn {
  background: #050505;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  position: relative;
  transition: all 0.3s ease;
}

.campaign-card-x30sn:hover {
  border-color: #ff69b488;
  box-shadow: 0 5px 15px rgba(255,105,180,0.05);
}

.campaign-card-header-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.campaign-title-x30sn {
  font-size: 15px;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.campaign-badge-x30sn {
  font-size: 10px;
  background: rgba(255, 105, 180, 0.1);
  color: #ff69b4;
  padding: 2px 8px;
  border-radius: 20px;
  font-weight: 700;
  text-transform: uppercase;
}

.campaign-trigger-x30sn {
  font-size: 12px;
  color: #888;
  margin-bottom: 15px;
}

.campaign-preview-box-x30sn {
  background: #000;
  border: 1px solid #111;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 15px;
}

.preview-title-x30sn {
  font-weight: 700;
  font-size: 13px;
  color: #fff;
  display: block;
  margin-bottom: 4px;
}

.preview-body-x30sn {
  font-size: 12px;
  color: #aaa;
  line-height: 1.4;
  display: block;
}

.campaign-stats-grid-x30sn {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  background: #0a0a0a;
  border-radius: 10px;
  padding: 12px;
  margin-bottom: 15px;
}

.campaign-stat-item-x30sn {
  display: flex;
  flex-direction: column;
}

.stat-label-x30sn {
  font-size: 10px;
  color: #666;
  text-transform: uppercase;
  font-weight: 600;
}

.stat-value-x30sn {
  font-size: 13px;
  font-weight: 700;
  color: #fff;
}

.campaign-actions-x30sn {
  display: flex;
  gap: 10px;
}

.action-btn-secondary-x30sn {
  flex: 1;
  background: #111;
  border: 1px solid #222;
  color: #fff;
  padding: 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn-secondary-x30sn:hover {
  background: #222;
}

.action-btn-primary-x30sn {
  flex: 1;
  background: linear-gradient(45deg, #ff69b4, #b042ff);
  border: none;
  color: #fff;
  padding: 8px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.action-btn-primary-x30sn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 10px rgba(255,105,180,0.2);
}

.modal-overlay-x30sn {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  animation: fadeIn-x30sn 0.3s ease;
}

.modal-content-x30sn {
  background: #0a0a0a;
  border: 1px solid #222;
  border-radius: 16px;
  width: 550px;
  max-width: 90%;
  padding: 25px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.5);
  color: #fff;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.modal-title-x30sn {
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  margin: 0;
}

.close-modal-x30sn {
  background: none;
  border: none;
  color: #666;
  font-size: 18px;
  cursor: pointer;
}

.toggle-switch-x30sn {
  position: relative;
  display: inline-block;
  width: 44px;
  height: 24px;
}

.toggle-switch-x30sn input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider-x30sn {
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #222;
  transition: .4s;
  border-radius: 24px;
  border: 1px solid #333;
}

.toggle-slider-x30sn:before {
  position: absolute;
  content: "";
  height: 16px;
  width: 16px;
  left: 3px;
  bottom: 3px;
  background-color: #666;
  transition: .4s;
  border-radius: 50%;
}

input:checked + .toggle-slider-x30sn {
  background-color: rgba(0, 255, 0, 0.15);
  border-color: #00ff00;
}

input:checked + .toggle-slider-x30sn:before {
  transform: translateX(20px);
  background-color: #00ff00;
}

.history-table-x30sn {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}

.history-table-x30sn th {
  text-align: left;
  font-size: 11px;
  color: #666;
  padding: 10px;
  border-bottom: 1px solid #222;
}

.history-table-x30sn td {
  padding: 12px 10px;
  font-size: 13px;
  border-bottom: 1px solid #111;
}

.open-badge-x30sn {
  background: rgba(0, 255, 0, 0.1);
  color: #00ff00;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.conversion-badge-x30sn {
  background: rgba(255, 105, 180, 0.1);
  color: #ff69b4;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 700;
}

.history-th-sortable-x30sn {
  cursor: pointer;
  user-select: none;
  transition: color 0.2s;
}

.history-th-sortable-x30sn:hover {
  color: #fff !important;
}

.sort-icon-inline-x30sn {
  margin-left: 5px;
  font-size: 10px;
}

.history-filters-bar-x30sn {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  background: #0a0a0a;
  border: 1px solid #1a1a1a;
  padding: 15px;
  border-radius: 12px;
}

.filter-group-x30sn {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-label-x30sn {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.history-stats-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 25px;
}

.history-stat-card-x30sn {
  background: linear-gradient(135deg, #070707 0%, #0c0c0c 100%);
  border: 1px solid #222;
  border-radius: 16px;
  padding: 18px;
  display: flex;
  flex-direction: column;
  position: relative;
  transition: all 0.3s ease;
}

.history-stat-card-x30sn:hover {
  border-color: #ff69b455;
  box-shadow: 0 4px 20px rgba(255, 105, 180, 0.03);
  transform: translateY(-2px);
}

.stat-card-header-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.stat-card-icon-x30sn {
  font-size: 16px;
  color: #ff69b4;
  background: rgba(255, 105, 180, 0.08);
  padding: 8px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card-label-x30sn {
  font-size: 11px;
  color: #888;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
}

.stat-card-value-x30sn {
  font-size: 24px;
  font-weight: 800;
  color: #fff;
  line-height: 1.2;
}

.stat-card-sub-x30sn {
  font-size: 11px;
  color: #555;
  margin-top: 4px;
}

.history-row-x30sn {
  cursor: pointer;
  transition: background 0.2s;
}

.history-row-x30sn:hover {
  background: #0d0d0d !important;
}

.history-row-expanded-x30sn {
  background: #070707 !important;
}

.expanded-detail-row-x30sn {
  background: #050505 !important;
}

.expanded-detail-card-x30sn {
  padding: 20px;
  border-left: 3px solid #ff69b4;
  background: #000;
  border-radius: 0 12px 12px 0;
  margin: 5px 10px 15px 10px;
  box-shadow: inset 0 0 10px rgba(0,0,0,0.8);
}

.rate-badge-pill-x30sn {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  width: 100%;
}

.rate-badge-percentage-x30sn {
  font-weight: 800;
  font-size: 13px;
}

.rate-bar-container-x30sn {
  height: 4px;
  background: #1a1a1a;
  border-radius: 2px;
  width: 60px;
  overflow: hidden;
}

.rate-bar-fill-x30sn {
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s ease;
}

.pagination-container-x30sn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 20px;
  padding-top: 15px;
  border-top: 1px solid #222;
}

.pagination-info-x30sn {
  font-size: 12px;
  color: #666;
}

.pagination-controls-x30sn {
  display: flex;
  gap: 5px;
}

.pagination-btn-x30sn {
  background: #111;
  border: 1px solid #222;
  color: #aaa;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.pagination-btn-x30sn:hover:not(:disabled) {
  background: #222;
  color: #fff;
  border-color: #444;
}

.pagination-btn-x30sn.active {
  background: #ff69b4;
  color: #fff;
  border-color: #ff69b4;
}

.pagination-btn-x30sn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.truncate-text-x30sn {
  max-width: 280px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 11px;
  color: #888;
}

.notif-root-x30sn {
  color: #fff;
  font-family: 'Inter', sans-serif;
  animation: fadeIn-x30sn 0.5s ease;
  max-width: 1200px;
  margin: 0 auto;
}

@keyframes fadeIn-x30sn { from { opacity: 0; } to { opacity: 1; } }

.notif-header-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.notif-title-x30sn {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.notif-tagline-x30sn {
  color: #ff69b4;
  font-size: 13px;
  font-weight: 500;
}

.notif-grid-x30sn {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
}

@media (max-width: 992px) {
  .notif-grid-x30sn {
    grid-template-columns: 1fr;
  }
}

.card-x30sn {
  background: #050505;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 25px;
  height: fit-content;
}

.card-title-x30sn {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title-x30sn svg {
  color: #ff69b4;
}

.form-group-x30sn {
  margin-bottom: 20px;
}

.form-label-x30sn {
  display: block;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-input-x30sn, .form-textarea-x30sn, .form-select-x30sn {
  width: 100%;
  background: #000;
  border: 1px solid #333;
  border-radius: 10px;
  padding: 12px 15px;
  color: #fff;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input-x30sn:focus, .form-textarea-x30sn:focus, .form-select-x30sn:focus {
  border-color: #ff69b4;
}

.form-textarea-x30sn {
  min-height: 100px;
  resize: vertical;
}

.user-selector-x30sn {
  background: #000;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 15px;
  margin-top: 10px;
}

.search-wrap-x30sn {
  position: relative;
  margin-bottom: 15px;
}

.search-wrap-x30sn svg {
  position: absolute;
  left: 12px;
  top: 12px;
  color: #555;
}

.search-input-x30sn {
  width: 100%;
  padding: 10px 10px 10px 35px;
  background: #111;
  border: 1px solid #222;
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.user-list-x30sn {
  max-height: 200px;
  overflow-y: auto;
}

.user-item-x30sn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-item-x30sn:hover {
  background: #1a1a1a;
}

.user-avatar-x30sn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info-mini-x30sn {
  flex: 1;
}

.user-name-mini-x30sn {
  font-size: 13px;
  font-weight: 600;
  display: block;
}

.user-email-mini-x30sn {
  font-size: 11px;
  color: #666;
}

.selected-users-x30sn {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.user-tag-x30sn {
  background: #111;
  border: 1px solid #333;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-user-x30sn {
  cursor: pointer;
  color: #ff4444;
}

.preview-phone-x30sn {
  width: 280px;
  height: 560px;
  background: #111;
  border: 8px solid #222;
  border-radius: 36px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.phone-top-x30sn {
  height: 20px;
  width: 100px;
  background: #222;
  margin: 10px auto;
  border-radius: 10px;
}

.notif-banner-x30sn {
  background: rgba(255, 255, 255, 0.95);
  margin: 10px;
  border-radius: 12px;
  padding: 12px;
  color: #000;
  display: flex;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  animation: slideDown-x30sn 0.5s ease;
}

@keyframes slideDown-x30sn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.notif-icon-circle-x30sn {
  width: 32px;
  height: 32px;
  background: #000;
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.notif-content-preview-x30sn {
  flex: 1;
}

.notif-title-preview-x30sn {
  font-weight: 700;
  font-size: 13px;
  display: block;
  margin-bottom: 2px;
}

.notif-body-preview-x30sn {
  font-size: 12px;
  color: #333;
  line-height: 1.3;
}

.notif-image-preview-x30sn {
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  margin-top: 8px;
}

.send-btn-x30sn {
  width: 100%;
  background: linear-gradient(45deg, #ff69b4, #b042ff);
  border: none;
  color: #fff;
  padding: 15px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(255, 105, 180, 0.2);
}

.send-btn-x30sn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(255, 105, 180, 0.4);
}

.send-btn-x30sn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.char-count-x30sn {
  font-size: 11px;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.status-msg-x30sn {
  padding: 12px;
  border-radius: 10px;
  margin-top: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-msg-x30sn.success {
  background: rgba(0, 200, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 200, 0, 0.2);
}

.status-msg-x30sn.error {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.stats-bar-x30sn {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-item-x30sn {
    background: #050505;
    border: 1px solid #222;
    padding: 20px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.stat-icon-x30sn {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    background: rgba(255, 105, 180, 0.1);
    color: #ff69b4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.stat-info-x30sn span {
    display: block;
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
}

.stat-info-x30sn strong {
    font-size: 20px;
    color: #fff;
}

.sandbox-box-x30sn {
  background: #050505;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 25px;
  margin-top: 25px;
}

.sandbox-grid-x30sn {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 25px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .sandbox-grid-x30sn {
    grid-template-columns: 1fr;
  }
}
`;

const formatTarget = (t) => {
  const mapping = {
    all: "All Mobile Users",
    specific: "Specific Users",
    subscriber: "Active Subscribers",
    non_subscriber: "Non-Subscribers",
    new_non_subscriber: "New Users (Not Subscribed)",
    new_subscriber: "New Users (Subscribed)",
    welcome_1: "Welcome Series (Day 1)",
    welcome_2: "Welcome Series (Day 2)",
    welcome_3: "Welcome Series (Day 3)",
    daily_morning: "Daily (Morning)",
    daily_afternoon: "Daily (Afternoon)",
    daily_evening: "Daily (Evening)",
    daily_night: "Daily (Bedtime)",
    inactive_3d: "Inactive (3 Days)",
    inactive_7d: "Inactive (7 Days)",
    premium_upsell: "Premium Upsell",
    weekend_special: "Weekend Special",
    festival_greeting: "Festival Greetings",
    trigger_signup_no_msg: "Signup Inactivity Trigger (3m)",
    trigger_inactive_after_msg: "Chat Abandonment Trigger (3m)"
  };
  return mapping[t] || (t ? t.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Unknown');
};

const NotificationsAdmin = () => {
  const [activeTab, setActiveTab] = useState("manual"); // "manual", "scheduled", "targeted"
  
  // Manual push states
  const [target, setTarget] = useState("all"); 
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); 
  const [stats, setStats] = useState({ totalUsers: 0, mobileUsers: 0 });
  const [history, setHistory] = useState([]);

  // Campaign History control states
  const [historySearch, setHistorySearch] = useState("");
  const [historyTargetFilter, setHistoryTargetFilter] = useState("all");
  const [historyTypeFilter, setHistoryTypeFilter] = useState("all"); // "all", "manual", "auto"
  const [historySort, setHistorySort] = useState({ column: "sentAt", direction: "desc" });
  const [historyLimit, setHistoryLimit] = useState(200);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyPageSize] = useState(10);
  const [expandedRowId, setExpandedRowId] = useState(null);

  // Auto push states
  const [autoCampaigns, setAutoCampaigns] = useState([]);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [editBody, setEditBody] = useState("");
  const [editImageUrl, setEditImageUrl] = useState("");
  const [editScheduledHour, setEditScheduledHour] = useState(9);
  const [editIsActive, setEditIsActive] = useState(true);
  const [editAiEnabled, setEditAiEnabled] = useState(true);
  const [editPromptTemplate, setEditPromptTemplate] = useState("");
  const [editStatus, setEditStatus] = useState(null);
  const [runStatus, setRunStatus] = useState(null);

  // Sandbox states
  const [sandboxCampaign, setSandboxCampaign] = useState("");
  const [sandboxName, setSandboxName] = useState("Rahul");
  const [sandboxResult, setSandboxResult] = useState(null);
  const [sandboxLoading, setSandboxLoading] = useState(false);
  const [sandboxError, setSandboxError] = useState(null);

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchData = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/user-dataw`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.userData) {
        setUsers(res.data.userData);
        const mobileCount = res.data.userData.filter(u => u.isMobileUser || u.fcmToken).length;
        setStats({
          totalUsers: res.data.userData.length,
          mobileUsers: mobileCount
        });
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, [getToken]);

  const fetchHistory = useCallback(async (limit = historyLimit) => {
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/notification-history?limit=${limit}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setHistory(res.data.data);
      }
    } catch (err) {
      console.error("Failed to fetch history", err);
    }
  }, [getToken, historyLimit]);

  const fetchAutoCampaigns = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/auto-campaigns`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setAutoCampaigns(res.data.data);
        // Set default campaign for sandbox
        const triggers = res.data.data.filter(c => c.campaignType.startsWith("trigger_"));
        if (triggers.length > 0 && !sandboxCampaign) {
          setSandboxCampaign(triggers[0]._id);
        }
      }
    } catch (err) {
      console.error("Failed to fetch auto campaigns", err);
    }
  }, [getToken, sandboxCampaign]);

  useEffect(() => {
    fetchData();
    fetchAutoCampaigns();
  }, [fetchData, fetchAutoCampaigns]);

  useEffect(() => {
    fetchHistory(historyLimit);
  }, [fetchHistory, historyLimit]);

  // Scheduled vs Triggered Campaigns lists
  const scheduledCampaigns = useMemo(() => {
    return autoCampaigns.filter(c => !c.campaignType.startsWith("trigger_"));
  }, [autoCampaigns]);

  const triggeredCampaigns = useMemo(() => {
    return autoCampaigns.filter(c => c.campaignType.startsWith("trigger_"));
  }, [autoCampaigns]);

  // Aggregate stats for Scheduled Campaigns
  const scheduledStats = useMemo(() => {
    let sent = 0, opened = 0, conversions = 0;
    scheduledCampaigns.forEach(c => {
      sent += c.stats?.sent || 0;
      opened += c.stats?.opened || 0;
      conversions += c.stats?.conversions || 0;
    });
    return {
      sent,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      conversions,
      conversionRate: sent > 0 ? Math.round((conversions / sent) * 100) : 0
    };
  }, [scheduledCampaigns]);

  // Aggregate stats for Triggered Campaigns
  const triggeredStats = useMemo(() => {
    let sent = 0, opened = 0, conversions = 0;
    triggeredCampaigns.forEach(c => {
      sent += c.stats?.sent || 0;
      opened += c.stats?.opened || 0;
      conversions += c.stats?.conversions || 0;
    });
    return {
      sent,
      openRate: sent > 0 ? Math.round((opened / sent) * 100) : 0,
      conversions,
      conversionRate: sent > 0 ? Math.round((conversions / sent) * 100) : 0
    };
  }, [triggeredCampaigns]);

  // Filtered & Sorted History
  const processedHistory = useMemo(() => {
    let result = [...history];

    // 1. Search Filter
    if (historySearch) {
      const query = historySearch.toLowerCase();
      result = result.filter(h => 
        (h.title && h.title.toLowerCase().includes(query)) ||
        (h.body && h.body.toLowerCase().includes(query)) ||
        (h.target && h.target.toLowerCase().includes(query))
      );
    }

    // 2. Segment Filter
    if (historyTargetFilter !== "all") {
      result = result.filter(h => h.target === historyTargetFilter);
    }

    // 3. Campaign Type Filter
    if (historyTypeFilter === "manual") {
      result = result.filter(h => !h.campaignId);
    } else if (historyTypeFilter === "auto") {
      result = result.filter(h => h.campaignId);
    }

    // 4. Client Side Sorting
    if (historySort.column) {
      const col = historySort.column;
      const isAsc = historySort.direction === "asc";

      result.sort((a, b) => {
        let valA, valB;

        if (col === "sentAt") {
          valA = new Date(a.sentAt).getTime();
          valB = new Date(b.sentAt).getTime();
        } else if (col === "title") {
          valA = (a.title || "").toLowerCase();
          valB = (b.title || "").toLowerCase();
        } else if (col === "target") {
          valA = formatTarget(a.target).toLowerCase();
          valB = formatTarget(b.target).toLowerCase();
        } else if (col === "recipientsCount") {
          valA = a.recipientsCount || 0;
          valB = b.recipientsCount || 0;
        } else if (col === "opensCount") {
          valA = a.opensCount || 0;
          valB = b.opensCount || 0;
        } else if (col === "openRate") {
          valA = a.recipientsCount > 0 ? (a.opensCount || 0) / a.recipientsCount : 0;
          valB = b.recipientsCount > 0 ? (b.opensCount || 0) / b.recipientsCount : 0;
        } else if (col === "conversionsCount") {
          valA = a.conversionsCount || 0;
          valB = b.conversionsCount || 0;
        } else if (col === "conversionRate") {
          valA = a.recipientsCount > 0 ? (a.conversionsCount || 0) / a.recipientsCount : 0;
          valB = b.recipientsCount > 0 ? (b.conversionsCount || 0) / b.recipientsCount : 0;
        } else {
          valA = a[col];
          valB = b[col];
        }

        if (valA < valB) return isAsc ? -1 : 1;
        if (valA > valB) return isAsc ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [history, historySearch, historyTargetFilter, historyTypeFilter, historySort]);

  // Campaign History Aggregate Stats
  const historyStats = useMemo(() => {
    let totalSent = 0;
    let totalOpens = 0;
    let totalConversions = 0;
    let bestCampaign = null;
    let maxConvRate = -1;

    history.forEach(h => {
      totalSent += h.recipientsCount || 0;
      totalOpens += h.opensCount || 0;
      totalConversions += h.conversionsCount || 0;

      const convRate = h.recipientsCount > 0 ? (h.conversionsCount || 0) / h.recipientsCount : 0;
      if (convRate > maxConvRate && h.recipientsCount > 0) {
        maxConvRate = convRate;
        bestCampaign = h;
      }
    });

    // If no conversions, fallback to best open rate campaign
    if (!bestCampaign && history.length > 0) {
      let maxOpenRate = -1;
      history.forEach(h => {
        const openRate = h.recipientsCount > 0 ? (h.opensCount || 0) / h.recipientsCount : 0;
        if (openRate > maxOpenRate && h.recipientsCount > 0) {
          maxOpenRate = openRate;
          bestCampaign = h;
        }
      });
    }

    return {
      totalSent,
      totalOpens,
      avgOpenRate: totalSent > 0 ? Math.round((totalOpens / totalSent) * 100) : 0,
      totalConversions,
      avgConversionRate: totalSent > 0 ? Math.round((totalConversions / totalSent) * 100) : 0,
      bestCampaign
    };
  }, [history]);

  // Paginated History
  const paginatedHistory = useMemo(() => {
    const startIndex = (historyPage - 1) * historyPageSize;
    return processedHistory.slice(startIndex, startIndex + historyPageSize);
  }, [processedHistory, historyPage, historyPageSize]);

  const totalPages = useMemo(() => {
    return Math.ceil(processedHistory.length / historyPageSize);
  }, [processedHistory, historyPageSize]);

  // Reset page when filters or search change
  useEffect(() => {
    setHistoryPage(1);
  }, [historySearch, historyTargetFilter, historyTypeFilter, historySort]);

  const handleSort = (column) => {
    setHistorySort(prev => {
      if (prev.column === column) {
        return { column, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { column, direction: "desc" };
    });
  };

  const getSortIcon = (column) => {
    if (historySort.column !== column) return " ↕";
    return historySort.direction === "asc" ? " ▲" : " ▼";
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    return users.filter(u => 
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       u.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !selectedUsers.find(su => su._id === u._id)
    ).slice(0, 5);
  }, [users, searchQuery, selectedUsers]);

  const targetedUsers = useMemo(() => {
    const mobileUsersList = users.filter(u => u.isMobileUser || u.fcmToken);

    if (target === 'all') return mobileUsersList;
    if (target === 'subscriber') return mobileUsersList.filter(u => u.user_type === 'subscriber');
    if (target === 'non_subscriber') return mobileUsersList.filter(u => u.user_type !== 'subscriber');
    
    if (target === 'new_non_subscriber') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return mobileUsersList.filter(u => {
        const joinDate = new Date(u.createdAt || u.joinedAt);
        return u.user_type !== 'subscriber' && joinDate >= sevenDaysAgo;
      });
    }
    
    if (target === 'new_subscriber') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      return mobileUsersList.filter(u => {
        const joinDate = new Date(u.createdAt || u.joinedAt);
        return u.user_type === 'subscriber' && joinDate >= sevenDaysAgo;
      });
    }
    
    if (target === 'specific') return selectedUsers;
    return [];
  }, [users, target, selectedUsers]);

  const targetStats = useMemo(() => {
    const mobileUsersList = users.filter(u => u.isMobileUser || u.fcmToken);
    let totalInSegment = 0;
    let pushReadyInSegment = 0;

    if (target === 'all') {
      totalInSegment = users.length;
      pushReadyInSegment = mobileUsersList.length;
    } else if (target === 'subscriber') {
      totalInSegment = users.filter(u => u.user_type === 'subscriber').length;
      pushReadyInSegment = mobileUsersList.filter(u => u.user_type === 'subscriber').length;
    } else if (target === 'non_subscriber') {
      totalInSegment = users.filter(u => u.user_type !== 'subscriber').length;
      pushReadyInSegment = mobileUsersList.filter(u => u.user_type !== 'subscriber').length;
    } else if (target === 'new_non_subscriber') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const list = users.filter(u => {
        const joinDate = new Date(u.createdAt || u.joinedAt);
        return u.user_type !== 'subscriber' && joinDate >= sevenDaysAgo;
      });
      totalInSegment = list.length;
      pushReadyInSegment = list.filter(u => u.isMobileUser || u.fcmToken).length;
    } else if (target === 'new_subscriber') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const list = users.filter(u => {
        const joinDate = new Date(u.createdAt || u.joinedAt);
        return u.user_type === 'subscriber' && joinDate >= sevenDaysAgo;
      });
      totalInSegment = list.length;
      pushReadyInSegment = list.filter(u => u.isMobileUser || u.fcmToken).length;
    } else if (target === 'specific') {
      totalInSegment = selectedUsers.length;
      pushReadyInSegment = selectedUsers.filter(u => u.isMobileUser || u.fcmToken).length;
    }

    return { totalInSegment, pushReadyInSegment };
  }, [users, target, selectedUsers]);

  const handleSelectUser = (user) => {
    if (!user.fcmToken) {
        alert("This user does not have a mobile token registered.");
        return;
    }
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery("");
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleSend = async () => {
    if (!title || !body) {
      setStatus({ type: 'error', message: 'Please enter both title and message body.' });
      return;
    }

    if (target === 'specific' && selectedUsers.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one user.' });
      return;
    }

    if (target !== 'all' && targetedUsers.length === 0) {
      setStatus({ type: 'error', message: 'No users found in the selected target segment.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const token = getToken();
      const payload = {
        target,
        title,
        body,
        imageUrl,
        userIds: target === 'all' ? [] : targetedUsers.map(u => u._id)
      };

      const res = await axios.post(`${api.Url}/admin/send-notification`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setStatus({ type: 'success', message: res.data.message });
        setTitle("");
        setBody("");
        setImageUrl("");
        setSelectedUsers([]);
        fetchHistory(); 
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to send notification.' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Automated Campaigns Handlers
  const handleToggleCampaign = async (campaign) => {
    try {
      const token = getToken();
      const payload = {
        title: campaign.title,
        body: campaign.body,
        imageUrl: campaign.imageUrl,
        scheduledHour: campaign.scheduledHour,
        isActive: !campaign.isActive,
        aiEnabled: campaign.aiEnabled,
        promptTemplate: campaign.promptTemplate
      };
      const res = await axios.put(`${api.Url}/admin/auto-campaigns/${campaign._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        fetchAutoCampaigns();
      }
    } catch (err) {
      console.error("Failed to toggle campaign status", err);
      alert("Failed to toggle campaign status");
    }
  };

  const handleOpenEdit = (campaign) => {
    setEditingCampaign(campaign);
    setEditTitle(campaign.title);
    setEditBody(campaign.body);
    setEditImageUrl(campaign.imageUrl || "");
    setEditScheduledHour(campaign.scheduledHour);
    setEditIsActive(campaign.isActive);
    setEditAiEnabled(campaign.aiEnabled !== undefined ? campaign.aiEnabled : true);
    setEditPromptTemplate(campaign.promptTemplate || "");
    setEditStatus(null);
  };

  const handleSaveCampaign = async () => {
    if (!editTitle || !editBody) {
      setEditStatus({ type: 'error', message: 'Please fill in Title and Body.' });
      return;
    }
    setEditStatus(null);
    try {
      const token = getToken();
      const payload = {
        title: editTitle,
        body: editBody,
        imageUrl: editImageUrl,
        scheduledHour: Number(editScheduledHour),
        isActive: editIsActive,
        aiEnabled: editAiEnabled,
        promptTemplate: editPromptTemplate
      };
      const res = await axios.put(`${api.Url}/admin/auto-campaigns/${editingCampaign._id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setEditStatus({ type: 'success', message: 'Campaign updated successfully!' });
        setTimeout(() => setEditingCampaign(null), 1000);
        fetchAutoCampaigns();
      }
    } catch (err) {
      setEditStatus({ type: 'error', message: err.response?.data?.message || 'Failed to update campaign.' });
    }
  };

  const handleTestTrigger = async (campaign) => {
    setRunStatus({ campaignId: campaign._id, type: 'info', message: 'Triggering campaign...' });
    try {
      const token = getToken();
      const res = await axios.post(`${api.Url}/admin/auto-campaigns/trigger/${campaign._id}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setRunStatus({ campaignId: campaign._id, type: 'success', message: res.data.message });
        fetchHistory(); 
        fetchAutoCampaigns(); 
        setTimeout(() => setRunStatus(null), 4000);
      }
    } catch (err) {
      setRunStatus({ campaignId: campaign._id, type: 'error', message: err.response?.data?.message || 'Trigger failed.' });
      setTimeout(() => setRunStatus(null), 4000);
    }
  };

  // Sandbox Live AI Generation
  const handleSandboxGenerate = async () => {
    if (!sandboxCampaign) {
      setSandboxError("Please select a targeted campaign rule first.");
      return;
    }

    setSandboxLoading(true);
    setSandboxError(null);
    setSandboxResult(null);

    try {
      const token = getToken();
      const res = await axios.post(`${api.Url}/admin/auto-campaigns/generate-ai-test/${sandboxCampaign}`, {
        userName: sandboxName
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setSandboxResult(res.data.data);
      } else {
        setSandboxError(res.data.message);
        setSandboxResult(res.data.data); // falling back to defaults if failed
      }
    } catch (err) {
      setSandboxError(err.response?.data?.message || 'Failed to call OpenRouter AI generator.');
    } finally {
      setSandboxLoading(false);
    }
  };

  return (
    <>
      <style>{notificationStyles}</style>
      <div className="notif-root-x30sn">
        
        <header className="notif-header-x30sn">
          <div>
            <h1 className="notif-title-x30sn">Push Notifications</h1>
            <span className="notif-tagline-x30sn">Engage users with real-time mobile alerts</span>
          </div>
          <div className="stat-info-x30sn" style={{textAlign:'right'}}>
              <span style={{color:'#ff69b4', fontWeight:'700'}}>Active Systems</span>
              <strong style={{fontSize:14, color:'#aaa'}}>FCM • OpenRouter AI • MongoDB</strong>
          </div>
        </header>

        {/* Dynamic Navigation Tabs */}
        <div className="tabs-wrap-x30sn">
          <button 
            className={`tab-btn-x30sn ${activeTab === 'manual' ? 'active' : ''}`}
            onClick={() => setActiveTab('manual')}
          >
            Manual Broadcast
          </button>
          <button 
            className={`tab-btn-x30sn ${activeTab === 'scheduled' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduled')}
          >
            Scheduled Campaigns
          </button>
          <button 
            className={`tab-btn-x30sn ${activeTab === 'targeted' ? 'active' : ''}`}
            onClick={() => setActiveTab('targeted')}
          >
            Targeted Alerts (Real-Time)
          </button>
        </div>

        {activeTab === 'manual' && (
          <>
            {/* Stats Bar */}
            <div className="stats-bar-x30sn">
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn"><FaUsers /></div>
                    <div className="stat-info-x30sn">
                        <span>Total Database Users</span>
                        <strong>{stats.totalUsers}</strong>
                    </div>
                </div>
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn" style={{color:'#00ff00', background:'rgba(0,255,0,0.1)'}}><FaMobileAlt /></div>
                    <div className="stat-info-x30sn">
                        <span>Push-Ready Users</span>
                        <strong>{stats.mobileUsers}</strong>
                    </div>
                </div>
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn" style={{color:'#ffcc00', background:'rgba(255,204,0,0.1)'}}><FaCheckCircle /></div>
                    <div className="stat-info-x30sn">
                        <span>Server Status</span>
                        <strong style={{color:'#00ff00'}}>Online</strong>
                    </div>
                </div>
            </div>

            <div className="notif-grid-x30sn">
              <div className="card-x30sn">
                <div className="card-title-x30sn"><FaPaperPlane /> Composer</div>
                
                <div className="form-group-x30sn">
                  <label className="form-label-x30sn">Notification Target</label>
                  <select 
                    className="form-select-x30sn" 
                    value={target} 
                    onChange={(e) => setTarget(e.target.value)}
                    style={{ marginBottom: '8px' }}
                  >
                    <option value="all">All Mobile Users ({stats.mobileUsers})</option>
                    <option value="subscriber">Active Subscribers (Premium)</option>
                    <option value="non_subscriber">Non-Subscribers (Free)</option>
                    <option value="new_non_subscriber">New Users - Not Subscribed (Last 7 Days)</option>
                    <option value="new_subscriber">New Users - Subscribed (Last 7 Days)</option>
                    <option value="specific">Specific Users (Search & Select)</option>
                  </select>
                  <div style={{
                    marginTop: '8px',
                    fontSize: '12px',
                    color: '#ff69b4',
                    background: 'rgba(255, 105, 180, 0.05)',
                    border: '1px dashed rgba(255, 105, 180, 0.2)',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <FaInfoCircle />
                    <span>
                      Matches <strong>{targetStats.totalInSegment}</strong> users total ({targetStats.pushReadyInSegment} devices will receive the push notification).
                    </span>
                  </div>
                </div>

                {target === 'specific' && (
                  <div className="form-group-x30sn">
                    <label className="form-label-x30sn">Select Recipients</label>
                    <div className="user-selector-x30sn">
                      <div className="search-wrap-x30sn">
                        <FaSearch />
                        <input 
                          type="text" 
                          className="search-input-x30sn" 
                          placeholder="Search users by name or email..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>

                      {filteredUsers.length > 0 && (
                        <div className="user-list-x30sn">
                          {filteredUsers.map(u => (
                            <div key={u._id} className="user-item-x30sn" onClick={() => handleSelectUser(u)}>
                              <img 
                                src={u.profile_picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                                className="user-avatar-x30sn" 
                                alt=""
                              />
                              <div className="user-info-mini-x30sn">
                                <span className="user-name-mini-x30sn">{u.name}</span>
                                <span className="user-email-mini-x30sn">{u.email}</span>
                              </div>
                              {!u.fcmToken && <FaExclamationTriangle style={{color:'#ffcc00', fontSize:10}} title="No Token"/>}
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="selected-users-x30sn">
                        {selectedUsers.map(u => (
                          <div key={u._id} className="user-tag-x30sn">
                            {u.name}
                            <FaTrash className="remove-user-x30sn" onClick={() => handleRemoveUser(u._id)} />
                          </div>
                        ))}
                        {selectedUsers.length === 0 && <span style={{fontSize:11, color:'#444'}}>No users selected</span>}
                      </div>
                    </div>
                  </div>
                )}

                <div className="form-group-x30sn">
                  <label className="form-label-x30sn">Notification Title</label>
                  <input 
                    type="text" 
                    className="form-input-x30sn" 
                    placeholder="e.g. New Story Alert! 💖"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    maxLength={50}
                  />
                  <div className="char-count-x30sn">{title.length}/50</div>
                </div>

                <div className="form-group-x30sn">
                  <label className="form-label-x30sn">Message Body</label>
                  <textarea 
                    className="form-textarea-x30sn" 
                    placeholder="Write your message here..."
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    maxLength={150}
                  />
                  <div className="char-count-x30sn">{body.length}/150</div>
                </div>

                <div className="form-group-x30sn">
                  <label className="form-label-x30sn">Image URL (Optional)</label>
                  <input 
                    type="text" 
                    className="form-input-x30sn" 
                    placeholder="https://example.com/image.png"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  <div className="char-count-x30sn">Direct link to an image (PNG/JPG)</div>
                </div>

                <button 
                  className="send-btn-x30sn"
                  disabled={loading || !title || !body || (target !== 'all' && targetedUsers.length === 0)}
                  onClick={handleSend}
                >
                  {loading ? (
                    <>Sending...</>
                  ) : (
                    <>
                      <FaPaperPlane /> 
                      Send to {targetedUsers.length} Devices
                    </>
                  )}
                </button>

                {status && (
                  <div className={`status-msg-x30sn ${status.type}`}>
                    {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                    {status.message}
                  </div>
                )}
              </div>

              <div className="card-x30sn">
                <div className="card-title-x30sn"><FaMobileAlt /> Live Preview</div>
                <p style={{fontSize:12, color:'#666', marginBottom:20}}>
                  See how your notification will appear on a user's lock screen.
                </p>

                <div className="preview-phone-x30sn">
                  <div className="phone-top-x30sn"></div>
                  
                  {(title || body) && (
                    <div className="notif-banner-x30sn">
                      <div className="notif-icon-circle-x30sn">H</div>
                      <div className="notif-content-preview-x30sn">
                        <span className="notif-title-preview-x30sn">{title || "Notification Title"}</span>
                        <span className="notif-body-preview-x30sn">
                          {body || "Your notification message will appear here. Keep it concise for better engagement."}
                        </span>
                        {imageUrl && (
                          <img 
                            src={imageUrl} 
                            className="notif-image-preview-x30sn" 
                            alt="Preview"
                            onError={(e) => e.target.style.display = 'none'}
                          />
                        )}
                      </div>
                    </div>
                  )}

                  <div style={{marginTop: 300, textAlign:'center', color:'#222', fontSize:40, fontWeight:900, letterSpacing:2}}>
                    HEART ECHO
                  </div>
                </div>

                <div style={{marginTop: 25, background:'#111', padding:15, borderRadius:12, border:'1px solid #222'}}>
                    <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:10}}>
                        <FaInfoCircle style={{color:'#ff69b4'}}/>
                        <span style={{fontSize:13, fontWeight:700}}>Pro Tip</span>
                    </div>
                    <p style={{fontSize:12, color:'#888', margin:0, lineHeight:1.4}}>
                        Use emojis to increase open rates by up to 25%. Keep titles under 40 characters for full visibility on all devices.
                    </p>
                </div>

                <div style={{marginTop: 15, background:'#0a0a0a', padding:15, borderRadius:12, border:'1px solid #ff69b433'}}>
                    <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:10}}>
                        <FaUser style={{color:'#ff69b4'}}/>
                        <span style={{fontSize:13, fontWeight:700}}>Personalization Tag</span>
                    </div>
                    <p style={{fontSize:12, color:'#888', margin:0, lineHeight:1.4}}>
                        Use <strong>{`{name}`}</strong> in your title or body to automatically insert the user's full name. 
                        <br/><br/>
                        <code style={{color:'#ff69b4', fontSize:11}}>Hey {`{name}`}, check this out!</code>
                    </p>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'scheduled' && (
          <>
            {/* Scheduled stats */}
            <div className="stats-bar-x30sn">
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn"><FaPaperPlane /></div>
                    <div className="stat-info-x30sn">
                        <span>Total Auto Sent</span>
                        <strong>{scheduledStats.sent}</strong>
                    </div>
                </div>
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn" style={{color:'#00ff00', background:'rgba(0,255,0,0.1)'}}><FaBell /></div>
                    <div className="stat-info-x30sn">
                        <span>Average Open Rate</span>
                        <strong>{scheduledStats.openRate}%</strong>
                    </div>
                </div>
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn" style={{color:'#ff69b4', background:'rgba(255,105,180,0.1)'}}><FaGem /></div>
                    <div className="stat-info-x30sn">
                        <span>Premium Conversions</span>
                        <strong>{scheduledStats.conversions}</strong>
                    </div>
                </div>
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn" style={{color:'#ffcc00', background:'rgba(255,204,0,0.1)'}}><FaCheckCircle /></div>
                    <div className="stat-info-x30sn">
                        <span>Conversion Rate</span>
                        <strong>{scheduledStats.conversionRate}%</strong>
                    </div>
                </div>
            </div>

            {/* Campaign Grid */}
            <div className="auto-campaigns-grid-x30sn">
              {scheduledCampaigns.map(campaign => (
                <div key={campaign._id} className="campaign-card-x30sn">
                  <div>
                    <div className="campaign-card-header-x30sn">
                      <span className="campaign-badge-x30sn">{campaign.campaignType.replace(/_/g, ' ')}</span>
                      <label className="toggle-switch-x30sn">
                        <input 
                          type="checkbox" 
                          checked={campaign.isActive} 
                          onChange={() => handleToggleCampaign(campaign)}
                        />
                        <span className="toggle-slider-x30sn"></span>
                      </label>
                    </div>

                    <h3 className="campaign-title-x30sn">{campaign.title.replace(/{name}/g, 'User')}</h3>
                    
                    <div className="campaign-trigger-x30sn">
                      Trigger Time: <strong>{campaign.scheduledHour}:00 IST</strong>
                    </div>

                    <div className="campaign-preview-box-x30sn">
                      <span className="preview-title-x30sn">{campaign.title}</span>
                      <span className="preview-body-x30sn">{campaign.body}</span>
                      {campaign.imageUrl && (
                        <img 
                          src={campaign.imageUrl} 
                          style={{width:'100%', height:80, objectFit:'cover', borderRadius:6, marginTop:8}} 
                          alt="" 
                        />
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="campaign-stats-grid-x30sn">
                      <div className="campaign-stat-item-x30sn">
                        <span className="stat-label-x30sn">Sent</span>
                        <span className="stat-value-x30sn">{campaign.stats?.sent || 0}</span>
                      </div>
                      <div className="campaign-stat-item-x30sn">
                        <span className="stat-label-x30sn">Open Rate</span>
                        <span className="stat-value-x30sn">
                          {campaign.stats?.sent > 0 ? Math.round(((campaign.stats?.opened || 0) / campaign.stats.sent) * 100) : 0}%
                        </span>
                      </div>
                      <div className="campaign-stat-item-x30sn">
                        <span className="stat-label-x30sn">Conversions</span>
                        <span className="stat-value-x30sn">{campaign.stats?.conversions || 0}</span>
                      </div>
                      <div className="campaign-stat-item-x30sn">
                        <span className="stat-label-x30sn">Conv. Rate</span>
                        <span className="stat-value-x30sn">
                          {campaign.stats?.sent > 0 ? Math.round(((campaign.stats?.conversions || 0) / campaign.stats.sent) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    {runStatus && runStatus.campaignId === campaign._id && (
                      <div style={{
                        fontSize: 12,
                        padding: 8,
                        borderRadius: 6,
                        marginBottom: 10,
                        background: runStatus.type === 'success' ? 'rgba(0,255,0,0.1)' : runStatus.type === 'error' ? 'rgba(255,0,0,0.1)' : 'rgba(255,255,255,0.05)',
                        color: runStatus.type === 'success' ? '#00ff00' : runStatus.type === 'error' ? '#ff4444' : '#fff'
                      }}>
                        {runStatus.message}
                      </div>
                    )}

                    <div className="campaign-actions-x30sn">
                      <button className="action-btn-secondary-x30sn" onClick={() => handleOpenEdit(campaign)}>
                        <FaCog /> Edit Template
                      </button>
                      <button className="action-btn-primary-x30sn" onClick={() => handleTestTrigger(campaign)}>
                        <FaPlay /> Test Trigger
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'targeted' && (
          <>
            {/* Targeted stats */}
            <div className="stats-bar-x30sn">
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn"><FaRobot /></div>
                    <div className="stat-info-x30sn">
                        <span>Triggered Alerts Sent</span>
                        <strong>{triggeredStats.sent}</strong>
                    </div>
                </div>
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn" style={{color:'#00ff00', background:'rgba(0,255,0,0.1)'}}><FaBell /></div>
                    <div className="stat-info-x30sn">
                        <span>Trigger Open Rate</span>
                        <strong>{triggeredStats.openRate}%</strong>
                    </div>
                </div>
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn" style={{color:'#ff69b4', background:'rgba(255,105,180,0.1)'}}><FaGem /></div>
                    <div className="stat-info-x30sn">
                        <span>Triggered Conversions</span>
                        <strong>{triggeredStats.conversions}</strong>
                    </div>
                </div>
                <div className="stat-item-x30sn">
                    <div className="stat-icon-x30sn" style={{color:'#ffcc00', background:'rgba(255,204,0,0.1)'}}><FaCheckCircle /></div>
                    <div className="stat-info-x30sn">
                        <span>Trigger Conversion Rate</span>
                        <strong>{triggeredStats.conversionRate}%</strong>
                    </div>
                </div>
            </div>

            {/* Targeted Campaigns List */}
            <h2 style={{fontSize:18, fontWeight:800, margin:'20px 0'}}>Real-time Inactivity Trigger Rules</h2>
            <div className="auto-campaigns-grid-x30sn">
              {triggeredCampaigns.map(campaign => (
                <div key={campaign._id} className="campaign-card-x30sn">
                  <div>
                    <div className="campaign-card-header-x30sn">
                      <span className="campaign-badge-x30sn" style={{background:'rgba(0,255,0,0.1)', color:'#00ff00'}}>
                        {campaign.campaignType === "trigger_signup_no_msg" ? "Signup Inactivity" : "Chat Abandonment"}
                      </span>
                      <label className="toggle-switch-x30sn">
                        <input 
                          type="checkbox" 
                          checked={campaign.isActive} 
                          onChange={() => handleToggleCampaign(campaign)}
                        />
                        <span className="toggle-slider-x30sn"></span>
                      </label>
                    </div>

                    <h3 className="campaign-title-x30sn" style={{display:'flex', alignItems:'center', gap:8}}>
                      {campaign.campaignType === "trigger_signup_no_msg" ? "New Signup / Login Check" : "Free Message Abandonment"}
                      {campaign.aiEnabled && <FaMagic style={{color:'#ff69b4', fontSize:12}} title="AI Enabled"/>}
                    </h3>
                    
                    <div className="campaign-trigger-x30sn">
                      Trigger Time: <strong>Runs every 3-4 mins delay</strong>
                      <br/>
                      AI Generation: <strong style={{color: campaign.aiEnabled ? '#00ff00' : '#ff4444'}}>{campaign.aiEnabled ? 'ACTIVE (OpenRouter)' : 'DISABLED'}</strong>
                    </div>

                    <div className="campaign-preview-box-x30sn">
                      <span style={{fontSize:10, textTransform:'uppercase', color:'#ff69b4', display:'block', marginBottom:4, fontWeight:700}}>
                        {campaign.aiEnabled ? "AI Instruction prompt" : "Fallback Template"}
                      </span>
                      <span className="preview-body-x30sn">
                        {campaign.aiEnabled ? campaign.promptTemplate : `${campaign.title} - ${campaign.body}`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <div className="campaign-stats-grid-x30sn">
                      <div className="campaign-stat-item-x30sn">
                        <span className="stat-label-x30sn">Triggered</span>
                        <span className="stat-value-x30sn">{campaign.stats?.sent || 0}</span>
                      </div>
                      <div className="campaign-stat-item-x30sn">
                        <span className="stat-label-x30sn">Open Rate</span>
                        <span className="stat-value-x30sn">
                          {campaign.stats?.sent > 0 ? Math.round(((campaign.stats?.opened || 0) / campaign.stats.sent) * 100) : 0}%
                        </span>
                      </div>
                      <div className="campaign-stat-item-x30sn">
                        <span className="stat-label-x30sn">Conversions</span>
                        <span className="stat-value-x30sn">{campaign.stats?.conversions || 0}</span>
                      </div>
                      <div className="campaign-stat-item-x30sn">
                        <span className="stat-label-x30sn">Conv. Rate</span>
                        <span className="stat-value-x30sn">
                          {campaign.stats?.sent > 0 ? Math.round(((campaign.stats?.conversions || 0) / campaign.stats.sent) * 100) : 0}%
                        </span>
                      </div>
                    </div>

                    {runStatus && runStatus.campaignId === campaign._id && (
                      <div style={{
                        fontSize: 12,
                        padding: 8,
                        borderRadius: 6,
                        marginBottom: 10,
                        background: runStatus.type === 'success' ? 'rgba(0,255,0,0.1)' : runStatus.type === 'error' ? 'rgba(255,0,0,0.1)' : 'rgba(255,255,255,0.05)',
                        color: runStatus.type === 'success' ? '#00ff00' : runStatus.type === 'error' ? '#ff4444' : '#fff'
                      }}>
                        {runStatus.message}
                      </div>
                    )}

                    <div className="campaign-actions-x30sn">
                      <button className="action-btn-secondary-x30sn" onClick={() => handleOpenEdit(campaign)}>
                        <FaCog /> Configure Trigger
                      </button>
                      <button className="action-btn-primary-x30sn" onClick={() => handleTestTrigger(campaign)}>
                        <FaPlay /> Test Scanner
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* AI Generation Sandbox */}
            <div className="sandbox-box-x30sn">
              <div className="card-title-x30sn" style={{marginBottom:10}}><FaRobot /> OpenRouter AI Sandbox</div>
              <p style={{fontSize:12, color:'#888', margin:0}}>
                Test the dynamic AI generation of message titles and bodies using OpenRouter's free models. Select a trigger rule and input a test name to simulate the live notification content.
              </p>

              <div className="sandbox-grid-x30sn">
                <div>
                  <div className="form-group-x30sn" style={{marginTop:15}}>
                    <label className="form-label-x30sn">Target Trigger Rule</label>
                    <select 
                      className="form-select-x30sn"
                      value={sandboxCampaign}
                      onChange={(e) => setSandboxCampaign(e.target.value)}
                    >
                      {triggeredCampaigns.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.campaignType === "trigger_signup_no_msg" ? "Signup/Login Inactivity Rule" : "Chat Abandonment Rule"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group-x30sn">
                    <label className="form-label-x30sn">Test User Name</label>
                    <input 
                      type="text" 
                      className="form-input-x30sn"
                      value={sandboxName}
                      onChange={(e) => setSandboxName(e.target.value)}
                      placeholder="e.g. Rahul"
                    />
                  </div>

                  <button 
                    className="send-btn-x30sn" 
                    onClick={handleSandboxGenerate}
                    disabled={sandboxLoading || !sandboxCampaign}
                    style={{marginTop:10}}
                  >
                    {sandboxLoading ? (
                      <>Generating...</>
                    ) : (
                      <>
                        <FaMagic /> Generate Dynamic AI Content
                      </>
                    )}
                  </button>

                  <div style={{fontSize:11, color:'#555', marginTop:8, display:'flex', alignItems:'center', gap:5}}>
                    <FaInfoCircle />
                    <span>Uses free models rotation: gemma, qwen, llama...</span>
                  </div>

                  {sandboxError && (
                    <div className="status-msg-x30sn error">
                      <FaExclamationTriangle />
                      {sandboxError}
                    </div>
                  )}
                </div>

                <div>
                  <label className="form-label-x30sn" style={{display:'block', marginBottom:10}}>Generated Lock Screen Preview</label>
                  <div className="preview-phone-x30sn" style={{height: 280, width: '100%', borderRadius: 16, border: '1px solid #222'}}>
                    <div className="phone-top-x30sn" style={{margin:'6px auto', height: 10, width: 60}}></div>
                    
                    {sandboxResult ? (
                      <div className="notif-banner-x30sn" style={{animation:'none'}}>
                        <div className="notif-icon-circle-x30sn" style={{background:'#ff69b4', color:'#fff'}}>❤️</div>
                        <div className="notif-content-preview-x30sn">
                          <span className="notif-title-preview-x30sn" style={{color:'#ff69b4'}}>{sandboxResult.title}</span>
                          <span className="notif-body-preview-x30sn" style={{color:'#000'}}>{sandboxResult.body}</span>
                        </div>
                      </div>
                    ) : (
                      <div style={{textAlign:'center', marginTop:80, color:'#444', fontSize:13, padding:20}}>
                        {sandboxLoading ? "AI is thinking..." : "Click Generate to see the preview."}
                      </div>
                    )}
                    
                    {sandboxResult && (
                      <div style={{textAlign:'center', marginTop:60, color:'#111', fontSize:18, fontWeight:800}}>
                        HEART ECHO AI
                      </div>
                    )}
                  </div>

                  {sandboxResult && (
                    <div style={{marginTop:15, background:'#000', padding:10, borderRadius:8, border:'1px solid #111'}}>
                      <span style={{fontSize:10, color:'#666', textTransform:'uppercase', fontWeight:700}}>Raw JSON Generated</span>
                      <pre style={{margin:0, color:'#00ff00', fontSize:11, overflowX:'auto'}}>
                        {JSON.stringify(sandboxResult, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </>
        )}

        {/* History Section */}
        <div className="card-x30sn" style={{marginTop: 30, width: '100%'}}>
            <div className="card-title-x30sn"><FaHistory /> Notification Campaign History Analytics</div>
            
            {/* Visual Stats Cards */}
            <div className="history-stats-grid-x30sn">
                <div className="history-stat-card-x30sn">
                    <div className="stat-card-header-x30sn">
                        <span className="stat-card-label-x30sn">Total Broadcasts</span>
                        <div className="stat-card-icon-x30sn"><FaPaperPlane /></div>
                    </div>
                    <strong className="stat-card-value-x30sn">{historyStats.totalSent.toLocaleString()}</strong>
                    <span className="stat-card-sub-x30sn">Across {history.length} logged batches</span>
                </div>
                <div className="history-stat-card-x30sn">
                    <div className="stat-card-header-x30sn">
                        <span className="stat-card-label-x30sn">Unique Opens</span>
                        <div className="stat-card-icon-x30sn" style={{color:'#00ff00', background:'rgba(0,255,0,0.08)'}}><FaBell /></div>
                    </div>
                    <strong className="stat-card-value-x30sn">{historyStats.totalOpens.toLocaleString()}</strong>
                    <span className="stat-card-sub-x30sn" style={{color:'#00ff00', fontWeight:'700'}}>Avg Open Rate: {historyStats.avgOpenRate}%</span>
                </div>
                <div className="history-stat-card-x30sn">
                    <div className="stat-card-header-x30sn">
                        <span className="stat-card-label-x30sn">Conversions</span>
                        <div className="stat-card-icon-x30sn" style={{color:'#ff69b4', background:'rgba(255,105,180,0.08)'}}><FaGem /></div>
                    </div>
                    <strong className="stat-card-value-x30sn">{historyStats.totalConversions.toLocaleString()}</strong>
                    <span className="stat-card-sub-x30sn" style={{color:'#ff69b4', fontWeight:'700'}}>Avg Conv. Rate: {historyStats.avgConversionRate}%</span>
                </div>
                <div className="history-stat-card-x30sn">
                    <div className="stat-card-header-x30sn">
                        <span className="stat-card-label-x30sn">Top Campaign</span>
                        <div className="stat-card-icon-x30sn" style={{color:'#ffcc00', background:'rgba(255,204,0,0.08)'}}><FaMagic /></div>
                    </div>
                    <strong className="stat-card-value-x30sn" style={{fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '100%', display: 'block'}} title={historyStats.bestCampaign ? historyStats.bestCampaign.title : "N/A"}>
                        {historyStats.bestCampaign ? historyStats.bestCampaign.title : "No Data"}
                    </strong>
                    <span className="stat-card-sub-x30sn">
                        {historyStats.bestCampaign 
                            ? `${formatTarget(historyStats.bestCampaign.target)} • Conv: ${historyStats.bestCampaign.conversionsCount || 0}`
                            : "N/A"
                        }
                    </span>
                </div>
            </div>

            {/* Filter controls panel */}
            <div className="history-filters-bar-x30sn">
                <div style={{display:'flex', gap:15, flexWrap:'wrap', flex: 1}}>
                    {/* Search */}
                    <div className="filter-group-x30sn" style={{minWidth: 220, flex: 1}}>
                        <span className="filter-label-x30sn">Search</span>
                        <input 
                            type="text" 
                            className="search-input-x30sn" 
                            style={{padding: '8px 12px 8px 30px', margin: 0, width: '100%'}}
                            placeholder="Search title, message, segment..."
                            value={historySearch}
                            onChange={(e) => setHistorySearch(e.target.value)}
                        />
                    </div>
                    {/* Segment Filter */}
                    <div className="filter-group-x30sn">
                        <span className="filter-label-x30sn">Segment</span>
                        <select 
                            className="form-select-x30sn" 
                            style={{padding: '8px 25px 8px 12px', width: 'auto'}}
                            value={historyTargetFilter}
                            onChange={(e) => setHistoryTargetFilter(e.target.value)}
                        >
                            <option value="all">All Segments</option>
                            <option value="subscriber">Active Subscribers</option>
                            <option value="non_subscriber">Non-Subscribers</option>
                            <option value="new_non_subscriber">New Non-Subscribers</option>
                            <option value="new_subscriber">New Subscribers</option>
                            <option value="specific">Specific Users</option>
                            <option value="welcome_1">Welcome (Day 1)</option>
                            <option value="welcome_2">Welcome (Day 2)</option>
                            <option value="welcome_3">Welcome (Day 3)</option>
                            <option value="daily_morning">Daily (Morning)</option>
                            <option value="daily_afternoon">Daily (Afternoon)</option>
                            <option value="daily_evening">Daily (Evening)</option>
                            <option value="daily_night">Daily (Bedtime)</option>
                            <option value="inactive_3d">Inactive (3 Days)</option>
                            <option value="inactive_7d">Inactive (7 Days)</option>
                            <option value="premium_upsell">Premium Upsell</option>
                            <option value="weekend_special">Weekend Special</option>
                            <option value="festival_greeting">Festival Greetings</option>
                            <option value="trigger_signup_no_msg">Signup Inactivity Trigger</option>
                            <option value="trigger_inactive_after_msg">Chat Abandonment Trigger</option>
                        </select>
                    </div>
                    {/* Type Filter */}
                    <div className="filter-group-x30sn">
                        <span className="filter-label-x30sn">Type</span>
                        <select 
                            className="form-select-x30sn" 
                            style={{padding: '8px 25px 8px 12px', width: 'auto'}}
                            value={historyTypeFilter}
                            onChange={(e) => setHistoryTypeFilter(e.target.value)}
                        >
                            <option value="all">All Broadcasts</option>
                            <option value="manual">Manual Broadcasts</option>
                            <option value="auto">Automated Campaigns</option>
                        </select>
                    </div>
                </div>

                <div style={{display:'flex', gap:10, alignItems:'center', marginTop: 10, alignSelf: 'flex-end'}}>
                    {/* Limit Selector */}
                    <div className="filter-group-x30sn">
                        <span className="filter-label-x30sn">Load Count</span>
                        <select 
                            className="form-select-x30sn" 
                            style={{padding: '8px 25px 8px 12px', width: 'auto'}}
                            value={historyLimit}
                            onChange={(e) => setHistoryLimit(Number(e.target.value))}
                        >
                            <option value="20">Latest 20</option>
                            <option value="50">Latest 50</option>
                            <option value="100">Latest 100</option>
                            <option value="200">Latest 200</option>
                            <option value="500">Latest 500</option>
                            <option value="1000">Latest 1000</option>
                        </select>
                    </div>
                    <button 
                        className="action-btn-secondary-x30sn"
                        style={{padding: '8px 12px', height: '37px', minWidth: 'auto'}}
                        onClick={() => fetchHistory(historyLimit)}
                        title="Reload history data"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={{overflowX: 'auto'}}>
                <table className="history-table-x30sn">
                    <thead>
                        <tr>
                            <th className="history-th-sortable-x30sn" onClick={() => handleSort('sentAt')}>
                                Date {getSortIcon('sentAt')}
                            </th>
                            <th className="history-th-sortable-x30sn" onClick={() => handleSort('title')}>
                                Campaign Message {getSortIcon('title')}
                            </th>
                            <th className="history-th-sortable-x30sn" onClick={() => handleSort('target')}>
                                Target Segment {getSortIcon('target')}
                            </th>
                            <th className="history-th-sortable-x30sn" onClick={() => handleSort('recipientsCount')} style={{textAlign:'center'}}>
                                Sent To {getSortIcon('recipientsCount')}
                            </th>
                            <th className="history-th-sortable-x30sn" onClick={() => handleSort('opensCount')} style={{textAlign:'center'}}>
                                Opens {getSortIcon('opensCount')}
                            </th>
                            <th className="history-th-sortable-x30sn" onClick={() => handleSort('openRate')} style={{textAlign:'center'}}>
                                Open Rate {getSortIcon('openRate')}
                            </th>
                            <th className="history-th-sortable-x30sn" onClick={() => handleSort('conversionsCount')} style={{textAlign:'center'}}>
                                Conversions {getSortIcon('conversionsCount')}
                            </th>
                            <th className="history-th-sortable-x30sn" onClick={() => handleSort('conversionRate')} style={{textAlign:'center'}}>
                                Conv. Rate {getSortIcon('conversionRate')}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedHistory.length > 0 ? paginatedHistory.map(h => {
                            const openRate = h.recipientsCount > 0 ? Math.round(((h.opensCount || 0) / h.recipientsCount) * 100) : 0;
                            const convRate = h.recipientsCount > 0 ? Math.round(((h.conversionsCount || 0) / h.recipientsCount) * 100) : 0;
                            const isExpanded = expandedRowId === h._id;
                            
                            return (
                                <Fragment key={h._id}>
                                    <tr 
                                        className={`history-row-x30sn ${isExpanded ? 'history-row-expanded-x30sn' : ''}`}
                                        onClick={() => setExpandedRowId(isExpanded ? null : h._id)}
                                    >
                                        <td style={{color: '#666', fontSize: 11}}>{new Date(h.sentAt).toLocaleDateString()}</td>
                                        <td>
                                            <div style={{fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6}}>
                                                {h.campaignId ? <span className="campaign-badge-x30sn" style={{fontSize: 8, padding: '1px 4px', background: 'rgba(176,66,255,0.15)', color: '#b042ff'}}>AUTO</span> : <span className="campaign-badge-x30sn" style={{fontSize: 8, padding: '1px 4px', background: 'rgba(0,180,255,0.15)', color: '#00b4ff'}}>MANUAL</span>}
                                                {h.title}
                                            </div>
                                            <div className="truncate-text-x30sn">{h.body}</div>
                                        </td>
                                        <td>{formatTarget(h.target)}</td>
                                        <td style={{fontWeight: 700, textAlign:'center'}}>{h.recipientsCount}</td>
                                        <td style={{textAlign:'center'}}>
                                            <span className="open-badge-x30sn">{h.opensCount || 0}</span>
                                        </td>
                                        <td>
                                            <div className="rate-badge-pill-x30sn" style={{alignItems:'center'}}>
                                                <span className="rate-badge-percentage-x30sn" style={{color: '#ff69b4'}}>{openRate}%</span>
                                                <div className="rate-bar-container-x30sn">
                                                    <div className="rate-bar-fill-x30sn" style={{width: `${openRate}%`, background: '#ff69b4'}}></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{textAlign:'center'}}>
                                            <span className="conversion-badge-x30sn">{h.conversionsCount || 0}</span>
                                        </td>
                                        <td>
                                            <div className="rate-badge-pill-x30sn" style={{alignItems:'center'}}>
                                                <span className="rate-badge-percentage-x30sn" style={{color: '#ffcc00'}}>{convRate}%</span>
                                                <div className="rate-bar-container-x30sn">
                                                    <div className="rate-bar-fill-x30sn" style={{width: `${convRate}%`, background: '#ffcc00'}}></div>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                    {isExpanded && (
                                        <tr className="expanded-detail-row-x30sn">
                                            <td colSpan="8">
                                                <div className="expanded-detail-card-x30sn">
                                                    <div style={{display:'flex', gap:20, flexWrap:'wrap'}}>
                                                        <div style={{flex: 2, minWidth: 280}}>
                                                            <span style={{fontSize: 10, color: '#666', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 5}}>Campaign ID / Reference</span>
                                                            <code style={{color: '#aaa', fontSize: 12, display: 'block', marginBottom: 15}}>{h._id}</code>
                                                            
                                                            <span style={{fontSize: 10, color: '#666', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 5}}>Notification Title</span>
                                                            <h4 style={{margin: '0 0 15px 0', fontSize: 15, fontWeight: 700, color: '#fff'}}>{h.title}</h4>
                                                            
                                                            <span style={{fontSize: 10, color: '#666', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 5}}>Message Body</span>
                                                            <p style={{margin: '0 0 15px 0', fontSize: 13, color: '#ccc', whiteSpace: 'pre-wrap', lineHeight: 1.5}}>{h.body}</p>
                                                            
                                                            <div style={{display:'flex', gap:30, borderTop: '1px solid #111', paddingTop: 15, marginTop: 10}}>
                                                                <div>
                                                                    <span style={{fontSize: 10, color: '#666', textTransform: 'uppercase', fontWeight: 700, display: 'block'}}>Targeting</span>
                                                                    <span style={{fontSize: 12, color: '#fff', fontWeight: 600}}>{formatTarget(h.target)}</span>
                                                                </div>
                                                                <div>
                                                                    <span style={{fontSize: 10, color: '#666', textTransform: 'uppercase', fontWeight: 700, display: 'block'}}>Sent Time</span>
                                                                    <span style={{fontSize: 12, color: '#fff'}}>{new Date(h.sentAt).toLocaleString()}</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {h.imageUrl && (
                                                            <div style={{flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column'}}>
                                                                <span style={{fontSize: 10, color: '#666', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 5}}>Campaign Image</span>
                                                                <img 
                                                                    src={h.imageUrl} 
                                                                    style={{width: '100%', maxHeight: 150, objectFit: 'cover', borderRadius: 8, border: '1px solid #222'}} 
                                                                    alt="Campaign Preview"
                                                                    onError={(e) => e.target.style.display = 'none'}
                                                                />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </Fragment>
                            );
                        }) : (
                            <tr>
                                <td colSpan="8" style={{textAlign: 'center', color: '#444', padding: 40}}>No matching campaign history found</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Footer */}
            {totalPages > 1 && (
                <div className="pagination-container-x30sn">
                    <div className="pagination-info-x30sn">
                        Showing {Math.min(processedHistory.length, (historyPage - 1) * historyPageSize + 1)} to {Math.min(processedHistory.length, historyPage * historyPageSize)} of {processedHistory.length} entries
                    </div>
                    <div className="pagination-controls-x30sn">
                        <button 
                            className="pagination-btn-x30sn"
                            onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                            disabled={historyPage === 1}
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }).map((_, idx) => {
                            const pageNum = idx + 1;
                            // Limit page numbers shown if there are too many pages
                            if (totalPages > 6 && Math.abs(historyPage - pageNum) > 2 && pageNum !== 1 && pageNum !== totalPages) {
                                if (pageNum === 2 || pageNum === totalPages - 1) {
                                    return <span key={pageNum} style={{color: '#444', padding: '6px 4px'}}>...</span>;
                                }
                                return null;
                            }
                            
                            return (
                                <button
                                    key={pageNum}
                                    className={`pagination-btn-x30sn ${historyPage === pageNum ? 'active' : ''}`}
                                    onClick={() => setHistoryPage(pageNum)}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                        
                        <button 
                            className="pagination-btn-x30sn"
                            onClick={() => setHistoryPage(p => Math.min(totalPages, p + 1))}
                            disabled={historyPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>

        {/* Edit Campaign Modal */}
        {editingCampaign && (
          <div className="modal-overlay-x30sn">
            <div className="modal-content-x30sn">
              <div className="modal-header-x30sn">
                <h2 className="modal-title-x30sn">
                  Configure {editingCampaign.campaignType.startsWith("trigger_") ? "Real-time Trigger Rule" : "Campaign Template"}
                </h2>
                <button className="close-modal-x30sn" onClick={() => setEditingCampaign(null)}>✕</button>
              </div>

              {editingCampaign.campaignType.startsWith("trigger_") && (
                <div className="form-group-x30sn" style={{background:'#000', padding:15, borderRadius:10, border:'1px solid #111', display:'flex', alignItems:'center', justifyContent:'between', gap:15}}>
                  <div>
                    <label className="form-label-x30sn" style={{marginBottom:2}}>AI Dynamic Message Generation</label>
                    <span style={{fontSize:11, color:'#666'}}>Use OpenRouter AI to generate highly personalized Hinglish texts.</span>
                  </div>
                  <label className="toggle-switch-x30sn">
                    <input 
                      type="checkbox" 
                      checked={editAiEnabled} 
                      onChange={(e) => setEditAiEnabled(e.target.checked)}
                    />
                    <span className="toggle-slider-x30sn"></span>
                  </label>
                </div>
              )}

              {/* Show Prompt Template if AI is enabled, otherwise Fallback Templates */}
              {editingCampaign.campaignType.startsWith("trigger_") && editAiEnabled ? (
                <div className="form-group-x30sn">
                  <label className="form-label-x30sn">AI Prompt Instructions</label>
                  <textarea 
                    className="form-textarea-x30sn" 
                    value={editPromptTemplate}
                    onChange={(e) => setEditPromptTemplate(e.target.value)}
                    placeholder="Provide specific instructions for the AI model..."
                    style={{minHeight: 120}}
                  />
                  <div style={{fontSize:11, color:'#555', marginTop:4}}>
                    Placeholder <code>{`{name}`}</code> will be replaced with user's name during instruction compile.
                  </div>
                </div>
              ) : null}

              {/* Always keep fallbacks/defaults inputs */}
              {(!editingCampaign.campaignType.startsWith("trigger_") || !editAiEnabled) && (
                <>
                  <div className="form-group-x30sn">
                    <label className="form-label-x30sn">Campaign Title / Fallback Title</label>
                    <input 
                      type="text" 
                      className="form-input-x30sn" 
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      placeholder="Title text"
                      maxLength={50}
                    />
                    <div className="char-count-x30sn">{editTitle.length}/50</div>
                  </div>

                  <div className="form-group-x30sn">
                    <label className="form-label-x30sn">Message Body / Fallback Body</label>
                    <textarea 
                      className="form-textarea-x30sn" 
                      value={editBody}
                      onChange={(e) => setEditBody(e.target.value)}
                      placeholder="Body message"
                      maxLength={150}
                    />
                    <div className="char-count-x30sn">{editBody.length}/150</div>
                  </div>
                </>
              )}

              {!editingCampaign.campaignType.startsWith("trigger_") && (
                <>
                  <div className="form-group-x30sn">
                    <label className="form-label-x30sn">Image URL (Optional)</label>
                    <input 
                      type="text" 
                      className="form-input-x30sn" 
                      value={editImageUrl}
                      onChange={(e) => setEditImageUrl(e.target.value)}
                      placeholder="https://example.com/image.png"
                    />
                  </div>

                  <div className="form-group-x30sn">
                    <label className="form-label-x30sn">Trigger Hour (IST, 24h format)</label>
                    <input 
                      type="number" 
                      className="form-input-x30sn" 
                      min="0"
                      max="23"
                      value={editScheduledHour}
                      onChange={(e) => setEditScheduledHour(e.target.value)}
                    />
                  </div>
                </>
              )}

              <div className="form-group-x30sn" style={{display:'flex', alignItems:'center', gap:15}}>
                <label className="form-label-x30sn" style={{marginBottom:0}}>Active Status</label>
                <label className="toggle-switch-x30sn">
                  <input 
                    type="checkbox" 
                    checked={editIsActive} 
                    onChange={(e) => setEditIsActive(e.target.checked)}
                  />
                  <span className="toggle-slider-x30sn"></span>
                </label>
              </div>

              {editStatus && (
                <div className={`status-msg-x30sn ${editStatus.type}`} style={{marginBottom:15}}>
                  {editStatus.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                  {editStatus.message}
                </div>
              )}

              <div style={{display:'flex', gap:10, marginTop:20}}>
                <button className="action-btn-secondary-x30sn" onClick={() => setEditingCampaign(null)}>
                  Cancel
                </button>
                <button className="action-btn-primary-x30sn" onClick={handleSaveCampaign}>
                  Save Configuration
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

export default NotificationsAdmin;
