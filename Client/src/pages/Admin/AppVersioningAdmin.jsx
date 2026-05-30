'use client';

import { useState, useEffect, useCallback } from "react";
import { FaMobileAlt, FaSave, FaSync, FaExclamationTriangle, FaCheckCircle, FaPlay } from "react-icons/fa";
import axios from "axios";
import api from "../../config/api";

const styles = `
.ver-root-x30sn {
  color: #ffffff;
  font-family: 'Inter', -apple-system, sans-serif;
  animation: fadeIn-x30sn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes fadeIn-x30sn { 
  from { opacity: 0; transform: translateY(10px); } 
  to { opacity: 1; transform: translateY(0); } 
}

.ver-header-x30sn {
  display: flex; 
  justify-content: space-between; 
  align-items: center;
  margin-bottom: 32px; 
  padding: 24px;
  background: rgba(17, 17, 17, 0.6); 
  backdrop-filter: blur(12px);
  border-radius: 20px; 
  border: 1px solid #333;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
}

.ver-title-x30sn { 
  font-size: 32px; 
  font-weight: 800; 
  margin: 0; 
  letter-spacing: -0.5px;
  background: linear-gradient(to right, #fff, #ff69b4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.ver-subtitle-x30sn { 
  font-size: 14px; 
  color: #ff69b4; 
  margin-top: 4px; 
  font-weight: 600; 
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ver-card-x30sn {
  background: rgba(17, 17, 17, 0.6);
  padding: 32px; 
  border-radius: 24px; 
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
  max-width: 650px;
  margin: 0 auto;
}

.ver-form-group-x30sn {
  margin-bottom: 24px;
}

.ver-form-group-x30sn label {
  display: block;
  font-size: 12px;
  color: #ff69b4;
  font-weight: 700;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.ver-form-input-x30sn {
  width: 100%; 
  padding: 14px 18px; 
  background: rgba(255, 255, 255, 0.03); 
  border: 1px solid rgba(255, 255, 255, 0.1); 
  color: #fff; 
  border-radius: 14px; 
  outline: none; 
  font-size: 15px;
  transition: all 0.3s ease;
}

.ver-form-input-x30sn:focus {
  border-color: #ff69b4;
  background: rgba(255, 255, 255, 0.05);
  box-shadow: 0 0 15px rgba(255, 105, 180, 0.1);
}

.ver-btn-x30sn {
  display: flex; 
  align-items: center; 
  justify-content: center;
  gap: 10px; 
  background: #ff69b4; 
  color: #000; 
  border: none;
  padding: 14px 28px; 
  border-radius: 14px;
  font-size: 16px; 
  font-weight: 700; 
  cursor: pointer; 
  transition: all 0.3s ease;
  width: 100%;
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.3);
}

.ver-btn-x30sn:hover:not(:disabled) { 
  background: #ff85c2; 
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 105, 180, 0.4);
}

.ver-btn-x30sn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.ver-toast-x30sn {
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 500;
}

.ver-toast-x30sn.success {
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  color: #22c55e;
}

.ver-toast-x30sn.error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  color: #ef4444;
}

.ver-info-box-x30sn {
  background: rgba(255, 255, 255, 0.02);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 14px;
  padding: 16px;
  margin-top: 24px;
  font-size: 13px;
  color: #888;
  line-height: 1.5;
}
`;

const AppVersioningAdmin = () => {
  const [latestVersion, setLatestVersion] = useState("1.0.3");
  const [latestBuildNumber, setLatestBuildNumber] = useState(6);
  const [playStoreUrl, setPlayStoreUrl] = useState("https://play.google.com/store/apps/details?id=com.heartecho.ai");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchVersionInfo = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/app-version`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success && res.data.versionInfo) {
        const { latestVersion, latestBuildNumber, playStoreUrl } = res.data.versionInfo;
        setLatestVersion(latestVersion);
        setLatestBuildNumber(latestBuildNumber);
        setPlayStoreUrl(playStoreUrl);
      }
    } catch (e) {
      console.error(e);
      setError("Failed to load app version configuration.");
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => {
    fetchVersionInfo();
  }, [fetchVersionInfo]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const token = getToken();
      const res = await axios.post(`${api.Url}/admin/app-version`, {
        latestVersion,
        latestBuildNumber: Number(latestBuildNumber),
        playStoreUrl
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setMessage("App version updated successfully! Mobile clients will now be prompted to update.");
        setTimeout(() => setMessage(""), 5000);
      }
    } catch (e) {
      console.error(e);
      setError(e.response?.data?.message || "Failed to save configuration updates.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ background: '#000', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ff69b4' }}>
        Loading App Version Configurations...
      </div>
    );
  }

  return (
    <div className="ver-root-x30sn">
      <style>{styles}</style>

      {/* HEADER */}
      <div className="ver-header-x30sn">
        <div className="ver-title-group-x30sn">
          <h2 className="ver-title-x30sn">App Version Control</h2>
          <p className="ver-subtitle-x30sn">Manage Live App Releases & Upgrade Prompts</p>
        </div>
        <button className="ver-btn-x30sn" style={{ width: 'auto', padding: '12px 20px', background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} onClick={fetchVersionInfo}>
          <FaSync /> Reload
        </button>
      </div>

      <div className="ver-card-x30sn">
        {message && (
          <div className="ver-toast-x30sn success">
            <FaCheckCircle size={18} />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="ver-toast-x30sn error">
            <FaExclamationTriangle size={18} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSave}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div className="ver-form-group-x30sn">
              <label>Latest Version Name</label>
              <input 
                className="ver-form-input-x30sn" 
                type="text" 
                placeholder="e.g. 1.0.3" 
                required 
                value={latestVersion} 
                onChange={e => setLatestVersion(e.target.value)} 
              />
            </div>
            <div className="ver-form-group-x30sn">
              <label>Latest Build Number</label>
              <input 
                className="ver-form-input-x30sn" 
                type="number" 
                placeholder="e.g. 6" 
                required 
                value={latestBuildNumber} 
                onChange={e => setLatestBuildNumber(e.target.value)} 
              />
            </div>
          </div>

          <div className="ver-form-group-x30sn">
            <label>Google Play Store URL</label>
            <input 
              className="ver-form-input-x30sn" 
              type="url" 
              placeholder="Google Play Store link for user update action" 
              required 
              value={playStoreUrl} 
              onChange={e => setPlayStoreUrl(e.target.value)} 
            />
          </div>

          <button type="submit" className="ver-btn-x30sn" disabled={saving}>
            <FaSave /> {saving ? "Saving Changes..." : "Apply Live Upgrade"}
          </button>
        </form>

        <div className="ver-info-box-x30sn">
          <FaPlay style={{ color: '#ff69b4', marginRight: '6px', fontSize: '10px' }} />
          <strong>How this works:</strong> The HeartEcho Flutter mobile application checks these values on startup and inside the user Profile screen. If a user's local build number is lower than the <em>Latest Build Number</em> configured above, the app displays an update notification button redirecting them directly to the Play Store link.
        </div>
      </div>
    </div>
  );
};

export default AppVersioningAdmin;
