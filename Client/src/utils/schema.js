export function getHomepageSchema() {
  return [
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      "name": "HeartEcho",
      "description": "AI Girlfriend Chat Application",
      "applicationCategory": "Entertainment",
      "url": "https://heartecho.in",
      "operatingSystem": "Web, Android, iOS",
      "offers": {
        "@type": "Offer",
        "price": "Free, ₹499+",
        "priceCurrency": "INR"
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": "4.5",
        "ratingCount": "800"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": "HeartEcho",
      "url": "https://heartecho.in",
      "logo": "https://heartecho.in/heartecho.png",
      "sameAs": [
        "https://www.instagram.com/heartecho.in"
      ]
    }
  ];
}

export function getLandingPageSchema({ url, title, description, faqs = [], breadcrumbs = [] }) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      "url": url,
      "name": title,
      "description": description
    }
  ];

  if (faqs && faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question || faq.name,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer || (faq.acceptedAnswer && faq.acceptedAnswer.text)
        }
      }))
    });
  }

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((bc, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": bc.name,
        "item": bc.item
      }))
    });
  }

  return schemas;
}

export function getBlogPageSchema({
  url,
  headline,
  description,
  image,
  datePublished,
  dateModified,
  authorName = "Om Awchar",
  faqs = []
}) {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    "url": url,
    "headline": headline,
    "description": description,
    "image": image || "https://heartecho.in/og-image.jpg",
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": {
      "@type": "Person",
      "name": authorName
    },
    "publisher": {
      "@type": "Organization",
      "name": "HeartEcho",
      "logo": {
        "@type": "ImageObject",
        "url": "https://heartecho.in/heartecho.png"
      }
    }
  };

  const schemas = [articleSchema];

  if (faqs && faqs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question || faq.name,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer || (faq.acceptedAnswer && faq.acceptedAnswer.text)
        }
      }))
    });
  }

  return schemas;
}

export function getPersonaPageSchema({ url, name, description, breadcrumbs = [] }) {
  const schemas = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      "url": url,
      "name": `Chat with ${name} — AI Companion | HeartEcho`,
      "description": description || `Chat online with ${name}, your friendly AI companion on HeartEcho.`
    }
  ];

  if (breadcrumbs && breadcrumbs.length > 0) {
    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((bc, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": bc.name,
        "item": bc.item
      }))
    });
  }

  return schemas;
}
