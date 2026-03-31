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

  const getStatusVariantBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'resolved':
        return 'ios-badge-green';
      case 'in progress':
        return 'ios-badge-blue';
      case 'pending':
        return 'ios-badge-orange';
      default:
        return 'ios-badge-gray';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
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
      
      <header className="profile-setting-header3">
        <h2 className="ios-header-title">Support Tickets</h2>
        <button className="ios-back-btn" onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="ios-settings-container">
        
        {/* Support Center Hero */}
        <div className="ios-profile-hero" style={{marginBottom: '1rem'}}>
          <div className="ios-icon-box" style={{ width: '60px', height: '60px', borderRadius: '16px', background: 'var(--ios-theme-accent)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width: '32px', height: '32px'}}>
              <path d="M21 3C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H21ZM20 5H4V19H20V5ZM18 7V9H6V7H18ZM18 11V13H6V11H18ZM6 15H12V17H6V15Z"/>
            </svg>
          </div>
          <p className="ios-profile-email">Support Center</p>
        </div>

        {/* Submit Ticket Form */}
        <div className="ios-settings-group">
          <h3 className="ios-group-title">SUBMIT NEW TICKET</h3>
          <div className="ios-list">
             <div className="ios-list-item ios-ticket-compose">
                <textarea
                  className="ios-textarea"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Please describe your issue in detail..."
                  rows="4"
                  maxLength={1000}
                ></textarea>
             </div>
          </div>
          <p className="ios-group-footer" style={{display: 'flex', justifyContent: 'space-between'}}>
            <span>We usually reply within 24 hours.</span>
            <span>{issue.length}/1000</span>
          </p>
        </div>

        <div className="ios-submit-container">
          <button 
            className="ios-primary-btn" 
            onClick={handleSubmit}
            disabled={isSubmitting || !issue.trim()}
          >
            {isSubmitting ? <span className="ios-spinner ios-spinner-white"></span> : "Submit Ticket"}
          </button>
        </div>

        {/* Previous Tickets */}
        <div className="ios-settings-group">
          <h3 className="ios-group-title">YOUR TICKETS</h3>
          <div className="ios-list">
            {isLoading ? (
               <div className="ios-list-item"><span className="ios-item-title" style={{color: 'var(--ios-text-secondary)'}}>Loading...</span></div>
            ) : tickets.length > 0 ? (
               tickets.map((ticket) => (
                 <div key={ticket._id} className="ios-list-item ios-ticket-row">
                    <div className="ios-item-left" style={{alignItems: 'flex-start'}}>
                       <div className={`ios-status-dot ${getStatusVariantBadge(ticket.status)}`}></div>
                       <div className="ios-item-stack">
                         <span className="ios-item-title ios-ticket-text">{ticket.issue}</span>
                         <span className="ios-item-subtitle" style={{fontSize: '0.85rem', color: 'var(--ios-text-secondary)'}}>ID: {truncateId(ticket._id)}</span>
                       </div>
                    </div>
                    <div className="ios-item-right ios-vertical-right">
                       <span className={`ios-badge ${getStatusVariantBadge(ticket.status)}`}>{ticket.status || 'Pending'}</span>
                       <span className="ios-item-subtitle" style={{fontSize: '0.75rem', marginTop: '4px', textAlign: 'right'}}>{formatDate(ticket.date)}</span>
                    </div>
                 </div>
               ))
            ) : (
               <div className="ios-list-item">
                 <span className="ios-item-title" style={{color: 'var(--ios-text-secondary)'}}>No support tickets found.</span>
               </div>
            )}
          </div>
        </div>

      </div>
    </>
  );
}

export default TicketSection;