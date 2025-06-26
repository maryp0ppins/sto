'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Kanban } from '@/components/kanban'
import { Visit } from '@/app/dashboard/record/new/types'
import type { VisitStatus } from '@/app/dashboard/record/new/types'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { useMemo } from 'react'


const statusMap: Record<VisitStatus, 'backlog' | 'todo' | 'doing' | 'done'> = {
  scheduled: 'backlog',
  'in-progress': 'doing',
  done: 'done',
  delivered: 'todo',
}

const reverseStatusMap: Record<'backlog' | 'todo' | 'doing' | 'done', VisitStatus> = {
  backlog: 'scheduled',
  todo: 'delivered',
  doing: 'in-progress',
  done: 'done',
}

type Mechanic = {
  _id: string
  name: string
  email: string
}

type KanbanCard = {
  id: string
  title: string
  phone?: string
  vehicle?: string
  slotStart?: string
  slotEnd?: string
  services?: string
  column: 'backlog' | 'todo' | 'doing' | 'done'
}

export default function KanbanPage() {
  const user = useAuth()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [selected, setSelected] = useState('')
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)

  const [dayOffset, setDayOffset] = useState(0)
 const selectedDate = useMemo(() => {
  return addDays(new Date(), dayOffset)
}, [dayOffset])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/mechanics')
        .then((r) => r.json())
        .then(setMechanics)
    }
  }, [user])

  useEffect(() => {
    const mechId = user?.role === 'admin' ? selected : user?.id
    if (!mechId) return

    const from = startOfDay(selectedDate).toISOString()
    const to = endOfDay(selectedDate).toISOString()

     setLoading(true)
  fetch(`/api/visits?mechanicId=${mechId}&from=${from}&to=${to}`)
    .then(async (r) => (r.ok ? r.json() : []))
    .then(setVisits)
    .finally(() => setLoading(false))
// eslint-disable-next-line react-hooks/exhaustive-deps
}, [user, selected, dayOffset])


  const updateVisit = async (v: Visit, patch: Partial<Visit>) => {
    await fetch('/api/visits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: v._id, ...patch }),
    })

    const mechId = user?.role === 'admin' ? selected : user?.id
    if (!mechId) return

    const from = startOfDay(selectedDate).toISOString()
    const to = endOfDay(selectedDate).toISOString()

    const r = await fetch(`/api/visits?mechanicId=${mechId}&from=${from}&to=${to}`)
    setVisits(await r.json())
  }

  const removeVisit = async (id: string) => {
    await fetch(`/api/visits?id=${id}`, { method: 'DELETE' })
    setVisits((prev) => prev.filter((v) => v._id !== id))
  }

  if (!user) return null

  if (user.role === 'admin' && !selected) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Канбан-доска</h1>
        <p className="text-muted">Сначала выберите механика:</p>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border p-2"
        >
          <option value="">Выберите механика</option>
          {mechanics.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name || m.email}
            </option>
          ))}
        </select>
      </div>
    )
  }

  const kanbanCards: KanbanCard[] = visits.map((v) => {
    const vehicle = v.clientId.vehicles?.[0]
    const services = v.serviceIds?.map(s => s.title).join(', ') || ''
    return {
      id: v._id,
      title: v.clientId.name,
      phone: v.clientId.phone,
      vehicle: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : '',
      services,
      slotStart: v.slotStart,
      slotEnd: v.slotEnd,
      column: statusMap[v.status] || 'backlog',
    }
  })

  const handleCardsChange = (cards: KanbanCard[]) => {
    cards.forEach((c) => {
      const original = visits.find((v) => v._id === c.id)
      if (!original) return

      const newStatus = reverseStatusMap[c.column]
      const changedStatus = newStatus !== original.status
      const changedStart = c.slotStart && c.slotStart !== original.slotStart
      const changedEnd = c.slotEnd && c.slotEnd !== original.slotEnd

      if (changedStatus || changedStart || changedEnd) {
        updateVisit(original, {
          status: newStatus,
          slotStart: changedStart ? c.slotStart : undefined,
          slotEnd: changedEnd ? c.slotEnd : undefined,
        })
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button onClick={() => setDayOffset((o) => o - 1)} className="border px-2 rounded">
          ←
        </button>

        <span className="font-medium">
          {selectedDate.toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
          })}
        </span>

        <button onClick={() => setDayOffset((o) => o + 1)} className="border px-2 rounded">
          →
        </button>
      </div>

      {user.role === 'admin' && (
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border p-2"
        >
          <option value="">Выберите механика</option>
          {mechanics.map((m) => (
            <option key={m._id} value={m._id}>
              {m.name || m.email}
            </option>
          ))}
        </select>
      )}

      {loading ? (
        <p>Загрузка данных...</p>
      ) : (
        <Kanban
          cards={kanbanCards}
          onCardsChange={handleCardsChange}
          onDelete={(id) => removeVisit(id)}
        />
      )}
    </div>
  )
}
