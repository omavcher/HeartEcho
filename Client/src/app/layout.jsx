import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import ClientLayout from './layout_client';
import FBPixelEvents from '../components/FBPixelEvents';
import GlobalTracker from '../components/GlobalTracker';
export const metadata = {
  metadataBase: new URL('https://heartecho.in'),

  title: {
    default: "AI Girlfriend Chat in Hindi & English | HeartEcho — Uncensored, Free",
    template: "%s | HeartEcho",
  },

  description:
    "Chat with India's AI girlfriend in Hindi & English. Uncensored, private, judgment-free AI companion. Deep memory keeps your secrets. Desi roleplay, voice notes & emotional support. Free to try →",

  keywords: [
    // ── Brand name (highest priority for Brave / brand searches) ──
    "HeartEcho",
    "Heart Echo",
    "HeartEcho AI",
    "heartecho.in",
    "HeartEcho app",
    "HeartEcho Indian AI girlfriend",
    "HeartEcho kya hai",
    "HeartEcho review",
    "HeartEcho girlfriend",
    "HeartEcho login",
    "HeartEcho signup",
    "HeartEcho vs Replika",
    "HeartEcho vs CandyAI",
    "HeartEcho vs Character AI",
    "HeartEcho free",
    // ── Top Search Console traffic queries ──
    "indian ai sex chat",
    "ai sex chat hindi",
    "hindi sex chat ai",
    "indian sex ai",
    "hindi ai sex chat",
    "desi ai sex chat",
    "indian nsfw ai chat",
    "ai girlfriend indian 18+",
    "hindi ai girlfriend",
    "indian ai girlfriend chat",
    "indian ai nsfw",
    // ── Core product ──
    "AI companion India",
    "virtual girlfriend India",
    "AI girlfriend Hindi",
    "desi AI companion",
    "Indian AI companion chat",
    "Hinglish AI chat",
    "romantic AI roleplay Hindi",
    "private AI chat India",
    "AI girlfriend deep memory",
    "Indian AI voice notes",
    "best AI chat India",
    "AI girlfriend app India",
    "free AI girlfriend India",
    "best AI girlfriend India",
    // ── Hindi long-tail (Brave India traffic) ──
    "AI dost hindi mein",
    "pyaar karne wali AI",
    "AI se baat karo hindi",
    "Hindi mein AI girlfriend",
    "AI girlfriend hindi mein baat karo",
    // ── Location ──
    "AI girlfriend Mumbai",
    "Delhi AI chat",
    "Bangalore AI companion",
    "best AI app for Indian men",
    // ── Category / long-tail ──
    "India No1 AI girlfriend",
    "Indian AI girlfriend free",
    "replika alternative India",
    "candy ai alternative India",
    "character ai alternative India",
    "AI girlfriend that speaks Hindi",
    "virtual relationship app India 2026",
  ],

  alternates: {
    canonical: 'https://heartecho.in/',
    languages: {
      'en-IN': 'https://heartecho.in/',
      'hi-IN': 'https://heartecho.in/',
    },
  },

  openGraph: {
    title: "HeartEcho — India's #1 AI Girlfriend | Hindi AI Chat & Desi Companion",
    description:
      "Chat with India's most advanced AI girlfriend — in Hindi, Hinglish & English. Free private companion chat, desi roleplay, adult stories & emotional support. Try now →",
    url: 'https://heartecho.in/',
    siteName: 'HeartEcho',
    images: [
      {
        url: 'https://heartecho.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "HeartEcho — India's #1 AI Girlfriend App",
      },
      {
        url: 'https://heartecho.in/og-image2.jpg',
        width: 1200,
        height: 630,
        alt: 'HeartEcho AI Companion India',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: "HeartEcho — Indian AI Girlfriend | Hindi Chat & Roleplay",
    description:
      "Chat with India's most advanced AI girlfriend in Hindi. Free private companion chat, desi roleplay & adult stories. Try now →",
    images: ['https://heartecho.in/og-image.jpg'],
    creator: '@heartecho_in',
    site: '@heartecho_in',
  },

  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  // ── Verification tokens ──
  verification: {
    google: '8_xRyF1zJ29s3pPv0kOqYN',
    yandex: 'dd39df4fc482a7c0',
    other: {
      // Add Bing Webmaster token here once registered at https://www.bing.com/webmasters
      // 'msvalidate.01': 'YOUR_BING_TOKEN_HERE',
    },
  },

  category: 'Entertainment',
  classification: 'Lifestyle',

  // ── App metadata for mobile/Brave suggestions ──
  applicationName: 'HeartEcho',
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',
  authors: [{ name: 'Om Avchar', url: 'https://heartecho.in/about' }],
  creator: 'Om Avchar',
  publisher: 'HeartEcho',
};



export default function RootLayout({ children }) {
  return (
    <html lang="en-IN">
      <head>
        {/* ── Preconnect to 3rd-party origins (reduces DNS+TLS time) ── */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="preconnect" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://pagead2.googlesyndication.com" />

        {/* ── Zero-lag Referral Tracker (must be sync for cookie write) ── */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=window.location.search;if(p&&(p.includes('ref=')||p.includes('referral'))){var r=new URLSearchParams(p);var c=r.get('ref')||r.get('referral_code')||r.get('referralId');if(c){localStorage.setItem('referralCode',c);document.cookie='referralCode='+encodeURIComponent(c)+'; path=/; max-age='+(30*24*60*60)+'; SameSite=Lax';}}}catch(e){}})();`
          }}
        />

        <meta name="juicyads-site-verification" content="64f68c1fc158eef9d3b6e6fa4d432117"/>

        {/* ── TrafficJunky Head Integration ── */}
        <meta httpEquiv="Delegate-CH" content="sec-ch-ua https://ads.trafficjunky.net; sec-ch-ua-arch https://ads.trafficjunky.net; sec-ch-ua-full-version-list https://ads.trafficjunky.net; sec-ch-ua-mobile https://ads.trafficjunky.net; sec-ch-ua-model https://ads.trafficjunky.net; sec-ch-ua-platform https://ads.trafficjunky.net; sec-ch-ua-platform-version https://ads.trafficjunky.net;" />
        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
              var _mpevt = _mpevt || [];
              (function(){
                var u=(("https:" == document.location.protocol) ? "https://static.trafficjunky.com/js/mp.min.js" : "http://static.trafficjunky.com/js/mp.min.js");
                var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0]; g.type='text/javascript'; g.defer=true; g.async=true;g.src=u;
                s.parentNode.insertBefore(g,s);
              })();
            `
          }}
        />

        {/* Schema Markup for SEO — optimised for Brave, Google, Bing & AI crawlers */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "@id": "https://heartecho.in/#organization",
                  "name": "HeartEcho",
                  "alternateName": ["Heart Echo", "HeartEcho AI", "heartecho.in"],
                  "url": "https://heartecho.in/",
                  "logo": {
                    "@type": "ImageObject",
                    "url": "https://heartecho.in/heartecho.png",
                    "width": 512,
                    "height": 512
                  },
                  "image": "https://heartecho.in/og-image.jpg",
                  "description": "HeartEcho is India's #1 AI girlfriend and companion platform — chat in Hindi, Hinglish & English with 20+ Indian AI personas. Built for Indian culture.",
                  "foundingDate": "2024",
                  "founder": {
                    "@type": "Person",
                    "name": "Om Avchar",
                    "url": "https://heartecho.in/blog/om-avchar-founder-heartecho"
                  },
                  "areaServed": {
                    "@type": "Country",
                    "name": "India"
                  },
                  "sameAs": [
                    "https://www.instagram.com/heartecho.in",
                    "https://twitter.com/heartecho_in",
                    "https://play.google.com/store/apps/details?id=com.heartecho.ai",
                    "https://heartecho.in"
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "email": "support@heartecho.in",
                    "availableLanguage": ["English", "Hindi", "Hinglish"]
                  }
                },
                {
                  "@type": "WebSite",
                  "@id": "https://heartecho.in/#website",
                  "name": "HeartEcho",
                  "alternateName": [
                    "Heart Echo",
                    "HeartEcho AI",
                    "HeartEcho App",
                    "India's No 1 AI Girlfriend",
                    "Indian AI Girlfriend",
                    "heartecho.in"
                  ],
                  "url": "https://heartecho.in/",
                  "publisher": { "@id": "https://heartecho.in/#organization" },
                  "description": "India's #1 AI girlfriend app — chat in Hindi, Hinglish & English with a private AI companion. Desi roleplay, adult stories, voice notes & deep AI memory. HeartEcho.",
                  "inLanguage": ["en-IN", "hi"],
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": {
                      "@type": "EntryPoint",
                      "urlTemplate": "https://heartecho.in/discover?q={search_term_string}"
                    },
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "WebPage",
                  "@id": "https://heartecho.in/#webpage",
                  "url": "https://heartecho.in/",
                  "name": "HeartEcho — India's #1 AI Girlfriend | Hindi AI Chat & Desi Companion",
                  "isPartOf": { "@id": "https://heartecho.in/#website" },
                  "about": { "@id": "https://heartecho.in/#organization" },
                  "description": "Chat with India's most advanced AI girlfriend — in Hindi, Hinglish & English. Private AI companion chat, desi roleplay, adult stories & emotional support.",
                  "inLanguage": ["en-IN", "hi"],
                  "breadcrumb": {
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                      { "@type": "ListItem", "position": 1, "name": "HeartEcho Home", "item": "https://heartecho.in/" }
                    ]
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://heartecho.in/#softwareapp",
                  "name": "HeartEcho Web App",
                  "applicationCategory": "LifestyleApplication",
                  "applicationSubCategory": "AI Companion",
                  "operatingSystem": "Web, Any Browser",
                  "browserRequirements": "Requires JavaScript. Works on Chrome, Firefox, Brave, Safari, Edge.",
                  "description": "India's #1 AI girlfriend app — unlimited private Hindi AI chat, desi roleplay, adult stories, voice notes and deep memory. HeartEcho. Free to try.",
                  "url": "https://heartecho.in/",
                  "screenshot": "https://heartecho.in/og-image.jpg",
                  "featureList": [
                    "AI chat in Hindi and Hinglish",
                    "20+ Indian AI companion personas",
                    "Voice notes and AI voice replies",
                    "Desi roleplay and adult stories",
                    "AI memory system",
                    "Private and encrypted conversations"
                  ],
                  "offers": [
                    { "@type": "Offer", "name": "Free Plan",     "price": "0",    "priceCurrency": "INR", "description": "Free AI chat with limited messages" },
                    { "@type": "Offer", "name": "Monthly",       "price": "99",   "priceCurrency": "INR", "description": "Unlimited messages, AI memory, live interactions" },
                    { "@type": "Offer", "name": "Premium Yearly","price": "599",  "priceCurrency": "INR", "description": "Unlimited messages, deep AI memory, voice calls, hot stories" },
                    { "@type": "Offer", "name": "Ultimate Yearly","price": "1499", "priceCurrency": "INR", "description": "Unlimited everything — voice, images, videos, priority AI" }
                  ],
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "ratingCount": "12000",
                    "bestRating": "5",
                    "worstRating": "1"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "@id": "https://heartecho.in/#androidapp",
                  "name": "HeartEcho — Indian AI Girlfriend & Desi Companion Mobile App",
                  "applicationCategory": "LifestyleApplication",
                  "operatingSystem": "Android",
                  "downloadUrl": "https://play.google.com/store/apps/details?id=com.heartecho.ai",
                  "description": "Download HeartEcho Android app. Chat with 20+ Indian AI girlfriend & boyfriend companions, send voice notes, and roleplay securely on your mobile.",
                  "offers": {
                    "@type": "Offer",
                    "price": "0",
                    "priceCurrency": "INR"
                  },
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "ratingCount": "12000",
                    "bestRating": "5",
                    "worstRating": "1"
                  }
                },
                {
                  "@type": "LocalBusiness",
                  "@id": "https://heartecho.in/#localbusiness",
                  "name": "HeartEcho",
                  "description": "India's #1 AI girlfriend & companion platform. Chat in Hindi, Hinglish & English with 20+ Indian AI personas.",
                  "url": "https://heartecho.in",
                  "telephone": "+91-support",
                  "email": "support@heartecho.in",
                  "priceRange": "₹0 - ₹1,499",
                  "currenciesAccepted": "INR",
                  "paymentAccepted": "UPI, Credit Card, Debit Card, Net Banking",
                  "areaServed": [
                    { "@type": "City", "name": "Mumbai" },
                    { "@type": "City", "name": "Pune" },
                    { "@type": "City", "name": "Jabalpur" },
                    { "@type": "City", "name": "Bengaluru" },
                    { "@type": "City", "name": "Kolkata" },
                    { "@type": "City", "name": "Chennai" },
                    { "@type": "City", "name": "New Delhi" },
                    { "@type": "City", "name": "Indore" },
                    { "@type": "City", "name": "Bhopal" },
                    { "@type": "City", "name": "Jaipur" },
                    { "@type": "City", "name": "Ahmedabad" },
                    { "@type": "City", "name": "Chandigarh" },
                    { "@type": "City", "name": "Siliguri" },
                    { "@type": "City", "name": "Hyderabad" },
                    { "@type": "City", "name": "Raipur" },
                    { "@type": "Country", "name": "India" }
                  ],
                  "sameAs": [
                    "https://www.instagram.com/heartecho.in",
                    "https://twitter.com/heartecho_in"
                  ]
                },
                {
                  "@type": "Product",
                  "@id": "https://heartecho.in/#product",
                  "name": "HeartEcho AI Girlfriend & Companion",
                  "description": "India's #1 AI girlfriend app — chat in Hindi, Hinglish & English with private AI companions. Desi roleplay, deep memory, voice notes & emotional support.",
                  "brand": { "@type": "Brand", "name": "HeartEcho" },
                  "image": "https://heartecho.in/og-image.jpg",
                  "url": "https://heartecho.in",
                  "offers": [
                    { "@type": "Offer", "name": "Free Plan", "price": "0", "priceCurrency": "INR", "availability": "https://schema.org/InStock" },
                    { "@type": "Offer", "name": "Monthly Plan", "price": "99", "priceCurrency": "INR", "availability": "https://schema.org/InStock" },
                    { "@type": "Offer", "name": "Premium Yearly", "price": "599", "priceCurrency": "INR", "availability": "https://schema.org/InStock" },
                    { "@type": "Offer", "name": "Ultimate Yearly", "price": "1499", "priceCurrency": "INR", "availability": "https://schema.org/InStock" }
                  ],
                  "aggregateRating": {
                    "@type": "AggregateRating",
                    "ratingValue": "4.9",
                    "ratingCount": "12000",
                    "bestRating": "5",
                    "worstRating": "1"
                  }
                },
                {
                  "@type": "FAQPage",
                  "@id": "https://heartecho.in/#faq",
                  "mainEntity": [
                    { "@type": "Question", "name": "What is HeartEcho?", "acceptedAnswer": { "@type": "Answer", "text": "HeartEcho is India's #1 AI girlfriend and companion app. It lets you chat in Hindi, Hinglish, and English with 20+ Indian AI personas. It's private, free to try, and built specifically for Indian culture." } },
                    { "@type": "Question", "name": "HeartEcho kya hai?", "acceptedAnswer": { "@type": "Answer", "text": "HeartEcho ek Indian AI girlfriend app hai jo aapko Hindi aur Hinglish mein private AI companion se baat karne deta hai. Yeh India ka #1 AI companion platform hai." } },
                    { "@type": "Question", "name": "Is HeartEcho free?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho is free to try — sign up and start chatting instantly with your AI companion. Premium plans start at ₹99/month for unlimited messages and AI memory." } },
                    { "@type": "Question", "name": "Is there a free Indian AI sex chat?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho offers free Indian AI chat with your virtual desi companion. Sign up instantly and start chatting — no payment required to try." } },
                    { "@type": "Question", "name": "Can I chat in Hindi with the AI?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. HeartEcho's AI is built for Hindi and Hinglish speakers. You can use voice notes or text and have deep, natural conversations in your native language." } },
                    { "@type": "Question", "name": "Is HeartEcho better than Candy.ai for Indians?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho is built exclusively for the Indian audience. Unlike western platforms like Candy.ai, our AI understands Indian culture, Hinglish slang, and desi contexts perfectly — at half the price." } },
                    { "@type": "Question", "name": "Is HeartEcho better than Replika?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho is India's answer to Replika — built for Hindi speakers, Indian cultural contexts, and Hinglish conversations. It's cheaper and more culturally relevant for Indian users." } },
                    { "@type": "Question", "name": "Is HeartEcho 100% private?", "acceptedAnswer": { "@type": "Answer", "text": "100% private. Advanced encryption protects all your chats and voice notes. No judgment, no filters — complete privacy for your personal AI conversations on HeartEcho." } }
                  ]
                }
              ]
            })
          }}
        />
      </head>

      <body>
        <Suspense fallback={null}>
          <FBPixelEvents />
          <GlobalTracker />
        </Suspense>
        <ClientLayout>{children}</ClientLayout>

        {/* ── Google Analytics + Ads — afterInteractive (non-blocking) ── */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-4W14R3SYMY"
        />
        <Script
          id="gtag-init"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4W14R3SYMY');
              gtag('config', 'AW-363591459');
            `,
          }}
        />
        <Script
          id="fb-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','936362649426203');
            `,
          }}
        />
        {/* ── Google AdSense — lazyOnload ── */}
        <Script
          strategy="lazyOnload"
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8343501385468147"
          crossOrigin="anonymous"
        />

        {/* ── External Ad Network — lazyOnload ── */}
        <Script
          strategy="lazyOnload"
          data-cfasync="false"
          src="https://pl28409394.effectivegatecpm.com/192103d6879cc843368e47e4d3546f8f/invoke.js"
        />
      </body>
    </html>
  );
}

