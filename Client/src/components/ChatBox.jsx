'use client';

import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";
import axios from "axios";
import api from "../config/api";
import PopNoti from "./PopNoti";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiCopy, FiTrash2, FiX, FiMoreVertical, FiSend } from "react-icons/fi";

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

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
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
      fetchChatData();
      fetchAiModelDetails();
    }
  }, [chatId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatData = async () => {
    try {
      const response = await axios.get(`${api.Url}/user/chats/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setMessages((prevMessages) => {
        const newMessages = response.data?.chat?.messages || [];
        const uniqueMessages = [...new Map([...prevMessages, ...newMessages].map(msg => [msg.time, msg])).values()];
        return uniqueMessages;
      });
    } catch (error) {
      console.error("Error fetching chat data:", error);
    }
  };

  const fetchAiModelDetails = async () => {
    try {
      const response = await axios.get(`${api.Url}/ai/detials/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserProfile(response.data?.AiInfo || {});
    } catch (error) {
      setNotification({ show: true, message: "Error fetching AI details.", type: "error" });
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
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newMessages = response.data.messages.filter(
        (newMsg) => !messages.some((msg) => msg.time === newMsg.time)
      );

      onSendMessage();
      setIsTyping(false);
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !msg.isLoading),
        ...newMessages,
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setIsTyping(false);
      setNotification({ show: true, message: "Failed to get a response. Try again.", type: "error" });

      if (error.response && error.response.status === 403) {
        setNotification({ 
          show: true, 
          message: "Your daily message quota is over. Try again tomorrow!", 
          type: "error" 
        });
    
        setTimeout(() => {
          router.push("/subscribe?re=quotaover");
        }, 1000); 
      }
    
      setMessages((prevMessages) =>
        prevMessages
          .filter((msg) => !msg.isLoading)
          .concat({
            sender: chatId,
            text: "Failed to get a response. Try again.",
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

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="chat-box-container">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      <div className="chat-header">
        <button className="back-btn" onClick={() => onBackBTNSelect(true)}>
          <FiArrowLeft size={20} />
        </button>
        <div className="user-info" onClick={() => setShowOverlay(true)}>
          <img 
            src={userProfile?.avatar_img || "/default-avatar.png"} 
            alt={userProfile?.name || "User"} 
            className="user-avatar" 
          />
          <div className="user-details">
            <h3>{userProfile?.name || "Unknown"}</h3>
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
                src={userProfile?.avatar_img || "/default-avatar.png"} 
                alt={userProfile?.name || "User"} 
                className="profile-image"
              />
            </div>
            <div className="profile-details">
              <h2>{userProfile?.name || "Unknown"}</h2>
              <div className="detail-item">
                <span className="detail-label">Age:</span>
                <span className="detail-value">{userProfile?.age || "N/A"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Personality:</span>
                <span className="detail-value">{userProfile?.relationship || "Not specified"}</span>
              </div>
              <div className="detail-item">
                <span className="detail-label">Interests:</span>
                <span className="detail-value">
                  {Array.isArray(userProfile?.interests)
                    ? userProfile.interests.join(", ")
                    : userProfile?.interests?.replace(/([a-z])([A-Z])/g, '$1 $2') || "Not specified"}
                </span>
              </div>
              <div className="detail-item full-width">
                <span className="detail-label">About:</span>
                <p className="detail-value">{userProfile?.description || "No description provided"}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <div className="empty-state">
            <p>Start a conversation with {userProfile?.name || "your AI companion"}</p>
          </div>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.sender === chatId ? "received" : "sent"}`}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              onMouseEnter={() => setHoveredMessage(msg._id)}
              onMouseLeave={() => setHoveredMessage(null)}
            >
              <div className="message-content">
                <p>{msg.text}</p>
                <span className="message-time">{formatTime(msg.time)}</span>
              </div>
              
              {hoveredMessage === msg._id && (
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
            placeholder="Type a message..."
          />
          <button 
            onClick={handleSendMessage} 
            disabled={!newMessage.trim()}
            className="send-btn"
          >
            <FiSend size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;