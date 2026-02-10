import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = 'yourSecretKey'; 
const encoder = new TextEncoder();

const protectedRoutes = ['/chatbox', '/profile', '/admin' , '/subscribe', '/thank-you'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    const { payload } = await jwtVerify(token, encoder.encode(JWT_SECRET));
console.log(payload);


    // Check admin access
    if (pathname.startsWith('/admin') && payload.email !== 'omawchar07@gmail.com') {
      return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
  } catch (err) {
    console.error('JWT verification failed:', err.message);
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: ['/chatbox/:path*', '/profile/:path*', '/admin/:path*', '/subscribe:path*' , '/thank-you:path*'],
};
