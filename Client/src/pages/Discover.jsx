'use client';
import React, { useState, useEffect } from "react";
import '../styles/Discover.css';
import Link from 'next/link';
import { motion, AnimatePresence } from "framer-motion";
import { Crown } from "lucide-react"; // Using Lucide for cleaner icons

// Components
import HomeCosAi from '../components/HomeCosAi';
import AIFriends from "../components/AIFriends";
import Footer from "../components/Footer";
import LoginModal from "../components/LoginModel";

function Discover() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);

  // Helper function to get localStorage items safely
  const getLocal = (key) => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(key);
    }
    return null;
  };

  useEffect(() => {
    // 1. Check Login Status
    const token = getLocal('token');
    if (!token) {
      const timer = setTimeout(() => setShowLoginModal(true), 3000);
      return () => clearTimeout(timer);
    }

    // 2. Check Subscription Status
    const subscriptionData = getLocal('subscribed');
    if (subscriptionData) {
      try {
        const parsedData = JSON.parse(subscriptionData);
        if (parsedData.isSubscribed === true || parsedData.userType === 'subscriber') {
          setIsSubscribed(true);
        }
      } catch (error) {
        console.error('Error parsing subscription data:', error);
      }
    }
  }, []);

  const handleCloseModal = () => {
    setShowLoginModal(false);
  };

  return (
    <div className='discover-container'>
      
      {/* Login Modal Animation */}
      <AnimatePresence>
        {showLoginModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="modal-backdrop"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 50, scale: 0.95 }}
              transition={{ type: "spring", damping: 25 }}
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
            >
              <LoginModal onClose={handleCloseModal} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sticky Header */}
      <header className="discover-header">
        <h1>Discover</h1>
        {!isSubscribed && (
          <Link href='/subscribe' className='premium-gold-btn'>
            <Crown size={16} strokeWidth={2.5} />
            <span>Go Premium</span>
          </Link>
        )}
      </header>

      {/* Main Content */}
      <div className="discover-content-wrapper">
        
        {/* Custom AI Section */}
        <section>
          <HomeCosAi />
        </section>

        {/* AI Friends List */}
        <section className="ai-models-section-container">
          <AIFriends />
        </section>

      </div>

      <Footer />
    </div>
  );
}

export default Discover;