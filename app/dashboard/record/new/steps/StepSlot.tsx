'use client'

import { useEffect, useMemo, useState } from 'react'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Service, Slot } from '@/app/dashboard/record/new/types'
import type { StepProps } from '../StepProps'

type Props = StepProps

/** суммируем минуты выбранных услуг */
const totalDuration = (services: Service[]) =>
  services.reduce((acc, s) => acc + s.durationMinutes, 0)

export default function StepSlot({ context, onNextAction }: Props) {
  const durationMinutes = totalDuration(context.services ?? [])
  const [date, setDate] = useState<string>(() => format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<Slot[]>([])
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<Slot | null>(null)

  /** запрашиваем доступные слоты от бэка */
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/slots?date=${date}&duration=${durationMinutes}`)
      if (res.ok) {
        const data: Slot[] = await res.json()
        setSlots(data)
        setError(null)
      } else {
        setError(await res.text())
      }
    }
    if (durationMinutes) load()
  }, [date, durationMinutes])

  /** при выборе */
  const choose = (slot: Slot) => setSelected(slot)
  const next = () => selected && onNextAction({ slot: selected })

  const slotsByMechanic = useMemo(() => {
    const map = new Map<string, { name: string; slots: Slot[] }>()
    for (const s of slots) {
      if (!map.has(s.mechanicId)) {
        map.set(s.mechanicId, { name: s.mechanicName, slots: [] })
      }
      map.get(s.mechanicId)!.slots.push(s)
    }
    return Array.from(map.entries()).map(([id, value]) => ({
      id,
      name: value.name,
      slots: value.slots,
    }))
  }, [slots])

  /* человекочитаемый заголовок */
  const headerDate = useMemo(() => {
    const d = new Date(date)
    return format(d, 'd MMMM yyyy (EEEE)', { locale: ru })
  }, [date])

  return (
    <Card className="w-full max-w-xl p-6 space-y-4">
      <h2 className="text-xl font-bold">Шаг 4 — Время приёма</h2>

      <div className="flex items-center gap-2">
        <span>Дата:</span>
        <Input
          type="date"
          value={date}
          onChange={(e) => {
            setSelected(null)
            setDate(e.target.value)
          }}
          className="w-40"
        />
      </div>

      <p className="text-muted-foreground">{headerDate}</p>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {slots.length === 0 && (
        <p className="text-sm text-muted-foreground">Нет свободных слотов</p>
      )}

      <div className="space-y-4">
        {slotsByMechanic.map((m) => (
          <div key={m.id} className="space-y-2">
            <div className="flex items-center gap-2 font-medium">
              <span>🧑‍🔧</span>
              <span>{m.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {m.slots.map((slot) => {
                const start = new Date(slot.start)
                return (
                  <Button
                    key={`${slot.mechanicId}-${slot.start}`}
                    variant={
                      selected?.start === slot.start &&
                      selected?.mechanicId === slot.mechanicId
                        ? 'default'
                        : 'outline'
                    }
                    onClick={() => choose(slot)}
                  >
                    {format(start, 'HH:mm')}
                  </Button>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      <Button onClick={next} disabled={!selected}>
        Продолжить →
      </Button>
    </Card>
  )
}
