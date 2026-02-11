'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Search, Crown, MessageSquare, X, Check, CheckCheck } from "lucide-react";
import api from "../config/api";
import StatusStories from "./StatusStories";

// --- MOCK NOTIFICATION COMPONENT ---
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
  // --- STATE ---
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  
  // Auth & Prefs
  const [token, setToken] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  // --- SMART UNREAD SYSTEM STATE ---
  // Stores { "chat_id": "timestamp_when_read" }
  const [lastReadTimestamps, setLastReadTimestamps] = useState({});

  // Simulation State
  const autoTriggerCount = useRef(0); 
  const MAX_AUTO_TRIGGERS = 5;

  // --- 1. INITIAL SETUP & LOAD STORAGE ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);

      // Load Subscription
      const subscriptionData = localStorage.getItem('subscribed');
      if (subscriptionData) {
        try {
          const parsedData = JSON.parse(subscriptionData);
          if (parsedData.isSubscribed === true || parsedData.userType === 'subscriber') {
            setIsSubscribed(true);
          }
        } catch (error) { console.error(error); }
      }

      // Load Read Timestamps from LocalStorage
      try {
        const storedTimestamps = JSON.parse(localStorage.getItem('chatReadTimestamps') || '{}');
        setLastReadTimestamps(storedTimestamps);
      } catch (e) {
        console.error("Error loading read status", e);
      }
    }
  }, []);

  // --- 2. FETCH CHATS ---
  const fetchChats = async () => {
    if (!token) return;
    try {
      if (chats.length === 0) setIsLoading(true);
      
      const res = await axios.get(`${api.Url}/user/chat-friends`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const chatData = Array.isArray(res.data) ? res.data : [];
      
      // Sort logic handled in Render to account for live unread status updates
      setChats(chatData);
    } catch (error) {
      console.error("Error fetching chats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchChats();
    }
  }, [token, refreshTrigger]);


  // --- 3. HANDLE CLICK (MARK AS READ) ---
  const handleChatClick = (chatId, rawChatId) => {
    const targetId = rawChatId || chatId;
    
    // 1. Navigation
    onChatSelect(targetId);
    onBackBTNSelect(false);

    // 2. Smart Read Logic: Save current time as "Last Read Time"
    const now = new Date().toISOString();
    
    setLastReadTimestamps(prev => {
      const updated = { ...prev, [targetId]: now };
      // Save to persistent storage
      localStorage.setItem('chatReadTimestamps', JSON.stringify(updated));
      return updated;
    });
  };

  const handleStoryChatStart = (characterId) => {
    handleChatClick(null, characterId);
  };


  // --- 4. REALISM SIMULATION (Background Messages) ---
  useEffect(() => {
    if (!token || chats.length === 0) return;

    const simulateIncomingActivity = () => {
      if (autoTriggerCount.current >= MAX_AUTO_TRIGGERS) return;

      // Random delay 8s - 25s
      const delay = Math.floor(Math.random() * (25000 - 8000 + 1) + 8000);

      const timeoutId = setTimeout(async () => {
        if (autoTriggerCount.current >= MAX_AUTO_TRIGGERS) return;

        const randomFriendIndex = Math.floor(Math.random() * chats.length);
        const randomFriend = chats[randomFriendIndex];

        if (randomFriend && randomFriend._id) {
          try {
            await axios.post(`${api.Url}/bots/bots-message`, 
              { aiFriendId: randomFriend._id }, 
              { headers: { Authorization: `Bearer ${token}` } }
            );
            autoTriggerCount.current += 1;
            fetchChats(); // Refresh to show the new message (Badge will appear!)
          } catch (error) {
            console.error("Simulation failed:", error);
          }
        }
        simulateIncomingActivity();
      }, delay);

      return timeoutId;
    };

    const timer = simulateIncomingActivity();
    return () => clearTimeout(timer);
  }, [token, chats.length]);


  // --- 5. RENDER PREPARATION ---
  const processedChats = useMemo(() => {
    let result = chats;

    // Filter
    if (searchTerm) {
      result = chats.filter(chat => 
        chat.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort: Unread first, then Time
    return result.sort((a, b) => {
      // Calculate real unread status for sorting
      const timeA = new Date(a.lastMessageTime || 0).getTime();
      const readTimeA = new Date(lastReadTimestamps[a._id] || 0).getTime();
      const isUnreadA = timeA > readTimeA && a.unreadCount > 0;

      const timeB = new Date(b.lastMessageTime || 0).getTime();
      const readTimeB = new Date(lastReadTimestamps[b._id] || 0).getTime();
      const isUnreadB = timeB > readTimeB && b.unreadCount > 0;

      // Logic: Unread chats go to top
      if (isUnreadA && !isUnreadB) return -1;
      if (!isUnreadA && isUnreadB) return 1;

      // Fallback: Sort by time
      return timeB - timeA;
    });
  }, [chats, searchTerm, lastReadTimestamps]);

  // Helpers
  const formatTime = (timestamp) => {
    if (!timestamp) return "";
    try {
      const now = new Date();
      const messageDate = new Date(timestamp);
      const diffDays = Math.floor((now - messageDate) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) return messageDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      else if (diffDays === 1) return 'Yesterday';
      else if (diffDays < 7) return messageDate.toLocaleDateString([], { weekday: 'short' });
      else return messageDate.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch (error) { return ""; }
  };

  const formatMessagePreview = (message) => {
    if (!message) return "";
    if (message.includes("[image]")) return "📷 Photo";
    if (message.includes("[video]")) return "🎥 Video";
    return message.length > 35 ? message.substring(0, 35) + '...' : message;
  };

  return (
    <div className="chats-people-container">
      <style>{`
        :root {
          --bg-dark: #050505;
          --bg-card: #121212;
          --primary: #cf4185;
          --text-main: #ffffff;
          --text-muted: #a1a1a1;
          --glass-bg: rgba(18, 18, 18, 0.95);
          --glass-border: rgba(255, 255, 255, 0.08);
          --online: #25D366;
          --unread-bg: #cf4185;
        }

        .chats-people-container {
          width: 100%;
          height: 100vh;
          height: 100dvh;
          background-color: var(--bg-dark);
          color: var(--text-main);
          display: flex;
          flex-direction: column;
          font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif;
          overflow: hidden;
        }

        /* Header */
        .chats-header {
          flex-shrink: 0;
          padding: 15px 16px;
          background: var(--glass-bg);
          border-bottom: 1px solid var(--glass-border);
          display: flex; justify-content: space-between; align-items: center;
          z-index: 20;
        }
        .chats-header h1 { font-size: 1.4rem; font-weight: 700; margin: 0; color: #fff; letter-spacing: -0.5px; }
        .premium-btn {
          display: flex; align-items: center; gap: 6px; padding: 6px 12px;
          background: rgba(207, 65, 133, 0.15); color: var(--primary);
          border: 1px solid var(--primary); border-radius: 20px;
          font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
        }
        .premium-btn:hover { background: rgba(207, 65, 133, 0.25); }

        /* Status Stories Wrapper */
        .status-section-wrapper { flex-shrink: 0; background: var(--bg-dark); }

        /* Search */
        .search-container { flex-shrink: 0; padding: 10px 16px; background: var(--bg-dark); }
        .search-input-wrapper {
          position: relative; display: flex; align-items: center;
          background-color: #1a1a1a; border-radius: 12px; padding: 0 12px;
          border: 1px solid transparent; transition: border-color 0.2s;
        }
        .search-input-wrapper:focus-within { border-color: var(--primary); }
        .search-icon { color: #666; width: 18px; height: 18px; }
        .search-input-wrapper input {
          width: 100%; padding: 12px 10px; border: none; background: transparent;
          color: var(--text-main); font-size: 1rem; outline: none;
        }

        /* List */
        .chats-list-container { 
          flex-grow: 1; overflow-y: auto; overflow-x: hidden; 
          padding-bottom: 80px; 
          -webkit-overflow-scrolling: touch;
        }

        .chat-item {
          display: flex; align-items: center; padding: 12px 16px; gap: 15px;
          cursor: pointer; border-bottom: 1px solid rgba(255,255,255,0.03);
          transition: background 0.2s;
        }
        .chat-item:active { background-color: rgba(255,255,255,0.05); }
        
        /* Light highlight for unread chats */
        .chat-item.unread { background-color: rgba(207, 65, 133, 0.05); }

        /* Avatar */
        .avatar-wrapper { position: relative; flex-shrink: 0; }
        .avatar-container {
          width: 54px; height: 54px; border-radius: 50%; overflow: hidden;
          background: #222; border: 2px solid var(--bg-dark);
        }
        .user-avatar { width: 100%; height: 100%; object-fit: cover; }
        .online-badge {
          position: absolute; bottom: 2px; right: 2px;
          width: 12px; height: 12px; background-color: var(--online);
          border-radius: 50%; border: 2px solid var(--bg-dark); z-index: 2;
        }
        
        /* Content */
        .chat-content { flex-grow: 1; min-width: 0; display: flex; flex-direction: column; gap: 4px; }
        .top-row { display: flex; justify-content: space-between; align-items: center; }
        .user-name { font-size: 1.05rem; font-weight: 600; color: #fff; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .message-time { font-size: 0.75rem; color: #666; white-space: nowrap; font-weight: 500; }
        .chat-item.unread .message-time { color: var(--primary); }

        .bottom-row { display: flex; justify-content: space-between; align-items: center; }
        .message-text { font-size: 0.9rem; color: #888; margin: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 85%; }
        .chat-item.unread .message-text { color: #fff; font-weight: 600; }

        .unread-badge { 
          background: var(--unread-bg); color: white; font-size: 0.7rem; font-weight: 700; 
          min-width: 20px; height: 20px; border-radius: 10px; display: flex; 
          align-items: center; justify-content: center; padding: 0 6px; flex-shrink: 0;
          box-shadow: 0 2px 5px rgba(207, 65, 133, 0.4);
        }

        /* Skeleton */
        .loading-skeleton { padding: 16px; display: flex; flex-direction: column; gap: 20px; }
        .chat-item-skeleton { display: flex; align-items: center; gap: 15px; }
        .avatar-skeleton { width: 54px; height: 54px; border-radius: 50%; background: rgba(255,255,255,0.05); animation: pulse 1.5s infinite; }
        .content-skeleton { flex: 1; display: flex; flex-direction: column; gap: 8px; }
        .line-skeleton { height: 12px; background: rgba(255,255,255,0.05); border-radius: 4px; animation: pulse 1.5s infinite; }
        .w-60 { width: 60%; } .w-40 { width: 40%; }
        
        .empty-state { height: 50vh; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #666; opacity: 0.7; }
        .empty-state-icon { margin-bottom: 10px; opacity: 0.5; }

        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.5; } 100% { opacity: 1; } }
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

      <div className="status-section-wrapper">
        <StatusStories onChatStart={handleStoryChatStart} />
      </div>

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
        ) : processedChats.length > 0 ? (
          processedChats.map((chat) => {
            // --- SMART READ LOGIC ---
            const lastMsgTime = new Date(chat.lastMessageTime || 0).getTime();
            const lastReadTime = new Date(lastReadTimestamps[chat._id] || 0).getTime();
            
            // It is unread ONLY if the message time is NEWER than when we last clicked
            const hasNewMessage = lastMsgTime > lastReadTime;
            
            // Display Logic: Show count if API says > 0 AND it is physically new
            const showBadge = chat.unreadCount > 0 && hasNewMessage;
            
            // If it's a simulated message (no unread count from API yet but we know it's new), 
            // force at least '1' if time is new.
            const displayCount = showBadge ? chat.unreadCount : (hasNewMessage ? 1 : 0);
            
            // Final Boolean for styling
            const isUnread = displayCount > 0;

            return (
              <div
                key={chat._id}
                className={`chat-item ${isUnread ? 'unread' : ''}`}
                onClick={() => handleChatClick(chat.chatId, chat._id)}
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
                      {formatMessagePreview(chat.lastMessage)}
                    </p>
                    
                    {isUnread && (
                      <span className="unread-badge">
                        {displayCount > 99 ? '99+' : displayCount}
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
            <h3>No conversations yet</h3>
            <p>Start chatting with an AI friend!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPeople;