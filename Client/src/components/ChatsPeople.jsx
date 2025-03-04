import React, { useState, useEffect } from "react";
import "./ChatsPeople.css";
import { Link } from 'react-router-dom';
import PopNoti from "./PopNoti";
import axios from "axios";
import api from "../config/api";

const ChatsPeople = ({ onChatSelect, onBackBTNSelect ,refreshTrigger  }) => {
  const [chats, setChats] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });
  const token = localStorage.getItem("token"); 

  useEffect(() => {
    const getUserFriendsToChat = async () => {
      try {
        const res = await axios.get(`${api.Url}/user/chat-friends`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const chatData = Array.isArray(res.data) ? res.data : [];

        if (chatData.length === 0) {
          setNotification({ show: true, message: "No chats found.", type: "info" });
        }

        setChats(chatData);
      } catch (error) {
        setNotification({ show: true, message: "Error fetching chats.", type: "error" });
        setChats([]); // Ensure chats is always an array
      }
    };

    if (token) {
      getUserFriendsToChat();
    }
  }, [token,refreshTrigger]);

  // Handle search filtering safely
  const filteredChats = searchTerm
  ? chats.filter(chat => chat.name.toLowerCase().includes(searchTerm.toLowerCase()))
  : chats;

  return (
    <div className="chats-container">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <header>
        <h1>Chats</h1>
        <Link to='/subscribe' className='subscribe-btn-x'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M2.80577 5.20006L7.00505 7.99958L11.1913 2.13881C11.5123 1.6894 12.1369 1.58531 12.5863 1.90631C12.6761 1.97045 12.7546 2.04901 12.8188 2.13881L17.0051 7.99958L21.2043 5.20006C21.6639 4.89371 22.2847 5.01788 22.5911 5.47741C22.7228 5.67503 22.7799 5.91308 22.7522 6.14895L21.109 20.1164C21.0497 20.62 20.6229 20.9996 20.1158 20.9996H3.8943C3.38722 20.9996 2.9604 20.62 2.90115 20.1164L1.25792 6.14895C1.19339 5.60045 1.58573 5.10349 2.13423 5.03896C2.37011 5.01121 2.60816 5.06832 2.80577 5.20006ZM12.0051 14.9996C13.1096 14.9996 14.0051 14.1042 14.0051 12.9996C14.0051 11.895 13.1096 10.9996 12.0051 10.9996C10.9005 10.9996 10.0051 11.895 10.0051 12.9996C10.0051 14.1042 10.9005 14.9996 12.0051 14.9996Z"></path>
          </svg> Subscribe
        </Link>
      </header>

      <div className="search-box-chates-pahe">
        <input
          type="text"
          placeholder="Search or start messages"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="chats-list">
        {filteredChats.length > 0 ? (
          filteredChats.map((chat) => (
            <div
              key={chat._id}
              className="chat-item"
              onClick={() => {
                onChatSelect(chat._id);
                onBackBTNSelect(false);
              }}
            >
              <img src={chat.avatar} alt={chat.name} />
              <div className="chat-details">
                <div className="chat-peop-header">
                  <h4>{chat.name}</h4>
                  
                  </div>
                <div className="chat-message">
                <p>
  {chat.lastMessage
    ? chat.lastMessage.split(" ").slice(0, 4).join(" ") + (chat.lastMessage.split(" ").length > 5 ? "..." : "")
    : "No messages yet."}
</p>
                  {chat.unreadCount > 0 && <span className="unread-count">{chat.unreadCount}</span>}
                  <p style={{textAlign:'end'}}>
  {chat.lastMessageTime ? (
    <>
      {new Date(chat.lastMessageTime).toLocaleDateString()} <br />
      {new Date(chat.lastMessageTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
    </>
  ) : (
    "No messages yet"
  )}
</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="no-chats-message">No chats found.</p>
        )}
      </div>
    </div>
  );
};

export default ChatsPeople;
