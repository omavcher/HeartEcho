'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Search, Crown, MessageSquare, X } from "lucide-react";
import api from "../config/api";

const PopNoti = ({ message, type, isVisible, onClose }) => {
  if (!isVisible) return null;
  return (
    <div className={`pop-noti ${type}`}>
      <span>{message}</span>
      <button onClick={onClose}><X size={14} /></button>
    </div>
  );
};

// Relationship levels mapped by XP
const RELATION_LEVELS = [
  { min: 0,    max: 49,       label: 'Stranger',    emoji: '👋', color: '#888888', ring: 'rgba(136,136,136,0.45)' },
  { min: 50,   max: 149,      label: 'Friend',      emoji: '😊', color: '#4fc3f7', ring: 'rgba(79,195,247,0.5)'  },
  { min: 150,  max: 349,      label: 'Close Friend', emoji: '🤗', color: '#81c784', ring: 'rgba(129,199,132,0.5)' },
  { min: 350,  max: 649,      label: 'Crush',       emoji: '😍', color: '#ffb74d', ring: 'rgba(255,183,77,0.55)' },
  { min: 650,  max: 1099,     label: 'Dating',      emoji: '❤️', color: '#f06292', ring: 'rgba(240,98,146,0.6)'  },
  { min: 1100, max: 1999,     label: 'Partner',     emoji: '💑', color: '#cf4185', ring: 'rgba(207,65,133,0.7)'  },
  { min: 2000, max: Infinity, label: 'Soulmate',    emoji: '👑', color: '#ffd700', ring: 'rgba(255,215,0,0.75)'  },
];
const getRelation = (xp = 0) => RELATION_LEVELS.find(r => xp >= r.min && xp <= r.max) || RELATION_LEVELS[0];
const EMOTION_EMOJI = { Happy: '😊', Sad: '😔', Romantic: '🥰', Angry: '😒', Busy: '💻', Sleepy: '😴' };

