import { NextRequest, NextResponse } from 'next/server';

const KNOWN_HOSTS = ['checkapi.io', 'www.checkapi.io', 'localhost'];

export async function middleware(request: NextRequest) {
  const host = request.headers.get('host') || '';
  const hostname = host.split(':')[0];

  // Pass through if it's our own domain or localhost/vercel preview
  if (
    KNOWN_HOSTS.includes(hostname) ||
    hostname.endsWith('.vercel.app') ||
    hostname.endsWith('.railway.app')
  ) {
    return NextResponse.next();
  }

  // Custom domain — resolve to monitor ID
  const apiBase =
    process.env.NEXT_PUBLIC_API_URL ||
    'https://api-health-monitor-production.up.railway.app';

  try {
    const res = await fetch(
      `${apiBase}/api/v1/public/by-domain?domain=${encodeURIComponent(hostname)}`,
      { next: { revalidate: 60 } }
    );

    if (!res.ok) {
      return NextResponse.rewrite(new URL('/not-found', request.url));
    }

    const { monitor_id } = await res.json();
    return NextResponse.rewrite(new URL(`/status/${monitor_id}`, request.url));
  } catch {
    return NextResponse.rewrite(new URL('/not-found', request.url));
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
