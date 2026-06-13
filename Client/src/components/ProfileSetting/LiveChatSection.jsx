'use client';

import { useState, useRef, useEffect } from "react";
import axios from "axios";
import api from "../../config/api";
import "../styles/LiveChatSecion.css";

function LiveChatSection({ onBackSBTNSelect, isSubComponent = false }) {
  const [chatStarted, setChatStarted] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [activeAgent, setActiveAgent] = useState("priya");
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState("");
  const [msgCount, setMsgCount] = useState(0);
  const messagesEndRef = useRef(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    setToken(typeof window !== "undefined" ? localStorage.getItem("token") : null);
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const renderAvatar = (agentKey, size = 40) => {
    if (agentKey === "priya") {
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="agent-avatar-svg">
          <defs>
            <linearGradient id="priyaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff9a9e" />
              <stop offset="100%" stopColor="#fecfef" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#priyaGrad)" />
          {/* Hair back */}
          <path d="M25,50 C25,20 75,20 75,50 C75,55 70,60 70,65 C70,70 75,75 75,80 L25,80 Z" fill="#2c2c2e" />
          {/* Face */}
          <circle cx="50" cy="50" r="22" fill="#ffd1b3" />
          {/* Eyes */}
          <circle cx="43" cy="48" r="2.5" fill="#2c2c2e" />
          <circle cx="57" cy="48" r="2.5" fill="#2c2c2e" />
          {/* Smile */}
          <path d="M46,55 Q50,58 54,55" fill="none" stroke="#e05a8f" strokeWidth="2.5" strokeLinecap="round" />
          {/* Hair front / bangs */}
          <path d="M28,40 C35,28 50,32 50,38 C50,32 65,28 72,40 C75,45 73,50 72,55" fill="none" stroke="#2c2c2e" strokeWidth="8" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M30,72 C35,62 65,62 70,72 L70,90 L30,90 Z" fill="#ce4085" />
        </svg>
      );
    } else if (agentKey === "neha") {
      return (
        <svg width={size} height={size} viewBox="0 0 100 100" className="agent-avatar-svg">
          <defs>
            <linearGradient id="nehaGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a1c4fd" />
              <stop offset="100%" stopColor="#c2e9fb" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="48" fill="url(#nehaGrad)" />
          {/* Face */}
          <circle cx="50" cy="48" r="21" fill="#ffe0cc" />
          {/* Eyes */}
          <circle cx="43" cy="46" r="2.5" fill="#1c1c1e" />
          <circle cx="57" cy="46" r="2.5" fill="#1c1c1e" />
          {/* Smile */}
          <path d="M47,53 Q50,56 53,53" fill="none" stroke="#e05a8f" strokeWidth="2.5" strokeLinecap="round" />
          {/* Glasses */}
          <circle cx="43" cy="46" r="6" fill="none" stroke="#1c1c1e" strokeWidth="2" />
          <circle cx="57" cy="46" r="6" fill="none" stroke="#1c1c1e" strokeWidth="2" />
          <line x1="49" y1="46" x2="51" y2="46" stroke="#1c1c1e" strokeWidth="2" />
          {/* Hair */}
          <path d="M27,45 C27,22 73,22 73,45 C73,48 70,52 68,54" fill="none" stroke="#1c1c1e" strokeWidth="6" strokeLinecap="round" />
          {/* Clothes */}
          <path d="M30,70 C35,60 65,60 70,70 L70,90 L30,90 Z" fill="#0a84ff" />
        </svg>
      );
    }
    return null;
  };

  const handleSendMessage = async () => {
    if (input.trim() === "") return;
    
    const newMessage = { 
      sender: "user", 
      text: input.trim(), 
      timestamp: new Date() 
    };
    
    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsTyping(true);
    
    const currentMsgCount = msgCount + 1;
    setMsgCount(currentMsgCount);

    try {
      const res = await axios.post(
        `${api.Url}/user/support-chat`,
        {
          agent: activeAgent,
          messages: updatedMessages
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: res.data.text, 
        timestamp: new Date() 
      }]);
    } catch (err) {
      console.error("Support chat error:", err);
      const errorReply = activeAgent === "priya"
        ? "sorry dear basically some server issue has come. pls type again so i can check."
        : "actually some technical issue is there, pls check your internet connection or type again.";
        
      setMessages(prev => [...prev, { 
        sender: "bot", 
        text: errorReply, 
        timestamp: new Date() 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleStartChat = () => {
    if (!selectedIssue) {
      alert("Please select an issue type to start the chat.");
      return;
    }
    
    const agent = selectedIssue === "Billing" ? "priya" : "neha";
    setActiveAgent(agent);
    setIsConnecting(true);
    
    // Simulate connection delay
    setTimeout(() => {
      setIsConnecting(false);
      setChatStarted(true);
      setMsgCount(0);
      
      const greeting = agent === "priya" 
        ? "Hi, i am Priya Sharma. basically i am your billing specialist today. Pls tell how i can help u with your subscription or payments?"
        : "hello! Neha Patel here from technical support side. pls tell me what technical issue or bug u are facing in platform today?";
        
      setMessages([{ 
        sender: "bot", 
        text: greeting, 
        timestamp: new Date() 
      }]);
    }, 1500);
  };

  const handleEndChat = () => {
    if (window.confirm("Are you sure you want to end this chat?")) {
      setChatStarted(false);
      setMessages([]);
      setSelectedIssue("");
      setInput("");
      setMsgCount(0);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const agentName = activeAgent === "priya" ? "Priya Sharma" : "Neha Patel";
  const agentTitle = activeAgent === "priya" ? "Billing Specialist" : "Tech Support Expert";

  return (
    <>
      {!isSubComponent && (
        <header className='profile-setting-header3-dwdjwd'>
          <h2 className="chat-header-title-dwdjwd">Live Chat Support</h2>
          <button className="back-button-dwdjwd" onClick={() => onBackSBTNSelect(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon-dwdjwd">
              <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
            </svg>
          </button>
        </header>
      )}

      {isConnecting ? (
        <div className="pre-chat-form-live-cht-dwdjwd">
          <div className="pre-chat-content-dwdjwd connecting-state-dwdjwd">
            <div className="connecting-avatar-pulse-dwdjwd">
              {renderAvatar(activeAgent, 80)}
              <span className="connecting-pulse-ring-dwdjwd"></span>
            </div>
            <h3 className="pre-chat-title-dwdjwd">Connecting...</h3>
            <p className="pre-chat-description-dwdjwd">
              Assigning {activeAgent === "priya" ? "Priya Sharma" : "Neha Patel"} to assist you. Please wait a moment.
            </p>
            <div className="connecting-shimmer-dwdjwd shimmer-bg"></div>
          </div>
        </div>
      ) : !chatStarted ? (
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

            <div className="online-agents-container">
              <p className="online-agents-title">SUPPORT AGENTS ONLINE</p>
              <div className="online-agents-list">
                <div className="agent-card">
                  <div className="agent-avatar-wrapper">
                    {renderAvatar("priya", 44)}
                    <span className="agent-status-dot pulse"></span>
                  </div>
                  <div className="agent-info">
                    <span className="agent-name">Priya Sharma</span>
                    <span className="agent-role">Billing Specialist</span>
                  </div>
                </div>
                <div className="agent-card">
                  <div className="agent-avatar-wrapper">
                    {renderAvatar("neha", 44)}
                    <span className="agent-status-dot pulse"></span>
                  </div>
                  <div className="agent-info">
                    <span className="agent-name">Neha Patel</span>
                    <span className="agent-role">Technical Support</span>
                  </div>
                </div>
              </div>
            </div>
            
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
            <div className="chat-agent-profile-dwdjwd">
              <div className="chat-agent-avatar-wrapper-dwdjwd">
                {renderAvatar(activeAgent, 44)}
                <span className="agent-header-status-dot-dwdjwd"></span>
              </div>
              <div className="chat-agent-info-dwdjwd">
                <span className="chat-agent-name-dwdjwd">{agentName}</span>
                <span className="chat-agent-title-dwdjwd">{agentTitle}</span>
              </div>
            </div>
            <div className="chat-header-actions-dwdjwd">
              <button className="chat-end-btn-header-dwdjwd" onClick={handleEndChat}>
                End Chat
              </button>
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
                <p>Connecting with {agentName}...</p>
              </div>
            ) : (
              messages.map((msg, index) => (
                <div key={index} className={`message-bubble-wrapper-dwdjwd ${msg.sender}-bubble-wrapper-dwdjwd`}>
                  {msg.sender === "bot" && (
                    <div className="message-bubble-avatar-dwdjwd">
                      {renderAvatar(activeAgent, 32)}
                    </div>
                  )}
                  <div className={`message-bubble-dwdjwd ${msg.sender}-message-dwdjwd`}>
                    <div className="message-content-dwdjwd">
                      <p className="message-text-dwdjwd">{msg.text}</p>
                      <span className="message-time-dwdjwd">
                        {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {isTyping && (
              <div className="message-bubble-wrapper-dwdjwd bot-bubble-wrapper-dwdjwd">
                <div className="message-bubble-avatar-dwdjwd">
                  {renderAvatar(activeAgent, 32)}
                </div>
                <div className="typing-indicator-dwdjwd">
                  <div className="typing-dots-dwdjwd">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <p>{agentName} is typing...</p>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          <div className="chat-input-container-dwdjwd">
            <div className="chat-input-wrapper-dwdjwd">
              <input
                type="text"
                placeholder={`Type a message to ${activeAgent === "priya" ? "Priya" : "Neha"}...`}
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
        </div>
      )}
    </>
  );
}

export default LiveChatSection;