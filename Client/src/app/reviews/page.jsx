import ReviewsPage from '../../components/ReviewsPage';

export const metadata = {
  title: 'HeartEcho Reviews — 100+ Real Member Stories | AI Companion App',
  description:
    'Read 100+ verified reviews from HeartEcho premium members across India. See real stories about AI memory, unlimited conversations, Hot Stories, Live interactions, and 90s love letters. Join 12,000+ happy members.',
  keywords:
    'HeartEcho reviews, AI companion app reviews, HeartEcho testimonials, AI girlfriend app India, HeartEcho premium reviews, real user reviews HeartEcho',
  openGraph: {
    title: 'HeartEcho Reviews — 100+ Verified Member Stories',
    description:
      'Real stories from 12,000+ HeartEcho premium members. AI companion that remembers you, unlimited conversations, Hot Stories, Live interactions and more — starting ₹299/year.',
    url: 'https://heartecho.in/reviews',
    siteName: 'HeartEcho',
    type: 'website',
    images: [
      {
        url: 'https://heartecho.in/og-reviews.jpg',
        width: 1200,
        height: 630,
        alt: 'HeartEcho Reviews — Real Member Stories',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeartEcho Reviews — 100+ Verified Member Stories',
    description:
      'Real stories from HeartEcho premium members. AI that remembers you, unlimited chats, and much more — ₹299/year.',
  },
  alternates: {
    canonical: 'https://heartecho.in/reviews',
  },
};

// ── JSON-LD Structured Data (Google Rich Results) ─────────────────────────────
function ReviewsJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: 'HeartEcho Premium',
    description:
      'AI companion app with unlimited conversations, deep memory, Live interactions, Hot Stories, and 90s style love letters.',
    url: 'https://heartecho.in',
    brand: { '@type': 'Brand', name: 'HeartEcho' },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '100',
      bestRating: '5',
      worstRating: '1',
    },
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function Page() {
  return (
    <>
      <ReviewsJsonLd />
      <ReviewsPage />
    </>
  );
}
