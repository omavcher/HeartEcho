'use client';

import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function RedirectHandler() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    const from = searchParams.get('from');
    if (from && typeof window !== 'undefined') {
      try {
        const decodedUrl = decodeURIComponent(from);
        localStorage.setItem('redirectAfterLogin', decodedUrl);
      } catch (error) {
        console.error('Error decoding redirect URL:', error);
      }
    }
  }, [searchParams]);
  
  return null; // This component doesn't render anything
}