// app/api/auth/logout/route.ts
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete('token')

  // redirect требует абсолютный URL → используем request.url
  return NextResponse.redirect(new URL('/login', request.url))
}
