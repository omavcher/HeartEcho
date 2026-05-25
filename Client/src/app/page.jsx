import Home from "../pages/Home";

export const metadata = {
  title: {
    absolute:
      "HeartEcho – AI Girlfriend in India | Hindi AI Chat & Virtual Companion",
  },
  description:
    "Experience the best AI girlfriend app in India. Get a virtual AI companion that speaks Hindi, remembers conversations, and provides emotional support. Safe, private, and 100% Hindi-compatible. | HeartEcho",
  keywords: [
    "how to get an AI girlfriend in India",
    "best AI companion for lonely men India",
    "replika alternative for Indian users",
    "is AI girlfriend safe in India",
    "AI girlfriend that speaks Hindi",
    "virtual relationship app India 2025",
    "AI boyfriend for women India",
    "does AI girlfriend remember conversations",
    "tier 2 city loneliness India solution",
    "AI girlfriend hindi mein",
    "virtual girlfriend hindi",
    "AI saathi app",
    "akela feel karna app",
    "AI baat karo hindi",
    "pyaar karne wali AI",
    "AI dost app hindi",
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
