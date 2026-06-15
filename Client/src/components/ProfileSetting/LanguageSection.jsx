'use client';

import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../config/api";
import PopNoti from "../PopNoti";
import { FaCheck } from "react-icons/fa";

function LanguageSection({ onBackSBTNSelect }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [token, setToken] = useState(null);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const languageOptions = [
    { id: "Hinglish", label: "Hinglish", native: "Hinglish" },
    { id: "English", label: "English", native: "English" },
    { id: "Hindi", label: "Hindi", native: "हिन्दी" },
    { id: "Bengali", label: "Bengali", native: "বাংলা" },
    { id: "Marathi", label: "Marathi", native: "मराठी" },
    { id: "Telugu", label: "Telugu", native: "తెలుగు" },
    { id: "Tamil", label: "Tamil", native: "தமிழ்" },
    { id: "Gujarati", label: "Gujarati", native: "ગુજરાતી" },
    { id: "Urdu", label: "Urdu", native: "اردو" },
    { id: "Kannada", label: "Kannada", native: "ಕನ್ನಡ" },
    { id: "Odia", label: "Odia", native: "ଓଡ଼ିଆ" },
    { id: "Malayalam", label: "Malayalam", native: "മലയാളം" },
    { id: "Punjabi", label: "Punjabi", native: "ਪੰਜਾਬੀ" },
  ];

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get(`${api.Url}/user/get-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setUserData(res.data);
        }
      } catch (error) {
        setNotification({
          show: true,
          message: "Error fetching user data.",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getUserData();
    }
  }, [token]);

  const handleLanguageSelect = async (id) => {
    if (updating || userData?.preferredLanguage === id) return;
    setUpdating(true);

    try {
      const res = await axios.put(
        `${api.Url}/user/update-profile`,
        { ...userData, preferredLanguage: id },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data && res.data.user) {
        setUserData(res.data.user);
        if (typeof window !== 'undefined') {
          localStorage.setItem("userProfileData", JSON.stringify(res.data.user));
          // Dispatch a custom event to notify ProfileLists to reload its state
          window.dispatchEvent(new Event('userProfileUpdated'));
        }
      }

      setNotification({
        show: true,
        message: "Language preference updated successfully!",
        type: "success",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to update language. Try again!",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <header className="profile-setting-header-new">
        <PopNoti
          message={notification.message}
          type={notification.type}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
        <button className="back-btn-new" onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7.82843 10.9999H20V12.9999H7.82843L13.1924 18.3638L11.7782 19.778L4 11.9999L11.7782 4.22168L13.1924 5.63589L7.82843 10.9999Z"></path>
          </svg>
        </button>
        <h2>Preferred Language</h2>
      </header>

      <div className="ios-settings-container" style={{ minHeight: 'auto', paddingBottom: '80px' }}>
        {loading ? (
          <div className="ios-skeleton-container-premium">
            <div className="ios-skeleton-group-premium">
              <div className="ios-skeleton-card-form">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="ios-skeleton-form-row shimmer-bg" style={{ height: '30px', margin: '5px 0' }}></div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="ios-settings-group">
            <h3 className="ios-group-title">SELECT LANGUAGE</h3>
            <div className="ios-list">
              {languageOptions.map(({ id, label, native }) => {
                const isSelected = userData?.preferredLanguage === id;
                return (
                  <div
                    key={id}
                    className={`ios-list-item ios-nav-item ${isSelected ? 'active' : ''}`}
                    onClick={() => handleLanguageSelect(id)}
                    style={{ cursor: updating ? 'not-allowed' : 'pointer' }}
                  >
                    <div className="ios-item-left" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span className="ios-item-title" style={{ fontSize: '1.05rem', color: isSelected ? 'var(--ios-theme-accent)' : '#fff', fontWeight: isSelected ? '600' : '400' }}>
                        {label}
                      </span>
                      <span style={{ color: 'var(--ios-text-secondary)', fontSize: '0.9rem' }}>
                        ({native})
                      </span>
                    </div>
                    {isSelected && <FaCheck style={{ color: 'var(--ios-theme-accent)' }} />}
                  </div>
                );
              })}
            </div>
            <p className="ios-group-footer">Choose the language your AI companions will use to chat and call with you.</p>
          </div>
        )}
      </div>
    </>
  );
}

export default LanguageSection;
