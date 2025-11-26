"use client";
import React, { useState } from 'react';

// Use the new placeholder URL provided by the user
const placeholderImageUrl = "https://cdn.candy.ai/287087049-1918fd35-2ac2-4fde-a3e1-b2ce1c86a10f-webp90";

// Inline SVG for the Audio Waveform
const AudioWaveform = ({ className = '' }) => (
    <svg 
        className={className}
        viewBox="0 0 100 50" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Pink/Red bars - simulating the pulsing waveform */}
        {[5, 15, 25, 35, 45, 55, 65, 75, 85].map((x, index) => (
            <rect 
                key={index}
                x={x} 
                y={25 - [10, 20, 15, 25, 5, 25, 15, 20, 10][index]} 
                width="8" 
                height={[20, 40, 30, 50, 10, 50, 30, 40, 20][index]} 
                rx="4" 
                fill="#ff6384"
            />
        ))}
    </svg>
);

// Inline SVG for the Diamond Icon in the button (now used as "Premium icon")
const DiamondIcon = () => (
    <svg 
        className="premium-icon" 
        viewBox="0 0 24 24" 
        fill="currentColor" 
        xmlns="http://www.w3.org/2000/svg"
    >
        {/* Diamond shape path (reusing the original diamond path for simplicity) */}
        <path d="M12 2L2 12L12 22L22 12L12 2Z" />
    </svg>
);

/**
 * Responsive Upgrade Notice Modal Component with embedded CSS.
 */
