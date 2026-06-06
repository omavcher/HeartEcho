'use client';

import { useState, useEffect, useRef } from 'react';
import "../styles/ProfileLists.css";
import PopNoti from '../components/PopNoti';
import api from '../config/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';
import { FaStar, FaMapMarkerAlt } from 'react-icons/fa';

function ProfileLists({ handleSettindSelection, onBackSBTNSelect, selectedId }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const [twoFactor, setTwoFactor] = useState(false);
  const router = useRouter();

  // Feedback states for Delete Account form
  const [feedbackName, setFeedbackName] = useState("");
  const [feedbackCity, setFeedbackCity] = useState("");
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackText, setFeedbackText] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  // Mapbox Autocomplete States
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearchingCities, setIsSearchingCities] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);

  const dropdownRef = useRef(null);
  const justSelectedCity = useRef(false);

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

  // Fetch city suggestions from Mapbox Geocoding API (debounced)
  useEffect(() => {
    if (!feedbackCity.trim() || feedbackCity.length < 3) {
      setSuggestions([]);
      return;
    }

    if (justSelectedCity.current) {
      justSelectedCity.current = false;
      return;
    }

    const delayDebounce = setTimeout(async () => {
      setIsSearchingCities(true);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      try {
        const token = "pk.eyJ1Ijoib21hd2NoYXIwNyIsImEiOiJjbHlmbGtwdmowMHhkMmtxeXAyNXdkeHB3In0.37j_dk9NgxtiPXqwCgsdQg";
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(feedbackCity)}.json?access_token=${token}&types=place&country=in&limit=5`;
        const res = await fetch(url, { signal: controller.signal });
        const data = await res.json();
        clearTimeout(timeoutId);
        
        if (data && data.features) {
          const formatted = data.features.map(item => {
            const nameOnly = item.text || '';
            const displayName = item.place_name || '';
            return {
              name: nameOnly,
              label: nameOnly,
              display: displayName
            };
          });

          // Filter unique labels
          const unique = [];
          const seen = new Set();
          for (const item of formatted) {
            if (item.name && !seen.has(item.name.toLowerCase())) {
              seen.add(item.name.toLowerCase());
              unique.push(item);
            }
          }

          setSuggestions(unique);
          setShowSuggestions(true);
        } else {
          setSuggestions([]);
        }
      } catch (err) {
        console.error("Mapbox search error in profile delete:", err);
        setSuggestions([]);
      } finally {
        setIsSearchingCities(false);
      }
    }, 400);

    return () => {
      clearTimeout(delayDebounce);
    };
  }, [feedbackCity]);

  // Handle outside click to close suggestions dropdown
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const detectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsDetectingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        await fallbackDetectLocation(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        alert("Unable to retrieve your location. Please type manually.");
        setIsDetectingLocation(false);
      },
      { timeout: 8000, enableHighAccuracy: false }
    );
  };

  const fallbackDetectLocation = async (lat, lon) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    try {
      const token = "pk.eyJ1Ijoib21hd2NoYXIwNyIsImEiOiJjbHlmbGtwdmowMHhkMmtxeXAyNXdkeHB3In0.37j_dk9NgxtiPXqwCgsdQg";
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${token}&types=place`;
      const response = await fetch(url, { signal: controller.signal });
      const data = await response.json();
      clearTimeout(timeoutId);

      if (data && data.features && data.features.length > 0) {
        const detectedCity = data.features[0].text;
        if (detectedCity) {
          justSelectedCity.current = true;
          setFeedbackCity(detectedCity);
          setIsDetectingLocation(false);
          return;
        }
      }

      // Secondary fallback
      const bdController = new AbortController();
      const bdTimeoutId = setTimeout(() => bdController.abort(), 5000);
      const bdRes = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`,
        { signal: bdController.signal }
      );
      const bdData = await bdRes.json();
      clearTimeout(bdTimeoutId);
      const detectedCity = bdData.city || bdData.locality || bdData.principalSubdivision || '';
      if (detectedCity) {
        justSelectedCity.current = true;
        setFeedbackCity(detectedCity);
      }
    } catch (err) {
      console.error("Reverse geocoding error:", err);
    } finally {
      setIsDetectingLocation(false);
    }
  };

  const handleDeleteClick = () => {
    setFeedbackName(userData?.name || "User");
    setFeedbackCity("");
    setFeedbackRating(0);
    setFeedbackText("");
    setFeedbackError("");
    setSuggestions([]);
    setShowSuggestions(false);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!feedbackName.trim() || !feedbackRating || !feedbackText.trim() || !feedbackCity.trim()) {
      setFeedbackError("Please fill in all feedback fields.");
      return;
    }

    if (feedbackText.trim().length < 10) {
      setFeedbackError("Feedback description must be at least 10 characters.");
      return;
    }

    setIsDeleting(true);
    setFeedbackError("");
    try {
      // 1. Submit feedback to DB first
      await axios.post(`${api.Url}/user/submit-feedback`, {
        name: feedbackName,
        city: feedbackCity,
        rating: feedbackRating,
        text: feedbackText,
        feature: "Delete Account",
        live: false
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 2. Proceed with delete account
      await axios.delete(`${api.Url}/user/delete-account`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Clear all local data
      if (typeof window !== 'undefined') localStorage.clear();
      Cookies.remove('token');
      router.push("/login");
    } catch (error) {
      console.error("Error during delete/feedback submission:", error);
      const errMsg = error.response?.data?.message || error.response?.data?.msg || "Failed to process your request. Please check all fields and try again.";
      setFeedbackError(errMsg);
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
      <style>{`
        .profile-city-suggestion-item-x30sn {
          padding: 10px 12px;
          cursor: pointer;
          background: #18181b;
          border: none;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
          font-size: 0.9rem;
          color: #e4e4e7;
          width: 100%;
          text-align: left;
          transition: background 0.2s;
        }
        .profile-city-suggestion-item-x30sn:hover {
          background: rgba(255, 105, 180, 0.1) !important;
          color: #ff69b4 !important;
        }
        .profile-detect-location-btn-x30sn {
          position: absolute;
          right: 8px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255, 105, 180, 0.1);
          color: #ff69b4;
          border: 1px solid rgba(255, 105, 180, 0.2);
          border-radius: 6px;
          padding: 4px 8px;
          font-size: 0.75rem;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .profile-detect-location-btn-x30sn:hover {
          background: rgba(255, 105, 180, 0.2);
        }
      `}</style>

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

      {/* Delete Confirmation Modal with Feedback Form */}
      {showDeleteConfirm && (
        <div className="overlay-backdrop">
          <div className="modal-content" style={{ maxWidth: '420px', textAlign: 'left', background: 'rgba(20, 20, 22, 0.98)', border: '1px solid rgba(255, 255, 255, 0.15)' }}>
            <h3 style={{ textAlign: 'center', marginBottom: '8px', fontSize: '1.25rem', fontWeight: '700' }}>We're sorry to see you go 💔</h3>
            <p style={{ textAlign: 'center', fontSize: '0.85rem', marginBottom: '20px', color: 'var(--ios-text-secondary)', lineHeight: '1.4' }}>
              Please share your experience with us before deleting your account. All data will be permanently removed.
            </p>
            
            {feedbackError && (
              <div style={{ color: '#f87171', fontSize: '0.85rem', marginBottom: '16px', background: 'rgba(239,68,68,0.1)', padding: '10px 12px', borderRadius: '10px', border: '1px solid rgba(239,68,68,0.2)' }}>
                {feedbackError}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ios-text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your Name *</label>
              <input 
                type="text" 
                value={feedbackName} 
                onChange={(e) => setFeedbackName(e.target.value)}
                placeholder="Enter your name"
                style={{ textAlign: 'left', background: '#111', border: '1px solid rgba(255,255,255,0.1)', margin: 0, padding: '10px 12px', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', width: '100%' }}
                disabled={isDeleting}
              />
            </div>

            <div style={{ marginBottom: '14px', position: 'relative' }} ref={dropdownRef}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ios-text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Your City *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="text" 
                  value={feedbackCity} 
                  onChange={(e) => {
                    setFeedbackCity(e.target.value);
                    setShowSuggestions(true);
                  }}
                  placeholder="Enter city (e.g. Pune, Delhi)"
                  style={{ textAlign: 'left', background: '#111', border: '1px solid rgba(255,255,255,0.1)', margin: 0, padding: '10px 85px 10px 12px', borderRadius: '10px', fontSize: '0.95rem', boxSizing: 'border-box', width: '100%' }}
                  disabled={isDeleting || isDetectingLocation}
                />
                <button
                  type="button"
                  className="profile-detect-location-btn-x30sn"
                  onClick={detectLocation}
                  disabled={isDeleting || isDetectingLocation}
                  title="Detect my current city location"
                  style={{ display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  {isDetectingLocation ? (
                    <span className="loader-spinner" style={{ width: 10, height: 10 }}></span>
                  ) : (
                    <FaMapMarkerAlt />
                  )}
                  {isDetectingLocation ? "Detecting..." : "Detect"}
                </button>
              </div>

              {/* Suggestions Dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div style={{ 
                  position: 'absolute', 
                  top: '100%', 
                  left: 0, 
                  right: 0, 
                  background: '#18181b', 
                  border: '1px solid rgba(255, 255, 255, 0.1)', 
                  borderRadius: '10px', 
                  overflow: 'hidden', 
                  zIndex: 9999, 
                  marginTop: '4px', 
                  boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
                  maxHeight: '180px',
                  overflowY: 'auto'
                }}>
                  {suggestions.map((item, index) => (
                    <button
                      key={index}
                      type="button"
                      className="profile-city-suggestion-item-x30sn"
                      onClick={() => {
                        justSelectedCity.current = true;
                        setFeedbackCity(item.name);
                        setSuggestions([]);
                        setShowSuggestions(false);
                      }}
                    >
                      <strong style={{ color: '#fff' }}>{item.name}</strong>
                      <span style={{ fontSize: '0.75rem', color: '#888', marginLeft: '6px' }}>({item.display})</span>
                    </button>
                  ))}
                </div>
              )}
              {isSearchingCities && (
                <div style={{ position: 'absolute', right: '90px', top: '50%', transform: 'translateY(-50%)', fontSize: '0.75rem', color: '#ff69b4', zIndex: 10 }}>
                  Searching...
                </div>
              )}
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ios-text-secondary)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>How would you rate us? *</label>
              <div style={{ display: 'flex', gap: '8px', padding: '4px 0' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar 
                    key={star}
                    onClick={() => !isDeleting && setFeedbackRating(star)}
                    style={{ 
                      fontSize: '28px', 
                      cursor: isDeleting ? 'not-allowed' : 'pointer', 
                      color: star <= feedbackRating ? '#ffd700' : 'rgba(255,255,255,0.15)',
                      transition: 'color 0.2s, transform 0.1s'
                    }}
                    onMouseEnter={(e) => { if (!isDeleting) e.target.style.transform = 'scale(1.15)'; }}
                    onMouseLeave={(e) => { if (!isDeleting) e.target.style.transform = 'scale(1)'; }}
                  />
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', color: 'var(--ios-text-secondary)', marginBottom: '5px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Reason for deleting *</label>
              <textarea 
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="Please tell us why you want to delete your account (min 10 characters)..."
                rows="3"
                style={{ 
                  width: '100%', 
                  background: '#111', 
                  border: '1px solid rgba(255,255,255,0.1)', 
                  borderRadius: '10px', 
                  color: 'white', 
                  padding: '10px 12px',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxSizing: 'border-box',
                  resize: 'none',
                  lineHeight: '1.4'
                }}
                disabled={isDeleting}
              />
              <span style={{ display: 'block', textAlign: 'right', fontSize: '0.75rem', color: feedbackText.trim().length >= 10 ? '#34c759' : '#8e8e93', marginTop: '4px' }}>
                {feedbackText.trim().length} / 10+ characters
              </span>
            </div>

            <div className='modal-actions' style={{ marginTop: '10px' }}>
              <button 
                className="modal-btn btn-danger" 
                onClick={handleConfirmDelete} 
                disabled={isDeleting || !feedbackRating || !feedbackCity.trim() || feedbackText.trim().length < 10 || !feedbackName.trim()}
                style={{ 
                  borderRadius: '12px 12px 0 0', 
                  opacity: (isDeleting || !feedbackRating || !feedbackCity.trim() || feedbackText.trim().length < 10 || !feedbackName.trim()) ? 0.45 : 1,
                  cursor: (isDeleting || !feedbackRating || !feedbackCity.trim() || feedbackText.trim().length < 10 || !feedbackName.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {isDeleting ? <span className="loader-spinner"></span> : "Submit & Delete Account"}
              </button>
              <div className="modal-divider"></div>
              <button className="modal-btn btn-primary" onClick={() => setShowDeleteConfirm(false)} disabled={isDeleting} style={{ borderRadius: '0 0 12px 12px' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

    </>
  );
}

export default ProfileLists;
