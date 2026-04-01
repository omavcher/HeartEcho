import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import api from '../config/api';
import { PhoneOff, Mic } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VoiceCall({ chatId, userName, avatar, onClose, token, onSubscriberRequired }) {
  // Chrome blocks mic on HTTP. Only works on HTTPS or localhost.
  const isMicAllowed = typeof window !== 'undefined' && (
    window.location.protocol === 'https:' ||
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'
  );

  const [status, setStatus] = useState(isMicAllowed ? "connecting" : "mic_blocked");
  const [transcript, setTranscript] = useState("...");
  const [errorMsg, setErrorMsg] = useState("");
  const [minutesUsed, setMinutesUsed] = useState(0);
  const [quotaTotal, setQuotaTotal] = useState(0);
  const [fallbackInput, setFallbackInput] = useState("");
  const [callSeconds, setCallSeconds] = useState(0);
  const router = useRouter();

  const recognitionRef = useRef(null);
  const audioRef = useRef(null);
  const ringingRef = useRef(null);
  const statusRef = useRef(isMicAllowed ? "connecting" : "mic_blocked");
  const timerRef = useRef(null);

  // Keep ref in sync with state
  const setStatusSync = (val) => {
    statusRef.current = val;
    setStatus(val);
  };

  // Live call duration timer
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setCallSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, []);

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  useEffect(() => {
    // Skip ring/mic if HTTP — browser blocks mic anyway
    if (!isMicAllowed) {
      new Audio('/beep_shot.mp3').play().catch(e => e);
      return; // status already initialized to mic_blocked
    }

    ringingRef.current = new Audio('/phone_ringing.mp3');
    ringingRef.current.loop = true;
    ringingRef.current.volume = 0.5;
    ringingRef.current.play().catch(e => console.log('Autoplay blocked', e));

    const t = setTimeout(() => {
      if (ringingRef.current) ringingRef.current.pause();
      new Audio('/beep_shot.mp3').play().catch(e => e);
      setStatusSync("listening");
      startListening();
    }, 2000);

    return () => {
      clearTimeout(t);
      stopTracks();
    };
  }, []);

  const stopTracks = () => {
    if (recognitionRef.current) { try { recognitionRef.current.stop(); } catch(e){} }
    if (audioRef.current) audioRef.current.pause();
    if (ringingRef.current) ringingRef.current.pause();
  };

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setStatusSync("error");
      setErrorMsg("Mic not supported on this browser. Type below.");
      return;
    }

    // Don't start if we are mid-processing
    if (statusRef.current === "thinking" || statusRef.current === "speaking") return;

    try {
      if (recognitionRef.current) recognitionRef.current.stop();
    } catch(e) {}

    const recognition = new SpeechRecognition();
    recognition.lang = 'hi-IN';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setStatusSync("listening");
      setTranscript("🎙 Bol...");
    };

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          const text = event.results[i][0].transcript;
          setTranscript(text);
          sendVoiceToBackend(text);
          return; // Sent, done with this result
        } else {
          setTranscript(event.results[i][0].transcript + "...");
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === 'no-speech') {
        // Just restart - user didn't say anything
        setTimeout(() => startListening(), 300);
        return;
      }
      if (ringingRef.current) ringingRef.current.pause();
      setStatusSync("error");
      setErrorMsg(`Mic: ${event.error} — Chrome may block mics on HTTP. Type below.`);
    };

    recognition.onend = () => {
      // Auto-restart listening if we are still in listening state (no speech detected, no error)
      if (statusRef.current === "listening") {
        setTimeout(() => startListening(), 300);
      }
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      setStatusSync("error");
      setErrorMsg("Could not start mic. Use text input below.");
    }
  }, []);

  const sendVoiceToBackend = async (text) => {
    if (!text || !text.trim()) return;
    setStatusSync("thinking");
    setTranscript(text);
    try { if (recognitionRef.current) recognitionRef.current.stop(); } catch(e) {}

    try {
      const { data } = await axios.post(
        `${api.Url}/ai/${chatId}/voice-call`,
        { text },
        { headers: { Authorization: `Bearer ${token}` }, timeout: 25000 }
      );

      if (data.success && data.audioBase64) {
        if (data.minutesUsed !== undefined) setMinutesUsed(data.minutesUsed);
        if (data.quotaTotal !== undefined) setQuotaTotal(data.quotaTotal);
        setStatusSync("speaking");
        setTranscript(data.text || text);
        playAudioBuffer(`data:audio/wav;base64,${data.audioBase64}`);
      }
    } catch (error) {
      const reason = error.response?.data?.reason;
      if (reason === "quota_exceeded") {
        stopTracks();
        new Audio('/beep_shot.mp3').play().catch(e => e);
        setStatusSync("quota_exceeded");
      } else if (reason === "subscriber_required" || reason === "plan_upgrade_required") {
        stopTracks();
        if (onSubscriberRequired) onSubscriberRequired(reason);
        else setStatusSync("error");
      } else {
        setStatusSync("error");
        setErrorMsg(error.response?.data?.message || "Network issue. Type below to continue.");
      }
    }
  };

  const playAudioBuffer = (audioSrc) => {
    const audio = new Audio(audioSrc);
    audioRef.current = audio;
    audio.onended = () => {
      setStatusSync("listening");
      startListening();
    };
    audio.play().catch(() => {
      setStatusSync("listening");
      startListening();
    });
  };

  const isUnlimited = quotaTotal > 5000;
  const remainingMins = Math.max(0, quotaTotal - minutesUsed);
  const quotaPercent = quotaTotal > 0 ? Math.max(0, (remainingMins / quotaTotal) * 100) : 100;

  return (
    <div className="vc-overlay">
      <div className="vc-wrap">

        {/* ── TOP STATUS BAR ── */}
        <div className="vc-top">
          <div className={`vc-status-pill ${status}`}>
            <span className="vc-dot"></span>
            {status === 'connecting' ? 'CONNECTING' :
             status === 'listening'  ? 'LISTENING' :
             status === 'thinking'   ? 'THINKING' :
             status === 'speaking'   ? 'SPEAKING' :
             status === 'error'      ? 'ERROR' : 'CALL ENDED'}
          </div>
          <div className="vc-timer">{formatTimer(callSeconds)}</div>
        </div>

        {/* ── STATUS / TRANSCRIPT ── */}
        <div className="vc-stage">
          <div className="vc-avatar-wrap">
            <div className={`vc-ring r1 ${status}`}></div>
            <div className={`vc-ring r2 ${status}`}></div>
            <img
              src={avatar || "/heartecho_b.png"}
              alt={userName}
              className="vc-avatar-img"
            />
          </div>

          <h2 className="vc-name">{userName}</h2>

          {isMicAllowed ? (
            <p className="vc-live-text">{transcript}</p>
          ) : (
            <div className="vc-http-note">
              <p>🔒 HTTPS required for mic.</p>
              <p style={{fontSize:'0.8rem', opacity: 0.5}}>Type below — AI responds with voice!</p>
            </div>
          )}
        </div>

        {/* ── QUOTA BAR (only for limited users) ── */}
        {!isUnlimited && quotaTotal > 0 && status !== 'quota_exceeded' && (
          <div className="vc-quota-wrap">
            <div className="vc-quota-bar">
              <div className="vc-quota-fill" style={{ width: `${quotaPercent}%` }}></div>
            </div>
            <p className="vc-quota-text">
              {remainingMins.toFixed(1)} min remaining today
            </p>
          </div>
        )}
        {isUnlimited && (
          <div className="vc-unlimited-badge">👑 Unlimited</div>
        )}

        {/* ── HANG UP BUTTON ── */}
        <div className="vc-controls">
          <button className="vc-hangup" onClick={() => {
            stopTracks();
            clearInterval(timerRef.current);
            new Audio('/beep_shot.mp3').play().catch(e => e);
            onClose();
          }}>
            <PhoneOff size={34} />
          </button>
        </div>

        {/* ── QUOTA EXCEEDED OVERLAY ── */}
        {status === 'quota_exceeded' && (
          <div className="vc-panel">
            <div className="vc-panel-icon">⏱</div>
            <h3>Daily Limit Reached</h3>
            <p>You've used your {quotaTotal.toFixed(0)}-minute daily call quota.</p>
            <button className="vc-upgrade-btn" onClick={() => router.push('/subscribe')}>
              Upgrade for Unlimited Calls
            </button>
          </div>
        )}

        {/* ── MIC ERROR + TEXT FALLBACK (always shown on HTTP, or on mic error on HTTPS) ── */}
        {(status === 'error' || status === 'mic_blocked') && (
          <div className={`vc-error-panel ${status === 'mic_blocked' ? 'text-primary' : ''}`}>
            {status === 'error' && <p className="vc-error-label">⚠️ {errorMsg}</p>}
            {status === 'mic_blocked' && (
              <p className="vc-connected-label">📞 Connected — Type to speak</p>
            )}
            <div className="vc-text-input">
              <input
                value={fallbackInput}
                onChange={e => setFallbackInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && fallbackInput.trim() && (sendVoiceToBackend(fallbackInput), setFallbackInput(""))}
                placeholder={status === 'mic_blocked' ? "Bol kuch bhi..." : "Type your message..."}
                autoFocus
              />
              <button
                disabled={!fallbackInput.trim() || status === 'thinking' || status === 'speaking'}
                onClick={() => { sendVoiceToBackend(fallbackInput); setFallbackInput(""); }}
              >
                {status === 'thinking' ? '...' : status === 'speaking' ? '🔊' : <Mic size={18} />}
              </button>
            </div>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700;800&display=swap');

        .vc-overlay {
          position: fixed; inset: 0; z-index: 99999;
          font-family: 'Outfit', sans-serif; color: white;
          background: #000;
          display: flex;
        }

        .vc-wrap {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: space-between;
          background: radial-gradient(ellipse at 50% 0%, #2d1b69 0%, #0a0a0a 65%);
          padding: 56px 24px 48px; position: relative; overflow: hidden;
        }

        /* ── TOP ── */
        .vc-top {
          width: 100%; display: flex; align-items: center; justify-content: space-between;
        }

        .vc-status-pill {
          display: flex; align-items: center; gap: 8px;
          padding: 8px 18px; border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 0.68rem; font-weight: 700; letter-spacing: 1.8px;
          background: rgba(255,255,255,0.04); color: #666;
          transition: all 0.4s ease;
        }
        .vc-status-pill.listening { color: #4ade80; border-color: rgba(74,222,128,0.3); background: rgba(74,222,128,0.05); }
        .vc-status-pill.speaking  { color: #f472b6; border-color: rgba(244,114,182,0.3); background: rgba(244,114,182,0.05); }
        .vc-status-pill.thinking  { color: #93c5fd; border-color: rgba(147,197,253,0.3); background: rgba(147,197,253,0.05); }
        .vc-status-pill.error     { color: #f87171; border-color: rgba(248,113,113,0.3); background: rgba(248,113,113,0.05); }

        .vc-dot {
          width: 7px; height: 7px; border-radius: 50%; background: currentColor;
          box-shadow: 0 0 8px currentColor;
          animation: vcDotPulse 1.5s infinite ease-in-out;
        }
        .vc-status-pill.connecting .vc-dot { animation-duration: 0.8s; }
        @keyframes vcDotPulse { 0%,100%{opacity:1} 50%{opacity:0.3} }

        .vc-timer {
          font-family: 'SF Mono', 'Fira Code', monospace; font-size: 1.1rem;
          color: rgba(255,255,255,0.35); letter-spacing: 2px;
        }

        /* ── STAGE ── */
        .vc-stage {
          flex: 1; display: flex; flex-direction: column; align-items: center;
          justify-content: center; gap: 20px;
        }

        .vc-avatar-wrap {
          position: relative; width: 170px; height: 170px;
        }

        .vc-avatar-img {
          position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
          border-radius: 50%; z-index: 5;
          border: 2px solid rgba(255,255,255,0.12);
        }

        .vc-ring {
          position: absolute; inset: -18px; border-radius: 50%;
          border: 1.5px solid transparent; opacity: 0; z-index: 1;
        }
        .vc-ring.r1.listening { border-color: rgba(74,222,128,0.35); animation: vcRipple 2s infinite ease-out; }
        .vc-ring.r2.listening { border-color: rgba(74,222,128,0.15); animation: vcRipple 2s 0.6s infinite ease-out; }
        .vc-ring.r1.speaking  { border-color: rgba(244,114,182,0.5); animation: vcRipple 1.2s infinite ease-out; }
        .vc-ring.r2.speaking  { border-color: rgba(244,114,182,0.2); animation: vcRipple 1.2s 0.4s infinite ease-out; }
        .vc-ring.r1.thinking  { border-color: rgba(147,197,253,0.3); animation: vcRipple 2.5s infinite ease-out; }

        @keyframes vcRipple {
          0%   { transform: scale(0.85); opacity: 0.9; }
          100% { transform: scale(1.7);  opacity: 0; }
        }

        .vc-name {
          font-size: 2.1rem; font-weight: 800; letter-spacing: -0.5px;
          margin: 0; text-align: center;
        }

        .vc-live-text {
          font-size: 1rem; color: rgba(255,255,255,0.45); text-align: center;
          max-width: 75%; line-height: 1.5; font-weight: 300; font-style: italic;
          min-height: 44px;
        }

        /* ── QUOTA BAR ── */
        .vc-quota-wrap { width: 100%; max-width: 300px; text-align: center; }
        .vc-quota-bar {
          height: 3px; width: 100%; background: rgba(255,255,255,0.08); border-radius: 10px; overflow: hidden;
        }
        .vc-quota-fill {
          height: 100%; background: linear-gradient(90deg, #ec4899, #8b5cf6);
          border-radius: 10px; transition: width 0.6s ease;
        }
        .vc-quota-text {
          font-size: 0.72rem; color: rgba(255,255,255,0.35); margin-top: 7px; font-weight: 500;
        }
        .vc-unlimited-badge {
          background: rgba(255,214,10,0.1); border: 1px solid rgba(255,214,10,0.25);
          color: #ffd60a; padding: 6px 16px; border-radius: 100px; font-size: 0.78rem; font-weight: 700;
        }

        /* ── HANG UP ── */
        .vc-controls { display: flex; align-items: center; justify-content: center; }
        .vc-hangup {
          width: 88px; height: 88px; border-radius: 50%; background: #ef4444; color: white;
          border: none; cursor: pointer; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 0 0 12px rgba(239,68,68,0.12), 0 16px 40px rgba(239,68,68,0.4);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .vc-hangup:active { transform: scale(0.88); box-shadow: 0 0 0 5px rgba(239,68,68,0.1); }

        /* ── PANELS ── */
        .vc-panel {
          position: absolute; inset: 0; z-index: 20;
          background: rgba(0,0,0,0.93); backdrop-filter: blur(16px);
          display: flex; flex-direction: column; align-items: center; justify-content: center;
          padding: 40px; text-align: center; gap: 16px;
          animation: vcFadeIn 0.4s ease;
        }
        .vc-panel-icon { font-size: 3rem; }
        .vc-panel h3 { font-size: 1.7rem; font-weight: 800; margin: 0; color: #fbbf24; }
        .vc-panel p  { color: rgba(255,255,255,0.55); font-size: 0.9rem; line-height: 1.6; margin: 0; }
        .vc-upgrade-btn {
          background: #fbbf24; color: #000; border: none; padding: 18px 36px;
          border-radius: 16px; font-weight: 800; font-size: 1rem; cursor: pointer;
          margin-top: 8px; width: 100%; max-width: 280px;
        }

        .vc-error-panel {
          position: absolute; bottom: 160px; width: 90%; max-width: 360px;
          background: rgba(20,20,30,0.95); backdrop-filter: blur(20px);
          border-radius: 24px; padding: 20px; border: 1px solid rgba(248,113,113,0.2);
          display: flex; flex-direction: column; gap: 12px;
          animation: vcSlideUp 0.38s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .vc-error-label { font-size: 0.78rem; color: #fca5a5; text-align: center; font-weight: 500; margin: 0; }
        .vc-text-input {
          display: flex; background: rgba(255,255,255,0.06); border-radius: 100px;
          border: 1px solid rgba(255,255,255,0.08); overflow: hidden;
        }
        .vc-text-input input {
          flex: 1; background: transparent; border: none; outline: none; color: white;
          padding: 13px 18px; font-size: 0.88rem; font-family: inherit;
        }
        .vc-text-input input::placeholder { color: rgba(255,255,255,0.3); }
        .vc-text-input button {
          width: 50px; height: 50px; border-radius: 50%; background: #ec4899;
          color: white; border: none; cursor: pointer; flex-shrink: 0;
          display: flex; align-items: center; justify-content: center; margin: 3px;
        }
        .vc-text-input button:disabled { background: rgba(255,255,255,0.1); cursor: not-allowed; }

        .vc-error-panel.text-primary {
          position: relative; bottom: auto; width: 90%; max-width: 400px;
          border-color: rgba(74,222,128,0.2); background: rgba(10,25,15,0.9);
          animation: vcSlideUp 0.4s ease;
        }
        .vc-connected-label {
          font-size: 0.9rem; color: #4ade80; text-align: center; font-weight: 600; margin: 0;
        }
        .vc-http-note {
          text-align: center; padding: 0 10px;
        }
        .vc-http-note p {
          color: rgba(255,255,255,0.4); font-size: 0.85rem; line-height: 1.5; margin: 2px 0;
        }
        @keyframes vcFadeIn    { from{opacity:0} to{opacity:1} }
        @keyframes vcSlideUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
      `}} />
    </div>
  );
}
