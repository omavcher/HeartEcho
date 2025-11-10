'use client';

import { useEffect, useState } from "react";
import "../styles/ChatManagerSettings.css";
import api from "../config/api";
import axios from "axios";
import PopNoti from "./PopNoti";
import AdvancedLoader from './AdvancedLoader'

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
    return <AdvancedLoader
    variant="spinner"
    size="large"
    color="primary"
    text={`Loading...`}
    overlay={false}
    />;
  }

  if (!userData) {
    return <div className="je9c-error-dwdjwd">Error loading user data.</div>;
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
  const progressWidth = isSubscriber ? "100%" : `${(messageQuota / 20) * 100}%`;
  const activeDays = isSubscriber ? "Active Subscription" : 7 - daysLeft;

  return (
    <div className="je9c-dashboard-dwdjwd">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Overview Section */}
      <section className="je9c-overview-dwdjwd">
        <div className="je9c-card-dwdjwd je9c-trial-info-dwdjwd">
          <h2 className="je9c-card-heading-dwdjwd">
            {isSubscriber ? "Subscription Overview" : "Trial Overview"}
          </h2>
          <div className="je9c-info-grid-dwdjwd">
            <div className="je9c-info-item-dwdjwd">
              <p className="je9c-info-label-dwdjwd">Joined</p>
              <p className="je9c-info-value-dwdjwd">{new Date(joinedAt).toLocaleDateString("en-GB")}</p>
            </div>
            <div className="je9c-info-item-dwdjwd">
              <p className="je9c-info-label-dwdjwd">Days Left</p>
              <p className="je9c-info-value-dwdjwd je9c-accent-dwdjwd">
                {isSubscriber 
                  ? `${daysLeft} day${daysLeft === 1 ? "" : "s"}` 
                  : daysLeft > 0 
                    ? `${daysLeft} day${daysLeft === 1 ? "" : "s"}` 
                    : "Expired"
                }
              </p>
            </div>
          </div>
          {!isSubscriber && daysLeft === 0 && (
            <button
              className="je9c-action-btn-dwdjwd je9c-upgrade-dwdjwd"
              onClick={() => alert("Redirecting to subscription page...")}
            >
              Upgrade Plan
            </button>
          )}
        </div>

        {/* Quota Section */}
        <div className="je9c-card-dwdjwd je9c-quota-info-dwdjwd">
          <h2 className="je9c-card-heading-dwdjwd">Daily Quota</h2>
          <p className="je9c-plan-type-dwdjwd">
            Plan: <span className="je9c-plan-value-dwdjwd">{userType}</span>
          </p>
          <div className="je9c-progress-container-dwdjwd">
            <div className="je9c-progress-bar-dwdjwd">
              <div
                className="je9c-progress-dwdjwd"
                style={{ width: progressWidth }}
              ></div>
            </div>
            <div className="je9c-progress-labels-dwdjwd">
              <span className="je9c-progress-current-dwdjwd">
                {isSubscriber ? "Unlimited" : `${messageQuota}`}
              </span>
              <span className="je9c-progress-total-dwdjwd">
                {isSubscriber ? "" : "/ 20"}
              </span>
            </div>
          </div>
          <p className="je9c-quota-text-dwdjwd">
            {messageQuota === 999 
              ? "You are a Premium Member! Enjoy Unlimited Chatting 🎉" 
              : `${messageQuota} / 20 Messages`}
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="je9c-stats-dwdjwd">
        <div className="je9c-card-dwdjwd je9c-stats-info-dwdjwd">
          <h2 className="je9c-card-heading-dwdjwd">Usage Insights</h2>
          <div className="je9c-stats-grid-dwdjwd">
            <div className="je9c-stat-item-dwdjwd">
              <div className="je9c-stat-icon-dwdjwd">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12ZM13 7C13 6.44772 12.5523 6 12 6C11.4477 6 11 6.44772 11 7V13C11 13.5523 11.4477 14 12 14C12.5523 14 13 13.5523 13 13V7ZM12 20C7.58172 20 4 16.4183 4 12C4 7.58172 7.58172 4 12 4C16.4183 4 20 7.58172 20 12C20 16.4183 16.4183 20 12 20Z"></path>
                </svg>
              </div>
              <span className="je9c-stat-value-dwdjwd">{totalMessagesSent}</span>
              <span className="je9c-stat-label-dwdjwd">Messages Sent</span>
            </div>
            <div className="je9c-stat-item-dwdjwd">
              <div className="je9c-stat-icon-dwdjwd">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C17.523 2 22 6.477 22 12C22 17.523 17.523 22 12 22C6.477 22 2 17.523 2 12C2 6.477 6.477 2 12 2ZM12 4C7.582 4 4 7.582 4 12C4 16.418 7.582 20 12 20C16.418 20 20 16.418 20 12C20 7.582 16.418 4 12 4ZM13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12V16C11 16.5523 11.4477 17 12 17C12.5523 17 13 16.5523 13 16V12ZM12 7C12.5523 7 13 7.44772 13 8C13 8.55228 12.5523 9 12 9C11.4477 9 11 8.55228 11 8C11 7.44772 11.4477 7 12 7Z"></path>
                </svg>
              </div>
              <span className="je9c-stat-value-dwdjwd">{activeDays}</span>
              <span className="je9c-stat-label-dwdjwd">Active Days</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="je9c-dashboard-footer-dwdjwd">
        <button className="je9c-action-btn-dwdjwd je9c-support-dwdjwd">
          Get Support
        </button>
      </footer>
    </div>
  );
}

export default ChatManagerSettings;