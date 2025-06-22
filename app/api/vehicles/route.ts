import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { Client } from '@/models/Client'

export async function GET(req: NextRequest) {
  const clientId = req.nextUrl.searchParams.get('clientId')
  if (!clientId) return new NextResponse('Missing clientId', { status: 400 })
  await dbConnect()
  const client = await Client.findById(clientId)
  return NextResponse.json(client?.vehicles ?? [])
}

export async function POST(req: NextRequest) {
  const { clientId, ...data } = await req.json()
  if (!clientId) return new NextResponse('Missing clientId', { status: 400 })
  await dbConnect()
  const client = await Client.findById(clientId)
  if (!client) return new NextResponse('Client not found', { status: 404 })
  client.vehicles.push(data)
  await client.save()
  const vehicle = client.vehicles.at(-1)
  return NextResponse.json(vehicle, { status: 201 })
}
