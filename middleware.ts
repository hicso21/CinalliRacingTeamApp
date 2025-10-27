import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  
  // Lista de rutas que NO quieres que pasen por el middleware
  const publicRoutes = [
    "/_next",
    "/api",
    "/favicon.ico",
    "/static",
  ];
  
  // Si es una ruta pública, déjala pasar
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }
  
  console.log("✅ Middleware procesando:", pathname);
  
  return NextResponse.next();
}

// SIN config.matcher - se ejecuta en TODAS las rutas