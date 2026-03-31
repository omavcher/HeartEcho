'use client';

import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import api from "../../config/api";
import PopNoti from "../PopNoti";
import './BioSection.css'

function BioSection({ onBackSBTNSelect }) {
  const [userData, setUserData] = useState(null);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [token, setToken] = useState(null);

  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "",
  });

  const options = {
    interests: [
      { id: "travel", label: "Travel", img: "/emojis/travel.png" },
      { id: "cinema", label: "Cinema", img: "/emojis/cinema.png" },
      { id: "music", label: "Music", img: "/emojis/music.png" },
      { id: "fitness", label: "Fitness", img: "/emojis/fitness.png" },
      { id: "tech", label: "Tech", img: "/emojis/technology.png" },
      { id: "gaming", label: "Gaming", img: "/emojis/gaming.png" },
      { id: "cooking", label: "Cooking & Food", img: "/emojis/cooking.png" },
      { id: "sports", label: "Sports", img: "/emojis/sports.png" },
      { id: "books", label: "Books", img: "/emojis/books.png" },
      { id: "nature", label: "Nature", img: "/emojis/nature.png" },
    ],
  };

  useEffect(() => {
    setToken(typeof window !== 'undefined' ? localStorage.getItem("token") : null);
  }, []);

  useEffect(() => {
    const getUserData = async () => {
      try {
        const res = await axios.get(`${api.Url}/user/get-user`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.data) {
          setUserData(res.data);
          setSelectedInterests(res.data.selectedInterests || []);
          setPreviewImage(res.data.profile_picture);
        }
      } catch (error) {
        setNotification({
          show: true,
          message: "Error fetching user data. Please try again!",
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      getUserData();
    }
  }, [token]);

  const handleInterestSelect = (id) => {
    setSelectedInterests((prev) =>
      prev.includes(id)
        ? prev.filter((interest) => interest !== id)
        : [...prev, id]
    );
  };

  const handleUpdateProfile = async () => {
    setUpdating(true);

    try {
      let profileImageUrl = userData?.profile_picture;

      if (previewImage instanceof File) {
        const formData = new FormData();
        formData.append("file", previewImage);
        formData.append("upload_preset", "profile_pectures");
        formData.append("cloud_name", "dx6rjowfb");

        const cloudinaryRes = await axios.post(
          "https://api.cloudinary.com/v1_1/dx6rjowfb/image/upload",
          formData
        );
        profileImageUrl = cloudinaryRes.data.secure_url;
      }

      await axios.put(
        `${api.Url}/user/update-profile`,
        { ...userData, profile_picture: profileImageUrl, selectedInterests },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setNotification({
        show: true,
        message: "Profile updated successfully!",
        type: "success",
      });
    } catch (error) {
      setNotification({
        show: true,
        message: "Failed to update profile. Try again!",
        type: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <>
      <header className="ios-profile-header">
        <PopNoti
          message={notification.message}
          type={notification.type}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
        <h2 className="ios-header-title">My Account</h2>
        <button className="ios-back-btn" onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="ios-settings-container">
        {loading ? (
          <div className="ios-skeleton-container">
            <div className="ios-skeleton-avatar"></div>
            <div className="ios-skeleton-text"></div>
          </div>
        ) : (
          <>
            <div className="ios-profile-hero">
              <div 
                className="ios-photo-edit-group" 
                onClick={() => document.getElementById('ios-file-upload').click()}
              >
                {previewImage ? (
                  <img
                    src={previewImage instanceof File ? URL.createObjectURL(previewImage) : previewImage}
                    alt="Profile"
                    className="ios-profile-photo"
                  />
                ) : (
                  <div className="ios-profile-photo-placeholder"></div>
                )}
                <span className="ios-photo-edit-text">Edit</span>
                <input
                  id="ios-file-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPreviewImage(e.target.files[0]);
                    }
                  }}
                />
              </div>
              <p className="ios-profile-email">{userData?.email}</p>
            </div>

            <div className="ios-settings-group">
              <h3 className="ios-group-title">PERSONAL INFORMATION</h3>
              <div className="ios-list">
                <div className="ios-list-item">
                  <span className="ios-item-title-col">Name</span>
                  <input
                    type="text"
                    className="ios-input-right"
                    value={userData?.name || ""}
                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                    placeholder="Provide your name"
                  />
                </div>
                
                <div className="ios-list-item">
                  <span className="ios-item-title-col">Phone</span>
                  <div className="ios-phone-right">
                    <PhoneInput
                      defaultCountry="IN"
                      placeholder="Enter phone"
                      value={userData?.phone_number}
                      onChange={(value) => setUserData({ ...userData, phone_number: value })}
                      className="ios-phone-input"
                    />
                  </div>
                </div>

                <div className="ios-list-item">
                  <span className="ios-item-title-col">Gender</span>
                  <select
                    className="ios-select-right"
                    value={
                      userData?.gender?.toLowerCase() === "male" ? "male" :
                      userData?.gender?.toLowerCase() === "female" ? "female" :
                      userData?.gender?.toLowerCase() === "other" ? "Other" : ""
                    }
                    onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
                  >
                    <option value="" disabled>Not specified</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="ios-list-item">
                  <span className="ios-item-title-col">Age</span>
                  <input
                    type="number"
                    className="ios-input-right"
                    value={userData?.age || ""}
                    onChange={(e) => setUserData({ ...userData, age: e.target.value })}
                    placeholder="Enter age"
                    min="1"
                    max="120"
                  />
                </div>
              </div>
            </div>

            <div className="ios-settings-group">
              <h3 className="ios-group-title">INTERESTS</h3>
              <div className="ios-interests-wrapper">
                {options.interests.map(({ id, label, img }) => (
                  <div
                    key={id}
                    className={`ios-interest-chip ${selectedInterests.includes(id) ? 'ios-interest-active' : ''}`}
                    onClick={() => handleInterestSelect(id)}
                  >
                    <div className="ios-chip-emoji-box">
                      <img src={img} alt={label} className="ios-chip-img" />
                    </div>
                    <span>{label}</span>
                  </div>
                ))}
              </div>
              <p className="ios-group-footer">Selecting interests helps us personalize your experience.</p>
            </div>

            <div className="ios-submit-container">
              <button 
                className="ios-primary-btn" 
                onClick={handleUpdateProfile}
                disabled={updating}
              >
                 {updating ? <span className="ios-spinner ios-spinner-white"></span> : "Update Profile"}
              </button>
            </div>

          </>
        )}
      </div>
    </>
  );
}

export default BioSection;