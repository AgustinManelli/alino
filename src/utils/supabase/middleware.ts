import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const PUBLIC_PATHS = [
  "/sign-in",
  "/api/auth/callback",
  "/api/push/trigger",
  "/api/webhooks",
  "/api/cron/process-phases",
];

export async function updateSession(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((p) => pathname.startsWith(p));
  const isApiPath = pathname.startsWith("/api");

  if (isApiPath) {
    return NextResponse.next({ request: { headers: request.headers } });
  }

  let supabaseResponse = NextResponse.next({
    request: { headers: request.headers },
  });

  const refParam = request.nextUrl.searchParams.get("ref");
  if (refParam) {
    supabaseResponse.cookies.set(
      "alino_referral_code",
      refParam.trim().toUpperCase().replace(/^@/, ""),
      {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
        sameSite: "lax",
      },
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const redirectWithCookies = (url: URL) => {
    const redirectResponse = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });
    return redirectResponse;
  };

  if (pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = user ? "/alino-app" : "/sign-in";
    return redirectWithCookies(url);
  }

  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone();
    url.pathname = "/sign-in";
    return redirectWithCookies(url);
  }

  if (user && pathname.startsWith("/sign-in")) {
    const url = request.nextUrl.clone();
    url.pathname = "/alino-app";
    return redirectWithCookies(url);
  }

  return supabaseResponse;
}
