'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../config/api';

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [activeLink, setActiveLink] = useState(pathname);

  // --- LOGIC: Subscription Status ---
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const SaveSubscriptionStatusInLocalStorage = useCallback(async () => {
    if (!token) return;
    try {
      const response = await axios.get(`${api.Url}/user/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      // Store full response and simple status
      localStorage.setItem("subscribed", JSON.stringify(response.data));
      localStorage.setItem("isSubscribed", response.data?.isSubscribed ? "true" : "false");
    } catch (error) {
      console.error("Error checking subscription:", error);
      localStorage.setItem("isSubscribed", "false");
    }
  }, [token]);

  useEffect(() => {
    SaveSubscriptionStatusInLocalStorage();
  }, [SaveSubscriptionStatusInLocalStorage]);

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  const handleEarnNowClick = () => {
    router.push('/referral');
  };

  // --- MENU DATA ---
  const menuItems = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
      )
    },
    {
      href: '/discover',
      label: 'Discover',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/></svg>
      )
    },
    {
      href: '/chatbox',
      label: 'Chat',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
      )
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
      )
    }
  ];

  // --- STYLES ---
  const styles = `
    /* Container */
    .side-menu-container {
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      width: 80px;
      height: 100vh;
      position: fixed;
      left: 0;
      top: 0;
      border-top-right-radius: 20px;
      border-bottom-right-radius: 20px;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      border-right: 1px solid rgba(255, 255, 255, 0.08);
      overflow: hidden;
      box-shadow: 4px 0 24px rgba(0,0,0,0.2);
    }

    .side-menu-container.expanded {
      width: 240px;
    }

    /* Glow Effect */
    .menu-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.03), transparent);
      transition: left 0.6s ease;
      pointer-events: none;
      z-index: 0;
    }
    .side-menu-container:hover .menu-glow {
      left: 100%;
    }

    /* Logo Section */
    .logo-section {
      padding: 24px 0;
      margin-bottom: 10px;
      position: relative;
      z-index: 2;
    }

    .logo-wrapper {
      padding: 0 16px;
      display: flex;
      align-items: center;
      gap: 12px;
      height: 50px;
      overflow: hidden;
    }

    .logo-image-container {
      min-width: 48px;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .side-menu-logo {
      width: 40px;
      height: 40px;
      object-fit: contain;
      border-radius: 10px;
      transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      filter: drop-shadow(0 2px 4px rgba(0,0,0,0.2));
    }

    .side-menu-container:hover .side-menu-logo {
      transform: scale(1.05);
      filter: drop-shadow(0 4px 8px rgba(0,0,0,0.3));
    }

    /* Brand Name Text Styling */
    .brand-name {
      font-family: 'Inter', -apple-system, sans-serif;
      font-size: 18px;
      font-weight: 700;
      color: #fff;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      background: linear-gradient(to right, #fff, #ccc);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .side-menu-container.expanded .brand-name {
      opacity: 1;
      transform: translateX(0);
      transition-delay: 0.1s;
    }

    /* Navigation */
    .side-menu-nav {
      flex: 1;
      display: flex;
      flex-direction: column;
      padding: 10px 12px;
      z-index: 2;
    }

    .nav-items {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .nav-link {
      display: flex;
      align-items: center;
      height: 48px;
      text-decoration: none;
      color: rgba(255, 255, 255, 0.6);
      border-radius: 12px;
      position: relative;
      transition: all 0.3s ease;
      overflow: hidden;
    }

    .nav-link:hover {
      background: rgba(255, 255, 255, 0.08);
      color: #fff;
    }

    .nav-link.active {
      background: linear-gradient(135deg, rgba(207, 65, 133, 0.2), rgba(65, 105, 225, 0.1));
      color: #fff;
      border: 1px solid rgba(255, 255, 255, 0.05);
    }

    .nav-link.active::before {
      content: '';
      position: absolute;
      left: 0;
      top: 50%;
      transform: translateY(-50%);
      width: 4px;
      height: 24px;
      background: #cf4185;
      border-radius: 0 4px 4px 0;
      box-shadow: 0 0 10px #cf4185;
    }

    .icon-wrapper {
      min-width: 56px; /* Matches menu width minus padding */
      display: flex;
      justify-content: center;
      align-items: center;
    }

    .nav-link svg {
      width: 22px;
      height: 22px;
      transition: all 0.3s ease;
    }

    .nav-link:hover svg {
      transform: scale(1.1);
      stroke: #cf4185;
    }

    .nav-link.active svg {
      stroke: #cf4185;
      filter: drop-shadow(0 0 5px rgba(207, 65, 133, 0.5));
    }

    .link-label {
      font-family: 'Inter', sans-serif;
      font-size: 15px;
      font-weight: 500;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .side-menu-container.expanded .link-label {
      opacity: 1;
      transform: translateX(0);
      transition-delay: 0.05s;
    }

    /* Earn Now Section */
    .earn-now-section {
      padding: 20px 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      margin-top: auto;
      z-index: 2;
    }

    .earn-now-button {
      width: 100%;
      height: 48px;
      background: linear-gradient(135deg, #FFD700, #FFA500);
      border: none;
      border-radius: 12px;
      display: flex;
      align-items: center;
      padding: 0; /* Let flex handle padding via children */
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 15px rgba(255, 215, 0, 0.2);
    }

    .earn-now-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(255, 215, 0, 0.4);
    }

    .earn-now-icon {
      min-width: 48px; /* Center icon when collapsed */
      display: flex;
      justify-content: center;
      align-items: center;
      color: #000;
      z-index: 2;
    }

    .earn-now-label {
      color: #000;
      font-weight: 700;
      font-size: 14px;
      white-space: nowrap;
      opacity: 0;
      transform: translateX(-10px);
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      z-index: 2;
    }

    .side-menu-container.expanded .earn-now-label {
      opacity: 1;
      transform: translateX(0);
      padding-right: 16px;
    }

    /* Shine effect */
    .earn-now-glow {
      position: absolute;
      top: 0;
      left: -100%;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent);
      transform: skewX(-20deg);
      transition: left 0.5s;
      z-index: 1;
    }
    .earn-now-button:hover .earn-now-glow {
      left: 150%;
      transition: left 0.7s;
    }

    /* Mobile Responsiveness */
    @media (max-width: 768px) {
      .side-menu-container {
        display: none; /* Usually hidden on mobile in favor of bottom nav */
      }
    }
  `;

  return (
    <>
      <style jsx>{styles}</style>
      <div 
        className={`side-menu-container ${isHovered ? 'expanded' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Background Glow Effect */}
        <div className="menu-glow"></div>

        {/* Logo Section */}
        <div className="logo-section">
          <div className="logo-wrapper">
            <div className="logo-image-container">
              <Image 
                src='/heartechor.png' 
                alt='HeartEcho' 
                width={40}
                height={40}
                className='side-menu-logo'
                priority
              />
            </div>
            {/* Added Text for Styling */}
            <span className="brand-name">HeartEcho</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="side-menu-nav">
          <div className="nav-items">
            {menuItems.map((item, index) => (
              <Link 
                key={item.href}
                href={item.href}
                className={`nav-link ${activeLink === item.href ? 'active' : ''}`}
                onClick={() => setActiveLink(item.href)}
              >
                <div className="icon-wrapper">
                  {item.icon}
                </div>
                <span className="link-label">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {/* Earn Now Button Section */}
        <div className="earn-now-section">
          <button 
            className="earn-now-button"
            onClick={handleEarnNowClick}
          >
            <div className="earn-now-icon">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span className="earn-now-label">Earn Now</span>
            <div className="earn-now-glow"></div>
          </button>
        </div>
      </div>
    </>
  );
}

export default SideMenu;