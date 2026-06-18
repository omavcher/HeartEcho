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
    // General crawlers
    '*',
    // Google
    'Googlebot',
    'Googlebot-Image',
    'Googlebot-Video',
    'Google-Extended',
    // Brave Search (priority — required for Brave index)
    'BraveBot',
    // Bing / Microsoft
    'Bingbot',
    'msnbot',
    // Apple
    'Applebot',
    'AppleNewsBot',
    // DuckDuckGo
    'DuckDuckBot',
    // Yandex
    'YandexBot',
    'YandexImages',
    // AI / LLM search bots
    'ChatGPT-User',
    'OAI-SearchBot',
    'GPTBot',
    'PerplexityBot',
    'ClaudeBot',
    'anthropic-ai',
    'Amazonbot',
    // Social media crawlers
    'Twitterbot',
    'facebookexternalhit',
    'LinkedInBot',
    'WhatsApp',
    // Other
    'Slurp',
    'ia_archiver',
    'Baiduspider',
    'AhrefsBot',
    'SemrushBot',
  ];

  return {
    rules: [
      // Wildcard catch-all rule first
      {
        userAgent: '*',
        allow: '/',
        disallow: disallowList,
      },
      // Explicit full-allow for Brave Search bot
      {
        userAgent: 'BraveBot',
        allow: '/',
        disallow: disallowList,
      },
      // All other named bots
      ...bots.filter((b) => b !== '*' && b !== 'BraveBot').map((bot) => ({
        userAgent: bot,
        allow: '/',
        disallow: disallowList,
      })),
    ],
    sitemap: 'https://heartecho.in/sitemap.xml',
    host: 'https://heartecho.in',
  };
}