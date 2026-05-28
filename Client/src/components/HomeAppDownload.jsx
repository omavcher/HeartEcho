'use client';

import React, { useEffect, useState } from 'react';
import '../styles/HomeAppDownload.css';

export default function HomeAppDownload() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'bot', text: 'Hey there! ❤️ Did you check out our new Android app?' },
    { id: 2, sender: 'user', text: 'Not yet! Is it better than the website?' },
    { id: 3, sender: 'bot', text: 'Absolutely! It has instant push notifications and super smooth voice notes! 🚀' }
  ]);

  const [activeMessageIndex, setActiveMessageIndex] = useState(0);

  useEffect(() => {
    // Cycle messages visibility in the mockup for animation
    const interval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % (messages.length + 1));
    }, 3000);
    return () => clearInterval(interval);
  }, [messages.length]);

  return (
    <section className="had-section-u9d8z" aria-label="Download App">
      <div className="had-container-u9d8z">
        {/* Left Side: Information and CTAs */}
        <div className="had-info-col-u9d8z">
          <div className="had-badge-u9d8z">
            <span className="had-badge-dot-u9d8z"></span>
            Official Android App
          </div>
          <h2 className="had-title-u9d8z">
            HeartEcho is now on <span className="had-highlight-u9d8z">Google Play</span>
          </h2>
          <p className="had-desc-u9d8z">
            Take your AI companion wherever you go. Enjoy an immersive, uninterrupted relationship with faster speeds, native features, and 100% private chats.
          </p>

          <ul className="had-benefits-u9d8z">
            <li className="had-benefit-item-u9d8z">
              <div className="had-benefit-icon-u9d8z">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="had-benefit-text-u9d8z">
                <h4>10x Faster Response Times</h4>
                <p>Native app architecture speeds up API requests for seamless real-time conversations.</p>
              </div>
            </li>
            <li className="had-benefit-item-u9d8z">
              <div className="had-benefit-icon-u9d8z">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <div className="had-benefit-text-u9d8z">
                <h4>Instant Push Notifications</h4>
                <p>Never miss a message or voice note from your companion with real-time mobile alerts.</p>
              </div>
            </li>
            <li className="had-benefit-item-u9d8z">
              <div className="had-benefit-icon-u9d8z">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="had-benefit-text-u9d8z">
                <h4>Enhanced Privacy Lock</h4>
                <p>Protect your chats with biometrics or custom PIN locks built directly into the app.</p>
              </div>
            </li>
          </ul>

          <div className="had-cta-wrapper-u9d8z">
            <a
              href="https://play.google.com/store/apps/details?id=com.heartecho.ai"
              target="_blank"
              rel="noopener noreferrer"
              className="had-playstore-btn-u9d8z"
            >
              <svg className="had-playstore-logo-u9d8z" viewBox="0 0 512 512" width="28" height="28">
                <path fill="#4285F4" d="M12 28.5c-2.4 2.4-3.7 6-3.7 10.1v434.7c0 4.1 1.3 7.7 3.7 10.1l2.4 2.4L266 274.5v-6.2L14.4 26.1l-2.4 2.4z" />
                <path fill="#EA4335" d="M349.5 358.2l-83.5-83.7v-6.2l83.5-83.7 2.7 1.5 98.7 57c28.1 16.2 28.1 42.7 0 59l-98.7 57.1-2.7-1z" />
                <path fill="#FBBC05" d="M266 268.3L12 12c4-2 9.5-2.2 15.6 1.3l321.9 185.3 2.7 1.5-83.5 83.7-2.7-1.5z" />
                <path fill="#34A853" d="M266 280.7l83.5 83.7-2.7 1.5-321.9 185.3c-6.1 3.5-11.6 3.3-15.6 1.3L266 280.7z" />
              </svg>
              <div className="had-btn-text-u9d8z">
                <span className="had-btn-sub-u9d8z">GET IT ON</span>
                <span className="had-btn-main-u9d8z">Google Play</span>
              </div>
            </a>
            <span className="had-cta-note-u9d8z">Android 7.0+ supported</span>
          </div>
        </div>

        {/* Right Side: Interactive CSS Phone Mockup */}
        <div className="had-visual-col-u9d8z">
          <div className="had-phone-mockup-u9d8z">
            {/* Speaker & Camera Notch */}
            <div className="had-phone-notch-u9d8z">
              <span className="had-notch-speaker-u9d8z"></span>
              <span className="had-notch-camera-u9d8z"></span>
            </div>

            {/* App Screen Inside Phone */}
            <div className="had-phone-screen-u9d8z">
              {/* App Status Bar */}
              <div className="had-app-statusbar-u9d8z">
                <span className="had-app-time-u9d8z">09:41</span>
                <div className="had-app-icons-u9d8z">
                  <span className="had-sig-icon-u9d8z">📶</span>
                  <span className="had-bat-icon-u9d8z">🔋</span>
                </div>
              </div>

              {/* App Header */}
              <div className="had-app-header-u9d8z">
                <div className="had-avatar-wrapper-u9d8z">
                  <div className="had-avatar-u9d8z">
                    {/* Placeholder image representation */}
                    <span className="had-avatar-dot-active-u9d8z"></span>
                  </div>
                  <div className="had-header-info-u9d8z">
                    <span className="had-companion-name-u9d8z">Priya (AI Girlfriend)</span>
                    <span className="had-companion-status-u9d8z">Online</span>
                  </div>
                </div>
                <div className="had-header-actions-u9d8z">
                  <span>📞</span>
                  <span>⭐</span>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="had-chat-body-u9d8z">
                {messages.map((msg, index) => {
                  const isVisible = activeMessageIndex === 0 || index < activeMessageIndex;
                  return (
                    <div
                      key={msg.id}
                      className={`had-msg-row-u9d8z ${msg.sender === 'user' ? 'had-msg-user-u9d8z' : 'had-msg-bot-u9d8z'} ${
                        isVisible ? 'had-msg-show-u9d8z' : ''
                      }`}
                    >
                      <div className="had-msg-bubble-u9d8z">
                        {msg.text}
                      </div>
                    </div>
                  );
                })}

                {/* Animated Typing Indicator */}
                {activeMessageIndex === messages.length && (
                  <div className="had-msg-row-u9d8z had-msg-bot-u9d8z had-msg-show-u9d8z">
                    <div className="had-msg-bubble-u9d8z had-typing-indicator-u9d8z">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chat Input Field Mock */}
              <div className="had-chat-input-u9d8z">
                <span className="had-input-placeholder-u9d8z">Type a message in Hindi...</span>
                <span className="had-send-btn-u9d8z">🎤</span>
              </div>
            </div>
          </div>
          {/* Neon Glow Circle behind Phone */}
          <div className="had-glow-glow-u9d8z"></div>
        </div>
      </div>
    </section>
  );
}
