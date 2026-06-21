import url from "../data/url";
import { blogPosts } from "../data/blogPosts";
import { citiesList } from "../data/cities";
import api from '../config/api';
import axios from "axios";
import fs from "fs";
import path from "path";

export default async function sitemap() {
  const now = new Date();

  // 1. Priority 1.0 (homepage)
  const homepageRoute = {
    url: `${url}/`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 1.0,
  };

  // 2. Priority 0.9 (main SEO landing pages)
  const landingPaths = [
    '/ai-girlfriend-hindi',
    '/virtual-girlfriend-india',
    '/indian-ai-girlfriend',
    '/hot-ai-girlfriend',
    '/free-ai-girlfriend',
    '/ai-boyfriend',
    '/replika-alternative-india',
    '/ai-se-baat-karo',
    '/ai-girlfriend-no-filter',
    '/ai-girlfriend-roleplay',
    '/ai-girlfriend-for-lonely',
    '/ai-girlfriend-voice-chat',
    '/best-ai-girlfriend-india',
    '/ai-chat-hindi',
    '/ai-friend-india',
  ];

  const landingRoutes = landingPaths.map((path) => ({
    url: `${url}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.9,
  }));

  // Other static pages
  const otherStaticPaths = [
    '/discover',
    '/hot-stories',
    '/90s-era',
    '/referral',
    '/privacy',
    '/terms',
    '/refund',
    '/about',
    '/contact',
    '/faq',
    '/features',
    '/what-is-ai-girlfriend',
    '/blog',
    '/reviews',
    '/subscribe',
    '/ai-sex-chat',
    '/heartecho-vs-candyai',
    '/heartecho-vs-talkie',
    '/heartecho-vs-character-ai',
    '/heartecho-vs-replika',
  ];

  const otherStaticRoutes = otherStaticPaths.map((path) => ({
    url: `${url}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/subscribe' || path === '/hot-stories' ? 0.95 : 0.8,
  }));

  // 3. Priority 0.8-0.85 (blog posts — new pillar posts get higher priority)
  const pillarSlugs = [
    'hindi-ai-chat-complete-guide-2026',
    'ai-girlfriend-india-future-2026',
    'desi-ai-companion-indian-culture-technology',
    'heartecho-vs-character-ai-india-2026',
    'what-is-ai-girlfriend-beginners-guide-india',
    'loneliness-india-2026-ai-companion-solution',
  ];
  const blogRoutes = blogPosts.map((post) => ({
    url: `${url}/blog/${post.slug}`,
    lastModified: new Date(post.date || now),
    changeFrequency: 'monthly',
    priority: pillarSlugs.includes(post.slug) ? 0.85 : 0.8,
  }));

  // 4. City pages — prioritised by real user data
  const payingCities  = ['mumbai','pune','jabalpur','bangalore','bengaluru','kolkata','chennai','siliguri','bardhaman'];
  const activeCities  = ['delhi','new-delhi','indore','bhopal','raipur','jaipur','meerut','ludhiana','moradabad','patna','gurgaon','gurugram','jodhpur','ahmedabad','chandigarh'];
  const cityRoutes = citiesList.map((city) => {
    const key = city.key.toLowerCase();
    const priority = payingCities.includes(key) ? 0.95 : activeCities.includes(key) ? 0.90 : 0.75;
    return {
      url: `${url}/city/${city.key}`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority,
    };
  });



  // Fetch dynamic story routes from API
  let storyRoutes = [];
  let fetchedLiveStoryRoutes = [];
  
  try {
    const response = await axios.get(`${api.Url}/story/get-slug`);
    
    if (response.data.success && response.data.stories) {
      storyRoutes = response.data.stories.map((story) => ({
        url: `${url}/hot-stories/${story.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.9,
      }));
    }

    const liveStoryRes = await axios.get(`${api.Url}/live-story/stories`);
    if (liveStoryRes.data.success && liveStoryRes.data.stories) {
      fetchedLiveStoryRoutes = liveStoryRes.data.stories.map((story) => ({
        url: `${url}/live-a-story/${story.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.8,
      }));
    }
  } catch (error) {
    console.error("Error fetching dynamically stories for sitemap:", error);
  }

  const liveStoryRoutes = [
    { url: `${url}/live-a-story`, lastModified: now, changeFrequency: 'weekly', priority: 0.85 },
    ...fetchedLiveStoryRoutes
  ];

  // Combine all routes
  const allRoutes = [
    homepageRoute,
    ...landingRoutes,
    ...otherStaticRoutes,
    ...blogRoutes,
    ...cityRoutes,
    ...liveStoryRoutes,
    ...storyRoutes
  ];

  // Generate the XML content
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allRoutes.map(route => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified.toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

  // Write main sitemap.xml to public/
  try {
    const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(publicPath, xmlContent, 'utf8');
  } catch (err) {
    console.error("Failed to write static sitemap.xml to public folder:", err);
  }

  // Write secondary blog sitemap for faster blog indexing
  const blogXmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${blogRoutes.map(route => `  <url>
    <loc>${route.url}</loc>
    <lastmod>${route.lastModified instanceof Date ? route.lastModified.toISOString().split('T')[0] : new Date(route.lastModified).toISOString().split('T')[0]}</lastmod>
    <changefreq>${route.changeFrequency}</changefreq>
    <priority>${route.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;

  try {
    const blogSitemapPath = path.join(process.cwd(), 'public', 'sitemap-blog.xml');
    fs.writeFileSync(blogSitemapPath, blogXmlContent, 'utf8');
  } catch (err) {
    console.error("Failed to write sitemap-blog.xml:", err);
  }

  return allRoutes;
}