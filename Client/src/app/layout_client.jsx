'use client';

import PropTypes from 'prop-types';
import SideMenu from "../components/SideMenu";
import MobileMenu from "../components/MobileMenu";
import './globals.css';

export default function ClientLayout({ children }) {
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