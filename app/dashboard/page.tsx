'use client'

import { useMemo } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { type Visit } from '@/lib/api'
import { 
  Calendar, 
  DollarSign, 
  Users, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowDownRight,
  Activity,
  Timer,
  Wrench,
  Plus,
  ExternalLink,
  Loader2
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'
import { useVisits } from '@/hooks/use-api'

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = 'default',
  loading = false
}: { 
  title: string
  value: string | number
  description: string
  icon: React.ComponentType<{ className?: string }>
  trend?: { value: number; label: string }
  color?: 'default' | 'green' | 'blue' | 'purple' | 'orange'
  loading?: boolean
}) => {
  const colorClasses = {
    default: 'text-muted-foreground',
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600',
    orange: 'text-orange-600'
  }

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            {loading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span className="text-sm text-muted-foreground">Загрузка...</span>
              </div>
            ) : (
              <p className={cn("text-3xl font-bold", colorClasses[color])}>
                {typeof value === 'number' ? value.toLocaleString() : value}
              </p>
            )}
            <p className="text-xs text-muted-foreground">{description}</p>
            {trend && (
              <div className="flex items-center gap-1">
                {trend.value >= 0 ? (
                  <ArrowUpRight className="w-3 h-3 text-green-600" />
                ) : (
                  <ArrowDownRight className="w-3 h-3 text-red-600" />
                )}
                <span className={cn(
                  "text-xs font-medium",
                  trend.value >= 0 ? "text-green-600" : "text-red-600"
                )}>
                  {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
                </span>
              </div>
            )}
          </div>
          <Icon className={cn("w-8 h-8", colorClasses[color])} />
        </div>
      </CardContent>
    </Card>
  )
}

