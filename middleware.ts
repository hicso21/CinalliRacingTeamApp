import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  try {
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

      // Redirige según el estado de autenticación
      if (hasAuthCookie) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    // En caso de error, redirige a login como fallback seguro
    console.error("Middleware error:", error);
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

export const config = {
  matcher: ["/"],
};