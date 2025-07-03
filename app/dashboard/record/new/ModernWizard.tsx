// app/dashboard/record/new/ModernWizard.tsx
'use client'

import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft, User, Car, Wrench, Calendar, Phone, Search, Loader2, Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useClientSearch, useServices, useSlots, useMechanics } from '@/hooks/use-api'
import { useVisitMutations } from '@/contexts/visits-context'
import { type Client, type Vehicle, type Service } from '@/lib/api'

// Типы для мастера
interface WizardContext {
  client?: Client & { vehicles?: Vehicle[] }
  vehicle?: Vehicle
  services?: Service[]
  slot?: {
    start: string
    end: string
    mechanicId: string
    mechanicName: string
  }
}

interface StepData {
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
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
    
    <Progress 
      value={(currentStep / (steps.length - 1)) * 100} 
      className="h-2 bg-secondary shadow-inner"
    />
    
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

// Шаг 1: Поиск/создание клиента
const StepClient = ({ 
  onNext, 
  context 
}: { 
  onNext: (data: Partial<WizardContext>) => void
  context: WizardContext 
}) => {
  const { searchTerm, setSearchTerm, searchResults, loading } = useClientSearch()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' })

  const handleSelectClient = useCallback(async (client: Client) => {
    // Загружаем автомобили клиента
    try {
      const response = await fetch(`/api/vehicles?clientId=${client._id}`)
      const vehicles = response.ok ? await response.json() : []
      onNext({ client: { ...client, vehicles } })
    } catch (error) {
      console.error('Failed to load vehicles:', error)
      onNext({ client })
    }
  }, [onNext])

  const handleCreateClient = useCallback(async () => {
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient)
      })
      
      if (response.ok) {
        const client = await response.json()
        onNext({ client: { ...client, vehicles: [] } })
      }
    } catch (error) {
      console.error('Failed to create client:', error)
    }
  }, [newClient, onNext])

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
              <User className="w-6 h-6 text-primary" />
            </div>
            Поиск клиента
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input
              placeholder="Поиск по имени или телефону..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 text-lg border-2 border-border focus:border-primary transition-all duration-200"
            />
          </div>

          <AnimatePresence mode="wait">
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-8"
              >
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <span className="ml-3 text-muted-foreground">Поиск...</span>
              </motion.div>
            )}

            {!loading && searchResults.length > 0 && (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-3"
              >
                <p className="text-sm text-muted-foreground">Найденные клиенты:</p>
                {searchResults.map((client) => (
                  <motion.div
                    key={client._id}
                    variants={itemVariants}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card 
                      className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
                      onClick={() => handleSelectClient(client)}
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                            {client.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{client.name}</h3>
                          <p className="text-muted-foreground flex items-center gap-2">
                            <Phone className="w-4 h-4" />
                            {client.phone}
                          </p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </motion.div>
            )}

            {!loading && searchTerm && searchResults.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <User className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground mb-4">Клиент не найден</p>
                <Button 
                  onClick={() => setShowCreateForm(true)}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Создать нового клиента
                </Button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showCreateForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Новый клиент</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
                <div className="space-y-4">
                  <Input
                    placeholder="Имя клиента"
                    value={newClient.name}
                    onChange={(e) => setNewClient(prev => ({ ...prev, name: e.target.value }))}
                    className="h-12"
                  />
                  <Input
                    placeholder="Телефон"
                    value={newClient.phone}
                    onChange={(e) => setNewClient(prev => ({ ...prev, phone: e.target.value }))}
                    className="h-12"
                  />
                  <Input
                    placeholder="Email (необязательно)"
                    value={newClient.email}
                    onChange={(e) => setNewClient(prev => ({ ...prev, email: e.target.value }))}
                    className="h-12"
                  />
                  <Button 
                    onClick={handleCreateClient}
                    disabled={!newClient.name || !newClient.phone}
                    className="w-full h-12 bg-primary hover:bg-primary/90"
                  >
                    Создать и продолжить
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Шаг 2: Выбор автомобиля
const StepVehicle = ({ 
  onNext, 
  context 
}: { 
  onNext: (data: Partial<WizardContext>) => void
  context: WizardContext 
}) => {
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

  const handleSelectVehicle = (vehicle: Vehicle) => {
    onNext({ vehicle })
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
        onNext({ vehicle })
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
            Автомобиль клиента
          </CardTitle>
          <p className="text-muted-foreground">
            Клиент: <span className="font-semibold text-foreground">{client?.name}</span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {vehicles.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3"
            >
              <p className="text-sm text-muted-foreground">Автомобили клиента:</p>
              {vehicles.map((vehicle) => (
                <motion.div
                  key={vehicle._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card 
                    className="p-4 cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-primary/50"
                    onClick={() => handleSelectVehicle(vehicle)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Car className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {vehicle.make} {vehicle.model}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          {vehicle.year && <span>{vehicle.year} г.</span>}
                          {vehicle.licensePlate && (
                            <Badge variant="outline" className="text-xs">
                              {vehicle.licensePlate}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          )}

          <Separator />

          <div className="text-center">
            <Button 
              onClick={() => setShowAddForm(true)}
              variant="outline"
              className="border-2 border-dashed border-primary/50 hover:border-primary"
            >
              <Plus className="w-4 h-4 mr-2" />
              Добавить новый автомобиль
            </Button>
          </div>

          <AnimatePresence>
            {showAddForm && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="border-t pt-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Новый автомобиль</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
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
                  <Input
                    placeholder="Год"
                    type="number"
                    value={newVehicle.year}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, year: parseInt(e.target.value) || new Date().getFullYear() }))}
                    className="h-12"
                  />
                  <Input
                    placeholder="Гос. номер"
                    value={newVehicle.licensePlate}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, licensePlate: e.target.value }))}
                    className="h-12"
                  />
                  <Input
                    placeholder="VIN (необязательно)"
                    value={newVehicle.vin}
                    onChange={(e) => setNewVehicle(prev => ({ ...prev, vin: e.target.value }))}
                    className="h-12 col-span-2"
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

// Шаг 3: Выбор услуг
const StepServices = ({ 
  onNext, 
  context 
}: { 
  onNext: (data: Partial<WizardContext>) => void
  context: WizardContext 
}) => {
  const { data: services = [], loading } = useServices()
  const [selectedServices, setSelectedServices] = useState<Service[]>([])

  const toggleService = (service: Service) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s._id === service._id)
      if (exists) {
        return prev.filter(s => s._id !== service._id)
      } else {
        return [...prev, service]
      }
    })
  }

  const totalPrice = selectedServices.reduce((sum, service) => sum + service.price, 0)
  const totalDuration = selectedServices.reduce((sum, service) => sum + service.durationMinutes, 0)

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
            Выбор услуг
          </CardTitle>
          <p className="text-muted-foreground">
            Автомобиль: <span className="font-semibold text-foreground">
              {context.vehicle?.make} {context.vehicle?.model}
            </span>
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {(services || []).map((service) => {
              const isSelected = selectedServices.find(s => s._id === service._id)
              return (
                <motion.div
                  key={service._id}
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Card
                    className={cn(
                      "p-4 cursor-pointer transition-all duration-200 border-2 relative",
                      isSelected
                        ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50 hover:shadow-md"
                    )}
                    onClick={() => toggleService(service)}
                  >
                    {service.isPopular && (
                      <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs">
                        Популярно
                      </Badge>
                    )}
                    <div className="space-y-3">
                      <h3 className="font-semibold text-lg">{service.title}</h3>
                      {service.description && (
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">
                          {service.durationMinutes} мин
                        </span>
                        <span className="font-bold text-lg text-primary">
                          {service.price.toLocaleString()}₽
                        </span>
                      </div>
                    </div>
                    {isSelected && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="absolute top-2 left-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center"
                      >
                        <Check className="w-4 h-4 text-primary-foreground" />
                      </motion.div>
                    )}
                  </Card>
                </motion.div>
              )
            })}
          </motion.div>

          {selectedServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
            >
              <div className="flex justify-between items-center mb-4">
                <span className="text-lg font-semibold">Выбранные услуги:</span>
                <div className="text-right">
                  <div className="text-2xl font-bold text-primary">
                    {totalPrice.toLocaleString()}₽
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {Math.floor(totalDuration / 60)}ч {totalDuration % 60}мин
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {selectedServices.map((service) => (
                  <div key={service._id} className="flex justify-between text-sm">
                    <span>{service.title}</span>
                    <span>{service.price.toLocaleString()}₽</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => onNext({ services: selectedServices })}
              disabled={selectedServices.length === 0}
              className="bg-primary hover:bg-primary/90 px-8 h-12"
            >
              Продолжить
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

// Шаг 4: Выбор времени и подтверждение
const StepBooking = ({ 
  context 
}: { 
  onNext: (data: Partial<WizardContext>) => void
  context: WizardContext 
}) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [selectedSlot, setSelectedSlot] = useState<{
    start: string
    end: string
    mechanicId: string
    mechanicName: string
  } | null>(null)
  const { createVisit, loading: creating } = useVisitMutations()
  
  const totalDuration = context.services?.reduce((sum, s) => sum + s.durationMinutes, 0) || 0
  const { data: slots = [], loading } = useSlots(selectedDate, totalDuration)
  const { data: mechanics = [] } = useMechanics()

  // Используем mechanics для отображения имен в слотах
  const getSlotWithMechanicName = (slot: any) => {
    const mechanic = mechanics.find(m => m._id === slot.mechanicId)
    return {
      ...slot,
      mechanicName: mechanic?.name || 'Механик'
    }
  }

  const handleCreateVisit = async () => {
    if (!context.client?._id || !context.vehicle?._id || !context.services || !selectedSlot) {
      return
    }

    try {
      const visitData = {
        clientId: context.client._id,
        vehicleId: context.vehicle._id,
        serviceIds: context.services.map(s => s._id!),
        mechanicId: selectedSlot.mechanicId,
        slotStart: selectedSlot.start,
        slotEnd: selectedSlot.end,
        status: 'scheduled' as const
      }

      await createVisit(visitData)
      // Можно добавить редирект или показать успех
      console.log('Visit created successfully!')
    } catch (error) {
      console.error('Failed to create visit:', error)
    }
  }

  const totalPrice = context.services?.reduce((sum, s) => sum + s.price, 0) || 0

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
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            Выбор времени
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Сводка заказа */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <h3 className="font-semibold mb-3">Сводка записи:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Клиент:</span>
                <span className="font-medium">{context.client?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Автомобиль:</span>
                <span className="font-medium">{context.vehicle?.make} {context.vehicle?.model}</span>
              </div>
              <div className="flex justify-between">
                <span>Услуг:</span>
                <span className="font-medium">{context.services?.length}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Итого:</span>
                <span>{totalPrice.toLocaleString()}₽</span>
              </div>
            </div>
          </div>

          {/* Выбор даты */}
          <div>
            <label className="block text-sm font-medium mb-2">Дата:</label>
            <Input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value)
                setSelectedSlot(null)
              }}
              min={new Date().toISOString().split('T')[0]}
              className="h-12"
            />
          </div>

          {/* Доступные слоты */}
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Загрузка слотов...</span>
            </div>
          ) : (slots || []).length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              На выбранную дату нет доступных слотов
            </div>
          ) : (
            <div className="space-y-4">
              <label className="block text-sm font-medium">Доступное время:</label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {(slots || []).map((slot, index) => {
                  const slotWithName = getSlotWithMechanicName(slot)
                  return (
                    <Button
                      key={index}
                      variant={selectedSlot === slotWithName ? "default" : "outline"}
                      onClick={() => setSelectedSlot(slotWithName)}
                      className="h-16 flex flex-col justify-center"
                    >
                      <div className="font-medium">
                        {new Date(slotWithName.start).toLocaleTimeString('ru', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {slotWithName.mechanicName}
                      </div>
                    </Button>
                  )
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={handleCreateVisit}
              disabled={!selectedSlot || creating}
              className="bg-primary hover:bg-primary/90 px-8 h-12"
            >
              {creating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Создание...
                </>
              ) : (
                <>
                  Подтвердить запись
                  <Check className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
export default function ModernBookingWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [context, setContext] = useState<WizardContext>({})

  const steps: StepData[] = [
    {
      id: 'client',
      title: 'Выбор клиента',
      description: 'Найдите существующего клиента или создайте нового',
      icon: User,
      isCompleted: !!context.client,
      isActive: currentStep === 0
    },
    {
      id: 'vehicle',
      title: 'Автомобиль',
      description: 'Выберите или добавьте автомобиль клиента',
      icon: Car,
      isCompleted: !!context.vehicle,
      isActive: currentStep === 1
    },
    {
      id: 'services',
      title: 'Услуги',
      description: 'Выберите необходимые услуги',
      icon: Wrench,
      isCompleted: !!context.services?.length,
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

  const handleNext = useCallback((data: Partial<WizardContext>) => {
    setContext(prev => ({ ...prev, ...data }))
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    } else {
      // Финальный шаг - создание визита
      console.log('Creating visit with context:', { ...context, ...data })
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
        return <StepClient onNext={handleNext} context={context} />
      case 1:
        return <StepVehicle onNext={handleNext} context={context} />
      case 2:
        return <StepServices onNext={handleNext} context={context} />
      case 3:
        return <StepBooking context={context} />
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