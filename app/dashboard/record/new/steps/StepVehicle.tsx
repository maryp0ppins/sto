'use client'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { WizardContext, Vehicle } from '@/app/dashboard/record/new/types'

const schema = z.object({
  make: z.string().min(2),
  model: z.string().min(1),
  licensePlate: z.string().min(5),
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
    const load = async () => {
      const r = await fetch(`/api/vehicles?clientId=${clientId}`)
      if (r.ok) setVehicles(await r.json())
    }
    load()
  }, [clientId])

  const select = (v: Vehicle) => onNextAction({ vehicle: v })

  const remove = async (id: string) => {
    await fetch('/api/vehicles', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, vehicleId: id })
    })
    setVehicles(prev => prev.filter(v => v._id !== id))
  }

  const create = async (data: Form) => {
    const r = await fetch('/api/vehicles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ clientId, ...data }),
    })
    if (!r.ok) return
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
              <div key={v._id} className="flex gap-2">
                <Button variant="outline" onClick={() => select(v)}>
                  {v.make} {v.model} • {v.licensePlate}
                </Button>
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => remove(v._id)}
                >
                  ×
                </Button>
              </div>
            ))}
          </div>
          <hr className="my-4" />
        </>
      )}

      <p>Или добавьте новый:</p>
      <form onSubmit={handleSubmit(create)} className="space-y-2">
        <Input placeholder="Марка" {...register('make')} />
        {errors.make && <small className="text-destructive">{errors.make.message}</small>}
        <Input placeholder="Модель" {...register('model')} />
        {errors.model && <small className="text-destructive">{errors.model.message}</small>}
        <Input placeholder="Гос-номер" {...register('licensePlate')} />
        {errors.licensePlate && <small className="text-destructive">{errors.licensePlate.message}</small>}
        <Button type="submit">Добавить →</Button>
      </form>
    </Card>
  )
}
