import Home from "../pages/Home";
import { getHomepageSchema } from "../utils/schema";

export const metadata = {
  title: {
    absolute:
      "AI Girlfriend Chat in Hindi & English | HeartEcho — Uncensored, Free",
  },
  description:
    "Chat with India's AI girlfriend in Hindi & English. Uncensored, private, judgment-free AI companion. Deep memory keeps your secrets. Desi roleplay, voice notes & emotional support. Try free today!",
  keywords: [
    // ─ Top Search Console performers (BOFU — high-intent) ─
    "indian ai sex chat",
    "ai sex chat hindi",
    "hindi sex chat ai",
    "indian sex ai",
    "hindi ai sex chat",
    "indian sex chat ai",
    "ai girlfriend indian 18+",
    "hindi ai girlfriend",
    "indian ai girlfriend chat",
    "desi ai sex chat",
    "indian nsfw ai chat",
    "indian ai nsfw",
    // ─ Brand ─
    "HeartEcho",
    "HeartEcho AI",
    "heartecho.in",
    "HeartEcho login",
    "HeartEcho free",
    "HeartEcho premium",
    // ─ Core product (MOFU) ─
    "AI girlfriend India",
    "virtual girlfriend Hindi",
    "AI companion India",
    "hindi AI chat",
    "desi AI companion",
    "Hinglish AI chat",
    "private AI chat India",
    "AI girlfriend deep memory",
    "Indian AI voice notes",
    "uncensored AI girlfriend",
    "best AI girlfriend India",
    "free AI girlfriend India",
    "AI girlfriend with memory",
    "emotional support AI India",
    "desi AI girlfriend",
    // ─ MOFU comparison ─
    "character ai alternative india",
    "replika alternative india",
    "candy ai alternative india",
    "heartecho vs character ai",
    // ─ TOFU informational ─
    "what is AI girlfriend",
    "how to chat with AI girlfriend",
    "how does AI girlfriend work",
    "AI girlfriend vs real relationship",
    "loneliness solution india",
    "mental health AI india",
    // ─ Hindi long-tail ─
    "AI dost hindi mein",
    "pyaar karne wali AI",
    "AI se baat karo hindi",
    "Hindi mein AI girlfriend",
    "AI girlfriend hindi mein baat karo",
    // ─ City-specific (BOFU local) ─
    "AI girlfriend Mumbai",
    "AI girlfriend Delhi",
    "AI girlfriend Bengaluru",
    "AI girlfriend Pune",
    "AI girlfriend Kolkata",
    "AI girlfriend Chennai",
    "AI girlfriend Jabalpur",
    "Delhi AI chat",
    "Bangalore AI companion",
    "best AI app for Indian men",
    // ─ Long-tail question keywords ─
    "how to get an AI girlfriend in India",
    "best AI companion for lonely men India",
    "AI girlfriend that speaks Hindi",
    "virtual relationship app India 2026",
    "AI girlfriend hindi mein",
    "can AI girlfriend actually love you",
    "how much does AI girlfriend cost India",
  ],
  alternates: {
    canonical: "https://heartecho.in/",
  },
  other: {
    rating: "RTA-5042-1996-1400-1577-RTA",
  },
};

export default function AppContainer() {
  const schemas = getHomepageSchema();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      />
      <Home />
    </>
  );
}
