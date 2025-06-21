import { Service } from "@/models/Service"
import { dbConnect } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET() {
  await dbConnect()
  const list = await Service.find()
  return NextResponse.json(list)
}
