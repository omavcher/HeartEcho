"use client";

import { blogPosts } from '../../data/blogPosts';
import Link from 'next/link';
import Head from 'next/head';
import './blog.css'
import Footer from '../../components/Footer'
import { useState, useMemo } from 'react';

// Remove the metadata export since it can't be used in client components
// You can use Next.js metadata in a layout file instead

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  // Get all unique categories
  const categories = ['All', ...new Set(blogPosts.map(post => post.category))];

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = blogPosts.filter(post => {
      const matchesSearch = 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });

    // Sort posts
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.date) - new Date(a.date));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.date) - new Date(b.date));
        break;
      case 'title-asc':
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case 'title-desc':
        filtered.sort((a, b) => b.title.localeCompare(a.title));
        break;
      case 'read-time':
        filtered.sort((a, b) => parseInt(a.readTime) - parseInt(b.readTime));
        break;
      default:
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategory, sortBy]);

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSortBy('newest');
  };

  return (
    <>
      <Head>
        <title>Blog - HeartEcho</title>
        <meta name="description" content="Explore the future of relationships with AI companions. Learn about virtual dating, emotional AI technology, mental health support, and the psychology of digital love." />
        <meta name="keywords" content="AI companions, virtual relationships, AI girlfriend, AI boyfriend, emotional AI, digital love, mental health AI, future of relationships" />
        <link rel="canonical" href="https://heartecho.in/blog" />
        <meta name="robots" content="index, follow" />
      </Head>
      
      <div className="blog-container">
        <header className="blog-header">
          <h1>AI Companions Blog</h1>
          <p className="subtitle">Insights on Virtual Relationships and AI Technology</p>
        </header>

        {/* Search and Filter Section */}
        <div className="blog-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="category-filter">Category:</label>
              <select
                id="category-filter"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="filter-select"
              >
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="sort-filter">Sort by:</label>
              <select
                id="sort-filter"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="filter-select"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title-asc">Title A-Z</option>
                <option value="title-desc">Title Z-A</option>
                <option value="read-time">Read Time</option>
              </select>
            </div>

            <button 
              onClick={clearFilters}
              className="clear-filters-btn"
            >
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Info */}
        <div className="results-info">
          <p>
            Showing {filteredPosts.length} of {blogPosts.length} articles
            {searchQuery && ` for "${searchQuery}"`}
            {selectedCategory !== 'All' && ` in ${selectedCategory}`}
          </p>
        </div>

        {/* Blog Grid */}
        <div className="blog-grid">
          {filteredPosts.length > 0 ? (
            filteredPosts.map(post => (
              <article key={post.id} className="blog-card">
                <Link href={`/blog/${post.slug}`} className="blog-card-link">
                  <div className="blog-image-container">
                    <img 
                      src={post.image} 
                      alt={post.alt} 
                      className="blog-image"
                      loading="lazy"
                    />
                    <span className="category-badge">{post.category}</span>
                  </div>
                  <div className="blog-content">
                    <div className="meta-info">
                      <span className="date">
                        {new Date(post.date).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </span>
                      <span className="read-time">{post.readTime}</span>
                    </div>
                    <h2>{post.title}</h2>
                    <p className="excerpt">{post.excerpt}</p>
                    <div className="author-info">
                      <span>By {post.author}</span>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          ) : (
            <div className="no-results">
              <h3>No articles found</h3>
              <p>Try adjusting your search terms or filters</p>
              <button onClick={clearFilters} className="clear-filters-btn">
                Clear all filters
              </button>
            </div>
          )}
        </div>
      </div>
      <Footer/>
    </>
  );
}