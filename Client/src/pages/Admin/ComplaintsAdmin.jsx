import React, { useState, useEffect } from "react";
import "./ComplaintsAdmin.css"; // Import local CSS
import { FaTicketAlt, FaTrash, FaEdit, FaSearch, FaFilter, FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const ComplaintsAdmin = () => {
  // Sample data based on TicketSchema
  const sampleTickets = [
    {
      _id: "1",
      user: "user1", // Simulated user ID (replace with actual User reference in real app)
      issue: "App crashing on login",
      date: new Date("2025-02-15"),
      status: "Pending",
    },
    {
      _id: "2",
      user: "user2",
      issue: "Payment not reflecting",
      date: new Date("2025-02-20"),
      status: "Resolved",
    },
    {
      _id: "3",
      user: "user3",
      issue: "Feature request for dark mode",
      date: new Date("2025-02-25"),
      status: "Pending",
    },
    {
      _id: "4",
      user: "user4",
      issue: "Chatbot unresponsive",
      date: new Date("2025-03-01"),
      status: "Resolved",
    },
    {
      _id: "5",
      user: "user5",
      issue: "Account access issue",
      date: new Date("2025-03-02"),
      status: "Pending",
    },
  ];

  const [tickets, setTickets] = useState(sampleTickets);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // Filter by status
  const [currentPage, setCurrentPage] = useState(1);
  const ticketsPerPage = 3;

  // Filter tickets based on search and status
  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.issue.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ticket.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      filterStatus === "all" || ticket.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Pagination logic
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  // Handle ticket actions (simulated for now)
  const handleDelete = (id) => {
    setTickets(tickets.filter((ticket) => ticket._id !== id));
    alert(`Complaint with ID ${id} deleted successfully!`);
  };

  const handleEdit = (ticket) => {
    alert(`Edit complaint: ${ticket.issue} (ID: ${ticket._id})`);
    // Add your edit logic here (e.g., open a modal or form)
  };

  const handleToggleStatus = (ticket) => {
    const newStatus = ticket.status === "Pending" ? "Resolved" : "Pending";
    setTickets(
      tickets.map((t) =>
        t._id === ticket._id ? { ...t, status: newStatus } : t
      )
    );
    alert(`Complaint ${ticket.issue} status updated to ${newStatus}!`);
  };

  // Simulate real-time updates (optional, can be removed or replaced with API calls)
  useEffect(() => {
    const interval = setInterval(() => {
      setTickets((prevTickets) =>
        prevTickets.map((ticket) => ({
          ...ticket,
          date: new Date(ticket.date.getTime() + 1000 * 60 * 60), // Simulate time progression (1 hour per update)
        }))
      );
    }, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

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
          <div className="cmp-tickets-grid">
            {currentTickets.map((ticket) => (
              <div key={ticket._id} className="cmp-ticket-card">
                <div className="cmp-ticket-content">
                  <h3>{ticket.issue}</h3>
                  <p>User: {ticket.user}</p>
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

          {/* Pagination */}
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
        </div>
      </div>
    </div>
  );
};

export default ComplaintsAdmin;