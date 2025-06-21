import { dbConnect } from "@/lib/db"
import { Client } from "@/models/Client"
import { NextRequest, NextResponse } from "next/server"

export async function GET(req: NextRequest) {
  await dbConnect()
  const phone = req.nextUrl.searchParams.get("phone")
  if (!phone) return new NextResponse("Bad request", { status: 400 })

  const client = await Client.findOne({ phone })
  return NextResponse.json(client)          // null → клиент не найден
}

export async function POST(req: NextRequest) {
  await dbConnect()
  const body = await req.json()             // {name, phone, email}
  const client = await Client.create(body)
  return NextResponse.json(client, { status: 201 })
}
