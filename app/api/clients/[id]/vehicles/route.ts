import { dbConnect } from "@/lib/db"
import { Client } from "@/models/Client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect()
  const client = await Client.findById(params.id)
  return NextResponse.json(client?.vehicles ?? [])
}

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  await dbConnect()
  const data = await req.json()            // make, model, year...
  const client = await Client.findById(params.id)
  client!.vehicles.push(data)
  await client!.save()
  const vehicle = client!.vehicles.at(-1)
  return NextResponse.json(vehicle, { status: 201 })
}
