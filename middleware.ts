import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const publicRoutes = ["/login"];

// Create the next-intl middleware
const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Handle internationalization first
  const intlResponse = intlMiddleware(request);

  // Extract locale from pathname
  const pathnameHasLocale = routing.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  );

  // Get the pathname without locale prefix for auth checks
  const pathnameWithoutLocale = pathnameHasLocale
    ? pathname.substring(3) // Remove "/xx" prefix
    : pathname;

  // Check for Firebase session cookie (presence only; cryptographic
  // verification happens inside route handlers via the Admin SDK)
  const sessionCookie = request.cookies.get("auth-token")?.value;

  // If accessing login page while already holding a session cookie, redirect to dashboard
  if (publicRoutes.includes(pathnameWithoutLocale) && sessionCookie) {
    const locale = pathnameHasLocale
      ? pathname.split("/")[1]
      : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Allow public routes without a session
  if (publicRoutes.includes(pathnameWithoutLocale)) {
    return intlResponse;
  }

  // For protected routes, require a session cookie
  if (!sessionCookie) {
    const locale = pathnameHasLocale
      ? pathname.split("/")[1]
      : routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, request.url));
  }

  return intlResponse;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
