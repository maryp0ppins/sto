'use client'

import { useEffect, useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/hooks/use-auth'
import ModernKanban from '@/components/kanban'
import { Visit } from '@/app/dashboard/record/new/types'
import type { VisitStatus } from '@/app/dashboard/record/new/types'
import { addDays, startOfDay, endOfDay, format } from 'date-fns'
import { ru } from 'date-fns/locale'
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar,
  User,
  Filter,
  RefreshCw
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SidebarTrigger } from '@/components/ui/sidebar'

const statusMap: Record<VisitStatus, 'scheduled' | 'in-progress' | 'done' | 'delivered'> = {
  scheduled: 'scheduled',
  'in-progress': 'in-progress',
  done: 'done',
  delivered: 'delivered',
}

type Mechanic = {
  _id: string
  name: string
  email: string
}

type KanbanCard = {
  id: string
  title: string
  phone?: string
  vehicle?: string
  slotStart?: string
  slotEnd?: string
  services?: string
  column: 'scheduled' | 'in-progress' | 'done' | 'delivered'
}

const MechanicSelector = ({ 
  mechanics, 
  selected, 
  onSelect, 
  loading 
}: { 
  mechanics: Mechanic[]
  selected: string
  onSelect: (id: string) => void
  loading?: boolean
}) => {
  const selectedMechanic = mechanics.find(m => m._id === selected)

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <User className="w-5 h-5" />
          Выбор механика
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <Select value={selected} onValueChange={onSelect}>
          <SelectTrigger className="w-full h-12">
            <SelectValue placeholder="Выберите механика">
              {selectedMechanic && (
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {selectedMechanic.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-medium">{selectedMechanic.name || selectedMechanic.email}</div>
                    <div className="text-xs text-muted-foreground">Механик</div>
                  </div>
                </div>
              )}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {mechanics.map((mechanic) => (
              <SelectItem key={mechanic._id} value={mechanic._id}>
                <div className="flex items-center gap-3 py-1">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" />
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {mechanic.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{mechanic.name || mechanic.email}</div>
                    <div className="text-xs text-muted-foreground">Механик</div>
                  </div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        
        {loading && (
          <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
            <RefreshCw className="w-4 h-4 animate-spin" />
            Загрузка данных...
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const DateSelector = ({ 
  selectedDate, 
  onPrevDay, 
  onNextDay, 
  onToday 
}: { 
  selectedDate: Date
  onPrevDay: () => void
  onNextDay: () => void
  onToday: () => void
}) => {
  const isToday = selectedDate.toDateString() === new Date().toDateString()
  const isYesterday = selectedDate.toDateString() === addDays(new Date(), -1).toDateString()
  const isTomorrow = selectedDate.toDateString() === addDays(new Date(), 1).toDateString()

  const getDateLabel = () => {
    if (isToday) return 'Сегодня'
    if (isYesterday) return 'Вчера'
    if (isTomorrow) return 'Завтра'
    return format(selectedDate, 'd MMMM', { locale: ru })
  }

  const getWeekDay = () => {
    return format(selectedDate, 'EEEE', { locale: ru })
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Выбор даты
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={onPrevDay}
            className="h-10 w-10 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          
          <div className="flex-1 text-center">
            <div className="font-semibold text-lg">
              {getDateLabel()}
            </div>
            <div className="text-sm text-muted-foreground capitalize">
              {getWeekDay()}
            </div>
          </div>
          
          <Button
            variant="outline"
            size="icon"
            onClick={onNextDay}
            className="h-10 w-10 shrink-0"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
        
        {!isToday && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToday}
            className="w-full mt-3"
          >
            Перейти к сегодня
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

const StatsCards = ({ visits }: { visits: Visit[] }) => {
  const stats = useMemo(() => {
    const scheduled = visits.filter(v => v.status === 'scheduled').length
    const inProgress = visits.filter(v => v.status === 'in-progress').length
    const done = visits.filter(v => v.status === 'done').length
    const delivered = visits.filter(v => v.status === 'delivered').length
    
    return { scheduled, inProgress, done, delivered, total: visits.length }
  }, [visits])

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-primary">{stats.total}</div>
          <div className="text-xs text-muted-foreground">Всего</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
          <div className="text-xs text-muted-foreground">Запланировано</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.inProgress}</div>
          <div className="text-xs text-muted-foreground">В работе</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{stats.done}</div>
          <div className="text-xs text-muted-foreground">Выполнено</div>
        </CardContent>
      </Card>
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.delivered}</div>
          <div className="text-xs text-muted-foreground">Выдано</div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function KanbanPage() {
  const { user } = useAuth()
  const [mechanics, setMechanics] = useState<Mechanic[]>([])
  const [selected, setSelected] = useState('')
  const [visits, setVisits] = useState<Visit[]>([])
  const [loading, setLoading] = useState(true)
  const [dayOffset, setDayOffset] = useState(0)

  const selectedDate = useMemo(() => {
    return addDays(new Date(), dayOffset)
  }, [dayOffset])

  useEffect(() => {
    if (user?.role === 'admin') {
      fetch('/api/mechanics')
        .then((r) => r.json())
        .then(setMechanics)
        .catch(console.error)
    }
  }, [user])

  useEffect(() => {
    const mechId = user?.role === 'admin' ? selected : user?.id
    if (!mechId) return

    const from = startOfDay(selectedDate).toISOString()
    const to = endOfDay(selectedDate).toISOString()

    setLoading(true)
    fetch(`/api/visits?mechanicId=${mechId}&from=${from}&to=${to}`)
      .then(async (r) => (r.ok ? r.json() : []))
      .then(setVisits)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [user, selected, dayOffset, selectedDate])

  const updateVisit = async (v: Visit, patch: Partial<Visit>) => {
    try {
      await fetch('/api/visits', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: v._id, ...patch }),
      })

      const mechId = user?.role === 'admin' ? selected : user?.id
      if (!mechId) return

      const from = startOfDay(selectedDate).toISOString()
      const to = endOfDay(selectedDate).toISOString()

      const r = await fetch(`/api/visits?mechanicId=${mechId}&from=${from}&to=${to}`)
      setVisits(await r.json())
    } catch (error) {
      console.error('Error updating visit:', error)
    }
  }

  const removeVisit = async (id: string) => {
    try {
      await fetch(`/api/visits?id=${id}`, { method: 'DELETE' })
      setVisits((prev) => prev.filter((v) => v._id !== id))
    } catch (error) {
      console.error('Error removing visit:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center">
        <Card className="p-8">
          <CardContent className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p>Загрузка...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const kanbanCards: KanbanCard[] = visits.map((v) => {
    const vehicle = v.clientId?.vehicles?.[0]
    const services = v.serviceIds?.map(s => s.title).join(', ') || ''
    return {
      id: v._id,
      title: v.clientId?.name || 'Неизвестный клиент',
      phone: v.clientId?.phone,
      vehicle: vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.licensePlate})` : '',
      services,
      slotStart: v.slotStart,
      slotEnd: v.slotEnd,
      column: statusMap[v.status] || 'scheduled',
    }
  })

  const handleCardsChange = (cards: KanbanCard[]) => {
    cards.forEach((c) => {
      const original = visits.find((v) => v._id === c.id)
      if (!original) return

      const newStatus = c.column as VisitStatus
      const changedStatus = newStatus !== original.status

      if (changedStatus) {
        updateVisit(original, { status: newStatus })
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 p-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Канбан-доска</h1>
            <p className="text-muted-foreground">
              Управление заказами и их статусами
            </p>
          </div>
          <Badge variant="outline" className="hidden md:flex">
            <Filter className="w-3 h-3 mr-1" />
            Активные фильтры
          </Badge>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <DateSelector
            selectedDate={selectedDate}
            onPrevDay={() => setDayOffset(o => o - 1)}
            onNextDay={() => setDayOffset(o => o + 1)}
            onToday={() => setDayOffset(0)}
          />
          
          {user.role === 'admin' && (
            <MechanicSelector
              mechanics={mechanics}
              selected={selected}
              onSelect={setSelected}
              loading={loading}
            />
          )}
        </div>

        {/* Show selection prompt for admin */}
        {user.role === 'admin' && !selected ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Card className="border-0 shadow-lg">
              <CardContent className="p-12 text-center">
                <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">Выберите механика</h3>
                <p className="text-muted-foreground mb-6">
                  Для просмотра канбан-доски необходимо выбрать механика из списка выше
                </p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {mechanics.slice(0, 3).map((mechanic) => (
                    <Button
                      key={mechanic._id}
                      variant="outline"
                      onClick={() => setSelected(mechanic._id)}
                      className="gap-2"
                    >
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs">
                          {mechanic.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'M'}
                        </AvatarFallback>
                      </Avatar>
                      {mechanic.name || mechanic.email}
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <>
            {/* Stats */}
            <StatsCards visits={visits} />

            {/* Kanban Board */}
            {loading ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="p-12 text-center">
                  <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Загрузка данных...</p>
                </CardContent>
              </Card>
            ) : (
              <ModernKanban
                cards={kanbanCards}
                onCardsChange={handleCardsChange}
                onDelete={(id) => removeVisit(id)}
              />
            )}
          </>
        )}
      </div>
    </div>
  )
}