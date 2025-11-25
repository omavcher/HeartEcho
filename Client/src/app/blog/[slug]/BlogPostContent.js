"use client";
import Head from 'next/head';
import Link from 'next/link';
import Footer from '../../../components/Footer';
import PropTypes from 'prop-types';
import './blog-details.css';
import { useState, useEffect } from 'react';

// Icons
const ShareIcon = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>;
const ClockIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>;
const CalendarIcon = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;

// Import blogPosts here for the related posts section
import { blogPosts } from '../../../data/blogPosts';

export default function BlogPostContent({ post }) {
  // Add safety check for post prop
  if (!post) {
    return <div>Loading...</div>;
  }

  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);

  // Scroll Progress Logic
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      
      // Prevent division by zero if content is short
      if (docHeight === 0) {
        setReadingProgress(100);
        return;
      }
      const progress = (scrollTop / docHeight) * 100;
      setReadingProgress(progress);
    };
    
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // Simple copy to clipboard
  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        // Use native Web Share API if available
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: url,
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      // Ignore user closing the share dialog
      if (err.name !== 'AbortError') {
        console.error('Failed to share/copy:', err);
      }
    }
  };

  const getInitials = (name) => {
    if (!name) return '??';
    return name.split(' ').map(n => n[0]).join('').substring(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  return (
    <>
      <Head>
        <link rel="canonical" href={`https://heartecho.in/blog/${post.slug}`} />
        <meta name="robots" content="index, follow" />
      </Head>

      {/* Progress Bar at very top */}
      <div className="progress-container">
        <div className="progress-bar" style={{ width: `${readingProgress}%` }}></div>
      </div>

      <div className="page-wrapper">
        <div className="content-grid">
          
          {/* LEFT COLUMN: Main Content */}
          <main className="primary-column">
            
            <header className="article-header">
                {/* 1. Article Title */}
                <h1>{post.title}</h1>

                {/* 2. Clean Metadata Bar */}
                <div className="article-metadata-bar">
                    <div className="author-info-group">
                        <div className="author-avatar">{getInitials(post.author)}</div>
                        <div>
                            <span className="metadata-text">{post.author}</span>
                            <div className="metadata-subtext">
                                <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                                  <CalendarIcon /> {formatDate(post.date)}
                                </span>
                                <span style={{margin: '0 8px'}}>•</span>
                                <span style={{display: 'inline-flex', alignItems: 'center', gap: '4px'}}>
                                  <ClockIcon /> {post.readTime}
                                </span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Share Button (Cleaned up) */}
                    <button className="share-btn" onClick={handleShare}>
                        <ShareIcon /> 
                        {copied ? 'Link Copied!' : 'Share'}
                    </button>
                </div>
            </header>
            
            {/* 3. Featured Image */}
            <div className="cinema-container">
              <img 
                src={post.image} 
                alt={post.alt} 
                className="cinema-image"
                loading="eager" 
              />
            </div>

            {/* 4. Article Content */}
            <article className="article-body">
              <div 
                className="post-content" 
                dangerouslySetInnerHTML={{ __html: post.content }}
              />
              
              <div className="tags">
                <span style={{ color: 'var(--yt-text-sec)', marginRight: '8px' }}>Category:</span>
                <Link href="/blog" style={{ color: 'var(--yt-brand)', fontWeight: 'bold' }}>
                  {post.category}
                </Link>
              </div>
            </article>
            
          </main>

          {/* RIGHT COLUMN: Sidebar (TOC & Related) */}
          <aside className="sidebar-column">
            
            {/* Sticky Table of Contents Placeholder */}
            <div className="toc-box">
                <h3>Table of Contents</h3>
                <div className="toc-list">
                    {/* In a real app, you would dynamically generate this based on H2s/H3s */}
                    <a href="#section-1">1. Introduction to AI Companions</a>
                    <a href="#section-2">2. The Ethics of Digital Love</a>
                    <a href="#section-3">3. Technology Behind Emotional AI</a>
                    <a href="#section-4">4. Future of Human-AI Interaction</a>
                </div>
            </div>

            <div className="sidebar-header">More Articles</div>
            
            {blogPosts
              .filter(p => p.id !== post.id)
              .slice(0, 5) // Limit the list to 5 related posts
              .map(relatedPost => (
                <Link key={relatedPost.id} href={`/blog/${relatedPost.slug}`} className="sidebar-card">
                  <div className="sidebar-thumb">
                    <img src={relatedPost.image} alt={relatedPost.alt} />
                  </div>
                  <div className="sidebar-info">
                    <h4 title={relatedPost.title}>{relatedPost.title}</h4>
                    <div className="sidebar-meta">
                      {relatedPost.author} • {relatedPost.readTime}
                    </div>
                  </div>
                </Link>
              ))
            }
          </aside>

        </div>
        <Footer />
      </div>
    </>
  );
}

BlogPostContent.propTypes = {
  post: PropTypes.object.isRequired,
};