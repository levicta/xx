import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const { pathname } = req.nextUrl
  const isLoggedIn = !!req.auth
  const isSellerRoute = pathname.startsWith("/sell")
  const isOrderRoute = pathname.startsWith("/orders")
  const isAdminRoute = pathname.startsWith("/admin")
  const isApiAuth = pathname.startsWith("/api/auth")

  if (isApiAuth) {
    return NextResponse.next()
  }

  if (isSellerRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (isOrderRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (isAdminRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL("/auth/login", req.url))
  }

  if (isAdminRoute && req.auth?.user?.role !== "ADMIN") {
    return NextResponse.redirect(new URL("/", req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    "/sell/:path*",
    "/orders/:path*",
    "/admin/:path*",
    "/api/orders/:path*",
    "/api/payouts/:path*",
  ],
}
