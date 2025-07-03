// app/dashboard/record/new/ModernWizard.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronLeft, User, Car, Wrench, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { WizardContext } from './types'
import StepClient from './steps/StepClient'
import StepVehicle from './steps/StepVehicle'
import StepServices from './steps/StepServices'
import StepBooking from './steps/StepBooking'

export interface StepData {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isCompleted: boolean
  isActive: boolean
}

// Анимации
const stepVariants = {
  hidden: { opacity: 0, x: 100, scale: 0.95 },
  visible: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -100, scale: 0.95 }
}

// Компонент индикатора прогресса
const StepIndicator = ({ 
  steps, 
  currentStep 
}: { 
  steps: StepData[]
  currentStep: number 
}) => (
  <motion.div 
    className="mb-8"
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
  >
    <div className="flex items-center justify-between mb-6">
      {steps.map((step, index) => {
        const Icon = step.icon
        return (
          <div key={step.id} className="flex items-center">
            <motion.div
              className={cn(
                "flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-500 relative",
                step.isCompleted 
                  ? "bg-green-500 border-green-500 text-white shadow-lg shadow-green-500/25" 
                  : step.isActive 
                    ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20 shadow-lg" 
                    : "bg-background border-border text-muted-foreground hover:border-primary/50"
              )}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              layout
            >
              {step.isCompleted ? (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <Check className="w-5 h-5" />
                </motion.div>
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </motion.div>
            {index < steps.length - 1 && (
              <motion.div 
                className={cn(
                  "h-0.5 w-16 mx-4 transition-all duration-500",
                  step.isCompleted ? "bg-green-500" : "bg-border"
                )}
                layoutId={`connector-${index}`}
              />
            )}
          </div>
        )
      })}
    </div>
    
    <motion.div 
      className="mt-6 text-center"
      layout
    >
      <h2 className="text-3xl font-bold text-foreground mb-2">
        {steps[currentStep]?.title}
      </h2>
      <p className="text-muted-foreground text-lg">
        {steps[currentStep]?.description}
      </p>
    </motion.div>
  </motion.div>
)

export default function ModernWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [context, setContext] = useState<Partial<WizardContext>>({})

  const steps: StepData[] = [
    {
      id: 'client',
      title: 'Клиент',
      description: 'Выберите или создайте клиента',
      icon: User,
      isCompleted: !!context.client,
      isActive: currentStep === 0
    },
    {
      id: 'vehicle',
      title: 'Автомобиль',
      description: 'Выберите или добавьте автомобиль',
      icon: Car,
      isCompleted: !!context.vehicle,
      isActive: currentStep === 1
    },
    {
      id: 'services',
      title: 'Услуги',
      description: 'Выберите необходимые услуги',
      icon: Wrench,
      isCompleted: !!(context.services || []).length,
      isActive: currentStep === 2
    },
    {
      id: 'booking',
      title: 'Запись',
      description: 'Выберите время и подтвердите запись',
      icon: Calendar,
      isCompleted: !!context.slot,
      isActive: currentStep === 3
    }
  ]

  const handleNextAction = useCallback((patch?: Partial<WizardContext>) => {
    if (patch) {
      setContext(prev => ({ ...prev, ...patch }))
    }
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      console.log('Creating visit with context:', { ...context, ...patch })
    }
  }, [currentStep, steps.length, context])

  const handlePrevious = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }, [currentStep])

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <StepClient onNextAction={handleNextAction} context={context} />
      case 1:
        return <StepVehicle onNextAction={handleNextAction} context={context} />
      case 2:
        return <StepServices onNextAction={handleNextAction} context={context} />
      case 3:
        return <StepBooking context={context} onNextAction={handleNextAction} />
      default:
        return (
          <motion.div
            variants={stepVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center py-16"
          >
            <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur">
              <CardContent className="p-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-muted flex items-center justify-center">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Запись создана!</h3>
                <p className="text-muted-foreground">
                  Клиент успешно записан на обслуживание
                </p>
              </CardContent>
            </Card>
          </motion.div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5">
      <div className="container max-w-4xl mx-auto px-6 py-8">
        <StepIndicator steps={steps} currentStep={currentStep} />

        <AnimatePresence mode="wait">
          <div key={currentStep}>
            {renderCurrentStep()}
          </div>
        </AnimatePresence>

        <AnimatePresence>
          {currentStep > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="flex justify-start mt-8"
            >
              <Button
                variant="outline"
                onClick={handlePrevious}
                className="bg-background/50 backdrop-blur border-2 hover:border-primary/50"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Назад
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}