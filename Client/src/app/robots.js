export default function robots() {
  const adminDisallow = [
    '/admin/',
    '/api/',
    '/chatbox',
    '/profile',
    '/stories/edit/',
    '/referral/*/dashboard',
    '/thank-you',
  ];

  return {
    rules: [
      // Default: all bots — allow everything except private pages
      {
        userAgent: '*',
        allow: '/',
        disallow: adminDisallow,
      },
      // Google AI crawlers — explicitly allow all public pages
      {
        userAgent: 'Google-Extended',
        allow: '/',
        disallow: adminDisallow,
      },
      // OpenAI / ChatGPT crawlers
      {
        userAgent: 'GPTBot',
        allow: '/',
        disallow: adminDisallow,
      },
      {
        userAgent: 'OAI-SearchBot',
        allow: '/',
        disallow: adminDisallow,
      },
      {
        userAgent: 'ChatGPT-User',
        allow: '/',
        disallow: adminDisallow,
      },
      // Perplexity AI
      {
        userAgent: 'PerplexityBot',
        allow: '/',
        disallow: adminDisallow,
      },
      // Anthropic / Claude
      {
        userAgent: 'ClaudeBot',
        allow: '/',
        disallow: adminDisallow,
      },
      {
        userAgent: 'anthropic-ai',
        allow: '/',
        disallow: adminDisallow,
      },
      // Meta AI
      {
        userAgent: 'FacebookBot',
        allow: '/',
        disallow: adminDisallow,
      },
    ],
    sitemap: 'https://heartecho.in/sitemap.xml',
  };
}