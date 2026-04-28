'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import { 
  FaBell, FaUsers, FaUser, FaPaperPlane, FaSearch, 
  FaMobileAlt, FaInfoCircle, FaTrash, FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";
import axios from "axios";
import api from "../../config/api";

const notificationStyles = `
.notif-root-x30sn {
  color: #fff;
  font-family: 'Inter', sans-serif;
  animation: fadeIn-x30sn 0.5s ease;
  max-width: 1200px;
  margin: 0 auto;
}

@keyframes fadeIn-x30sn { from { opacity: 0; } to { opacity: 1; } }

.notif-header-x30sn {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.notif-title-x30sn {
  font-size: 28px;
  font-weight: 800;
  color: #fff;
  margin: 0;
}

.notif-tagline-x30sn {
  color: #ff69b4;
  font-size: 13px;
  font-weight: 500;
}

.notif-grid-x30sn {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 30px;
}

@media (max-width: 992px) {
  .notif-grid-x30sn {
    grid-template-columns: 1fr;
  }
}

.card-x30sn {
  background: #050505;
  border: 1px solid #222;
  border-radius: 16px;
  padding: 25px;
  height: fit-content;
}

.card-title-x30sn {
  font-size: 18px;
  font-weight: 700;
  margin-bottom: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.card-title-x30sn svg {
  color: #ff69b4;
}

.form-group-x30sn {
  margin-bottom: 20px;
}

.form-label-x30sn {
  display: block;
  font-size: 12px;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 8px;
  font-weight: 600;
}

.form-input-x30sn, .form-textarea-x30sn, .form-select-x30sn {
  width: 100%;
  background: #000;
  border: 1px solid #333;
  border-radius: 10px;
  padding: 12px 15px;
  color: #fff;
  outline: none;
  font-size: 14px;
  transition: border-color 0.3s;
}

.form-input-x30sn:focus, .form-textarea-x30sn:focus, .form-select-x30sn:focus {
  border-color: #ff69b4;
}

.form-textarea-x30sn {
  min-height: 100px;
  resize: vertical;
}

.target-toggle-x30sn {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.toggle-btn-x30sn {
  flex: 1;
  background: #111;
  border: 1px solid #222;
  color: #888;
  padding: 12px;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.3s;
}

.toggle-btn-x30sn.active {
  background: rgba(255, 105, 180, 0.1);
  border-color: #ff69b4;
  color: #ff69b4;
}

.user-selector-x30sn {
  background: #000;
  border: 1px solid #333;
  border-radius: 12px;
  padding: 15px;
  margin-top: 10px;
}

.search-wrap-x30sn {
  position: relative;
  margin-bottom: 15px;
}

.search-wrap-x30sn svg {
  position: absolute;
  left: 12px;
  top: 12px;
  color: #555;
}

.search-input-x30sn {
  width: 100%;
  padding: 10px 10px 10px 35px;
  background: #111;
  border: 1px solid #222;
  border-radius: 8px;
  color: #fff;
  font-size: 13px;
  outline: none;
}

.user-list-x30sn {
  max-height: 200px;
  overflow-y: auto;
}

.user-item-x30sn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.user-item-x30sn:hover {
  background: #1a1a1a;
}

.user-avatar-x30sn {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info-mini-x30sn {
  flex: 1;
}

.user-name-mini-x30sn {
  font-size: 13px;
  font-weight: 600;
  display: block;
}

.user-email-mini-x30sn {
  font-size: 11px;
  color: #666;
}

.selected-users-x30sn {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 10px;
}

.user-tag-x30sn {
  background: #111;
  border: 1px solid #333;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.remove-user-x30sn {
  cursor: pointer;
  color: #ff4444;
}

.preview-phone-x30sn {
  width: 280px;
  height: 560px;
  background: #111;
  border: 8px solid #222;
  border-radius: 36px;
  margin: 0 auto;
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 50px rgba(0,0,0,0.5);
}

.phone-top-x30sn {
  height: 20px;
  width: 100px;
  background: #222;
  margin: 10px auto;
  border-radius: 10px;
}

.notif-banner-x30sn {
  background: rgba(255, 255, 255, 0.95);
  margin: 10px;
  border-radius: 12px;
  padding: 12px;
  color: #000;
  display: flex;
  gap: 10px;
  box-shadow: 0 4px 15px rgba(0,0,0,0.2);
  animation: slideDown-x30sn 0.5s ease;
}

@keyframes slideDown-x30sn {
  from { transform: translateY(-50px); opacity: 0; }
  to { transform: translateY(0); opacity: 1; }
}

.notif-icon-circle-x30sn {
  width: 32px;
  height: 32px;
  background: #000;
  color: #fff;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
}

.notif-content-preview-x30sn {
  flex: 1;
}

.notif-title-preview-x30sn {
  font-weight: 700;
  font-size: 13px;
  display: block;
  margin-bottom: 2px;
}

.notif-body-preview-x30sn {
  font-size: 12px;
  color: #333;
  line-height: 1.3;
}

.send-btn-x30sn {
  width: 100%;
  background: linear-gradient(45deg, #ff69b4, #b042ff);
  border: none;
  color: #fff;
  padding: 15px;
  border-radius: 12px;
  font-weight: 800;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
  transition: all 0.3s;
  box-shadow: 0 10px 20px rgba(255, 105, 180, 0.2);
}

.send-btn-x30sn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 15px 30px rgba(255, 105, 180, 0.4);
}

.send-btn-x30sn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.char-count-x30sn {
  font-size: 11px;
  color: #666;
  text-align: right;
  margin-top: 4px;
}

.status-msg-x30sn {
  padding: 12px;
  border-radius: 10px;
  margin-top: 15px;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.status-msg-x30sn.success {
  background: rgba(0, 200, 0, 0.1);
  color: #00ff00;
  border: 1px solid rgba(0, 200, 0, 0.2);
}

.status-msg-x30sn.error {
  background: rgba(255, 0, 0, 0.1);
  color: #ff4444;
  border: 1px solid rgba(255, 0, 0, 0.2);
}

.stats-bar-x30sn {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 30px;
}

.stat-item-x30sn {
    background: #050505;
    border: 1px solid #222;
    padding: 20px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.stat-icon-x30sn {
    width: 45px;
    height: 45px;
    border-radius: 12px;
    background: rgba(255, 105, 180, 0.1);
    color: #ff69b4;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 20px;
}

.stat-info-x30sn span {
    display: block;
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
}

.stat-info-x30sn strong {
    font-size: 20px;
    color: #fff;
}
`;

