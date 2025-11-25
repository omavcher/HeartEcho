"use client";

import { blogPosts } from '../../data/blogPosts';
import Link from 'next/link';
import Head from 'next/head';
import './blog.css'
import Footer from '../../components/Footer'
import { useState, useMemo, useEffect } from 'react';

// Icons for UI
const GridIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
);
const ListIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="8" y1="6" x2="21" y2="6"></line><line x1="8" y1="12" x2="21" y2="12"></line><line x1="8" y1="18" x2="21" y2="18"></line><line x1="3" y1="6" x2="3.01" y2="6"></line><line x1="3" y1="12" x2="3.01" y2="12"></line><line x1="3" y1="18" x2="3.01" y2="18"></line></svg>
);
const SearchIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
);

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [visibleCount, setVisibleCount] = useState(12); // For "Load More" feature

  // Get all unique categories
  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];

  // Helper: Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [searchQuery, selectedCategory]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    
    let filtered = blogPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery) ||
        post.author.toLowerCase().includes(lowerQuery);
      
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Default sort: Newest first (Standard YouTube behavior)
    filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

    return filtered;
  }, [searchQuery, selectedCategory]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = displayedPosts.length < filteredPosts.length;

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  // Helper to generate initials for avatar
  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').substring(0,2) : 'AI';
  };

  // Helper to format date relative (e.g., "2 days ago")
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <Head>
        <title>Blog - HeartEcho</title>
        <meta name="description" content="Explore the future of relationships with AI companions." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="blog-wrapper">
        <main className="main-content-blofd">
          
          {/* Header Controls */}
          <header className="controls-header">
            <div className="top-bar">
              <div className="page-title">
                <h1>Blog</h1>
              </div>
              
              <div className="search-container">
                <div className="search-input-wrapper">
                  <input
                    type="text"
                    placeholder="Search articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button className="search-btn">
                    <SearchIcon />
                  </button>
                </div>
              </div>
            </div>

            {/* Category Chips (Horizontal Scroll) */}
            <div className="category-scroll">
              {categories.map(category => (
                <button
                  key={category}
                  className={`chip ${selectedCategory === category ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          </header>

          {/* Results Info & View Toggles */}
          <div className="utility-bar">
            <span>
              {filteredPosts.length} Results
              {searchQuery && ` for "${searchQuery}"`}
            </span>
            
            <div className="view-toggles">
              <button 
                className={viewMode === 'grid' ? 'active' : ''} 
                onClick={() => setViewMode('grid')}
                aria-label="Grid View"
              >
                <GridIcon />
              </button>
              <button 
                className={viewMode === 'list' ? 'active' : ''} 
                onClick={() => setViewMode('list')}
                aria-label="List View"
              >
                <ListIcon />
              </button>
            </div>
          </div>

          {/* Posts Grid */}
          <div className={`posts-grid ${viewMode === 'list' ? 'list-view' : ''}`}>
            {displayedPosts.length > 0 ? (
              displayedPosts.map(post => (
                <Link href={`/blog/${post.slug}`} key={post.id} className="post-card">
                  {/* Thumbnail Area */}
                  <div className="thumbnail-wrapper">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="post-image"
                      loading="lazy"
                    />
                    <span className="duration-badge">{post.readTime}</span>
                  </div>

                  {/* Content Area */}
                  <div className="post-info">
                    {/* Only show avatar in Grid view, usually */}
                    <div className="author-avatar">
                      {getInitials(post.author)}
                    </div>
                    
                    <div className="post-text">
                      <h3 className="post-title" title={post.title}>{post.title}</h3>
                      <div className="post-meta">
                        <span>{post.author}</span>
                        <span>•</span>
                        <span>{formatDate(post.date)}</span>
                      </div>
                      <p className="post-excerpt">{post.excerpt}</p>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <div className="no-results">
                <h3>No videos... er, articles found 😕</h3>
                <p>Try searching for something else or clear your filters.</p>
                <button 
                  onClick={() => {setSearchQuery(''); setSelectedCategory('All');}} 
                  className="load-more-btn"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Load More Button */}
          {hasMore && (
            <div className="load-more-container">
              <button onClick={handleLoadMore} className="load-more-btn">
                Load More
              </button>
            </div>
          )}
        </main>

        <Footer/>
      </div>
    </>
  );
}