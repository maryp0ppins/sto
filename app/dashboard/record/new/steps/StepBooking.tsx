// app/dashboard/record/new/steps/StepBooking.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Calendar, Check, Loader2, CalendarIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { useSlots, useMechanics } from '@/hooks/use-api'
import { useVisitMutations } from '@/contexts/visits-context'
import type { StepProps } from '../StepProps'
import type { Slot } from '../types'

// Анимации
const stepVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -100, scale: 0.95 }
}

export default function StepBooking({ context }: StepProps) {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
  const [selectedMechanicId, setSelectedMechanicId] = useState<string>('')
  const [isCreating, setIsCreating] = useState(false)
  const { createVisit } = useVisitMutations() // Убираем неиспользуемый loading
  const router = useRouter()
  
  const totalDuration = (context.services || []).reduce((sum, s) => sum + s.durationMinutes, 0)
  const { data: slots = [], loading } = useSlots(selectedDate.toISOString().split('T')[0], totalDuration)
  const { data: mechanics = [] } = useMechanics()

  // Группируем слоты по механикам
  const slotsByMechanic = React.useMemo(() => {
    const grouped: Record<string, Slot[]> = {}
    if (slots) {
      slots.forEach(slot => {
        if (!grouped[slot.mechanicId]) {
          grouped[slot.mechanicId] = []
        }
        grouped[slot.mechanicId].push(slot)
      })
    }
    return grouped
  }, [slots])

  // Автоматически выбираем первого механика если не выбран
  React.useEffect(() => {
    if (mechanics && mechanics.length > 0 && !selectedMechanicId) {
      setSelectedMechanicId(mechanics[0]._id)
    }
  }, [mechanics, selectedMechanicId])

  const getSlotWithMechanicName = (slot: Slot) => {
    const mechanic = mechanics?.find(m => m._id === slot.mechanicId)
    return {
      ...slot,
      mechanicName: mechanic?.name || 'Механик'
    }
  }

  const handleCreateVisit = async () => {
    if (!context.client?._id || !context.vehicle?._id || !context.services || !selectedSlot) {
      return
    }

    setIsCreating(true) // Начинаем загрузку

    try {
      const visitData = {
        clientId: context.client._id,
        vehicleId: context.vehicle._id,
        serviceIds: context.services.map(s => s._id),
        mechanicId: selectedSlot.mechanicId,
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end,
        status: 'scheduled' as const
      }

      await createVisit(visitData)
      
      // Успешно создали запись - редиректим на дашборд
      router.push('/dashboard')
    } catch (error) {
      console.error('Failed to create visit:', error)
      setIsCreating(false) // Сбрасываем загрузку при ошибке
      // Можно добавить toast с ошибкой
    }
    // Не сбрасываем isCreating при успехе, так как произойдет редирект
  }

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.4, type: "spring" }}
    >
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-card via-card to-card/90 backdrop-blur-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 rounded-lg bg-primary/10">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            Выберите время
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium mb-2">Дата</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-12 justify-start text-left font-normal",
                      !selectedDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {selectedDate ? (
                      format(selectedDate, "d MMMM yyyy", { locale: ru })
                    ) : (
                      <span>Выберите дату</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && setSelectedDate(date)}
                    disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">
                Общее время: {Math.floor(totalDuration / 60)}ч {totalDuration % 60}м
              </label>
              <div className="h-12 flex items-center text-muted-foreground">
                Выберите удобное время записи
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-3 text-muted-foreground">Загрузка доступного времени...</span>
            </div>
          ) : (slots && slots.length > 0) ? (
            <div className="space-y-6">
              {/* Вкладки механиков */}
              <div className="flex flex-wrap gap-2 p-1 bg-muted rounded-lg">
                {(mechanics || []).map((mechanic) => {
                  const mechanicSlots = slotsByMechanic[mechanic._id] || []
                  const isActive = selectedMechanicId === mechanic._id
                  return (
                    <button
                      key={mechanic._id}
                      onClick={() => setSelectedMechanicId(mechanic._id)}
                      className={cn(
                        "flex-1 min-w-[120px] px-4 py-2 rounded-md text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-primary text-primary-foreground shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-background/50"
                      )}
                    >
                      <div className="text-center">
                        <div>{mechanic.name}</div>
                        <div className={cn(
                          "text-xs mt-1",
                          isActive ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {mechanicSlots.length} слотов
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {/* Слоты выбранного механика */}
              <div className="grid gap-3 max-h-80 overflow-y-auto">
                {(slotsByMechanic[selectedMechanicId] || []).map((slot, index) => {
                  const slotWithName = getSlotWithMechanicName(slot)
                  const isSelected = selectedSlot?.start === slot.start && selectedSlot?.mechanicId === slot.mechanicId
                  
                  return (
                    <motion.div
                      key={`${slot.start}-${slot.mechanicId}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedSlot(slotWithName)}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                        isSelected 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                          : "border-border hover:border-primary/50 hover:bg-accent/50"
                      )}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">
                            {new Date(slot.start).toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })} - {new Date(slot.end).toLocaleTimeString('ru-RU', { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {slotWithName.mechanicName}
                          </div>
                        </div>
                        <div className={cn(
                          "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                          isSelected 
                            ? "border-primary bg-primary" 
                            : "border-border"
                        )}>
                          {isSelected && <Check className="w-3 h-3 text-white" />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>

              {/* Если у выбранного механика нет слотов */}
              {(!slotsByMechanic[selectedMechanicId] || slotsByMechanic[selectedMechanicId].length === 0) && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <div className="text-muted-foreground">
                    У этого механика нет доступного времени на выбранную дату
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <div className="text-muted-foreground">
                На выбранную дату нет доступного времени
              </div>
            </div>
          )}

          {selectedSlot && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border pt-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h3 className="font-medium">Сводка записи</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Клиент:</span>
                      <span>{context.client?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Автомобиль:</span>
                      <span>{context.vehicle?.make} {context.vehicle?.model}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Услуги:</span>
                      <span>{(context.services || []).length} шт.</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Механик:</span>
                      <span>{selectedSlot.mechanicName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Время:</span>
                      <span>
                        {new Date(selectedSlot.start).toLocaleString('ru-RU', {
                          day: '2-digit',
                          month: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col justify-end">
                  <Button
                    onClick={handleCreateVisit}
                    disabled={isCreating}
                    className="w-full h-12 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Создание записи...
                      </>
                    ) : (
                      <>
                        Подтвердить запись
                        <Check className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}