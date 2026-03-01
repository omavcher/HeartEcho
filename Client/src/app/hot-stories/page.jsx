// app/hot-stories/page.jsx - Server Component
import { Suspense } from 'react';
import Footer from '../../components/Footer';
import './hotStories.css';
import { fetchStoriesData } from './actions';
import { HotStoriesClient } from './HotStoriesClient';
import Loading from './loading';

const cityInfo = {
  delhi: {
    title: "Delhi - The Heart of India",
    description: "Experience the vibrant culture, historic landmarks, and modern lifestyle of India's capital city through interactive stories.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/delhi_kzwnx9.webp",
    alt: "Delhi city skyline - Hot Indian romantic stories and bold tales from Delhi companions"
  },
  mumbai: {
    title: "Mumbai - The City of Dreams",
    description: "Explore the bustling streets, Bollywood glamour, and coastal charm of India's financial capital.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570918/mumbai_iul7vz.webp",
    alt: "Mumbai skyline - Desi romance stories with Mumbai bhabhi and aunty intimate kahani"
  },
  bangalore: {
    title: "Bangalore - The Silicon Valley of India",
    description: "Discover the tech hub's vibrant pubs, beautiful gardens, and cosmopolitan lifestyle.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/bangalore_uvjbmi.webp",
    alt: "Bangalore gardens - Hindi romantic stories featuring Bangalore college girl and office aunty roleplay"
  },
  hyderabad: {
    title: "Hyderabad - The City of Pearls",
    description: "Discover the rich history, biryani, and tech revolution of this historic city.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/hyderabad_l0k1jo.webp",
    alt: "Hyderabad Charminar - Hyderabad housewife romance and Muslim bhabhi intimate stories"
  },
  chennai: {
    title: "Chennai - The Cultural Capital",
    description: "Immerse in the rich traditions, classical arts, and coastal beauty of South India.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/chennai_e0ftkb.webp",
    alt: "Chennai beach - Tamil aunty romantic stories and Chennai bhabhi kahani with pictures"
  },
  kolkata: {
    title: "Kolkata - The City of Joy",
    description: "Experience the intellectual capital's literary heritage, artistic soul, and delicious cuisine.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570919/kolkata_vmxice.webp",
    alt: "Kolkata Howrah Bridge - Bengali boudi romantic stories and Kolkata mature aunty roleplay"
  },
  pune: {
    title: "Pune - Oxford of the East",
    description: "Explore the educational hub, cultural heritage, and pleasant weather of this vibrant city.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/pune_q2kxso.webp",
    alt: "Pune Shaniwar Wada - Pune college girl intimate tales and Marathi aunty romantic kahani"
  },
  ahmedabad: {
    title: "Ahmedabad - The Manchester of India",
    description: "Discover the historic city known for its textile industry, rich heritage, and delicious Gujarati cuisine.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570914/ahmedabad_ksmdpo.webp",
    alt: "Ahmedabad Sabarmati Ashram - Gujarati bhabhi romance stories and Ahmedabad aunty intimate tales"
  },
  jaipur: {
    title: "Jaipur - The Pink City",
    description: "Experience the royal heritage, magnificent forts, and vibrant culture of Rajasthan's capital.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/jaipur_qxcfb7.webp",
    alt: "Jaipur Hawa Mahal - Rajasthani aunty romantic stories and Jaipur royal bhabhi kahani"
  },
  lucknow: {
    title: "Lucknow - The City of Nawabs",
    description: "Immerse in the refined culture, exquisite cuisine, and historical monuments of this gracious city.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/lucknow_gcma1c.webp",
    alt: "Lucknow Bara Imambara - Lucknow nawabi bhabhi stories and Muslim girl romantic kahani"
  },
  goa: {
    title: "Goa - The Pearl of the Orient",
    description: "Discover the sun-kissed beaches, Portuguese heritage, and vibrant nightlife of India's coastal paradise.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/goa_rqir0f.webp",
    alt: "Goa beaches - Goan girlfriend intimate stories and beach aunty romantic tales"
  },
  chandigarh: {
    title: "Chandigarh - The City Beautiful",
    description: "Experience the planned city's modernist architecture, serene gardens, and high quality of life.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/chandigarh_gcgqak.webp",
    alt: "Chandigarh Rock Garden - Punjabi kudi romantic stories and Chandigarh bhabhi romance"
  }
};

