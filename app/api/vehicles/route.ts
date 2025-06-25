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

export async function DELETE(req: NextRequest) {
  const { clientId, vehicleId } = await req.json()
  if (!clientId || !vehicleId) {
    return new NextResponse('Missing ids', { status: 400 })
  }
  await dbConnect()
  const client = await Client.findById(clientId)
  if (!client) return new NextResponse('Client not found', { status: 404 })
  const vehicle = client.vehicles.id(vehicleId)
  if (!vehicle) return new NextResponse('Vehicle not found', { status: 404 })
  vehicle.deleteOne()
  await client.save()
  return new NextResponse(null, { status: 204 })
}
