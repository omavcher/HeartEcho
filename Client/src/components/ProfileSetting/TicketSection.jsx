'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../config/api";
import PopNoti from "../PopNoti";
import "../styles/TicketSection.css";

function TicketSection({ onBackSBTNSelect }) {
  const [issue, setIssue] = useState("");
  const [tickets, setTickets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  useEffect(() => {
    // Client-side only code
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    if (!token) return;
    
    axios
      .get(`${api.Url}/user/get-tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setTickets(Array.isArray(response.data) ? response.data : []);
      })
      .catch((error) => {
        setNotification({
          show: true,
          message: "Error fetching tickets. Try again!",
          type: "error",
        });
        setTickets([]);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issue.trim()) return;

    setIsSubmitting(true);

    const newTicket = {
      issue: issue.trim(),
      status: "Pending",
      date: new Date().toISOString(),
    };

    try {
      const response = await axios.post(`${api.Url}/user/make-ticket`, newTicket, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setTickets([response.data, ...tickets]);
      setNotification({
        show: true,
        message: "Ticket submitted successfully!",
        type: "success",
      });
      setIssue("");
    } catch (error) {
      setNotification({
        show: true,
        message: "Error submitting ticket. Try again!",
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <header className="profile-setting-header3">
        <h2>Submit a Ticket</h2>
        <button onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="ticket-container">
        <h2>Previous Tickets</h2>

        {isLoading ? (
          <div className="ticket-skeleton-container">
            {[...Array(3)].map((_, index) => (
              <div key={index} className="ticket-skeleton">
                <div className="skeleton-line skeleton-id"></div>
                <div className="skeleton-line skeleton-issue"></div>
                <div className="skeleton-line skeleton-status"></div>
                <div className="skeleton-line skeleton-date"></div>
              </div>
            ))}
          </div>
        ) : tickets.length > 0 ? (
          <div className="previous-tickets">
            <div className="ticket-list">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="ticket-card">
                  <p><strong>Ticket ID:</strong> {ticket._id}</p>
                  <p><strong>Issue:</strong> {ticket.issue}</p>
                  <p className={`status ${ticket.status === "Pending" ? "tstatus-yellow" : "tstatus-green"}`}>
                    <strong>Status:</strong> {ticket.status}
                  </p>
                  <p className="date-tickes">
                    {ticket.date ? new Date(ticket.date).toLocaleString() : "Date not available"}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="no-tickets">No previous tickets found.</p>
        )}

        <form onSubmit={handleSubmit} className="ticket-form-ticket-sectd">
          <label className="label">Describe your issue:</label>
          <textarea
            value={issue}
            onChange={(e) => setIssue(e.target.value)}
            className="textarea-ticket-sectd"
            placeholder="Enter your complaint or issue..."
            rows="4"
            required
          ></textarea>

          <button style={{marginTop:'1rem'}} type="submit" className="otp-btn-singr" disabled={isSubmitting}>
            {isSubmitting ? <span className="loader-signin"></span> : "Submit"}
          </button>
        </form>
      </div>
    </>
  );
}

export default TicketSection;