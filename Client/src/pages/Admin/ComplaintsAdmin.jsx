'use client';

import { useState, useEffect, useMemo, useCallback } from "react";
import { 
  FaTicketAlt, FaTrash, FaEdit, FaSearch, FaCheckCircle, 
  FaTimesCircle, FaSync, FaDownload, FaChartBar, FaExclamationTriangle 
} from "react-icons/fa";
import {
  BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, 
  Tooltip, Legend, XAxis, YAxis, CartesianGrid
} from "recharts";
import api from "../../config/api";
import axios from "axios";

// ------------------- CSS STYLES (Pure Black & Pink Theme) -------------------
const styles = `
.cmp-root-x30sn {
  color: #fff;
  font-family: 'Inter', system-ui, sans-serif;
  animation: fade-in-x30sn 0.4s ease;
  background-color: #000;
  min-height: 100vh;
}
@keyframes fade-in-x30sn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.cmp-header-x30sn {
  display: flex; justify-content: space-between; align-items: center; 
  margin-bottom: 30px; flex-wrap: wrap; gap: 20px;
  background: #050505; padding: 20px; border-radius: 16px; border: 1px solid #222;
}
.cmp-title-group-x30sn h2 { font-size: 28px; font-weight: 800; margin: 0; color: #fff; letter-spacing: -0.5px; }
.cmp-title-group-x30sn p { color: #ff69b4; margin: 5px 0 0 0; font-size: 13px; font-weight: 500; }

.cmp-btn-x30sn {
  display: flex; align-items: center; gap: 8px; padding: 10px 16px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #333;
  background: #111; color: #fff; transition: 0.2s;
}
.cmp-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }
.cmp-btn-x30sn.primary { background: #ff69b4; color: #000; border: none; }
.cmp-btn-x30sn:disabled { opacity: 0.5; cursor: not-allowed; }

/* STATS */
.cmp-stats-grid-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 15px; margin-bottom: 30px;
}
.cmp-stat-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 14px; padding: 20px;
  display: flex; align-items: center; gap: 15px;
}
.cmp-stat-icon-x30sn {
  width: 48px; height: 48px; border-radius: 12px; background: rgba(255,105,180,0.1); color: #ff69b4;
  display: flex; align-items: center; justify-content: center; font-size: 22px;
}
.cmp-stat-info-x30sn span { display: block; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.5px; }
.cmp-stat-info-x30sn strong { font-size: 24px; color: #fff; font-weight: 700; }

/* CHARTS */
.cmp-charts-row-x30sn {
  display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-bottom: 30px;
}
.cmp-chart-box-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px; height: 300px;
}

/* FILTERS */
.cmp-filters-x30sn {
  background: #050505; padding: 15px; border-radius: 12px; border: 1px solid #222; margin-bottom: 25px;
  display: flex; gap: 15px; flex-wrap: wrap;
}
.cmp-search-wrap-x30sn { position: relative; flex: 1; min-width: 250px; }
.cmp-search-wrap-x30sn svg { position: absolute; left: 12px; top: 12px; color: #555; }
.cmp-input-x30sn {
  width: 100%; background: #000; border: 1px solid #333; color: #fff; padding: 10px 10px 10px 35px;
  border-radius: 8px; outline: none;
}
.cmp-select-x30sn { background: #000; color: #fff; border: 1px solid #333; padding: 10px 15px; border-radius: 8px; outline: none; }

/* LIST */
.cmp-list-x30sn { display: grid; grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); gap: 20px; }
.cmp-ticket-card-x30sn {
  background: #050505; border: 1px solid #222; border-radius: 16px; padding: 20px;
  transition: 0.2s; position: relative; display: flex; flex-direction: column; justify-content: space-between;
}
.cmp-ticket-card-x30sn:hover { border-color: #ff69b4; }
.cmp-status-badge-x30sn {
  padding: 4px 10px; border-radius: 20px; font-size: 10px; font-weight: 700; text-transform: uppercase;
}
.cmp-status-badge-x30sn.pending { background: rgba(255,0,0,0.1); color: #ff4444; border: 1px solid rgba(255,0,0,0.2); }
.cmp-status-badge-x30sn.resolved { background: rgba(0,255,0,0.1); color: #00ff00; border: 1px solid rgba(0,255,0,0.2); }

.cmp-issue-text-x30sn { font-size: 15px; color: #fff; margin: 15px 0; line-height: 1.5; font-weight: 600; }
.cmp-user-data-x30sn { background: #000; padding: 12px; border-radius: 8px; font-size: 12px; color: #888; border: 1px solid #111; }
.cmp-user-data-x30sn div { margin-bottom: 4px; }
.cmp-user-data-x30sn strong { color: #ccc; }

.cmp-card-actions-x30sn { display: flex; gap: 8px; margin-top: 20px; justify-content: flex-end; }
.cmp-act-btn-x30sn {
  background: #111; color: #fff; border: 1px solid #222; width: 32px; height: 32px; border-radius: 6px;
  display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.2s;
}
.cmp-act-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }

/* MODAL */
.cmp-modal-overlay-x30sn {
  position: fixed; inset: 0; background: rgba(0,0,0,0.8); z-index: 1000;
  display: flex; justify-content: center; align-items: center; backdrop-filter: blur(5px);
}
.cmp-modal-content-x30sn {
  background: #000; border: 1px solid #333; border-radius: 20px; width: 90%; max-width: 500px; padding: 25px;
}
.cmp-modal-content-x30sn h3 { margin: 0 0 20px 0; font-size: 20px; color: #fff; }
.cmp-form-group-x30sn { margin-bottom: 15px; display: flex; flex-direction: column; gap: 8px; }
.cmp-form-group-x30sn label { font-size: 12px; color: #666; text-transform: uppercase; font-weight: 700; }
.cmp-textarea-x30sn { background: #111; border: 1px solid #333; color: #fff; padding: 12px; border-radius: 8px; resize: none; outline: none; }
.cmp-textarea-x30sn:focus { border-color: #ff69b4; }

/* PAGINATION */
.cmp-pagination-x30sn { display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 30px; padding-bottom: 50px; }
.cmp-page-num-x30sn {
  width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; border-radius: 8px;
  background: #000; border: 1px solid #333; color: #888; cursor: pointer;
}
.cmp-page-num-x30sn.active { background: #ff69b4; color: #000; border-color: #ff69b4; font-weight: 700; }
`;

