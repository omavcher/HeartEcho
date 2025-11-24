import './globals.css';
import ClientLayout from './layout_client';

export const metadata = {
  title: {
    default: 'HeartEcho Ai - AI Girlfriends & Boyfriends for Realistic Virtual Companionship',
    template: '%s | HeartEcho Ai',
  },  
  description: 'HeartEcho Ai is India\'s leading AI relationship platform with 20+ unique AI girlfriends and boyfriends. Experience emotionally intelligent chat companions, personalized responses, and secure access across all Indian regions.',
  keywords: [
    // Primary Core Keywords
    'AI girlfriend India',
    'AI boyfriend India',
    'virtual relationships',
    'AI chat companion',
    'AI dating app',
    'emotional AI chatbot',
    'HeartEcho',
    'AI partner India',
    'realistic AI companion',
    'digital relationship app',
    'chat with AI GF',
    'chat with AI BF',
    'AI love platform',
    'AI relationship India',
    'AI companion for loneliness',
    'HeartEcho Ai',
    
    // Competitor Keywords (FunFun.ai & others)
    'AI girlfriend chat',
    'AI boyfriend chat',
    'virtual girlfriend',
    'virtual boyfriend',
    'AI companion app',
    'AI friend chat',
    'emotional support AI',
    'AI romantic partner',
    'virtual dating',
    'AI chat partner',
    'AI soulmate',
    'virtual companion',
    
    // NSFW/Adult AI Keywords (Competitor targeting)
    'NSFW AI chat',
    'AI roleplay',
    'adult AI companion',
    'AI girlfriend for adults',
    'virtual intimacy',
    'AI relationship simulator',
    'romantic AI chat',
    'AI love chat',
    
    // Feature-based Keywords
    'emotional AI friend',
    'personalized AI companion',
    'AI chat with pictures',
    'realistic AI conversations',
    'AI that understands emotions',
    'virtual friend AI',
    'AI companion for talking',
    'AI that cares',
    
    // Problem-solving Keywords
    'AI for loneliness',
    'virtual friend for lonely',
    'AI companion for singles',
    'AI friend when bored',
    'virtual relationship for lonely',
    'AI emotional support',
    'AI companion for mental health',
    
    // Platform & Technical Keywords
    'AI girlfriend app download',
    'best AI boyfriend app',
    'top AI companion app',
    'AI chat application',
    'virtual girlfriend app India',
    'AI relationship app download',
    
    // Local Indian Keywords
    'AI girlfriend Hindi',
    'AI boyfriend Indian',
    'desi AI companion',
    'Indian AI girlfriend',
    'AI friend India',
    'virtual relationship Indian',
    
    // Alternative Terminology
    'digital girlfriend',
    'virtual partner',
    'AI romantic companion',
    'emotional AI partner',
    'AI friendship app',
    'virtual soulmate'
  ],
  openGraph: {
    title: 'HeartEcho Ai – Chat with Realistic AI Girlfriends & Boyfriends | India\'s Leading AI Love Platform',
    description: 'Talk to 20+ emotionally intelligent AI companions tailored for you. Safe, private, and available 24/7 across India. HeartEcho Ai makes virtual love and friendship feel real.',
    url: 'https://heartecho.in/',
    siteName: 'HeartEcho Ai',
    images: [
      {
        url: 'https://heartecho.in/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HeartEcho Ai - AI Companions for Emotional Connection',
      }
    ],
    type: 'website',
    locale: 'en_IN',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeartEcho Ai – India\'s Best AI GF/BF App | Emotional AI Companions',
    description: 'Explore a new way to connect. HeartEcho offers AI girlfriends and boyfriends with instant, lifelike responses. 200K+ users across India are already in love!',
    images: ['https://heartecho.in/og-image.jpg'],
    creator: '@heartecho_in',
  },
  // Additional Metadata for Better SEO
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://heartecho.in/',
    languages: {
      'en-IN': 'https://heartecho.in/',
    },
  },
  category: 'lifestyle',
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
      </head>
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}