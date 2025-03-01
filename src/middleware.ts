import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Vérifier si on a un token dans les cookies (format Supabase)
  const hasSession = req.cookies
    .getAll()
    .some(
      (cookie) =>
        cookie.name.startsWith("sb-") &&
        cookie.name.endsWith("-auth-token") &&
        !cookie.name.endsWith("-auth-token-code-verifier")
    );

  console.log("Cookie check:", {
    hasSession,
    cookies: req.cookies.getAll().map((c) => c.name),
  });

  // Rediriger vers /login si pas de session et on essaie d'accéder au dashboard
  if (!hasSession && req.nextUrl.pathname.startsWith("/dashboard")) {
    const redirectUrl = new URL("/login", req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|public).*)"],
};
