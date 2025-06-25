import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Visit } from '@/models/Visit'
import '@/models/Client'
import '@/models/User'
import '@/models/Service'


export async function POST(req: NextRequest) {
  const data = await req.json()
  await dbConnect()
  const visit = await Visit.create(data)
  return NextResponse.json(visit, { status: 201 })
}

export async function GET(req: NextRequest) {
  try {
    await dbConnect()

    const mechanicId = req.nextUrl.searchParams.get('mechanicId') || undefined
    const status     = req.nextUrl.searchParams.get('status')     || undefined

    const filter: Record<string, unknown> = {}
    if (mechanicId) filter.mechanicId = mechanicId
    if (status)     filter.status     = status

    const visits = await Visit.find(filter)
      .populate('clientId', 'name phone')
      .populate('mechanicId', 'name email')
      .populate('serviceIds')

    return NextResponse.json(visits)
  } catch (err) {
    console.error('GET /api/visits error:', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  const { id, ...data } = await req.json()
  await dbConnect()
  const visit = await Visit.findByIdAndUpdate(id, data, { new: true })
  if (!visit) return new NextResponse('Not found', { status: 404 })
  return NextResponse.json(visit)
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return new NextResponse('Missing id', { status: 400 })
  await dbConnect()
  await Visit.findByIdAndDelete(id)
  return new NextResponse(null, { status: 204 })
}
