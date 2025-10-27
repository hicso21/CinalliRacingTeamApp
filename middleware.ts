import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  // Solo maneja la ruta raíz
  if (request.nextUrl.pathname === "/") {
    // Verifica si hay cookies de sesión
    const hasAuthCookie = request.cookies
      .getAll()
      .some(
        (cookie) =>
          cookie.name.includes("sb-") && cookie.name.includes("auth-token")
      );

    const url = request.nextUrl.clone();
    url.pathname = hasAuthCookie ? "/dashboard" : "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/"],
};
