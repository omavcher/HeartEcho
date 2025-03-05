import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";
import axios from "axios";
import api from "../config/api";
import PopNoti from "./PopNoti";
import { useNavigate } from "react-router-dom";

const ChatBox = ({ chatId, onBackBTNSelect, onSendMessage }) => {
  const [messages, setMessages] = useState([]);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [userProfile, setUserProfile] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [showOverlay, setShowOverlay] = useState(false); 
  const overlayRef = useRef(null);
  const token = localStorage.getItem("token");
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const menuRef = useRef(null);
  const navigate = useNavigate();

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
    if (chatId) {
      fetchChatData();
      fetchAiModelDetails();
    }
  }, [chatId]);

  useEffect(() => {
    lastMessageRef.current?.scrollIntoView();
  }, [messages]);

  useEffect(() => {
    // ✅ Close overlay when clicking outside
    const handleClickOutside = (event) => {
      if (overlayRef.current && !overlayRef.current.contains(event.target)) {
        setShowOverlay(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !msg.isLoading),
        ...newMessages,
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
      setNotification({ show: true, message: "Failed to get a response. Try again.", type: "error" });

      if (error.response && error.response.status === 403) {
        setNotification({ 
            show: true, 
            message: "Your daily message quota is over. Try again tomorrow!", 
            type: "error" 
        });
    
        setTimeout(() => {
            navigate("/subscribe?re=quotaover");
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
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  


  const [hoveredMessage, setHoveredMessage] = useState(null);
  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setSelectedMessage(null);
      }
    };
  
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  

  const handleCopyMessage = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setNotification({ show: true, message: "Message copied!", type: "success" });
      })
      .catch(err => console.error("Error copying text: ", err));
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
        <button className="back-btn-chat33" onClick={() => onBackBTNSelect(true)}>BACK</button>
        <img 
          src={userProfile?.avatar_img || "/default-avatar.png"} 
          alt={userProfile?.name || "User"} 
          className="user-avatar" 
          onClick={() => setShowOverlay(true)} // ✅ Open overlay
        />
        <div className="chat-header-details" onClick={() => setShowOverlay(true)}> {/* ✅ Open overlay */}
          <h4>{userProfile?.name || "Unknown"}</h4>
          <p>Last seen: {userProfile?.lastSeen || "a moment ago"}</p>
        </div>
      </div>

      {showOverlay && (
        <div className="overlay-container-chat-box" ref={overlayRef}>
          <div className="overlay-content-header-chat-box">
            <h1>{userProfile?.name}</h1>
            <button style={{cursor:'pointer'}} onClick={() => setShowOverlay(false)}>Close</button>
          </div>
<div className="over-conatiner-boc-chat4">
          <div className="overlay-conatiner-chat-left">
          <img 
          src={userProfile?.avatar_img || "/default-avatar.png"} 
          alt={userProfile?.name || "User"} 
        />
          </div>

          <div className="overlay-container-chat-right">
  <div className="user-info-card">
    <p className="user-age"><strong>Age:</strong> {userProfile?.age || "N/A"}</p>
    <p className="user-description">
      <strong>Description:</strong> {userProfile?.description || "No description provided"}
    </p>
    <p className="user-relationship">
  <strong>Relationship:</strong> {userProfile?.relationship || "Not specified"}
</p>

<p className="user-interests">
  <strong>Interests:</strong> {
    Array.isArray(userProfile?.interests)
      ? userProfile.interests.join(", ")  // If array → Join with commas
      : userProfile?.interests?.replace(/([a-z])([A-Z])/g, '$1 $2') || "Not specified"
  }
</p>

  </div>
</div>




          </div>



        </div>
      )}

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <p className="no-messages97n"></p>
        ) : (
          messages.map((msg, index) => (
            <div 
              key={index} 
              className={`message ${msg.sender === chatId ? "received" : "sent"}`}
              ref={index === messages.length - 1 ? lastMessageRef : null}
              onMouseEnter={() => setHoveredMessage(msg._id)}  // ✅ Track hover state
              onMouseLeave={() => setHoveredMessage(null)}      // ✅ Reset on leave
              
            >
              <p>{msg.text}</p>
              <span className="message-time">
                {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
    
              {/* Show options only when hovered */}
              {hoveredMessage === msg._id && (
                <span className="message-options" onClick={() => setSelectedMessage(msg._id)}>
<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16"><path stroke="currentColor" d="M13.5 5.5 8 11 2.5 5.5"/></svg>                </span>
              )}
    
    {selectedMessage === msg._id && (
  <div className="delete-menu" ref={menuRef}>
    <button className="btn-detle-x3" onClick={() => handleDeleteMessage(msg._id)}>Delete</button>
    <button className="btn-copy-x3" onClick={() => handleCopyMessage(msg.text)}>Copy</button>
    <button className="btn-closes-x3" onClick={() => setSelectedMessage(null)}>Cancel</button>
  </div>
)}

            </div>
          ))          
        )}
        <div ref={lastMessageRef}/>
      </div>

      <div className="chat-input">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder="Type a message..."
        />
        <button onClick={handleSendMessage} disabled={!newMessage.trim()}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
