'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FaStar, FaTrash, FaSearch, FaCheckCircle, 
  FaTimesCircle, FaSync, FaEye, FaEyeSlash, FaFilter
} from "react-icons/fa";
import { MdSort } from "react-icons/md";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from "recharts";
import api from "../../config/api";
import axios from "axios";

// ------------------- CSS STYLES (Black & Pink Theme) -------------------
const styles = `
.fba-root-x30sn {
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  animation: fade-in-x30sn 0.4s ease;
}
@keyframes fade-in-x30sn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.fba-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; flex-wrap: wrap; gap: 20px;
  background: #050505; padding: 20px; border-radius: 16px; border: 1px solid #222;
}
.fba-title-group-x30sn h2 { font-size: 28px; font-weight: 800; margin: 0; color: #fff; letter-spacing: -0.5px; }
.fba-title-group-x30sn p { color: #ff69b4; margin: 5px 0 0 0; font-size: 13px; font-weight: 500; }

.fba-header-actions-x30sn { display: flex; gap: 10px; flex-wrap: wrap; }

.fba-btn-x30sn {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #333;
  background: #111; color: #fff; transition: 0.2s;
}
.fba-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }
.fba-btn-x30sn:disabled { opacity: 0.5; cursor: not-allowed; }
.fba-btn-x30sn.primary { background: rgba(255,105,180,0.1); border-color: rgba(255,105,180,0.4); color: #ff69b4; }
.fba-btn-x30sn.primary:hover { background: rgba(255,105,180,0.2); }
.fba-btn-x30sn.danger { background: rgba(255,68,68,0.08); border-color: rgba(255,68,68,0.3); color: #ff4444; }
.fba-btn-x30sn.danger:hover { background: rgba(255,68,68,0.15); }

@keyframes spin-x30sn { to { transform: rotate(360deg); } }
.spinning-x30sn { animation: spin-x30sn 0.8s linear infinite; }

/* STATS */
.fba-stats-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;
}
.fba-stat-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 14px; padding: 20px;
  display: flex; align-items: center; gap: 15px; transition: 0.2s;
}
.fba-stat-card-x30sn:hover { border-color: #333; }
.fba-stat-icon-x30sn {
  width: 48px; height: 48px; border-radius: 12px; background: rgba(255,105,180,0.1); color: #ff69b4;
  display: flex; align-items: center; justify-content: center; font-size: 22px; flex-shrink: 0;
}
.fba-stat-info-x30sn span { display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.fba-stat-info-x30sn strong { font-size: 24px; color: #fff; font-weight: 700; }

/* CHARTS */
.fba-charts-row-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;
}
.fba-chart-box-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px; height: 300px;
}
.fba-chart-box-x30sn h4 { margin: 0 0 15px 0; font-size: 14px; color: #ccc; }

/* FILTERS BAR */
.fba-filters-x30sn {
  background: #050505; padding: 15px; border-radius: 12px; border: 1px solid #222; margin-bottom: 25px;
  display: flex; gap: 12px; flex-wrap: wrap; align-items: center;
}
.fba-search-wrap-x30sn { position: relative; flex: 2; min-width: 220px; }
.fba-search-wrap-x30sn svg { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #555; pointer-events: none; }
.fba-input-x30sn {
  width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px 10px 10px 36px;
  border-radius: 8px; outline: none; font-size: 13px; transition: 0.2s; box-sizing: border-box;
}
.fba-input-x30sn:focus { border-color: #ff69b4; }
.fba-select-x30sn { 
  background: #000; color: #fff; border: 1px solid #333; padding: 10px 12px; border-radius: 8px; 
  outline: none; flex: 1; min-width: 120px; font-size: 13px; cursor: pointer;
  transition: 0.2s;
}
.fba-select-x30sn:focus { border-color: #ff69b4; }
.fba-filter-label-x30sn { font-size: 12px; color: #555; display: flex; align-items: center; gap: 5px; white-space: nowrap; }

.fba-results-row-x30sn { 
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;
  font-size: 12px; color: #555;
}
.fba-results-row-x30sn strong { color: #888; }

/* LIST */
.fba-list-x30sn { display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 20px; }
.fba-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px;
  transition: border-color 0.2s, box-shadow 0.2s; 
  position: relative; display: flex; flex-direction: column; justify-content: space-between;
}
.fba-card-x30sn:hover { border-color: #ff69b4; box-shadow: 0 0 20px rgba(255,105,180,0.05); }
.fba-card-x30sn.is-live { border-color: rgba(0,255,100,0.2); }
.fba-header-row-x30sn { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
.fba-badge-row-x30sn { display: flex; gap: 6px; flex-wrap: wrap; }
.fba-badge-x30sn {
  padding: 3px 9px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.3px;
}
.fba-badge-x30sn.live { background: rgba(0,255,100,0.1); color: #00ff64; border: 1px solid rgba(0,255,100,0.2); }
.fba-badge-x30sn.hidden { background: rgba(255,255,255,0.05); color: #555; border: 1px solid rgba(255,255,255,0.08); }
.fba-badge-x30sn.concern { background: rgba(255,0,0,0.1); color: #ff4444; border: 1px solid rgba(255,0,0,0.2); }
.fba-badge-x30sn.positive { background: rgba(255,105,180,0.1); color: #ff69b4; border: 1px solid rgba(255,105,180,0.2); }

.fba-rating-stars-x30sn { display: flex; gap: 2px; }
.fba-review-text-x30sn { 
  font-size: 14px; color: #ddd; margin: 14px 0; line-height: 1.6; font-weight: 400; 
  min-height: 42px; 
  display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden;
}
.fba-meta-box-x30sn { background: #000; padding: 12px; border-radius: 8px; font-size: 12px; color: #888; border: 1px solid #111; }
.fba-meta-box-x30sn div { margin-bottom: 3px; }
.fba-meta-box-x30sn strong { color: #bbb; }

.fba-card-actions-x30sn { display: flex; gap: 8px; margin-top: 16px; justify-content: flex-end; }
.fba-act-btn-x30sn {
  background: #111; color: #fff; border: 1px solid #222; padding: 7px 13px; border-radius: 6px;
  display: flex; align-items: center; gap: 6px; cursor: pointer; transition: 0.2s; font-size: 12px; font-weight: 600;
}
.fba-act-btn-x30sn:hover { border-color: #444; }
.fba-act-btn-x30sn.live-toggle { color: #00ff64; border-color: rgba(0,255,100,0.2); background: rgba(0,255,100,0.06); }
.fba-act-btn-x30sn.live-toggle:hover { background: rgba(0,255,100,0.12); }
.fba-act-btn-x30sn.hide-toggle { color: #888; }
.fba-act-btn-x30sn.hide-toggle:hover { color: #ccc; border-color: #444; }
.fba-act-btn-x30sn.del { color: #ff4444; }
.fba-act-btn-x30sn.del:hover { background: rgba(255,0,0,0.08); border-color: rgba(255,0,0,0.3); }

/* EMPTY STATE */
.fba-empty-x30sn { 
  grid-column: 1/-1; text-align: center; padding: 60px 40px; color: #555; 
  background: #050505; border: 1px dashed #222; border-radius: 16px;
}
.fba-empty-x30sn svg { font-size: 40px; margin-bottom: 15px; opacity: 0.3; }
.fba-empty-x30sn h3 { color: #444; margin: 0 0 8px 0; font-size: 16px; }
.fba-empty-x30sn p { margin: 0; font-size: 13px; }

/* LOADING */
.fba-loading-x30sn {
  display: flex; align-items: center; justify-content: center; 
  min-height: 60vh; flex-direction: column; gap: 15px; color: #555;
}
.fba-loading-x30sn svg { font-size: 32px; color: #ff69b4; }

/* PAGINATION */
.fba-pagination-x30sn { display: flex; justify-content: center; align-items: center; gap: 8px; margin-top: 30px; padding-bottom: 50px; }
.fba-page-num-x30sn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px;
  background: #000; border: 1px solid #222; color: #666; cursor: pointer; font-size: 13px; transition: 0.2s;
}
.fba-page-num-x30sn:hover { border-color: #444; color: #ccc; }
.fba-page-num-x30sn.active { background: #ff69b4; color: #000; border-color: #ff69b4; font-weight: 700; }
`;

