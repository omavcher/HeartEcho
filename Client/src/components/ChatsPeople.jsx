'use client';

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Search, Crown, MessageSquare, AlertCircle, X, Check, CheckCheck } from "lucide-react";
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
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    // Check subscription status from localStorage
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);

      const subscriptionData = localStorage.getItem('subscribed');
      if (subscriptionData) {
        try {
          const parsedData = JSON.parse(subscriptionData);
          if (parsedData.isSubscribed === true || parsedData.userType === 'subscriber') {
            setIsSubscribed(true);
          }
        } catch (error) {
          console.error('Error parsing subscription data:', error);
        }
      }
    }
  }, []);

  // --- STYLES INJECTION ---
  const styles = `
    :root {
      --bg-dark: #050505;
      --bg-card: #121212;
      --primary: #cf4185;
      --primary-dark: #9d2f63;
      --text-main: #ffffff;
      --text-muted: #a1a1a1;
      --glass-bg: rgba(20, 20, 20, 0.85);
      --glass-border: rgba(255, 255, 255, 0.08);
      --online: #25D366; /* WhatsApp Green */
      --unread: #cf4185;
    }

    .chats-people-container {
      width: 100%;
      height: 100vh;
      height: 100dvh;
      background-color: var(--bg-dark);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 0% 0%, rgba(207, 65, 133, 0.05) 0%, transparent 40%),
        radial-gradient(circle at 100% 100%, rgba(65, 105, 225, 0.05) 0%, transparent 40%);
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
    .pop-noti.success { background: #25D366; color: black; }
    .pop-noti button { background: none; border: none; cursor: pointer; color: inherit; display: flex; }

    /* --- HEADER (WhatsApp Style) --- */
    .chats-header {
      padding: 15px 16px;
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--glass-border);
      z-index: 10;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .chats-header h1 {
      font-size: 1.3rem;
      font-weight: 700;
      margin: 0;
      color: #fff;
    }

    .premium-btn {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 6px 12px;
      background: rgba(207, 65, 133, 0.2);
      color: var(--primary);
      border: 1px solid var(--primary);
      border-radius: 20px;
      font-size: 0.8rem;
      font-weight: 600;
      cursor: pointer;
    }

    /* --- SEARCH (Instagram Style) --- */
    .search-container {
      padding: 10px 16px;
    }

    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background-color: #262626;
      border-radius: 12px;
      padding: 0 12px;
    }

    .search-icon {
      color: #8e8e8e;
      width: 18px; height: 18px;
    }

    .search-input-wrapper input {
      width: 100%;
      padding: 10px 10px;
      border: none;
      background: transparent;
      color: var(--text-main);
      font-size: 1rem;
      outline: none;
    }
    
    .search-input-wrapper input::placeholder {
      color: #8e8e8e;
    }

    /* --- LIST (WhatsApp Layout) --- */
    .chats-list-container {
      flex-grow: 1;
      overflow-y: auto;
      padding-bottom: 80px; /* Space for bottom nav */
    }

    .chat-item {
      display: flex;
      align-items: center;
      padding: 12px 16px;
      gap: 15px;
      cursor: pointer;
      border-bottom: 1px solid rgba(255,255,255,0.03);
      transition: background 0.2s;
    }

    .chat-item:active {
      background-color: rgba(255,255,255,0.05);
    }

    /* --- AVATAR (Instagram Story Style) --- */
    .avatar-wrapper {
        position: relative;
    }

    .avatar-container {
      width: 55px; 
      height: 55px;
      border-radius: 50%; /* Circle like WhatsApp */
      overflow: hidden;
      background: #333;
      border: 2px solid var(--bg-dark); /* Separation border */
    }
    
    /* Optional: If you want 9:16 vertical styling specifically */
    /*
    .avatar-container {
      width: 45px; 
      aspect-ratio: 9/16;
      border-radius: 8px;
    }
    */

    .user-avatar {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .online-badge {
      position: absolute;
      bottom: 2px;
      right: 2px;
      width: 12px;
      height: 12px;
      background-color: var(--online);
      border-radius: 50%;
      border: 2px solid var(--bg-dark);
      z-index: 2;
    }

    /* --- CHAT CONTENT --- */
    .chat-content {
      flex-grow: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      justify-content: center;
      gap: 2px;
    }

    .top-row {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }

    .user-name {
      font-size: 1.05rem;
      font-weight: 600;
      color: #fff;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 70%;
    }

    .message-time {
      font-size: 0.75rem;
      color: var(--text-muted); /* Green if unread, typically */
      white-space: nowrap;
    }
    
    .chat-item.unread .message-time {
        color: var(--online);
        font-weight: 500;
    }

    .bottom-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .message-text {
      font-size: 0.9rem;
      color: #8e8e8e;
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 85%;
      display: flex;
      align-items: center;
      gap: 4px;
    }

    .unread-badge {
      background: var(--online); /* WhatsApp Green */
      color: black;
      font-size: 0.75rem;
      font-weight: 700;
      min-width: 20px;
      height: 20px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
    }

    /* --- LOADING & EMPTY --- */
    .loading-skeleton {
      padding: 10px 16px;
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .chat-item-skeleton {
      display: flex;
      align-items: center;
      gap: 15px;
    }
    
    .avatar-skeleton {
      width: 55px; height: 55px;
      border-radius: 50%;
      background: rgba(255,255,255,0.05);
      animation: pulse 1.5s infinite;
    }
    
    .content-skeleton { flex: 1; display: flex; flex-direction: column; gap: 8px; }
    .line-skeleton { height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px; animation: pulse 1.5s infinite; }
    .w-60 { width: 60%; } .w-40 { width: 40%; }

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
      0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } 
    }
    
    @keyframes slideDown { 
      from { transform: translate(-50%, -100%); opacity: 0; } 
      to { transform: translate(-50%, 0); opacity: 1; } 
    }
  `;

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
        
        // Transform the data
        const transformedChats = chatData.map(chat => ({
          _id: chat._id,
          name: chat.name || "Friend",
          avatar: chat.avatar || "/default-avatar.png",
          isOnline: chat.isOnline || false,
          lastMessage: chat.lastMessage || "Start chatting",
          lastMessageTime: chat.lastMessageTime || new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          isSentByMe: chat.isSentByMe || false, // Add logic if backend supports it
          isRead: chat.isRead || false
        }));

        setChats(transformedChats);
      } catch (error) {
        console.error("Error fetching chats:", error);
        setNotification({ 
          show: true, 
          message: "Unable to load chats", 
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

  // WhatsApp Style Date Formatting
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
      } else {
        return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
    } catch (error) { return ""; }
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
        <h1>Chats</h1>
        {!isSubscribed && (
          <button 
            className='premium-btn' 
            onClick={() => window.location.href = '/subscribe'}
          >
            <Crown size={14} />
            <span>Premium</span>
          </button>
        )}
      </header>

      <div className="search-container">
        <div className="search-input-wrapper">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="chats-list-container">
        {isLoading ? (
          <div className="loading-skeleton">
            {[...Array(6)].map((_, index) => (
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
              className={`chat-item ${chat.unreadCount > 0 ? 'unread' : ''}`}
              onClick={() => {
                onChatSelect(chat._id);
                onBackBTNSelect(false);
              }}
            >
              <div className="avatar-wrapper">
                <div className="avatar-container">
                  <img 
                    src={chat.avatar || "/default-avatar.png"} 
                    alt={chat.name} 
                    className="user-avatar"
                    onError={(e) => { e.target.src = "/default-avatar.png"; }}
                  />
                </div>
                {chat.isOnline && <span className="online-badge"></span>}
              </div>
              
              <div className="chat-content">
                <div className="top-row">
                  <h3 className="user-name">{chat.name}</h3>
                  <span className="message-time">{formatTime(chat.lastMessageTime)}</span>
                </div>
                
                <div className="bottom-row">
                  <p className="message-text">
                    {/* Add Double Ticks if it's your message */}
                    {chat.isSentByMe && (
                         chat.isRead ? <CheckCheck size={16} color="#34b7f1" /> : <Check size={16} color="gray" />
                    )}
                    {chat.lastMessage
                      ? (chat.lastMessage.length > 30 ? chat.lastMessage.substring(0, 30) + '...' : chat.lastMessage)
                      : "Tap to chat"}
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
            <h3>No chats yet</h3>
            <p>Start a conversation to see it here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPeople;