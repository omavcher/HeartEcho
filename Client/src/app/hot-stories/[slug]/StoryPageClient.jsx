'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import { Share2, ArrowLeft, Zap, MessageSquare, MapPin } from 'lucide-react';
import './StoryPage.css';

const MarkdownComponents = {
  p: ({ node, ...props }) => <p className="markdown-p-cwdw4x" {...props} />,
};

export default function StoryPageClient({ initialStory, initialRelatedStories }) {
  const router = useRouter();
  const [lang, setLang] = useState('en');
  const [showSticky, setShowSticky] = useState(false);
  const story = initialStory;

  useEffect(() => {
    const handleScroll = () => {
      // Trigger sticky bar after scrolling 400px
      setShowSticky(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!story) return null;

  const handleStartChat = () => {
    const characterId = story.characterId || story._id;
    router.push(`/chatbox?chatId=${characterId}&lang=${lang}&character=${encodeURIComponent(story.characterName)}`);
  };

  const handleShare = async () => {
    const shareData = {
      title: story.title,
      text: `Read ${story.characterName}'s story in ${story.city}!`,
      url: window.location.href,
    };
    try {
      if (navigator.share) await navigator.share(shareData);
      else {
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied!");
      }
    } catch (err) { console.log(err); }
  };

  const images = story.imageAlbum || [];
  const content = lang === 'en' ? story.content_en : story.content_hi;
  const storyText = content?.story || story.description;

  const renderStoryContent = () => {
    const paragraphs = storyText.split(/\n\s*\n/).filter(p => p.trim());
    const result = [];
    paragraphs.forEach((p, i) => {
      result.push(<ReactMarkdown key={i} components={MarkdownComponents}>{p}</ReactMarkdown>);
      // Insert 9:16 Scene Images every 3 paragraphs
      if ((i + 1) % 3 === 0 && images[Math.floor(i / 3)]) {
        result.push(
          <div key={`img-${i}`} className="story-album-image-container-cwdw4x">
            <img src={images[Math.floor(i / 3)]} alt="Scene" className="story-album-image-cwdw4x" loading="lazy" />
          </div>
        );
      }
    });
    return result;
  };

  return (
    <div className="container-cwdw4x">
      {/* HEADER CONTROLS */}
      <div className="header-controls-cwdw4x" style={{paddingTop: '20px'}}>
        <button onClick={() => router.push('/hot-stories')} className="dashboardButton-cwdw4x">
          <ArrowLeft size={16} />
        </button>
        <div style={{display: 'flex', gap: '10px'}}>
          <button onClick={handleShare} className="share-btn-cwdw4x"><Share2 size={18} /></button>
          <div className="langToggleContainer-cwdw4x">
            <button className={lang === 'en' ? 'active-cwdw4x langButton-cwdw4x' : 'langButton-cwdw4x'} onClick={() => setLang('en')}>EN</button>
            <button className={lang === 'hi' ? 'active-cwdw4x langButton-cwdw4x' : 'langButton-cwdw4x'} onClick={() => setLang('hi')}>हि</button>
          </div>
        </div>
      </div>

      {/* HERO SECTION */}
      <div className="hero-cwdw4x">
        <div className="backgroundImageContainer-cwdw4x">
          <img src={story.backgroundImage} alt="" className="backgroundImage-cwdw4x" />
          <span className="cityBadge-cwdw4x"><MapPin size={12}/> {story.city}</span>
        </div>
        <div className="heroContent-cwdw4x">
          <h1 className="title-cwdw4x">{story.title}</h1>
          <div className="statsGrid-cwdw4x">
            <div className="characterAvatarWrapper-cwdw4x">
              <img src={story.characterAvatar} className="characterAvatar-cwdw4x" alt="" />
            </div>
            <div className="statItem-cwdw4x">
              <span className="statLabel-cwdw4x">CHARACTER</span>
              <span className="statValue-cwdw4x">{story.characterName}</span>
            </div>
            <button className="cta-button-glow-cwdw4x" onClick={handleStartChat}>
               Chat Now <Zap size={16} fill="white"/>
            </button>
          </div>
        </div>
      </div>

      {/* STORY BODY */}
      <article className="storySection-cwdw4x">
        <div className="storyText-cwdw4x">{renderStoryContent()}</div>
        {content?.cliffhanger && (
          <div className="cliffhanger-cwdw4x">
            <h3 style={{fontSize:'0.8rem', color: 'var(--primary-pink)', marginBottom:10, fontWeight:900}}>STORY CONTINUES IN CHAT...</h3>
            <ReactMarkdown>{content.cliffhanger}</ReactMarkdown>
          </div>
        )}
      </article>

      {/* STICKY CTA (LIFTED FOR BOTTOM NAV) */}
      {showSticky && (
        <div className="sticky-bottom-bar-cwdw4x">
          <div className="sticky-profile-cwdw4x">
            <img src={story.characterAvatar} className="sticky-avatar-cwdw4x" alt="" />
            <div className="sticky-info-cwdw4x">
              <h5 style={{margin:0}}>{story.characterName}</h5>
              <span style={{fontSize:'0.65rem', color:'#25D366'}}>● Typing...</span>
            </div>
          </div>
          <button className="cta-button-glow-cwdw4x" onClick={handleStartChat}>
            Chat Now <Zap size={14} fill="white"/>
          </button>
        </div>
      )}

      {/* RELATED CONTENT */}
      <section className="relatedSection-cwdw4x">
        <h3 className="sectionHeading-cwdw4x">Hot Suggestions</h3>
        <div className="grid-cwdw4x">
          {initialRelatedStories.slice(0, 4).map((rel) => (
            <Link href={`/hot-stories/${rel.slug}`} key={rel._id} className="card-cwdw4x">
              <div className="relatedStoryImage-cwdw4x">
                <img src={rel.backgroundImage} alt="" />
              </div>
              <div style={{padding: '8px'}}><h4 className="relatedStoryTitle-cwdw4x">{rel.title}</h4></div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}