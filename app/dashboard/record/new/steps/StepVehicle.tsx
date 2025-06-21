'use client'
import type { StepProps } from '../StepProps'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { WizardContext, Vehicle } from '@/app/dashboard/record/new/types'

const schema = z.object({
  brand: z.string().min(2),
  model: z.string().min(1),
  plate: z.string().min(5),
})
type Form = z.infer<typeof schema>

type Props = {
  context: WizardContext
  onNextAction: (d: Partial<WizardContext>) => void
}

export default function StepVehicle({ context, onNextAction }: Props) {
  const clientId = context.client!._id
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const { register, handleSubmit, formState: { errors } } =
    useForm<Form>({ resolver: zodResolver(schema) })

  useEffect(() => {
    fetch(`/api/vehicles?clientId=${clientId}`)
      .then(r => r.json())
      .then(setVehicles)
  }, [clientId])

  const select = (v: Vehicle) => onNextAction({ vehicle: v })

  const create = async (data: Form) => {
    const r = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, ...data }),
    })
    const v: Vehicle = await r.json()
    onNextAction({ vehicle: v })
  }

  return (
    <Card className="space-y-4 p-6">
      <h2 className="text-xl font-bold">Шаг 2 — автомобиль</h2>

      {vehicles.length > 0 && (
        <>
          <p>Выберите:</p>
          <div className="flex flex-col gap-2">
            {vehicles.map(v => (
              <Button key={v._id} variant="outline" onClick={() => select(v)}>
                {v.brand} {v.model} • {v.plate}
              </Button>
            ))}
          </div>
          <hr className="my-4" />
        </>
      )}

      <p>Или добавьте новый:</p>
      <form onSubmit={handleSubmit(create)} className="space-y-2">
        <Input placeholder="Марка" {...register('brand')} />
        {errors.brand && <small className="text-destructive">{errors.brand.message}</small>}
        <Input placeholder="Модель" {...register('model')} />
        {errors.model && <small className="text-destructive">{errors.model.message}</small>}
        <Input placeholder="Гос-номер" {...register('plate')} />
        {errors.plate && <small className="text-destructive">{errors.plate.message}</small>}
        <Button type="submit">Добавить →</Button>
      </form>
    </Card>
  )
}
