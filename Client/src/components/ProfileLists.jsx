'use client';

import { useState, useEffect } from 'react';
import "../styles/ProfileLists.css";
import PopNoti from '../components/PopNoti';
import api from '../config/api';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie'; // Make sure this is imported

function ProfileLists({ handleSettindSelection, onBackSBTNSelect }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [deleteing, setDeleting] = useState(false);
  const [submiting, setSubmiting] = useState(false);
  const [userData, setUserData] = useState(null);
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [token, setToken] = useState(null);
  const [twoFactor, setTwoFactor] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Client-side only code
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  const handleDeleteClick = () => {
    const email = userData?.email || "";
    const masked = email.replace(/(.{3}).+(@.+)/, "$1**********$2");
    setMaskedEmail(masked);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const res = await axios.post(`${api.Url}/user/send-otp-destroy`, { email: userData.email }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        setNotification({ show: true, message: "OTP sent successfully!", type: "success" });
        setShowDeleteConfirm(false);
        setShowOtpInput(true);
      }
    } catch (error) {
      setNotification({ show: true, message: "Error sending OTP", type: "error" });
    }
    setDeleting(false);
  };

  const handleVerifyOtp = async () => {
    setSubmiting(true);
    try {
      const res = await axios.post(`${api.Url}/user/verify-otp-destroy`, { email: userData.email, otp }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.data.success) {
        await axios.delete(`${api.Url}/user/delete-account`, { headers: { Authorization: `Bearer ${token}` } });
        alert("Account deleted successfully.");
        localStorage.clear();
        router.push("/login");
      } else {
        setNotification({ show: true, message: "Invalid OTP. Please try again.", type: "error" });
      }
    } catch (error) {
      setNotification({ show: true, message: "Error verifying OTP", type: "error" });
    }
    setSubmiting(false);
  };

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get(
          `${api.Url}/user/get-user`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (res.data) {
          setUserData(res.data);
          setTwoFactor(res.data.twofactor);
        }
      } catch (error) {
        setNotification({ show: true, message: "Error fetching user", type: "error" });
      }
    };

    if (token) {
      getUserData();
    }
  }, [token]);

  const handleToggle2F = async () => {
    const newStatus = !twoFactor;
    setTwoFactor(newStatus);

    try {
      const response = await axios.post(`${api.Url}/user/twofactor`, { twofactor: newStatus }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setNotification({
        show: true,
        message: "Two-factor authentication updated successfully",
        type: "success",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: error.response?.data?.message || "Error updating two-factor",
        type: "error",
      });
      setTwoFactor(!newStatus);
    }
  };


  const handleLogout = () => {
    // Clear localStorage
    localStorage.clear();
  
    // Remove the auth cookie
    Cookies.remove('token');
  
    // Redirect to login
    router.push("/login");
  };
  

  return (
    <>
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />
      
      <div className='profile-top-bio-containe'>
        <div className='profile-top-bio-contain-user-info'>
          <img src={userData?.profile_picture || "/default-profile.png"} alt={`Profile-${userData?.name || "User"}`} />
          <span>
            <h2>{userData?.name || "Loading..."}</h2>
            <p>{userData?.email || "Fetching email..."}</p>
          </span>
        </div>
      </div>

      <section className='main-setting-section'>
        <div className='main-setting-list-q3' onClick={() => { handleSettindSelection(2); onBackSBTNSelect(false); }}>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3.78307 2.82598L12 1L20.2169 2.82598C20.6745 2.92766 21 3.33347 21 3.80217V13.7889C21 15.795 19.9974 17.6684 18.3282 18.7812L12 23L5.6718 18.7812C4.00261 17.6684 3 15.795 3 13.7889V3.80217C3 3.33347 3.32553 2.92766 3.78307 2.82598ZM5 4.60434V13.7889C5 15.1263 5.6684 16.3752 6.7812 17.1171L12 20.5963L17.2188 17.1171C18.3316 16.3752 19 15.1263 19 13.7889V4.60434L12 3.04879L5 4.60434ZM12 11C10.6193 11 9.5 9.88071 9.5 8.5C9.5 7.11929 10.6193 6 12 6C13.3807 6 14.5 7.11929 14.5 8.5C14.5 9.88071 13.3807 11 12 11ZM7.52746 16C7.77619 13.75 9.68372 12 12 12C14.3163 12 16.2238 13.75 16.4725 16H7.52746Z"></path>
            </svg>
            <span>
              <h3>My Account</h3>
              <p>Make changes to your account.</p>
            </span>
          </div>
          <svg className='main-setting-lisvg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 12L10 18V6L16 12Z"></path>
          </svg>
        </div>

        <div className='main-setting-list-q3' onClick={() => { handleSettindSelection(4); onBackSBTNSelect(false); }}>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.298 22 8.69525 21.5748 7.29229 20.8248L2 22L3.17629 16.7097C2.42562 15.3063 2 13.7028 2 12C2 6.47715 6.47715 2 12 2ZM12 4C7.58172 4 4 7.58172 4 12C4 13.3347 4.32563 14.6181 4.93987 15.7664L5.28952 16.4201L4.63445 19.3663L7.58189 18.7118L8.23518 19.061C9.38315 19.6747 10.6659 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4ZM12 7C13.6569 7 15 8.34315 15 10V11H16V16H8V11H9V10C9 8.34315 10.3431 7 12 7ZM14 13H10V14H14V13ZM12 9C11.4477 9 11 9.45 11 10V11H13V10C13 9.44772 12.5523 9 12 9Z"></path>
            </svg>
            <span>
              <h3>Chat Manage</h3>
              <p>Control chat settings.</p>
            </span>
          </div>
          <svg className='main-setting-lisvg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 12L10 18V6L16 12Z"></path>
          </svg>
        </div>

        <div className='main-setting-list-q3' onClick={() => { handleSettindSelection(6); onBackSBTNSelect(false); }}>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20 22H4C3.44772 22 3 21.5523 3 21V3C3 2.44772 3.44772 2 4 2H20C20.5523 2 21 2.44772 21 3V21C21 21.5523 20.5523 22 20 22ZM19 20V4H5V20H19ZM8 9H16V11H8V9ZM8 13H16V15H8V13Z"></path>
            </svg>
            <span>
              <h3>Subscription & Billing</h3>
              <p>Manage payments.</p>
            </span>
          </div>
          <svg className='main-setting-lisvg' xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16 12L10 18V6L16 12Z"></path>
          </svg>
        </div>
      </section>

      <h1 className='h1-more3ess'>More</h1>

      <section className='mores3-setting-section'>
        <div className='main-setting-list-q3'>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.29117 20.8242L2 22L3.17581 16.7088C2.42544 15.3056 2 13.7025 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.2975 22 8.6944 21.5746 7.29117 20.8242ZM7.58075 18.711L8.23428 19.0605C9.38248 19.6745 10.6655 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 13.3345 4.32549 14.6175 4.93949 15.7657L5.28896 16.4192L4.63416 19.3658L7.58075 18.711ZM7 12H9C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12H17C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12Z"></path>
            </svg>
            <span>
              <h3>Security Alerts</h3>
              <p>Get notified of risks.</p>
            </span>
          </div>
          <label className="toggle-switch">
            <input type="checkbox" checked={userData?.termsAccepted} readOnly />
            <span className="slider"></span>
          </label>
        </div>

        <div className='main-setting-list-q3'>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 10V20H19V10H6ZM18 8H20C20.5523 8 21 8.44772 21 9V21C21 21.5523 20.5523 22 20 22H4C3.44772 22 3 21.5523 3 21V9C3 8.44772 3.44772 8 4 8H6V7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7V8ZM16 8V7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7V8H16ZM7 11H9V13H7V11ZM7 14H9V16H7V14ZM7 17H9V19H7V17Z"></path>
            </svg>
            <span>
              <h3>Enable 2FA</h3>
              <p>Secure your account.</p>
            </span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={twoFactor}
              onChange={handleToggle2F}
            />
            <span className="slider"></span>
          </label>
        </div>

        <div className='main-setting-list-q3'>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 6H22V8H20V21C20 21.5523 19.5523 22 19 22H5C4.44772 22 4 21.5523 4 21V8H2V6H7V3C7 2.44772 7.44772 2 8 2H16C16.5523 2 17 2.44772 17 3V6ZM9 4V6H15V4H9ZM9 16V18H7V16H9ZM9 13V15H7V13H9ZM9 10V12H7V10H9ZM15 4H9V6H15V4Z"></path>
            </svg>
            <span>
              <h3>Delete Account</h3>
              <p>Remove your profile.</p>
            </span>
          </div>
          <button className='main-setting-more-dele' onClick={handleDeleteClick}>Delete</button>
        </div>

        {showDeleteConfirm && (
          <div className="overlay-delete-confirm">
            <div className="popup">
              <h3>Are you sure?</h3>
              <p>Do you want to delete your account?</p>
              <div className='overlay-delect-nos-c'>
                <button style={{ marginTop: '1rem' }} className="otp-btn-singr" onClick={handleConfirmDelete} disabled={deleteing}>
                  {deleteing ? <span className="loader-signin"></span> : "Delete"}
                </button>
                <button style={{ marginTop: '1rem' }} className="otp-btn-singr" onClick={() => setShowDeleteConfirm(false)}>No</button>
              </div>
            </div>
          </div>
        )}

        {showOtpInput && (
          <div className="overlay-delete-confirm">
            <div className="popup">
              <h3>OTP Verification</h3>
              <p>Enter the OTP sent to {maskedEmail}</p>
              <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <button style={{ marginTop: '1rem' }} className="otp-btn-singr" onClick={handleVerifyOtp} disabled={submiting}>
                {submiting ? <span className="loader-signin"></span> : "Submit"}
              </button>
            </div>
          </div>
        )}
      </section>

      <h1 className='h1-more3ess'>Support</h1>

      <section className='suppoedt-setting-section'>
        <div className='main-setting-list-q3' onClick={() => { handleSettindSelection(10); onBackSBTNSelect(false); }}>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M7.29117 20.8242L2 22L3.17581 16.7088C2.42544 15.3056 2 13.7025 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C10.2975 22 8.6944 21.5746 7.29117 20.8242ZM7.58075 18.711L8.23428 19.0605C9.38248 19.6745 10.6655 20 12 20C16.4183 20 20 16.4183 20 12C20 7.58172 16.4183 4 12 4C7.58172 4 4 7.58172 4 12C4 13.3345 4.32549 14.6175 4.93949 15.7657L5.28896 16.4192L4.63416 19.3658L7.58075 18.711ZM7 12H9C9 13.6569 10.3431 15 12 15C13.6569 15 15 13.6569 15 12H17C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12Z"></path>
            </svg>
            <span>
              <h3>Live Chat</h3>
              <p>Instant support.</p>
            </span>
          </div>
          <button className='main-setting-swx3'>Instant Support</button>
        </div>

        <div className='main-setting-list-q3' onClick={() => { handleSettindSelection(11); onBackSBTNSelect(false); }}>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17 2V4H20.0066C20.5552 4 21 4.44495 21 4.9934V21.0066C21 21.5552 20.5551 22 20.0066 22H3.9934C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H7V2H17ZM7 6H5V20H19V6H17V8H7V6ZM9 16V18H7V16H9ZM9 13V15H7V13H9ZM9 10V12H7V10H9ZM15 4H9V6H15V4Z"></path>
            </svg>
            <span>
              <h3>FAQ</h3>
              <p>Find quick answers.</p>
            </span>
          </div>
          <button className='main-setting-swx3'>Quick Answers</button>
        </div>

        <div className='main-setting-list-q3' onClick={() => { handleSettindSelection(12); onBackSBTNSelect(false); }}>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M2.00488 9.49979V3.99979C2.00488 3.4475 2.4526 2.99979 3.00488 2.99979H21.0049C21.5572 2.99979 22.0049 3.4475 22.0049 3.99979V9.49979C20.6242 9.49979 19.5049 10.6191 19.5049 11.9998C19.5049 13.3805 20.6242 14.4998 22.0049 14.4998V19.9998C22.0049 20.5521 21.5572 20.9998 21.0049 20.9998H3.00488C3.44476 22 3 21.5551 3 21.0066V4.9934C3 4.44476 3.44495 4 3.9934 4H7V2H17ZM7 6H5V20H19V6H17V8H7V6ZM9 16V18H7V16H9ZM9 13V15H7V13H9ZM9 10V12H7V10H9ZM15 4H9V6H15V4Z"></path>
            </svg>
            <span>
              <h3>Submit a Ticket</h3>
              <p>Request help.</p>
            </span>
          </div>
          <button className='main-setting-swx3'>Request Help</button>
        </div>

        <div className='main-setting-list-q3'>
          <div className='main-list-info-cont'>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 22C4.44772 22 4 21.5523 4 21V3C4 2.44772 4.44772 2 5 2H19C19.5523 2 20 2.44772 20 3V6H18V4H6V20H18V18H20V21C20 21.5523 19.5523 22 19 22H5ZM18 16V13H11V11H18V8L23 12L18 16Z"></path>
            </svg>
            <span>
              <h3>Come Back Soon!</h3>
              <p>We hope to see you again soon.</p>
            </span>
          </div>
          <button
            className='main-setting-swx3'
            onClick={handleLogout}
          >
            Logout
          </button>
        </div>
      </section>
    </>
  )
}

export default ProfileLists;