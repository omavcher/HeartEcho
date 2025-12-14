import React from 'react';

// --- Mocks for Next.js specific components to ensure this runs in the preview ---
const Link = ({ href, children, className }) => (
  <a href={href} className={className}>{children}</a>
);

const Image = ({ src, alt, width, height, className }) => (
  <img 
    src={src} 
    alt={alt} 
    width={width} 
    height={height} 
    className={className} 
    style={{ objectFit: 'contain' }} 
  />
);
// -----------------------------------------------------------------------------

// SVG Icons Component for cleaner code
const SocialIcon = ({ href, path, viewBox = "0 0 24 24", label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="social-icon-link" 
    aria-label={label}
  >
    <svg className="social-svg" viewBox={viewBox} fill="currentColor">
      {path}
    </svg>
  </a>
);

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <>
      <style>{`
        :root {
          --footer-bg: #050505;
          --footer-text-main: #ffffff;
          --footer-text-muted: #888888;
          --footer-accent: #cf4185;
          --footer-border: rgba(255, 255, 255, 0.05);
          --footer-social-bg: rgba(255, 255, 255, 0.08);
        }

        .footer-wrapper {
          background-color: var(--footer-bg);
          color: var(--footer-text-main);
          position: relative;
          width: 100%;
          border-top: 1px solid var(--footer-border);
          font-family: 'Inter', sans-serif;
        }

        /* Fancy Gradient Top Border */
        .footer-gradient-line {
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, 
            transparent 0%, 
            var(--footer-accent) 50%, 
            transparent 100%
          );
          opacity: 0.6;
        }

        .footer-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 3rem 1.5rem 2rem;
          display: grid;
          grid-template-columns: 1.5fr 2fr;
          gap: 3rem;
          align-items: start;
        }

        /* --- Brand Column --- */
        .footer-brand-col {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .footer-logo-group {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .footer-logo-img {
          width: 40px;
          height: 40px;
        }

        .footer-brand-name {
          font-family: 'Montserrat', sans-serif;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          margin: 0;
        }

        .footer-brand-name span {
          color: var(--footer-accent);
        }

        .footer-tagline {
          color: var(--footer-text-muted);
          line-height: 1.6;
          font-size: 0.95rem;
          max-width: 320px;
          margin: 0;
        }

        .footer-address {
          margin-top: 0.5rem;
          font-size: 0.9rem;
          color: var(--footer-text-muted);
          line-height: 1.4;
        }
        
        .footer-address p {
          margin: 0;
        }

        .footer-email-btn {
          display: inline-flex;
          align-items: center;
          gap: 0.75rem;
          margin-top: 1rem;
          padding: 0.75rem 1.25rem;
          border-radius: 50px;
          background: rgba(207, 65, 133, 0.1);
          border: 1px solid rgba(207, 65, 133, 0.2);
          color: #ff85b6;
          font-size: 0.9rem;
          text-decoration: none;
          width: fit-content;
          transition: all 0.3s ease;
        }

        .footer-email-btn:hover {
          background: rgba(207, 65, 133, 0.2);
          transform: translateX(5px);
        }

        /* --- Links Grid - Optimized for Mobile --- */
        .footer-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .footer-nav-col {
          display: flex;
          flex-direction: column;
        }

        .footer-col-title {
          font-family: 'Montserrat', sans-serif;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #fff;
          margin-top: 0;
        }

        .footer-nav-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.8rem;
        }

        .footer-nav-list li a {
          color: var(--footer-text-muted);
          text-decoration: none;
          font-size: 0.95rem;
          transition: color 0.2s ease;
        }

        .footer-nav-list li a:hover {
          color: var(--footer-accent);
          text-decoration: underline;
        }

        /* --- Bottom Bar --- */
        .footer-bottom-bar {
          border-top: 1px solid var(--footer-border);
          padding: 1.5rem;
          background-color: rgba(255,255,255,0.01);
        }

        .footer-bottom-content {
          max-width: 1200px;
          margin: 0 auto;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }

        .copyright-text {
          color: #666;
          font-size: 0.85rem;
          margin: 0;
        }

        .footer-socials {
          display: flex;
          gap: 1rem;
        }

        .social-icon-link {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: var(--footer-social-bg);
          color: #fff;
          transition: all 0.3s ease;
        }

        .social-icon-link:hover {
          background: var(--footer-accent);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(207, 65, 133, 0.4);
        }

        .social-svg {
          width: 20px;
          height: 20px;
        }

        /* --- Enhanced Responsive Breakpoints --- */

        /* Tablet */
        @media (max-width: 1024px) {
          .footer-content {
            grid-template-columns: 1fr;
            gap: 3rem;
            padding: 3rem 1.5rem 2rem;
          }
          
          .footer-brand-col {
            align-items: center;
            text-align: center;
          }

          .footer-links-grid {
            justify-content: center;
            text-align: center;
          }
        }

        /* Large Mobile */
        @media (max-width: 768px) {
          .footer-content {
            padding: 2.5rem 1.25rem 1.5rem;
            gap: 2.5rem;
          }

          .footer-links-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 2rem;
          }

          .footer-brand-col {
            gap: 1rem;
          }

          .footer-logo-group {
            justify-content: center;
          }

          .footer-brand-name {
            font-size: 1.35rem;
          }

          .footer-tagline {
            font-size: 0.9rem;
            max-width: 100%;
          }
        }

        /* Mobile */
        @media (max-width: 640px) {
          .footer-content {
            padding: 2rem 1rem 1.5rem;
            gap: 2rem;
          }

          .footer-links-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
            text-align: center;
          }

          .footer-nav-col {
            align-items: center;
          }

          .footer-col-title {
            margin-bottom: 1rem;
            font-size: 1.1rem;
          }

          .footer-nav-list {
            gap: 0.75rem;
          }

          .footer-nav-list li a {
            font-size: 0.9rem;
          }

          .footer-email-btn {
            width: 100%;
            justify-content: center;
            padding: 0.875rem 1.5rem;
            font-size: 0.95rem;
          }

          .footer-bottom-content {
            flex-direction: column-reverse;
            text-align: center;
            gap: 1.25rem;
          }

          .footer-socials {
            gap: 0.875rem;
          }

          .social-icon-link {
            width: 44px;
            height: 44px;
          }

          .social-svg {
            width: 22px;
            height: 22px;
          }

          .copyright-text {
            font-size: 0.8rem;
          }
        }

        /* Small Mobile */
        @media (max-width: 480px) {
          .footer-content {
            padding: 1.5rem 0.875rem 1rem;
            gap: 1.5rem;
          }

          .footer-logo-group {
            gap: 0.5rem;
          }

          .footer-logo-img {
            width: 36px;
            height: 36px;
          }

          .footer-brand-name {
            font-size: 1.25rem;
          }

          .footer-tagline {
            font-size: 0.85rem;
            line-height: 1.5;
          }

          .footer-address {
            font-size: 0.85rem;
          }

          .footer-links-grid {
            gap: 1.5rem;
          }

          .footer-col-title {
            font-size: 1rem;
            margin-bottom: 0.875rem;
          }

          .footer-nav-list {
            gap: 0.625rem;
          }

          .footer-bottom-bar {
            padding: 1rem 0.875rem;
          }

          .footer-socials {
            gap: 0.75rem;
          }

          .social-icon-link {
            width: 40px;
            height: 40px;
          }

          .social-svg {
            width: 20px;
            height: 20px;
          }
        }

        /* Extra Small Mobile */
        @media (max-width: 360px) {
          .footer-content {
            padding: 1.25rem 0.75rem 0.875rem;
          }

          .footer-links-grid {
            gap: 1.25rem;
          }

          .footer-socials {
            gap: 0.5rem;
          }

          .social-icon-link {
            width: 38px;
            height: 38px;
          }

          .social-svg {
            width: 18px;
            height: 18px;
          }
        }
      `}</style>

      <footer className="footer-wrapper">
        {/* Decorative Top Gradient Line */}
        <div className="footer-gradient-line"></div>

        <div className="footer-content">
          
          {/* Brand Column */}
          <div className="footer-brand-col">
            <div className="footer-logo-group">
              <Image 
                src='/heartechor.png' 
                alt='HeartEcho Logo'
                width={40}
                height={40}
                className="footer-logo-img"
              />
              <h2 className="footer-brand-name">Heart<span>Echo</span></h2>
            </div>
            
            <p className="footer-tagline">
              Your personalized AI companion. Experience deep emotional connections tailored to you.
            </p>

            <a href="mailto:heartecho.help@gmail.com" className="footer-email-btn">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
              <span>heartecho.help@gmail.com</span>
            </a>
          </div>

          {/* Links Grid - All columns in one row on desktop */}
          <div className="footer-links-grid">
            
            {/* Column 1: Legal */}
            <div className="footer-nav-col">
              <h3 className="footer-col-title">Legal</h3>
              <ul className="footer-nav-list">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/refund">Refund Policy</Link></li>
              </ul>
            </div>

            {/* Column 2: Company */}
            <div className="footer-nav-col">
              <h3 className="footer-col-title">Company</h3>
              <ul className="footer-nav-list">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact Support</Link></li>
                <li><Link href="/careers">Careers</Link></li>
              </ul>
            </div>

            {/* Column 3: Resources */}
            <div className="footer-nav-col">
              <h3 className="footer-col-title">Resources</h3>
              <ul className="footer-nav-list">
              <li><Link href="hot-stories">Hot Stories</Link></li>
                <li><Link href="/faq">FAQs</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/referral">Referral Program</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Social & Copyright Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-bottom-content">
            <p className="copyright-text">
              © {currentYear} HeartEcho AI. All rights reserved.
            </p>

            <div className="footer-socials">
              {/* Instagram */}
              <SocialIcon 
                label="Instagram"
                href="https://instagram.com/heartechoai" 
                path={<path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22H7.75A5.75 5.75 0 0 1 2 16.25V7.75A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25V7.75A4.25 4.25 0 0 0 16.25 3.5H7.75zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm0 1.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7zM18.75 5a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5z"/>} 
              />
              {/* X / Twitter */}
              <SocialIcon 
                label="X (Twitter)"
                href="https://twitter.com/heartecho_ai" 
                path={<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>} 
              />
              {/* Facebook */}
              <SocialIcon 
                label="Facebook"
                href="https://facebook.com/heartecho.ai" 
                path={<path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />} 
              />
              {/* YouTube */}
              <SocialIcon 
                label="YouTube"
                href="https://youtube.com/@heartechoai" 
                path={<path d="M21.582,5.193c-0.23-0.86-0.906-1.535-1.766-1.766C18.265,3.003,12,3,12,3S5.736,3.003,4.184,3.427 c-0.86,0.231-1.536,0.906-1.766,1.766C2.003,6.735,2,12,2,12s0.003,5.265,0.418,6.807c0.23,0.86,0.906,1.535,1.766,1.766 C5.736,20.997,12,21,12,21s6.265-0.003,7.816-0.427c0.86-0.23,1.535-0.906,1.766-1.766C21.997,17.265,22,12,22,12 S21.997,6.735,21.582,5.193z M9.75,15.25v-6.5L15.5,12L9.75,15.25z"/>} 
              />
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}