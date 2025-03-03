import React, { useState, useEffect } from "react"; 
import '../styles/ChatPage.css'
import ChatsPeople from "../components/ChatsPeople";
import ChatBox from "../components/ChatBox";
import { useLocation } from "react-router-dom";

function ChatPage() {
    const [windowWidth, setWindowWidth] = useState(window.innerWidth);
    const [chatBackBTN, setChatBackBTN] = useState(false);
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);
    const aiChatId = queryParams.get("chatId"); // Get AI Chat ID from URL

    const [selectedChatId, setSelectedChatId] = useState(aiChatId || null); // Default select AI Chat ID


    console.log(selectedChatId)

    useEffect(() => {
        if (aiChatId) {
            setSelectedChatId(aiChatId); // Open AI Chat automatically
        }
    }, [aiChatId]);




    // ✅ Define the missing function
    const handleChatBackBTN = () => {
        setChatBackBTN(prev => !prev);
    };

    const handleChatSelection = (chatId) => {
        setSelectedChatId(chatId);
        setChatBackBTN(false); // Hide back button when selecting a new chat
    };

    return (
        <div className="message-page-container">
            <div className={`message-main-send-mini ${windowWidth < 550 ? 'respon-message-main-send-mini' : ''} 
                ${selectedChatId === null ? '' : 'show-message-main-send-mini'}
                ${chatBackBTN === false ? '' : 'show-message-main-send-minidxxdex'}
                ${windowWidth > 550 && chatBackBTN === true ? 'big-smid3' : ''}
            `}>
                <ChatsPeople onBackBTNSelect={handleChatBackBTN} onChatSelect={handleChatSelection} />
            </div>

            <div className={`main-chat-container-c6 
                ${windowWidth < 550 ? 'hidden-the-main-chat-container' : ''} 
                ${selectedChatId !== null ? 'show-main-chat-container-mj' : ''} 
                ${chatBackBTN === false ? '' : 'hidezs-main-chat-container-mj'}
                ${windowWidth > 550 && chatBackBTN === true ? 'big-srgsdf' : ''}
            `}>
                {selectedChatId ? (
                    <ChatBox onBackBTNSelect={handleChatBackBTN} chatId={selectedChatId} />
                ) : (
                    <div className="main-start-char-cone0">
                        <i className="ri-chat-thread-line"></i>
                        <h2>Your messages</h2>
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
}

export default ChatPage;
