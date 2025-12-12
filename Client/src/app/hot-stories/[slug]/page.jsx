// app/hot-stories/[slug]/page.jsx
import { notFound } from 'next/navigation';
import StoryPageClient from './StoryPageClient';
import Footer from '../../../components/Footer';
import api from '../../../config/api';

// Generate metadata dynamically
export async function generateMetadata({ params }) {
  try {
    const { slug } = await params;
    
    // Fetch story data for metadata
    const response = await fetch(`${api.Url}/story/getbyid/${slug}`, {
      next: { revalidate: 300 }
    });
    
    if (!response.ok) {
      return getDefaultMetadata();
    }
    
    const json = await response.json();
    
    if (!json.success || !json.data) {
      return getDefaultMetadata();
    }
    
    const story = json.data;
    const description = story.description || story.excerpt || '';
    
    return {
      title: `${story.title} - ${story.characterName} ki Hot ${story.category} Story | HeartEcho`,
      description: description.length > 155 ? 
        description.substring(0, 152) + '...' : 
        description || `Read ${story.characterName}'s ${story.category} story from ${story.city}.`,
        keywords: [
          // Core Money Keywords (1000–10000 monthly searches each in India)
          `${story.category} sex story`,
          `${story.category} chudai kahani`,
          `${story.characterName} sex story`,
          `${story.characterName} chudai`,
          `${story.city} bhabhi sex story`,
          `${story.city} aunty chudai`,
          `${story.city} sex stories`,
          `${story.city} ki chudai`,
        
          // Ultra High-CTR Dirty Keywords (these get clicked like crazy)
          'horny bhabhi story',
          'devar ne bhabhi ko choda',
          'bhabhi ki chut',
          'mumbai bhabhi sex',
          'delhi college girl sex story',
          'punjabi bhabhi chudai',
          'muslim bhabhi sex story',
          'hijab me chudai',
          'kaamwali bai sex',
          'maid ne malik se chudwaya',
          'cheating wife sex story',
          'biwi ki chudai',
          'sasur bahu sex',
          'maa beta sex story',
          'behan bhai chudai',
          'gaon ki chudai',
          'khet me chudai',
          'train me chudai',
          'bus me group sex',
          'blackmail sex story',
          'zabardasti choda',
          'suhagraat sex story',
          'virgin ladki ki seal tuti',
          'office me boss ne choda',
          'teacher student sex',
          'savita bhabhi wali story',
          'velamma type kahani',
        
          // NSFW + AI Roleplay Keywords (new goldmine 2025)
          'nsfw sex story hindi',
          '18+ chudai kahani',
          'uncensored sex stories',
          'ai girlfriend sex chat',
          'sexy ai bhabhi roleplay',
          'hot desi ai sex story',
        
          // Generic High-Volume Winners
          'new sex kahani 2026',
          'hindi sex stories',
          'desi chudai stories',
          'real incest stories',
          'indian sex kahani',
          'hot indian stories',
        
          // Append your existing tags
          ...(story.tags || [])
        ].join(', '),
      authors: [{ name: 'HeartEcho' }],
      openGraph: {
        title: `${story.title} - ${story.characterName}'s Story`,
        description: description,
        url: `https://heartecho.com/hot-stories/${slug}`,
        siteName: 'HeartEcho',
        images: [
          {
            url: story.backgroundImage || '/api/placeholder/1200/630',
            width: 1200,
            height: 630,
            alt: `${story.title} - ${story.characterName}'s Story`,
          },
          {
            url: story.characterAvatar || '/api/placeholder/400/400',
            width: 400,
            height: 400,
            alt: story.characterName,
          }
        ].filter(img => img.url),
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: story.title,
        description: description,
        images: [story.characterAvatar || story.backgroundImage || '/api/placeholder/400/400'],
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
        canonical: `https://heartecho.com/hot-stories/${slug}`,
      },
    };
    
  } catch (error) {
    console.error('Error generating metadata:', error);
    return getDefaultMetadata();
  }
}

function getDefaultMetadata() {
  return {
    title: 'HeartEcho Stories - Interactive Stories from Indian Cities',
    description: 'Explore interactive stories from major cities across India. Discover stories from Mumbai, Delhi, Bangalore, Hyderabad, Chennai, Kolkata and more.',
  };
}

// Main page component
export default async function StoryPage({ params }) {
  try {
    // Await the params to get the slug
    const { slug } = await params;
    
    // Fetch story data
    const storyResponse = await fetch(`${api.Url}/story/getbyid/${slug}`, {
      next: { revalidate: 60 }
    });
    
    if (!storyResponse.ok) {
      notFound();
    }
    
    const storyJson = await storyResponse.json();
    
    if (!storyJson.success || !storyJson.data) {
      notFound();
    }
    
    const storyData = storyJson.data;
    
    // Fetch related stories
    let relatedStories = [];
    try {
      const relatedResponse = await fetch(`${api.Url}/story`, {
        next: { revalidate: 120 }
      });
      
      if (relatedResponse.ok) {
        const relatedJson = await relatedResponse.json();
        if (relatedJson.success && relatedJson.data) {
          relatedStories = relatedJson.data
            .filter(story => 
              story._id !== storyData._id && 
              (story.category === storyData.category || story.city === storyData.city)
            )
            .slice(0, 3);
        }
      }
    } catch (error) {
      console.error('Error fetching related stories:', error);
    }
    
    return (
      <>
        <StoryPageClient 
          initialStory={storyData}
          initialRelatedStories={relatedStories}
          slug={slug}
        />
        <Footer />
      </>
    );
    
  } catch (error) {
    console.error('Error in StoryPage:', error);
    notFound();
  }
}