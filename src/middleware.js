import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const protectedRoutes = ['/dashboard', '/form-submission'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  const userCookieValue = request.cookies.get('user')?.value;

  if (!userCookieValue) {
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
  }

  try {
    const user = JSON.parse(userCookieValue);

    if (!user.accessToken) {
      if (isProtectedRoute || pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url));
      }
      return NextResponse.next();
    }

    const { payload: decoded } = await jwtVerify(user.accessToken, JWT_SECRET);

    if (pathname === '/') {
      if (decoded.role === 'admin' || decoded.role === 'supervisor') {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } else if (decoded.role === 'user') {
        return NextResponse.redirect(new URL('/form-submission', request.url));
      } else {
        return NextResponse.redirect(new URL('/login', request.url)); // دور غير معروف
      }
    }

    // Allow both admin and supervisor to access dashboard
    if (pathname.startsWith('/dashboard') && !['admin', 'supervisor'].includes(decoded.role)) {
      return NextResponse.redirect(new URL('/form-submission', request.url));
    }

    // Only users should access form-submission
    if (pathname.startsWith('/form-submission') && decoded.role !== 'user') {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  } catch (error) {
    console.error('❌ خطأ في JWT:', error.message);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}