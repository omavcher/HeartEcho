export default function robots() {
    return {
      rules: {
        userAgent: '*',
        allow: '/',
        disallow: '/admin/',
      },
      sitemap: 'https://heartecho.in/sitemap.xml',
    }
  }