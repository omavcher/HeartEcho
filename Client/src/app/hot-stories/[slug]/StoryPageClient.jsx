// app/hot-stories/[slug]/StoryPageClient.jsx
'use client';

import React, { useState } from 'react';
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
              <Stat label="Rating" value={transformedStory.rating} />
              <Stat label="Reads" value={formatReadCount(transformedStory.readCount)} />
              
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

        {/* STORY CONTENT */}
        <article className="storySection-cwdw4x">
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
    </>
  );
}