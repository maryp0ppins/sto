import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  // Удаляем 'token'
  const cookieStore = cookies()
  cookieStore.delete('token')
  return NextResponse.redirect('/login')
}