const COLORS_PIE = ['#00ff64', '#333'];
const RATING_COLORS = ['#ff4444', '#ff8c00', '#ffd700', '#adff2f', '#ff69b4'];

const FeedbackAdmin = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLive, setFilterLive] = useState("all");
  const [filterRating, setFilterRating] = useState("all");
  const [filterConcern, setFilterConcern] = useState("all");
  const [sortOrder, setSortOrder] = useState("newest");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const feedbacksPerPage = 9;

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchFeedbacks = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/feedbacks`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setFeedbacks(response.data.data || []);
    } catch (error) {
      console.error(error);
      setFeedbacks([]);
    }
  }, [getToken]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try { await fetchFeedbacks(); } 
    catch (error) { console.error(error); } 
    finally { setRefreshing(false); setLoading(false); }
  }, [fetchFeedbacks]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  // Statistics
  const stats = useMemo(() => {
    const total = feedbacks.length;
    const liveCount = feedbacks.filter(f => f.live).length;
    const hiddenCount = total - liveCount;
    const concerns = feedbacks.filter(f => f.isConcern).length;
    const sumRatings = feedbacks.reduce((sum, f) => sum + f.rating, 0);
    const avgRating = total > 0 ? (sumRatings / total).toFixed(1) : "0.0";
    const fiveStarCount = feedbacks.filter(f => f.rating === 5).length;
    return { total, liveCount, hiddenCount, concerns, avgRating, fiveStarCount };
  }, [feedbacks]);

  // Chart data
  const ratingDistributionData = useMemo(() => {
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    feedbacks.forEach(f => { if (counts[f.rating] !== undefined) counts[f.rating]++; });
    return Object.entries(counts).map(([star, count]) => ({ rating: `${star}★`, count, fill: RATING_COLORS[star-1] }));
  }, [feedbacks]);

  const liveStateData = useMemo(() => [
    { name: `Live (${stats.liveCount})`, value: stats.liveCount },
    { name: `Hidden (${stats.hiddenCount})`, value: stats.hiddenCount }
  ], [stats]);

  // Filtering + Sorting
  const filteredFeedbacks = useMemo(() => {
    let list = feedbacks.filter(f => {
      const matchesSearch = !searchTerm || 
                            f.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            f.city?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            f.text?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLive = filterLive === "all" || 
                          (filterLive === "live" && f.live) || 
                          (filterLive === "hidden" && !f.live);
      const matchesRating = filterRating === "all" || f.rating === Number(filterRating);
      const matchesConcern = filterConcern === "all" ||
                             (filterConcern === "concern" && f.isConcern) ||
                             (filterConcern === "positive" && !f.isConcern);
      return matchesSearch && matchesLive && matchesRating && matchesConcern;
    });

    if (sortOrder === "newest") list = [...list].sort((a, b) => new Date(b.date) - new Date(a.date));
    else if (sortOrder === "oldest") list = [...list].sort((a, b) => new Date(a.date) - new Date(b.date));
    else if (sortOrder === "highest") list = [...list].sort((a, b) => b.rating - a.rating);
    else if (sortOrder === "lowest") list = [...list].sort((a, b) => a.rating - b.rating);

    return list;
  }, [feedbacks, searchTerm, filterLive, filterRating, filterConcern, sortOrder]);

  const paginatedFeedbacks = filteredFeedbacks.slice((currentPage - 1) * feedbacksPerPage, currentPage * feedbacksPerPage);
  const totalPages = Math.ceil(filteredFeedbacks.length / feedbacksPerPage);

  // Reset page on filter change
  useEffect(() => { setCurrentPage(1); }, [searchTerm, filterLive, filterRating, filterConcern, sortOrder]);

  // Toggle Live status
  const handleToggleLive = async (id) => {
    try {
      const token = getToken();
      const response = await axios.put(`${api.Url}/admin/feedbacks/${id}/toggle-live`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setFeedbacks(prev => prev.map(f => f._id === id ? response.data.data : f));
      }
    } catch (e) {
      alert("Failed to toggle live status. Please try again.");
    }
  };

  // Delete feedback
  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this feedback permanently?")) return;
    try {
      const token = getToken();
      await axios.delete(`${api.Url}/admin/feedbacks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setFeedbacks(prev => prev.filter(f => f._id !== id));
    } catch (e) {
      alert("Failed to delete feedback. Please try again.");
    }
  };

  // Bulk: Make all hidden feedbacks live
  const handleBulkMakeLive = async () => {
    const hidden = feedbacks.filter(f => !f.live);
    if (hidden.length === 0) { alert("All feedbacks are already live!"); return; }
    if (!confirm(`Make all ${hidden.length} hidden feedback(s) live? They will appear on the public reviews page.`)) return;
    
    setBulkLoading(true);
    try {
      const token = getToken();
      await Promise.all(
        hidden.map(f => axios.put(`${api.Url}/admin/feedbacks/${f._id}/toggle-live`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }))
      );
      setFeedbacks(prev => prev.map(f => ({ ...f, live: true })));
    } catch (e) {
      alert("Some feedbacks failed to update. Please refresh and try again.");
    } finally {
      setBulkLoading(false);
    }
  };

  // Bulk: Hide all live feedbacks
  const handleBulkHideAll = async () => {
    const live = feedbacks.filter(f => f.live);
    if (live.length === 0) { alert("All feedbacks are already hidden!"); return; }
    if (!confirm(`Hide all ${live.length} live feedback(s)? They will be removed from the public reviews page.`)) return;
    
    setBulkLoading(true);
    try {
      const token = getToken();
      await Promise.all(
        live.map(f => axios.put(`${api.Url}/admin/feedbacks/${f._id}/toggle-live`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        }))
      );
      setFeedbacks(prev => prev.map(f => ({ ...f, live: false })));
    } catch (e) {
      alert("Some feedbacks failed to update. Please refresh and try again.");
    } finally {
      setBulkLoading(false);
    }
  };

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',minHeight:'40vh',flexDirection:'column',gap:15,color:'#555'}}>
      <FaSync style={{fontSize:28,color:'#ff69b4',animation:'spin-x30sn 0.8s linear infinite'}} />
      <span style={{fontSize:13}}>Loading feedback data...</span>
    </div>
  );

  return (
    <>
      <style>{styles}</style>
      <div className="fba-root-x30sn">
        
        {/* HEADER */}
        <div className="fba-header-x30sn">
          <div className="fba-title-group-x30sn">
            <h2>Feedback & Reviews</h2>
            <p>Moderate user submissions · Control public visibility</p>
          </div>
          <div className="fba-header-actions-x30sn">
            <button className="fba-btn-x30sn primary" onClick={handleBulkMakeLive} disabled={bulkLoading || refreshing}>
              <FaEye /> {bulkLoading ? "Processing..." : `Make All Live (${stats.hiddenCount})`}
            </button>
            <button className="fba-btn-x30sn danger" onClick={handleBulkHideAll} disabled={bulkLoading || refreshing}>
              <FaEyeSlash /> {bulkLoading ? "Processing..." : `Hide All (${stats.liveCount})`}
            </button>
            <button className="fba-btn-x30sn" onClick={fetchAllData} disabled={refreshing}>
              <FaSync className={refreshing ? "spinning-x30sn" : ""} /> {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* STATS */}
        <div className="fba-stats-grid-x30sn">
          <div className="fba-stat-card-x30sn">
            <div className="fba-stat-icon-x30sn"><FaFilter /></div>
            <div className="fba-stat-info-x30sn"><span>Total Submissions</span><strong>{stats.total}</strong></div>
          </div>
          <div className="fba-stat-card-x30sn">
            <div className="fba-stat-icon-x30sn" style={{color:'#00ff64', background:'rgba(0,255,100,0.06)'}}>
              <FaEye />
            </div>
            <div className="fba-stat-info-x30sn"><span>Live on Public Page</span><strong style={{color:'#00ff64'}}>{stats.liveCount}</strong></div>
          </div>
          <div className="fba-stat-card-x30sn">
            <div className="fba-stat-icon-x30sn" style={{color:'#888', background:'rgba(255,255,255,0.04)'}}>
              <FaEyeSlash />
            </div>
            <div className="fba-stat-info-x30sn"><span>Hidden</span><strong style={{color:'#888'}}>{stats.hiddenCount}</strong></div>
          </div>
          <div className="fba-stat-card-x30sn">
            <div className="fba-stat-icon-x30sn" style={{color:'#ffd700', background:'rgba(255,215,0,0.05)'}}>
              <FaStar />
            </div>
            <div className="fba-stat-info-x30sn"><span>Average Rating</span><strong style={{color:'#ffd700'}}>{stats.avgRating} ★</strong></div>
          </div>
          <div className="fba-stat-card-x30sn">
            <div className="fba-stat-icon-x30sn" style={{color:'#ff4444', background:'rgba(255,68,68,0.05)'}}>
              <FaTimesCircle />
            </div>
            <div className="fba-stat-info-x30sn"><span>Concerns (≤3★)</span><strong style={{color:'#ff4444'}}>{stats.concerns}</strong></div>
          </div>
          <div className="fba-stat-card-x30sn">
            <div className="fba-stat-icon-x30sn" style={{color:'#ff69b4', background:'rgba(255,105,180,0.06)'}}>
              <FaCheckCircle />
            </div>
            <div className="fba-stat-info-x30sn"><span>5-Star Reviews</span><strong style={{color:'#ff69b4'}}>{stats.fiveStarCount}</strong></div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="fba-charts-row-x30sn">
          <div className="fba-chart-box-x30sn">
            <h4>Live Status Distribution</h4>
            <ResponsiveContainer width="100%" height="88%">
              <PieChart>
                <Pie data={liveStateData} innerRadius={65} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {liveStateData.map((_, i) => <Cell key={i} fill={COLORS_PIE[i]} />)}
                </Pie>
                <Tooltip contentStyle={{background:'#0a0a0a', border:'1px solid #222', borderRadius:'8px', fontSize:12}} />
                <Legend verticalAlign="bottom" iconType="circle" formatter={(v) => <span style={{color:'#aaa', fontSize:11}}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="fba-chart-box-x30sn">
            <h4>Rating Distribution</h4>
            <ResponsiveContainer width="100%" height="88%">
              <BarChart data={ratingDistributionData} barSize={32}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1a1a1a"/>
                <XAxis dataKey="rating" stroke="#444" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#444" fontSize={12} axisLine={false} tickLine={false} width={30} />
                <Tooltip 
                  cursor={{fill: 'rgba(255,105,180,0.05)'}} 
                  contentStyle={{background:'#0a0a0a', border:'1px solid #222', borderRadius:'8px', fontSize:12}} 
                />
                <Bar dataKey="count" radius={[4,4,0,0]}>
                  {ratingDistributionData.map((entry, i) => <Cell key={i} fill={entry.fill} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILTERS */}
        <div className="fba-filters-x30sn">
          <div className="fba-search-wrap-x30sn">
            <FaSearch size={12} />
            <input 
              className="fba-input-x30sn" 
              placeholder="Search by name, city, or review text..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>

          <div className="fba-filter-label-x30sn">
            <FaFilter size={12} /> Filter by:
          </div>

          <select 
            className="fba-select-x30sn" 
            value={filterLive} 
            onChange={e => setFilterLive(e.target.value)}
          >
            <option value="all">Visibility: All</option>
            <option value="live">Live only</option>
            <option value="hidden">Hidden only</option>
          </select>

          <select 
            className="fba-select-x30sn" 
            value={filterRating} 
            onChange={e => setFilterRating(e.target.value)}
          >
            <option value="all">Rating: All</option>
            <option value="5">5 Stars</option>
            <option value="4">4 Stars</option>
            <option value="3">3 Stars</option>
            <option value="2">2 Stars</option>
            <option value="1">1 Star</option>
          </select>

          <select 
            className="fba-select-x30sn" 
            value={filterConcern} 
            onChange={e => setFilterConcern(e.target.value)}
          >
            <option value="all">Type: All</option>
            <option value="positive">Positive Reviews</option>
            <option value="concern">Concerns (≤3★)</option>
          </select>

          <select 
            className="fba-select-x30sn" 
            value={sortOrder} 
            onChange={e => setSortOrder(e.target.value)}
          >
            <option value="newest">Sort: Newest</option>
            <option value="oldest">Sort: Oldest</option>
            <option value="highest">Sort: Highest</option>
            <option value="lowest">Sort: Lowest</option>
          </select>
        </div>

        <div className="fba-results-row-x30sn">
          Showing <strong>{filteredFeedbacks.length}</strong> of <strong>{feedbacks.length}</strong> reviews
        </div>

        {/* FEEDBACK LIST */}
        <div className="fba-list-x30sn">
          {paginatedFeedbacks.map(f => (
            <div key={f._id} className={`fba-card-x30sn${f.live ? ' is-live' : ''}`}>
              <div>
                <div className="fba-header-row-x30sn">
                  <div className="fba-rating-stars-x30sn">
                    {Array.from({ length: 5 }, (_, i) => (
                      <FaStar key={i} style={{ color: i < f.rating ? '#ffd700' : '#222', fontSize: 13 }} />
                    ))}
                  </div>
                  <div className="fba-badge-row-x30sn">
                    <span className={`fba-badge-x30sn ${f.live ? 'live' : 'hidden'}`}>
                      {f.live ? '● Live' : '○ Hidden'}
                    </span>
                    <span className={`fba-badge-x30sn ${f.isConcern ? 'concern' : 'positive'}`}>
                      {f.isConcern ? 'Concern' : 'Positive'}
                    </span>
                  </div>
                </div>

                <div className="fba-review-text-x30sn">"{f.text}"</div>
                
                <div className="fba-meta-box-x30sn">
                  <div><strong>Author:</strong> {f.name}</div>
                  <div><strong>City:</strong> {f.city || 'N/A'}</div>
                  {f.feature && <div><strong>Feature:</strong> {f.feature}</div>}
                  {f.user && (
                    <div style={{borderTop:'1px solid #111', marginTop:'7px', paddingTop:'7px', fontSize:'11px', color:'#666'}}>
                      <strong>Email:</strong> {f.user.email}
                    </div>
                  )}
                  <div style={{fontSize:'10px', color:'#444', marginTop:'5px'}}>
                    <strong>Submitted:</strong> {new Date(f.date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </div>
                </div>
              </div>

              <div className="fba-card-actions-x30sn">
                <button 
                  className={`fba-act-btn-x30sn ${f.live ? 'hide-toggle' : 'live-toggle'}`} 
                  onClick={() => handleToggleLive(f._id)}
                  title={f.live ? "Hide from public reviews page" : "Publish to public reviews page"}
                >
                  {f.live ? <><FaEyeSlash /> Hide</> : <><FaEye /> Make Live</>}
                </button>
                <button 
                  className="fba-act-btn-x30sn del" 
                  onClick={() => handleDelete(f._id)} 
                  title="Delete Feedback Permanently"
                >
                  <FaTrash /> Delete
                </button>
              </div>
            </div>
          ))}

          {filteredFeedbacks.length === 0 && (
            <div className="fba-empty-x30sn">
              <FaSearch size={36} style={{color:'#333', marginBottom:12}} />
              <h3>No feedback found</h3>
              <p>
                {searchTerm || filterLive !== 'all' || filterRating !== 'all' || filterConcern !== 'all'
                  ? "Try adjusting your filters or search term."
                  : "No feedback submissions yet. They'll appear here when users submit reviews."}
              </p>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="fba-pagination-x30sn">
            <button className="fba-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(1)}>«</button>
            <button className="fba-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹ Prev</button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let page;
              if (totalPages <= 7) page = i + 1;
              else if (currentPage <= 4) page = i + 1;
              else if (currentPage >= totalPages - 3) page = totalPages - 6 + i;
              else page = currentPage - 3 + i;
              if (page < 1 || page > totalPages) return null;
              return (
                <button key={page} className={`fba-page-num-x30sn ${currentPage === page ? 'active' : ''}`} onClick={() => setCurrentPage(page)}>
                  {page}
                </button>
              );
            })}
            <button className="fba-btn-x30sn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next ›</button>
            <button className="fba-btn-x30sn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(totalPages)}>»</button>
          </div>
        )}
      </div>
    </>
  );
};

export default FeedbackAdmin;