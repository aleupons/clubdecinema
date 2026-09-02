import { NextResponse } from 'next/server';

export function middleware(req) {
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    if (user === process.env.ADMIN_USER && pwd === process.env.ADMIN_PASS) {
      return NextResponse.next();
    }
  }

  return new NextResponse('Accés denegat', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Panell d\'Administració"' },
  });
}

// Això indica que el middleware només s'apliqui a la ruta /admin i els seus subdirectoris
export const config = {
  matcher: ['/admin/:path*'],
};