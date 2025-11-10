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

  const getStatusVariant = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'status-resolved-wffinf';
      case 'in progress':
        return 'status-progress-wffinf';
      case 'pending':
        return 'status-pending-wffinf';
      default:
        return 'status-pending-wffinf';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Date not available";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateId = (id) => {
    if (!id) return 'N/A';
    return id.length > 8 ? `${id.substring(0, 8)}...` : id;
  };

  return (
    <>
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      <header className="profile-setting-header3-wffinf">
        <h2 className="ticket-header-title-wffinf">Support Tickets</h2>
        <button className="back-button-wffinf" onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon-wffinf">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="ticket-container-wffinf">
        {/* Hero Section */}
        <div className="ticket-hero-wffinf">
          <div className="ticket-hero-icon-wffinf">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21 3C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H21ZM20 5H4V19H20V5ZM18 7V9H6V7H18ZM18 11V13H6V11H18ZM6 15H12V17H6V15Z"/>
            </svg>
          </div>
          <h1 className="ticket-hero-title-wffinf">Support Center</h1>
          <p className="ticket-hero-subtitle-wffinf">
            Submit a ticket and track your support requests
          </p>
        </div>

        {/* Previous Tickets Section */}
        <section className="tickets-section-wffinf">
          <div className="section-header-wffinf">
            <h2 className="section-title-wffinf">Your Support Tickets</h2>
            <div className="ticket-count-wffinf">
              {tickets.length} ticket{tickets.length !== 1 ? 's' : ''}
            </div>
          </div>

          {isLoading ? (
            <div className="ticket-skeleton-container-wffinf">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="ticket-skeleton-wffinf">
                  <div className="skeleton-header-wffinf">
                    <div className="skeleton-id-wffinf"></div>
                    <div className="skeleton-status-wffinf"></div>
                  </div>
                  <div className="skeleton-issue-wffinf"></div>
                  <div className="skeleton-date-wffinf"></div>
                </div>
              ))}
            </div>
          ) : tickets.length > 0 ? (
            <div className="ticket-list-wffinf">
              {tickets.map((ticket) => (
                <div key={ticket._id} className="ticket-card-wffinf">
                  <div className="ticket-header-wffinf">
                    <div className="ticket-id-wffinf">
                      <span className="ticket-id-label-wffinf">Ticket ID:</span>
                      <span className="ticket-id-value-wffinf">{truncateId(ticket._id)}</span>
                    </div>
                    <div className={`ticket-status-wffinf ${getStatusVariant(ticket.status)}`}>
                      {ticket.status || 'Pending'}
                    </div>
                  </div>
                  
                  <div className="ticket-issue-wffinf">
                    <p>{ticket.issue}</p>
                  </div>
                  
                  <div className="ticket-footer-wffinf">
                    <div className="ticket-date-wffinf">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="date-icon-wffinf">
                        <path d="M9 1V3H15V1H17V3H21C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H7V1H9ZM20 11H4V19H20V11ZM7 5H5V7H7V5ZM19 5H17V7H19V5Z"/>
                      </svg>
                      {formatDate(ticket.date)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-tickets-wffinf">
              <div className="no-tickets-icon-wffinf">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 3C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H21ZM20 5H4V19H20V5ZM18 7V9H6V7H18ZM18 11V13H6V11H18ZM6 15H12V17H6V15Z"/>
                </svg>
              </div>
              <h3>No tickets yet</h3>
              <p>Submit your first support ticket below</p>
            </div>
          )}
        </section>

        {/* Submit Ticket Form */}
        <section className="submit-ticket-section-wffinf">
          <div className="section-header-wffinf">
            <h2 className="section-title-wffinf">Submit New Ticket</h2>
            <p className="section-subtitle-wffinf">
              Describe your issue in detail for faster resolution
            </p>
          </div>

          <form onSubmit={handleSubmit} className="ticket-form-wffinf">
            <div className="form-group-wffinf">
              <label className="form-label-wffinf">
                Describe Your Issue
                <span className="required-asterisk-wffinf">*</span>
              </label>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                className="ticket-textarea-wffinf"
                placeholder="Please provide detailed information about your issue, including any error messages, steps to reproduce, and what you were trying to accomplish..."
                rows="6"
                required
                maxLength={1000}
              ></textarea>
              <div className="textarea-footer-wffinf">
                <span className="char-count-wffinf">{issue.length}/1000</span>
                <span className="char-hint-wffinf">Be specific for better help</span>
              </div>
            </div>

            <button 
              type="submit" 
              className="submit-ticket-button-wffinf" 
              disabled={isSubmitting || !issue.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="button-loader-wffinf"></span>
                  Submitting...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="button-icon-wffinf">
                    <path d="M3 13.0001H9V11.0001H3V1.8457C3 1.56956 3.22386 1.3457 3.5 1.3457C3.57574 1.3457 3.65068 1.36699 3.71683 1.4076L22.2168 11.562C22.3567 11.6473 22.4357 11.8032 22.4224 11.9674C22.4091 12.1316 22.3057 12.2743 22.1523 12.3367L3.65228 20.3367C3.45884 20.4167 3.23717 20.3525 3.11612 20.1834C3.04682 20.0844 3.01648 19.9629 3.0314 19.8424L3.98409 14.0001H3V13.0001Z"/>
                  </svg>
                  Submit Ticket
                </>
              )}
            </button>
          </form>
        </section>
      </div>
    </>
  );
}

export default TicketSection;