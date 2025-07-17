import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET)

export async function middleware(request) {
  const { pathname } = request.nextUrl

  const protectedRoutes = ['/dashboard', '/form-submission']
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))

  const userCookieValue = request.cookies.get('user')?.value

  // إذا لم يوجد الكوكي
  if (!userCookieValue) {
    // إذا كان يزور مسار محمي → إعادة التوجيه إلى /login
    if (isProtectedRoute) {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    // إذا كان يزور الصفحة الرئيسية `/` → إعادة التوجيه إلى /login
    if (pathname === '/') {
      return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
  }

  try {
    const user = JSON.parse(userCookieValue)

    if (!user.accessToken) {
      if (isProtectedRoute || pathname === '/') {
        return NextResponse.redirect(new URL('/login', request.url))
      }
      return NextResponse.next()
    }

    const { payload: decoded } = await jwtVerify(user.accessToken, JWT_SECRET)

    // تحويل من الصفحة الرئيسية `/` إلى الصفحة المناسبة حسب الدور
    if (pathname === '/') {
      if (decoded.role === 'admin') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } else if (decoded.role === 'user') {
        return NextResponse.redirect(new URL('/form-submission', request.url))
      } else {
        return NextResponse.redirect(new URL('/login', request.url)) // دور غير معروف
      }
    }

    // حماية المسارات بناءً على الدور
    if (pathname.startsWith('/dashboard') && decoded.role !== 'admin') {
      return NextResponse.redirect(new URL('/form-submission', request.url))
    }

    if (pathname.startsWith('/form-submission') && decoded.role !== 'user') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

  } catch (error) {
    console.error('❌ خطأ في JWT:', error.message)
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}
