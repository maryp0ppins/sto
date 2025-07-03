// components/kanban-fixed.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

// Improved TaskCard with native drag and drop
const TaskCard = ({ 
  card, 
  onMove, 
  onDelete 
}: { 
  card: KanbanCard
  onMove: (cardId: string, newColumn: ColumnType) => void
  onDelete: (cardId: string) => void
}) => {
  const [isDragging, setIsDragging] = useState(false)

  const formatTime = (timeStr?: string) => {
    if (!timeStr) return ''
    try {
      return new Date(timeStr).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return timeStr
    }
  }

  const getStatusActions = (currentColumn: ColumnType) => {
    const actions = []
    
    switch (currentColumn) {
      case 'scheduled':
        actions.push({ column: 'in-progress' as ColumnType, label: 'Начать работу', icon: Timer })
        break
      case 'in-progress':
        actions.push({ column: 'done' as ColumnType, label: 'Завершить', icon: CheckCircle2 })
        break
      case 'done':
        actions.push({ column: 'delivered' as ColumnType, label: 'Выдать клиенту', icon: Truck })
        break
      case 'delivered':
        actions.push({ column: 'scheduled' as ColumnType, label: 'Вернуть в работу', icon: Calendar })
        break
    }
    
    return actions
  }

  // Handle drag events
  const handleDragStart = (e: React.DragEvent) => {
    setIsDragging(true)
    e.dataTransfer.setData('application/json', JSON.stringify({
      cardId: card.id,
      sourceColumn: card.column
    }))
    e.dataTransfer.effectAllowed = 'move'
    
    // Add some visual feedback
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsDragging(false)
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 20 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
      className="mb-3"
    >
      <Card 
        className={cn(
          "group cursor-grab active:cursor-grabbing transition-all duration-200 hover:shadow-md border-l-4",
          card.priority === 'high' ? 'border-l-red-500' : 
          card.priority === 'medium' ? 'border-l-yellow-500' : 'border-l-green-500',
          isDragging && 'rotate-2 scale-105'
        )}
        draggable={true}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h4 className="text-sm font-medium line-clamp-1 mb-1">
                {card.title}
              </h4>
              {card.phone && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Phone className="w-3 h-3" />
                  <span>{card.phone}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-1">
              {card.priority && (
                <Badge variant="secondary" className={cn("text-xs px-1", priorityColors[card.priority])}>
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
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                <span className="font-medium">{card.totalPrice.toLocaleString()}₽</span>
              </div>
            )}
          </div>
          
          {card.mechanicName && (
            <div className="flex items-center gap-2 text-xs">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-[10px]">
                  {card.mechanicName.split(' ').map(n => n[0]).join('').toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span>{card.mechanicName}</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Updated Column component with drop zones
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
  const [isDragOver, setIsDragOver] = useState(false)
  const config = columnConfig[column]
  const Icon = config.icon
  const columnCards = cards.filter(card => card.column === column)

  const handleMove = (cardId: string, newColumn: ColumnType) => {
    const updatedCards = cards.map(card => 
      card.id === cardId ? { ...card, column: newColumn } : card
    )
    onCardsChange(updatedCards)
  }

  // Handle drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'))
      const { cardId, sourceColumn } = dragData
      
      // Only move if dropping in a different column
      if (sourceColumn !== column) {
        handleMove(cardId, column)
      }
    } catch (error) {
      console.error('Error parsing drag data:', error)
    }
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
        "h-full rounded-xl border bg-gradient-to-br backdrop-blur-sm transition-all duration-200",
        config.color,
        config.borderColor,
        isDragOver && "ring-2 ring-primary ring-offset-2 border-primary"
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
        
        <div 
          className="p-4 h-[calc(100vh-12rem)] overflow-y-auto"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <AnimatePresence>
            {columnCards.map((card) => (
              <TaskCard
                key={card.id}
                card={card}
                onMove={handleMove}
                onDelete={onDelete}
              />
            ))}
          </AnimatePresence>
          
          {columnCards.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={cn(
                "flex flex-col items-center justify-center h-32 text-muted-foreground rounded-lg border-2 border-dashed transition-colors",
                isDragOver ? "border-primary bg-primary/5" : "border-border"
              )}
            >
              <Icon className="w-8 h-8 mb-2 opacity-50" />
              <p className="text-sm">
                {isDragOver ? "Отпустите для перемещения" : "Перетащите карточку сюда"}
              </p>
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

  const columns: ColumnType[] = ['scheduled', 'in-progress', 'done', 'delivered']

  return (
    <div className="flex gap-6 h-full overflow-x-auto pb-6">
      {columns.map((column) => (
        <Column
          key={column}
          column={column}
          cards={cards}
          onCardsChange={handleCardsChange}
          onDelete={handleDelete}
        />
      ))}
    </div>
  )
}