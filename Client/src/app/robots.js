export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://heartecho.in/sitemap.xml',
    host: 'https://heartecho.in',  // Tells crawlers the canonical host (non-www)
  };
}