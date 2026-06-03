import ThankYou from '../../pages/ThankYou'

export const metadata = {
  title: 'Thank You',
  description: 'Thank you for your purchase on HeartEcho AI.',
  alternates: {
    canonical: 'https://heartecho.in/thank-you',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <ThankYou/>
}
