'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";
import api from "../../config/api";
import { FaSearch, FaUserCircle, FaRobot, FaClock, FaCheckDouble, FaImage } from "react-icons/fa";

// ------------------- CSS STYLES (Pure Black & Pink Theme) -------------------
const styles = `
/* ROOT LAYOUT */
.chats-root-x30sn {
  display: flex;
  height: calc(100vh - 100px); /* Adjust based on your admin header height */
  background-color: #000;
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  border: 1px solid #222;
  border-radius: 16px;
  overflow: hidden;
}

/* LEFT SIDEBAR: USER LIST */
.chats-sidebar-x30sn {
  width: 320px;
  border-right: 1px solid #222;
  display: flex;
  flex-direction: column;
  background: #050505;
}

.chats-search-box-x30sn {
  padding: 15px;
  border-bottom: 1px solid #222;
}

.chats-search-input-x30sn {
  width: 100%;
  background: #111;
  border: 1px solid #333;
  padding: 10px 15px;
  border-radius: 8px;
  color: #fff;
  outline: none;
  font-size: 13px;
}
.chats-search-input-x30sn:focus { border-color: #ff69b4; }

.chats-user-list-x30sn {
  flex: 1;
  overflow-y: auto;
}

.chats-user-item-x30sn {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 15px;
  cursor: pointer;
  border-bottom: 1px solid #1a1a1a;
  transition: 0.2s;
}

.chats-user-item-x30sn:hover { background: #111; }
.chats-user-item-x30sn.active { background: rgba(255, 105, 180, 0.1); border-left: 3px solid #ff69b4; }

.user-avatar-x30sn {
  width: 40px; height: 40px; border-radius: 50%; object-fit: cover; border: 1px solid #333;
}

.user-info-x30sn h4 { margin: 0; font-size: 14px; font-weight: 600; color: #fff; }
.user-info-x30sn p { margin: 2px 0 0; font-size: 11px; color: #888; }
.user-badge-x30sn { 
  font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: auto;
  text-transform: uppercase; font-weight: 700;
}
.user-badge-x30sn.subscriber { background: #ff69b4; color: #000; }
.user-badge-x30sn.free { background: #333; color: #aaa; }

/* RIGHT PANEL: CHAT VIEW */
.chats-main-x30sn {
  flex: 1;
  display: flex;
  flex-direction: column;
  background: #000;
}

/* Empty State */
.chats-empty-x30sn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #444;
  font-size: 14px;
}

/* Selected User Header */
.chat-header-x30sn {
  padding: 15px 20px;
  border-bottom: 1px solid #222;
  background: #080808;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.chat-header-user-x30sn { font-size: 16px; font-weight: 700; display: flex; align-items: center; gap: 10px; }
.chat-stats-x30sn { font-size: 12px; color: #666; }

/* AI Friend Tabs */
.ai-tabs-x30sn {
  display: flex;
  gap: 10px;
  padding: 10px 20px;
  border-bottom: 1px solid #222;
  background: #050505;
  overflow-x: auto;
}

.ai-tab-x30sn {
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid #333;
  background: #111;
  color: #aaa;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: 0.2s;
  white-space: nowrap;
}

.ai-tab-x30sn:hover { border-color: #555; color: #fff; }
.ai-tab-x30sn.active { background: #ff69b4; color: #000; border-color: #ff69b4; font-weight: 600; }
.ai-tab-avatar-x30sn { width: 20px; height: 20px; border-radius: 50%; object-fit: cover; }

/* Messages Area */
.messages-container-x30sn {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-image: radial-gradient(#111 1px, transparent 1px);
  background-size: 20px 20px;
}

.message-group-x30sn {
  margin-bottom: 20px;
}

.msg-row-x30sn {
  display: flex;
  gap: 10px;
  margin-bottom: 12px;
  max-width: 80%;
}

.msg-row-x30sn.user {
  margin-left: auto;
  flex-direction: row-reverse;
}

.msg-row-x30sn.ai {
  margin-right: auto;
}

.msg-avatar-x30sn {
  width: 32px; height: 32px; border-radius: 50%; object-fit: cover; border: 1px solid #333; flex-shrink: 0;
}

.msg-bubble-x30sn {
  padding: 10px 14px;
  border-radius: 12px;
  font-size: 13px;
  line-height: 1.5;
  position: relative;
  word-wrap: break-word;
}

.msg-row-x30sn.user .msg-bubble-x30sn {
  background: #ff69b4;
  color: #000;
  border-top-right-radius: 2px;
}

.msg-row-x30sn.ai .msg-bubble-x30sn {
  background: #1a1a1a;
  color: #eee;
  border: 1px solid #333;
  border-top-left-radius: 2px;
}

.msg-time-x30sn {
  font-size: 10px;
  color: rgba(255,255,255,0.4);
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
  justify-content: flex-end;
}
.msg-row-x30sn.user .msg-time-x30sn { color: rgba(0,0,0,0.5); }

/* Image Message */
.msg-image-x30sn {
  max-width: 200px;
  border-radius: 8px;
  margin-top: 5px;
  border: 1px solid rgba(255,255,255,0.1);
}

/* Scrollbar */
.chats-user-list-x30sn::-webkit-scrollbar, .messages-container-x30sn::-webkit-scrollbar { width: 6px; }
.chats-user-list-x30sn::-webkit-scrollbar-thumb, .messages-container-x30sn::-webkit-scrollbar-thumb { background: #333; border-radius: 3px; }
`;