const NotificationsAdmin = () => {
  const [target, setTarget] = useState("all"); // "all" or "specific"
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: '' }
  const [stats, setStats] = useState({ totalUsers: 0, mobileUsers: 0 });

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchData = useCallback(async () => {
    try {
      const token = getToken();
      const res = await axios.get(`${api.Url}/admin/user-dataw`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.userData) {
        setUsers(res.data.userData);
        const mobileCount = res.data.userData.filter(u => u.isMobileUser || u.fcmToken).length;
        setStats({
          totalUsers: res.data.userData.length,
          mobileUsers: mobileCount
        });
      }
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, [getToken]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return [];
    return users.filter(u => 
      (u.name?.toLowerCase().includes(searchQuery.toLowerCase()) || 
       u.email?.toLowerCase().includes(searchQuery.toLowerCase())) &&
      !selectedUsers.find(su => su._id === u._id)
    ).slice(0, 5);
  }, [users, searchQuery, selectedUsers]);

  const handleSelectUser = (user) => {
    if (!user.fcmToken) {
        alert("This user does not have a mobile token registered.");
        return;
    }
    setSelectedUsers([...selectedUsers, user]);
    setSearchQuery("");
  };

  const handleRemoveUser = (userId) => {
    setSelectedUsers(selectedUsers.filter(u => u._id !== userId));
  };

  const handleSend = async () => {
    if (!title || !body) {
      setStatus({ type: 'error', message: 'Please enter both title and message body.' });
      return;
    }

    if (target === 'specific' && selectedUsers.length === 0) {
      setStatus({ type: 'error', message: 'Please select at least one user.' });
      return;
    }

    setLoading(true);
    setStatus(null);

    try {
      const token = getToken();
      const payload = {
        target,
        title,
        body,
        userIds: target === 'specific' ? selectedUsers.map(u => u._id) : []
      };

      const res = await axios.post(`${api.Url}/admin/send-notification`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        setStatus({ type: 'success', message: res.data.message });
        setTitle("");
        setBody("");
        setSelectedUsers([]);
      }
    } catch (err) {
      setStatus({ 
        type: 'error', 
        message: err.response?.data?.message || 'Failed to send notification.' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{notificationStyles}</style>
      <div className="notif-root-x30sn">
        
        <header className="notif-header-x30sn">
          <div>
            <h1 className="notif-title-x30sn">Push Notifications</h1>
            <span className="notif-tagline-x30sn">Engage users with real-time mobile alerts</span>
          </div>
          <div className="stat-info-x30sn" style={{textAlign:'right'}}>
              <span style={{color:'#ff69b4', fontWeight:'700'}}>Active Systems</span>
              <strong style={{fontSize:14, color:'#aaa'}}>FCM • Node.js • MongoDB</strong>
          </div>
        </header>

        <div className="stats-bar-x30sn">
            <div className="stat-item-x30sn">
                <div className="stat-icon-x30sn"><FaUsers /></div>
                <div className="stat-info-x30sn">
                    <span>Total Database Users</span>
                    <strong>{stats.totalUsers}</strong>
                </div>
            </div>
            <div className="stat-item-x30sn">
                <div className="stat-icon-x30sn" style={{color:'#00ff00', background:'rgba(0,255,0,0.1)'}}><FaMobileAlt /></div>
                <div className="stat-info-x30sn">
                    <span>Push-Ready Users</span>
                    <strong>{stats.mobileUsers}</strong>
                </div>
            </div>
            <div className="stat-item-x30sn">
                <div className="stat-icon-x30sn" style={{color:'#ffcc00', background:'rgba(255,204,0,0.1)'}}><FaCheckCircle /></div>
                <div className="stat-info-x30sn">
                    <span>Server Status</span>
                    <strong style={{color:'#00ff00'}}>Online</strong>
                </div>
            </div>
        </div>

        <div className="notif-grid-x30sn">
          
          <div className="card-x30sn">
            <div className="card-title-x30sn"><FaPaperPlane /> Composer</div>
            
            <div className="form-group-x30sn">
              <label className="form-label-x30sn">Notification Target</label>
              <div className="target-toggle-x30sn">
                <button 
                  className={`toggle-btn-x30sn ${target === 'all' ? 'active' : ''}`}
                  onClick={() => setTarget('all')}
                >
                  <FaUsers /> All Mobile Users
                </button>
                <button 
                  className={`toggle-btn-x30sn ${target === 'specific' ? 'active' : ''}`}
                  onClick={() => setTarget('specific')}
                >
                  <FaUser /> Specific Users
                </button>
              </div>
            </div>

            {target === 'specific' && (
              <div className="form-group-x30sn">
                <label className="form-label-x30sn">Select Recipients</label>
                <div className="user-selector-x30sn">
                  <div className="search-wrap-x30sn">
                    <FaSearch />
                    <input 
                      type="text" 
                      className="search-input-x30sn" 
                      placeholder="Search users by name or email..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  {filteredUsers.length > 0 && (
                    <div className="user-list-x30sn">
                      {filteredUsers.map(u => (
                        <div key={u._id} className="user-item-x30sn" onClick={() => handleSelectUser(u)}>
                          <img 
                            src={u.profile_picture || "https://cdn-icons-png.flaticon.com/512/149/149071.png"} 
                            className="user-avatar-x30sn" 
                            alt=""
                          />
                          <div className="user-info-mini-x30sn">
                            <span className="user-name-mini-x30sn">{u.name}</span>
                            <span className="user-email-mini-x30sn">{u.email}</span>
                          </div>
                          {!u.fcmToken && <FaExclamationTriangle style={{color:'#ffcc00', fontSize:10}} title="No Token"/>}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="selected-users-x30sn">
                    {selectedUsers.map(u => (
                      <div key={u._id} className="user-tag-x30sn">
                        {u.name}
                        <FaTrash className="remove-user-x30sn" onClick={() => handleRemoveUser(u._id)} />
                      </div>
                    ))}
                    {selectedUsers.length === 0 && <span style={{fontSize:11, color:'#444'}}>No users selected</span>}
                  </div>
                </div>
              </div>
            )}

            <div className="form-group-x30sn">
              <label className="form-label-x30sn">Notification Title</label>
              <input 
                type="text" 
                className="form-input-x30sn" 
                placeholder="e.g. New Story Alert! 💖"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={50}
              />
              <div className="char-count-x30sn">{title.length}/50</div>
            </div>

            <div className="form-group-x30sn">
              <label className="form-label-x30sn">Message Body</label>
              <textarea 
                className="form-textarea-x30sn" 
                placeholder="Write your message here..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                maxLength={150}
              />
              <div className="char-count-x30sn">{body.length}/150</div>
            </div>

            <button 
              className="send-btn-x30sn"
              disabled={loading || !title || !body || (target === 'specific' && selectedUsers.length === 0)}
              onClick={handleSend}
            >
              {loading ? (
                <>Sending...</>
              ) : (
                <>
                  <FaPaperPlane /> 
                  Send to {target === 'all' ? stats.mobileUsers : selectedUsers.length} Devices
                </>
              )}
            </button>

            {status && (
              <div className={`status-msg-x30sn ${status.type}`}>
                {status.type === 'success' ? <FaCheckCircle /> : <FaExclamationTriangle />}
                {status.message}
              </div>
            )}
          </div>

          <div className="card-x30sn">
            <div className="card-title-x30sn"><FaMobileAlt /> Live Preview</div>
            <p style={{fontSize:12, color:'#666', marginBottom:20}}>
              See how your notification will appear on a user's lock screen.
            </p>

            <div className="preview-phone-x30sn">
              <div className="phone-top-x30sn"></div>
              
              {(title || body) && (
                <div className="notif-banner-x30sn">
                  <div className="notif-icon-circle-x30sn">H</div>
                  <div className="notif-content-preview-x30sn">
                    <span className="notif-title-preview-x30sn">{title || "Notification Title"}</span>
                    <span className="notif-body-preview-x30sn">
                      {body || "Your notification message will appear here. Keep it concise for better engagement."}
                    </span>
                  </div>
                </div>
              )}

              <div style={{marginTop: 300, textAlign:'center', color:'#222', fontSize:40, fontWeight:900, letterSpacing:2}}>
                HEART ECHO
              </div>
            </div>

            <div style={{marginTop: 25, background:'#111', padding:15, borderRadius:12, border:'1px solid #222'}}>
                <div style={{display:'flex', gap:10, alignItems:'center', marginBottom:10}}>
                    <FaInfoCircle style={{color:'#ff69b4'}}/>
                    <span style={{fontSize:13, fontWeight:700}}>Pro Tip</span>
                </div>
                <p style={{fontSize:12, color:'#888', margin:0, lineHeight:1.4}}>
                    Use emojis to increase open rates by up to 25%. Keep titles under 40 characters for full visibility on all devices.
                </p>
            </div>
          </div>

        </div>
      </div>
    </>
  );
};

export default NotificationsAdmin;
