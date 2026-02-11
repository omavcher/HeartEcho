'use client';

import React, { useEffect, useState } from 'react';
import "../styles/ProfileDashboard.css";
import Link from 'next/link';
import ProfileLists from '../components/ProfileLists';
import ProfileSetting from '../components/ProfileSetting';

function ProfileDashboard() {
  const [selectedSettingId, setSelectedSettingId] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Mobile Navigation State
  // If true, we show the Detail View (Left Panel). If false, we show the List (Right Panel).
  const [showDetailView, setShowDetailView] = useState(false);

  // --- 1. Load Subscription ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const subscriptionData = localStorage.getItem('subscribed');
      if (subscriptionData) {
        try {
          const parsedData = JSON.parse(subscriptionData);
          if (parsedData.isSubscribed === true || parsedData.userType === 'subscriber') {
            setIsSubscribed(true);
          }
        } catch (error) { console.error(error); }
      }
    }
  }, []);

  // --- 2. Handlers ---
  const handleSettingSelection = (id) => {
    setSelectedSettingId(id);
    setShowDetailView(true); // Slide to detail view on mobile
  };

  const handleBackToMenu = () => {
    setShowDetailView(false); // Slide back to list view on mobile
  };

  return (
    <div className="profile-dashboard">
      
      {/* Header */}
      <header className="profile-header">
        <h1>Profile</h1>
        {!isSubscribed && (
          <Link href='/subscribe' className='subscribe-btn-x'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.80577 5.20006L7.00505 7.99958L11.1913 2.13881C11.5123 1.6894 12.1369 1.58531 12.5863 1.90631C12.6761 1.97045 12.7546 2.04901 12.8188 2.13881L17.0051 7.99958L21.2043 5.20006C21.6639 4.89371 22.2847 5.01788 22.5911 5.47741C22.7228 5.67503 22.7799 5.91308 22.7522 6.14895L21.109 20.1164C21.0497 20.62 20.6229 20.9996 20.1158 20.9996H3.8943C3.38722 20.9996 2.9604 20.62 2.90115 20.1164L1.25792 6.14895C1.19339 5.60045 1.58573 5.10349 2.13423 5.03896C2.37011 5.01121 2.60816 5.06832 2.80577 5.20006ZM12.0051 14.9996C13.1096 14.9996 14.0051 14.1042 14.0051 12.9996C14.0051 11.895 13.1096 10.9996 12.0051 10.9996C10.9005 10.9996 10.0051 11.895 10.0051 12.9996C10.0051 14.1042 10.9005 14.9996 12.0051 14.9996Z"></path>
            </svg> 
            Subscribe
          </Link>
        )}
      </header>

      {/* Main Layout Container */}
      <div className={`profile-content-container ${showDetailView ? 'mobile-show-detail' : ''}`}>
        
        {/* Left Panel: Settings Detail (Hidden on mobile initially) */}
        <div className="profile-left-panel">
          <ProfileSetting 
            selectedSettingId={selectedSettingId} 
            onBackSBTNSelect={handleBackToMenu} 
          />
        </div>

        {/* Right Panel: Navigation List (Visible on mobile initially) */}
        <div className="profile-right-panel">
          <ProfileLists 
            handleSettindSelection={handleSettingSelection}  
            // Pass active state to highlight current selection if needed
            selectedId={selectedSettingId}
          />
        </div>

      </div> 
    </div>
  );
}

export default ProfileDashboard;