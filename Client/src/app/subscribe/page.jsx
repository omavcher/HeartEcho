import Subscribe from '../../pages/Subscribe.jsx'

export const metadata = {
  title: 'Subscribe',
  description: 'Unlock unlimited chats, voice notes, and private stories on HeartEcho AI.',
  alternates: {
    canonical: 'https://heartecho.in/subscribe',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function page() {
  return <Subscribe/>
}
