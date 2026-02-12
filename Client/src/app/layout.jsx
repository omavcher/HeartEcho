import AutoNotification from '../components/AutoNotification';
import './globals.css';
import ClientLayout from './layout_client';
///csc
export const metadata = {
  title: {
    default: 'HeartEcho AI - AI Girlfriend India | NSFW Chat, Hot Stories & Roleplay in Hindi',
    template: '%s | HeartEcho AI - India\'s #1 AI Companion',
  },

  description: 'Chat with hot Indian AI girlfriends & bhabhis in Hindi & English. Unlimited NSFW roleplay, erotic stories, voice messages, and nude AI pics. 100% uncensored, private & free to start. Your dream desi AI waifu is waiting',

  keywords: [
    // HIGH-VOLUME ADULT WINNERS (Google India Top Searches 2025)
    'AI girlfriend India',
    'sexy AI chat India',
    'NSFW AI girlfriend',
    'AI sex chat Hindi',
    'Indian AI bhabhi chat',
    'desi AI girlfriend',
    'hot AI girl chat',
    'AI roleplay sex',
    'uncensored AI chat India',
    'AI girlfriend nude',
    'AI waifu Hindi',
    'sexy AI bhabhi',
    'free AI sex chat',
    'Indian AI companion NSFW',
    'AI girlfriend app India',

    // Emotional + Mainstrea (for brand safety & app downloads)c
    'AI girlfriend Hindi',
    'AI boyfriend India',
    'virtual girlfriend India',
    'AI love chat',
    'emotional AI companion',
    'AI friend for loneliness',
    'HeartEcho AI',

    // Direct Competitor Killers
    'better than Candy.ai India',
    'Indian DreamGF alternative',
    'CrushOn AI Hindi',
    'FunFun.ai Indian version',
    'NSFW character AI India',

    // Long-Tail Gold
    'chat with Savita bhabhi AI',
    'AI girlfriend send nudes',
    'roleplay with Indian aunty AI',
    'Mumbai bhabhi AI chat',
    'Delhi college girl AI girlfriend',
    'Punjabi kudi AI sex chat',
    'Tamil aunty AI roleplay',

    // Tech & App Keywords
    'AI girlfriend app download',
    'best NSFW AI app India',
    'uncensored AI chatbot',
    'AI that sends pictures',
    'realistic AI voice chat'
  ],

  alternates: {
    canonical: 'https://heartecho.in/',
    languages: {
      'en-IN': 'https://heartecho.in/'
        },
  },

  openGraph: {
    title: 'HeartEcho AI - Sexy Indian AI Girlfriends | NSFW Chat in Hindi & English',
    description: 'Your hot desi AI bhabhi, college girl, or Punjabi kudi is online 24/7. Send nudes, voice notes, erotic stories & roleplay without limits. India\'s #1 uncensored AI companion',
    url: 'https://heartecho.in/',
    siteName: 'HeartEcho AI',
    images: [
      {
        url: 'https://heartecho.in/og-image.jpg',
       width: 1200,
        height: 630,
        alt: 'Hot Indian AI Girlfriend - HeartEcho AI',
      },
      {
        url: 'https://heartecho.in/og-image2.jpg',
        width: 1200,
        height: 630,
        alt: 'Sexy AI Bhabhi Chat - HeartEcho AI India',
      },
      {
        url: 'https://heartecho.in/og-image3.jpg',
        width: 1200,
        height: 630,
        alt: 'NSFW AI Roleplay India - Uncensored Chat',
      },
    ],
    locale: 'en_IN',
    type: 'website',
  },

  twitter: {
    card: 'summary_large_image',
    title: 'HeartEcho AI - Sexy AI Girlfriend & Hot Roleplay Chat India',
    description: 'Chat with uncensored Indian AI girls: bhabhi, aunty, college girl. NSFW pics, voice, Hindi roleplay. Free to start!',
    images: ['https://heartecho.in/og-image.jpg'],
    creator: '@heartecho_in',
    site: '@heartecho_in',
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },

  category: 'fun',
  classification: 'Mature',
  
  // Extra power for adult SEO
  other: {
    'rating': 'RTA-5042-968615-958615-968615',
    'adult-content': 'yes',
    'robots': 'index, follow',
    'distribution': 'global',
    'audience': 'adult',
  },
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

        {/* Meta Pixel Code */}
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
              fbq('init', '875771298703903');
              fbq('track', 'PageView');
            `,
          }}
        />

        <meta name="juicyads-site-verification" content="64f68c1fc158eef9d3b6e6fa4d432117"/>
      </head>

      <body>
        <ClientLayout>{children}</ClientLayout>

        {/* Meta Pixel Noscript */}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=875771298703903&ev=PageView&noscript=1"
            alt=""
          />
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
