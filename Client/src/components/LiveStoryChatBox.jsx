'use client';

import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { 
  ArrowLeft, X, Send, Video, Image as ImageIcon, Info, Lock, Zap, 
  Check, CheckCheck, Play, MoreVertical, Trash2 
} from "lucide-react";
import api from "../config/api";
import { useRouter } from 'next/navigation';
import LoginModal from "./LoginModel";

// --- NO CONFIGURATION DELAYS ---

// --- PREMIUM LOCK UI ---
const PremiumLockOverlay = ({ cost, onUnlock }) => {
  return (
    <div className="premium-lock-backdrop">
      <div className="glass-lock-card">
        <div className="lock-icon-glow">
          <Lock size={20} color="#FFD700" />
        </div>
        <h4>Quota Limit Reached</h4>
        <p>Subscribe to continue chatting without limits.</p>
        <button className="unlock-btn-shine" onClick={onUnlock}>
          <Zap size={14} fill="black" /> 
          <span>Unlock Now</span>
        </button>
      </div>
    </div>
  );
};

const formatTime = (timeString) => {
  try {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ""; }
};

const getDateLabel = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();
  
  const diffTime = now.setHours(0,0,0,0) - new Date(dateString).setHours(0,0,0,0);
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  
  return date.toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' });
};

