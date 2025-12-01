import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Rotas que NÃO precisam de autenticação
const publicRoutes = ['/', '/register', '/login', '/api/auth/register', '/api/auth/login']

// Rotas que EXIGEM autenticação
const protectedRoutes = ['/dashboard']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Verificar se é rota protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.includes(pathname)
  
  // Se for rota protegida, verificar se tem cookie de autenticação
  if (isProtectedRoute) {
    const token = request.cookies.get('auth_token')?.value
    
    if (!token) {
      // Redirecionar para login se não tiver token
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
    
    // Token existe, permitir acesso (validação real será feita nas APIs)
    return NextResponse.next()
  }
  
  // Se for rota pública de login/register com usuário logado, redirecionar para dashboard
  if ((pathname === '/login' || pathname === '/register') && request.cookies.get('auth_token')?.value) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api (API routes - já têm sua própria proteção)
     */
    '/((?!_next/static|_next/image|favicon.ico|api).*)',
  ],
}
