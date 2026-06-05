import url from "../data/url";
import { blogPosts } from "../data/blogPosts";
import api from '../config/api';
import axios from "axios";
import { citiesList } from "../data/cities";
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
    '/blog',
    '/reviews',
    '/subscribe',
    '/ai-sex-chat',
    '/heartecho-vs-candyai',
    '/heartecho-vs-talkie',
  ];

  const otherStaticRoutes = otherStaticPaths.map((path) => ({
    url: `${url}${path}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: path === '/subscribe' || path === '/hot-stories' ? 0.95 : 0.8,
  }));

  // 3. Priority 0.8 (blog posts)
  const blogRoutes = blogPosts.map((post) => ({
    url: `${url}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  // 4. Priority 0.7 (persona pages)
  const personaNames = [
    'priya',
    'ananya',
    'riya',
    'aaradhya',
    'kiara',
    'anita',
    'neha',
    'sonali',
    'eshani',
    'yashita',
    'avika',
    'mohini',
    'suhani',
    'aryan',
    'kabir',
    'rohan',
    'aman',
    'dev',
    'vikram',
    'arjun',
    'rahul',
    'zayn',
    'viraj',
    'aditya',
    'rajveer',
    'gautam',
    'rishi',
    'ishaan',
    'anubhav',
    'karan',
    'aashish',
    'keshav',
    'devesh',
    'amit',
    'sameer',
    'raj',
    'ramesh'
  ];

  const personaRoutes = personaNames.map((name) => ({
    url: `${url}/chat/${name}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // 5. City routes (dynamic)
  const cityRoutes = citiesList.map((city) => ({
    url: `${url}/city/${city.key}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

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
    ...personaRoutes,
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

  // Write statically to public/sitemap.xml
  try {
    const publicPath = path.join(process.cwd(), 'public', 'sitemap.xml');
    fs.writeFileSync(publicPath, xmlContent, 'utf8');
  } catch (err) {
    console.error("Failed to write static sitemap.xml to public folder:", err);
  }

  return allRoutes;
}