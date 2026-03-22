'use client';

import { useEffect } from 'react';
import PropTypes from 'prop-types';
import SideMenu from "../components/SideMenu";
import MobileMenu from "../components/MobileMenu";
import './globals.css';

export default function ClientLayout({ children }) {
  useEffect(() => {
    // Check if current user is the developer
    let isDeveloper = false;
    try {
      const userData = localStorage.getItem('user');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        if (parsedUser.email === 'omawchar07@gmail.com') {
          isDeveloper = true;
        }
      }
    } catch (err) {
      console.error(err);
    }

    // If developer is logged in, bypass all restrictions!
    if (isDeveloper) return;

    // ─── STRICT SECURITY ENFORCEMENT FOR REGULAR USERS ───
    
    // 1. Disable right click
    const handleContextMenu = (e) => e.preventDefault();
    
    // 2. Disable DEV Tools & Source View shortcuts
    const handleKeyDown = (e) => {
      if (e.key === 'F12' || 
         (e.ctrlKey && e.shiftKey && ['I', 'i', 'J', 'j', 'C', 'c'].includes(e.key)) ||
         (e.ctrlKey && ['U', 'u', 'S', 's', 'P', 'p'].includes(e.key))) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // 3. DevTools freeze trap (If DevTools was already open before visiting, it halts execution)
    const devToolsTrap = setInterval(() => {
      debugger;
    }, 100);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      clearInterval(devToolsTrap);
    };
  }, []);
  return (
    <div className="main-layout-wrapper">
      
      {/* Desktop Sidebar - Hidden on mobile via CSS */}
      <div className="desktop-sidebar-wrapper">
        <SideMenu />
      </div>

      {/* Main Content */}
      <main className="main-content-wrapper">
        {children}
      </main>

      {/* Mobile Menu - Only shows on small screens via internal CSS of MobileMenu */}
      <div className="mobile-nav-wrapper lg:hidden">
        <MobileMenu />
      </div>

    </div>
  );
}

ClientLayout.propTypes = {
  children: PropTypes.node.isRequired,
};