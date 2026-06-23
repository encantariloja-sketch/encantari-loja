import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Proteção admin
  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const adminKey = request.cookies.get('admin-key')?.value
    const validKey = process.env.ADMIN_PASSWORD
    // Se ADMIN_PASSWORD não estiver configurado, bloqueia tudo
    if (!validKey || adminKey !== validKey) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }
  }

  const response = NextResponse.next()

  // Headers de segurança HTTP
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains; preload'
  )
  // CSP: permite next.js, supabase, mercado pago e fontes do google
  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.mercadopago.com.br https://secure.mlstatic.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https://*.supabase.co https://secure.mlstatic.com https://http2.mlstatic.com",
      "connect-src 'self' https://*.supabase.co https://api.mercadopago.com https://viacep.com.br https://www.melhorenvio.com.br",
      "frame-src https://www.mercadopago.com.br https://www.mercadopago.com",
      "object-src 'none'",
      "base-uri 'self'",
    ].join('; ')
  )

  return response
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/((?!_next/static|_next/image|favicon.ico|logo|images|icons).*)',
  ],
}
