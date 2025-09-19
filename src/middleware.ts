import { withAuth } from "next-auth/middleware"

export default withAuth(
  function middleware(req) {
    // Additional middleware logic can be added here
    console.log("Middleware executing for:", req.nextUrl.pathname)
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Check if user is authenticated for protected routes
        const { pathname } = req.nextUrl

        // Allow access to auth pages without authentication
        if (pathname.startsWith('/auth/')) {
          return true
        }

        // Require authentication for all other protected routes
        return !!token
      },
    },
  }
)

export const config = {
  matcher: [
    // Protect all routes except static files and public auth routes
    '/((?!api/auth|_next/static|_next/image|favicon.ico|auth).*)',
  ]
}