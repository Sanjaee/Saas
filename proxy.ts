import { NextResponse, type NextRequest } from "next/server";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/billing",
  "/settings",
  "/api/keys",
  "/notifications",
  "/help",
  "/team",
];

const AUTH_PREFIXES = ["/login", "/register", "/forgot-password"];

function getSessionCookie(req: NextRequest) {
  const isSecure = req.nextUrl.protocol === "https:";
  const name = isSecure ? "__Secure-zacode.session-token" : "zacode.session-token";
  return req.cookies.get(name);
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = !!getSessionCookie(request);

  if (pathname === "/" || pathname.startsWith("/blog") || pathname.startsWith("/pricing")) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  const isAuthPage = AUTH_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAuthPage && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/auth|api/payments|og|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)"],
};
