import { dbConnect } from "@/lib/db"
import { Client } from "@/models/Client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  await dbConnect()
  const phone = req.nextUrl.searchParams.get("phone")

  if (phone) {
    const client = await Client.findOne({ phone })
    return NextResponse.json(client) // null → клиент не найден
  }

  // ✅ возвращаем всех клиентов, если не указан phone
  const clients = await Client.find()
  return NextResponse.json(clients)
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const body = await req.json()
  const client = await Client.create(body)
  return NextResponse.json(client, { status: 201 })
}

export async function PUT(req: NextRequest) {
  await dbConnect()
  const { _id, ...rest } = await req.json()
  const updated = await Client.findByIdAndUpdate(_id, rest, { new: true })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest) {
  await dbConnect()
  const id = req.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  await Client.findByIdAndDelete(id)
  return NextResponse.json({ success: true })
}
