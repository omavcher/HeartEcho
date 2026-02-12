import React from 'react';

// --- Mocks for Next.js components (Replace with actual imports if needed) ---
const Link = ({ href, children, className, style }) => (
  <a href={href} className={className} style={style}>{children}</a>
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
    <footer className="seh-footer">
      <style>{`
        :root {
          --seh-bg: #000000;
          --seh-card: #0a0a0a;
          --seh-pink: #ce4085;
          --seh-pink-hover: #e05297;
          --seh-pink-muted: rgba(206, 64, 133, 0.15);
          --seh-border: rgba(255, 255, 255, 0.1);
          --seh-text: #ffffff;
          --seh-muted: #9ca3af;
        }

        .seh-footer {
          background-color: var(--seh-bg);
          color: var(--seh-text);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          position: relative;
          overflow: hidden;
          border-top: 1px solid var(--seh-border);
          width: 100%;
        }

        /* Top Accent Line */
        .seh-footer-line {
          height: 2px;
          width: 100%;
          background: linear-gradient(90deg, transparent, var(--seh-pink), transparent);
          opacity: 0.8;
          box-shadow: 0 0 15px var(--seh-pink);
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
          width: fit-content;
        }

        .seh-footer-logo-text {
          font-size: 1.8rem;
          font-weight: 800;
          letter-spacing: -0.5px;
          margin: 0;
          color: #fff;
          line-height: 1;
        }

        .seh-footer-logo-text span {
          color: var(--seh-pink);
        }

        .seh-footer-desc {
          color: var(--seh-muted);
          line-height: 1.6;
          font-size: 0.95rem;
          max-width: 320px;
          margin: 0;
        }

        /* Highlighted Feature - Hot Stories */
        .seh-hot-stories-nudge {
          background: var(--seh-pink-muted);
          border: 1px solid rgba(206, 64, 133, 0.3);
          padding: 14px 20px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: #fff;
          transition: all 0.3s ease;
          margin-top: 8px;
          max-width: 300px;
        }

        .seh-hot-stories-nudge:hover {
          background: rgba(206, 64, 133, 0.25);
          border-color: var(--seh-pink);
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0,0,0,0.3);
        }

        .seh-pulse-dot {
          width: 10px;
          height: 10px;
          background: #ff3b30;
          border-radius: 50%;
          box-shadow: 0 0 10px #ff3b30;
          animation: seh-pulse 2s infinite;
          flex-shrink: 0;
        }

        @keyframes seh-pulse {
          0% { transform: scale(0.95); opacity: 0.7; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(0.95); opacity: 0.7; }
        }

        .seh-hot-text {
          display: flex;
          flex-direction: column;
          line-height: 1.2;
        }

        .seh-hot-text b { color: #fff; font-size: 0.95rem; }
        .seh-hot-text small { color: var(--seh-pink); font-size: 0.75rem; font-weight: 500; margin-top: 2px; }

        /* Links Grid - Desktop Default */
        .seh-links-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .seh-link-col h4 {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 2px;
          color: #fff;
          margin-bottom: 1.5rem;
          font-weight: 700;
          opacity: 0.8;
        }

        .seh-link-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }

        .seh-link-list a {
          color: var(--seh-muted);
          text-decoration: none;
          font-size: 0.95rem;
          transition: all 0.2s ease;
          display: inline-block;
        }

        .seh-link-list a:hover {
          color: var(--seh-pink);
          transform: translateX(4px);
        }

        .seh-special-link {
          color: var(--seh-pink) !important;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 6px;
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
          flex-wrap: wrap;
          gap: 20px;
        }

        .seh-copy { 
          color: #666; 
          font-size: 0.85rem; 
          margin: 0;
        }

        .seh-social-grid {
          display: flex;
          gap: 12px;
        }

        .seh-social-link {
          width: 42px;
          height: 42px;
          border-radius: 12px;
          background: var(--seh-card);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          transition: 0.3s;
          border: 1px solid var(--seh-border);
        }

        .seh-social-link:hover {
          background: var(--seh-pink);
          border-color: var(--seh-pink);
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(206, 64, 133, 0.3);
        }

        .seh-social-link svg { width: 20px; height: 20px; }

        /* --- RESPONSIVE DESIGN --- */
        
        /* Tablet & Mobile Layout (Combined for consistency) */
        @media (max-width: 1024px) {
          .seh-footer-container {
            grid-template-columns: 1fr;
            gap: 3rem;
            padding: 3rem 1.5rem 2rem;
            text-align: center;
          }
          
          .seh-footer-brand {
            align-items: center;
            max-width: 100%;
            margin: 0 auto;
          }

          .seh-footer-desc {
            max-width: 400px;
          }

          /* FORCE ONE ROW FOR LINKS on Mobile/Tablet */
          .seh-links-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr); /* Keep 3 columns */
            gap: 10px; /* Tighter gap */
            width: 100%;
            text-align: center; /* Center align text */
          }

          /* Adjust headings for mobile row */
          .seh-link-col h4 {
            font-size: 11px; /* Smaller heading */
            letter-spacing: 1px;
            margin-bottom: 1rem;
            color: var(--seh-pink); /* Pink headings for contrast */
            opacity: 1;
          }

          /* Adjust link spacing for mobile row */
          .seh-link-list {
            gap: 10px;
          }

          .seh-link-list a {
            font-size: 11px; /* Smaller font for links */
            white-space: nowrap; /* Prevent wrapping if possible */
          }

          .seh-link-list a:hover {
            transform: none; /* Disable shift on touch */
            color: #fff;
          }
        }

        /* Smallest Screens adjustments */
        @media (max-width: 480px) {
          .seh-links-grid {
            gap: 5px; /* Extremely tight gap */
          }
          
          .seh-link-col h4 {
            font-size: 10px;
            margin-bottom: 0.8rem;
          }

          .seh-link-list a {
            font-size: 11px;
          }

          .seh-footer-bottom {
            flex-direction: column-reverse;
            padding-bottom: 6rem; /* Extra space for bottom nav if app uses one */
            gap: 1.5rem;
          }
          
          .seh-social-grid {
            justify-content: center;
          }
        }
      `}</style>

      <div className="seh-footer-line"></div>
      
      <div className="seh-footer-container">
        {/* Brand Info */}
        <div className="seh-footer-brand">
          <Link href="/" className="seh-footer-logo-wrap">
            <Image 
              src='/heartechor.png' 
              alt='HeartEcho'
              width={40} 
              height={40}
            />
            <h2 className="seh-footer-logo-text">Heart<span>Echo</span></h2>
          </Link>
          
          <p className="seh-footer-desc">
            Your personalized AI companion. Experience deep emotional connections and intimate conversations tailored to your desires.
          </p>

          {/* Feature Highlight Button */}
          <Link href="/hot-stories" className="seh-hot-stories-nudge">
            <span className="seh-pulse-dot"></span>
            <div className="seh-hot-text">
              <b>200+ Hot Stories</b>
              <small>Updated daily • Exclusive access</small>
            </div>
          </Link>
        </div>

        {/* Links Grid - FORCED 3 COLS ON MOBILE */}
        <div className="seh-links-grid">
          <div className="seh-link-col">
            <h4>Legal</h4>
            <ul className="seh-link-list">
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/terms">Terms</Link></li>
              <li><Link href="/refund">Refund</Link></li>
            </ul>
          </div>

          <div className="seh-link-col">
            <h4>Support</h4>
            <ul className="seh-link-list">
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact">Contact</Link></li>
              <li><Link href="mailto:heartecho.help@gmail.com">Email</Link></li>
            </ul>
          </div>

          <div className="seh-link-col">
            <h4>Explore</h4>
            <ul className="seh-link-list">
              <li><Link href="/hot-stories" className="seh-special-link">Stories</Link></li>
              <li><Link href="/subscribe" style={{color: '#ce4085', fontWeight: 'bold'}}>Join VIP</Link></li>
              <li><Link href="/blog">Blog</Link></li>
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
  path={
    <>
      <rect width="24" height="24" rx="6" ry="6" fill="currentColor" opacity="0.1"/>
      <path 
        d="M16.98 2H7.02A5.02 5.02 0 0 0 2 7.02v9.96A5.02 5.02 0 0 0 7.02 22h9.96A5.02 5.02 0 0 0 22 16.98V7.02A5.02 5.02 0 0 0 16.98 2ZM12 17.5A5.5 5.5 0 1 1 17.5 12 5.51 5.51 0 0 1 12 17.5Zm5.75-10.25a1.25 1.25 0 1 1 1.25-1.25 1.25 1.25 0 0 1-1.25 1.25Z"
        fill="currentColor"
      />
      <circle cx="12" cy="12" r="3" fill="currentColor"/>
    </>
  }
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
  );
}