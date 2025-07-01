// app/dashboard/record/new/ModernWizard.tsx
'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

// Типы для примера
type WizardContext = {
  client?: { name: string; phone: string }
  vehicle?: { make: string; model: string }
  services?: Array<{ title: string; price: number }>
  slot?: { start: string; mechanicName: string }
}

type StepData = {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  isCompleted: boolean
  isActive: boolean
}

const stepVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 }
}

const StepIndicator = ({ 
  steps, 
  currentStep 
}: { 
  steps: StepData[]
  currentStep: number 
}) => (
  <div className="mb-8">
    <div className="flex items-center justify-between mb-4">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <motion.div
            className={cn(
              "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-300",
              step.isCompleted 
                ? "bg-green-500 border-green-500 text-white" 
                : step.isActive 
                  ? "bg-primary border-primary text-primary-foreground ring-4 ring-primary/20" 
                  : "bg-background border-border text-muted-foreground"
            )}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {step.isCompleted ? (
              <Check className="w-5 h-5" />
            ) : (
              <span className="text-sm font-medium">{index + 1}</span>
            )}
          </motion.div>
          {index < steps.length - 1 && (
            <div 
              className={cn(
                "h-0.5 w-16 mx-2 transition-colors duration-300",
                step.isCompleted ? "bg-green-500" : "bg-border"
              )} 
            />
          )}
        </div>
      ))}
    </div>
    
    <Progress 
      value={(currentStep / (steps.length - 1)) * 100} 
      className="h-2 bg-secondary"
    />
    
    <div className="mt-4">
      <h2 className="text-2xl font-bold text-foreground">
        {steps[currentStep]?.title}
      </h2>
      <p className="text-muted-foreground mt-1">
        {steps[currentStep]?.description}
      </p>
    </div>
  </div>
)

