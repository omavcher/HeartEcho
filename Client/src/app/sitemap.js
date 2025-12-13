import url from "../data/url";
import { blogPosts } from "../data/blogPosts";
import api from '../config/api';
import axios from "axios";

export default async function sitemap() {
  const now = new Date();

  // Static routes
  const staticRoutes = [
    '/',
    '/discover',
    '/hot-stories',
    '/90s-era',
    '/chatbox',
    '/profile',
    '/referral',
    '/referral/login',
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
    changeFrequency: path === '/' ? 'daily' : 'weekly',
    priority: path === '/' ? 1 : 0.8,
  }));

  // City routes (dynamic)
  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai',
    'Kolkata', 'Pune', 'Ahmedabad', 'Jaipur', 'Lucknow',
    'Goa', 'Chandigarh', 'Other'
  ];

  const cityRoutes = cities.map((city) => ({
    url: `${url}/city/${city.toLowerCase()}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Blog routes (from local data)
  const blogRoutes = blogPosts.map((post) => ({
    url: `${url}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  // Fetch dynamic story routes from API
  let storyRoutes = [];
  
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
  } catch (error) {
    console.error("Error fetching story slugs for sitemap:", error);
    // You might want to add fallback story routes here if API fails
  }

  // Combine all routes
  return [
    ...staticRoutes,
    ...cityRoutes,
    ...storyRoutes,
    ...blogRoutes
  ];
}