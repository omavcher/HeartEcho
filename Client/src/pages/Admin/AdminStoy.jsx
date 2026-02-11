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

// ------------------- CSS STYLES -------------------
const styles = `
/* ROOT & LAYOUT */
.stories-root-x30sn {
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  animation: fade-in-x30sn 0.4s ease;
}
@keyframes fade-in-x30sn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.s-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; flex-wrap: wrap; gap: 20px;
}
.s-title-group-x30sn h1 { font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px; }
.s-title-group-x30sn p { color: #ff69b4; margin: 5px 0 0 0; font-size: 13px; font-weight: 500; }

.s-create-btn-x30sn {
  background: #ff69b4; color: #000; padding: 12px 24px; border-radius: 10px; font-weight: 700;
  text-decoration: none; display: flex; align-items: center; gap: 8px; transition: 0.2s; border: none;
}
.s-create-btn-x30sn:hover { transform: translateY(-2px); box-shadow: 0 4px 15px rgba(255,105,180,0.4); }

/* STATS STRIP */
.s-stats-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-bottom: 30px;
}
.s-stat-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 14px; padding: 16px;
  display: flex; align-items: center; gap: 15px; position: relative; overflow: hidden;
}
.s-stat-card-x30sn::after {
  content: ''; position: absolute; bottom: 0; left: 0; width: 100%; height: 2px;
  background: linear-gradient(90deg, #ff69b4, transparent); opacity: 0.5;
}
.s-stat-icon-x30sn {
  width: 46px; height: 46px; border-radius: 12px; background: rgba(255,105,180,0.1); color: #ff69b4;
  display: flex; align-items: center; justify-content: center; font-size: 20px;
}
.s-stat-info-x30sn span { display: block; font-size: 11px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
.s-stat-info-x30sn strong { font-size: 22px; color: #fff; font-weight: 700; }

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

  useEffect(() => { fetchStories(); }, [currentPage, filters]);

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
          <Link href="/admin/create-story" className="s-create-btn-x30sn">
            <FaPlus /> New Story
          </Link>
        </div>

        {/* FEEDBACK MSG */}
        {success && <div className="msg-box-x30sn msg-success-x30sn">{success}</div>}
        {error && <div className="msg-box-x30sn msg-error-x30sn">{error}</div>}

        {/* STATS STRIP */}
        <div className="s-stats-grid-x30sn">
          <div className="s-stat-card-x30sn">
            <div className="s-stat-icon-x30sn"><MdMenuBook /></div>
            <div className="s-stat-info-x30sn"><span>Total Stories</span><strong>{totalStories}</strong></div>
          </div>
          <div className="s-stat-card-x30sn">
            <div className="s-stat-icon-x30sn"><FaStar /></div>
            <div className="s-stat-info-x30sn"><span>Featured</span><strong>{stories.filter(s => s.featured).length}</strong></div>
          </div>
          <div className="s-stat-card-x30sn">
            <div className="s-stat-icon-x30sn"><FaFire /></div>
            <div className="s-stat-info-x30sn"><span>Trending</span><strong>{stories.filter(s => s.trending).length}</strong></div>
          </div>
          <div className="s-stat-card-x30sn">
            <div className="s-stat-icon-x30sn"><FaEye /></div>
            <div className="s-stat-info-x30sn"><span>Total Reads</span><strong>{stories.reduce((acc,s) => acc + (s.readCount||0), 0).toLocaleString()}</strong></div>
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

      </div>
    </>
  );
};

export default StoriesAdmin;