const ActivityItem = ({ 
  type, 
  message, 
  time, 
  client 
}: { 
  type: 'completed' | 'started' | 'scheduled'
  message: string
  time: string
  client: string
}) => {
  const getIcon = () => {
    switch (type) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-600" />
      case 'started': return <Timer className="w-4 h-4 text-orange-600" />
      case 'scheduled': return <Calendar className="w-4 h-4 text-blue-600" />
    }
  }

  const getBgColor = () => {
    switch (type) {
      case 'completed': return 'bg-green-50 border-green-200'
      case 'started': return 'bg-orange-50 border-orange-200'
      case 'scheduled': return 'bg-blue-50 border-blue-200'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className={cn("p-3 rounded-lg border-l-4", getBgColor())}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{getIcon()}</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900">{message}</p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-muted-foreground">{client}</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{time}</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

const UpcomingVisitItem = ({ 
  client, 
  service, 
  time, 
  vehicle 
}: { 
  client: string
  service: string
  time: string
  vehicle: string
}) => (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border"
  >
    <div className="flex-1 min-w-0">
      <p className="font-medium text-sm">{client}</p>
      <p className="text-xs text-muted-foreground">{vehicle}</p>
    </div>
    <div className="text-right">
      <p className="text-sm font-medium">{service}</p>
      <p className="text-xs text-muted-foreground">{time}</p>
    </div>
  </motion.div>
)

export default function DashboardPage() {
  const { user } = useAuth()
  
  // API hooks - без фильтров
  const { data: visits = [], loading: visitsLoading } = useVisits()

  // Calculate stats from real data
  const stats = useMemo(() => {
    if (!visits || visits.length === 0) {
      return {
        todayVisits: 0,
        todayRevenue: 0,
        activeClients: 0,
        completedToday: 0,
      }
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const todayVisits = visits.filter((visit: Visit) => {
      const visitDate = new Date(visit.slotStart)
     return visitDate >= today && visitDate < tomorrow
    })

    // Calculate revenue from completed visits today
    const todayRevenue = todayVisits
      .filter((visit: Visit) => visit.status === 'done' || visit.status === 'delivered')
      .reduce((sum: number, visit: Visit) => {
        const services = Array.isArray(visit.serviceIds) && visit.serviceIds.length > 0 && typeof visit.serviceIds[0] === 'object' 
       ? visit.serviceIds as { price?: number }[] 
       : []
      return sum + services.reduce((serviceSum: number, service: { price?: number }) => serviceSum + (service.price || 0), 0)
    }, 0)

    // Active clients (clients with visits in the last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    const activeClientIds = new Set(
      visits
        .filter((visit: Visit) => new Date(visit.slotStart) >= thirtyDaysAgo)
        .map((visit: Visit) => typeof visit.clientId === 'object' ? visit.clientId._id : visit.clientId)

    )

    const completedToday = todayVisits.filter((visit: Visit) => 
      visit.status === 'done' || visit.status === 'delivered'
    ).length

    return {
      todayVisits: todayVisits.length,
      todayRevenue,
      activeClients: activeClientIds.size,
      completedToday,
    }
  }, [visits])

  // Recent activities from visits
  const recentActivities = useMemo(() => {
    if (!visits || visits.length === 0) return []

    const activities: Array<{
      id: string
      type: 'completed' | 'started' | 'scheduled'
      message: string
      time: string
      client: string
    }> = []

    visits
          .sort((a: Visit, b: Visit) => new Date(b.updatedAt || b.slotStart).getTime() - new Date(a.updatedAt || a.slotStart).getTime())
          .slice(0, 4)
          .forEach((visit: Visit) => {
        const client = typeof visit.clientId === 'object' ? visit.clientId : null
        const services = Array.isArray(visit.serviceIds) && visit.serviceIds.length > 0 && typeof visit.serviceIds[0] === 'object' 
          ? visit.serviceIds as unknown[] 
          : []
        
        if (client && services.length > 0) {
          let type: 'completed' | 'started' | 'scheduled'
          let message: string

          switch (visit.status) {
            case 'done':
            case 'delivered':
              type = 'completed'
              message = `${(services[0] as { title?: string }).title} завершена`
              break
            case 'in-progress':
              type = 'started'
              message = `Начат ${(services[0] as { title?: string }).title}`
              break
            default:
              type = 'scheduled'
              message = `Запланирован ${(services[0] as { title?: string }).title}`
          }

          const time = new Date(visit.updatedAt || visit.slotStart)
          const now = new Date()
          const diffMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
          
          let timeLabel: string
          if (diffMinutes < 60) {
            timeLabel = `${diffMinutes} мин назад`
          } else if (diffMinutes < 1440) {
            timeLabel = `${Math.floor(diffMinutes / 60)} час назад`
          } else {
            timeLabel = time.toLocaleDateString('ru-RU')
          }

          activities.push({
            id: visit._id || Math.random().toString(),
            type,
            message,
            time: timeLabel,
            client: client.name
          })
        }
      })

    return activities
  }, [visits])

  // Upcoming visits (today and tomorrow)
  const upcomingVisits = useMemo(() => {
    if (!visits || visits.length === 0) return []

    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 2) // Show today and tomorrow

    return visits
      .filter((visit: Visit) => {
        const visitDate = new Date(visit.slotStart)
        return visitDate >= now && visitDate < tomorrow && visit.status === 'scheduled'
      })
      .sort((a: Visit, b: Visit) => new Date(a.slotStart).getTime() - new Date(b.slotStart).getTime())
      .slice(0, 5)
      .map((visit: Visit) => {
        const client = typeof visit.clientId === 'object' ? visit.clientId : null
        const services = Array.isArray(visit.serviceIds) && visit.serviceIds.length > 0 && typeof visit.serviceIds[0] === 'object' 
          ? visit.serviceIds as unknown[] 
          : []
        
        const startTime = new Date(visit.slotStart)
        const vehicle = client?.vehicles && client.vehicles.length > 0 
          ? `${client.vehicles[0].make} ${client.vehicles[0].model}`
          : 'Автомобиль'

        return {
          id: visit._id || Math.random().toString(),
          client: client?.name || 'Клиент',
          service: (services[0] as { title?: string })?.title || 'Услуга',
          time: startTime.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }),
          vehicle
        }
      })
  }, [visits])

  // Popular services
  const popularServices = useMemo(() => {
    if (!visits || visits.length === 0) return []
    
    const serviceCount: Record<string, { name: string; count: number }> = {}
    
    visits.forEach(visit => {
      const services = Array.isArray(visit.serviceIds) && visit.serviceIds.length > 0 && typeof visit.serviceIds[0] === 'object' 
        ? visit.serviceIds as { title?: string }[] 
        : []
      
      services.forEach(service => {
        if (service.title) {
          if (serviceCount[service.title]) {
            serviceCount[service.title].count++
          } else {
            serviceCount[service.title] = { name: service.title, count: 1 }
          }
        }
      })
    })

    return Object.values(serviceCount)
      .sort((a, b) => b.count - a.count)
      .slice(0, 4)
      .map(service => ({
        name: service.name,
        count: service.count,
        trend: '+0%' // We don't have historical data to calculate trends
      }))
  }, [visits])

  const loading = visitsLoading

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center justify-between p-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <div>
              <h1 className="text-2xl font-bold">
                Добро пожаловать{user?.name ? `, ${user.name}` : ''}!
              </h1>
              <p className="text-muted-foreground">
                Обзор работы автосервиса
              </p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/dashboard/record/new">
                <Plus className="w-4 h-4 mr-2" />
                Новая запись
              </Link>
            </Button>
            <Button asChild>
              <Link href="/dashboard/visits">
                <ExternalLink className="w-4 h-4 mr-2" />
                Все визиты
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Визиты сегодня"
            value={stats.todayVisits}
            description="Запланированные визиты"
            icon={Calendar}
            color="blue"
            loading={loading}
          />
          
          <StatCard
            title="Выручка сегодня"
            value={`${stats.todayRevenue.toLocaleString()}₽`}
            description="От завершенных работ"
            icon={DollarSign}
            color="green"
            loading={loading}
          />
          
          <StatCard
            title="Активные клиенты"
            value={stats.activeClients}
            description="За последний месяц"
            icon={Users}
            color="purple"
            loading={loading}
          />
          
          <StatCard
            title="Завершено сегодня"
            value={stats.completedToday}
            description="Готовых к выдаче"
            icon={CheckCircle2}
            color="orange"
            loading={loading}
          />
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Последние события
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : recentActivities.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center">
                  События появятся здесь по мере работы
                </p>
              ) : (
                <div className="space-y-3">
                  {recentActivities.map((activity) => (
                    <ActivityItem key={activity.id} {...activity} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Visits */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Ближайшие визиты
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : upcomingVisits.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">
                    Нет запланированных визитов
                  </p>
                  <Button asChild size="sm">
                    <Link href="/dashboard/record/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Создать запись
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingVisits.map((visitItem: {
                    id: string
                    client: string
                    service: string
                    time: string
                    vehicle: string
                  }) => (
                    <UpcomingVisitItem key={visitItem.id} {...visitItem} />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Popular Services */}
        {popularServices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Популярные услуги
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {popularServices.map((service, index) => (
                  <motion.div
                    key={service.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-4 rounded-lg bg-muted/30 border"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{service.name}</p>
                        <p className="text-2xl font-bold text-primary">{service.count}</p>
                        <p className="text-xs text-muted-foreground">{service.trend}</p>
                      </div>
                      <Wrench className="w-6 h-6 text-muted-foreground" />
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}