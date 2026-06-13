import { useEffect, useState } from "react"; 
import axios from 'axios';
import PopNoti from "../PopNoti.jsx";
import api from "../../config/api.js";

function SecuqureSection({ onBackSBTNSelect }) {
  const [recentLogins, setRecentLogins] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem("token");
      setToken(storedToken);
      if (!storedToken) {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const fetchLoginDetails = async () => {
      try {
        const response = await axios.get(`${api.Url}/user/login-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        console.log("API Response:", response.data); // ✅ Log API response
        setRecentLogins(response.data); 

      } catch (error) {
        console.error("Error fetching login details:", error);
        setNotification({
          show: true,
          message: "⚠️ Failed to load login details!",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchLoginDetails();
  }, [token]);

  useEffect(() => {
    console.log("Updated Recent Logins:", recentLogins);
  }, [recentLogins]);

  if (loading) {
    return (
      <div className="ios-settings-container">
        <header className='profile-setting-header3'>
          <h2>Security Alerts</h2>
          <button onClick={() => onBackSBTNSelect(true)}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
            </svg>
          </button>
        </header>
        <div className="security-page">
          <section className="login-history">
            <h2>📍 Recent Logins</h2>
            <div className="ios-skeleton-card-form" style={{ marginTop: '1rem', gap: '1.25rem', padding: '1.5rem 1rem' }}>
              <div className="ios-skeleton-form-row shimmer-bg"></div>
              <div className="ios-skeleton-form-row shimmer-bg"></div>
              <div className="ios-skeleton-form-row shimmer-bg"></div>
              <div className="ios-skeleton-form-row shimmer-bg"></div>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <>
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      <header className='profile-setting-header3'>
        <h2>Security Alerts</h2>
        <button onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="ios-settings-container">
        <div className="ios-settings-group">
          <h3 className="ios-group-title">📍 RECENT LOGINS</h3>
          <div className="ios-list">
            {recentLogins.length > 0 ? (
              recentLogins.map((login, index) => {
                const isMobile = login.platform?.toLowerCase().includes('mobile') || 
                                 login.platform?.toLowerCase().includes('android') || 
                                 login.platform?.toLowerCase().includes('ios') || 
                                 login.platform?.toLowerCase().includes('phone');
                return (
                  <div key={index} className="ios-list-item ios-login-session-row">
                    <div className="ios-item-left" style={{ alignItems: 'center' }}>
                      <div className="ios-icon-box" style={{ background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.08)', color: 'var(--ios-theme-accent)' }}>
                        {isMobile ? (
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"/>
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '18px', height: '18px' }}>
                            <path d="M22 18H2v-2h20v2zm-2-4H4V3h16v11z"/>
                          </svg>
                        )}
                      </div>
                      <div className="ios-item-stack" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                        <span className="ios-item-title" style={{ fontSize: '1.02rem', fontWeight: 600 }}>{login.platform || "Unknown Device"}</span>
                        <span className="ios-item-subtitle" style={{ fontSize: '0.85rem', color: 'var(--ios-text-secondary)' }}>
                          IP: {login.ip} • {login.location || "Unknown Location"}
                        </span>
                      </div>
                    </div>
                    <div className="ios-item-right" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                      <span className="ios-item-subtitle" style={{ fontSize: '0.82rem', color: 'var(--ios-text-secondary)', fontWeight: 500 }}>
                        {new Date(login.time).toLocaleDateString("en-GB")}
                      </span>
                      <span className="ios-item-subtitle" style={{ fontSize: '0.75rem', color: 'var(--ios-text-secondary)' }}>
                        {new Date(login.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </span>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="ios-list-item">
                <span className="ios-item-title" style={{ color: 'var(--ios-text-secondary)' }}>No recent logins found.</span>
              </div>
            )}
          </div>
          <p className="ios-group-footer">If you notice any suspicious device or login activity, please contact support immediately.</p>
        </div>
      </div>
    </>
  );
}

export default SecuqureSection;
