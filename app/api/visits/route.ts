import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Visit } from '@/models/Visit'

export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbConnect()
  const visit = await Visit.create(data)
  return NextResponse.json(visit, { status: 201 })
}
