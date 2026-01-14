'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import axios from "axios";
import { 
  ArrowLeft, Copy, Trash2, X, MoreVertical, 
  Send, EyeOff, Video, Image as ImageIcon, Info,
  Lock, Zap, ArrowDown, Bot, Sparkles, Clock, Wifi
} from "lucide-react";
import api from "../config/api";
import { useRouter } from 'next/navigation';

// Constants
const QUOTA_COSTS = {
  TEXT: 1,
  IMAGE: 15,
  VIDEO: 20
};

// Enhanced bot configuration
const BOT_CONFIG = {
  MESSAGE_INTERVAL_MIN: 15000, // 15 seconds minimum
  MESSAGE_INTERVAL_MAX: 45000, // 45 seconds maximum
  INACTIVITY_THRESHOLD: 30000, // 30 seconds
  TYPING_DELAY_MIN: 800, // 0.8 seconds minimum
  TYPING_DELAY_MAX: 2500, // 2.5 seconds maximum
  RESPONSE_DELAY_MIN: 1000, // 1 second minimum
  RESPONSE_DELAY_MAX: 4000, // 4 seconds maximum
  INITIAL_WELCOME_DELAY: 2000, // 2 seconds for initial welcome
  NETWORK_EMULATION: true, // Simulate network delays
  TYPING_VARIABILITY: true // Randomize typing speed
};

// Bot personality and message patterns
const BOT_PERSONALITY = {
  GREETINGS: [
    "Hey there! I noticed you just opened our chat. How's your day going? 😊",
    "Hello! I'm here to help. What's on your mind today?",
    "Hi! I see you're back. Ready to continue our conversation?",
    "Welcome back! I was just thinking about our last chat. How have you been?",
    "Greetings! I'm excited to chat with you today. What shall we talk about?"
  ],
  FOLLOW_UPS: [
    "By the way, I was wondering...",
    "Speaking of which...",
    "Oh, I just remembered something...",
    "Before I forget...",
    "This reminds me..."
  ],
  QUESTIONS: [
    "What do you think about that?",
    "How does that make you feel?",
    "Have you experienced something similar?",
    "Would you like to know more?",
    "What's your perspective on this?"
  ],
  REACTIONS: [
    "Interesting!",
    "Fascinating!",
    "That's cool!",
    "I see...",
    "Makes sense!"
  ]
};

const PopNoti = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;
  
  return (
    <div className={`pop-notification ${type}`}>
      <span>{message}</span>
      <button onClick={onClose} className="pop-noti-close">
        <X size={16} />
      </button>
    </div>
  );
};

const AdvancedLoader = ({ text, progress }) => (
  <div className="advanced-loader">
    <div className="spinner"></div>
    <span className="loader-text">{text}</span>
    {progress !== undefined && (
      <div className="loader-progress">
        <div className="loader-progress-bar" style={{ width: `${progress}%` }}></div>
      </div>
    )}
  </div>
);

const BotMessageIndicator = ({ isTyping }) => (
  <div className="bot-message-indicator">
    <div className="bot-avatar-pulse">
      <Bot size={12} />
    </div>
    {isTyping && <span className="typing-dots"><span>.</span><span>.</span><span>.</span></span>}
  </div>
);

const NetworkIndicator = ({ isActive }) => (
  <div className={`network-indicator ${isActive ? 'active' : ''}`}>
    <Wifi size={12} />
    <span>Bot thinking</span>
    <div className="network-pulse"></div>
  </div>
);

const PremiumLockOverlay = ({ mediaType, cost, remainingQuota, onUnlock }) => {
  const isQuotaExceeded = remainingQuota === 0;
  
  return (
    <div className="premium-lock-wrapper">
      <div className="lock-overlay-content">
        <div className="lock-icon-circle">
          <Lock size={24} color="#FFD700" />
        </div>
        <h4 className="lock-title">
          {isQuotaExceeded ? "Quota Exceeded" : "Premium Content"}
        </h4>
        <p className="lock-desc">
          {isQuotaExceeded 
            ? "You have run out of tokens." 
            : `Requires ${cost} tokens. You have ${remainingQuota}.`}
        </p>
        <button className="unlock-btn" onClick={onUnlock}>
          <Zap size={16} fill="black" /> Subscribe to Unlock
        </button>
      </div>
    </div>
  );
};

const MediaMessage = ({ message, isSubscribed, remainingQuota, onSubscribe }) => {
  const isImage = message.mediaType === "image" || !!message.imgUrl;
  const isVideo = message.mediaType === "video" || !!message.videoUrl;
  const mediaUrl = isImage ? message.imgUrl : message.videoUrl;
  
  const hasAccess = useMemo(() => {
    if (isSubscribed) return true;
    if (message.visibility === "show") return true;
    if (message.quotaInfo?.hasAccess) return true;
    return false;
  }, [isSubscribed, message.visibility, message.quotaInfo]);

  const cost = isVideo ? QUOTA_COSTS.VIDEO : QUOTA_COSTS.IMAGE;

  if (!isImage && !isVideo) {
    return (
      <div className="text-content">
        {message.isBotMessage && <BotMessageIndicator isTyping={false} />}
        {message.isBotTyping && <NetworkIndicator isActive={true} />}
        <p>{message.text}</p>
        <span className="message-time">{formatTime(message.time)}</span>
      </div>
    );
  }

  return (
    <div className={`media-container ${hasAccess ? 'unlocked' : 'locked'}`}>
      <div className="media-content-wrapper">
        {isImage ? (
          <img 
            src={mediaUrl} 
            alt="AI Generated" 
            className={`media-content ${hasAccess ? '' : 'blurred'}`}
            loading="lazy"
          />
        ) : (
          <video 
            src={mediaUrl} 
            controls={hasAccess}
            className={`media-content ${hasAccess ? '' : 'blurred'}`}
          />
        )}
        
        {!hasAccess && (
          <PremiumLockOverlay
            mediaType={isImage ? 'image' : 'video'}
            cost={cost}
            remainingQuota={remainingQuota}
            onUnlock={onSubscribe}
          />
        )}
      </div>
      
      <div className="media-footer">
        <span className="media-time">{formatTime(message.time)}</span>
        {!isSubscribed && hasAccess && (
          <span className="quota-badge">-{cost} Tokens</span>
        )}
      </div>
    </div>
  );
};

