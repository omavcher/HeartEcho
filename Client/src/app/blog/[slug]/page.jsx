import { blogPosts } from '../../../data/blogPosts';
import Head from 'next/head';
import Link from 'next/link';
import '../blog.css';
import Footer from '../../../components/Footer';
import PropTypes from 'prop-types';
import NotFound from '../../not-found'
// Helper function to find a post by slug
const getPostBySlug = (slug) => {
  return blogPosts.find(post => post.slug === slug);
};

// Handle metadata safely
export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Post Not Found | HeartEcho",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | HeartEcho`,
    description: post.excerpt,
    keywords: `${post.category}, Om Avchar, HeartEcho , Blog, AI companions, ${post.title}`,
    openGraph: {
      title: `${post.title} | HeartEcho`,
      description: post.excerpt,
      url: `https://heartecho.in/blog/${post.slug}`,
      type: "article",
      images: [
        {
          url: post.image,
          width: 1200,
          height: 630,
          alt: post.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${post.title} | HeartEcho`,
      description: post.excerpt,
      images: [post.image],
    },
  };
}

// BlogPostContent component (only renders if post exists)
function BlogPostContent({ post }) {
  return (
    <>
      <Head>
        <link rel="canonical" href={`https://heartecho.in/blog/${post.slug}`} />
        <meta name="robots" content="index, follow" />
      </Head>

      <div className="blog-post-container">
        <article className="blog-post">
          <header className="post-header">
            <div className="breadcrumb">
              <Link href="/blog">Blog</Link> &gt; {post.category}
            </div>
            <h1>{post.title}</h1>
            <div className="post-meta">
              <span className="author">By {post.author}</span>
              <span className="date">
                {new Date(post.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
              <span className="read-time">{post.readTime}</span>
            </div>
          </header>

          <div className="featured-image">
            <img 
              src={post.image} 
              alt={post.alt}
              loading="eager"
            />
          </div>

          <div 
            className="post-content" 
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <footer className="post-footer">
            <div className="tags">
              <span>Tagged: </span>
                {post.category}
            </div>
          </footer>
        </article>

        <aside className="related-posts">
          <h3>You Might Also Like</h3>
          <div className="related-grid">
            {blogPosts
              .filter(p => p.id !== post.id)
              .slice(0, 3)
              .map(relatedPost => (
                <div key={relatedPost.id} className="related-card">
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <img src={relatedPost.image} alt={relatedPost.alt} />
                    <h4>{relatedPost.title}</h4>
                    <p className="related-excerpt">{relatedPost.excerpt}</p>
                  </Link>
                </div>
              ))}
          </div>
        </aside>
      </div>
      <Footer />
    </>
  );
}

BlogPostContent.propTypes = {
  post: PropTypes.object.isRequired,
};

// Main BlogPost component (handles missing posts)
export default function BlogPost({ params }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    return (
      <NotFound/>
    );
  }

  return <BlogPostContent post={post} />;
}

BlogPost.propTypes = {
  params: PropTypes.shape({
    slug: PropTypes.string.isRequired,
  }).isRequired,
};