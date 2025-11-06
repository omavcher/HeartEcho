'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import './90s-era.css';
import apiConfig from '../../config/api';
import PopNoti from '../../components/PopNoti';
import { useRouter } from 'next/navigation';
import Footer from '../../components/Footer';

import Head from 'next/head';


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

  // Structured Data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "90s Letter Duniya - HeartEcho",
    "description": "Digital platform recreating the 90s Indian letter writing experience with AI friends",
    "url": "https://heartecho.app/90s-era",
    "applicationCategory": "CommunicationApplication",
    "operatingSystem": "Any",
    "permissions": "microphone",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "INR"
    },
    "author": {
      "@type": "Organization",
      "name": "HeartEcho",
      "url": "https://heartecho.app"
    }
  };

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
  const getSampleAIFriends = () => [];

  const filteredFriends = aiFriends.filter(friend => friend.gender === genderFilter);

  return (
    <>
      {/* SEO Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      
      {/* SEO Meta Tags */}
      <Head>
        <title>90s Letter Duniya - Retro Indian Letter Writing Platform | HeartEcho</title>
        <meta name="description" content="Experience the nostalgia of 90s Indian letter writing. Connect with AI friends, write heartfelt letters in Hindi/English, and relive the golden era of handwritten communication." />
        <meta name="keywords" content="90s letters, Indian nostalgia, handwritten letters, AI friends, Hindi letters, retro communication, digital letter writing, 90s era India" />
        <meta name="robots" content="index, follow, max-image-preview:large" />
        <meta name="author" content="HeartEcho" />
        
        {/* Open Graph */}
        <meta property="og:title" content="90s Letter Duniya - Retro Indian Letter Writing Platform" />
        <meta property="og:description" content="Experience the nostalgia of 90s Indian letter writing. Connect with AI friends and relive the golden era of handwritten communication." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://heartecho.app/90s-era" />
        <meta property="og:image" content="https://heartecho.app/og-90s-letters.jpg" />
        <meta property="og:locale" content="en_IN" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="90s Letter Duniya - HeartEcho" />
        <meta name="twitter:description" content="Relive 90s Indian nostalgia with digital letter writing to AI friends" />
        <meta name="twitter:image" content="https://heartecho.app/twitter-90s-letters.jpg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href="https://heartecho.app/90s-era" />
        
        {/* Additional SEO Meta */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#8B4513" />
        <meta name="language" content="en" />
        <meta name="revisit-after" content="7 days" />
        
        {/* Schema.org for Local Business */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebApplication",
            "name": "90s Letter Duniya",
            "applicationCategory": "CommunicationApplication",
            "operatingSystem": "Any",
            "description": "Digital platform for 90s style letter writing with AI friends",
            "url": "https://heartecho.app/90s-era",
            "author": {
              "@type": "Organization",
              "name": "HeartEcho"
            }
          })}
        </script>
      </Head>

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
                  alt={`AI Letter from ${selectedFriend?.name || 'AI Friend'}`}
                  width={800}
                  height={1000}
                  className="fullscreen-letter-image"
                  style={{ objectFit: 'contain' }}
                  priority
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
        <div className="retro-bg-pattern" aria-hidden="true"></div>
        <div className="floating-retro-elements" aria-hidden="true">
          <div className="retro-element chai">☕</div>
          <div className="retro-element radio">📻</div>
          <div className="retro-element cricket">🏏</div>
          <div className="retro-element film">🎬</div>
          <div className="retro-element rickshaw">🛺</div>
        </div>

        {/* Header with Semantic HTML */}
        <motion.header 
          className="nineties-header"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="header-content">
            <Link href="/" className="back-button" aria-label="Go back to home">
              <span className="back-arrow">←</span>
              Wapas Ghar
            </Link>
            <div className="header-title">
              <h1>90's Letter Duniya - Relive Indian Nostalgia</h1>
              <p>Experience authentic 90s Indian letter writing with AI friends</p>
            </div>
          </div>
        </motion.header>

        {/* Main Content */}
        <main className="nineties-main">
          <div className="container">
            {/* Hero Section with SEO-rich content */}
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
                    ✨ Authentic 90s Experience
                  </motion.div>
                  <motion.h1
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                  >
                    Welcome to <span className="gradient-text">90s Letter Duniya</span>
                  </motion.h1>
                  <motion.p
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
                  >
                    Rediscover the magic of 90s Indian communication. Write heartfelt letters to AI friends, 
                    experience the joy of waiting for replies, and relive the golden era of handwritten letters 
                    in a modern digital format.
                  </motion.p>
                  
              
                </div>
                <motion.div 
                  className="hero-visual"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                >
                  <div className="animated-indian-letter" role="img" aria-label="Animated 90s style letter">
                    <div className="letter-paper">
                      <div className="letter-header">
                        <div className="letter-date">{new Date().toLocaleDateString('hi-IN')}</div>
                      </div>
                      <div className="letter-content">
                        <div className="handwritten-text">Pyaare Dost...</div>
                        <div className="ink-blot" aria-hidden="true"></div>
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
            <section className="interaction-section" aria-label="Letter writing platform">
              <motion.div 
                className="tab-navigation"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1 }}
                role="tablist"
                aria-label="Letter writing sections"
              >
                <button 
                  className={`tab-btn ${activeTab === 'friends' ? 'active' : ''}`}
                  onClick={() => setActiveTab('friends')}
                  role="tab"
                  aria-selected={activeTab === 'friends'}
                  aria-controls="friends-panel"
                >
                  👥 AI Friends ({aiFriends.length})
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
                  role="tab"
                  aria-selected={activeTab === 'write'}
                  aria-controls="write-panel"
                >
                  ✍️ Write Letter
                </button>
                <button 
                  className={`tab-btn ${activeTab === 'postbox' ? 'active' : ''}`}
                  onClick={() => setActiveTab('postbox')}
                  role="tab"
                  aria-selected={activeTab === 'postbox'}
                  aria-controls="postbox-panel"
                >
                  📮 My Letters ({totalLetters})
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
                      role="tabpanel"
                      id="friends-panel"
                      aria-labelledby="friends-tab"
                    >
                      <div className="gender-filter">
                        <label htmlFor="gender-filter">Filter Friends:</label>
                        <div className="filter-buttons">
                          <button 
                            className={`filter-btn ${genderFilter === 'female' ? 'active' : ''}`}
                            onClick={() => setGenderFilter('female')}
                          >
                            👩 Female Friends ({aiFriends.filter(f => f.gender === 'female').length})
                          </button>
                          <button 
                            className={`filter-btn ${genderFilter === 'male' ? 'active' : ''}`}
                            onClick={() => setGenderFilter('male')}
                          >
                            👨 Male Friends ({aiFriends.filter(f => f.gender === 'male').length})
                          </button>
                        </div>
                      </div>

                      {loadingFriends ? (
                        <div className="loading-state" aria-label="Loading friends">
                          <div className="loading-spinner-large"></div>
                          <p>Loading your 90s AI friends...</p>
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
                            <motion.article
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
                                        alt={`Profile picture of ${friend.name}`}
                                        width={80}
                                        height={80}
                                        className="avatar-image"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <span className="avatar-emoji">
                                        {friend.gender === 'female' ? '👩' : '👨'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="online-indicator" aria-label="Online"></div>
                                </div>
                                <div className="friend-basic-info">
                                  <h3>{friend.name}</h3>
                                  <p className="friend-age-city">{friend.age} • {friend.city}</p>
                                  <div className="personality-badge">{friend.personality}</div>
                                </div>
                              </div>
                              
                              <div className="friend-details">
                                <p className="friend-description">{friend.description}</p>
                                
                                {friend.interests && friend.interests.length > 0 && (
                                  <div className="interests-section">
                                    <h4>Interests:</h4>
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
                                aria-label={`Write letter to ${friend.name}`}
                              >
                                📝 Write to {friend.name}
                              </button>
                            </motion.article>
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
                      role="tabpanel"
                      id="write-panel"
                      aria-labelledby="write-tab"
                    >
                      <div className="letter-composer">
                        <div className="composer-header">
                          <div className="recipient-info">
                            <h2>Write to {selectedFriend.name}</h2>
                            <p className="recipient-hint">
                              {selectedFriend.interests && selectedFriend.interests.length > 0 
                                ? `${selectedFriend.name} likes ${selectedFriend.interests[0]}. Talk about this!`
                                : `Share your feelings with ${selectedFriend.name}!`
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="letter-paper-composer">
                          <textarea 
                            className="letter-textarea"
                            value={letterContent}
                            onChange={(e) => setLetterContent(e.target.value)}
                            placeholder={`Dear ${selectedFriend.name}...\n\nI hope this letter finds you well...`}
                            rows={12}
                            aria-label="Letter content"
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
                            ← Back to Friends
                          </button>
                          <button 
                            className="btn-primary"
                            onClick={handleSendLetter}
                            disabled={isLoading || !letterContent.trim()}
                            aria-label="Send letter"
                          >
                            {isLoading ? (
                              <>
                                <div className="loading-spinner"></div>
                                Sending...
                              </>
                            ) : (
                              '📮 Send Letter'
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
                      role="tabpanel"
                      id="postbox-panel"
                      aria-labelledby="postbox-tab"
                    >
                      {loadingLetters ? (
                        <div className="loading-state" aria-label="Loading letters">
                          <div className="loading-spinner-large"></div>
                          <p>Loading your letters...</p>
                        </div>
                      ) : lettersByAI.length > 0 ? (
                        <div className="optimized-letters-collection">
                          {/* Display letters grouped by AI friend */}
                          {lettersByAI.map((aiFriendData, index) => (
                            <section key={aiFriendData.aiFriend.id} className="ai-friend-letters-section">
                              <div className="section-header">
                                <div className="ai-friend-header">
                                  <div className="ai-friend-avatar">
                                    {aiFriendData.aiFriend.avatar_img ? (
                                      <Image 
                                        src={aiFriendData.aiFriend.avatar_img} 
                                        alt={`Profile of ${aiFriendData.aiFriend.name}`}
                                        width={60}
                                        height={60}
                                        className="ai-friend-avatar-image"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <span className="ai-friend-avatar-emoji">
                                        {aiFriendData.aiFriend.gender === 'female' ? '👩' : '👨'}
                                      </span>
                                    )}
                                  </div>
                                  <div className="ai-friend-info">
                                    <h2 className="ai-friend-name">
                                      {aiFriendData.aiFriend.name}
                                    </h2>
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
                                  <motion.article
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
                                    <div className="optimized-envelope" aria-hidden="true">
                                      <div className="optimized-envelope-flap"></div>
                                    </div>

                                    {/* Letter Content */}
                                    <div className="optimized-letter-content">
                                      {/* Header */}
                                      <div className="optimized-letter-header">
                                        <div className="optimized-sender-info">
                                          <h3 className="optimized-sender-name">
                                            {aiFriendData.aiFriend.name}
                                          </h3>
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
                                              alt={`Handwritten letter from ${aiFriendData.aiFriend.name}`}
                                              width={200}
                                              height={140}
                                              className="optimized-image-preview"
                                              style={{ objectFit: 'cover' }}
                                              loading="lazy"
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
                                            aria-label="Download letter image"
                                          >
                                            ⬇️
                                          </button>
                                          <button 
                                            className="optimized-view-btn"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              viewLetterImage(letter);
                                            }}
                                            aria-label="View full letter"
                                          >
                                            👁️ View
                                          </button>
                                        </div>
                                      </div>
                                    </div>

                                    {/* Decorative Elements */}
                                    <div className="optimized-letter-decoration" aria-hidden="true">
                                      <div className="optimized-corner top-left"></div>
                                      <div className="optimized-corner top-right"></div>
                                      <div className="optimized-corner bottom-left"></div>
                                      <div className="optimized-corner bottom-right"></div>
                                    </div>
                                  </motion.article>
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      ) : (
                        <div className="postbox-empty optimized-empty">
                          <div className="optimized-empty-design" aria-hidden="true">
                            <div className="optimized-empty-envelope">
                              <div className="optimized-empty-flap"></div>
                              <div className="optimized-empty-body">📮</div>
                            </div>
                          </div>
                          <h2>No Letters Yet</h2>
                          <p>Start your 90s letter writing journey by writing to an AI friend!</p>
                          <button 
                            className="btn-primary"
                            onClick={() => setActiveTab('friends')}
                            aria-label="Choose a friend to write to"
                          >
                            👥 Choose a Friend
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

      <Footer/>
      </div>
    </>
  );
}