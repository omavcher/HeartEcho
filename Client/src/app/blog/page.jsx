import { blogPosts } from '../../data/blogPosts';
import Link from 'next/link';
import Head from 'next/head';
import './blog.css'
import Footer from '../../components/Footer'

export const metadata = {
  title: "Blog",
};

export default function BlogPage() {
  return (
    <>
      <Head>
        <link rel="canonical" href="https://heartecho.in/blog" />
        <meta name="robots" content="index, follow" />
      </Head>
      
      <div className="blog-container">
        <header className="blog-header">
          <h1>AI Companions Blog</h1>
          <p className="subtitle">Insights on Virtual Relationships and AI Technology</p>
        </header>

        <div className="blog-grid">
          {blogPosts.map(post => (
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
                    <span className="date">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
          ))}
        </div>
      </div>
      <Footer/>
    </>
  );
}