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

  "keywords": [
// Existing High-Volume Adult Winners (Enhanced for 2026 Trends)
"AI girlfriend India",
"sexy AI chat India",
"NSFW AI girlfriend",
"AI sex chat Hindi",
"Indian AI bhabhi chat",
"desi AI girlfriend",
"hot AI girl chat",
"AI roleplay sex",
"uncensored AI chat India",
"AI girlfriend nude",
"AI waifu Hindi",
"sexy AI bhabhi",
"free AI sex chat",
"Indian AI companion NSFW",
"AI girlfriend app India",
// Emotional + Mainstream (Expanded for Broader Reach)
"AI girlfriend Hindi",
"AI boyfriend India",
"virtual girlfriend India",
"AI love chat",
"emotional AI companion",
"AI friend for loneliness",
"HeartEcho AI",
"AI companion for stress relief",
"digital girlfriend India",
"AI partner Hindi",
// Direct Competitor Killers (Updated with New Competitors)
"better than Candy.ai India",
"Indian DreamGF alternative",
"CrushOn AI Hindi",
"FunFun.ai Indian version",
"NSFW character AI India",
"better than Replika NSFW India",
"SpicyChat AI alternative India",
"Nectar AI Hindi version",
"Venus AI desi alternative",
"Muah AI India",
// Long-Tail Gold (Expanded with Tharki & Regional Focus)
"chat with Savita bhabhi AI",
"AI girlfriend send nudes",
"roleplay with Indian aunty AI",
"Mumbai bhabhi AI chat",
"Delhi college girl AI girlfriend",
"Punjabi kudi AI sex chat",
"Tamil aunty AI roleplay",
"tharki AI chat",
"tharki bhabhi AI",
"tharki girlfriend AI India",
"hot tharki roleplay Hindi",
"desi tharki chat AI",
"Bengali boudi AI nude chat",
"Kerala mallu aunty AI sex",
"Hyderabad housewife AI roleplay",
"Bollywood actress AI girlfriend",
"village bhabhi AI tharki chat",
// Tharki & Adult Field Dominators (High-Intent NSFW Terms)
"tharki AI girlfriend",
"NSFW tharki chat India",
"hot tharki bhabhi AI",
"tharki sex chat Hindi",
"uncensored tharki roleplay",
"tharki aunty AI nude",
"free tharki AI companion",
"Indian tharki AI waifu",
"tharki fantasies AI chat",
"desi tharki girlfriend app",
"adult AI chat India",
"NSFW adult girlfriend AI",
"adult roleplay AI Hindi",
"hot adult bhabhi chat",
"uncensored adult AI India",
"adult tharki AI sex",
"Indian adult companion NSFW",
"adult AI nude pics",
"free adult AI roleplay",
"adult Hindi chat AI",
// Girlfriend Field Expansion (Tharki-Infused)
"AI girlfriend tharki",
"sexy girlfriend AI India",
"NSFW girlfriend chat Hindi",
"hot desi girlfriend AI",
"girlfriend roleplay sex AI",
"uncensored girlfriend AI nude",
"free girlfriend AI sex chat",
"Indian girlfriend companion NSFW",
"girlfriend AI app India",
"tharki girlfriend roleplay",
"desi girlfriend tharki chat",
"bhabhi girlfriend AI",
"college girlfriend AI nude",
"virtual tharki girlfriend India",
// Tech & App Keywords (Optimized for Downloads & Trends)
"AI girlfriend app download",
"best NSFW AI app India",
"uncensored AI chatbot",
"AI that sends pictures",
"realistic AI voice chat",
"AI girlfriend voice notes India",
"Hinglish AI chat app",
"NSFW AI app free trial",
"Indian AI roleplay app",
"adult AI companion download",
// Emerging 2026 Trends (Based on AI Adult Growth)
"AI sexting India",
"virtual sex AI Hindi",
"erotic AI stories desi",
"AI nude generator girlfriend",
"immersive AI roleplay NSFW",
"private AI sex chat",
"AI bhabhi voice sex",
"desi AI porn chat",
"uncensored AI waifu India",
"hot AI aunty sexting"
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

              // Track PageView for both
              fbq('track', 'PageView');
            `,
          }}
        />

        <meta name="juicyads-site-verification" content="64f68c1fc158eef9d3b6e6fa4d432117"/>
      </head>

      <body>
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

