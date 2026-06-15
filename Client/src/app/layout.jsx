import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import ClientLayout from './layout_client';
import FBPixelEvents from '../components/FBPixelEvents';
import GlobalTracker from '../components/GlobalTracker';
export const metadata = {
  metadataBase: new URL('https://heartecho.in'),
  title: {
    default: "HeartEcho – AI Girlfriend India | Hindi Chat & Desi",
    template: "%s | HeartEcho",
  },

  description: "Chat with India's most advanced AI girlfriend — in Hindi, Hinglish & English. Free private companion chat, desi roleplay, adult stories & emotional support. 12,000+ members love HeartEcho. Try now →",

  keywords: [
    // Top Search Console performers (actual queries bringing traffic)
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
    // Brand
    "HeartEcho",
    "HeartEcho AI",
    "Heart Echo",
    "heartecho.in",
    // Core product
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
    // Location
    "AI girlfriend Mumbai",
    "Delhi AI chat",
    "best AI app for Indian men",
    // Long-tail
    "India's No1 AI girlfriend",
    "Indian AI girlfriend",
  ],

  alternates: {
    canonical: 'https://heartecho.in/',
    languages: {
      'en-IN': 'https://heartecho.in/',
    },
  },

  openGraph: {
    title: "HeartEcho – India's #1 AI Girlfriend | Hindi AI Chat & Desi Companion",
    description: "Chat with India's most advanced AI girlfriend — in Hindi, Hinglish & English. Free private companion chat, desi roleplay, adult stories & emotional support. Try now →",
    url: 'https://heartecho.in/',
    siteName: 'HeartEcho AI',
    images: [
      {
        url: 'https://heartecho.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HeartEcho AI - India\'s Best AI Girlfriend',
      }
    ],
    locale: 'en_IN',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: "Indian AI Girlfriend — Chat & Roleplay | HeartEcho",
    description: "Chat with India's most advanced AI girlfriend in Hindi. Free private companion chat, desi roleplay & adult stories. Try now →",
    images: ['https://heartecho.in/og-image.jpg'],
    creator: '@heartecho_in',
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
    },
  },

  category: 'Entertainment',
  classification: 'Lifestyle',
};



export default function RootLayout({ children }) {
  return (
    <html lang="en">
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

        {/* Schema Markup for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "Organization",
                  "name": "HeartEcho",
                  "url": "https://heartecho.in/",
                  "logo": "https://heartecho.in/logo.png",
                  "sameAs": [
                    "https://www.instagram.com/heartecho.in",
                    "https://twitter.com/heartecho_in"
                  ],
                  "contactPoint": {
                    "@type": "ContactPoint",
                    "contactType": "customer support",
                    "email": "support@heartecho.in",
                    "availableLanguage": ["English", "Hindi"]
                  }
                },
                {
                  "@type": "WebSite",
                  "name": "HeartEcho",
                  "alternateName": ["Heart Echo", "HeartEcho AI", "India's No 1 AI GF", "Indian AI Girlfriend"],
                  "url": "https://heartecho.in/",
                  "description": "India's #1 AI girlfriend app — chat in Hindi, Hinglish & English with a private AI companion. Desi roleplay, adult stories, voice notes & deep AI memory.",
                  "inLanguage": ["en-IN", "hi"],
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://heartecho.in/discover?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "HeartEcho",
                  "applicationCategory": "LifestyleApplication",
                  "operatingSystem": "Web, Browser",
                  "description": "India's #1 AI girlfriend app — unlimited private Hindi AI chat, desi roleplay, adult stories, voice notes and deep memory. Free to try.",
                  "url": "https://heartecho.in/",
                  "offers": [
                    { "@type": "Offer", "name": "Monthly", "price": "99", "priceCurrency": "INR", "description": "Unlimited messages, AI memory, live interactions" },
                    { "@type": "Offer", "name": "Premium Yearly", "price": "599", "priceCurrency": "INR", "description": "Unlimited messages, deep AI memory, voice calls, hot stories" },
                    { "@type": "Offer", "name": "Ultimate Yearly", "price": "1499", "priceCurrency": "INR", "description": "Unlimited everything — voice, images, videos, priority AI" }
                  ],
                  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "12000", "bestRating": "5" }
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    { "@type": "Question", "name": "Is there a free Indian AI sex chat?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho offers free Indian AI chat with your virtual desi companion. Sign up instantly and start chatting — no payment required to try." } },
                    { "@type": "Question", "name": "Can I chat in Hindi with the AI?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. HeartEcho's AI is built for Hindi and Hinglish speakers. You can use voice notes or text and have deep, natural conversations in your native language." } },
                    { "@type": "Question", "name": "Is there an 18+ AI girlfriend app for Indians?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho is an 18+ AI companion app built for Indian users. It offers private desi roleplay, adult stories in Hinglish, and intimate AI conversations with a personal memory system." } },
                    { "@type": "Question", "name": "Is HeartEcho 100% private?", "acceptedAnswer": { "@type": "Answer", "text": "100% private. Advanced encryption protects all your chats and voice notes. No judgment, no filters — complete privacy for your personal AI conversations." } },
                    { "@type": "Question", "name": "Is HeartEcho better than Candy.ai for Indians?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho is built exclusively for the Indian audience. Unlike western platforms like Candy.ai, our AI understands Indian culture, Hinglish slang, and desi contexts perfectly — at half the price." } },
                    { "@type": "Question", "name": "Can I do desi roleplay on HeartEcho?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho offers customizable private AI roleplay. You can engage in romantic and intimate desi roleplay securely with your virtual AI girlfriend — in Hindi or English." } }
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


<meta name="yandex-verification" content="f941558c4f5b4230" />
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

