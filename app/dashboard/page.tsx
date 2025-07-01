'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
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
  ExternalLink
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { useAuth } from '@/hooks/use-auth'

// Моковые данные для демонстрации
const mockStats = {
  todayVisits: 12,
  todayRevenue: 45300,
  activeClients: 8,
  completedToday: 6,
  monthlyGrowth: 15.2,
  recentActivities: [
    { id: 1, type: 'completed', message: 'Замена масла для Toyota Camry завершена', time: '10 мин назад', client: 'Иванов А.П.' },
    { id: 2, type: 'started', message: 'Начат ремонт тормозной системы BMW X5', time: '25 мин назад', client: 'Петров В.С.' },
    { id: 3, type: 'scheduled', message: 'Новая запись на диагностику двигателя', time: '1 час назад', client: 'Сидорова М.И.' },
    { id: 4, type: 'completed', message: 'Шиномонтаж Mercedes-Benz C-Class завершен', time: '2 часа назад', client: 'Козлов Д.А.' },
  ],
  upcomingVisits: [
    { id: 1, client: 'Новиков С.П.', service: 'ТО-1', time: '14:00', vehicle: 'Audi A4' },
    { id: 2, client: 'Морозова Е.В.', service: 'Диагностика', time: '15:30', vehicle: 'Hyundai Solaris' },
    { id: 3, client: 'Волков А.М.', service: 'Замена фильтров', time: '16:00', vehicle: 'Skoda Octavia' },
  ],
  popularServices: [
    { name: 'Замена масла', count: 15, trend: '+8%' },
    { name: 'Диагностика', count: 12, trend: '+12%' },
    { name: 'Шиномонтаж', count: 9, trend: '-2%' },
    { name: 'ТО-1', count: 7, trend: '+5%' },
  ]
}

const StatCard = ({ 
  title, 
  value, 
  description, 
  icon: Icon, 
  trend, 
  color = 'default' 
}: { 
  title: string
  value: string | number
  description: string
  icon: any
  trend?: { value: number; label: string }
  color?: 'default' | 'success' | 'warning' | 'danger'
}) => {
  const colorClasses = {
    default: 'from-blue-500/10 to-blue-600/10 border-blue-200 dark:border-blue-800',
    success: 'from-green-500/10 to-green-600/10 border-green-200 dark:border-green-800',
    warning: 'from-yellow-500/10 to-yellow-600/10 border-yellow-200 dark:border-yellow-800',
    danger: 'from-red-500/10 to-red-600/10 border-red-200 dark:border-red-800'
  }

  const iconColors = {
    default: 'text-blue-500',
    success: 'text-green-500',
    warning: 'text-yellow-500',
    danger: 'text-red-500'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "border-0 shadow-lg bg-gradient-to-br backdrop-blur",
        colorClasses[color]
      )}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              <div className="flex items-baseline gap-2">
                <p className="text-2xl font-bold">
                  {typeof value === 'number' ? value.toLocaleString() : value}
                </p>
                {trend && (
                  <div className={cn(
                    "flex items-center text-xs",
                    trend.value > 0 ? "text-green-600" : "text-red-600"
                  )}>
                    {trend.value > 0 ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {Math.abs(trend.value)}% {trend.label}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            </div>
            <div className={cn(
              "p-3 rounded-xl bg-background/50",
              iconColors[color]
            )}>
              <Icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const NewRecordButton = () => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.3 }}
  >
    <Card className="border-0 shadow-xl bg-gradient-to-br from-primary/10 via-primary/5 to-background">
      <CardContent className="p-6">
        <div className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-2xl flex items-center justify-center">
            <Plus className="w-8 h-8 text-primary-foreground" />
          </div>
          <div>
            <h3 className="text-xl font-bold mb-2">Новая запись</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Создать новую запись клиента на обслуживание
            </p>
            <Button asChild size="lg" className="w-full">
              <Link href="/dashboard/record/new">
                Создать запись
                <ArrowUpRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
)

