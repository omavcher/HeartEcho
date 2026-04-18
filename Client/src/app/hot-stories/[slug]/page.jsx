// app/hot-stories/[slug]/page.jsx
import { notFound } from 'next/navigation';
import StoryPageClient from './StoryPageClient';
import Footer from '../../../components/Footer';
import api from '../../../config/api';

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

    // ── JSON-LD: Article Schema ──────────────────────────────────────────────
    const pageUrl = `https://heartecho.in/hot-stories/${slug}`;
    const description = storyData.description || storyData.excerpt || `${storyData.characterName}'s ${storyData.category} story from ${storyData.city}.`;

    // Build a flat list of ALL images on this page for Google Images
    const allImages = [
      storyData.backgroundImage,
      ...(storyData.imageAlbum || []),
      storyData.characterAvatar,
    ].filter(Boolean);

    const articleSchema = {
      "@context": "https://schema.org",
      "@type": "Article",
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": pageUrl
      },
      "headline": storyData.title,
      "description": description,
      "datePublished": storyData.createdAt || new Date().toISOString(),
      "dateModified": storyData.updatedAt || storyData.createdAt || new Date().toISOString(),
      "author": {
        "@type": "Organization",
        "name": "HeartEcho",
        "url": "https://heartecho.in"
      },
      "publisher": {
        "@type": "Organization",
        "name": "HeartEcho",
        "url": "https://heartecho.in",
        "logo": {
          "@type": "ImageObject",
          "url": "https://heartecho.in/logo.webp",
          "width": 200,
          "height": 60
        }
      },
      // Primary cover image — most important for Google Images
      "image": {
        "@type": "ImageObject",
        "url": storyData.backgroundImage,
        "contentUrl": storyData.backgroundImage,
        "width": 800,
        "height": 1200,
        "caption": `${storyData.title} - ${storyData.characterName} ${storyData.category} story cover image from ${storyData.city}`,
        "name": `${storyData.title} cover`,
        "representativeOfPage": true
      },
      "keywords": `${storyData.category} story, ${storyData.city} romance, ${storyData.characterName}, HeartEcho, Hindi story, interactive story`,
      "inLanguage": "en-IN",
      "url": pageUrl
    };

    // ── JSON-LD: ImageGallery — explicitly lists EVERY image on the page ─────
    // This is the single most effective signal for Google Images indexing
    const imageGallerySchema = {
      "@context": "https://schema.org",
      "@type": "ImageGallery",
      "name": `${storyData.title} - Image Gallery`,
      "description": `Images from ${storyData.characterName}'s ${storyData.category} story set in ${storyData.city}`,
      "url": pageUrl,
      "associatedMedia": allImages.map((imgUrl, idx) => ({
        "@type": "ImageObject",
        "url": imgUrl,
        "contentUrl": imgUrl,
        "caption": idx === 0
          ? `${storyData.title} - cover image featuring ${storyData.characterName} from ${storyData.city} on HeartEcho`
          : idx === allImages.length - 1 && storyData.characterAvatar === imgUrl
          ? `${storyData.characterName} - character avatar for ${storyData.title} on HeartEcho`
          : `${storyData.title} - Scene ${idx} featuring ${storyData.characterName} in ${storyData.city} ${storyData.category} story`,
        "name": idx === 0
          ? `${storyData.title} cover`
          : `${storyData.title} Scene ${idx}`,
        "width": idx === 0 ? 800 : 720,
        "height": idx === 0 ? 1200 : 1280,
        "representativeOfPage": idx === 0
      }))
    };
    
    return (
      <>
        {/* Article JSON-LD for story ranking */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        {/* ImageGallery JSON-LD — primary driver for Google Images */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(imageGallerySchema) }}
        />
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