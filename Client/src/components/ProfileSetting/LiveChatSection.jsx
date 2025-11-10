'use client';

import { useState, useRef, useEffect } from "react";
import "../styles/LiveChatSecion.css";

function LiveChatSection({ onBackSBTNSelect }) {
  const [chatStarted, setChatStarted] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("");
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (input.trim() === "") return;
    
    const newMessage = { 
      sender: "user", 
      text: input.trim(), 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInput("");
    setIsTyping(true);

    // Simulate bot response
    setTimeout(() => {
      const botResponses = {
        "": "Thank you for your message. A support agent will assist you shortly.",
        "Billing": "I understand you have billing questions. Our billing team will help you resolve this issue.",
        "Technical Support": "I see you need technical assistance. Our support team is connecting to help you.",
        "Account Issues": "I understand you're experiencing account issues. Let me connect you with our account specialists."
      };

      const botResponse = botResponses[selectedIssue] || botResponses[""];
      
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: botResponse, 
        timestamp: new Date() 
      }]);
      setIsTyping(false);
    }, 1500);
  };

  const handleStartChat = () => {
    if (!selectedIssue) {
      alert("Please select an issue type to start the chat.");
      return;
    }
    setChatStarted(true);
    
    // Add welcome message
    setTimeout(() => {
      setMessages([{ 
        sender: "bot", 
        text: `Hello! Thank you for contacting support regarding "${selectedIssue}". How can I assist you today?`, 
        timestamp: new Date() 
      }]);
    }, 500);
  };

  const handleEndChat = () => {
    if (window.confirm("Are you sure you want to end this chat?")) {
      setChatStarted(false);
      setMessages([]);
      setSelectedIssue("");
      setInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      <header className='profile-setting-header3-dwdjwd'>
        <h2 className="chat-header-title-dwdjwd">Live Chat Support</h2>
        <button className="back-button-dwdjwd" onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon-dwdjwd">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      {!chatStarted ? (
        <div className="pre-chat-form-live-cht-dwdjwd">
          <div className="pre-chat-content-dwdjwd">
            <div className="chat-welcome-icon-dwdjwd">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455ZM5.76282 17H20V5H4V18.3851L5.76282 17ZM11 10H13V12H11V10ZM7 10H9V12H7V10ZM15 10H17V12H15V10Z"></path>
              </svg>
            </div>
            <h3 className="pre-chat-title-dwdjwd">How can we help you today?</h3>
            <p className="pre-chat-description-dwdjwd">
              Our support team is available 24/7 to assist you with any questions or issues.
            </p>
            
            <div className="issue-selector-dwdjwd">
              <label className="issue-label-dwdjwd">Select Issue Type</label>
              <select 
                value={selectedIssue} 
                onChange={(e) => setSelectedIssue(e.target.value)}
                className="issue-select-dwdjwd"
              >
                <option value="">Choose an issue type</option>
                <option value="Billing">Billing & Payments</option>
                <option value="Technical Support">Technical Support</option>
                <option value="Account Issues">Account Issues</option>
                <option value="Feature Request">Feature Request</option>
                <option value="Bug Report">Bug Report</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <button 
              className="start-chat-button-dwdjwd" 
              onClick={handleStartChat}
              disabled={!selectedIssue}
            >
              Start Chat Session
            </button>
          </div>
        </div>
      ) : (
        <div className="chat-window-form-live-cht-dwdjwd">
          <div className="chat-header-dwdjwd">
            <div className="chat-status-dwdjwd">
              <div className="status-indicator-dwdjwd"></div>
              <span>Connected to Support</span>
            </div>
            <div className="chat-issue-dwdjwd">
              Issue: <span>{selectedIssue}</span>
            </div>
          </div>

          <div className="messages-container-live-cht-dwdjwd">
            {messages.length === 0 ? (
              <div className="empty-chat-dwdjwd">
                <div className="empty-chat-icon-dwdjwd">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455ZM5.76282 17H20V5H4V18.3851L5.76282 17ZM8 10H16V12H8V10ZM8 14H16V16H8V14Z"></path>
                  </svg>
                </div>
                <p>Starting your chat session...</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`message-bubble-dwdjwd ${msg.sender}-message-dwdjwd`}>
                  <div className="message-content-dwdjwd">
                    <p className="message-text-dwdjwd">{msg.text}</p>
                    <span className="message-time-dwdjwd">
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="typing-indicator-dwdjwd">
                <div className="typing-dots-dwdjwd">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <p>Support is typing...</p>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container-dwdjwd">
            <div className="chat-input-wrapper-dwdjwd">
              <input
                type="text"
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="chat-input-field-dwdjwd"
                maxLength={500}
              />
              <button 
                onClick={handleSendMessage}
                disabled={!input.trim()}
                className="send-button-dwdjwd"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 13.0001H9V11.0001H3V1.8457C3 1.56956 3.22386 1.3457 3.5 1.3457C3.57574 1.3457 3.65068 1.36699 3.71683 1.4076L22.2168 11.562C22.3567 11.6473 22.4357 11.8032 22.4224 11.9674C22.4091 12.1316 22.3057 12.2743 22.1523 12.3367L3.65228 20.3367C3.45884 20.4167 3.23717 20.3525 3.11612 20.1834C3.04682 20.0844 3.01648 19.9629 3.0314 19.8424L3.98409 14.0001H3V13.0001ZM5 14.8685L4.39896 18.8162L18.999 12.2001L5 14.8685ZM5 12.2001V4.86852L18.999 12.2001H5Z"></path>
                </svg>
              </button>
            </div>
            <div className="input-helper-dwdjwd">
              <span className="char-count-dwdjwd">{input.length}/500</span>
              <span className="enter-hint-dwdjwd">Press Enter to send</span>
            </div>
          </div>

          <button 
            className="end-chat-button-dwdjwd" 
            onClick={handleEndChat}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 16.4183 7.58172 20 12 20ZM12 10.5858L14.8284 7.75736L16.2426 9.17157L13.4142 12L16.2426 14.8284L14.8284 16.2426L12 13.4142L9.17157 16.2426L7.75736 14.8284L10.5858 12L7.75736 9.17157L9.17157 7.75736L12 10.5858Z"></path>
            </svg>
            End Chat
          </button>
        </div>
      )}
    </>
  );
}

export default LiveChatSection;