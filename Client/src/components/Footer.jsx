'use client';
import Link from 'next/link';
import Image from 'next/image';
import '../styles/Footer.css';

function Footer() {
  return (
    <footer className="footer-container">
      <div className="footer-content">
        <div className="brand-section">
          <div className="logo-container">
            <Image 
              src='/heartechor.png' 
              alt='HeartEcho AI Logo'
              width={48}
              height={48}
              className="logo"
            />
            <h2 className="logo-text">Heart<span>Echo</span></h2>
          </div>
          <p className="tagline">Your personalized AI companion experience</p>
          
          <div className="company-info">
            <p>Om Avcher Corp, Jalgaon Jamod</p>
            <p>Maharashtra, India</p>
          </div>

          {/* Email and Social Links */}
          <div className="contact-social-section">
            <div className="email-contact">
              <a href="mailto:heartecho.help@gmail.com" className="email-link">
                <span className="email-icon">✉</span>
                heartecho.help@gmail.com
              </a>
            </div>
            
            <div className="social-icons">
              <a href="https://instagram.com/heartechoai" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span className="social-icon-inner">📷</span>
                <span className="social-text">Instagram</span>
              </a>
              <a href="https://twitter.com/heartecho_ai" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span className="social-icon-inner">🐦</span>
                <span className="social-text">X (Twitter)</span>
              </a>
              <a href="https://facebook.com/heartecho.ai" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span className="social-icon-inner">📘</span>
                <span className="social-text">Facebook</span>
              </a>
              <a href="https://youtube.com/@heartechoai" target="_blank" rel="noopener noreferrer" className="social-icon">
                <span className="social-icon-inner">📺</span>
                <span className="social-text">YouTube</span>
              </a>
            </div>
          </div>
        </div>

        <div className="links-section">
          <div className="links-column">
            <h3 className="links-heading">Legal</h3>
            <Link href="/privacy" className="footer-link">
              <span className="link-text">Privacy Policy</span>
              <span className="link-arrow">→</span>
            </Link>
            <Link href="/terms" className="footer-link">
              <span className="link-text">Terms of Service</span>
              <span className="link-arrow">→</span>
            </Link>
            <Link href="/refund" className="footer-link">
              <span className="link-text">Refund Policy</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>

          <div className="links-column">
            <h3 className="links-heading">Company</h3>
            <Link href="/about" className="footer-link">
              <span className="link-text">About Us</span>
              <span className="link-arrow">→</span>
            </Link>
            <Link href="/contact" className="footer-link">
              <span className="link-text">Contact</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>

          <div className="links-column">
            <h3 className="links-heading">Resources</h3>
            <Link href="/faq" className="footer-link">
              <span className="link-text">FAQs</span>
              <span className="link-arrow">→</span>
            </Link>
            <Link href="/blog" className="footer-link">
              <span className="link-text">Blog</span>
              <span className="link-arrow">→</span>
            </Link>
            <Link href="/referral" className="footer-link">
              <span className="link-text">Referral Program</span>
              <span className="link-arrow">→</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © {new Date().getFullYear()} HeartEcho AI. All rights reserved.
        </p>
        <div className="footer-bottom-links">
          <Link href="/sitemap.xml" className="bottom-link">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}

export default Footer;