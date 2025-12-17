import './globals.css';
import ClientLayout from './layout_client';

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

    // Emotional + Mainstream (for brand safety & app downloads)c
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
        <script 
          async 
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8343501385468147"
          crossOrigin="anonymous"
        />
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
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}