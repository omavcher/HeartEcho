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

  const googleClientId = "273920667679-85i343d6q2eibbc7e597ougsflo7u6c0.apps.googleusercontent.com";

  useEffect(() => {
    if (typeof window !== 'undefined') {
      fetch("https://api.ipify.org?format=json")
        .then((response) => response.json())
        .then((data) => setIp(data.ip))
        .catch((error) => console.error("Error fetching IP:", error));

      fetch("http://ip-api.com/json")
        .then((response) => response.json())
        .then((data) => {
          setCoordinates({ lat: data.lat, lon: data.lon });
          setLocationUser(data.regionName);
        })
        .catch((error) => console.error("Error fetching location:", error));
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

      if (ip && coordinates) {
        await axios.post(`${api.Url}/user/login-details`, { ip, coordinates, platform, locationUser }, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
  
      setNotification({ show: true, message: "Login successful!", type: "success" });
      setTimeout(() => router.push('/'), 1500);
    } catch (error) {
      setNotification({ show: true, message: error.response?.data?.msg || "Login failed", type: "error" });
    }
    setIsLogin(false);
  };

  const handleGoogleSuccess = async (response) => {
    setIsLogin(true);
    const userData = jwtDecode(response.credential);
  
    try {
      const res = await axios.post(`${api.Url}/auth/google-login`, { email: userData.email });
  
      if (res.data.token) {
        Cookies.set("token", res.data.token, { expires: 7 });
        localStorage.setItem("token", res.data.token);

        if (ip && coordinates) {
          await axios.post(`${api.Url}/user/login-details`, { ip, coordinates, platform, locationUser }, {
            headers: { Authorization: `Bearer ${res.data.token}` },
          });
        }
  
        setNotification({ show: true, message: "Google Login Successful!", type: "success" });
        setTimeout(() => router.push('/'), 1500);
      }

      if (res.data.user === null && res.data.message === "New user, please complete registration") {
        setNotification({ show: true, message: res.data.message, type: "info" });
        setTimeout(() => router.push('/signup'), 1000);
      }
      else {
        setNotification({ show: true, message: "Login Failed", type: "error" });
        setTimeout(() => router.push('/login'), 1000);
      }
    } catch (error) {
      setNotification({ show: true, message: error.response?.data?.message || "Login Failed", type: "error" });
    }
    setIsLogin(false);
  };

  const handleGoogleFailure = (error) => {
    console.error("Google Login Failed:", error);
    setNotification({ show: true, message: "Google Login Failed!", type: "error" });
  };

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
            © {new Date().getFullYear()} HeartEcho AI <br /> omawcharbusiness123@gmail.com
          </p>
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-box">
          <h2>Login</h2>
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

          <div className="last-sinin-con">
            <div className="last-hearder-sini">
              <span className="last-ssx-con-line"></span>
              <h3>Or Login with</h3>
              <span className="last-ssx-con-line"></span>
            </div>

            <div className="authO2-container3d">
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  theme="filled_black"
                  size="large"
                />
              </GoogleOAuthProvider>
            </div>

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