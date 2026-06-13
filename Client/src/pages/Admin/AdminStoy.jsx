'use client';

import { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
  FaEdit, FaTrash, FaEye, FaSearch, FaPlus, FaStar, FaFire, 
  FaCity, FaTag, FaCalendar, FaUser, FaSync, FaChartLine
} from 'react-icons/fa';
import { MdMenuBook, MdDashboard, MdList } from "react-icons/md";
import api from '../../config/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ------------------- CSS STYLES (Pure Black, Glassmorphism, Pink & Purple Glows) -------------------
const styles = `
.st-root-x30sn {
  color: #fff;
  background-color: #030303;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: st-fadeIn-x30sn 0.4s ease;
}
@keyframes st-fadeIn-x30sn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.st-header-x30sn {
  padding: 28px 32px;
  background: linear-gradient(180deg, #070707 0%, #030303 100%);
  border-bottom: 1px solid #161616;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.st-title-group-x30sn h2 { 
  font-size: 26px; 
  font-weight: 800; 
  margin: 0; 
  letter-spacing: -0.5px;
  color: #fff; 
  display: flex;
  align-items: center;
  gap: 12px;
}
.st-tagline-x30sn { 
  color: #a78bfa; 
  margin: 6px 0 0; 
  font-size: 13px; 
  font-weight: 500; 
  display: flex;
  align-items: center;
  gap: 8px;
}

/* BUTTONS */
.st-btn-x30sn {
  display: inline-flex; 
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
  text-decoration: none;
}
.st-btn-x30sn:hover:not(:disabled) { 
  border-color: #ff69b4; 
  color: #ff69b4; 
  background: rgba(255, 105, 180, 0.03);
  transform: translateY(-1px);
}
.st-btn-x30sn.primary {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.st-btn-x30sn.primary:hover:not(:disabled) {
  filter: brightness(1.1);
  color: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.25);
}
.st-btn-x30sn:disabled { opacity: 0.5; cursor: not-allowed; }

/* TABS */
.st-tabs-x30sn {
  display: flex; 
  background: #090909; 
  border-bottom: 1px solid #161616; 
  padding: 0 32px;
}
.st-tab-btn-x30sn {
  padding: 16px 24px; 
  background: none; 
  border: none; 
  color: #666; 
  font-size: 13px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.2s ease; 
  border-bottom: 2px solid transparent;
}
.st-tab-btn-x30sn:hover { color: #aaa; }
.st-tab-btn-x30sn.active { color: #ff69b4; border-bottom-color: #ff69b4; }

/* KPI GRID */
.st-kpi-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}
.st-kpi-card-x30sn {
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
.st-kpi-card-x30sn:hover { 
  border-color: #262626; 
  transform: translateY(-3px); 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.st-kpi-card-x30sn::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(167,139,250,0.02), transparent 60%);
  pointer-events: none;
}
.st-kpi-icon-x30sn {
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
.st-kpi-info-x30sn span { margin: 0; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.8px; display: block; }
.st-kpi-info-x30sn strong { font-size: 24px; color: #fff; display: block; margin-top: 4px; font-weight: 800; }

/* FILTERS SECTION */
.st-filters-card-x30sn {
  background: rgba(10, 10, 10, 0.4);
  border: 1px solid #161616;
  border-radius: 16px;
  padding: 20px 24px;
  margin: 0 32px 24px;
  backdrop-filter: blur(12px);
}
.st-filter-row-x30sn {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
}
.st-search-box-x30sn {
  position: relative;
  flex: 2;
  min-width: 260px;
}
.st-search-box-x30sn svg {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 14px;
}
.st-input-x30sn {
  width: 100%;
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px 14px 12px 42px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  transition: all 0.25s ease;
}
.st-input-x30sn:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.15);
}
.st-select-x30sn {
  flex: 1;
  min-width: 140px;
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  color: #fff;
  padding: 12px 14px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.25s ease;
}
.st-select-x30sn:focus { border-color: #ff69b4; }
.st-clear-btn-x30sn {
  width: 42px;
  height: 42px;
  border-radius: 10px;
  background: #0f0f0f;
  border: 1px solid #222;
  color: #888;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}
.st-clear-btn-x30sn:hover {
  border-color: #ff69b4;
  color: #ff69b4;
}

/* VIEW SWITCHER & CONTROL BAR */
.st-control-bar-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 32px 16px;
  flex-wrap: wrap;
  gap: 16px;
}
.st-view-mode-toggle-x30sn {
  display: flex;
  background: #0f0f0f;
  border: 1px solid #222;
  border-radius: 8px;
  padding: 4px;
}
.st-toggle-btn-view-x30sn {
  background: none;
  border: none;
  color: #666;
  padding: 6px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
}
.st-toggle-btn-view-x30sn.active {
  background: rgba(255, 105, 180, 0.1);
  color: #ff69b4;
}

/* VISUAL CARDS GRID */
.st-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 0 32px 32px;
}
.st-card-x30sn {
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
.st-card-x30sn:hover {
  border-color: #ff69b4;
  transform: translateY(-4px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
}
.st-card-cover-x30sn {
  height: 190px;
  position: relative;
  overflow: hidden;
  border-bottom: 1px solid #161616;
  background: #050505;
}
.st-card-cover-x30sn img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}
.st-card-x30sn:hover .st-card-cover-x30sn img {
  transform: scale(1.05);
}
.st-card-char-badge-x30sn {
  position: absolute;
  bottom: -16px;
  right: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  z-index: 2;
}
.st-card-char-badge-x30sn img {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 2px solid #ff69b4;
  object-fit: cover;
  background: #000;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
}
.st-badge-overlay-x30sn {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 10px;
  font-weight: 700;
  color: #fff;
  backdrop-filter: blur(4px);
}
.st-badge-overlay-right-x30sn {
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(255, 105, 180, 0.15);
  border: 1px solid rgba(255, 105, 180, 0.3);
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 9px;
  font-weight: 850;
  color: #ff69b4;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  backdrop-filter: blur(4px);
}
.st-card-info-x30sn {
  padding: 24px 20px 20px;
  display: flex;
  flex-direction: column;
  flex: 1;
}
.st-card-info-x30sn h3 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 750;
  color: #fff;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.st-card-info-x30sn p {
  margin: 0 0 16px;
  font-size: 12px;
  color: #71717a;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  height: 36px;
}
.st-card-meta-x30sn {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 16px;
  margin-top: auto;
}
.st-card-badge-x30sn {
  font-size: 10px;
  font-weight: 700;
  padding: 3px 8px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: #a1a1aa;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}
.st-card-badge-x30sn.char {
  color: #ff69b4;
  background: rgba(255, 105, 180, 0.03);
  border-color: rgba(255, 105, 180, 0.1);
}
.st-card-stats-x30sn {
  display: flex;
  gap: 12px;
  padding-top: 14px;
  border-top: 1px solid #161616;
  font-size: 11px;
  color: #666;
}
.st-card-stat-item-x30sn {
  display: flex;
  align-items: center;
  gap: 4px;
}
.st-card-stat-item-x30sn.views {
  color: #ff69b4;
  font-weight: 700;
}
.st-card-actions-x30sn {
  margin-top: 14px;
  display: flex;
  gap: 8px;
}
.st-card-act-btn-x30sn {
  flex: 1;
  height: 34px;
  border-radius: 8px;
  background: #0f0f0f;
  border: 1px solid #222;
  color: #aaa;
  font-size: 12px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  gap: 6px;
  text-decoration: none;
}
.st-card-act-btn-x30sn:hover {
  transform: translateY(-1px);
}
.st-card-act-btn-x30sn.edit:hover {
  color: #ff69b4;
  border-color: rgba(255, 105, 180, 0.3);
  background: rgba(255, 105, 180, 0.04);
}
.st-card-act-btn-x30sn.delete {
  flex: none;
  width: 40px;
}
.st-card-act-btn-x30sn.delete:hover {
  color: #ff4444;
  border-color: rgba(255, 68, 68, 0.3);
  background: rgba(255, 68, 68, 0.04);
}

/* HIGH DENSITY DATA TABLE */
.st-table-wrap-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 16px;
  margin: 0 32px 32px;
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.st-table-x30sn {
  width: 100%;
  border-collapse: collapse;
}
.st-table-x30sn thead {
  background: rgba(4, 4, 4, 0.4);
  border-bottom: 1px solid #161616;
}
.st-table-x30sn th {
  padding: 16px;
  text-align: left;
  color: #52525b;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 800;
  letter-spacing: 0.8px;
}
.st-table-x30sn tbody tr {
  border-bottom: 1px solid #141414;
  transition: all 0.2s;
}
.st-table-x30sn tbody tr:last-child { border-bottom: none; }
.st-table-x30sn tbody tr:hover {
  background: rgba(255, 255, 255, 0.01);
}
.st-table-x30sn td {
  padding: 14px 16px;
  vertical-align: middle;
  font-size: 13px;
  color: #d4d4d8;
}

/* CELL STYLES */
.st-cover-cell-x30sn {
  display: flex;
  gap: 12px;
  align-items: center;
  max-width: 320px;
}
.st-cover-img-x30sn {
  width: 48px;
  height: 64px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #222;
  flex-shrink: 0;
  background: #000;
}
.st-story-meta-x30sn h4 {
  margin: 0 0 4px;
  color: #fff;
  font-size: 13px;
  font-weight: 750;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.st-story-meta-x30sn p {
  margin: 0;
  color: #666;
  font-size: 11px;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.st-char-cell-x30sn {
  display: flex;
  align-items: center;
  gap: 10px;
}
.st-char-img-x30sn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #222;
}
.st-char-info-x30sn div { font-weight: 700; color: #fff; font-size: 13px; }
.st-char-info-x30sn small { color: #666; font-size: 11px; }

.st-badge-x30sn {
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  display: inline-block;
  letter-spacing: 0.5px;
}
.st-badge-x30sn.cat {
  background: rgba(255, 105, 180, 0.08);
  color: #ff69b4;
  border: 1px solid rgba(255, 105, 180, 0.2);
}
.st-badge-x30sn.city {
  background: rgba(255, 255, 255, 0.03);
  color: #a1a1aa;
  border: 1px solid rgba(255, 255, 255, 0.05);
  margin-top: 4px;
}

.st-status-col-x30sn {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.st-toggle-btn-x30sn {
  background: #0c0c0c;
  border: 1px solid #222;
  color: #666;
  padding: 5px 10px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 10px;
  font-weight: 750;
  display: flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  transition: all 0.25s ease;
}
.st-toggle-btn-x30sn:hover {
  border-color: #ff69b4;
  color: #ff69b4;
}
.st-toggle-btn-x30sn.active {
  background: rgba(255, 105, 180, 0.1);
  color: #ff69b4;
  border-color: rgba(255, 105, 180, 0.25);
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.1);
}

.st-action-cell-x30sn {
  display: flex;
  gap: 8px;
}
.st-act-btn-x30sn {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #222;
  background: #0c0c0c;
  color: #888;
  transition: all 0.2s ease;
  cursor: pointer;
  text-decoration: none;
}
.st-act-btn-x30sn:hover {
  border-color: #ff69b4;
  color: #ff69b4;
  transform: translateY(-2px);
}
.st-act-btn-x30sn.del:hover {
  border-color: #ff4444;
  color: #ff4444;
}

/* CHART SECTION & DASHBOARD */
.st-chart-section-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 16px;
  padding: 24px;
  margin: 0 32px 30px;
  backdrop-filter: blur(12px);
}
.st-chart-head-x30sn {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}
.st-chart-head-x30sn h3 { margin: 0; font-size: 18px; font-weight: 800; color: #fff; }
.st-chart-area-x30sn { height: 350px; width: 100%; }

.st-dash-grid-x30sn {
  display: grid;
  grid-template-columns: 2fr 1.2fr;
  gap: 24px;
  margin: 0 32px 32px;
}
.st-dash-card-x30sn {
  background: rgba(10, 10, 10, 0.6);
  border: 1px solid #161616;
  border-radius: 16px;
  padding: 24px;
  backdrop-filter: blur(12px);
}
.st-dash-card-title-x30sn {
  font-size: 16px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.st-story-row-x30sn {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  border: 1px solid transparent;
  border-bottom: 1px solid #161616;
  transition: all 0.2s;
  border-radius: 8px;
}
.st-story-row-x30sn:hover {
  background: rgba(255, 105, 180, 0.03);
  border-color: rgba(255, 105, 180, 0.1);
  transform: translateX(2px);
}
.st-story-row-x30sn:last-child { border-bottom: none; }
.st-story-row-img-x30sn {
  width: 40px;
  height: 54px;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #222;
  background: #000;
  flex-shrink: 0;
}
.st-story-row-info-x30sn { flex: 1; min-width: 0; }
.st-story-row-info-x30sn h4 { margin: 0 0 4px; font-size: 13px; font-weight: 750; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.st-story-row-info-x30sn p { margin: 0; font-size: 11px; color: #666; }
.st-story-row-reads-x30sn {
  font-weight: 750;
  color: #ff69b4;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: monospace;
}

/* PAGINATION */
.st-pagination-x30sn {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  padding: 16px 32px 40px;
}
.st-page-btn-x30sn {
  background: #0c0c0c;
  border: 1px solid #222;
  color: #fff;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.2s;
}
.st-page-btn-x30sn:hover:not(:disabled) {
  border-color: #ff69b4;
  color: #ff69b4;
}
.st-page-btn-x30sn:disabled { opacity: 0.3; cursor: not-allowed; }
.st-page-num-x30sn {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #0c0c0c;
  border: 1px solid #222;
  color: #888;
  cursor: pointer;
  font-size: 12px;
  font-weight: 700;
  transition: all 0.2s;
}
.st-page-num-x30sn:hover {
  border-color: #ff69b4;
  color: #ff69b4;
}
.st-page-num-x30sn.active {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  color: #000;
  border-color: transparent;
  font-weight: 800;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.25);
}

/* LOAD & LOADER */
.st-loader-x30sn {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 400px;
}
.st-spinner-x30sn {
  width: 32px;
  height: 32px;
  border: 2px solid #222;
  border-top-color: #ff69b4;
  border-radius: 50%;
  animation: st-spin-x30sn 0.8s linear infinite;
  margin-bottom: 12px;
}
@keyframes st-spin-x30sn { to { transform: rotate(360deg); } }

.st-empty-x30sn { text-align: center; padding: 60px; color: #666; font-weight: 600; font-size: 14px; }
.st-loading-x30sn { text-align: center; padding: 60px; color: #ff69b4; font-weight: 600; font-size: 14px; }

/* MESSAGES */
.st-msg-box-x30sn {
  padding: 12px 20px;
  border-radius: 10px;
  margin: 0 32px 24px;
  font-size: 13px;
  font-weight: 600;
  animation: st-slideIn-x30sn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}
@keyframes st-slideIn-x30sn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
.st-msg-success-x30sn {
  background: rgba(0, 255, 136, 0.08);
  color: #00ff88;
  border: 1px solid rgba(0, 255, 136, 0.2);
}
.st-msg-error-x30sn {
  background: rgba(239, 68, 68, 0.08);
  color: #f87171;
  border: 1px solid rgba(239, 68, 68, 0.2);
}
`;

