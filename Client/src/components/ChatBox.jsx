'use client';

import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";
import axios from "axios";
import api from "../config/api";
import PopNoti from "./PopNoti";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCopy, FiTrash2, FiX, FiMoreVertical, FiSend, FiEye, FiEyeOff, FiVideo, FiImage } from "react-icons/fi";
import AdvancedLoader from "./AdvancedLoader";

const ChatBox = ({ chatId, onBackBTNSelect, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const overlayRef = useRef(null);
  const [token, setToken] = useState(null);
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const menuRef = useRef(null);
  const router = useRouter();
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [remainingQuota, setRemainingQuota] = useState(20); // Default quota

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    setToken(token);
    
    // Check subscription status
    if (token) {
      checkSubscriptionStatus(token);
    }
  }, []);

  const checkSubscriptionStatus = async (userToken) => {
    try {
      const response = await axios.get(`${api.Url}/user/subscription/status`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setIsSubscribed(response.data?.isSubscribed || false);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsSubscribed(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedMessage(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (chatId && token) {
      initializeChatData();
    }
  }, [chatId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ 
        behavior: "smooth",
        block: "end"
      });
    }
  };

  const initializeChatData = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    
    try {
      const progressInterval = setInterval(() => {
        setLoadingProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      await Promise.all([
        fetchChatData(),
        fetchAiModelDetails()
      ]);

      clearInterval(progressInterval);
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 300);
      
    } catch (error) {
      console.error("Error initializing chat data:", error);
      setNotification({ 
        show: true, 
        message: "Failed to load chat. Please try again.", 
        type: "error" 
      });
      setIsLoading(false);
    }
  };

  const fetchChatData = async () => {
    try {
      const response = await axios.get(`${api.Url}/user/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      setMessages((prevMessages) => {
        const newMessages = response.data?.chat?.messages || [];
        const uniqueMessages = [...new Map([...prevMessages, ...newMessages].map(msg => [msg.time, msg])).values()];
        return uniqueMessages;
      });
      
      setLoadingProgress(prev => Math.min(prev + 30, 90));
      
    } catch (error) {
      console.error("Error fetching chat data:", error);
      if (error.code === 'ECONNABORTED') {
        throw new Error('Chat data request timed out');
      }
      throw error;
    }
  };

  const fetchAiModelDetails = async () => {
    try {
      const response = await axios.get(`${api.Url}/ai/detials/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      
      setUserProfile(response.data?.AiInfo || {});
      setLoadingProgress(prev => Math.min(prev + 30, 90));
      
    } catch (error) {
      console.error("Error fetching AI details:", error);
      setUserProfile({ 
        name: "AI Companion", 
        avatar_img: "/heartecho_b.png",
        description: "Your AI companion is ready to chat with you."
      });
      setLoadingProgress(prev => Math.min(prev + 30, 90));
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const tempMsg = {
      sender: "me",
      text: newMessage,
      time: new Date().toISOString(),
      isLoading: true,
    };

    setMessages((prevMessages) => [...prevMessages, tempMsg]);
    setNewMessage("");
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${api.Url}/ai/${chatId}/send`,
        { text: newMessage },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }
      );

      const newMessages = response.data.messages.filter(
        (newMsg) => !messages.some((msg) => msg.time === newMsg.time)
      );

      // Update remaining quota from response
      if (response.data.remainingQuota !== undefined) {
        setRemainingQuota(response.data.remainingQuota);
      }

      onSendMessage();
      setIsTyping(false);
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !msg.isLoading),
        ...newMessages,
      ]);

      // Auto-scroll after new messages
      setTimeout(scrollToBottom, 100);

    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      
      if (error.response && error.response.status === 403) {
        const errorMessage = error.response.data?.message || "Your daily message quota is over. Try again tomorrow!";
        setNotification({ 
          show: true, 
          message: errorMessage, 
          type: "error" 
        });
        
        // Update quota to 0 if quota exceeded
        setRemainingQuota(0);
    
        setTimeout(() => {
          router.push("/subscribe?re=quotaover");
        }, 2000); 
      } else {
        setNotification({ 
          show: true, 
          message: "Failed to get a response. Try again.", 
          type: "error" 
        });
      }
    
      setMessages((prevMessages) =>
        prevMessages
          .filter((msg) => !msg.isLoading)
          .concat({
            sender: chatId,
            text: "Sorry, I'm having trouble responding right now. Please try again.",
            time: new Date().toISOString(),
          })
      );
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${api.Url}/user/chats/${chatId}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(messages.filter((msg) => msg._id !== messageId));
      setNotification({ show: true, message: "Message deleted", type: "success" });
    } catch (error) {
      console.error("Error deleting message:", error);
      setNotification({ show: true, message: "Failed to delete message", type: "error" });
    }
  };

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setNotification({ show: true, message: "Message copied!", type: "success" });
      })
      .catch(err => console.error("Error copying text: ", err));
  };

  const handleSubscribeRedirect = () => {
    router.push("/subscribe");
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Check if user can view media based on quota and subscription
  const canViewMedia = (message) => {
    if (isSubscribed) return true;
    if (message.visibility === "show") return true;
    if (remainingQuota > 0) return true;
    return false;
  };

  // Get media cost information
  const getMediaCostInfo = (message) => {
    if (isSubscribed) return "Premium User - Unlimited Access";
    
    if (message.imgUrl) {
      return remainingQuota >= 5 ? `Cost: 5 messages (${remainingQuota} remaining)` : "Need 5 messages to view";
    }
    
    if (message.videoUrl) {
      return remainingQuota >= 10 ? `Cost: 10 messages (${remainingQuota} remaining)` : "Need 10 messages to view";
    }
    
    return "";
  };

  // Render media content based on visibility and quota
  const renderMediaContent = (message) => {
    const canView = canViewMedia(message);
    const costInfo = getMediaCostInfo(message);

    if (message.videoUrl && canView) {
      return (
        <div className="media-container">
          <video 
            src={message.videoUrl} 
            controls 
            className="media-content"
            poster={message.thumbnailUrl}
          >
            Your browser does not support the video tag.
          </video>
          <div className="media-info">
            <span className="media-time">{formatTime(message.time)}</span>
            {!isSubscribed && (
              <span className="quota-cost">{costInfo}</span>
            )}
          </div>
        </div>
      );
    } else if (message.videoUrl && !canView) {
      return (
        <div className="media-container premium-media">
          <div className="media-blur-overlay">
            <video 
              src={message.videoUrl} 
              className="media-content blurred-media"
            />
            <div className="premium-lock-content">
              <FiEyeOff size={32} className="premium-icon" />
              <p className="premium-text">
                {remainingQuota === 0 
                  ? "Daily message quota exhausted!" 
                  : "Subscribe or use message quota to view this video"}
              </p>
              <p className="quota-info">Videos cost 10 messages</p>
              <div className="premium-buttons">
                <button 
                  className="subscribe-btn-media primary"
                  onClick={handleSubscribeRedirect}
                >
                  Subscribe Now
                </button>
                {remainingQuota > 0 && (
                  <button 
                    className="subscribe-btn-media secondary"
                    onClick={() => setNotification({
                      show: true,
                      message: `You have ${remainingQuota} messages remaining. Videos cost 10 messages.`,
                      type: "info"
                    })}
                  >
                    Use Message Quota
                  </button>
                )}
              </div>
            </div>
          </div>
          <span className="media-time">{formatTime(message.time)}</span>
        </div>
      );
    } else if (message.imgUrl && canView) {
      return (
        <div className="media-container">
          <img 
            src={message.imgUrl} 
            alt="AI generated" 
            className="media-content"
          />
          <div className="media-info">
            <span className="media-time">{formatTime(message.time)}</span>
            {!isSubscribed && (
              <span className="quota-cost">{costInfo}</span>
            )}
          </div>
        </div>
      );
    } else if (message.imgUrl && !canView) {
      return (
        <div className="media-container premium-media">
          <div className="media-blur-overlay">
            <img 
              src={message.imgUrl} 
              alt="AI generated" 
              className="media-content blurred-media"
            />
            <div className="premium-lock-content">
              <FiEyeOff size={32} className="premium-icon" />
              <p className="premium-text">
                {remainingQuota === 0 
                  ? "Daily message quota exhausted!" 
                  : "Subscribe or use message quota to view this image"}
              </p>
              <p className="quota-info">Images cost 5 messages</p>
              <div className="premium-buttons">
                <button 
                  className="subscribe-btn-media primary"
                  onClick={handleSubscribeRedirect}
                >
                  Subscribe Now
                </button>
                {remainingQuota > 0 && (
                  <button 
                    className="subscribe-btn-media secondary"
                    onClick={() => setNotification({
                      show: true,
                      message: `You have ${remainingQuota} messages remaining. Images cost 5 messages.`,
                      type: "info"
                    })}
                  >
                    Use Message Quota
                  </button>
                )}
              </div>
            </div>
          </div>
          <span className="media-time">{formatTime(message.time)}</span>
        </div>
      );
    }
    
    // Regular text message
    return (
      <div className="message-content">
        <p>{message.text}</p>
        <span className="message-time">{formatTime(message.time)}</span>
      </div>
    );
  };

  const LoadingState = () => (
    <div className="chat-loading-container">
      <AdvancedLoader 
        variant="spinner"
        size="large"
        color="primary"
        text={`Loading chat...`}
        overlay={false}
      />
    </div>
  );

  return (
    <div className="chat-box-container">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      {isLoading ? (
        <LoadingState />
      ) : (
        <>
          <div className="chat-header">
            <button className="back-btn" onClick={() => onBackBTNSelect(true)}>
              <FiArrowLeft size={20} />
            </button>
            <div className="user-info" onClick={() => setShowOverlay(true)}>
              <img 
                src={userProfile?.avatar_img || "/heartecho_b.png"} 
                alt={userProfile?.name || "User"} 
                className="user-avatar" 
              />
              <div className="user-details">
                <h3>{userProfile?.name || "AI Companion"}</h3>
                <p>{isTyping ? "Typing..." : "Online"}</p>
              </div>
            </div>
           
          </div>

          {showOverlay && (
            <div className="profile-overlay" ref={overlayRef}>
              <div className="overlay-header">
                <button className="close-btn" onClick={() => setShowOverlay(false)}>
                  <FiX size={24} />
                </button>
              </div>
              <div className="overlay-content">
                <div className="profile-image-container">
                  <img 
                    src={userProfile?.avatar_img || "/heartecho_b.png"} 
                    alt={userProfile?.name || "User"} 
                    className="profile-image"
                  />
                </div>
                <div className="profile-details">
                  <h2>{userProfile?.name || "AI Companion"}</h2>
                  <div className="detail-item">
                    <span className="detail-label">Age:</span>
                    <span className="detail-value">{userProfile?.age || "N/A"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Personality:</span>
                    <span className="detail-value">{userProfile?.relationship || "AI Assistant"}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Interests:</span>
                    <span className="detail-value">
                      {Array.isArray(userProfile?.interests)
                        ? userProfile.interests.join(", ")
                        : userProfile?.interests?.replace(/([a-z])([A-Z])/g, '$1 $2') || "Conversation, Assistance, Learning"}
                    </span>
                  </div>
                  <div className="detail-item full-width">
                    <span className="detail-label">About:</span>
                    <p className="detail-value">{userProfile?.description || "Your AI companion is here to help and chat with you."}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="chat-messages" ref={chatContainerRef}>
            {messages.length === 0 ? (
              <div className="empty-state-wffinf">
                <div className="welcome-message-wffinf">
                  <h3 className="welcome-title-wffinf">
                    Welcome to your chat with {userProfile?.name || "AI Companion"}! <span className="welcome-emoji-wffinf">👋</span>
                  </h3>
                  <p className="welcome-subtitle-wffinf">
                    Start a meaningful conversation by sending your first message below.
                    {!isSubscribed && (
                      <span className="quota-notice"> You have {remainingQuota} free messages today.</span>
                    )}
                  </p>
                  <div className="suggestion-chips-wffinf">
                    <button 
                      className="suggestion-chip-wffinf"
                      onClick={() => setNewMessage("Hello! How are you doing today?")}
                    >
                      <span className="chip-icon-wffinf">💬</span>
                      Hello! How are you doing today?
                    </button>
                    <button 
                      className="suggestion-chip-wffinf"
                      onClick={() => setNewMessage("/photo Can you show me a beautiful image?")}
                    >
                      <span className="chip-icon-wffinf"><FiImage /></span>
                      Ask for an image (Cost: 5 messages)
                    </button>
                    <button 
                      className="suggestion-chip-wffinf"
                      onClick={() => setNewMessage("/video Can you show me a video?")}
                    >
                      <span className="chip-icon-wffinf"><FiVideo /></span>
                      Ask for a video (Cost: 10 messages)
                    </button>
                    <button 
                      className="suggestion-chip-wffinf"
                      onClick={() => setNewMessage("What kind of conversations can we have?")}
                    >
                      <span className="chip-icon-wffinf">💡</span>
                      What can you help me with?
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div 
                  key={index} 
                  className={`message ${msg.sender === chatId ? "received" : "sent"} ${msg.videoUrl || msg.imgUrl ? 'media-message has-media' : ''}`}
                  ref={index === messages.length - 1 ? lastMessageRef : null}
                  onMouseEnter={() => setHoveredMessage(msg._id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  {renderMediaContent(msg)}
                  
                  {hoveredMessage === msg._id && !msg.videoUrl && !msg.imgUrl && (
                    <button 
                      className="message-options-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMessage(msg._id);
                      }}
                    >
                      <FiMoreVertical size={16} />
                    </button>
                  )}
                  
                  {selectedMessage === msg._id && (
                    <div className="message-menu" ref={menuRef}>
                      <button onClick={() => handleCopyMessage(msg.text)}>
                        <FiCopy size={14} /> Copy
                      </button>
                      <button onClick={() => handleDeleteMessage(msg._id)}>
                        <FiTrash2 size={14} /> Delete
                      </button>
                    </div>
                  )}
                </div>
              ))          
            )}
            <div ref={lastMessageRef} />
          </div>

          <div className="chat-input-container">
            
            
            <div className="input-wrapper">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                placeholder={isSubscribed 
                  ? "Type a message..." 
                  : `Type a message... (${remainingQuota} remaining)`}
                disabled={isTyping || (!isSubscribed && remainingQuota === 0)}
              />
              <button 
                onClick={handleSendMessage} 
                disabled={!newMessage.trim() || isTyping || (!isSubscribed && remainingQuota === 0)}
                className={`send-btn ${isTyping ? 'sending' : ''} ${(!isSubscribed && remainingQuota === 0) ? 'quota-exhausted' : ''}`}
              >
                {isTyping ? (
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                ) : (
                  <FiSend size={18} />
                )}
              </button>
            </div>
            <div className="input-hints">
              <span className="hint-text">Use <code>/photo</code> for images (5 messages)</span>
              <span className="hint-text">Use <code>/video</code> for videos (10 messages)</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;