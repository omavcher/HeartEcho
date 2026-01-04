'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import api from '../config/api';
import './AutoNotification.css';

function AutoNotification() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  
  // Ref to manage the loop and prevent memory leaks
  const loopTimeoutRef = useRef(null);

  // 1. Get location on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => console.error("Location error:", error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  const triggerNotificationCycle = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${api.Url}/user/auto-notifications`,
        userLocation || {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotification(response.data.notification);
        setIsVisible(true);

        // --- PHASE 1: DISPLAY ---
        // Message stays for 10 seconds so user can read it comfortably
        setTimeout(() => {
          setIsVisible(false);
          
          // --- PHASE 2: WAIT (REST PERIOD) ---
          // Only start calculating the next call AFTER the current one is gone
          const nextGap = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
          
          loopTimeoutRef.current = setTimeout(() => {
            triggerNotificationCycle();
          }, nextGap);

        }, 10000); 
      }
    } catch (error) {
      console.error("Fetch error:", error);
      // If API fails, try again after a standard 10s delay to avoid spamming errors
      loopTimeoutRef.current = setTimeout(triggerNotificationCycle, 10000);
    }
  }, [userLocation]);

  // Start the loop after the page has been active for 5 seconds
  useEffect(() => {
    const startTimer = setTimeout(() => {
      triggerNotificationCycle();
    }, 5000);

    return () => {
      clearTimeout(startTimer);
      if (loopTimeoutRef.current) clearTimeout(loopTimeoutRef.current);
    };
  }, [triggerNotificationCycle]);

  const handleNotificationClick = () => {
    if (notification?._id) {
      window.location.href = `/chatbox?chatId=${notification._id}`;
    }
  };

  if (!isVisible || !notification) return null;

  return (
    <div className="android-notification-wrapper">
      <div 
        className={`android-notification-card ${isVisible ? 'slide-in' : 'slide-out'}`} 
        onClick={handleNotificationClick}
      >
        <div className="android-header">
          <div className="app-info">
            <div className="app-icon-mini">❤️</div>
            <span className="app-name">HeartEcho • now</span>
          </div>
          <button className="android-close" onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}>
            ✕
          </button>
        </div>

        <div className="android-body">
          <img 
            src={notification.profile_img || notification.avatar_img} 
            alt="AI Profile" 
            className="android-avatar" 
          />
          <div className="android-text">
            <h4 className="android-title">{notification.name}</h4>
            <p className="android-msg">{notification.message}</p>
          </div>
        </div>

        <div className="android-actions">
          <button className="action-btn">Reply</button>
          <button className="action-btn primary">Open Chat</button>
        </div>
        
        {/* Visual Progress Bar to show the 10s reading time */}
        <div className="reading-progress-bar"></div>
      </div>
    </div>
  );
}

export default AutoNotification;