'use client'

import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  User, 
  Car, 
  Wrench, 
  Search,
  Filter,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

// Моковые данные для всех визитов
const mockVisits = [
  {
    id: 1,
    client: 'Иванов Александр Петрович',
    phone: '+7 (999) 123-45-67',
    vehicle: 'Toyota Camry 2019',
    service: 'Замена масла и фильтров',
    mechanic: 'Сидоров И.И.',
    date: '2025-07-02',
    time: '09:00',
    status: 'completed',
    price: 3500,
    duration: 60
  },
  {
    id: 2,
    client: 'Петрова Мария Сергеевна',
    phone: '+7 (999) 234-56-78',
    vehicle: 'BMW X5 2020',
    service: 'Диагностика двигателя',
    mechanic: 'Козлов П.А.',
    date: '2025-07-02',
    time: '11:00',
    status: 'in-progress',
    price: 2500,
    duration: 90
  },
  {
    id: 3,
    client: 'Сидоров Дмитрий Александрович',
    phone: '+7 (999) 345-67-89',
    vehicle: 'Mercedes-Benz C-Class 2018',
    service: 'Шиномонтаж',
    mechanic: 'Иванов В.В.',
    date: '2025-07-02',
    time: '14:00',
    status: 'scheduled',
    price: 1500,
    duration: 45
  },
  {
    id: 4,
    client: 'Козлова Елена Викторовна',
    phone: '+7 (999) 456-78-90',
    vehicle: 'Audi A4 2021',
    service: 'ТО-1 (плановое обслуживание)',
    mechanic: 'Сидоров И.И.',
    date: '2025-07-02',
    time: '16:00',
    status: 'scheduled',
    price: 8500,
    duration: 120
  },
  {
    id: 5,
    client: 'Морозов Андрей Николаевич',
    phone: '+7 (999) 567-89-01',
    vehicle: 'Volkswagen Polo 2017',
    service: 'Замена тормозных колодок',
    mechanic: 'Козлов П.А.',
    date: '2025-07-01',
    time: '15:30',
    status: 'completed',
    price: 4200,
    duration: 75
  },
  {
    id: 6,
    client: 'Новикова Ольга Ивановна',
    phone: '+7 (999) 678-90-12',
    vehicle: 'Hyundai Solaris 2019',
    service: 'Развал-схождение',
    mechanic: 'Иванов В.В.',
    date: '2025-07-01',
    time: '13:00',
    status: 'cancelled',
    price: 2800,
    duration: 60
  }
]

const statusConfig = {
  scheduled: {
    label: 'Запланировано',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    icon: Calendar
  },
  'in-progress': {
    label: 'В работе',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    icon: Timer
  },
  completed: {
    label: 'Завершено',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    icon: CheckCircle2
  },
  cancelled: {
    label: 'Отменено',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    icon: XCircle
  }
}

const VisitCard = ({ visit, index }: { visit: any, index: number }) => {
  const StatusIcon = statusConfig[visit.status as keyof typeof statusConfig].icon

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="hover:shadow-md transition-shadow duration-200">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-lg">{visit.client}</h3>
                <Badge 
                  variant="secondary" 
                  className={cn("text-xs", statusConfig[visit.status as keyof typeof statusConfig].color)}
                >
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusConfig[visit.status as keyof typeof statusConfig].label}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-1">{visit.phone}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>
                  <Eye className="w-4 h-4 mr-2" />
                  Просмотреть
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Edit className="w-4 h-4 mr-2" />
                  Редактировать
                </DropdownMenuItem>
                <DropdownMenuItem className="text-red-600">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Удалить
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Car className="w-4 h-4 text-muted-foreground" />
                <span>{visit.vehicle}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Wrench className="w-4 h-4 text-muted-foreground" />
                <span>{visit.service}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <User className="w-4 h-4 text-muted-foreground" />
                <span>{visit.mechanic}</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span>{new Date(visit.date).toLocaleDateString('ru-RU')}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span>{visit.time} ({visit.duration} мин)</span>
              </div>
              <div className="flex items-center gap-2 text-sm font-medium">
                <span>Стоимость: {visit.price.toLocaleString()}₽</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function VisitsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')

  const filteredVisits = useMemo(() => {
    return mockVisits.filter(visit => {
      const matchesSearch = visit.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           visit.vehicle.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           visit.service.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || visit.status === statusFilter
      
      const matchesDate = dateFilter === 'all' || 
                         (dateFilter === 'today' && visit.date === '2025-07-02') ||
                         (dateFilter === 'yesterday' && visit.date === '2025-07-01')
      
      return matchesSearch && matchesStatus && matchesDate
    })
  }, [searchTerm, statusFilter, dateFilter])

  const stats = useMemo(() => {
    const total = filteredVisits.length
    const completed = filteredVisits.filter(v => v.status === 'completed').length
    const inProgress = filteredVisits.filter(v => v.status === 'in-progress').length
    const scheduled = filteredVisits.filter(v => v.status === 'scheduled').length
    const totalRevenue = filteredVisits
      .filter(v => v.status === 'completed')
      .reduce((sum, v) => sum + v.price, 0)

    return { total, completed, inProgress, scheduled, totalRevenue }
  }, [filteredVisits])

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-4 p-6">
          <SidebarTrigger />
          <div className="flex-1">
            <h1 className="text-2xl font-bold">Все визиты</h1>
            <p className="text-muted-foreground">
              Управление записями клиентов
            </p>
          </div>
        </div>
        
        {/* Filters */}
        <div className="px-6 pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Поиск по клиенту, автомобилю или услуге..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Статус" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Все статусы</SelectItem>
                <SelectItem value="scheduled">Запланировано</SelectItem>
                <SelectItem value="in-progress">В работе</SelectItem>
                <SelectItem value="completed">Завершено</SelectItem>
                <SelectItem value="cancelled">Отменено</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Период" />
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

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-xs text-muted-foreground">Всего</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.scheduled}</div>
              <div className="text-xs text-muted-foreground">Запланировано</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
              <div className="text-xs text-muted-foreground">В работе</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.completed}</div>
              <div className="text-xs text-muted-foreground">Завершено</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">
                {stats.totalRevenue.toLocaleString()}₽
              </div>
              <div className="text-xs text-muted-foreground">Выручка</div>
            </CardContent>
          </Card>
        </div>

        {/* Visits List */}
        <div className="space-y-4">
          {filteredVisits.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <AlertCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Визиты не найдены</h3>
                <p className="text-muted-foreground">
                  Попробуйте изменить параметры поиска или фильтры
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredVisits.map((visit, index) => (
              <VisitCard key={visit.id} visit={visit} index={index} />
            ))
          )}
        </div>
      </div>
    </div>
  )
}