const MessageOptions = ({ message, onCopy, onDelete, isVisible }) => {
  if (!isVisible) return null;
  
  return (
    <div className="msg-dropdown-menu">
      <button onClick={() => onCopy(message.text)}>
        <Copy size={14} /> Copy
      </button>
      <button onClick={() => onDelete(message._id)} className="danger">
        <Trash2 size={14} /> Delete
      </button>
    </div>
  );
};

const formatTime = (timeString) => {
  try {
    return new Date(timeString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  } catch (e) { 
    return "00:00";
  }
};

// Utility function for random delays
const getRandomDelay = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

// Utility function to get random bot message
const getRandomBotMessage = () => {
  const categories = ['GREETINGS', 'FOLLOW_UPS', 'QUESTIONS', 'REACTIONS'];
  const randomCategory = categories[Math.floor(Math.random() * categories.length)];
  const messages = BOT_PERSONALITY[randomCategory];
  return messages[Math.floor(Math.random() * messages.length)];
};

// Main Component
const ChatBox = ({ chatId, onBackBTNSelect = () => {}, onSendMessage = () => {} }) => {
  // State
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false);
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState({ 
    show: false, 
    message: "", 
    type: "" 
  });
  const [hoveredMessage, setHoveredMessage] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [isSubscribed, setIsSubscribed] = useState(false); 
  const [remainingQuota, setRemainingQuota] = useState(20);
  const [showScrollDown, setShowScrollDown] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [tempMessages, setTempMessages] = useState([]);
  
  // Enhanced bot state
  const [lastActivityTime, setLastActivityTime] = useState(() => Date.now());
  const [isBotMessageEnabled, setIsBotMessageEnabled] = useState(true);
  const [isFetchingBotMessage, setIsFetchingBotMessage] = useState(false);
  const [botMessageInterval, setBotMessageInterval] = useState(null);
  const [isBotTyping, setIsBotTyping] = useState(false);
  const [botTypingMessage, setBotTypingMessage] = useState(null);
  const [isInitialBotTriggered, setIsInitialBotTriggered] = useState(false);
  const [networkLatency, setNetworkLatency] = useState(0);

  // Refs
  const overlayRef = useRef(null);
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const menuRef = useRef(null);
  const messageCounter = useRef(0);
  const botTypingTimeoutRef = useRef(null);
  const botMessageTimeoutRef = useRef(null);
  const router = useRouter();

  // Memoized values
  const canSendMessage = useMemo(() => {
    return isSubscribed || remainingQuota > 0;
  }, [isSubscribed, remainingQuota]);

  const displayMessages = useMemo(() => {
    const filteredMessages = messages.filter(msg => 
      !msg.text?.includes("don't have enough message quota") && 
      !msg.isLoading
    );
    
    // Add bot typing indicator if active
    if (isBotTyping && botTypingMessage) {
      return [...filteredMessages, ...tempMessages, {
        _id: 'bot-typing-indicator',
        sender: "ai",
        senderModel: "AI",
        text: botTypingMessage.text || "Bot is typing...",
        time: new Date().toISOString(),
        mediaType: "text",
        isBotMessage: true,
        isBotTyping: true,
        isTemp: true
      }];
    }
    
    return [...filteredMessages, ...tempMessages];
  }, [messages, tempMessages, isBotTyping, botTypingMessage]);

  // Event Handlers
  const showNotification = useCallback((message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification(prev => ({ ...prev, show: false }));
    }, 3000);
  }, []);

  const scrollToBottom = useCallback((instant = false) => {
    if (lastMessageRef.current) {
      lastMessageRef.current.scrollIntoView({ 
        behavior: instant ? "instant" : "smooth",
        block: "end"
      });
    }
    setShowScrollDown(false);
  }, []);

  // Enhanced bot message functions
  const simulateNetworkLatency = useCallback(async () => {
    if (!BOT_CONFIG.NETWORK_EMULATION) return 0;
    
    const latency = getRandomDelay(100, 800);
    setNetworkLatency(latency);
    await new Promise(resolve => setTimeout(resolve, latency));
    return latency;
  }, []);

  const simulateTyping = useCallback(async (messageLength) => {
    const baseDelay = getRandomDelay(
      BOT_CONFIG.TYPING_DELAY_MIN,
      BOT_CONFIG.TYPING_DELAY_MAX
    );
    
    // Adjust typing speed based on message length
    const lengthFactor = Math.min(messageLength / 100, 2);
    const finalDelay = baseDelay * lengthFactor;
    
    return new Promise(resolve => setTimeout(resolve, finalDelay));
  }, []);

  const triggerBotTypingIndicator = useCallback((messageText) => {
    setIsBotTyping(true);
    setBotTypingMessage({
      text: messageText || "Thinking of a response...",
      isTyping: true
    });
  }, []);

  const clearBotTypingIndicator = useCallback(() => {
    setIsBotTyping(false);
    setBotTypingMessage(null);
    if (botTypingTimeoutRef.current) {
      clearTimeout(botTypingTimeoutRef.current);
    }
  }, []);

  const sendBotMessage = useCallback(async (messageText = null, options = {}) => {
    const {
      isInitial = false,
      forceSend = false,
      customDelay = null
    } = options;

    if (!isBotMessageEnabled && !forceSend) return;
    if (isFetchingBotMessage) return;

    try {
      setIsFetchingBotMessage(true);
      
      // Simulate network latency
      await simulateNetworkLatency();
      
      // Trigger typing indicator with realistic delay
      const typingDelay = getRandomDelay(500, 1500);
      await new Promise(resolve => setTimeout(resolve, typingDelay));
      
      // Get bot message
      let botMessage = messageText;
      if (!botMessage) {
        // Fetch from API or use fallback
        try {
          const requestData = {
            chatId,
            userProfile: {
              name: userProfile?.name || "User",
              age: userProfile?.age || "N/A",
              relationship: userProfile?.relationship || "User",
              gender: userProfile?.gender || "female"
            }
          };

          const response = await axios.post(
            `${api.Url}/bots/bots-message`,
            requestData,
            {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              timeout: 20000
            }
          );

          botMessage = response.data?.message || getRandomBotMessage();
        } catch (error) {
          console.error("Bot API error, using fallback:", error);
          botMessage = getRandomBotMessage();
        }
      }

      // Simulate typing
      triggerBotTypingIndicator(botMessage);
      await simulateTyping(botMessage.length);

      // Add response delay for realism
      const responseDelay = customDelay || getRandomDelay(
        BOT_CONFIG.RESPONSE_DELAY_MIN,
        BOT_CONFIG.RESPONSE_DELAY_MAX
      );
      
      await new Promise(resolve => setTimeout(resolve, responseDelay));

      // Create bot message object
      messageCounter.current += 1;
      const botMsg = {
        _id: `bot-${messageCounter.current}-${Date.now()}`,
        sender: "ai",
        senderModel: "AI",
        text: botMessage,
        time: new Date().toISOString(),
        mediaType: "text",
        isBotMessage: true,
        isInitial: isInitial
      };

      // Add to messages
      setMessages(prev => [...prev, botMsg]);
      clearBotTypingIndicator();

      // Update quota (bot messages might be free or have different cost)
      if (!isSubscribed) {
        setRemainingQuota(prev => Math.max(0, prev - 0));
      }


    } catch (error) {
      console.error("Error in bot message flow:", error);
      clearBotTypingIndicator();
    } finally {
      setIsFetchingBotMessage(false);
    }
  }, [
    isBotMessageEnabled,
    isFetchingBotMessage,
    token,
    chatId,
    userProfile,
    isSubscribed,
    showNotification,
    simulateNetworkLatency,
    simulateTyping,
    triggerBotTypingIndicator,
    clearBotTypingIndicator
  ]);

  const checkAndSendBotMessage = useCallback(async () => {
    // Check if user has been inactive
    const currentTime = Date.now();
    const timeSinceLastActivity = currentTime - lastActivityTime;
    
    // Don't send bot message if:
    if (isTyping || 
        timeSinceLastActivity < BOT_CONFIG.INACTIVITY_THRESHOLD || 
        isFetchingBotMessage || 
        !isBotMessageEnabled ||
        isBotTyping) {
      return;
    }

    // Don't send if user just sent a message
    const lastMessage = displayMessages[displayMessages.length - 1];
    if (lastMessage && lastMessage.sender === "me") {
      const timeSinceLastMessage = currentTime - new Date(lastMessage.time).getTime();
      if (timeSinceLastMessage < 10000) {
        return;
      }
    }

    // Random interval for next bot message
    const nextInterval = getRandomDelay(
      BOT_CONFIG.MESSAGE_INTERVAL_MIN,
      BOT_CONFIG.MESSAGE_INTERVAL_MAX
    );

    // Schedule next bot message check
    if (botMessageTimeoutRef.current) {
      clearTimeout(botMessageTimeoutRef.current);
    }
    
    botMessageTimeoutRef.current = setTimeout(() => {
      checkAndSendBotMessage();
    }, nextInterval);

    // Send bot message
    await sendBotMessage();

  }, [
    lastActivityTime,
    isTyping,
    isFetchingBotMessage,
    isBotMessageEnabled,
    isBotTyping,
    displayMessages,
    sendBotMessage
  ]);

  // Initial bot message on page load
  const triggerInitialBotMessage = useCallback(async () => {
    if (isInitialBotTriggered || !isBotMessageEnabled) return;
    
    setIsInitialBotTriggered(true);
    
    // Wait a bit for user to see the chat
    await new Promise(resolve => setTimeout(resolve, BOT_CONFIG.INITIAL_WELCOME_DELAY));
    
    // Send initial welcome message
    await sendBotMessage(
      BOT_PERSONALITY.GREETINGS[Math.floor(Math.random() * BOT_PERSONALITY.GREETINGS.length)],
      { isInitial: true, forceSend: true }
    );

    // Start the regular bot message interval
    const initialInterval = getRandomDelay(
      BOT_CONFIG.MESSAGE_INTERVAL_MIN * 2,
      BOT_CONFIG.MESSAGE_INTERVAL_MAX * 1.5
    );
    
    botMessageTimeoutRef.current = setTimeout(() => {
      checkAndSendBotMessage();
    }, initialInterval);

  }, [isInitialBotTriggered, isBotMessageEnabled, sendBotMessage, checkAndSendBotMessage]);

  // Effects
  useEffect(() => {
    const token = localStorage.getItem("token");
    setToken(token);
    
    if (token) {
      checkSubscriptionStatus(token);
    }
    
    // Set initial activity time
    setLastActivityTime(Date.now());

    // Cleanup on unmount
    return () => {
      if (botTypingTimeoutRef.current) clearTimeout(botTypingTimeoutRef.current);
      if (botMessageTimeoutRef.current) clearTimeout(botMessageTimeoutRef.current);
      if (botMessageInterval) clearInterval(botMessageInterval);
    };
  }, []);

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
    if (displayMessages.length > 0 && isInitialLoad) {
      setTimeout(() => {
        scrollToBottom(true);
        setIsInitialLoad(false);
      }, 100);
    }
  }, [displayMessages.length, isInitialLoad, scrollToBottom]);

  useEffect(() => {
    if (displayMessages.length > 0 && !isInitialLoad) {
      scrollToBottom();
    }
  }, [displayMessages.length, scrollToBottom]);

  useEffect(() => {
    const chatContainer = chatContainerRef.current;
    if (!chatContainer) return;

    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = chatContainer;
      const isScrolledUp = scrollHeight - scrollTop - clientHeight > 100;
      setShowScrollDown(isScrolledUp);
    };

    chatContainer.addEventListener('scroll', handleScroll);
    return () => chatContainer.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    // Start initial bot message after chat is loaded
    if (!isLoading && isBotMessageEnabled && !isInitialBotTriggered) {
      triggerInitialBotMessage();
    }
  }, [isLoading, isBotMessageEnabled, isInitialBotTriggered, triggerInitialBotMessage]);

  useEffect(() => {
    // Update last activity time on user interaction
    const updateActivityTime = () => {
      setLastActivityTime(Date.now());
    };

    window.addEventListener('mousedown', updateActivityTime);
    window.addEventListener('keydown', updateActivityTime);
    window.addEventListener('touchstart', updateActivityTime);

    return () => {
      window.removeEventListener('mousedown', updateActivityTime);
      window.removeEventListener('keydown', updateActivityTime);
      window.removeEventListener('touchstart', updateActivityTime);
    };
  }, []);

  // API Calls
  const checkSubscriptionStatus = useCallback(async (userToken) => {
    try {
      const response = await axios.get(`${api.Url}/user/subscription/status`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      setIsSubscribed(response.data?.isSubscribed || false);
      setRemainingQuota(response.data?.remainingQuota || 20);
    } catch (error) {
      console.error("Error checking subscription:", error);
      setIsSubscribed(false);
    }
  }, []);

  const fetchChatData = useCallback(async () => {
    try {
      const response = await axios.get(`${api.Url}/user/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });

      const chatData = response.data?.chat;
      if (chatData?.messages) {
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
          status: msg.status,
          quotaInfo: msg.quotaInfo,
          isBotMessage: msg.isBotMessage || false
        }));

        setMessages(transformedMessages);
      }
      
      setLoadingProgress(prev => Math.min(prev + 30, 90));
      
    } catch (error) {
      console.error("Error fetching chat data:", error);
      throw error;
    }
  }, [token, chatId]);

  const fetchAiModelDetails = useCallback(async () => {
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
  }, [token, chatId]);

// IN ChatBox.js - Update the initializeChatData function:
const initializeChatData = useCallback(async () => {
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

    // FIRST: Get AI Friend details using chatId (which is actually AI friend ID)
    const aiResponse = await axios.get(`${api.Url}/ai/detials/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });
    
    setUserProfile(aiResponse.data?.AiInfo || {});
    setLoadingProgress(30);

    // SECOND: Now get the actual Chat using AI friend ID
    // You need to find the chat that has this AI friend as a participant
    const chatResponse = await axios.get(`${api.Url}/ai/chats/by-ai/${chatId}`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });

    const chatData = chatResponse.data?.chat;
    if (chatData?.messages) {
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
        status: msg.status,
        quotaInfo: msg.quotaInfo,
        isBotMessage: msg.isBotMessage || false
      }));

      setMessages(transformedMessages);
      setLoadingProgress(70);
    } else {
      // No chat exists yet, create empty messages
      setMessages([]);
      setLoadingProgress(70);
    }
    
    // THIRD: Get user quota status
    const quotaResponse = await axios.get(`${api.Url}/ai/quota/status`, {
      headers: { Authorization: `Bearer ${token}` },
      timeout: 10000
    });
    
    setRemainingQuota(quotaResponse.data?.remainingQuota || 20);
    setIsSubscribed(quotaResponse.data?.isSubscriber || false);
    setLoadingProgress(90);

    clearInterval(progressInterval);
    setLoadingProgress(100);
    setTimeout(() => setIsLoading(false), 300);
    
  } catch (error) {
    console.error("Error initializing chat data:", error);
    
    // If 404, it means no chat exists yet - this is normal for new conversations
    if (error.response?.status === 404) {
      setMessages([]);
      setLoadingProgress(100);
      setTimeout(() => setIsLoading(false), 300);
    } else {
      showNotification("Failed to load chat. Please try again.", "error");
      setIsLoading(false);
    }
  }
}, [token, chatId, fetchChatData, fetchAiModelDetails, showNotification]);

  // More Event Handlers
  const handleScrollDownClick = useCallback(() => {
    scrollToBottom();
  }, [scrollToBottom]);

