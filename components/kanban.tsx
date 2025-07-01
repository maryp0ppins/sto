// components/modern-kanban.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  Clock, 
  User, 
  Phone, 
  Car, 
  Wrench, 
  MoreHorizontal,
  Calendar,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Timer,
  Truck
} from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export type ColumnType = 'scheduled' | 'in-progress' | 'done' | 'delivered'

export type KanbanCard = {
  id: string
  title: string
  column: ColumnType
  phone?: string
  vehicle?: string
  services?: string
  slotStart?: string
  slotEnd?: string
  mechanicName?: string
  totalPrice?: number
  priority?: 'low' | 'medium' | 'high'
  estimatedDuration?: number
}

const columnConfig = {
  scheduled: {
    title: 'Запланировано',
    icon: Calendar,
    color: 'from-blue-500/20 to-cyan-500/20',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badgeColor: 'bg-blue-500',
    count: 0
  },
  'in-progress': {
    title: 'В работе',
    icon: Timer,
    color: 'from-orange-500/20 to-yellow-500/20',
    borderColor: 'border-orange-200 dark:border-orange-800',
    badgeColor: 'bg-orange-500',
    count: 0
  },
  done: {
    title: 'Выполнено',
    icon: CheckCircle2,
    color: 'from-green-500/20 to-emerald-500/20',
    borderColor: 'border-green-200 dark:border-green-800',
    badgeColor: 'bg-green-500',
    count: 0
  },
  delivered: {
    title: 'Выдано',
    icon: Truck,
    color: 'from-purple-500/20 to-pink-500/20',
    borderColor: 'border-purple-200 dark:border-purple-800',
    badgeColor: 'bg-purple-500',
    count: 0
  }
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
}

