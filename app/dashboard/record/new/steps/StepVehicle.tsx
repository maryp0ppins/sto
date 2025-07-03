// app/dashboard/record/new/steps/StepVehicle.tsx
'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Car, Plus, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import type { StepProps } from '../StepProps'

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

export default function StepVehicle({ onNextAction, context }: StepProps) {
  const [showAddForm, setShowAddForm] = useState(false)
  const [newVehicle, setNewVehicle] = useState({ 
    make: '', 
    model: '', 
    year: new Date().getFullYear(), 
    licensePlate: '', 
    vin: '' 
  })

  const client = context.client
  const vehicles = client?.vehicles || []

  const handleSelectVehicle = (vehicle: StepProps['context']['vehicle']) => {
    if (vehicle) {
      onNextAction({ vehicle })
    }
  }

  const handleAddVehicle = async () => {
    if (!client?._id) return

    try {
      const response = await fetch('/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          clientId: client._id, 
          ...newVehicle 
        })
      })
      
      if (response.ok) {
        const vehicle = await response.json()
        const convertedVehicle = {
          _id: vehicle._id,
          make: vehicle.make,
          model: vehicle.model,
          year: vehicle.year,
          licensePlate: vehicle.licensePlate || '',
          vin: vehicle.vin
        }
        onNextAction({ vehicle: convertedVehicle })
      }
    } catch (error) {
      console.error('Failed to add vehicle:', error)
    }
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
              <Car className="w-6 h-6 text-primary" />
            </div>
            Выберите автомобиль
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {vehicles.length > 0 ? (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              {vehicles.map((vehicle) => (
                <motion.div
                  key={vehicle._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectVehicle(vehicle)}
                  className="p-4 border border-border rounded-lg hover:border-primary/50 hover:bg-accent/50 cursor-pointer transition-all duration-200"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Car className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <div className="font-medium">
                          {vehicle.make} {vehicle.model}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {vehicle.year} • {vehicle.licensePlate}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <Car className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <div className="text-muted-foreground mb-4">
                У клиента нет добавленных автомобилей
              </div>
            </motion.div>
          )}

          <Separator />

          <div className="flex justify-center">
            <Button
              onClick={() => setShowAddForm(!showAddForm)}
              variant="outline"
              className="bg-background/50 backdrop-blur"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить автомобиль
            </Button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="border-t border-border pt-6"
              >
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Марка"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, make: e.target.value }))}
                      className="h-12"
                    />
                    <Input
                      placeholder="Модель"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle(prev => ({ ...prev, model: e.target.value }))}
                      className="h-12"
                    />
                  </div>
                  <Input
                    type="number"
                    placeholder="Год"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="h-12"
                  />
                  <Input
                    placeholder="Государственный номер"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value }))}
                    className="h-12"
                  />
                  <Input
                    placeholder="VIN (необязательно)"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, vin: e.target.value }))}
                    className="h-12"
                  />
                </div>
                <Button 
                  onClick={handleAddVehicle}
                  disabled={!newVehicle.make || !newVehicle.model}
                  className="w-full h-12 mt-4 bg-primary hover:bg-primary/90"
                >
                  Добавить и продолжить
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}