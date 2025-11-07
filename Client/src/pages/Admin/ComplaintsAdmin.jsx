'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import "./ComplaintsAdmin.css";
import { 
  FaTicketAlt, 
  FaTrash, 
  FaEdit, 
  FaSearch, 
  FaFilter, 
  FaCheckCircle, 
  FaTimesCircle,
  FaSync,
  FaDownload,
  FaChartBar,
  FaExclamationTriangle
} from "react-icons/fa";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
  XAxis,
  YAxis,
  CartesianGrid
} from "recharts";
import api from "../../config/api";
import axios from "axios";

const ComplaintsAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editTicket, setEditTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const ticketsPerPage = 6;

  // Memoized colors for charts
  const colors = useMemo(() => [
    "#0071e3", "#ff3b30", "#30d158", "#ff9500", "#7b61ff", 
    "#5856d6", "#af52de", "#ff2d55", "#32d74b", "#ffcc00"
  ], []);

  // Server-safe token access
  const getToken = useCallback(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
    return "";
  }, []);

  // Data fetching
  const fetchTickets = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setTickets(response.data.data || []);
    } catch (error) {
      console.error("Error fetching tickets:", error);
      setTickets([]);
    }
  }, [getToken]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try {
      await fetchTickets();
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  }, [fetchTickets]);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Statistics
  const stats = useMemo(() => {
    const totalCount = tickets.length;
    const pendingCount = tickets.filter(ticket => ticket.status === "Pending").length;
    const resolvedCount = tickets.filter(ticket => ticket.status === "Resolved").length;
    
    return {
      totalCount,
      pendingCount,
      resolvedCount,
      resolutionRate: totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0
    };
  }, [tickets]);

  // Chart data
  const statusChartData = useMemo(() => [
    { name: "Pending", value: stats.pendingCount, color: colors[1] },
    { name: "Resolved", value: stats.resolvedCount, color: colors[2] }
  ], [stats.pendingCount, stats.resolvedCount, colors]);

  const dailyTicketsData = useMemo(() => {
    const dailyCounts = tickets.reduce((acc, ticket) => {
      const date = new Date(ticket.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(dailyCounts)
      .slice(-7)
      .map(([date, count]) => ({
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        tickets: count
      }));
  }, [tickets]);

  // Filter tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const userName = ticket.user && typeof ticket.user === "object" ? ticket.user.name : ticket.user || "Unknown";
      const userEmail = ticket.user && typeof ticket.user === "object" ? ticket.user.email : "N/A";
      
      const matchesSearch =
        ticket.issue?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        userEmail.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
      
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, filterStatus]);

  // Pagination
  const paginatedTickets = useMemo(() => {
    const indexOfLastTicket = currentPage * ticketsPerPage;
    const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
    return filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  }, [filteredTickets, currentPage, ticketsPerPage]);

  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  // Handlers
  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this complaint?");
    if (confirmDelete) {
      try {
        const token = getToken();
        await axios.delete(`${api.Url}/admin/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(tickets.filter((ticket) => ticket._id !== id));
      } catch (error) {
        console.error("Error deleting complaint:", error);
        alert("Failed to delete complaint.");
      }
    }
  };

  const handleEdit = (ticket) => {
    setEditTicket({ 
      ...ticket, 
      user: ticket.user && typeof ticket.user === "object" ? ticket.user._id : ticket.user 
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await axios.put(
        `${api.Url}/admin/tickets/${editTicket._id}`,
        editTicket,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTickets(tickets.map((t) =>
        t._id === editTicket._id ? response.data.data : t
      ));
      setEditTicket(null);
    } catch (error) {
      console.error("Error updating complaint:", error);
      alert("Failed to update complaint.");
    }
  };

  const handleToggleStatus = async (ticket) => {
    const newStatus = ticket.status === "Pending" ? "Resolved" : "Pending";
    const updateData = {
      user: ticket.user && typeof ticket.user === "object" ? ticket.user._id : ticket.user,
      issue: ticket.issue,
      status: newStatus,
      date: ticket.date
    };

    try {
      const token = getToken();
      const response = await axios.put(
        `${api.Url}/admin/tickets/${ticket._id}`,
        updateData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setTickets(tickets.map((t) =>
        t._id === ticket._id ? response.data.data : t
      ));
    } catch (error) {
      console.error("Error toggling complaint status:", error);
      alert("Failed to update complaint status.");
    }
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(tickets, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'complaints-data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p key={`tooltip-${index}`} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading state
  if (loading) {
    return (
      <div className="cmp-loading">
        <div className="loading-spinner"></div>
        <p>Loading complaints...</p>
      </div>
    );
  }

  return (
    <div className="cmp-container">
      {/* Header Section */}
      <div className="cmp-header">
        <div className="cmp-header-content">
          <h2 className="cmp-title">Complaints Management</h2>
          <p className="cmp-subtitle">Manage and resolve user complaints efficiently</p>
        </div>
        <div className="cmp-header-actions">
          <button 
            className={`cmp-action-button cmp-refresh ${refreshing ? 'refreshing' : ''}`}
            onClick={fetchAllData}
            disabled={refreshing}
          >
            <FaSync /> {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
          <button className="cmp-action-button cmp-export" onClick={handleExportData}>
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {/* Statistics Overview */}
      <div className="cmp-stats-overview">
        <div className="cmp-stat-card">
          <div className="stat-icon-wrapper total">
            <FaTicketAlt className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Total Complaints</h3>
            <p className="stat-value">{stats.totalCount}</p>
          </div>
        </div>
        <div className="cmp-stat-card">
          <div className="stat-icon-wrapper pending">
            <FaExclamationTriangle className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Pending</h3>
            <p className="stat-value">{stats.pendingCount}</p>
          </div>
        </div>
        <div className="cmp-stat-card">
          <div className="stat-icon-wrapper resolved">
            <FaCheckCircle className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Resolved</h3>
            <p className="stat-value">{stats.resolvedCount}</p>
          </div>
        </div>
        <div className="cmp-stat-card">
          <div className="stat-icon-wrapper rate">
            <FaChartBar className="stat-icon" />
          </div>
          <div className="stat-content">
            <h3>Resolution Rate</h3>
            <p className="stat-value">{stats.resolutionRate.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="cmp-charts-section">
        <div className="cmp-chart-card">
          <div className="chart-header">
            <FaChartBar className="chart-icon" />
            <h3>Complaint Status</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={statusChartData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
              >
                {statusChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="cmp-chart-card">
          <div className="chart-header">
            <FaChartBar className="chart-icon" />
            <h3>Daily Complaints (Last 7 Days)</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={dailyTicketsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-light)" />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <YAxis 
                tick={{ fill: 'var(--text-secondary)' }}
                tickLine={{ stroke: 'var(--border-light)' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="tickets" 
                fill="#0071e3" 
                name="Complaints"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Filters Section */}
      <div className="cmp-filters-section">
        <div className="cmp-search-container">
          <FaSearch className="cmp-search-icon" />
          <input
            type="text"
            placeholder="Search complaints by issue, user name, or email..."
            className="cmp-search-input"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="cmp-filter-group">
          <select
            className="cmp-filter-select"
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Tickets Section */}
      <div className="cmp-content-section">
        <div className="cmp-section-header">
          <h3>Complaints ({filteredTickets.length})</h3>
          <span className="cmp-results-count">
            Showing {paginatedTickets.length} of {filteredTickets.length} complaints
          </span>
        </div>

        {filteredTickets.length === 0 ? (
          <div className="cmp-empty-state">
            <FaTicketAlt className="empty-icon" />
            <h3>No Complaints Found</h3>
            <p>Try adjusting your search or filters</p>
          </div>
        ) : (
          <>
            <div className="cmp-tickets-grid">
              {paginatedTickets.map((ticket) => (
                <div key={ticket._id} className="cmp-ticket-card">
                  <div className="cmp-ticket-header">
                    <div className="cmp-ticket-meta">
                      <span className="cmp-ticket-date">
                        {new Date(ticket.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      <span className={`cmp-status ${ticket.status.toLowerCase()}`}>
                        {ticket.status}
                      </span>
                    </div>
                  </div>

                  <div className="cmp-ticket-content">
                    <h4 className="cmp-ticket-issue">{ticket.issue}</h4>
                    
                    <div className="cmp-user-info">
                      <div className="cmp-user-detail">
                        <span className="detail-label">User:</span>
                        <span className="detail-value">
                          {ticket.user && typeof ticket.user === "object" ? ticket.user.name : ticket.user || "Unknown"}
                        </span>
                      </div>
                      <div className="cmp-user-detail">
                        <span className="detail-label">Email:</span>
                        <span className="detail-value">
                          {ticket.user && typeof ticket.user === "object" ? ticket.user.email : "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="cmp-ticket-actions">
                    <button
                      className="cmp-action-button cmp-toggle"
                      onClick={() => handleToggleStatus(ticket)}
                      title={ticket.status === "Pending" ? "Mark as Resolved" : "Mark as Pending"}
                    >
                      {ticket.status === "Pending" ? <FaCheckCircle /> : <FaTimesCircle />}
                      {ticket.status === "Pending" ? " Resolve" : " Reopen"}
                    </button>
                    <button
                      className="cmp-action-button cmp-edit"
                      onClick={() => handleEdit(ticket)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="cmp-action-button cmp-delete"
                      onClick={() => handleDelete(ticket._id)}
                    >
                      <FaTrash /> Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="cmp-pagination">
                <button
                  className="cmp-pagination-button"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                <div className="cmp-pagination-pages">
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
                        className={`cmp-pagination-button ${currentPage === pageNum ? 'active' : ''}`}
                        onClick={() => setCurrentPage(pageNum)}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  className="cmp-pagination-button"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Edit Modal */}
      {editTicket && (
        <div className="cmp-modal">
          <div className="cmp-modal-content">
            <div className="cmp-modal-header">
              <h3>Edit Complaint</h3>
              <button 
                className="cmp-modal-close"
                onClick={() => setEditTicket(null)}
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="cmp-modal-form">
              <div className="form-group">
                <label>Issue Description</label>
                <textarea
                  value={editTicket.issue}
                  onChange={(e) => setEditTicket({ ...editTicket, issue: e.target.value })}
                  rows="4"
                  required
                  placeholder="Describe the issue..."
                />
              </div>

              <div className="form-group">
                <label>Status</label>
                <select
                  value={editTicket.status}
                  onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })}
                  required
                >
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="form-group">
                <label>User ID</label>
                <input
                  type="text"
                  value={editTicket.user && typeof editTicket.user === "object" ? editTicket.user._id : editTicket.user}
                  disabled
                  className="disabled-input"
                />
              </div>

              <div className="cmp-modal-actions">
                <button type="submit" className="cmp-action-button cmp-save">
                  Save Changes
                </button>
                <button
                  type="button"
                  className="cmp-action-button cmp-cancel"
                  onClick={() => setEditTicket(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComplaintsAdmin;