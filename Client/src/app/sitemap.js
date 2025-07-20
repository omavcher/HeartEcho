import url from "../data/url";
import { blogPosts } from "../data/blogPosts";

export default function sitemap() {
  const now = new Date();

  const staticRoutes = [
    '/',
    '/discover',
    '/chatbox',
    '/profile',
    '/privacy',
    '/terms',
    '/refund',
    '/about',
    '/contact',
    '/faq',
    '/blog'
  ].map((path) => ({
    url: `${url}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'yearly' : 'monthly',
    priority: path === '/' ? 1 : 0.7,
  }));

  const blogRoutes = blogPosts.map((post) => ({
    url: `${url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...staticRoutes, ...blogRoutes];
}
