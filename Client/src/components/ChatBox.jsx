'use client';

import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { 
  ArrowLeft, Copy, Trash2, X, MoreVertical, 
  Send, EyeOff, Video, Image as ImageIcon, Info,
  Lock, Zap, ArrowDown
} from "lucide-react";
import api from "../config/api";

const useRouter = () => ({
  push: (path) => window.location.href = path
});

const PopNoti = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;
  return (
    <div style={{
      position: 'fixed', top: '20px', left: '50%', transform: 'translateX(-50%)',
      padding: '12px 24px', borderRadius: '8px', 
      background: type === 'error' ? '#ff4d4d' : type === 'success' ? '#00e676' : '#2196f3',
      color: 'white', zIndex: 2000, boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
      display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '500'
    }}>
      <span>{message}</span>
      <button onClick={onClose} style={{background:'none', border:'none', color:'white', cursor:'pointer'}}>
        <X size={16} />
      </button>
    </div>
  );
};

const AdvancedLoader = ({ text }) => (
  <div style={{display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px'}}>
    <div className="spinner"></div>
    <span style={{color: '#cf4185', fontSize: '0.9rem', letterSpacing: '0.5px'}}>{text}</span>
    <style>{`
      .spinner {
        width: 40px; height: 40px;
        border: 3px solid rgba(207, 65, 133, 0.3);
        border-radius: 50%;
        border-top-color: #cf4185;
        animation: spin 1s ease-in-out infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `}</style>
  </div>
);

// --- MAIN COMPONENT ---

const ChatBox = ({ chatId, onBackBTNSelect = () => {}, onSendMessage = () => {} }) => {
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
  
  // Subscription & Quota State
  const [isSubscribed, setIsSubscribed] = useState(false); 
  const [remainingQuota, setRemainingQuota] = useState(20);

  // Scroll to bottom button state
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Costs
  const COST_IMAGE = 5;
  const COST_VIDEO = 10;

  // --- Backend Integration ---
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
    setToken(token);
    
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

  // Scroll to bottom when messages load initially
  useEffect(() => {
    if (messages.length > 0 && isInitialLoad) {
      // Small delay to ensure DOM is fully rendered
      setTimeout(() => {
        scrollToBottom(true);
        setIsInitialLoad(false);
      }, 100);
    }
  }, [messages.length, isInitialLoad]);

  // Scroll to bottom when new messages are added (not on initial load)
  useEffect(() => {
    if (messages.length > 0 && !isInitialLoad) {
      scrollToBottom();
    }
  }, [messages.length]);

  // Scroll event listener to show/hide scroll down button
  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      // Show button if scrolled up more than 100px from bottom
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollDown(isScrolledUp);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToBottom = (instant = false) => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ 
        behavior: instant ? "instant" : "smooth",
        block: "end"
      });
    }
    // Hide scroll down button when we scroll to bottom
    setShowScrollDown(false);
  };

  const handleScrollDownClick = () => {
    scrollToBottom();
  };

  const initializeChatData = async () => {
    setIsLoading(true);
    setLoadingProgress(0);
    setIsInitialLoad(true);
    
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

      const chatData = response.data?.chat;
      if (chatData && chatData.messages) {
        // Transform messages to match our frontend format
        const transformedMessages = chatData.messages.map(msg => ({
          _id: msg._id,
          sender: msg.senderModel === "User" ? "me" : "ai",
          senderModel: msg.senderModel,
          text: msg.text,
          time: msg.time,
          mediaType: msg.mediaType,
          imgUrl: msg.imgUrl,
          videoUrl: msg.videoUrl,
          visibility: msg.visibility,
          accessLevel: msg.accessLevel,
          status: msg.status
        }));

        setMessages(transformedMessages);
      }
      
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
        description: "Your AI companion is ready to chat with you.",
        relationship: "AI Assistant",
        age: "N/A",
        interests: ["Conversation", "Assistance", "Learning"]
      });
      setLoadingProgress(prev => Math.min(prev + 30, 90));
    }
  };

  const handleSendMessage = async (customText = null) => {
    const textToSend = customText || newMessage;
    if (!textToSend.trim()) return;

    // Optimistic UI update
    const tempMsg = {
      _id: `temp-${Date.now()}`,
      sender: "me",
      senderModel: "User",
      text: textToSend,
      time: new Date().toISOString(),
      mediaType: "text",
      isLoading: true,
    };

    setMessages(prev => [...prev, tempMsg]);
    setNewMessage("");
    setIsTyping(true);

    try {
      const response = await axios.post(
        `${api.Url}/ai/${chatId}/send`,
        { text: textToSend },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000
        }
      );

      // Update remaining quota from response
      if (response.data.remainingQuota !== undefined) {
        setRemainingQuota(response.data.remainingQuota);
      }

      // Fetch updated chat data to get all new messages
      await fetchChatData();
      
      onSendMessage();
      setIsTyping(false);

    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      
      // Remove optimistic message on error
      setMessages(prev => prev.filter(msg => !msg.isLoading));
      
      if (error.response && error.response.status === 403) {
        const errorMessage = error.response.data?.message || "Your daily message quota is over. Try again tomorrow!";
        setNotification({ 
          show: true, 
          message: errorMessage, 
          type: "error" 
        });
        
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
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(`${api.Url}/user/chats/${chatId}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(messages.filter((msg) => msg._id !== messageId));
      setNotification({ show: true, message: "Message deleted", type: "success" });
      setSelectedMessage(null);
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

  const handleMediaRequest = (type) => {
      if (type === 'image') {
          handleSendMessage("/photo Can you show me a beautiful image?");
      } else {
          handleSendMessage("/video Can you show me a video?");
      }
  };

  const formatTime = (timeString) => {
    try {
        return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) { 
        return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  };

  // Check if user can view media based on quota and subscription
  const canViewMedia = (message) => {
    if (isSubscribed) return true;
    if (message.visibility === "show") return true;
    if (remainingQuota > 0) return true;
    return false;
  };

  const renderMediaContent = (message) => {
    const isImage = message.mediaType === "image" || !!message.imgUrl;
    const isVideo = message.mediaType === "video" || !!message.videoUrl;
    
    if (!isImage && !isVideo) {
        return (
            <div className="text-content">
                <p>{message.text}</p>
                <span className="message-time">{formatTime(message.time)}</span>
            </div>
        );
    }

    const cost = isVideo ? COST_VIDEO : COST_IMAGE;
    const hasAccess = canViewMedia(message);
    const url = isImage ? message.imgUrl : message.videoUrl;

    // Check if this is a quota error message
    const isQuotaError = message.text?.includes("don't have enough message quota");

    if (isQuotaError) {
        return (
            <div className="text-content quota-error">
                <p>{message.text}</p>
                <span className="message-time">{formatTime(message.time)}</span>
            </div>
        );
    }

    return (
      <div className={`media-container ${!hasAccess ? 'locked' : ''}`}>
           {hasAccess ? (
             isImage ? (
                <img src={url} alt="AI Generated" className="media-content" />
             ) : (
                <video src={url} controls className="media-content" />
             )
           ) : (
             <div className="premium-lock-wrapper">
                <div className="media-blur-bg" style={{backgroundImage: `url(${url})`}}></div>
                <div className="lock-overlay-content">
                   <div className="lock-icon-circle">
                      <Lock size={24} color="#FFD700" />
                   </div>
                   <h4 className="lock-title">{remainingQuota === 0 ? "Quota Exceeded" : "Premium Content"}</h4>
                   <p className="lock-desc">
                       {remainingQuota === 0 
                         ? "You have run out of messages." 
                         : `Requires ${cost} messages. You have ${remainingQuota}.`}
                   </p>
                   <button className="unlock-btn" onClick={handleSubscribeRedirect}>
                       <Zap size={16} fill="black" /> Subscribe to Unlock
                   </button>
                </div>
             </div>
           )}
           <div className="media-footer">
               <span className="media-time">{formatTime(message.time)}</span>
               {!isSubscribed && hasAccess && (
                   <span className="quota-badge">-{cost} Quota</span>
               )}
           </div>
      </div>
    );
  };

  // Filter out quota error messages from regular display since they're handled in renderMediaContent
  const displayMessages = messages.filter(msg => 
    !msg.text?.includes("don't have enough message quota")
  );

  // --- Styles Injection ---
  const styles = `
    /* --- VARIABLES --- */
    :root {
      --bg-dark: #050505;
      --bg-card: #121212;
      --primary: #cf4185;
      --primary-glow: rgba(207, 65, 133, 0.4);
      --text-main: #ffffff;
      --text-muted: #a1a1a1;
      --glass-bg: rgba(20, 20, 20, 0.7);
      --glass-border: rgba(255, 255, 255, 0.08);
      --msg-received: #1e1e1e;
      --msg-sent: #cf4185;
      --danger: #ff4d4d;
      --gold: #FFD700;
    }

    /* --- CONTAINER --- */
    .chat-box-container {
      display: flex;
      flex-direction: column;
      height: 100vh;
      height: 100dvh;
      background-color: var(--bg-dark);
      color: var(--text-main);
      font-family: 'Inter', sans-serif;
      position: relative;
      overflow: hidden;
      background-image: 
        radial-gradient(circle at 10% 20%, rgba(207, 65, 133, 0.05) 0%, transparent 20%),
        radial-gradient(circle at 90% 80%, rgba(65, 105, 225, 0.05) 0%, transparent 20%);
    }

    .chat-loading-screen {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
    }

    /* Scroll Down Button */
    .scroll-down-btn {
      position: absolute;
      bottom: 80px;
      right: 20px;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      background: var(--primary);
      border: none;
      color: white;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 15px rgba(207, 65, 133, 0.3);
      z-index: 90;
      transition: all 0.3s ease;
      opacity: 0;
      transform: translateY(10px);
    }

    .scroll-down-btn.visible {
      opacity: 1;
      transform: translateY(0);
    }

    .scroll-down-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(207, 65, 133, 0.4);
    }

    /* --- GLASS HEADER --- */
    .chat-header {
      height: 70px;
      display: flex;
      align-items: center;
      padding: 0 1rem;
      justify-content: space-between;
      z-index: 50;
      border-bottom: 1px solid var(--glass-border);
    }

    .glass-effect {
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
    }

    .nav-btn {
      background: transparent;
      border: none;
      color: var(--text-main);
      padding: 10px;
      border-radius: 50%;
      cursor: pointer;
      transition: background 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .nav-btn:hover { background: rgba(255,255,255,0.1); }

    .header-profile {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 12px;
      cursor: pointer;
    }

    .header-avatar-ring {
      position: relative;
      width: 42px;
      height: 42px;
    }

    .header-avatar {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      object-fit: cover;
      border: 2px solid var(--primary);
    }

    .status-dot {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 2px solid var(--bg-dark);
    }

    .status-dot.online { background: #00e676; }
    .status-dot.typing { background: var(--primary); animation: pulse 1s infinite; }

    .header-info { text-align: left; }
    .header-info h3 { margin: 0; font-size: 1rem; font-weight: 600; }
    .status-text { font-size: 0.75rem; color: var(--primary); font-weight: 500; }

    /* --- PROFILE OVERLAY (9:16 LOGIC) --- */
    .profile-overlay-backdrop {
      position: absolute;
      top: 0; left: 0; width: 100%; height: 100%;
      background: rgba(0,0,0,0.8);
      backdrop-filter: blur(5px);
      z-index: 100;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile-overlay-backdrop.active {
      opacity: 1;
      pointer-events: auto;
    }

    .profile-modal {
      width: 100%;
      max-width: 420px;
      height: 100%;
      max-height: 850px;
      background: var(--bg-card);
      position: relative;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      transform: translateY(100%);
      transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1);
      box-shadow: 0 0 50px rgba(0,0,0,0.5);
    }

    @media (min-width: 480px) {
        .profile-modal {
            height: 90vh;
            border-radius: 24px;
            border: 1px solid var(--glass-border);
        }
    }

    .profile-modal.slide-up { transform: translateY(0); }

    .modal-close-btn {
      position: absolute;
      top: 15px;
      right: 15px;
      z-index: 20;
      background: rgba(0,0,0,0.5);
      border: none;
      color: white;
      width: 36px; height: 36px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      backdrop-filter: blur(4px);
    }

    .modal-scroll-content {
      overflow-y: auto;
      height: 100%;
    }

    /* 9:16 IMAGE CONTAINER */
    .portrait-image-wrapper {
      width: 100%;
      aspect-ratio: 9/16;
      position: relative;
      background: #222;
    }

    .portrait-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .portrait-gradient-overlay {
      position: absolute;
      bottom: 0; left: 0; width: 100%; height: 50%;
      background: linear-gradient(to top, var(--bg-card), transparent);
      pointer-events: none;
    }

    .portrait-name-overlay {
      position: absolute;
      bottom: 25px;
      left: 20px;
      z-index: 10;
    }

    .portrait-name-overlay h2 {
      font-size: 2.2rem;
      margin: 0;
      font-weight: 800;
      text-shadow: 0 2px 10px rgba(0,0,0,0.5);
      line-height: 1.1;
    }

    .portrait-role {
      background: var(--primary);
      color: white;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 0.8rem;
      font-weight: 600;
      margin-top: 8px;
      display: inline-block;
      box-shadow: 0 4px 10px rgba(207, 65, 133, 0.3);
    }

    .profile-details-grid {
      padding: 24px;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }

    .detail-card {
      background: rgba(255,255,255,0.03);
      padding: 16px;
      border-radius: 16px;
      border: 1px solid var(--glass-border);
      backdrop-filter: blur(10px);
    }

    .detail-card.full { grid-column: span 2; }

    .detail-card .label {
      display: block;
      font-size: 0.7rem;
      color: var(--primary);
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      font-weight: 700;
    }

    .detail-card .value { font-size: 1.05rem; font-weight: 500; color: #fff; }
    .bio-text { margin: 0; line-height: 1.6; font-size: 0.95rem; color: #ddd; }

    /* --- MESSAGES AREA --- */
    .chat-messages-area {
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 15px;
      position: relative;
    }

    .empty-chat-placeholder {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;
        opacity: 0.7;
        text-align: center;
        padding: 20px;
    }
    .placeholder-icon { font-size: 3rem; margin-bottom: 10px; animation: wave 2s infinite; }
    .quick-suggestions { display: flex; gap: 10px; margin-top: 20px; flex-wrap: wrap; justify-content: center; }
    .quick-suggestions button {
        background: var(--glass-bg);
        border: 1px solid var(--glass-border);
        color: var(--text-main);
        padding: 8px 16px;
        border-radius: 20px;
        cursor: pointer;
        transition: all 0.2s;
        font-size: 0.85rem;
    }
    .quick-suggestions button:hover { border-color: var(--primary); color: var(--primary); }

    .message-row {
      display: flex;
      gap: 10px;
      max-width: 85%;
      animation: fadeIn 0.3s ease-out;
      position: relative;
    }

    .message-row.sent {
      align-self: flex-end;
      flex-direction: row-reverse;
    }

    .chat-msg-avatar {
      width: 32px; height: 32px;
      border-radius: 50%;
      object-fit: cover;
      margin-top: auto; 
    }

    .message-bubble {
      padding: 12px 16px;
      border-radius: 18px;
      position: relative;
      font-size: 0.95rem;
      line-height: 1.5;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 100%;
      min-width: 120px;
    }

    .received .message-bubble {
      background: var(--msg-received);
      border-bottom-left-radius: 4px;
      border: 1px solid var(--glass-border);
    }

    .sent .message-bubble {
      background: linear-gradient(135deg, var(--primary), #b0306a);
      border-bottom-right-radius: 4px;
      box-shadow: 0 4px 15px rgba(207, 65, 133, 0.2);
    }

    .text-content p { margin: 0; }
    .message-time {
      display: block;
      font-size: 0.65rem;
      opacity: 0.7;
      margin-top: 4px;
      text-align: right;
    }

    .quota-error {
      color: #ff6b6b;
      font-style: italic;
    }

    /* Message Options */
    .msg-options-trigger {
        position: absolute;
        top: 50%; transform: translateY(-50%);
        right: -30px;
        background: rgba(0,0,0,0.7);
        border: none; 
        color: #fff;
        cursor: pointer;
        padding: 4px;
        border-radius: 4px;
        opacity: 0;
        transition: opacity 0.2s;
    }
    .message-row:hover .msg-options-trigger {
        opacity: 1;
    }
    .sent .msg-options-trigger { right: auto; left: -30px; }
    .msg-dropdown-menu {
        position: absolute;
        top: 100%; 
        z-index: 10;
        background: var(--bg-card);
        border: 1px solid var(--glass-border);
        border-radius: 8px;
        overflow: hidden;
        min-width: 120px;
        right: 0;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    }
    .msg-dropdown-menu button {
        display: flex; gap: 8px; align-items: center;
        width: 100%; padding: 8px 12px;
        background: none; border: none; color: white;
        cursor: pointer; font-size: 0.85rem;
        transition: background 0.2s;
    }
    .msg-dropdown-menu button:hover { background: rgba(255,255,255,0.1); }
    .msg-dropdown-menu button.danger { color: var(--danger); }

    /* MEDIA & PREMIUM LOCKS */
    .media-container {
        border-radius: 12px;
        overflow: hidden;
        position: relative;
        max-width: 280px;
        min-width: 200px;
    }
    .media-content { 
        width: 100%; 
        display: block; 
        border-radius: 12px;
        max-height: 300px;
        object-fit: cover;
    }
    .media-footer {
        position: absolute;
        bottom: 0; left: 0; right: 0;
        padding: 8px;
        background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
    .quota-badge { 
        font-size: 0.65rem; 
        background: rgba(255, 215, 0, 0.2); 
        color: #FFD700;
        padding: 2px 6px; 
        border-radius: 4px; 
        border: 1px solid rgba(255, 215, 0, 0.4);
    }
    
    .premium-lock-wrapper {
        width: 240px; height: 300px;
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #111;
        border-radius: 12px;
        overflow: hidden;
    }
    .media-blur-bg {
        position: absolute; inset: 0;
        background-size: cover; background-position: center;
        filter: blur(25px) brightness(0.5); 
        transform: scale(1.1);
    }
    .lock-overlay-content {
        position: relative; z-index: 2;
        text-align: center;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
        padding: 20px;
    }
    .lock-icon-circle {
        width: 50px; height: 50px;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        border: 1px solid rgba(255,255,255,0.2);
    }
    .lock-title { margin:0; font-weight: 700; font-size: 1.1rem; }
    .lock-desc { margin:0; font-size: 0.8rem; color: #aaa; max-width: 180px; line-height: 1.4; }
    .unlock-btn {
        background: linear-gradient(135deg, #FFD700, #FFA500); 
        color: #000;
        border: none; padding: 10px 20px; border-radius: 30px;
        font-weight: 700; font-size: 0.85rem; cursor: pointer;
        transition: transform 0.2s;
        box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
        margin-top: 5px;
        display: flex; align-items: center; gap: 6px;
    }
    .unlock-btn:hover { transform: scale(1.05); }

    /* TYPING */
    .typing-bubble { 
        padding: 15px; 
        display: flex; 
        gap: 4px; 
        align-items: center; 
        width: fit-content; 
        background: var(--msg-received);
        border-radius: 18px;
        border-bottom-left-radius: 4px;
    }
    .dot { width: 6px; height: 6px; background: #666; border-radius: 50%; animation: bounce 1.4s infinite; }
    .dot:nth-child(2) { animation-delay: 0.2s; }
    .dot:nth-child(3) { animation-delay: 0.4s; }

    /* INPUT AREA */
    .chat-input-area {
      padding: 15px;
      border-top: 1px solid var(--glass-border);
      position: relative;
    }
    
    .input-wrapper-outer {
        display: flex; gap: 8px; align-items: center;
    }

    .media-btn-group {
        display: flex; gap: 4px;
    }

    .media-trigger-btn {
        background: rgba(255,255,255,0.05);
        border: 1px solid var(--glass-border);
        color: var(--text-muted);
        width: 40px; height: 40px;
        border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        cursor: pointer;
        transition: all 0.2s;
    }
    .media-trigger-btn:hover:not(:disabled) {
        background: rgba(207, 65, 133, 0.1);
        color: var(--primary);
        border-color: var(--primary);
    }
    .media-trigger-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .input-bar-wrapper {
      flex: 1;
      background: var(--bg-card);
      border: 1px solid var(--glass-border);
      border-radius: 50px;
      padding: 5px 5px 5px 20px;
      display: flex;
      align-items: center;
      transition: border-color 0.2s;
    }

    .input-bar-wrapper:focus-within {
        border-color: var(--primary);
    }

    .input-bar-wrapper input {
      flex: 1;
      background: transparent;
      border: none;
      color: white;
      outline: none;
      font-size: 1rem;
    }

    .input-bar-wrapper input::placeholder {
        color: var(--text-muted);
    }

    .send-action-btn {
      width: 40px; height: 40px;
      border-radius: 50%;
      border: none;
      background: transparent;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.3s;
      cursor: pointer;
    }

    .send-action-btn.active:not(:disabled) {
      background: var(--primary);
      color: white;
      transform: scale(1.05);
    }

    .send-action-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }

    .quota-mini-bar {
      height: 2px;
      background: var(--primary);
      position: absolute;
      top: 0; left: 0;
      transition: width 0.3s;
    }
    
    .quota-warning { background: #ff4d4d !important; }

    /* ANIMATIONS */
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    @keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(207, 65, 133, 0.7); } 70% { box-shadow: 0 0 0 6px rgba(207, 65, 133, 0); } 100% { box-shadow: 0 0 0 0 rgba(207, 65, 133, 0); } }
    @keyframes bounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-5px); } }
    @keyframes wave { 0%, 100% { transform: rotate(0deg); } 25% { transform: rotate(15deg); } 75% { transform: rotate(-15deg); } }

    
@media (max-width: 600px) {
  .chat-input-area {
margin-bottom: 4.5rem; /* Space for mobile keyboard */
  }
.profile-details-grid{
margin-bottom: 4.5rem;
}
}
  `;

  return (
    <div className="chat-box-container">
      <style>{styles}</style>
      
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {isLoading ? (
         <div className="chat-loading-screen">
            <AdvancedLoader text="Loading your conversation..." />
         </div>
      ) : (
        <>
          {/* HEADER */}
          <div className="chat-header glass-effect">
            <button className="nav-btn back" onClick={() => onBackBTNSelect(true)}>
              <ArrowLeft size={22} />
            </button>
            
            <div className="header-profile" onClick={() => setShowOverlay(true)}>
              <div className="header-avatar-ring">
                <img 
                  src={userProfile?.avatar_img || "/heartecho_b.png"} 
                  alt="Profile" 
                  className="header-avatar" 
                />
                <div className={`status-dot ${isTyping ? 'typing' : 'online'}`}></div>
              </div>
              <div className="header-info">
                <h3>{userProfile?.name || "AI Companion"}</h3>
                <span className="status-text">{isTyping ? "Typing..." : "Online"}</span>
              </div>
            </div>
            
            <button className="nav-btn info" onClick={() => setShowOverlay(true)}>
                <Info size={20} />
            </button>
          </div>

          {/* PROFILE OVERLAY */}
          <div className={`profile-overlay-backdrop ${showOverlay ? 'active' : ''}`} ref={overlayRef} onClick={(e) => {
              if (e.target === overlayRef.current) setShowOverlay(false);
          }}>
             <div className={`profile-modal ${showOverlay ? 'slide-up' : ''}`}>
                <button className="modal-close-btn" onClick={() => setShowOverlay(false)}>
                  <X size={24} />
                </button>
                <div className="modal-scroll-content">
                    <div className="portrait-image-wrapper">
                        <img src={userProfile?.avatar_img || "/heartecho_b.png"} alt="Full Portrait" className="portrait-image" />
                        <div className="portrait-gradient-overlay"></div>
                        <div className="portrait-name-overlay">
                            <h2>{userProfile?.name || "AI Companion"}</h2>
                            <span className="portrait-role">{userProfile?.relationship || "AI Assistant"}</span>
                        </div>
                    </div>
                    <div className="profile-details-grid">
                        <div className="detail-card"><span className="label">Age</span><span className="value">{userProfile?.age || "N/A"}</span></div>
                        <div className="detail-card full"><span className="label">Interests</span><span className="value">
                          {Array.isArray(userProfile?.interests)
                            ? userProfile.interests.join(" • ")
                            : userProfile?.interests || "Conversation, Assistance, Learning"}
                        </span></div>
                        <div className="detail-card full"><span className="label">About</span><p className="bio-text">{userProfile?.description || "Your AI companion is here to help and chat with you."}</p></div>
                    </div>
                </div>
             </div>
          </div>

          {/* MESSAGES AREA */}
          <div className="chat-messages-area" ref={chatContainerRef}>
            {displayMessages.length === 0 ? (
               <div className="empty-chat-placeholder">
                  <div className="placeholder-icon">💬</div>
                  <h3>Start a conversation with {userProfile?.name || "AI Companion"}!</h3>
                  <p>Send a message to begin chatting.</p>
                  {!isSubscribed && (
                    <p style={{color: '#cf4185', fontSize: '0.9rem', marginTop: '10px'}}>
                      You have {remainingQuota} free messages today
                    </p>
                  )}
                  <div className="quick-suggestions">
                    <button onClick={() => setNewMessage("Hello! How are you doing today?")}>
                      💬 Hello! How are you?
                    </button>
                    <button onClick={() => handleMediaRequest('image')}>
                      <ImageIcon size={16} /> Request Image ({COST_IMAGE} quota)
                    </button>
                    <button onClick={() => handleMediaRequest('video')}>
                      <Video size={16} /> Request Video ({COST_VIDEO} quota)
                    </button>
                  </div>
               </div>
            ) : (
                displayMessages.map((msg, index) => (
                    <div 
                        key={msg._id || index}
                        className={`message-row ${msg.sender === "me" ? 'sent' : 'received'}`}
                        ref={index === displayMessages.length - 1 ? lastMessageRef : null}
                        onMouseEnter={() => setHoveredMessage(msg._id)}
                        onMouseLeave={() => setHoveredMessage(null)}
                    >
                        {msg.sender !== "me" && (
                          <img src={userProfile?.avatar_img || "/heartecho_b.png"} className="chat-msg-avatar" alt="AI Avatar" />
                        )}
                        <div className="message-bubble">
                            {renderMediaContent(msg)}
                        </div>
                        
                        {hoveredMessage === msg._id && msg.sender === "me" && !msg.isLoading && (
                          <button 
                            className="msg-options-trigger"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMessage(selectedMessage === msg._id ? null : msg._id);
                            }}
                          >
                            <MoreVertical size={16} />
                          </button>
                        )}
                        
                        {selectedMessage === msg._id && (
                          <div className="msg-dropdown-menu" ref={menuRef}>
                            <button onClick={() => {
                              handleCopyMessage(msg.text);
                              setSelectedMessage(null);
                            }}>
                              <Copy size={14} /> Copy
                            </button>
                            <button onClick={() => handleDeleteMessage(msg._id)} className="danger">
                              <Trash2 size={14} /> Delete
                            </button>
                          </div>
                        )}
                    </div>
                ))
            )}
            {isTyping && (
                <div className="message-row received">
                    <img src={userProfile?.avatar_img || "/heartecho_b.png"} className="chat-msg-avatar" alt="AI Avatar" />
                    <div className="typing-bubble">
                        <div className="dot"></div><div className="dot"></div><div className="dot"></div>
                    </div>
                </div>
            )}
            <div ref={lastMessageRef} />
          </div>

          {/* SCROLL DOWN BUTTON */}
          <button 
            className={`scroll-down-btn ${showScrollDown ? 'visible' : ''}`}
            onClick={handleScrollDownClick}
            title="Scroll to bottom"
          >
            <ArrowDown size={20} />
          </button>

          {/* INPUT AREA */}
          <div className="chat-input-area glass-effect">
            <div className="input-wrapper-outer">
                <div className="media-btn-group">
                    <button 
                      className="media-trigger-btn" 
                      onClick={() => handleMediaRequest('image')} 
                      title={`Ask for Photo (${COST_IMAGE} quota)`}
                      disabled={isTyping || (!isSubscribed && remainingQuota < COST_IMAGE)}
                    >
                        <ImageIcon size={20} />
                    </button>
                    <button 
                      className="media-trigger-btn" 
                      onClick={() => handleMediaRequest('video')} 
                      title={`Ask for Video (${COST_VIDEO} quota)`}
                      disabled={isTyping || (!isSubscribed && remainingQuota < COST_VIDEO)}
                    >
                        <Video size={20} />
                    </button>
                </div>
                
                <div className="input-bar-wrapper">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
                        placeholder={isSubscribed ? "Type your message..." : `Type your message... (${remainingQuota} remaining)`}
                        disabled={isTyping || (!isSubscribed && remainingQuota === 0)}
                    />
                    <button 
                        className={`send-action-btn ${newMessage.trim() ? 'active' : ''}`}
                        onClick={() => handleSendMessage()}
                        disabled={!newMessage.trim() || isTyping || (!isSubscribed && remainingQuota === 0)}
                    >
                        <Send size={18} />
                    </button>
                </div>
            </div>
            {!isSubscribed && (
                <div 
                  className={`quota-mini-bar ${remainingQuota < 5 ? 'quota-warning' : ''}`} 
                  style={{width: `${Math.min(100, (remainingQuota/20)*100)}%`}}
                ></div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;