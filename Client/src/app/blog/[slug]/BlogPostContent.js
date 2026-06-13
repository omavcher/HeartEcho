"use client";
import Link from 'next/link';
import Footer from '../../../components/Footer';
import PropTypes from 'prop-types';
import './blog-details.css';
import { useState, useEffect } from 'react';
import { blogPosts } from '../../../data/blogPosts';
import { FaShareAlt, FaClock, FaCalendarAlt } from 'react-icons/fa';

export default function BlogPostContent({ post }) {
  if (!post) return <div className="bd-loading-x30sn">Loading...</div>;

  const [readingProgress, setReadingProgress] = useState(0);
  const [copied, setCopied] = useState(false);
  const [headings, setHeadings] = useState([]);

  // Scroll Progress Logic
  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight === 0) return setReadingProgress(100);
      setReadingProgress((scrollTop / docHeight) * 100);
    };
    window.addEventListener('scroll', updateProgress);
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  // Extract h2 headings dynamically for the Table of Contents
  useEffect(() => {
    const contentEl = document.querySelector('.bd-post-content-x30sn');
    if (!contentEl) return;

    const h2Elements = contentEl.querySelectorAll('h2');
    const extractedHeadings = [];

    h2Elements.forEach((h2, index) => {
      const text = h2.textContent || '';
      const slug = text
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .trim();
      
      const uniqueId = slug || `section-${index}`;
      h2.id = uniqueId;
      
      extractedHeadings.push({
        id: uniqueId,
        text: text
      });
    });

    setHeadings(extractedHeadings);
  }, [post]);

  const handleShare = async () => {
    try {
      const url = window.location.href;
      if (navigator.share) {
        await navigator.share({ title: post.title, text: post.excerpt, url: url });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) { console.error('Share failed:', err); }
  };

  const getInitials = (name) => name ? name.split(' ').map(n => n[0]).join('').substring(0, 2) : 'AI';
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <>
      <div className="bd-progress-container-x30sn">
        <div className="bd-progress-bar-x30sn" style={{ width: `${readingProgress}%` }}></div>
      </div>

      <div className="bd-page-wrapper-x30sn">
        <div className="bd-content-grid-x30sn">
          
          {/* LEFT COLUMN */}
          <main className="bd-primary-column-x30sn">
            <header className="bd-article-header-x30sn">
              <h1>{post.title}</h1>
              
              <div className="bd-metadata-bar-x30sn">
                <div className="bd-author-group-x30sn">
                  <div className="bd-author-avatar-x30sn">{getInitials(post.author)}</div>
                  <div>
                    <span className="bd-meta-text-x30sn">{post.author}</span>
                    <div className="bd-meta-subtext-x30sn">
                      <span><FaCalendarAlt size={12}/> {formatDate(post.date)}</span>
                      <span className="bd-dot-x30sn">•</span>
                      <span><FaClock size={12}/> {post.readTime}</span>
                    </div>
                  </div>
                </div>
                
                <button className="bd-share-btn-x30sn" onClick={handleShare}>
                    <FaShareAlt /> {copied ? 'Copied!' : 'Share'}
                </button>
              </div>
            </header>
            
            <div className="bd-cinema-container-x30sn">
              <img src={post.image} alt={post.alt || post.title} className="bd-cinema-image-x30sn" loading="eager" />
            </div>

            <article className="bd-article-body-x30sn">
              <div className="bd-post-content-x30sn" dangerouslySetInnerHTML={{ __html: post.content }} />
              
              <div className="bd-tags-x30sn">
                <span>Category:</span>
                <Link href="/blog" className="bd-tag-link-x30sn">{post.category}</Link>
              </div>
            </article>
          </main>

          {/* RIGHT COLUMN */}
          <aside className="bd-sidebar-column-x30sn">
            {headings.length > 0 && (
              <div className="bd-toc-box-x30sn">
                  <h3>Table of Contents</h3>
                  <div className="bd-toc-list-x30sn">
                      {headings.map((heading, idx) => (
                          <a key={heading.id} href={`#${heading.id}`}>
                            {idx + 1}. {heading.text}
                          </a>
                      ))}
                  </div>
              </div>
            )}

            <div className="bd-sidebar-header-x30sn">More Articles</div>
            
            {blogPosts
              .filter(p => p.id !== post.id)
              .slice(0, 5)
              .map(related => (
                <Link key={related.id} href={`/blog/${related.slug}`} className="bd-sidebar-card-x30sn">
                  <div className="bd-sidebar-thumb-x30sn">
                    <img src={related.image} alt={related.title} />
                  </div>
                  <div className="bd-sidebar-info-x30sn">
                    <h4 title={related.title}>{related.title}</h4>
                    <div className="bd-sidebar-meta-x30sn">{related.readTime}</div>
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