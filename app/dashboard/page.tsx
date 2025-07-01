// app/dashboard/page.tsx - Современная главная страница
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Car,
  Wrench,
  AlertTriangle,
  CheckCircle2,
  Timer,
  Activity,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useAuth } from '@/hooks/use-auth'
import { cn } from '@/lib/utils'

// Mock data
const mockStats = {
  todayVisits: 12,
  todayRevenue: 85000,
  activeClients: 8,
  completedToday: 5,
  monthlyGrowth: 15.2,
  avgServiceTime: 120,
  popularServices: [
    { name: 'Замена масла', count: 45, revenue: 157500 },
    { name: 'Диагностика', count: 32, revenue: 80000 },
    { name: 'Шиномонтаж', count: 28, revenue: 42000 }
  ],
  recentActivities: [
    { id: 1, type: 'completed', client: 'Иван Петров', service: 'Замена масла', time: '10 мин назад' },
    { id: 2, type: 'started', client: 'Мария Смирнова', service: 'Диагностика', time: '25 мин назад' },
    { id: 3, type: 'scheduled', client: 'Алексей Козлов', service: 'Развал-схождение', time: '1 час назад' }
  ],
  upcomingVisits: [
    { id: 1, client: 'Олег Сидоров', vehicle: 'BMW X5', time: '14:00', service: 'ТО' },
    { id: 2, client: 'Елена Волкова', vehicle: 'Audi A4', time: '15:30', service: 'Диагностика' },
    { id: 3, client: 'Дмитрий Федоров', vehicle: 'Mercedes C-Class', time: '16:00', service: 'Замена колодок' }
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
  icon: React.ComponentType<{ className?: string }>
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
              "p-3 rounded-lg border",
              getActivityColor(activity.type)
            )}
          >
            <div className="flex items-start gap-3">
              {getActivityIcon(activity.type)}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">
                  {activity.client}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activity.service}
                </p>
              </div>
              <span className="text-xs text-muted-foreground">
                {activity.time}
              </span>
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
      <CardTitle className="flex items-center gap-2">
        <Clock className="w-5 h-5" />
        Ближайшие записи
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-4">
      {mockStats.upcomingVisits.map((visit, index) => (
        <motion.div
          key={visit.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-background/50 to-accent/10 border"
        >
          <div className="flex items-center gap-3">
            <Avatar className="w-8 h-8">
              <AvatarFallback className="text-xs bg-primary/10">
                {visit.client.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">{visit.client}</p>
              <p className="text-xs text-muted-foreground">{visit.vehicle}</p>
            </div>
          </div>
          <div className="text-right">
            <Badge variant="outline" className="text-xs">
              {visit.time}
            </Badge>
            <p className="text-xs text-muted-foreground mt-1">
              {visit.service}
            </p>
          </div>
        </motion.div>
      ))}
      <Button variant="outline" className="w-full" size="sm">
        Посмотреть все записи
      </Button>
    </CardContent>
  </Card>
)

const PopularServices = () => (
  <Card className="border-0 shadow-lg">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <BarChart3 className="w-5 h-5" />
        Популярные услуги
      </CardTitle>
      <CardDescription>
        Топ услуги за последний месяц
      </CardDescription>
    </CardHeader>
    <CardContent className="space-y-4">
      {mockStats.popularServices.map((service, index) => {
        const maxCount = Math.max(...mockStats.popularServices.map(s => s.count))
        const percentage = (service.count / maxCount) * 100
        
        return (
          <motion.div
            key={service.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">{service.name}</span>
              <div className="text-right">
                <span className="text-sm font-bold">{service.count}</span>
                <span className="text-xs text-muted-foreground ml-2">
                  {service.revenue.toLocaleString()}₽
                </span>
              </div>
            </div>
            <Progress value={percentage} className="h-2" />
          </motion.div>
        )
      })}
    </CardContent>
  </Card>
)

const QuickActions = () => (
  <Card className="border-0 shadow-lg bg-gradient-to-br from-primary/5 to-primary/10">
    <CardHeader>
      <CardTitle>Быстрые действия</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-2 gap-3">
      <Button className="h-auto p-4 flex-col gap-2" variant="outline">
        <Users className="w-5 h-5" />
        <span className="text-xs">Новый клиент</span>
      </Button>
      <Button className="h-auto p-4 flex-col gap-2" variant="outline">
        <Calendar className="w-5 h-5" />
        <span className="text-xs">Запись</span>
      </Button>
      <Button className="h-auto p-4 flex-col gap-2" variant="outline">
        <Wrench className="w-5 h-5" />
        <span className="text-xs">Услуги</span>
      </Button>
      <Button className="h-auto p-4 flex-col gap-2" variant="outline">
        <BarChart3 className="w-5 h-5" />
        <span className="text-xs">Отчеты</span>
      </Button>
    </CardContent>
  </Card>
)

export default function ModernDashboard() {
  const user = useAuth()
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
      <div className="container mx-auto p-6 space-y-6">
        {/* Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
              {greeting()}, {user?.name || 'Пользователь'}!
            </h1>
            <p className="text-muted-foreground mt-1">
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
        </motion.div>

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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            <ActivityFeed />
            <PopularServices />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            <UpcomingVisits />
            <QuickActions />
          </div>
        </div>
      </div>
    </div>
  )
}