import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Solo maneja la ruta raíz
  if (pathname === "/") {
    // Verifica si hay cookies de sesión de Supabase
    const authCookies = request.cookies
      .getAll()
      .filter(
        (cookie) =>
          cookie.name.startsWith("sb-") && cookie.name.includes("auth-token")
      );

    const hasAuthCookie = authCookies.length > 0;

    const url = request.nextUrl.clone();
    url.pathname = hasAuthCookie ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
