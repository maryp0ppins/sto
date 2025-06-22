'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'
import type { WizardContext } from '@/app/dashboard/record/new/types'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

type Props = {
  context: WizardContext
  onNextAction: () => void          // не нужен, но для унификации
}

export default function StepConfirm({ context }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const router = useRouter()

  const save = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/visits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId:   context.client!._id,
          vehicleId:  context.vehicle!._id,
          serviceIds: context.services!.map(s => s._id),
          slotStart:  context.slot!.start,
          slotEnd:    context.slot!.end,
          mechanicId: context.slot!.mechanicId,
        }),
      })
      if (!res.ok) throw new Error(await res.text())
      await res.json()
      router.push('/dashboard/kanban')
    } catch (err: unknown) {
      const e = err as Error
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-xl font-bold">Подтверждение</h2>

      <ul className="text-sm space-y-1">
        <li><b>Клиент:</b> {context.client!.name} ({context.client!.phone})</li>
        <li><b>Авто:</b> {context.vehicle!.make} {context.vehicle!.model}</li>
        <li><b>Услуги:</b> {context.services!.map(s => s.title).join(', ')}</li>
        <li>
          <b>Время:</b>{' '}
          {format(new Date(context.slot!.start), 'd MMM yyyy HH:mm', { locale: ru })}
        </li>
      </ul>

      {error && <p className="text-destructive text-sm">{error}</p>}

      <Button disabled={loading} onClick={save}>
        {loading ? 'Сохраняем…' : 'Подтвердить и записать'}
      </Button>
    </Card>
  )
}
