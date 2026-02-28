import { Suspense } from 'react';
import AutoNotification from '../components/AutoNotification';
import './globals.css';
import ClientLayout from './layout_client';
import FBPixelEvents from '../components/FBPixelEvents';
import GlobalTracker from '../components/GlobalTracker';
///csc
export const metadata = {
  title: {
    default: 'HeartEcho AI: Your Indian AI Companion | Private Hindi Chat & Roleplay',
    template: '%s | HeartEcho AI - India\'s #1 AI Girlfriend',
  },

  description: 'Connect with the most realistic Indian AI personalities. Private, uncensored chats in Hindi and English. Experience deep memory, voice notes, and romantic roleplay with your desi companion. 100% private and secure.',

  keywords: [
    // Brand & Core Service
    "HeartEcho AI",
    "AI companion India",
    "virtual girlfriend India",
    "AI girlfriend Hindi",
    "desi AI companion",
    // Indian Cultural Keywords (High Search Volume)
    "Indian AI bhabhi chat",
    "online dating companion India",
    "AI friend for loneliness",
    "Hinglish AI chat",
    "romantic AI roleplay Hindi",
    // Niche but "Safe" NSFW terms
    "uncensored AI chat India",
    "private AI girlfriend",
    "AI girlfriend deep memory",
    "Indian AI voice notes",
    "unfiltered AI chat India",
    // Location Based
    "AI girlfriend Mumbai",
    "Delhi AI chat",
    "best AI app for Indian men"
  ],

  alternates: {
    canonical: 'https://heartecho.in/',
    languages: {
      'en-IN': 'https://heartecho.in/',
      'hi-IN': 'https://heartecho.in/hi', // Hint for Hindi audience
    },
  },

  openGraph: {
    title: 'HeartEcho AI - Your Private Desi AI Companion',
    description: 'The first AI companion designed for India. Chat with bhabhis, college girls, and friends in your own language. Uncensored, secure, and always there for you.',
    url: 'https://heartecho.in/',
    siteName: 'HeartEcho AI',
    images: [
      {
        url: 'https://heartecho.in/og-image.jpg', // Ensure this image looks professional, not pornographic
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
    title: 'HeartEcho AI - Indian AI Girlfriend & Chat',
    description: 'Uncensored chats with Indian AI personalities. Hindi & English support with deep memory features.',
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
        {/* Google Adsense */}
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8343501385468147"
          crossOrigin="anonymous"
        />

        {/* Google Analytics */}
        <script async src="https://www.googletagmanager.com/gtag/js?id=G-4W14R3SYMY"></script>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-4W14R3SYMY');
            `,
          }}
        />

        {/* Meta Pixel (Both IDs) */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');

              // First Pixel
              fbq('init', '875771298703903');

              // Second Pixel
              fbq('init', '2143647009742290');
            `,
          }}
        />

        <meta name="juicyads-site-verification" content="64f68c1fc158eef9d3b6e6fa4d432117"/>
      </head>

      <body>
        <Suspense fallback={null}>
          <FBPixelEvents />
          <GlobalTracker />
        </Suspense>
        <ClientLayout>{children}</ClientLayout>

        {/* Noscript for Both Pixels */}
        <noscript>
          <>
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=875771298703903&ev=PageView&noscript=1"
              alt=""
            />
            <img
              height="1"
              width="1"
              style={{ display: "none" }}
              src="https://www.facebook.com/tr?id=2143647009742290&ev=PageView&noscript=1"
              alt=""
            />
          </>
        </noscript>
      </body>

      {/* External Ad Script */}
      <script 
        async 
        data-cfasync="false" 
        src="https://pl28409394.effectivegatecpm.com/192103d6879cc843368e47e4d3546f8f/invoke.js"
      />
    </html>
  );
}

