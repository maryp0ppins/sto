'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Service } from '@/app/dashboard/record/new/types'
import type { StepProps } from '../StepProps'

type Props = StepProps

export default function StepServices({ onNextAction }: Props) {
  const [services, setServices] = useState<Service[]>([])
  const [selected, setSelected] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      const res = await fetch('/api/services')
      const data = await res.json()
      setServices(data)
      setLoading(false)
    }

    fetchServices()
  }, [])

  const toggleService = (service: Service) => {
    setSelected(prev =>
      prev.find(s => s._id === service._id)
        ? prev.filter(s => s._id !== service._id)
        : [...prev, service]
    )
  }

  const handleNext = () => {
    if (selected.length === 0) return
    onNextAction({ services: selected })
  }

  return (
    <Card className="w-full max-w-xl space-y-4 p-6">
      <h2 className="text-xl font-bold">Шаг 2 — услуги</h2>

      {loading && <p>Загружаем...</p>}

      <div className="space-y-2">
        {services.map(service => (
          <label key={service._id} className="flex items-center gap-2">
            <Checkbox
              checked={selected.some(s => s._id === service._id)}
              onCheckedChange={() => toggleService(service)}
            />
            {service.name} ({service.duration} мин)
          </label>
        ))}
      </div>

      <Button onClick={handleNext} disabled={selected.length === 0}>
        Продолжить →
      </Button>
    </Card>
  )
}
