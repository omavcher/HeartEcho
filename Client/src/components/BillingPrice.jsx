'use client';

import  { useEffect, useState } from "react";
import "../styles/BillingPrice.css";
import axios from "axios";
import api from "../config/api";
import PopNoti from "../components/PopNoti";
import Link from 'next/link';

const BillingPrice = () => {
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });
  const [paymentData, setPaymentData] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    transactionId: "",
    amount: "",
  });
  const [token, setToken] = useState(null);

  useEffect(() => {
    // Client-side only code
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get(`${api.Url}/user/payment-details`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setPaymentData(res.data);
          setFormData({
            name: res.data.name || "User",
            transactionId: res.data.paymentHistory?.[0]?.transaction_id || "pay_Q2iK4rdJgcenqN0",
            amount: res.data.paymentHistory?.[0]?.rupees || 40,
          });
        }
      } catch (error) {
        setNotification({
          show: true,
          message: "Error fetching user data. Please try again!",
          type: "error",
        });
      }
    };

    if (token) {
      getUserData();
    }
  }, [token]);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearch = () => {
    console.log("Searching for:", formData);
  };

  return (
    <div className="ios-settings-container">
      {/* Notification Popup */}
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <div className="ios-settings-group">
        <h3 className="ios-group-title">VERIFY TRANSACTION</h3>
        <div className="ios-list">
          <div className="ios-list-item">
            <span className="ios-item-title-col">Name</span>
            <input className="ios-input-right" disabled value={formData.name} onChange={handleInputChange} name="name" />
          </div>
          <div className="ios-list-item">
            <span className="ios-item-title-col">Txn ID</span>
            <input className="ios-input-right" value={formData.transactionId} onChange={handleInputChange} name="transactionId" />
          </div>
          <div className="ios-list-item">
            <span className="ios-item-title-col">Amount</span>
            <input type="number" className="ios-input-right" value={formData.amount} onChange={handleInputChange} name="amount" />
          </div>
          <div className="ios-list-item ios-action-item ios-center-action" onClick={handleSearch}>
            <span className="ios-action-text ios-primary-action" style={{color: 'var(--ios-theme-accent)'}}>Search</span>
          </div>
        </div>
        <p className="ios-group-footer">Use the above to manually query specific payment records. Result: {paymentData ? 'Found' : 'Not Found'}.</p>
      </div>

      <div className="ios-settings-group">
        <h3 className="ios-group-title">PAYMENT HISTORY</h3>
        <div className="ios-list">
          {paymentData?.paymentHistory?.length > 0 ? (
            paymentData.paymentHistory.map((payment) => (
              <div key={payment._id} className="ios-list-item ios-payment-row">
                <div className="ios-item-left">
                  <div className="ios-icon-box" style={{ background: '#30d158' }}>
                    <svg viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 1.99 2H18c1.1 0 2-.9 2-2V8l-6-6zm2 14h-4v-1h4v-1h-4v-1h-4v-1h-4v-1h4v5zm-7 0H7v-1h2v-1H7v-1h2v-1H7v-1h2v5zm4-6V3.5L18.5 9H13z"/></svg>
                  </div>
                  <div className="ios-item-stack" style={{display: 'flex', flexDirection: 'column'}}>
                    <span className="ios-item-title">₹{payment.rupees}</span>
                    <span className="ios-item-subtitle" style={{fontSize: '0.8rem', color: 'var(--ios-text-secondary)', marginTop: '2px'}}>{payment.transaction_id}</span>
                  </div>
                </div>
                <div className="ios-item-right" style={{flexDirection: 'column', alignItems: 'flex-end', gap: '2px'}}>
                  <span className="ios-item-value">{new Date(payment.date).toLocaleDateString()}</span>
                  <span className="ios-item-subtitle" style={{fontSize: '0.8rem', color: 'var(--ios-text-secondary)'}}>Exp: {new Date(payment.expiry_date).toLocaleDateString()}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="ios-list-item">
              <span className="ios-item-title" style={{ color: 'var(--ios-text-secondary)' }}>No past payments found.</span>
            </div>
          )}
        </div>
      </div>

      <div className="ios-settings-group">
        <h3 className="ios-group-title">UPCOMING PAYMENT</h3>
        <div className="ios-list">
          <div className="ios-list-item">
            <span className="ios-item-title-col">Next Due</span>
            <span className="ios-item-value">{paymentData?.nextSubscriptionDate ? new Date(paymentData.nextSubscriptionDate).toLocaleDateString() : "Not Subscribed"}</span>
          </div>
          <div className="ios-list-item">
            <span className="ios-item-title-col">Status</span>
            <span className="ios-item-value" style={{ color: paymentData?.nextSubscriptionDate ? '#ff9f0a' : 'var(--ios-text-secondary)', fontWeight: 600 }}>
              {paymentData?.nextSubscriptionDate ? "Pending" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      <div className="ios-submit-container">
        <Link href='/subscribe' className="ios-primary-btn" style={{textDecoration: 'none'}}>
          {paymentData?.nextSubscriptionDate ? "Pay Now" : "Subscribe"}
        </Link>
      </div>

    </div>
  );
};

export default BillingPrice;