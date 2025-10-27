// middleware.ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  runtime: 'nodejs', // ⚠️ CRÍTICO: Forzar Node.js runtime
  matcher: [
    /*
     * Match all request paths except static files and assets
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set(name, value, options);
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set(name, "", options);
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Rutas protegidas
  const protectedPaths = ["/dashboard", "/inventory", "/sales", "/orders", "/settings", "/alerts", "/categories"];
  const authPaths = ["/login"];

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Redireccionamientos
  if (isProtectedPath && !user) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && user) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    const url = new URL(user ? "/dashboard" : "/login", request.url);
    return NextResponse.redirect(url);
  }

  return response;
}