const ActivityFeed = () => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'completed': return <CheckCircle2 className="w-4 h-4 text-green-500" />
      case 'started': return <Timer className="w-4 h-4 text-blue-500" />
      case 'scheduled': return <Calendar className="w-4 h-4 text-purple-500" />
      default: return <Activity className="w-4 h-4 text-gray-500" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'completed': return 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800'
      case 'started': return 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800'
      case 'scheduled': return 'bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800'
      default: return 'bg-gray-50 dark:bg-gray-950/30 border-gray-200 dark:border-gray-800'
    }
  }

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5" />
          Последние события
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockStats.recentActivities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={cn(
              "p-4 rounded-lg border",
              getActivityColor(activity.type)
            )}
          >
            <div className="flex items-start gap-3">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {activity.message}
                </p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-xs text-muted-foreground">
                    {activity.client}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  )
}

const UpcomingVisits = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader>
      <div className="flex items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          Предстоящие визиты
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/visits">
            Все визиты
            <ExternalLink className="w-3 h-3 ml-1" />
          </Link>
        </Button>
      </div>
    </CardHeader>
    <CardContent className="space-y-3">
      {mockStats.upcomingVisits.map((visit, index) => (
        <motion.div
          key={visit.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 hover:bg-primary/10 transition-colors cursor-pointer"
          onClick={() => window.location.href = '/dashboard/visits'}
        >
          <div className="flex-1">
            <p className="font-medium text-sm">{visit.client}</p>
            <p className="text-xs text-muted-foreground">{visit.vehicle}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-medium">{visit.time}</p>
            <p className="text-xs text-muted-foreground">{visit.service}</p>
          </div>
        </motion.div>
      ))}
    </CardContent>
  </Card>
)

const PopularServices = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <Wrench className="w-5 h-5" />
        Популярные услуги
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      {mockStats.popularServices.map((service, index) => (
        <motion.div
          key={service.name}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
        >
          <div>
            <p className="font-medium text-sm">{service.name}</p>
            <p className="text-xs text-muted-foreground">{service.count} раз в месяц</p>
          </div>
          <div className={cn(
            "text-xs font-medium px-2 py-1 rounded-full",
            service.trend.startsWith('+') 
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
              : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {service.trend}
          </div>
        </motion.div>
      ))}
    </CardContent>
  </Card>
)

export default function ModernDashboard() {
  const { user } = useAuth()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const greeting = () => {
    const hour = currentTime.getHours()
    if (hour < 12) return 'Доброе утро'
    if (hour < 18) return 'Добрый день'
    return 'Добрый вечер'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      {/* Header with Sidebar Toggle */}
      <div className="flex items-center gap-4 p-6 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">
            {greeting()}, {user?.name || 'Пользователь'}!
          </h1>
          <p className="text-muted-foreground">
            {currentTime.toLocaleDateString('ru-RU', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-mono font-bold">
            {currentTime.toLocaleTimeString('ru-RU', { 
              hour: '2-digit', 
              minute: '2-digit' 
            })}
          </p>
          <p className="text-sm text-muted-foreground">
            Текущее время
          </p>
        </div>
      </div>

      <div className="container mx-auto p-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Записей сегодня"
            value={mockStats.todayVisits}
            description="активных заказов"
            icon={Calendar}
            trend={{ value: 8.2, label: "за неделю" }}
            color="default"
          />
          <StatCard
            title="Выручка сегодня"
            value={`${mockStats.todayRevenue.toLocaleString()}₽`}
            description="доход за день"
            icon={DollarSign}
            trend={{ value: mockStats.monthlyGrowth, label: "за месяц" }}
            color="success"
          />
          <StatCard
            title="Активных клиентов"
            value={mockStats.activeClients}
            description="в процессе обслуживания"
            icon={Users}
            color="warning"
          />
          <StatCard
            title="Выполнено"
            value={mockStats.completedToday}
            description="заказов завершено"
            icon={CheckCircle2}
            trend={{ value: 12.5, label: "от плана" }}
            color="success"
          />
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Column - New Record Button */}
          <div className="lg:col-span-1">
            <NewRecordButton />
          </div>

          {/* Middle Column */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityFeed />
            <PopularServices />
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1 space-y-6">
            <UpcomingVisits />
          </div>
        </div>
      </div>
    </div>
  )
}