import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { isStoreStaff } from "@/lib/permissions";
import { randomUUID } from "crypto";

const CART_COOKIE = "duka_cart";

// Lightweight, optimistic route protection. Every admin/account page and
// API route also checks the session itself (requireAdmin/requireUser) -
// this proxy only exists to bounce obviously-unauthenticated visitors
// early and avoid flashing protected UI.
//
// It also guarantees every visitor has a guest-cart cookie before any
// Server Component renders - Next.js only allows setting cookies from a
// Proxy/Route Handler/Server Action, never during a page render, so the
// cart cookie has to be created here rather than lazily in lib/cart.ts.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdminRoute = pathname.startsWith("/admin");
  const isAccountRoute = pathname.startsWith("/account");

  // Forwarded so the root layout can tell admin routes apart from
  // storefront ones (e.g. to skip the storefront footer on /admin) without
  // every route needing its own layout - there's no other way for a
  // Server Component to know the current pathname outside a page's own
  // params/searchParams.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-pathname", pathname);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  if (isAdminRoute || isAccountRoute) {
    const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
    const session = token ? await verifySessionToken(token) : null;

    if (!session) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Staff accounts get past this gate too - which specific sections they
    // can actually use is enforced per-page (see requireAdminPagePermission
    // in lib/auth.ts), since that needs their granted permissions, not just
    // their role.
    if (isAdminRoute && !isStoreStaff(session)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  if (!request.cookies.get(CART_COOKIE)?.value) {
    response.cookies.set(CART_COOKIE, randomUUID(), {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 90,
    });
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|uploads/|.*\\..*).*)"],
};
