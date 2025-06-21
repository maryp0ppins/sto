import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export const runtime = 'nodejs' // ✅ отключаем Edge Runtime

export function middleware(req: NextRequest) {
  const token = req.cookies.get('token')?.value
  const securePath = ['/dashboard', '/clients', '/kanban', '/services']

  const isProtected = securePath.some(p => req.nextUrl.pathname.startsWith(p))
  if (!isProtected) return NextResponse.next()

  if (!token) {
    return NextResponse.redirect(new URL('/login', req.url))
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET!)
    return NextResponse.next()
  } catch (err) {
    console.error('JWT-error →', err)
    return NextResponse.redirect(new URL('/login', req.url))
  }
}

export const config = {
  matcher: ['/dashboard/:path*', '/clients/:path*', '/kanban/:path*', '/services/:path*'],
  runtime: 'nodejs',
}
