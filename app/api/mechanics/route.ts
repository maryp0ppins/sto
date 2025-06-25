import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { User } from '@/models/User'

export async function GET() {
  await dbConnect()
  const mechanics = await User.find({ role: 'mechanic' }, 'name email')
  return NextResponse.json(mechanics)
}
