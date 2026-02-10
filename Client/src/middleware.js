import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = 'yourSecretKey';
const encoder = new TextEncoder();

const protectedRoutes = ['/chatbox', '/profile', '/admin', '/subscribe', '/thank-you'];

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const fullUrl = pathname + search; // This includes query parameters
  const token = request.cookies.get('token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token) {
    // Store the FULL URL (with query params) in a cookie before redirecting
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('redirectUrl', fullUrl, {
      maxAge: 60 * 5, // 5 minutes
      path: '/',
      encode: (value) => encodeURIComponent(value), // Encode the URL
    });
    return response;
  }

  try {
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));

    // Check admin access
    if (pathname.startsWith('/admin') && payload.email !== 'omawchar07@gmail.com') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    // Clear invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('token');
    response.cookies.set('redirectUrl', fullUrl, {
      maxAge: 60 * 5,
      path: '/',
      encode: (value) => encodeURIComponent(value),
    });
    return response;
  }
}

export const config = {
  matcher: ['/chatbox/:path*', '/profile/:path*', '/admin/:path*', '/subscribe/:path*', '/thank-you/:path*'],
};