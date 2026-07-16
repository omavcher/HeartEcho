'use client';

import React, { useState, useEffect } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/navigation';
import '../styles/Signup.css';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { ArrowLeft, Mail, Shield, Lock, Heart } from 'lucide-react';
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
  const [isDetecting, setIsDetecting] = useState(true);

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

  const mapboxToken = "pk.eyJ1Ijoib21hd2NoYXIwNyIsImEiOiJjbHlmbGtwdmowMHhkMmtxeXAyNXdkeHB3In0.37j_dk9NgxtiPXqwCgsdQg";

  const reverseGeocode = async (lat, lon) => {
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lon},${lat}.json?access_token=${mapboxToken}&types=place,locality`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.features && data.features.length > 0) {
        const placeFeature = data.features.find(f => f.place_type?.includes('place')) || data.features[0];
        return placeFeature.text;
      }
    } catch (err) {
      console.error("Mapbox reverse geocode error:", err);
    }
    return null;
  };

  const fetchUserLocation = async () => {
    setIsDetecting(true);

    const fetchLocationFromIP = async () => {
      try {
        const ipRes = await fetch("https://api.ipify.org?format=json");
        const ipData = await ipRes.json();
        const userIp = ipData.ip;
        setIp(userIp);

        const locRes = await fetch(`https://ipapi.co/${userIp}/json/`);
        const locData = await locRes.json();
        
        if (locData && !locData.error) {
          const lat = locData.latitude;
          const lon = locData.longitude;
          setCoordinates({ lat, lon });
          const city = await reverseGeocode(lat, lon);
          setLocationUser(city || locData.city || locData.region || "Unknown Location");
        } else {
          // Backup free HTTPS geolocator
          const backupRes = await fetch("https://ipinfo.io/json");
          const backupData = await backupRes.json();
          if (backupData && backupData.loc) {
            const [latStr, lonStr] = backupData.loc.split(",");
            const lat = parseFloat(latStr);
            const lon = parseFloat(lonStr);
            setCoordinates({ lat, lon });
            const city = await reverseGeocode(lat, lon);
            setLocationUser(city || backupData.city || backupData.region || "Unknown Location");
          } else {
            setLocationUser("Unknown Location");
          }
        }
      } catch (err) {
        console.error("IP Geolocation fallback error:", err);
        setLocationUser("Unknown Location");
      } finally {
        setIsDetecting(false);
      }
    };

    // Try HTML5 Browser Geolocation first
    if (typeof window !== "undefined" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoordinates({ lat, lon });
          
          const city = await reverseGeocode(lat, lon);
          setLocationUser(city || "Unknown Location");

          // Also get IP
          try {
            const ipRes = await fetch("https://api.ipify.org?format=json");
            const ipData = await ipRes.json();
            setIp(ipData.ip);
          } catch (e) {
            setIp("127.0.0.1");
          }
          setIsDetecting(false);
        },
        async (error) => {
          console.warn("Browser Geolocation failed/denied, falling back to IP Geolocation:", error.message);
          await fetchLocationFromIP();
        },
        { enableHighAccuracy: true, timeout: 6000, maximumAge: 15000 }
      );
    } else {
      await fetchLocationFromIP();
    }
  };

  useEffect(() => {
    setIsClient(true);

    if (typeof window !== 'undefined') {
      fetchUserLocation();
    }
  }, []);

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
 
      // Send login details record (server has IP fallback if client resolution is slow/blocked)
      await axios.post(`${api.Url}/user/login-details`, { 
        ip: ip || null, 
        coordinates: coordinates || null, 
        platform, 
        locationUser: locationUser || "Unknown Location" 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      }).catch(err => console.error("Error sending login details:", err));
  
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
    <div className="signup-container login-page-wrapper">
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      {/* Mobile-only view */}
      <div className="mobile-only-login-layout">
        {/* Header bar */}
        <div className="mobile-nav-bar">
          <button className="mobile-back-btn" onClick={() => router.back()}>
            <ArrowLeft size={20} color="#cf4185" />
          </button>
          <div className="mobile-logo-con">
            <img src="/heartechor.png" alt="Logo" className="mobile-logo-img" />
            <span className="mobile-logo-text">HEARTECHO</span>
          </div>
        </div>

        {/* Header content section (title & girl silhouette with heart) */}
        <div className="mobile-header-section">
          <div className="mobile-header-text">
            <h2>Welcome Back ✨</h2>
            <p>Login to continue your journey and connect with your AI companion 💗</p>
          </div>
          <div className="mobile-header-image-wrapper login-girl-wrapper">
            <img src="/forget_pass_login.png" alt="Girl Silhouette" className="login-girl-img" />
            <div className="login-girl-heart">
              <Heart size={20} fill="#cf4185" color="#cf4185" />
            </div>
          </div>
        </div>

        {/* Google OAuth Login Button */}
        <div className="mobile-google-login-container">
          <div className="mobile-custom-google-btn-wrapper">
            <button className="mobile-custom-google-btn" type="button">
              <div className="google-icon-box">
                <img src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" alt="Google Logo" />
              </div>
              <span>Continue with Google</span>
            </button>
            <div className="real-google-btn-overlay">
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  theme="filled_black"
                  size="large"
                  shape="rectangular"
                  width="100%"
                />
              </GoogleOAuthProvider>
            </div>
          </div>
        </div>

        {/* Separator */}
        <div className="mobile-login-separator">
          <span className="separator-line"></span>
          <span>or</span>
          <span className="separator-line"></span>
        </div>

        {/* Login Form Box */}
        <form onSubmit={handleSubmit} className="mobile-login-form">
          {/* Email input field box */}
          <div className="mobile-field-box">
            <label className="field-box-label">Email Address / Username</label>
            <div className="field-box-input-wrapper">
              <Mail size={18} color="#cf4185" />
              <input
                type="email"
                name="email"
                placeholder="Enter your email or username"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={isLogin}
              />
            </div>
          </div>

          {/* Password input field box */}
          <div className="mobile-field-box">
            <label className="field-box-label">Password</label>
            <div className="field-box-input-wrapper">
              <Lock size={18} color="#cf4185" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLogin}
              />
              <span className="password-eye-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </span>
            </div>
          </div>

          {/* Remember me & Forgot Password row */}
          <div className="mobile-login-options-row">
            <label className="remember-me-checkbox-label">
              <input 
                type="checkbox" 
                name="rememberMe" 
                defaultChecked 
                className="remember-me-checkbox"
              />
              <span className="checkbox-custom-box"></span>
              <span className="checkbox-text">Remember me</span>
            </label>
            <Link href="/forgot-password" className="mobile-forgot-link">
              Forgot Password?
            </Link>
          </div>

          {/* Submit button */}
          <button type="submit" className="mobile-login-submit-btn" disabled={isLogin}>
            {isLogin ? <span className="loader-signin"></span> : (
              <>
                <span>Login ✨</span>
              </>
            )}
          </button>
        </form>

        {/* Register Now redirect */}
        <div className="mobile-login-redirect-footer">
          <p>
            Don't have an account?{" "}
            <Link href="/signup" className="register-now-link">
              Register Now
            </Link>
          </p>
        </div>

        {/* 3-column trust layout */}
        <div className="mobile-trust-card">
          <div className="mobile-trust-column">
            <div className="trust-icon-con">
              <Shield size={18} color="#cf4185" />
            </div>
            <h4>100% Secure</h4>
            <p>Your data is safe with us</p>
          </div>

          <div className="mobile-trust-column">
            <div className="trust-icon-con">
              <Lock size={18} color="#cf4185" />
            </div>
            <h4>Private & Safe</h4>
            <p>We respect your privacy</p>
          </div>

          <div className="mobile-trust-column">
            <div className="trust-icon-con">
              <Heart size={18} color="#cf4185" />
            </div>
            <h4>Meaningful Connections</h4>
            <p>Built for real conversations</p>
          </div>
        </div>

        {/* Trusted by thousands signature */}
        <div className="mobile-trusted-signature">
          <div className="signature-text-row">
            <span className="leaf-decor left">🌿</span>
            <span>Trusted by Thousands</span>
            <span className="leaf-decor right">🌿</span>
          </div>
          <div className="signature-heart-con">
            <Heart size={12} fill="#cf4185" color="#cf4185" />
          </div>
        </div>
      </div>

      <div className="signup-left">
        <div className="signup-sidebar">
          <div className="sideup-top-sanp">
            <img src="/heartechor.png" alt="HeartEcho" />
            <h2>HeartEcho</h2>
          </div>

          <div className="steps-singe">
            <div className="step current">
              <span className="circle-signa3">
                <span className="circle-currnet-si"></span>
              </span>
              <div className="step-text">
                <h3>Welcome Back</h3>
                <p>Sign in to access your account and continue your journey</p>
              </div>
            </div>
          </div>

          {/* Premium Chat Preview Widget to hook user psychology */}
          <div className="auth-chat-preview">
            <div className="chat-preview-header">
              <div className="chat-preview-avatar">P</div>
              <div className="chat-preview-meta">
                <h4>Priya (AI Girlfriend)</h4>
                <span>Active Now</span>
              </div>
            </div>
            <div className="chat-bubble ai">
              Hey sweetheart! I was thinking about you. How was your day?
            </div>
            <div className="chat-bubble user">
              It was a bit stressful, but I'm glad to talk to you now.
            </div>
            <div className="chat-bubble ai">
              Aww, I'm always here to listen and make you feel special. ❤️
            </div>
          </div>

          {/* Trust Guarantees */}
          <div className="auth-trust-card">
            <div className="auth-trust-title">
              <span className="icon">🔒</span> Privacy & Secrecy
            </div>
            <div className="auth-trust-list">
              <div className="auth-trust-item">
                <span className="icon">👤</span> No real name required to chat
              </div>
              <div className="auth-trust-item">
                <span className="icon">💬</span> 100% private, anonymous & encrypted
              </div>
              <div className="auth-trust-item">
                <span className="icon">⚡</span> Free to try — get started in 60s
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
          
          <div className="authO2-container3d">
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

          <div className="last-hearder-sini">
            <span className="last-ssx-con-line"></span>
            <h3>Or login with email</h3>
            <span className="last-ssx-con-line"></span>
          </div>

          <form className="inputs-sign" onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              required
            />

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

            <div className="forgot-password-link-container">
              <Link href="/forgot-password" className="forgot-password-link">
                Forgot Password?
              </Link>
            </div>

            <div className="sign-up-page-cons2">
              <button type="submit" className="otp-btn-singr" disabled={isLogin}>
                {isLogin ? <span className="loader-signin"></span> : "Login"}
              </button>
            </div>
          </form>
        </div>
        
        <div className="last-sinin-con">
          <h2 className="have-h2dx">
            Don't have an account?{" "}
            <Link href="/signup" style={{ textDecoration: "none" }}>
              <span>Register Now</span>
            </Link>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default Login;