const StoriesAdmin = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters & Views
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', city: '', featured: '', trending: '' });
  const [viewMode, setViewMode] = useState('grid'); // grid | table
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStories, setTotalStories] = useState(0);
  const itemsPerPage = 10;
  
  // Analytics
  const [activeTab, setActiveTab] = useState('dashboard');
  const [analytics, setAnalytics] = useState(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  
  const categories = [
    'Housewife', 'Bhabhi', 'Devar-Bhabhi', 'Nanad-Bhabhi', 'Aunty', 'Village', 'Desi', 
    'Neighbor', 'Office Sex', 'Boss-Secretary', 'Virgin', 'First Time', 'Suhagraat', 
    'Maid', 'Gangbang', 'College Girl', 'Hostel Sex', 'MILF', 'Mature', 'Threesome', 
    'Romantic', 'True Love Story', 'Savita Bhabhi Style'
  ];
  
  const cities = [
    'All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Goa', 'Chandigarh'
  ];

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        page: currentPage,
        limit: itemsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(filters.category && filters.category !== 'All Categories' && { category: filters.category }),
        ...(filters.city && filters.city !== 'All Cities' && { city: filters.city }),
        ...(filters.featured && { featured: filters.featured }),
        ...(filters.trending && { trending: filters.trending })
      });
      
      const response = await axios.get(`${api.Url}/story?${params}`);
      if (response.data.success) {
        setStories(response.data.data);
        setTotalStories(response.data.total);
        setTotalPages(response.data.totalPages);
      }
    } catch (err) {
      console.error(err);
      setError('Failed to load stories.');
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setLoadingAnalytics(true);
      const res = await axios.get(`${api.Url}/story/admin/analytics`);
      if (res.data.success) {
        setAnalytics(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => { 
    if (activeTab === 'content') {
      fetchStories(); 
    } else {
      fetchAnalytics();
    }
  }, [currentPage, filters, activeTab]);

  const handleSearch = (e) => { e.preventDefault(); setCurrentPage(1); fetchStories(); };
  const handleFilterChange = (key, val) => { setFilters(prev => ({ ...prev, [key]: val })); setCurrentPage(1); };
  const clearFilters = () => { setFilters({ category: '', city: '', featured: '', trending: '' }); setSearchQuery(''); setCurrentPage(1); };

  const handleDeleteStory = async (id, title) => {
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const response = await axios.delete(`${api.Url}/story/${id}`);
      if (response.data.success) {
        setSuccess(`Deleted "${title}"`);
        fetchStories();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) { setError('Delete failed.'); }
  };

  const toggleStatus = async (id, type) => {
    try {
      const response = await axios.patch(`${api.Url}/story/${id}/toggle-${type}`);
      if (response.data.success) {
        if (activeTab === 'content') {
          fetchStories();
        } else {
          fetchAnalytics();
        }
      }
    } catch (err) { console.error(err); }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  // 5 KPIs computations
  const stats = useMemo(() => {
    const totalCount = analytics?.totalStories || 0;
    const featuredCount = analytics?.featuredCount || 0;
    const trendingCount = analytics?.trendingCount || 0;
    const totalReads = analytics?.totalReads || 0;
    const avgReads = totalCount ? Math.round(totalReads / totalCount) : 0;
    return { totalCount, featuredCount, trendingCount, totalReads, avgReads };
  }, [analytics]);

  return (
    <>
      <style>{styles}</style>
      <div className="st-root-x30sn">
        
        {/* HEADER */}
        <header className="st-header-x30sn">
          <div className="st-title-group-x30sn">
            <h2>Stories Analytics</h2>
            <p className="st-tagline-x30sn"><MdMenuBook /> Manage & Curate Desi Interactive Stories Database</p>
          </div>
          <div className="st-actions-group-x30sn">
            <Link href="/admin/create-story" className="st-btn-x30sn primary">
              <FaPlus /> New Story
            </Link>
          </div>
        </header>

        {/* FEEDBACK MSGS */}
        {success && <div className="st-msg-box-x30sn st-msg-success-x30sn">{success}</div>}
        {error && <div className="st-msg-box-x30sn st-msg-error-x30sn">{error}</div>}

        {/* TABS */}
        <div className="st-tabs-x30sn">
          <button className={`st-tab-btn-x30sn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            Analytics Dashboard
          </button>
          <button className={`st-tab-btn-x30sn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>
            Story Content DB
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* KPI STATS CARDS */}
            <div className="st-kpi-grid-x30sn">
              <div className="st-kpi-card-x30sn">
                <div className="st-kpi-icon-x30sn"><MdMenuBook /></div>
                <div className="st-kpi-info-x30sn">
                  <span>Total Stories</span>
                  <strong>{stats.totalCount}</strong>
                </div>
              </div>
              <div className="st-kpi-card-x30sn">
                <div className="st-kpi-icon-x30sn" style={{ color: '#ffea00', background: 'rgba(255,234,0,0.04)', borderColor: 'rgba(255,234,0,0.15)' }}><FaStar /></div>
                <div className="st-kpi-info-x30sn">
                  <span>Featured Stories</span>
                  <strong>{stats.featuredCount}</strong>
                </div>
              </div>
              <div className="st-kpi-card-x30sn">
                <div className="st-kpi-icon-x30sn" style={{ color: '#ff69b4', background: 'rgba(255,105,180,0.04)', borderColor: 'rgba(255,105,180,0.15)' }}><FaFire /></div>
                <div className="st-kpi-info-x30sn">
                  <span>Trending Stories</span>
                  <strong>{stats.trendingCount}</strong>
                </div>
              </div>
              <div className="st-kpi-card-x30sn">
                <div className="st-kpi-icon-x30sn" style={{ color: '#00ff88', background: 'rgba(0,255,136,0.04)', borderColor: 'rgba(0,255,136,0.15)' }}><FaEye /></div>
                <div className="st-kpi-info-x30sn">
                  <span>Total Reads</span>
                  <strong>{stats.totalReads.toLocaleString()}</strong>
                </div>
              </div>
              <div className="st-kpi-card-x30sn">
                <div className="st-kpi-icon-x30sn" style={{ color: '#007aff', background: 'rgba(0,122,255,0.04)', borderColor: 'rgba(0,122,255,0.15)' }}><FaChartLine /></div>
                <div className="st-kpi-info-x30sn">
                  <span>Avg. Reads/Story</span>
                  <strong>{stats.avgReads.toLocaleString()}</strong>
                </div>
              </div>
            </div>

            {/* CHART SECTION */}
            <div className="st-chart-section-x30sn">
              <div className="st-chart-head-x30sn">
                <FaFire style={{ color: '#ff69b4' }} />
                <h3>Top Performing Stories (By All-Time Reads)</h3>
              </div>
              <div className="st-chart-area-x30sn">
                {loadingAnalytics ? (
                  <div className="st-loading-x30sn">Loading Analytics Data...</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.topStories || []}>
                      <XAxis dataKey="title" stroke="#666" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                      <YAxis stroke="#666" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: '8px', color: '#fff' }} 
                        itemStyle={{ color: '#ff69b4' }} 
                        cursor={{ fill: 'rgba(255,105,180,0.03)' }} 
                      />
                      <defs>
                        <linearGradient id="stColorPink" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff69b4" stopOpacity={1}/>
                          <stop offset="95%" stopColor="#da22ff" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <Bar dataKey="readCount" name="Total Reads" fill="url(#stColorPink)" radius={[6, 6, 0, 0]} barSize={45} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* TWIN LEADERBOARDS ROW */}
            <div className="st-dash-grid-x30sn">
              <div className="st-dash-card-x30sn">
                <div className="st-dash-card-title-x30sn">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><FaFire color="#ff69b4" /> Top Performing Stories</div>
                  <small style={{ color: '#888', fontWeight: 'normal' }}>Ranked by views</small>
                </div>
                {loadingAnalytics ? (
                  <div className="st-loading-x30sn">Loading leaderboard…</div>
                ) : (
                  (analytics?.topStories || []).map((story, i) => (
                    <div key={story._id} className="st-story-row-x30sn">
                      <div style={{ fontWeight: '800', color: '#3f3f46', fontSize: 15, width: 22 }}>#{i + 1}</div>
                      <img src={story.backgroundImage} className="st-story-row-img-x30sn" alt="" />
                      <div className="st-story-row-info-x30sn">
                        <h4>{story.title}</h4>
                        <p>{story.category}</p>
                      </div>
                      <div className="st-story-row-reads-x30sn"><FaEye /> {story.readCount?.toLocaleString()}</div>
                    </div>
                  ))
                )}
              </div>

              <div className="st-dash-card-x30sn">
                <div className="st-dash-card-title-x30sn">
                  Latest Additions
                  <small style={{ color: '#888', fontWeight: 'normal' }}>Recent publications</small>
                </div>
                {loadingAnalytics ? (
                  <div className="st-loading-x30sn">Loading recent…</div>
                ) : (
                  (analytics?.recentStories || []).map((story) => (
                    <div key={story._id} className="st-story-row-x30sn">
                      <img src={story.backgroundImage} className="st-story-row-img-x30sn" style={{ width: 34, height: 34, borderRadius: '50%' }} alt="" />
                      <div className="st-story-row-info-x30sn">
                        <h4>{story.title}</h4>
                        <p>{formatDate(story.createdAt)}</p>
                      </div>
                      <div className="st-story-row-reads-x30sn" style={{ color: '#52525b', fontSize: 11 }}><FaEye /> {story.readCount}</div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'content' && (
          <>
            {/* FILTERS CARD */}
            <div className="st-filters-card-x30sn">
              <form onSubmit={handleSearch} className="st-filter-row-x30sn" style={{ marginBottom: 12 }}>
                <div className="st-search-box-x30sn">
                  <FaSearch />
                  <input 
                    type="text" className="st-input-x30sn" placeholder="Search by title, excerpt, character or tags..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
                <button type="submit" className="st-btn-x30sn primary" style={{ height: 42 }}>Search</button>
              </form>

              <div className="st-filter-row-x30sn">
                <select className="st-select-x30sn" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="st-select-x30sn" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
                  <option value="">All Cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="st-select-x30sn" value={filters.featured} onChange={(e) => handleFilterChange('featured', e.target.value)}>
                  <option value="">Featured: Any</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Not Featured</option>
                </select>
                <select className="st-select-x30sn" value={filters.trending} onChange={(e) => handleFilterChange('trending', e.target.value)}>
                  <option value="">Trending: Any</option>
                  <option value="true">Trending Only</option>
                  <option value="false">Not Trending</option>
                </select>
                <button className="st-clear-btn-x30sn" onClick={clearFilters} title="Reset all filters"><FaSync /></button>
              </div>
            </div>

            {/* DUAL VIEW SWITCHER CONTROL BAR */}
            <div className="st-control-bar-x30sn">
              <div style={{ fontSize: '13px', fontWeight: 600, color: '#888' }}>
                Filtered Results: <span style={{ color: '#fff', fontWeight: 800 }}>{totalStories}</span> stories found
              </div>
              <div className="st-view-mode-toggle-x30sn">
                <button 
                  type="button" 
                  className={`st-toggle-btn-view-x30sn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                >
                  <MdDashboard size={16} /> Grid Catalog
                </button>
                <button 
                  type="button" 
                  className={`st-toggle-btn-view-x30sn ${viewMode === 'table' ? 'active' : ''}`}
                  onClick={() => setViewMode('table')}
                >
                  <MdList size={16} /> Data Table
                </button>
              </div>
            </div>

            {/* VISUAL CARDS GRID VIEW */}
            {viewMode === 'grid' && (
              <div className="st-grid-x30sn">
                {loading ? (
                  <div className="st-loading-x30sn" style={{ gridColumn: 'span 4' }}>Loading database catalog…</div>
                ) : stories.length === 0 ? (
                  <div className="st-empty-x30sn" style={{ gridColumn: 'span 4' }}>No stories match your filter query.</div>
                ) : (
                  stories.map((story) => (
                    <article className="st-card-x30sn" key={story._id || story.id}>
                      <div className="st-card-cover-x30sn">
                        <img src={story.backgroundImage || '/placeholder.jpg'} alt={story.title} onError={(e) => e.target.style.display='none'} />
                        <span className="st-badge-overlay-x30sn">{story.category}</span>
                        {story.featured && <span className="st-badge-overlay-right-x30sn">Featured</span>}
                        
                        <div className="st-card-char-badge-x30sn" title={`${story.characterName} (${story.characterOccupation})`}>
                          <img src={story.characterAvatar || '/placeholder.jpg'} alt={story.characterName} />
                        </div>
                      </div>

                      <div className="st-card-info-x30sn">
                        <h3>{story.title}</h3>
                        <p>{story.excerpt}</p>

                        <div className="st-card-meta-x30sn">
                          <span className="st-card-badge-x30sn char"><FaUser /> {story.characterName} ({story.characterAge}y)</span>
                          <span className="st-card-badge-x30sn"><FaCity /> {story.city}</span>
                        </div>

                        <div className="st-card-stats-x30sn">
                          <div className="st-card-stat-item-x30sn views"><FaEye /> {story.readCount?.toLocaleString() || 0} reads</div>
                          <div className="st-card-stat-item-x30sn"><FaCalendar /> {formatDate(story.createdAt)}</div>
                        </div>

                        <div className="st-card-actions-x30sn">
                          <Link href={`/hot-stories/${story.slug || story.id}`} target="_blank" className="st-card-act-btn-x30sn edit">
                            <FaEye /> Preview
                          </Link>
                          <Link href={`/admin/stories/edit/${story._id || story.id}`} className="st-card-act-btn-x30sn">
                            <FaEdit /> Edit
                          </Link>
                          <button 
                            type="button" 
                            className="st-card-act-btn-x30sn delete"
                            onClick={() => handleDeleteStory(story._id || story.id, story.title)}
                            title="Delete Story"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            )}

            {/* HIGH-DENSITY DATA TABLE VIEW */}
            {viewMode === 'table' && (
              <div className="st-table-wrap-x30sn">
                {loading ? (
                  <div className="st-loading-x30sn">Loading database rows…</div>
                ) : stories.length === 0 ? (
                  <div className="st-empty-x30sn">No stories found.</div>
                ) : (
                  <div style={{ overflowX: 'auto' }}>
                    <table className="st-table-x30sn">
                      <thead>
                        <tr>
                          <th>Story Meta</th>
                          <th>Star Character</th>
                          <th>Tags</th>
                          <th>Status Checks</th>
                          <th>Reads</th>
                          <th>Published</th>
                          <th style={{ textAlign: 'right' }}>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stories.map(story => (
                          <tr key={story._id || story.id}>
                            <td>
                              <div className="st-cover-cell-x30sn">
                                <img src={story.backgroundImage || '/placeholder.jpg'} className="st-cover-img-x30sn" alt="" onError={(e) => e.target.style.display='none'} />
                                <div className="st-story-meta-x30sn">
                                  <h4>{story.title}</h4>
                                  <p>{story.excerpt}</p>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div className="st-char-cell-x30sn">
                                <img src={story.characterAvatar || '/placeholder.jpg'} className="st-char-img-x30sn" alt="" />
                                <div className="st-char-info-x30sn">
                                  <div>{story.characterName}</div>
                                  <small>{story.characterAge}y • {story.characterOccupation}</small>
                                </div>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                <span className="st-badge-x30sn cat">{story.category}</span>
                                <span className="st-badge-x30sn city"><FaCity /> {story.city}</span>
                              </div>
                            </td>
                            <td>
                              <div className="st-status-col-x30sn">
                                <button 
                                  className={`st-toggle-btn-x30sn ${story.featured ? 'active' : ''}`}
                                  onClick={() => toggleStatus(story._id || story.id, 'featured')}
                                >
                                  <FaStar /> {story.featured ? 'Featured' : 'Feature'}
                                </button>
                                <button 
                                  className={`st-toggle-btn-x30sn ${story.trending ? 'active' : ''}`}
                                  onClick={() => toggleStatus(story._id || story.id, 'trending')}
                                >
                                  <FaFire /> {story.trending ? 'Trending' : 'Trend'}
                                </button>
                              </div>
                            </td>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: '#ff69b4', fontWeight: 700, fontFamily: 'monospace' }}>
                                <FaEye style={{ color: '#ff69b4' }} /> {story.readCount?.toLocaleString() || 0}
                              </div>
                            </td>
                            <td>{formatDate(story.createdAt)}</td>
                            <td>
                              <div className="st-action-cell-x30sn" style={{ justifyContent: 'flex-end' }}>
                                <Link href={`/hot-stories/${story.slug || story.id}`} target="_blank" className="st-act-btn-x30sn" title="View Production Story"><FaEye /></Link>
                                <Link href={`/admin/stories/edit/${story._id || story.id}`} className="st-act-btn-x30sn" title="Edit Content"><FaEdit /></Link>
                                <button onClick={() => handleDeleteStory(story._id || story.id, story.title)} className="st-act-btn-x30sn del" title="Delete Permanent"><FaTrash /></button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="st-pagination-x30sn">
                <button className="st-page-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                   let p = i + 1;
                   if (currentPage > 3 && totalPages > 5) p = currentPage - 2 + i;
                   if (p > totalPages) return null;
                   return <button key={p} className={`st-page-num-x30sn ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
                })}
                <button className="st-page-btn-x30sn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
              </div>
            )}
          </>
        )}

      </div>
    </>
  );
};

export default StoriesAdmin;