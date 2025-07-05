// lib/api.ts
import { toast } from '@/hooks/use-toast'

const API_BASE = '/api'

// Generic API utility
async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  try {
    const response = await fetch(`${API_BASE}${url}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    // Handle empty responses (like DELETE)
    if (response.status === 204) {
      return null as T
    }

    return await response.json()
  } catch (error) {
    console.error('API call failed:', error)
    toast({
      title: 'Ошибка',
      description: 'Произошла ошибка при выполнении запроса',
      variant: 'destructive',
    })
    throw error
  }
}

// Types
export interface Client {
  _id?: string
  name: string
  phone: string
  email?: string
  vehicles?: Vehicle[]
  totalVisits?: number
  totalSpent?: number
  rating?: number
  status?: 'new' | 'regular' | 'vip'
  registrationDate?: string
  lastVisit?: string
}

export interface Vehicle {
  _id?: string
  make: string
  model: string
  year?: number
  licensePlate?: string
  vin?: string
}

export interface Service {
  _id?: string
  title: string
  description?: string
  durationMinutes: number
  price: number
  category?: 'maintenance' | 'repair' | 'diagnostic' | 'cosmetic'
  isPopular?: boolean
  isActive?: boolean
  difficulty?: 'easy' | 'medium' | 'hard'
  requiredTools?: string[]
  createdAt?: string
  updatedAt?: string
}

export interface Visit {
  _id?: string
  clientId: Client | string
  vehicleId: string
  serviceIds: Service[] | string[]
  mechanicId: { _id: string; name: string } | string
  slotStart: string
  slotEnd: string
  status: 'scheduled' | 'in-progress' | 'done' | 'delivered'
  createdAt?: string
  updatedAt?: string
  price?: number
}

export interface Slot {
  start: string
  end: string
  mechanicId: string
  mechanicName: string
}

export interface Mechanic {
  _id: string
  name: string
  email: string
}

// Clients API
export const clientsAPI = {
  // Get all clients or search by phone
  getAll: (phone?: string): Promise<Client[] | null> =>
    apiCall(phone ? `/clients?phone=${encodeURIComponent(phone)}` : '/clients'),

  // Get single client by phone
  getByPhone: async (phone: string): Promise<Client | null> => {
    const response = await apiCall<Client | null>(`/clients?phone=${encodeURIComponent(phone)}`)
    return response
  },

  // Create new client
  create: (data: Omit<Client, '_id'>): Promise<Client> =>
    apiCall('/clients', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update client
  update: (id: string, data: Partial<Client>): Promise<Client> =>
    apiCall('/clients', {
      method: 'PUT',
      body: JSON.stringify({ _id: id, ...data }),
    }),

  // Delete client
  delete: (id: string): Promise<void> =>
    apiCall(`/clients?id=${id}`, { method: 'DELETE' }),
}

// Vehicles API
export const vehiclesAPI = {
  // Get vehicles for client
  getByClient: (clientId: string): Promise<Vehicle[]> =>
    apiCall(`/clients/${clientId}/vehicles`),

  // Add vehicle to client
  addToClient: (clientId: string, vehicle: Omit<Vehicle, '_id'>): Promise<Vehicle> =>
    apiCall(`/clients/${clientId}/vehicles`, {
      method: 'POST',
      body: JSON.stringify(vehicle),
    }),

  // Remove vehicle from client
  remove: (clientId: string, vehicleId: string): Promise<void> =>
    apiCall('/vehicles', {
      method: 'DELETE',
      body: JSON.stringify({ clientId, vehicleId }),
    }),
}

// Services API
export const servicesAPI = {
  // Get all services
  getAll: (): Promise<Service[]> => apiCall('/services'),

  // Create service
  create: (data: Omit<Service, '_id'>): Promise<Service> =>
    apiCall('/services', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update service
  update: (id: string, data: Partial<Service>): Promise<Service> =>
    apiCall('/services', {
      method: 'PUT',
      body: JSON.stringify({ id, ...data }),
    }),

  // Delete service
  delete: (id: string): Promise<void> =>
    apiCall(`/services?id=${id}`, { method: 'DELETE' }),
}

// Visits API - ОБНОВЛЕННАЯ версия
export const visitsAPI = {
  // Get all visits with filters
  getAll: (filters?: {
    mechanicId?: string
    status?: string
    from?: string
    to?: string
  }): Promise<Visit[]> => {
    const params = new URLSearchParams()
    if (filters?.mechanicId) params.append('mechanicId', filters.mechanicId)
    if (filters?.status) params.append('status', filters.status)
    if (filters?.from) params.append('from', filters.from)
    if (filters?.to) params.append('to', filters.to)
    
    const queryString = params.toString()
    return apiCall(`/visits${queryString ? `?${queryString}` : ''}`)
  },

  // НОВАЯ функция: Get single visit by ID
  getById: (id: string): Promise<Visit> =>
    apiCall(`/visits/${id}`),

  // Create visit
  create: (data: Omit<Visit, '_id'>): Promise<Visit> =>
    apiCall('/visits', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Update visit - ОБНОВЛЕННАЯ для поддержки PUT на /visits/[id]
  update: (id: string, data: Partial<Visit>): Promise<Visit> =>
    apiCall(`/visits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Delete visit
  delete: (id: string): Promise<void> =>
    apiCall(`/visits?id=${id}`, { method: 'DELETE' }),
}

// Slots API
export const slotsAPI = {
  // Get available slots for date and duration
  getAvailable: (date: string, duration: number): Promise<Slot[]> =>
    apiCall(`/slots?date=${date}&duration=${duration}`),
}

// Mechanics API
export const mechanicsAPI = {
  // Get all mechanics
  getAll: (): Promise<Mechanic[]> => apiCall('/mechanics'),
}