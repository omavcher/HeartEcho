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
      <header className="profile-setting-header3-dwdjwd">
        <PopNoti
          message={notification.message}
          type={notification.type}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
        <h2 className="profile-header-title-dwdsjwd">My Account</h2>
        <button className="back-button-dwdjwd" onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="back-icon-dwdjwd">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="bio-section-container3-dwdjwd">
        {loading ? (
          <div className="skeleton-loader-dwdjwd">
            <div className="skeleton-image-dwdjwd"></div>
            <div className="skeleton-text-dwdjwd"></div>
            <div className="skeleton-text-dwdjwd small-dwdjwd"></div>
          </div>
        ) : (
          <>
            <div className="bio-section-user-detail-top-dwdjwd">
              <div className="profile-image-container-dwdjwd">
                {previewImage && (
                  <img
                    src={previewImage instanceof File ? URL.createObjectURL(previewImage) : previewImage}
                    alt="Profile Preview"
                    className="profile-image-dwdjwd"
                  />
                )}
                <div className="profile-image-overlay-dwdjwd">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPreviewImage(e.target.files[0])}
                    className="file-input-dwdjwd"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="camera-icon-dwdjwd">
                    <path d="M12 9C13.6569 9 15 10.3431 15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9ZM12 17C14.7614 17 17 14.7614 17 12C17 9.23858 14.7614 7 12 7C9.23858 7 7 9.23858 7 12C7 14.7614 9.23858 17 12 17ZM12 4.5C17 4.5 21.27 7.61 23 12C21.27 16.39 17 19.5 12 19.5C7 19.5 2.73 16.39 1 12C2.73 7.61 7 4.5 12 4.5ZM3.18 12C4.83 15.36 8.24 17.5 12 17.5C15.76 17.5 19.17 15.36 20.82 12C19.17 8.64 15.76 6.5 12 6.5C8.24 6.5 4.83 8.64 3.18 12Z"></path>
                  </svg>
                </div>
              </div>
              <h4 className="user-name-dwdjwd">{userData?.name}</h4>
              <p className="user-email-dwdjwd">{userData?.email}</p>
            </div>

            <section className="bio-section-box4-dwdjwd">
              <div className="form-group-dwdjwd">
                <label className="form-label-dwdjwd">
                  Phone Number
                </label>
                <div className="phone-input-container-dwdjwd">
                  <PhoneInput
                    defaultCountry="IN"
                    placeholder="Enter phone number"
                    value={userData?.phone_number}
                    onChange={(value) =>
                      setUserData({ ...userData, phone_number: value })
                    }
                    className="phone-input"
                  />
                </div>
              </div>

              <div className="form-group-dwdjwd">
                <label className="form-label-dwdjwd">
                  Gender
                </label>
                <select
                  disabled
                  value={userData?.gender}
                  onChange={(e) =>
                    setUserData({ ...userData, gender: e.target.value })
                  }
                  className="form-select-dwdjwd"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="form-group-dwdjwd">
                <label className="form-label-dwdjwd">
                  Age
                </label>
                <input
                  type="number"
                  value={userData?.age}
                  onChange={(e) =>
                    setUserData({ ...userData, age: e.target.value })
                  }
                  className="form-input-dwdjwd"
                  min="1"
                  max="120"
                />
              </div>
            </section>

            <div className="interests-section-dwdjwd">
              <h4 className="interests-title-dwdjwd">
                Interests <span className="interests-subtitle-dwdjwd">You can choose multiple options</span>
              </h4>
              <div className="interests-grid-dwdjwd">
                {options.interests.map(({ id, label, img }) => (
                  <div
                    key={id}
                    className={`interest-item-dwdjwd ${
                      selectedInterests.includes(id) ? "interest-item-selected-dwdjwd" : ""
                    }`}
                    onClick={() => handleInterestSelect(id)}
                  >
                    <div className="interest-emoji-dwdjwd">
                      <img src={img} alt={label} className="interest-image-dwdjwd" />
                    </div>
                    <h3 className="interest-label-dwdjwd">{label}</h3>
                  </div>
                ))}
              </div>
            </div>

            <button className="update-button-dwdjwd" onClick={handleUpdateProfile} disabled={updating}>
              {updating ? <span className="loader-signin-dwdjwd"></span> : "Update Profile"}
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default BioSection;