import './globals.css';
import ClientLayout from './layout_client';

export const metadata = {
  title: {
    default: 'HeartEcho - AI Girlfriends & Boyfriends for Realistic Virtual Companionship',
    template: '%s | HeartEcho',
  },  
  description: 'HeartEcho is India\'s leading AI relationship platform with 20+ unique AI girlfriends and boyfriends. Experience emotionally intelligent chat companions, personalized responses, and secure access across all Indian regions.',
  keywords: [
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
    'HeartEcho app',
    'Next.js AI dating'
  ],
  openGraph: {
    title: 'HeartEcho – Chat with Realistic AI Girlfriends & Boyfriends | India\'s Leading AI Love Platform',
    description: 'Talk to 20+ emotionally intelligent AI companions tailored for you. Safe, private, and available 24/7 across India. HeartEcho makes virtual love and friendship feel real.',
    url: 'https://heartecho.in/',
    siteName: 'HeartEcho',
    images: [
      {
        url: 'https://heartecho.in/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeartEcho – India\'s Best AI GF/BF App | Emotional AI Companions',
    description: 'Explore a new way to connect. HeartEcho offers AI girlfriends and boyfriends with instant, lifelike responses. 200K+ users across India are already in love!',
    images: ['https://heartecho.in/og-image.jpg'],
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  );
}