// --- MAIN COMPONENT ---
const LiveStoryChatBox = ({ storySlug, onBackBTNSelect = () => {} }) => {
  const [messages, setMessages] = useState([]);
  const [storyDetails, setStoryDetails] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [token, setToken] = useState(null);
  const [isTyping, setIsTyping] = useState(false); 
  const [isLoading, setIsLoading] = useState(true);
  
  // Quota Management
  const [isSubscribed, setIsSubscribed] = useState(false); 
  const [remainingQuota, setRemainingQuota] = useState(5); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState(null);

  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = useCallback((instant = false) => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: instant ? "instant" : "smooth", block: "end" });
    }
  }, []);

  // --- INITIALIZATION ---
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);

    // Get story details from server
    const fetchStoryDetails = async () => {
      try {
        const response = await axios.get(`${api.Url}/live-story/stories/${storySlug}`);
        if (response.data.success) {
          setStoryDetails(response.data.story);
        }
      } catch (error) {
        console.error("Error fetching story metadata:", error);
      }
    };
    if (storySlug) fetchStoryDetails();
    
    if (storySlug) {
      if (storedToken) {
        initializeChatData(storedToken);
      } else {
        setShowLoginModal(true);
        setIsLoading(false);
      }
    }
  }, [storySlug]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- API LOGIC ---
  const initializeChatData = async (authToken) => {
    setIsLoading(true);
    try {
      const chatRes = await axios.get(`${api.Url}/live-story/${storySlug}/chat`, { 
        headers: { Authorization: `Bearer ${authToken}` }
      });
      
      const chatData = chatRes.data?.chat;
      if (chatData?.messages && chatData.messages.length > 0) {
        setMessages(chatData.messages.map(formatMessageData));
      }

      // Quota management from backend response
      const quotaStatus = chatRes.data?.quotaStatus;
      if (quotaStatus) {
         setRemainingQuota(quotaStatus.remainingQuota ?? 5);
         setIsSubscribed(quotaStatus.isSubscriber || false);
      }

    } catch (error) {
      console.error("Init Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatMessageData = (msg) => ({
    _id: msg._id,
    sender: msg.sender === "me" ? "me" : "ai",
    text: msg.text,
    time: msg.time,
    isRead: true, 
  });

  // --- SENDING LOGIC ---
  const handleSendMessage = async () => {
    const text = newMessage;
    if (!text.trim()) return;

    if (!isSubscribed && remainingQuota <= 0) {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const quotaExhaustedReply = {
          _id: `quota-ai-${Date.now()}`,
          sender: "ai",
          text: "You have used your free daily quota of 5 messages. Please subscribe to continue this thrilling story!",
          time: new Date().toISOString(),
          isRead: true,
          isBold: true
        };
        setMessages(prev => [...prev, quotaExhaustedReply]);
      }, 1000);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    const userMsg = {
      _id: tempId,
      sender: "me",
      text: text,
      time: new Date().toISOString(),
      isTemp: true,
      isRead: false
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");
    
    if (!isSubscribed) {
      setRemainingQuota(prev => Math.max(0, prev - 1));
    }

    setMessages(prev => prev.map(m => 
      m._id === tempId ? { ...m, isRead: true } : m
    ));
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${api.Url}/live-story/${storySlug}/chat/send`, 
        { text }, 
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.quotaStatus) {
        setRemainingQuota(response.data.quotaStatus.remainingQuota);
        setIsSubscribed(response.data.quotaStatus.isSubscriber);
      }
      
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...m, _id: response.data?.userMessage?._id || tempId, isTemp: false, isRead: true } : m
      ));

      if (response.data?.aiMessage) {
        setIsTyping(false);
        setMessages(prev => [...prev, formatMessageData(response.data.aiMessage)]);
      }

    } catch (error) {
      console.error("Send Error:", error);
      setIsTyping(false);
      setMessages(prev => prev.filter(m => m._id !== tempId)); 
      
      if (error.response?.status === 403 && error.response?.data?.requireLogin) {
         setShowLoginModal(true);
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!token) return;
    try {
      const response = await axios.delete(
        `${api.Url}/live-story/${storySlug}/chat/message/${messageId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        setMessages(prev => prev.filter(m => m._id !== messageId));
        setActiveMenuId(null);
      }
    } catch (error) {
      console.error("Delete Msg Error:", error);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chat-box-container">
      <style>{STYLES}</style>
      
      {showLoginModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <LoginModal onClose={() => setShowLoginModal(false)} />
        </div>
      )}

      {/* HEADER */}
      <div className="chat-header glass-effect">
        <button className="nav-btn back" onClick={() => onBackBTNSelect(true)}>
          <ArrowLeft size={22} />
        </button>
        
        <div className="header-profile" onClick={() => setShowOverlay(true)}>
          <div className="header-avatar-ring">
            <img 
              src={storyDetails?.poster || "/heartecho_b.png"} 
              alt="Profile" 
              className="header-avatar" 
            />
            <div className={`status-dot ${isTyping ? 'typing' : 'online'}`}></div>
          </div>
          <div className="header-info">
            <h3>{storyDetails?.title || "Live Story"}</h3>
            <span className={`status-text ${isTyping ? 'highlight' : ''}`}>
              {isTyping ? "typing..." : "Online"}
            </span>
          </div>
        </div>
        
        <div className="header-controls">
          <button className="nav-btn" onClick={() => setShowOverlay(true)}><Info size={20} /></button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chat-messages-area" ref={chatContainerRef}>
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing Story...</p>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          <div className="empty-state">
            <img src={storyDetails?.poster} alt="Story Setup" style={{width: 150, borderRadius: 10, marginBottom: 15}}/>
            <h3>{storyDetails?.title}</h3>
            <p>{storyDetails?.description}</p>
            <p style={{fontSize: 12, opacity: 0.7, marginTop: 10}}>* Say Hello to start the story *</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === "me";
            const isLast = index === messages.length - 1;
            
            // Date Separator Logic
            const prevMsg = messages[index - 1];
            const currentDate = new Date(msg.time).toDateString();
            const prevDate = prevMsg ? new Date(prevMsg.time).toDateString() : null;
            const showDateSeparator = currentDate !== prevDate;
            
            return (
              <React.Fragment key={msg._id || index}>
                {showDateSeparator && (
                  <div className="date-separator">
                    <span>{getDateLabel(msg.time)}</span>
                  </div>
                )}
                
                <div 
                  className={`message-row ${isMe ? 'sent' : 'received'}`}
                  ref={isLast ? lastMessageRef : null}
                >
                  {!isMe && (
                    <img 
                      src={storyDetails?.poster || "/heartecho_b.png"} 
                      className="chat-msg-avatar" 
                      alt="Story AI"
                    />
                  )}
                  
                  <div className="message-bubble-wrapper">
                    <div className="message-bubble">
                      <div className="text-content">
                        {/* SPECIFIC BOLD SUPPORT FOR QUOTA MESSAGE */}
                        <p style={{ fontWeight: msg.isBold ? '800' : 'normal' }}>{msg.text}</p>
                        <div className="msg-meta">
                          <span className="time">{formatTime(msg.time)}</span>
                          {isMe && (
                            <span className="ticks">
                              {msg.isRead ? <CheckCheck size={14} className="read" /> : <Check size={14} />}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="msg-options-container">
                      <button 
                        className="msg-options-btn" 
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === msg._id ? null : msg._id);
                        }}
                      >
                        <MoreVertical size={14} />
                      </button>
                      
                      {activeMenuId === msg._id && (
                        <div className="msg-dropdown-menu glass-effect" onClick={(e) => e.stopPropagation()}>
                          <button className="dropdown-item delete" onClick={() => handleDeleteMessage(msg._id)}>
                            <Trash2 size={14} />
                            <span>Delete</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </React.Fragment>
            );
          })
        )}

        {isTyping && (
          <div className="message-row received typing-row">
             <img 
                src={storyDetails?.poster || "/heartecho_b.png"} 
                className="chat-msg-avatar" 
                alt="AI"
              />
            <div className="message-bubble typing-bubble">
              <div className="typing-dots">
                <span></span><span></span><span></span>
              </div>
            </div>
          </div>
        )}
        <div style={{ height: 10 }} ref={lastMessageRef} />
      </div>

      {/* INPUT AREA */}
      <div className="chat-input-area glass-effect">
        {!isSubscribed && (
          <div className="quota-container">
            <span className="quota-label">{remainingQuota} tokens remaining</span>
            <div className="quota-track">
              <div 
                className={`quota-fill ${remainingQuota < 3 ? 'danger' : ''}`} 
                style={{width: `${Math.min((remainingQuota/5)*100, 100)}%`}}
              ></div>
            </div>
          </div>
        )}

        <div className="input-container">
          <div className="input-wrapper">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                isSubscribed 
                  ? "Message..." 
                  : remainingQuota > 0 
                    ? "Type a message..." 
                    : "Out of tokens"
              }
              disabled={isTyping || (!isSubscribed && remainingQuota <= 0)}
            />
          </div>

          {!isSubscribed && remainingQuota <= 0 ? (
            <button 
                className="send-btn active" 
                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'black' }}
                onClick={() => router.push("/subscribe")}
            >
                <Zap size={20} fill="black" />
            </button>
          ) : (
            <button 
                className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || isTyping}
            >
                <Send size={20} fill={newMessage.trim() ? "white" : "none"} />
            </button>
          )}
        </div>
      </div>

      {/* PROFILE OVERLAY */}
      <div 
        className={`profile-overlay-backdrop ${showOverlay ? 'active' : ''}`} 
        onClick={() => setShowOverlay(false)}
      >
        <div className={`profile-modal ${showOverlay ? 'slide-up' : ''}`} onClick={e => e.stopPropagation()}>
          <button className="modal-close-btn" onClick={() => setShowOverlay(false)}>
            <X size={24} />
          </button>
          <div className="modal-scroll-content">
            <div className="portrait-image-wrapper">
              <img 
                src={storyDetails?.poster || "/heartecho_b.png"} 
                alt="Story Poster" 
                className="portrait-image" 
              />
              <div className="portrait-gradient-overlay"></div>
              <div className="portrait-name-overlay">
                <h2>{storyDetails?.title || "Live Story"}</h2>
                <span className="portrait-role">
                  {storyDetails?.category || "Interactive Story"}
                </span>
              </div>
            </div>
            <div className="profile-details-grid">
              <div className="detail-card">
                <span className="label">Views</span>
                <span className="value">{storyDetails?.views || "N/A"}</span>
              </div>
              <div className="detail-card">
                <span className="label">Quota Limit</span>
                <span className="value quota-value">{isSubscribed ? "∞" : remainingQuota}</span>
              </div>
              <div className="detail-card full">
                <span className="label">Description</span>
                <p className="bio-text">
                  {storyDetails?.description || "Experience this thrilling journey through an interactive text adventure."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LiveStoryChatBox;

// --- STYLES ---
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --bg-app: #09090b; 
  --bg-header: rgba(9, 9, 11, 0.9);
  --accent: #ec4899; 
  --accent-grad: linear-gradient(135deg, #ec4899, #be185d);
  --msg-me: #3f3f46; 
  --msg-ai: #18181b; 
  --text: #f4f4f5;
  --text-muted: #a1a1aa;
  --green-online: #22c55e;
  --glass-border: rgba(255, 255, 255, 0.08);
  --bg-card: #121212;
  --primary: #cf4185;
}

/* Base Layout */
.chat-box-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  height: 100dvh;
  background-color: var(--bg-app);
  color: var(--text);
  font-family: 'Inter', sans-serif;
  overflow: hidden;
  position: relative;
}

