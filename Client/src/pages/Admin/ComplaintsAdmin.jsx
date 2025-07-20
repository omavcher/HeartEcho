'use client'; // Required for client-side features

import { useState, useEffect } from "react";
import "./ComplaintsAdmin.css";
import { FaTicketAlt, FaTrash, FaEdit, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import api from "../../config/api";
import axios from "axios";

const ComplaintsAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editTicket, setEditTicket] = useState(null);
  const ticketsPerPage = 3;

  // Server-safe token access
  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem("token") || "";
    }
    return "";
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets(response.data.data);
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const userName = ticket.user && typeof ticket.user === "object" ? ticket.user.name : ticket.user || "Unknown";
    const matchesSearch =
      ticket.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      userName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const handleDelete = async (id) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this complaint?");
    if (confirmDelete) {
      try {
        const token = getToken();
        await axios.delete(`${api.Url}/admin/tickets/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTickets(tickets.filter((ticket) => ticket._id !== id));
        alert("Complaint deleted successfully!");
      } catch (error) {
        console.error("Error deleting complaint:", error);
        alert("Failed to delete complaint.");
      }
    }
  };

  const handleEdit = (ticket) => {
    setEditTicket({ ...ticket, user: ticket.user._id || ticket.user });
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
      alert("Complaint updated successfully!");
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
      date: ticket.date // Include date to avoid losing it
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
      alert(`Complaint status updated to ${newStatus}!`);
    } catch (error) {
      console.error("Error toggling complaint status:", error.response ? error.response.data : error.message);
      alert(`Failed to update complaint status: ${error.response ? error.response.data.message : "Unknown error"}`);
    }
  };

  return (
    <div className="cmp-container">
      <div className="cmp-header">
        <h2 className="cmp-title">Complaints Administration</h2>
        <div className="cmp-header-actions">
          <div className="cmp-search-container">
            <FaSearch className="cmp-search-icon" />
            <input
              type="text"
              placeholder="Search complaints..."
              className="cmp-search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
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

      <div className="cmp-content-grid">
        <div className="cmp-tickets-section">
          {filteredTickets.length === 0 ? (
            <div className="cmp-no-tickets">
              <FaTicketAlt className="cmp-no-tickets-icon" />
              <p>No complaints found matching your criteria</p>
            </div>
          ) : (
            <>
              <div className="cmp-tickets-grid">
                {currentTickets.map((ticket) => (
                  <div key={ticket._id} className="cmp-ticket-card">
                    <div className="cmp-ticket-content">
                      <h3>{ticket.issue}</h3>
                      <p>
                        User: {ticket.user && typeof ticket.user === "object" ? ticket.user.name : ticket.user || "Unknown"} 
                        ({ticket.user && typeof ticket.user === "object" ? ticket.user.email : "N/A"})
                      </p>
                      <p>Date: {new Date(ticket.date).toLocaleString()}</p>
                      <p>
                        Status:
                        <span className={`cmp-status ${ticket.status.toLowerCase()}`}>
                          {ticket.status}
                        </span>
                      </p>
                      <div className="cmp-ticket-actions">
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
                        <button
                          className="cmp-action-button cmp-toggle"
                          onClick={() => handleToggleStatus(ticket)}
                        >
                          {ticket.status === "Pending" ? <FaCheckCircle /> : <FaTimesCircle />}
                          {ticket.status === "Pending" ? " Resolve" : " Unresolve"}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cmp-pagination">
                <button
                  className="cmp-pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i + 1}
                    className={`cmp-pagination-button ${currentPage === i + 1 ? "cmp-active" : ""}`}
                    onClick={() => setCurrentPage(i + 1)}
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  className="cmp-pagination-button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {editTicket && (
        <div className="cmp-modal">
          <div className="cmp-modal-content">
            <h3>Edit Complaint: {editTicket.issue}</h3>
            <form onSubmit={handleEditSubmit}>
              <label>Issue:</label>
              <textarea
                value={editTicket.issue}
                onChange={(e) => setEditTicket({ ...editTicket, issue: e.target.value })}
                rows="3"
                required
              />
              <label>User ID:</label>
              <input
                type="text"
                value={editTicket.user && typeof editTicket.user === "object" ? editTicket.user._id : editTicket.user}
                disabled
              />
              <label>Status:</label>
              <select
                value={editTicket.status}
                onChange={(e) => setEditTicket({ ...editTicket, status: e.target.value })}
                required
              >
                <option value="Pending">Pending</option>
                <option value="Resolved">Resolved</option>
              </select>
              <div className="cmp-modal-buttons">
                <button type="submit" className="cmp-action-button cmp-save">Save Changes</button>
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