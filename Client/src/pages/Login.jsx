'use client';

import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import '../styles/Signup.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import Link from 'next/link';
import PopNoti from '../components/PopNoti';
import api from '../config/api';
import axios from 'axios';
import Cookies from 'js-cookie';

function Login() {
  const router = useRouter();
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [ip, setIp] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [platform, setPlatform] = useState(typeof window !== 'undefined' ? navigator.platform : '');
  const [locationUser, setLocationUser] = useState(null);
  const [isClient, setIsClient] = useState(false);

  const googleClientId = "273920667679-85i343d6q2eibbc7e597ougsflo7u6c0.apps.googleusercontent.com";

  // Function to get redirect URL from cookies, localStorage, or URL params
  const getRedirectUrl = () => {
    if (typeof window === 'undefined') return '/';
    
    // First check cookies (for Next.js middleware redirects)
    const cookies = document.cookie.split(';');
    const redirectCookie = cookies.find(cookie => cookie.trim().startsWith('redirectUrl='));
    
    if (redirectCookie) {
      const encodedUrl = redirectCookie.split('=')[1];
      // Clear the cookie
      document.cookie = 'redirectUrl=; max-age=0; path=/';
      try {
        return decodeURIComponent(encodedUrl);
      } catch (error) {
        console.error('Error decoding redirect URL:', error);
        return '/';
      }
    }
    
    // Then check localStorage (for React Router redirects) - this is set by RedirectHandler
    const storedUrl = localStorage.getItem('redirectAfterLogin');
    if (storedUrl) {
      localStorage.removeItem('redirectAfterLogin');
      try {
        // If it's a full URL with protocol, extract just the path
        if (storedUrl.includes('http')) {
          const urlObj = new URL(storedUrl);
          return urlObj.pathname + urlObj.search;
        }
        return storedUrl;
      } catch (error) {
        console.error('Error parsing stored URL:', error);
        return '/';
      }
    }
    
    // Then check URL params directly from window
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const fromParam = urlParams.get('from') || urlParams.get('redirect');
      if (fromParam) {
        try {
          return decodeURIComponent(fromParam);
        } catch (error) {
          console.error('Error decoding from/redirect parameter:', error);
          return '/';
        }
      }
    }
    
    return '/'; // Default to home page
  };

  useEffect(() => {
    setIsClient(true);

    // Fetch IP and location data
    if (typeof window !== 'undefined') {
      fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => {
          setIp(data.ip);
          // Use the IP to get detailed location
          return fetch(`https://ip-api.com/json/${data.ip}`);
        })
        .then((response) => response.json())
        .then((data) => {
          setCoordinates({ lat: data.lat, lon: data.lon });
          setLocationUser(data.regionName || data.city);
        })
        .catch((error) => console.error("Error fetching IP/Location:", error));
    }
  }, []); // Removed searchParams dependency

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!formData.email.includes("@")) {
      setNotification({ show: true, message: "Enter a valid email!", type: "error" });
      return;
    }
    if (formData.password.length < 8) {
      setNotification({ show: true, message: "Password must be at least 8 characters!", type: "error" });
      return;
    }
  
    setIsLogin(true);
    try {
      const res = await axios.post(`${api.Url}/auth/login`, formData);
      const { token, user } = res.data;
  
      Cookies.set("token", token, { expires: 7 });
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      if (ip && coordinates) {
        await axios.post(`${api.Url}/user/login-details`, { ip, coordinates, platform, locationUser }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      setNotification({ show: true, message: "Login successful!", type: "success" });
      
      // --- TRACK LOGIN ---
      if (typeof window !== "undefined") {
        if (user?.email !== 'omawchar07@gmail.com') {
          if (window.fbq) window.fbq('track', 'Login');
          if (window.trackAppEvent) window.trackAppEvent('login_success');
        }
      }
      
      // Redirect to original URL (with query params) or home
      const redirectUrl = getRedirectUrl();
      window.location.href = redirectUrl;
      return;
    } catch (error) {
      setNotification({ show: true, message: error.response?.data?.msg || "Login failed", type: "error" });
      setIsLogin(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setIsLogin(true);
    const userData = jwtDecode(response.credential);
  
    try {
      const res = await axios.post(`${api.Url}/auth/google-login`, { email: userData.email });
  
      if (res.data.token) {
        Cookies.set("token", res.data.token, { expires: 7 });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));

        if (ip && coordinates) {
          await axios.post(`${api.Url}/user/login-details`, { ip, coordinates, platform, locationUser }, {
            headers: { Authorization: `Bearer ${res.data.token}` },
          });
        }
  
        setNotification({ show: true, message: "Google Login Successful!", type: "success" });
        
        // --- TRACK LOGIN ---
        if (typeof window !== "undefined") {
          if (res.data.user?.email !== 'omawchar07@gmail.com') {
            if (window.fbq) window.fbq('track', 'Login');
            if (window.trackAppEvent) window.trackAppEvent('login_success');
          }
        }
        
        // Redirect to original URL (with query params) or home
        const redirectUrl = getRedirectUrl();
        window.location.href = redirectUrl;
        return;
      }

      if (res.data.user === null && res.data.message === "New user, please complete registration") {
        setNotification({ show: true, message: res.data.message, type: "info" });
        const redirectUrl = getRedirectUrl();
        router.push(`/signup?from=${encodeURIComponent(redirectUrl)}`);
        return;
      }
    } catch (error) {
      setNotification({ show: true, message: "Google Login Failed!", type: "error" });
      setIsLogin(false);
    }
  };

  const handleGoogleFailure = (error) => {
    console.error("Google Login Failed:", error);
    setNotification({ show: true, message: "Google Login Failed!", type: "error" });
  };

  // Don't render anything until client-side to avoid hydration issues
  if (!isClient) {
    return (
      <div className="signup-container">
        <div className="signup-left skeleton-left">
          <div className="signup-sidebar">
            <span className="sideup-top-sanp">
              <div className="skeleton-logo"></div>
              <div className="skeleton-text short" style={{ marginLeft: "10px", height: "24px", width: "120px" }}></div>
            </span>
            <div className="steps-singe">
              {[1, 2, 3].map((num) => (
                <div className="step" key={num}>
                  <div className="skeleton-circle"></div>
                  <div className="step-text" style={{ width: "100%" }}>
                    <div className="skeleton-text short"></div>
                    <div className="skeleton-text long"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="signup-right">
          <div className="signup-box" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="skeleton-title" style={{ height: "32px", width: "40%", marginBottom: "20px" }}></div>
            <div className="skeleton-input" style={{ height: "50px" }}></div>
            <div className="skeleton-text short" style={{ alignSelf: "center", margin: "15px 0", height: "1px", width: "100%" }}></div>
            <div className="skeleton-input" style={{ height: "45px" }}></div>
            <div className="skeleton-input" style={{ height: "45px" }}></div>
            <div className="skeleton-button" style={{ height: "45px", marginTop: "10px" }}></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="signup-container">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <div className="signup-left">
        <div className="signup-sidebar">
          <span className="sideup-top-sanp">
            <img src="/heartechor.png" alt="HeartEcho" />
            <h2>HeartEcho</h2>
          </span>

          <div className="steps-singe">
            <div className="step completed">
              <span className="circle-signa3">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.9997 15.1709L19.1921 5.97852L20.6063 7.39273L9.9997 17.9993L3.63574 11.6354L5.04996 10.2212L9.9997 15.1709Z"></path>
                </svg>
              </span>
              <div className="step-text">
                <h3>Welcome Back</h3>
                <p>Sign in to access your account and continue your journey</p>
              </div>
            </div>
          </div>

          <p className="signup-footerse">
            © {new Date().getFullYear()} HeartEcho AI <br /> heartecho.help@gmail.com
          </p>
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-box">
          <h2>Welcome Back</h2>
          
          <div className="authO2-container3d" style={{ marginBottom: "20px", display: "flex", justifyContent: "center", width: "100%", padding: "5px" }}>
            <GoogleOAuthProvider clientId={googleClientId}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                theme="filled_black"
                size="large"
                shape="rectangular"
                width="100%"
                text="continue_with"
              />
            </GoogleOAuthProvider>
          </div>

          <div className="last-hearder-sini" style={{ marginBottom: "20px" }}>
            <span className="last-ssx-con-line"></span>
            <h3>Or login with email</h3>
            <span className="last-ssx-con-line"></span>
          </div>

          <form className="inputs-sign" onSubmit={handleSubmit}>
            <div className="password-input">
              <input
                type="email"
                name="email"
                placeholder="Email"
                onChange={handleChange}
                required
              />
            </div>

            <div className="password-input">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="sign-up-page-cons2">
              <button type="submit" className="otp-btn-singr" disabled={isLogin}>
                {isLogin ? <span className="loader-signin"></span> : "Login"}
              </button>
            </div>
          </form>

          <div className="last-sinin-con" style={{ marginTop: "20px" }}>
            <h2 className="have-h2dx">
              Don't have an account?{" "}
              <Link href="/signup" style={{ textDecoration: "none" }}>
                <span>Register Now</span>
              </Link>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;