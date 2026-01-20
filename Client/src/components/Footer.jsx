import React from 'react';

// --- Mocks for Next.js components ---
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

const SocialIcon = ({ href, path, label }) => (
  <a 
    href={href} 
    target="_blank" 
    rel="noopener noreferrer" 
    className="seh-social-link" 
    aria-label={label}
  >
    <svg viewBox="0 0 24 24" fill="currentColor">
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
          --seh-bg: #000000;
          --seh-pink: #ce4085;
          --seh-pink-muted: rgba(206, 64, 133, 0.1);
          --seh-border: rgba(255, 255, 255, 0.08);
          --seh-text: #ffffff;
          --seh-muted: #888888;
        }

        .seh-footer {
          background-color: var(--seh-bg);
          color: var(--seh-text);
          font-family: 'Inter', -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          border-top: 1px solid var(--seh-border);
        }

        /* Top Accent Line */
        .seh-footer-line {
          height: 1px;
          width: 100%;
          background: linear-gradient(90deg, transparent, var(--seh-pink), transparent);
          opacity: 0.5;
        }

        .seh-footer-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 4rem 1.5rem 3rem;
          display: grid;
          grid-template-columns: 1.2fr 2fr;
          gap: 4rem;
        }

        /* Brand Section */
        .seh-footer-brand {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .seh-footer-logo-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
        }

        .seh-footer-logo-text {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: -1px;
          margin: 0;
          color: #fff;
        }

        .seh-footer-logo-text span {
          color: var(--seh-pink);
        }

        .seh-footer-desc {
          color: var(--seh-muted);
          line-height: 1.6;
          font-size: 0.95rem;
          max-width: 300px;
        }

        /* Highlighted Feature - Hot Stories */
        .seh-hot-stories-nudge {
          background: var(--seh-pink-muted);
          border: 1px solid rgba(206, 64, 133, 0.2);
          padding: 12px 20px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          color: #fff;
          transition: 0.3s;
          margin-top: 10px;
        }

        .seh-hot-stories-nudge:hover {
          background: rgba(206, 64, 133, 0.2);
          transform: translateY(-2px);
        }

        .seh-pulse-dot {
          width: 8px;
          height: 8px;
          background: #ff3b30;
          border-radius: 50%;
          box-shadow: 0 0 8px #ff3b30;
          animation: seh-pulse 2s infinite;
        }

        @keyframes seh-pulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }

        .seh-hot-text b { color: var(--seh-pink); }
        .seh-hot-text small { display: block; font-size: 0.75rem; opacity: 0.6; }

        /* Links Grid */
        .seh-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .seh-link-col h4 {
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1.5px;
          color: #fff;
          margin-bottom: 1.5rem;
          font-weight: 700;
        }

        .seh-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .seh-link-list a {
          color: var(--seh-muted);
          text-decoration: none;
          font-size: 0.9rem;
          transition: 0.2s;
        }

        .seh-link-list a:hover {
          color: var(--seh-pink);
          padding-left: 4px;
        }

        .seh-special-link {
          color: var(--seh-pink) !important;
          font-weight: 700;
        }

        /* Bottom Bar */
        .seh-footer-bottom {
          border-top: 1px solid var(--seh-border);
          padding: 2rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          max-width: 1200px;
          margin: 0 auto;
        }

        .seh-copy { color: #555; font-size: 0.85rem; }

        .seh-social-grid {
          display: flex;
          gap: 15px;
        }

        .seh-social-link {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #111;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: 0.3s;
          border: 1px solid #222;
        }

        .seh-social-link:hover {
          background: var(--seh-pink);
          border-color: var(--seh-pink);
          transform: translateY(-50%);
          box-shadow: 0 5px 15px rgba(206, 64, 133, 0.4);
        }

        .seh-social-link svg { width: 18px; height: 18px; }

        /* --- MOBILE RESPONSIVENESS --- */
        @media (max-width: 900px) {
          .seh-footer-container {
            grid-template-columns: 1fr;
            text-align: center;
            padding-top: 3rem;
          }
          .seh-footer-brand { align-items: center; }
          .seh-footer-logo-wrap { justify-content: center; }
          .seh-footer-desc { max-width: 100%; }
          .seh-links-grid { grid-template-columns: repeat(2, 1fr); text-align: left; }
        }

        @media (max-width: 600px) {
          .seh-links-grid { grid-template-columns: 1fr; text-align: center; gap: 3rem; }
          .seh-footer-bottom { flex-direction: column-reverse; gap: 1.5rem; text-align: center; }
          .seh-social-grid { width: 100%; justify-content: center; }
          .seh-hot-stories-nudge { width: 100%; justify-content: center; }
        }

        @media (max-width: 400px) {
           .seh-footer-logo-text { font-size: 1.3rem; }
           .seh-footer-container { padding: 2rem 1rem; }
        }
      `}</style>

      <footer className="seh-footer">
        <div className="seh-footer-line"></div>
        
        <div className="seh-footer-container">
          {/* Brand Info */}
          <div className="seh-footer-brand">
            <Link href="/" className="seh-footer-logo-wrap">
              <Image 
                src='/heartechor.png' 
                alt='HeartEcho'
                width={36} height={36}
              />
              <h2 className="seh-footer-logo-text">Heart<span>Echo</span></h2>
            </Link>
            
            <p className="seh-footer-desc">
              Your personalized AI companion. Experience deep emotional connections and intimate conversations tailored to your desires.
            </p>

            {/* PSYCHOLOGICAL TRIGGER: The "Main Attraction" nudge */}
            <Link href="/hot-stories" className="seh-hot-stories-nudge">
              <span className="seh-pulse-dot"></span>
              <div className="seh-hot-text">
                <b>200+ Hot Stories</b>
                <small>Updated daily • Exclusive access</small>
              </div>
            </Link>
          </div>

          {/* Links Grid */}
          <div className="seh-links-grid">
            <div className="seh-link-col">
              <h4>Legal</h4>
              <ul className="seh-link-list">
                <li><Link href="/privacy">Privacy Policy</Link></li>
                <li><Link href="/terms">Terms of Service</Link></li>
                <li><Link href="/refund">Refund Policy</Link></li>
              </ul>
            </div>

            <div className="seh-link-col">
              <h4>Support</h4>
              <ul className="seh-link-list">
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/contact">Contact Support</Link></li>
                <li><Link href="mailto:heartecho.help@gmail.com" className="seh-special-link">Help Email</Link></li>
              </ul>
            </div>

            <div className="seh-link-col">
              <h4>Explore</h4>
              <ul className="seh-link-list">
                <li><Link href="/hot-stories" className="seh-special-link">🔥 Hot Stories</Link></li>
                <li><Link href="/faq">FAQs</Link></li>
                <li><Link href="/referral">Referral Program</Link></li>
                <li><Link href="/blog">Our Blog</Link></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="seh-footer-bottom">
          <p className="seh-copy">
            © {currentYear} HeartEcho AI. 18+ Only.
          </p>

          <div className="seh-social-grid">
            <SocialIcon 
              label="Instagram"
              href="https://instagram.com/heartechoai" 
              path={<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>} 
            />
            <SocialIcon 
              label="X"
              href="https://twitter.com/heartecho_ai" 
              path={<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>} 
            />
            <SocialIcon 
              label="YouTube"
              href="https://youtube.com/@heartechoai" 
              path={<path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>} 
            />
          </div>
        </div>
      </footer>
    </>
  );
}