const TaskCard = ({ 
  card, 
  onMove, 
  onDelete 
}: { 
  card: KanbanCard
  onMove: (cardId: string, newColumn: ColumnType) => void
  onDelete: (cardId: string) => void
}) => {
  const [isHovered, setIsHovered] = useState(false)

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return ''
    return new Date(timeStr).toLocaleTimeString('ru', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  const getStatusActions = (currentColumn: ColumnType) => {
    const actions = []
    if (currentColumn === 'scheduled') {
      actions.push({ label: 'Начать работу', column: 'in-progress' as ColumnType, icon: Timer })
    }
    if (currentColumn === 'in-progress') {
      actions.push({ label: 'Завершить', column: 'done' as ColumnType, icon: CheckCircle2 })
    }
    if (currentColumn === 'done') {
      actions.push({ label: 'Выдать клиенту', column: 'delivered' as ColumnType, icon: Truck })
    }
    return actions
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={{ scale: 1.02 }}
      className="mb-3"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
    >
      <Card className={cn(
        "group cursor-pointer transition-all duration-200 border-l-4",
        columnConfig[card.column].borderColor,
        "hover:shadow-lg dark:hover:shadow-xl",
        isHovered && "ring-2 ring-primary/20"
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="font-medium text-sm leading-tight">{card.title}</h3>
              {card.phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  {card.phone}
                </div>
              )}
            </div>
            <div className="flex items-center gap-1">
              {card.priority && (
                <Badge 
                  variant="outline" 
                  className={cn("text-xs px-1 py-0", priorityColors[card.priority])}
                >
                  {card.priority === 'high' ? '🔥' : card.priority === 'medium' ? '⚡' : '📝'}
                </Badge>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  {getStatusActions(card.column).map((action) => (
                    <DropdownMenuItem 
                      key={action.column}
                      onClick={() => onMove(card.id, action.column)}
                      className="flex items-center gap-2"
                    >
                      <action.icon className="w-4 h-4" />
                      {action.label}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuItem 
                    onClick={() => onDelete(card.id)}
                    className="text-red-600 focus:text-red-600"
                  >
                    🗑️ Удалить
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0 space-y-3">
          {card.vehicle && (
            <div className="flex items-center gap-2 text-xs">
              <Car className="w-3 h-3 text-muted-foreground" />
              <span className="font-medium">{card.vehicle}</span>
            </div>
          )}
          
          {card.services && (
            <div className="flex items-start gap-2 text-xs">
              <Wrench className="w-3 h-3 text-muted-foreground mt-0.5" />
              <span className="line-clamp-2">{card.services}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {card.slotStart && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatTime(card.slotStart)}
                {card.slotEnd && ` - ${formatTime(card.slotEnd)}`}
              </div>
            )}
            {card.totalPrice && (
              <div className="flex items-center gap-1 font-medium text-green-600 dark:text-green-400">
                <DollarSign className="w-3 h-3" />
                {card.totalPrice}₽
              </div>
            )}
          </div>
          
          {card.mechanicName && (
            <div className="flex items-center gap-2 pt-2 border-t">
              <Avatar className="w-5 h-5">
                <AvatarFallback className="text-xs bg-primary/10">
                  {card.mechanicName.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground">{card.mechanicName}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

const Column = ({ 
  column, 
  cards, 
  onCardsChange,
  onDelete 
}: {
  column: ColumnType
  cards: KanbanCard[]
  onCardsChange: (cards: KanbanCard[]) => void
  onDelete: (cardId: string) => void
}) => {
  const config = columnConfig[column]
  const Icon = config.icon
  const columnCards = cards.filter(card => card.column === column)

  const handleMove = (cardId: string, newColumn: ColumnType) => {
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, column: newColumn } : card
    )
    onCardsChange(updatedCards)
  }

  return (
    <motion.div
      layout
      className="flex-1 min-w-80"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Object.keys(columnConfig).indexOf(column) * 0.1 }}
    >
      <div className={cn(
        "h-full rounded-xl border bg-gradient-to-br backdrop-blur-sm",
        config.color,
        config.borderColor
      )}>
        <div className="p-4 border-b bg-background/50 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={cn(
                "p-2 rounded-lg text-white",
                config.badgeColor
              )}>
                <Icon className="w-4 h-4" />
              </div>
              <div>
                <h2 className="font-semibold text-sm">{config.title}</h2>
                <p className="text-xs text-muted-foreground">
                  {columnCards.length} задач
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="text-xs">
              {columnCards.length}
            </Badge>
          </div>
        </div>
        
        <div className="p-4 h-[calc(100vh-12rem)] overflow-y-auto">
          <AnimatePresence>
            <Reorder.Group
              axis="y"
              values={columnCards}
              onReorder={(reorderedCards) => {
                const otherCards = cards.filter(card => card.column !== column)
                onCardsChange([...otherCards, ...reorderedCards])
              }}
              className="space-y-0"
            >
              {columnCards.map((card) => (
                <Reorder.Item
                  key={card.id}
                  value={card}
                  className="list-none"
                >
                  <TaskCard
                    card={card}
                    onMove={handleMove}
                    onDelete={onDelete}
                  />
                </Reorder.Item>
              ))}
            </Reorder.Group>
          </AnimatePresence>
          
          {columnCards.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-32 text-muted-foreground"
            >
              <Icon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">Пусто</p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function ModernKanban({ 
  cards = [], 
  onCardsChange,
  onDelete 
}: {
  cards: KanbanCard[]
  onCardsChange?: (cards: KanbanCard[]) => void
  onDelete?: (cardId: string) => void
}) {
  const handleCardsChange = useCallback((newCards: KanbanCard[]) => {
    onCardsChange?.(newCards)
  }, [onCardsChange])

  const handleDelete = useCallback((cardId: string) => {
    onDelete?.(cardId)
  }, [onDelete])

  return (
    <div className="h-full bg-gradient-to-br from-background via-background to-accent/5">
      <div className="flex gap-6 p-6 h-full overflow-x-auto">
        {(Object.keys(columnConfig) as ColumnType[]).map((column) => (
          <Column
            key={column}
            column={column}
            cards={cards}
            onCardsChange={handleCardsChange}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  )
}