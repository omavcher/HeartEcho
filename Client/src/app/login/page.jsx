import { Suspense } from 'react';
import Login from '../../pages/Login.jsx';
import RedirectHandler from './RedirectHandler';

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