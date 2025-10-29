import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { verifyToken } from "@/lib/auth"
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const publicRoutes = ["/login"]

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Handle internationalization first
  const intlResponse = intlMiddleware(request);
  
  // Extract locale from pathname
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Get the pathname without locale prefix for auth checks
  const pathnameWithoutLocale = pathnameHasLocale 
    ? pathname.substring(3) // Remove "/xx" prefix
    : pathname;

  // Check for auth token
  const token = request.cookies.get("auth-token")?.value;

  // If accessing login page and already authenticated, redirect to dashboard
  if (publicRoutes.includes(pathnameWithoutLocale) && token) {
    try {
      const payload = await verifyToken(token);
      if (payload) {
        // User is authenticated, redirect to dashboard
        const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;
        return NextResponse.redirect(new URL(`/${locale}`, request.url));
      }
    } catch (error) {
      // Token is invalid, allow access to login page
      // Clear the invalid token
      const response = intlResponse;
      response.cookies.delete("auth-token");
      return response;
    }
  }

  // Allow public routes for non-authenticated users
  if (publicRoutes.includes(pathnameWithoutLocale)) {
    return intlResponse;
  }

  // For protected routes, check authentication
  if (!token) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  // Verify token for protected routes
  try {
    const payload = await verifyToken(token);
    if (!payload) {
      const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;
      const response = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
      response.cookies.delete("auth-token");
      return response;
    }
    
    return intlResponse;
  } catch (error) {
    const locale = pathnameHasLocale ? pathname.split('/')[1] : routing.defaultLocale;
    const response = NextResponse.redirect(new URL(`/${locale}/login`, request.url));
    response.cookies.delete("auth-token");
    return response;
  }
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
