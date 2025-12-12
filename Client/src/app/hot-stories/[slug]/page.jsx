"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import Head from 'next/head'; // Import Head for client-side metadata
import './StoryPage.css';
import Footer from '../../../components/Footer';
import api from '../../../config/api';

// ========================
// CLIENT-SIDE METADATA COMPONENT
// ========================
function StoryHead({ story, slug }) {
  if (!story) {
    return (
      <Head>
        <title>Hot Desi Story - Hindi Sex Kahani</title>
        <meta name="description" content="Latest Indian erotic stories in Hindi and English" />
        <meta name="keywords" content="hindi sex stories, desi erotic stories, indian adult stories, hindi kahani" />
        <meta name="robots" content="index, follow" />
      </Head>
    );
  }

  const title = `${story.title} - ${story.characterName} ki Hot ${story.category} Sex Story in Hindi & English`;
  const description = story.excerpt || `${story.characterName}, ${story.characterAge} saal ki sexy ${story.category} from ${story.city}. Puri garam kahani padho aur character se chat karo.`;
  const keywords = [
    `${story.category} sex story`,
    `hindi sex kahani`,
    `${story.characterName} ki chudai`,
    `desi ${story.category?.toLowerCase()} kahani`,
    `indian erotic stories`,
    `${story.city} bhabhi story`,
    'adult hindi stories',
    ...(story.tags || [])
  ].join(', ');

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <link rel="canonical" href={`https://heartecho.in/hot-stories/${slug}`} />
      
      {/* Open Graph */}
      <meta property="og:title" content={`${story.title} - ${story.characterName} ki Sex Story`} />
      <meta property="og:description" content={story.excerpt || "Full hot story + live chat with character"} />
      <meta property="og:url" content={`https://heartecho.in/hot-stories/${slug}`} />
      <meta property="og:type" content="article" />
      <meta property="og:locale" content="hi_IN" />
      {story.characterAvatar && <meta property="og:image" content={story.characterAvatar} />}
      {story.backgroundImage && <meta property="og:image" content={story.backgroundImage} />}
      {story.characterAvatar && <meta property="og:image:width" content="400" />}
      {story.characterAvatar && <meta property="og:image:height" content="711" />}
      {story.backgroundImage && <meta property="og:image:width" content="1200" />}
      {story.backgroundImage && <meta property="og:image:height" content="675" />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={story.title} />
      <meta name="twitter:description" content={story.excerpt || "Click to read full erotic story"} />
      {story.characterAvatar && <meta name="twitter:image" content={story.characterAvatar} />}
      
      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="DesiKahaniyan" />
      <meta property="article:published_time" content={story.createdAt} />
      <meta property="article:modified_time" content={story.updatedAt} />
      <meta property="article:section" content={story.category} />
      <meta property="article:tag" content={keywords} />
    </Head>
  );
}

