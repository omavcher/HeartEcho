import React, { useState } from "react";
import "../styles/ChatManagerSettings.css";

function ChatManagerSettings() {
  // Sample User Data
  const user = {
    type: "Free", // or "Premium"
    dailyQuota: 5,
    usedQuota: 2,
  };

  const [chatHistory, setChatHistory] = useState(true);
  const [notifications, setNotifications] = useState(true);

  return (
    <div className="chat-settings">
      <h1>⚙️ Chat Manager Settings</h1>

      {/* Daily Quota */}
      <section className="quota-section">
        <h2>🗨️ Daily Chat Quota</h2>
        <p>
          You are on a <strong>{user.type} Plan</strong>.
          {user.type === "Free" && (
            <span> You can send up to {user.dailyQuota} messages per day.</span>
          )}
        </p>
        <div className="quota-bar">
          <div
            className="quota-progress"
            style={{ width: `${(user.usedQuota / user.dailyQuota) * 100}%` }}
          ></div>
        </div>
        <p>{user.usedQuota} / {user.dailyQuota} messages used</p>
      </section>

      {/* Chat History Toggle */}
      <section className="toggle-section">
        <h2>📜 Chat History</h2>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={chatHistory}
            onChange={() => setChatHistory(!chatHistory)}
          />
          <span className="slider"></span>
        </label>
        <p>{chatHistory ? "Enabled" : "Disabled"}</p>
      </section>

      {/* Notification Toggle */}
      <section className="toggle-section">
        <h2>🔔 Notifications</h2>
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={notifications}
            onChange={() => setNotifications(!notifications)}
          />
          <span className="slider"></span>
        </label>
        <p>{notifications ? "On" : "Off"}</p>
      </section>
    </div>
  );
}

export default ChatManagerSettings;