/* Glass Header */
.chat-header {
  flex-shrink: 0;
  height: 60px;
  display: flex;
  align-items: center;
  padding: 0 12px;
  justify-content: space-between;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  z-index: 50;
  backdrop-filter: blur(12px);
  background: var(--bg-header);
}

.header-profile { display: flex; align-items: center; gap: 10px; cursor: pointer; flex: 1; margin-left: 8px; }
.header-avatar-ring { position: relative; flex-shrink: 0; }
.header-avatar { width: 38px; height: 38px; border-radius: 50%; object-fit: cover; border: 1px solid rgba(255,255,255,0.1); }
.status-dot { position: absolute; bottom: 1px; right: 1px; width: 10px; height: 10px; background: var(--green-online); border-radius: 50%; border: 2px solid var(--bg-app); }
.status-dot.typing { background: var(--accent); animation: pulse 1s infinite; }
.header-info h3 { margin: 0; font-size: 15px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 180px; }
.status-text { font-size: 11px; color: var(--text-muted); }
.status-text.highlight { color: var(--accent); font-weight: 500; }
.nav-btn { background: none; border: none; color: var(--text); padding: 8px; border-radius: 50%; cursor: pointer; flex-shrink: 0; }
.nav-btn:hover { background: rgba(255,255,255,0.1); }

