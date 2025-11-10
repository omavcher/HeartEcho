'use client';

import { useEffect, useState } from 'react';
import './Loader.css';

const AdvancedLoader = ({ 
  variant = 'spinner',
  size = 'large',
  color = 'primary',
  text = 'Loading...',
  showText = true,
  overlay = false,
  fullScreen = false
}) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 50);

    return () => clearTimeout(timer);
  }, []);

  const renderLoader = () => {
    switch (variant) {
      case 'wave':
        return (
          <div className="loader-wave-k3dn9a">
            {[1, 2, 3, 4, 5].map(i => (
              <div 
                key={i}
                className={`wave-dot-k3dn9a spinner-${color}-k3dn9a`}
              />
            ))}
          </div>
        );
      
      case 'skeleton':
        return (
          <div className="skeleton-loader-k3dn9a">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="skeleton-line-k3dn9a" />
            ))}
          </div>
        );
      
      case 'spinner':
      default:
        return (
          <div className={`spinner-k3dn9a spinner-${color}-k3dn9a`}>
            <div className="spinner-ring-k3dn9a spinner-ring-1-k3dn9a"></div>
            <div className="spinner-ring-k3dn9a spinner-ring-2-k3dn9a"></div>
            <div className="spinner-ring-k3dn9a spinner-ring-3-k3dn9a"></div>
            <div className="spinner-center-k3dn9a"></div>
          </div>
        );
    }
  };

  return (
    <div className={`
      loader-container-k3dn9a 
      ${overlay ? 'loader-overlay-k3dn9a' : ''}
      ${fullScreen ? 'loader-fullscreen-k3dn9a' : ''}
      ${isVisible ? 'visible-k3dn9a' : ''}
    `}>
      <div className={`loader-wrapper-k3dn9a loader-${size}-k3dn9a`}>
        {renderLoader()}
        
        {showText && variant !== 'skeleton' && (
          <div className="loader-text-k3dn9a">
            <span className="loading-dots-k3dn9a">
              {text}
              <span className="dot-k3dn9a">.</span>
              <span className="dot-k3dn9a">.</span>
              <span className="dot-k3dn9a">.</span>
            </span>
          </div>
        )}

        <div className="loader-glow-k3dn9a"></div>
      </div>
    </div>
  );
};

export default AdvancedLoader;