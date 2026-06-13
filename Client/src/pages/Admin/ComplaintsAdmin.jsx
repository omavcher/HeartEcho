'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { 
  FaTicketAlt, FaTrash, FaEdit, FaSearch, FaCheckCircle, 
  FaTimesCircle, FaSync, FaDownload, FaChartBar, FaExclamationTriangle,
  FaEnvelope, FaTimes, FaMagic, FaPaperPlane, FaSpinner, FaEye,
  FaThLarge, FaList
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from "recharts";
import api from "../../config/api";
import axios from "axios";

// ------------------- CSS STYLES (Premium Black, Gold, Pink & Glassmorphism) -------------------
const styles = `
/* ROOT & THEME */
.cc-root {
  color: #fff;
  background-color: #030303;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: cc-fadeIn 0.4s ease;
}
@keyframes cc-fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.cc-header {
  padding: 28px 32px;
  background: linear-gradient(180deg, #070707 0%, #030303 100%);
  border-bottom: 1px solid #161616;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.cc-title-group h2 { 
  font-size: 26px; 
  font-weight: 800; 
  margin: 0; 
  letter-spacing: -0.5px;
  color: #fff; 
  display: flex;
  align-items: center;
  gap: 12px;
}
.cc-tagline { 
  color: #ff69b4; 
  margin: 6px 0 0; 
  font-size: 13px; 
  font-weight: 500; 
  display: flex;
  align-items: center;
  gap: 8px;
}

/* BUTTONS */
.cc-btn {
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
.cc-btn:hover:not(:disabled) { 
  border-color: #ff69b4; 
  color: #ff69b4; 
  background: rgba(255, 105, 180, 0.03);
  transform: translateY(-1px);
}
.cc-btn.primary {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.cc-btn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
  color: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.25);
}
.cc-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* KPI GRID */
.cc-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}
.cc-stat-card {
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
.cc-stat-card:hover { 
  border-color: #262626; 
  transform: translateY(-3px); 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.cc-stat-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(255,105,180,0.02), transparent 60%);
  pointer-events: none;
}
.cc-stat-icon {
  width: 46px; 
  height: 46px; 
  border-radius: 12px; 
  background: rgba(255, 105, 180, 0.08); 
  color: #ff69b4;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 20px;
  border: 1px solid rgba(255, 105, 180, 0.15);
}
.cc-stat-info span { margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.8px; display: block; }
.cc-stat-info strong { font-size: 24px; color: #fff; display: block; margin-top: 4px; font-weight: 800; }

/* CHARTS ROW */
.cc-charts-row {
  display: grid; 
  grid-template-columns: 1fr 1.2fr; 
  gap: 20px; 
  padding: 0 32px 24px;
}
.cc-chart-box {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 20px; 
  padding: 20px; 
  min-height: 290px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
}
.cc-chart-title { 
  font-size: 14px; 
  font-weight: 700; 
  margin-bottom: 20px; 
  color: #eee;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* CONTROLS SECTION */
.cc-controls-section {
  padding: 0 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.cc-view-toggle-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #161616;
  padding-bottom: 16px;
}
.cc-toggle-buttons {
  display: flex;
  gap: 8px;
}
.cc-toggle-btn {
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: #0c0c0c;
  color: #888;
  border: 1px solid #1a1a1a;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;
}
.cc-toggle-btn:hover {
  color: #fff;
  border-color: #333;
}
.cc-toggle-btn.active {
  background: rgba(255, 105, 180, 0.08);
  color: #ff69b4;
  border-color: #ff69b4;
}

.cc-filters-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  background: rgba(10, 10, 10, 0.4);
  border: 1px solid #161616;
  padding: 16px;
  border-radius: 12px;
}
.cc-search-wrap {
  position: relative; 
  flex: 1;
  min-width: 280px;
}
.cc-search-icon { position: absolute; left: 14px; top: 13px; color: #555; }
.cc-input {
  width: 100%; 
  background: rgba(15, 15, 15, 0.7); 
  border: 1px solid #222; 
  color: #fff; 
  padding: 12px 12px 12px 42px;
  border-radius: 10px; 
  outline: none; 
  font-size: 13px;
  transition: all 0.25s ease;
}
.cc-input:focus { 
  border-color: #ff69b4; 
  background: #000;
  box-shadow: 0 0 12px rgba(255, 105, 180, 0.15);
}
.cc-select {
  background: rgba(15, 15, 15, 0.7);
  color: #ccc;
  border: 1px solid #222;
  padding: 12px 16px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  cursor: pointer;
  min-width: 150px;
  transition: all 0.25s ease;
}
.cc-select:focus {
  border-color: #ff69b4;
  color: #fff;
}

/* CARDS GRID LAYOUT */
.cc-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 20px;
  padding: 0 32px 32px;
}
.cc-ticket-card {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}
.cc-ticket-card:hover { 
  border-color: #ff69b4; 
  transform: translateY(-3px); 
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
}

.cc-card-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.cc-status-badge {
  padding: 4px 8px; 
  border-radius: 6px; 
  font-size: 9px; 
  font-weight: 800; 
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: inline-block;
}
.cc-status-badge.pending { background: rgba(255, 68, 68, 0.05); color: #ff4444; border: 1px solid rgba(255, 68, 68, 0.15); }
.cc-status-badge.resolved { background: rgba(0, 255, 136, 0.05); color: #00ff88; border: 1px solid rgba(0, 255, 136, 0.15); }

.cc-issue-text {
  font-size: 14px; 
  color: #fff; 
  margin: 12px 0 16px; 
  line-height: 1.5; 
  font-weight: 600;
  word-break: break-word;
}

.cc-user-box {
  background: rgba(5, 5, 5, 0.5);
  border: 1px solid #141414;
  border-radius: 10px;
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.cc-ub-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 11px;
  color: #888;
}
.cc-ub-row.border-bottom {
  border-bottom: 1px solid #161616;
  padding-bottom: 6px;
}
.cc-ub-row strong { color: #ccc; }

.cc-card-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding-top: 14px;
  border-top: 1px solid #161616;
  margin-top: 16px;
}
.cc-act-btn {
  height: 34px;
  border-radius: 8px;
  background: #0f0f0f;
  border: 1px solid #222;
  color: #aaa;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 12px;
  font-weight: 600;
  padding: 0 12px;
  gap: 6px;
}
.cc-act-btn:hover {
  transform: translateY(-1px);
}
.cc-act-btn.email-btn:hover { color: #a78bfa; border-color: rgba(167, 139, 250, 0.3); background: rgba(167, 139, 250, 0.04); }
.cc-act-btn.edit-btn:hover { color: #ff69b4; border-color: rgba(255, 105, 180, 0.3); background: rgba(255, 105, 180, 0.04); }
.cc-act-btn.delete-btn:hover { color: #ff4444; border-color: rgba(255, 68, 68, 0.3); background: rgba(255, 68, 68, 0.04); }

/* ENTERPRISE TABLE VIEW */
.cc-table-wrapper {
  padding: 0 32px 32px;
}
.cc-table-card {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.cc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.cc-table th {
  padding: 16px 20px; 
  text-align: left; 
  color: #666; 
  font-weight: 700; 
  text-transform: uppercase; 
  font-size: 10px; 
  letter-spacing: 1.2px;
  border-bottom: 1px solid #1a1a1a;
  background: #070707;
}
.cc-table td {
  padding: 16px 20px; 
  border-bottom: 1px solid #111; 
  color: #ccc; 
  vertical-align: middle; 
  transition: all 0.2s ease;
}
.cc-table tr {
  position: relative;
  transition: all 0.2s ease;
}
.cc-table tr:hover td { 
  background: rgba(255, 105, 180, 0.015); 
  color: #fff;
}
.cc-table tr:hover::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #ff69b4;
  box-shadow: 0 0 8px #ff69b4;
}

.cc-user-cell {
  display: flex;
  flex-direction: column;
}
.cc-user-name {
  font-weight: 700;
  color: #fff;
}
.cc-user-email {
  font-size: 11px;
  color: #555;
}

/* PAGINATION */
.cc-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 20px 32px 40px;
}

/* MODAL OVERLAY */
.cc-modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: cc-fadeIn 0.25s ease;
}
.cc-modal-content {
  background: rgba(10, 10, 10, 0.95);
  border: 1px solid #262626;
  padding: 28px;
  border-radius: 20px;
  width: 420px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  animation: cc-modalScale 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
@keyframes cc-modalScale {
  from { transform: scale(0.9) translateY(10px); opacity: 0; }
  to { transform: scale(1) translateY(0); opacity: 1; }
}

.cc-modal-title {
  margin: 0;
  color: #ff69b4;
  font-size: 20px;
  font-weight: 800;
}
.cc-form-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.cc-form-group label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.8px;
}
.cc-textarea {
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  resize: vertical;
  transition: all 0.25s ease;
  font-family: inherit;
}
.cc-textarea:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.15);
}

/* EMAIL COMPOSER MODAL (SPLIT) */
.cc-email-overlay {
  position: fixed; 
  inset: 0; 
  background: rgba(0,0,0,0.9); 
  z-index: 9999;
  display: flex; 
  justify-content: center; 
  align-items: center; 
  backdrop-filter: blur(8px);
  padding: 20px;
  animation: cc-fadeIn 0.25s ease;
}
.cc-email-box {
  background: rgba(10, 10, 10, 0.95); 
  border: 1px solid #262626; 
  border-radius: 20px;
  width: 100%; 
  max-width: 1050px; 
  max-height: 90vh;
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
  box-shadow: 0 30px 80px rgba(0,0,0,0.8);
}
.cc-email-header {
  display: flex; 
  align-items: center; 
  justify-content: space-between;
  padding: 20px 24px; 
  border-bottom: 1px solid #1a1a1a;
  background: #070707;
}
.cc-email-title {
  display: flex; 
  align-items: center; 
  gap: 10px;
  font-size: 18px; 
  font-weight: 700; 
  color: #fff;
}
.cc-email-title svg { color: #a78bfa; }
.cc-email-pill {
  background: rgba(167,139,250,0.1); 
  color: #a78bfa; 
  border: 1px solid rgba(167,139,250,0.2);
  padding: 3px 10px; 
  border-radius: 20px; 
  font-size: 11px; 
  font-weight: 600; 
  margin-left: 8px;
}
.cc-email-close {
  background: #111; 
  border: 1px solid #222; 
  color: #888; 
  width: 34px; 
  height: 34px;
  border-radius: 8px; 
  cursor: pointer; 
  display: flex; 
  align-items: center; 
  justify-content: center;
  transition: all 0.2s; 
  font-size: 14px;
}
.cc-email-close:hover { border-color: #ff4444; color: #ff4444; }

.cc-email-body {
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  flex: 1; 
  overflow: hidden;
}
@media (max-width: 768px) { .cc-email-body { grid-template-columns: 1fr; } }

.cc-email-preview-panel {
  border-right: 1px solid #1a1a1a; 
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
}
.cc-panel-header {
  padding: 14px 20px; 
  border-bottom: 1px solid #161616; 
  background: #090909; 
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 11px; 
  color: #666; 
  text-transform: uppercase; 
  font-weight: 700;
  letter-spacing: 0.8px;
}
.cc-panel-header.ai-header svg { color: #a78bfa; }
.cc-panel-header.preview-header svg { color: #ff69b4; }

.cc-email-frame-wrap {
  flex: 1; 
  overflow: auto; 
  background: #120524;
  padding: 16px;
  display: flex;
  justify-content: center;
}
.cc-email-frame {
  width: 100%; 
  max-width: 480px;
  height: 100%; 
  min-height: 480px; 
  border: 1px solid #222; 
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0,0,0,0.5);
  display: block;
  background: #120524;
}

.cc-email-editor-panel {
  display: flex; 
  flex-direction: column; 
  overflow: hidden;
}
.cc-email-editor-content { 
  flex: 1; 
  padding: 24px; 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
  overflow-y: auto; 
}

.cc-ticket-info-strip {
  background: rgba(5,5,5,0.6); 
  border: 1px solid #161616; 
  border-radius: 10px; 
  padding: 12px;
  display: grid; 
  grid-template-columns: 1fr 1fr; 
  gap: 8px; 
  font-size: 11px;
}
.cc-info-item { color: #555; text-transform: uppercase; font-weight: 700; }
.cc-info-item strong { color: #ccc; font-weight: 500; text-transform: none; display: inline-block; margin-left: 4px; }

.cc-complaint-preview {
  background: rgba(255,68,68,0.02); 
  border: 1px solid rgba(255,68,68,0.1);
  border-left: 3px solid #ff4444; 
  border-radius: 8px; 
  padding: 12px;
}
.cc-complaint-label { font-size: 9px; color: #ff6666; text-transform: uppercase; font-weight: 700; letter-spacing: 0.08em; margin-bottom: 6px; }
.cc-complaint-text { font-size: 13px; color: #ddd; line-height: 1.5; font-style: italic; }

.cc-ai-status-bar {
  display: flex; 
  align-items: center; 
  gap: 8px; 
  font-size: 12px; 
  padding: 10px 14px;
  border-radius: 8px; 
  font-weight: 600;
}
.cc-ai-status-bar.loading { background: rgba(167,139,250,0.05); color: #a78bfa; border: 1px solid rgba(167,139,250,0.15); }
.cc-ai-status-bar.success { background: rgba(0, 255, 136, 0.05); color: #00ff88; border: 1px solid rgba(0, 255, 136, 0.15); }
.cc-ai-status-bar.error { background: rgba(255, 68, 68, 0.05); color: #ff4444; border: 1px solid rgba(255, 68, 68, 0.15); }

.cc-editor-label {
  font-size: 11px;
  color: #666;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 6px;
}
.cc-editor-label svg { color: #a78bfa; }

.cc-editor-textarea {
  width: 100%; 
  background: rgba(15, 15, 15, 0.8); 
  border: 1px solid #222; 
  color: #fff;
  padding: 14px; 
  border-radius: 10px; 
  outline: none; 
  resize: vertical;
  font-size: 13px; 
  line-height: 1.6; 
  font-family: inherit; 
  min-height: 150px;
  transition: all 0.25s ease;
}
.cc-editor-textarea:focus { border-color: #a78bfa; box-shadow: 0 0 10px rgba(167,139,250,0.15); }

.cc-email-actions {
  display: flex; 
  gap: 12px;
  margin-top: auto;
}
.cc-email-actions button {
  padding: 12px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
}
.cc-btn-regen {
  flex: 1;
  background: #111;
  border: 1px solid #222;
  color: #a78bfa;
}
.cc-btn-regen:hover:not(:disabled) {
  border-color: #a78bfa;
  background: rgba(167, 139, 250, 0.04);
}
.cc-btn-send {
  flex: 2;
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.cc-btn-send:hover:not(:disabled) {
  filter: brightness(1.1);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

.cc-banner {
  border-radius: 10px; 
  padding: 14px; 
  text-align: center;
  font-weight: 600; 
  font-size: 13px;
}
.cc-banner.success { background: rgba(0, 255, 136, 0.05); border: 1px solid rgba(0, 255, 136, 0.15); color: #00ff88; }
.cc-banner.error { background: rgba(255, 68, 68, 0.05); border: 1px solid rgba(255, 68, 68, 0.15); color: #ff4444; }

/* LOADER */
.cc-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
  color: #444;
}
.cc-spinner {
  width: 32px;
  height: 32px;
  border: 2px solid #222;
  border-top-color: #ff69b4;
  border-radius: 50%;
  animation: cc-spin 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes cc-spin { to { transform: rotate(360deg); } }

/* RESPONSIVE LAYOUT */
@media (max-width: 1200px) {
  .cc-charts-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .cc-header {
    padding: 20px 24px;
    flex-direction: column;
    align-items: flex-start;
  }
  .cc-stats-grid {
    padding: 16px 24px;
  }
  .cc-controls-section {
    padding: 0 24px 20px;
  }
  .cc-list-grid {
    padding: 0 24px 24px;
  }
  .cc-table-wrapper {
    padding: 0 24px 24px;
  }
  .cc-table th:nth-child(4), .cc-table td:nth-child(4),
  .cc-table th:nth-child(5), .cc-table td:nth-child(5) {
    display: none;
  }
}
`;

