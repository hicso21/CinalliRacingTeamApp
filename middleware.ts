import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  console.log("✅ Middleware ejecutándose:", request.nextUrl.pathname);
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login"],
  //                         ^ UN solo asterisco, no dos
};