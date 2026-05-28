'use client';
import { useEffect, useState, lazy, Suspense } from "react";
import Link from "next/link";
import axios from "axios";
import "../styles/Home.css";
import dynamic from "next/dynamic";

// ── Critical above-fold components (eager) ──────────────────────────────────
import HomeAiModels from "../components/HomeAiModels";
import AiLiveView from "../components/AiLiveView";

// ── Below-fold components (lazy-loaded) ─────────────────────────────────────
const StepsHome          = dynamic(() => import("../components/StepsHome"),          { ssr: false });
const HomeFAQ            = dynamic(() => import("../components/HomeFAQ"),            { ssr: false });
const HomeCosAi          = dynamic(() => import("../components/HomeCosAi"),          { ssr: false });
const Footer             = dynamic(() => import("../components/Footer"),             { ssr: false });
const HomeSubscriptions  = dynamic(() => import("../components/HomeSubscriptions"),  { ssr: false });
const HomeReferralSection= dynamic(() => import("../components/HomeReferralSection"),{ ssr: false });
const HomeAppDownload    = dynamic(() => import("../components/HomeAppDownload"),    { ssr: false });
const HomeRandomStories  = dynamic(() => import("../components/HomeRandomStories"),  { ssr: false });
const HomeLiveStories    = dynamic(() => import("../components/HomeLiveStories"),    { ssr: false });
import api from "../config/api";

export default function Home() {
  const [serverStatus, setServerStatus] = useState(null);
  const [country, setCountry] = useState('IN');

  useEffect(() => {
    const savedCountry = localStorage.getItem('user_country');
    if (savedCountry) setCountry(savedCountry);

    const fetchServerStatus = async () => {
      try {
        const response = await axios.get(`${api.Url}/server-status`);
        setServerStatus(response.data.message);
      } catch {
        setServerStatus("maintenance");
      }
    };
    fetchServerStatus();
  }, []);

  return (
    <>
      <main className="home-container">
        <div className="global-noise-overlay" />

        {/* ─── 1. AI LIVE STUDIO — very first thing users see ─── */}
        <section className="home-top-section">
          <AiLiveView />
        </section>


        {/* ─── 2. AI MODELS GRID ──────────────────────────────── */}
        <section className="section-spacer">
          <HomeAiModels />
        </section>

        {/* ─── 2.5. LIVE STORIES ──────────────────────────────── */}
        {country === 'IN' && (
          <section className="section-spacer">
            <Suspense fallback={null}>
              <HomeLiveStories />
            </Suspense>
          </section>
        )}

        {/* ─── 5. HOW IT WORKS ────────────────────────────────── */}
        <section className="steps-section">
          <Suspense fallback={null}>
            <StepsHome />
          </Suspense>
        </section>

        {/* ─── 6. PRICING ─────────────────────────────────────── */}
        <section className="section-spacer">
          <Suspense fallback={null}>
            <HomeSubscriptions />
          </Suspense>
        </section>

        {/* ─── 9. STORIES ─────────────────────────────────────── */}
        {country === 'IN' && (
          <section>
            <Suspense fallback={null}>
              <HomeRandomStories />
            </Suspense>
          </section>
        )}

        {/* ─── 8. REFERRAL ────────────────────────────────────── */}
        <section className="section-spacer">
          <Suspense fallback={null}>
            <HomeReferralSection />
          </Suspense>
        </section>

        {/* ─── 8.5. APP DOWNLOAD ──────────────────────────────── */}
        <section className="section-spacer">
          <Suspense fallback={null}>
            <HomeAppDownload />
          </Suspense>
        </section>

        {/* ─── 10. FAQ ────────────────────────────────────────── */}
        <section className="section-spacer">
          <Suspense fallback={null}>
            <HomeFAQ />
          </Suspense>
        </section>

      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}