const ModernStepClient = ({ 
  onNext, 
  context 
}: { 
  onNext: (data: Partial<WizardContext>) => void
  context: WizardContext 
}) => {
  const [phone, setPhone] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [foundClient, setFoundClient] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  const searchClient = async () => {
    setIsSearching(true)
    // Имитация поиска
    setTimeout(() => {
      const found = phone === '123' ? null : { name: 'Иван Иванов', phone }
      setFoundClient(found)
      setShowCreateForm(!found)
      setIsSearching(false)
    }, 1000)
  }

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            📞 Поиск клиента
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <motion.input
                className="flex-1 px-4 py-3 rounded-lg border border-border bg-background/50 focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all"
                placeholder="Введите номер телефона"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                whileFocus={{ scale: 1.02 }}
              />
              <Button 
                onClick={searchClient}
                disabled={!phone || isSearching}
                className="px-6 bg-primary hover:bg-primary/90"
              >
                {isSearching ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  />
                ) : (
                  'Поиск'
                )}
              </Button>
            </div>

            <AnimatePresence>
              {foundClient && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-4 rounded-lg bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Клиент найден!
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">
                        {foundClient.name} - {foundClient.phone}
                      </p>
                    </div>
                    <Button
                      onClick={() => onNext({ client: foundClient })}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Выбрать
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {showCreateForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800"
                >
                  <p className="font-medium text-blue-900 dark:text-blue-100">
                    Клиент не найден. Создать нового?
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      className="px-3 py-2 rounded-md border border-border bg-background"
                      placeholder="Имя клиента"
                    />
                    <input
                      className="px-3 py-2 rounded-md border border-border bg-background"
                      placeholder="Email"
                    />
                  </div>
                  <Button
                    onClick={() => onNext({ client: { name: 'Новый клиент', phone } })}
                    className="w-full bg-blue-600 hover:bg-blue-700"
                  >
                    Создать и продолжить
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

const ModernStepServices = ({ 
  onNext, 
  context 
}: { 
  onNext: (data: Partial<WizardContext>) => void
  context: WizardContext 
}) => {
  const [selectedServices, setSelectedServices] = useState<Array<{title: string, price: number, duration: number}>>([])
  
  const services = [
    { id: '1', title: 'Замена масла', price: 3000, duration: 60, popular: true },
    { id: '2', title: 'Диагностика', price: 2000, duration: 30, popular: true },
    { id: '3', title: 'Шиномонтаж', price: 1500, duration: 45, popular: false },
    { id: '4', title: 'Развал-схождение', price: 2500, duration: 90, popular: true },
    { id: '5', title: 'Замена тормозных колодок', price: 5000, duration: 120, popular: false },
    { id: '6', title: 'Кузовной ремонт', price: 15000, duration: 300, popular: false },
  ]

  const toggleService = (service: typeof services[0]) => {
    setSelectedServices(prev => {
      const exists = prev.find(s => s.title === service.title)
      if (exists) {
        return prev.filter(s => s.title !== service.title)
      } else {
        return [...prev, { title: service.title, price: service.price, duration: service.duration }]
      }
    })
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration, 0)

  return (
    <motion.div
      variants={stepVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      transition={{ duration: 0.3 }}
      className="space-y-4"
    >
      <Card className="border-0 shadow-xl bg-gradient-to-br from-card to-card/80 backdrop-blur">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🔧 Выбор услуг
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {services.map((service) => {
              const isSelected = selectedServices.some(s => s.title === service.title)
              return (
                <motion.div
                  key={service.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={cn(
                    "p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 relative overflow-hidden",
                    isSelected 
                      ? "border-primary bg-primary/10 shadow-lg ring-2 ring-primary/20" 
                      : "border-border bg-card hover:border-primary/50 hover:shadow-md"
                  )}
                  onClick={() => toggleService(service)}
                >
                  {service.popular && (
                    <Badge className="absolute top-2 right-2 bg-orange-500 text-white text-xs">
                      Популярно
                    </Badge>
                  )}
                  <div className="space-y-2">
                    <h3 className="font-medium">{service.title}</h3>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{service.duration} мин</span>
                      <span className="font-medium text-foreground">{service.price}₽</span>
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
                </motion.div>
              )
            })}
          </div>

          {selectedServices.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Итого:</span>
                <span className="text-lg font-bold">{totalPrice}₽</span>
              </div>
              <div className="flex justify-between items-center text-sm text-muted-foreground">
                <span>Время выполнения:</span>
                <span>{Math.floor(totalDuration / 60)}ч {totalDuration % 60}мин</span>
              </div>
            </motion.div>
          )}

          <div className="flex justify-end mt-6">
            <Button
              onClick={() => onNext({ services: selectedServices })}
              disabled={selectedServices.length === 0}
              className="bg-primary hover:bg-primary/90"
            >
              Продолжить
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function ModernWizard() {
  const [currentStep, setCurrentStep] = useState(0)
  const [context, setContext] = useState<WizardContext>({})

  const steps: StepData[] = [
    {
      id: 'client',
      title: 'Поиск клиента',
      description: 'Найдите существующего клиента или создайте нового',
      icon: '👤',
      isCompleted: !!context.client,
      isActive: currentStep === 0
    },
    {
      id: 'vehicle',
      title: 'Выбор автомобиля',
      description: 'Выберите автомобиль клиента',
      icon: '🚗',
      isCompleted: !!context.vehicle,
      isActive: currentStep === 1
    },
    {
      id: 'services',
      title: 'Услуги',
      description: 'Выберите необходимые услуги',
      icon: '🔧',
      isCompleted: !!context.services,
      isActive: currentStep === 2
    },
    {
      id: 'slot',
      title: 'Время записи',
      description: 'Выберите доступное время',
      icon: '📅',
      isCompleted: !!context.slot,
      isActive: currentStep === 3
    }
  ]

  const handleNext = (data: Partial<WizardContext>) => {
    setContext(prev => ({ ...prev, ...data }))
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1)
    }
  }

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0:
        return <ModernStepClient onNext={handleNext} context={context} />
      case 2:
        return <ModernStepServices onNext={handleNext} context={context} />
      default:
        return (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Шаг в разработке...</p>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 p-6">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <StepIndicator steps={steps} currentStep={currentStep} />
        </motion.div>

        <AnimatePresence mode="wait">
          {renderCurrentStep()}
        </AnimatePresence>

        {currentStep > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start mt-6"
          >
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="bg-background/50 backdrop-blur"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Назад
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}