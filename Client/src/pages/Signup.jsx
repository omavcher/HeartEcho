import React, { useState ,useEffect,useRef } from 'react';
import '../styles/Signup.css';
import PhoneInput from "react-phone-number-input";
import "react-phone-number-input/style.css"; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import PopNoti from '../components/PopNoti';
import api from '../config/api';
import axios from "axios";
import { useNavigate } from "react-router-dom"; // Import for navigation
import { GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';

function Signup() {
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
    const [step, setStep] = useState(1);
    const [isOtpVerified, setIsOtpVerified] = useState(false);
    const [isGoogleSignup, setIsGoogleSignup] = useState(false);
    const [googleUserData, setGoogleUserData] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);

    const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    twoFA: false,
    profilePicture: "",
    referralCode: "",
    termsAccepted: false,
    subscribeNews: false,
    age: "",
    gender: "",
    selectedInterests: []
  });

  const [isSignup, setIsSignup] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState(["", "", "", "", "", ""]);
    const [timer, setTimer] = useState(0);
    const options = {
      interests: [
          { id: 'travel', label: 'Travel', img: '/emojis/travel.png' },
          { id: 'cinema', label: 'Cinema', img: '/emojis/cinema.png' },
          { id: 'music', label: 'Music', img: '/emojis/music.png' },
          { id: 'fitness', label: 'Fitness', img: '/emojis/fitness.png' },
          { id: 'tech', label: 'Tech', img: '/emojis/technology.png' },
          { id: 'gaming', label: 'Gaming', img: '/emojis/gaming.png' },
          { id: 'cooking', label: 'Cooking & Food', img: '/emojis/cooking.png' },
          { id: 'sports', label: 'Sports', img: '/emojis/sports.png' },
          { id: 'books', label: 'Books', img: '/emojis/books.png' },
          { id: 'nature', label: 'Nature', img: '/emojis/nature.png' }
      ]
  };
const uploadToCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", "profile_pectures"); 
  formData.append("cloud_name", "dx6rjowfb"); 

  try {
    const res = await axios.post(`https://api.cloudinary.com/v1_1/dx6rjowfb/image/upload`, formData);
    return res.data.secure_url; // Cloudinary URL
  } catch (error) {
    setNotification({ show: true, message: "Error uploading profile picture!", type: "warning" });
    return null;
  }
};




    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const sendOtp = async () => {
      if (!formData.email.includes("@")) {
        setNotification({ show: true, message: "Enter a valid email!", type: "warning" });
        return;
      }
    
      setIsSendingOtp(true); // Start loading state
    
      try {
        const res = await axios.post(`${api.Url}/auth/send-otp`, { email: formData.email });
        if (res.data.success) {
          setOtpSent(true);
          setTimer(60);
          setNotification({ show: true, message: "OTP sent successfully!", type: "success" });
    
          const interval = setInterval(() => {
            setTimer((prev) => {
              if (prev === 1) {
                clearInterval(interval);
                setOtpSent(false);
              }
              return prev - 1;
            });
          }, 1000);
        } else {
          setNotification({ show: true, message: "Failed to send OTP!", type: "error" });
        }
      } catch (err) {
        setNotification({ show: true, message: "Server error!", type: "error" });
      } finally {
        setIsSendingOtp(false); // Stop loading state
      }
    };
    



    const nextStep = () => {
      if (step === 1) {
        if (formData.fullName.length < 3) {
          setNotification({ show: true, message: "Name must be at least 3 characters", type: "error" });
          return;
        }
        if (!formData.email.includes("@")) {
          setNotification({ show: true, message: "Enter a valid email!", type: "error" });
          return;
        }
        if (otp.includes("")) {
          setNotification({ show: true, message: "Enter complete OTP!", type: "error" });
          return;
        }
      }
  
      if (step === 2) {
        if (formData.password.length < 8) {
          setNotification({ show: true, message: "Password must be 8+ chars, include a number & special char.", type: "error" });
          return;
        }
        if (formData.password !== formData.confirmPassword) {
          setNotification({ show: true, message: "Passwords do not match!", type: "error" });
          return;
        }
      }
  
      if (step === 3) {
        if (!formData.age || isNaN(formData.age) || formData.age < 18) {
          setNotification({ show: true, message: "Enter valid age (18+)", type: "info" });
          return;
        }
        if (!formData.gender) {
          setNotification({ show: true, message: "Select a gender", type: "error" });
          return;
        }
       
      }

      if (step === 4) {
        if (!formData.termsAccepted) {
          setNotification({ show: true, message: "You must accept the terms", type: "error" });
          return;
        }
        if (formData.selectedInterests.length === 0) {
          setNotification({ show: true, message: "Select at least one interest!", type: "error" });
          return;
        }
      }
  
      setStep(step + 1);
    };
  
  
  const prevStep = () => {
      setStep((prev) => Math.max(prev - 1, 1));
  };


  const inputRefs = useRef([]);

  const handleChangeOtp = (index, e) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return; // Only allow digits

    let newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      let newOtp = [...otp];
      if (newOtp[index] === "" && index > 0) {
        inputRefs.current[index - 1].focus();
      }
      newOtp[index] = "";
      setOtp(newOtp);
    }
  };
 const handleInterestSelect = (interestId) => {
    setFormData((prev) => {
      const selected = prev.selectedInterests.includes(interestId)
        ? prev.selectedInterests.filter((id) => id !== interestId)
        : [...prev.selectedInterests, interestId];
      return { ...prev, selectedInterests: selected };
    });
  };
  
    const navigate = useNavigate(); // Initialize navigation
  
    const [isUploading, setIsUploading] = useState(false);

    const handleProfilePictureChange = async (e) => {
      const file = e.target.files[0]; 
      if (!file) return;
    
      setIsUploading(true); // Start loading
        
      const imageUrl = await uploadToCloudinary(file);
    
      setIsUploading(false); // Stop loading
    
      if (imageUrl) {
        setFormData((prev) => ({ ...prev, profilePicture: imageUrl }));
        setNotification({ show: true, message: "Image uploaded!", type: "success" });
      } else {
        setNotification({ show: true, message: "Image upload failed!", type: "error" });
      }
    };
    




    const [ip, setIp] = useState(null);
    const [coordinates, setCoordinates] = useState(null);
    const [platform, setPlatform] = useState(null);
    useEffect(() => {
      const platformString = navigator.platform;
      setPlatform(platformString);
      console.log("Platform:", platformString);
    }, []);

    useEffect(() => {
      // Fetch the public IP address using the ipify API
      fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
          setIp(data.ip);
          console.log("User IP:", data.ip);
        })
        .catch((error) => console.error("Error fetching IP:", error));
    }, []);
    useEffect(() => {
      // Fetch the location using ip-api
      fetch("http://ip-api.com/json")
        .then((response) => response.json())
        .then((data) => {
          // Extract latitude and longitude from the response
          const { lat, lon } = data;
          setCoordinates({ lat, lon });
          console.log("Location Coordinates:", { lat, lon });
        })
        .catch((error) => console.error("Error fetching location:", error));
    }, []);





















    
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsSignup(true);
    
      if (!formData.profilePicture) {
        setNotification({ show: true, message: "Please upload a profile picture!", type: "error" });
        setStep(3)
        setIsSignup(false);
        return;
      }
    
      try {
        let res;
        if (isGoogleSignup) {
          // For Google signup, we already have email and name
          res = await axios.post(`${api.Url}/auth/register`, {
            ...formData,
            email: googleUserData.email,
            fullName: googleUserData.name,
            profilePicture: googleUserData.picture,
            password: Math.random().toString(36).slice(-8) // Generate random password for Google users
          });
        } else {
          // Regular signup
          res = await axios.post(`${api.Url}/auth/register`, formData);
        }
        
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);

        if (ip && coordinates) {
          await axios.post(`${api.Url}/user/login-details`, { ip, coordinates, platform }, {
            headers: { Authorization: `Bearer ${res.data.token}` },
          });
        }

        setNotification({ show: true, message: "Signup successful!", type: "success" });
    
        navigate("/");
    
      } catch (err) {
        setNotification({ show: true, message: err.response?.data?.message || "Signup failed!", type: "error" });
      }
      
      setIsSignup(false);
    };
    


    const verifyOtp = async () => {
      if (otp.includes("")) {
        setNotification({ show: true, message: "Enter complete OTP!", type: "error" });
        return;
      }
    
      setIsVerifyingOtp(true); // Start loading state
      try {
        const res = await axios.post(`${api.Url}/auth/verify-otp`, {
          email: formData.email,
          otp: otp.join(""),
        });
    
        if (res.data.success) {
          setIsOtpVerified(true);
          setNotification({ show: true, message: "OTP verified!", type: "success" });
        } else {
          setNotification({ show: true, message: "Invalid OTP!", type: "error" });
        }
      } catch (err) {
        if (err.response) {
          setNotification({ show: true, message: err.response.data.message || "Invalid OTP!", type: "error" });
        } else {
          setNotification({ show: true, message: "Server error!", type: "error" });
        }
      }
    
      setIsVerifyingOtp(false); // Stop loading state
    };
    
    const handleGoogleSuccess = async (response) => {
      try {
        const userData = jwtDecode(response.credential);
        
        // Check if user exists
        const checkUser = await axios.post(`${api.Url}/auth/google-login`, { email: userData.email });
        
        if (checkUser.data.user) {
          // User exists - proceed with login
          localStorage.setItem("token", checkUser.data.token);
          localStorage.setItem("user", JSON.stringify(checkUser.data.user));
          setNotification({ show: true, message: "Login successful!", type: "success" });
          navigate('/');
        } else {
          // New user - start Google signup flow
          setIsGoogleSignup(true);
          setGoogleUserData(userData);
          setFormData(prev => ({
            ...prev,
            email: userData.email,
            fullName: userData.name,
            profilePicture: userData.picture
          }));
          setCurrentStep(2); // Start from step 2 since we have email and name
          setNotification({ show: true, message: "Please complete your profile!", type: "info" });
        }
      } catch (error) {
        setNotification({ show: true, message: "Google authentication failed!", type: "error" });
      }
    };

    const handleGoogleFailure = (error) => {
      console.error("Google Signup Failed:", error);
      setNotification({ show: true, message: "Google Signup Failed!", type: "error" });
    };

    const handleGoogleSignupSubmit = async () => {
      if (!validateGoogleSignupData()) {
        return;
      }

      setIsSignup(true);
      try {
        const res = await axios.post(`${api.Url}/auth/register`, {
          ...formData,
          email: googleUserData.email,
          fullName: googleUserData.name,
          profilePicture: googleUserData.picture,
          password: Math.random().toString(36).slice(-8) // Generate random password for Google users
        });

        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("token", res.data.token);

        if (ip && coordinates) {
          await axios.post(`${api.Url}/user/login-details`, { ip, coordinates, platform }, {
            headers: { Authorization: `Bearer ${res.data.token}` },
          });
        }

        setNotification({ show: true, message: "Signup successful!", type: "success" });
        navigate("/");
      } catch (err) {
        setNotification({ show: true, message: err.response?.data?.message || "Signup failed!", type: "error" });
      }
      setIsSignup(false);
    };

    const validateGoogleSignupData = () => {
      if (!formData.phone) {
        setNotification({ show: true, message: "Please enter your phone number!", type: "error" });
        return false;
      }
      if (!formData.gender) {
        setNotification({ show: true, message: "Please select your gender!", type: "error" });
        return false;
      }
      if (!formData.age) {
        setNotification({ show: true, message: "Please enter your age!", type: "error" });
        return false;
      }
      if (formData.selectedInterests.length === 0) {
        setNotification({ show: true, message: "Please select at least one interest!", type: "error" });
        return false;
      }
      if (!formData.termsAccepted) {
        setNotification({ show: true, message: "Please accept the terms and conditions!", type: "error" });
        return false;
      }
      return true;
    };

    const renderGoogleSignupStep = () => {
      switch (currentStep) {
        case 1:
          return (
            <div>
              <h2>Basic Information</h2>
              <div className='inputs-sign'>
                <input type="text" value={formData.fullName} disabled />
                <input type="email" value={formData.email} disabled />
                <div className='phone-input-container'>
                  <PhoneInput
                    international
                    defaultCountry="IN"
                    placeholder="Enter phone number"
                    value={formData.phone}
                    onChange={(value) => {
                      setFormData({ ...formData, phone: value });
                      // Clear any previous phone validation error
                      if (notification.message.includes("phone")) {
                        setNotification({ show: false, message: "", type: "" });
                      }
                    }}
                    error={formData.phone ? undefined : "Phone number is required"}
                  />
                  {!formData.phone && (
                    <span className="error-message">Please enter your phone number</span>
                  )}
                </div>
              </div>
              <div className='sign-up-page-cons2'>
                <button 
                  onClick={() => {
                    if (!formData.phone) {
                      setNotification({ 
                        show: true, 
                        message: "Please enter your phone number!", 
                        type: "error" 
                      });
                      return;
                    }
                    setCurrentStep(2);
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          );

        case 2:
          return (
            <div>
              <h2>Personal Information</h2>
              <div className='inputs-sign'>
                <input
                  type='number'
                  name='age'
                  placeholder='Age'
                  value={formData.age}
                  onChange={handleChange}
                />
                <select name='gender' value={formData.gender} onChange={handleChange}>
                  <option value=''>Select Gender</option>
                  <option value='male'>Male</option>
                  <option value='female'>Female</option>
                  <option value='other'>Other</option>
                </select>
              </div>
              <div className='sign-up-page-cons2'>
                <button onClick={() => setCurrentStep(1)}>Back</button>
                <button onClick={() => setCurrentStep(3)}>Next</button>
              </div>
            </div>
          );

        case 3:
          return (
            <div>
              <h2>Interests & Preferences</h2>
              <div className='inputs-sign'>
                <h4 className='sign-fdwf4'>Interests: <p>You can choose several options</p></h4>
                <div className='singip-instrwe'>
                  <div className='emojis-dign'>
                    {options.interests.map(({ id, label, img }) => (
                      <div
                        key={id}
                        className={`crete-3-box3s ${formData.selectedInterests.includes(id) ? 'selected-creat' : ''}`}
                        onClick={() => handleInterestSelect(id)}
                      >
                        <img src={img} alt={label} />
                        <h3>{label}</h3>
                      </div>
                    ))}
                  </div>
                </div>
                <label>
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    onChange={handleChange}
                    required
                  /> Agree to Terms & Conditions
                </label>
                <label>
                  <input
                    type="checkbox"
                    name="subscribeNews"
                    onChange={handleChange}
                  /> Subscribe to News & Updates
                </label>
              </div>
              <div className='sign-up-page-cons2'>
                <button onClick={() => setCurrentStep(2)}>Back</button>
                <button onClick={handleGoogleSignupSubmit}>
                  {isSignup ? <span className="loader-signin"></span> : "Complete Signup"}
                </button>
              </div>
            </div>
          );

        default:
          return null;
      }
    };

  return (
    <div className='signup-container'>
      <PopNoti
  message={notification.message}
  type={notification.type}
  isVisible={notification.show}
  onClose={() => setNotification({ ...notification, show: false })}
/>
      <div className='signup-left'>
        <div className='signup-sidebar'>

          <span className='sideup-top-sanp'>
          <img src='/heartechor.png' alt='HeartEcho'></img>
                   <h2>HeartEcho</h2>
          </span>

          <div className='steps-singe'>

  {[1, 2, 3, 4,5].map((num) => (
    <div className={`step ${step === num ? 'current' : step > num ? 'completed' : ''}`} key={num}>
      {step > num ? (
        <span className='circle-signa3'>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
          </svg>
        </span>
      ) : step === num ? (
        <span className='circle-signa3'><span className='circle-currnet-si'></span></span>
      ) : (
        <span className='circle-signa3-unto'></span>
      )}

      <div className='step-text'>
        <h3>{num === 1 ? "Your details" : num === 2 ? "Choose a password" : num === 3 ? "Personalization & Preferences" : num === 4 ? "Additional Information" : "You're All Set!"}</h3>
        <p>{num === 1 ? "Please provide your name and email" : num === 2 ? "Choose a secure password" : num === 3 ? "Upload your profile picture and complete your personal details." : num === 4 ? "Select your interests and enter a referral code (if applicable)." : "Congratulations! Your account is ready to use."}</p>
      </div>
    </div>
  ))}
</div>




          <p className='signup-footerse'>© {new Date().getFullYear()} HeartEcho AI <br /> omawcharbusiness123@gmail.com</p>
        </div>
      </div>
      <div className='signup-right'>
           

        <div className='signup-box'>
          {isGoogleSignup ? (
            renderGoogleSignupStep()
          ) : (
            <>
              {step === 1 && (
                <div>
                  <h2>Basic Information</h2>

                  <div className='inputs-sign'>
                  <input type="text" name="fullName" placeholder="Full Name" onChange={handleChange} />

              <div className='email-opt-sen-signpa'>
              <input
        type="email"
        name="email"
        value={formData.email}
        onChange={handleChange}
        disabled={isOtpVerified} // ✅ Disable if verified
      />
      <button 
        className="otp-btn-singr" 
        onClick={sendOtp} 
        disabled={isSendingOtp || otpSent}
      >
        {isSendingOtp ? <span className="loader-signin"></span> : "Send"}
      </button>
              </div>

              {otpSent && (
                <>
      {!isOtpVerified && (
        <button className='sitmer-se3' onClick={sendOtp} disabled={otpSent && timer > 0}>
          {otpSent && timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
        </button>
      )}
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      className="otp-input"
                      value={digit}
                      onChange={(e) => handleChangeOtp(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                    />
                  ))}
                </div>
                <button 
          className="otp-btn-singr" 
          onClick={verifyOtp} 
          disabled={isVerifyingOtp}
        >
          {isVerifyingOtp ? <span className="loader-signin"></span> : "Verify OTP"}
        </button>                </>
              )}



              <PhoneInput
                 defaultCountry="IN"
                 placeholder="Enter phone number"
                 value={formData.phone}
                 onChange={(value) => setFormData({ ...formData, phone: value })}
               />
              </div>
              <div className='sign-up-page-cons2'>
              <button onClick={nextStep}>Next</button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <h2>Security & Authentication</h2>

              <div className='inputs-sign'>

              <div className='password-input'>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="Password"
          onChange={handleChange}
        />
        <span className='eye-icon' onClick={() => setShowPassword(!showPassword)}>
          {showPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

      <div className='password-input'>
        <input
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder="Confirm Password"
          onChange={handleChange}
        />
        <span className='eye-icon' onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
        </span>
      </div>

              <label>
                <input type="checkbox" name="twoFA" onChange={handleChange} /> Enable 2FA
              </label>

              </div>

      <div className='sign-up-page-cons2'>
              <button onClick={prevStep}>Back</button>
              <button onClick={nextStep}>Next</button>
              </div>

            </div>
          )}

  {step === 3 && (
    <div>
      <h2>Personalization & Preferences</h2>

      <div className='inputs-sign'>
      <div className="upload-container">
    {isUploading ? (
      <div className="loader-signin"></div>
    ) : (
      formData.profilePicture ? (
        <img src={formData.profilePicture} alt="Profile" />
      ) : (
        <p>Upload Image</p>
      )
    )}
    <input type="file" onChange={handleProfilePictureChange} style={{ position: "absolute", opacity: 0, width: "100%", height: "100%" }} />
  </div>


    
    <input
        type='number'
        name='age'
        placeholder='Age'
        value={formData.age}
        onChange={handleChange}
      />

    <label>Select Gender</label>
    <select name='gender' value={formData.gender} onChange={handleChange}>
        <option value=''>Select Gender</option>
        <option value='male'>Male</option>
        <option value='female'>Female</option>
        <option value='other'>Other</option>
      </select>

  </div>
  <div className='sign-up-page-cons2'>
  <button onClick={prevStep}>Back</button>
  <button onClick={nextStep}>Next</button>
  </div>
</div>
)}

          {step === 4 && (
            <div>
              <h2>Additional Information</h2>
              <div className='inputs-sign'>

  <h4 className='sign-fdwf4'>Interests : <p>You can choose several options</p> </h4>
     <div className='singip-instrwe'>
              <div className='emojis-dign'>
              {options.interests.map(({ id, label, img }) => (
        <div key={id} className={`crete-3-box3s ${formData.selectedInterests.includes(id) ? 'selected-creat' : ''}`} onClick={() => handleInterestSelect(id)}>
            <img src={img} alt={label} />
            <h3>{label}</h3>
        </div>
      ))}
                               </div>
  </div>
              <input type="text" name="referralCode" placeholder="Referral Code" onChange={handleChange} />
              <label>
                <input type="checkbox" name="termsAccepted" onChange={handleChange} required /> Agree to Terms & Conditions
              </label>
              <label>
                <input type="checkbox" name="subscribeNews" onChange={handleChange} /> Subscribe to News & Updates
              </label>
              </div>  
              <div className='sign-up-page-cons2'>
              <button 
        className="otp-btn-singr" 
        onClick={handleSubmit} 
      >
        {isSignup ? <span className="loader-signin"></span> : "Signup"}
      </button>


              </div>
            </div>
          )}
          </>
        )}
        </div>
  <div className='last-sinin-con'>
    <div className='last-hearder-sini'>
      <span className='last-ssx-con-line'></span>
      <h3>Or Signup with</h3>
      <span className='last-ssx-con-line'></span>
    </div>
    
  <div className='authO2-container3d'>
    <GoogleLogin
      onSuccess={handleGoogleSuccess}
      onError={handleGoogleFailure}
      theme="filled_black"
      size="large"
    />
  </div>

  <h2 className='have-h2dx'>Do you have an account? <Link to='/login' style={{textDecoration:'none'}}> <span>Login Now</span></Link> </h2>
  </div>
        </div>     
      </div>
    );
  }

export default Signup;
