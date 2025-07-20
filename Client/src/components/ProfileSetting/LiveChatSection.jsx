'use client';

import React, { useState } from "react";
import Link from 'next/link';
import "../styles/LiveChatSecion.css";

function LiveChatSection({ onBackSBTNSelect }) {
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    setMessages([...messages, { sender: "user", text: input, timestamp: new Date() }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      setMessages((prev) => [...prev, { 
        sender: "bot", 
        text: "Thank you for your message. A support agent will assist you shortly.", 
        timestamp: new Date() 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <>
      <header className='profile-setting-header3'>
        <h2>Live Chat</h2>
        <button onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      {!chatStarted ? (
        <div className="pre-chat-form-live-cht">
          <h3>Start a Chat</h3>
          <select>
            <option>Select an Issue</option>
            <option>Billing</option>
            <option>Technical Support</option>
            <option>Account Issues</option>
          </select>
          <button 
            className="startchat-live-chtd" 
            onClick={() => setChatStarted(true)}
          >
            Start Chat
          </button>
        </div>
      ) : (
        <div className="chat-window-form-live-cht">
          <div className="messages-container-live-cht">
            {messages.map((msg, index) => (
              <div key={index} className={`message-live-chtd ${msg.sender}`}>
                <p>{msg.text}</p>
                <span>{msg.timestamp.toLocaleTimeString()}</span>
              </div>
            ))}
            {isTyping && <p className="typing-indicator-live-chtd">Support is typing...</p>}
          </div>
          <div className="chat-input-live-chtd">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
          <button 
            className="end-chat-live-chtd" 
            onClick={() => setChatStarted(false)}
          >
            End Chat
          </button>
        </div>
      )}
    </>
  );
}

export default LiveChatSection;