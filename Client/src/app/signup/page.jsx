import { Suspense } from 'react';
import Signup from '../../pages/Signup.jsx';

export const metadata = {
  title: 'Sign Up',
  description: 'Create an account on HeartEcho AI — India\'s #1 AI girlfriend platform.',
  alternates: {
    canonical: 'https://heartecho.in/signup',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signup />
    </Suspense>
  );
}