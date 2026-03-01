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
          // Decent Core Keywords
          `${story.category} story`,
          `${story.category} romantic kahani`,
          `${story.characterName} story`,
          `${story.characterName} romance`,
          `${story.city} companionship story`,
          `${story.city} love stories`,
          `${story.city} ki kahani`,
        
          // Decent Story Keywords
          'romantic story',
          'love story',
          'college romance story',
          'best friends love story',
          'office romance',
          'husband wife love story',
          'emotional love story',
          'heart touching story',
          'true love kahani',
        
          // AI Roleplay Keywords
          'ai companion story hindi',
          'romantic roleplay',
          'ai partner chat',
          'indian ai companion roleplay',
          'sweet desi ai story',
        
          // Generic High-Volume Winners
          'new love kahani 2026',
          'hindi romance stories',
          'desi love stories',
          'indian romantic kahani',
          'sweet indian stories',
        
          // Append your existing tags
          ...(story.tags || [])
        ].join(', '),
      authors: [{ name: 'HeartEcho' }],
      openGraph: {
        title: `${story.title} - ${story.characterName}'s Story`,
        description: description,
        url: `https://heartecho.in/hot-stories/${slug}`,
        siteName: 'HeartEcho',
        images: [
          {
            url: story.backgroundImage || '/api/placeholder/1200/630',
            width: 1200,
            height: 630,
            alt: `${story.title} - ${story.characterName}'s Story`,
          }
        ],
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: story.title,
        description: description,
        images: [ story.backgroundImage || '/api/placeholder/400/400'],
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
        canonical: `https://heartecho.in/hot-stories/${slug}`,
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