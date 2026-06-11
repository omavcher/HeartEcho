'use client';
import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import '../styles/PopNoti.css';

function PopNoti({ message, type = 'info', isVisible, onClose, duration = 5000 }) {
  const [isHovered, setIsHovered] = useState(false);

  const timerRef = useRef(null);
  const remainingTimeRef = useRef(duration);
  const lastActiveTimeRef = useRef(null);
  const hasClosedRef = useRef(false);

  // Reset timer configuration when isVisible triggers true
  useEffect(() => {
    if (isVisible) {
      remainingTimeRef.current = duration;
      lastActiveTimeRef.current = Date.now();
      hasClosedRef.current = false;
    }
  }, [isVisible, duration]);

  // Handle countdown with pause/resume on hover
  useEffect(() => {
    if (!isVisible) return;

    if (isHovered) {
      // Pause: clear timeout and subtract elapsed time
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      if (lastActiveTimeRef.current) {
        const elapsed = Date.now() - lastActiveTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
    } else {
      // Resume: start timeout for remaining time
      lastActiveTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        if (!hasClosedRef.current) {
          hasClosedRef.current = true;
          onClose();
        }
      }, remainingTimeRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isVisible, isHovered, onClose]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 8V12M12 16H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 9V11M12 15H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      default: // info
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 16V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" 
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'success': return 'Success';
      case 'error': return 'Error';
      case 'warning': return 'Warning';
      default: return 'Information';
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -100, scale: 0.9 }}
          transition={{
            type: "spring",
            damping: 25,
            stiffness: 400
          }}
          className={`pop-noti ${type}`}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          role="alert"
          aria-live="polite"
        >
          {/* Progress Bar */}
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{
                transformOrigin: 'left',
                animationName: isVisible ? 'popNotiProgress' : 'none',
                animationDuration: `${duration}ms`,
                animationTimingFunction: 'linear',
                animationFillMode: 'forwards',
                animationPlayState: isHovered ? 'paused' : 'running'
              }}
            />
          </div>

          <div className="notification-content">
            <div className="notification-icon">
              {getIcon()}
            </div>
            
            <div className="notification-text">
              <div className="notification-title">
                {getTitle()}
              </div>
              <div className="notification-message">
                {message}
              </div>
            </div>

            <button 
              onClick={onClose} 
              className="close-btn"
              aria-label="Close notification"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default PopNoti;