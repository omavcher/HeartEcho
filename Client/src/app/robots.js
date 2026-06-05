export default function robots() {
  const disallowList = [
    '/admin',
    '/api',
    '/dashboard',
    '/private',
    '/chatbox',
    '/profile',
    '/stories/edit',
    '/referral/*/dashboard',
    '/thank-you',
  ];

  const bots = [
    '*',
    'Googlebot',
    'Google-Extended',
    'ChatGPT-User',
    'OAI-SearchBot',
    'Bingbot',
    'PerplexityBot',
    'ClaudeBot',
  ];

  return {
    rules: bots.map((bot) => ({
      userAgent: bot,
      allow: '/',
      disallow: disallowList,
    })),
    sitemap: 'https://heartecho.in/sitemap.xml',
  };
}