'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  FaTrash, FaSearch, FaSync, FaUserSlash, FaIdBadge, FaPhone, FaHistory, FaCalendarAlt, FaEnvelope, FaChartBar
} from "react-icons/fa";
import axios from "axios";
import api from "../../config/api";

const deletedStyles = `
/* ROOT THEME */
.deleted-root-x30sn {
  color: #fff;
  font-family: 'Inter', sans-serif;
  animation: fadeIn-x30sn 0.5s ease;
}
@keyframes fadeIn-x30sn { from { opacity: 0; } to { opacity: 1; } }

/* HEADER */
.u-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; flex-wrap: wrap; gap: 15px;
}
.u-title-x30sn { font-size: 28px; font-weight: 800; color: #fff; margin: 0; }
.u-tagline-x30sn { color: #ff4444; font-size: 13px; font-weight: 500; }

.u-sync-btn-x30sn {
  background: #000; border: 1px solid #333; color: #ff69b4; width: 42px; height: 42px;
  border-radius: 10px; display: flex; align-items: center; justify-content: center; cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
.u-sync-btn-x30sn:hover { background: #1a1a1a; transform: rotate(180deg); border-color: #ff69b4; }

/* CONTROLS */
.controls-x30sn {
  display: flex; gap: 10px; margin-bottom: 25px; flex-wrap: wrap;
  background: #050505; padding: 15px; border-radius: 12px; border: 1px solid #222;
}
.search-wrap-x30sn {
  position: relative; flex: 1; min-width: 250px;
}
.search-wrap-x30sn svg { position: absolute; left: 14px; top: 12px; color: #555; }
.search-inp-x30sn {
  width: 100%; padding: 10px 10px 10px 40px; background: #000; border: 1px solid #333;
  border-radius: 8px; color: #fff; outline: none; font-size: 14px;
}
.search-inp-x30sn:focus { border-color: #ff69b4; }

/* USER GRID */
.u-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 20px;
}
.u-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px;
  transition: all 0.3s; position: relative;
}
.u-card-x30sn:hover { border-color: #ff4444; box-shadow: 0 10px 30px rgba(0,0,0,0.5); transform: translateY(-3px); }

.uc-top-x30sn { display: flex; justify-content: space-between; margin-bottom: 15px; align-items: flex-start; }
.img-wrap-x30sn {
    width: 56px; height: 56px; border-radius: 50%; padding: 2px;
    background: linear-gradient(45deg, #ff4444, #000);
    display: flex; align-items: center; justify-content: center;
    font-size: 24px; color: #fff;
}
.uc-badge-x30sn {
  font-size: 9px; padding: 5px 10px; border-radius: 20px; background: #1a1a1a; color: #888; 
  height: fit-content; text-transform: uppercase; font-weight: 700; border: 1px solid #333;
}
.uc-badge-x30sn.danger { background: #ff4444; color: #fff; border: none; box-shadow: 0 0 10px rgba(255,68,68,0.4); }

.uc-info-x30sn h4 { margin: 0 0 4px 0; color: #fff; font-size: 16px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.uc-email-x30sn { display: flex; align-items: center; gap: 6px; color: #aaa; font-size: 13px; margin-bottom: 12px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }

.uc-meta-x30sn {
  background: #000; padding: 12px; border-radius: 10px; display: grid; gap: 8px; margin-bottom: 15px; border: 1px solid #1a1a1a;
}
.uc-row-x30sn { display: flex; align-items: center; gap: 8px; font-size: 11px; color: #999; }
.uc-row-x30sn svg { color: #ff4444; font-size: 12px; }

.stats-grid-x30sn {
  display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; background: #0a0a0a; padding: 15px; border-radius: 10px; border: 1px dashed #333; margin-top: 15px;
}
.stat-box-x30sn { display: flex; flex-direction: column; gap: 4px; }
.stat-lbl-x30sn { font-size: 10px; color: #777; text-transform: uppercase; font-weight: 600; }
.stat-val-x30sn { font-size: 16px; font-weight: 700; color: #ddd; }

/* PAGINATION */
.pg-wrap-x30sn { display: flex; justify-content: center; gap: 15px; margin-top: 40px; align-items: center; padding-bottom: 40px; }
.pg-btn-x30sn { 
    background: #000; border: 1px solid #333; color: #fff; padding: 8px 18px; 
    border-radius: 8px; cursor: pointer; transition: 0.2s; font-size: 13px;
}
.pg-btn-x30sn:hover:not(:disabled) { border-color: #ff69b4; color: #ff69b4; }
.pg-btn-x30sn:disabled { opacity: 0.3; cursor: not-allowed; }

/* LOADING */
.loader-x30sn { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 400px; color: #444; }
.spinner-x30sn { width: 30px; height: 30px; border: 2px solid #222; border-top-color: #ff69b4; border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 10px; }
@keyframes spin { to { transform: rotate(360deg); } }
`;