// ── Build email HTML for preview iframe ──────────────────────
const buildEmailHtml = (ticket, adminReply) => {
  const user = ticket.user || {};
  const ticketIdShort = ticket._id?.toString().substring(0, 8) || "--------";
  const dateStr = new Date(ticket.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
  const tierMap = { none: "Free", monthly: "Monthly", yearly: "Yearly", yearly_pro: "Yearly Pro" };
  const tierDisplay = tierMap[user.subscriptionTier] || "Free";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Support Ticket Update - HeartEcho</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
    html, body { margin: 0; padding: 0; height: 100%; width: 100%; background-color: #120524; }
    body { font-family: 'DM Sans', -apple-system, sans-serif; color: #e2d8f0; padding: 20px 10px; font-size: 14px; line-height: 1.6; }
    .container { max-width: 500px; margin: 0 auto; background-color: #0f0620; border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; overflow: hidden; }
    .header { background-color: #160a2b; padding: 20px 24px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
    .brand { font-weight: 600; font-size: 16px; color: #fff; }
    .brand span { color: #ff4099; }
    .ticket-id { font-size: 12px; color: #a395b5; }
    .content { padding: 24px; }
    .greeting { font-size: 15px; font-weight: 500; color: #fff; margin-bottom: 16px; }
    .ticket-info { background: rgba(255,255,255,0.02); border-radius: 8px; padding: 14px; margin-bottom: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px; }
    .info-item { color: #a395b5; }
    .info-item strong { color: #fff; font-weight: 500; }
    .status-badge { background: rgba(0,255,136,0.15); color: #00ff88; padding: 2px 6px; border-radius: 4px; font-size: 10px; font-weight: 600; text-transform: uppercase; }
    .thread { margin-bottom: 24px; }
    .message-block { margin-bottom: 16px; padding: 14px; border-radius: 8px; }
    .message-header { font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 6px; }
    .msg-user { background: rgba(255,255,255,0.03); border-left: 3px solid #5a4b70; }
    .msg-user .message-header { color: #a395b5; }
    .msg-user p { margin: 0; color: #cfc2df; font-style: italic; }
    .msg-admin { background: rgba(233,30,140,0.03); border-left: 3px solid #e91e8c; }
    .msg-admin .message-header { color: #ff6b9d; }
    .msg-admin p { margin: 0; color: #fff; white-space: pre-wrap; }
    .footer { background-color: #160a2b; padding: 20px; border-top: 1px solid rgba(255,255,255,0.05); font-size: 12px; color: #a395b5; text-align: center; }
    .help-box { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); padding: 10px; border-radius: 6px; margin-bottom: 12px; }
    .footer a { color: #ff6b9d; text-decoration: none; font-weight: 500; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand">Heart<span>Echo</span> Support</div>
      <div class="ticket-id">#${ticketIdShort}</div>
    </div>
    <div class="content">
      <div class="greeting">Hi ${user.name || "there"},</div>
      <p style="margin-top: 0;">We have updated your support ticket status. Please review the response detail below.</p>
      <div class="ticket-info">
        <div class="info-item">Date: <strong>${dateStr}</strong></div>
        <div class="info-item">Status: <span class="status-badge">Replied</span></div>
        <div class="info-item">Account: <strong>${user.email || "N/A"}</strong></div>
        <div class="info-item">Tier: <strong>${tierDisplay}</strong></div>
      </div>
      <div class="thread">
        <div class="message-block msg-user">
          <div class="message-header">Your Ticket Report</div>
          <p>"${(ticket.issue || "").replace(/</g, "&lt;").replace(/>/g, "&gt;")}"</p>
        </div>
        <div class="message-block msg-admin">
          <div class="message-header">HeartEcho Support Response</div>
          <p>${(adminReply || "Your reply will appear here...").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
        </div>
      </div>
    </div>
    <div class="footer">
      <div class="help-box">
        Still having issues? Email us directly at <br>
        <a href="mailto:heartecho.help@gmail.com?subject=Ticket #${ticketIdShort}">heartecho.help@gmail.com</a>
        <br><span style="font-size: 11px; opacity: 0.8; display: inline-block; margin-top: 4px;">Include Ticket ID <strong>#${ticketIdShort}</strong> in subject.</span>
      </div>
      <p style="margin: 0;">HeartEcho Support Team</p>
    </div>
  </div>
</body>
</html>`;
};

// Recharts Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    let title = label || data.name || "";
    let val = data.value;
    
    if (data.name === 'tickets') title = "Complaints Reported";

    return (
      <div style={{
        background: 'rgba(5, 5, 5, 0.9)',
        border: '1px solid #ff69b4',
        borderRadius: '10px',
        padding: '12px 16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {title}
        </p>
        <p style={{ margin: '6px 0 0 0', fontSize: '16px', color: '#ff69b4', fontWeight: 800 }}>
          {val.toLocaleString()} {val === 1 ? 'ticket' : 'tickets'}
        </p>
      </div>
    );
  }
  return null;
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
      setAdminReply(`Hi ${ticket.user?.name || "there"},\n\nThank you for reaching out to HeartEcho Support! We've reviewed your complaint regarding "${ticket.issue}" and our engineering team is actively working on a fix.\n\nPlease try logging out, clearing your app cache, and logging back in. If the problem persists, please let us know. We are dedicated to ensuring a smooth companion experience for you.\n\n— HeartEcho Support Team`);
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
        setSendMsg(`✅ Sent to ${ticket.user?.email} — Marked Resolved!`);
        setTimeout(() => { onSent(ticket._id); onClose(); }, 2200);
      } else {
        setSendStatus("error");
        setSendMsg("Failed to send email. Please try again.");
      }
    } catch (err) {
      setSendStatus("error");
      setSendMsg(err.response?.data?.message || "Error sending email response.");
    }
  };

  const ticketIdShort = ticket._id?.toString().substring(0, 8) || "--------";
  const tierMap = { none: "Free", monthly: "Monthly", yearly: "Yearly", yearly_pro: "Yearly Pro" };

  return (
    <div className="cc-email-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="cc-email-box">
        {/* Header */}
        <div className="cc-email-header">
          <div className="cc-email-title">
            <FaEnvelope />
            Email Reply Composer
            <span className="cc-email-pill">#{ticketIdShort}</span>
          </div>
          <button className="cc-email-close" onClick={onClose}><FaTimes /></button>
        </div>

        {/* Body */}
        <div className="cc-email-body">
          {/* LEFT — Email Preview */}
          <div className="cc-email-preview-panel">
            <div className="cc-panel-header preview-header">
              <FaEye /> HTML Live Email Preview
            </div>
            <div className="cc-email-frame-wrap">
              <iframe
                ref={iframeRef}
                className="cc-email-frame"
                title="Email Preview"
                sandbox="allow-same-origin"
              />
            </div>
          </div>

          {/* RIGHT — Reply Editor */}
          <div className="cc-email-editor-panel">
            <div className="cc-panel-header ai-header">
              <FaMagic /> AI Copilot Composer
            </div>
            <div className="cc-email-editor-content">
              {/* Ticket Info Strip */}
              <div className="cc-ticket-info-strip">
                <div className="cc-info-item">To: <strong>{ticket.user?.email || "N/A"}</strong></div>
                <div className="cc-info-item">User: <strong>{ticket.user?.name || "Anonymous"}</strong></div>
                <div className="cc-info-item">Tier: <strong>{tierMap[ticket.user?.subscriptionTier] || "Free"}</strong></div>
                <div className="cc-info-item">Date: <strong>{new Date(ticket.date).toLocaleDateString()}</strong></div>
              </div>

              {/* Complaint */}
              <div className="cc-complaint-preview">
                <div className="cc-complaint-label">User's Support Ticket</div>
                <div className="cc-complaint-text">"{ticket.issue}"</div>
              </div>

              {/* AI Status */}
              {aiStatus === "loading" && (
                <div className="cc-ai-status-bar loading">
                  <FaSpinner className="spin" /> Generating intelligent AI draft response...
                </div>
              )}
              {aiStatus === "done" && (
                <div className="cc-ai-status-bar success">
                  ✨ AI suggestion ready. Make adjustments below.
                </div>
              )}
              {aiStatus === "error" && (
                <div className="cc-ai-status-bar error">
                  ⚠️ AI fallback loaded. Customize response before sending.
                </div>
              )}

              {/* Reply Textarea */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="cc-editor-label">
                  <FaMagic /> Compose Email Message
                </div>
                <textarea
                  className="cc-editor-textarea"
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Generating message draft..."
                  rows={6}
                />
              </div>

              {/* Action Buttons */}
              <div className="cc-email-actions">
                <button
                  className="cc-btn-regen"
                  onClick={fetchAiReply}
                  disabled={aiStatus === "loading" || sendStatus === "sending" || sendStatus === "success"}
                >
                  <FaMagic /> Regenerate Draft
                </button>
                <button
                  className="cc-btn-send"
                  onClick={handleSend}
                  disabled={!adminReply.trim() || sendStatus === "sending" || sendStatus === "success"}
                >
                  {sendStatus === "sending" ? <FaSpinner className="spin" /> : <FaPaperPlane />}
                  {sendStatus === "sending" ? "Sending..." : "Send Reply Email"}
                </button>
              </div>

              {/* Send Status */}
              {sendStatus === "success" && <div className="cc-banner success">{sendMsg}</div>}
              {sendStatus === "error" && <div className="cc-banner error">{sendMsg}</div>}
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
  const [viewMode, setViewMode] = useState("card"); // "card" or "table"
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
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { 
    fetchTickets(); 
  }, [fetchTickets]);

  // --- CLIENT SIDE ADVANCED METRICS ---
  const stats = useMemo(() => {
    const totalCount = tickets.length;
    const pendingTickets = tickets.filter(t => t.status === "Pending");
    const pendingCount = pendingTickets.length;
    const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
    const resolutionRate = totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0;
    
    // VIP subscriber ticket ratio
    const subTickets = tickets.filter(t => {
      const tier = t.user?.subscriptionTier || t.user?.user_type || "";
      return tier === "subscriber" || tier === "monthly" || tier === "yearly" || tier === "yearly_pro";
    }).length;
    const vipRatio = totalCount > 0 ? ((subTickets / totalCount) * 100).toFixed(0) + "%" : "0%";

    // Avg age of open tickets
    let openAgeStr = "0.0h";
    if (pendingCount > 0) {
      const totalAgeMs = pendingTickets.reduce((acc, t) => acc + (new Date() - new Date(t.date)), 0);
      const avgMs = totalAgeMs / pendingCount;
      const avgHours = avgMs / (1000 * 60 * 60);
      if (avgHours < 24) {
        openAgeStr = `${avgHours.toFixed(1)}h`;
      } else {
        const avgDays = avgHours / 24;
        openAgeStr = `${avgDays.toFixed(1)}d`;
      }
    }

    return { 
      totalCount, 
      pendingCount, 
      resolvedCount, 
      resolutionRate,
      vipRatio,
      openAgeStr
    };
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
      const matchesSearch = (t.issue || "").toLowerCase().includes(searchTerm.toLowerCase()) || 
                            name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, filterStatus]);

  const paginatedTickets = useMemo(() => {
    return filteredTickets.slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage);
  }, [filteredTickets, currentPage]);

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this complaint ticket?")) return;
    try {
      const token = getToken();
      await axios.delete(`${api.Url}/admin/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTickets(tickets.filter(t => t._id !== id));
    } catch (e) { 
      alert("Delete failed"); 
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await axios.put(`${api.Url}/admin/tickets/${editTicket._id}`, editTicket, { headers: { Authorization: `Bearer ${token}` } });
      setTickets(tickets.map(t => t._id === editTicket._id ? response.data.data : t));
      setEditTicket(null);
    } catch (e) { 
      alert("Update failed"); 
    }
  };

  const handleEmailSent = (ticketId) => {
    setTickets(prev => prev.map(t => t._id === ticketId ? { ...t, status: "Resolved" } : t));
  };

  const PIE_COLORS = ['#ff4444', '#00ff88'];

  const getPieData = useMemo(() => [
    { name: 'Pending', value: stats.pendingCount },
    { name: 'Resolved', value: stats.resolvedCount }
  ], [stats]);

  if (loading) {
    return (
      <div className="cc-loader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <style>{styles}</style>
        <div className="cc-spinner"></div>
        <p style={{ fontWeight: 600, color: '#666' }}>Fetching Complaints...</p>
      </div>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div className="cc-root">
        
        {/* HEADER */}
        <header className="cc-header">
          <div className="cc-title-group">
            <h2>Complaints Center</h2>
            <p className="cc-tagline"><FaTicketAlt /> Live Support Ticketing & AI Assistance</p>
          </div>
          <button className="cc-btn" onClick={fetchTickets} title="Sync support cache">
            <FaSync />
          </button>
        </header>

        {/* STATS */}
        <div className="cc-stats-grid">
          <div className="cc-stat-card">
            <div className="cc-stat-icon"><FaTicketAlt /></div>
            <div className="cc-stat-info">
              <span>Total Tickets</span>
              <strong>{stats.totalCount}</strong>
            </div>
          </div>
          <div className="cc-stat-card">
            <div className="cc-stat-icon" style={{ color: '#ff4444', background: 'rgba(255,68,68,0.08)', borderColor: 'rgba(255,68,68,0.15)' }}><FaExclamationTriangle /></div>
            <div className="cc-stat-info">
              <span>Pending</span>
              <strong>{stats.pendingCount}</strong>
            </div>
          </div>
          <div className="cc-stat-card">
            <div className="cc-stat-icon" style={{ color: '#00ff88', background: 'rgba(0,255,136,0.08)', borderColor: 'rgba(0,255,136,0.15)' }}><FaCheckCircle /></div>
            <div className="cc-stat-info">
              <span>Resolved</span>
              <strong>{stats.resolvedCount}</strong>
            </div>
          </div>
          <div className="cc-stat-card">
            <div className="cc-stat-icon" style={{ color: '#ffea00', background: 'rgba(255,234,0,0.08)', borderColor: 'rgba(255,234,0,0.15)' }}><FaChartBar /></div>
            <div className="cc-stat-info">
              <span>Resolution Rate</span>
              <strong>{stats.resolutionRate.toFixed(0)}%</strong>
            </div>
          </div>
          <div className="cc-stat-card">
            <div className="cc-stat-icon" style={{ color: '#a78bfa', background: 'rgba(167,139,250,0.08)', borderColor: 'rgba(167,139,250,0.15)' }}><FaEnvelope /></div>
            <div className="cc-stat-info">
              <span>VIP Priority Ratio</span>
              <strong>{stats.vipRatio}</strong>
            </div>
          </div>
          <div className="cc-stat-card">
            <div className="cc-stat-icon" style={{ color: '#007aff', background: 'rgba(0,122,255,0.08)', borderColor: 'rgba(0,122,255,0.15)' }}><FaSpinner /></div>
            <div className="cc-stat-info">
              <span>Avg Open Time</span>
              <strong>{stats.openAgeStr}</strong>
            </div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="cc-charts-row">
          <div className="cc-chart-box">
            <div className="cc-chart-title"><FaChartBar /> Status Split</div>
            <ResponsiveContainer width="100%" height={210}>
              <PieChart>
                <Pie 
                  data={getPieData} 
                  innerRadius={55} 
                  outerRadius={75} 
                  paddingAngle={4} 
                  dataKey="value"
                >
                  {getPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="cc-chart-box">
            <div className="cc-chart-title"><FaTicketAlt /> Weekly Ticket Flow</div>
            <ResponsiveContainer width="100%" height={210}>
              <BarChart data={dailyTicketsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#181818"/>
                <XAxis dataKey="date" stroke="#555" fontSize={11} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" fontSize={11} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
                <Bar dataKey="tickets" fill="#ff69b4" radius={[6,6,0,0]} barSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILTERS & VIEWS BAR */}
        <div className="cc-controls-section">
          <div className="cc-view-toggle-bar">
            <div style={{ fontSize: 13, color: '#666', fontWeight: 600 }}>
              Showing {Math.min(paginatedTickets.length, filteredTickets.length)} of {filteredTickets.length} matching tickets
            </div>
            <div className="cc-toggle-buttons">
              <button 
                className={`cc-toggle-btn ${viewMode === "card" ? "active" : ""}`}
                onClick={() => { setViewMode("card"); setCurrentPage(1); }}
              >
                <FaThLarge /> Grid View
              </button>
              <button 
                className={`cc-toggle-btn ${viewMode === "table" ? "active" : ""}`}
                onClick={() => { setViewMode("table"); setCurrentPage(1); }}
              >
                <FaList /> Table View
              </button>
            </div>
          </div>

          <div className="cc-filters-bar">
            <div className="cc-search-wrap">
              <FaSearch className="cc-search-icon" />
              <input 
                className="cc-input" 
                placeholder="Search by issue description, user name or email..." 
                value={searchTerm} 
                onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }} 
              />
            </div>
            <select className="cc-select" value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setCurrentPage(1); }}>
              <option value="all">All Ticket Statuses</option>
              <option value="Pending">Pending Only</option>
              <option value="Resolved">Resolved Only</option>
            </select>
          </div>
        </div>

        {/* TICKET CARD LISTING */}
        {viewMode === "card" && (
          <div className="cc-list-grid">
            {paginatedTickets.map(ticket => (
              <div key={ticket._id} className="cc-ticket-card">
                <div>
                  <div className="cc-card-top">
                    <span className={`cc-status-badge ${ticket.status?.toLowerCase()}`}>{ticket.status}</span>
                    <span style={{ fontSize: 11, color: '#555', fontWeight: 500 }}>{new Date(ticket.date).toLocaleDateString()}</span>
                  </div>
                  <div className="cc-issue-text">"{ticket.issue}"</div>
                  
                  <div className="cc-user-box">
                    <div className="cc-ub-row border-bottom">
                      <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '70%', fontWeight: 700, color: '#fff' }}>
                        {ticket.user?.name || "Anonymous User"}
                      </span>
                      <span style={{ color: ticket.user?.user_type === 'subscriber' ? '#ffea00' : '#888', textTransform: 'capitalize', fontSize: '10px', fontWeight: 'bold' }}>
                        {ticket.user?.user_type || "Free"}
                      </span>
                    </div>
                    <div className="cc-ub-row">
                      <span>Email</span>
                      <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>{ticket.user?.email || "N/A"}</strong>
                    </div>
                    <div className="cc-ub-row">
                      <span>Phone</span>
                      <strong>{ticket.user?.phone_number || "N/A"}</strong>
                    </div>
                    <div className="cc-ub-row">
                      <span>User Meta</span>
                      <strong>Age {ticket.user?.age || "N/A"} • {ticket.user?.gender || "N/A"}</strong>
                    </div>
                    <div className="cc-ub-row">
                      <span>Active Tier</span>
                      <strong style={{ color: '#ff69b4', textTransform: 'capitalize' }}>{ticket.user?.subscriptionTier || "none"}</strong>
                    </div>
                  </div>
                </div>
                
                <div className="cc-card-actions">
                  <button
                    className="cc-act-btn email-btn"
                    onClick={() => setEmailTicket(ticket)}
                    title="Compose Email Response"
                  >
                    <FaEnvelope /> Email Reply
                  </button>
                  <button className="cc-act-btn edit-btn" onClick={() => setEditTicket(ticket)} title="Edit status"><FaEdit/></button>
                  <button className="cc-act-btn delete-btn" onClick={() => handleDelete(ticket._id)} title="Delete ticket"><FaTrash/></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ENTERPRISE TABLE VIEW */}
        {viewMode === "table" && (
          <div className="cc-table-wrapper">
            <div className="cc-table-card">
              <table className="cc-table">
                <thead>
                  <tr>
                    <th>Status</th>
                    <th>User</th>
                    <th>Issue Description</th>
                    <th>Tier Plan</th>
                    <th>Date Reported</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td>
                        <span className={`cc-status-badge ${ticket.status?.toLowerCase()}`}>
                          {ticket.status}
                        </span>
                      </td>
                      <td>
                        <div className="cc-user-cell">
                          <span className="cc-user-name">{ticket.user?.name || "Anonymous User"}</span>
                          <span className="cc-user-email">{ticket.user?.email || "N/A"}</span>
                        </div>
                      </td>
                      <td style={{ maxWidth: 300, wordBreak: 'break-word', fontWeight: 600, color: '#eee' }}>
                        {ticket.issue}
                      </td>
                      <td>
                        <span style={{ textTransform: 'capitalize', fontSize: 12, fontWeight: 700, color: '#ff69b4' }}>
                          {ticket.user?.subscriptionTier || "none"}
                        </span>
                      </td>
                      <td>
                        {new Date(ticket.date).toLocaleDateString()}
                      </td>
                      <td>
                        <div className="cc-card-actions" style={{ border: 'none', margin: 0, padding: 0 }}>
                          <button
                            className="cc-act-btn email-btn"
                            onClick={() => setEmailTicket(ticket)}
                            title="Compose Email Response"
                          >
                            <FaEnvelope /> Email
                          </button>
                          <button className="cc-act-btn edit-btn" onClick={() => setEditTicket(ticket)} title="Edit status"><FaEdit/></button>
                          <button className="cc-act-btn delete-btn" onClick={() => handleDelete(ticket._id)} title="Delete ticket"><FaTrash/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredTickets.length === 0 && (
                 <div style={{ padding: 60, textAlign: 'center', color: '#444', fontWeight: 600 }}>
                   No support complaints found matching search criteria.
                 </div>
              )}
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="cc-pagination">
            <button className="cc-btn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>
              Previous
            </button>
            <span style={{ color: '#666', fontSize: 13, fontWeight: 600 }}>
              Page {currentPage} of {totalPages}
            </span>
            <button className="cc-btn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>
              Next
            </button>
          </div>
        )}

        {/* STATUS/ISSUE EDIT MODAL */}
        {editTicket && (
          <div className="cc-modal-overlay" onClick={() => setEditTicket(null)}>
            <form onSubmit={handleEditSubmit} className="cc-modal-content" onClick={e => e.stopPropagation()}>
              <h3 className="cc-modal-title">Edit Support Ticket</h3>
              
              <div className="cc-form-group">
                <label>Ticket Status</label>
                <select className="cc-select" value={editTicket.status} onChange={e => setEditTicket({...editTicket, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="cc-form-group">
                <label>Issue Description</label>
                <textarea 
                  className="cc-textarea" 
                  rows={5} 
                  value={editTicket.issue} 
                  onChange={e => setEditTicket({...editTicket, issue: e.target.value})} 
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" className="cc-btn" style={{ flex: 1 }} onClick={() => setEditTicket(null)}>Cancel</button>
                <button type="submit" className="cc-btn primary" style={{ flex: 1 }}>Update Status</button>
              </div>
            </form>
          </div>
        )}

        {/* EMAIL REPLY SPLIT COMPOSER DIALOG */}
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