const ChatsDataAdmin = () => {
  const [chatData, setChatData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUserIndex, setSelectedUserIndex] = useState(null);
  const [selectedChatId, setSelectedChatId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  useEffect(() => {
    fetchChats();
  }, []);

  const fetchChats = async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/chats-data`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data.success) {
        setChatData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching chats", error);
    } finally {
      setLoading(false);
    }
  };

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
    // Select first chat of that user by default
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

  // Format Time
  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return <div style={{padding:40, color:'#fff', textAlign:'center'}}>Loading Chats...</div>;

  return (
    <div className="chats-root-x30sn">
      <style>{styles}</style>

      {/* LEFT SIDEBAR - USER LIST */}
      <div className="chats-sidebar-x30sn">
        <div className="chats-search-box-x30sn">
          <input 
            type="text" 
            placeholder="Search users..." 
            className="chats-search-input-x30sn"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="chats-user-list-x30sn">
          {filteredUsers.map((item, idx) => (
            <div 
              key={item.user.id} 
              className={`chats-user-item-x30sn ${selectedUserIndex === idx ? 'active' : ''}`}
              onClick={() => handleUserSelect(idx)}
            >
              <img 
                src={item.user.profile_picture} 
                alt={item.user.name} 
                className="user-avatar-x30sn"
                onError={(e) => e.target.src = "https://via.placeholder.com/40"}
              />
              <div className="user-info-x30sn">
                <h4>{item.user.name}</h4>
                <p>{item.user.email}</p>
              </div>
              <span className={`user-badge-x30sn ${item.user.user_type}`}>
                {item.user.user_type === 'subscriber' ? 'PRO' : 'FREE'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT PANEL - CHAT VIEW */}
      <div className="chats-main-x30sn">
        {activeUser ? (
          <>
            {/* Header */}
            <div className="chat-header-x30sn">
              <div className="chat-header-user-x30sn">
                <FaUserCircle size={20} color="#ff69b4"/> {activeUser.user.name}
              </div>
              <div className="chat-stats-x30sn">
                {activeUser.interactionsToday.length} Active Conversations
              </div>
            </div>

            {/* AI Friend Tabs */}
            <div className="ai-tabs-x30sn">
              {activeUser.interactionsToday.map((chat) => (
                <div 
                  key={chat.chatId} 
                  className={`ai-tab-x30sn ${selectedChatId === chat.chatId ? 'active' : ''}`}
                  onClick={() => setSelectedChatId(chat.chatId)}
                >
                  <img src={chat.aiFriend.avatar_img} className="ai-tab-avatar-x30sn" alt=""/>
                  {chat.aiFriend.name} ({chat.messageCount})
                </div>
              ))}
            </div>

            {/* Messages Area */}
            <div className="messages-container-x30sn">
              {activeChat ? (
                activeChat.messages.map((msg, mIdx) => (
                  <div key={mIdx} className={`msg-row-x30sn ${msg.role === 'User' ? 'user' : 'ai'}`}>
                    {/* Avatar */}
                    {msg.role === 'AI' ? (
                      <img src={activeChat.aiFriend.avatar_img} className="msg-avatar-x30sn" alt="AI"/>
                    ) : (
                      <img src={activeUser.user.profile_picture} className="msg-avatar-x30sn" alt="U"/>
                    )}

                    {/* Bubble */}
                    <div className="msg-content-wrapper">
                        {msg.mediaType === 'image' && (
                           <div className="msg-bubble-x30sn">
                             <i><FaImage/> Image Sent</i>
                             <div className="msg-time-x30sn">{formatTime(msg.time)}</div>
                           </div>
                        )}
                        
                        {msg.text && (
                            <div className="msg-bubble-x30sn">
                                {msg.text}
                                <div className="msg-time-x30sn">
                                    {formatTime(msg.time)}
                                    {msg.role === 'AI' && <FaCheckDouble size={10} color="#888"/>}
                                </div>
                            </div>
                        )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="chats-empty-x30sn">Select an AI conversation to view history.</div>
              )}
            </div>
          </>
        ) : (
          <div className="chats-empty-x30sn">
            <div>
                <FaRobot size={40} style={{marginBottom:10, display:'block', margin:'0 auto'}}/>
                Select a user to monitor their interactions.
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatsDataAdmin;