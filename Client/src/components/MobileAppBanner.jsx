'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import './MobileAppBanner.css';

export default function MobileAppBanner() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    // Only run on client-side
    const isDismissed = localStorage.getItem('he_app_banner_dismissed');
    const dismissTime = localStorage.getItem('he_app_banner_dismiss_time');
    
    // Show banner if not dismissed or if the dismissal expired (e.g. after 7 days)
    const sevenDays = 7 * 24 * 60 * 60 * 1000;
    const now = Date.now();
    
    if (!isDismissed || (dismissTime && now - parseInt(dismissTime) > sevenDays)) {
      // Check if it's an Android device or generally a mobile device
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
      // Let's display the banner for mobile viewports
      if (isMobile || window.innerWidth < 768) {
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
    <div className="mab-banner-c32id" role="banner">
      <div className="mab-left-c32id">
        <button 
          onClick={handleDismiss} 
          className="mab-close-btn-c32id"
          aria-label="Dismiss banner"
        >
          ✕
        </button>
        <div className="mab-logo-container-c32id">
          <Image 
            src="/heartechor.png" 
            alt="HeartEcho Logo" 
            width={36} 
            height={36} 
            className="mab-app-logo-c32id"
          />
        </div>
        <div className="mab-info-c32id">
          <h4 className="mab-title-c32id">HeartEcho AI</h4>
          <p className="mab-subtitle-c32id">Official Android App</p>
        </div>
      </div>
      <div className="mab-right-c32id">
        <a 
          href="https://play.google.com/store/apps/details?id=com.heartecho.ai" 
          target="_blank" 
          rel="noopener noreferrer" 
          className="mab-download-btn-c32id"
        >
          GET APP
        </a>
      </div>
    </div>
  );
}
