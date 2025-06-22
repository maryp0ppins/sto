import { NextRequest, NextResponse } from 'next/server'
import { dbConnect } from '@/lib/db'
import { User } from '@/models/User'
import { Visit } from '@/models/Visit'
import { addMinutes } from 'date-fns'

export async function GET(req: NextRequest) {
  const dateStr = req.nextUrl.searchParams.get('date')
  const duration = parseInt(req.nextUrl.searchParams.get('duration') || '0')
  if (!dateStr || !duration) {
    return new NextResponse('Bad request', { status: 400 })
  }

  await dbConnect()
  const mechanics = await User.find({ role: 'mechanic' })
  const dayStart = new Date(`${dateStr}T00:00:00`)
  const dayEnd = new Date(`${dateStr}T23:59:59`)
  const visits = await Visit.find({
    slotStart: { $gte: dayStart, $lte: dayEnd }
  })

  const slots: Array<{
    start: string
    end: string
    mechanicId: string
    mechanicName: string
  }> = []

  const openHour = 9
  const closeHour = 18
  for (const m of mechanics) {
    for (let hour = openHour; hour <= closeHour - Math.ceil(duration / 60); hour++) {
      const startDate = new Date(`${dateStr}T${hour.toString().padStart(2,'0')}:00:00`)
      const endDate = addMinutes(startDate, duration)
      const overlap = visits.some(v => String(v.mechanicId) === String(m._id) &&
        !(endDate <= v.slotStart || startDate >= v.slotEnd))
      if (!overlap && endDate.getHours() <= closeHour) {
        slots.push({
          start: startDate.toISOString(),
          end: endDate.toISOString(),
          mechanicId: m._id.toString(),
          mechanicName: m.email
        })
      }
    }
  }

  return NextResponse.json(slots)
}
