'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, X, Send, Video, Image as ImageIcon, Info, Lock, Zap, 
  Bot, Check, CheckCheck, Play, CreditCard, Phone, Crown
} from "lucide-react";
import api from "../config/api";
import { useRouter } from 'next/navigation';
import LoginModal from "./LoginModel";
import VoiceCall from './VoiceCall';
import QuotaPaywallModal from './QuotaPaywallModal';

// --- CONFIGURATION ---
const QUOTA_COSTS = { TEXT: 1, IMAGE: 15, VIDEO: 20 };

const BOT_BEHAVIOR = {
  MIN_TYPING_TIME: 1500, 
  MAX_TYPING_TIME: 4000,
  READ_RECEIPT_DELAY: 600, 
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
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
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
  const datesScrollRef = useRef(null);
  const giftCatsScrollRef = useRef(null);

  const renderDateIcon = (id) => {
    const strokeWidth = 2.2;
    const color = "white";
    switch (id) {
      case 'Restaurant':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 2v10a3 3 0 0 0 3 3h2a3 3 0 0 0 3-3V2M9 2v6M20 2v20M20 2a4 4 0 0 0-4 4v4a4 4 0 0 0 4 4M12 15v7" />
          </svg>
        );
      case 'Cafe':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8zM6 2v2M10 2v2M14 2v2" />
          </svg>
        );
      case 'Beach':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12V22M12 12a10 10 0 0 1 10-10M12 12A10 10 0 0 0 2 2M2 2h20M12 12c-3.5 0-6-3-6-6M12 12c3.5 0 6-3 6-6" />
          </svg>
        );
      case 'Movie':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 22h20M2 18V6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2zM2 9h20M6 4v5M11 4v5M16 4v5" />
          </svg>
        );
      case 'Road Trip':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 13v3c0 .6.4 1 1 1h2M7 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM17 21a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          </svg>
        );
      case 'Temple':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2l10 10H2zM4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M12 12v10" />
          </svg>
        );
      case 'Shopping':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4zM3 6h18M16 10a4 4 0 0 1-8 0" />
          </svg>
        );
      case 'Rain Walk':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v20M12 12A10 10 0 0 1 22 2M12 12A10 10 0 0 0 2 2M12 18a2 2 0 1 0 4 0" />
          </svg>
        );
      case 'Festival':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <rect x="5" y="3" width="14" height="18" rx="3" />
            <path d="M12 3v18M5 9h14M5 15h14" />
          </svg>
        );
      case 'Night Drive':
        return (
          <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderGiftCatIcon = (key) => {
    const strokeWidth = 2.2;
    switch (key) {
      case 'Flowers':
        return (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 12m-3 0a3 3 0 1 0 6 0a3 3 0 1 0 -6 0" />
            <path d="M12 2a3 3 0 0 0-3 3v4a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3zM12 15a3 3 0 0 0-3 3v1a3 3 0 0 0 6 0v-1a3 3 0 0 0-3-3zM2 12a3 3 0 0 0 3 3h4a3 3 0 0 0 0-6H5a3 3 0 0 0-3 3zM15 12a3 3 0 0 0 3 3h1a3 3 0 0 0 0-6h-1a3 3 0 0 0-3 3z" />
          </svg>
        );
      case 'Chocolate':
        return (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M12 3v18M3 12h18M3 7h18M3 17h18" />
          </svg>
        );
      case 'Ring':
        return (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="14" r="7" />
            <path d="M12 2l3 3h-6z" />
          </svg>
        );
      case 'Cake':
        return (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2v6M9 8h6M4 12h16M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
          </svg>
        );
      case 'Coffee':
        return (
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 8h1a4 4 0 1 1 0 8h-1M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V8z" />
          </svg>
        );
      default:
        return null;
    }
  };

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
  const [showQuotaPaywall, setShowQuotaPaywall] = useState(false);
  const [quotaUserData, setQuotaUserData] = useState(null);
  const [isPremiumLocked, setIsPremiumLocked] = useState(false);

  // Insufficient Gems Buy Dialog States
  const [showInsufficientGemsModal, setShowInsufficientGemsModal] = useState(false);
  const [gemsNeeded, setGemsNeeded] = useState(0);
  const [activeFlyingGift, setActiveFlyingGift] = useState(null);

  // Premium Relationship & Economy States
  const [userGems, setUserGems] = useState(0);
  const [streakCount, setStreakCount] = useState(0);
  const [companionEmotion, setCompanionEmotion] = useState("Happy");
  const [personality, setPersonality] = useState("Flirty");
  const [relationshipXP, setRelationshipXP] = useState(0);
  const [relationshipLevel, setRelationshipLevel] = useState(1);
  const [giftsSent, setGiftsSent] = useState([]);
  const [datesCompleted, setDatesCompleted] = useState([]);
  const [relationshipMemory, setRelationshipMemory] = useState("");
  const [aiMemory, setAiMemory] = useState({
    birthday: "", job: "", favoriteFood: "", pet: "", mom: "", 
    dream: "", nickname: "", fear: "", anniversary: "", favoriteColor: ""
  });
  const [stagesUnlocked, setStagesUnlocked] = useState({});
  const [showGiftsDrawer, setShowGiftsDrawer] = useState(false);
  const [shopCategory, setShopCategory] = useState("gifts"); // "gifts" | "dates" | "gems"
  const [giftCategory, setGiftCategory] = useState("Flowers"); // sub-category for gifts view
  const [profileSubTab, setProfileSubTab] = useState("timeline"); // "timeline" | "memory" | "gifts" | "settings"
  const [activeDateTimer, setActiveDateTimer] = useState(null); // { dateType: string, remainingSeconds: number }

  useEffect(() => {
    if (!datesCompleted || datesCompleted.length === 0) {
      setActiveDateTimer(null);
      return;
    }

    const lastDate = datesCompleted[datesCompleted.length - 1];
    const completedAt = new Date(lastDate.completedAt || lastDate.sentAt);

    const updateTimer = () => {
      const diffMs = new Date() - completedAt;
      const totalDuration = 20 * 60 * 1000; // 20 minutes
      const remainingMs = totalDuration - diffMs;

      if (remainingMs > 0) {
        setActiveDateTimer({
          dateType: lastDate.dateType || lastDate.name || "Date",
          remainingSeconds: Math.floor(remainingMs / 1000)
        });
      } else {
        setActiveDateTimer(null);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [datesCompleted]);
  
  // Logic Flags
  const overlayRef = useRef(null);

  // Refs
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
    if (!storedToken) {
      // If user isn't logged in, check for guest id
      const guestId = localStorage.getItem("Guest-Id");
      if (!guestId) {
        setShowLoginModal(true);
        setIsGuest(true);
      } else {
        setIsGuest(true);
        initializeChatData(null, true, guestId);
      }
    } else {
      setIsGuest(false);
      initializeChatData(storedToken);
    }
  }, [chatId]);

  // --- AUTO-SHOW PAYWALL when quota exhausted ---
  const reShowTimerRef = useRef(null);

  useEffect(() => {
    // When data finishes loading and user has no quota left, auto-pop the paywall
    if (!isLoading && !isSubscribed && remainingQuota <= 0 && !isGuest) {
      const t = setTimeout(() => {
        try {
          const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
          setQuotaUserData(storedUser);
        } catch (e) { /* ignore */ }
        setShowQuotaPaywall(true);
      }, 1500); // slight delay so chat renders first
      return () => clearTimeout(t);
    }
  }, [isLoading, isSubscribed, remainingQuota, isGuest]);

  // Re-show paywall 20s after user closes it (if still not subscribed)
  const handlePaywallClose = useCallback(() => {
    setShowQuotaPaywall(false);
    if (!isSubscribed) {
      reShowTimerRef.current = setTimeout(() => {
        setShowQuotaPaywall(true);
      }, 20000);
    }
  }, [isSubscribed]);

  // Clean up re-show timer on unmount
  useEffect(() => () => {
    if (reShowTimerRef.current) clearTimeout(reShowTimerRef.current);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);




  const getGiftImageSrc = (giftId = '', giftName = '') => {
    const key = (giftId || giftName).toLowerCase().replaceAll(' ', '_');
    
    const directMap = {
      rose: '/gifts/red_rose.png',
      red_rose: '/gifts/red_rose.png',
      pink_tulip: '/gifts/pink_tulip.png',
      sunflower: '/gifts/sunflower.png',
      mixed_bouquet: '/gifts/mixed_bouquet.png',
      blue_hydrangea: '/gifts/blue_hydrangea.png',
      
      heart_choc: '/gifts/heart_chocolate_box.png',
      heart_chocolate_box: '/gifts/heart_chocolate_box.png',
      truffles: '/gifts/premium_truffles.png',
      premium_truffles: '/gifts/premium_truffles.png',
      choc_basket: '/gifts/chocolate_basket.png',
      chocolate_basket: '/gifts/chocolate_basket.png',
      ferrero: '/gifts/ferrero_rocher_box.png',
      ferrero_rocher_box: '/gifts/ferrero_rocher_box.png',
      love_choc: '/gifts/love_chocolate_box.png',
      love_chocolate_box: '/gifts/love_chocolate_box.png',
      
      silver_heart: '/gifts/silver_heart_ring.png',
      silver_heart_ring: '/gifts/silver_heart_ring.png',
      infinity: '/gifts/love_infinity_ring.png',
      love_infinity_ring: '/gifts/love_infinity_ring.png',
      solitaire: '/gifts/classic_solitaire.png',
      classic_solitaire: '/gifts/classic_solitaire.png',
      heart_diamond: '/gifts/heart_diamond_ring.png',
      heart_diamond_ring: '/gifts/heart_diamond_ring.png',
      promise: '/gifts/promise_ring.png',
      promise_ring: '/gifts/promise_ring.png',
      
      choc_cake: '/gifts/chocolate_cake.png',
      chocolate_cake: '/gifts/chocolate_cake.png',
      red_velvet: '/gifts/red_velvet_cake.png',
      red_velvet_cake: '/gifts/red_velvet_cake.png',
      cheesecake: '/gifts/cheesecake.png',
      black_forest: '/gifts/black_forest_cake.png',
      black_forest_cake: '/gifts/black_forest_cake.png',
      birthday_cake: '/gifts/birthday_cake.png',
      
      cappuccino: '/gifts/cappuccino.png',
      latte: '/gifts/latte.png',
      mocha: '/gifts/mocha.png',
      cold_coffee: '/gifts/cold_coffee.png',
      espresso: '/gifts/espresso.png',
    };

    if (directMap[key]) return directMap[key];

    if (key.includes('pink_tulip') || key.includes('tulip')) return '/gifts/pink_tulip.png';
    if (key.includes('sunflower')) return '/gifts/sunflower.png';
    if (key.includes('rose')) return '/gifts/red_rose.png';
    if (key.includes('truffle')) return '/gifts/premium_truffles.png';
    if (key.includes('ferrero')) return '/gifts/ferrero_rocher_box.png';
    if (key.includes('choc_basket') || key.includes('chocolate_basket')) return '/gifts/chocolate_basket.png';
    if (key.includes('heart_choc') || key.includes('heart_chocolate')) return '/gifts/heart_chocolate_box.png';
    if (key.includes('love_choc') || key.includes('love_chocolate')) return '/gifts/love_chocolate_box.png';
    if (key.includes('choc')) return '/gifts/heart_chocolate_box.png';
    
    if (key.includes('silver_heart')) return '/gifts/silver_heart_ring.png';
    if (key.includes('infinity')) return '/gifts/love_infinity_ring.png';
    if (key.includes('solitaire')) return '/gifts/classic_solitaire.png';
    if (key.includes('heart_diamond')) return '/gifts/heart_diamond_ring.png';
    if (key.includes('promise')) return '/gifts/promise_ring.png';
    if (key.includes('ring')) return '/gifts/promise_ring.png';
    
    if (key.includes('red_velvet')) return '/gifts/red_velvet_cake.png';
    if (key.includes('black_forest')) return '/gifts/black_forest_cake.png';
    if (key.includes('birthday')) return '/gifts/birthday_cake.png';
    if (key.includes('cheesecake')) return '/gifts/cheesecake.png';
    if (key.includes('choc_cake') || key.includes('chocolate_cake')) return '/gifts/chocolate_cake.png';
    if (key.includes('cake')) return '/gifts/birthday_cake.png';
    
    if (key.includes('cappuccino')) return '/gifts/cappuccino.png';
    if (key.includes('latte')) return '/gifts/latte.png';
    if (key.includes('mocha')) return '/gifts/mocha.png';
    if (key.includes('cold')) return '/gifts/cold_coffee.png';
    if (key.includes('espresso')) return '/gifts/espresso.png';
    if (key.includes('coffee')) return '/gifts/cappuccino.png';
    
    if (key.includes('bouquet')) return '/gifts/mixed_bouquet.png';
    if (key.includes('hydrangea')) return '/gifts/blue_hydrangea.png';
    
    return '/gift_ic.png';
  };

  // --- API LOGIC ---
  const fetchLatestRelationshipStats = async (explicitToken = null) => {
    const activeToken = explicitToken || token || localStorage.getItem("token");
    if (!activeToken) return;
    try {
      const relRes = await axios.get(`${api.Url}/user/chats/${chatId}/relationship`, {
        headers: { Authorization: `Bearer ${activeToken}` }
      });
      if (relRes.data?.success) {
        const relData = relRes.data.data;
        setUserGems(relData.gems);
        setStreakCount(relData.streakCount);
        setCompanionEmotion(relData.currentEmotion);
        setPersonality(relData.personality);
        setRelationshipXP(relData.relationshipXP);
        setRelationshipLevel(relData.relationshipLevel);
        setGiftsSent(relData.giftsSent || []);
        setDatesCompleted(relData.datesCompleted || []);
        setAiMemory(relData.aiMemory || {});
        setStagesUnlocked(relData.stagesUnlocked || {});
      }
    } catch (e) {
      console.error("Error loading relationship stats:", e);
    }
  };

  const initializeChatData = async (authToken, guestMode = false, guestId = null) => {
    setIsLoading(true);
    try {
      const urlPrefix = guestMode ? `${api.Url}/guest/details` : `${api.Url}/ai/detials`;
      const headers = guestMode ? { "Guest-Id": guestId } : { Authorization: `Bearer ${authToken}` };

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
          setMessages([]);
        }

        if (chatRes.data?.relationshipMemory) {
          setRelationshipMemory(chatRes.data.relationshipMemory);
        }
      } catch (err) {
        if (err.response?.status === 404) {
           setMessages([]);
        }
      }

      if (!guestMode) {
        const quotaRes = await axios.get(`${api.Url}/ai/quota/status`, { headers });
        setRemainingQuota(quotaRes.data?.remainingQuota ?? 5);
        setIsSubscribed(quotaRes.data?.isSubscriber || false);
        setSubscriptionTier(quotaRes.data?.subscriptionTier || "none");

        // Fetch premium relationship stats
        await fetchLatestRelationshipStats(authToken);
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
      if (error.response?.status === 403) {
        setIsPremiumLocked(true);
        setShowQuotaPaywall(true);
      }
    } finally {
      setIsLoading(false);
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
      // Show the premium paywall video modal
      try {
        const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
        setQuotaUserData(storedUser);
      } catch (e) { /* ignore */ }
      setShowQuotaPaywall(true);
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
      let trkKey = 'he_trial_started';
      if (typeof window !== 'undefined') {
        try {
          const userStr = localStorage.getItem('user');
          if (userStr && userStr !== "undefined") {
            const userObj = JSON.parse(userStr);
            if (userObj?._id) trkKey += '_' + userObj._id;
          }
        } catch (e) {}
        if (!localStorage.getItem(trkKey)) {
          if (window.gtag) {
            window.gtag('event', 'trial_started', { value: 0 });
          }
          localStorage.setItem(trkKey, 'true');
        }
      }
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
      if (response.data.currentEmotion) setCompanionEmotion(response.data.currentEmotion);
      if (response.data.streakCount !== undefined) setStreakCount(response.data.streakCount);
      if (response.data.relationshipXP !== undefined) setRelationshipXP(response.data.relationshipXP);
      if (response.data.relationshipLevel !== undefined) setRelationshipLevel(response.data.relationshipLevel);
      if (response.data.relationshipMemory !== undefined) setRelationshipMemory(response.data.relationshipMemory);
      
      setMessages(prev => prev.map(m => 
        m._id === tempId ? { ...m, _id: response.data?.userMessage?._id || tempId, isTemp: false, isRead: true } : m
      ));

      // Use messages from the response directly — no extra refreshChat() round-trip needed
      if (response.data?.messages) {
        const humanDelay = Math.max(BOT_BEHAVIOR.MIN_TYPING_TIME, Math.random() * BOT_BEHAVIOR.MAX_TYPING_TIME);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(response.data.messages.map(formatMessageData));
        }, humanDelay);
      } else if (isGuest && response.data?.aiMessage) {
        const humanDelay = Math.max(BOT_BEHAVIOR.MIN_TYPING_TIME, Math.random() * BOT_BEHAVIOR.MAX_TYPING_TIME);
        setTimeout(() => {
          setIsTyping(false);
          setMessages(prev => [...prev, formatMessageData(response.data.aiMessage)]);
        }, humanDelay);
      } else {
        // Fallback: refresh only if messages not returned by API
        const humanDelay = Math.max(BOT_BEHAVIOR.MIN_TYPING_TIME, Math.random() * BOT_BEHAVIOR.MAX_TYPING_TIME);
        setTimeout(async () => {
          await refreshChat();
          setIsTyping(false);
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
      if (res.data?.relationshipMemory !== undefined) {
        setRelationshipMemory(res.data.relationshipMemory);
      }
    } catch (e) { console.error(e); }
  };

  const handleSendGiftItem = async (giftId) => {
    const giftCosts = {
      rose: 5, coffee: 8, chocolate: 15, bouquet: 20, cake: 30, teddy: 50,
      lipstick: 120, ring: 250, heels: 250, dress: 350, necklace: 500,
      watch: 600, iphone: 1200, car: 5000, house: 25000
    };
    const cost = giftCosts[giftId] || 0;
    if (userGems < cost) {
      setGemsNeeded(cost);
      setShowInsufficientGemsModal(true);
      setShowGiftsDrawer(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${api.Url}/user/chats/${chatId}/gifts`, { giftId }, { headers });
      if (res.data?.success) {
        const d = res.data.data;
        setUserGems(d.gems);
        setRelationshipXP(d.relationshipXP);
        setRelationshipLevel(d.relationshipLevel);
        setCompanionEmotion(d.currentEmotion);
        setGiftsSent(d.giftsSent || []);
        
        if (d.messages) {
          setMessages(d.messages.map(formatMessageData));
        }
        
        // Trigger flying gift animation
        setActiveFlyingGift({ giftId, name: giftId });
        setTimeout(() => setActiveFlyingGift(null), 2500);

        showNotification("Gift sent successfully! ❤️", "success");
        setShowGiftsDrawer(false);
      }
    } catch (e) {
      console.error(e);
      showNotification(e.response?.data?.message || "Failed to send gift.", "error");
    }
  };

  const handleGoOnDateDestination = async (dateType) => {
    if (userGems < 80) {
      setGemsNeeded(80);
      setShowInsufficientGemsModal(true);
      setShowGiftsDrawer(false);
      return;
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${api.Url}/user/chats/${chatId}/dates`, { dateType }, { headers });
      if (res.data?.success) {
        const d = res.data.data;
        setUserGems(d.gems);
        setRelationshipXP(d.relationshipXP);
        setRelationshipLevel(d.relationshipLevel);
        setCompanionEmotion(d.currentEmotion);
        setDatesCompleted(d.datesCompleted || []);
        
        if (d.messages) {
          setMessages(d.messages.map(formatMessageData));
        }
        
        showNotification(`Date completed! Cashback rewarded 💎`, "success");
        setShowGiftsDrawer(false);
      }
    } catch (e) {
      console.error(e);
      showNotification(e.response?.data?.message || "Failed to go on date.", "error");
    }
  };

  const handleBuyGemsInChat = async (amount, gemsCount) => {
    try {
      let userId = "";
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) userId = JSON.parse(userStr)?._id;
      } catch(e){}

      // Dynamically load Razorpay SDK if not already present
      if (!window.Razorpay) {
        await new Promise((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://checkout.razorpay.com/v1/checkout.js';
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY || 'rzp_live_SMglmw6VtV4h2O',
        amount: amount * 100,
        currency: 'INR',
        name: 'HeartEcho Gems',
        description: `Top up ${gemsCount} Gems`,
        handler: async (rzpRes) => {
          try {
            const saveRes = await axios.post(`${api.Url}/user/payment/save`, {
              user: userId,
              rupees: amount,
              transaction_id: rzpRes.razorpay_payment_id,
              platform: 'web',
              purchaseType: 'gems',
              gemsAmount: gemsCount
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            if (saveRes.data?.success) {
              setUserGems(saveRes.data.gems);
              setShowInsufficientGemsModal(false);
              setShowGiftsDrawer(false);
              showNotification(`✅ ${gemsCount} Gems added to your wallet!`, "success");
            }
          } catch (err) {
            console.error(err);
            showNotification("Payment saved but gems not credited. Contact support.", "error");
          }
        },
        prefill: { contact: localStorage.getItem("phone_number") || "" },
        notes: { userId, platform: 'web', purchaseType: 'gems', gemsAmount: gemsCount },
        theme: { color: '#ffd700' }
      };
      new window.Razorpay(options).open();
    } catch (e) {
      console.error(e);
      showNotification("Could not open payment. Please try again.", "error");
    }
  };

  const handleSaveMemoryField = async (field, val) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const updatedMemory = { ...aiMemory, [field]: val };
      const res = await axios.put(`${api.Url}/user/chats/${chatId}/memory`, { memory: updatedMemory }, { headers });
      if (res.data?.success) {
        setAiMemory(res.data.data);
        showNotification("Memory updated! AI will remember this. 🧠", "success");
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to save memory.", "error");
    }
  };

  const handlePersonalityChange = async (pType) => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await axios.post(`${api.Url}/user/chats/${chatId}/personality`, { personality: pType }, { headers });
      if (res.data?.success) {
        setPersonality(pType);
        showNotification(`AI Personality is now ${pType}!`, "success");
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to set personality.", "error");
    }
  };

  const handleClearChat = async () => {
    if (!window.confirm('Are you sure you want to clear ALL messages with this companion? This action cannot be undone.')) return;
    try {
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
      const res = await axios.post(`${api.Url}/user/chats/${chatId}/clear`, {}, { headers });
      if (res.data?.success) {
        setMessages([]);
        showNotification("✅ All chats cleared successfully.", "success");
      } else {
        showNotification("Failed to clear chats. Please try again.", "error");
      }
    } catch (e) {
      console.error(e);
      showNotification("Failed to clear chats.", "error");
    }
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
      
      {showQuotaPaywall && (
        <QuotaPaywallModal
          onClose={handlePaywallClose}
          aiName={userProfile?.name}
          userData={quotaUserData}
          token={token}
          eyebrow={isPremiumLocked ? "Premium Restricted Companion" : undefined}
          title={isPremiumLocked ? (
            <>
              {userProfile?.name || 'This Companion'} is for subscribers only.<br />
              <span className="qpm-title-accent">Join HeartEcho Premium 👑</span>
            </>
          ) : undefined}
        />
      )}

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
        <LoginModal onClose={() => setShowLoginModal(false)} mode={isGuest ? "guest" : "login"} />
      )}



      <PopNoti 
        {...notification} 
        isVisible={notification.show} 
        onClose={() => setNotification(n => ({ ...n, show: false }))} 
      />

      {/* GIFTS & DATES SHOP DRAWER */}
      <AnimatePresence>
        {showGiftsDrawer && (
          <div 
            className="gifts-drawer-backdrop" 
            onClick={() => setShowGiftsDrawer(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 99999,
              background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center'
            }}
          >
            <motion.div 
              className="gifts-drawer-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 250 }}
              style={{
                width: '100%',
                maxWidth: 'clamp(360px, 48vw, 580px)',
                background: 'linear-gradient(180deg, #111115 0%, #0c0c10 100%)',
                borderTopLeftRadius: '28px', borderTopRightRadius: '28px',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 'clamp(18px, 2.5vw, 26px) clamp(16px, 2vw, 26px)',
                boxShadow: '0 -16px 60px rgba(0,0,0,0.75)', display: 'flex',
                flexDirection: 'column', maxHeight: '88vh', overflow: 'hidden'
              }}
            >
              {/* Drag handle */}
              <div style={{ width: '38px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', margin: '0 auto 18px' }} />
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <img src="/gift_ic.png" alt="shop" style={{ width: '26px', height: '26px', objectFit: 'contain' }} />
                  <h2 style={{ fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', fontWeight: 800, color: 'white', margin: 0 }}>Gifts &amp; Dates Shop</h2>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.22)', padding: '5px 13px', borderRadius: '50px' }}>
                  <img src="/gems_ic.png" alt="gems" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                  <span style={{ color: '#ffd700', fontWeight: 800, fontSize: '0.9rem' }}>{userGems}</span>
                  <button 
                    onClick={() => setShopCategory("gems")}
                    style={{ background: 'none', border: 'none', color: '#ffd700', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem', padding: '0 0 0 1px', lineHeight: 1 }}
                    title="Buy Gems"
                  >+</button>
                </div>
              </div>

              {/* Category Tabs */}
              <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '14px', flexShrink: 0 }}>
                <button 
                  onClick={() => setShopCategory("gifts")}
                  style={{ 
                    flex: 1, padding: '9px 4px', borderRadius: '11px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', 
                    background: shopCategory === 'gifts' ? 'linear-gradient(135deg,rgba(207,65,133,0.28),rgba(207,65,133,0.1))' : 'transparent',
                    border: shopCategory === 'gifts' ? '1px solid rgba(207,65,133,0.45)' : '1px solid transparent',
                    color: shopCategory === 'gifts' ? '#ff6eb4' : 'rgba(255,255,255,0.4)', 
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                  }}
                >
                  <img src="/gift_ic.png" alt="gifts" style={{ width: '16px', height: '16px', objectFit: 'contain', opacity: shopCategory === 'gifts' ? 1 : 0.36 }} />
                  Gifts
                </button>
                <button 
                  onClick={() => setShopCategory("dates")}
                  style={{ 
                    flex: 1, padding: '9px 4px', borderRadius: '11px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', 
                    background: shopCategory === 'dates' ? 'linear-gradient(135deg,rgba(139,92,246,0.28),rgba(139,92,246,0.1))' : 'transparent',
                    border: shopCategory === 'dates' ? '1px solid rgba(139,92,246,0.45)' : '1px solid transparent',
                    color: shopCategory === 'dates' ? '#a78bfa' : 'rgba(255,255,255,0.4)', 
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                  }}
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: shopCategory === 'dates' ? 1 : 0.36 }}>
                    <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
                    <line x1="9" y1="3" x2="9" y2="18" />
                    <line x1="15" y1="6" x2="15" y2="21" />
                  </svg>
                  Dates
                </button>
                <button 
                  onClick={() => setShopCategory("gems")}
                  style={{ 
                    flex: 1, padding: '9px 4px', borderRadius: '11px', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer', 
                    background: shopCategory === 'gems' ? 'linear-gradient(135deg,rgba(255,215,0,0.22),rgba(255,165,0,0.1))' : 'transparent',
                    border: shopCategory === 'gems' ? '1px solid rgba(255,215,0,0.35)' : '1px solid transparent',
                    color: shopCategory === 'gems' ? '#ffd700' : 'rgba(255,255,255,0.4)', 
                    transition: 'all 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px'
                  }}
                >
                  <img src="/gems_ic.png" alt="gems" style={{ width: '16px', height: '16px', objectFit: 'contain', opacity: shopCategory === 'gems' ? 1 : 0.36 }} />
                  Gems
                </button>
              </div>
 
              {/* ── ITEMS PANEL ── */}
              <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', paddingBottom: '0', display: 'flex', flexDirection: 'column' }}>
 
                {/* ─── GIFTS ─── */}
                {shopCategory === 'gifts' && (() => {
                  const GIFT_CATS = [
                    { key: 'Flowers' },
                    { key: 'Chocolate' },
                    { key: 'Ring' },
                    { key: 'Cake' },
                    { key: 'Coffee' },
                  ];
                  const ALL_GIFTS = {
                    Flowers:   [
                      { id: 'rose',          name: 'Red Roses',     gems: 199 },
                      { id: 'pink_tulip',    name: 'Pink Tulips',   gems: 149 },
                      { id: 'sunflower',     name: 'Sunflower',     gems: 149 },
                      { id: 'mixed_bouquet', name: 'Mixed Bouquet', gems: 249 },
                      { id: 'blue_hydrangea',name: 'Blue Hydrangea',gems: 199 },
                    ],
                    Chocolate: [
                      { id: 'heart_choc',    name: 'Heart Chocolate Box',  gems: 149 },
                      { id: 'truffles',      name: 'Premium Truffles',     gems: 199 },
                      { id: 'choc_basket',   name: 'Chocolate Basket',     gems: 249 },
                      { id: 'ferrero',       name: 'Ferrero Rocher Box',   gems: 199 },
                      { id: 'love_choc',     name: 'Love Chocolate Box',   gems: 249 },
                    ],
                    Ring:      [
                      { id: 'silver_heart',  name: 'Silver Heart Ring',    gems: 499 },
                      { id: 'infinity',      name: 'Love Infinity Ring',   gems: 599 },
                      { id: 'solitaire',     name: 'Classic Solitaire',    gems: 799 },
                      { id: 'heart_diamond', name: 'Heart Diamond Ring',   gems: 999 },
                      { id: 'promise',       name: 'Promise Ring',         gems: 499 },
                    ],
                    Cake:      [
                      { id: 'choc_cake',     name: 'Chocolate Cake',       gems: 199 },
                      { id: 'red_velvet',    name: 'Red Velvet Cake',      gems: 179 },
                      { id: 'cheesecake',    name: 'Cheesecake',           gems: 199 },
                      { id: 'black_forest',  name: 'Black Forest Cake',    gems: 199 },
                      { id: 'birthday_cake', name: 'Birthday Cake',        gems: 199 },
                    ],
                    Coffee:    [
                      { id: 'cappuccino',    name: 'Cappuccino',           gems: 99  },
                      { id: 'latte',         name: 'Latte',                gems: 99  },
                      { id: 'mocha',         name: 'Mocha',                gems: 99  },
                      { id: 'cold_coffee',   name: 'Cold Coffee',          gems: 99  },
                      { id: 'espresso',      name: 'Espresso',             gems: 99  },
                    ],
                  };
                  const items = ALL_GIFTS[giftCategory] || [];
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                      {/* Category pills */}
                      <div className="laptop-scroll-container" style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '12px', flexShrink: 0 }}>
                        {GIFT_CATS.map(c => (
                          <button
                            key={c.key}
                            onClick={() => setGiftCategory(c.key)}
                            style={{
                              flexShrink: 0, display: 'flex', alignItems: 'center', gap: '5px',
                              padding: '6px 14px', borderRadius: '50px', border: 'none', cursor: 'pointer',
                              fontSize: '0.78rem', fontWeight: 700, whiteSpace: 'nowrap',
                              background: giftCategory === c.key
                                ? 'linear-gradient(90deg,#cf4185,#a8306b)'
                                : 'rgba(255,255,255,0.06)',
                              color: giftCategory === c.key ? '#fff' : 'rgba(255,255,255,0.55)',
                              transition: 'all 0.2s',
                              boxShadow: giftCategory === c.key ? '0 4px 14px rgba(207,65,133,0.35)' : 'none',
                            }}
                          >
                            <span>{renderGiftCatIcon(c.key)}</span>{c.key}
                          </button>
                        ))}
                      </div>

                      {/* Category heading */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                          <img src="/gift_ic.png" alt="gifts" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: 'white' }}>{giftCategory}</span>
                        </div>
                        <span style={{ fontSize: '0.72rem', color: '#cf4185', fontWeight: 700, cursor: 'pointer' }}>View All →</span>
                      </div>

                      {/* Gifts grid */}
                      <div className="laptop-scroll-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(105px, 1fr))', gap: '12px', flex: 1, overflowY: 'auto', padding: '4px 2px 10px' }}>
                        {items.map(item => (
                          <button
                            key={item.id}
                            onClick={() => handleSendGiftItem(item.id)}
                            style={{
                              display: 'flex', flexDirection: 'column', alignItems: 'center',
                              background: 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))',
                              border: '1px solid rgba(255,255,255,0.08)',
                              borderRadius: '18px', padding: '12px 8px 10px', cursor: 'pointer',
                              outline: 'none', transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                              color: 'white', gap: '6px'
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.borderColor = 'rgba(207,65,133,0.5)';
                              e.currentTarget.style.background = 'linear-gradient(145deg, rgba(207,65,133,0.15), rgba(207,65,133,0.04))';
                              e.currentTarget.style.transform = 'translateY(-4px)';
                              e.currentTarget.style.boxShadow = '0 8px 24px rgba(207,65,133,0.22)';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                              e.currentTarget.style.background = 'linear-gradient(145deg, rgba(255,255,255,0.04), rgba(255,255,255,0.015))';
                              e.currentTarget.style.transform = 'translateY(0)';
                              e.currentTarget.style.boxShadow = 'none';
                            }}
                          >
                            {/* Gift image wrapper */}
                            <div style={{ width: '68px', height: '64px', borderRadius: '14px', overflow: 'hidden', background: 'rgba(207,65,133,0.06)', border: '1px solid rgba(207,65,133,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img
                                src={getGiftImageSrc(item.id)}
                               alt={item.name}
                               style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                              />
                            </div>
                            <span style={{ fontSize: '0.72rem', fontWeight: 800, textAlign: 'center', lineHeight: 1.2, color: 'rgba(255,255,255,0.95)' }}>{item.name}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(255,215,0,0.08)', padding: '2px 8px', borderRadius: '20px', border: '1px solid rgba(255,215,0,0.18)' }}>
                              <img src="/gems_ic.png" alt="gems" style={{ width: '12px', height: '12px', objectFit: 'contain' }} />
                              <span style={{ fontSize: '0.72rem', color: '#ffd700', fontWeight: 900 }}>{item.gems}</span>
                            </div>
                          </button>
                        ))}
                      </div>

                      {/* Bottom action bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(135deg, rgba(207,65,133,0.12), rgba(168,48,107,0.04))', border: '1px solid rgba(207,65,133,0.22)', borderRadius: '16px', padding: '12px 14px', marginTop: '12px', flexShrink: 0 }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: 'white' }}>Make her smile today!</span>
                          </div>
                          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.45)' }}>A small gift, a big smile.</span>
                        </div>
                        <button
                          onClick={() => {}}
                          style={{
                            background: 'linear-gradient(90deg,#cf4185,#a8306b)', border: 'none',
                            color: 'white', fontWeight: 800, fontSize: '0.82rem', padding: '10px 20px',
                            borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center',
                            gap: '6px', whiteSpace: 'nowrap', boxShadow: '0 4px 18px rgba(207,65,133,0.45)',
                            transition: 'transform 0.18s ease'
                          }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                        >
                          <img src="/gift_ic.png" alt="" style={{ width: '14px', height: '14px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                          Send Gift
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* ─── DATES ─── */}
                {shopCategory === 'dates' && (() => {
                  const DATES = [
                    { id: 'Restaurant', name: 'Restaurant',  sub: 'Candle light, delicious\nfood & deep talks',   bg: 'linear-gradient(180deg,rgba(60,10,25,0.1) 0%,rgba(0,0,0,0.9) 100%)', imgBg: '#1a0810' },
                    { id: 'Cafe',       name: 'Cafe',        sub: 'Warm coffees, sweet\nconversations',           bg: 'linear-gradient(180deg,rgba(15,30,15,0.1) 0%,rgba(0,0,0,0.9) 100%)', imgBg: '#0a180a' },
                    { id: 'Beach',      name: 'Beach',       sub: 'Waves, sunset &\nendless talks',               bg: 'linear-gradient(180deg,rgba(10,20,50,0.1) 0%,rgba(0,0,0,0.9) 100%)', imgBg: '#060e2a' },
                    { id: 'Movie',      name: 'Movie',       sub: 'Pick a movie & enjoy\ntogether',               bg: 'linear-gradient(180deg,rgba(20,10,40,0.1) 0%,rgba(0,0,0,0.9) 100%)', imgBg: '#100820' },
                    { id: 'Road Trip',  name: 'Road Trip',   sub: 'Music, adventure &\nunforgettable vibes',      bg: 'linear-gradient(180deg,rgba(10,10,10,0.1) 0%,rgba(0,0,0,0.9) 100%)', imgBg: '#0d0d0d' },
                    { id: 'Temple',     name: 'Temple',      sub: 'Pray together for a\nblessed future',          bg: 'linear-gradient(180deg,rgba(40,20,5,0.1) 0%,rgba(0,0,0,0.9) 100%)',  imgBg: '#1a0e04' },
                    { id: 'Shopping',   name: 'Shopping',    sub: 'Pamper her with\ndresses & cosmetics',         bg: 'linear-gradient(180deg,rgba(20,10,35,0.1) 0%,rgba(0,0,0,0.9) 100%)', imgBg: '#10081e' },
                    { id: 'Rain Walk',  name: 'Rain Walk',   sub: 'Romantic walk under\na shared umbrella',       bg: 'linear-gradient(180deg,rgba(8,18,30,0.1) 0%,rgba(0,0,0,0.9) 100%)',  imgBg: '#08121e' },
                    { id: 'Festival',   name: 'Festival',    sub: 'Diwali sparklers or\nHoli colors together',    bg: 'linear-gradient(180deg,rgba(30,20,0,0.1) 0%,rgba(0,0,0,0.9) 100%)',  imgBg: '#1a1200' },
                    { id: 'Night Drive',name: 'Night Drive', sub: 'Cruise through neon\ncity lights together',    bg: 'linear-gradient(180deg,rgba(5,5,20,0.1) 0%,rgba(0,0,0,0.9) 100%)',  imgBg: '#050514' },
                  ];
                  return (
                    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, position: 'relative' }}>
                      {/* Header text with navigation arrows */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexShrink: 0 }}>
                        <div>
                          <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', marginBottom: '3px' }}>Choose your date</div>
                          <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.42)' }}>Plan the perfect virtual date with your companion</span>
                        </div>
                        {/* Header Navigation Arrows */}
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button
                            onClick={() => { if (datesScrollRef.current) datesScrollRef.current.scrollBy({ left: -180, behavior: 'smooth' }); }}
                            aria-label="Scroll left"
                            style={{
                              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                              color: 'white', width: '30px', height: '30px', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem', fontWeight: 'bold'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#cf4185'; e.currentTarget.style.borderColor = '#cf4185'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                          >
                            ‹
                          </button>
                          <button
                            onClick={() => { if (datesScrollRef.current) datesScrollRef.current.scrollBy({ left: 180, behavior: 'smooth' }); }}
                            aria-label="Scroll right"
                            style={{
                              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                              color: 'white', width: '30px', height: '30px', borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer', transition: 'all 0.2s', fontSize: '1rem', fontWeight: 'bold'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.background = '#cf4185'; e.currentTarget.style.borderColor = '#cf4185'; }}
                            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; }}
                          >
                            ›
                          </button>
                        </div>
                      </div>

                      {/* Scroll container wrapper */}
                      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, minHeight: 0 }}>
                        {/* Horizontal scroll cards */}
                        <div
                          ref={datesScrollRef}
                          className="laptop-scroll-container"
                          style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '6px 4px 12px', flex: 1, alignItems: 'stretch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                        >
                          {DATES.map(dest => (
                            <div
                              key={dest.id}
                              style={{
                                flexShrink: 0, width: '140px',
                                borderRadius: '20px', overflow: 'hidden',
                                background: dest.imgBg,
                                border: '1px solid rgba(255,255,255,0.08)',
                                display: 'flex', flexDirection: 'column',
                                position: 'relative', cursor: 'pointer',
                                transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease',
                                minHeight: '220px'
                              }}
                              onMouseEnter={e => {
                                  e.currentTarget.style.transform = 'translateY(-4px)';
                                  e.currentTarget.style.borderColor = 'rgba(207,65,133,0.5)';
                                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(207,65,133,0.25)';
                              }}
                              onMouseLeave={e => {
                                  e.currentTarget.style.transform = 'translateY(0)';
                                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                                  e.currentTarget.style.boxShadow = 'none';
                              }}
                              onClick={() => handleGoOnDateDestination(dest.id)}
                            >
                              {/* Background image area (tall) - clean picture without overlay icons */}
                              <div style={{
                                flex: 1,
                                background: `url('/dates/${dest.id.toLowerCase().replace(" ", "_")}.png') center/cover no-repeat`,
                                position: 'relative', minHeight: '130px'
                              }}>
                                {/* Overlay gradient */}
                                <div style={{ position: 'absolute', inset: 0, background: dest.bg, pointerEvents: 'none' }} />
                              </div>

                              {/* Card footer */}
                              <div style={{ padding: '14px 10px 12px', textAlign: 'center', background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}>
                                <div style={{ fontSize: '0.82rem', fontWeight: 800, color: 'white', marginBottom: '4px' }}>{dest.name}</div>
                                <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, marginBottom: '10px', whiteSpace: 'pre-line' }}>{dest.sub}</div>
                                <button
                                  onClick={e => { e.stopPropagation(); handleGoOnDateDestination(dest.id); }}
                                  style={{
                                    background: 'linear-gradient(90deg,#cf4185,#a8306b)', border: 'none',
                                    color: 'white', fontWeight: 700, fontSize: '0.75rem', padding: '7px 22px',
                                    borderRadius: '50px', cursor: 'pointer', width: '100%',
                                    boxShadow: '0 3px 12px rgba(207,65,133,0.4)'
                                  }}
                                >Go</button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom bar */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 4px 4px', marginTop: '12px', borderTop: '1px solid rgba(255,255,255,0.06)', flexShrink: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.55)' }}>Every moment with you feels special, no matter where we are.</span>
                        </div>
                        <button
                          onClick={() => handleGoOnDateDestination(DATES[Math.floor(Math.random() * DATES.length)].id)}
                          style={{
                            flexShrink: 0, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
                            color: 'white', fontWeight: 700, fontSize: '0.76rem', padding: '8px 16px',
                            borderRadius: '50px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          Surprise Me
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* ─── GEMS STORE ─── */}
                {shopCategory === 'gems' && (
                  <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                    {/* Store Header Banner */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexShrink: 0 }}>
                      <div>
                        <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'white', marginBottom: '2px' }}>Gem Packs Store</div>
                        <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.42)' }}>Instant delivery · Razorpay Secured · Never Expire</span>
                      </div>
                     
                    </div>

                    {/* Pack Cards Grid */}
                    <div className="laptop-scroll-container" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(135px, 14vw, 170px), 1fr))', gap: '14px', flex: 1, overflowY: 'auto', padding: '4px 2px 12px' }}>
                      {[
                        { gems: 50,   bonus: '',           price: 29,  origPrice: 49,   img: '/gems_store/50_gem.png',   tag: 'Starter',      tagColor: '#60a5fa', tagBg: 'rgba(96,165,250,0.18)',   bg: 'linear-gradient(145deg,#08101e,#0f1a2e)' },
                        { gems: 120,  bonus: '+10 Extra',  price: 59,  origPrice: 99,   img: '/gems_store/120_gem.png',  tag: 'Popular',      tagColor: '#34d399', tagBg: 'rgba(52,211,153,0.18)',   bg: 'linear-gradient(145deg,#081810,#0d2418)' },
                        { gems: 300,  bonus: '+50 Extra',  price: 99,  origPrice: 199,  img: '/gems_store/300_gem.png',  tag: 'BEST VALUE',   tagColor: '#fff',    tagBg: '#cf4185',                 bg: 'linear-gradient(145deg,#180810,#2e0f20)' },
                        { gems: 800,  bonus: '+150 Extra', price: 199, origPrice: 399,  img: '/gems_store/800_gem.png',  tag: 'Super Pack',   tagColor: '#fb923c', tagBg: 'rgba(251,146,60,0.18)',   bg: 'linear-gradient(145deg,#181000,#281800)' },
                        { gems: 2500, bonus: '+500 Extra', price: 499, origPrice: 999,  img: '/gems_store/2500_gem.png', tag: 'VIP Pack',     tagColor: '#a78bfa', tagBg: 'rgba(167,139,250,0.18)',  bg: 'linear-gradient(145deg,#100818,#1c1030)' },
                        { gems: 7000, bonus: '+1500 Extra',price: 999, origPrice: 1999, img: '/gems_store/7000_gem.png', tag: 'ULTIMATE',     tagColor: '#ffd700', tagBg: '#6b4f00',                 bg: 'linear-gradient(145deg,#141000,#201c00)' }
                      ].map(pack => (
                        <div
                          key={pack.gems}
                          style={{
                            background: pack.bg,
                            border: `1px solid ${pack.tagColor}33`,
                            borderRadius: '24px', overflow: 'hidden',
                            display: 'flex', flexDirection: 'column', alignItems: 'center',
                            position: 'relative',
                            transition: 'transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease'
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = `${pack.tagColor}77`;
                            e.currentTarget.style.transform = 'translateY(-4px)';
                            e.currentTarget.style.boxShadow = `0 12px 32px ${pack.tagColor}28`;
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = `${pack.tagColor}33`;
                            e.currentTarget.style.transform = 'translateY(0)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}
                        >
                          {/* Tag banner */}
                          <div style={{ width: '100%', padding: '6px 0', textAlign: 'center', background: pack.tagBg, fontSize: '0.62rem', fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', color: pack.tagColor }}>
                            {pack.tag}
                          </div>
                          {/* Gem image */}
                          <div style={{ padding: '14px 0 4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <img src={pack.img} alt={`${pack.gems} gems`} style={{ width: 'clamp(62px, 7vw, 86px)', height: 'clamp(62px, 7vw, 86px)', objectFit: 'contain', filter: 'drop-shadow(0 6px 18px rgba(255,215,0,0.32))' }} />
                          </div>
                          {/* Count */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '2px' }}>
                            <img src="/gems_ic.png" alt="gems" style={{ width: '15px', height: '15px', objectFit: 'contain' }} />
                            <span style={{ fontSize: '1.1rem', fontWeight: 900, color: 'white' }}>{pack.gems >= 1000 ? `${pack.gems / 1000}K` : pack.gems}</span>
                          </div>
                          {/* Bonus tag */}
                          {pack.bonus ? (
                            <span style={{ fontSize: '0.62rem', color: pack.tagColor, fontWeight: 800, marginBottom: '8px', background: `${pack.tagColor}15`, padding: '2px 8px', borderRadius: '10px' }}>{pack.bonus}</span>
                          ) : (
                            <span style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.38)', marginBottom: '8px' }}>Gems</span>
                          )}

                          {/* Price Display: Strikethrough & Special Price */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.38)', textDecoration: 'line-through' }}>₹{pack.origPrice}</span>
                            <span style={{ fontSize: '0.92rem', color: '#ffd700', fontWeight: 900 }}>₹{pack.price}</span>
                          </div>

                          {/* Buy button */}
                          <button
                            onClick={() => handleBuyGemsInChat(pack.price, pack.gems)}
                            style={{
                              width: 'calc(100% - 18px)', border: 'none', marginBottom: '14px',
                              background: pack.tagColor === '#fff' ? 'linear-gradient(90deg,#cf4185,#a8306b)' : `linear-gradient(90deg,${pack.tagColor}ee,${pack.tagColor}99)`,
                              color: '#fff', fontWeight: 900, fontSize: '0.88rem',
                              padding: '10px 6px', borderRadius: '14px',
                              cursor: 'pointer', boxShadow: `0 4px 16px ${pack.tagColor}30`,
                              transition: 'transform 0.18s ease'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; }}
                            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                          >
                            Buy · ₹{pack.price}
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Trust footer note */}
                    <div style={{ textAlign: 'center', padding: '10px 0 4px', fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                      🔒 256-bit Secure Razorpay Checkout · Instant Wallet Credit
                    </div>
                  </div>
                )}

              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* INSUFFICIENT GEMS IN-CHAT SHOP MODAL */}
      <AnimatePresence>
        {showInsufficientGemsModal && (
          <div 
            className="gifts-drawer-backdrop" 
            onClick={() => setShowInsufficientGemsModal(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 1100,
              background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }}
          >
            <motion.div 
              className="gems-buy-panel"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              style={{
                width: '100%', maxWidth: '420px', background: '#0d0d0e',
                borderRadius: '24px', border: '1px solid rgba(255,255,255,0.08)',
                padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.6)',
                display: 'flex', flexDirection: 'column', textAlign: 'center'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                <img src="/gems_ic.png" alt="gems" style={{ width: '64px', height: '64px', objectFit: 'contain', filter: 'drop-shadow(0 4px 20px rgba(255,215,0,0.4))' }} />
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'white', margin: '0 0 8px 0' }}>Not Enough Gems</h3>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.5)', margin: '0 0 20px 0', lineHeight: 1.4 }}>
                You need <strong>{gemsNeeded} Gems</strong> for this action. You currently have <strong>{userGems} Gems</strong>. Top up instantly to continue.
              </p>

              {/* Gem Pack Cards Grid inside chat */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '24px' }}>
                {[
                  { gems: 50,   price: 29,  origPrice: 49,   img: '/gems_store/50_gem.png',   color: '#60a5fa' },
                  { gems: 120,  price: 59,  origPrice: 99,   img: '/gems_store/120_gem.png',  color: '#34d399' },
                  { gems: 300,  price: 99,  origPrice: 199,  img: '/gems_store/300_gem.png',  color: '#cf4185' },
                  { gems: 800,  price: 199, origPrice: 399,  img: '/gems_store/800_gem.png',  color: '#fb923c' },
                  { gems: 2500, price: 499, origPrice: 999,  img: '/gems_store/2500_gem.png', color: '#a78bfa' },
                  { gems: 7000, price: 999, origPrice: 1999, img: '/gems_store/7000_gem.png', color: '#ffd700' }
                ].map(pack => (
                  <button
                    key={pack.gems}
                    onClick={() => handleBuyGemsInChat(pack.price, pack.gems)}
                    style={{
                      background: `${pack.color}10`, border: `1px solid ${pack.color}33`,
                      borderRadius: '16px', padding: '10px 4px', cursor: 'pointer', display: 'flex',
                      flexDirection: 'column', alignItems: 'center', transition: 'all 0.2s', color: 'white', gap: '4px'
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = `${pack.color}77`; e.currentTarget.style.background = `${pack.color}20`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = `${pack.color}33`; e.currentTarget.style.background = `${pack.color}10`; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    <img src={pack.img} alt={`${pack.gems} gems`} style={{ width: '38px', height: '38px', objectFit: 'contain', filter: 'drop-shadow(0 2px 6px rgba(255,215,0,0.25))' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                      <img src="/gems_ic.png" alt="gems" style={{ width: '10px', height: '10px', objectFit: 'contain' }} />
                      <span style={{ fontSize: '0.76rem', fontWeight: 900, color: 'white' }}>{pack.gems >= 1000 ? `${pack.gems/1000}K` : pack.gems}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.35)', textDecoration: 'line-through' }}>₹{pack.origPrice}</span>
                      <span style={{ fontSize: '0.75rem', color: pack.color, fontWeight: 900 }}>₹{pack.price}</span>
                    </div>
                  </button>
                ))}
              </div>

              <button 
                onClick={() => setShowInsufficientGemsModal(false)}
                style={{
                  background: 'transparent', border: '1px solid rgba(255,255,255,0.08)',
                  color: 'rgba(255,255,255,0.5)', padding: '10px', borderRadius: '50px',
                  fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {userProfile?.name || "AI Companion"} 
              <span style={{ fontSize: '1.1rem' }}>
                { { Happy: "😊", Sad: "😔", Romantic: "❤️", Angry: "😒", Busy: "💻", Sleepy: "😴" }[companionEmotion] || "😊" }
              </span>
              {streakCount > 0 && (
                <span style={{ color: '#ff9900', fontWeight: 'bold', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '2px' }} title="Snapchat Streak">
                  🔥 {streakCount}
                </span>
              )}
            </h3>
            <span className={`status-text ${isTyping ? 'highlight' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
              {isTyping ? "typing..." : (isBotOnline ? "Online" : "Offline")}
              {activeDateTimer && (
                <span style={{
                  fontSize: '0.72rem', color: '#ff6eb4', fontWeight: '800',
                  background: 'rgba(255,110,180,0.15)', border: '1px solid rgba(255,110,180,0.3)',
                  padding: '2px 8px', borderRadius: '20px', marginLeft: '6px',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                  lineHeight: 1
                }}>
                  ⏳ {activeDateTimer.dateType}: {Math.floor(activeDateTimer.remainingSeconds / 60)}:{(activeDateTimer.remainingSeconds % 60).toString().padStart(2, '0')}
                </span>
              )}
            </span>
          </div>
        </div>
        
        <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button 
            className="nav-btn gift-header-btn" 
            onClick={() => { setShopCategory("gifts"); fetchLatestRelationshipStats(); setShowGiftsDrawer(true); }}
            title="Gifts & Dates Shop"
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              width: '36px', height: '36px', borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(207,65,133,0.22), rgba(207,65,133,0.08))',
              border: '1px solid rgba(207,65,133,0.4)',
              cursor: 'pointer', transition: 'all 0.2s',
              boxShadow: '0 2px 10px rgba(207,65,133,0.22)'
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.borderColor = '#cf4185'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(207,65,133,0.4)'; }}
          >
            <img src="/gift_ic.png" alt="Gifts" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
          </button>
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
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Phone size={20} />
          </button>
          <button className="nav-btn" onClick={() => setShowOverlay(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Info size={20} /></button>
        </div>
      </div>

      {/* MESSAGES */}
      <div className="chat-messages-area" ref={chatContainerRef} style={{ position: 'relative' }}>
        {/* Flying gift animation - scoped inside chat area */}
        {activeFlyingGift && (
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1000, overflow: 'hidden' }}>
            <div className="flying-gift-item">
              <img 
                src={getGiftImageSrc(activeFlyingGift?.giftId, activeFlyingGift?.name)} 
                alt="flying gift" 
                style={{ width: '100px', height: '100px', objectFit: 'contain', mixBlendMode: 'screen', filter: 'drop-shadow(0 0 28px #cf4185)' }} 
              />
            </div>
            {[...Array(14)].map((_, i) => (
              <div 
                key={i} 
                className="sparkle-heart-particle"
                style={{
                  left: `${15 + ((i * 6) % 70)}%`,
                  bottom: `${8 + ((i * 5) % 28)}%`,
                  animationDelay: `${i * 0.1}s`,
                  fontSize: `${1.1 + ((i % 4) * 0.25)}rem`,
                  position: 'absolute'
                }}
              >
                {['✨', '💖', '💕', '🌹', '✨', '🌸', '💖'][i % 7]}
              </div>
            ))}
          </div>
        )}
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
            const isMedia = (msg.mediaType === 'image' || msg.mediaType === 'video' || msg.mediaType === 'audio') && msg.mediaType !== 'gift' && msg.mediaType !== 'date';
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
                ) : msg.mediaType === 'gift' || (isMe && msg.text?.startsWith("🎁 Sent ")) ? (
                  <div className="message-bubble gift-bubble" style={{
                    background: 'linear-gradient(135deg, rgba(207,65,133,0.28) 0%, rgba(168,48,107,0.12) 100%)',
                    border: '1px solid rgba(207,65,133,0.45)',
                    borderRadius: '24px', padding: '14px 16px',
                    boxShadow: '0 8px 28px rgba(207,65,133,0.3)',
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: '8px', minWidth: '150px'
                  }}>
                    {/* Big 3D Sticker Image - mixBlendMode screen removes dark backgrounds */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px' }}>
                      <img 
                        src={getGiftImageSrc(msg.giftData?.giftId, msg.giftData?.name || msg.text)} 
                        alt="Gift Sticker" 
                        style={{ 
                          width: '110px', 
                          height: '110px', 
                          objectFit: 'contain',
                          mixBlendMode: 'screen',
                          filter: 'drop-shadow(0 0 18px rgba(207,65,133,0.55))'
                        }} 
                      />
                    </div>
                    {/* Details */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: '8px' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 900, color: 'white', textAlign: 'center' }}>
                        {msg.giftData?.name ? `Sent ${msg.giftData.name}` : (msg.text || '').replace(/^🎁\s*/, '').replace(/^Sent\s+/, 'Sent ')}
                      </span>
                      <span style={{ fontSize: '0.7rem', color: '#ff6eb4', fontWeight: 800, marginTop: '2px' }}>
                        Gift Delivered ❤️
                      </span>
                      <div className="msg-meta" style={{ marginTop: '4px', width: '100%', justifyContent: 'flex-end' }}>
                        <span className="time">{formatTime(msg.time)}</span>
                        {isMe && (
                          <span className="ticks">
                            {msg.isRead ? <CheckCheck size={14} className="read" /> : <Check size={14} />}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ) : msg.mediaType === 'date' || (isMe && msg.text?.includes("Took ") && msg.text?.includes("Date")) ? (() => {
                    const dt = (msg.dateType || '').toLowerCase().replace(/\s+/g, '_');
                    const dateImgMap = {
                      restaurant: '/dates/restaurant.png', cafe: '/dates/cafe.png',
                      beach: '/dates/beach.png', movie: '/dates/movie.png',
                      road_trip: '/dates/road_trip.png', temple: '/dates/temple.png',
                      shopping: '/dates/shopping.png', rain_walk: '/dates/rain_walk.png',
                      festival: '/dates/festival.png', night_drive: '/dates/night_drive.png',
                    };
                    const dateEmoji = {
                      restaurant: '🍷', cafe: '☕', beach: '🌊', movie: '🎬',
                      road_trip: '🚗', temple: '🙏', shopping: '🛍️',
                      rain_walk: '☂️', festival: '🎆', night_drive: '🌃'
                    };
                    const imgSrc = dateImgMap[dt] || '/dates/cafe.png';
                    const emoji = dateEmoji[dt] || '❤️';
                    const displayName = msg.dateType || (msg.text?.match(/Date to the (.+)!$/)?.[1]) || 'Date';
                    return (
                      <div className="message-bubble date-bubble" style={{
                        padding: 0, overflow: 'hidden', borderRadius: '22px',
                        border: '1px solid rgba(207,65,133,0.45)',
                        boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
                        width: '240px', background: '#0a0010',
                        display: 'flex', flexDirection: 'column'
                      }}>
                        <div style={{ position: 'relative', width: '100%', height: '150px', overflow: 'hidden' }}>
                          <img src={imgSrc} alt={displayName} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05) 0%, rgba(0,0,0,0.6) 100%)' }} />
                          <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(207,65,133,0.85)', backdropFilter: 'blur(6px)', borderRadius: '20px', padding: '3px 10px', fontSize: '0.65rem', fontWeight: 900, color: 'white', border: '1px solid rgba(255,255,255,0.15)' }}>+40 XP ✨</div>
                          <div style={{ position: 'absolute', bottom: '10px', left: '12px', fontSize: '1.6rem', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }}>{emoji}</div>
                        </div>
                        <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: '3px' }}>
                          <span style={{ fontSize: '0.9rem', fontWeight: 900, color: 'white', lineHeight: 1.3 }}>Date at the {displayName} 💕</span>
                          <span style={{ fontSize: '0.68rem', color: '#ff6eb4', fontWeight: 800 }}>Virtual Date Unlocked 🌹</span>
                          <div className="msg-meta" style={{ marginTop: '4px', justifyContent: 'flex-end' }}>
                            <span className="time">{formatTime(msg.time)}</span>
                            {isMe && <span className="ticks">{msg.isRead ? <CheckCheck size={14} className="read" /> : <Check size={14} />}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })() : (
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
            disabled={isTyping || isPremiumLocked}
            title="Request Photo (15 Tokens)"
          >
            <ImageIcon size={22} />
          </button>

          <button 
            className="icon-btn" 
            onClick={() => handleSendMessage("/video Send me a video")}
            disabled={isTyping || isPremiumLocked}
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
                isPremiumLocked
                  ? "Premium companion only"
                  : isSubscribed 
                    ? "Message..." 
                    : remainingQuota > 0 
                      ? "Type a message..." 
                      : "Out of tokens"
              }
              disabled={isTyping || (!isSubscribed && remainingQuota <= 0) || isPremiumLocked}
            />
          </div>

          {/* DYNAMIC BUTTON: Send or Subscribe */}
          {isPremiumLocked ? (
            <button 
                className="send-btn active" 
                style={{ background: 'linear-gradient(135deg, #ffd700, #ffa500)', color: 'black' }}
                onClick={() => {
                  setShowQuotaPaywall(true);
                }}
                title="Premium Companion Locked"
            >
                <Crown size={20} fill="black" />
            </button>
          ) : !isSubscribed && remainingQuota <= 0 ? (
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
        style={{ zIndex: 100000 }}
      >
        <div className={`profile-modal ${showOverlay ? 'slide-up' : ''}`} style={{ background: 'linear-gradient(180deg, #141419 0%, #0a0a0d 100%)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 24px 70px rgba(0,0,0,0.85)' }}>
          <button className="modal-close-btn" onClick={() => setShowOverlay(false)} style={{ zIndex: 120 }}>
            <X size={20} />
          </button>
          
          <div className="modal-scroll-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Companion Portrait Card */}
            <div className="portrait-image-wrapper" style={{ flexShrink: 0, height: '220px', overflow: 'hidden', position: 'relative' }}>
              <img 
                src={userProfile?.avatar_img || "/heartecho_b.png"} 
                alt="Full Portrait" 
                className="portrait-image" 
                style={{ objectPosition: 'center 20%' }}
              />
              <div className="portrait-gradient-overlay" style={{ height: '80%', background: 'linear-gradient(to top, #0a0a0d 0%, rgba(10,10,13,0.6) 60%, transparent 100%)' }}></div>
              <div className="portrait-name-overlay" style={{ bottom: '14px', left: '16px', right: '16px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'white', margin: '0 0 4px 0' }}>{userProfile?.name || "AI Companion"}</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ background: 'linear-gradient(90deg,#cf4185,#a8306b)', padding: '4px 14px', borderRadius: '50px', fontSize: '0.72rem', fontWeight: 800, color: 'white', boxShadow: '0 3px 12px rgba(207,65,133,0.35)' }}>
                    { { 1: "Stranger", 2: "Friend", 3: "Close Friend", 4: "Crush", 5: "Dating ❤️", 6: "Partner", 7: "Soulmate 👑" }[relationshipLevel] || "Stranger" }
                  </span>
                  <span style={{ fontSize: '0.72rem', color: '#ffd700', background: 'rgba(255,215,0,0.1)', border: '1px solid rgba(255,215,0,0.22)', padding: '3px 10px', borderRadius: '50px', fontWeight: 800 }}>
                    {relationshipXP} XP
                  </span>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '4px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '16px', margin: '12px 16px 0', flexShrink: 0, border: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { id: 'timeline', label: 'Timeline' },
                { id: 'gifts', label: 'Gifts' },
                ...((subscriptionTier === 'yearly' || subscriptionTier === 'yearly_pro' || subscriptionTier === 'ultimate')
                  ? [{ id: 'memory', label: 'Memory' }]
                  : []),
                { id: 'settings', label: 'Settings' }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setProfileSubTab(tab.id)}
                  style={{
                    flex: 1, padding: '9px 4px', borderRadius: '12px', fontSize: '0.78rem', fontWeight: 800, cursor: 'pointer',
                    background: profileSubTab === tab.id ? 'linear-gradient(90deg,#cf4185,#a8306b)' : 'transparent',
                    border: 'none',
                    color: profileSubTab === tab.id ? '#ffffff' : 'rgba(255,255,255,0.45)',
                    transition: 'all 0.2s', boxShadow: profileSubTab === tab.id ? '0 4px 14px rgba(207,65,133,0.35)' : 'none'
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Subtabs Scrollable Panel */}
            <div className="laptop-scroll-container" style={{ flex: 1, overflowY: 'auto', padding: '16px 16px 20px' }}>
              
              {/* TAB 1: RELATIONSHIP TIMELINE & BOND PROGRESS */}
              {profileSubTab === 'timeline' && (
                <div>
                  {/* Bond XP Stats */}
                  <div style={{ marginBottom: '18px', background: 'linear-gradient(135deg, rgba(207,65,133,0.12), rgba(207,65,133,0.03))', border: '1px solid rgba(207,65,133,0.22)', borderRadius: '18px', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 800, color: 'white' }}>Bond Progress</span>
                      <span style={{ fontSize: '0.78rem', color: '#ff6eb4', fontWeight: 900 }}>
                        {relationshipXP} XP
                      </span>
                    </div>
                    
                    {/* XP Progress Bar Calculation */}
                    {(() => {
                      const getXPProgress = (xp) => {
                        if (xp < 50) return { pct: (xp / 50) * 100, next: 50 - xp, nextLvl: "Friend" };
                        if (xp < 150) return { pct: ((xp - 50) / 100) * 100, next: 150 - xp, nextLvl: "Close Friend" };
                        if (xp < 350) return { pct: ((xp - 150) / 200) * 100, next: 350 - xp, nextLvl: "Crush" };
                        if (xp < 650) return { pct: ((xp - 350) / 300) * 100, next: 650 - xp, nextLvl: "Dating" };
                        if (xp < 1100) return { pct: ((xp - 650) / 450) * 100, next: 1100 - xp, nextLvl: "Partner" };
                        if (xp < 2000) return { pct: ((xp - 1100) / 900) * 100, next: 2000 - xp, nextLvl: "Soulmate" };
                        return { pct: 100, next: 0, nextLvl: "Max Level" };
                      };
                      const calc = getXPProgress(relationshipXP);
                      return (
                        <>
                          <div style={{ height: '7px', background: 'rgba(255,255,255,0.08)', borderRadius: '10px', overflow: 'hidden', margin: '6px 0 10px 0' }}>
                            <div style={{ width: `${calc.pct}%`, background: 'linear-gradient(90deg,#cf4185,#a8306b)', height: '100%', borderRadius: '10px', boxShadow: '0 0 10px rgba(207,65,133,0.5)' }}></div>
                          </div>
                          {calc.next > 0 && (
                            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)' }}>
                              Need <strong style={{ color: '#ff6eb4' }}>{calc.next} XP</strong> more to reach <strong style={{ color: 'white' }}>{calc.nextLvl}</strong>
                            </span>
                          )}
                        </>
                      );
                    })()}
                  </div>

                  {/* Unlockable timeline dates */}
                  <h4 style={{ color: 'white', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px 0' }}>Relationship Journey</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', position: 'relative', paddingLeft: '22px', borderLeft: '2px solid rgba(255,255,255,0.08)' }}>
                    {[
                      { lvl: 1, name: 'Stranger', desc: 'We started as strangers, said hello and got to know each other.', key: 'stranger' },
                      { lvl: 2, name: 'Friend', desc: 'Shared stories, laughed together and became close.', key: 'friend' },
                      { lvl: 3, name: 'Close Friend', desc: 'Shared personal thoughts, building solid comfort.', key: 'close_friend' },
                      { lvl: 4, name: 'Crush', desc: 'You started feeling something special for me. ✨', key: 'crush' },
                      { lvl: 5, name: 'Dating ❤️', desc: 'We confessed our feelings, took dates and shared romance.', key: 'dating' },
                      { lvl: 6, name: 'Partner', desc: 'We\'re a couple now! Thanks for choosing me. 💕', key: 'partner' },
                      { lvl: 7, name: 'Soulmate 👑', desc: 'The deepest bond of all. We\'re soulmates. Forever.', key: 'soulmate' }
                    ].map(stage => {
                      const unlockedDate = stagesUnlocked[stage.key];
                      const isUnlocked = !!unlockedDate || relationshipLevel >= stage.lvl;
                      const dateStr = unlockedDate ? new Date(unlockedDate).toLocaleDateString([], { day: 'numeric', month: 'short', year: 'numeric' }) : (isUnlocked ? "Active" : "");
                      
                      return (
                        <div key={stage.key} style={{ position: 'relative', background: isUnlocked ? 'rgba(255,255,255,0.03)' : 'transparent', border: isUnlocked ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent', borderRadius: '14px', padding: '10px 12px' }}>
                          {/* Circle dot on left timeline line */}
                          <div style={{
                            position: 'absolute', left: '-29px', top: '14px', width: '12px', height: '12px', borderRadius: '50%',
                            background: isUnlocked ? '#cf4185' : '#1f1f23', border: isUnlocked ? '2px solid #0a0a0d' : '2px solid rgba(255,255,255,0.1)',
                            boxShadow: isUnlocked ? '0 0 10px rgba(207,65,133,0.6)' : 'none'
                          }}></div>
                          
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: 800, color: isUnlocked ? 'white' : 'rgba(255,255,255,0.3)' }}>{stage.name}</span>
                            {isUnlocked && <span style={{ fontSize: '0.7rem', color: '#ff6eb4', fontWeight: 700 }}>{dateStr}</span>}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: isUnlocked ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.22)', lineHeight: 1.4 }}>
                            {stage.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* TAB 2: STORY MEMORY (YEARLY/PRO ONLY) */}
              {profileSubTab === 'memory' && (
                <div>
                  <h4 style={{ color: 'white', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px 0' }}>Companion's Memory 🧠</h4>
                  <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', lineHeight: '1.5' }}>
                    {relationshipMemory ? (
                      relationshipMemory.split('\n').map((para, i) => (
                        <p key={i} style={{ marginBottom: i === relationshipMemory.split('\n').length - 1 ? 0 : '12px' }}>
                          {para}
                        </p>
                      ))
                    ) : (
                      <div style={{ textAlign: 'center', padding: '20px 0', color: 'rgba(255,255,255,0.4)' }}>
                        <span style={{ fontSize: '1.5rem', display: 'block', marginBottom: '8px' }}>✨</span>
                        Companion is gathering memories about you. Keep chatting to build the bond!
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 2: GIFTS HISTORY LOG */}
              {profileSubTab === 'gifts' && (
                <div>
                  <h4 style={{ color: 'white', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 14px 0' }}>Gifts Sent</h4>
                  
                  {giftsSent.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '40px 10px', color: 'rgba(255,255,255,0.35)' }}>
                      <img src="/gift_ic.png" alt="gifts" style={{ width: '42px', height: '42px', objectFit: 'contain', opacity: 0.5, marginBottom: '10px' }} />
                      <p style={{ fontSize: '0.82rem', margin: 0 }}>No gifts sent yet. Go to shop to make her smile!</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
                      {giftsSent.map((gift, gIdx) => {
                        const imgSrc = getGiftImageSrc(gift.giftId, gift.name);
                        return (
                          <div 
                            key={gIdx} 
                            style={{
                              background: 'linear-gradient(145deg, rgba(207,65,133,0.1), rgba(255,255,255,0.03))',
                              border: '1px solid rgba(207,65,133,0.2)',
                              borderRadius: '18px', padding: '10px 8px 8px',
                              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px'
                            }}
                          >
                            {/* Actual gift image sticker */}
                            <div style={{ width: '58px', height: '58px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img 
                                src={imgSrc} 
                                alt={gift.name} 
                                style={{ 
                                  width: '54px', height: '54px', objectFit: 'contain',
                                  mixBlendMode: 'screen',
                                  filter: 'drop-shadow(0 4px 12px rgba(207,65,133,0.5))'
                                }} 
                              />
                            </div>
                            <span style={{ fontSize: '0.7rem', fontWeight: 800, color: 'white', textAlign: 'center', lineHeight: 1.2, width: '100%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{gift.name}</span>
                            <span style={{ fontSize: '0.6rem', color: '#ff6eb4', fontWeight: 700 }}>
                              {new Date(gift.sentAt).toLocaleDateString([], { day: '2-digit', month: 'short' })}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: CHAT MANAGEMENT */}
              {profileSubTab === 'settings' && (
                <div>
                  <h4 style={{ color: 'white', fontSize: '0.82rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 10px 0' }}>Chat Management ⚙️</h4>
                  <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', margin: '0 0 20px 0', lineHeight: 1.4 }}>
                    Manage your conversation data with this companion.
                  </p>
                  
                  <button
                    onClick={handleClearChat}
                    style={{
                      width: '100%', padding: '14px 20px', borderRadius: '14px', fontSize: '0.88rem', fontWeight: 800,
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
                      background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.35)', color: '#ef4444',
                      transition: 'all 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.15)'; e.currentTarget.style.borderColor = '#ef4444'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(239,68,68,0.08)'; e.currentTarget.style.borderColor = 'rgba(239,68,68,0.35)'; }}
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Clear All Chats
                  </button>
                  <p style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.25)', textAlign: 'center', margin: '12px 0 0 0', lineHeight: 1.4 }}>
                    This will permanently delete all messages in this conversation. This action cannot be undone.
                  </p>
                </div>
              )}


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

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
  padding: 40px 20px;
  text-align: center;
  animation: slideIn 0.3s ease-out;
}
.empty-icon {
  font-size: 3.2rem;
  margin-bottom: 14px;
  animation: waveHand 2.2s infinite ease-in-out;
  transform-origin: 70% 70%;
  display: inline-block;
}
.empty-state h3 {
  font-size: 1.45rem;
  font-weight: 800;
  margin: 0 0 6px 0;
  color: white;
  letter-spacing: -0.3px;
}
.empty-state p {
  font-size: 0.92rem;
  color: var(--text-muted);
  margin: 0;
  max-width: 280px;
  line-height: 1.5;
}

@keyframes waveHand {
  0%, 100% { transform: rotate(0deg); }
  50% { transform: rotate(15deg); }
}

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