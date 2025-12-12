import { blogPosts } from '../../../data/blogPosts';
import BlogPostContent from './BlogPostContent';
import { notFound } from 'next/navigation';

const getPostBySlug = (slug) => blogPosts.find(post => post.slug === slug);

export async function generateMetadata({ params }) {
  // Destructure and await params
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) return { 
    title: "Post Not Found | HeartEcho", 
    description: "The blog post you're looking for doesn't exist." 
  };

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
}
export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export default async function BlogPost({ params }) {
  // Destructure and await params
  const { slug } = await params;
  
  if (!slug) {
    notFound();
  }

  const post = getPostBySlug(slug);
  
  if (!post) {
    notFound();
  }

  return <BlogPostContent post={post} />;
}