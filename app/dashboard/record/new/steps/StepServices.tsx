// app/dashboard/record/new/steps/StepServices.tsx
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Wrench, Check, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useServices } from '@/hooks/use-api'
import type { StepProps } from '../StepProps'
import type { Service as ApiService } from '@/lib/api'

// Анимации
const stepVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -100, scale: 0.95 }
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

export default function StepServices({ onNextAction }: StepProps) {
  const { data: services = [], loading } = useServices()
  const [selectedServices, setSelectedServices] = useState<StepProps['context']['services']>([])

  const toggleService = (service: ApiService) => {
    setSelectedServices(prev => {
      const current = prev || []
      const exists = current.find(s => s._id === service._id)
      if (exists) {
        return current.filter(s => s._id !== service._id)
      } else {
        // Конвертируем типы API в типы wizard
        const convertedService = {
          _id: service._id || '',
          title: service.title,
          price: service.price,
          durationMinutes: service.durationMinutes
        }
        return [...current, convertedService]
      }
    })
  }

  const totalPrice = (selectedServices || []).reduce((sum, service) => sum + service.price, 0)
  const totalDuration = (selectedServices || []).reduce((sum, service) => sum + service.durationMinutes, 0)

  if (loading) {
    return (
      <motion.div
        variants={stepVariants}
        initial="hidden"
        animate="visible"
        className="flex items-center justify-center py-16"
      >
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Загрузка услуг...</span>
      </motion.div>
    )
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
              <Wrench className="w-6 h-6 text-primary" />
            </div>
            Выберите услуги
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-3 max-h-80 overflow-y-auto"
          >
            {(services || []).map((service) => {
              const isSelected = (selectedServices || []).some(s => s._id === service._id)
              return (
                <motion.div
                  key={service._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => toggleService(service)}
                  className={cn(
                    "p-4 border rounded-lg cursor-pointer transition-all duration-200 mx-1",
                    isSelected 
                      ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                      : "border-border hover:border-primary/50 hover:bg-accent/50"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="font-medium">{service.title}</div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {service.durationMinutes} мин • {service.price}MDL
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
          </motion.div>

          {(selectedServices || []).length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-t border-border pt-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm text-muted-foreground">
                  Выбрано услуг: {(selectedServices || []).length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Время: {Math.floor(totalDuration / 60)}ч {totalDuration % 60}м
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold">
                  Итого: {totalPrice}MDL
                </div>
                <Button 
                  onClick={() => onNextAction({ services: selectedServices })}
                  disabled={(selectedServices || []).length === 0}
                  className="bg-primary hover:bg-primary/90 px-8 h-12"
                >
                  Продолжить
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}