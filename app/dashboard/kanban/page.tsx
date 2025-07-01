// app/dashboard/kanban/page.tsx - ИСПРАВЛЕННЫЙ ИМПОРТ
'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
// ИСПРАВЛЕННЫЙ ИМПОРТ - используем default export
import ModernKanban from '@/components/kanban'
// Или если у вас другой компонент:
// import { ModernKanban } from '@/components/modern-kanban'

import { Visit } from '@/app/dashboard/record/new/types'
import type { VisitStatus } from '@/app/dashboard/record/new/types'
import { addDays, startOfDay, endOfDay } from 'date-fns'
import { useMemo } from 'react'

const statusMap: Record<VisitStatus, 'scheduled' | 'in-progress' | 'done' | 'delivered'> = {
  scheduled: 'scheduled',
  'in-progress': 'in-progress',
  done: 'done',
  delivered: 'delivered',
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
  column: 'scheduled' | 'in-progress' | 'done' | 'delivered'
}

export default function KanbanPage() {
  const { user } = useAuth()
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
        .catch(console.error)
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
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, selected, dayOffset, selectedDate])

  const updateVisit = async (v: Visit, patch: Partial<Visit>) => {
    try {
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
    } catch (error) {
      console.error('Error updating visit:', error)
    }
  }

  const removeVisit = async (id: string) => {
    try {
      await fetch(`/api/visits?id=${id}`, { method: 'DELETE' })
      setVisits((prev) => prev.filter((v) => v._id !== id))
    } catch (error) {
      console.error('Error removing visit:', error)
    }
  }

  if (!user) return <div>Загрузка...</div>

  if (user.role === 'admin' && !selected) {
    return (
      <div className="p-4 space-y-4">
        <h1 className="text-2xl font-bold">Канбан-доска</h1>
        <p className="text-muted-foreground">Сначала выберите механика:</p>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border p-2 rounded"
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
    const vehicle = v.clientId?.vehicles?.[0]
    const services = v.serviceIds?.map(s => s.title).join(', ') || ''
    return {
      id: v._id,
      title: v.clientId?.name || 'Неизвестный клиент',
      phone: v.clientId?.phone,
      vehicle: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : '',
      services,
      slotStart: v.slotStart,
      slotEnd: v.slotEnd,
      column: statusMap[v.status] || 'scheduled',
    }
  })

  const handleCardsChange = (cards: KanbanCard[]) => {
    cards.forEach((c) => {
      const original = visits.find((v) => v._id === c.id)
      if (!original) return

      const newStatus = c.column as VisitStatus
      const changedStatus = newStatus !== original.status

      if (changedStatus) {
        updateVisit(original, { status: newStatus })
      }
    })
  }

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setDayOffset((o) => o - 1)} 
          className="border px-2 py-1 rounded hover:bg-gray-100"
        >
          ←
        </button>

        <span className="font-medium">
          {selectedDate.toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
          })}
        </span>

        <button 
          onClick={() => setDayOffset((o) => o + 1)} 
          className="border px-2 py-1 rounded hover:bg-gray-100"
        >
          →
        </button>
      </div>

      {user.role === 'admin' && (
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border p-2 rounded"
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
        <ModernKanban
          cards={kanbanCards}
          onCardsChange={handleCardsChange}
          onDelete={(id) => removeVisit(id)}
        />
      )}
    </div>
  )
}