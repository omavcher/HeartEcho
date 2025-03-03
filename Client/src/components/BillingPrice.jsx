// BillingPrice.js
import React,{useEffect , useState} from 'react'
import '../styles/BillingPrice.css';  // Correct import

const BillingPrice = () => {
  return (
    <div className="billing-container">

      <div className="search-bar-billing-price">
        <input type="text" placeholder="Devon Lane" className="name-input" />
        <input type="text" placeholder="EADV252020916" className="id-input" />
        <input type="number" placeholder="50,000" className="mileage-input" />
        <button className="search-btn-billing-price">Search</button>
      </div>

      <div className="customers-found">
        <p>2 Customers Found</p>
      </div>

      <div className="customer-cards">
        <div className="customer-card active">
          <div className="customer-header">
            <img src="path-to-profile-image.jpg" alt="Devon Lane" className="profile-img" />
            <div className="customer-info">
              <h3>Devon Lane</h3>
              <p>EADV252020916</p>
            </div>
            <span className="status active">Active</span>
          </div>
          <div className="customer-details">
            <p><strong>Deductible</strong> $100</p>
            <p><strong>VIN</strong> 3DLTAG15414719811</p>
            <p><strong>Term</strong> 60 mo / 100,000 mi</p>
            <p><strong>Vehicle</strong> 2018 Honda Civic</p>
          </div>
          <button className="select-btn">Select </button>
        </div>

        <div className="customer-card inactive">
          <div className="customer-header">
            <div className="customer-abbr">DL</div>
            <div className="customer-info">
              <h3>Devon Lane</h3>
              <p>EADV252020916</p>
            </div>
            <span className="status inactive">Inactive</span>
          </div>
          <div className="customer-details">
            <p><strong>Deductible</strong> $300</p>
            <p><strong>VIN</strong> VAFGAX15235147119</p>
            <p><strong>Term</strong> 24 mo / 100,000 mi</p>
            <p><strong>Vehicle</strong> 2020 DODGE Ram Pickup</p>
          </div>
          <button className="edit-merge-btn">Edit & Merge</button>
        </div>
      </div>
    </div>
  );
};

export default BillingPrice;