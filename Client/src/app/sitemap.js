import url from "../data/url";
import { blogPosts } from "../data/blogPosts";
import api from '../config/api';
import axios from "axios";
import { citiesList } from "../data/cities";

export default async function sitemap() {
  const now = new Date();

  // Static routes
  const staticRoutes = [
    '/',
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
  ].map((path) => ({
    url: `${url}${path}`,
    lastModified: now,
    changeFrequency: path === '/' ? 'daily' : ['reviews', '/ai-sex-chat'].includes(path) ? 'weekly' : 'weekly',
    priority:
      path === '/' ? 1 :
      path === '/reviews' || path === '/ai-sex-chat' ? 0.9 :
      path === '/subscribe' || path === '/hot-stories' ? 0.95 :
      0.8,
  }));

  // City routes (dynamic - all 170+ cities from citiesList)
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

  // Blog routes (from local data)
  const blogRoutes = blogPosts.map((post) => ({
    url: `${url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Combine all routes
  return [
    ...staticRoutes,
    ...cityRoutes,
    ...liveStoryRoutes,
    ...storyRoutes,
    ...blogRoutes
  ];
}