'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import '../styles/SideMenu.css';
import api from '../config/api';

function SideMenu() {
  const pathname = usePathname();
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [activeLink, setActiveLink] = useState(pathname);

  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;

  const SaveSubscriptionStatusInLocalStorage = useCallback(async () => {
    if (!token) return;

    try {
      const response = await axios.get(`${api.Url}/user/subscription/status`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const isSubscribed = response.data?.isSubscribed || false;

      // ✅ STORE IN LOCAL STORAGE
      localStorage.setItem("subscribed", JSON.stringify( response.data));


    } catch (error) {
      console.error("Error checking subscription:", error);

      // Store false on fail
      localStorage.setItem("isSubscribed", "false");
    }
  }, [token]);

  useEffect(() => {
    SaveSubscriptionStatusInLocalStorage();
  }, [SaveSubscriptionStatusInLocalStorage]);

  const menuItems = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      )
    },
    {
      href: '/discover',
      label: 'Discover',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>
        </svg>
      )
    },
    {
      href: '/chatbox',
      label: 'Chat',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
      )
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      )
    }
  ];

  const handleEarnNowClick = () => {
    router.push('/referral');
  };

  return (
    <div 
      className={`side-menu-container ${isHovered ? 'expanded' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Logo Section */}
      <div className="logo-section">
        <div className="logo-wrapper">
          <Image 
            src='/heartechor.png' 
            alt='HeartEcho Logo' 
            className='side-menu-logo'
            width={80}
            height={64}
            priority
          />
        </div>
        
      </div>

      {/* Navigation Links */}
      <nav className="side-menu-nav">
        <div className="nav-items">
          {menuItems.map((item, index) => (
            <Link 
              key={item.href}
              className={`nav-link ${activeLink === item.href ? 'active' : ''}`}
              href={item.href}
              onClick={() => setActiveLink(item.href)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="link-content">
                <div className="icon-wrapper">
                  {item.icon}
                  <div className="active-dot"></div>
                </div>
                <span className="link-label">{item.label}</span>
              </div>
              <div className="link-highlight"></div>
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
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <span className="earn-now-label">Earn Now</span>
          <div className="earn-now-glow"></div>
        </button>
      </div>

      {/* Background Glow Effect */}
      <div className="menu-glow"></div>
    </div>
  );
}

export default SideMenu;