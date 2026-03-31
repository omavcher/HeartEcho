'use client';

import { useState, useEffect } from 'react';
import "../styles/ProfileLists.css";
import PopNoti from '../components/PopNoti';
import api from '../config/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

function ProfileLists({ handleSettindSelection, onBackSBTNSelect, selectedId }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const [twoFactor, setTwoFactor] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      
      const storedUserData = localStorage.getItem("userProfileData");
      if (storedUserData) {
        try {
          const parsedData = JSON.parse(storedUserData);
          setUserData(parsedData);
          setTwoFactor(parsedData.twofactor || false);
        } catch (error) {
          console.error("Data parse error", error);
        }
      }
    }
  }, []);

  const fetchUserData = async () => {
    if (!token) return;
    try {
      const res = await axios.get(`${api.Url}/user/get-user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data) {
        setUserData(res.data);
        setTwoFactor(res.data.twofactor);
        if (typeof window !== 'undefined') {
          localStorage.setItem("userProfileData", JSON.stringify(res.data));
        }
      }
    } catch (error) {
      console.warn("Using cached data due to fetch error");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`${api.Url}/user/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Clear all local data
      if (typeof window !== 'undefined') localStorage.clear();
      Cookies.remove('token');
      router.push("/login");
    } catch (error) {
      setNotification({ show: true, message: "Failed to delete account. Please try again.", type: "error" });
      setIsDeleting(false);
    }
  };

  const handleToggle2F = async () => {
    const newStatus = !twoFactor;
    setTwoFactor(newStatus); 
    
    try {
      await axios.post(`${api.Url}/user/twofactor`, { twofactor: newStatus }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUserData(); 
      setNotification({ show: true, message: `2FA ${newStatus ? 'Enabled' : 'Disabled'}`, type: "success" });
    } catch (error) {
      setTwoFactor(!newStatus); 
      setNotification({ show: true, message: "Failed to update 2FA", type: "error" });
    }
  };

  const handleLogout = () => {
    if (typeof window !== 'undefined') localStorage.clear();
    Cookies.remove('token');
    router.push("/login");
  };

  const navigateTo = (id) => {
    handleSettindSelection(id);
    onBackSBTNSelect(false);
  };

  return (
    <>
      <PopNoti
        {...notification}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      <div className="ios-settings-container">
        
        {/* User Bio Card */}
        <div className="ios-profile-hero" style={{marginBottom: '2rem'}}>
          <img 
            src={userData?.profile_picture || "/default-profile.png"} 
            alt="Profile" 
            className="ios-profile-photo"
          />
          <h2 className="ios-profile-email">{userData?.name || "User"}</h2>
          <p style={{color: 'var(--ios-text-secondary)', fontSize: '0.95rem', margin: '4px 0 0 0'}}>{userData?.email}</p>
        </div>

        {/* Account Settings */}
        <div className="ios-settings-group">
          <h3 className="ios-group-title">ACCOUNT</h3>
          <div className="ios-list">
             <div className={`ios-list-item ios-nav-item ${selectedId === 2 ? 'active' : ''}`} onClick={() => navigateTo(2)}>
               <div className="ios-item-left">
                  <div className="ios-icon-box" style={{background: 'var(--ios-theme-accent)'}}>
                     <svg viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
                     </svg>
                  </div>
                  <span className="ios-item-title">Update Profile</span>
               </div>
               <svg viewBox="0 0 24 24" fill="currentColor" className="ios-chevron"><path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"/></svg>
             </div>

             <div className={`ios-list-item ios-nav-item ${selectedId === 4 ? 'active' : ''}`} onClick={() => navigateTo(4)}>
               <div className="ios-item-left">
                  <div className="ios-icon-box" style={{background: '#34c759'}}>
                     <svg viewBox="0 0 24 24" fill="currentColor">
                       <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
                     </svg>
                  </div>
                  <span className="ios-item-title">Chat Settings</span>
               </div>
               <svg viewBox="0 0 24 24" fill="currentColor" className="ios-chevron"><path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"/></svg>
             </div>

             <div className={`ios-list-item ios-nav-item ${selectedId === 6 ? 'active' : ''}`} onClick={() => navigateTo(6)}>
               <div className="ios-item-left">
                  <div className="ios-icon-box" style={{background: '#ff9f0a'}}>
                     <svg viewBox="0 0 24 24" fill="currentColor">
                       <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
                     </svg>
                  </div>
                  <span className="ios-item-title">Subscription & Billing</span>
               </div>
               <svg viewBox="0 0 24 24" fill="currentColor" className="ios-chevron"><path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"/></svg>
             </div>
          </div>
        </div>

        {/* Security & Actions */}
        <div className="ios-settings-group">
          <h3 className="ios-group-title">SECURITY</h3>
          <div className="ios-list">
             <div className="ios-list-item">
               <div className="ios-item-left">
                  <div className="ios-icon-box" style={{background: '#af52de'}}>
                     <svg viewBox="0 0 24 24" fill="currentColor">
                       <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                     </svg>
                  </div>
                  <span className="ios-item-title">Two-Factor Auth</span>
               </div>
               <label className="ios-toggle">
                 <input type="checkbox" checked={twoFactor} onChange={handleToggle2F} />
                 <span className="ios-toggle-slider"></span>
               </label>
             </div>
          </div>
          <p className="ios-group-footer">Enable an extra layer of security on login to prevent unauthorized access.</p>
        </div>

        {/* Support */}
        <div className="ios-settings-group">
          <h3 className="ios-group-title">SUPPORT</h3>
          <div className="ios-list">
             <div className="ios-list-item ios-nav-item" onClick={() => navigateTo(12)}>
               <div className="ios-item-left">
                  <div className="ios-icon-box" style={{background: '#0a84ff'}}>
                     <svg viewBox="0 0 24 24" fill="currentColor">
                       <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
                     </svg>
                  </div>
                  <span className="ios-item-title">Help Center / Tickets</span>
               </div>
               <svg viewBox="0 0 24 24" fill="currentColor" className="ios-chevron"><path d="M9.29 15.88L13.17 12 9.29 8.12c-.39-.39-.39-1.02 0-1.41.39-.39 1.02-.39 1.41 0l4.59 4.59c.39.39.39 1.02 0 1.41l-4.59 4.59c-.39.39-1.02.39-1.41 0-.38-.39-.39-1.03 0-1.42z"/></svg>
             </div>
          </div>
        </div>

        {/* Sign Out — iOS Danger Row */}
        <div className="ios-settings-group" style={{marginTop: '2rem'}}>
           <div className="ios-list">
             <div className="ios-list-item ios-center-action" onClick={handleLogout}>
                <span style={{color: '#ff3b30', fontSize: '1.05rem', fontWeight: '500', fontFamily: 'var(--ios-font)'}}>Sign Out</span>
             </div>
           </div>
        </div>
        
        {/* Delete Account — separate isolated danger row */}
        <div className="ios-settings-group">
           <div className="ios-list">
             <div className="ios-list-item ios-center-action" onClick={handleDeleteClick}>
                <span style={{color: '#ff3b30', fontSize: '1.05rem', fontWeight: '400', fontFamily: 'var(--ios-font)'}}>Delete Account</span>
             </div>
           </div>
           <p className="ios-group-footer">Permanently removes all your data. This cannot be undone.</p>
        </div>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="overlay-backdrop">
          <div className="modal-content">
            <h3>Delete Account?</h3>
            <p>This action is irreversible. Your account, chats, payments, and all related data will be permanently deleted.</p>
            <div className='modal-actions'>
              <button className="modal-btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? <span className="loader-spinner"></span> : "Confirm Delete"}
              </button>
              <div className="modal-divider"></div>
              <button className="modal-btn btn-primary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default ProfileLists;