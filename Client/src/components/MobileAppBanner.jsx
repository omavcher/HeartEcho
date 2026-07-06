'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import './MobileAppBanner.css';

// Star rating SVG helper
function StarIcon({ filled = true }) {
  return (
    <svg viewBox="0 0 24 24" fill={filled ? '#FFD700' : 'rgba(255,255,255,0.2)'}>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// Google Play SVG logo
function PlayStoreLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M12 28.5c-2.4 2.4-3.7 6-3.7 10.1v434.7c0 4.1 1.3 7.7 3.7 10.1l2.4 2.4L266 274.5v-6.2L14.4 26.1l-2.4 2.4z"/>
      <path fill="#EA4335" d="M349.5 358.2l-83.5-83.7v-6.2l83.5-83.7 2.7 1.5 98.7 57c28.1 16.2 28.1 42.7 0 59l-98.7 57.1-2.7-1z"/>
      <path fill="#FBBC05" d="M266 268.3L12 12c4-2 9.5-2.2 15.6 1.3l321.9 185.3 2.7 1.5-83.5 83.7-2.7-1.5z"/>
      <path fill="#34A853" d="M266 280.7l83.5 83.7-2.7 1.5-321.9 185.3c-6.1 3.5-11.6 3.3-15.6 1.3L266 280.7z"/>
    </svg>
  );
}

export default function MobileAppBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const isDismissed = localStorage.getItem('he_app_banner_dismissed');
    const dismissTime = localStorage.getItem('he_app_banner_dismiss_time');
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();

    if (!isDismissed || (dismissTime && now - parseInt(dismissTime) > sevenDays)) {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      if (isMobile || window.innerWidth < 1024) {
        setShowBanner(true);
      }
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem('he_app_banner_dismissed', 'true');
    localStorage.setItem('he_app_banner_dismiss_time', Date.now().toString());
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="mab-banner-c32id" role="banner" aria-label="Download HeartEcho App">
      {/* Left: Close + Icon + Info */}
      <div className="mab-left-c32id">
        {/* Close Button */}
        <button
          onClick={handleDismiss}
          className="mab-close-btn-c32id"
          aria-label="Dismiss banner"
        >
          ✕
        </button>

        {/* App Icon */}
        <div className="mab-logo-container-c32id">
          <Image
            src="/heartechor.png"
            alt="HeartEcho App Icon"
            width={44}
            height={44}
            className="mab-app-logo-c32id"
          />
        </div>

        {/* App Info */}
        <div className="mab-info-c32id">
          <h4 className="mab-title-c32id">HeartEcho AI</h4>
          <p className="mab-developer-c32id">Omega Verse</p>
          <div className="mab-meta-c32id">
            <div className="mab-stars-c32id">
              <StarIcon filled />
              <StarIcon filled />
              <StarIcon filled />
              <StarIcon filled />
              <StarIcon filled />
            </div>
            <span className="mab-dot-sep-c32id" />
            <span className="mab-rating-text-c32id">FREE</span>
          </div>
        </div>
      </div>

      {/* Right: Download CTA */}
      <div className="mab-right-c32id">
        <a
          href="https://play.google.com/store/apps/details?id=com.heartecho.ai"
          target="_blank"
          rel="noopener noreferrer"
          className="mab-download-btn-c32id"
          aria-label="Download HeartEcho on Google Play"
        >
          GET APP
        </a>
      </div>
    </div>
  );
}
