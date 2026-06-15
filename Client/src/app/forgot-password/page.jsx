import { Suspense } from 'react';
import ForgotPassword from '../../pages/ForgotPassword.jsx';

export const metadata = {
  title: 'Reset Password | HeartEcho',
  description: 'Reset your HeartEcho password securely using email OTP verification.',
  robots: {
    index: false,
    follow: false,
  },
};

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotPassword />
    </Suspense>
  );
}
