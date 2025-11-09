import { Suspense } from 'react';
import Signup from '../../pages/Signup.jsx';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Signup />
    </Suspense>
  );
}