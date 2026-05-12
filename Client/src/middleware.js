import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = 'yourSecretKey';
const encoder = new TextEncoder();

const protectedRoutes = ['/chatbox', '/profile', '/admin', '/subscribe', '/thank-you'];

export async function middleware(request) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') || '';

  // ── 1. www → non-www permanent redirect (fixes duplicate content + hreflang) ──
  if (host.startsWith('www.')) {
    const nonWwwUrl = new URL(request.url);
    nonWwwUrl.host = host.replace(/^www\./, '');
    return NextResponse.redirect(nonWwwUrl.toString(), {
      status: 301,
      headers: { 'Cache-Control': 'public, max-age=31536000' },
    });
  }

  // ── 2. Auth protection for private routes ────────────────────────────────────
  const fullUrl = pathname + search;
  const token = request.cookies.get('token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token) {
    if (pathname.startsWith('/chatbox')) {
      return NextResponse.next();
    }
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.set('redirectUrl', fullUrl, {
      maxAge: 60 * 5,
      path: '/',
      encode: (value) => encodeURIComponent(value),
    });
    return response;
  }

  try {
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));

    if (pathname.startsWith('/admin') && payload.email !== 'omawchar07@gmail.com') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
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
  // Run on ALL routes so the www redirect fires everywhere
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp3|mp4)).*)',
  ],
};