// app/dashboard/record/new/types.ts - обновляем типы

export interface Client {
  _id: string
  name: string
  phone: string
  email?: string
  vehicles?: Vehicle[]
}

export interface Vehicle {
  _id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin?: string
}

export interface Service {
  _id: string
  title: string
  price: number
  durationMinutes: number
}

export interface Mechanic {
  _id: string
  name: string
  role: string
}

export interface TimeSlot {
  date: string
  time: string
  mechanic: Mechanic | null
}

export interface WizardContext {
  client?: Client
  vehicle?: Vehicle
  services?: Service[]
  selectedSlot?: TimeSlot
  totalDuration?: number
  totalPrice?: number
}

// Тип Visit для wizard (совместимый с API)
export interface Visit {
  _id: string
  clientId: Client | string
  vehicleId?: string
  serviceIds: Service[] | string[]
  slotStart: string
  slotEnd: string
  mechanicId: Mechanic | string
  status: 'scheduled' | 'in-progress' | 'done' | 'delivered'
  totalPrice?: number
  duration?: number
  createdAt?: string
  updatedAt?: string
}

// Интерфейс для пропов шагов wizard
export interface WizardStepProps {
  context: WizardContext
  updateContext: (updates: Partial<WizardContext>) => void
  onNext?: () => void
  onPrev?: () => void
  onSubmit?: () => Promise<void>
  isSubmitting?: boolean
  editMode?: boolean
}