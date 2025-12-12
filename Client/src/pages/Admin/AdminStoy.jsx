// app/admin/stories/page.jsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import { 
  FaEdit, 
  FaTrash, 
  FaEye, 
  FaSearch, 
  FaFilter, 
  FaSort, 
  FaPlus,
  FaStar,
  FaFire,
  FaCity,
  FaTag,
  FaCalendar,
  FaEye as FaReads,
  FaUser
} from 'react-icons/fa';
import './StoriesAdmin.css';
import api from '../../config/api';

const StoriesAdmin = () => {
  // State management
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Filters and search
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    city: '',
    featured: '',
    trending: ''
  });
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStories, setTotalStories] = useState(0);
  const itemsPerPage = 10;
  
  // Categories and cities
  const categories = [
    'Housewife', 'Bhabhi', 'Devar-Bhabhi', 'Nanad-Bhabhi',
    'Aunty', 'Mami', 'Maami', 'Chachi', 'Buwa', 'Tai',
    'Incest', 'Mother-Son', 'Brother-Sister', 'Father-Daughter',
    'Behan-Bhai', 'Maa-Beta', 'Papa-Beti', 'Sasur-Bahu',
    'Village', 'Gaon Ki Chudai', 'Khet-Maidan', 'Desi',
    'Neighbor', 'Padosan', 'Padosi', 'Colony Aunty',
    'Cheating Wife', 'Biwi Ki Chudai', 'Cuckold', 'Patni Paraye Mard Se',
    'Office Sex', 'Boss-Secretary', 'Teacher-Student', 'Madam aur Naukar',
    'Virgin', 'First Time', 'Suhagraat', 'Honeymoon',
    'Maid', 'Kaamwali Bai', 'Servant', 'Driver Sex',
    'Forced', 'Zabardasti', 'Blackmail', 'Majboori Mein Chudai',
    'Gangbang', 'Group Sex', 'Train Mein Chudai', 'Bus Mein',
    'Muslim', 'Hijab', 'Burqa', 'Pathan', 'Bhabhi aur Jiju',
    'College Girl', 'Hostel Sex', 'Boyfriend-Girlfriend', 'Dost Ki Behan',
    'MILF', 'Mature', 'Jethani-Devrani', 'Saas-Bahu',
    'Threesome', 'Do Mardo Se', 'Harem', 'Rich Family',
    'Public Sex', 'Car Mein', 'Hotel Room', 'Jungle Mein',
    'Romantic', 'Pyar Mohabbat', 'True Love Story',
    'Savita Bhabhi Style', 'Velamma', 'Miss Rita', 'Kirtu Type'
  ];
  
  const cities = [
    'All Cities', 'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow', 'Goa', 'Chandigarh', 'Other'
  ];

  // Fetch stories
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
      console.error('Error fetching stories:', err);
      setError('Failed to load stories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchStories();
  }, [currentPage, filters]);

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchStories();
  };

  // Handle filter change
  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({ ...prev, [filterName]: value }));
    setCurrentPage(1);
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      category: '',
      city: '',
      featured: '',
      trending: ''
    });
    setSearchQuery('');
    setCurrentPage(1);
  };

  // Delete story
  const handleDeleteStory = async (id, title) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    
    try {
      const response = await axios.delete(`${api.Url}/story/${id}`);
      
      if (response.data.success) {
        setSuccess(`Story "${title}" deleted successfully!`);
        fetchStories(); // Refresh list
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error deleting story:', err);
      setError('Failed to delete story. Please try again.');
    }
  };

  // Toggle featured status
  const toggleFeatured = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`${api.Url}/story/${id}/toggle-featured`);
      
      if (response.data.success) {
        setSuccess(`Story ${currentStatus ? 'removed from' : 'marked as'} featured!`);
        fetchStories();
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error toggling featured:', err);
      setError('Failed to update featured status.');
    }
  };

  // Toggle trending status
  const toggleTrending = async (id, currentStatus) => {
    try {
      const response = await axios.patch(`${api.Url}/story/${id}/toggle-trending`);
      
      if (response.data.success) {
        setSuccess(`Story ${currentStatus ? 'removed from' : 'marked as'} trending!`);
        fetchStories();
        
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      console.error('Error toggling trending:', err);
      setError('Failed to update trending status.');
    }
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get status badge
  const getStatusBadge = (story) => {
    if (story.featured && story.trending) {
      return <span className="status-badge featured-trending">⭐🔥 Both</span>;
    } else if (story.featured) {
      return <span className="status-badge featured">⭐ Featured</span>;
    } else if (story.trending) {
      return <span className="status-badge trending">🔥 Trending</span>;
    }
    return <span className="status-badge normal">Normal</span>;
  };

  return (
    <div className="admin-stories-container">
      {/* Header */}
      <div className="admin-stories-header">
        <div className="header-content">
          <h1>Manage Stories</h1>
          <p>Total: {totalStories} stories</p>
        </div>
        <div className="header-actions">
          <Link href="/admin/create-story" className="btn-create">
            <FaPlus /> Create New Story
          </Link>
        </div>
      </div>

      {/* Messages */}
      {success && (
        <div className="success-message">
          <span className="success-icon">✓</span>
          {success}
        </div>
      )}
      
      {error && (
        <div className="error-message">
          <span className="error-icon">✗</span>
          {error}
        </div>
      )}

      {/* Filters Section */}
      <div className="filters-section">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search stories by title, character, or city..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <button type="submit" className="search-btn">
              Search
            </button>
          </div>
        </form>

        <div className="filter-controls">
          <div className="filter-group">
            <label>
              <FaTag /> Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="filter-select"
            >
              {categories.map(category => (
                <option key={category} value={category === 'All Categories' ? '' : category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaCity /> City
            </label>
            <select
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
              className="filter-select"
            >
              {cities.map(city => (
                <option key={city} value={city === 'All Cities' ? '' : city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaStar /> Featured
            </label>
            <select
              value={filters.featured}
              onChange={(e) => handleFilterChange('featured', e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="true">Featured Only</option>
              <option value="false">Not Featured</option>
            </select>
          </div>

          <div className="filter-group">
            <label>
              <FaFire /> Trending
            </label>
            <select
              value={filters.trending}
              onChange={(e) => handleFilterChange('trending', e.target.value)}
              className="filter-select"
            >
              <option value="">All</option>
              <option value="true">Trending Only</option>
              <option value="false">Not Trending</option>
            </select>
          </div>

          <button onClick={clearFilters} className="clear-filters-btn">
            Clear Filters
          </button>
        </div>
      </div>

      {/* Stories Table */}
      <div className="stories-table-container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading stories...</p>
          </div>
        ) : stories.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h3>No stories found</h3>
            <p>Try adjusting your filters or create a new story</p>
            <Link href="/admin/create-story" className="btn-create-empty">
              <FaPlus /> Create Your First Story
            </Link>
          </div>
        ) : (
          <>
            <div className="table-responsive">
              <table className="stories-table">
                <thead>
                  <tr>
                    <th>Story</th>
                    <th>Character</th>
                    <th>Category</th>
                    <th>City</th>
                    <th>Status</th>
                    <th>Reads</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {stories.map((story) => (
                    <tr key={story._id || story.id}>
                      <td>
                        <div className="story-info">
                          <div className="story-cover">
                            <img 
                              src={story.backgroundImage || '/api/placeholder/400/300'} 
                              alt={story.title}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/400/300';
                              }}
                            />
                          </div>
                          <div className="story-details">
                            <h4 className="story-title">{story.title}</h4>
                            <p className="story-excerpt">{story.excerpt?.substring(0, 80)}...</p>
                            <div className="story-meta">
                              <span className="meta-item">
                                <FaCalendar /> {formatDate(story.createdAt)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="character-info">
                          <div className="character-avatar">
                            <img 
                              src={story.characterAvatar || '/api/placeholder/100/100'} 
                              alt={story.characterName}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/100/100';
                              }}
                            />
                          </div>
                          <div>
                            <strong>{story.characterName}</strong>
                            <p className="character-age">{story.characterAge} years</p>
                            <p className="character-occupation">{story.characterOccupation}</p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="category-badge">
                          {story.category}
                        </span>
                      </td>
                      <td>
                        <span className="city-badge">
                          <FaCity /> {story.city}
                        </span>
                      </td>
                      <td>
                        {getStatusBadge(story)}
                        <div className="status-controls">
                          <button
                            onClick={() => toggleFeatured(story._id || story.id, story.featured)}
                            className={`status-btn ${story.featured ? 'active' : ''}`}
                            title={story.featured ? 'Remove from featured' : 'Mark as featured'}
                          >
                            <FaStar /> {story.featured ? 'Remove' : 'Feature'}
                          </button>
                          <button
                            onClick={() => toggleTrending(story._id || story.id, story.trending)}
                            className={`status-btn ${story.trending ? 'active' : ''}`}
                            title={story.trending ? 'Remove from trending' : 'Mark as trending'}
                          >
                            <FaFire /> {story.trending ? 'Remove' : 'Trend'}
                          </button>
                        </div>
                      </td>
                      <td>
                        <div className="reads-count">
                          <FaReads />
                          <span>{story.readCount?.toLocaleString() || 0}</span>
                        </div>
                      </td>
                      <td>
                        <div className="date-cell">
                          {formatDate(story.createdAt)}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <Link 
                            href={`/stories/edit/${story._id || story.id}`}
                            className="action-btn edit-btn"
                            title="Edit Story"
                          >
                            <FaEdit />
                          </Link>
                          <Link 
                            href={`/hot-stories/${story.slug || story.id}`}
                            target="_blank"
                            className="action-btn view-btn"
                            title="View Live"
                          >
                            <FaEye />
                          </Link>
                          <button
                            onClick={() => handleDeleteStory(story._id || story.id, story.title)}
                            className="action-btn delete-btn"
                            title="Delete Story"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                >
                  Previous
                </button>
                
                <div className="page-numbers">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`page-btn ${currentPage === pageNum ? 'active' : ''}`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && currentPage < totalPages - 2 && (
                    <>
                      <span className="page-dots">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`page-btn ${currentPage === totalPages ? 'active' : ''}`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                >
                  Next
                </button>
                
                <div className="page-info">
                  Page {currentPage} of {totalPages}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats Summary */}
      <div className="stats-summary">
        <div className="stat-card">
          <div className="stat-icon total">
            <span>📚</span>
          </div>
          <div className="stat-content">
            <h3>Total Stories</h3>
            <p className="stat-number">{totalStories}</p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon featured">
            <FaStar />
          </div>
          <div className="stat-content">
            <h3>Featured</h3>
            <p className="stat-number">
              {stories.filter(s => s.featured).length}
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon trending">
            <FaFire />
          </div>
          <div className="stat-content">
            <h3>Trending</h3>
            <p className="stat-number">
              {stories.filter(s => s.trending).length}
            </p>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon reads">
            <FaReads />
          </div>
          <div className="stat-content">
            <h3>Total Reads</h3>
            <p className="stat-number">
              {stories.reduce((sum, story) => sum + (story.readCount || 0), 0).toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoriesAdmin;