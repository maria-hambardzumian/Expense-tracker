import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const AUTH_PAGES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const isLoggedIn = request.cookies.has('isLoggedIn');
  const { pathname } = request.nextUrl;

  if (!isLoggedIn && pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isLoggedIn && AUTH_PAGES.includes(pathname)) {
    return NextResponse.redirect(new URL('/dashboard/expenses', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register'],
};
