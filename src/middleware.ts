import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  // Only run middleware for dynamic routes that need authentication
  const { pathname } = request.nextUrl
  
  // Skip middleware for static assets and API routes
  if (pathname.startsWith('/_next') || 
      pathname.startsWith('/api') || 
      pathname.includes('.')) {
    return
  }

  // For now, just pass through - add authentication logic here when needed
  return
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
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 