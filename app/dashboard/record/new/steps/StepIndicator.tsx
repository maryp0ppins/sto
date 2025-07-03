// app/dashboard/record/new/components/StepIndicator.tsx
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface StepData {
  id: string
  title: string
  description: string
  icon: React.ComponentType<{ className?: string }>
  isCompleted: boolean
  isActive: boolean
}

interface StepIndicatorProps {
  steps: StepData[]
  currentStep: number
}

export default function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
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
}