'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

function MobileMenu() {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setActiveItem(pathname);
    // Small delay for entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, [pathname]);

  const menuItems = [
    {
      href: '/',
      label: 'Home',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 20C21 20.5523 20.5523 21 20 21H4C3.44772 21 3 20.5523 3 20V9.48907C3 9.18048 3.14247 8.88917 3.38606 8.69972L11.3861 2.47749C11.7472 2.19663 12.2528 2.19663 12.6139 2.47749L20.6139 8.69972C20.8575 8.88917 21 9.18048 21 9.48907V20Z"></path>
        </svg>
      )
    },
    {
      href: '/discover',
      label: 'Friends', // Updated label to match your previous request
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17 2H13V1H11V2H7C5.34315 2 4 3.34315 4 5V8C4 10.7614 6.23858 13 9 13H15C17.7614 13 20 10.7614 20 8V5C20 3.34315 18.6569 2 17 2ZM11 7.5C11 8.32843 10.3284 9 9.5 9C8.67157 9 8 8.32843 8 7.5C8 6.67157 8.67157 6 9.5 6C10.3284 6 11 6.67157 11 7.5ZM16 7.5C16 8.32843 15.3284 9 14.5 9C13.6716 9 13 8.32843 13 7.5C13 6.67157 13.6716 6 14.5 6C15.3284 6 16 6.67157 16 7.5ZM4 22C4 17.5817 7.58172 14 12 14C16.4183 14 20 17.5817 20 22H4Z"></path>
        </svg>
      )
    },
    {
      href: '/chatbox',
      label: 'Chat',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M6.45455 19L2 22.5V4C2 3.44772 2.44772 3 3 3H21C21.5523 3 22 3.44772 22 4V18C22 18.5523 21.5523 19 21 19H6.45455Z"></path>
        </svg>
      )
    },
    {
      href: '/profile',
      label: 'Profile',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 22H4V20C4 17.2386 6.23858 15 9 15H15C17.7614 15 20 17.2386 20 20V22ZM12 13C8.68629 13 6 10.3137 6 7C6 3.68629 8.68629 1 12 1C15.3137 1 18 3.68629 18 7C18 10.3137 15.3137 13 12 13Z"></path>
        </svg>
      )
    }
  ];

  const styles = `
    /* Container */
    .mobile-menu-container {
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      z-index: 1000;
      padding-bottom: env(safe-area-inset-bottom);
      background: rgba(9, 9, 11, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      transform: translateY(100%);
      transition: transform 0.5s cubic-bezier(0.32, 0.72, 0, 1);
    }

    .mobile-menu-container.visible {
      transform: translateY(0);
    }

    /* Navigation Grid */
    .mobile-nav {
      display: flex;
      justify-content: space-around;
      align-items: center;
      height: 70px; /* Comfortable height */
      position: relative;
    }

    /* Nav Item */
    .nav-item {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-decoration: none;
      width: 64px;
      height: 100%;
      color: rgba(255, 255, 255, 0.5);
      transition: all 0.3s ease;
      -webkit-tap-highlight-color: transparent;
    }

    /* Icon Styling */
    .icon-box {
      position: relative;
      width: 26px;
      height: 26px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
      margin-bottom: 4px;
    }

    .nav-item svg {
      width: 24px;
      height: 24px;
      fill: currentColor;
    }

    /* Label Styling */
    .nav-label {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 10px;
      font-weight: 500;
      letter-spacing: 0.2px;
      opacity: 0.7;
      transition: all 0.3s ease;
    }

    /* ACTIVE STATE */
    .nav-item.active {
      color: #fff;
    }

    .nav-item.active .icon-box {
      transform: translateY(-2px);
    }

    .nav-item.active svg {
      filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.4));
    }

    .nav-item.active .nav-label {
      opacity: 1;
      font-weight: 600;
    }

    /* Active Indicator Dot */
    .active-dot {
      position: absolute;
      top: -1px; /* Floating above */
      width: 30px;
      height: 2px;
      background: linear-gradient(90deg, transparent, #fff, transparent);
      border-radius: 4px;
      opacity: 0;
      transform: scaleX(0);
      transition: all 0.4s ease;
      box-shadow: 0 2px 10px rgba(255, 255, 255, 0.5);
    }

    .nav-item.active .active-dot {
      opacity: 1;
      transform: scaleX(1);
    }

    /* Touch Feedback (Ripple/Scale) */
    .nav-item:active .icon-box {
      transform: scale(0.9);
    }

    /* Media Query for iPhone Home Bar Area */
    @media (min-height: 800px) {
      .mobile-nav {
        height: 65px;
        padding-bottom: 5px;
      }
    }

    /* Tablet/Desktop Hide */
    @media (min-width: 768px) {
      .mobile-menu-container {
        display: none;
      }
    }
  `;

  return (
    <>
      <style jsx>{styles}</style>
      <div className={`mobile-menu-container ${isVisible ? 'visible' : ''}`}>
        <nav className="mobile-nav">
          {menuItems.map((item) => {
            const isActive = activeItem === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`nav-item ${isActive ? 'active' : ''}`}
                onClick={() => setActiveItem(item.href)}
              >
                <div className="active-dot"></div>
                <div className="icon-box">
                  {item.icon}
                </div>
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}

export default MobileMenu;