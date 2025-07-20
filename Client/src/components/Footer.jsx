'use client'; // Required for client-side features
import React from 'react';
import Link from 'next/link'; // Changed from react-router-dom
import Image from 'next/image'; // Using Next.js optimized Image component
import '../styles/Footer.css';

function Footer() {
  return (
    <>
      <div className='footer-main-container'>
        <div className='leftc-footter-contex'>
          <div className='leftr-logo'>
            <Image 
              src='/heartechor.png' 
              alt='HeartEcho AI Logo'
              width={40} // Add appropriate width
              height={40} // Add appropriate height
            />
            Heart<span>Echo</span>
          </div>

          <h6>Create Your Own AI Girlfriend – Smart, Personalized & Engaging</h6>
          <p>Secure & Private AI Conversations powered by advanced AI technology.</p>
          <p>Om Avcher Corp, Jalgaon Jamod, Maharashtra, India</p>
        </div>

        <div className='right-footer-nlings'>
          <span> 
            <Link className='footer-nav-sw' href='/refund'>Refund</Link>
            <Link className='footer-nav-sw' href='/privacy'>Privacy</Link>
          </span>

          <span> 
            <Link className='footer-nav-sw' href='/terms'>Terms of use</Link>
            <Link className='footer-nav-sw' href='/contact'>Contact us</Link>
          </span>

          <span> 
            <Link className='footer-nav-sw' href='/products'>Products</Link>
            <Link className='footer-nav-sw' href='/shipping'>Shipping</Link>
          </span>
        </div>
      </div>
      <h6 className='rights-h6'>© {new Date().getFullYear()} HeartEcho AI. All Rights Reserved.</h6>
    </>
  )
}

export default Footer;