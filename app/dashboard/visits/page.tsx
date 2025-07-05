'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { 
  Calendar, 
  Clock, 
  User, 
  Car, 
  Wrench, 
  Search,
  MoreVertical,
  Edit,
  Trash2,
  CheckCircle2,
  Timer,
  Loader2,
  Phone,
  DollarSign
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { cn } from '@/lib/utils'
import { useVisits, useVisitMutations } from '@/hooks/use-api'
import { type Visit } from '@/lib/api'

// Status configuration
const statusConfig = {
  scheduled: {
    label: 'Запланирован',
    icon: Calendar,
    color: 'bg-blue-500 text-white',
    bgColor: 'bg-blue-50 border-blue-200'
  },
  'in-progress': {
    label: 'В работе',
    icon: Timer,
    color: 'bg-orange-500 text-white',
    bgColor: 'bg-orange-50 border-orange-200'
  },
  done: {
    label: 'Завершен',
    icon: CheckCircle2,
    color: 'bg-green-500 text-white',
    bgColor: 'bg-green-50 border-green-200'
  },
  delivered: {
    label: 'Выдан',
    icon: CheckCircle2,
    color: 'bg-purple-500 text-white',
    bgColor: 'bg-purple-50 border-purple-200'
  }
}

// Visit Card Component
function VisitCard({ 
  visit, 
  onStatusChange, 
  onEdit, 
  onDelete 
}: { 
  visit: Visit;
  onStatusChange: (id: string, status: string) => void;
  onEdit: (visit: Visit) => void;
  onDelete: (id: string) => void;
}) {
  const config = statusConfig[visit.status]
  const Icon = config.icon
  
  // Type guards and data extraction
  const client = typeof visit.clientId === 'object' ? visit.clientId : null
  const mechanic = typeof visit.mechanicId === 'object' ? visit.mechanicId : null
  const services = Array.isArray(visit.serviceIds) && visit.serviceIds.length > 0 && typeof visit.serviceIds[0] === 'object' 
    ? visit.serviceIds as { title?: string; price?: number }[] 
    : []

  const totalPrice = services.reduce((sum, service) => sum + (service.price || 0), 0)
  const startTime = new Date(visit.slotStart)
  const endTime = new Date(visit.slotEnd)
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "group hover:shadow-lg transition-all duration-200 border-2",
        config.bgColor
      )}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn("p-2 rounded-full", config.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <Badge className={config.color}>
                  {config.label}
                </Badge>
              </div>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(visit)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => visit._id && onDelete(visit._id)} className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="space-y-3">
            {/* Client Info */}
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <span className="font-medium">{client?.name || 'Клиент не найден'}</span>
            </div>
            
            {client?.phone && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Phone className="w-4 h-4" />
                <span>{client.phone}</span>
              </div>
            )}

            {/* Vehicle Info */}
            {client?.vehicles && client.vehicles.length > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <Car className="w-4 h-4 text-muted-foreground" />
                <span>{client.vehicles[0].make} {client.vehicles[0].model}</span>
                {client.vehicles[0].licensePlate && (
                  <Badge variant="outline" className="text-xs">
                    {client.vehicles[0].licensePlate}
                  </Badge>
                )}
              </div>
            )}

            {/* Services */}
            {services.length > 0 && (
              <div className="flex items-start gap-2">
                <Wrench className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="flex-1">
                  <div className="text-sm">
                    {services.map(service => service.title).join(', ')}
                  </div>
                </div>
              </div>
            )}

            {/* Mechanic */}
            {mechanic && (
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>Механик: {mechanic.name}</span>
              </div>
            )}

            {/* Time */}
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-muted-foreground" />
              <span>
                {startTime.toLocaleDateString('ru-RU')} в {startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                {' - '}
                {endTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>

            {/* Price */}
            {totalPrice > 0 && (
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>Стоимость: {totalPrice.toLocaleString()}₽</span>
              </div>
            )}

            {/* Status Actions */}
            {visit.status !== 'delivered' && (
              <div className="flex gap-2 mt-4">
                {visit.status === 'scheduled' && (
                  <Button
                    size="sm"
                    onClick={() => visit._id && onStatusChange(visit._id, 'in-progress')}
                    className="bg-orange-500 hover:bg-orange-600"
                  >
                    Начать работу
                  </Button>
                )}
                {visit.status === 'in-progress' && (
                  <Button
                    size="sm"
                    onClick={() => visit._id && onStatusChange(visit._id, 'done')}
                    className="bg-green-500 hover:bg-green-600"
                  >
                    Завершить
                  </Button>
                )}
                {visit.status === 'done' && (
                  <Button
                    size="sm"
                    onClick={() => visit._id && onStatusChange(visit._id, 'delivered')}
                    className="bg-purple-500 hover:bg-purple-600"
                  >
                    Выдать клиенту
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function VisitsPage() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  // API hooks - без фильтров, чтобы избежать бесконечных перезапросов
  const { data: visits = [], loading, error, refetch } = useVisits()
  const { updateVisit, deleteVisit } = useVisitMutations()

  const filteredVisits = useMemo(() => {
    if (!visits || visits.length === 0) return []
    
    return visits
      .filter((visit: Visit) => {
        const client = typeof visit.clientId === 'object' ? visit.clientId : null
        const services = Array.isArray(visit.serviceIds) && visit.serviceIds.length > 0 && typeof visit.serviceIds[0] === 'object' 
          ? visit.serviceIds as { title?: string }[] 
          : []
        
        const matchesSearch = 
          client?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          client?.phone.includes(searchTerm) ||
          services.some(service => service.title?.toLowerCase().includes(searchTerm.toLowerCase()))
        
        const matchesStatus = statusFilter === 'all' || visit.status === statusFilter
        
        const visitDate = new Date(visit.slotStart).toDateString()
        const today = new Date().toDateString()
        const yesterday = new Date(Date.now() - 86400000).toDateString()
        
        const matchesDate = dateFilter === 'all' || 
                          (dateFilter === 'today' && visitDate === today) ||
                          (dateFilter === 'yesterday' && visitDate === yesterday)
        
        return matchesSearch && matchesStatus && matchesDate
      })
      // ДОБАВЛЯЕМ СОРТИРОВКУ ПО ПОСЛЕДНИМ ИЗМЕНЕНИЯМ
      .sort((a: Visit, b: Visit) => {
        const aTime = new Date(a.updatedAt || a.createdAt || a.slotStart).getTime()
        const bTime = new Date(b.updatedAt || b.createdAt || b.slotStart).getTime()
        return bTime - aTime // Новые сверху
      })
  }, [visits, searchTerm, statusFilter, dateFilter])

  const stats = useMemo(() => {
    const total = filteredVisits.length
    const completed = filteredVisits.filter((v: Visit) => v.status === 'done' || v.status === 'delivered').length
    const inProgress = filteredVisits.filter((v: Visit) => v.status === 'in-progress').length
    const scheduled = filteredVisits.filter((v: Visit) => v.status === 'scheduled').length

    const totalRevenue = filteredVisits
      .filter((v: Visit) => v.status === 'done' || v.status === 'delivered')
      .reduce((sum: number, v: Visit) => {
        const services = Array.isArray(v.serviceIds) && v.serviceIds.length > 0 && typeof v.serviceIds[0] === 'object' 
          ? v.serviceIds as { price?: number }[] 
          : []
        return sum + services.reduce((serviceSum, service) => serviceSum + (service.price || 0), 0)
      }, 0)

    return { total, completed, inProgress, scheduled, totalRevenue }
  }, [filteredVisits])

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateVisit(id, { 
        status: status as Visit['status'],
        updatedAt: new Date().toISOString()
      })
      refetch()
    } catch (error) {
      console.error('Failed to update visit status:', error)
    }
  }
  const handleEdit = (visit: Visit) => {
    if (visit._id) {
      router.push(`/dashboard/visits/${visit._id}/edit`)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Вы уверены, что хотите удалить этот визит?')) {
      try {
        await deleteVisit(id)
        refetch()
      } catch (error) {
        console.error('Failed to delete visit:', error)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 p-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Визиты</h1>
              <p className="text-muted-foreground">Управление визитами клиентов</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
        <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-4 p-6">
            <SidebarTrigger />
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Визиты</h1>
              <p className="text-muted-foreground">Управление визитами клиентов</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <p className="text-red-600 mb-4">Ошибка загрузки визитов</p>
            <Button onClick={refetch}>Попробовать снова</Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 p-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Визиты</h1>
            <p className="text-muted-foreground">
              Управление визитами клиентов
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по клиенту, услуге..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="scheduled">Запланирован</SelectItem>
                <SelectItem value="in-progress">В работе</SelectItem>
                <SelectItem value="done">Завершен</SelectItem>
                <SelectItem value="delivered">Выдан</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Дата" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все даты</SelectItem>
                <SelectItem value="today">Сегодня</SelectItem>
                <SelectItem value="yesterday">Вчера</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Всего визитов</p>
                  <p className="text-2xl font-bold">{stats.total}</p>
                </div>
                <Calendar className="w-8 h-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Запланировано</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.scheduled}</p>
                </div>
                <Calendar className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">В работе</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.inProgress}</p>
                </div>
                <Timer className="w-8 h-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Завершено</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
                </div>
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Выручка</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.totalRevenue.toLocaleString()}₽
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Visits Grid */}
        {filteredVisits.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Визиты не найдены</h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' || dateFilter !== 'all'
                  ? 'Попробуйте изменить параметры поиска' 
                  : 'Визиты появятся здесь после создания записей'
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVisits.map((visit: Visit) => (
              <VisitCard
                key={visit._id}
                visit={visit}
                onStatusChange={handleStatusChange}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}