const ChatsPeople = ({ onChatSelect = () => {}, onBackBTNSelect = () => {}, refreshTrigger }) => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);


  useEffect(() => {
    if (typeof window !== 'undefined') {
      setToken(localStorage.getItem("token"));
      try {
        const sub = JSON.parse(localStorage.getItem('subscribed') || '{}');
        if (sub.isSubscribed || sub.userType === 'subscriber') setIsSubscribed(true);
      } catch {}
    }
  }, []);

  const fetchChats = async () => {
    try {
      if (chats.length === 0) setIsLoading(true);
      let res;
      if (token) {
        res = await axios.get(`${api.Url}/user/chat-friends`, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        const guestId = localStorage.getItem("Guest-Id");
        if (guestId) res = await axios.get(`${api.Url}/guest/chat-friends`, { headers: { "Guest-Id": guestId } });
      }
      if (res?.data) setChats(Array.isArray(res.data) ? res.data : []);
    } catch (err) { console.error("Error fetching chats:", err); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchChats(); }, [token, refreshTrigger]);

  const handleChatClick = async (chatId, rawChatId) => {
    const targetId = rawChatId || chatId;
    onChatSelect(targetId);
    onBackBTNSelect(false);
    if (token && chatId) {
      try {
        await axios.post(`${api.Url}/user/chats/${chatId}/read`, {}, { headers: { Authorization: `Bearer ${token}` } });
        setChats(prev => prev.map(c =>
          (c.chatId === targetId || c._id === targetId || c.chatId === chatId) ? { ...c, unreadCount: 0 } : c
        ));
      } catch (err) { console.error("Error marking read:", err); }
    }
  };



  const processedChats = useMemo(() => {
    const result = searchTerm
      ? chats.filter(c => c.name?.toLowerCase().includes(searchTerm.toLowerCase()))
      : chats;
    return [...result].sort((a, b) => {
      const ua = (a.unreadCount || 0) > 0, ub = (b.unreadCount || 0) > 0;
      if (ua && !ub) return -1;
      if (!ua && ub) return 1;
      return new Date(b.lastMessageTime || 0) - new Date(a.lastMessageTime || 0);
    });
  }, [chats, searchTerm]);

  const formatTime = (ts) => {
    if (!ts) return "";
    try {
      const now = new Date(), d = new Date(ts);
      const days = Math.floor((now - d) / 86400000);
      if (days === 0) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (days === 1) return 'Yesterday';
      if (days < 7) return d.toLocaleDateString([], { weekday: 'short' });
      return d.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
    } catch { return ""; }
  };

  const fmtPreview = (msg) => {
    if (!msg) return "Say hello! 👋";
    if (msg.includes("[image]")) return "📷 Photo";
    if (msg.includes("[video]")) return "🎥 Video";
    if (msg.startsWith("🎁")) return msg.slice(0, 28) + (msg.length > 28 ? '…' : '');
    return msg.length > 38 ? msg.slice(0, 38) + '…' : msg;
  };

  return (
    <div style={{ width: '100%', height: '100dvh', background: '#0a0a0d', color: '#fff', display: 'flex', flexDirection: 'column', fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", sans-serif', overflow: 'hidden' }}>
      <style>{`
        .cp-scroll::-webkit-scrollbar { width: 0; }
        @keyframes cpPulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        .cp-skel { animation: cpPulse 1.5s infinite; background: rgba(255,255,255,0.06); border-radius: 8px; }
        .cp-row { transition: background 0.15s; cursor: pointer; }
        .cp-row:active { background: rgba(207,65,133,0.09) !important; }
      `}</style>

      <PopNoti {...notification} isVisible={notification.show} onClose={() => setNotification(n => ({ ...n, show: false }))} />

      {/* ── Header ── */}
      <div style={{ flexShrink: 0, padding: '16px 18px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.5px', background: 'linear-gradient(90deg,#fff 55%,#cf4185)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Chats</h1>
          <p style={{ margin: '1px 0 0', fontSize: '0.68rem', color: 'rgba(255,255,255,0.32)', fontWeight: 500 }}>Your AI companions 💕</p>
        </div>
        {!isSubscribed && (
          <button onClick={() => window.location.href = '/subscribe'} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '7px 13px', background: 'rgba(207,65,133,0.12)', color: '#cf4185', border: '1px solid rgba(207,65,133,0.38)', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700, cursor: 'pointer' }}>
            <Crown size={13} /> Premium
          </button>
        )}
      </div>

      {/* ── Search ── */}
      <div style={{ flexShrink: 0, padding: '10px 16px', background: '#0a0a0d' }}>
        <div style={{ display: 'flex', alignItems: 'center', background: '#141417', borderRadius: 14, padding: '0 14px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Search size={16} color="#555" />
          <input
            type="text" placeholder="Search companions…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ flex: 1, padding: '11px 10px', border: 'none', background: 'transparent', color: '#fff', fontSize: '0.95rem', outline: 'none' }}
          />
        </div>
      </div>

      {/* ── List ── */}
      <div className="cp-scroll" style={{ flexGrow: 1, overflowY: 'auto', paddingBottom: 90 }}>
        {isLoading ? (
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 20 }}>
            {[...Array(6)].map((_, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div className="cp-skel" style={{ width: 50, height: 64, borderRadius: 14, flexShrink: 0 }} />
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div className="cp-skel" style={{ height: 12, width: '45%' }} />
                  <div className="cp-skel" style={{ height: 10, width: '28%', opacity: 0.7 }} />
                  <div className="cp-skel" style={{ height: 10, width: '65%', opacity: 0.5 }} />
                </div>
              </div>
            ))}
          </div>
        ) : processedChats.length > 0 ? (
          processedChats.map(chat => {
            const unread = chat.unreadCount || 0;
            const isUnread = unread > 0;
            const xp = chat.relationshipXP || 0;
            const rel = getRelation(xp);
            const emotionEmoji = EMOTION_EMOJI[chat.currentEmotion] || '😊';

            return (
              <div
                key={chat._id}
                className="cp-row"
                onClick={() => handleChatClick(chat.chatId, chat._id)}
                style={{
                  display: 'flex', alignItems: 'center', padding: '12px 16px', gap: 14,
                  background: isUnread ? 'rgba(207,65,133,0.055)' : 'transparent',
                  borderBottom: '1px solid rgba(255,255,255,0.028)',
                }}
              >
                {/* Avatar + glow ring – portrait rectangle fits 9:16 images */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 50, height: 64, borderRadius: 14, padding: 2,
                    background: `linear-gradient(155deg, ${rel.color} 0%, rgba(0,0,0,0.5) 100%)`,
                    boxShadow: `0 0 ${isUnread ? 18 : 9}px ${rel.ring}`,
                  }}>
                    <img
                      src={chat.avatar || "/default-avatar.png"} alt={chat.name}
                      style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', borderRadius: 12, border: '2px solid #0a0a0d', display: 'block' }}
                      onError={e => { e.target.src = "/default-avatar.png"; }}
                    />
                  </div>
                  {chat.isOnline && (
                    <span style={{ position: 'absolute', bottom: 2, right: 2, width: 11, height: 11, background: '#25D366', borderRadius: '50%', border: '2px solid #0a0a0d', zIndex: 2 }} />
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {/* Row 1 – name + time */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem', fontWeight: isUnread ? 800 : 600, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '62%' }}>
                      {chat.name} {emotionEmoji}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5, flexShrink: 0 }}>
                      {chat.streakCount > 0 && (
                        <span style={{ fontSize: '0.7rem', color: '#ff9900', fontWeight: 700 }}>🔥{chat.streakCount}</span>
                      )}
                      <span style={{ fontSize: '0.7rem', color: isUnread ? '#cf4185' : '#555', fontWeight: 500, whiteSpace: 'nowrap' }}>
                        {formatTime(chat.lastMessageTime)}
                      </span>
                    </div>
                  </div>

                  {/* Row 2 – relationship status pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 3,
                      fontSize: '0.6rem', fontWeight: 800, letterSpacing: '0.04em',
                      padding: '2px 8px', borderRadius: 20,
                      background: `${rel.color}18`,
                      border: `1px solid ${rel.color}44`,
                      color: rel.color, flexShrink: 0
                    }}>
                      {rel.emoji} {rel.label}
                    </span>
                    {xp > 0 && (
                      <span style={{ fontSize: '0.58rem', color: 'rgba(255,255,255,0.28)', fontWeight: 600 }}>{xp} XP</span>
                    )}
                  </div>

                  {/* Row 3 – preview + badge */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ margin: 0, fontSize: '0.82rem', color: isUnread ? 'rgba(255,255,255,0.8)' : '#5a5a6a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%', fontWeight: isUnread ? 600 : 400 }}>
                      {fmtPreview(chat.lastMessage)}
                    </p>
                    {isUnread && (
                      <span style={{ background: '#cf4185', color: '#fff', fontSize: '0.68rem', fontWeight: 800, minWidth: 20, height: 20, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0, boxShadow: '0 2px 8px rgba(207,65,133,0.5)' }}>
                        {unread > 99 ? '99+' : unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{ height: '50vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#555' }}>
            <MessageSquare size={46} style={{ opacity: 0.25, marginBottom: 10 }} />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>No conversations yet</h3>
            <p style={{ margin: '6px 0 0', fontSize: '0.82rem', color: '#444' }}>Start chatting with an AI companion!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsPeople;