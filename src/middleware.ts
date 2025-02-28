import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          // Ne rien faire, car nous ne modifions pas les cookies
        },
        remove(name: string, options: any) {
          // Ne rien faire, car nous ne modifions pas les cookies
        },
      },
    }
  );

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  // Si c'est une route API admin
  if (request.nextUrl.pathname.startsWith("/api/exercises")) {
    const userRole = user.user_metadata?.role;
    if (userRole !== "admin") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }
  }

  const response = NextResponse.next();
  response.headers.set("x-user-role", user.user_metadata?.role || "");
  return response;
}

export const config = {
  matcher: ["/api/exercises/:path*"],
};
