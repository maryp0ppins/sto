'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Client, Vehicle } from '@/types'

type Props = {
  client: Client
  onSave: (client: Client) => void
  onCancel: () => void
}

export function ClientEditor({ client, onSave, onCancel }: Props) {
  const [data, setData] = useState<Client>(client)

  useEffect(() => {
    setData(client)
  }, [client])

  const update = <K extends keyof Client>(key: K, value: Client[K]) => {
  setData(prev => ({ ...prev, [key]: value }))
}


  const updateVehicle = (index: number, key: keyof Vehicle, value: string) => {
    const updated = [...(data.vehicles || [])]
    updated[index] = { ...updated[index], [key]: value }
    update('vehicles', updated)
  }

  const addVehicle = () => {
    update('vehicles', [...(data.vehicles || []), { make: '', model: '', licensePlate: '' }])
  }

  return (
    <Dialog open onOpenChange={onCancel}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{client._id ? 'Редактировать клиента' : 'Новый клиент'}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Input
            placeholder="Имя"
            value={data.name}
            onChange={(e) => update('name', e.target.value)}
          />
          <Input
            placeholder="Телефон"
            value={data.phone}
            onChange={(e) => update('phone', e.target.value)}
          />
          <Input
            placeholder="Email"
            value={data.email || ''}
            onChange={(e) => update('email', e.target.value)}
          />

          <div className="space-y-2">
            <div className="font-medium text-sm">Машины</div>
            {data.vehicles?.map((v, idx) => (
              <div key={idx} className="grid grid-cols-3 gap-2">
                <Input
                  placeholder="Марка"
                  value={v.make}
                  onChange={(e) => updateVehicle(idx, 'make', e.target.value)}
                />
                <Input
                  placeholder="Модель"
                  value={v.model}
                  onChange={(e) => updateVehicle(idx, 'model', e.target.value)}
                />
                <Input
                  placeholder="Номер"
                  value={v.licensePlate}
                  onChange={(e) => updateVehicle(idx, 'licensePlate', e.target.value)}
                />
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addVehicle}>
              + Добавить машину
            </Button>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={onCancel}>Отмена</Button>
            <Button onClick={() => onSave(data)}>Сохранить</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
