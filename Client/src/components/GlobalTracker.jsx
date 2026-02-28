'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import api from '../config/api';

export default function GlobalTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const sessionRef = useRef(null);
  const queueRef = useRef([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      let trkSessionId = localStorage.getItem('trk_sessionId');
      if (!trkSessionId) {
        trkSessionId = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now();
        localStorage.setItem('trk_sessionId', trkSessionId);
      }
      sessionRef.current = trkSessionId;
    }
  }, []);

  const sendQueue = () => {
    if (queueRef.current.length === 0) return;
    const events = [...queueRef.current];
    queueRef.current = [];
    
    const userDataStr = localStorage.getItem('user');
    let userId = null;
    if (userDataStr && userDataStr !== "undefined") {
      try {
        const u = JSON.parse(userDataStr);
        userId = u._id || u.id;
      } catch(e) {}
    }

    events.forEach(ev => ev.userId = userId);

    const apiUrl = typeof window !== 'undefined' ? `${api.Url}/tracking/record` : 'http://localhost:5000/api/v1/api/tracking/record';

    fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
      keepalive: true
    }).catch(err => {
      // Re-queue on fail
      queueRef.current = [...events, ...queueRef.current];
    });
  };

  const trackEvent = (eventType, eventData = {}) => {
    if (typeof window === 'undefined' || !sessionRef.current) return;
    
    try {
      const userStr = localStorage.getItem('user');
      if (userStr && userStr !== "undefined") {
        const userObj = JSON.parse(userStr);
        if (userObj?.email === 'omawchar07@gmail.com') return; // Do not track admin
      }
    } catch(e) {}

    let storedUtms = {};
    try {
      const utmStr = localStorage.getItem('trk_utms');
      if (utmStr) storedUtms = JSON.parse(utmStr);
    } catch(e) {}

    queueRef.current.push({
      sessionId: sessionRef.current,
      eventType,
      path: window.location.pathname,
      url: window.location.href,
      referrer: document.referrer,
      deviceType: /Mobile|Android|iP(ad|hone)/.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      eventData: Object.freeze({ ...storedUtms, ...eventData }),
      timestamp: Date.now()
    });

    if (queueRef.current.length >= 5 || ['subscription_checkout', 'signup_complete', 'important_action'].includes(eventType)) {
      sendQueue();
    }
  };

  useEffect(() => {
    const interval = setInterval(sendQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  // Save UTMs if present
  useEffect(() => {
    if (typeof window !== 'undefined' && searchParams) {
      const currentUtms = {};
      searchParams.forEach((value, key) => {
        if (key.startsWith('utm_') || key === 'fbclid') {
          currentUtms[key] = value;
        }
      });
      
      if (Object.keys(currentUtms).length > 0) {
        // Merge with existing ones if any, favoring newer ones
        let existingUtms = {};
        try {
          const str = localStorage.getItem('trk_utms');
          if (str) existingUtms = JSON.parse(str);
        } catch(e){}
        
        localStorage.setItem('trk_utms', JSON.stringify({ ...existingUtms, ...currentUtms }));
      }
    }
  }, [searchParams]);

  // Track Page views
  useEffect(() => {
    if (typeof window !== 'undefined' && sessionRef.current) {
      trackEvent('page_view', { query: searchParams ? searchParams.toString() : '' });
    }
  }, [pathname, searchParams]);

  // Global click listener for key UI elements
  // We'll specifically look for funnel elements
  useEffect(() => {
    const handleClick = (e) => {
      const target = e.target.closest('button, a, [role="button"]');
      if (target) {
        let text = target.innerText?.slice(0, 50)?.trim() || target.title || target.ariaLabel || 'unknown';
        const id = target.id || '';
        const className = typeof target.className === 'string' ? target.className : '';
        
        let evtType = 'click';
        // Categorize special clicks
        if (text.toLowerCase().includes('subscribe') || text.toLowerCase().includes('plan') || text.toLowerCase().includes('buy')) {
          evtType = 'funnel_click';
        }

        trackEvent(evtType, { text, id, className, tagName: target.tagName });
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  // Flush on unload
  useEffect(() => {
    const handleUnload = () => sendQueue();
    window.addEventListener('beforeunload', handleUnload);
    return () => window.removeEventListener('beforeunload', handleUnload);
  }, []);

  // Expose globally for manual funnel triggers
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.trackAppEvent = trackEvent;
    }
  });

  return null;
}
