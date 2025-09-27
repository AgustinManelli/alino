import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { pathname } = request.nextUrl;
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('Session error:', error);
    }
    
    const user = session?.user;

    const publicPaths = [
      '/sign-in',
      '/auth/callback', 
      '/api/push/trigger'
    ];
    
    const isPublicPath = publicPaths.some(path => pathname.startsWith(path));

    // Redirigir a login si no hay usuario y no está en ruta pública
    if (!user && !isPublicPath) {
      const url = request.nextUrl.clone();
      url.pathname = "/sign-in";
      return NextResponse.redirect(url);
    }

    // Redirigir a la app si está logueado y en página de login
    if (user && pathname.startsWith("/sign-in")) {
      const url = request.nextUrl.clone();
      url.pathname = "/alino-app";
      return NextResponse.redirect(url);
    }
    
  } catch (error) {
    console.error('Middleware error:', error);
  }

  return supabaseResponse;
}