const UpgradeNoticeModal = () => {
    const [isOpen, setIsOpen] = useState(true);

    if (!isOpen) {
        return null;
    }

    // New structure based on user input, using custom classNames instead of Tailwind
    return (
        <>
            <div className="paywall-overlay font-inter">
                
                {/* Main Modal Container */}
                <div className="paywall-modal">
                    
                    {/* Close Button */}
                    <button 
                        onClick={() => setIsOpen(false)} 
                        className="paywall-close-btn"
                        aria-label="Close modal"
                    >
                        {/* Using the standard close icon SVG */}
                        <svg className="close-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>

                    {/* Background elements (replaced with CSS/removed) */}
                    {/* Note: All divs referencing external background assets have been removed
                        and their styling is handled by the main modal container CSS for simplicity 
                        and compliance with the single-file environment. */}
                    
                    <div className="paywall-main-content">
                        
                        {/* Image Section / Left (Desktop) */}
                        <div className="paywall-image-wrapper">
                            
                            {/* Mobile only elements (background rects/lights, gradient overlay) */}
                            <div className="mobile-bg-elements">
                                {/* These are placeholders for the complex background shapes from the original template */}
                                <div className="mobile-rect-placeholder rect-1"></div>
                                <div className="mobile-rect-placeholder rect-2"></div>
                            </div>
                            
                            {/* The Main Image */}
                            <img 
                                src={placeholderImageUrl} 
                                className="paywall-image"
                                alt="AI character profile"
                                onError={(e) => { e.target.onerror = null; e.target.src="https://placehold.co/152x229/101010/ffffff?text=Image+Not+Found" }}
                            />

                            {/* Mobile image gradient overlay (replaced complex div structure) */}
                            <div className="mobile-image-gradient-overlay"></div>
                        </div>

                        {/* Content Section / Right (Desktop) */}
                        <div className="paywall-content-section">
                            
                            {/* Waveform and Title Block */}
                            <div className="paywall-title-block">
                                {/* Mobile Waveform (absolute positioning) */}
                                <div className="mobile-waveform-pos">
                                    <AudioWaveform className="waveform-svg" />
                                </div>
                                
                                <div className="flex gap-1 items-center">
                                    <h3 className="title-part1">Upgrade to Unlock</h3>
                                </div>
                                <h3 className="title-part2">AI Voice Messages !</h3>
                            </div>
                            
                            {/* Body Text */}
                            <div className="paywall-body-text">
                                <div className="body-text-light">This feature is available exclusively for our Premium Users.</div>
                                <div className="body-text-base-new">
                                    <h4 className="font-medium text-sm">Become a Premium user now and experience the conversation in more immersive way with audio messages.</h4>
                                </div>
                            </div>

                            {/* Desktop Waveform */}
                            <div className="desktop-waveform-pos">
                                <AudioWaveform className="waveform-svg" />
                            </div>
                            
                            {/* CTA Button */}
                            <a href="/subscribe" className="paywall-cta">
                                {/* Using the existing DiamondIcon for the Premium badge */}
                                <DiamondIcon />
                                <div className="cta-text">
                                    Upgrade to Premium
                                </div>
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Embedded CSS Styles */}
            <style jsx global>{`
                /* Font import for Inter (Optional but good practice) */
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
                
                .font-inter {
                    font-family: 'Inter', sans-serif;
                }
                
                /* Primary Color for Gradient/Accents (based on the user's template) */
                :root {
                    --color-primary: #ec4899; /* Tailwind pink-500 */
                    --color-dark-bg: #100C0B; /* bg-[#100C0B] */
                    --color-content-bg: rgba(28, 27, 25, 0.6); /* md:bg-[#1C1B1999] */
                }

                /* --- 1. Overlay --- */
                .paywall-overlay {
                    position: fixed;
                    inset: 0;
                    z-index: 50;
                    overflow-y: auto;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    background-color: rgba(0, 0, 0, 0.85); /* Slightly darker overlay */
                    padding: 1rem;
                }

                /* --- 2. Main Modal Container --- */
                .paywall-modal {
                    position: relative;
                    width: 320px; /* Mobile width */
                    height: 475px; /* Mobile height */
                    border-radius: 1.5rem; /* rounded-3xl */
                    background-color: var(--color-dark-bg);
                    color: white;
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
                    border: 2px solid #282828;
                    overflow: hidden;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    overflow: visible;
                }

                /* --- 3. Close Button --- */
                .paywall-close-btn {
                    position: absolute;
                    top: 0.5rem; /* top-2 */
                    right: 0.5rem; /* right-2 */
                    width: 1.5rem; /* w-6 */
                    height: 1.5rem; /* h-6 */
                    z-index: 50;
                    background: none;
                    border: none;
                    cursor: pointer;
                    padding: 0;
                }
                .close-icon {
                    width: 100%;
                    height: 100%;
                    color: #9ca3af;
                }

                /* --- 4. Main Content Wrapper (Flex) --- */
                .paywall-main-content {
                    display: flex;
                    flex-direction: column; /* Mobile: column */
                    justify-content: space-between;
                    align-items: center;
                    width: 100%;
                    height: 100%;
                    padding: 2rem; /* p-8 */
                    z-index: 20;
                    position: relative;
                }

                /* --- 5. Image Section / Left --- */
                .paywall-image-wrapper {
                    position: absolute;
                    top: -154px;
                    left: 0;
                    width: 100%;
                    height: 100%;
                }
                
                .paywall-image {
                    position: absolute;
                    bottom: 130px; /* approx bottom-[340px] in 546px height */
                    left: 85px; /* left-[85px] */
                    width: 152px; /* w-[152px] */
                    height: 229px; /* h-[229px] */
                    object-fit: cover;
                    border-radius: 0.75rem; /* rounded-2xl */
                    z-index: 20;
                    /* Simulating the border-img-paywall-modal with a box shadow */
                    box-shadow: 0 0 0 3px var(--color-primary), 0 0 15px rgba(255, 99, 132, 0.5); 
                }

                /* Mobile Background Elements (Complex shape placeholders) */
                .mobile-bg-elements {
                    display: block; /* Visible on mobile */
                }
                .mobile-rect-placeholder {
                        position: absolute;
                        background-color: var(--color-primary);
                        
                        border-radius: 12px;
                        z-index: 20;
                }
                .mobile-bg-elements .rect-1 {
    top: 85px;
    right: 61px;
    width: 150px;
    height: 245px;
    opacity: 0.75;
    transform: rotate(15deg);
    background: linear-gradient(135deg, #a61f82ff 0%, #fad0c4 100%);
    background-repeat: no-repeat;
    background-size: cover;
}
                .mobile-bg-elements .rect-2 {
                    bottom: 167px;
    right: 85px;
    width: 137px;
    height: 201px;
    transform: rotate(-10deg);
    background: linear-gradient(135deg, #d81fa7ff 0%, #e8623dff 100%);
    background-repeat: no-repeat;
    background-size: cover;
                }

                /* Mobile Image Gradient Overlay */
                .mobile-image-gradient-overlay {
                    position: absolute;
                    bottom: 120px; /* Aligned with image bottom */
                    left: 75px; /* left-[75px] */
                    z-index: 30;
                    border-radius: 0.75rem; /* rounded-2xl */
                    width: 175px; /* w-[175px] */
                    height: 200px; /* h-[200px] */
                    background-image: linear-gradient(to bottom, rgba(70, 27, 40, 0) 11.75%, #1F1014 90%);
                }

                /* --- 6. Content Section / Right --- */
                .paywall-content-section {
                    margin-top: 185px; /* mt-[185px] to push content below image on mobile */
                    display: flex;
                    flex-direction: column;
                    color: white;
                    flex: 1;
                    justify-content: space-between;
                    z-index: 30;
                    width: 100%; /* Full width on mobile */
                }

                /* Title and Text Styling */
                .paywall-title-block {
                    position: relative;
                }

                .title-part1 {
                    font-size: 1.25rem; /* text-xl */
                    font-weight: 300; /* font-extralight */
                }
                .title-part2 {
                    font-size: 1.25rem; /* text-xl */
                    font-weight: 500;
                    color: var(--color-primary); /* text-primary */
                }

                .paywall-body-text {
                    margin-top: 1rem;
                }

                .body-text-light {
                    color: #a1a1aa; /* text-neutral-400 */
                    font-size: 0.75rem; /* text-xs */
                    font-weight: 300; /* font-extralight */
                    margin-bottom: 0.5rem; /* mb-2 */
                }

                .body-text-base-new h4 {
                    font-size: 0.875rem; /* text-sm */
                    font-weight: 500;
                }

                /* Waveform Positioning (Mobile - absolute, Desktop - static) */
                .waveform-svg {
                    width: 100%;
                    height: 53px;
                }

                .mobile-waveform-pos {
                    position: absolute;
                    bottom: 66px;
                   right: 108px;
                    width: 100%;
                    max-width: 180px; /* Approximate width */
                    text-align: left;
                    display: block;
                }

                .desktop-waveform-pos {
                    display: none; /* Hidden on mobile */
                }

                /* --- 7. CTA Button (A link) --- */
                .paywall-cta {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    max-width: 100%;
                    padding: 0.625rem 1rem; /* py-2.5 */
                    border-radius: 1rem; /* rounded-2xl */
                    border: 2px solid var(--color-primary);
                    gap: 0.5rem; /* gap-2 */
                    cursor: pointer;
                    text-decoration: none;
                    margin-top: 1.5rem;

                    /* primary-gradient simulation */
                    background-image: linear-gradient(to right, #ec4899, #dc2626); 
                    transition: all 0.3s ease;
                }
                .paywall-cta:hover {
                    opacity: 0.9;
                }

                .premium-icon {
                    width: 1.25rem; /* w-5 */
                    height: 1.25rem;
                    color: white;
                    flex-shrink: 0;
                }
                .cta-text {
                    color: white;
                    font-size: 0.95rem; /* text-lg */
                    font-weight: 600; /* font-semibold */
                    align-self: stretch;
                }


                /* --- Desktop Styles (min-width: 768px / md) --- */
                @media (min-width: 768px) {
                    
                    .paywall-modal {
                        width: 740px; /* md:w-[740px] */
                        height: 475px; 
                    }
                    
                    /* Background elements are now hidden/handled by other divs */
                    .mobile-bg-elements, .mobile-image-gradient-overlay {
                        display: none;
                    }

                    .paywall-main-content {
                        flex-direction: row; /* Desktop: row */
                        padding: 1.5rem; /* Adjust padding for desktop */
                    }

                    /* Image Section Layout (Left) */
                    .paywall-image-wrapper {
                        position: static; /* Reset positioning */
                        width: 307px; /* md:w-[307px] */
                        height: 462px; /* md:h-[462px] */
                        flex-shrink: 0;
                        margin-right: 1rem;
                    }
                    
                    .paywall-image {
                        position: static; /* Reset positioning */
                        width: 100%;
                        height: 100%;
                        max-width: 307px;
                        max-height: 462px;
                        border-radius: 0.75rem;
                        /* Simulating the border-img-paywall-modal with a box shadow */
                        box-shadow: 0 0 0 3px var(--color-primary), 0 0 15px rgba(255, 99, 132, 0.5); 
                    }

                    /* Content Section Layout (Right) */
                    .paywall-content-section {
                        margin-top: 0; /* Reset margin */
                        margin-left: 1rem; /* md:ml-4 */
                        padding: 2rem; /* md:p-8 */
                        width: 357px; /* md:w-[357px] */
                        height: 462px; /* md:h-[462px] */
                        background-color: var(--color-content-bg);
                        border-radius: 0.5rem; /* rounded-lg */
                        justify-content: space-between;
                        flex-shrink: 1;
                    }

                    /* Waveform Positioning Swap */
                    .mobile-waveform-pos {
                        display: none; /* Hide mobile waveform */
                    }

                    .desktop-waveform-pos {
                        display: block; /* Show desktop waveform */
                        margin-top: 1.25rem; /* my-5 */
                        margin-bottom: 1.25rem;
                        width: 100%;
                        height: 53px;
                    }
                    
                    /* CTA Button Styling */
                    .paywall-cta {
                        border-radius: 0.5rem; /* md:rounded-lg */
                    }
                }
            `}</style>
        </>
    );
};

export default UpgradeNoticeModal;