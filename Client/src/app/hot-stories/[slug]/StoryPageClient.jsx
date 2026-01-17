// app/hot-stories/[slug]/StoryPageClient.jsx
'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import './StoryPage.css'

// Markdown components configuration
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

export default function StoryPageClient({ initialStory, initialRelatedStories, slug }) {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [story] = useState(initialStory);
  const [relatedStories] = useState(initialRelatedStories);

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

  const formatReadCount = (count) => {
    if (typeof count === 'number') {
      if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
      if (count >= 1000) return `${(count / 1000).toFixed(1)}k`;
      return count.toString();
    }
    return '0';
  };

  if (!story) {
    return (
      <div className="container-cwdw4x">
        <div className="error-container-djkei">
          <p className="error-text-djkei">Story not found</p>
          <button onClick={handleGoToDashboard} className="retry-button-djkei">
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Transform story data
  const transformedStory = {
    id: story._id,
    title: story.title || 'Untitled Story',
    slug: story.slug,
    excerpt: story.excerpt,
    description: story.description,
    category: story.category,
    city: story.city,
    readCount: story.readCount || 0,
    rating: story.rating || '4.8',
    characterName: story.characterName,
    characterAge: story.characterAge,
    characterOccupation: story.characterOccupation,
    characterPersonality: story.characterPersonality,
    backgroundImage: story.backgroundImage || '/api/placeholder/1200/675',
    characterAvatar: story.characterAvatar || '/api/placeholder/400/711',
    imageAlbum: story.imageAlbum || [],
    content_en: story.content_en || { 
      story: story.description || '# Story', 
      cliffhanger: '', 
      teaserChat: 'Hi', 
      cta: 'Start Chat' 
    },
    content_hi: story.content_hi || { 
      story: story.description || '# कहानी', 
      cliffhanger: '', 
      teaserChat: 'हाय', 
      cta: 'चैट शुरू करें' 
    },
    createdAt: story.createdAt,
    updatedAt: story.updatedAt,
    tags: story.tags || []
  };

  const content = lang === 'en' ? transformedStory.content_en : transformedStory.content_hi;

  // Function to render story content with images inserted at intervals
  const renderStoryWithImages = (storyText, images) => {
    if (!images || images.length === 0) {
      return <ReactMarkdown components={MarkdownComponents}>{storyText}</ReactMarkdown>;
    }

    // Split content by paragraphs (double newlines)
    const paragraphs = storyText.split(/\n\s*\n/).filter(p => p.trim().length > 0);
    
    if (paragraphs.length === 0) {
      return <ReactMarkdown components={MarkdownComponents}>{storyText}</ReactMarkdown>;
    }

    // Show ALL images - distribute them evenly throughout the content
    const imageCount = images.length; // Total number of images to show
    const totalInsertionPoints = Math.max(1, paragraphs.length - 1); // Don't insert after last paragraph
    
    // Calculate where to insert each image (distribute evenly, ensuring all images are shown)
    const insertionMap = new Map(); // Map of paragraph index -> array of images to insert
    
    if (imageCount > 0 && totalInsertionPoints > 0) {
      if (imageCount <= totalInsertionPoints) {
        // We have enough insertion points for all images - distribute evenly
        const step = totalInsertionPoints / (imageCount + 1);
        for (let i = 0; i < imageCount; i++) {
          const position = Math.floor((i + 1) * step);
          if (position >= 1 && position <= totalInsertionPoints) {
            if (!insertionMap.has(position)) {
              insertionMap.set(position, []);
            }
            insertionMap.get(position).push(i);
          }
        }
      } else {
        // More images than insertion points - distribute as evenly as possible
        // Each insertion point will get at least one image
        const imagesPerPoint = Math.floor(imageCount / totalInsertionPoints);
        const remainder = imageCount % totalInsertionPoints;
        
        let imageIdx = 0;
        for (let pos = 1; pos <= totalInsertionPoints; pos++) {
          const imagesForThisPoint = imagesPerPoint + (pos <= remainder ? 1 : 0);
          insertionMap.set(pos, []);
          for (let j = 0; j < imagesForThisPoint && imageIdx < imageCount; j++) {
            insertionMap.get(pos).push(imageIdx++);
          }
        }
      }
    }
    
    const result = [];
    const usedImages = [...images]; // Use all images in order

    paragraphs.forEach((paragraph, index) => {
      // Add paragraph
      result.push(
        <ReactMarkdown key={`para-${index}`} components={MarkdownComponents}>
          {paragraph.trim()}
        </ReactMarkdown>
      );

      // Insert images at this position if any
      const paragraphNumber = index + 1; // 1-indexed
      if (index < paragraphs.length - 1 && insertionMap.has(paragraphNumber)) {
        const imageIndices = insertionMap.get(paragraphNumber);
        imageIndices.forEach((imgIdx) => {
          if (imgIdx < usedImages.length) {
            const currentImage = usedImages[imgIdx];
            result.push(
              <div key={`img-${index}-${imgIdx}`} className="story-album-image-container-cwdw4x">
                <img 
                  src={currentImage} 
                  alt={`${transformedStory.characterName} - Image ${imgIdx + 1}`}
                  className="story-album-image-cwdw4x"
                  loading="lazy"
                  onError={(e) => {
                    e.target.src = '/api/placeholder/800/600';
                  }}
                />
              </div>
            );
          }
        });
      }
    });

    return <>{result}</>;
  };

  // Add structured data for SEO
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": transformedStory.title,
    "description": transformedStory.excerpt || transformedStory.description,
    "image": transformedStory.backgroundImage,
    "author": {
      "@type": "Person",
      "name": transformedStory.characterName || "Anonymous"
    },
    "publisher": {
      "@type": "Organization",
      "name": "HeartEcho",
      "logo": {
        "@type": "ImageObject",
        "url": "https://heartecho.in/heartecho_b.png"
      }
    },
    "datePublished": transformedStory.createdAt,
    "dateModified": transformedStory.updatedAt,
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `https://heartecho.in/hot-stories/${slug}`
    },
    "keywords": transformedStory.tags.join(", "),
    "articleSection": transformedStory.category,
    "inLanguage": [lang === 'en' ? "en" : "hi"]
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* AD SCRIPT - Load once at the top */}
      <script 
        async 
        data-cfasync="false" 
        src="https://pl28409394.effectivegatecpm.com/192103d6879cc843368e47e4d3546f8f/invoke.js"
      />

      <div className="container-cwdw4x">

        {/* Breadcrumb Navigation */}
        <nav className="breadcrumb-cwdw4x" aria-label="Breadcrumb">
          <ol>
            <li><Link href="/">Home</Link></li>
            <li><Link href="/hot-stories">Stories</Link></li>
            <li><Link href={`/city/${transformedStory.city?.toLowerCase().replace(/\s+/g, '-')}`}>{transformedStory.city}</Link></li>
            <li aria-current="page">{transformedStory.title}</li>
          </ol>
        </nav>

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

        {/* HERO SECTION */}
        <div className="hero-cwdw4x" role="banner">
          <div className="backgroundImageContainer-cwdw4x">
            <div className="backgroundImageWrapper-cwdw4x">
              <img
                src={transformedStory.backgroundImage}
                alt={`${transformedStory.characterName} in ${transformedStory.city}`}
                className="backgroundImage-cwdw4x"
                loading="eager"
                width={1200}
                height={675}
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
                    alt={`Avatar of ${transformedStory.characterName}`}
                    className="characterAvatar-cwdw4x"
                    loading="lazy"
                    width={80}
                    height={80}
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
              
              <button 
                className="ctaButton-cwdw4x" 
                onClick={handleStartChat}
                aria-label={`Start chat with ${transformedStory.characterName}`}
              >
                {content.cta} →
              </button>
            </div>
          </div>
        </div>

        {/* IN-ARTICLE AD - Between hero and story content */}
        <div className="ad-container in-article-ad"> 
           <div 
    ref={(el) => {
      if (el && !el.hasChildNodes()) {
        const conf = document.createElement('script');
        conf.innerHTML = `
          atOptions = {
            'key' : 'ee88502d31ebf3555868244246216d22',
            'format' : 'iframe',
            'height' : 250,
            'width' : 300,
            'params' : {}
          };
        `;
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = "https://bankergracestool.com/ee88502d31ebf3555868244246216d22/invoke.js";
        
        el.appendChild(conf);
        el.appendChild(script);
      }
    }}
  />
        </div>

        {/* STORY CONTENT */}
        <article className="storySection-cwdw4x">
          <h2 className="sectionHeading-cwdw4x">
            {lang === 'en' ? 'The Scenario' : 'कहानी की शुरुआत'}
          </h2>
         
          <div className="storyText-cwdw4x">
            {renderStoryWithImages(content.story, transformedStory.imageAlbum)}
          </div>
          
         {/* MID-ARTICLE AD - After story content, before cliffhanger */}
<div className="ad-container mid-article-ad">
           <div id="container-192103d6879cc843368e47e4d3546f8f"></div>

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
        </article>

        {/* CHAT TEASER */}
        <aside className="interactiveSection-cwdw4x" aria-label="Interactive Chat">
          <div className="chatHeader-cwdw4x">
            <div className="avatarCircle-cwdw4x" aria-hidden="true">
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
          <button 
            className="ctaButton-cwdw4x" 
            onClick={handleStartChat}
            aria-label={`Start interactive chat with ${transformedStory.characterName}`}
          >
            {content.cta} →
          </button>
        </aside>

        {/* BOTTOM BANNER AD */}
        <div className="ad-container mid-article-ad">
  <div 
    ref={(el) => {
      if (el && !el.hasChildNodes()) {
        try {
          // Define atOptions on the window object
          window.atOptions = {
            'key': '3ba9d6fe50db5f6e3520294fe7a1ae20',
            'format': 'iframe',
            'height': 300,
            'width': 160,
            'params': {}
          };
          
          // Create the script element
          const script = document.createElement('script');
          script.type = 'text/javascript';
          script.src = `https://www.highperformanceformat.com/3ba9d6fe50db5f6e3520294fe7a1ae20/invoke.js`;
          
          // Append to this specific container
          el.appendChild(script);
        } catch (e) {
          console.error("Ad loading failed:", e);
        }
      }
    }}
  />
</div>

        {/* RELATED STORIES */}
        {relatedStories.length > 0 && (
          <section className="relatedSection-cwdw4x" aria-label="Related Stories">
            <h3 className="sectionHeading-cwdw4x">
              {lang === 'en' ? 'More Stories You Might Like' : 'अन्य कहानियाँ'}
            </h3>
            <div className="grid-cwdw4x">
              {relatedStories.map((relatedStory) => {
                const storySlug = relatedStory.slug || relatedStory._id;
                return (
                  <Link 
                    href={`/hot-stories/${storySlug}`} 
                    key={storySlug} 
                    className="card-cwdw4x"
                    aria-label={`Read ${relatedStory.title}`}
                  >
                    <div className="relatedStoryImage-cwdw4x">
                      <img 
                        src={relatedStory.backgroundImage} 
                        alt={relatedStory.title} 
                        loading="lazy"
                        width={400}
                        height={225}
                      />
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
          </section>
        )}

        {/* SEO TAGS */}
        <div className="seoTags-cwdw4x" role="complementary">
          <span className="tag-cwdw4x">{transformedStory.category} story</span>
          <span className="tag-cwdw4x">{transformedStory.city} stories</span>
          <span className="tag-cwdw4x">Interactive stories</span>
          <span className="tag-cwdw4x">Indian stories</span>
          {transformedStory.tags?.map((tag, index) => (
            <span key={index} className="tag-cwdw4x">{tag}</span>
          ))}
        </div>
      </div>

      {/* Add CSS for ad containers */}
      <style jsx>{`
        .ad-container {
          margin: 2rem 0;
          text-align: center;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 50px;
          background-color: transparent;
          width: 100%;
        }
        
        .top-banner-ad {
          margin-top: 1rem;
          margin-bottom: 2rem;
        }
        
        .in-article-ad {
          margin: 2.5rem 0;
          padding: 1rem 0;
          border-top: 1px solid #eee;
          border-bottom: 1px solid #eee;
        }
        
        .mid-article-ad {
          margin: 2rem 0;
          float: right;
          margin-left: 2rem;
          clear: both;
        }
        
        .bottom-banner-ad {
          margin: 2.5rem 0;
          padding: 1.5rem 0;
          border-top: 1px solid #eee;
        }
        
        @media (max-width: 768px) {
          .mid-article-ad {
            float: none;
            margin: 2rem auto;
            text-align: center;
          }
          
          .ad-container {
            margin: 1.5rem 0;
          }
        }
      `}</style>
    </>
  );
}