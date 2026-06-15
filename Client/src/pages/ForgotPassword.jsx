'use client';

import React, { useState, useEffect, useRef } from 'react';
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

function ForgotPassword() {
  const router = useRouter();
  const [notification, setNotification] = useState({ show: false, message: "", type: "" });
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [isGoogleAccount, setIsGoogleAccount] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timer, setTimer] = useState(0);
  const [resetToken, setResetToken] = useState("");
  
  const [passwords, setPasswords] = useState({ newPassword: "", confirmPassword: "" });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const inputRefs = useRef([]);

  const googleClientId = "273920667679-85i343d6q2eibbc7e597ougsflo7u6c0.apps.googleusercontent.com";

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Timer countdown logic
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      setNotification({ show: true, message: "Enter a valid email!", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${api.Url}/auth/forgot-password/send-otp`, { email });
      if (res.data.success) {
        setStep(2);
        setTimer(60);
        setNotification({ show: true, message: "OTP sent to your email!", type: "success" });
      }
    } catch (error) {
      if (error.response?.data?.isGoogle) {
        setIsGoogleAccount(true);
        setNotification({ show: true, message: error.response.data.message, type: "info" });
      } else {
        setNotification({ show: true, message: error.response?.data?.message || "Something went wrong", type: "error" });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setIsLoading(true);
    try {
      const res = await axios.post(`${api.Url}/auth/forgot-password/send-otp`, { email });
      if (res.data.success) {
        setTimer(60);
        setOtp(["", "", "", "", "", ""]);
        if (inputRefs.current[0]) inputRefs.current[0].focus();
        setNotification({ show: true, message: "OTP resent successfully!", type: "success" });
      }
    } catch (error) {
      setNotification({ show: true, message: error.response?.data?.message || "Failed to resend OTP", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangeOtp = (index, e) => {
    const value = e.target.value;
    if (!/^\d?$/.test(value)) return;

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

  const handleOtpVerify = async (e) => {
    e.preventDefault();
    if (otp.includes("")) {
      setNotification({ show: true, message: "Please enter complete OTP!", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${api.Url}/auth/forgot-password/verify-otp`, {
        email,
        otp: otp.join("")
      });
      if (res.data.success) {
        setResetToken(res.data.resetToken);
        setStep(3);
        setNotification({ show: true, message: "OTP verified successfully!", type: "success" });
      }
    } catch (error) {
      setNotification({ show: true, message: error.response?.data?.message || "Invalid OTP", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    if (passwords.newPassword.length < 8) {
      setNotification({ show: true, message: "Password must be at least 8 characters long!", type: "error" });
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setNotification({ show: true, message: "Passwords do not match!", type: "error" });
      return;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(`${api.Url}/auth/forgot-password/reset`, {
        resetToken,
        newPassword: passwords.newPassword
      });
      if (res.data.success) {
        setNotification({ show: true, message: "Password reset successful!", type: "success" });
        setTimeout(() => {
          router.push('/login');
        }, 1500);
      }
    } catch (error) {
      setNotification({ show: true, message: error.response?.data?.message || "Failed to reset password", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (response) => {
    setIsLoading(true);
    const userData = jwtDecode(response.credential);
  
    try {
      const res = await axios.post(`${api.Url}/auth/google-login`, { email: userData.email });
  
      if (res.data.token) {
        Cookies.set("token", res.data.token, { expires: 7 });
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
  
        setNotification({ show: true, message: "Google Login Successful!", type: "success" });
        
        // Track login
        if (typeof window !== "undefined") {
          if (res.data.user?.email !== 'omawchar07@gmail.com') {
            if (window.fbq) window.fbq('track', 'Login');
            if (window.trackAppEvent) window.trackAppEvent('login_success');
          }
        }
        
        window.location.href = '/';
        return;
      }
    } catch (error) {
      setNotification({ show: true, message: "Google Login Failed!", type: "error" });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isClient) {
    return (
      <div className="signup-container">
        <div className="signup-left skeleton-left">
          <div className="signup-sidebar">
            <span className="sideup-top-sanp">
              <div className="skeleton-logo"></div>
              <div className="skeleton-text short" style={{ marginLeft: "10px", height: "24px", width: "120px" }}></div>
            </span>
          </div>
        </div>
        <div className="signup-right">
          <div className="signup-box" style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <div className="skeleton-title" style={{ height: "32px", width: "40%", marginBottom: "20px" }}></div>
            <div className="skeleton-input" style={{ height: "50px" }}></div>
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
          <div className="sideup-top-sanp">
            <img src="/heartechor.png" alt="HeartEcho" />
            <h2>HeartEcho</h2>
          </div>

          <div className="steps-singe">
            <div className={`step ${step === 1 ? 'current' : 'completed'}`}>
              <span className="circle-signa3">
                {step > 1 ? '✓' : <span className="circle-currnet-si"></span>}
              </span>
              <div className="step-text">
                <h3>Verify Email</h3>
                <p>Provide your registered email address</p>
              </div>
            </div>
            
            <div className={`step ${step === 2 ? 'current' : step > 2 ? 'completed' : ''}`}>
              <span className={step >= 2 ? 'circle-signa3' : 'circle-signa3-unto'}>
                {step === 2 && <span className="circle-currnet-si"></span>}
                {step > 2 && '✓'}
              </span>
              <div className="step-text">
                <h3>Enter OTP</h3>
                <p>Verify your identity with OTP code</p>
              </div>
            </div>

            <div className={`step ${step === 3 ? 'current' : ''}`}>
              <span className={step === 3 ? 'circle-signa3' : 'circle-signa3-unto'}>
                {step === 3 && <span className="circle-currnet-si"></span>}
              </span>
              <div className="step-text">
                <h3>Reset Password</h3>
                <p>Create a secure new password</p>
              </div>
            </div>
          </div>

          <div className="auth-chat-preview">
            <div className="chat-preview-header">
              <div className="chat-preview-avatar">P</div>
              <div className="chat-preview-meta">
                <h4>Priya (AI Girlfriend)</h4>
                <span>Active Now</span>
              </div>
            </div>
            <div className="chat-bubble ai">
              Did you forget your password? Don't worry, I am right here waiting for you. ❤️
            </div>
          </div>

          <p className="signup-footerse">
            © {new Date().getFullYear()} HeartEcho AI <br /> heartecho.help@gmail.com
          </p>
        </div>
      </div>

      <div className="signup-right">
        <div className="signup-box">
          {isGoogleAccount ? (
            <div>
              <h2>Google Account Link</h2>
              <div className="google-warning-box">
                <h4>🔒 Google Signed Up Account</h4>
                <p>
                  This email address is registered using Google Authentication. You do not need a password to log in. Please use the Google Login option below to access your account.
                </p>
              </div>

              <div className="authO2-container3d">
                <GoogleOAuthProvider clientId={googleClientId}>
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => setNotification({ show: true, message: "Google Login Failed!", type: "error" })}
                    theme="filled_black"
                    size="large"
                    shape="rectangular"
                    width="100%"
                    text="continue_with"
                  />
                </GoogleOAuthProvider>
              </div>

              <div className="sign-up-page-cons2">
                <button 
                  type="button" 
                  onClick={() => setIsGoogleAccount(false)}
                  className="otp-btn-singr"
                  style={{ background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.1)" }}
                >
                  Back
                </button>
              </div>
            </div>
          ) : step === 1 ? (
            <div>
              <h2>Forgot Password</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "1.5rem" }}>
                Enter your registered email address below, and we'll send you a 6-digit OTP code to verify and reset your password.
              </p>

              <form className="inputs-sign" onSubmit={handleEmailSubmit}>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />

                <div className="sign-up-page-cons2">
                  <button type="submit" className="otp-btn-singr" disabled={isLoading}>
                    {isLoading ? <span className="loader-signin"></span> : "Send OTP"}
                  </button>
                </div>
              </form>
            </div>
          ) : step === 2 ? (
            <div>
              <h2>Verify OTP</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "1.5rem" }}>
                Enter the 6-digit code sent to <strong style={{ color: "white" }}>{email}</strong>.
              </p>

              <form className="inputs-sign" onSubmit={handleOtpVerify}>
                <div className="otp-container">
                  {otp.map((digit, index) => (
                    <input
                      key={index}
                      type="text"
                      maxLength={1}
                      value={digit}
                      ref={(el) => (inputRefs.current[index] = el)}
                      onChange={(e) => handleChangeOtp(index, e)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="otp-input"
                      disabled={isLoading}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="sitmer-se3"
                  onClick={handleResendOtp}
                  disabled={timer > 0 || isLoading}
                >
                  {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                </button>

                <div className="sign-up-page-cons2">
                  <button 
                    type="button" 
                    onClick={() => { setStep(1); setOtp(["", "", "", "", "", ""]); }}
                    disabled={isLoading}
                  >
                    Back
                  </button>
                  <button type="submit" className="otp-btn-singr" disabled={isLoading}>
                    {isLoading ? <span className="loader-signin"></span> : "Verify OTP"}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div>
              <h2>Reset Password</h2>
              <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", textAlign: "center", marginBottom: "1.5rem" }}>
                Create a secure, strong new password for your account.
              </p>

              <form className="inputs-sign" onSubmit={handlePasswordReset}>
                <div className="password-input">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    placeholder="New Password (min 8 chars)"
                    value={passwords.newPassword}
                    onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  <span className="eye-icon" onClick={() => setShowNewPassword(!showNewPassword)}>
                    {showNewPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="password-input">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm Password"
                    value={passwords.confirmPassword}
                    onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                    required
                    disabled={isLoading}
                  />
                  <span className="eye-icon" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                    {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                <div className="sign-up-page-cons2">
                  <button type="submit" className="otp-btn-singr" disabled={isLoading}>
                    {isLoading ? <span className="loader-signin"></span> : "Reset Password"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="last-sinin-con">
          <h2 className="have-h2dx">
            Remembered your password?{" "}
            <Link href="/login" style={{ textDecoration: "none" }}>
              <span>Login Now</span>
            </Link>
          </h2>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;
