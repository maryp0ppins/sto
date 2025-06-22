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
    const mVisits = visits
      .filter(v => String(v.mechanicId) === String(m._id))
      .sort((a, b) => a.slotStart.getTime() - b.slotStart.getTime())

    let current = new Date(`${dateStr}T${openHour.toString().padStart(2,'0')}:00:00`)
    const endOfDay = new Date(`${dateStr}T${closeHour.toString().padStart(2,'0')}:00:00`)

    for (const v of mVisits) {
      if (addMinutes(current, duration) <= v.slotStart) {
        slots.push({
          start: current.toISOString(),
          end: addMinutes(current, duration).toISOString(),
          mechanicId: m._id.toString(),
          mechanicName: m.name || m.email,
        })
      }
      if (current < v.slotEnd) {
        current = v.slotEnd
      }
    }

    if (addMinutes(current, duration) <= endOfDay) {
      slots.push({
        start: current.toISOString(),
        end: addMinutes(current, duration).toISOString(),
        mechanicId: m._id.toString(),
        mechanicName: m.name || m.email,
      })
    }
  }

  return NextResponse.json(slots)
}
