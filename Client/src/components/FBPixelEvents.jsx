'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

export default function FBPixelEvents() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined' && window.fbq) {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr && userStr !== "undefined") {
          const userObj = JSON.parse(userStr);
          if (userObj?.email === 'omawchar07@gmail.com') return; // Do not track admin
        }
      } catch (e) {}

      // Only track PageView on the 3 payments/checkout related pathnames
      const paymentPaths = ['/subscribe', '/thank-you'];
      if (paymentPaths.includes(pathname)) {
        window.fbq('track', 'PageView');
      }
    }
  }, [pathname, searchParams]);

  return null;
}
