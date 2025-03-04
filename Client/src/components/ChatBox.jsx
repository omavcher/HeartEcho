import React, { useState, useEffect, useRef } from "react";
import "./ChatBox.css";
import axios from "axios";
import api from "../config/api";

const ChatBox = ({ chatId, onBackBTNSelect ,onSendMessage  }) => {
  const [messages, setMessages] = useState([]);
  const [userProfile, setUserProfile] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const token = localStorage.getItem("token");
  const chatContainerRef = useRef(null);
  const lastMessageRef = useRef(null);

  useEffect(() => {
    if (chatId) {
      fetchChatData();
      fetchAiModelDetails();
    }
  }, [chatId]);

  useEffect(() => {
 lastMessageRef.current?.scrollIntoView()
  }, [messages]);


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
      console.error("Error fetching AI details:", error);
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
  
      // Filter out messages already in the state to append only new ones
      const newMessages = response.data.messages.filter(
        (newMsg) => !messages.some((msg) => msg.time === newMsg.time) // Assuming `time` is unique
      );

      onSendMessage(); // 🔹 Trigger chat list refresh
      setMessages((prevMessages) => [
        ...prevMessages.filter((msg) => !msg.isLoading),
        ...newMessages,
      ]);
    } catch (error) {
      console.error("Error sending message:", error);
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

  return (
    <div className="chat-box-container">
      <div className="chat-header">
        <button className="back-btn-chat33" onClick={() => onBackBTNSelect(true)}>BACK</button>
        <img src={userProfile?.avatar_img || "/default-avatar.png"} alt={userProfile?.name || "User"} className="user-avatar" />
        <div className="chat-header-details">
          <h4>{userProfile?.name || "Unknown"}</h4>
          <p>Last seen: {userProfile?.lastSeen || "a moment ago"}</p>
        </div>
      </div>

      <div className="chat-messages" ref={chatContainerRef}>
        {messages.length === 0 ? (
          <p className="no-messages">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg, index) => (
            <div key={index} 
                 className={`message ${msg.sender === chatId ? "received" : "sent"}`}
                 ref={index === messages.length - 1 ? lastMessageRef : null} // ✅ Set ref only on the last message
            >
              <p>{msg.text}</p>
              <span className="message-time">
                {new Date(msg.time).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
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
        <button onClick={handleSendMessage}  disabled={!newMessage.trim()}>Send</button>
      </div>
    </div>
  );
};

export default ChatBox;
