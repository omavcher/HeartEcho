"use client";

import { blogPosts } from '../../data/blogPosts';
import Link from 'next/link';
import './blog.css'
import Footer from '../../components/Footer'
import { useState, useMemo, useEffect } from 'react';
import { FaSearch, FaThLarge, FaList, FaUserCircle } from 'react-icons/fa';

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [viewMode, setViewMode] = useState('grid');
  const [visibleCount, setVisibleCount] = useState(12);

  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];

  useEffect(() => {
    setVisibleCount(12);
    // Scroll to top on category change
    if(typeof window !== 'undefined') window.scrollTo(0,0);
  }, [searchQuery, selectedCategory]);

  const filteredPosts = useMemo(() => {
    const lowerQuery = searchQuery.toLowerCase();
    let filtered = blogPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(lowerQuery) ||
        post.excerpt.toLowerCase().includes(lowerQuery);
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
    return filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [searchQuery, selectedCategory]);

  const displayedPosts = filteredPosts.slice(0, visibleCount);
  const hasMore = displayedPosts.length < filteredPosts.length;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if(diffDays < 7) return `${diffDays} days ago`;
    if(diffDays < 30) return `${Math.floor(diffDays/7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <>
      <div className="blg-root-x30sn">
        
        {/* Sticky Header (YouTube Style) */}
        <header className="blg-header-x30sn">
          <div className="blg-top-bar-x30sn">
            <h1 className="blg-page-title-x30sn">Explore</h1>
            
            <div className="blg-search-container-x30sn">
              <div className="blg-search-wrapper-x30sn">
                <input
                  type="text"
                  placeholder="Search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="blg-search-input-x30sn"
                />
                <button className="blg-search-btn-x30sn">
                  <FaSearch />
                </button>
              </div>
            </div>

            <div className="blg-view-toggles-x30sn">
               {/* Hidden on mobile, shown on desktop */}
               <button onClick={() => setViewMode('grid')} className={viewMode === 'grid' ? 'active' : ''}><FaThLarge/></button>
               <button onClick={() => setViewMode('list')} className={viewMode === 'list' ? 'active' : ''}><FaList/></button>
            </div>
          </div>

          {/* Categories Scroll */}
          <div className="blg-chips-bar-x30sn">
            {categories.map(category => (
              <button
                key={category}
                className={`blg-chip-x30sn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </header>

        {/* Content Area */}
        <main className="blg-content-x30sn">
          
          {filteredPosts.length === 0 ? (
            <div className="blg-no-results-x30sn">
              <h3>No results found</h3>
              <p>Try different keywords or remove filters</p>
            </div>
          ) : (
            <div className={`blg-grid-x30sn ${viewMode}`}>
              {displayedPosts.map(post => (
                <Link href={`/blog/${post.slug}`} key={post.id} className="blg-card-x30sn">
                  <div className="blg-thumb-wrapper-x30sn">
                    <img 
                      src={post.image || '/placeholder.jpg'} 
                      alt={post.title} 
                      className="blg-thumb-img-x30sn"
                      loading="lazy"
                    />
                    <div className="blg-duration-x30sn">{post.readTime}</div>
                  </div>

                  <div className="blg-card-info-x30sn">
                    <h3 className="blg-card-title-x30sn">{post.title}</h3>
                    <div className="blg-card-meta-x30sn">
                      <span className="blg-author-x30sn">{post.author}</span>
                      <span className="blg-dot-x30sn">•</span>
                      <span>{formatDate(post.date)}</span>
                    </div>
                    {viewMode === 'list' && <p className="blg-excerpt-x30sn">{post.excerpt}</p>}
                  </div>
                </Link>
              ))}
            </div>
          )}

          {hasMore && (
            <div className="blg-load-more-x30sn">
              <button onClick={() => setVisibleCount(p => p + 12)}>Load more</button>
            </div>
          )}
        </main>
        
        <Footer/>
      </div>
    </>
  );
}