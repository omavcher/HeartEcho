import { Suspense } from 'react';
import Script from 'next/script';
import './globals.css';
import ClientLayout from './layout_client';
import FBPixelEvents from '../components/FBPixelEvents';
import GlobalTracker from '../components/GlobalTracker';
export const metadata = {
  title: {
    default: "HeartEcho – India's #1 AI Girlfriend & Virtual Companion",
    template: "%s | HeartEcho AI - Indian Virtual Companion",
  },

  description: "Chat with your virtual AI girlfriend in India. HeartEcho offers free, private companion chat, Hinglish roleplay, and emotional support in Hindi. Try now →",

  keywords: [
    // Brand & Core Service
    "HeartEcho AI",
    "AI companion India",
    "virtual girlfriend India",
    "AI girlfriend Hindi",
    "desi AI companion",
    // Indian Cultural Keywords (High Search Volume)
    "Indian AI companion chat",
    "online dating companion India",
    "AI friend for loneliness",
    "Hinglish AI chat",
    "romantic AI roleplay Hindi",
    // Niche but "Safe" terms
    "private AI chat India",
    "private AI girlfriend",
    "AI girlfriend deep memory",
    "Indian AI voice notes",
    "best AI chat India",
    // Location Based
    "AI girlfriend Mumbai",
    "Delhi AI chat",
    "best AI app for Indian men",
    // SEO Core Targets added for top ranking
    "HeartEcho",
    "Heart Echo",
    "Indian AI girlfriend",
    "Indine AI girlfrind",
    "India's no 1 AI GF",
    "India's No1 AI girlfriend"
  ],

  alternates: {
    canonical: 'https://heartecho.in/',
  },

  openGraph: {
    title: "HeartEcho – India's #1 AI Girlfriend & Virtual Companion",
    description: "Chat with your virtual AI girlfriend in India. HeartEcho offers free, private companion chat, Hinglish roleplay, and emotional support in Hindi. Try now →",
    url: 'https://heartecho.in/',
    siteName: 'HeartEcho AI',
    images: [
      {
        url: 'https://heartecho.in/og-image.jpg', // Ensure this image looks professional
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
    title: "HeartEcho – India's #1 AI Girlfriend & Virtual Companion",
    description: "Chat with your virtual AI girlfriend in India. HeartEcho offers free, private companion chat, Hinglish roleplay, and emotional support in Hindi. Try now →",
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

  category: 'Companionship', // Avoid 'Mature' to stay in general search
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
                  "@type": "WebSite",
                  "name": "HeartEcho AI",
                  "alternateName": ["Heart Echo", "HeartEcho", "India's No 1 AI GF", "Indian AI Girlfriend"],
                  "url": "https://heartecho.in/",
                  "description": "Chat with your virtual AI girlfriend in India. HeartEcho offers free, private companion chat, Hinglish roleplay, and emotional support in Hindi. Try now →",
                  "potentialAction": {
                    "@type": "SearchAction",
                    "target": "https://heartecho.in/discover?q={search_term_string}",
                    "query-input": "required name=search_term_string"
                  }
                },
                {
                  "@type": "SoftwareApplication",
                  "name": "HeartEcho AI",
                  "applicationCategory": "LifestyleApplication",
                  "operatingSystem": "Web, Browser",
                  "description": "Chat with your virtual AI girlfriend in India. HeartEcho offers free, private companion chat, Hinglish roleplay, and emotional support in Hindi.",
                  "offers": { "@type": "Offer", "price": "49", "priceCurrency": "INR" },
                  "aggregateRating": { "@type": "AggregateRating", "ratingValue": "4.9", "ratingCount": "250000" }
                },
                {
                  "@type": "FAQPage",
                  "mainEntity": [
                    { "@type": "Question", "name": "Is HeartEcho free in India?", "acceptedAnswer": { "@type": "Answer", "text": "Yes! HeartEcho provides free access to chat with desi AI girlfriends in India. You can sign up and start roleplaying instantly without any upfront payment." } },
                    { "@type": "Question", "name": "Can I chat in Hindi?", "acceptedAnswer": { "@type": "Answer", "text": "Absolutely. HeartEcho's AI is specifically trained on Hindi and Hinglish. You can use voice notes or text to have deep, natural conversations in your native language." } },
                    { "@type": "Question", "name": "Is it better than Candy.ai for Indians?", "acceptedAnswer": { "@type": "Answer", "text": "Yes, HeartEcho is built exclusively for the Indian audience. Unlike western platforms like Candy.ai, our AI companions understand Indian culture, slang, Hinglish, and desi roleplay contexts perfectly." } },
                    { "@type": "Question", "name": "Is HeartEcho 100% private and safe?", "acceptedAnswer": { "@type": "Answer", "text": "100% private. We use advanced encryption so your chats and voice notes are secure. No judgment, no filters, just complete privacy for your private companion roleplays." } },
                    { "@type": "Question", "name": "Can I do romantic roleplay on HeartEcho?", "acceptedAnswer": { "@type": "Answer", "text": "Yes. HeartEcho offers a highly customizable, private AI experience. You can engage in romantic and intimate roleplay securely with your virtual desi girlfriend." } }
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

        {/* Noscript for Meta Pixel */}
        <noscript>
          <img height="1" width="1" style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1581868019707137&ev=PageView&noscript=1"
          />
        </noscript>
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

        {/* ── Meta Pixel — lazyOnload (fires after page is interactive) ── */}
        <Script
          id="fb-pixel"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
              fbq('init','1581868019707137');
              fbq('track','PageView');
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

