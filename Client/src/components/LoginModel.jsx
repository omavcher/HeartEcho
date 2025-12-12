"use client";
import React, { useState } from 'react';

// Placeholder image (Same as before for consistency)
const placeholderImageUrl = "./auth/login_di_img.webp";

// --- Icons & Graphics ---

// Using the same waveform to imply "Voice/Chat" awaits inside
const AudioWaveform = ({ className = '' }) => (
    <svg className={className} viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
        {[5, 15, 25, 35, 45, 55, 65, 75, 85].map((x, index) => (
            <rect 
                key={index}
                x={x} 
                y={25 - [10, 20, 15, 25, 5, 25, 15, 20, 10][index]} 
                width="6" 
                height={[20, 40, 30, 50, 10, 50, 30, 40, 20][index]} 
                rx="3" 
                fill="#ec4899"
                className="animate-pulse-bar"
                style={{ animationDelay: `${index * 0.1}s` }}
            />
        ))}
    </svg>
);

// Login / User Icon
const LoginIcon = () => (
    <svg className="icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

const LoginModal = () => {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;

    return (
        <>
            <div className="modal-overlay font-inter">
                
                {/* Main Card */}
                <div className="modal-card">
                    
                    {/* Close Button */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="modal-close-btn"
                        aria-label="Close modal"
                    >
                        <CloseIcon />
                    </button>

                    {/* --- Left Side (Image) --- */}
                    <div className="modal-image-section">
                        
                        {/* Mobile Background Shapes */}
                        <div className="mobile-decor-bg">
                            <div className="decor-shape shape-1"></div>
                            <div className="decor-shape shape-2"></div>
                        </div>

                        {/* Character Image */}
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

                    {/* --- Right Side (Login Content) --- */}
                    <div className="modal-content-section">
                        
                        <div className="content-header">
                            <div className="waveform-wrapper">
                                <AudioWaveform className="waveform-svg" />
                            </div>
                            
                            <div className="title-group">
                                <span className="eyebrow">WELCOME BACK</span>
                                <h2 className="main-title">Continue Chatting</h2>
                            </div>
                        </div>

                        <div className="content-body">
                            <p className="description-text">
                                Please log in to access your saved conversations, voice messages, and personalized settings.
                            </p>
                        </div>

                        {/* Login Button */}
                        <a href="/login" className="cta-button">
                            <LoginIcon />
                            <span>Log In to Account</span>
                            <div className="glow-effect"></div>
                        </a>

                        {/* Optional subtle footer link */}
                        <div className="footer-link">
                            
                            <a href="/signup" className="link-highlight"><span>Don't have an account? </span></a>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- STYLES --- */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                :root {
                    --color-primary: #ec4899;
                    --color-bg-dark: #121212;
                    --color-text-dim: #A1A1AA;
                    --shadow-glow: 0 0 20px rgba(236, 72, 153, 0.4);
                }

                .font-inter { font-family: 'Inter', sans-serif; }

                /* Overlay */
                .modal-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
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
                    max-width: 340px;
                    background-color: var(--color-bg-dark);
                    border: 1px solid #333;
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: visible; 
                    margin-top: 50px; /* Space for pop-out */
                }

                /* Close Button */
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
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    z-index: 10;
                }

                .image-container {
                    position: relative;
                    width: 160px;
                    height: 220px;
                    margin-top: -60px;
                    border-radius: 16px;
                    box-shadow: var(--shadow-glow);
                    z-index: 20;
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
                .decor-shape {
                    position: absolute;
                    border-radius: 12px;
                    opacity: 0.6;
                }
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
                    padding: 3rem 1.5rem 2rem 1.5rem;
                    text-align: center;
                    color: white;
                    display: flex;
                    flex-direction: column;
                    gap: 1.5rem;
                }

                .waveform-wrapper {
                    width: 120px;
                    height: 40px;
                    margin: 0 auto 1rem auto;
                }
                .waveform-svg { width: 100%; height: 100%; color: var(--color-primary); }

                .title-group { display: flex; flex-direction: column; gap: 0.25rem; }
                
                .eyebrow {
                    font-size: 0.75rem;
                    letter-spacing: 0.1em;
                    text-transform: uppercase;
                    color: var(--color-text-dim);
                    font-weight: 600;
                }
                
                .main-title {
                    font-size: 1.75rem;
                    font-weight: 800;
                    line-height: 1.1;
                    background: linear-gradient(to right, #fff, #fbcfe8);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }

                .description-text {
                    font-size: 0.9rem;
                    line-height: 1.5;
                    color: var(--color-text-dim);
                }

                /* CTA Button */
                .cta-button {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.75rem;
                    width: 100%;
                    padding: 1rem;
                    background: linear-gradient(90deg, #ec4899 0%, #db2777 100%);
                    border-radius: 14px;
                    color: white;
                    font-weight: 700;
                    font-size: 1rem;
                    text-decoration: none;
                    transition: transform 0.2s, box-shadow 0.2s;
                    overflow: hidden;
                    box-shadow: 0 4px 15px rgba(236, 72, 153, 0.3);
                }
                .cta-button:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 8px 25px rgba(236, 72, 153, 0.5);
                }
                .cta-button:active { transform: scale(0.98); }

                .icon-svg { width: 20px; height: 20px; }

                .footer-link {
                    font-size: 0.8rem;
                    color: #888;
                }
                .link-highlight {
                    color: white;
                    text-decoration: none;
                    font-weight: 600;
                    margin-left: 4px;
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
                .animate-pulse-bar {
                    animation: pulseHeight 1.5s ease-in-out infinite;
                    transform-origin: bottom;
                }
                @keyframes pulseHeight {
                    0%, 100% { transform: scaleY(0.5); }
                    50% { transform: scaleY(1); }
                }

                /* --- DESKTOP (MD+) --- */
                @media (min-width: 768px) {
                    .modal-card {
                        max-width: 750px;
                        height: 420px;
                        flex-direction: row;
                        overflow: hidden; 
                        margin-top: 0;
                        padding: 0;
                        align-items: stretch;
                        border: 1px solid #2a2a2a;
                    }

                    /* Desktop Image (Left) */
                    .modal-image-section {
                        width: 42%;
                        flex-shrink: 0;
                        height: auto;
                        margin: 0;
                        padding: 0;
                    }

                    .mobile-decor-bg { display: none; }

                    .image-container {
                        width: 100%;
                        height: 100%;
                        margin: 0;
                        border-radius: 0;
                        box-shadow: none;
                        border: none;
                    }

                    .profile-image {
                        width: 100%;
                        height: 100%;
                        border-radius: 0;
                        border: none;
                        mask-image: linear-gradient(to right, black 80%, transparent 100%);
                    }

                    /* Desktop Content (Right) */
                    .modal-content-section {
                        width: 58%;
                        padding: 3rem;
                        text-align: left;
                        justify-content: center;
                        align-items: flex-start;
                        background: linear-gradient(to left, #121212 0%, #1a1a1a 100%);
                    }

                    .waveform-wrapper { margin: 0 0 1.5rem 0; width: 140px; }

                    .title-group { gap: 0.5rem; }
                    .main-title { font-size: 2.25rem; }

                    .cta-button {
                        width: auto;
                        padding: 1rem 3rem;
                        margin-top: 1rem;
                    }
                    
                    .footer-link { margin-top: 1rem; }
                }
            `}</style>
        </>
    );
};

export default LoginModal;