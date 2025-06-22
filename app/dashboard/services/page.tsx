'use client'
import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Service } from '@/app/dashboard/record/new/types'

export default function ServicesPage() {
  const [list, setList] = useState<Service[]>([])
  const [title, setTitle] = useState('')
  const [price, setPrice] = useState(0)
  const [duration, setDuration] = useState(0)

  const load = async () => {
    const r = await fetch('/api/services')
    const data = await r.json()
    setList(data)
  }

  useEffect(() => {
    load()
  }, [])

  const create = async () => {
    const r = await fetch('/api/services', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, price, durationMinutes: duration })
    })
    if (r.ok) {
      setTitle('')
      setPrice(0)
      setDuration(0)
      load()
    }
  }

  const remove = async (id: string) => {
    await fetch(`/api/services?id=${id}`, { method: 'DELETE' })
    setList(list.filter(s => s._id !== id))
  }

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Услуги</h1>

      <Card className="p-4 space-y-2 max-w-sm">
        <Input placeholder="Название" value={title} onChange={e => setTitle(e.target.value)} />
        <Input type="number" placeholder="Цена" value={price} onChange={e => setPrice(Number(e.target.value))} />
        <Input type="number" placeholder="Длительность, мин" value={duration} onChange={e => setDuration(Number(e.target.value))} />
        <Button onClick={create}>Добавить</Button>
      </Card>

      <div className="space-y-2">
        {list.map(s => (
          <Card key={s._id} className="p-4 flex items-center justify-between">

            <span>{s.title} — {s.price} lei ({s.durationMinutes} мин)</span>

            <Button variant="destructive" size="sm" onClick={() => remove(s._id!)}>
              Удалить
            </Button>
          </Card>
        ))}
      </div>
    </div>
  )
}
