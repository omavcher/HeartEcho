'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import axios from 'axios';
import api from '../config/api';
import './AutoNotification.css';

function AutoNotification() {
  const [notification, setNotification] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [timeLabel, setTimeLabel] = useState('now');
  const loopTimeoutRef = useRef(null);

  const triggerNotificationCycle = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const response = await axios.post(
        `${api.Url}/user/auto-notifications`,
        {},
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.data.success) {
        setNotification(response.data.notification);
        setTimeLabel('now');
        setIsVisible(true);

        // Phase 1: Display for 10 seconds
        setTimeout(() => {
          setIsVisible(false);

          // Phase 2: Wait before next cycle
          const nextGap = Math.floor(Math.random() * (15000 - 5000 + 1)) + 5000;
          loopTimeoutRef.current = setTimeout(() => {
            triggerNotificationCycle();
          }, nextGap);
        }, 10000);
      }
    } catch (error) {
      console.error('AutoNotification error:', error);
      loopTimeoutRef.current = setTimeout(triggerNotificationCycle, 10000);
    }
  }, []);

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
    <div className="android-notification-wrapper" role="alert" aria-live="polite">
      <div
        className={`android-notification-card ${isVisible ? 'slide-in' : 'slide-out'}`}
        onClick={handleNotificationClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && handleNotificationClick()}
        aria-label={`Message from ${notification.name}`}
      >
        {/* ── Header ── */}
        <div className="android-header">
          <div className="app-info">
            {/* Tiny App Icon */}
            <div className="app-icon-mini">
              <Image
                src="/heartechor.png"
                alt="HeartEcho"
                width={18}
                height={18}
                style={{ objectFit: 'cover', borderRadius: '5px' }}
              />
            </div>
            <span className="app-name">HeartEcho</span>
            <span className="notif-dot-sep" />
            <span className="app-time">{timeLabel}</span>
          </div>

          <button
            className="android-close"
            onClick={(e) => { e.stopPropagation(); setIsVisible(false); }}
            aria-label="Dismiss notification"
          >
            ✕
          </button>
        </div>

        {/* ── Body ── */}
        <div className="android-body">
          {/* Avatar */}
          <div className="android-avatar-wrapper">
            <img
              src={notification.profile_img || notification.avatar_img || '/heartechor.png'}
              alt={`${notification.name} avatar`}
              className="android-avatar"
              width={46}
              height={46}
              onError={(e) => { e.target.src = '/heartechor.png'; }}
            />
            <span className="android-avatar-online" aria-hidden="true" />
          </div>

          {/* Text */}
          <div className="android-text">
            <h4 className="android-title">{notification.name}</h4>
            <p className="android-msg">{notification.message}</p>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="android-actions">
          <button
            className="action-btn"
            onClick={(e) => e.stopPropagation()}
            aria-label="Mark as read"
          >
            Mark Read
          </button>
          <button
            className="action-btn primary"
            onClick={handleNotificationClick}
            aria-label="Open chat"
          >
            Open Chat ↗
          </button>
        </div>

        {/* Progress bar showing 10s display time */}
        <div className="reading-progress-bar" aria-hidden="true" />
      </div>
    </div>
  );
}

export default AutoNotification;