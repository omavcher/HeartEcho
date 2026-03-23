'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
  FaEdit, FaTrash, FaEye, FaSearch, FaPlus, FaStar, FaFire, 
  FaCity, FaTag, FaCalendar, FaUser, FaSync
} from 'react-icons/fa';
import { MdMenuBook } from "react-icons/md";
import api from '../../config/api';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ------------------- CSS STYLES -------------------
const styles = `
/* ROOT & LAYOUT */
.stories-root-x30sn {
  animation: fade-in-x30sn 0.4s ease;
  width: 100%;
}
@keyframes fade-in-x30sn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.s-header-x30sn {
  display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 20px; margin-bottom: 30px;
}
.s-title-group-x30sn h1 { font-size: 28px; font-weight: 700; color: #fff; margin: 0; }
.s-title-group-x30sn p { color: #ff69b4; font-size: 14px; margin-top: 5px; }

.s-actions-group-x30sn { display: flex; gap: 10px; }

.s-create-btn-x30sn {
  background: #ff69b4; color: #000; padding: 10px 18px; border-radius: 8px; font-weight: 600; font-size: 14px;
  text-decoration: none; display: flex; align-items: center; gap: 8px; border: none; transition: 0.2s;
}
.s-create-btn-x30sn:hover { opacity: 0.8; }

/* STATS STRIP */
.s-stats-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 30px;
}
.s-stat-card-x30sn {
  background: #111; border: 1px solid #333; border-radius: 16px; padding: 24px; position: relative; overflow: hidden;
}
.s-stat-card-x30sn::after {
  content: ''; position: absolute; top: 0; left: 0; width: 4px; height: 100%; background: #ff69b4;
}
.s-stat-header-x30sn {
  display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 15px;
}
.s-stat-icon-x30sn {
  width: 44px; height: 44px; border-radius: 12px; background: rgba(255,105,180,0.1); color: #ff69b4;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.s-stat-label-x30sn { color: #888; font-size: 14px; font-weight: 500; }
.s-stat-value-x30sn { font-size: 32px; font-weight: 700; color: #fff; margin: 0; }


/* FILTERS */
.s-filters-x30sn {
  background: #050505; padding: 20px; border-radius: 16px; border: 1px solid #222; margin-bottom: 30px;
  display: flex; flex-direction: column; gap: 15px;
}
.s-search-row-x30sn { display: flex; gap: 10px; width: 100%; }
.s-search-box-x30sn {
  position: relative; flex: 1;
}
.s-search-box-x30sn svg { position: absolute; left: 14px; top: 14px; color: #555; }
.s-input-x30sn {
  width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 12px 12px 12px 40px;
  border-radius: 8px; outline: none; font-size: 14px; transition: 0.2s;
}
.s-input-x30sn:focus { border-color: #ff69b4; }
.s-search-btn-x30sn {
  background: #222; color: #fff; border: 1px solid #333; padding: 0 20px; border-radius: 8px; cursor: pointer; font-weight: 600;
}
.s-search-btn-x30sn:hover { background: #ff69b4; color: #000; border-color: #ff69b4; }

.s-filter-row-x30sn { display: flex; gap: 10px; flex-wrap: wrap; }
.s-select-x30sn {
  background: #000; color: #ccc; border: 1px solid #333; padding: 10px 15px; border-radius: 8px; outline: none; flex: 1; min-width: 140px; cursor: pointer;
}
.s-select-x30sn:focus { border-color: #ff69b4; color: #fff; }
.s-clear-btn-x30sn {
  background: transparent; border: 1px solid #333; color: #888; padding: 10px 20px; border-radius: 8px; cursor: pointer;
}
.s-clear-btn-x30sn:hover { color: #fff; border-color: #fff; }

/* TABLE */
.s-table-wrap-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; overflow: hidden; margin-bottom: 30px;
}
.s-table-x30sn { width: 100%; border-collapse: collapse; }
.s-table-x30sn thead { background: #111; border-bottom: 1px solid #333; }
.s-table-x30sn th {
  padding: 16px; text-align: left; color: #888; font-size: 11px; text-transform: uppercase; font-weight: 600; letter-spacing: 0.5px;
}
.s-table-x30sn tbody tr { border-bottom: 1px solid #1a1a1a; transition: 0.2s; }
.s-table-x30sn tbody tr:last-child { border-bottom: none; }
.s-table-x30sn tbody tr:hover { background: #0a0a0a; }
.s-table-x30sn td { padding: 16px; vertical-align: middle; font-size: 13px; color: #ccc; }

/* TABLE CELLS */
.s-cover-cell-x30sn { display: flex; gap: 15px; align-items: center; max-width: 300px; }
.s-cover-img-x30sn {
  width: 60px; height: 80px; object-fit: cover; border-radius: 6px; border: 1px solid #333; flex-shrink: 0;
}
.s-story-meta-x30sn h4 { margin: 0 0 5px 0; color: #fff; font-size: 14px; line-height: 1.4; }
.s-story-meta-x30sn p { margin: 0; color: #666; font-size: 11px; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

.s-char-cell-x30sn { display: flex; align-items: center; gap: 10px; }
.s-char-img-x30sn { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; border: 1px solid #ff69b4; }
.s-char-info-x30sn div { font-weight: 600; color: #fff; }
.s-char-info-x30sn small { color: #666; }

.s-badge-x30sn {
  padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase; display: inline-block;
}
.s-badge-x30sn.cat { background: #111; color: #ff69b4; border: 1px solid #333; }
.s-badge-x30sn.city { background: #000; color: #ccc; border: 1px solid #333; display: flex; align-items: center; gap: 5px; width: fit-content; }

.s-status-col-x30sn { display: flex; flex-direction: column; gap: 6px; }
.s-toggle-btn-x30sn {
  background: #000; border: 1px solid #333; color: #666; padding: 4px 8px; border-radius: 4px; 
  cursor: pointer; font-size: 10px; display: flex; align-items: center; gap: 6px; width: fit-content; transition: 0.2s;
}
.s-toggle-btn-x30sn:hover { border-color: #666; color: #fff; }
.s-toggle-btn-x30sn.active { background: rgba(255,105,180,0.15); color: #ff69b4; border-color: rgba(255,105,180,0.3); }

.s-action-cell-x30sn { display: flex; gap: 8px; }
.s-act-btn-x30sn {
  width: 32px; height: 32px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
  border: 1px solid #333; background: #000; color: #888; transition: 0.2s; cursor: pointer;
}
.s-act-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; transform: translateY(-2px); }
.s-act-btn-x30sn.del:hover { border-color: #ff4444; color: #ff4444; }

/* PAGINATION */
.s-pagination-x30sn { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 20px; padding-bottom: 40px; }
.s-page-btn-x30sn {
  background: #000; border: 1px solid #333; color: #fff; padding: 8px 16px; border-radius: 8px; cursor: pointer;
}
.s-page-btn-x30sn:disabled { opacity: 0.3; cursor: not-allowed; }
.s-page-num-x30sn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px; 
  background: #000; border: 1px solid #333; color: #888; cursor: pointer;
}
.s-page-num-x30sn.active { background: #ff69b4; color: #000; border-color: #ff69b4; font-weight: 700; }

/* MISC */
.s-empty-x30sn { text-align: center; padding: 60px; color: #666; }
.s-loading-x30sn { text-align: center; padding: 60px; color: #ff69b4; }
.msg-box-x30sn { padding: 10px 20px; border-radius: 8px; margin-bottom: 20px; font-size: 13px; }
.msg-success-x30sn { background: rgba(0,255,0,0.1); color: #00ff00; border: 1px solid rgba(0,255,0,0.2); }
.msg-error-x30sn { background: rgba(255,0,0,0.1); color: #ff4444; border: 1px solid rgba(255,0,0,0.2); }

/* TABS */
.s-tabs-x30sn {
  display: flex; gap: 20px; border-bottom: 1px solid #333; margin-bottom: 25px;
}
.s-tab-btn-x30sn {
  background: none; border: none; color: #888; font-size: 15px; font-weight: 600; padding: 10px 0; cursor: pointer;
  position: relative; transition: color 0.2s;
}
.s-tab-btn-x30sn:hover { color: #fff; }
.s-tab-btn-x30sn.active { color: #ff69b4; }
.s-tab-btn-x30sn.active::after {
  content: ''; position: absolute; bottom: -1px; left: 0; width: 100%; height: 2px; background: #ff69b4;
}

/* DASHBOARD */
.s-chart-section-x30sn {
  background: #111; border: 1px solid #333; border-radius: 16px; padding: 24px; margin-bottom: 30px;
}
.s-chart-head-x30sn {
  display: flex; align-items: center; gap: 10px; margin-bottom: 20px;
}
.s-chart-head-x30sn h3 { margin: 0; font-size: 18px; color: #fff; }
.s-chart-area-x30sn { height: 350px; width: 100%; }

.s-dash-grid-x30sn {
  display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-top: 10px;
}
.s-dash-card-x30sn {
  background: #111; border: 1px solid #333; border-radius: 16px; padding: 24px;
}
.s-dash-card-title-x30sn {
  font-size: 16px; font-weight: 700; color: #fff; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center;
}
.s-story-row-x30sn {
  display: flex; align-items: center; gap: 15px; padding: 15px 0; border-bottom: 1px solid #1a1a1a; transition: 0.2s;
}
.s-story-row-x30sn:hover { background: rgba(255,105,180,0.05); border-radius: 8px; padding: 15px 10px; margin: 0 -10px; }
.s-story-row-x30sn:last-child { border-bottom: none; }
.s-story-row-img-x30sn { width: 50px; height: 70px; object-fit: cover; border-radius: 6px; }
.s-story-row-info-x30sn { flex: 1; min-width: 0; }
.s-story-row-info-x30sn h4 { margin: 0 0 5px 0; font-size: 14px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; color: #fff; }
.s-story-row-info-x30sn p { margin: 0; font-size: 12px; color: #888; }
.s-story-row-reads-x30sn { font-weight: bold; color: #ff69b4; display: flex; align-items: center; gap: 5px;}


@media (max-width: 1000px) {
  .s-dash-grid-x30sn { grid-template-columns: 1fr; }
}

@media (max-width: 768px) {
  .s-header-x30sn { flex-direction: column; align-items: flex-start; }
  .s-create-btn-x30sn { width: 100%; justify-content: center; }
  .s-filter-row-x30sn { flex-direction: column; }
  .s-cover-cell-x30sn { max-width: 150px; }
  .s-cover-img-x30sn { display: none; }
}
`;

