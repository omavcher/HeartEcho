'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import '../styles/NotFound.css'

function NotFound() {
  const router = useRouter();

  return (
    <div className="ej3n-simple-notfound">
      <div className="ej3n-simple-container">
        <div className="ej3n-simple-content">
          <div className="ej3n-simple-logo">
            <img src="/heartechor.png" alt="HeartEcho" />
            <h2>HeartEcho</h2>
          </div>
          
          <h1 className="ej3n-simple-title">404</h1>
          <h2 className="ej3n-simple-subtitle">Page Not Found</h2>
          <p className="ej3n-simple-text">
            The page you're looking for might have been removed, had its name changed,
            or is temporarily unavailable.
          </p>
          
          <div className="ej3n-simple-actions">
            <button 
              onClick={() => router.back()} 
              className="ej3n-simple-btn ej3n-simple-btn-primary"
            >
              Go Back
            </button>
            <Link href="/" className="ej3n-simple-btn ej3n-simple-btn-secondary">
              Return Home
            </Link>
          </div>
        </div>
        
        <p className="ej3n-simple-footer">
          © {new Date().getFullYear()} HeartEcho AI
        </p>
      </div>
    </div>
  );
}

export default NotFound;