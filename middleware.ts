// middleware.ts
import { NextResponse, type NextRequest } from "next/server";

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  // Verificar autenticación mediante cookies directamente
  const authToken = request.cookies.get('sb-access-token')?.value || 
                    request.cookies.get('sb-auth-token')?.value;

  const pathname = request.nextUrl.pathname;

  // Rutas protegidas
  const protectedPaths = ["/dashboard", "/inventory", "/sales", "/orders", "/settings", "/alerts", "/categories"];
  const authPaths = ["/login"];

  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path));
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path));

  // Redireccionamientos basados en cookie
  if (isProtectedPath && !authToken) {
    const url = new URL("/login", request.url);
    return NextResponse.redirect(url);
  }

  if (isAuthPath && authToken) {
    const url = new URL("/dashboard", request.url);
    return NextResponse.redirect(url);
  }

  if (pathname === "/") {
    const url = new URL(authToken ? "/dashboard" : "/login", request.url);
    return NextResponse.redirect(url);
  }

  return response;
}