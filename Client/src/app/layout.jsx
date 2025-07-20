// app/layout.js
import './globals.css';
import ClientLayout from './layout_client';

export const metadata = {
  title: 'HeartEcho - Create Your Custom AI Companion',
  description: 'Craft your dream AI girlfriend or boyfriend with personalized traits, appearance, and personality.',
  keywords: ['AI girlfriend', 'AI boyfriend', 'virtual companion', 'AI love', 'custom AI', 'digital partner'],
  openGraph: {
    title: 'HeartEcho - Your Custom AI Companion',
    description: 'Create your perfect AI girlfriend or boyfriend with just a few clicks',
    url: 'https://yourdomain.com',
    siteName: 'HeartEcho',
    images: [
      {
        url: 'https://yourdomain.com/og-image.jpg',
        width: 1200,
        height: 630,
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HeartEcho - Your Custom AI Companion',
    description: 'Create your perfect AI girlfriend or boyfriend with just a few clicks',
    images: ['https://yourdomain.com/og-image.jpg'],
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
