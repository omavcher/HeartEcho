import Home from "../pages/Home";
import { getHomepageSchema } from "../utils/schema";

export const metadata = {
  title: {
    absolute:
      "Indian AI Girlfriend — Hindi Chat & Roleplay | HeartEcho",
  },
  description:
    "India's #1 AI girlfriend app — chat in Hindi, Hinglish & English. Unlimited private conversations, AI memory, desi roleplay, and adult stories. 12,000+ happy members. Free to try. | HeartEcho",
  keywords: [
    // Top Search Console performers
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
    // Brand
    "HeartEcho",
    "HeartEcho AI",
    "heartecho.in",
    // Core product
    "AI girlfriend India",
    "virtual girlfriend Hindi",
    "AI companion India",
    "hindi AI chat",
    "desi AI companion",
    "Hinglish AI chat",
    "private AI chat India",
    "AI girlfriend deep memory",
    "Indian AI voice notes",
    // Long-tail
    "how to get an AI girlfriend in India",
    "best AI companion for lonely men India",
    "AI girlfriend that speaks Hindi",
    "virtual relationship app India 2025",
    "AI girlfriend hindi mein",
    "pyaar karne wali AI",
    "AI dost app hindi",
    "replika alternative for Indian users",
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
