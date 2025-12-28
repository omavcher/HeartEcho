'use client';
///
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
    <div className="billing-container">
      {/* Notification Popup */}
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <div className="search-bar-billing-price">
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          className="name-input"
          disabled
        />
        <input
          type="text"
          name="transactionId"
          value={formData.transactionId}
          onChange={handleInputChange}
          className="id-input"
        />
        <input
          type="number"
          name="amount"
          value={formData.amount}
          onChange={handleInputChange}
          className="mileage-input"
        />
        <button className="search-btn-billing-price" onClick={handleSearch}>
          Search
        </button>
      </div>

      <div className="customers-found">
        <p>{paymentData ? 'Payment Found' : 'Payment Not Found'}</p>
      </div>

      <div className="customer-cards">
        {/* Active Payments List */}
        <div className="customer-card active">
          <div className="customer-header">
            <img
              src={paymentData?.profilePicture || "/default-profile.png"}
              alt={paymentData?.name || "User"}
              className="profile-img"
            />
            <div className="customer-info">
              <h3>{paymentData?.name || "User Name"}</h3>
              <p>{paymentData?.paymentHistory?.length > 0 ? "Payments" : "No Payments Yet"}</p>
            </div>
            <span className="status active">Active</span>
          </div>

          <div className="customer-details">
            {paymentData?.paymentHistory?.length > 0 ? (
              paymentData.paymentHistory.map((payment) => (
                <div key={payment._id} className="payment-item">
                  <p>
                    <strong>Transaction ID:</strong> {payment.transaction_id}
                  </p>
                  <p>
                    <strong>Amount Paid:</strong> ₹{payment.rupees}
                  </p>
                  <p>
                    <strong>Payment Date:</strong> {new Date(payment.date).toLocaleDateString()}
                  </p>
                  <p>
                    <strong>Expiry Date:</strong> {new Date(payment.expiry_date).toLocaleDateString()}
                  </p>
                </div>
              ))
            ) : (
              <p>No past payments found.</p>
            )}
          </div>
        </div>

        {/* Next Payment Details Card */}
        <div className="customer-card inactive">
          <div className="customer-header">
            <div className="customer-abbr">{paymentData?.name?.charAt(0) || "U"}</div>
            <div className="customer-info">
              <h3>{paymentData?.name || "User Name"}</h3>
              <p>{paymentData?.nextSubscriptionDate ? "Next Payment Due" : "Subscribe to See"}</p>
            </div>
            <span className="status inactive">{paymentData?.nextSubscriptionDate ? "Pending" : "Not Subscribed"}</span>
          </div>

          <div className="customer-details">
            {paymentData?.nextSubscriptionDate ? (
              <p>
                <strong>Next Due Date:</strong> {paymentData.nextSubscriptionDate}
              </p>
            ) : (
              <p>Subscribe to see payment details.</p>
            )}
          </div>

          <Link href='/subscribe' className="edit-merge-btn">
            {paymentData?.nextSubscriptionDate ? "Pay Now" : "Subscribe"}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BillingPrice;