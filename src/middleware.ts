import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only protect specific seller sub-routes, not /sell itself
  if (pathname.startsWith("/sell/") && !pathname.startsWith("/sell/onboarding")) {
    // Forward the request to the onboarding status API
    const response = await fetch(new URL("/api/seller/onboarding", request.url), {
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
    })

    // If not authorized or not completed onboarding, redirect
    if (response.status === 401) {
      return NextResponse.redirect(new URL("/auth/login", request.url))
    }

    if (response.ok) {
      const data = await response.json()
      if (!data.onboardingCompleted) {
        return NextResponse.redirect(new URL("/sell/onboarding", request.url))
      }
    }
  }

  // Security headers
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("X-Frame-Options", "DENY")
  requestHeaders.set("X-Content-Type-Options", "nosniff")
  requestHeaders.set("Referrer-Policy", "strict-origin-when-cross-origin")
  requestHeaders.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:;"
  )

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: [
    "/sell/:path*",
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
