'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import './90s-era.css';
import apiConfig from '../../config/api';
import PopNoti from '../../components/PopNoti';
import { useRouter } from 'next/navigation';
export default function NinetySEraPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('friends');
  const [selectedFriend, setSelectedFriend] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [letterContent, setLetterContent] = useState('');
  const [receivedLetters, setReceivedLetters] = useState([]);
  const [aiFriends, setAiFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(true);
  const [loadingLetters, setLoadingLetters] = useState(false);
  const [selectedLetterImage, setSelectedLetterImage] = useState(null);

  // NEW: State for grouped letters by AI friend
  const [lettersByAI, setLettersByAI] = useState([]);
  const [totalLetters, setTotalLetters] = useState(0);

  // Notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'info'
  });

  // Filter friends by gender
  const [genderFilter, setGenderFilter] = useState('female');

  // Show notification
  const showNotification = (message, type = 'info') => {
    setNotification({
      isVisible: true,
      message,
      type
    });
  };

  // Close notification
  const closeNotification = () => {
    setNotification(prev => ({ ...prev, isVisible: false }));
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  };

  // API headers with Bearer token
  const getHeaders = () => {
    const token = getAuthToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  };

  // Custom fetch function using your API URL
  const apiFetch = async (endpoint, options = {}) => {
    const url = `${apiConfig.Url}${endpoint}`;
    const config = {
      method: options.method || 'GET',
      headers: getHeaders(),
      ...options
    };

    // Add body for POST requests
    if (options.body) {
      config.body = options.body;
    }

    try {
      const response = await fetch(url, config);
      const data = await response.json();
      return { data, status: response.status };
    } catch (error) {
      throw error;
    }
  };

  // Fetch AI Friends from API
  const fetchAIFriends = async () => {
    try {
      setLoadingFriends(true);
      const { data, status } = await apiFetch('/letters/ai-friends/90s-era');

      if (data.success && data.aiFriends) {
        // Transform API data to match frontend structure
        const transformedFriends = data.aiFriends.map(friend => ({
          id: friend.id || friend._id,
          name: friend.name || friend.fullName || 'Unknown',
          age: friend.age,
          gender: friend.gender,
          city: friend.city || 'Unknown City',
          personality: friend.settings?.persona || friend.personality_traits?.[0] || 'Friendly',
          description: friend.description,
          interests: friend.interests || [],
          favoriteThings: {
            movie: friend.favorite_topics?.[0] || 'Classic Bollywood',
            song: '90s Hits',
            food: 'Indian Food',
            memory: '90s Memories'
          },
          writingStyle: friend.writing_style || friend.handwriting_style?.signature_style || 'Friendly and conversational',
          avatar: friend.avatar_img || friend.avatar || '',
          initialMessage: friend.initial_message || friend.initialMessage || '',
          // Include complete AI friend data for reference
          fullData: friend
        }));
        
        setAiFriends(transformedFriends);
      } else {
        showNotification(data.message || 'Failed to load friends', 'error');
        // Fallback to sample data
        setAiFriends(getSampleAIFriends());
      }
    } catch (error) {
      console.error('Error fetching AI friends:', error);
      showNotification('Network error. Using sample friends.', 'warning');
      setAiFriends(getSampleAIFriends());
    } finally {
      setLoadingFriends(false);
    }
  };

  // NEW: Fetch received letters with the updated API structure
  const fetchReceivedLetters = async () => {
    try {
      setLoadingLetters(true);
      const { data, status } = await apiFetch('/letters/received');

      if (data.success && data.aiFriends) {
        // NEW: Directly use the API response structure
        setLettersByAI(data.aiFriends);
        setTotalLetters(data.totalLetters);
        
        // Also create a flat array of all letters for backward compatibility
        const allLetters = data.aiFriends.flatMap(aiFriendData => 
          aiFriendData.letters.map(letter => ({
            ...letter,
            aiFriendInfo: aiFriendData.aiFriend,
            aiFriendName: aiFriendData.aiFriend.name,
            aiFriendAvatar: aiFriendData.aiFriend.avatar_img,
            aiFriendPersonality: aiFriendData.aiFriend.settings?.persona,
            aiFriendCity: aiFriendData.aiFriend.city,
            letterCount: aiFriendData.letterCount,
            lastLetter: aiFriendData.lastLetter
          }))
        );
        
        setReceivedLetters(allLetters);
      }
    } catch (error) {
      console.error('Error fetching letters:', error);
      showNotification('Could not load your letters', 'warning');
      setLettersByAI([]);
      setReceivedLetters([]);
      setTotalLetters(0);
    } finally {
      setLoadingLetters(false);
    }
  };

  // Separate AI letters from user letters (for backward compatibility)
  const aiLetters = receivedLetters.filter(letter => letter.senderType === 'ai');
  const userLetters = receivedLetters.filter(letter => letter.senderType === 'user');

  // Send letter to AI friend
  const handleSendLetter = async () => {
    if (!letterContent.trim()) {
      showNotification('Please write something in your letter!', 'warning');
      return;
    }

    if (!selectedFriend) {
      showNotification('Please select a friend to write to!', 'warning');
      return;
    }

    setIsLoading(true);

    try {
      const letterData = {
        ai_friend_id: selectedFriend.id,
        letter_data: letterContent,
      };

      const { data, status } = await apiFetch('/letters/send', {
        method: 'POST',
        body: JSON.stringify(letterData)
      });

      if (data.success) {
        showNotification('📮 Letter sent successfully! Your AI friend will reply soon.', 'success');
        setLetterContent('');
        setSelectedFriend(null);
        setActiveTab('postbox');
                setTimeout(() => {
          fetchReceivedLetters();
        }, 1000);
      }
      else if (data.msg === 'Please login to continue') {
        showNotification(data.msg, 'error');
        setTimeout(() => {
          router.push('/login');
        }, 500);
      }
      else {
        showNotification(data.msg || 'Failed to send letter', 'error');
      }
    } catch (error) {
      console.error('Error sending letter:', error);
      showNotification('Network error. Please try again.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Start new letter to a friend
  const startNewLetter = (friend) => {
    setSelectedFriend(friend);
    setActiveTab('write');
    setLetterContent(`Dear ${friend.name},${friend.city} \n\nI hope this letter finds you well...\n\n`);
  };

  // View AI letter image in full screen
  const viewLetterImage = (letter) => {
    if (letter.senderType === 'ai' && letter.imageUrl && letter.imageUrl !== 'no-image') {
      setSelectedLetterImage(letter.imageUrl);
    }
  };

  // Close full screen image
  const closeFullScreenImage = () => {
    setSelectedLetterImage(null);
  };

  // Download AI letter image
  const downloadLetterImage = (letter, e) => {
    e.stopPropagation();
    if (letter.imageUrl && letter.imageUrl !== 'no-image') {
      const link = document.createElement('a');
      link.href = letter.imageUrl;
      link.download = `letter-from-${letter.aiFriendName}-${new Date(letter.createdAt).toISOString().split('T')[0]}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showNotification('📥 Letter image downloaded!', 'success');
    }
  };

  // Format date in Indian style
  const formatIndianDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Get letter background style based on metadata
  const getLetterBackground = (letter) => {
    const background = letter.metadata?.background || 'default';
    return `letter-${background}`;
  };

  // Initialize data on component mount
  useEffect(() => {
    fetchAIFriends();
  }, []);

  // Refresh letters when postbox tab is active
  useEffect(() => {
    if (activeTab === 'postbox') {
      fetchReceivedLetters();
    }
  }, [activeTab]);

  // Sample data fallbacks
  const getSampleAIFriends = () => [
    {
      id: 1,
      name: "Meera",
      age: "Young",
      gender: "female",
      city: "Mumbai",
      personality: "Corporate Queen",
      description: "She's sharp, independent, and dominates the corporate world.",
      interests: ["tech", "gaming", "cinema"],
      favoriteThings: {
        movie: "Business Thrillers",
        song: "Powerful Beats",
        food: "Executive Lunches",
        memory: "Closing big deals"
      },
      writingStyle: "Professional and direct",
      avatar: "/models_images_female/exixting/3.jpg",
      initialMessage: "If you're here to waste my time, I suggest you rethink your approach."
    },
    {
      id: 2,
      name: "Rahul",
      age: "25",
      gender: "male",
      city: "Delhi",
      personality: "Romantic Poet",
      description: "A dreamer who finds beauty in everyday moments and expresses through poetry.",
      interests: ["poetry", "music", "art"],
      favoriteThings: {
        movie: "Romantic Classics",
        song: "Ghazals",
        food: "Street Food",
        memory: "Monsoon evenings"
      },
      writingStyle: "Poetic and emotional",
      avatar: "",
      initialMessage: "Every letter is a piece of my heart, written just for you."
    }
  ];

  const filteredFriends = aiFriends.filter(friend => friend.gender === genderFilter);

  return (
    <div className="nineties-page">
      {/* Notification Component */}
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={closeNotification}
        duration={5000}
      />

      {/* Full Screen Image Modal */}
      <AnimatePresence>
        {selectedLetterImage && (
          <motion.div
            className="fullscreen-image-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFullScreenImage}
          >
            <motion.div
              className="image-container"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedLetterImage}
                alt="AI Letter"
                width={800}
                height={1000}
                className="fullscreen-letter-image"
                style={{ objectFit: 'contain' }}
              />
              <div className="fullscreen-actions">
                <button 
                  className="download-fullscreen-btn"
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = selectedLetterImage;
                    link.download = `ai-letter-${new Date().toISOString().split('T')[0]}.png`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    showNotification('📥 Letter image downloaded!', 'success');
                  }}
                >
                  ⬇️ Download
                </button>
                <button className="close-fullscreen-btn" onClick={closeFullScreenImage}>
                  ✕
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Retro Indian Background Elements */}
      <div className="retro-bg-pattern"></div>
      <div className="floating-retro-elements">
        <div className="retro-element chai">☕</div>
        <div className="retro-element radio">📻</div>
        <div className="retro-element cricket">🏏</div>
        <div className="retro-element film">🎬</div>
        <div className="retro-element rickshaw">🛺</div>
      </div>

      {/* Header */}
      <motion.header 
        className="nineties-header"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <div className="header-content">
          <Link href="/" className="back-button">
            <span className="back-arrow">←</span>
            Wapas Ghar
          </Link>
          <div className="header-title">
            <h1>90's Letter Duniya</h1>
            <p>Jab letters se banti thi dosti... ❤️</p>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="nineties-main">
        <div className="container">
          {/* Hero Section */}
          <motion.section 
            className="era-hero"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
          >
            <div className="hero-content">
              <div className="hero-text">
                <motion.div 
                  className="retro-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.5 }}
                >
                  ✨ Yaadon Ka Safar
                </motion.div>
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.6 }}
                >
                  Woh <span className="gradient-text">Zamaana</span> Wapas Lao
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7 }}
                >
                  Jab chithi likhne ka maza alag tha, intezaar ka sawaal tha, 
                  aur har jawab dil ko chu jata tha.
                </motion.p>
              </div>
              <motion.div 
                className="hero-visual"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                <div className="animated-indian-letter">
                  <div className="letter-paper">
                    <div className="letter-header">
                      <div className="letter-date">{new Date().toLocaleDateString('hi-IN')}</div>
                    </div>
                    <div className="letter-content">
                      <div className="handwritten-text">Pyaare Dost...</div>
                      <div className="ink-blot"></div>
                    </div>
                    <div className="letter-footer">
                      <div className="signature">Tumhara dost</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.section>

          {/* Main Interaction Section */}
          <section className="interaction-section">
            <motion.div 
              className="tab-navigation"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
            >
              <button 
                className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
                onClick={() => setActiveTab('friends')}
              >
                👥 Mere Dost ({aiFriends.length})
              </button>
              <button 
                className={`tab-btn ${activeTab === 'write' ? 'active' : ''}`}
                onClick={() => {
                  if (!selectedFriend) {
                    showNotification('Please select a friend first!', 'warning');
                    return;
                  }
                  setActiveTab('write');
                }}
                disabled={!selectedFriend}
              >
                ✍️ Chithi Likho
              </button>
              <button 
                className={`tab-btn ${activeTab === 'postbox' ? 'active' : ''}`}
                onClick={() => setActiveTab('postbox')}
              >
                📮 Mera Daak Ghar ({totalLetters})
              </button>
            </motion.div>

            <div className="tab-content">
              <AnimatePresence mode="wait">
                {/* Friends Tab */}
                {activeTab === 'friends' && (
                  <motion.div
                    key="friends"
                    className="friends-tab"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="gender-filter">
                      <label>Dost Dhundho:</label>
                      <div className="filter-buttons">
                        <button 
                          className={`filter-btn ${genderFilter === 'female' ? 'active' : ''}`}
                          onClick={() => setGenderFilter('female')}
                        >
                          👩 Female Dost ({aiFriends.filter(f => f.gender === 'female').length})
                        </button>
                        <button 
                          className={`filter-btn ${genderFilter === 'male' ? 'active' : ''}`}
                          onClick={() => setGenderFilter('male')}
                        >
                          👨 Male Dost ({aiFriends.filter(f => f.gender === 'male').length})
                        </button>
                      </div>
                    </div>

                    {loadingFriends ? (
                      <div className="loading-state">
                        <div className="loading-spinner-large"></div>
                        <p>Loading your 90s friends...</p>
                      </div>
                    ) : filteredFriends.length === 0 ? (
                      <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>No {genderFilter} friends found</h3>
                        <p>Try switching to the other gender filter</p>
                      </div>
                    ) : (
                      <div className="ai-friends-grid">
                        {filteredFriends.map(friend => (
                          <motion.div
                            key={friend.id}
                            className="friend-card"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <div className="friend-header">
                              <div className="friend-avatar">
                                <div className="avatar-placeholder">
                                  {friend.avatar ? (
                                    <Image 
                                      src={friend.avatar} 
                                      alt={friend.name}
                                      width={80}
                                      height={80}
                                      className="avatar-image"
                                    />
                                  ) : (
                                    <span className="avatar-emoji">
                                      {friend.gender === 'female' ? '👩' : '👨'}
                                    </span>
                                  )}
                                </div>
                                <div className="online-indicator"></div>
                              </div>
                              <div className="friend-basic-info">
                                <h4>{friend.name}</h4>
                                <p className="friend-age-city">{friend.age} • {friend.city}</p>
                                <div className="personality-badge">{friend.personality}</div>
                              </div>
                            </div>
                            
                            <div className="friend-details">
                              <p className="friend-description">{friend.description}</p>
                              
                              {friend.interests && friend.interests.length > 0 && (
                                <div className="interests-section">
                                  <h5>Unki Pasand:</h5>
                                  <div className="interests-list">
                                    {friend.interests.map((interest, index) => (
                                      <span key={index} className="interest-tag">{interest}</span>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>

                            <button 
                              className="start-chat-btn"
                              onClick={() => startNewLetter(friend)}
                            >
                              📝 {friend.name} Ko Chithi Likho
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                )}

                {/* Write Letter Tab */}
                {activeTab === 'write' && selectedFriend && (
                  <motion.div
                    key="write"
                    className="write-tab"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="letter-composer">
                      <div className="composer-header">
                        <div className="recipient-info">
                          <h3>Chithi Likho</h3>
                          <p className="recipient-hint">
                            {selectedFriend.interests && selectedFriend.interests.length > 0 
                              ? `${selectedFriend.name} ko ${selectedFriend.interests[0]} pasand hai. Is bare mein baat karo!`
                              : `${selectedFriend.name} ke saat apni feelings share karo!`
                            }
                          </p>
                        </div>
                      </div>
                      
                      <div className="letter-paper-composer">
                        <textarea 
                          className="letter-textarea"
                          value={letterContent}
                          onChange={(e) => setLetterContent(e.target.value)}
                          placeholder={`Pyaari ${selectedFriend.name}...\n\nMain aaj tumhe chithi likh raha hoon kyunki...`}
                          rows={12}
                        />
                      </div>

                      <div className="composer-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => {
                            setSelectedFriend(null);
                            setLetterContent('');
                            setActiveTab('friends');
                          }}
                        >
                          ← Wapas Jake
                        </button>
                        <button 
                          className="btn-primary"
                          onClick={handleSendLetter}
                          disabled={isLoading || !letterContent.trim()}
                        >
                          {isLoading ? (
                            <>
                              <div className="loading-spinner"></div>
                              Bhej raha hoon...
                            </>
                          ) : (
                            '📮 Daak Mein Daal Do'
                          )}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Postbox Tab - UPDATED FOR NEW API STRUCTURE */}
                {activeTab === 'postbox' && (
                  <motion.div
                    key="postbox"
                    className="postbox-tab dark-theme"
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                  >
                    {loadingLetters ? (
                      <div className="loading-state">
                        <div className="loading-spinner-large"></div>
                        <p>Checking your daak ghar...</p>
                      </div>
                    ) : lettersByAI.length > 0 ? (
                      <div className="optimized-letters-collection">
                        {/* Display letters grouped by AI friend */}
                        {lettersByAI.map((aiFriendData, index) => (
                          <div key={aiFriendData.aiFriend.id} className="ai-friend-letters-section">
                            <div className="section-header">
                              <div className="ai-friend-header">
                                <div className="ai-friend-avatar">
                                  {aiFriendData.aiFriend.avatar_img ? (
                                    <Image 
                                      src={aiFriendData.aiFriend.avatar_img} 
                                      alt={aiFriendData.aiFriend.name}
                                      width={60}
                                      height={60}
                                      className="ai-friend-avatar-image"
                                    />
                                  ) : (
                                    <span className="ai-friend-avatar-emoji">
                                      {aiFriendData.aiFriend.gender === 'female' ? '👩' : '👨'}
                                    </span>
                                  )}
                                </div>
                                <div className="ai-friend-info">
                                  <h3 className="ai-friend-name">
                                    {aiFriendData.aiFriend.name}
                                  </h3>
                                  <p className="ai-friend-details">
                                    {aiFriendData.aiFriend.age} • {aiFriendData.aiFriend.city} • {aiFriendData.aiFriend.settings?.persona}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* User Sent Letters for this AI friend */}
                            <div className="user-letters-mini">
                              {aiFriendData.letters.filter(letter => letter.senderType === 'user').map((letter, letterIndex) => (
                                <div key={letter.letterId || letter._id} className="user-letter-mini">
                                  <span className="mini-icon">📤</span>
                                  <span className="mini-date">{formatIndianDate(letter.createdAt)}</span>
                                  <span className="mini-status">Delivered ✓</span>
                                </div>
                              ))}
                            </div>

                            {/* AI Letters for this friend */}
                            <div className="optimized-a4-letters-grid">
                              {aiFriendData.letters.filter(letter => letter.senderType === 'ai').map((letter, letterIndex) => (
                                <motion.div
                                  key={letter.letterId || letter._id}
                                  className={`optimized-a4-letter-card ${getLetterBackground(letter)}`}
                                  initial={{ opacity: 0, y: 20 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  transition={{ duration: 0.4, delay: letterIndex * 0.1 }}
                                  whileHover={{ 
                                    scale: 1.02,
                                    rotateZ: -1
                                  }}
                                  onClick={() => viewLetterImage(letter)}
                                >
                                  {/* Envelope Effect */}
                                  <div className="optimized-envelope">
                                    <div className="optimized-envelope-flap"></div>
                                  </div>

                                  {/* Letter Content */}
                                  <div className="optimized-letter-content">
                                    {/* Header */}
                                    <div className="optimized-letter-header">
                                      <div className="optimized-sender-info">
                                        <h4 className="optimized-sender-name">
                                          {aiFriendData.aiFriend.name}
                                        </h4>
                                        <span className="optimized-sender-city">
                                          📍 {aiFriendData.aiFriend.city}
                                        </span>
                                        <span className="optimized-letter-date">
                                          {formatIndianDate(letter.createdAt)}
                                        </span>
                                      </div>
                                      <div className="optimized-letter-badge">
                                        📨 Received
                                      </div>
                                    </div>

                                    {/* Body */}
                                    <div className="optimized-letter-body">
                                      {letter.imageUrl && letter.imageUrl !== 'no-image' ? (
                                        <div className="optimized-letter-image">
                                          <Image
                                            src={letter.imageUrl}
                                            alt={`Letter from ${aiFriendData.aiFriend.name}`}
                                            width={200}
                                            height={140}
                                            className="optimized-image-preview"
                                            style={{ objectFit: 'cover' }}
                                          />
                                          <div className="optimized-image-overlay">
                                            <span className="optimized-view-text">View Full Letter</span>
                                            <span className="optimized-click-hint">Click to open</span>
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="optimized-text-preview">
                                          <p className="optimized-preview-text">
                                            {letter.content 
                                              ? `"${letter.content.substring(0, 120)}..."`
                                              : 'No content available...'
                                            }
                                          </p>
                                        </div>
                                      )}
                                    </div>

                                    {/* Footer with Download Button */}
                                    <div className="optimized-letter-footer">
                                      <div className="optimized-actions">
                                        <button 
                                          className="optimized-download-btn"
                                          onClick={(e) => downloadLetterImage(letter, e)}
                                          title="Download Letter Image"
                                        >
                                          ⬇️
                                        </button>
                                        <button 
                                          className="optimized-view-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            viewLetterImage(letter);
                                          }}
                                        >
                                          👁️ View
                                        </button>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Decorative Elements */}
                                  <div className="optimized-letter-decoration">
                                    <div className="optimized-corner top-left"></div>
                                    <div className="optimized-corner top-right"></div>
                                    <div className="optimized-corner bottom-left"></div>
                                    <div className="optimized-corner bottom-right"></div>
                                  </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="postbox-empty optimized-empty">
                        <div className="optimized-empty-design">
                          <div className="optimized-empty-envelope">
                            <div className="optimized-empty-flap"></div>
                            <div className="optimized-empty-body">📮</div>
                          </div>
                        </div>
                        <h3>Daak Ghar Abhi Khali Hai</h3>
                        <p>Apne AI dost ko chithi likhkar shuruwaat karo!</p>
                        <button 
                          className="btn-primary"
                          onClick={() => setActiveTab('friends')}
                        >
                          👥 Apna Dost Chuno
                        </button>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}