import { Service } from '@/models/Service'
import { dbConnect } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  await dbConnect()
  const list = await Service.find()
  return NextResponse.json(list)
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const data = await req.json()
  const service = await Service.create(data)
  return NextResponse.json(service, { status: 201 })
}

export async function PUT(req: NextRequest) {
  await dbConnect()
  const { id, ...data } = await req.json()
  const service = await Service.findByIdAndUpdate(id, data, { new: true })
  if (!service) return new NextResponse('Not found', { status: 404 })
  return NextResponse.json(service)
}

export async function DELETE(req: NextRequest) {
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return new NextResponse('Missing id', { status: 400 })
  await dbConnect()
  await Service.findByIdAndDelete(id)
  return new NextResponse(null, { status: 204 })
}