const StoriesAdmin = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ category: '', city: '', featured: '', trending: '' });
  
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

  const toggleStatus = async (id, type, current) => {
    try {
      const response = await axios.patch(`${api.Url}/story/${id}/toggle-${type}`);
      if (response.data.success) {
        fetchStories();
      }
    } catch (err) { console.error(err); }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <>
      <style>{styles}</style>
      <div className="stories-root-x30sn">
        
        {/* HEADER */}
        <div className="s-header-x30sn">
          <div className="s-title-group-x30sn">
            <h1>Story Content</h1>
            <p>Manage & Curate Database</p>
          </div>
          <div className="s-actions-group-x30sn">
            <Link href="/admin/create-story" className="s-create-btn-x30sn">
              <FaPlus /> New Story
            </Link>
          </div>
        </div>

        {/* FEEDBACK MSG */}
        {success && <div className="msg-box-x30sn msg-success-x30sn">{success}</div>}
        {error && <div className="msg-box-x30sn msg-error-x30sn">{error}</div>}

        {/* TABS */}
        <div className="s-tabs-x30sn">
          <button className={`s-tab-btn-x30sn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>Analytics Dashboard</button>
          <button className={`s-tab-btn-x30sn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Story Content</button>
        </div>

        {activeTab === 'dashboard' && (
          <>
            {/* STATS STRIP FOR DASHBOARD - MATCHING ADMIN UI EXACTLY */}
            <div className="s-stats-grid-x30sn">
              <div className="s-stat-card-x30sn">
                <div className="s-stat-header-x30sn">
                  <div className="s-stat-icon-x30sn"><MdMenuBook /></div>
                  <span className="s-stat-label-x30sn">Total Stories</span>
                </div>
                <h3 className="s-stat-value-x30sn">{analytics?.totalStories || 0}</h3>
              </div>
              <div className="s-stat-card-x30sn">
                <div className="s-stat-header-x30sn">
                  <div className="s-stat-icon-x30sn"><FaStar /></div>
                  <span className="s-stat-label-x30sn">Featured Stories</span>
                </div>
                <h3 className="s-stat-value-x30sn">{analytics?.featuredCount || 0}</h3>
              </div>
              <div className="s-stat-card-x30sn">
                <div className="s-stat-header-x30sn">
                  <div className="s-stat-icon-x30sn"><FaEye /></div>
                  <span className="s-stat-label-x30sn">Total Views (All Time)</span>
                </div>
                <h3 className="s-stat-value-x30sn">{analytics?.totalReads?.toLocaleString() || 0}</h3>
              </div>
            </div>

            {/* CHART SECTION */}
            <div className="s-chart-section-x30sn">
              <div className="s-chart-head-x30sn">
                <FaFire style={{color:'#ff69b4'}} />
                <h3>Views Performance Analytics</h3>
              </div>
              <div className="s-chart-area-x30sn">
                {loadingAnalytics ? <div className="s-loading-x30sn">Loading Graph...</div> : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analytics?.topStories || []}>
                      <XAxis dataKey="title" stroke="#888" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                      <YAxis stroke="#888" tick={{fill: '#888', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius: '8px', color: '#fff'}} itemStyle={{color: '#ff69b4'}} cursor={{fill: 'rgba(255,105,180,0.05)'}} />
                      <defs>
                        <linearGradient id="colorPink" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ff69b4" stopOpacity={1}/>
                          <stop offset="95%" stopColor="#d31d71" stopOpacity={0.8}/>
                        </linearGradient>
                      </defs>
                      <Bar dataKey="readCount" name="Total Views" fill="url(#colorPink)" radius={[6, 6, 0, 0]} barSize={50} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            <div className="s-dash-grid-x30sn">
              <div className="s-dash-card-x30sn">
                <div className="s-dash-card-title-x30sn"><div style={{display:'flex', gap:8, alignItems:'center'}}><FaFire color="#ff69b4"/> Top Performing Stories</div> <small style={{color:'#888', fontWeight:'normal'}}>By All-Time Views</small></div>
                {loadingAnalytics ? <div className="s-loading-x30sn">Loading Analytics...</div> : analytics?.topStories?.map((story, i) => (
                  <div key={story._id} className="s-story-row-x30sn">
                    <div style={{fontWeight:'bold', color:'#555', fontSize:18, width: 20}}>{i+1}</div>
                    <img src={story.backgroundImage} className="s-story-row-img-x30sn" alt="" />
                    <div className="s-story-row-info-x30sn">
                      <h4>{story.title}</h4>
                      <p>{story.category}</p>
                    </div>
                    <div className="s-story-row-reads-x30sn"><FaEye/> {story.readCount?.toLocaleString()}</div>
                  </div>
                ))}
              </div>

              <div className="s-dash-card-x30sn">
                <div className="s-dash-card-title-x30sn">Latest Stories <small style={{color:'#888', fontWeight:'normal'}}>Recent additions</small></div>
                {loadingAnalytics ? <div className="s-loading-x30sn">Loading Analytics...</div> : analytics?.recentStories?.map(story => (
                  <div key={story._id} className="s-story-row-x30sn">
                    <img src={story.backgroundImage} className="s-story-row-img-x30sn" style={{width: 40, height: 40, borderRadius: '50%'}} alt="" />
                    <div className="s-story-row-info-x30sn">
                      <h4>{story.title}</h4>
                      <p>{new Date(story.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="s-story-row-reads-x30sn" style={{color:'#ccc', fontSize:12}}><FaEye/> {story.readCount}</div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'content' && (
          <>
            {/* STATS STRIP FOR CONTENT TAB ONLY */}
            <div className="s-stats-grid-x30sn" style={{marginBottom: 30}}>
              <div className="s-stat-card-x30sn">
                <div className="s-stat-header-x30sn">
                  <div className="s-stat-icon-x30sn"><MdMenuBook /></div>
                  <span className="s-stat-label-x30sn">Filtered Stories</span>
                </div>
                <h3 className="s-stat-value-x30sn">{totalStories}</h3>
              </div>
            </div>

            {/* FILTERS */}
            <div className="s-filters-x30sn">
              <form onSubmit={handleSearch} className="s-search-row-x30sn">
                <div className="s-search-box-x30sn">
                  <FaSearch />
                  <input 
                    type="text" className="s-input-x30sn" placeholder="Search by title, character..." 
                    value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                  />
                </div>
                <button type="submit" className="s-search-btn-x30sn">Search</button>
              </form>

              <div className="s-filter-row-x30sn">
                <select className="s-select-x30sn" value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)}>
                  <option value="">All Categories</option>
                  {categories.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="s-select-x30sn" value={filters.city} onChange={(e) => handleFilterChange('city', e.target.value)}>
                  <option value="">All Cities</option>
                  {cities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select className="s-select-x30sn" value={filters.featured} onChange={(e) => handleFilterChange('featured', e.target.value)}>
                  <option value="">Featured: Any</option>
                  <option value="true">Featured Only</option>
                  <option value="false">Not Featured</option>
                </select>
                <select className="s-select-x30sn" value={filters.trending} onChange={(e) => handleFilterChange('trending', e.target.value)}>
                  <option value="">Trending: Any</option>
                  <option value="true">Trending Only</option>
                  <option value="false">Not Trending</option>
                </select>
                <button className="s-clear-btn-x30sn" onClick={clearFilters}><FaSync/></button>
              </div>
            </div>

        {/* TABLE */}
        <div className="s-table-wrap-x30sn">
          {loading ? <div className="s-loading-x30sn">Loading Database...</div> : 
           stories.length === 0 ? <div className="s-empty-x30sn">No stories found.</div> : (
            <div style={{overflowX:'auto'}}>
              <table className="s-table-x30sn">
                <thead>
                  <tr>
                    <th>Story</th>
                    <th>Character</th>
                    <th>Tags</th>
                    <th>Status</th>
                    <th>Reads</th>
                    <th>Date</th>
                    <th style={{textAlign:'right'}}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map(story => (
                    <tr key={story._id || story.id}>
                      <td>
                        <div className="s-cover-cell-x30sn">
                          <img src={story.backgroundImage || '/placeholder.jpg'} className="s-cover-img-x30sn" alt="" onError={(e) => e.target.style.display='none'} />
                          <div className="s-story-meta-x30sn">
                            <h4>{story.title}</h4>
                            <p>{story.excerpt}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="s-char-cell-x30sn">
                          <img src={story.characterAvatar || '/placeholder.jpg'} className="s-char-img-x30sn" alt="" />
                          <div className="s-char-info-x30sn">
                            <div>{story.characterName}</div>
                            <small>{story.characterAge}y • {story.characterOccupation}</small>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex', flexDirection:'column', gap:5}}>
                          <span className="s-badge-x30sn cat">{story.category}</span>
                          <span className="s-badge-x30sn city"><FaCity/> {story.city}</span>
                        </div>
                      </td>
                      <td>
                        <div className="s-status-col-x30sn">
                          <button 
                            className={`s-toggle-btn-x30sn ${story.featured ? 'active' : ''}`}
                            onClick={() => toggleStatus(story._id || story.id, 'featured', story.featured)}
                          >
                            <FaStar/> {story.featured ? 'Featured' : 'Feature'}
                          </button>
                          <button 
                            className={`s-toggle-btn-x30sn ${story.trending ? 'active' : ''}`}
                            onClick={() => toggleStatus(story._id || story.id, 'trending', story.trending)}
                          >
                            <FaFire/> {story.trending ? 'Trending' : 'Trend'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div style={{display:'flex', alignItems:'center', gap:5, color:'#888'}}>
                          <FaEye style={{color:'#666'}}/> {story.readCount?.toLocaleString() || 0}
                        </div>
                      </td>
                      <td>{formatDate(story.createdAt)}</td>
                      <td>
                        <div className="s-action-cell-x30sn" style={{justifyContent:'flex-end'}}>
                           <Link href={`/hot-stories/${story.slug || story.id}`} target="_blank" className="s-act-btn-x30sn"><FaEye/></Link>
                           <Link href={`/admin/stories/edit/${story._id || story.id}`} className="s-act-btn-x30sn"><FaEdit/></Link>
                           <button onClick={() => handleDeleteStory(story._id || story.id, story.title)} className="s-act-btn-x30sn del"><FaTrash/></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="s-pagination-x30sn">
            <button className="s-page-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
               // Simple logic to show window of pages
               let p = i + 1;
               if(currentPage > 3 && totalPages > 5) p = currentPage - 2 + i;
               if(p > totalPages) return null;
               return <button key={p} className={`s-page-num-x30sn ${currentPage === p ? 'active' : ''}`} onClick={() => setCurrentPage(p)}>{p}</button>
            })}
            <button className="s-page-btn-x30sn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        )}
        </>
        )}

      </div>
    </>
  );
};

export default StoriesAdmin;