import { blogPosts } from '../../../data/blogPosts';
import Head from 'next/head';
import Link from 'next/link';
import '../blog.css'
import Footer from '../../../components/Footer';

export async function generateMetadata({ params }) {
  const post = blogPosts.find(post => post.slug === params.slug);
  
  return {
    title: `${post.title} | HeartEcho`,
    description: post.excerpt,
    keywords: `${post.category}, AI companions, ${post.title}`,
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
  };
}

export default function BlogPost({ params }) {
  const post = blogPosts.find(post => post.slug === params.slug);

  if (!post) {
    return <div>Post not found</div>;
  }

  return (
    <>
      <Head>
        <link rel="canonical" href={`https://yourdomain.com/blog/${post.slug}`} />
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
              <span className="date">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
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
              <a href={`/blog/category/${post.category.toLowerCase().replace(/\s+/g, '-')}`}>{post.category}</a>
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
      <Footer/>
    </>
  );
}