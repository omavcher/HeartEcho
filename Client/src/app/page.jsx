import Home from "../pages/Home";

export const metadata = {
  title: {
    absolute:
      "HeartEcho – Indian AI Girlfriend | Hindi AI Chat, Desi Roleplay & 18+ Companion",
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
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "HeartEcho",
    applicationCategory: "Social Networking Application",
    operatingSystem: "Web",
    description:
      "HeartEcho is an AI-powered virtual companion platform designed for Indian users. Experience realistic conversations, emotional support, and a customizable AI girlfriend or boyfriend that understands Hindi.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "INR",
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "4.8",
      ratingCount: "1250",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <Home />
    </>
  );
}
