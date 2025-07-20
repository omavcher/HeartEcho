'use client';

import React, { useState, useEffect } from "react";
import "./ChatsPeople.css";
import Link from 'next/link';
import PopNoti from "./PopNoti";
import axios from "axios";
import api from "../config/api";
import { FaCrown } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";

const ChatsPeople = ({ onChatSelect, onBackBTNSelect, refreshTrigger }) => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    const getUserFriendsToChat = async () => {
      try {
        if (!token) return;
        setIsLoading(true);

        const res = await axios.get(`${api.Url}/user/chat-friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const chatData = Array.isArray(res.data) ? res.data : [];
        setChats(chatData);
      } catch (error) {
        setNotification({ show: true, message: "Error fetching chats.", type: "error" });
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

  const formatTime = (timestamp) => {
    if (!timestamp) return "No messages";
    
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
      return messageDate.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="chats-people-container">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <header className="chats-headerx">
        <div className="header-content">
          <h1>Conversations</h1>
          <Link href='/subscribe' className='premium-btn'>
            <FaCrown className="crown-icon" />
            <span>Go Premium</span>
          </Link>
        </div>
      </header>

      <div className="search-container">
        <div className="search-input-wrapper">
          <CiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="chats-list-container">
        {isLoading ? (
          <div className="loading-skeleton">
            {[...Array(5)].map((_, index) => (
              <div key={index} className="chat-item-skeleton">
                <div className="avatar-skeleton"></div>
                <div className="content-skeleton">
                  <div className="name-skeleton"></div>
                  <div className="message-skeleton"></div>
                </div>
              </div>
            ))}
          </div>
        ) : filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              className="chat-item"
              onClick={() => {
                onChatSelect(chat._id);
                onBackBTNSelect(false);
              }}
            >
              <div className="avatar-container">
                <img 
                  src={chat.avatar || "/default-avatar.png"} 
                  alt={chat.name} 
                  className="user-avatar"
                />
                {chat.isOnline && <span className="online-badge"></span>}
              </div>
              
              <div className="chat-content">
                <div className="chat-headercc">
                  <h3 className="user-name">{chat.name}</h3>
                  <span className="message-time">{formatTime(chat.lastMessageTime)}</span>
                </div>
                
                <div className="message-preview">
                  <p className="message-text">
                    {chat.lastMessage
                      ? chat.lastMessage.split(" ").slice(0, 8).join(" ") + 
                        (chat.lastMessage.split(" ").length > 8 ? "..." : "")
                      : "Start a conversation"}
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
            <div className="empty-icon">💬</div>
            <h3>No conversations found</h3>
            <p>{searchTerm ? "Try a different search" : "Start a new conversation"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPeople;