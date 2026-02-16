'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import api from "../../config/api";
import { 
  FaMoneyBillWave, FaChartLine, FaUsers, FaCreditCard, 
  FaSync, FaArrowUp, FaArrowDown, FaCrown 
} from "react-icons/fa";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// ------------------- CSS STYLES (Pure Black & Pink) -------------------
const styles = `
/* ROOT & LAYOUT */
.pay-root-x30sn {
  color: #fff;
  background-color: #000;
  min-height: 100vh;
  font-family: 'Inter', system-ui, sans-serif;
  border-radius: 16px;
  border: 1px solid #222;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* HEADER */
.pay-header-x30sn {
  padding: 24px;
  background: #050505;
  border-bottom: 1px solid #222;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pay-title-x30sn h2 { font-size: 24px; font-weight: 800; margin: 0; color: #fff; }
.pay-title-x30sn p { color: #ff69b4; margin: 4px 0 0; font-size: 13px; font-weight: 500; }

.pay-btn-x30sn {
  display: flex; align-items: center; gap: 8px; padding: 10px 18px; border-radius: 8px;
  font-size: 13px; font-weight: 600; cursor: pointer; border: 1px solid #333;
  background: #111; color: #fff; transition: 0.2s;
}
.pay-btn-x30sn:hover { border-color: #ff69b4; color: #ff69b4; }

/* KPI GRID */
.pay-kpi-grid-x30sn {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 15px;
  padding: 24px;
}
.pay-kpi-card-x30sn {
  background: #0a0a0a; border: 1px solid #222; border-radius: 12px; padding: 20px;
  display: flex; flex-direction: column; gap: 10px; position: relative; overflow: hidden;
}
.pay-kpi-card-x30sn:hover { border-color: #333; transform: translateY(-2px); transition: 0.2s; }

.pay-kpi-top-x30sn { display: flex; justify-content: space-between; align-items: flex-start; }
.pay-kpi-icon-x30sn {
  width: 40px; height: 40px; border-radius: 10px; background: rgba(255,105,180,0.1); color: #ff69b4;
  display: flex; align-items: center; justify-content: center; font-size: 18px;
}
.pay-kpi-label-x30sn { font-size: 12px; color: #888; text-transform: uppercase; font-weight: 600; }
.pay-kpi-value-x30sn { font-size: 28px; font-weight: 800; color: #fff; margin: 5px 0; }
.pay-kpi-trend-x30sn { 
  font-size: 12px; display: flex; align-items: center; gap: 4px; font-weight: 600;
}
.trend-up { color: #00ff88; }
.trend-down { color: #ff3b30; }

/* CHARTS ROW */
.pay-charts-row-x30sn {
  display: grid; grid-template-columns: 1fr 350px; gap: 20px; padding: 0 24px 24px;
}
.pay-chart-box-x30sn {
  background: #0a0a0a; border: 1px solid #222; border-radius: 16px; padding: 20px; min-height: 300px;
}
.pay-chart-title-x30sn { font-size: 15px; font-weight: 700; margin-bottom: 20px; color: #ddd; }

/* TABLE SECTION */
.pay-table-section-x30sn {
  flex: 1; padding: 0 24px 24px; overflow: hidden; display: flex; flex-direction: column;
}
.pay-table-container-x30sn {
  background: #0a0a0a; border: 1px solid #222; border-radius: 12px; overflow-y: auto; flex: 1;
}
.pay-table-x30sn { width: 100%; border-collapse: collapse; font-size: 13px; }
.pay-table-x30sn thead { position: sticky; top: 0; background: #111; z-index: 10; }
.pay-table-x30sn th {
  padding: 12px 16px; text-align: left; color: #888; font-weight: 600; text-transform: uppercase; font-size: 11px; border-bottom: 1px solid #333;
}
.pay-table-x30sn td { padding: 12px 16px; border-bottom: 1px solid #1a1a1a; color: #ddd; vertical-align: middle; }
.pay-table-x30sn tr:hover { background: rgba(255,255,255,0.02); }

.pay-user-cell-x30sn { display: flex; flex-direction: column; }
.pay-user-name-x30sn { font-weight: 600; color: #fff; }
.pay-user-email-x30sn { font-size: 11px; color: #666; }

.pay-amount-x30sn { font-weight: 700; color: #00ff88; }
.pay-id-x30sn { font-family: monospace; color: #666; background: #111; padding: 2px 6px; border-radius: 4px; font-size: 11px; }

.pay-status-badge-x30sn {
  padding: 3px 8px; border-radius: 4px; font-size: 10px; font-weight: 700; text-transform: uppercase; display: inline-block;
}
.status-active { background: rgba(0, 255, 136, 0.1); color: #00ff88; border: 1px solid rgba(0, 255, 136, 0.2); }
.status-expired { background: rgba(255, 59, 48, 0.1); color: #ff3b30; border: 1px solid rgba(255, 59, 48, 0.2); }

/* RESPONSIVE */
@media (max-width: 1024px) {
  .pay-charts-row-x30sn { grid-template-columns: 1fr; }
}
`;

const PaymentActivityAdmin = () => {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  const getToken = useCallback(() => (typeof window !== 'undefined' ? localStorage.getItem("token") || "" : ""), []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const token = getToken();
      const response = await axios.get(`${api.Url}/admin/payment-activity`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        setData(response.data.summary);
        setTransactions(response.data.transactions);
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- CHART DATA ---
  const tiersData = useMemo(() => {
    if (!data?.pricingTiers) return [];
    const colors = { 40: '#FFBB28', 49: '#ff69b4', 399: '#0088FE' };
    return data.pricingTiers.map(tier => ({
      name: `₹${tier._id} Plan`,
      value: tier.count,
      color: colors[tier._id] || '#888'
    }));
  }, [data]);

  // --- HELPERS ---
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isSubscriptionActive = (expiryDate) => {
    return new Date(expiryDate) > new Date();
  };

  if (loading) return <div style={{padding:40, color:'#fff', textAlign:'center'}}>Loading Financial Data...</div>;

  return (
    <div className="pay-root-x30sn">
      <style>{styles}</style>

      {/* HEADER */}
      <header className="pay-header-x30sn">
        <div className="pay-title-x30sn">
          <h2>Revenue Analytics</h2>
          <p>Financial Performance & Subscription Metrics</p>
        </div>
        <button className="pay-btn-x30sn" onClick={fetchData}>
          <FaSync /> Sync Data
        </button>
      </header>

      {/* KPI GRID */}
      <div className="pay-kpi-grid-x30sn">
        {/* Total Revenue */}
        <div className="pay-kpi-card-x30sn">
          <div className="pay-kpi-top-x30sn">
            <span className="pay-kpi-label-x30sn">All Time Revenue</span>
            <div className="pay-kpi-icon-x30sn"><FaMoneyBillWave/></div>
          </div>
          <div className="pay-kpi-value-x30sn">{formatCurrency(data?.revenue?.allTime || 0)}</div>
          <div className="pay-kpi-trend-x30sn trend-up">
            <FaArrowUp/> {data?.revenue?.growth || "0%"} <span style={{color:'#666', fontWeight:400}}> vs last month</span>
          </div>
        </div>

        {/* MRR */}
        <div className="pay-kpi-card-x30sn">
          <div className="pay-kpi-top-x30sn">
            <span className="pay-kpi-label-x30sn">Monthly Recurring (MRR)</span>
            <div className="pay-kpi-icon-x30sn" style={{color:'#00ff88', background:'rgba(0,255,136,0.1)'}}><FaChartLine/></div>
          </div>
          <div className="pay-kpi-value-x30sn">{formatCurrency(data?.revenue?.mrr || 0)}</div>
          <div className="pay-kpi-trend-x30sn" style={{color:'#888'}}>
            Target: ₹5,000
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="pay-kpi-card-x30sn">
          <div className="pay-kpi-top-x30sn">
            <span className="pay-kpi-label-x30sn">Active Subscribers</span>
            <div className="pay-kpi-icon-x30sn" style={{color:'#ff3b30', background:'rgba(255,59,48,0.1)'}}><FaCrown/></div>
          </div>
          <div className="pay-kpi-value-x30sn">{data?.subscriptions?.activeSubscribers || 0}</div>
          <div className="pay-kpi-trend-x30sn trend-up">
            <FaUsers size={10} style={{marginRight:4}}/> Premium Users
          </div>
        </div>

        {/* Avg Order Value */}
        <div className="pay-kpi-card-x30sn">
          <div className="pay-kpi-top-x30sn">
            <span className="pay-kpi-label-x30sn">Avg. Order Value</span>
            <div className="pay-kpi-icon-x30sn" style={{color:'#4facfe', background:'rgba(79,172,254,0.1)'}}><FaCreditCard/></div>
          </div>
          <div className="pay-kpi-value-x30sn">₹{data?.revenue?.averageOrderValue || 0}</div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="pay-charts-row-x30sn">
        {/* Recent Transactions Chart (Simulated Trend) */}
        <div className="pay-chart-box-x30sn">
          <div className="pay-chart-title-x30sn">Recent Transaction Volume</div>
          <ResponsiveContainer width="100%" height={250}>
            
            <BarChart data={transactions.slice(0, 7).reverse()}> 
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#222" />
              <XAxis dataKey="date" tickFormatter={(t) => new Date(t).getDate()} stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip cursor={{fill: 'rgba(255,255,255,0.05)'}} contentStyle={{background:'#000', border:'1px solid #333'}} />
              <Bar dataKey="rupees" fill="#ff69b4" radius={[4,4,0,0]} barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution */}
        <div className="pay-chart-box-x30sn">
          <div className="pay-chart-title-x30sn">Plan Distribution</div>
          <ResponsiveContainer width="100%" height={250}>
            
            <PieChart>
              <Pie data={tiersData} innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                {tiersData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip contentStyle={{background:'#000', border:'1px solid #333'}} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="pay-table-section-x30sn">
        <div className="pay-chart-title-x30sn" style={{marginBottom:15}}>Detailed Transaction Log</div>
        <div className="pay-table-container-x30sn">
          <table className="pay-table-x30sn">
            <thead>
              <tr>
                <th>User</th>
                <th>Amount</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Plan Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => {
                const isActive = isSubscriptionActive(txn.expiry_date);
                return (
                  <tr key={txn._id}>
                    <td>
                      <div className="pay-user-cell-x30sn">
                        <span className="pay-user-name-x30sn">{txn.user?.name || 'Deleted User'}</span>
                        <span className="pay-user-email-x30sn">{txn.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="pay-amount-x30sn">{formatCurrency(txn.rupees)}</span>
                    </td>
                    <td>
                      <span className="pay-id-x30sn">{txn.transaction_id}</span>
                    </td>
                    <td>{formatDate(txn.date)}</td>
                    <td>{formatDate(txn.expiry_date)}</td>
                    <td>
                      <span className={`pay-status-badge-x30sn ${isActive ? 'status-active' : 'status-expired'}`}>
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default PaymentActivityAdmin;