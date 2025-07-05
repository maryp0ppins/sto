// app/dashboard/visits/[id]/edit/page.tsx
'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Calendar, Clock, User, Car, Wrench, ArrowLeft } from 'lucide-react'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useMechanics } from '@/hooks/use-api'
import { type Visit as ApiVisit } from '@/lib/api'

export default function EditVisitPage() {
  const params = useParams()
  const router = useRouter()
  const visitId = params.id as string
  
  const [visit, setVisit] = useState<ApiVisit | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState<{ time: string; mechanicId: string } | null>(null)

  // Получаем механиков из API
  const { data: mechanics = [] } = useMechanics()

  useEffect(() => {
    const fetchVisit = async () => {
      try {
        setLoading(true)
        const response = await fetch(`/api/visits/${visitId}`)
        if (!response.ok) {
          throw new Error('Визит не найден')
        }
        const visitData = await response.json()
        setVisit(visitData)
        
        // Устанавливаем текущую дату как дефолтную
        const currentDate = new Date(visitData.slotStart)
        setSelectedDate(currentDate.toISOString().split('T')[0])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Ошибка загрузки')
      } finally {
        setLoading(false)
      }
    }

    if (visitId) {
      fetchVisit()
    }
  }, [visitId])

  const handleSaveTime = async () => {
    if (!selectedSlot || !selectedDate || !visit) return

    try {
      setSaving(true)
      
      // Вычисляем общую длительность услуг
      const services = Array.isArray(visit.serviceIds) && visit.serviceIds.length > 0 && typeof visit.serviceIds[0] === 'object'
        ? visit.serviceIds as { durationMinutes?: number }[]
        : []
      
      const totalDurationMinutes = services.reduce((sum, service) => sum + (service.durationMinutes || 0), 0)
      
      const slotStart = new Date(`${selectedDate}T${selectedSlot.time}`).toISOString()
      // Правильно рассчитываем slotEnd на основе реальной длительности услуг
      const slotEnd = new Date(new Date(`${selectedDate}T${selectedSlot.time}`).getTime() + totalDurationMinutes * 60 * 1000).toISOString()

      const response = await fetch(`/api/visits/${visitId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slotStart,
          slotEnd,
          mechanicId: selectedSlot.mechanicId,
          updatedAt: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error('Ошибка обновления времени')
      }

      // Успешно обновлено - возвращаемся к списку визитов
      router.push('/dashboard/visits')
    } catch (error) {
      console.error('Error updating visit time:', error)
      alert('Ошибка сохранения нового времени')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 p-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Изменение времени записи</h1>
              <p className="text-muted-foreground">Выберите новое время для визита</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center gap-2">
            <Loader2 className="w-6 h-6 animate-spin" />
            <span>Загрузка данных визита...</span>
          </div>
        </div>
      </div>
    )
  }

  if (error || !visit) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 p-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Ошибка</h1>
              <p className="text-muted-foreground">Не удалось загрузить данные</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Назад
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const client = typeof visit.clientId === 'object' ? visit.clientId : null
  const mechanic = typeof visit.mechanicId === 'object' ? visit.mechanicId : null
  const services = Array.isArray(visit.serviceIds) && visit.serviceIds.length > 0 && typeof visit.serviceIds[0] === 'object'
    ? visit.serviceIds as { title?: string; price?: number }[]
    : []
  
  const vehicle = client?.vehicles && client.vehicles.length > 0 
    ? `${client.vehicles[0].make} ${client.vehicles[0].model}`
    : 'Автомобиль'

  // Доступные слоты (пока мок данные)
  const availableSlots = [
    { time: '09:00' },
    { time: '10:30' },
    { time: '12:00' },
    { time: '14:00' },
    { time: '15:30' },
    { time: '17:00' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 p-6">
          <SidebarTrigger />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => router.back()}
            className="mr-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Изменение времени записи</h1>
            <p className="text-muted-foreground">
              Выберите новое время для {client?.name || 'клиента'}
            </p>
          </div>
        </div>
      </div>

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Информация о визите */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              Информация о записи
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-blue-50">
                  <User className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{client?.name || 'Клиент'}</p>
                  <p className="text-sm text-muted-foreground">{client?.phone}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-green-50">
                  <Car className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">{vehicle}</p>
                  <p className="text-sm text-muted-foreground">
                    {client?.vehicles?.[0]?.licensePlate || 'Номер не указан'}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-orange-50">
                  <Wrench className="w-4 h-4 text-orange-600" />
                </div>
                <span className="font-semibold">Услуги:</span>
              </div>
              <div className="flex flex-wrap gap-2 ml-11">
                {services.map((service, index) => (
                  <Badge key={index} variant="secondary" className="px-3 py-1">
                    {service.title}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="flex items-center justify-between">
                <span className="font-semibold">Текущее время:</span>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span className="font-mono">
                    {new Date(visit.slotStart).toLocaleString('ru-RU', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
              {mechanic && (
                <div className="flex items-center justify-between mt-2">
                  <span className="font-semibold">Механик:</span>
                  <span className="text-muted-foreground">{mechanic.name}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Выбор нового времени */}
        <Card className="border-0 shadow-xl">
          <CardHeader className="pb-6">
            <CardTitle className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              Выберите новое время
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Выбор даты */}
            <div>
              <label className="block text-sm font-semibold mb-3">Дата</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border rounded-lg text-base"
              />
            </div>

            {/* Выбор механика */}
            <div>
              <label className="block text-sm font-semibold mb-3">Механик</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {(mechanics || []).map((mech) => (
                  <motion.div
                    key={mech._id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="space-y-3"
                  >
                    <h4 className="font-medium">{mech.name}</h4>
                    <div className="grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => (
                        <button
                          key={`${slot.time}-${mech._id}`}
                          onClick={() => setSelectedSlot({ time: slot.time, mechanicId: mech._id })}
                          className={`p-2 text-sm rounded-lg border transition-colors ${
                            selectedSlot?.time === slot.time && selectedSlot?.mechanicId === mech._id
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-border hover:bg-accent'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Кнопка сохранения */}
            <Button
              onClick={handleSaveTime}
              disabled={!selectedSlot || saving}
              className="w-full h-12 text-base"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Сохранение...
                </>
              ) : (
                'Сохранить новое время'
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}