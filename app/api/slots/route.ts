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
  const mechanicVisits = visits
    .filter(v => String(v.mechanicId) === String(m._id))
    .sort((a, b) => a.slotStart.getTime() - b.slotStart.getTime())

  const startOfDay = new Date(`${dateStr}T${openHour.toString().padStart(2, '0')}:00:00`)
  const endOfDay = new Date(`${dateStr}T${closeHour.toString().padStart(2, '0')}:00:00`)

  for (let time = new Date(startOfDay); addMinutes(time, duration) <= endOfDay; time = addMinutes(time, 30)) {
    const endTime = addMinutes(time, duration)

    const overlap = mechanicVisits.some(v =>
      !(endTime <= v.slotStart || time >= v.slotEnd)
    )

    if (!overlap) {
      slots.push({
        start: time.toISOString(),
        end: endTime.toISOString(),
        mechanicId: m._id.toString(),
        mechanicName: m.name || m.email
      })
    }
  }
}

  return NextResponse.json(slots)
}
