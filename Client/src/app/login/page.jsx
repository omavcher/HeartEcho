import { Suspense } from 'react';
import Login from '../../pages/Login.jsx';
import RedirectHandler from './RedirectHandler';

export const metadata = {
  title: 'Login',
  description: 'Sign in to HeartEcho AI — India\'s #1 AI girlfriend platform. Chat with desi AI companions in Hindi.',
  alternates: {
    canonical: 'https://heartecho.in/login',
  },
  robots: {
    index: false,   // Login pages should not be indexed
    follow: false,
  },
};

export default function Page() {
  return (
    <>
      <Suspense fallback={null}>
        <RedirectHandler />
      </Suspense>
      <Login />
    </>
  );
}