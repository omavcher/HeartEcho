'use client';

import React, { useState, useEffect, useRef, Fragment, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import AdvancedLoader from "../components/AdvancedLoader";
import LoginModal from "../components/LoginModel";
import api from "../config/api";
import { FaChevronLeft, FaPaperPlane, FaEllipsisV, FaImage, FaFilm, FaBookOpen } from "react-icons/fa";
import { IoMdMore } from "react-icons/io";

// We'll reuse some of the ChatPage layout principles by adding inline CSS here or a new style file.
// Let's use CSS-in-JS pattern similar to HomeLiveStories for isolated, stunning styling.

const styles = `
.ls-page-container {
    display: flex;
    height: 100vh;
    width: 100vw;
    background-color: #000;
    overflow: hidden;
    color: #fff;
    font-family: 'Inter', system-ui, sans-serif;
}

/* Sidebar List */
.ls-sidebar {
    width: 380px;
    height: 100%;
    border-right: 1px solid #1a1a1a;
    display: flex;
    flex-direction: column;
    background: #050505;
    transition: all 0.3s ease;
    flex-shrink: 0;
}
.ls-sidebar-header {
    padding: 24px 20px 16px;
    border-bottom: 1px solid #1a1a1a;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
.ls-sidebar-title {
    font-size: 22px;
    font-weight: 800;
    margin: 0;
    background: linear-gradient(135deg, #b862ff, #ff85c2);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}
.ls-sidebar-desc {
    font-size: 13px;
    color: #777;
    margin: 0;
}
.ls-stories-list {
    flex: 1;
    overflow-y: auto;
    padding: 16px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
}
.ls-stories-list::-webkit-scrollbar { width: 4px; }
.ls-stories-list::-webkit-scrollbar-track { background: transparent; }
.ls-stories-list::-webkit-scrollbar-thumb { background: #333; border-radius: 4px; }

.ls-sidebar-item {
    position: relative;
    border-radius: 16px;
    overflow: hidden;
    aspect-ratio: 9/16;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
    padding: 14px 12px;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
    text-decoration: none;
    border: 2px solid transparent;
}
.ls-sidebar-item:hover {
    transform: translateY(-4px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.5);
}
.ls-sidebar-item.active {
    border-color: #b862ff;
    box-shadow: 0 0 15px rgba(144, 19, 254, 0.4);
}
.ls-item-poster {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
    transition: transform 0.5s ease;
}
.ls-sidebar-item:hover .ls-item-poster {
    transform: scale(1.08);
}
.ls-item-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.2) 60%, transparent 100%);
    z-index: 1;
}
.ls-item-info {
    position: relative;
    z-index: 2;
}
.ls-item-title {
    font-size: 15px;
    font-weight: 800;
    margin: 0 0 4px 0;
    color: #fff;
    line-height: 1.2;
    text-shadow: 0 2px 5px rgba(0,0,0,0.9);
}
.ls-item-category {
    font-size: 10px;
    color: #b862ff;
    font-weight: 800;
    text-transform: uppercase;
    margin: 0 0 4px 0;
    letter-spacing: 0.8px;
    text-shadow: 0 1px 3px rgba(0,0,0,0.8);
}

/* Main Content Area */
.ls-main {
    flex: 1;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    background: #0a0a0a;
}
.ls-main-empty {
    text-align: center;
    color: #555;
    font-size: 16px;
}

/* Phone Mockup Screen */
.ls-phone-container {
    width: 100%;
    max-width: 440px;
    height: 100%;
    max-height: 850px;
    background: #000;
    position: relative;
    display: flex;
    flex-direction: column;
    box-shadow: 0 0 50px rgba(0,0,0,0.5);
}
@media (min-width: 1024px) {
    .ls-phone-container {
        border-radius: 40px;
        height: 92%;
        border: 10px solid #111;
        box-shadow: 0 20px 60px rgba(0,0,0,0.6), inset 0 0 0 2px #222;
        overflow: hidden;
    }
}

.ls-phone-bg {
    position: absolute;
    inset: 0;
    z-index: 0;
    background-size: cover;
    background-position: center;
    transition: background-image 0.5s ease-in-out;
}
.ls-phone-bg::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.5) 75%, rgba(0,0,0,0.95) 100%);
}

/* Movie Overlay */
.ls-movie-overlay {
    position: absolute;
    inset: 0;
    z-index: 200;
    background: #000;
    display: flex;
    justify-content: center;
    align-items: center;
}
.ls-movie-player {
    width: 100%;
    height: 100%;
    object-fit: cover;
}
.ls-skip-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    background: rgba(0,0,0,0.5);
    color: #fff;
    border: 1px solid rgba(255,255,255,0.3);
    padding: 6px 14px;
    border-radius: 20px;
    font-size: 12px;
    cursor: pointer;
    backdrop-filter: blur(10px);
    z-index: 210;
}
.ls-skip-btn:hover {
    background: rgba(255,255,255,0.2);
}

.ls-phone-header {
    position: relative;
    z-index: 10;
    padding: 30px 20px 20px;
    display: flex;
    align-items: center;
    gap: 15px;
    background: linear-gradient(to bottom, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0) 100%);
}
.ls-back-btn {
    display: none;
    background: transparent;
    border: none;
    color: #fff;
    cursor: pointer;
    font-size: 20px;
    padding: 5px;
}
.ls-top-avatar {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #b862ff;
}
.ls-top-info { flex: 1; }
.ls-top-name { font-size: 16px; font-weight: 700; margin: 0; }
.ls-top-status { font-size: 12px; color: #00e676; margin: 2px 0 0 0; }

.ls-chat-area {
    position: relative;
    z-index: 1;
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    scrollbar-width: none;
}
.ls-chat-area::-webkit-scrollbar { display: none; }

.ls-date-separator {
    text-align: center;
    padding: 8px 0 4px;
    margin: 4px 0;
    font-size: 11px;
    color: rgba(255,255,255,0.45);
    letter-spacing: 0.3px;
}

.ls-msg-wrap {
    display: flex;
    width: 100%;
}
.ls-msg-wrap.received { justify-content: flex-start; }
.ls-msg-wrap.sent { justify-content: flex-end; }

.ls-bubble {
    max-width: 80%;
    padding: 12px 16px;
    border-radius: 20px;
    font-size: 15px;
    line-height: 1.4;
    position: relative;
    animation: bubbleIn 0.3s ease-out forwards;
}
@keyframes bubbleIn {
    from { opacity: 0; transform: translateY(10px) scale(0.95); }
    to { opacity: 1; transform: translateY(0) scale(1); }
}

.ls-msg-wrap.received .ls-bubble {
    background: rgba(30, 30, 30, 0.85);
    backdrop-filter: blur(10px);
    border-bottom-left-radius: 4px;
    color: #eee;
    border: 1px solid rgba(255,255,255,0.1);
}
.ls-msg-wrap.sent .ls-bubble {
    background: linear-gradient(135deg, #b862ff, #e0529a);
    border-bottom-right-radius: 4px;
    color: #fff;
    box-shadow: 0 4px 15px rgba(144, 19, 254, 0.3);
}

.ls-typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: rgba(30, 30, 30, 0.85);
    border-radius: 20px;
    border-bottom-left-radius: 4px;
    width: max-content;
    margin-bottom: 5px;
}
.ls-dot {
    width: 6px;
    height: 6px;
    background: #aaa;
    border-radius: 50%;
    animation: dotPulse 1.4s infinite ease-in-out both;
}
.ls-dot:nth-child(1) { animation-delay: -0.32s; }
.ls-dot:nth-child(2) { animation-delay: -0.16s; }
@keyframes dotPulse {
    0%, 80%, 100% { transform: scale(0); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
}

/* Input Area */
.ls-input-area {
    position: relative;
    z-index: 10;
    padding: 15px 20px;
    background: rgba(0,0,0,0.4);
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
    border-top: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    gap: 12px;
}
.ls-input-box {
    flex: 1;
    background: rgba(255,255,255,0.1);
    border: 1px solid rgba(255,255,255,0.15);
    border-radius: 30px;
    padding: 12px 20px;
    color: #fff;
    font-size: 15px;
    outline: none;
    transition: all 0.2s;
}
.ls-input-box:focus {
    border-color: rgba(144, 19, 254, 0.5);
    background: rgba(255,255,255,0.15);
}
.ls-send-btn {
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: #b862ff;
    color: #fff;
    border: none;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    cursor: pointer;
    transition: all 0.2s;
    flex-shrink: 0;
}
.ls-send-btn:hover {
    background: #d085ff;
    transform: scale(1.05);
}
.ls-send-btn:disabled {
    background: #444;
    cursor: not-allowed;
    transform: none;
}
.ls-progress-story-btn {
    position: absolute;
    top: -50px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(0, 0, 0, 0.7);
    border: 1px solid rgba(255,255,255,0.2);
    color: #fff;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 12px;
    backdrop-filter: blur(10px);
    cursor: pointer;
    z-index: 20;
    animation: bounce 2s infinite;
}
@keyframes bounce {
    0%, 20%, 50%, 80%, 100% {transform: translateX(-50%) translateY(0);}
    40% {transform: translateX(-50%) translateY(-10px);}
    60% {transform: translateX(-50%) translateY(-5px);}
}


/* Responsive Layout */
@media (max-width: 768px) {
    .ls-sidebar {
        width: 100%;
        position: absolute;
        z-index: 100;
        left: 0;
        transform: translateX(0);
    }
    .ls-sidebar.hiddenOnMobile {
        transform: translateX(-100%);
    }
    .ls-main {
        width: 100%;
    }
    .ls-phone-container {
        border-radius: 0;
        max-width: 100%;
        max-height: 100%;
        border: none;
    }
    .ls-back-btn {
        display: block;
    }
    .ls-input-area {
        padding-bottom: 80px; /* Space for mobile menu */
    }
}

@keyframes ls-pulse { 
    0%, 100% {opacity: 0.5;} 
    50% {opacity: 1;} 
}
`;

// Date label: Today, Yesterday, or formatted date
function getDateLabel(isoOrDate) {
    if (!isoOrDate) return "";
    const d = new Date(isoOrDate);
    if (isNaN(d.getTime())) return "";
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const msgDay = new Date(d);
    msgDay.setHours(0, 0, 0, 0);
    if (msgDay.getTime() === today.getTime()) return "Today";
    if (msgDay.getTime() === yesterday.getTime()) return "Yesterday";
    return d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// Helper Dummy Chat Sequence
const dummyChatSequence = [
    { type: 'received', text: 'Hey... are you there?' },
    { type: 'sent', text: 'Yes, what happened?' },
    { type: 'received', text: 'I think someone is outside my room.' },
    { type: 'received', text: 'Can you hear that?' },
    { type: 'bg_change', index: 1 }, // trigger background image change from chatting array
    { type: 'sent', text: 'Wait let me call you.' },
    { type: 'received', text: 'NO! Don\'t call.' },
    { type: 'received', text: 'They might hear it ringing...' },
    { type: 'bg_change', index: 2 },
    { type: 'sent', text: 'Okay, I am coming over right now.' },
];

function LiveStoryContent() {
    const params = useParams();
    const router = useRouter();
    const currentSlug = params?.slug;
    
    const [windowWidth, setWindowWidth] = useState(1024);
    const [showSidebar, setShowSidebar] = useState(true);
    
    const [messages, setMessages] = useState([]);
    const [isTyping, setIsTyping] = useState(false);
    const [storyProgressIndex, setStoryProgressIndex] = useState(0);
    const [bgIndex, setBgIndex] = useState(0);
    const [myInput, setMyInput] = useState('');
    const [showMovie, setShowMovie] = useState(false);
    const [token, setToken] = useState(null);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [chatLoading, setChatLoading] = useState(true);
    const [quotaStatus, setQuotaStatus] = useState(null);
    const [remainingQuota, setRemainingQuota] = useState(null);
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [quotaExhausted, setQuotaExhausted] = useState(false);
    const [sendError, setSendError] = useState(null);
    const [showLoginCTA, setShowLoginCTA] = useState(false);
    const [allStories, setAllStories] = useState([]);
    const [storiesLoading, setStoriesLoading] = useState(true);

    const chatAreaRef = useRef(null);
    const activeStory = allStories.find(s => s.slug === currentSlug) || null;

    useEffect(() => {
        setToken(typeof window !== 'undefined' ? localStorage.getItem('token') : null);
        const fetchStories = async () => {
            try {
                const res = await fetch(`${api.Url}/live-story/stories`);
                const data = await res.json();
                if (data.success) {
                    setAllStories(data.stories);
                }
            } catch (error) {
                console.error("Failed to fetch stories:", error);
            } finally {
                setStoriesLoading(false);
            }
        };
        fetchStories();
    }, []);

    // When slug or token changes: fetch previous chat. If no previous messages, show story video.
    useEffect(() => {
        if (!currentSlug || !activeStory) {
            setChatLoading(false);
            return;
        }
        setStoryProgressIndex(0);
        setIsTyping(false);
        setMyInput('');

        const chatting = activeStory.chatting;
        if (chatting && chatting.length > 0) {
          setBgIndex(Math.floor(Math.random() * chatting.length));
        } else {
          setBgIndex(0);
        }

        const hasWatched = typeof window !== 'undefined' ? localStorage.getItem(`watched_movie_${currentSlug}`) : null;

        if (!token) {
            setMessages([]);
            setChatLoading(false);
            if (activeStory.story_movie && !hasWatched) setShowMovie(true);
            else setShowMovie(false);
            return;
        }

        setChatLoading(true);
        axios.get(`${api.Url}/live-story/${currentSlug}/chat`, {
            headers: { Authorization: `Bearer ${token}` }
        }).then((res) => {
            const chatMessages = res.data?.chat?.messages || [];
            if (chatMessages.length > 0) {
                const mapped = chatMessages.map(m => ({
                    type: m.sender === 'me' ? 'sent' : 'received',
                    text: m.text || '',
                    time: m.time || new Date().toISOString()
                }));
                setMessages(mapped);
                setShowMovie(false);
            } else {
                setMessages([]);
                if (activeStory.story_movie && !hasWatched) setShowMovie(true);
                else setShowMovie(false);
            }

            const qs = res.data?.quotaStatus || null;
            const rem = (res.data?.remainingQuota !== undefined && res.data?.remainingQuota !== null)
                ? res.data.remainingQuota
                : (qs && qs.remainingQuota !== undefined ? qs.remainingQuota : null);
            const subscribedFlag = res.data?.isSubscribed !== undefined
                ? res.data.isSubscribed
                : (qs && qs.isSubscribed !== undefined ? qs.isSubscribed : (qs && qs.user_type === 'subscriber'));

            setQuotaStatus(qs);
            setRemainingQuota(rem);
            setIsSubscribed(!!subscribedFlag);
            setQuotaExhausted(!subscribedFlag && typeof rem === 'number' && rem <= 0);
        }).catch(() => {
            setMessages([]);
            if (activeStory.story_movie && !hasWatched) setShowMovie(true);
            else setShowMovie(false);
        }).finally(() => {
            setChatLoading(false);
        });
    }, [currentSlug, token, activeStory]);

    const handleMovieEnd = () => {
        if (currentSlug) {
            localStorage.setItem(`watched_movie_${currentSlug}`, 'true');
        }
        setShowMovie(false);
    };

    useEffect(() => {
        const handleResize = () => setWindowWidth(window.innerWidth);
        if (typeof window !== 'undefined') {
            setWindowWidth(window.innerWidth);
            window.addEventListener('resize', handleResize);
            if (window.innerWidth < 768 && currentSlug) {
                setShowSidebar(false);
            }
        }
        return () => { if(typeof window !== 'undefined') window.removeEventListener('resize', handleResize); }
    }, [currentSlug]);

    const handleBackClick = () => {
        setShowSidebar(true);
        // Maybe remove slug to go to list, but staying on page is fine
    };

    const handleProgressStory = () => {
        if (storyProgressIndex >= dummyChatSequence.length) return;
        
        const nextAction = dummyChatSequence[storyProgressIndex];
        
        if (nextAction.type === 'bg_change') {
            setBgIndex(Math.min(nextAction.index, (activeStory?.chatting?.length || 1) - 1));
            setStoryProgressIndex(prev => prev + 1);
            // Auto progress past backgrounds to next message
            setTimeout(() => progressToNextMessage(storyProgressIndex + 1), 500);
        } else if (nextAction.type === 'received') {
            setIsTyping(true);
            setTimeout(() => {
                setIsTyping(false);
                setMessages(prev => [...prev, nextAction]);
                setStoryProgressIndex(prev => prev + 1);
            }, 1200); // 1.2s typing delay
        } else if (nextAction.type === 'sent') {
            // For sent, we could auto-fill input or just show it instantly 
            // In a real interactive story, user might click "Next" and it auto sends
            setMessages(prev => [...prev, nextAction]);
            setStoryProgressIndex(prev => prev + 1);
        }
    };

    const progressToNextMessage = (index) => {
        if (index >= dummyChatSequence.length) return;
        const nextAction = dummyChatSequence[index];
        if (nextAction.type === 'bg_change') {
            setBgIndex(Math.min(nextAction.index, (activeStory?.chatting?.length || 1) - 1));
            setStoryProgressIndex(index + 1);
        }
    };

    const handleManualSend = async (e) => {
        e.preventDefault();
        if (!myInput.trim()) return;

        if (quotaExhausted && !isSubscribed) {
            // Free quota over – do not send more messages
            return;
        }

        if (!token) {
            setShowLoginModal(true);
            setSendError("कृपया लॉगिन करके कहानी शुरू करें।");
            setShowLoginCTA(true);
            return;
        }

        const text = myInput.trim();
        const now = new Date().toISOString();
        setMessages(prev => [...prev, { type: 'sent', text, time: now }]);
        setMyInput('');
        setIsTyping(true);
        setSendError(null);
        setShowLoginCTA(false);

        try {
            const response = await axios.post(
                `${api.Url}/live-story/${currentSlug}/chat/send`,
                { text },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (response.data?.aiMessage?.text) {
                const aiTime = response.data.aiMessage?.time || new Date().toISOString();
                setMessages(prev => [...prev, { type: 'received', text: response.data.aiMessage.text, time: aiTime }]);
            }

            const qs = response.data?.quotaStatus || null;
            const rem = (response.data?.remainingQuota !== undefined && response.data?.remainingQuota !== null)
                ? response.data.remainingQuota
                : (qs && qs.remainingQuota !== undefined ? qs.remainingQuota : null);
            const subscribedFlag = response.data?.isSubscribed !== undefined
                ? response.data.isSubscribed
                : (qs && qs.isSubscribed !== undefined ? qs.isSubscribed : (qs && qs.user_type === 'subscriber'));

            setQuotaStatus(qs);
            setRemainingQuota(rem);
            setIsSubscribed(!!subscribedFlag);
            setQuotaExhausted(!subscribedFlag && typeof rem === 'number' && rem <= 0);
            setSendError(null);
            setShowLoginCTA(false);
        } catch (err) {
            console.error('Live story send error:', err);

            if (err.response?.status === 403 && err.response?.data?.quotaExhausted) {
                const qs = err.response.data?.quotaStatus || null;
                const rem = (err.response.data?.remainingQuota !== undefined && err.response.data?.remainingQuota !== null)
                    ? err.response.data.remainingQuota
                    : (qs && qs.remainingQuota !== undefined ? qs.remainingQuota : 0);
                const subscribedFlag = err.response.data?.isSubscribed !== undefined
                    ? err.response.data.isSubscribed
                    : (qs && qs.isSubscribed !== undefined ? qs.isSubscribed : false);

                setQuotaStatus(qs);
                setRemainingQuota(rem);
                setIsSubscribed(!!subscribedFlag);
                setQuotaExhausted(true);

                setSendError("आज के आपके free messages ख़त्म हो चुके हैं। आगे story जारी रखने के लिए subscription एक्टिव करें।");
                setShowLoginCTA(false);
            } else if (err.response?.status === 403 && err.response?.data?.requireLogin) {
                setShowLoginModal(true);
                setSendError("आपको लॉगिन करना होगा ताकि आप कहानी जारी रख सकें।");
                setShowLoginCTA(true);
            } else if (err.response?.status === 401) {
                setShowLoginModal(true);
                setSendError("सेशन expire हो गया है। कृपया दोबारा लॉगिन करें।");
                setShowLoginCTA(true);
            } else {
                setSendError("कुछ गड़बड़ हो गई। कृपया दोबारा कोशिश करें या लॉगिन करें।");
                setShowLoginCTA(true);
            }
        } finally {
            setIsTyping(false);
        }
    };

    // Auto scroll to show latest message (user's recent message in view)
    useEffect(() => {
        const el = chatAreaRef.current;
        if (!el) return;
        const run = () => {
            el.scrollTop = el.scrollHeight;
        };
        run();
        const t = setTimeout(run, 100);
        return () => clearTimeout(t);
    }, [messages, isTyping]);


    const currentBackgroundImage = activeStory && activeStory.chatting && activeStory.chatting.length > 0 
        ? activeStory.chatting[bgIndex] 
        : activeStory?.poster;

    return (
        <div className="ls-page-container">
            <style>{styles}</style>

            {showLoginModal && (
                <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
                    <LoginModal onClose={() => setShowLoginModal(false)} />
                </div>
            )}

            {/* SIDEBAR */}
            <div className={`ls-sidebar ${!showSidebar ? 'hiddenOnMobile' : ''}`}>
                <div className="ls-sidebar-header">
                    <h1 className="ls-sidebar-title">Live A Story</h1>
                    <p className="ls-sidebar-desc">Experience interactive narratives like real chats.</p>
                </div>
                <div className="ls-stories-list">
                    {storiesLoading ? (
                        [1,2,3,4,5,6].map(i => (
                            <div key={i} className="ls-sidebar-item" style={{background: '#111', animation: 'ls-pulse 1.5s infinite ease-in-out'}}>
                                <div style={{position: 'absolute', bottom: 14, left: 12, right: 12}}>
                                    <div style={{width: 40, height: 10, background: 'rgba(184, 98, 255, 0.4)', borderRadius: 4, marginBottom: 6}}></div>
                                    <div style={{width: '90%', height: 14, background: '#222', borderRadius: 4}}></div>
                                </div>
                            </div>
                        ))
                    ) : (
                        allStories.map((story) => (
                            <Link 
                                href={`/live-a-story/${story.slug}`} 
                                key={story._id || story.slug} 
                                onClick={(e) => {
                                    if (windowWidth < 768) setShowSidebar(false);
                                }}
                                className={`ls-sidebar-item ${currentSlug === story.slug ? 'active' : ''}`}
                            >
                                <img src={story.poster} alt={story.title} className="ls-item-poster" 
                                     onError={(e) => { e.target.style.display = 'none'; }} />
                                <div className="ls-item-overlay"></div>
                                <div className="ls-item-info">
                                    <p className="ls-item-category">{story.category}</p>
                                    <h3 className="ls-item-title">{story.title}</h3>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="ls-main">
                {activeStory ? (
                    <div className="ls-phone-container">
                        {showMovie && activeStory.story_movie && (
                            <div className="ls-movie-overlay">
                                <video 
                                    src={activeStory.story_movie}
                                    autoPlay
                                    playsInline
                                    controls={false}
                                    controlsList="nodownload"
                                    onContextMenu={(e) => e.preventDefault()}
                                    onEnded={handleMovieEnd}
                                    className="ls-movie-player"
                                />
                                <button className="ls-skip-btn" onClick={handleMovieEnd}>Skip</button>
                            </div>
                        )}

                        <div 
                            className="ls-phone-bg" 
                            style={{ backgroundImage: `url(${currentBackgroundImage})` }}
                        ></div>
                        
                        <div className="ls-phone-header">
                            <button className="ls-back-btn" onClick={handleBackClick}>
                                <FaChevronLeft />
                            </button>
                            <img src={activeStory.poster} className="ls-top-avatar" alt="Character" />
                            <div className="ls-top-info">
                                <h2 className="ls-top-name">{activeStory.title}</h2>
                                <p className="ls-top-status">Online</p>
                            </div>
                            {activeStory?.story_movie && (
                                <button 
                                    onClick={() => setShowMovie(true)} 
                                    style={{background:'transparent', border:'none', color:'#fff', cursor:'pointer'}}
                                    title="Watch Recap"
                                >
                                    <FaFilm size={20} />
                                </button>
                            )}
                            <IoMdMore size={24} style={{cursor: 'pointer'}} />
                        </div>

                        <div className="ls-chat-area" id="ls-chat-area-scroll" ref={chatAreaRef}>
                            {chatLoading ? (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 14, flex: 1, padding: '20px 0' }}>
                                    <div className="ls-msg-wrap received">
                                        <div className="ls-bubble" style={{width: 150, height: 44, background: '#1e1e1e', color: 'transparent', animation: 'ls-pulse 1.5s infinite ease-in-out'}}></div>
                                    </div>
                                    <div className="ls-msg-wrap sent">
                                        <div className="ls-bubble" style={{width: 220, height: 44, background: '#b862ff33', border: '1px solid #b862ff66', color: 'transparent', animation: 'ls-pulse 1.5s infinite ease-in-out'}}></div>
                                    </div>
                                    <div className="ls-msg-wrap received">
                                        <div className="ls-bubble" style={{width: '70%', height: 60, background: '#1e1e1e', color: 'transparent', animation: 'ls-pulse 1.5s infinite ease-in-out'}}></div>
                                    </div>
                                    <div className="ls-msg-wrap sent">
                                        <div className="ls-bubble" style={{width: 100, height: 44, background: '#b862ff33', border: '1px solid #b862ff66', color: 'transparent', animation: 'ls-pulse 1.5s infinite ease-in-out'}}></div>
                                    </div>
                                </div>
                            ) : messages.length === 0 ? (
                                <div style={{textAlign: 'center', padding: '10px 0', fontSize: '12px', color: '#aaa', marginTop: 'auto'}}>
                                    Say hello to start the story. Use the chatbox below to send your message!
                                </div>
                            ) : null}
                            {messages.map((msg, idx) => {
                                const msgDate = msg.time ? new Date(msg.time).toLocaleDateString() : "";
                                const prevMsg = idx > 0 ? messages[idx - 1] : null;
                                const prevDate = prevMsg?.time ? new Date(prevMsg.time).toLocaleDateString() : "";
                                const showDateLabel = msgDate && msgDate !== prevDate;
                                return (
                                    <Fragment key={idx}>
                                        {showDateLabel && getDateLabel(msg.time) && (
                                            <div className="ls-date-separator">{getDateLabel(msg.time)}</div>
                                        )}
                                        <div className={`ls-msg-wrap ${msg.type}`}>
                                            <div className="ls-bubble">{msg.text}</div>
                                        </div>
                                    </Fragment>
                                );
                            })}
                            
                            {isTyping && (
                                <div className="ls-msg-wrap received">
                                    <div className="ls-typing-indicator">
                                        <div className="ls-dot"></div>
                                        <div className="ls-dot"></div>
                                        <div className="ls-dot"></div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="ls-input-area">
                            {!isSubscribed && typeof remainingQuota === 'number' && remainingQuota >= 0 && (
                                <div style={{ position: 'absolute', top: -26, left: 22, fontSize: 11, color: '#ccc' }}>
                                    Daily free messages left: {remainingQuota}
                                </div>
                            )}
                            {isSubscribed && (
                                <div style={{ position: 'absolute', top: -26, left: 22, fontSize: 11, color: '#ccc' }}>
                                    Unlimited messages (Active subscription)
                                </div>
                            )}

                            {quotaExhausted && !isSubscribed && (
                                <div style={{ 
                                    position: 'absolute', 
                                    top: -60, 
                                    left: '50%', 
                                    transform: 'translateX(-50%)', 
                                    background: 'rgba(0,0,0,0.7)', 
                                    borderRadius: 20, 
                                    padding: '8px 16px', 
                                    fontSize: 12, 
                                    color: '#fff',
                                    border: '1px solid rgba(255,255,255,0.2)',
                                    backdropFilter: 'blur(10px)'
                                }}>
                                    आज के आपके 5 free messages ख़त्म हो चुके हैं। आगे story जारी रखने के लिए subscribe करें।
                                </div>
                            )}
                            {!chatLoading && messages.length === 0 && storyProgressIndex < dummyChatSequence.length && !isTyping && (
                                <button className="ls-progress-story-btn" onClick={handleProgressStory}>
                                    Tap to progress
                                </button>
                            )}
                            <input 
                                type="text" 
                                className="ls-input-box" 
                                placeholder={quotaExhausted && !isSubscribed ? "Free limit over – subscribe to continue" : "Message..."} 
                                value={myInput}
                                onChange={(e) => setMyInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleManualSend(e)}
                                disabled={quotaExhausted && !isSubscribed}
                            />
                            <button 
                                className="ls-send-btn" 
                                onClick={handleManualSend} 
                                disabled={!myInput.trim() || (quotaExhausted && !isSubscribed)}
                            >
                                <FaPaperPlane />
                            </button>
                            {sendError && (
                                <div
                                    style={{
                                        position: 'absolute',
                                        bottom: '100%',
                                        left: 20,
                                        right: 20,
                                        marginBottom: 8,
                                        fontSize: 12,
                                        color: '#fff',
                                        background: 'rgba(0,0,0,0.8)',
                                        borderRadius: 12,
                                        padding: '8px 12px',
                                        border: '1px solid rgba(255,255,255,0.15)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 8
                                    }}
                                >
                                    <span>{sendError}</span>
                                    {showLoginCTA && (
                                        <button
                                            onClick={() => router.push('/login')}
                                            style={{
                                                background: '#b862ff',
                                                color: '#fff',
                                                border: 'none',
                                                borderRadius: 999,
                                                padding: '4px 10px',
                                                fontSize: 11,
                                                cursor: 'pointer',
                                                whiteSpace: 'nowrap'
                                            }}
                                        >
                                            Login / लॉगिन करें
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="ls-main-empty">
                        <FaBookOpen size={48} style={{color: '#333', marginBottom: '20px'}} />
                        <h2>Select a story from the list</h2>
                        <p>Dive into interactive live chatting stories.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function LiveStoryPage() {
    return (
        <Suspense fallback={<AdvancedLoader />}>
            <LiveStoryContent />
        </Suspense>
    );
}
