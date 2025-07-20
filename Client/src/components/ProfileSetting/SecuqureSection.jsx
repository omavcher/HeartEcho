import { useEffect, useState } from "react"; 
import MiniMap from '../MiniMap.jsx';
import axios from 'axios';
import PopNoti from "../PopNoti.jsx";
import api from "../../config/api.js";

function SecuqureSection({ onBackSBTNSelect }) {
  const [recentLogins, setRecentLogins] = useState([]);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const token = localStorage.getItem("token");

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
      }
    };

    if (token) fetchLoginDetails();
  }, [token]);

  useEffect(() => {
    console.log("Updated Recent Logins:", recentLogins);
  }, [recentLogins]);

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

      <div className="security-page">
        <section className="login-history">
          <h2>📍 Recent Logins</h2>
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Device</th>
                  <th>Location</th>
                  <th>IP Address</th>
                  <th>Time</th>
                  <th>Map</th>
                </tr>
              </thead>
              <tbody>
                {recentLogins.length > 0 ? (
                  recentLogins.map((login, index) => (
                    <tr key={index}>
                      <td>{login.platform || "Unknown Device"}</td>
                      <td>{login.location || "Unknown Location"}</td>
                      <td>{login.ip}</td>
                      <td>
  <div>{new Date(login.time).toLocaleDateString()}</div>
  <div>{new Date(login.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</div>
</td>
                      <td>
                        <MiniMap coords={[login.coordinates?.lon || 0, login.coordinates?.lat || 0]} />
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>No recent logins found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </>
  );
}

export default SecuqureSection;
