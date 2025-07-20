'use client';

import React, { useEffect, useState } from "react";
import "../styles/ChatManagerSettings.css";
import api from "../config/api";
import axios from "axios";
import PopNoti from "./PopNoti";

function ChatManagerSettings() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Client-side only code
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get(`${api.Url}/user/get-chat-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setUserData(res.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setNotification({
          show: true,
          message: "Failed to load user data. Please try again.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getUserData();
    }
  }, [token]);

  if (loading) {
    return <div className="je9c-loading">Loading...</div>;
  }

  if (!userData) {
    return <div className="je9c-error">Error loading user data.</div>;
  }

  // Extract correct properties from API response
  const {
    userType,
    messageQuota,
    totalMessagesSent,
    joinedAt,
    daysLeft,
  } = userData;

  // Determine if the user is a subscriber
  const isSubscriber = messageQuota === 999;
  const quotaText = isSubscriber ? "∞" : `${messageQuota} / 20 Messages`;
  const progressWidth = isSubscriber ? "100%" : `${(messageQuota / 20) * 100}%`;
  const activeDays = isSubscriber ? "Active Subscription" : 7 - daysLeft;

  return (
    <div className="je9c-dashboard">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Overview Section */}
      <section className="je9c-overview">
        <div className="je9c-card je9c-trial-info">
          <h2 className="je9c-card-heading">{isSubscriber ? "Subscription Overview" : "Trial Overview"}</h2>
          <div className="je9c-info-grid">
            <p className="je9c-info-label">Joined</p>
            <p className="je9c-info-value">{new Date(joinedAt).toLocaleDateString("en-GB")}</p>
            <p className="je9c-info-label">Days Left</p>
            <p className="je9c-info-value je9c-accent">
              {isSubscriber ? `${daysLeft} day${daysLeft === 1 ? "" : "s"}` : daysLeft > 0 ? `${daysLeft} day${daysLeft === 1 ? "" : "s"}` : "Expired"}
            </p>
          </div>
          {!isSubscriber && daysLeft === 0 && (
            <button
              className="je9c-action-btn je9c-upgrade"
              onClick={() => alert("Redirecting to subscription page...")}
            >
              Upgrade Plan
            </button>
          )}
        </div>

        {/* Quota Section */}
        <div className="je9c-card je9c-quota-info">
          <h2 className="je9c-card-heading">Daily Quota</h2>
          <p className="je9c-plan-type">Plan: <span>{userType}</span></p>
          <div className="je9c-progress-bar">
            <div
              className="je9c-progress"
              style={{ width: progressWidth }}
            ></div>
          </div>
          <p className="je9c-quota-text">
            {messageQuota === 999 
              ? "You are a Premium Member! Enjoy Unlimited Chatting 🎉" 
              : `${messageQuota} / 20 Messages`}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="je9c-stats">
        <div className="je9c-card je9c-stats-info">
          <h2 className="je9c-card-heading">Usage Insights</h2>
          <div className="je9c-stats-grid">
            <div className="je9c-stat-item">
              <span className="je9c-stat-value">{totalMessagesSent}</span>
              <span className="je9c-stat-label">Messages Sent</span>
            </div>
            <div className="je9c-stat-item">
              <span className="je9c-stat-value">{activeDays}</span>
              <span className="je9c-stat-label">Active Days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="je9c-dashboard-footer">
        <button className="je9c-action-btn je9c-support">Get Support</button>
      </footer>
    </div>
  );
}

export default ChatManagerSettings;