// ========================
// JSON-LD STRUCTURED DATA
// ========================
function StoryJSONLD({ story, slug }) {
  if (!story) return null;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": story.title,
    "description": story.excerpt || "Hot erotic story",
    "image": [story.characterAvatar, story.backgroundImage].filter(Boolean),
    "author": { 
      "@type": "Person", 
      "name": story.characterName || "Anonymous" 
    },
    "publisher": { 
      "@type": "Organization", 
      "name": "DesiKahaniyan",
      "logo": {
        "@type": "ImageObject",
        "url": "https://heartecho.in/logo.png"
      }
    },
    "datePublished": story.createdAt,
    "dateModified": story.updatedAt,
    "mainEntityOfPage": { 
      "@type": "WebPage", 
      "@id": `https://heartecho.in/hot-stories/${slug}` 
    },
    "keywords": (story.tags || []).join(", "),
    "articleSection": story.category,
    "inLanguage": ["en", "hi"]
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// ========================
// SKELETON LOADERS
// ========================
const SkeletonHero = () => (
  <div className="skeleton-hero-cwdw4x">
    <div className="skeleton-background-cwdw4x"></div>
    <div className="skeleton-content-cwdw4x">
      <div className="skeleton-title-cwdw4x"></div>
      <div className="skeleton-stats-cwdw4x">
        <div className="skeleton-avatar-cwdw4x"></div>
        <div className="skeleton-stat-item-cwdw4x"></div>
        <div className="skeleton-stat-item-cwdw4x"></div>
        <div className="skeleton-stat-item-cwdw4x"></div>
        <div className="skeleton-stat-item-cwdw4x"></div>
      </div>
    </div>
  </div>
);

const SkeletonStorySection = () => (
  <div className="skeleton-section-cwdw4x">
    <div className="skeleton-heading-cwdw4x"></div>
    <div className="skeleton-text-cwdw4x"></div>
    <div className="skeleton-text-cwdw4x"></div>
    <div className="skeleton-text-cwdw4x"></div>
    <div className="skeleton-text-cwdw4x"></div>
  </div>
);

const SkeletonChatSection = () => (
  <div className="skeleton-chat-cwdw4x">
    <div className="skeleton-chat-header-cwdw4x"></div>
    <div className="skeleton-message-cwdw4x"></div>
    <div className="skeleton-button-cwdw4x"></div>
  </div>
);

const SkeletonRelatedStories = () => (
  <div className="skeleton-related-cwdw4x">
    <div className="skeleton-heading-cwdw4x"></div>
    <div className="skeleton-grid-cwdw4x">
      {[1, 2, 3].map(i => (
        <div key={i} className="skeleton-card-cwdw4x">
          <div className="skeleton-card-image-cwdw4x"></div>
          <div className="skeleton-card-title-cwdw4x"></div>
        </div>
      ))}
    </div>
  </div>
);

const MarkdownComponents = {
  h1: ({ node, ...props }) => <h1 className="markdown-h1-cwdw4x" {...props} />,
  h2: ({ node, ...props }) => <h2 className="markdown-h2-cwdw4x" {...props} />,
  h3: ({ node, ...props }) => <h3 className="markdown-h3-cwdw4x" {...props} />,
  p: ({ node, ...props }) => <p className="markdown-p-cwdw4x" {...props} />,
  ul: ({ node, ...props }) => <ul className="markdown-ul-cwdw4x" {...props} />,
  ol: ({ node, ...props }) => <ol className="markdown-ol-cwdw4x" {...props} />,
  li: ({ node, ...props }) => <li className="markdown-li-cwdw4x" {...props} />,
  strong: ({ node, ...props }) => <strong className="markdown-strong-cwdw4x" {...props} />,
  em: ({ node, ...props }) => <em className="markdown-em-cwdw4x" {...props} />,
  blockquote: ({ node, ...props }) => <blockquote className="markdown-blockquote-cwdw4x" {...props} />,
  code: ({ node, inline, ...props }) =>
    inline ?
      <code className="markdown-code-inline-cwdw4x" {...props} /> :
      <code className="markdown-code-block-cwdw4x" {...props} />,
  pre: ({ node, ...props }) => <pre className="markdown-pre-cwdw4x" {...props} />,
};

function Stat({ label, value }) {
  return (
    <div className="statItem-cwdw4x">
      <span className="statLabel-cwdw4x">{label}</span>
      <span className="statValue-cwdw4x">{value}</span>
    </div>
  );
}

// ========================
// MAIN PAGE COMPONENT
// ========================
export default function StoryPage({ params }) {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [slug, setSlug] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [story, setStory] = useState(null);
  const [relatedStories, setRelatedStories] = useState([]);

  useEffect(() => {
    async function fetchAllData() {
      try {
        const unwrappedParams = await params;
        const storySlug = unwrappedParams.slug;
        setSlug(storySlug);

        const storyResponse = await axios.get(`${api.Url}/story/getbyid/${storySlug}`);
       
        if (storyResponse.data && storyResponse.data.success) {
          const storyData = storyResponse.data.data;
          setStory(storyData);
         
          const allStoriesResponse = await axios.get(`${api.Url}/story`, {
            params: { limit: 100 }
          });
          
          if (allStoriesResponse.data && allStoriesResponse.data.success) {
            const allStories = allStoriesResponse.data.data;
           
            const related = allStories
              .filter(s => s._id !== storyData._id && (s.category === storyData.category || s.city === storyData.city))
              .slice(0, 3);
           
            setRelatedStories(related);
          }
        } else {
          setError('Story not found');
        }
      } catch (err) {
        console.error('Error fetching story:', err);
        setError('Failed to load story. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchAllData();
  }, [params]);

  const handleStartChat = () => {
    if (!story) return;
    const characterId = story.characterId || story._id;
    const characterName = story.characterName || story.title || 'Character';
    const url = `/chatbox?chatId=${characterId}&lang=${lang}&character=${encodeURIComponent(characterName)}`;
    router.push(url);
  };

  const handleGoToDashboard = () => {
    router.push('/hot-stories');
  };

  const handleRetry = () => {
    window.location.reload();
  };

  const transformStoryData = (storyData) => {
    return {
      id: storyData._id,
      title: storyData.title || 'Untitled Story',
      slug: storyData.slug,
      excerpt: storyData.excerpt,
      description: storyData.description,
      category: storyData.category,
      city: storyData.city,
      readCount: storyData.readCount || 0,
      rating: '4.8',
      characterName: storyData.characterName,
      characterAge: storyData.characterAge,
      characterOccupation: storyData.characterOccupation,
      characterPersonality: storyData.characterPersonality,
      backgroundImage: storyData.backgroundImage || '/api/placeholder/1200/675',
      characterAvatar: storyData.characterAvatar || '/api/placeholder/400/711',
      content_en: storyData.content_en || { story: storyData.description || '# Story', cliffhanger: '', teaserChat: 'Hi', cta: 'Start Chat' },
      content_hi: storyData.content_hi || { story: storyData.description || '# कहानी', cliffhanger: '', teaserChat: 'हाय', cta: 'चैट शुरू करें' },
      createdAt: storyData.createdAt,
      updatedAt: storyData.updatedAt,
      tags: storyData.tags || []
    };
  };

  const formatReadCount = (count) => {
    if (typeof count === 'number') {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
      return count.toString();
    }
    return '0';
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <>
        <StoryHead story={null} />
        <StoryJSONLD story={null} slug="" />
        <div className="container-cwdw4x">
          <div className="header-controls-cwdw4x skeleton-container">
            <div className="skeleton-button-large-cwdw4x"></div>
            <div className="skeleton-lang-toggle-cwdw4x">
              <div className="skeleton-lang-button-cwdw4x"></div>
              <div className="skeleton-lang-button-cwdw4x"></div>
            </div>
          </div>
          <SkeletonHero />
          <SkeletonStorySection />
          <SkeletonChatSection />
          <SkeletonRelatedStories />
          <div className="skeleton-tags-cwdw4x">
            <div className="skeleton-tag-cwdw4x"></div>
            <div className="skeleton-tag-cwdw4x"></div>
            <div className="skeleton-tag-cwdw4x"></div>
          </div>
        </div>
      </>
    );
  }

  // ================= ERROR STATE =================
  if (error || !story) {
    return (
      <>
        <StoryHead story={null} />
        <StoryJSONLD story={null} slug="" />
        <div className="container-cwdw4x">
          <div className="error-container-djkei">
            <p className="error-text-djkei">{error || 'Story not found'}</p>
            <button onClick={handleGoToDashboard} className="retry-button-djkei">
              Back to Dashboard
            </button>
            <button onClick={handleRetry} className="retry-button-djkei" style={{ marginTop: '10px', background: '#f0f0f0', color: '#333' }}>
              Retry
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  const transformedStory = transformStoryData(story);
  const content = lang === 'en' ? transformedStory.content_en : transformedStory.content_hi;

  return (
    <>
      {/* SEO Boost: Client-side Metadata */}
      <StoryHead story={story} slug={slug} />
      <StoryJSONLD story={story} slug={slug} />

      {/* Preload Critical Images */}
      {transformedStory.backgroundImage && (
        <link rel="preload" as="image" href={transformedStory.backgroundImage} />
      )}
      {transformedStory.characterAvatar && (
        <link rel="preload" as="image" href={transformedStory.characterAvatar} />
      )}

      <div className="container-cwdw4x">
        <div className="header-controls-cwdw4x">
          <button onClick={handleGoToDashboard} className="dashboardButton-cwdw4x">
            ← Back to Story Dashboard
          </button>
         
          <div className="langToggleContainer-cwdw4x">
            <button
              className={`langButton-cwdw4x ${lang === 'en' ? 'active-cwdw4x' : ''}`}
              onClick={() => setLang('en')}
            >
              ENG
            </button>
            <button
              className={`langButton-cwdw4x ${lang === 'hi' ? 'active-cwdw4x' : ''}`}
              onClick={() => setLang('hi')}
            >
              हिंदी
            </button>
          </div>
        </div>

        {/* HERO */}
        <div className="hero-cwdw4x">
          <div className="backgroundImageContainer-cwdw4x">
            <div className="backgroundImageWrapper-cwdw4x">
              <img
                src={transformedStory.backgroundImage}
                alt={`${transformedStory.characterName} in ${transformedStory.city}`}
                className="backgroundImage-cwdw4x"
                loading="eager"
              />
              <div className="imagePlaceholder-cwdw4x">
                <div className="placeholderContent-cwdw4x">
                  <span className="cityNamePlaceholder-cwdw4x">{transformedStory.city}</span>
                  <span className="characterNamePlaceholder-cwdw4x">{transformedStory.characterName}</span>
                </div>
              </div>
            </div>
            <span className="cityBadge-cwdw4x">{transformedStory.city}</span>
          </div>

          <div className="heroContent-cwdw4x">
            <h1 className="title-cwdw4x">{transformedStory.title}</h1>
            <p className="story-excerpt-cwdw4x">{transformedStory.excerpt}</p>
            <div className="statsGrid-cwdw4x">
              <div className="characterAvatarContainer-cwdw4x">
                <div className="characterAvatarWrapper-cwdw4x">
                  <img
                    src={transformedStory.characterAvatar}
                    alt={transformedStory.characterName}
                    className="characterAvatar-cwdw4x"
                    loading="lazy"
                  />
                  <div className="avatarFallback-cwdw4x">
                    {transformedStory.characterName?.charAt(0) || 'C'}
                  </div>
                </div>
                <div className="avatarInfo-cwdw4x">
                  <h3 className="avatarName-cwdw4x">{transformedStory.characterName}</h3>
                  <p className="avatarAge-cwdw4x">{transformedStory.characterAge} years old</p>
                </div>
              </div>
             
              <Stat label="Category" value={transformedStory.category} />
              <Stat label="City" value={transformedStory.city} />
              <Stat label="Rating" value={transformedStory.rating} />
              <Stat label="Reads" value={formatReadCount(transformedStory.readCount)} />
              <button style={{borderRadius:'15px'}} className="ctaButton-cwdw4x" onClick={handleStartChat}>
                {content.cta} →
              </button>
            </div>
          </div>
        </div>

        {/* STORY */}
        <div className="storySection-cwdw4x">
          <h2 className="sectionHeading-cwdw4x">
            {lang === 'en' ? 'The Scenario' : 'कहानी की शुरुआत'}
          </h2>
         
          <div className="storyText-cwdw4x">
            <ReactMarkdown components={MarkdownComponents}>
              {content.story}
            </ReactMarkdown>
          </div>
          {content.cliffhanger && (
            <div className="cliffhanger-cwdw4x">
              <span className="cliffhangerLabel-cwdw4x">
                {lang === 'en' ? 'What Happens Next?' : 'आगे क्या होगा?'}
              </span>
              <div className="cliffhangerText-cwdw4x">
                <ReactMarkdown components={MarkdownComponents}>
                  {content.cliffhanger}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>

        {/* CHAT TEASER */}
        <div className="interactiveSection-cwdw4x">
          <div className="chatHeader-cwdw4x">
            <div className="avatarCircle-cwdw4x">
              {transformedStory.characterName?.charAt(0) || 'C'}
            </div>
            <div className="chatStatus-cwdw4x">
              <h4>{transformedStory.characterName}</h4>
              <span><div className="dot-cwdw4x"></div> Online</span>
            </div>
          </div>
          <div className="chatBody-cwdw4x">
            <div className="messageBubble-cwdw4x">
              {content.teaserChat}
            </div>
          </div>
          <button className="ctaButton-cwdw4x" onClick={handleStartChat}>
            {content.cta} →
          </button>
        </div>

        {/* RELATED */}
        {relatedStories.length > 0 && (
          <div className="relatedSection-cwdw4x">
            <h3 className="sectionHeading-cwdw4x">
              {lang === 'en' ? 'More Stories You Might Like' : 'अन्य कहानियाँ'}
            </h3>
            <div className="grid-cwdw4x">
              {relatedStories.map((relatedStory) => {
                const storySlug = relatedStory.slug || relatedStory._id;
                return (
                  <Link href={`/hot-stories/${storySlug}`} key={storySlug} className="card-cwdw4x">
                    <div className="relatedStoryImage-cwdw4x">
                      <img src={relatedStory.backgroundImage} alt={relatedStory.title} loading="lazy" />
                      <div className="relatedStoryOverlay-cwdw4x">
                        <span>Read Now →</span>
                      </div>
                    </div>
                    <div className="cardContent-cwdw4x">
                      <div className="category-badge-small-cwdw4x">{relatedStory.category}</div>
                      <h4 className="relatedStoryTitle-cwdw4x">{relatedStory.title}</h4>
                      <div className="character-info-small-cwdw4x">
                        <span className="character-name-small-cwdw4x">{relatedStory.characterName}</span>
                        <span className="character-age-small-cwdw4x">{relatedStory.characterAge} yrs</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* SEO TAGS */}
        <div className="seoTags-cwdw4x">
          <span className="tag-cwdw4x">{transformedStory.category} story</span>
          <span className="tag-cwdw4x">Hindi sex kahani</span>
          <span className="tag-cwdw4x">Desi hot stories</span>
          <span className="tag-cwdw4x">{transformedStory.city} erotic tale</span>
          {transformedStory.tags?.map((tag, index) => (
            <span key={index} className="tag-cwdw4x">{tag}</span>
          ))}
        </div>
      </div>
      <Footer/>
    </>
  );
}