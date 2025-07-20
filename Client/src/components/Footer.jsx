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
        </div>

        <div className="links-section">
          <div className="links-column">
            <h3 className="links-heading">Legal</h3>
            <Link href="/privacy" className="footer-link">Privacy Policy</Link>
            <Link href="/terms" className="footer-link">Terms of Service</Link>
            <Link href="/refund" className="footer-link">Refund Policy</Link>
          </div>

          <div className="links-column">
            <h3 className="links-heading">Company</h3>
            <Link href="/about" className="footer-link">About Us</Link>
            <Link href="/contact" className="footer-link">Contact</Link>
          </div>

          <div className="links-column">
            <h3 className="links-heading">Resources</h3>
            <Link href="/faq" className="footer-link">FAQs</Link>
            <Link href="/blog" className="footer-link">Blog</Link>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">
          © {new Date().getFullYear()} HeartEcho AI. All rights reserved.
        </p>
        <div className="social-links">
          <Link href="/sitemap.xml" className="social-icon">Sitemap</Link>
          {/* <Link href="#" className="social-icon">Instagram</Link>
          <Link href="#" className="social-icon">Discord</Link> */}
        </div>
      </div>
    </footer>
  );
}

export default Footer;