import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl;
    const token = req.nextauth.token;

    // If user is authenticated and tries to access auth pages, redirect to dashboard
    if (token && pathname.startsWith('/auth')) {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    // Role-based route protection
    if (token) {
      const userRole = token.role;

      // Admin can access everything
      if (userRole === 'admin') {
        return NextResponse.next();
      }

      // Define role-based access control (matches sidebar navigation)
      const roleRoutes = {
        doctor: [
          '/dashboard',
          '/patients',
          '/appointments',
          '/medical-records',
          '/diagnoses',
          '/prescriptions',
          '/laboratory',
          '/pharmacy',
          '/admissions',
          '/medical-reports',
        ],
        nurse: [
          '/dashboard',
          '/patients',
          '/appointments',
          '/medical-records',
          '/diagnoses',
          '/prescriptions',
          '/laboratory',
          '/pharmacy',
          '/admissions',
          '/medical-reports',
        ],
        receptionist: [
          '/dashboard',
          '/patients',
          '/doctors',
          '/appointments',
          '/billing',
        ],
      };

      const allowedRoutes = roleRoutes[userRole as keyof typeof roleRoutes] || [];

      // Check if current path is allowed for user role
      const isAllowed = allowedRoutes.some((route) =>
        pathname.startsWith(route) || pathname === '/'
      );

      if (!isAllowed) {
        // Redirect to dashboard if trying to access unauthorized route
        return NextResponse.redirect(new URL('/dashboard', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl;

        // Allow access to auth pages without token
        if (pathname.startsWith('/auth')) {
          return true;
        }

        // Require token for all other protected routes
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};