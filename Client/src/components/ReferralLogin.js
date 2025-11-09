'use client';

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import api from "../config/api";
import { FaUser, FaLock, FaArrowRight, FaEye, FaEyeSlash, FaStar, FaCoins } from "react-icons/fa";
import "./ReferralLogin.css";

const ReferralLogin = () => {
  const [loginData, setLoginData] = useState({
    referralId: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const params = useParams();

  // Pre-fill referral ID from URL if available
  useEffect(() => {
    if (params.referralId) {
      setLoginData(prev => ({
        ...prev,
        referralId: params.referralId
      }));
    }
  }, [params.referralId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!loginData.referralId || !loginData.password) {
      setError("Please enter both referral ID and password");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(
        `${api.Url}/admin/referral-creators/login`,
        loginData
      );

      if (response.data.success) {
        // Store token and creator info in localStorage
        localStorage.setItem('referralToken', response.data.token);
        localStorage.setItem('referralCreator', JSON.stringify(response.data.creator));
        
        // Redirect to dashboard
        router.push(`/referral/${response.data.creator.referralId}/dashboard`);
      } else {
        throw new Error(response.data.message || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.response?.data?.message || error.message || 'Login failed. Please check your credentials and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="referral-login-container">
      <div className="referral-login-background">
        <div className="login-glow"></div>
      </div>
      
      <div className="referral-login-card">
        <div className="login-header">
          <div className="login-logo">
            <FaCoins className="logo-icon" />
          </div>
          <h1>Creator Login</h1>
          <p>Access your secure referral dashboard</p>
        </div>

        {error && (
          <div className="login-error">
            <FaStar className="error-icon" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="referralId">Referral ID</label>
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input
                type="text"
                id="referralId"
                name="referralId"
                value={loginData.referralId}
                onChange={handleInputChange}
                required
                placeholder="Enter your referral ID"
                className="form-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={loginData.password}
                onChange={handleInputChange}
                required
                placeholder="Enter your password"
                className="form-input"
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <div className="login-spinner"></div>
                Signing In...
              </>
            ) : (
              <>
                Access Dashboard
                <FaArrowRight className="button-icon" />
              </>
            )}
          </button>
        </form>

        <div className="login-footer">
          <p>
            Don't have an account?{" "}
            <a href="/referral" className="login-link">
              Join our referral program
            </a>
          </p>
          <p className="login-security-note">
            <FaLock className="security-icon" />
            Your dashboard is securely protected
          </p>
        </div>
      </div>
    </div>
  );
};

export default ReferralLogin;