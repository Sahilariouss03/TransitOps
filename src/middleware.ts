import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import { canAccessRoute } from "@/lib/rbac"

export const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login');

  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL('/dashboard', req.nextUrl));
    }
    return;
  }

  if (!isLoggedIn) {
    let from = req.nextUrl.pathname;
    if (req.nextUrl.search) {
      from += req.nextUrl.search;
    }

    return Response.redirect(
      new URL(`/login?from=${encodeURIComponent(from)}`, req.nextUrl)
    );
  }

  const role = (req.auth?.user as { role?: string } | undefined)?.role;
  if (!canAccessRoute(role, req.nextUrl.pathname)) {
    return Response.redirect(new URL("/dashboard?denied=1", req.nextUrl));
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
