'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../config/api";
import { FaSearch, FaUserCircle, FaRobot, FaClock, FaCheckDouble, FaImage, FaUsers, FaCommentDots, FaExchangeAlt } from "react-icons/fa";

// ------------------- CSS STYLES (Glassmorphism & Neon Glow) -------------------
const styles = `
.ch-root-x30sn {
  display: flex;
  height: calc(100vh - 120px);
  background-color: #030303;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  border: 1px solid #161616;
  border-radius: 20px;
  overflow: hidden;
  animation: ch-fadeIn-x30sn 0.4s ease;
}
@keyframes ch-fadeIn-x30sn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* LEFT SIDEBAR: USER LIST */
.ch-sidebar-x30sn {
  width: 320px;
  border-right: 1px solid #161616;
  display: flex;
  flex-direction: column;
  background: rgba(10, 10, 10, 0.65);
  backdrop-filter: blur(20px);
  flex-shrink: 0;
}
.ch-search-box-x30sn {
  padding: 20px;
  border-bottom: 1px solid #161616;
}
.ch-search-input-x30sn {
  width: 100%;
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  padding: 12px 16px;
  border-radius: 10px;
  color: #fff;
  outline: none;
  font-size: 13px;
  transition: all 0.25s ease;
}
.ch-search-input-x30sn:focus {
  border-color: #ff69b4;
  box-shadow: 0 0 10px rgba(255, 105, 180, 0.15);
}

.ch-user-list-x30sn {
  flex: 1;
  overflow-y: auto;
}
.ch-user-list-x30sn::-webkit-scrollbar {
  width: 4px;
}
.ch-user-list-x30sn::-webkit-scrollbar-track {
  background: transparent;
}
.ch-user-list-x30sn::-webkit-scrollbar-thumb {
  background: #1f1f23;
  border-radius: 10px;
}

.ch-user-item-x30sn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  cursor: pointer;
  border-bottom: 1px solid #121212;
  transition: all 0.25s ease;
  position: relative;
}
.ch-user-item-x30sn:hover {
  background: rgba(255, 255, 255, 0.015);
}
.ch-user-item-x30sn.active {
  background: linear-gradient(90deg, rgba(218, 34, 255, 0.06) 0%, rgba(255, 105, 180, 0.01) 100%);
  border-left: 3px solid #ff69b4;
}

.ch-user-avatar-x30sn {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #222;
  background: #000;
}
.ch-user-info-x30sn {
  flex: 1;
  min-width: 0;
}
.ch-user-info-x30sn h4 {
  margin: 0 0 4px;
  font-size: 13.5px;
  font-weight: 700;
  color: #fff;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ch-user-info-x30sn p {
  margin: 0;
  font-size: 11px;
  color: #666;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ch-user-badge-x30sn {
  font-size: 9px;
  padding: 3px 8px;
  border-radius: 6px;
  text-transform: uppercase;
  font-weight: 850;
  letter-spacing: 0.5px;
}
.ch-user-badge-x30sn.subscriber {
  background: rgba(255, 105, 180, 0.1);
  color: #ff69b4;
  border: 1px solid rgba(255, 105, 180, 0.25);
  box-shadow: 0 0 8px rgba(255, 105, 180, 0.1);
}
.ch-user-badge-x30sn.free {
  background: rgba(255, 255, 255, 0.03);
  color: #888;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

/* RIGHT PANEL: CHAT VIEW */
.ch-main-x30sn {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #030303;
}

.ch-empty-state-x30sn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #52525b;
  gap: 16px;
  text-align: center;
  padding: 40px;
}
.ch-empty-state-x30sn h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #a1a1aa;
}
.ch-empty-state-x30sn p {
  margin: 4px 0 0;
  font-size: 13px;
  color: #52525b;
  max-width: 320px;
  line-height: 1.5;
}

/* SELECTED USER HEADER */
.ch-header-x30sn {
  padding: 20px 24px;
  border-bottom: 1px solid #161616;
  background: rgba(8, 8, 8, 0.4);
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}
.ch-header-user-info-x30sn {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 16px;
  font-weight: 800;
  color: #fff;
}
.ch-header-user-info-x30sn span {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

.ch-msg-search-box-x30sn {
  position: relative;
  width: 220px;
}
.ch-msg-search-box-x30sn svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-size: 12px;
}
.ch-msg-search-input-x30sn {
  width: 100%;
  background: rgba(15, 15, 15, 0.8);
  border: 1px solid #222;
  padding: 8px 12px 8px 34px;
  border-radius: 8px;
  color: #fff;
  outline: none;
  font-size: 12px;
  transition: all 0.25s ease;
}
.ch-msg-search-input-x30sn:focus {
  border-color: #ff69b4;
}

/* STATS RIBBON PANEL */
.ch-stats-ribbon-x30sn {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-bottom: 1px solid #161616;
  background: #060606;
}
@media (max-width: 768px) {
  .ch-stats-ribbon-x30sn {
    grid-template-columns: repeat(2, 1fr);
  }
}
.ch-ribbon-item-x30sn {
  padding: 12px 20px;
  border-right: 1px solid #161616;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.ch-ribbon-item-x30sn:last-child {
  border-right: none;
}
.ch-ribbon-label-x30sn {
  font-size: 9px;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: #52525b;
  font-weight: 700;
}
.ch-ribbon-value-x30sn {
  font-size: 16px;
  font-weight: 800;
  color: #f4f4f5;
  font-family: monospace;
}

/* AI FRIEND TABS */
.ch-ai-tabs-x30sn {
  display: flex;
  gap: 8px;
  padding: 12px 24px;
  border-bottom: 1px solid #161616;
  background: rgba(10, 10, 10, 0.4);
  overflow-x: auto;
}
.ch-ai-tab-x30sn {
  padding: 8px 16px;
  border-radius: 20px;
  border: 1px solid #222;
  background: #0f0f0f;
  color: #a1a1aa;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  white-space: nowrap;
}
.ch-ai-tab-x30sn:hover {
  border-color: #444;
  color: #fff;
}
.ch-ai-tab-x30sn.active {
  background: linear-gradient(135deg, rgba(218, 34, 255, 0.15) 0%, rgba(255, 105, 180, 0.05) 100%);
  color: #ff69b4;
  border-color: rgba(255, 105, 180, 0.3);
}
.ch-ai-avatar-x30sn {
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #222;
}

/* MESSAGES CONTAINER */
.ch-messages-container-x30sn {
  flex: 1;
  overflow-y: auto;
  padding: 24px;
  background: radial-gradient(circle, rgba(255,255,255,0.015) 1px, transparent 1px);
  background-size: 24px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.ch-messages-container-x30sn::-webkit-scrollbar {
  width: 5px;
}
.ch-messages-container-x30sn::-webkit-scrollbar-track {
  background: transparent;
}
.ch-messages-container-x30sn::-webkit-scrollbar-thumb {
  background: #1f1f23;
  border-radius: 10px;
}

.ch-msg-row-x30sn {
  display: flex;
  gap: 12px;
  max-width: 75%;
}
.ch-msg-row-x30sn.user {
  margin-left: auto;
  flex-direction: row-reverse;
}
.ch-msg-row-x30sn.ai {
  margin-right: auto;
}

.ch-msg-avatar-x30sn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #222;
  flex-shrink: 0;
  background: #000;
}

.ch-msg-bubble-x30sn {
  padding: 12px 16px;
  border-radius: 14px;
  font-size: 13px;
  line-height: 1.5;
  position: relative;
  word-wrap: break-word;
}
.ch-msg-row-x30sn.user .ch-msg-bubble-x30sn {
  background: linear-gradient(135deg, #a78bfa 0%, #ff69b4 100%);
  color: #000;
  border-top-right-radius: 2px;
  font-weight: 600;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.15);
}
.ch-msg-row-x30sn.ai .ch-msg-bubble-x30sn {
  background: rgba(20, 20, 22, 0.85);
  color: #e4e4e7;
  border: 1px solid #27272a;
  border-top-left-radius: 2px;
}

.ch-msg-time-x30sn {
  font-size: 9px;
  color: rgba(255, 255, 255, 0.4);
  margin-top: 6px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}
.ch-msg-row-x30sn.user .ch-msg-time-x30sn {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 700;
}

.ch-msg-img-x30sn {
  max-width: 220px;
  max-height: 220px;
  border-radius: 10px;
  margin-top: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  display: block;
}
.ch-msg-img-wrap-x30sn {
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  transition: transform 0.2s;
  cursor: zoom-in;
}
.ch-msg-img-wrap-x30sn:hover {
  transform: scale(1.02);
}
`;

