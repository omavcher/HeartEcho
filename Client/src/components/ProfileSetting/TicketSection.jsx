'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../config/api";
import PopNoti from "../PopNoti";
import FaqSection from "./FaqSection";
import LiveChatSection from "./LiveChatSection";
import "../styles/TicketSection.css";

const CATEGORIES = [
  { value: "billing",   label: "Billing & Subscription" },
  { value: "technical", label: "Technical Issue" },
  { value: "account",   label: "Account Access" },
  { value: "other",     label: "General Inquiry" },
];

function TicketSection({ onBackSBTNSelect }) {
  const [issue, setIssue]             = useState("");
  const [tickets, setTickets]         = useState([]);
  const [category, setCategory]       = useState("billing");
  const [isLoading, setIsLoading]     = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken]             = useState(null);
  const [activeTab, setActiveTab]     = useState("tickets");
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    if (!token) return;
    axios
      .get(`${api.Url}/user/get-tickets`, { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => setTickets(Array.isArray(res.data) ? res.data : []))
      .catch(() => {
        setNotification({ show: true, message: "Could not load tickets.", type: "error" });
        setTickets([]);
      })
      .finally(() => setIsLoading(false));
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!issue.trim()) return;
    setIsSubmitting(true);
    const newTicket = {
      issue: `[${category.toUpperCase()}] ${issue.trim()}`,
      status: "Pending",
      date: new Date().toISOString(),
    };
    try {
      const res = await axios.post(`${api.Url}/user/make-ticket`, newTicket, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTickets([res.data, ...tickets]);
      setNotification({ show: true, message: "Ticket submitted! We'll respond within 24h.", type: "success" });
      setIssue("");
    } catch {
      setNotification({ show: true, message: "Failed to submit ticket. Try again.", type: "error" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case "resolved":    return { dot: "he-dot-green",  badge: "he-badge-green" };
      case "in progress": return { dot: "he-dot-blue",   badge: "he-badge-blue" };
      case "pending":     return { dot: "he-dot-orange", badge: "he-badge-orange" };
      default:            return { dot: "he-dot-gray",   badge: "he-badge-gray" };
    }
  };

  const formatDate = (d) => {
    if (!d) return "";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  };

  const truncateId = (id) => (id?.length > 8 ? `#${id.substring(0, 8)}` : `#${id || "---"}`);

  const headerTitle = activeTab === "faq" ? "Help Center FAQ" : activeTab === "chat" ? "Live Chat Support" : "Support Tickets";

  return (
    <>
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <header className="profile-setting-header3">
        <h2 className="ios-header-title">{headerTitle}</h2>
        <button className="ios-back-btn" onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z" />
          </svg>
        </button>
      </header>

      <div className="ios-settings-container">

        {/* ─── Tab Switcher ─── */}
        <div className="ios-segmented-control">
          {[["tickets","Tickets"],["faq","FAQ"],["chat","Live Chat"]].map(([id, label]) => (
            <button
              key={id}
              className={`ios-segment-btn ${activeTab === id ? "active" : ""}`}
              onClick={() => setActiveTab(id)}
            >{label}</button>
          ))}
        </div>

        {/* ════════════════════════════════
            TICKETS TAB
        ════════════════════════════════ */}
        {activeTab === "tickets" && (
          <>
            {/* Hero Banner */}
            <div className="he-support-hero">
              <div className="he-hero-icon">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M21 3C21.5523 3 22 3.44772 22 4V20C22 20.5523 21.5523 21 21 21H3C2.44772 21 2 20.5523 2 20V4C2 3.44772 2.44772 3 3 3H21ZM20 5H4V19H20V5ZM18 7V9H6V7H18ZM18 11V13H6V11H18ZM6 15H12V17H6V15Z"/>
                </svg>
              </div>
              <div className="he-hero-text">
                <p className="he-hero-title">Support Center</p>
                <p className="he-hero-sub">We typically respond within 24 hours ⚡</p>
              </div>
            </div>

            {/* Submit Ticket Form */}
            <p className="he-section-label">Submit New Ticket</p>
            <div className="he-glass-card">
              <div className="he-card-row">
                <span className="he-card-label">Category</span>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="he-select"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="he-textarea-row">
                <textarea
                  className="he-textarea"
                  value={issue}
                  onChange={(e) => setIssue(e.target.value)}
                  placeholder="Describe your issue in detail…"
                  rows={4}
                  maxLength={1000}
                />
              </div>
              <div className="he-card-footer">
                <span>We usually reply within 24 hours.</span>
                <span>{issue.length} / 1000</span>
              </div>
            </div>

            <button
              className="he-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting || !issue.trim()}
            >
              {isSubmitting ? <span className="he-spinner" /> : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" style={{width:"18px",height:"18px"}}>
                    <path d="M1.94619 9.31543C1.42365 9.14125 1.41953 8.86022 1.95694 8.68153L21.0431 2.31847C21.5716 2.14297 21.8747 2.43878 21.7266 2.95694L16.2734 22.0431C16.1224 22.5716 15.8178 22.5954 15.5951 22.0985L12 14L17.5 6.5L10 12L1.94619 9.31543Z"/>
                  </svg>
                  Submit Ticket
                </>
              )}
            </button>

            {/* Ticket History */}
            <p className="he-section-label">Your Tickets</p>
            <div className="he-glass-card">
              {isLoading ? (
                <>
                  {[1,2].map((i) => (
                    <div key={i} className="he-skeleton-row">
                      <div className="he-shimmer" style={{width:"10px",height:"10px",borderRadius:"50%",flexShrink:0}} />
                      <div style={{flex:1,display:"flex",flexDirection:"column",gap:"6px"}}>
                        <div className="he-shimmer" style={{height:"13px",width:"75%"}} />
                        <div className="he-shimmer" style={{height:"10px",width:"40%"}} />
                      </div>
                    </div>
                  ))}
                </>
              ) : tickets.length === 0 ? (
                <div className="he-empty-state">
                  <svg className="he-empty-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M21 3C21.5523 3 22 3.44772 22 4V14.3414C22 14.6889 21.862 15.0224 21.616 15.2685L15.2685 21.616C15.0224 21.862 14.6889 22 14.3414 22H3C2.44772 22 2 21.5523 2 21V4C2 3.44772 2.44772 3 3 3H21ZM20 5H4V20H13.5858L20 13.5858V5Z"/>
                  </svg>
                  <p>No tickets yet. Submit one above!</p>
                </div>
              ) : (
                tickets.map((ticket) => {
                  const sc = getStatusClass(ticket.status);
                  return (
                    <div key={ticket._id} className="he-ticket-row">
                      <div className={`he-status-dot ${sc.dot}`} />
                      <div className="he-ticket-body">
                        <p className="he-ticket-text">{ticket.issue}</p>
                        <span className="he-ticket-meta">{truncateId(ticket._id)}</span>
                      </div>
                      <div className="he-ticket-right">
                        <span className={`he-badge ${sc.badge}`}>{ticket.status || "Pending"}</span>
                        <span className="he-ticket-date">{formatDate(ticket.date)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}

        {/* ════════════════════════════════
            FAQ TAB
        ════════════════════════════════ */}
        {activeTab === "faq" && (
          <FaqSection
            isSubComponent={true}
            onNavigateToLiveChat={() => setActiveTab("chat")}
            onNavigateToTickets={() => setActiveTab("tickets")}
          />
        )}

        {/* ════════════════════════════════
            LIVE CHAT TAB
        ════════════════════════════════ */}
        {activeTab === "chat" && (
          <LiveChatSection isSubComponent={true} />
        )}

      </div>
    </>
  );
}

export default TicketSection;