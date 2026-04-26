'use client';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import api from '../config/api';
import './SideMenu.css'

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
  const [country, setCountry] = useState('IN');

  useEffect(() => {
    const savedCountry = localStorage.getItem('user_country');
    if (savedCountry) setCountry(savedCountry);
  }, []);

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
      href: '/live-a-story',
      label: 'Live Story',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M16 4C16 2.89543 16.8954 2 18 2C19.1046 2 20 2.89543 20 4V20C20 21.1046 19.1046 22 18 22C16.8954 22 16 21.1046 16 20V4ZM4 8C4 6.89543 4.89543 6 6 6C7.10457 6 8 6.89543 8 8V16C8 17.1046 7.10457 18 6 18C4.89543 18 4 17.1046 4 16V8ZM10 11C10 9.89543 10.8954 9 12 9C13.1046 9 14 9.89543 14 11V18C14 19.1046 13.1046 20 12 20C10.8954 20 10 19.1046 10 18V11Z"/></svg>
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
  ].filter(item => {
    // Hide Live Story for non-India users
    if (item.href === '/live-a-story' && country !== 'IN') return false;
    return true;
  });


  return (
    <>
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
            {menuItems.map((item) => {
              const isLiveStory = item.href === '/live-a-story';
              const isActive = isLiveStory
                ? (activeLink === item.href || activeLink.startsWith(item.href + '/'))
                : activeLink === item.href;
              return (
              <Link 
                key={item.href}
                href={item.href}
                className={`nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setActiveLink(item.href)}
              >
                <div className="icon-wrapper">
                  {item.icon}
                </div>
                <span className="link-label">{item.label}</span>
              </Link>
              );
            })}
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