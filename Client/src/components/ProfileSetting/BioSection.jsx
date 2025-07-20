'use client';

import { useState, useEffect } from "react";
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css";
import axios from "axios";
import api from "../../config/api";
import PopNoti from "../PopNoti";

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
    // Client-side only code
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
      <header className="profile-setting-header3">
        <PopNoti
          message={notification.message}
          type={notification.type}
          isVisible={notification.show}
          onClose={() => setNotification({ ...notification, show: false })}
        />
        <h2>My Account</h2>
        <button onClick={() => onBackSBTNSelect(true)}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M4.99989 10.0001L4.99976 19L6.99976 19L6.99986 12.0001L17.1717 12L13.222 15.9498L14.6362 17.364L21.0001 11L14.6362 4.63605L13.222 6.05026L17.1717 10L4.99989 10.0001Z"></path>
          </svg>
        </button>
      </header>

      <div className="bio-section-container3">
        {loading ? (
          <div className="skeleton-loader">
            <div className="skeleton-image"></div>
            <div className="skeleton-text"></div>
            <div className="skeleton-text small"></div>
          </div>
        ) : (
          <>
            <div className="bio-section-user-detail-top">
              {previewImage && (
                <img
                  src={previewImage instanceof File ? URL.createObjectURL(previewImage) : previewImage}
                  alt="Profile Preview"
                  style={{ width: "100px", height: "100px", borderRadius: "50%" }}
                />
              )}
              <h4>{userData?.name}</h4>
              <p>{userData?.email}</p>
            </div>

            <section className="bio-section-box4">
              <label>
                Upload Profile Picture:
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setPreviewImage(e.target.files[0])}
                />
              </label>

              <label>
                Phone Number:
                <PhoneInput
                  defaultCountry="IN"
                  placeholder="Enter phone number"
                  value={userData?.phone_number}
                  onChange={(value) =>
                    setUserData({ ...userData, phone_number: value })
                  }
                />
              </label>

              <label>
                Gender:
                <select
                  disabled
                  value={userData?.gender}
                  onChange={(e) =>
                    setUserData({ ...userData, gender: e.target.value })
                  }
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </label>

              <label>
                Age:
                <input
                  type="number"
                  value={userData?.age}
                  onChange={(e) =>
                    setUserData({ ...userData, age: e.target.value })
                  }
                />
              </label>
            </section>

            <h4 className="sign-fdwf4">
              Interests: <p>You can choose multiple options</p>
            </h4>
            <div className="singip-instrwe">
              <div className="emojis-dign">
                {options.interests.map(({ id, label, img }) => (
                  <div
                    key={id}
                    className={`crete-3-box3s ${
                      selectedInterests.includes(id) ? "selected-interest" : ""
                    }`}
                    onClick={() => handleInterestSelect(id)}
                  >
                    <img src={img} alt={label} />
                    <h3>{label}</h3>
                  </div>
                ))}
              </div>
            </div>

            <button style={{marginTop:'1rem'}} className="otp-btn-singr" onClick={handleUpdateProfile} disabled={updating}>
              {updating ? <span className="loader-signin"></span> : "Update Profile"}
            </button>
          </>
        )}
      </div>
    </>
  );
}

export default BioSection;