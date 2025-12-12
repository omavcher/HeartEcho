// app/hot-stories/page.jsx - Server Component
import { Suspense } from 'react';
import Footer from '../../components/Footer';
import './hotStories.css';
import { fetchStoriesData } from './actions';
import { HotStoriesClient } from './HotStoriesClient';
import Loading from './loading';

// City images data
const cityInfo = {
  delhi: {
    title: "Delhi - The Heart of India",
    description: "Experience the vibrant culture, historic landmarks, and modern lifestyle of India's capital city through interactive stories.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/delhi_kzwnx9.webp"
  },
  mumbai: {
    title: "Mumbai - The City of Dreams",
    description: "Explore the bustling streets, Bollywood glamour, and coastal charm of India's financial capital.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570918/mumbai_iul7vz.webp"
  },
  bangalore: {
    title: "Bangalore - The Silicon Valley of India",
    description: "Discover the tech hub's vibrant pubs, beautiful gardens, and cosmopolitan lifestyle.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/bangalore_uvjbmi.webp"
  },
  hyderabad: {
    title: "Hyderabad - The City of Pearls",
    description: "Discover the rich history, biryani, and tech revolution of this historic city.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/hyderabad_l0k1jo.webp"
  },
  chennai: {
    title: "Chennai - The Cultural Capital",
    description: "Immerse in the rich traditions, classical arts, and coastal beauty of South India.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/chennai_e0ftkb.webp"
  },
  kolkata: {
    title: "Kolkata - The City of Joy",
    description: "Experience the intellectual capital's literary heritage, artistic soul, and delicious cuisine.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570919/kolkata_vmxice.webp"
  },
  pune: {
    title: "Pune - Oxford of the East",
    description: "Explore the educational hub, cultural heritage, and pleasant weather of this vibrant city.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/pune_q2kxso.webp"
  },
  ahmedabad: {
    title: "Ahmedabad - The Manchester of India",
    description: "Discover the historic city known for its textile industry, rich heritage, and delicious Gujarati cuisine.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570914/ahmedabad_ksmdpo.webp"
  },
  jaipur: {
    title: "Jaipur - The Pink City",
    description: "Experience the royal heritage, magnificent forts, and vibrant culture of Rajasthan's capital.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/jaipur_qxcfb7.webp"
  },
  lucknow: {
    title: "Lucknow - The City of Nawabs",
    description: "Immerse in the refined culture, exquisite cuisine, and historical monuments of this gracious city.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570916/lucknow_gcma1c.webp"
  },
  goa: {
    title: "Goa - The Pearl of the Orient",
    description: "Discover the sun-kissed beaches, Portuguese heritage, and vibrant nightlife of India's coastal paradise.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570915/goa_rqir0f.webp"
  },
  chandigarh: {
    title: "Chandigarh - The City Beautiful",
    description: "Experience the planned city's modernist architecture, serene gardens, and high quality of life.",
    image: "https://res.cloudinary.com/dx6rjowfb/image/upload/v1765570917/chandigarh_gcgqak.webp"
  }
};

// All Indian cities array with optimized data
const allIndianCities = [
  { name: 'Mumbai', key: 'mumbai', tagline: 'City of Dreams' },
  { name: 'Delhi', key: 'delhi', tagline: 'Heart of India' },
  { name: 'Bangalore', key: 'bangalore', tagline: 'Silicon Valley' },
  { name: 'Hyderabad', key: 'hyderabad', tagline: 'City of Pearls' },
  { name: 'Chennai', key: 'chennai', tagline: 'Cultural Capital' },
  { name: 'Kolkata', key: 'kolkata', tagline: 'City of Joy' },
  { name: 'Pune', key: 'pune', tagline: 'Oxford of the East' },
  { name: 'Ahmedabad', key: 'ahmedabad', tagline: 'Manchester of India' },
  { name: 'Jaipur', key: 'jaipur', tagline: 'Pink City' },
  { name: 'Lucknow', key: 'lucknow', tagline: 'City of Nawabs' },
  { name: 'Goa', key: 'goa', tagline: 'Pearl of the Orient' },
  { name: 'Chandigarh', key: 'chandigarh', tagline: 'City Beautiful' }
];

// Generate metadata for SEO
export async function generateMetadata() {
  const stories = await fetchStoriesData();
  const storyCount = stories.length;
  
  return {
    title: 'HeartEcho Stories | Sexy Indian Sex Stories - 18+ Bhabhi, Aunty, Devar-Bhabhi Chudai Kahani',
    description: `1000+ Real Hindi Sex Stories - Mumbai Bhabhi, Delhi College Girl, Punjabi Aunty, Devar-Bhabhi, Cheating Wife, Maid, Muslim Hijab Girl. Daily new hot desi chudai kahani with pictures & AI roleplay chat. Free & Uncensored`,
    keywords: [
      'indian sex stories',
      'hindi sex kahani',
      'bhabhi sex story',
      'devar bhabhi chudai',
      'mumbai bhabhi sex',
      'desi sex stories',
      'aunty sex story',
      'cheating wife story',
      'sexy stories hindi',
      'nsfw stories india',
      'hot bhabhi chudai',
      'gaon ki chudai',
      'kaamwali bai sex',
      'muslim bhabhi story',
      'college girl sex story',
      'suhagraat sex story',
      'savita bhabhi type',
      'velamma stories',
      'real incest stories',
      'mature aunty sex',
      'forced sex story',
      'blackmail chudai',
      'train me chudai',
      'office sex story',
      'teacher student sex',
      '18+ sex stories',
      'new sex kahani 2025',
      'ai girlfriend stories',
      'sexy ai chat stories'
    ],
        authors: [{ name: 'HeartEcho' }],
    openGraph: {
      title: 'HeartEcho Stories | Sexy Indian Stories Indian Cities',
      description: `Discover ${storyCount} interactive stories from cities across India`,
      url: 'https://heartecho.in/hot-stories',
      siteName: 'HeartEcho',
      images: [
        {
          url: 'https://heartecho.in/og-image4.webp',
          width: 1200,
          height: 630,
          alt: 'HeartEcho Stories',
        },
      ],
      locale: 'en_US',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: 'HeartEcho Stories | Interactive Stories from Indian Cities',
      description: `Explore ${storyCount} interactive stories from cities across India`,
      images: ['https://heartecho.in/og-image4.webp'],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    alternates: {
      canonical: 'https://heartecho.in/hot-stories',
    },
  };
}

// Main page component (Server Component)
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

  return (
    <>
      <main className="container">
        {/* Server-rendered static content for SEO */}
        <div className="seo-content" style={{ display: 'none' }}>
          <h1>HeartEcho Stories - Interactive Stories from Indian Cities</h1>
          <p>Explore interactive stories from major cities across India including Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata, Pune, Ahmedabad, Jaipur, Lucknow, Goa, and Chandigarh.</p>
          <ul>
            {allIndianCities.map(city => (
              <li key={city.key}>
                <a href={`/city/${city.key}`}>{city.name} - {city.tagline}</a>
              </li>
            ))}
          </ul>
        </div>

        {/* Live Updates Banner */}
        <div className="live-updates-banner">
          <span className="live-dot"></span>
          <span className="live-text">{initialStories.length} stories available</span>
          <button className="explore-button">
            Explore
          </button>
        </div>

        {/* Mobile Header */}
        <header className="mobile-header">
          <h1 className="mobile-title">HeartEcho Stories</h1>
          <p className="mobile-subtitle">Explore stories from cities across India</p>
        </header>

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