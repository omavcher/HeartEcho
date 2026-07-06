'use client';

import React, { useState, useEffect, useMemo, useRef } from "react";
import '../styles/Discover.css';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Heart, X, Star, RotateCcw, MessageCircle, MapPin, Briefcase, Info } from "lucide-react";
import axios from "axios";
import api from "../config/api";
import LoginModal from "../components/LoginModel";

// --- SELF-CONTAINED CONFETTI BURST ---
const CanvasConfetti = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canvas = document.getElementById("confetti-canvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ["#cf4185", "#8b5cf6", "#10b981", "#ff85c2", "#ffd700", "#3b82f6"];
    const particles = Array.from({ length: 150 }).map(() => ({
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 0.5) * 16 - 8,
      size: Math.random() * 8 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      decay: Math.random() * 0.015 + 0.008
    }));

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let active = false;

      particles.forEach(p => {
        if (p.alpha > 0) {
          active = true;
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.22; // gravity
          p.alpha -= p.decay;

          ctx.save();
          ctx.globalAlpha = Math.max(p.alpha, 0);
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });

      if (active) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return <canvas id="confetti-canvas" className="confetti-canvas"></canvas>;
};

function Discover() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [dragDirection, setDragDirection] = useState(null); // 'like', 'nope', 'super'
  const [swipedHistory, setSwipedHistory] = useState([]); // skipped cards for rewind
  const [matchData, setMatchData] = useState(null); // stores matched companion details
  const [matchStep, setMatchStep] = useState(0); // timeline steps: 1 to 5

  const router = useRouter();

  // Load profile tokens & subscriptions
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('token');
    if (!token) {
      const timer = setTimeout(() => setShowLoginModal(true), 3000);
      return () => clearTimeout(timer);
    }

    const subscriptionData = localStorage.getItem('subscribed');
    if (subscriptionData) {
      try {
        const parsed = JSON.parse(subscriptionData);
        if (parsed.isSubscribed === true || parsed.userType === 'subscriber') {
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error('Error parsing subscription:', error);
      }
    }

    fetchDeck();
  }, []);

  // Fetch Discoverable Deck
  const fetchDeck = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const response = await axios.get(`${api.Url}/user/discover/cards`, { headers });
      if (response.data?.success) {
        setCards(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching discover deck:", error);
    } finally {
      setLoading(false);
    }
  };

  // Perform Swipe Action
  const swipeCard = async (aiFriendId, action) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setShowLoginModal(true);
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      // Optimistically filter top card
      const swipedCard = cards.find(c => c._id === aiFriendId);
      if (swipedCard && swipedCard.isPremium && !isSubscribed && (action === 'like' || action === 'superlike')) {
        alert("This AI Companion is restricted to premium subscribers.");
        router.push('/subscribe');
        return;
      }
      setCards(prev => prev.filter(c => c._id !== aiFriendId));

      if (action === 'skip') {
        // Save to local history for rewind
        setSwipedHistory(prev => [...prev, swipedCard]);
      }

      const response = await axios.post(
        `${api.Url}/user/discover/swipe`,
        { aiFriendId, action },
        { headers }
      );

      if (response.data?.success && response.data.match) {
        // Trigger Match Sequence overlay steps
        setMatchData(response.data.matchedAI);
        triggerMatchSequence();
      }
    } catch (error) {
      console.error("Error processing swipe:", error);
    }
  };

  // Tinder Match celebration sequence timing
  const triggerMatchSequence = () => {
    setMatchStep(1); // Like sent
    setTimeout(() => setMatchStep(2), 1200); // She liked you too
    setTimeout(() => setMatchStep(3), 2400); // Avatars slide in
    setTimeout(() => setMatchStep(4), 3200); // Confetti bursts
    setTimeout(() => setMatchStep(5), 4000); // Buttons appear
  };

  // Undo Last Skip
  const handleRewind = () => {
    if (swipedHistory.length === 0) return;
    const previous = swipedHistory[swipedHistory.length - 1];
    setCards(prev => [previous, ...prev]);
    setSwipedHistory(prev => prev.slice(0, -1));
  };

  // Recycle Skips manually if cards exhaust
  const handleRecycle = async () => {
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await axios.post(
          `${api.Url}/user/discover/reset`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
    } catch (e) {
      console.error("Reset swipes error:", e);
    }
    await fetchDeck();
    setSwipedHistory([]);
  };

  // Framer Motion Drag Handlers
  const handleDrag = (event, info) => {
    const thresholdX = 80;
    const thresholdY = -60;

    if (info.offset.x > thresholdX) {
      setDragDirection('like');
    } else if (info.offset.x < -thresholdX) {
      setDragDirection('nope');
    } else if (info.offset.y < thresholdY) {
      setDragDirection('super');
    } else {
      setDragDirection(null);
    }
  };

  const handleDragEnd = (event, info, modelId) => {
    setDragDirection(null);
    const swipeX = info.offset.x;
    const swipeY = info.offset.y;

    if (swipeX > 150) {
      swipeCard(modelId, 'like');
    } else if (swipeX < -150) {
      swipeCard(modelId, 'skip');
    } else if (swipeY < -120) {
      swipeCard(modelId, 'superlike');
    }
  };

  return (
    <div className='discover-container'>
      {/* Sticky Header */}
      <header className="discover-header">
        <h1>Discover</h1>
        {!isSubscribed && (
          <Link href='/subscribe' className='premium-gold-btn'>
            <Crown size={15} />
            <span>Go Premium</span>
          </Link>
        )}
      </header>

      {/* Main Discover Swiping Window */}
      <div className="discover-swipe-wrapper">
        {loading ? (
          <div className="discover-skeleton-container">
            <div className="discover-skeleton-card">
              <div className="skeleton-image-placeholder shimmer"></div>
              <div className="skeleton-info-overlay">
                <div className="skeleton-bar title-bar shimmer"></div>
                <div className="skeleton-bar subtitle-bar shimmer"></div>
                <div className="skeleton-tags-row">
                  <div className="skeleton-tag shimmer"></div>
                  <div className="skeleton-tag shimmer"></div>
                  <div className="skeleton-tag shimmer"></div>
                </div>
              </div>
            </div>
            <p className="skeleton-loading-text">Finding new matches...</p>
          </div>
        ) : cards.length > 0 ? (
          <div className="cards-deck-container">
            <AnimatePresence>
              {cards.map((model, idx) => {
                const isTop = idx === 0;

                return (
                  <motion.div
                    key={model._id}
                    className="swipe-card"
                    style={{ zIndex: cards.length - idx }}
                    drag={isTop}
                    dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                    dragElastic={1}
                    onDrag={isTop ? handleDrag : undefined}
                    onDragEnd={isTop ? (e, info) => handleDragEnd(e, info, model._id) : undefined}
                    initial={{ scale: 0.95, opacity: 0.8 }}
                    animate={{ 
                      scale: isTop ? 1 : 0.95, 
                      opacity: isTop ? 1 : 0.8,
                      y: isTop ? 0 : 15 
                    }}
                    exit={{ 
                      x: dragDirection === 'like' ? 400 : dragDirection === 'nope' ? -400 : 0, 
                      y: dragDirection === 'super' ? -400 : 0,
                      opacity: 0,
                      rotate: dragDirection === 'like' ? 20 : dragDirection === 'nope' ? -20 : 0,
                      transition: { duration: 0.3 }
                    }}
                  >
                    {/* Media content */}
                    <div className="card-media-wrapper">
                      <img 
                        src={model.avatar_img || "/default-avatar.png"} 
                        alt={model.name} 
                        className="card-media"
                      />
                    </div>

                    {/* Drag Stamp Overlays */}
                    {isTop && dragDirection === 'like' && <div className="stamp like">Like</div>}
                    {isTop && dragDirection === 'nope' && <div className="stamp nope">Nope</div>}
                    {isTop && dragDirection === 'super' && <div className="stamp super">Super Like</div>}

                    {/* Floating Badges */}
                    <div className="card-floating-badge online-badge">
                      <div className="online-indicator"></div>
                      <span>Online</span>
                    </div>

                    {model.interestMatchCount > 0 && (
                      <div className="card-floating-badge match-stat-badge" style={{ top: "45px" }}>
                        <span>✨ {model.interestMatchCount} Matches</span>
                      </div>
                    )}

                    {model.isPremium && (
                      <div className="card-floating-badge premium-badge" style={{ top: model.interestMatchCount > 0 ? "76px" : "45px" }}>
                        👑 Premium
                      </div>
                    )}

                    <button className="card-floating-badge info-detail-btn" title="View details">
                      <Info size={16} />
                    </button>

                    {/* Details overlay */}
                    <div className="card-info-overlay">
                      <div className="profile-title">
                        <h2>{model.name}</h2>
                        <span className="age">{model.age}</span>
                        <span className="verif-badge">✔</span>
                      </div>

                      <div className="work-location">
                        <div>
                          <Briefcase size={14} />
                          <span>{model.relationship || "Companion"}</span>
                        </div>
                        <div>
                          <MapPin size={14} />
                          <span>{model.location || "Pune, India"}</span>
                        </div>
                      </div>


                      {model.interests && model.interests.length > 0 && (
                        <div className="tag-list">
                          {model.interests.slice(0, 3).map((interest, tagIdx) => (
                            <span key={tagIdx} className="tag-badge">
                              #{interest}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        ) : (
          <div className="deck-empty-state">
            <span className="deck-empty-icon">😢</span>
            <h3>No more profiles nearby</h3>
            <p>Try recycling skipped cards to see people you passed on again.</p>
            <button className="recycle-btn" onClick={handleRecycle}>Recycle Skips</button>
          </div>
        )}

        {/* Action Controls Bar */}
        {cards.length > 0 && (
          <div className="discover-actions-bar">
            <button 
              className="btn-circle btn-sm btn-rewind" 
              onClick={handleRewind}
              disabled={swipedHistory.length === 0}
              title="Undo last nope"
            >
              <RotateCcw size={18} />
            </button>

            <button 
              className="btn-circle btn-lg btn-pass" 
              onClick={() => swipeCard(cards[0]._id, 'skip')}
              title="Skip"
            >
              <X size={26} />
            </button>

            <button 
              className="btn-circle btn-sm btn-superlike" 
              onClick={() => swipeCard(cards[0]._id, 'superlike')}
              title="Super Like"
            >
              <Star size={20} fill="currentColor" />
            </button>

            <button 
              className="btn-circle btn-lg btn-like" 
              onClick={() => swipeCard(cards[0]._id, 'like')}
              title="Like"
            >
              <Heart size={26} fill="currentColor" />
            </button>

            <button 
              className="btn-circle btn-sm btn-chat" 
              onClick={() => router.push(`/chatbox?chatId=${cards[0]._id}`)}
              title="Say Hi directly"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        )}
      </div>

      {/* IT'S A MATCH CELEBRATION MODAL */}
      <AnimatePresence>
        {matchData && (
          <div className="match-modal-backdrop">
            {/* Confetti canvas bursts at step 4 */}
            {matchStep >= 4 && <CanvasConfetti />}

            <div className="match-modal-content">
              {matchStep >= 1 && (
                <motion.h1 
                  className="match-neon-title"
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  It's a Match!
                </motion.h1>
              )}

              <div className="match-avatars-stage">
                {matchStep >= 3 && (
                  <>
                    <div className="match-circle-frame left-avatar">
                      <img src="/heartecho_b.png" alt="You" />
                    </div>
                    <div className="match-circle-frame right-avatar">
                      <img src={matchData.avatar_img} alt={matchData.name} />
                    </div>
                    <div className="match-center-heart">
                      <Heart size={24} fill="white" color="white" />
                    </div>
                  </>
                )}
              </div>

              {matchStep >= 2 && (
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <p className="match-subtitle">You and {matchData.name} liked each other!</p>
                  <p className="match-tagline">Start your journey today and build a deep, premium connection. ❤️</p>
                </motion.div>
              )}

              {matchStep >= 5 && (
                <motion.div 
                  className="match-action-btns"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <button 
                    className="match-primary-btn"
                    onClick={() => router.push(`/chatbox?chatId=${matchData._id}`)}
                  >
                    <MessageCircle size={18} fill="white" />
                    <span>Start Chatting</span>
                  </button>
                  <button 
                    className="match-secondary-btn"
                    onClick={() => setMatchData(null)}
                  >
                    Keep Discovering
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}
      </AnimatePresence>

      {/* Login modal backdrop */}
      <AnimatePresence>
        {showLoginModal && (
          <div className="modal-backdrop" onClick={() => setShowLoginModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <LoginModal onClose={() => setShowLoginModal(false)} />
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default Discover;