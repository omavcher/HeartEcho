// app/layout.client.js
'use client';

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import SideMenu from "../components/SideMenu";
import MobileMenu from "../components/MobileMenu";
import './globals.css';

export default function ClientLayout({ children }) {
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 1024);
      };

      handleResize();
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  return (
    <div className="main-container-d min-h-screen flex justify-center items-center bg-gray-100">
      {!isMobile && <SideMenu />}
      <div className="mainx-swdeer">
        {children}
      </div>
      {isMobile && <MobileMenu />}
    </div>
  );
}
