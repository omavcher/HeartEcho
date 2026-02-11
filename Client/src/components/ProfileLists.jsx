'use client';

import { useState, useEffect } from 'react';
import "../styles/ProfileLists.css";
import PopNoti from '../components/PopNoti';
import api from '../config/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

function ProfileLists({ handleSettindSelection, onBackSBTNSelect, selectedId }) {
  // State Management
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const [twoFactor, setTwoFactor] = useState(false);
  const router = useRouter();

  // --- 1. Initialization ---
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

  // --- 2. Data Fetching ---
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

  // --- 3. Handlers ---
  const handleDeleteClick = () => {
    const email = userData?.email || "";
    setMaskedEmail(email.replace(/(.{3}).+(@.+)/, "$1**********$2"));
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await axios.post(`${api.Url}/user/send-otp-destroy`, { email: userData.email }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setNotification({ show: true, message: "OTP sent successfully!", type: "success" });
        setShowDeleteConfirm(false);
        setShowOtpInput(true);
      }
    } catch (error) {
      setNotification({ show: true, message: "Error sending OTP", type: "error" });
    }
    setIsDeleting(false);
  };

  const handleVerifyOtp = async () => {
    setIsSubmitting(true);
    try {
      const res = await axios.post(`${api.Url}/user/verify-otp-destroy`, { email: userData.email, otp }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        await axios.delete(`${api.Url}/user/delete-account`, { headers: { Authorization: `Bearer ${token}` } });
        if (typeof window !== 'undefined') localStorage.clear();
        Cookies.remove('token');
        router.push("/login");
      } else {
        setNotification({ show: true, message: "Invalid OTP.", type: "error" });
      }
    } catch (error) {
      setNotification({ show: true, message: "Verification failed", type: "error" });
    }
    setIsSubmitting(false);
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

  // --- Render ---
  return (
    <>
      <PopNoti
        {...notification}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      {/* WRAPPER FOR CENTERING */}
      <div className="profile-lists-wrapper">
        
        {/* User Bio Card */}
        <div className='profile-top-bio-container'>
          <div className='profile-user-info'>
            <img 
              src={userData?.profile_picture || "/default-profile.png"} 
              alt="Profile" 
              className='profile-avatar'
            />
            <div className='profile-text'>
              <h2>{userData?.name || "User"}</h2>
              <p>{userData?.email}</p>
            </div>
          </div>
        </div>

        {/* Account Settings */}
        <div className='section-header'>Account</div>
        <section className='settings-section'>
          
          <div className={`setting-item ${selectedId === 2 ? 'active' : ''}`} onClick={() => navigateTo(2)}>
            <div className='setting-info'>
              <svg className="setting-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
              </svg>
              <div className='setting-text'>
                <h3>My Account</h3>
                <p>Personal details & security</p>
              </div>
            </div>
            <svg className='chevron-icon' viewBox="0 0 24 24" fill="currentColor">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/>
            </svg>
          </div>

          <div className={`setting-item ${selectedId === 4 ? 'active' : ''}`} onClick={() => navigateTo(4)}>
            <div className='setting-info'>
              <svg className="setting-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/>
              </svg>
              <div className='setting-text'>
                <h3>Chat Settings</h3>
                <p>Manage chat preferences</p>
              </div>
            </div>
            <svg className='chevron-icon' viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </div>

          <div className={`setting-item ${selectedId === 6 ? 'active' : ''}`} onClick={() => navigateTo(6)}>
            <div className='setting-info'>
              <svg className="setting-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z"/>
              </svg>
              <div className='setting-text'>
                <h3>Billing</h3>
                <p>Subscription & payments</p>
              </div>
            </div>
            <svg className='chevron-icon' viewBox="0 0 24 24" fill="currentColor"><path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"/></svg>
          </div>

        </section>

        {/* Security & Actions */}
        <div className='section-header'>Security & Actions</div>
        <section className='settings-section'>
          
          <div className='setting-item'>
            <div className='setting-info'>
              <svg className="setting-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
              </svg>
              <div className='setting-text'>
                <h3>Two-Factor Auth</h3>
                <p>Extra layer of security</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input type="checkbox" checked={twoFactor} onChange={handleToggle2F} />
              <span className="slider"></span>
            </label>
          </div>

          {/* <div className='setting-item'>
            <div className='setting-info'>
              <svg className="setting-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
              </svg>
              <div className='setting-text'>
                <h3>Delete Account</h3>
                <p>Permanently remove data</p>
              </div>
            </div>
            <button className='action-btn btn-danger' onClick={handleDeleteClick}>Delete</button>
          </div> */}

        </section>

        {/* Support */}
        <div className='section-header'>Support</div>
        <section className='settings-section'>
          <div className='setting-item' onClick={() => navigateTo(12)}>
            <div className='setting-info'>
              <svg className="setting-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 2H4c-1.1 0-1.99.9-1.99 2L2 22l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 9h-2V5h2v6zm0 4h-2v-2h2v2z"/>
              </svg>
              <div className='setting-text'>
                <h3>Help Center</h3>
                <p>FAQ & Support tickets</p>
              </div>
            </div>
            <button className='action-btn btn-primary'>Open</button>
          </div>

          <div className='setting-item'>
            <div className='setting-info'>
              <svg className="setting-icon" viewBox="0 0 24 24" fill="currentColor">
                <path d="M10.09 15.59L11.5 17l5-5-5-5-1.41 1.41L12.67 11H3v2h9.67l-2.58 2.59zM19 3H5c-1.11 0-2 .9-2 2v4h2V5h14v14H5v-4H3v4c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2z"/>
              </svg>
              <div className='setting-text'>
                <h3>Log Out</h3>
                <p>Sign out of your session</p>
              </div>
            </div>
            <button className='action-btn btn-primary' onClick={handleLogout}>Logout</button>
          </div>
        </section>

      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="overlay-backdrop">
          <div className="modal-content">
            <h3>Delete Account?</h3>
            <p>This action is irreversible. All data will be lost.</p>
            <div className='modal-actions'>
              <button className="modal-btn btn-danger" onClick={handleConfirmDelete} disabled={isDeleting}>
                {isDeleting ? <span className="loader-spinner"></span> : "Confirm Delete"}
              </button>
              <button className="modal-btn btn-primary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* OTP Modal */}
      {showOtpInput && (
        <div className="overlay-backdrop">
          <div className="modal-content">
            <h3>Verify Identity</h3>
            <p>Enter the code sent to {maskedEmail}</p>
            <input 
              type="text" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value)} 
              placeholder="Enter OTP"
              autoFocus
            />
            <button className="modal-btn btn-danger" style={{width:'100%'}} onClick={handleVerifyOtp} disabled={isSubmitting}>
              {isSubmitting ? <span className="loader-spinner"></span> : "Verify & Delete"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default ProfileLists;