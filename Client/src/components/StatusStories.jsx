import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom'; // Import Portal
import axios from 'axios';
import { X, MessageCircle, BookOpen } from 'lucide-react';
import api from '../config/api'; 
import './StatusStories.css';

const StatusStories = ({ onChatStart }) => {
  const [statusData, setStatusData] = useState([]);
  
  // Viewer State
  const [selectedCharIndex, setSelectedCharIndex] = useState(null);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewedStatuses, setViewedStatuses] = useState([]);

  // Timer Ref
  const timerRef = useRef(null);

  // --- Fetch Data ---
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const res = await axios.get(`${api.Url}/status/get-story`);
        if (res.data && res.data.success) {
          setStatusData(res.data.data);
        }
      } catch (error) {
        console.error("Failed to load stories", error);
      }
    };

    const savedViewed = localStorage.getItem('viewedStories');
    if (savedViewed) {
      setViewedStatuses(JSON.parse(savedViewed));
    }
    fetchStories();
  }, []);

  // --- Scroll Lock Fix ---
  // This prevents the background page from moving/glitching when story is open
  useEffect(() => {
    if (isViewerOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed'; // Locks mobile scroll completely
      document.body.style.width = '100%';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.position = 'unset';
      document.body.style.width = 'unset';
    };
  }, [isViewerOpen]);

  // --- Helper: Mark as Viewed ---
  const markAsViewed = (characterId) => {
    if (!viewedStatuses.includes(characterId)) {
      const newViewed = [...viewedStatuses, characterId];
      setViewedStatuses(newViewed);
      localStorage.setItem('viewedStories', JSON.stringify(newViewed));
    }
  };

  const getAvatar = (character, stories) => {
    if (character.characterAvatar) return character.characterAvatar;
    if (!stories || stories.length === 0) return "/default-avatar.png";
    const first = stories[0];
    if (first.imageAlbum && first.imageAlbum.length > 0) return first.imageAlbum[0];
    return first.backgroundImage || "/default-avatar.png";
  };

  // --- Navigation Logic ---
  const handleNext = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const currentChar = statusData[selectedCharIndex];
    
    // 1. Next Story in SAME User
    if (currentStoryIndex < currentChar.stories.length - 1) {
      setCurrentStoryIndex(prev => prev + 1);
    } 
    // 2. Next USER
    else if (selectedCharIndex < statusData.length - 1) {
      const nextCharIndex = selectedCharIndex + 1;
      setSelectedCharIndex(nextCharIndex);
      setCurrentStoryIndex(0);
      markAsViewed(statusData[nextCharIndex].characterId);
    } 
    // 3. Close Viewer
    else {
      closeViewer();
    }
  };

  const handlePrev = () => {
    if (timerRef.current) clearTimeout(timerRef.current);

    // 1. Prev Story in SAME User
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(prev => prev - 1);
    } 
    // 2. Prev USER
    else if (selectedCharIndex > 0) {
      const prevCharIndex = selectedCharIndex - 1;
      setSelectedCharIndex(prevCharIndex);
      setCurrentStoryIndex(statusData[prevCharIndex].stories.length - 1);
    }
  };

  const openViewer = (index) => {
    setSelectedCharIndex(index);
    setCurrentStoryIndex(0);
    setIsViewerOpen(true);
    markAsViewed(statusData[index].characterId);
  };

  const closeViewer = () => {
    setIsViewerOpen(false);
    setSelectedCharIndex(null);
    setCurrentStoryIndex(0);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  const handleProfileClick = (e, characterId) => {
    e.stopPropagation();
    closeViewer();
    if(onChatStart) onChatStart(characterId);
  };

  useEffect(() => {
    if (!isViewerOpen) return;
    timerRef.current = setTimeout(() => { handleNext(); }, 10000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [currentStoryIndex, selectedCharIndex, isViewerOpen]);

  const activeChar = selectedCharIndex !== null ? statusData[selectedCharIndex] : null;
  const activeStory = activeChar ? activeChar.stories[currentStoryIndex] : null;

  const displayImage = activeStory 
    ? (activeStory.imageAlbum && activeStory.imageAlbum.length > 0 
        ? activeStory.imageAlbum[0] 
        : activeStory.backgroundImage)
    : '';

  // --- RENDER CONTENT ---
  return (
    <>
      {/* 1. The Horizontal Bar (Stays inside the app layout) */}
      <div className="status-bar-container-3stus37">
        {statusData.map((item, idx) => {
          const isViewed = viewedStatuses.includes(item.characterId);
          return (
            <div 
              key={item.characterId || idx} 
              className={`status-item-wrapper-3stus37 ${isViewed ? 'viewed-item-3stus37' : ''}`}
              onClick={() => openViewer(idx)}
            >
              <div className={`status-ring-3stus37 ${isViewed ? 'viewed-3stus37' : ''}`}>
                <img 
                  src={getAvatar(item, item.stories)} 
                  alt={item.characterName} 
                  className="status-avatar-img-3stus37" 
                />
              </div>
              <span className="status-username-3stus37">{item.characterName}</span>
            </div>
          );
        })}
      </div>

      {/* 2. The Full Screen Viewer (PORTALED to Body) */}
      {isViewerOpen && activeChar && activeStory && createPortal(
        <div className="story-modal-overlay-3stus37" onClick={closeViewer}>
          <div className="story-content-wrapper-3stus37" onClick={e => e.stopPropagation()}>
            
            {/* Progress Bars */}
            <div className="progress-bar-container-3stus37">
              {activeChar.stories.map((_, idx) => (
                <div key={idx} className="progress-segment-3stus37">
                  <div 
                    className={`progress-fill-3stus37 
                      ${idx === currentStoryIndex ? 'active-3stus37' : ''} 
                      ${idx < currentStoryIndex ? 'completed-3stus37' : ''}
                    `}
                    key={`${selectedCharIndex}-${currentStoryIndex}-${idx}`} 
                  ></div>
                </div>
              ))}
            </div>

            {/* Header */}
            <div className="story-header-3stus37">
              <img 
                src={getAvatar(activeChar, activeChar.stories)} 
                className="header-avatar-3stus37" 
                alt="Avatar"
                onClick={(e) => handleProfileClick(e, activeChar.characterId)}
                style={{ cursor: 'pointer' }}
              />
              <div 
                className="header-info-3stus37"
                onClick={(e) => handleProfileClick(e, activeChar.characterId)}
                style={{ cursor: 'pointer' }}
              >
                <h4 className="header-name-3stus37">{activeChar.characterName}</h4>
                <span className="header-time-3stus37">
                  {new Date(activeStory.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </span>
              </div>
              <button className="close-btn-3stus37" onClick={closeViewer}>
                <X size={24} color="white" />
              </button>
            </div>

            {/* Main Image */}
            <div className="story-image-container-3stus37">
              <img src={displayImage} className="main-story-image-3stus37" alt="Story" />
            </div>

            {/* Navigation Taps */}
            <div className="nav-left-3stus37" onClick={handlePrev}></div>
            <div className="nav-right-3stus37" onClick={handleNext}></div>

            {/* Bottom Overlay */}
            <div className="story-bottom-overlay-3stus37">
              {/* Hashtags */}
              {activeStory.tags && activeStory.tags.length > 0 && (
                <div className="tags-container-3stus37">
                  {activeStory.tags.map((tag, i) => (
                    <span key={i} className="hashtag-pill-3stus37">
                      #{tag.replace(/\s+/g, '')}
                    </span>
                  ))}
                </div>
              )}

              {/* Action Buttons */}
              <div className="btn-group-3stus37">
                <button 
                  className="action-btn-3stus37 btn-chat-3stus37"
                  onClick={(e) => handleProfileClick(e, activeChar.characterId)}
                >
                  <MessageCircle size={18} />
                  Chat
                </button>

                <a 
                  href={`/hot-stories/${activeStory.slug}`} 
                  className="action-btn-3stus37 btn-read-3stus37"
                >
                  <BookOpen size={18} />
                  Full Story
                </a>
              </div>
            </div>

          </div>
        </div>,
        document.body // This renders the modal outside your app layout
      )}
    </>
  );
};

export default StatusStories;