const DeletedAccountsAdmin = () => {
  const [accounts, setAccounts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const itemsPerPage = 6;

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchDeletedAccounts = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/deleted-accounts`, { 
        headers: { Authorization: `Bearer ${token}` } 
      });
      if (response.data.success) {
        setAccounts(response.data.data);
      }
    } catch (error) { 
      console.error("Fetch Error:", error); 
    } finally { 
      setLoading(false); 
    }
  }, [getToken]);

  useEffect(() => { fetchDeletedAccounts(); }, [fetchDeletedAccounts]);

  // --- FILTER LOGIC ---
  const filteredAccounts = useMemo(() => {
    return accounts.filter(u => {
      const q = searchTerm.toLowerCase();
      return (u.name && u.name.toLowerCase().includes(q)) || 
             (u.email && u.email.toLowerCase().includes(q)) ||
             (u.originalUserId && u.originalUserId.includes(q)) ||
             (u.phone_number && u.phone_number.includes(q));
    });
  }, [accounts, searchTerm]);

  const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return <div className="loader-x30sn"><div className="spinner-x30sn"></div><p>Fetching Deleted Accounts...</p></div>;

  return (
    <>
      <style>{deletedStyles}</style>
      <div className="deleted-root-x30sn">
        
        {/* HEADER */}
        <header className="u-header-x30sn">
          <div>
            <h1 className="u-title-x30sn">Deleted Accounts Archive</h1>
            <span className="u-tagline-x30sn">Permanent Deletion Logs • {accounts.length} Total Records</span>
          </div>
          <button className="u-sync-btn-x30sn" onClick={fetchDeletedAccounts}><FaSync /></button>
        </header>

        {/* CONTROLS */}
        <div className="controls-x30sn">
          <div className="search-wrap-x30sn">
            <FaSearch />
            <input 
              type="text" 
              className="search-inp-x30sn" 
              placeholder="Search by name, email, phone or user ID..." 
              value={searchTerm} 
              onChange={e => setSearchTerm(e.target.value)} 
            />
          </div>
        </div>

        {/* USER LIST GRID */}
        <div className="u-grid-x30sn">
          {filteredAccounts.length === 0 ? (
            <div style={{gridColumn: "1 / -1", textAlign: "center", padding: "50px", color: "#555"}}>
              <FaUserSlash style={{fontSize: 48, marginBottom: 15, opacity: 0.5}} />
              <h3>No deleted accounts found</h3>
            </div>
          ) : paginatedAccounts.map(account => (
            <div key={account._id} className="u-card-x30sn">
              <div className="uc-top-x30sn">
                <div className="img-wrap-x30sn">
                  <FaUserSlash />
                </div>
                <span className="uc-badge-x30sn danger">
                  Deleted
                </span>
              </div>
              
              <div className="uc-info-x30sn">
                <h4>{account.name || "Unknown User"}</h4>
                <div className="uc-email-x30sn"><FaEnvelope style={{color: "#777"}}/> {account.email || "No Email"}</div>
                
                <div className="uc-meta-x30sn">
                    <div className="uc-row-x30sn"><FaIdBadge/> Orig ID: {account.originalUserId ? account.originalUserId.slice(-6).toUpperCase() : '---'}</div>
                    <div className="uc-row-x30sn"><FaPhone/> Phone: {account.phone_number || 'N/A'}</div>
                    <div className="uc-row-x30sn"><FaCalendarAlt/> Joined: {account.joinedAt ? new Date(account.joinedAt).toLocaleDateString() : 'N/A'}</div>
                    <div className="uc-row-x30sn"><FaHistory/> Deleted: {new Date(account.deletedAt).toLocaleString()}</div>
                </div>

                <div className="stats-grid-x30sn">
                    <div className="stat-box-x30sn">
                        <span className="stat-lbl-x30sn">Total Chats</span>
                        <span className="stat-val-x30sn">{account.stats?.totalChats || 0}</span>
                    </div>
                    <div className="stat-box-x30sn">
                        <span className="stat-lbl-x30sn">Total Msgs</span>
                        <span className="stat-val-x30sn">{account.stats?.totalMessages || 0}</span>
                    </div>
                    <div className="stat-box-x30sn">
                        <span className="stat-lbl-x30sn">Payments</span>
                        <span className="stat-val-x30sn">{account.stats?.totalPayments || 0}</span>
                    </div>
                    <div className="stat-box-x30sn">
                        <span className="stat-lbl-x30sn">AI Friends</span>
                        <span className="stat-val-x30sn">{account.stats?.totalAIFriends || 0}</span>
                    </div>
                </div>
                
                {account.lastPayment && account.lastPayment.amount ? (
                  <div style={{marginTop: "15px", padding: "10px", background: "#1a0f0f", borderRadius: "8px", border: "1px solid #331f1f"}}>
                     <span style={{fontSize: "11px", color: "#ff8888", display: "block", marginBottom: "4px"}}>Last Payment Record</span>
                     <div style={{fontSize: "13px", color: "#ddd", display: "flex", justifyContent: "space-between"}}>
                       <span>{account.lastPayment.transaction_id || 'N/A'}</span>
                       <strong>₹{account.lastPayment.amount}</strong>
                     </div>
                  </div>
                ) : null}

              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {filteredAccounts.length > 0 && (
          <div className="pg-wrap-x30sn">
              <button className="pg-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Previous</button>
              <span style={{color:'#666', fontSize:13, fontWeight:600}}>Page {currentPage} of {Math.ceil(filteredAccounts.length / itemsPerPage)}</span>
              <button className="pg-btn-x30sn" disabled={currentPage >= Math.ceil(filteredAccounts.length / itemsPerPage)} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        )}
      </div>
    </>
  );
};

export default DeletedAccountsAdmin;
