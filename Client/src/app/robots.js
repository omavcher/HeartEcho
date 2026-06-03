export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin/',
          '/api/',
          '/chatbox',
          '/profile',
          '/stories/edit/',
          '/referral/*/dashboard',
          '/thank-you',
          '/subscribe'
        ],
      },
    ],
    sitemap: 'https://heartecho.in/sitemap.xml',
    host: 'https://heartecho.in',  // Tells crawlers the canonical host (non-www)
  };
}