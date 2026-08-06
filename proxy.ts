import { NextResponse, type NextRequest } from "next/server";
import { decode } from "@auth/core/jwt";

import { AUTH_SECRET } from "@/lib/auth-secret";

const PROTECTED_PREFIXES = [
  "/dashboard",
  "/admin",
  "/analytics",
  "/customers",
  "/leads",
  "/projects",
  "/tasks",
  "/calendar",
  "/billing",
  "/orders",
  "/products",
  "/integrations",
  "/api-keys",
  "/settings",
  "/notifications",
  "/help",
  "/team",
];

const AUTH_PREFIXES = ["/login", "/register", "/forgot-password"];

const ADMIN_ONLY_PREFIXES = ["/admin"];

function getSessionCookie(req: NextRequest) {
  const isSecure = req.nextUrl.protocol === "https:";
  const name = isSecure ? "__Secure-zacode.session-token" : "zacode.session-token";
  return req.cookies.get(name);
}

async function getSessionRole(req: NextRequest): Promise<string | null> {
  const cookie = getSessionCookie(req);
  if (!cookie?.value) return null;
  try {
    const payload = await decode({
      token: cookie.value,
      secret: AUTH_SECRET,
      salt: "zacode.session-token",
    });
    return (payload?.role as string) ?? null;
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = getSessionCookie(request);
  const hasSession = !!sessionCookie;

  if (pathname === "/" || pathname.startsWith("/blog") || pathname.startsWith("/pricing")) {
    return NextResponse.next();
  }

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  if (isProtected && !hasSession) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Hard protect the admin area: only "admin" and "owner" roles may pass.
  const isAdminPath = ADMIN_ONLY_PREFIXES.some((p) => pathname.startsWith(p));
  if (isAdminPath && hasSession) {
    const role = await getSessionRole(request);
    if (role !== "admin" && role !== "owner") {
      return NextResponse.redirect(new URL("/403", request.url));
    }
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
