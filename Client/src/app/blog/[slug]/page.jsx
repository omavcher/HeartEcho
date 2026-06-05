import { blogPosts } from '../../../data/blogPosts';
import BlogPostContent from './BlogPostContent';
import { notFound } from 'next/navigation';
import { getBlogPageSchema } from '../../../utils/schema';

const getPostBySlug = (slug) => blogPosts.find(post => post.slug === slug);

export async function generateMetadata({ params }) {
  // Destructure and await params
  const { slug } = await params;
  const post = getPostBySlug(slug);
  
  if (!post) return { 
    title: "Post Not Found | HeartEcho", 
    description: "The blog post you're looking for doesn't exist.",
    alternates: {
      canonical: 'https://heartecho.in/blog',
    }
  };

  const resolvedTitle = post.metaTitle ? `${post.metaTitle} | HeartEcho` : `${post.title} | HeartEcho`;

  return {
    title: resolvedTitle,
    description: post.excerpt,
    keywords: `${post.category}, AI, HeartEcho, ${post.title}`,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.excerpt,
      url: `https://heartecho.in/blog/${post.slug}`,
      type: "article",
      images: [{ url: post.image, width: 1200, height: 630, alt: post.alt }],
    },
    alternates: {
      canonical: `https://heartecho.in/blog/${post.slug}`,
    },
  };
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

  const blogSchema = getBlogPageSchema({
    url: `https://heartecho.in/blog/${post.slug}`,
    headline: post.title,
    description: post.excerpt,
    image: post.image,
    datePublished: post.date,
    authorName: post.author || "Om Awchar"
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <BlogPostContent post={post} />
    </>
  );
}