'use client';

import { useEffect, useState } from "react";
import "../styles/ChatManagerSettings.css";
import api from "../config/api";
import axios from "axios";
import PopNoti from "./PopNoti";
import AdvancedLoader from './AdvancedLoader'
import { useRouter } from 'next/navigation';

function ChatManagerSettings() {
  const router = useRouter();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get(`${api.Url}/user/get-chat-data`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.data) setUserData(res.data);
      } catch (error) {
        setNotification({ show: true, message: "Failed to load user data.", type: "error" });
      } finally {
        setLoading(false);
      }
    };
    if (token) getUserData();
  }, [token]);

  if (loading) {
    return <AdvancedLoader variant="spinner" size="large" color="primary" text="Loading..." overlay={false} />;
  }

  if (!userData) {
    return <div className="ios-error-msg">Error loading user data.</div>;
  }

  const { userType, messageQuota, totalMessagesSent, joinedAt, daysLeft } = userData;
  const isSubscriber = messageQuota === 999;
  const progressWidth = isSubscriber ? "100%" : `${(messageQuota / 5) * 100}%`;
  const activeDays = isSubscriber ? "Active Subscription" : "Forever (Daily)";

  return (
    <div className="ios-settings-container">
      <PopNoti message={notification.message} type={notification.type} isVisible={notification.show} onClose={() => setNotification({ ...notification, show: false })} />

      <div className="ios-settings-group">
        <h3 className="ios-group-title">ACCOUNT SUBSCRIPTION</h3>
        <div className="ios-list">
          <div className="ios-list-item">
            <div className="ios-item-left">
              <div className="ios-icon-box" style={{ background: '#0a84ff' }}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/><path d="M11 7h2v6h-2zm0 8h2v2h-2z"/></svg>
              </div>
              <span className="ios-item-title">Current Plan</span>
            </div>
            <div className="ios-item-right">
              <span className="ios-item-value">{userType}</span>
            </div>
          </div>
          
          <div className="ios-list-item">
            <div className="ios-item-left">
              <div className="ios-icon-box" style={{ background: '#30d158' }}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20a2 2 0 002 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10z"/></svg>
              </div>
              <span className="ios-item-title">Joined Date</span>
            </div>
            <div className="ios-item-right">
              <span className="ios-item-value">{new Date(joinedAt).toLocaleDateString("en-GB")}</span>
            </div>
          </div>

          <div className="ios-list-item">
            <div className="ios-item-left">
              <div className="ios-icon-box" style={{ background: '#ff9f0a' }}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z"/><path d="M12.5 7H11v6l5.25 3.15.75-1.23-4.5-2.67z"/></svg>
              </div>
              <span className="ios-item-title">{isSubscriber ? "Days Left" : "Access"}</span>
            </div>
            <div className="ios-item-right">
              <span className="ios-item-value">{isSubscriber ? `${daysLeft} Days` : "Daily Quota"}</span>
            </div>
          </div>

          {!isSubscriber && (
            <div className="ios-list-item ios-action-item" onClick={() => router.push("/subscribe")}>
              <span className="ios-action-text">Upgrade Plan</span>
              <svg className="ios-chevron" viewBox="0 0 24 24" fill="currentColor"><path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41L10.7 17.3c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"/></svg>
            </div>
          )}
        </div>
      </div>

      <div className="ios-settings-group">
        <h3 className="ios-group-title">DAILY QUOTA</h3>
        <div className="ios-list ios-list-vertical">
          <div className="ios-quota-header">
            <span className="ios-item-title">Messages Used</span>
            <span className="ios-item-value">{isSubscriber ? "Unlimited" : `${messageQuota} / 5`}</span>
          </div>
          <div className="ios-progress-bar-container">
            <div className={`ios-progress-bar ${isSubscriber ? 'ios-progress-premium' : ''}`}>
              <div className="ios-progress-fill" style={{ width: progressWidth }}></div>
            </div>
          </div>
          <p className="ios-group-footer">
            {isSubscriber ? "You are a Premium Member enjoying unlimited messages." : "Your free messages reset daily. Upgrade for unlimited messaging without boundaries."}
          </p>
        </div>
      </div>

      <div className="ios-settings-group">
        <h3 className="ios-group-title">USAGE INSIGHTS</h3>
        <div className="ios-list">
          <div className="ios-list-item">
            <div className="ios-item-left">
              <div className="ios-icon-box" style={{ background: '#5e5ce6' }}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
              </div>
              <span className="ios-item-title">Total Messages Sent</span>
            </div>
            <div className="ios-item-right">
              <span className="ios-item-value">{totalMessagesSent}</span>
            </div>
          </div>
          
          <div className="ios-list-item">
            <div className="ios-item-left">
              <div className="ios-icon-box" style={{ background: '#ff375f' }}>
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
              </div>
              <span className="ios-item-title">Active Days</span>
            </div>
            <div className="ios-item-right">
              <span className="ios-item-value">{activeDays}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}

export default ChatManagerSettings;