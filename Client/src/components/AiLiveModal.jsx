'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ─────────────────────────────────────────────────────────────────────────────
// SUBSCRIPTION CHECK
// ─────────────────────────────────────────────────────────────────────────────
function getIsSubscribed() {
  if (typeof window === 'undefined') return false;
  try {
    const raw1 = localStorage.getItem('subscribed');
    if (raw1) {
      const s = JSON.parse(raw1);
      if (s.isSubscribed === true || s.userType === 'subscriber') return true;
    }
    const raw2 = localStorage.getItem('userProfileData');
    if (raw2) {
      const p = JSON.parse(raw2);
      if (p.user_type === 'subscriber') return true;
    }
  } catch { /* ignore */ }
  return false;
}

// ─────────────────────────────────────────────────────────────────────────────
// BACKGROUND MUSIC TRACK LIST
// Put your .mp3 files inside /public/live_music/
// Add / remove entries here as you add more songs.
// ─────────────────────────────────────────────────────────────────────────────
const LIVE_MUSIC_TRACKS = [
  "/live_music/track_1.mp3",
  "/live_music/track_2.mp3",
  "/live_music/track_3.mp3",
  "/live_music/track_4.mp3",
  "/live_music/track_5.mp3",
];

// Returns a random track, never the same as `current`
function getRandomTrack(current = null) {
  const pool = LIVE_MUSIC_TRACKS.filter(t => t !== current);
  if (pool.length === 0) return LIVE_MUSIC_TRACKS[0];
  return pool[Math.floor(Math.random() * pool.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// ACTIONS CONFIG
// ─────────────────────────────────────────────────────────────────────────────
export const ACTIONS = [
  { id: "wave",     label: "Wave",     emoji: "👋", isFree: true  },
  { id: "dance",    label: "Dance",    emoji: "💃", isFree: true  },
  { id: "naughty",  label: "Naughty",  emoji: "😏", isFree: false },
  { id: "kiss",     label: "Kiss",     emoji: "😘", isFree: false },
  { id: "pose",     label: "Pose",     emoji: "🤳", isFree: false },
  { id: "hot_show", label: "Hot Show", emoji: "🔥", isFree: false },
];

function getRandom(arr) {
  if (!arr || arr.length === 0) return null;
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─────────────────────────────────────────────────────────────────────────────
// FLOATING EMOJI
// ─────────────────────────────────────────────────────────────────────────────
function FloatingEmoji({ emoji, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2200);
    return () => clearTimeout(t);
  }, [onDone]);

  const left = 15 + Math.random() * 70;
  const dur  = 1.6 + Math.random() * 0.8;
  return (
    <span
      className="alvm-floater"
      style={{ left: `${left}%`, animationDuration: `${dur}s` }}
      aria-hidden
    >
      {emoji}
    </span>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PAYWALL OVERLAY
// ─────────────────────────────────────────────────────────────────────────────
function PaywallOverlay({ onClose, actionLabel }) {
  return (
    <div className="alvm-paywall-overlay" role="dialog" aria-modal aria-label="Unlock premium">
      <div className="alvm-paywall-box">
        <button className="alvm-paywall-close" onClick={onClose} aria-label="Close">✕</button>

        <div className="alvm-paywall-accent-bar" />

        <div className="alvm-paywall-top">
          <div className="alvm-paywall-lock-ring">🔥</div>
          <span className="alvm-paywall-eyebrow">PREMIUM ONLY</span>
          <h3 className="alvm-paywall-title">
            Unlock <span className="alvm-paywall-action-name">"{actionLabel}"</span>
          </h3>
          <p className="alvm-paywall-desc">
            This interaction is for <strong>Premium members only</strong>.
            Get <strong>everything unlimited</strong> for a whole year at just ₹399.
          </p>
        </div>

        {/* Price anchor */}
        <div className="alvm-paywall-price-anchor">
          <span className="alvm-pwa-old">₹999/yr</span>
          <span className="alvm-pwa-new">₹399<span>/yr</span></span>
          <span className="alvm-pwa-save">Save ₹600 🎉</span>
        </div>

        <div className="alvm-paywall-perks">
          <div className="alvm-paywall-perk">
            <span className="alvm-perk-icon">🎬</span>
            <span>All 6 Live interactions unlocked</span>
          </div>
          <div className="alvm-paywall-perk">
            <span className="alvm-perk-icon">💬</span>
            <span>Unlimited messages — forever</span>
          </div>
          <div className="alvm-paywall-perk">
            <span className="alvm-perk-icon">🧠</span>
            <span>AI remembers everything about you</span>
          </div>
          <div className="alvm-paywall-perk">
            <span className="alvm-perk-icon">🔥</span>
            <span>Hot Stories + 90s Love Letters</span>
          </div>
        </div>

        <Link href="/subscribe" className="alvm-paywall-cta">
          <span className="alvm-paywall-cta-icon">💎</span>
          <div className="alvm-paywall-cta-text">
            <span className="alvm-cta-main">Unlock Everything</span>
            <span className="alvm-cta-price">₹399/year · that's ₹33.2/month</span>
          </div>
          <div className="alvm-paywall-cta-shine" />
        </Link>

        <button className="alvm-paywall-later" onClick={onClose}>
          Keep watching for free
        </button>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// MAIN MODAL
// ─────────────────────────────────────────────────────────────────────────────
// ── Fisher-Yates shuffle ──────────────────────────────────────────────────
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AiLiveModal({ model, onClose }) {
  const videoRef        = useRef(null);
  const actionsRef      = useRef(null);
  const audioRef        = useRef(null);   // background music engine
  const currentTrackRef = useRef(null);   // avoids repeating the same track

  // ── Idle video shuffled queue ─────────────────────────────────────────────
  const idleQueueRef = useRef([]);
  const isIdleRef    = useRef(true);  // mirrors isIdle without stale-closure issues

  // Returns the next idle clip from the shuffled queue, refilling when empty
  const nextIdleVideo = useCallback(() => {
    if (idleQueueRef.current.length === 0) {
      idleQueueRef.current = shuffle(model.idleVideos);
    }
    return idleQueueRef.current.shift();
  }, [model.idleVideos]);

  // Directly plays a src on the video element — no React state involved,
  // so there is ZERO render-cycle gap between consecutive clips.
  const playVideo = useCallback((src) => {
    const v = videoRef.current;
    if (!v || !src) return;
    v.src = src;
    v.muted = true;
    v.load();
    v.play().catch(() => {});
  }, []);

  const [isSubscribed]                    = useState(getIsSubscribed);
  const [showPaywall, setShowPaywall]     = useState(false);
  const [paywallAction, setPaywallAction] = useState(null);

  const [currentSrc, setCurrentSrc]       = useState(() => {
    // Seed the queue on first render
    idleQueueRef.current = shuffle(model.idleVideos);
    return idleQueueRef.current.shift();
  });
  const [isIdle, setIsIdle]               = useState(true);
  const [activeAction, setActiveAction]   = useState(null);
  const [floaters, setFloaters]           = useState([]);
  const [videoError, setVideoError]       = useState(false);

  // music state
  const [musicMuted, setMusicMuted]       = useState(false);

  // ── Lock body scroll ──────────────────────────────────────────────────────
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // ── ESC key ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const h = e => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  // ── Background music engine ───────────────────────────────────────────────
  useEffect(() => {
    // Create Audio instance
    const audio = new Audio();
    audio.volume = 0.55;
    audio.preload = "auto";
    audioRef.current = audio;

    // Load and play a random track
    const playNext = (avoiding = null) => {
      const track = getRandomTrack(avoiding);
      currentTrackRef.current = track;

      audio.src = track;
      audio.load();
      audio.play().catch(() => {
        // Autoplay blocked — user interaction will be needed; muted state already shown
      });
    };

    // When one track ends, pick the next one automatically
    const handleEnded = () => playNext(currentTrackRef.current);
    audio.addEventListener("ended", handleEnded);

    // Start playback
    playNext();

    // Cleanup: stop music and release resources when modal closes
    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, []); // runs once on mount

  // ── Sync music mute state ─────────────────────────────────────────────────
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = musicMuted;
    }
  }, [musicMuted]);

  // ── Initial video load (on mount) ────────────────────────────────────────
  useEffect(() => {
    if (currentSrc) playVideo(currentSrc);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // runs once — subsequent clips handled imperatively in onEnded

  // ── onEnded: immediately start next clip with zero React-render gap ───────
  // This runs synchronously when the video element fires 'ended', so the next
  // video begins loading/playing in the SAME event-loop tick — no flicker/pause.
  const handleVideoEnded = useCallback(() => {
    isIdleRef.current = true;
    setIsIdle(true);
    setActiveAction(null);
    setVideoError(false);
    const next = nextIdleVideo();
    setCurrentSrc(next);   // keep React state in sync (for conditional rendering)
    playVideo(next);       // ← imperative play — happens immediately, no re-render wait
  }, [nextIdleVideo, playVideo]);

  // ── Trigger action ────────────────────────────────────────────────────────
  const triggerAction = (action) => {
    if (!action.isFree && !isSubscribed) {
      setPaywallAction(action);
      setShowPaywall(true);
      return;
    }

    const videos = model.actionVideos?.[action.id];
    if (!videos || videos.length === 0) return;

    const src = getRandom(videos);
    isIdleRef.current = false;
    setIsIdle(false);
    setActiveAction(action.id);
    setCurrentSrc(src);
    setVideoError(false);
    playVideo(src); // imperative — no render delay

    setFloaters(prev => [
      ...prev,
      ...Array.from({ length: 6 }, (_, i) => ({ id: Date.now() + i, emoji: action.emoji })),
    ]);
  };

  const removeFloater = id => setFloaters(prev => prev.filter(f => f.id !== id));

  return (
    <div
      className="alvm-overlay"
      onClick={e => e.target === e.currentTarget && onClose()}
      role="dialog"
      aria-modal
      aria-label={`${model.name} Live`}
    >
      <div className="alvm-shell">
        <div className="alvm-stage">

          {/* ── VIDEO (always muted) ── */}
          {!videoError && currentSrc ? (
            <video
              ref={videoRef}
              className="alvm-video"
              loop={false}
              muted          /* always muted — music plays via Audio API */
              playsInline
              preload="auto"
              onEnded={handleVideoEnded}
              onError={() => setVideoError(true)}
              poster={model.avatar}
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
            />
          ) : (
            <div className="alvm-fallback">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={model.avatar}
                alt={model.name}
                className="alvm-fallback-img"
                onError={e => { e.target.style.opacity = '0'; }}
              />
              {videoError && (
                <div className="alvm-fallback-note">
                  <span>🎬</span>
                  <p>Drop your videos into<br /><code>/public/live_models/</code></p>
                </div>
              )}
            </div>
          )}

          {/* Gradients */}
          <div className="alvm-grad-top" aria-hidden />
          <div className="alvm-grad-bot"  aria-hidden />

          {/* Floaters */}
          <div className="alvm-floaters-layer" aria-hidden>
            {floaters.map(f => (
              <FloatingEmoji key={f.id} emoji={f.emoji} onDone={() => removeFloater(f.id)} />
            ))}
          </div>

          {/* ══════════════════════════════════════════
              TOP BAR
          ══════════════════════════════════════════ */}
          <div className="alvm-top-bar">
            <div className="alvm-top-left">
              <div className="alvm-avatar-ring">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={model.avatar} alt={model.name} className="alvm-avatar-img" />
              </div>
              <div className="alvm-top-meta">
                <span className="alvm-model-name">{model.name}</span>
                <div className="alvm-meta-row">
                  <span className="alvm-live-pill">● LIVE</span>
                </div>
              </div>
            </div>

            <div className="alvm-top-right">
              {/* Music mute / unmute */}
              <button
                className="alvm-icon-btn"
                onClick={() => setMusicMuted(m => !m)}
                aria-label={musicMuted ? "Unmute music" : "Mute music"}
                title={musicMuted ? "Unmute music" : "Mute music"}
              >
                {musicMuted ? (
                  /* Muted — speaker crossed out */
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73 4.27 3zM12 4L9.91 6.09 12 8.18V4zm6.5 8c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71z"/>
                  </svg>
                ) : (
                  /* Sound on — speaker with waves */
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                  </svg>
                )}
              </button>
              {/* Close */}
              <button className="alvm-close-btn" onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
              </button>
            </div>
          </div>

          {/* ══════════════════════════════════════════
              BOTTOM CONTROLS STRIP
          ══════════════════════════════════════════ */}
          <div className="alvm-controls-strip">

            <div className="alvm-strip-header">
              <p className="alvm-controls-label">
                Interact with <strong>{model.name.split(" ")[0]}</strong>
              </p>
              {!isSubscribed && (
                <span className="alvm-free-tag">2 FREE ✓</span>
              )}
            </div>

            <div
              className="alvm-actions-scroll"
              ref={actionsRef}
              role="group"
              aria-label="Interaction actions"
            >
              <div className="alvm-actions-row">
                {ACTIONS.map(action => {
                  const isLocked = !action.isFree && !isSubscribed;
                  return (
                    <button
                      key={action.id}
                      className={[
                        "alvm-action-btn",
                        activeAction === action.id ? "alvm-action-active" : "",
                        isLocked ? "alvm-action-locked" : "alvm-action-free",
                      ].join(" ")}
                      onClick={() => triggerAction(action)}
                      aria-label={action.label}
                      aria-pressed={activeAction === action.id}
                    >
                      {action.isFree && !isSubscribed && (
                        <span className="alvm-free-badge-btn">FREE</span>
                      )}
                      {isLocked && (
                        <span className="alvm-lock-badge">🔒</span>
                      )}
                      <span className="alvm-action-emoji">{action.emoji}</span>
                      <span className="alvm-action-text">{action.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!isSubscribed && (
              <div className="alvm-upgrade-strip">
                <span className="alvm-upgrade-strip-text">
                  🔒 4 interactions locked ·{" "}
                  <Link href="/subscribe" className="alvm-upgrade-link">
                    Upgrade to unlock all
                  </Link>
                </span>
              </div>
            )}

          </div>

          {/* ── PAYWALL ── */}
          {showPaywall && paywallAction && (
            <PaywallOverlay
              actionLabel={paywallAction.label}
              onClose={() => { setShowPaywall(false); setPaywallAction(null); }}
            />
          )}

        </div>
      </div>
    </div>
  );
}
