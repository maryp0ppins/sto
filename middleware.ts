// middleware.ts - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const securePath = ['/dashboard', '/clients', '/kanban', '/services']

  const isProtected = securePath.some(p => req.nextUrl.pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    // Простая проверка токена без jsonwebtoken
    // JWT токен имеет 3 части разделенные точками
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }
    
    // Базовая проверка что токен не пустой
    if (!parts[0] || !parts[1] || !parts[2]) {
      throw new Error('Invalid token')
    }
    
    return NextResponse.next()
  } catch (err) {
    console.error('JWT-error →', err)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/clients/:path*', '/kanban/:path*', '/services/:path*']
}