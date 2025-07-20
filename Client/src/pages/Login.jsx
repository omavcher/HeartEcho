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

  // Replace with your actual Google Client ID
  const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "your-google-client-id";

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

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

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
        localStorage.setItem("token", res.data.token);

        if (ip && coordinates) {
          await axios.post(`${api.Url}/user/login-details`, { ip, coordinates, platform, locationUser }, {
            headers: { Authorization: `Bearer ${res.data.token}` },
          });
        }

        setNotification({ show: true, message: "Google Login Successful!", type: "success" });
        setTimeout(() => router.push('/'), 1500);
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
    <div className="signup-container" style={{ alignItems: 'start' }}>
      <PopNoti
        message={notification.message}
        type={notification.type}
        isVisible={notification.show}
        onClose={() => setNotification({ ...notification, show: false })}
      />

      <div className="signup-left" style={{ padding: "0", overflow: 'visible', backgroundColor: 'black' }}>
        <video src="/videos/bg2.mp4" muted autoPlay loop playsInline></video>
        <span className='sideup-top-sanp' style={{ position: 'absolute', top: '10%' }}>
          <img src='/heartechor.png' alt='HeartEcho' style={{ width: '4rem' }} />
          <h2>HeartEcho</h2>
        </span>
        <p className='signup-footerse' style={{ position: 'absolute', bottom: '20%', textAlign: 'start' }}>
          © {new Date().getFullYear()} HeartEcho AI <br /> omawcharbusiness123@gmail.com
        </p>
      </div>

      <div className="signup-right" style={{ padding: '0.9rem' }}>
        <div className='signup-box'>
          <h2>Login</h2>
          <form className='inputs-sign' style={{ marginTop: '0' }} onSubmit={handleSubmit}>
            <div className='password-input'>
              <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
            </div>

            <div className='password-input' style={{ marginTop: '0', marginBottom: '0.5rem', gap: '0.5rem' }}>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="Password"
                onChange={handleChange}
                required
              />
              <span className='eye-icon' onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <button type="submit" className="otp-btn-singr" disabled={isLogin}>
              {isLogin ? <span className="loader"></span> : "Login"}
            </button>
          </form>

          <div className='last-sinin-con'>
            <div className='last-hearder-sini'>
              <span className='last-ssx-con-line'></span>
              <h3 style={{ fontSize: '0.7rem', marginTop: '1rem' }}>Or Login with</h3>
              <span className='last-ssx-con-line'></span>
            </div>

            <div className='authO2-container3d'>
              <GoogleOAuthProvider clientId={googleClientId}>
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  theme="filled_black"
                  size="large"
                />
              </GoogleOAuthProvider>
            </div>

            <h2 className='have-h2dx'>
              Don't have an account? <Link href='/signup' style={{ textDecoration: 'none' }}> <span>Register Now</span></Link>
            </h2>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;