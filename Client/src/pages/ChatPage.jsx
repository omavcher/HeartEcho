'use client';

import React, { useState, useEffect } from "react";
import '../styles/ChatPage.css';
import ChatsPeople from "../components/ChatsPeople";
import ChatBox from "../components/ChatBox";
import { useSearchParams } from "next/navigation";

function ChatPage() {
    const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);
    const [chatBackBTN, setChatBackBTN] = useState(false);
    const searchParams = useSearchParams();
    const aiChatId = searchParams.get("chatId"); // Get AI Chat ID from URL

    const [selectedChatId, setSelectedChatId] = useState(aiChatId || null);
    const [refreshChats, setRefreshChats] = useState(false);

    useEffect(() => {
        // Handle window resize
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (aiChatId) {
            setSelectedChatId(aiChatId); // Open AI Chat automatically
            setChatBackBTN(true);
        } else {
            setChatBackBTN(false);
        }
    }, [aiChatId]);

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
                <ChatsPeople 
                    onBackBTNSelect={handleChatBackBTN} 
                    onChatSelect={handleChatSelection} 
                    refreshTrigger={refreshChats} 
                />
            </div>

            <div className={`main-chat-container-c6 
                ${windowWidth < 550 ? 'hidden-the-main-chat-container' : ''} 
                ${selectedChatId !== null ? 'show-main-chat-container-mj' : ''} 
                ${chatBackBTN === false ? '' : 'hidezs-main-chat-container-mj'}
                ${windowWidth > 550 && chatBackBTN === true ? 'big-srgsdf' : ''}
            `}>
                {selectedChatId ? (
                    <ChatBox 
                        onBackBTNSelect={handleChatBackBTN} 
                        chatId={selectedChatId} 
                        onSendMessage={() => setRefreshChats(prev => !prev)}
                    />
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