/* Messages Area */
.chat-messages-area {
  flex: 1; overflow-y: auto; padding: 16px 12px;
  display: flex; flex-direction: column; gap: 8px;
  background-image: radial-gradient(rgba(255,255,255,0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}
.message-row { display: flex; gap: 8px; max-width: 85%; align-items: flex-end; animation: slideIn 0.2s ease-out; }
.message-row.sent { align-self: flex-end; flex-direction: row-reverse; }

.date-separator {
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 16px 0;
  position: relative;
}
.date-separator::before {
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.05);
  z-index: 1;
}
.date-separator span {
  background: var(--bg-app);
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 11px;
  color: var(--text-muted);
  font-weight: 600;
  position: relative;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.chat-msg-avatar { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; margin-bottom: 4px; flex-shrink: 0; }

/* Text Bubble */
.message-bubble { padding: 10px 14px; border-radius: 18px; position: relative; font-size: 15px; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.received .message-bubble { background: var(--msg-ai); border-bottom-left-radius: 4px; color: var(--text); border: 1px solid rgba(255,255,255,0.05); }
.sent .message-bubble { background: var(--accent-grad); border-bottom-right-radius: 4px; color: white; }
.text-content p { margin: 0; word-wrap: break-word; }
.msg-meta { display: flex; justify-content: flex-end; align-items: center; gap: 4px; margin-top: 4px; opacity: 0.7; }
.time { font-size: 10px; }
.ticks .read { color: #87CEEB; }

.message-bubble-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  gap: 4px;
}
.sent .message-bubble-wrapper { flex-direction: row; }
.received .message-bubble-wrapper { flex-direction: row-reverse; }

.msg-options-container {
  opacity: 0;
  transition: opacity 0.2s;
  position: relative;
}
.message-row:hover .msg-options-container { opacity: 1; }

.msg-options-btn {
  background: none;
  border: none;
  color: var(--text-muted);
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.msg-options-btn:hover { background: rgba(255,255,255,0.1); color: #fff; }

.msg-dropdown-menu {
  position: absolute;
  top: 100%;
  z-index: 100;
  min-width: 100px;
  background: rgba(24, 24, 27, 0.95);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.4);
}
.sent .msg-dropdown-menu { right: 0; }
.received .msg-dropdown-menu { left: 0; }

.dropdown-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border: none;
  background: none;
  color: var(--text);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  border-radius: 8px;
}
.dropdown-item:hover { background: rgba(255,255,255,0.05); }
.dropdown-item.delete { color: #ef4444; }
.dropdown-item.delete:hover { background: rgba(239, 68, 68, 0.1); }

/* Premium Lock */
.premium-lock-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 20; background: rgba(0,0,0,0.2); }
.glass-lock-card { background: rgba(20, 20, 20, 0.75); backdrop-filter: blur(10px); padding: 16px; border-radius: 20px; text-align: center; border: 1px solid rgba(255, 215, 0, 0.3); width: 85%; display: flex; flex-direction: column; align-items: center; gap: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.lock-icon-glow { width: 36px; height: 36px; background: rgba(255, 215, 0, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); margin-bottom: 4px; }
.glass-lock-card h4 { margin: 0; color: #fff; font-size: 14px; font-weight: 700; }
.glass-lock-card p { margin: 0; color: #ccc; font-size: 11px; margin-bottom: 8px; }
.unlock-btn-shine { background: linear-gradient(135deg, #FFD700, #FFA500); border: none; padding: 8px 14px; border-radius: 20px; color: #000; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 4px; cursor: pointer; box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3); transition: transform 0.2s; }
.unlock-btn-shine:active { transform: scale(0.95); }

/* Input area overrides for live story */
.chat-input-area { padding: 12px; display: flex; flex-direction: column; gap: 8px; border-top: 1px solid rgba(255,255,255,0.06); background: var(--bg-header); flex-shrink: 0; backdrop-filter: blur(12px); z-index: 50; }
.input-container { display: flex; align-items: center; gap: 8px; }
.input-wrapper { flex: 1; background: var(--bg-app); border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; padding: 8px 16px; display: flex; align-items: center; }
.input-wrapper input { width: 100%; background: transparent; border: none; color: white; font-size: 15px; outline: none; }
.input-wrapper input::placeholder { color: rgba(255,255,255,0.3); }
.send-btn { width: 40px; height: 40px; border-radius: 50%; background: rgba(255,255,255,0.1); border: none; display: flex; align-items: center; justify-content: center; color: white; transition: all 0.2s; flex-shrink: 0; }
.send-btn.active { background: var(--accent); cursor: pointer; }

/* Quota Area */
.quota-container { display: flex; justify-content: space-between; align-items: center; padding: 0 8px; margin-bottom: 4px; }
.quota-label { font-size: 11px; color: rgba(255,255,255,0.6); }
.quota-track { flex: 0 0 100px; height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px; overflow: hidden; margin-left: 10px; }
.quota-fill { height: 100%; background: #4ADE80; border-radius: 2px; transition: width 0.3s ease; }
.quota-fill.danger { background: #EF4444; }

/* Empty state */
.empty-state { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; color: rgba(255,255,255,0.5); padding: 20px; }
.empty-state h3 { color: white; margin-bottom: 5px; font-weight: 600; }

/* Spinner */
.loading-state { flex: 1; display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 10px; color: rgba(255,255,255,0.5); }
.spinner { width: 24px; height: 24px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Profile modal / overlay basics (same as chatbox) */
.profile-overlay-backdrop { position: absolute; inset: 0; background: rgba(0,0,0,0.6); z-index: 100; backdrop-filter: blur(4px); display: none; opacity: 0; transition: opacity 0.3s; }
.profile-overlay-backdrop.active { display: block; opacity: 1; }
.profile-modal { position: absolute; bottom: 0; left: 0; right: 0; background: var(--bg-card); border-top-left-radius: 24px; border-top-right-radius: 24px; max-height: 85vh; display: flex; flex-direction: column; transform: translateY(100%); transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
.profile-modal.slide-up { transform: translateY(0); }
.modal-close-btn { position: absolute; top: 16px; right: 16px; background: rgba(0,0,0,0.5); border: none; color: white; width: 32px; height: 32px; border-radius: 16px; display: flex; align-items: center; justify-content: center; z-index: 10; cursor: pointer; }
.modal-scroll-content { overflow-y: auto; padding-bottom: 30px; }
.portrait-image-wrapper { position: relative; width: 100%; height: 280px; }
.portrait-image { width: 100%; height: 100%; object-fit: cover; }
.portrait-gradient-overlay { position: absolute; inset: 0; background: linear-gradient(to top, var(--bg-card) 0%, transparent 100%); }
.portrait-name-overlay { position: absolute; bottom: 20px; left: 20px; right: 20px; }
.portrait-name-overlay h2 { margin: 0 0 4px; font-size: 24px; color: white; }
.portrait-role { color: var(--accent); font-weight: 500; font-size: 14px; }
.profile-details-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; padding: 20px; }
.detail-card { background: rgba(255,255,255,0.03); padding: 12px 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05); }
.detail-card.full { grid-column: span 2; }
.detail-card .label { display: block; font-size: 11px; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.5px; }
.detail-card .value { font-size: 15px; font-weight: 600; color: white; }
.detail-card .quota-value { color: var(--accent); font-size: 18px; }
.bio-text { font-size: 14px; line-height: 1.6; color: rgba(255,255,255,0.8); margin: 0; }
`
