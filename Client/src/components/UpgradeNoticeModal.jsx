"use client";
import React, { useState } from 'react';

// Use the placeholder URL provided
const placeholderImageUrl = "https://cdn.candy.ai/287087049-1918fd35-2ac2-4fde-a3e1-b2ce1c86a10f-webp90";

// --- Components ---

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

const DiamondIcon = () => (
    <svg className="premium-icon" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        <path d="M12 2L2 12L12 22L22 12L12 2Z" />
    </svg>
);

const CloseIcon = () => (
    <svg className="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
    </svg>
);

const UpgradeNoticeModal = () => {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) return null;

    return (
        <>
            <div className="paywall-overlay font-inter">
                
                {/* Modal Container */}
                <div className="paywall-modal">
                    
                    {/* Close Button */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="paywall-close-btn"
                        aria-label="Close modal"
                    >
                        <CloseIcon />
                    </button>

                    {/* --- Left Side (Image) --- */}
                    <div className="modal-image-section">
                        
                        {/* Mobile Background Decor (Abstract Shapes) */}
                        <div className="mobile-decor-bg">
                            <div className="decor-shape shape-1"></div>
                            <div className="decor-shape shape-2"></div>
                        </div>

                        {/* Main Image */}
                        <div className="image-container">
                            <img 
                                src={placeholderImageUrl} 
                                className="profile-image"
                                alt="AI Character"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/300x400/101010/ffffff?text=No+Image" }}
                            />
                            {/* Gradient Overlay for Text Readability on Mobile */}
                            <div className="image-gradient-overlay"></div>
                        </div>
                    </div>

                    {/* --- Right Side (Content) --- */}
                    <div className="modal-content-section">
                        
                        {/* Header Group */}
                        <div className="content-header">
                            <div className="waveform-wrapper">
                                <AudioWaveform className="waveform-svg" />
                            </div>
                            
                            <div className="title-group">
                                <span className="eyebrow">UPGRADE TO UNLOCK</span>
                                <h2 className="main-title">AI Voice Messages</h2>
                            </div>
                        </div>

                        {/* Description */}
                        <div className="content-body">
                            <p className="highlight-text">
                                Exclusive feature for Premium Users.
                            </p>
                            <p className="description-text">
                                Experience the conversation in a more immersive way. Hear their voice, catch the nuance, and feel the connection.
                            </p>
                        </div>

                        {/* CTA Button */}
                        <a href="/subscribe" className="cta-button">
                            <DiamondIcon />
                            <span>Upgrade to Premium</span>
                            <div className="glow-effect"></div>
                        </a>
                    </div>
                </div>
            </div>

            {/* --- STYLES --- */}
            <style jsx global>{`
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

                :root {
                    --color-primary: #ec4899;
                    --color-primary-dark: #be185d;
                    --color-bg-dark: #121212;
                    --color-bg-card: #1E1E1E;
                    --color-text-dim: #A1A1AA;
                    --shadow-glow: 0 0 20px rgba(236, 72, 153, 0.4);
                }

                .font-inter { font-family: 'Inter', sans-serif; }

                /* 1. Overlay */
                .paywall-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 9999;
                    display: flex;
                    justify-content: center;
                    align-items: center; /* Centers vertically on desktop */
                    background-color: rgba(0, 0, 0, 0.8);
                    backdrop-filter: blur(8px);
                    padding: 1rem;
                    animation: fadeIn 0.3s ease-out;
                }

                /* 2. Modal Container */
                .paywall-modal {
                    position: relative;
                    width: 100%;
                    max-width: 340px; /* Mobile standard width */
                    background-color: var(--color-bg-dark);
                    border: 1px solid #333;
                    border-radius: 24px;
                    display: flex;
                    flex-direction: column;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                    overflow: visible; /* Allows image to pop out on mobile */
                    margin-top: 40px; /* Space for image pop-out */
                }

                /* 3. Close Button */
                .paywall-close-btn {
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
                .paywall-close-btn:hover { background: rgba(255,255,255,0.2); }

                /* 4. Image Section (Top/Left) */
                .modal-image-section {
                    position: relative;
                    width: 100%;
                    display: flex;
                    justify-content: center;
                    z-index: 10;
                }

                /* The Main Image */
                .image-container {
                    position: relative;
                    width: 160px;
                    height: 220px;
                    margin-top: -60px; /* Pull image up out of card */
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

                /* Mobile Background Shapes (The colored squares behind image) */
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

                /* 5. Content Section (Bottom/Right) */
                .modal-content-section {
                    padding: 3rem 1.5rem 2rem 1.5rem; /* Top padding clears the image */
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
                .waveform-svg {
                    width: 100%;
                    height: 100%;
                    color: var(--color-primary);
                }

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

                .content-body { display: flex; flex-direction: column; gap: 0.75rem; }
                
                .highlight-text {
                    font-size: 0.875rem;
                    color: #f472b6;
                    font-weight: 500;
                }
                
                .description-text {
                    font-size: 0.875rem;
                    line-height: 1.5;
                    color: var(--color-text-dim);
                }

                /* 6. CTA Button */
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

                .premium-icon { width: 20px; height: 20px; }

                /* Button Shine Animation */
                .glow-effect {
                    position: absolute;
                    top: 0; left: -100%;
                    width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
                    transform: skewX(-20deg);
                    animation: shine 3s infinite;
                }

                /* --- Animations --- */
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

                /* --- DESKTOP OPTIMIZATIONS (MD+) --- */
                @media (min-width: 768px) {
                    .paywall-modal {
                        max-width: 800px;
                        height: 450px;
                        flex-direction: row; /* Switch to Horizontal Layout */
                        overflow: hidden; /* Contain image inside */
                        margin-top: 0;
                        padding: 0;
                        align-items: stretch;
                        border: 1px solid #2a2a2a;
                    }

                    /* Desktop Image Section (Left Half) */
                    .modal-image-section {
                        width: 45%;
                        flex-shrink: 0;
                        height: auto;
                        margin: 0;
                        padding: 0;
                    }

                    /* Hide mobile decor on desktop */
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
                        mask-image: linear-gradient(to right, black 85%, transparent 100%);
                    }

                    /* Desktop Content Section (Right Half) */
                    .modal-content-section {
                        width: 55%;
                        padding: 3rem;
                        text-align: left;
                        justify-content: center;
                        align-items: flex-start;
                        background: linear-gradient(to left, #121212 0%, #1a1a1a 100%);
                    }

                    .waveform-wrapper { margin: 0 0 1.5rem 0; width: 140px; }

                    .title-group { gap: 0.5rem; }
                    .main-title { font-size: 2.5rem; }

                    .content-body { gap: 1rem; max-width: 90%; }
                    .description-text { font-size: 1rem; }

                    .cta-button {
                        width: auto;
                        padding: 1rem 2.5rem;
                        margin-top: 1rem;
                    }
                }
            `}</style>
        </>
    );
};

export default UpgradeNoticeModal;