const ChatsDataAdmin = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [msgSearchTerm, setMsgSearchTerm] = useState("");

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/chats-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setChatData(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching chats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, []);

  // Filter users based on search
  const filteredUsers = useMemo(() => {
    if (!searchTerm) return chatData;
    return chatData.filter(item => 
      item.user.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      item.user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chatData, searchTerm]);

  // Handle User Selection
  const handleUserSelect = (index) => {
    setSelectedUserIndex(index);
    setMsgSearchTerm(""); // Reset message filter when switching user
    if (filteredUsers[index]?.interactionsToday?.length > 0) {
      setSelectedChatId(filteredUsers[index].interactionsToday[0].chatId);
    } else {
      setSelectedChatId(null);
    }
  };

  // Current selected user object
  const activeUser = selectedUserIndex !== null ? filteredUsers[selectedUserIndex] : null;

  // Find the selected chat interaction object
  const activeChat = activeUser 
    ? activeUser.interactionsToday.find(chat => chat.chatId === selectedChatId) 
    : null;

  // Filter messages based on message keyword search
  const filteredMessages = useMemo(() => {
    if (!activeChat || !activeChat.messages) return [];
    if (!msgSearchTerm.trim()) return activeChat.messages;
    return activeChat.messages.filter(msg => 
      msg.text && msg.text.toLowerCase().includes(msgSearchTerm.toLowerCase())
    );
  }, [activeChat, msgSearchTerm]);

  // Format Time
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Compute stats metrics today
  const stats = useMemo(() => {
    const totalUsers = chatData.length;
    let totalMsgs = 0;
    let proCount = 0;
    const aiSet = new Set();

    chatData.forEach(item => {
      if (item.user.user_type === 'subscriber') proCount++;
      if (item.interactionsToday) {
        item.interactionsToday.forEach(chat => {
          totalMsgs += chat.messageCount || 0;
          if (chat.aiFriend?.name) {
            aiSet.add(chat.aiFriend.name);
          }
        });
      }
    });

    const proRatio = totalUsers ? Math.round((proCount / totalUsers) * 100) : 0;

    return {
      totalUsers,
      totalMsgs,
      proRatio,
      activeAiCount: aiSet.size
    };
  }, [chatData]);

  if (loading) {
    return (
      <div className="ch-root-x30sn" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <style>{styles}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '2px solid #222',
            borderTopColor: '#ff69b4',
            borderRadius: '50%',
            animation: 'ch-spin-x30sn 0.8s linear infinite',
            margin: '0 auto 12px'
          }} />
          <style>{`@keyframes ch-spin-x30sn { to { transform: rotate(360deg); } }`}</style>
          <p style={{ fontWeight: 600, color: '#666' }}>Loading Chats Audit Matrix…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ch-root-x30sn">
      <style>{styles}</style>

      {/* LEFT SIDEBAR - USER LIST */}
      <aside className="ch-sidebar-x30sn">
        <div className="ch-search-box-x30sn">
          <input 
            type="text" 
            placeholder="Search users by name/email…" 
            className="ch-search-input-x30sn"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="ch-user-list-x30sn">
          {filteredUsers.map((item, idx) => (
            <div 
              key={item.user.id} 
              className={`ch-user-item-x30sn ${selectedUserIndex === idx ? 'active' : ''}`}
              onClick={() => handleUserSelect(idx)}
            >
              <img 
                src={item.user.profile_picture || "https://via.placeholder.com/40"} 
                alt={item.user.name} 
                className="ch-user-avatar-x30sn"
                onError={(e) => e.target.src = "https://via.placeholder.com/40"}
              />
              <div className="ch-user-info-x30sn">
                <h4>{item.user.name}</h4>
                <p>{item.user.email}</p>
              </div>
              <span className={`ch-user-badge-x30sn ${item.user.user_type}`}>
                {item.user.user_type === 'subscriber' ? 'PRO' : 'FREE'}
              </span>
            </div>
          ))}
          {filteredUsers.length === 0 && (
            <div style={{ color: "#444", padding: "30px", textAlign: 'center', fontSize: '13px', fontWeight: 600 }}>
              No active users found.
            </div>
          )}
        </div>
      </aside>

      {/* RIGHT PANEL - CHAT VIEW */}
      <section className="ch-main-x30sn">
        {activeUser ? (
          <>
            {/* Header */}
            <header className="ch-header-x30sn">
              <div className="ch-header-user-info-x30sn">
                <FaUserCircle size={22} color="#ff69b4"/> 
                <div>
                  {activeUser.user.name}
                  <span style={{ marginLeft: 8 }} className={`ch-user-badge-x30sn ${activeUser.user.user_type}`}>
                    {activeUser.user.user_type === 'subscriber' ? 'PRO' : 'FREE'}
                  </span>
                </div>
              </div>

              {/* Message Search Auditing Filter */}
              <div className="ch-msg-search-box-x30sn">
                <FaSearch />
                <input 
                  type="text" 
                  placeholder="Audit chat keywords…" 
                  className="ch-msg-search-input-x30sn"
                  value={msgSearchTerm}
                  onChange={(e) => setMsgSearchTerm(e.target.value)}
                />
              </div>
            </header>

            {/* Chat Intelligence stats strip */}
            <div className="ch-stats-ribbon-x30sn">
              <div className="ch-ribbon-item-x30sn">
                <span className="ch-ribbon-label-x30sn"><FaUsers /> Active Chatters</span>
                <span className="ch-ribbon-value-x30sn">{stats.totalUsers}</span>
              </div>
              <div className="ch-ribbon-item-x30sn">
                <span className="ch-ribbon-label-x30sn"><FaCommentDots /> Audited Messages</span>
                <span className="ch-ribbon-value-x30sn">{stats.totalMsgs}</span>
              </div>
              <div className="ch-ribbon-item-x30sn">
                <span className="ch-ribbon-label-x30sn"><FaExchangeAlt /> PRO split Ratio</span>
                <span className="ch-ribbon-value-x30sn">{stats.proRatio}%</span>
              </div>
              <div className="ch-ribbon-item-x30sn">
                <span className="ch-ribbon-label-x30sn"><FaRobot /> AI Companions</span>
                <span className="ch-ribbon-value-x30sn">{stats.activeAiCount}</span>
              </div>
            </div>

            {/* AI Friend Tabs */}
            <div className="ch-ai-tabs-x30sn">
              {activeUser.interactionsToday.map((chat) => (
                <div 
                  key={chat.chatId} 
                  className={`ch-ai-tab-x30sn ${selectedChatId === chat.chatId ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedChatId(chat.chatId);
                    setMsgSearchTerm(""); // Reset message filter when switching friend
                  }}
                >
                  <img src={chat.aiFriend?.avatar_img || "https://via.placeholder.com/20"} className="ch-ai-avatar-x30sn" alt="" onError={(e) => e.target.src = "https://via.placeholder.com/20"} />
                  {chat.aiFriend?.name || "Unknown AI"} ({chat.messageCount} msgs)
                </div>
              ))}
            </div>

            {/* Messages Area */}
            <div className="ch-messages-container-x30sn">
              {msgSearchTerm.trim() && (
                <div style={{ fontSize: '11px', color: '#ff69b4', background: 'rgba(255,105,180,0.04)', border: '1px solid rgba(255,105,180,0.15)', padding: '6px 12px', borderRadius: '8px', textAlign: 'center', fontWeight: 600 }}>
                  Filtering message logs by phrase: "{msgSearchTerm}" • {filteredMessages.length} matches found
                </div>
              )}
              {activeChat ? (
                filteredMessages.length > 0 ? (
                  filteredMessages.map((msg, mIdx) => (
                    <div key={mIdx} className={`ch-msg-row-x30sn ${msg.role === 'User' ? 'user' : 'ai'}`}>
                      {/* Avatar */}
                      <img 
                        src={msg.role === 'AI' 
                          ? (activeChat.aiFriend?.avatar_img || "https://via.placeholder.com/32") 
                          : (activeUser.user.profile_picture || "https://via.placeholder.com/32")
                        } 
                        className="ch-msg-avatar-x30sn" 
                        alt="" 
                        onError={(e) => e.target.src = "https://via.placeholder.com/32"}
                      />

                      {/* Bubble */}
                      <div className="ch-msg-bubble-x30sn">
                        {msg.mediaType === 'image' && (
                          <div className="ch-msg-img-wrap-x30sn">
                            {msg.text ? (
                              <img src={msg.text} className="ch-msg-img-x30sn" alt="User Media Attachment" />
                            ) : (
                              <span style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: 6 }}><FaImage /> Image Sent</span>
                            )}
                          </div>
                        )}
                        
                        {msg.mediaType !== 'image' && msg.text && (
                          <div>{msg.text}</div>
                        )}
                        
                        <div className="ch-msg-time-x30sn">
                          {formatTime(msg.time)}
                          {msg.role === 'AI' && <FaCheckDouble size={10} color="#ff69b4"/>}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="ch-empty-state-x30sn">
                    <h3>No matching messages</h3>
                    <p>No messages in this conversation match the filter keyword: "{msgSearchTerm}".</p>
                  </div>
                )
              ) : (
                <div className="ch-empty-state-x30sn">
                  <h3>Select active companion</h3>
                  <p>Choose one of the AI character tabs above to monitor message transcripts.</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="ch-empty-state-x30sn">
            <FaRobot size={48} style={{ color: '#ff69b4', marginBottom: 12 }} />
            <h3>Select a User from Sidebar</h3>
            <p>Select a participant from the left column to audit and review their interactive AI chats in real-time.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default ChatsDataAdmin;