// All Indian cities array with optimized data (added alt for SEO)
const allIndianCities = [
  { name: 'Mumbai', key: 'mumbai', tagline: 'City of Dreams', alt: 'Mumbai city image for desi romantic stories' },
  { name: 'Delhi', key: 'delhi', tagline: 'Heart of India', alt: 'Delhi city image for hindi roleplay kahani' },
  { name: 'Bangalore', key: 'bangalore', tagline: 'Silicon Valley', alt: 'Bangalore city image for office romantic stories' },
  { name: 'Hyderabad', key: 'hyderabad', tagline: 'City of Pearls', alt: 'Hyderabad city image for muslim bhabhi stories' },
  { name: 'Chennai', key: 'chennai', tagline: 'Cultural Capital', alt: 'Chennai city image for tamil aunty intimate tales' },
  { name: 'Kolkata', key: 'kolkata', tagline: 'City of Joy', alt: 'Kolkata city image for bengali romantic kahani' },
  { name: 'Pune', key: 'pune', tagline: 'Oxford of the East', alt: 'Pune city image for college girl roleplay' },
  { name: 'Ahmedabad', key: 'ahmedabad', tagline: 'Manchester of India', alt: 'Ahmedabad city image for gujarati bhabhi tales' },
  { name: 'Jaipur', key: 'jaipur', tagline: 'Pink City', alt: 'Jaipur city image for rajasthani aunty stories' },
  { name: 'Lucknow', key: 'lucknow', tagline: 'City of Nawabs', alt: 'Lucknow city image for nawabi intimate tales' },
  { name: 'Goa', key: 'goa', tagline: 'Pearl of the Orient', alt: 'Goa city image for beach romantic stories' },
  { name: 'Chandigarh', key: 'chandigarh', tagline: 'City Beautiful', alt: 'Chandigarh city image for punjabi kudi kahani' }
];

// Generate metadata for SEO (Enhanced with more OG images and image-focused keywords)
export async function generateMetadata() {
  const stories = await fetchStoriesData();
  const storyCount = stories.length;
  
  // Dynamically generate OG images from top stories for better Google Images exposure
  const ogImages = stories.slice(0, 5).map(story => ({
    url: story.backgroundImage,
    width: 1200,
    height: 630,
    alt: `${story.title} - Hot Hindi romantic story with ${story.category} in ${story.city} - Desi roleplay kahani image`
  }));

  return {
    title: "HeartEcho Stories: Uncensored Hindi Roleplay & Interactive Desi Erotica",
    description: `Explore ${storyCount}+ private Hindi intimate and interactive roleplay stories. Discover uncensored desi tales with bhabhis, college friends, and local companions. Featuring AI-generated visuals and voice notes. 100% secure and Indian-made.`,
    
    keywords: [
      // High-Volume "Safe-Explicit" terms
      "Hindi interactive stories",
      "uncensored desi roleplay",
      "HeartEcho AI stories",
      "Indian AI bhabhi tales",
      "private Hindi intimate tales",
      "desi bhabhi romance stories",
      "AI generated Indian stories",
      "Hinglish romantic roleplay",
      "interactive audio stories India",
      // Intent-based (Tharki but safe)
      "unfiltered desi stories",
      "Indian bhabhi virtual companion",
      "best Hindi romantic roleplay 2026",
      "HeartEcho hot stories India",
      "AI bhabhi deep memory stories",
      "desi college girl chat stories"
    ],

    authors: [{ name: 'HeartEcho' }],
    
    alternates: {
      canonical: 'https://heartecho.in/hot-stories',
    },

    openGraph: {
      title: 'HeartEcho Stories | Interactive Indian Roleplay & Uncensored Tales',
      description: `Dive into ${storyCount}+ uncensored desi stories with high-quality visuals. Experience the most realistic Hindi AI roleplay available in India.`,
      url: 'https://heartecho.in/hot-stories',
      siteName: 'HeartEcho AI',
      images: [
        {
          url: 'https://heartecho.in/og-image-stories.webp', 
          width: 1200,
          height: 630,
          alt: 'HeartEcho Stories - Interactive Hindi Roleplay',
        },
      ],
      locale: 'en_IN',
      type: 'website',
    },

    twitter: {
      card: 'summary_large_image',
      title: 'HeartEcho Stories: Best Hindi AI Roleplay & Desi Tales',
      description: '1000+ interactive stories with Indian AI personalities. Private and uncensored.',
      images: ['https://heartecho.in/og-image-stories.webp'],
    },

    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    category: 'Entertainment', 
    classification: 'Lifestyle',
  };
}

export default async function HotStoriesPage() {
  // Fetch initial data on server
  const initialStories = await fetchStoriesData();
  
  // Extract unique categories and cities for initial render
  const initialCategories = ['All', ...new Set(initialStories
    .map(story => story.category)
    .filter(Boolean))];
  const initialCities = ['All Cities', ...new Set(initialStories
    .map(story => story.city)
    .filter(Boolean))];

  // Generate JSON-LD Schema for ItemList with ImageObjects (Boosts Google Images)
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "HeartEcho Hot Stories Collection",
    "description": "Collection of hot Hindi sex stories with erotic images and AI roleplay from Indian cities",
    "itemListElement": initialStories.map((story, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "CreativeWork",
        "name": story.title,
        "description": `${story.title} - Steamy desi romance story in ${story.category} category from ${story.city}`,
        "image": {
          "@type": "ImageObject",
          "url": story.backgroundImage,
          "contentUrl": story.backgroundImage,
          "width": 800,
          "height": 600,
          "caption": `${story.title} thumbnail - Hot Hindi romantic image for ${story.category} story in ${story.city}`,
          "representativeOfPage": true
        }
      }
    }))
  };

  return (
    <>
      {/* Add Schema Script for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />

      <main className="container">
       

        {/* Client Component with Suspense */}
        <Suspense fallback={<Loading />}>
          <HotStoriesClient 
            initialStories={initialStories}
            initialCategories={initialCategories}
            initialCities={initialCities}
            allIndianCities={allIndianCities}
            cityInfo={cityInfo}
          />
        </Suspense>
      </main>
      
      <Footer />
    </>
  );
}