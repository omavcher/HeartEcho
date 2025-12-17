// app/hot-stories/[slug]/metadata.js
import api from '../../../config/api'

export async function generateStoryMetadata({ params }) {
  try {
    // Await the params to get the slug
    const { slug } = await params;
    
    // Fetch story data
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
    
    // Transform story data
    const transformedStory = transformStoryData(story);
    
    return {
      title: `${transformedStory.title} - ${transformedStory.characterName} ki Hot ${transformedStory.category} Story`,
      description: transformedStory.seoDescription,
      keywords: transformedStory.seoKeywords.join(', '),
      authors: [{ name: 'HeartEcho' }],
      openGraph: {
        title: `${transformedStory.title} - ${transformedStory.characterName}'s Story`,
        description: transformedStory.seoDescription,
        url: `https://heartecho.in/hot-stories/${slug}`,
        siteName: 'HeartEcho',
        images: transformedStory.seoImages,
        locale: 'en_US',
        type: 'article',
      },
      twitter: {
        card: 'summary_large_image',
        title: transformedStory.title,
        description: transformedStory.seoDescription,
        images: transformedStory.seoImages,
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
      other: {
        'og:locale:alternate': 'hi_IN',
        'article:published_time': transformedStory.createdAt,
        'article:modified_time': transformedStory.updatedAt,
        'article:section': transformedStory.category,
        'article:tag': transformedStory.seoKeywords,
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

function transformStoryData(storyData) {
  const description = storyData.description || storyData.excerpt || '';
  
  return {
    id: storyData._id,
    title: storyData.title || 'Untitled Story',
    slug: storyData.slug,
    excerpt: storyData.excerpt,
    description: description,
    category: storyData.category,
    city: storyData.city,
    characterName: storyData.characterName || 'Character',
    characterAge: storyData.characterAge,
    characterAvatar: storyData.backgroundImage || '/api/placeholder/400/711',
    backgroundImage: storyData.backgroundImage || '/api/placeholder/1200/675',
    createdAt: storyData.createdAt,
    updatedAt: storyData.updatedAt,
    tags: storyData.tags || [],
    content_en: storyData.content_en || { 
      story: storyData.description || '# Story', 
      cliffhanger: '', 
      teaserChat: 'Hi', 
      cta: 'Start Chat' 
    },
    content_hi: storyData.content_hi || { 
      story: storyData.description || '# कहानी', 
      cliffhanger: '', 
      teaserChat: 'हाय', 
      cta: 'चैट शुरू करें' 
    },
    
    // SEO specific fields
    seoDescription: description.length > 155 ? 
      description.substring(0, 152) + '...' : 
      description || `Read ${storyData.characterName}'s ${storyData.category} story from ${storyData.city}.`,
    
    seoKeywords: [
      `${storyData.category} story`,
      `${storyData.characterName} story`,
      `${storyData.city} stories`,
      'Indian interactive stories',
      'desi stories',
      'heartecho stories',
      ...(storyData.tags || [])
    ],
    
    seoImages: [
      {
        url: storyData.backgroundImage || '/api/placeholder/1200/630',
        width: 1200,
        height: 630,
        alt: `${storyData.title} - ${storyData.characterName}'s Story`,
      }
    ]
  };
}