import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  console.log(`Middleware - Path: ${pathname}, User: ${user?.email || 'none'}`)

  // Protected routes
  const protectedPaths = ['/dashboard', '/products', '/sales', '/inventory', '/reports']
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // Public auth routes
  const authPaths = ['/login', '/signup', '/forgot-password']
  const isAuthPath = authPaths.some((path) => pathname.startsWith(path))

  // If user is not logged in and trying to access protected route
  if (isProtectedPath && !user) {
    console.log('Redirecting unauthenticated user to login')
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // If user is logged in and trying to access auth pages
  if (isAuthPath && user) {
    console.log('Redirecting authenticated user to dashboard')
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Handle root path
  if (pathname === '/') {
    if (user) {
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    } else {
      url.pathname = '/login'
      return NextResponse.redirect(url)
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object instead of the supabaseResponse object
  //    before returning it, like so:
  //    return myNewResponse
  // Failing to do this may lead to users being randomly logged out.

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
  runtime: 'nodejs'
}