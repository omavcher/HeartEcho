'use client';

import React, { useState, useEffect, useMemo } from "react";
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

  // Filter function to remove chats without messages
  const filterValidChats = (chatList) => {
    return chatList.filter(chat => {
      // Skip if no lastMessageTime
      if (!chat.lastMessageTime) return false;
      
      // Skip if lastMessage is "No messages yet" or similar placeholders
      const placeholderMessages = [
        "No messages yet",
        "Start chatting",
        "Tap to chat",
        "Message",
        ""
      ];
      
      if (placeholderMessages.includes(chat.lastMessage?.trim())) {
        return false;
      }
      
      // Check if lastMessage exists and is meaningful
      if (!chat.lastMessage || chat.lastMessage.trim().length === 0) {
        return false;
      }
      
      return true;
    });
  };

  // Sort chats by lastMessageTime (newest first)
  const sortChatsByTime = (chatList) => {
    return [...chatList].sort((a, b) => {
      if (!a.lastMessageTime) return 1;
      if (!b.lastMessageTime) return -1;
      return new Date(b.lastMessageTime) - new Date(a.lastMessageTime);
    });
  };

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
        
        // Filter out chats without valid messages
        const validChats = filterValidChats(chatData);
        
        // Sort chats by time (newest first)
        const sortedChats = sortChatsByTime(validChats);
        
        // Transform the data
        const transformedChats = sortedChats.map(chat => ({
          _id: chat._id,
          name: chat.name || "Friend",
          avatar: chat.avatar || "/default-avatar.png",
          isOnline: chat.isOnline || false,
          lastMessage: chat.lastMessage || "Start chatting",
          lastMessageTime: chat.lastMessageTime || new Date().toISOString(),
          unreadCount: chat.unreadCount || 0,
          isSentByMe: chat.isSentByMe || false,
          isRead: chat.isRead || false,
          chatId: chat.chatId // Include chatId for navigation
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

  // Memoized filtered chats for performance
  const filteredChats = useMemo(() => {
    if (!searchTerm) return chats;
    
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

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
      } else if (diffDays < 7) {
        return messageDate.toLocaleDateString([], { weekday: 'short' });
      } else {
        return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
      }
    } catch (error) { return ""; }
  };

  // Format message preview
  const formatMessagePreview = (message) => {
    if (!message) return "Tap to chat";
    
    // Remove any placeholder messages
    const placeholderMessages = ["No messages yet", "Start chatting", "Message"];
    if (placeholderMessages.includes(message.trim())) {
      return "Tap to chat";
    }
    
    // Check if it's a media message
    if (message.startsWith('[') && message.endsWith(']')) {
      const mediaType = message.slice(1, -1);
      return `${mediaType.charAt(0).toUpperCase() + mediaType.slice(1)} message`;
    }
    
    // Truncate long messages
    return message.length > 30 ? message.substring(0, 30) + '...' : message;
  };

  return (
    <div className="chats-people-container">
      <style>{`
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
          color: var(--text-muted);
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

        .empty-state-icon {
          margin-bottom: 15px;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.1rem;
          margin-bottom: 5px;
          font-weight: 600;
        }

        .empty-state p {
          font-size: 0.9rem;
          color: var(--text-muted);
        }

        @keyframes pulse { 
          0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } 
        }
        
        @keyframes slideDown { 
          from { transform: translate(-50%, -100%); opacity: 0; } 
          to { transform: translate(-50%, 0); opacity: 1; } 
        }
        
        /* New chat indicator */
        .new-chat-indicator {
          position: absolute;
          top: -2px;
          left: -2px;
          width: 8px;
          height: 8px;
          background-color: var(--primary);
          border-radius: 50%;
          border: 2px solid var(--bg-dark);
          z-index: 3;
        }
        
        .recent-badge {
          background: var(--primary);
          color: white;
          font-size: 0.65rem;
          padding: 2px 6px;
          border-radius: 10px;
          margin-left: 5px;
        }
      `}</style>
      
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
          filteredChats.map((chat, index) => {
            // Check if chat is recent (within last 24 hours)
            const isRecent = chat.lastMessageTime && 
              (Date.now() - new Date(chat.lastMessageTime).getTime()) < (24 * 60 * 60 * 1000);
            
            return (
              <div
                key={chat._id || index}
                className={`chat-item ${chat.unreadCount > 0 ? 'unread' : ''}`}
                onClick={() => {
                  // Use chatId if available, otherwise use AI friend _id
                  const targetChatId = chat.chatId || chat._id;
                  onChatSelect(targetChatId);
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
                  {isRecent && <span className="new-chat-indicator"></span>}
                </div>
                
                <div className="chat-content">
                  <div className="top-row">
                    <h3 className="user-name">
                      {chat.name}
                      {isRecent && <span className="recent-badge">New</span>}
                    </h3>
                    <span className="message-time">{formatTime(chat.lastMessageTime)}</span>
                  </div>
                  
                  <div className="bottom-row">
                    <p className="message-text">
                      {chat.isSentByMe && (
                        chat.isRead ? <CheckCheck size={16} color="#34b7f1" /> : <Check size={16} color="gray" />
                      )}
                      {formatMessagePreview(chat.lastMessage)}
                    </p>
                    
                    {chat.unreadCount > 0 && (
                      <span className="unread-badge">
                        {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-state">
            <MessageSquare size={48} className="empty-state-icon" />
            <h3>No active chats</h3>
            <p>Start a conversation to see it here</p>
            <p style={{ fontSize: '0.8rem', marginTop: '10px', color: '#666' }}>
              Chats with messages will appear automatically
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPeople;