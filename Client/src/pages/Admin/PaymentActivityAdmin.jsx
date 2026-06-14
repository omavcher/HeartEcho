'use client';

import { useState, useEffect, useCallback, useMemo } from "react";
import axios from "axios";
import api from "../../config/api";
import { 
  FaMoneyBillWave, FaChartLine, FaUsers, FaCreditCard, 
  FaSync, FaArrowUp, FaCrown, FaFacebook, FaSearch, FaDownload, FaArrowDown,
  FaGlobe, FaMobileAlt
} from "react-icons/fa";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

// ------------------- CSS STYLES (Pure Black, Glassmorphism, Emerald & Pink) -------------------
const styles = `
/* ROOT & LAYOUT */
.pa-root {
  color: #fff;
  background-color: #030303;
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  border-radius: 20px;
  border: 1px solid #1a1a1a;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  animation: pa-fadeIn 0.4s ease;
}
@keyframes pa-fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

/* HEADER */
.pa-header {
  padding: 28px 32px;
  background: linear-gradient(180deg, #070707 0%, #030303 100%);
  border-bottom: 1px solid #161616;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 20px;
}
.pa-title h2 { 
  font-size: 26px; 
  font-weight: 800; 
  margin: 0; 
  letter-spacing: -0.5px;
  color: #fff; 
  display: flex;
  align-items: center;
  gap: 12px;
}
.pa-tagline { 
  color: #888; 
  margin: 6px 0 0; 
  font-size: 14px; 
  font-weight: 500; 
  display: flex;
  align-items: center;
  gap: 8px;
}

/* BUTTONS */
.pa-btn {
  display: flex; 
  align-items: center; 
  gap: 8px; 
  padding: 10px 20px; 
  border-radius: 10px;
  font-size: 13px; 
  font-weight: 600; 
  cursor: pointer; 
  border: 1px solid #222;
  background: #0c0c0c; 
  color: #eee; 
  transition: all 0.25s ease;
}
.pa-btn:hover { 
  border-color: #ff69b4; 
  color: #ff69b4; 
  background: rgba(255, 105, 180, 0.03);
  transform: translateY(-1px);
}
.pa-btn.primary {
  background: linear-gradient(135deg, #ff69b4 0%, #da22ff 100%);
  border: none;
  color: #000;
}
.pa-btn.primary:hover {
  filter: brightness(1.1);
  color: #000;
  transform: translateY(-1px);
  box-shadow: 0 4px 15px rgba(255, 105, 180, 0.25);
}
.pa-btn:disabled { opacity: 0.5; cursor: not-allowed; }

/* KPI GRID */
.pa-kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
  gap: 16px;
  padding: 24px 32px;
}
.pa-kpi-card {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  padding: 20px;
  display: flex; 
  flex-direction: column;
  gap: 12px; 
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  position: relative;
  overflow: hidden;
}
.pa-kpi-card:hover { 
  border-color: #262626; 
  transform: translateY(-3px); 
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.4);
}
.pa-kpi-card::before {
  content: '';
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  background: radial-gradient(circle at top right, rgba(0,255,136,0.02), transparent 60%);
  pointer-events: none;
}
.pa-kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pa-kpi-label { 
  font-size: 11px; 
  color: #666; 
  text-transform: uppercase; 
  letter-spacing: 0.8px; 
  font-weight: 700;
}
.pa-kpi-icon {
  width: 38px; 
  height: 38px; 
  border-radius: 10px; 
  background: rgba(0, 255, 136, 0.08); 
  color: #00ff88;
  display: flex; 
  align-items: center; 
  justify-content: center; 
  font-size: 18px;
  border: 1px solid rgba(0, 255, 136, 0.15);
}
.pa-kpi-value { 
  font-size: 26px; 
  font-weight: 800; 
  color: #fff; 
  margin: 2px 0 0; 
}
.pa-kpi-trend { 
  font-size: 11px; 
  display: flex; 
  align-items: center; 
  gap: 4px; 
  font-weight: 600; 
}
.trend-up { color: #00ff88; }
.trend-down { color: #ff3b30; }

/* CHARTS ROW */
.pa-charts-row {
  display: grid; 
  grid-template-columns: 1.5fr 1fr; 
  gap: 20px; 
  padding: 0 32px 24px;
}
.pa-chart-box {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 20px; 
  padding: 20px; 
  min-height: 300px;
  backdrop-filter: blur(12px);
  display: flex;
  flex-direction: column;
}
.pa-chart-title { 
  font-size: 14px; 
  font-weight: 700; 
  margin-bottom: 20px; 
  color: #eee;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* CONTROLS SECTION */
.pa-controls-section {
  padding: 0 32px 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.pa-filters-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  background: rgba(10, 10, 10, 0.4);
  border: 1px solid #161616;
  padding: 16px;
  border-radius: 12px;
}
.pa-search-wrap {
  position: relative; 
  flex: 1;
  min-width: 280px;
}
.pa-search-icon { position: absolute; left: 14px; top: 13px; color: #555; }
.pa-input {
  width: 100%; 
  background: rgba(15, 15, 15, 0.7); 
  border: 1px solid #222; 
  color: #fff; 
  padding: 12px 12px 12px 42px;
  border-radius: 10px; 
  outline: none; 
  font-size: 13px;
  transition: all 0.25s ease;
}
.pa-input:focus { 
  border-color: #ff69b4; 
  background: #000;
  box-shadow: 0 0 12px rgba(255, 105, 180, 0.15);
}
.pa-select {
  background: rgba(15, 15, 15, 0.7);
  color: #ccc;
  border: 1px solid #222;
  padding: 12px 16px;
  border-radius: 10px;
  outline: none;
  font-size: 13px;
  cursor: pointer;
  min-width: 140px;
  transition: all 0.25s ease;
}
.pa-select:focus {
  border-color: #ff69b4;
  color: #fff;
}

/* TABLE SECTION */
.pa-table-section {
  flex: 1; 
  padding: 0 32px 32px;
  display: flex;
  flex-direction: column;
}
.pa-table-card {
  background: rgba(10, 10, 10, 0.6); 
  border: 1px solid #161616; 
  border-radius: 16px; 
  overflow: hidden;
  backdrop-filter: blur(12px);
}
.pa-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}
.pa-table th {
  padding: 16px 20px; 
  text-align: left; 
  color: #666; 
  font-weight: 700; 
  text-transform: uppercase; 
  font-size: 10px; 
  letter-spacing: 1.2px;
  border-bottom: 1px solid #1a1a1a;
  background: #070707;
}
.pa-table td {
  padding: 16px 20px; 
  border-bottom: 1px solid #111; 
  color: #ccc; 
  vertical-align: middle; 
  transition: all 0.2s ease;
}
.pa-table tr {
  position: relative;
  transition: all 0.2s ease;
}
.pa-table tr:hover td { 
  background: rgba(0, 255, 136, 0.008); 
  color: #fff;
}
.pa-table tr:hover::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 4px;
  background: #00ff88;
  box-shadow: 0 0 8px #00ff88;
}

.pa-user-cell {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pa-user-name {
  font-weight: 700;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
}
.pa-user-email {
  font-size: 11px;
  color: #555;
}

.pa-amount {
  font-weight: 800;
  color: #00ff88;
}
.pa-mono-id {
  font-family: 'JetBrains Mono', monospace;
  color: #a0c0e0; 
  background: rgba(160, 192, 224, 0.04); 
  padding: 4px 8px; 
  border-radius: 6px; 
  font-size: 11px;
  border: 1px solid rgba(160, 192, 224, 0.08);
}

.pa-status-badge {
  padding: 4px 8px; 
  border-radius: 6px; 
  font-size: 9px; 
  font-weight: 800; 
  text-transform: uppercase;
  letter-spacing: 0.8px;
  display: inline-block;
}
.status-active { 
  background: rgba(0, 255, 136, 0.05); 
  color: #00ff88; 
  border: 1px solid rgba(0, 255, 136, 0.15);
  box-shadow: 0 0 10px rgba(0, 255, 136, 0.05);
}
.status-expired { 
  background: rgba(255, 59, 48, 0.05); 
  color: #ff3b30; 
  border: 1px solid rgba(255, 59, 48, 0.15); 
}

.pa-platform-badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 600;
}
.platform-web {
  background: rgba(0, 122, 255, 0.05);
  color: #007aff;
  border: 1px solid rgba(0, 122, 255, 0.15);
}
.platform-mobile {
  background: rgba(218, 34, 255, 0.05);
  color: #da22ff;
  border: 1px solid rgba(218, 34, 255, 0.15);
}

/* RESPONSIVE LAYOUT */
@media (max-width: 1024px) {
  .pa-charts-row {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 768px) {
  .pa-header {
    padding: 20px 24px;
    flex-direction: column;
    align-items: flex-start;
  }
  .pa-kpi-grid {
    padding: 16px 24px;
  }
  .pa-controls-section {
    padding: 0 24px 20px;
  }
  .pa-table-section {
    padding: 0 24px 24px;
  }
  .pa-table th:nth-child(3), .pa-table td:nth-child(3),
  .pa-table th:nth-child(5), .pa-table td:nth-child(5) {
    display: none;
  }
}
`;

// Helper formatting function
const formatCurrency = (amount, currency = 'INR') => {
  const cur = currency || 'INR';
  return new Intl.NumberFormat(cur === 'INR' ? 'en-IN' : 'en-US', { 
    style: 'currency', 
    currency: cur, 
    maximumFractionDigits: cur === 'INR' ? 0 : 2 
  }).format(amount);
};

// Recharts Custom Tooltip Component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    
    // BarChart
    if (data.payload.originalAmount !== undefined) {
      const formattedOriginal = formatCurrency(data.payload.originalAmount, data.payload.currency);
      const inrEquiv = Math.round(data.payload.displayAmount);
      return (
        <div style={{
          background: 'rgba(5, 5, 5, 0.9)',
          border: '1px solid #00ff88',
          borderRadius: '10px',
          padding: '12px 16px',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
        }}>
          <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            {new Date(data.payload.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </p>
          <p style={{ margin: '6px 0 0 0', fontSize: '16px', color: '#00ff88', fontWeight: 800 }}>
            {formattedOriginal}
          </p>
          {data.payload.currency === 'USD' && (
            <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#666', fontWeight: 500 }}>
              ~₹{inrEquiv.toLocaleString()} INR
            </p>
          )}
        </div>
      );
    }

    // PieChart
    return (
      <div style={{
        background: 'rgba(5, 5, 5, 0.9)',
        border: '1px solid #ff69b4',
        borderRadius: '10px',
        padding: '12px 16px',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 8px 30px rgba(0,0,0,0.6)'
      }}>
        <p style={{ margin: 0, fontSize: '11px', color: '#888', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.8px' }}>
          {data.name}
        </p>
        <p style={{ margin: '6px 0 0 0', fontSize: '16px', color: '#ff69b4', fontWeight: 800 }}>
          {data.value} {data.value === 1 ? 'sale' : 'sales'}
        </p>
        {data.payload.revenueINR !== undefined && (
          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#00ff88', fontWeight: 600 }}>
            ₹{data.payload.revenueINR.toLocaleString()}
          </p>
        )}
      </div>
    );
  }
  return null;
};

const PaymentActivityAdmin = () => {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currencyFilter, setCurrencyFilter] = useState("all");
  const [sourceFilter, setSourceFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(25);

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
        setTransactions(response.data.transactions || []);
      }
    } catch (error) {
      console.error("Fetch error", error);
    } finally {
      setLoading(false);
    }
  }, [getToken]);

  useEffect(() => { 
    fetchData(); 
  }, [fetchData]);

  // --- CLIENT SIDE ADVANCED METRICS ---
  const advancedStats = useMemo(() => {
    const totalTxns = transactions.length;
    
    // Facebook stats
    const fbTxns = transactions.filter(t => t.isFacebookSource);
    const fbCount = fbTxns.length;
    const fbRevINR = fbTxns.reduce((acc, curr) => acc + (curr.currency === 'USD' ? curr.rupees * 83 : curr.rupees), 0);

    // Currency split stats
    const usdTxns = transactions.filter(t => t.currency === 'USD');
    const inrTxns = transactions.filter(t => t.currency === 'INR' || !t.currency);
    const usdCount = usdTxns.length;
    const inrCount = inrTxns.length;

    return {
      fbCount,
      fbRevINR,
      usdCount,
      inrCount,
      totalTxns
    };
  }, [transactions]);

  // --- PLATFORM SPLIT METRICS ---
  const platformStats = useMemo(() => {
    let webCount = 0;
    let webRevenue = 0;
    let mobileCount = 0;
    let mobileRevenue = 0;

    transactions.forEach(t => {
      const isMobile = t.platform === "mobile";
      const amtINR = t.currency === 'USD' ? t.rupees * 83 : t.rupees;
      if (isMobile) {
        mobileCount++;
        mobileRevenue += amtINR;
      } else {
        webCount++;
        webRevenue += amtINR;
      }
    });

    if (data?.platformDistribution && data.platformDistribution.length > 0) {
      const webAgg = data.platformDistribution.find(p => p.platform === "web");
      const mobAgg = data.platformDistribution.find(p => p.platform === "mobile");
      return {
        web: {
          count: webAgg ? webAgg.count : 0,
          revenueINR: webAgg ? webAgg.revenueINR : 0
        },
        mobile: {
          count: mobAgg ? mobAgg.count : 0,
          revenueINR: mobAgg ? mobAgg.revenueINR : 0
        }
      };
    }

    return {
      web: { count: webCount, revenueINR: webRevenue },
      mobile: { count: mobileCount, revenueINR: mobileRevenue }
    };
  }, [data, transactions]);

  // --- CHART DATA PREPARATION ---
  const tiersData = useMemo(() => {
    if (data?.groupedPricingTiers) {
      const colors = {
        monthly: '#ff69b4',
        yearly: '#007aff',
        ultimate: '#8a2be2',
        other: '#ffd700'
      };
      return data.groupedPricingTiers.map(tier => ({
        name: tier.label,
        value: tier.count,
        revenueINR: tier.revenueINR,
        color: colors[tier.tier] || '#888'
      }));
    }

    if (!data?.pricingTiers) return [];
    const colors = { 40: '#FFBB28', 49: '#ff69b4', 99: '#ff69b4', 399: '#007aff', 599: '#007aff', 999: '#8a2be2', 1499: '#8a2be2', 1.49: '#ff69b4', 9: '#007aff', 19: '#8a2be2' };
    return data.pricingTiers.map(tier => {
      const amount = tier._id.amount;
      const cur = tier._id.currency || 'INR';
      const symbol = cur === 'INR' ? '₹' : '$';
      return {
        name: `${symbol}${amount} Plan`,
        value: tier.count,
        color: colors[amount] || '#888'
      };
    });
  }, [data]);

  const transactionChartData = useMemo(() => {
    return transactions.slice(0, 10).reverse().map(txn => ({
      date: txn.date,
      displayAmount: txn.currency === 'USD' ? txn.rupees * 83 : txn.rupees,
      originalAmount: txn.rupees,
      currency: txn.currency || 'INR'
    }));
  }, [transactions]);

  // --- FILTER LOGIC ---
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // 1. Text Search (User, Email, Transaction ID)
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      result = result.filter(t => {
        const name = (t.user?.name || "").toLowerCase();
        const email = (t.user?.email || "").toLowerCase();
        const txId = (t.transaction_id || "").toLowerCase();
        return name.includes(lower) || email.includes(lower) || txId.includes(lower);
      });
    }

    // 2. Status Filter
    if (statusFilter !== "all") {
      result = result.filter(t => {
        const isActive = new Date(t.expiry_date) > new Date();
        return statusFilter === "active" ? isActive : !isActive;
      });
    }

    // 3. Currency Filter
    if (currencyFilter !== "all") {
      result = result.filter(t => (t.currency || "INR") === currencyFilter);
    }

    // 4. Source Filter
    if (sourceFilter !== "all") {
      result = result.filter(t => {
        return sourceFilter === "facebook" ? t.isFacebookSource : !t.isFacebookSource;
      });
    }

    // 5. Platform Filter
    if (platformFilter !== "all") {
      result = result.filter(t => (t.platform || "web") === platformFilter);
    }

    return result;
  }, [transactions, searchTerm, statusFilter, currencyFilter, sourceFilter, platformFilter]);

  const paginatedTxns = useMemo(() => {
    return filteredTransactions.slice(0, visibleCount);
  }, [filteredTransactions, visibleCount]);

  // --- EXPORT UTILITIES ---
  const exportCSV = () => {
    const headers = ["Transaction ID", "User Name", "Email", "Amount", "Currency", "Amount (INR)", "Source", "Platform", "Date", "Plan Expiry", "Status"];
    const rows = filteredTransactions.map(t => {
      const isActive = new Date(t.expiry_date) > new Date();
      const amountInINR = t.currency === 'USD' ? t.rupees * 83 : t.rupees;
      return [
        t.transaction_id || "",
        t.user?.name || "Deleted User",
        t.user?.email || "N/A",
        t.rupees || 0,
        t.currency || "INR",
        Math.round(amountInINR),
        t.isFacebookSource ? "Facebook Ads" : "Organic",
        t.platform || "web",
        new Date(t.date).toISOString(),
        new Date(t.expiry_date).toISOString(),
        isActive ? "Active" : "Expired"
      ];
    });
    
    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJSON = () => {
    const dataToExport = filteredTransactions.map(t => {
      const isActive = new Date(t.expiry_date) > new Date();
      return {
        transactionId: t.transaction_id || "",
        userName: t.user?.name || "Deleted User",
        userEmail: t.user?.email || "N/A",
        amount: t.rupees || 0,
        currency: t.currency || "INR",
        isFacebookSource: t.isFacebookSource,
        platform: t.platform || "web",
        date: t.date,
        expiryDate: t.expiry_date,
        status: isActive ? "Active" : "Expired"
      };
    });

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataToExport, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", `payments_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const formatDate = (iso) => {
    return new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const isSubscriptionActive = (expiryDate) => {
    return new Date(expiryDate) > new Date();
  };

  if (loading) {
    return (
      <div className="pa-loader" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '400px' }}>
        <style>{styles}</style>
        <div style={{ width: 32, height: 32, border: '2px solid #222', borderTopColor: '#00ff88', borderRadius: '50%', animation: 'pa-spin 0.8s linear infinite', marginBottom: 12 }}></div>
        <p style={{ fontWeight: 600, color: '#666' }}>Loading Financial Data...</p>
        <style>{`@keyframes pa-spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div className="pa-root">
      <style>{styles}</style>

      {/* HEADER */}
      <header className="pa-header">
        <div className="pa-title">
          <h2>Revenue Analytics</h2>
          <p className="pa-tagline"><FaMoneyBillWave /> Financial Performance & Subscription Metrics</p>
        </div>
        <div className="pa-actions-wrap">
          <button className="pa-btn" onClick={fetchData} title="Sync database transactions">
            <FaSync /> Sync Data
          </button>
        </div>
      </header>

      {/* KPI GRID */}
      <div className="pa-kpi-grid">
        {/* Total Revenue */}
        <div className="pa-kpi-card">
          <div className="pa-kpi-top">
            <span className="pa-kpi-label">All Time Revenue</span>
            <div className="pa-kpi-icon"><FaMoneyBillWave /></div>
          </div>
          <div className="pa-kpi-value">{formatCurrency(data?.revenue?.allTime || 0)}</div>
          <div className="pa-kpi-trend trend-up">
            <FaArrowUp /> {data?.revenue?.growth || "0%"} <span style={{ color: '#555', fontWeight: 400 }}> vs last month</span>
          </div>
        </div>

        {/* MRR */}
        <div className="pa-kpi-card">
          <div className="pa-kpi-top">
            <span className="pa-kpi-label">MRR (This Month)</span>
            <div className="pa-kpi-icon" style={{ color: '#ff69b4', background: 'rgba(255,105,180,0.08)', borderColor: 'rgba(255,105,180,0.15)' }}><FaChartLine /></div>
          </div>
          <div className="pa-kpi-value">{formatCurrency(data?.revenue?.mrr || 0)}</div>
          <div className="pa-kpi-trend trend-up">
            <span style={{ color: '#555', fontWeight: 400 }}>Target: ₹50,000 MRR</span>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="pa-kpi-card">
          <div className="pa-kpi-top">
            <span className="pa-kpi-label">Active Subscribers</span>
            <div className="pa-kpi-icon" style={{ color: '#ffea00', background: 'rgba(255,234,0,0.08)', borderColor: 'rgba(255,234,0,0.15)' }}><FaCrown /></div>
          </div>
          <div className="pa-kpi-value">{data?.subscriptions?.activeSubscribers || 0}</div>
          <div className="pa-kpi-trend trend-up">
            <FaUsers size={12} style={{ marginRight: 4 }} /> Premium Members
          </div>
        </div>

        {/* Average Order Value */}
        <div className="pa-kpi-card">
          <div className="pa-kpi-top">
            <span className="pa-kpi-label">Avg. Order Value</span>
            <div className="pa-kpi-icon" style={{ color: '#007aff', background: 'rgba(0,122,255,0.08)', borderColor: 'rgba(0,122,255,0.15)' }}><FaCreditCard /></div>
          </div>
          <div className="pa-kpi-value">{formatCurrency(data?.revenue?.averageOrderValue || 0)}</div>
        </div>

        {/* Facebook Ads ROAS */}
        <div className="pa-kpi-card">
          <div className="pa-kpi-top">
            <span className="pa-kpi-label">Facebook Ads Acquisition</span>
            <div className="pa-kpi-icon" style={{ color: '#1877f2', background: 'rgba(24,119,242,0.08)', borderColor: 'rgba(24,119,242,0.15)' }}><FaFacebook /></div>
          </div>
          <div className="pa-kpi-value">{advancedStats.fbCount} subs</div>
          <div className="pa-kpi-trend trend-up">
            <span>₹{Math.round(advancedStats.fbRevINR).toLocaleString()} Rev</span>
          </div>
        </div>

        {/* Currency Split Gateway */}
        <div className="pa-kpi-card">
          <div className="pa-kpi-top">
            <span className="pa-kpi-label">USD vs INR Split</span>
            <div className="pa-kpi-icon" style={{ color: '#a0c0e0', background: 'rgba(160,192,224,0.08)', borderColor: 'rgba(160,192,224,0.15)' }}><FaCreditCard /></div>
          </div>
          <div className="pa-kpi-value">{advancedStats.usdCount} USD</div>
          <div className="pa-kpi-trend trend-up" style={{ color: '#888' }}>
            <span>{advancedStats.inrCount} INR Payments</span>
          </div>
        </div>

        {/* Platform split */}
        <div className="pa-kpi-card">
          <div className="pa-kpi-top">
            <span className="pa-kpi-label">Platform Split (Web / Mob)</span>
            <div className="pa-kpi-icon" style={{ color: '#da22ff', background: 'rgba(218,34,255,0.08)', borderColor: 'rgba(218,34,255,0.15)' }}><FaGlobe /></div>
          </div>
          <div className="pa-kpi-value">{platformStats.web.count} / {platformStats.mobile.count}</div>
          <div className="pa-kpi-trend trend-up" style={{ color: '#888' }}>
            <span>₹{Math.round(platformStats.web.revenueINR).toLocaleString()} Web | ₹{Math.round(platformStats.mobile.revenueINR).toLocaleString()} Mob</span>
          </div>
        </div>
      </div>

      {/* CHARTS */}
      <div className="pa-charts-row">
        {/* Recent Transaction Volume Chart */}
        <div className="pa-chart-box">
          <div className="pa-chart-title"><FaChartLine /> Recent Transaction Volume (INR)</div>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={transactionChartData}> 
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#181818" />
              <XAxis dataKey="date" tickFormatter={(t) => new Date(t).getDate()} stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#555" fontSize={11} tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.02)' }} content={<CustomTooltip />} />
              <Bar dataKey="displayAmount" fill="#00ff88" radius={[6,6,0,0]} barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Plan Distribution Chart */}
        <div className="pa-chart-box">
          <div className="pa-chart-title"><FaCrown /> Plan Distribution</div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={tiersData} innerRadius={60} outerRadius={80} paddingAngle={4} dataKey="value">
                {tiersData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="bottom" iconType="circle" />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* DYNAMIC FILTERS BAR */}
      <div className="pa-controls-section">
        <div className="pa-filters-bar">
          <div className="pa-search-wrap">
            <FaSearch className="pa-search-icon" />
            <input 
              type="text" 
              className="pa-input" 
              placeholder="Search by User, Email, Transaction ID..." 
              value={searchTerm} 
              onChange={e => { setSearchTerm(e.target.value); setVisibleCount(25); }} 
            />
          </div>
          <select className="pa-select" value={statusFilter} onChange={e => { setStatusFilter(e.target.value); setVisibleCount(25); }}>
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="expired">Expired Only</option>
          </select>
          <select className="pa-select" value={currencyFilter} onChange={e => { setCurrencyFilter(e.target.value); setVisibleCount(25); }}>
            <option value="all">All Currencies</option>
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
          </select>
          <select className="pa-select" value={sourceFilter} onChange={e => { setSourceFilter(e.target.value); setVisibleCount(25); }}>
            <option value="all">All Sources</option>
            <option value="facebook">Facebook Ads</option>
            <option value="organic">Organic / Others</option>
          </select>
          <select className="pa-select" value={platformFilter} onChange={e => { setPlatformFilter(e.target.value); setVisibleCount(25); }}>
            <option value="all">All Platforms</option>
            <option value="web">Web</option>
            <option value="mobile">Mobile</option>
          </select>
          <button className="pa-btn" onClick={exportJSON} title="Export JSON format">
            JSON
          </button>
          <button className="pa-btn" onClick={exportCSV} title="Export CSV format for Excel">
            <FaDownload /> CSV
          </button>
        </div>
        <div style={{ fontSize: 13, color: '#555', fontWeight: 600 }}>
          Showing {Math.min(paginatedTxns.length, filteredTransactions.length)} of {filteredTransactions.length} matching transactions
        </div>
      </div>

      {/* TRANSACTIONS TABLE */}
      <div className="pa-table-section">
        <div className="pa-table-card">
          <table className="pa-table">
            <thead>
              <tr>
                <th>User / Subscriber</th>
                <th>Amount</th>
                <th>Platform</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Plan Expiry</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedTxns.map((txn) => {
                const isActive = isSubscriptionActive(txn.expiry_date);
                return (
                  <tr key={txn._id}>
                    <td>
                      <div className="pa-user-cell">
                        <span className="pa-user-name">
                          {txn.user?.name || 'Deleted User'}
                          {txn.user?.isDeleted && <span style={{ fontSize: 10, color: '#666', fontWeight: 400, marginLeft: 4 }}>(Deleted)</span>}
                          {txn.isFacebookSource && (
                            <span title="Acquired via Facebook Ads">
                              <FaFacebook style={{ color: '#1877f2', marginLeft: '6px', fontSize: '13px' }} />
                            </span>
                          )}
                        </span>
                        <span className="pa-user-email">{txn.user?.email || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <span className="pa-amount">{formatCurrency(txn.rupees, txn.currency)}</span>
                    </td>
                    <td>
                      <span className={`pa-platform-badge ${txn.platform === 'mobile' ? 'platform-mobile' : 'platform-web'}`}>
                        {txn.platform === 'mobile' ? <FaMobileAlt style={{ marginRight: '6px' }} /> : <FaGlobe style={{ marginRight: '6px' }} />}
                        {txn.platform === 'mobile' ? 'Mobile' : 'Web'}
                      </span>
                    </td>
                    <td>
                      <span className="pa-mono-id">{txn.transaction_id}</span>
                    </td>
                    <td>{formatDate(txn.date)}</td>
                    <td>{formatDate(txn.expiry_date)}</td>
                    <td>
                      <span className={`pa-status-badge ${isActive ? 'status-active' : 'status-expired'}`}>
                        {isActive ? 'Active' : 'Expired'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTransactions.length === 0 && (
             <div style={{ padding: 60, textAlign: 'center', color: '#444', fontWeight: 600 }}>
               No transaction logs found matching your criteria.
             </div>
          )}
        </div>

        {/* LOAD MORE PAGINATION */}
        {filteredTransactions.length > visibleCount && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0 0' }}>
            <button className="pa-btn" onClick={() => setVisibleCount(prev => prev + 25)}>
              Load More Transactions
            </button>
          </div>
        )}
      </div>

    </div>
  );
};

export default PaymentActivityAdmin;