'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

const statuses = ['scheduled', 'in-progress', 'done', 'delivered'] as const

type Visit = {
  _id: string
  clientId: { name: string; phone: string }
  mechanicId: { _id: string; name: string }
  slotStart: string
  slotEnd: string
  status: typeof statuses[number]
}

type Mechanic = { _id: string; name: string; email: string }

export default function KanbanPage() {
  const user = useAuth()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [selected, setSelected] = useState<string>('')
  const [visits, setVisits] = useState<Visit[]>([])

  // load mechanics for admin
  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/mechanics')
        .then((r) => r.json())
        .then(setMechanics)
    }
  }, [user])

  // load visits whenever selected mechanic changes or user is mechanic
  useEffect(() => {
    const mechId = user?.role === 'admin' ? selected : user?.id
    if (!mechId) return
    fetch(`/api/visits?mechanicId=${mechId}`)
      .then((r) => r.json())
      .then(setVisits)
  }, [user, selected])

  const updateVisit = async (v: Visit, patch: Partial<Visit>) => {
    await fetch('/api/visits', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: v._id, ...patch }),
    })
    const mechId = user?.role === 'admin' ? selected : user?.id
    if (mechId) {
      const r = await fetch(`/api/visits?mechanicId=${mechId}`)
      setVisits(await r.json())
    }
  }

  const remove = async (id: string) => {
    await fetch(`/api/visits?id=${id}`, { method: 'DELETE' })
    setVisits((prev) => prev.filter((v) => v._id !== id))
  }

  const grouped = statuses.map((s) => ({
    status: s,
    items: visits.filter((v) => v.status === s),
  }))

  if (!user) return null

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Канбан-доска</h1>

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

      <div className="grid grid-cols-4 gap-4">
        {grouped.map((col) => (
          <div key={col.status} className="space-y-2">
            <h2 className="font-medium capitalize">{col.status}</h2>
            {col.items.map((v) => (
              <Card key={v._id} className="p-2 space-y-2 text-sm">
                <div>
                  <b>{v.clientId?.name}</b> {v.clientId?.phone}
                </div>
                <div>
                  {new Date(v.slotStart).toLocaleString()} -{' '}
                  {new Date(v.slotEnd).toLocaleTimeString()}
                </div>
                <select
                  value={v.status}
                  onChange={(e) =>
                    updateVisit(v, { status: e.target.value as Visit['status'] })
                  }
                  className="border p-1 w-full"
                >
                  {statuses.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <div className="flex gap-1">
                  <Input
                    type="datetime-local"
                    value={v.slotStart.slice(0, 16)}
                    onChange={(e) =>
                      updateVisit(v, {
                        slotStart: new Date(e.target.value).toISOString(),
                      })
                    }
                    disabled={user.role !== 'admin'}
                    className="text-xs"
                  />
                  <Input
                    type="datetime-local"
                    value={v.slotEnd.slice(0, 16)}
                    onChange={(e) =>
                      updateVisit(v, {
                        slotEnd: new Date(e.target.value).toISOString(),
                      })
                    }
                    className="text-xs"
                  />
                  {user.role === 'admin' && (
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={() => remove(v._id)}
                    >
                      ×
                    </Button>
                  )}
                </div>
              </Card>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
