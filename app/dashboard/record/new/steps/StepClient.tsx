'use client'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { WizardContext, Client } from '@/app/dashboard/record/new/types'
import { useState } from 'react'

const schema = z.object({
  phone: z.string().min(5),
  name:  z.string().optional(),
  email: z.string().email().optional(),
})

type Form = z.infer<typeof schema>

type Props = {
  context: WizardContext
  onNextAction: (d: Partial<WizardContext>) => void
}

export default function StepClient({ onNextAction }: Props) {
  const { register, handleSubmit, formState: { errors } } =
    useForm<Form>({ resolver: zodResolver(schema) })

  const [mode, setMode] = useState<'search' | 'new'>('search')

  /** поиск */
  const search = async ({ phone }: Form) => {
    const r = await fetch(`/api/clients?phone=${encodeURIComponent(phone)}`)
    const client: Client | null = await r.json()
    if (client) onNextAction({ client })
    else setMode('new')
  }

  /** создание */
  const create = async (values: Form) => {
    const r = await fetch('/api/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    })
    const client: Client = await r.json()
    onNextAction({ client })
  }

  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-xl font-bold">Шаг 1 — клиент</h2>

      {mode === 'search' && (
        <form onSubmit={handleSubmit(search)} className="flex gap-2">
          <Input placeholder="Телефон" {...register('phone')} />
          <Button type="submit">Поиск</Button>
        </form>
      )}

      {mode === 'new' && (
        <form onSubmit={handleSubmit(create)} className="space-y-2">
          <Input placeholder="Имя" {...register('name', { required: true })} />
          <Input placeholder="Телефон" {...register('phone')} disabled />
          <Input placeholder="E-mail" {...register('email')} />
          <Button type="submit">Создать →</Button>
        </form>
      )}

      {errors.phone && <p className="text-destructive">{errors.phone.message}</p>}
    </Card>
  )
}
