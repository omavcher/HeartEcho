'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Crown, MessageSquare, AlertCircle, X } from "lucide-react";
import api from "../config/api";

// Mock Notification Component
const PopNoti = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;
  return (
    <div className={`pop-noti ${type}`}>
      <span>{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
};

// --- MAIN COMPONENT ---
const ChatsPeople = ({ onChatSelect = () => {}, onBackBTNSelect = () => {}, refreshTrigger }) => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  // --- STYLES INJECTION ---
  const styles = `
    :root {
      --bg-dark: #050505;
      --bg-card: #121212;
      --primary: #cf4185;
      --primary-dark: #9d2f63;
      --text-main: #ffffff;
      --text-muted: #a1a1a1;
      --glass-bg: rgba(20, 20, 20, 0.7);
      --glass-border: rgba(255, 255, 255, 0.08);
      --online: #00e676;
    }

    .chats-people-container {
      width: 100%;
      height: 100vh;
      height: 100dvh;
      background-color: var(--bg-dark);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      font-family: 'Inter', sans-serif;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 0% 0%, rgba(207, 65, 133, 0.08) 0%, transparent 40%),
        radial-gradient(circle at 100% 100%, rgba(65, 105, 225, 0.08) 0%, transparent 40%);
    }

    /* --- NOTIFICATION --- */
    .pop-noti {
      position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
      padding: 12px 20px; border-radius: 30px; z-index: 2000;
      display: flex; align-items: center; gap: 10px;
      font-size: 0.9rem; font-weight: 500;
      box-shadow: 0 10px 30px rgba(0,0,0,0.5);
      animation: slideDown 0.3s ease-out;
    }
    .pop-noti.error { background: #ff4d4d; color: white; }
    .pop-noti.success { background: #00e676; color: black; }
    .pop-noti button { background: none; border: none; cursor: pointer; color: inherit; display: flex; }

    /* --- HEADER --- */
    .chats-header {
      padding: 20px;
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--glass-border);
      z-index: 10;
    }

    .header-content {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chats-header h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      letter-spacing: -0.5px;
    }

    .premium-btn {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: linear-gradient(135deg, var(--primary), var(--primary-dark));
      color: white;
      border-radius: 20px;
      font-size: 0.85rem;
      font-weight: 600;
      text-decoration: none;
      transition: transform 0.2s;
      border: none;
      cursor: pointer;
      box-shadow: 0 4px 15px rgba(207, 65, 133, 0.3);
    }

    .premium-btn:hover { transform: translateY(-2px); }

    /* --- SEARCH --- */
    .search-container {
      padding: 15px 20px;
      border-bottom: 1px solid var(--glass-border);
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-icon {
      position: absolute;
      left: 15px;
      color: var(--text-muted);
      width: 18px; height: 18px;
    }

    .search-input-wrapper input {
      width: 100%;
      padding: 12px 12px 12px 45px;
      border: 1px solid var(--glass-border);
      border-radius: 12px;
      background-color: rgba(255,255,255,0.05);
      color: var(--text-main);
      font-size: 0.95rem;
      outline: none;
      transition: all 0.2s;
    }

    .search-input-wrapper input:focus {
      background-color: rgba(255,255,255,0.08);
      border-color: var(--primary);
    }

    /* --- LIST --- */
    .chats-list-container {
      flex-grow: 1;
      overflow-y: auto;
      padding: 10px;
    }

    .chat-item {
      display: flex;
      align-items: center;
      padding: 12px;
      gap: 15px;
      cursor: pointer;
      border-radius: 16px;
      transition: background 0.2s;
      margin-bottom: 5px;
    }

    .chat-item:hover {
      background-color: rgba(255,255,255,0.05);
    }

    /* --- 9:16 AVATAR STYLING --- */
    .avatar-container {
      position: relative;
      flex-shrink: 0;
      width: 48px; 
      aspect-ratio: 9/16; /* Key 9:16 Ratio */
      border-radius: 8px; /* Rounded rectangle */
      overflow: hidden;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      border: 1px solid var(--glass-border);
    }

    .user-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s;
    }
    
    .chat-item:hover .user-avatar {
        transform: scale(1.1);
    }

    .online-badge {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 8px;
      height: 8px;
      background-color: var(--online);
      border-radius: 50%;
      border: 1px solid black;
      z-index: 2;
    }

    /* --- CONTENT --- */
    .chat-content {
      flex-grow: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 4px;
    }

    .chat-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .user-name {
      font-size: 1rem;
      font-weight: 600;
      margin: 0;
      color: #fff;
    }

    .message-time {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
    }

    .message-preview-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .message-text {
      font-size: 0.85rem;
      color: var(--text-muted);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 80%;
    }

    .unread-badge {
      background: var(--primary);
      color: white;
      font-size: 0.65rem;
      font-weight: 700;
      min-width: 18px;
      height: 18px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
    }

    /* --- SKELETON & EMPTY --- */
    .loading-skeleton {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .chat-item-skeleton {
      display: flex;
      align-items: center;
      padding: 12px;
      gap: 15px;
    }
    
    .avatar-skeleton {
      width: 48px; 
      aspect-ratio: 9/16;
      background: rgba(255,255,255,0.05);
      border-radius: 8px;
      animation: pulse 1.5s infinite;
    }
    
    .content-skeleton { 
      flex: 1; 
      display: flex; 
      flex-direction: column; 
      gap: 8px; 
    }
    
    .line-skeleton { 
      height: 12px; 
      background: rgba(255,255,255,0.05); 
      border-radius: 4px; 
      animation: pulse 1.5s infinite; 
    }
    
    .w-60 { width: 60%; } 
    .w-40 { width: 40%; }

    .empty-state {
      height: 60vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: var(--text-muted);
      opacity: 0.6;
    }

    @keyframes pulse { 
      0% { opacity: 1; } 
      50% { opacity: 0.5; } 
      100% { opacity: 1; } 
    }
    
    @keyframes slideDown { 
      from { transform: translate(-50%, -100%); opacity: 0; } 
      to { transform: translate(-50%, 0); opacity: 1; } 
    }
  `;

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    const getUserFriendsToChat = async () => {
      try {
        if (!token) {
          setIsLoading(false);
          return;
        }

        setIsLoading(true);

        const res = await axios.get(`${api.Url}/user/chat-friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const chatData = Array.isArray(res.data) ? res.data : [];
        
        // Transform the data to match our frontend structure
        const transformedChats = chatData.map(chat => ({
          _id: chat._id,
          name: chat.name || "AI Companion",
          avatar: chat.avatar || "/default-avatar.png",
          isOnline: chat.isOnline || false,
          lastMessage: chat.lastMessage || "Start a conversation",
          lastMessageTime: chat.lastMessageTime || new Date().toISOString(),
          unreadCount: chat.unreadCount || 0
        }));

        setChats(transformedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
        setNotification({ 
          show: true, 
          message: "Error fetching conversations. Please try again.", 
          type: "error" 
        });
        setChats([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      getUserFriendsToChat();
    }
  }, [token, refreshTrigger]);

  const filteredChats = searchTerm
    ? chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    : chats;

  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    
    try {
      const now = new Date();
      const messageDate = new Date(timestamp);
      const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      } else if (diffDays === 1) {
        return 'Yesterday';
      } else if (diffDays < 7) {
        return messageDate.toLocaleDateString([], { weekday: 'short' });
      } else {
        return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
      }
    } catch (error) {
      return "";
    }
  };

  return (
    <div className="chats-people-container">
      <style>{styles}</style>
      
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <header className="chats-header">
        <div className="header-content">
          <h1>Conversations</h1>
          <button 
            className='premium-btn' 
            onClick={() => window.location.href = '/subscribe'}
          >
            <Crown size={16} />
            <span>Go Premium</span>
          </button>
        </div>
      </header>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="chats-list-container">
        {isLoading ? (
          <div className="loading-skeleton">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="chat-item-skeleton">
                <div className="avatar-skeleton"></div>
                <div className="content-skeleton">
                  <div className="line-skeleton w-40"></div>
                  <div className="line-skeleton w-60"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              className="chat-item"
              onClick={() => {
                onChatSelect(chat._id);
                onBackBTNSelect(false);
              }}
            >
              <div className="avatar-container">
                <img 
                  src={chat.avatar || "/default-avatar.png"} 
                  alt={chat.name} 
                  className="user-avatar"
                  onError={(e) => {
                    e.target.src = "/default-avatar.png";
                  }}
                />
                {chat.isOnline && <span className="online-badge"></span>}
              </div>
              
              <div className="chat-content">
                <div className="chat-header-row">
                  <h3 className="user-name">{chat.name}</h3>
                  <span className="message-time">{formatTime(chat.lastMessageTime)}</span>
                </div>
                
                <div className="message-preview-row">
                  <p className="message-text">
                    {chat.lastMessage
                      ? chat.lastMessage.split(" ").slice(0, 8).join(" ") + 
                        (chat.lastMessage.split(" ").length > 8 ? "..." : "")
                      : "Start a conversation"}
                  </p>
                  
                  {chat.unreadCount > 0 && (
                    <span className="unread-badge">{chat.unreadCount}</span>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <MessageSquare size={48} style={{marginBottom: 10}} />
            <h3>No conversations found</h3>
            <p>{searchTerm ? "Try a different search" : "Start a new conversation"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPeople;