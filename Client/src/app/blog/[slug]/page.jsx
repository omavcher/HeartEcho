import { blogPosts } from '../../../data/blogPosts';
import BlogPostContent from './BlogPostContent';
import NotFound from '../../not-found';

const getPostBySlug = (slug) => blogPosts.find(post => post.slug === slug);

export async function generateMetadata({ params }) {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Post Not Found | HeartEcho", description: "Not found" };

  return {
    title: `${post.title} | HeartEcho`,
    description: post.excerpt,
    keywords: `${post.category}, AI, HeartEcho, ${post.title}`,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: `https://heartecho.in/blog/${post.slug}`,
      type: "article",
      images: [{ url: post.image, width: 1200, height: 630, alt: post.alt }],
    },
  };
}

export default function BlogPost({ params }) {
  if (!params || !params.slug) {
    return <NotFound />;
  }

  const post = getPostBySlug(params.slug);
  
  if (!post) {
    return <NotFound />;
  }

  return <BlogPostContent post={post} />;
}