const handleSendMessage = useCallback(async (customText = null) => {
  const textToSend = customText || newMessage;
  if (!textToSend.trim()) return;

  if (!canSendMessage) {
    showNotification("You don't have enough tokens to send messages.", "error");
    return;
  }

  // Update last activity time
  setLastActivityTime(Date.now());

  // Create user message object
  messageCounter.current += 1;
  const userMsg = {
    _id: `user-${messageCounter.current}-${Date.now()}`,
    sender: "me",
    senderModel: "User",
    text: textToSend,
    time: new Date().toISOString(),
    mediaType: "text",
    isTemp: true
  };

  // Add to temporary messages
  setTempMessages(prev => [...prev, userMsg]);
  setNewMessage("");
  setIsTyping(true);

  try {
    // IMPORTANT: Use the correct endpoint - chatId here is actually AI friend ID
    const response = await axios.post(
      `${api.Url}/ai/${chatId}/send`, // This should be AI friend ID
      { text: textToSend },
      { 
        headers: { Authorization: `Bearer ${token}` },
        timeout: 30000
      }
    );

    if (response.data.remainingQuota !== undefined) {
      setRemainingQuota(response.data.remainingQuota);
    }

    // Remove the temporary user message
    setTempMessages(prev => prev.filter(msg => msg._id !== userMsg._id));
    
    // Fetch updated chat data
    await initializeChatData(); // Call this instead of fetchChatData
    
    onSendMessage();
    setIsTyping(false);

    // Reset bot message timer after user message
    if (botMessageTimeoutRef.current) {
      clearTimeout(botMessageTimeoutRef.current);
    }
    
    // Schedule next bot message
    const responseDelay = getRandomDelay(8000, 20000);
    botMessageTimeoutRef.current = setTimeout(() => {
      checkAndSendBotMessage();
    }, responseDelay);

  } catch (error) {
    console.error("Error sending message:", error);
    setIsTyping(false);
    
    setTempMessages(prev => prev.filter(msg => msg._id !== userMsg._id));
    
    if (error.response?.status === 403) {
      const errorMessage = error.response.data?.message || "Your daily token quota is over. Try again tomorrow!";
      showNotification(errorMessage, "error");
      setRemainingQuota(0);
  
      setTimeout(() => {
        router.push("/subscribe?re=quotaover");
      }, 2000); 
    } else if (error.response?.status === 404) {
      // Chat doesn't exist yet - this is normal for first message
      setTempMessages(prev => prev.filter(msg => msg._id !== userMsg._id));
      // Refresh to get new chat
      await initializeChatData();
    } else {
      showNotification("Failed to get a response. Try again.", "error");
    }
  }
}, [newMessage, canSendMessage, token, chatId, initializeChatData, onSendMessage, router, showNotification, checkAndSendBotMessage]);

  const handleDeleteMessage = useCallback(async (messageId) => {
    try {
      await axios.delete(`${api.Url}/user/chats/${chatId}/messages/${messageId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(prev => prev.filter(msg => msg._id !== messageId));
      showNotification("Message deleted", "success");
      setSelectedMessage(null);
    } catch (error) {
      console.error("Error deleting message:", error);
      showNotification("Failed to delete message", "error");
    }
  }, [token, chatId, showNotification]);

  const handleCopyMessage = useCallback((text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        showNotification("Message copied!", "success");
      })
      .catch(err => console.error("Error copying text: ", err));
  }, [showNotification]);

  const handleSubscribeRedirect = useCallback(() => {
    router.push("/subscribe");
  }, [router]);

  const handleMediaRequest = useCallback((type) => {
    if (type === 'image') {
      handleSendMessage("/photo Can you show me a beautiful image?");
    } else {
      handleSendMessage("/video Can you show me a video?");
    }
  }, [handleSendMessage]);

  const handleKeyPress = useCallback((e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const toggleBotMessages = useCallback(() => {
    const newState = !isBotMessageEnabled;
    setIsBotMessageEnabled(newState);
    
    if (newState) {
      showNotification("Auto messages enabled", "success");
      // Start bot messages if not already triggered
      if (!isInitialBotTriggered) {
        triggerInitialBotMessage();
      }
    } else {
      if (botMessageTimeoutRef.current) {
        clearTimeout(botMessageTimeoutRef.current);
        botMessageTimeoutRef.current = null;
      }
      if (botMessageInterval) {
        clearInterval(botMessageInterval);
        setBotMessageInterval(null);
      }
      clearBotTypingIndicator();
      showNotification("Auto messages disabled", "info");
    }
  }, [isBotMessageEnabled, isInitialBotTriggered, triggerInitialBotMessage, clearBotTypingIndicator, showNotification]);

  const renderMessageContent = useCallback((message) => {
    const isMedia = message.mediaType === "image" || message.mediaType === "video";
    
    if (isMedia) {
      return (
        <MediaMessage
          message={message}
          isSubscribed={isSubscribed}
          remainingQuota={remainingQuota}
          onSubscribe={handleSubscribeRedirect}
        />
      );
    }

    return (
      <div className="text-content">
        {message.isBotMessage}
        <p>{message.text}</p>
        <span className="message-time">
          {formatTime(message.time)}
          {message.isBotMessage}
        </span>
      </div>
    );
  }, [isSubscribed, remainingQuota, handleSubscribeRedirect]);

  const quickSuggestions = useMemo(() => [
    {
      text: "Hello! How are you doing today?",
      icon: "💬",
      label: "Hello! How are you?"
    },
    {
      text: "/photo Can you show me a beautiful image?",
      icon: <ImageIcon size={16} />,
      label: `Request Image (${QUOTA_COSTS.IMAGE} tokens)`
    },
    {
      text: "/video Can you show me a video?",
      icon: <Video size={16} />,
      label: `Request Video (${QUOTA_COSTS.VIDEO} tokens)`
    }
  ], []);

  const quotaPercentage = useMemo(() => {
    return Math.min(100, (remainingQuota / 20) * 100);
  }, [remainingQuota]);

  return (
    <div className="chat-box-container">
      <style>{STYLES}</style>
      
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification(prev => ({ ...prev, show: false }))}
      />

      {isLoading ? (
        <div className="chat-loading-screen">
          <AdvancedLoader text="Loading your conversation..." progress={loadingProgress} />
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
                <span className="status-text">
                  {isTyping ? "Typing..." : "Online"}
                </span>
              </div>
            </div>
            
            <div className="header-controls">
             
              <button className="nav-btn info" onClick={() => setShowOverlay(true)}>
                <Info size={18} />
              </button>
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
                      {isBotMessageEnabled && " • Auto Messages"}
                    </span>
                  </div>
                </div>
                <div className="profile-details-grid">
                  <div className="detail-card">
                    <span className="label">Age</span>
                    <span className="value">{userProfile?.age || "N/A"}</span>
                  </div>
                  <div className="detail-card">
                    <span className="label">Tokens</span>
                    <span className="value">{remainingQuota}</span>
                  </div>
                  <div className="detail-card full">
                    <span className="label">Auto Messages</span>
                    <div className="toggle-wrapper">
                      <span className="value">{isBotMessageEnabled ? "Enabled" : "Disabled"}</span>
                      <button 
                        className={`toggle-btn ${isBotMessageEnabled ? 'active' : ''}`}
                        onClick={toggleBotMessages}
                      >
                        <div className="toggle-slider"></div>
                      </button>
                    </div>
                  </div>
                  <div className="detail-card full">
                    <span className="label">Interests</span>
                    <span className="value">
                      {Array.isArray(userProfile?.interests)
                        ? userProfile.interests.join(" • ")
                        : userProfile?.interests || "Conversation, Assistance, Learning"}
                    </span>
                  </div>
                  <div className="detail-card full">
                    <span className="label">About</span>
                    <p className="bio-text">
                      {userProfile?.description || "Your AI companion is here to help and chat with you."}
                      {isBotMessageEnabled && (
                        <span className="bot-message-note">
                          <br />
                          <Bot size={12} /> I'll send occasional messages to keep the conversation flowing.
                        </span>
                      )}
                    </p>
                  </div>
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
                  <p className="quota-info">
                    You have {remainingQuota} free tokens today
                  </p>
                )}
                {isBotMessageEnabled && (
                  <div className="bot-welcome-note">
                    <Bot size={14} />
                    <span>I'll join the conversation shortly...</span>
                  </div>
                )}

                <div className="quick-suggestions">
                  {quickSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setNewMessage(suggestion.text)}
                      disabled={!canSendMessage}
                    >
                      {suggestion.icon} {suggestion.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              displayMessages.map((msg, index) => (
                <div 
                  key={msg._id || index}
                  className={`message-row ${msg.sender === "me" ? 'sent' : 'received'} ${msg.isTemp ? 'temp-message' : ''} ${msg.isBotTyping ? 'bot-typing' : ''}`}
                  ref={index === displayMessages.length - 1 ? lastMessageRef : null}
                  onMouseEnter={() => setHoveredMessage(msg._id)}
                  onMouseLeave={() => setHoveredMessage(null)}
                >
                  {msg.sender === "ai" && !msg.isBotTyping && (
                    <img 
                      src={userProfile?.avatar_img || "/heartecho_b.png"} 
                      className="chat-msg-avatar" 
                      alt="AI Avatar" 
                    />
                  )}
                  
                  <div className={`message-bubble ${msg.isBotTyping ? 'typing-bubble' : ''}`}>
                    {renderMessageContent(msg)}
                  </div>
                  
                  {hoveredMessage === msg._id && msg.sender === "me" && !msg.isTemp && (
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
                  
                  {!msg.isTemp && !msg.isBotTyping && (
                    <MessageOptions
                      message={msg}
                      onCopy={handleCopyMessage}
                      onDelete={handleDeleteMessage}
                      isVisible={selectedMessage === msg._id}
                    />
                  )}
                </div>
              ))
            )}
            {isTyping && (
              <div className="message-row received">
                <img 
                  src={userProfile?.avatar_img || "/heartecho_b.png"} 
                  className="chat-msg-avatar" 
                  alt="AI Avatar" 
                />
                <div className="typing-bubble">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
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
                  className={`media-trigger-btn ${isBotTyping ? 'disabled' : ''}`} 
                  onClick={() => handleMediaRequest('image')} 
                  title={`Ask for Photo (${QUOTA_COSTS.IMAGE} tokens)`}
                  disabled={isTyping || !canSendMessage || isBotTyping}
                >
                  <ImageIcon size={20} />
                </button>
                <button 
                  className={`media-trigger-btn ${isBotTyping ? 'disabled' : ''}`} 
                  onClick={() => handleMediaRequest('video')} 
                  title={`Ask for Video (${QUOTA_COSTS.VIDEO} tokens)`}
                  disabled={isTyping || !canSendMessage || isBotTyping}
                >
                  <Video size={20} />
                </button>
              </div>
              
              <div className="input-bar-wrapper">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isSubscribed ? "Type your message..." : `Type your message... (${remainingQuota} tokens remaining)`}
                  disabled={isTyping || !canSendMessage || isBotTyping}
                />
                <button 
                  className={`send-action-btn ${newMessage.trim() ? 'active' : ''} ${isBotTyping ? 'disabled' : ''}`}
                  onClick={() => handleSendMessage()}
                  disabled={!newMessage.trim() || isTyping || !canSendMessage || isBotTyping}
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
            {!isSubscribed && (
              <div 
                className={`quota-mini-bar ${remainingQuota < 5 ? 'quota-warning' : ''}`} 
                style={{width: `${quotaPercentage}%`}}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBox;

// Enhanced Styles
const STYLES = `
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
  --bot-color: #6366f1;
  --typing-color: #00e676;
  --network-color: #00b8d4;
}

/* --- NOTIFICATIONS --- */
.pop-notification {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: white;
  z-index: 2000;
  box-shadow: 0 4px 12px rgba(0,0,0,0.3);
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 500;
  animation: slideDown 0.3s ease-out;
}

.pop-notification.error { background: var(--danger); }
.pop-notification.success { background: #00e676; }
.pop-notification.info { background: var(--bot-color); }

.pop-noti-close {
  background: none;
  border: none;
  color: white;
  cursor: pointer;
  padding: 4px;
}

@keyframes slideDown {
  from { transform: translateX(-50%) translateY(-20px); opacity: 0; }
  to { transform: translateX(-50%) translateY(0); opacity: 1; }
}

/* --- LOADER --- */
.advanced-loader {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  width: 200px;
}

.loader-text {
  color: var(--primary);
  font-size: 0.9rem;
  letter-spacing: 0.5px;
}

.loader-progress {
  width: 100%;
  height: 4px;
  background: rgba(255,255,255,0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 8px;
}

.loader-progress-bar {
  height: 100%;
  background: var(--primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(207, 65, 133, 0.3);
  border-radius: 50%;
  border-top-color: var(--primary);
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin { 
  to { transform: rotate(360deg); } 
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
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.nav-btn:hover { 
  background: rgba(255,255,255,0.1); 
}

.nav-btn.active {
  color: var(--bot-color);
  background: rgba(99, 102, 241, 0.1);
}

.nav-btn.bot-toggle.active {
  color: var(--typing-color);
  animation: pulse-bot 2s infinite;
}

@keyframes pulse-bot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.header-controls {
  display: flex;
  gap: 4px;
}

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
.status-dot.typing { 
  background: var(--primary); 
  animation: pulse 1s infinite; 
}

.header-info { text-align: left; }
.header-info h3 { 
  margin: 0; 
  font-size: 1rem; 
  font-weight: 600; 
}
.status-text { 
  font-size: 0.75rem; 
  color: var(--primary); 
  font-weight: 500; 
}

/* --- PROFILE OVERLAY --- */
.profile-overlay-backdrop {
  position: absolute;
  top: 0; 
  left: 0; 
  width: 100%; 
  height: 100%;
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

.profile-modal.slide-up { 
  transform: translateY(0); 
}

.modal-close-btn {
  position: absolute;
  top: 15px;
  right: 15px;
  z-index: 20;
  background: rgba(0,0,0,0.5);
  border: none;
  color: white;
  width: 36px; 
  height: 36px;
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
  bottom: 0; 
  left: 0; 
  width: 100%; 
  height: 50%;
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

.detail-card.full { 
  grid-column: span 2; 
}

.detail-card .label {
  display: block;
  font-size: 0.7rem;
  color: var(--primary);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
}

.detail-card .value { 
  font-size: 1.05rem; 
  font-weight: 500; 
  color: #fff; 
}

.toggle-wrapper {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
}

.toggle-btn {
  width: 44px;
  height: 24px;
  background: rgba(255,255,255,0.1);
  border: 1px solid var(--glass-border);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
}

.toggle-btn.active {
  background: var(--bot-color);
  border-color: var(--bot-color);
}

.toggle-slider {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s;
}

.toggle-btn.active .toggle-slider {
  transform: translateX(20px);
}

.bio-text { 
  margin: 0; 
  line-height: 1.6; 
  font-size: 0.95rem; 
  color: #ddd; 
}

.bot-message-note {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-top: 8px;
  font-size: 0.85rem;
  color: var(--bot-color);
}

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

.placeholder-icon { 
  font-size: 3rem; 
  margin-bottom: 10px; 
  animation: wave 2s infinite; 
}

.quota-info {
  color: var(--primary);
  font-size: 0.9rem;
  margin-top: 10px;
}

.bot-welcome-note {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--bot-color);
  font-size: 0.85rem;
  margin-top: 15px;
  padding: 8px 16px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 12px;
  animation: fadeInOut 3s infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; }
}

.bot-message-info {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: var(--bot-color);
  font-size: 0.85rem;
  margin-top: 8px;
  padding: 6px 12px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
}

.quick-suggestions { 
  display: flex; 
  gap: 10px; 
  margin-top: 20px; 
  flex-wrap: wrap; 
  justify-content: center; 
}

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

.quick-suggestions button:hover:not(:disabled) { 
  border-color: var(--primary); 
  color: var(--primary); 
}

.quick-suggestions button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

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

.message-row.temp-message {
  opacity: 0.9;
}

.message-row.bot-typing {
  animation: typingPulse 2s infinite;
}

@keyframes typingPulse {
  0%, 100% { opacity: 0.95; }
  50% { opacity: 0.85; }
}

.chat-msg-avatar {
  width: 32px; 
  height: 32px;
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

.text-content p { 
  margin: 0; 
}

.bot-message-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.7rem;
  color: var(--bot-color);
  margin-bottom: 8px;
  opacity: 0.9;
}

.bot-message-indicator .bot-avatar-pulse {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(99, 102, 241, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: botPulse 2s infinite;
}

@keyframes botPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.1); }
}

.typing-dots {
  display: inline-flex;
  gap: 2px;
}

.typing-dots span {
  animation: typingDot 1.5s infinite;
  opacity: 0;
}

.typing-dots span:nth-child(2) { animation-delay: 0.2s; }
.typing-dots span:nth-child(3) { animation-delay: 0.4s; }

@keyframes typingDot {
  0%, 100% { opacity: 0; }
  50% { opacity: 1; }
}

.network-indicator {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.7rem;
  color: var(--network-color);
  margin-bottom: 6px;
  opacity: 0.8;
}

.network-indicator.active {
  animation: networkPulse 1.5s infinite;
}

.network-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--network-color);
  position: relative;
}

.network-pulse::after {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border: 1px solid var(--network-color);
  border-radius: 50%;
  animation: ripple 1.5s infinite;
}

@keyframes networkPulse {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}

@keyframes ripple {
  0% { transform: scale(1); opacity: 1; }
  100% { transform: scale(2); opacity: 0; }
}

.message-time {
  display: block;
  font-size: 0.65rem;
  opacity: 0.7;
  margin-top: 4px;
  text-align: right;
}

.bot-tag {
  color: var(--bot-color);
  font-weight: 500;
}

/* Message Options */
.msg-options-trigger {
  position: absolute;
  top: 50%; 
  transform: translateY(-50%);
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

.sent .msg-options-trigger { 
  right: auto; 
  left: -30px; 
}

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
  display: flex; 
  gap: 8px; 
  align-items: center;
  width: 100%; 
  padding: 8px 12px;
  background: none; 
  border: none; 
  color: white;
  cursor: pointer; 
  font-size: 0.85rem;
  transition: background 0.2s;
}

.msg-dropdown-menu button:hover { 
  background: rgba(255,255,255,0.1); 
}

.msg-dropdown-menu button.danger { 
  color: var(--danger); 
}

/* MEDIA & PREMIUM LOCKS */
.media-container {
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  max-width: 280px;
  min-width: 200px;
}

.media-content-wrapper {
  position: relative;
  width: 100%;
  height: 300px;
}

.media-content {
  width: 100%;
  height: 100%;
  display: block;
  border-radius: 12px;
  object-fit: cover;
  transition: filter 0.3s ease;
}

.media-content.blurred {
  filter: blur(7px) brightness(0.6);
}

.media-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
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
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
}

.lock-overlay-content {
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px;
}

.lock-icon-circle {
  width: 50px;
  height: 50px;
  background: rgba(255,255,255,0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255,255,255,0.2);
}

.lock-title {
  margin: 0;
  font-weight: 700;
  font-size: 1.1rem;
}

.lock-desc {
  margin: 0;
  font-size: 0.8rem;
  color: #aaa;
  max-width: 180px;
  line-height: 1.4;
}

.unlock-btn {
  background: linear-gradient(135deg, #FFD700, #FFA500);
  color: #000;
  border: none;
  padding: 10px 20px;
  border-radius: 30px;
  font-weight: 700;
  font-size: 0.85rem;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 4px 15px rgba(255, 215, 0, 0.3);
  margin-top: 5px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.unlock-btn:hover {
  transform: scale(1.05);
}

/* TYPING */
.typing-bubble {
  padding: 15px 20px;
  display: flex;
  gap: 6px;
  align-items: center;
  width: fit-content;
  background: var(--msg-received);
  border-radius: 18px;
  border-bottom-left-radius: 4px;
  border: 1px solid rgba(99, 102, 241, 0.2);
}

.dot {
  width: 8px;
  height: 8px;
  background: var(--bot-color);
  border-radius: 50%;
  animation: bounce 1.4s infinite;
}

.dot:nth-child(2) { animation-delay: 0.2s; }
.dot:nth-child(3) { animation-delay: 0.4s; }

/* INPUT AREA */
.chat-input-area {
  padding: 15px;
  border-top: 1px solid var(--glass-border);
  position: relative;
}

.input-wrapper-outer {
  display: flex;
  gap: 8px;
  align-items: center;
}

.media-btn-group {
  display: flex;
  gap: 4px;
}

.media-trigger-btn {
  background: rgba(255,255,255,0.05);
  border: 1px solid var(--glass-border);
  color: var(--text-muted);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.media-trigger-btn:hover:not(:disabled) {
  background: rgba(207, 65, 133, 0.1);
  color: var(--primary);
  border-color: var(--primary);
}

.media-trigger-btn.active {
  color: var(--bot-color);
  border-color: var(--bot-color);
  background: rgba(99, 102, 241, 0.1);
}

.media-trigger-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
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
  width: 40px;
  height: 40px;
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

.send-action-btn.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.send-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.quota-mini-bar {
  height: 2px;
  background: var(--primary);
  position: absolute;
  top: 0;
  left: 0;
  transition: width 0.3s;
}

.quota-warning {
  background: var(--danger) !important;
}

/* ANIMATIONS */
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(207, 65, 133, 0.7); }
  70% { box-shadow: 0 0 0 6px rgba(207, 65, 133, 0); }
  100% { box-shadow: 0 0 0 0 rgba(207, 65, 133, 0); }
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

@keyframes wave {
  0%, 100% { transform: rotate(0deg); }
  25% { transform: rotate(15deg); }
  75% { transform: rotate(-15deg); }
}

/* RESPONSIVE */
@media (max-width: 600px) {
  .chat-input-area {
    margin-bottom: 4.5rem;
  }
  .profile-details-grid {
    margin-bottom: 4.5rem;
  }
  .message-row {
    max-width: 95%;
  }
  .media-container {
    max-width: 250px;
  }
  .header-controls {
    display: flex;
    gap: 2px;
  }
}
`;