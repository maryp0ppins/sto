// types.ts

export type Client = {
  _id?: string
  name: string
  phone: string
  email?: string
  vehicles?: Vehicle[]
}


export type Vehicle = {
  _id?: string
  make: string
  model: string
  licensePlate: string
  vin?: string
  year?: number
}

export type Service = {
  _id: string
  title: string
  price: number
  durationMinutes: number
}

export type TimeSlot = {
  start: string
  end: string
}

export type WizardContext = {
  client?: Client
  vehicle?: Vehicle
  services?: Service[]
   slot?: Slot
}

export type Slot = {
  start: string
  end: string
  mechanicId: string
  mechanicName: string
}
export type StepProps = {
  context: WizardContext
  onNextAction: (data: Partial<WizardContext>) => void
}

export type VisitStatus = 'scheduled' | 'in-progress' | 'done' | 'delivered'

export type Visit = {
  _id: string
  clientId: Client
  mechanicId: { _id: string; name: string }
  slotStart: string
  slotEnd: string
  status: VisitStatus
  serviceIds?: Service[]
  price?: number
}

export type VisitFormData = {
  clientId: string
  vehicleId: string
  serviceIds: string[]
  mechanicId: string
  slotStart: string
  slotEnd: string
  status: VisitStatus
}


export interface User {
  id: string
  name: string
  email: string
  role: 'admin' | 'mechanic'
}