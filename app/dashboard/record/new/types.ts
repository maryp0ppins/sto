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
  brand: string
  model: string
  plate: string
  vin?: string
  year?: number
}

export type Service = {
  _id: string
  name: string
  price: number
  duration: number
}

export type TimeSlot = {
  start: string
  end: string
}

export type WizardContext = {
  client?: Client
  vehicle?: Vehicle
  services?: Service[]
  slot?: TimeSlot
}

export type Slot = {
  start: string
  end: string
  mechanicId: string
  mechanicName: string
}
