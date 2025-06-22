'use client'

import { useEffect, useMemo, useState } from 'react'
import { format, addMinutes } from 'date-fns'
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
  const [selected, setSelected] = useState<Slot | null>(null)

  /** запрашиваем доступные слоты от бэка */
  useEffect(() => {
    const load = async () => {
      const res = await fetch(`/api/slots?date=${date}&duration=${durationMinutes}`)
      const data: Slot[] = await res.json()
      setSlots(data)
    }
    if (durationMinutes) load()
  }, [date, durationMinutes])

  /** при выборе */
  const choose = (slot: Slot) => setSelected(slot)
  const next = () => selected && onNextAction({ slot: selected })

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

      {slots.length === 0 && (
        <p className="text-sm text-muted-foreground">Нет свободных слотов</p>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        {slots.map((slot) => {
          const start = new Date(slot.start)
          const end = addMinutes(start, durationMinutes)
          return (
            <Button
              key={slot.start}
              variant={selected?.start === slot.start ? 'default' : 'outline'}
              onClick={() => choose(slot)}
              className="justify-start"
            >
              {format(start, 'HH:mm')} – {format(end, 'HH:mm')} • {slot.mechanicName}
            </Button>
          )
        })}
      </div>

      <Button onClick={next} disabled={!selected}>
        Продолжить →
      </Button>
    </Card>
  )
}
