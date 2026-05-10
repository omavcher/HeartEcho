"use client";
import React, { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Cookies from 'js-cookie';
import api from '../config/api';

const placeholderImageUrl = "/auth/login_di_img.webp";
const googleClientId = "273920667679-85i343d6q2eibbc7e597ougsflo7u6c0.apps.googleusercontent.com";

const CloseIcon = () => (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

const LoginModal = ({ onClose, mode = "login" }) => {
    const isGuest = mode === "guest";
    const [isOpen, setIsOpen] = useState(true);
    
    // Auth State
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    const handleClose = () => {
        setIsOpen(false);
        if (onClose) onClose();
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrorMsg("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) {
            setErrorMsg("Please fill in all fields.");
            return;
        }

        setIsSubmitting(true);
        try {
            const res = await axios.post(`${api.Url}/auth/login`, formData);
            const { token, user } = res.data;
        
            Cookies.set("token", token, { expires: 7 });
            localStorage.setItem("user", JSON.stringify(user));
            localStorage.setItem("token", token);

            if (typeof window !== "undefined") {
                if (user?.email !== 'omawchar07@gmail.com') {
                    if (window.fbq) window.fbq('track', 'Login');
                    if (window.trackAppEvent) window.trackAppEvent('login_success');
                }
            }
            
            // Reload page to apply auth state seamlessly
            window.location.reload();
        } catch (error) {
            setErrorMsg(error.response?.data?.msg || "Invalid credentials.");
            setIsSubmitting(false);
        }
    };

    const handleGoogleSuccess = async (response) => {
        setIsSubmitting(true);
        const userData = jwtDecode(response.credential);
      
        try {
            const res = await axios.post(`${api.Url}/auth/google-login`, { email: userData.email });
      
            if (res.data.token) {
                Cookies.set("token", res.data.token, { expires: 7 });
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify(res.data.user));

                if (typeof window !== "undefined") {
                    if (res.data.user?.email !== 'omawchar07@gmail.com') {
                        if (window.fbq) window.fbq('track', 'Login');
                        if (window.trackAppEvent) window.trackAppEvent('login_success');
                    }
                }
                
                window.location.reload();
            } else if (res.data.user === null && res.data.message === "New user, please complete registration") {
                window.location.href = "/signup";
            }
        } catch (error) {
            setErrorMsg("Google Login Failed.");
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay font-inter">
                <div className="modal-card">
                    <button onClick={handleClose} className="modal-close-btn" aria-label="Close modal">
                        <CloseIcon />
                    </button>

                    {/* --- Left Side (Image) --- */}
                    <div className="modal-image-section">
                        <div className="mobile-decor-bg">
                            <div className="decor-shape shape-1"></div>
                            <div className="decor-shape shape-2"></div>
                        </div>
                        <div className="image-container">
                            <img 
                                src={placeholderImageUrl} 
                                className="profile-image"
                                alt="AI Character"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x400/101010/ffffff?text=Login" }}
                            />
                            <div className="image-gradient-overlay"></div>
                        </div>
                    </div>

                    {/* --- Right Side (Login Form) --- */}
                    <div className="modal-content-section">
                        <div className="content-header">
                            <div className="title-group">
                                <span className="eyebrow">{isGuest ? "FREE LIMIT REACHED" : "WELCOME BACK"}</span>
                                <h2 className="main-title">{isGuest ? "Sign Up for More" : "Quick Login"}</h2>
                            </div>
                            <p className="description-text mt-2">
                                {isGuest 
                                    ? "Your free guest messages are over! Log in or create an account to continue chatting." 
                                    : "Please log in to access your saved conversations and settings."}
                            </p>
                        </div>

                        {errorMsg && <div className="error-message">{errorMsg}</div>}

                        <div className="form-container">
                            <GoogleOAuthProvider clientId={googleClientId}>
                                <div className="google-btn-wrapper">
                                    <GoogleLogin
                                        onSuccess={handleGoogleSuccess}
                                        onError={() => setErrorMsg("Google Login Failed.")}
                                        theme="filled_black"
                                        size="large"
                                        shape="rectangular"
                                        width="100%"
                                        text="continue_with"
                                    />
                                </div>
                            </GoogleOAuthProvider>

                            <div className="divider">
                                <span>Or login with email</span>
                            </div>

                            <form onSubmit={handleSubmit} className="login-form">
                                <input 
                                    type="email" 
                                    name="email" 
                                    placeholder="Email Address" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    className="form-input"
                                    required 
                                />
                                <input 
                                    type="password" 
                                    name="password" 
                                    placeholder="Password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    className="form-input"
                                    required 
                                />
                                <button type="submit" className="cta-button" disabled={isSubmitting}>
                                    {isSubmitting ? <span className="spinner"></span> : "Log In"}
                                    {!isSubmitting && <div className="glow-effect"></div>}
                                </button>
                            </form>
                        </div>

                        <div className="footer-link mt-4">
                            <span>Don't have an account? </span>
                            <a href="/signup" className="link-highlight">Sign Up Now</a>
                        </div>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                :root {
                    --color-primary: #ec4899;
                    --color-bg-dark: #121212;
                    --color-text-dim: #A1A1AA;
                    --shadow-glow: 0 0 20px rgba(236, 72, 153, 0.4);
                }

                .font-inter { font-family: 'Inter', sans-serif; }
                .mt-2 { margin-top: 0.5rem; }
                .mt-4 { margin-top: 1.5rem; }

                /* Overlay */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 99999;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: rgba(0, 0, 0, 0.85);
                    backdrop-filter: blur(8px);
                    padding: 1rem;
                    animation: fadeIn 0.3s ease-out;
                }

                /* Modal Card */
                .modal-card {
                    position: relative;
                    width: 100%;
                    max-width: 360px;
                    background-color: var(--color-bg-dark);
                    border: 1px solid #333;
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: visible; 
                    margin-top: 50px;
                }

                .modal-close-btn {
                    position: absolute;
                    top: 12px;
                    right: 12px;
                    width: 32px;
                    height: 32px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 50%;
                    color: white;
                    border: none;
                    cursor: pointer;
                    z-index: 50;
                    padding: 6px;
                    transition: background 0.2s;
                }
                .modal-close-btn:hover { background: rgba(255,255,255,0.2); }

                /* Image Section */
                .modal-image-section {
                    display: none; /* Hide on mobile for a cleaner, faster look */
                }

                .profile-image {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    border-radius: 16px;
                    border: 2px solid var(--color-primary);
                }

                .mobile-decor-bg {
                    position: absolute;
                    top: -50px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 200px;
                    height: 200px;
                    z-index: 0;
                    pointer-events: none;
                }
                .decor-shape { position: absolute; border-radius: 12px; opacity: 0.6; }
                .shape-1 {
                    width: 140px; height: 180px;
                    background: linear-gradient(45deg, #ec4899, #f87171);
                    top: 10px; right: 20px;
                    transform: rotate(12deg);
                }
                .shape-2 {
                    width: 140px; height: 160px;
                    background: linear-gradient(45deg, #8b5cf6, #ec4899);
                    top: 20px; left: 20px;
                    transform: rotate(-8deg);
                }

                /* Content Section */
                .modal-content-section {
                    padding: 2rem 1.5rem;
                    text-align: center;
                    color: white;
                    display: flex;
                    flex-direction: column;
                }

                .title-group { display: flex; flex-direction: column; gap: 0.25rem; }
                
                .eyebrow {
                    font-size: 0.75rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--color-primary);
                    font-weight: 700;
                }
                
                .main-title {
                    font-size: 1.5rem;
                    font-weight: 800;
                    line-height: 1.1;
                    background: linear-gradient(to right, #fff, #fbcfe8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .description-text { font-size: 0.85rem; line-height: 1.4; color: var(--color-text-dim); }

                .error-message {
                    background: rgba(239, 68, 68, 0.1);
                    color: #f87171;
                    padding: 8px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    margin-top: 1rem;
                    border: 1px solid rgba(239, 68, 68, 0.3);
                }

                .form-container { margin-top: 1.25rem; }
                
                .google-btn-wrapper { width: 100%; display: flex; justify-content: center; }

                .divider {
                    display: flex;
                    align-items: center;
                    text-align: center;
                    margin: 1rem 0;
                    color: #555;
                    font-size: 0.75rem;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }
                .divider::before, .divider::after {
                    content: '';
                    flex: 1;
                    border-bottom: 1px solid #333;
                }
                .divider span { padding: 0 10px; }

                .login-form { display: flex; flex-direction: column; gap: 0.75rem; }

                .form-input {
                    width: 100%;
                    padding: 12px 14px;
                    background: #1a1a1a;
                    border: 1px solid #333;
                    border-radius: 12px;
                    color: white;
                    font-size: 0.9rem;
                    outline: none;
                    transition: border-color 0.2s;
                }
                .form-input:focus { border-color: var(--color-primary); }

                /* CTA Button */
                .cta-button {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    width: 100%;
                    padding: 12px;
                    background: linear-gradient(90deg, #ec4899 0%, #db2777 100%);
                    border-radius: 12px;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    border: none;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                    overflow: hidden;
                    margin-top: 0.5rem;
                }
                .cta-button:hover:not(:disabled) {
                    transform: translateY(-1px);
                    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.4);
                }
                .cta-button:disabled { opacity: 0.7; cursor: not-allowed; }

                .footer-link { font-size: 0.8rem; color: #888; }
                .link-highlight {
                    color: var(--color-primary);
                    text-decoration: none;
                    font-weight: 600;
                }
                .link-highlight:hover { text-decoration: underline; }

                /* Animations */
                .glow-effect {
                    position: absolute;
                    top: 0; left: -100%;
                    width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transform: skewX(-20deg);
                    animation: shine 3s infinite;
                }
                @keyframes shine {
                    0% { left: -100%; }
                    20% { left: 200%; }
                    100% { left: 200%; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.95); }
                    to { opacity: 1; transform: scale(1); }
                }

                .spinner {
                    width: 20px; height: 20px;
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top-color: white;
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                }
                @keyframes spin { to { transform: rotate(360deg); } }

                /* --- DESKTOP (MD+) --- */
                @media (min-width: 768px) {
                    .modal-card {
                        max-width: 800px;
                        flex-direction: row;
                        margin-top: 0;
                        padding: 0;
                        border: 1px solid #2a2a2a;
                    }

                    .modal-image-section { 
                        display: flex;
                        width: 45%; 
                        position: relative;
                        justify-content: center;
                        z-index: 10;
                    }
                    .mobile-decor-bg { display: none; }
                    .image-container {
                        position: relative;
                        width: 100%; height: 100%;
                        margin: 0; border-radius: 0;
                        box-shadow: none; border: none;
                        z-index: 20;
                    }
                    .profile-image {
                        width: 100%; height: 100%; object-fit: cover;
                        border-radius: 0; border: none;
                        mask-image: linear-gradient(to right, black 80%, transparent 100%);
                    }

                    .modal-content-section {
                        width: 55%;
                        padding: 2.5rem;
                        text-align: left;
                        background: linear-gradient(to left, #121212 0%, #1a1a1a 100%);
                    }

                    .title-group { gap: 0.5rem; }
                    .main-title { font-size: 2rem; }
                }
            `}</style>
        </>
    );
};

export default LoginModal;