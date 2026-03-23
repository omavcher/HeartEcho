'use client';
import { useEffect, useState } from "react";
import Link from "next/link";
import axios from "axios";
import "../styles/Home.css";

// Components
import HomeAiModels from "../components/HomeAiModels";
import StepsHome from "../components/StepsHome";
import HomeFAQ from "../components/HomeFAQ";
import HomeCosAi from "../components/HomeCosAi";
import Footer from "../components/Footer";
import HomeSubscriptions from "../components/HomeSubscriptions";
import HomeReferralSection from "../components/HomeReferralSection";
import api from "../config/api";
import HomeRandomStories from "../components/HomeRandomStories";
import HomeLiveStories from "../components/HomeLiveStories";
import AiLiveView from "../components/AiLiveView";

export default function Home() {
  const [serverStatus, setServerStatus] = useState(null);

  useEffect(() => {
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
        {serverStatus === "Server is running" && (
          <section className="section-spacer">
            <HomeAiModels />
          </section>
        )}

        {/* ─── 2.5. LIVE STORIES ──────────────────────────────── */}
        {serverStatus === "Server is running" && (
          <section className="section-spacer">
            <HomeLiveStories />
          </section>
        )}


      

      
        {/* ─── 5. HOW IT WORKS ────────────────────────────────── */}
        <section className="steps-section"><StepsHome /></section>

        {/* ─── 6. PRICING ─────────────────────────────────────── */}
        <section className="section-spacer"><HomeSubscriptions /></section>


        {/* ─── 9. STORIES ─────────────────────────────────────── */}
        <section><HomeRandomStories /></section>


        {/* ─── 8. REFERRAL ────────────────────────────────────── */}
        <section className="section-spacer"><HomeReferralSection /></section>
        {/* ─── 10. FAQ ────────────────────────────────────────── */}
        <section className="section-spacer"><HomeFAQ /></section>

      </main>
      <Footer />
    </>
  );
}