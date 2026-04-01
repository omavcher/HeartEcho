'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { 
  ArrowLeft, X, Send, Video, Image as ImageIcon, Info, Lock, Zap, 
  Bot, Check, CheckCheck, Play, CreditCard, Phone
} from "lucide-react";
import api from "../config/api";
import { useRouter } from 'next/navigation';
import LoginModal from "./LoginModel";
import VoiceCall from './VoiceCall';

// --- CONFIGURATION ---
const QUOTA_COSTS = { TEXT: 1, IMAGE: 15, VIDEO: 20 };

const BOT_BEHAVIOR = {
  MIN_TYPING_TIME: 1500, 
  MAX_TYPING_TIME: 4000,
  READ_RECEIPT_DELAY: 600, 
  // How long to wait before sending an unprompted auto-message (ms)
  AUTO_MSG_DELAY_MIN: 45000,  // 45 seconds
  AUTO_MSG_DELAY_MAX: 120000, // 2 minutes
};

// --- COMPONENTS ---

const PopNoti = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;
  return (
    <div className={`pop-notification ${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="pop-noti-close"><X size={16} /></button>
    </div>
  );
};

// --- PREMIUM LOCK UI ---
const PremiumLockOverlay = ({ mediaType, cost, remainingQuota, onUnlock }) => {
  const isQuotaExceeded = remainingQuota <= 0;
  return (
    <div className="premium-lock-backdrop">
      <div className="glass-lock-card">
        <div className="lock-icon-glow">
          <Lock size={20} color="#FFD700" />
        </div>
        <h4>{isQuotaExceeded ? "Quota Limit Reached" : "Premium Media"}</h4>
        <p>
          {isQuotaExceeded 
            ? "Subscribe to continue chatting." 
            : `Subscribe to view private ${mediaType}.`}
        </p>
        <button className="unlock-btn-shine" onClick={onUnlock}>
          <Zap size={14} fill="black" /> 
          <span>Unlock Now</span>
        </button>
      </div>
    </div>
  );
};

// --- MEDIA MESSAGE UI ---
const MediaMessage = ({ message, isSubscribed, remainingQuota, onSubscribe }) => {
  const isImage = message.mediaType === "image" || !!message.imgUrl;
  const mediaUrl = isImage ? message.imgUrl : message.videoUrl;
  const hasAccess = isSubscribed;
  const cost = isImage ? QUOTA_COSTS.IMAGE : QUOTA_COSTS.VIDEO;

  return (
    <div className={`media-bubble-container ${!hasAccess ? 'locked-state' : ''}`}>
      <div className="media-wrapper">
        {isImage ? (
          <img 
            src={mediaUrl} 
            alt="AI Content" 
            className={`media-content-img ${!hasAccess ? 'blurred' : ''}`}
            loading="lazy"
          />
        ) : (
          <div className="video-wrapper">
             <video 
              src={mediaUrl} 
              controls={hasAccess}
              className={`media-content-video ${!hasAccess ? 'blurred' : ''}`}
            />
            {!hasAccess && <div className="play-overlay"><Play fill="white" size={24} /></div>}
          </div>
        )}
        
        {!hasAccess && (
          <PremiumLockOverlay
            mediaType={isImage ? 'photo' : 'video'}
            cost={cost}
            remainingQuota={remainingQuota}
            onUnlock={onSubscribe}
          />
        )}

        <div className="media-info-gradient">
           <span className="media-time-text">{formatTime(message.time)}</span>
        </div>
      </div>
    </div>
  );
};

const formatTime = (timeString) => {
  try {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch (e) { return ""; }
};

// --- MAIN COMPONENT ---
const ChatBox = ({ chatId, onBackBTNSelect = () => {}, onSendMessage = () => {} }) => {
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [showVoiceCall, setShowVoiceCall] = useState(false);
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [isTyping, setIsTyping] = useState(false); 
  const [isBotOnline, setIsBotOnline] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false); 
  const [remainingQuota, setRemainingQuota] = useState(5); 
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [showCallPaywall, setShowCallPaywall] = useState(false);
  const [subscriptionTier, setSubscriptionTier] = useState("none");
  const [upgradeInfo, setUpgradeInfo] = useState(null);
  
  // Logic Flags
  const [isBotMessageEnabled, setIsBotMessageEnabled] = useState(true);
  const overlayRef = useRef(null);
  // We store { timer, enabled } so we can kill the loop from anywhere
  const autoMsgTimerRef = useRef(null);
  // Track enabled state in a ref so async callbacks always see the latest value
  const isBotEnabledRef = useRef(true);

  // Refs
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const router = useRouter();

  const scrollToBottom = useCallback((instant = false) => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ behavior: instant ? "instant" : "smooth", block: "end" });
    }
  }, []);

  // Keep the ref in sync with state so async callbacks see the latest value
  useEffect(() => {
    isBotEnabledRef.current = isBotMessageEnabled;
  }, [isBotMessageEnabled]);

  // --- INITIALIZATION ---
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
    
    // Check if token exists, if not we are setting guest mode
    if (chatId) {
      setIsGuest(!storedToken);
      initializeChatData(storedToken);
    }
    
    // Kill any pending auto-message timer on unmount
    return () => clearAutoMsgTimer();
  }, [chatId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // --- HELPER: Clear any scheduled auto-message ---
  const clearAutoMsgTimer = () => {
    if (autoMsgTimerRef.current) {
      clearTimeout(autoMsgTimerRef.current);
      autoMsgTimerRef.current = null;
    }
  };

  // --- Schedule ONE auto-message after an appropriate delay ---
  // Called only after the bot has sent a message and auto is ON.
  const scheduleNextAutoMessage = (authToken) => {
    clearAutoMsgTimer(); // always cancel any existing timer first
    if (!isBotEnabledRef.current) return; // respect the toggle

    const delay = Math.floor(
      Math.random() * (BOT_BEHAVIOR.AUTO_MSG_DELAY_MAX - BOT_BEHAVIOR.AUTO_MSG_DELAY_MIN + 1)
      + BOT_BEHAVIOR.AUTO_MSG_DELAY_MIN
    );

    autoMsgTimerRef.current = setTimeout(() => {
      // Double-check the toggle hasn't been switched off while we were waiting
      if (!isBotEnabledRef.current) return;
      triggerBotAutoMessage(authToken || localStorage.getItem("token"));
    }, delay);
  };


  // --- API LOGIC ---
  const initializeChatData = async (authToken) => {
    setIsLoading(true);
    const guestMode = !authToken;
    let clientId = localStorage.getItem("Guest-Id");
    if (guestMode && !clientId) {
      clientId = "guest_" + Math.random().toString(36).substring(2, 15);
      localStorage.setItem("Guest-Id", clientId);
    }

    try {
      const urlPrefix = guestMode ? `${api.Url}/guest/details` : `${api.Url}/ai/detials`;
      const headers = guestMode ? { "Guest-Id": clientId } : { Authorization: `Bearer ${authToken}` };

      const aiRes = await axios.get(`${urlPrefix}/${chatId}`, { headers });
      setUserProfile(aiRes.data?.AiInfo || {});

      try {
        const chatsUrl = guestMode ? `${api.Url}/guest/chats/${chatId}` : `${api.Url}/ai/chats/by-ai/${chatId}`;
        const chatRes = await axios.get(chatsUrl, { headers });
        
        // Mark as read immediately when opening the chat
        if (!guestMode) {
          axios.post(`${api.Url}/user/chats/${chatId}/read`, {}, { headers }).catch(e => console.error("Could not mark read"));
        }

        let msgsData = chatRes.data?.chat?.messages;
        if (msgsData && msgsData.length > 0) {
          const formattedMsgs = msgsData.map(formatMessageData);
          setMessages(formattedMsgs);
        } else {
          triggerBotAutoMessage(authToken, guestMode, clientId);
        }
      } catch (err) {
        if (err.response?.status === 404) {
           setMessages([]);
           triggerBotAutoMessage(authToken, guestMode, clientId); 
        }
      }

      if (!guestMode) {
        const quotaRes = await axios.get(`${api.Url}/ai/quota/status`, { headers });
        setRemainingQuota(quotaRes.data?.remainingQuota ?? 5);
        setIsSubscribed(quotaRes.data?.isSubscriber || false);
      } else {
        const chatsUrl = `${api.Url}/guest/chats/${chatId}`;
        try {
           const countRes = await axios.get(chatsUrl, { headers });
           const count = countRes.data?.messageCount || 0;
           setRemainingQuota(Math.max(0, 2 - count));
        } catch (e) {
           setRemainingQuota(2);
        }
        setIsSubscribed(false);
      }

    } catch (error) {
      console.error("Init Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const triggerBotAutoMessage = async (authToken, guestMode = isGuest, cId = localStorage.getItem("Guest-Id")) => {
    if (!authToken && !guestMode) return;
    setIsTyping(true);
    
    try {
      const url = guestMode ? `${api.Url}/guest/bots-message` : `${api.Url}/bots/bots-message`;
      const headers = guestMode ? { "Guest-Id": cId } : { Authorization: `Bearer ${authToken}` };

      const res = await axios.post(url, 
        { aiFriendId: chatId },
        { headers }
      );

      if (res.data?.success && res.data?.botMessage) {
        const typingTime = Math.max(BOT_BEHAVIOR.MIN_TYPING_TIME, Math.random() * BOT_BEHAVIOR.MAX_TYPING_TIME);
        
        setTimeout(() => {
          setIsTyping(false);
          const newMsg = {
            _id: `auto-${Date.now()}`,
            sender: "ai",
            text: res.data.botMessage,
            time: new Date().toISOString(),
            mediaType: "text",
            isRead: true
          };
          setMessages(prev => [...prev, newMsg]);
          // Schedule the NEXT auto-message only if auto is still ON
          scheduleNextAutoMessage(authToken);
        }, typingTime);
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Auto Message Fail:", error);
      setIsTyping(false);
    }
  };

  const formatMessageData = (msg) => ({
    _id: msg._id,
    sender: msg.senderModel === "User" || msg.sender === "guest" || msg.sender === "me" ? "me" : "ai",
    text: msg.text,
    time: msg.time,
    mediaType: msg.mediaType || "text",
    imgUrl: msg.imgUrl,
    videoUrl: msg.videoUrl,
    isRead: true, 
  });

  // --- SENDING LOGIC ---
  const handleSendMessage = async (customText = null) => {
    // Cancel any pending auto-message — user is actively chatting
    clearAutoMsgTimer();

    const text = customText || newMessage;
    if (!text.trim()) return;

    // --- QUOTA EXHAUSTED LOGIC ---
    if (!isSubscribed && remainingQuota <= 0) {
      if (isGuest) {
        setShowLoginModal(true);
        return;
      }
      // Track quota exhausted — key conversion trigger moment
      if (typeof window !== 'undefined' && window.trackAppEvent) {
        window.trackAppEvent('quota_exhausted', { chatId, remainingQuota: 0 });
      }
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        const quotaExhaustedReply = {
          _id: `quota-ai-${Date.now()}`,
          sender: "ai",
          text: "Quota khatam ho gaya aaj ka, kal milte hain daddy! Premium khareed le toh raat bhar pelunga 😏",
          time: new Date().toISOString(),
          mediaType: "text",
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
      mediaType: "text",
      isTemp: true,
      isRead: false
    };

    setMessages(prev => [...prev, userMsg]);
    setNewMessage("");

    // Track chat message sent — this feeds the "Used Chat" funnel stage
    if (typeof window !== 'undefined' && window.trackAppEvent) {
      window.trackAppEvent('chat_message_sent', { chatId, isSubscribed, remainingQuota });
    }

    if (!isSubscribed) {
      setRemainingQuota(prev => Math.max(0, prev - 1));
    }

    setTimeout(() => {
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...m, isRead: true } : m
      ));
      setIsTyping(true);
    }, BOT_BEHAVIOR.READ_RECEIPT_DELAY);

    try {
      const url = isGuest ? `${api.Url}/guest/${chatId}/send` : `${api.Url}/ai/${chatId}/send`;
      const headers = isGuest ? { "Guest-Id": localStorage.getItem("Guest-Id") } : { Authorization: `Bearer ${token}` };

      const response = await axios.post(url, { text }, { headers });

      if (response.data.remainingQuota !== undefined) {
        setRemainingQuota(response.data.remainingQuota);
      }
      
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...m, _id: response.data?.userMessage?._id || tempId, isTemp: false, isRead: true } : m
      ));

      // In guest mode, immediately append AI response returned by the endpoint to avoid refresh chat latency
      if (isGuest && response.data?.aiMessage) {
        const humanDelay = Math.max(BOT_BEHAVIOR.MIN_TYPING_TIME, Math.random() * BOT_BEHAVIOR.MAX_TYPING_TIME);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, formatMessageData(response.data.aiMessage)]);
          // After bot replies to user, schedule next auto-message if auto is ON
          scheduleNextAutoMessage(token);
        }, humanDelay);
      } else {
        const humanDelay = Math.max(BOT_BEHAVIOR.MIN_TYPING_TIME, Math.random() * BOT_BEHAVIOR.MAX_TYPING_TIME);
        setTimeout(async () => {
          await refreshChat(); 
          setIsTyping(false);
          // After bot replies to user, schedule next auto-message if auto is ON
          scheduleNextAutoMessage(token);
        }, humanDelay);
      }

    } catch (error) {
      console.error("Send Error:", error);
      setIsTyping(false);
      setMessages(prev => prev.filter(m => m._id !== tempId)); 
      
      if (error.response?.status === 403 && error.response?.data?.requireLogin) {
         setShowLoginModal(true);
      } else {
         showNotification("Failed to send.", "error");
      }
    }
  };

  const toggleBotMessages = () => {
    const newState = !isBotMessageEnabled;
    // Update ref immediately so any in-flight timers respect the new state
    isBotEnabledRef.current = newState;
    setIsBotMessageEnabled(newState);
    if (newState) {
      // Re-enable: schedule an auto-message soon
      scheduleNextAutoMessage(token);
      showNotification("Auto conversation resumed", "success");
    } else {
      // Disable: kill ANY pending auto-message timer right now
      clearAutoMsgTimer();
      showNotification("Auto conversation paused", "info");
    }
  };

  const showNotification = (msg, type) => {
    setNotification({ show: true, message: msg, type });
    setTimeout(() => setNotification(n => ({ ...n, show: false })), 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const refreshChat = async () => {
    try {
      const url = isGuest ? `${api.Url}/guest/chats/${chatId}` : `${api.Url}/ai/chats/by-ai/${chatId}`;
      const headers = isGuest ? { "Guest-Id": localStorage.getItem("Guest-Id") } : { Authorization: `Bearer ${token}` };

      const res = await axios.get(url, { headers });
      
      if (!isGuest) {
        axios.post(`${api.Url}/user/chats/${chatId}/read`, {}, { headers }).catch(e => console.error("Could not mark read"));
      }

      if (res.data?.chat?.messages) {
        setMessages(res.data.chat.messages.map(formatMessageData));
      }
    } catch (e) { console.error(e); }
  };

// ── VOICE CALL PAYWALL MODAL ─────────────────────────────────────────────────
const CallPaywallModal = ({ tier, upgradeInfo, onClose, onUpgrade }) => {
  const isMonthly = tier === "monthly";
  const hasYearly  = tier === "yearly";
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99998,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(16px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }}>
      <div style={{
        background: 'linear-gradient(145deg,#1a0533 0%,#0d0d1a 100%)',
        border: '1px solid rgba(255,255,255,0.1)', borderRadius: 28,
        padding: '36px 28px', maxWidth: 360, width: '100%', textAlign: 'center',
        fontFamily: "'Outfit', sans-serif", color: 'white'
      }}>
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>📞</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0 0 10px' }}>
          {hasYearly ? 'Unlock Unlimited Calls' : 'Voice Calls Locked'}
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem', lineHeight: 1.6, margin: '0 0 24px' }}>
          {tier === 'none' && 'Voice calling is available on Yearly (₹399) and Ultimate (₹999) plans.'}
          {isMonthly && 'Your Monthly plan does not include voice calls. Upgrade to Yearly or Ultimate.'}
          {hasYearly && upgradeInfo?.savingMessage}
        </p>

        {hasYearly && (
          <div style={{
            background: 'rgba(255,214,10,0.08)', border: '1px solid rgba(255,214,10,0.2)',
            borderRadius: 16, padding: '16px', marginBottom: 20
          }}>
            <p style={{ color: '#ffd60a', fontWeight: 700, margin: 0, fontSize: '1.1rem' }}>
              You pay only ₹{upgradeInfo?.upgradePrice}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.75rem', margin: '4px 0 0' }}>
              Already paid ₹399 · Total ₹999 · Save ₹0
            </p>
          </div>
        )}

        <button
          onClick={onUpgrade}
          style={{
            background: 'linear-gradient(90deg,#ec4899,#8b5cf6)',
            color: 'white', border: 'none', width: '100%', padding: '16px',
            borderRadius: 14, fontWeight: 800, fontSize: '1rem', cursor: 'pointer', marginBottom: 12
          }}
        >
          {hasYearly ? `Upgrade for ₹${upgradeInfo?.upgradePrice}` : 'View Plans'}
        </button>

        <button onClick={onClose} style={{
          background: 'transparent', color: 'rgba(255,255,255,0.3)', border: 'none',
          cursor: 'pointer', fontSize: '0.85rem'
        }}>Maybe later</button>
      </div>
    </div>
  );
};

  return (
    <div className="chat-box-container">
      <style>{STYLES}</style>
      
      {showCallPaywall && (
        <CallPaywallModal
          tier={subscriptionTier}
          upgradeInfo={upgradeInfo}
          onClose={() => setShowCallPaywall(false)}
          onUpgrade={() => { setShowCallPaywall(false); router.push('/subscribe'); }}
        />
      )}

      {showVoiceCall && (
        <VoiceCall 
          chatId={chatId}
          userName={userProfile?.name}
          avatar={userProfile?.avatar_img}
          token={token}
          onClose={() => {
            setShowVoiceCall(false);
            refreshChat();
          }}
          onSubscriberRequired={(reason) => {
            setShowVoiceCall(false);
            setShowCallPaywall(true);
          }}
        />
      )}

      {showLoginModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
            <LoginModal onClose={() => setShowLoginModal(false)} mode={isGuest ? "guest" : "login"} />
        </div>
      )}

      <PopNoti 
        {...notification} 
        isVisible={notification.show} 
        onClose={() => setNotification(n => ({ ...n, show: false }))} 
      />

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
            <span className={`status-text ${isTyping ? 'highlight' : ''}`}>
              {isTyping ? "typing..." : (isBotOnline ? "Online" : "Offline")}
            </span>
          </div>
        </div>
        
        <div className="header-controls">
          <button 
            className="nav-btn" 
            onClick={async () => {
              if (isGuest) { setShowLoginModal(true); return; }
              // Check subscription status before opening call
              try {
                const res = await axios.get(`${api.Url}/user/payment/upgrade-pricing`, {
                  headers: { Authorization: `Bearer ${token}` }
                });
                const info = res.data;
                setUpgradeInfo(info);
                setSubscriptionTier(info.currentTier || 'none');
                
                // Only yearly + yearly_pro get voice calls
                const canCall = info.currentTier === 'yearly' || info.currentTier === 'yearly_pro';
                
                if (canCall) {
                  setShowVoiceCall(true);
                } else {
                  setShowCallPaywall(true);
                }
              } catch (e) {
                // If API fails, fall back to basic logic
                if (isSubscribed) setShowVoiceCall(true);
                else setShowCallPaywall(true);
              }
            }}
          >
            <Phone size={20} />
          </button>
          <button className="nav-btn" onClick={() => setShowOverlay(true)}><Info size={20} /></button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chat-messages-area" ref={chatContainerRef}>
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Syncing...</p>
          </div>
        ) : messages.length === 0 && !isTyping ? (
          <div className="empty-state">
            <div className="empty-icon">👋</div>
            <h3>Say Hello!</h3>
            <p>Start a new conversation with {userProfile?.name}</p>
          </div>
        ) : (
          messages.map((msg, index) => {
            const isMe = msg.sender === "me";
            const isMedia = msg.mediaType !== 'text';
            const isLast = index === messages.length - 1;
            
            return (
              <div 
                key={msg._id || index} 
                className={`message-row ${isMe ? 'sent' : 'received'}`}
                ref={isLast ? lastMessageRef : null}
              >
                {!isMe && (
                  <img 
                    src={userProfile?.avatar_img || "/heartecho_b.png"} 
                    className="chat-msg-avatar" 
                    alt="AI"
                  />
                )}
                
                {isMedia ? (
                   <MediaMessage 
                      message={msg}
                      isSubscribed={isSubscribed}
                      remainingQuota={remainingQuota}
                      onSubscribe={() => router.push("/subscribe")}
                    />
                ) : (
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
                )}
              </div>
            );
          })
        )}

        {isTyping && (
          <div className="message-row received typing-row">
             <img 
                src={userProfile?.avatar_img || "/heartecho_b.png"} 
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
          <button 
            className="icon-btn" 
            onClick={() => handleSendMessage("/photo Send me a photo")}
            disabled={isTyping}
            title="Request Photo (15 Tokens)"
          >
            <ImageIcon size={22} />
          </button>

          <button 
            className="icon-btn" 
            onClick={() => handleSendMessage("/video Send me a video")}
            disabled={isTyping}
            title="Request Video (20 Tokens)"
          >
            <Video size={22} />
          </button>
          
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

          {/* DYNAMIC BUTTON: Send or Subscribe */}
          {!isSubscribed && remainingQuota <= 0 ? (
            <button 
                className="send-btn active" 
                style={{ background: 'linear-gradient(135deg, #FFD700, #FFA500)', color: 'black' }}
                onClick={() => {
                  if (typeof window !== 'undefined' && window.trackAppEvent) {
                    window.trackAppEvent('upgrade_click', { chatId, source: 'quota_button' });
                  }
                  router.push("/subscribe");
                }}
            >
                <Zap size={20} fill="black" />
            </button>
          ) : (
            <button 
                className={`send-btn ${newMessage.trim() ? 'active' : ''}`}
                onClick={() => handleSendMessage()}
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
        ref={overlayRef} 
        onClick={(e) => e.target === overlayRef.current && setShowOverlay(false)}
      >
        <div className={`profile-modal ${showOverlay ? 'slide-up' : ''}`}>
          <button className="modal-close-btn" onClick={() => setShowOverlay(false)}>
            <X size={24} />
          </button>
          <div className="modal-scroll-content">
            <div className="portrait-image-wrapper">
              <img 
                src={userProfile?.avatar_img || "/heartecho_b.png"} 
                alt="Full Portrait" 
                className="portrait-image" 
              />
              <div className="portrait-gradient-overlay"></div>
              <div className="portrait-name-overlay">
                <h2>{userProfile?.name || "AI Companion"}</h2>
                <span className="portrait-role">
                  {userProfile?.relationship || "AI Assistant"}
                </span>
              </div>
            </div>
            <div className="profile-details-grid">
              <div className="detail-card">
                <span className="label">Age</span>
                <span className="value">{userProfile?.age || "N/A"}</span>
              </div>
              <div className="detail-card">
                <span className="label">Tokens Left</span>
                <span className="value quota-value">{isSubscribed ? "∞" : remainingQuota}</span>
              </div>
              <div className="detail-card full">
                <span className="label">Auto Conversation</span>
                <div className="toggle-wrapper">
                  <span className="value">{isBotMessageEnabled ? "Active" : "Paused"}</span>
                  <button 
                    className={`toggle-btn ${isBotMessageEnabled ? 'active' : ''}`}
                    onClick={toggleBotMessages}
                  >
                    <div className="toggle-slider"></div>
                  </button>
                </div>
              </div>
              <div className="detail-card full">
                <span className="label">About</span>
                <p className="bio-text">
                  {userProfile?.description || "Your AI companion is here to help and chat with you."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ChatBox;

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
.chat-msg-avatar { width: 26px; height: 26px; border-radius: 50%; object-fit: cover; margin-bottom: 4px; flex-shrink: 0; }

/* Text Bubble */
.message-bubble { padding: 10px 14px; border-radius: 18px; position: relative; font-size: 15px; line-height: 1.4; box-shadow: 0 1px 2px rgba(0,0,0,0.2); }
.received .message-bubble { background: var(--msg-ai); border-bottom-left-radius: 4px; color: var(--text); border: 1px solid rgba(255,255,255,0.05); }
.sent .message-bubble { background: var(--accent-grad); border-bottom-right-radius: 4px; color: white; }
.text-content p { margin: 0; word-wrap: break-word; }
.msg-meta { display: flex; justify-content: flex-end; align-items: center; gap: 4px; margin-top: 4px; opacity: 0.7; }
.time { font-size: 10px; }
.ticks .read { color: #87CEEB; }

/* Media Bubble */
.media-bubble-container { width: 260px; max-width: 100%; border-radius: 18px; overflow: hidden; position: relative; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.05); background: #111; }
.media-wrapper { position: relative; width: 100%; height: 350px; }
.media-content-img, .media-content-video { width: 100%; height: 100%; object-fit: cover; display: block; }
.blurred { filter: blur(20px) brightness(0.4); transform: scale(1.1); transition: filter 0.3s; }
.video-wrapper { width: 100%; height: 100%; position: relative; display: flex; align-items: center; justify-content: center; }
.play-overlay { position: absolute; z-index: 5; opacity: 0.7; }
.media-info-gradient { position: absolute; bottom: 0; left: 0; right: 0; padding: 20px 12px 10px; background: linear-gradient(to top, rgba(0,0,0,0.9), transparent); display: flex; justify-content: space-between; align-items: center; z-index: 10; }
.media-time-text { color: rgba(255,255,255,0.8); font-size: 11px; font-weight: 500; }

/* Premium Lock */
.premium-lock-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; z-index: 20; background: rgba(0,0,0,0.2); }
.glass-lock-card { background: rgba(20, 20, 20, 0.75); backdrop-filter: blur(10px); padding: 16px; border-radius: 20px; text-align: center; border: 1px solid rgba(255, 215, 0, 0.3); width: 85%; display: flex; flex-direction: column; align-items: center; gap: 8px; box-shadow: 0 10px 30px rgba(0,0,0,0.5); }
.lock-icon-glow { width: 36px; height: 36px; background: rgba(255, 215, 0, 0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 0 15px rgba(255, 215, 0, 0.3); margin-bottom: 4px; }
.glass-lock-card h4 { margin: 0; color: #fff; font-size: 14px; font-weight: 700; }
.glass-lock-card p { margin: 0; color: #ccc; font-size: 11px; margin-bottom: 8px; }
.unlock-btn-shine { background: linear-gradient(135deg, #FFD700, #FFA500); border: none; padding: 8px 14px; border-radius: 20px; color: #000; font-weight: 700; font-size: 11px; display: flex; align-items: center; gap: 4px; cursor: pointer; box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3); transition: transform 0.2s; }
.unlock-btn-shine:active { transform: scale(0.95); }

/* Typing */
.typing-bubble { padding: 12px 16px !important; display: flex; align-items: center; width: fit-content; }
.typing-dots { display: flex; gap: 4px; }
.typing-dots span { width: 6px; height: 6px; background: #a1a1aa; border-radius: 50%; animation: bounce 1.4s infinite ease-in-out both; }
.typing-dots span:nth-child(1) { animation-delay: -0.32s; }
.typing-dots span:nth-child(2) { animation-delay: -0.16s; }

/* Input Area */
.chat-input-area { flex-shrink: 0; padding: 12px 12px; background: var(--bg-app); border-top: 1px solid rgba(255,255,255,0.06); position: relative; padding-bottom: max(12px, env(safe-area-inset-bottom)); }
.quota-container { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; padding: 0 4px; }
.quota-label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
.quota-track { flex: 1; height: 4px; background: #27272a; border-radius: 4px; margin-left: 10px; overflow: hidden; }
.quota-fill { height: 100%; background: var(--accent); transition: width 0.3s ease; }
.quota-fill.danger { background: #ef4444; }

.input-container { display: flex; align-items: center; gap: 8px; }
.input-wrapper { flex: 1; background: #27272a; border-radius: 24px; padding: 2px 14px; display: flex; align-items: center; border: 1px solid transparent; transition: border-color 0.2s; }
.input-wrapper:focus-within { border-color: var(--accent); }
.input-wrapper input { width: 100%; background: transparent; border: none; color: white; padding: 10px 0; outline: none; font-size: 15px; }
.icon-btn { background: none; border: none; color: var(--accent); padding: 8px; cursor: pointer; transition: transform 0.2s; flex-shrink: 0; }
.icon-btn:hover { transform: scale(1.1); }
.send-btn { width: 40px; height: 40px; border-radius: 50%; background: #27272a; border: none; color: #71717a; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: all 0.2s; flex-shrink: 0; }
.send-btn.active { background: var(--accent); color: white; transform: scale(1.05); }

/* Profile Overlay */
.profile-overlay-backdrop { position: absolute; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 100; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; display: flex; align-items: center; justify-content: center; }
.profile-overlay-backdrop.active { opacity: 1; pointer-events: auto; }
.profile-modal { width: 100%; max-width: 420px; height: 100%; background: var(--bg-card); position: relative; display: flex; flex-direction: column; overflow: hidden; transform: translateY(100%); transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 0 50px rgba(0,0,0,0.5); }
@media (min-width: 480px) { .profile-modal { height: 90vh; border-radius: 24px; border: 1px solid var(--glass-border); } }
.profile-modal.slide-up { transform: translateY(0); }
.modal-close-btn { position: absolute; top: 15px; right: 15px; z-index: 20; background: rgba(0,0,0,0.5); border: none; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; backdrop-filter: blur(4px); }
.modal-scroll-content { overflow-y: auto; height: 100%; }
.portrait-image-wrapper { width: 100%; aspect-ratio: 9/16; position: relative; background: #222; }
.portrait-image { width: 100%; height: 100%; object-fit: cover; display: block; }
.portrait-gradient-overlay { position: absolute; bottom: 0; left: 0; width: 100%; height: 50%; background: linear-gradient(to top, var(--bg-card), transparent); pointer-events: none; }
.portrait-name-overlay { position: absolute; bottom: 25px; left: 20px; z-index: 10; }
.portrait-name-overlay h2 { font-size: 2.2rem; margin: 0; font-weight: 800; text-shadow: 0 2px 10px rgba(0,0,0,0.5); line-height: 1.1; }
.portrait-role { background: var(--primary); color: white; padding: 4px 12px; border-radius: 12px; font-size: 0.8rem; font-weight: 600; margin-top: 8px; display: inline-block; box-shadow: 0 4px 10px rgba(207, 65, 133, 0.3); }
.profile-details-grid { padding: 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 40px; }
.detail-card { background: rgba(255,255,255,0.03); padding: 16px; border-radius: 16px; border: 1px solid var(--glass-border); backdrop-filter: blur(10px); }
.detail-card.full { grid-column: span 2; }
.detail-card .label { display: block; font-size: 0.7rem; color: var(--primary); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 1.5px; font-weight: 700; }
.detail-card .value { font-size: 1.05rem; font-weight: 500; color: #fff; }
.quota-value { color: #FFD700; text-shadow: 0 0 10px rgba(255, 215, 0, 0.3); }
.toggle-wrapper { display: flex; justify-content: space-between; align-items: center; margin-top: 8px; }
.toggle-btn { width: 44px; height: 24px; background: rgba(255,255,255,0.1); border: 1px solid var(--glass-border); border-radius: 12px; position: relative; cursor: pointer; transition: all 0.3s; }
.toggle-btn.active { background: #6366f1; border-color: #6366f1; }
.toggle-slider { position: absolute; top: 2px; left: 2px; width: 18px; height: 18px; background: white; border-radius: 50%; transition: transform 0.3s; }
.toggle-btn.active .toggle-slider { transform: translateX(20px); }
.bio-text { margin: 0; line-height: 1.6; font-size: 0.95rem; color: #ddd; }

/* Mobile Tweaks */
@media (max-width: 768px) {
  .chat-input-area { padding-bottom: 90px; }
  .chat-messages-area { padding-bottom: 20px; }
  .profile-details-grid { margin-bottom: 80px; }
}

/* Animations */
@keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
@keyframes slideIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
@keyframes pulse { 0% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.4); } 70% { box-shadow: 0 0 0 6px rgba(236, 72, 153, 0); } 100% { box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); } }
@keyframes spin { to { transform: rotate(360deg); } }

.pop-notification { position: fixed; top: 20px; left: 50%; transform: translateX(-50%); background: #333; color: white; padding: 10px 20px; border-radius: 30px; z-index: 1000; display: flex; align-items: center; gap: 10px; box-shadow: 0 10px 25px rgba(0,0,0,0.5); }
.pop-notification.error { background: #ef4444; }
.pop-noti-close { background: none; border: none; color: white; cursor: pointer; }
.loading-state { height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: var(--text-muted); }
.spinner { width: 30px; height: 30px; border: 3px solid rgba(255,255,255,0.1); border-top-color: var(--accent); border-radius: 50%; animation: spin 1s infinite linear; margin-bottom: 10px; }
`;