const ComplaintsAdmin = () => {
  const [tickets, setTickets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [editTicket, setEditTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const ticketsPerPage = 6;

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchTickets = useCallback(async () => {
    try {
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 10000
      });
      setTickets(response.data.data || []);
    } catch (error) {
      console.error(error);
      setTickets([]);
    }
  }, [getToken]);

  const fetchAllData = useCallback(async () => {
    setRefreshing(true);
    try { await fetchTickets(); } 
    catch (error) { console.error(error); } 
    finally { setRefreshing(false); setLoading(false); }
  }, [fetchTickets]);

  useEffect(() => { fetchAllData(); }, [fetchAllData]);

  const stats = useMemo(() => {
    const totalCount = tickets.length;
    const pendingCount = tickets.filter(t => t.status === "Pending").length;
    const resolvedCount = tickets.filter(t => t.status === "Resolved").length;
    return { totalCount, pendingCount, resolvedCount, resolutionRate: totalCount > 0 ? (resolvedCount / totalCount) * 100 : 0 };
  }, [tickets]);

  const dailyTicketsData = useMemo(() => {
    const dailyCounts = tickets.reduce((acc, t) => {
      const date = new Date(t.date).toLocaleDateString();
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(dailyCounts).slice(-7).map(([date, count]) => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      tickets: count
    }));
  }, [tickets]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((t) => {
      const name = t.user?.name || "Unknown";
      const matchesSearch = t.issue?.toLowerCase().includes(searchTerm.toLowerCase()) || name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = filterStatus === "all" || t.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [tickets, searchTerm, filterStatus]);

  const paginatedTickets = filteredTickets.slice((currentPage - 1) * ticketsPerPage, currentPage * ticketsPerPage);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const handleDelete = async (id) => {
    if (!confirm("Delete this complaint?")) return;
    try {
      const token = getToken();
      await axios.delete(`${api.Url}/admin/tickets/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      setTickets(tickets.filter(t => t._id !== id));
    } catch (e) { alert("Delete failed"); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = getToken();
      const response = await axios.put(`${api.Url}/admin/tickets/${editTicket._id}`, editTicket, { headers: { Authorization: `Bearer ${token}` } });
      setTickets(tickets.map(t => t._id === editTicket._id ? response.data.data : t));
      setEditTicket(null);
    } catch (e) { alert("Update failed"); }
  };

  if (loading) return <div className="cmp-root-x30sn" style={{display:'flex',alignItems:'center',justifyContent:'center'}}><FaSync className="refreshing" style={{color:'#ff69b4'}}/></div>;

  return (
    <>
      <style>{styles}</style>
      <div className="cmp-root-x30sn">
        
        {/* HEADER */}
        <div className="cmp-header-x30sn">
          <div className="cmp-title-group-x30sn">
            <h2>Complaints Center</h2>
            <p>User Support & Ticketing</p>
          </div>
         
        </div>

        {/* STATS */}
        <div className="cmp-stats-grid-x30sn">
          <div className="cmp-stat-card-x30sn">
            <div className="cmp-stat-icon-x30sn"><FaTicketAlt/></div>
            <div className="cmp-stat-info-x30sn"><span>Total</span><strong>{stats.totalCount}</strong></div>
          </div>
          <div className="cmp-stat-card-x30sn">
            <div className="cmp-stat-icon-x30sn" style={{color:'#ff4444'}}><FaExclamationTriangle/></div>
            <div className="cmp-stat-info-x30sn"><span>Pending</span><strong>{stats.pendingCount}</strong></div>
          </div>
          <div className="cmp-stat-card-x30sn">
            <div className="cmp-stat-icon-x30sn" style={{color:'#00ff00'}}><FaCheckCircle/></div>
            <div className="cmp-stat-info-x30sn"><span>Resolved</span><strong>{stats.resolvedCount}</strong></div>
          </div>
          <div className="cmp-stat-card-x30sn">
            <div className="cmp-stat-icon-x30sn" style={{color:'#ff69b4'}}><FaChartBar/></div>
            <div className="cmp-stat-info-x30sn"><span>Resolution</span><strong>{stats.resolutionRate.toFixed(0)}%</strong></div>
          </div>
        </div>

        {/* CHARTS */}
        <div className="cmp-charts-row-x30sn">
          <div className="cmp-chart-box-x30sn">
            <h4 style={{margin:'0 0 15px 0', fontSize:14}}>Status Distribution</h4>
            <ResponsiveContainer width="100%" height="90%">
              <PieChart>
                <Pie data={[{name:'Pending', value:stats.pendingCount}, {name:'Resolved', value:stats.resolvedCount}]} innerRadius={60} outerRadius={80} dataKey="value">
                  <Cell fill="#ff4444" /><Cell fill="#00ff00" />
                </Pie>
                <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}} />
                <Legend verticalAlign="bottom" />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="cmp-chart-box-x30sn">
            <h4 style={{margin:'0 0 15px 0', fontSize:14}}>Ticket Flow (Daily)</h4>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart data={dailyTicketsData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222"/>
                <XAxis dataKey="date" stroke="#555" fontSize={12} axisLine={false} tickLine={false} />
                <YAxis stroke="#555" fontSize={12} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'rgba(255,105,180,0.1)'}} contentStyle={{background:'#000', border:'1px solid #333'}} />
                <Bar dataKey="tickets" fill="#ff69b4" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* FILTERS */}
        <div className="cmp-filters-x30sn">
          <div className="cmp-search-wrap-x30sn">
            <FaSearch />
            <input className="cmp-input-x30sn" placeholder="Search by issue or user name..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
          <select className="cmp-select-x30sn" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="all">All Tickets</option>
            <option value="Pending">Pending</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        {/* LIST */}
        <div className="cmp-list-x30sn">
          {paginatedTickets.map(ticket => (
            <div key={ticket._id} className="cmp-ticket-card-x30sn">
              <div>
                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                  <span className={`cmp-status-badge-x30sn ${ticket.status.toLowerCase()}`}>{ticket.status}</span>
                  <span style={{fontSize:11, color:'#555'}}>{new Date(ticket.date).toLocaleDateString()}</span>
                </div>
                <div className="cmp-issue-text-x30sn">{ticket.issue}</div>
                <div className="cmp-user-data-x30sn">
                  <div><strong>User:</strong> {ticket.user?.name || "Anonymous"}</div>
                  <div><strong>ID:</strong> {ticket.user?._id || ticket.user || "N/A"}</div>
                </div>
              </div>
              <div className="cmp-card-actions-x30sn">
                <button className="cmp-act-btn-x30sn" onClick={() => setEditTicket(ticket)}><FaEdit/></button>
                <button className="cmp-act-btn-x30sn del" onClick={() => handleDelete(ticket._id)}><FaTrash/></button>
              </div>
            </div>
          ))}
        </div>

        {/* PAGINATION */}
        {totalPages > 1 && (
          <div className="cmp-pagination-x30sn">
            <button className="cmp-btn-x30sn" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>Prev</button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button key={i} className={`cmp-page-num-x30sn ${currentPage === i + 1 ? 'active' : ''}`} onClick={() => setCurrentPage(i + 1)}>{i + 1}</button>
            ))}
            <button className="cmp-btn-x30sn" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>Next</button>
          </div>
        )}

        {/* EDIT MODAL */}
        {editTicket && (
          <div className="cmp-modal-overlay-x30sn">
            <form onSubmit={handleEditSubmit} className="cmp-modal-content-x30sn">
              <h3>Edit Complaint</h3>
              <div className="cmp-form-group-x30sn">
                <label>Status</label>
                <select className="cmp-select-x30sn" value={editTicket.status} onChange={e => setEditTicket({...editTicket, status: e.target.value})}>
                  <option value="Pending">Pending</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>
              <div className="cmp-form-group-x30sn">
                <label>Issue Description</label>
                <textarea className="cmp-textarea-x30sn" rows={5} value={editTicket.issue} onChange={e => setEditTicket({...editTicket, issue: e.target.value})} />
              </div>
              <div style={{display:'flex', gap:10, marginTop:20, justifyContent:'flex-end'}}>
                <button type="button" className="cmp-btn-x30sn" onClick={() => setEditTicket(null)}>Cancel</button>
                <button type="submit" className="cmp-btn-x30sn primary">Update Ticket</button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
};

export default ComplaintsAdmin;