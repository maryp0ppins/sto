// hooks/use-api.ts
import { useState, useEffect, useCallback, useMemo } from 'react'
import {
  clientsAPI,
  vehiclesAPI,
  servicesAPI,
  visitsAPI,
  slotsAPI,
  mechanicsAPI,
  type Client,
  type Vehicle,
  type Service,
  type Visit,
} from '@/lib/api'

// Generic hook for API data fetching
function useApiData<T>(
  apiCall: () => Promise<T>,
  deps: unknown[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await apiCall()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiCall, ...deps])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, loading, error, refetch: fetchData }
}

// Clients hooks
export function useClients() {
  const result = useApiData(() => clientsAPI.getAll())
  return {
    ...result,
    data: result.data || [] // Всегда возвращаем массив, даже если API вернул null
  }
}

export function useClientByPhone(phone: string) {
  return useApiData(
    () => clientsAPI.getByPhone(phone),
    [phone]
  )
}

export function useClientMutations() {
  const [loading, setLoading] = useState(false)

  const createClient = async (data: Omit<Client, '_id'>) => {
    setLoading(true)
    try {
      const result = await clientsAPI.create(data)
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateClient = async (id: string, data: Partial<Client>) => {
    setLoading(true)
    try {
      const result = await clientsAPI.update(id, data)
      return result
    } finally {
      setLoading(false)
    }
  }

  const deleteClient = async (id: string) => {
    setLoading(true)
    try {
      await clientsAPI.delete(id)
    } finally {
      setLoading(false)
    }
  }

  return { createClient, updateClient, deleteClient, loading }
}

// Vehicles hooks
export function useVehiclesByClient(clientId: string) {
  return useApiData(
    () => vehiclesAPI.getByClient(clientId),
    [clientId]
  )
}

export function useVehicleMutations() {
  const [loading, setLoading] = useState(false)

  const addVehicle = async (clientId: string, vehicle: Omit<Vehicle, '_id'>) => {
    setLoading(true)
    try {
      const result = await vehiclesAPI.addToClient(clientId, vehicle)
      return result
    } finally {
      setLoading(false)
    }
  }

  const removeVehicle = async (clientId: string, vehicleId: string) => {
    setLoading(true)
    try {
      await vehiclesAPI.remove(clientId, vehicleId)
    } finally {
      setLoading(false)
    }
  }

  return { addVehicle, removeVehicle, loading }
}

// Services hooks
export function useServices() {
  return useApiData(() => servicesAPI.getAll())
}

export function useServiceMutations() {
  const [loading, setLoading] = useState(false)

  const createService = async (data: Omit<Service, '_id'>) => {
    setLoading(true)
    try {
      const result = await servicesAPI.create(data)
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateService = async (id: string, data: Partial<Service>) => {
    setLoading(true)
    try {
      const result = await servicesAPI.update(id, data)
      return result
    } finally {
      setLoading(false)
    }
  }

  const deleteService = async (id: string) => {
    setLoading(true)
    try {
      await servicesAPI.delete(id)
    } finally {
      setLoading(false)
    }
  }

  return { createService, updateService, deleteService, loading }
}

// Visits hooks
export function useVisits(filters?: {
  mechanicId?: string
  status?: string
  from?: string
  to?: string
}) {
  return useApiData(
    () => visitsAPI.getAll(filters),
    [filters?.mechanicId, filters?.status, filters?.from, filters?.to]
  )
}

export function useVisitMutations() {
  const [loading, setLoading] = useState(false)

  const createVisit = async (data: Omit<Visit, '_id'>) => {
    setLoading(true)
    try {
      const result = await visitsAPI.create(data)
      return result
    } finally {
      setLoading(false)
    }
  }

  const updateVisit = async (id: string, data: Partial<Visit>) => {
    setLoading(true)
    try {
      const result = await visitsAPI.update(id, data)
      return result
    } finally {
      setLoading(false)
    }
  }

  const deleteVisit = async (id: string) => {
    setLoading(true)
    try {
      await visitsAPI.delete(id)
    } finally {
      setLoading(false)
    }
  }

  return { createVisit, updateVisit, deleteVisit, loading }
}

// Slots hooks
export function useSlots(date: string, duration: number) {
  return useApiData(
    () => slotsAPI.getAvailable(date, duration),
    [date, duration]
  )
}

// Mechanics hooks
export function useMechanics() {
  return useApiData(() => mechanicsAPI.getAll())
}

// Custom hook for client search with real-time functionality
export function useClientSearch() {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const searchClients = useCallback(async (term: string) => {
    if (!term.trim()) {
      setSearchResults([])
      return
    }

    setLoading(true)
    setError(null)
    
    try {
      // If it looks like a phone number, search by phone
      if (/^\+?[\d\s\-\(\)]+$/.test(term)) {
        const client = await clientsAPI.getByPhone(term)
        setSearchResults(client ? [client] : [])
      } else {
        // Otherwise search all clients and filter on frontend
        const allClients = await clientsAPI.getAll()
        const filtered = (allClients || []).filter(client =>
          client.name.toLowerCase().includes(term.toLowerCase()) ||
          client.phone.includes(term) ||
          client.email?.toLowerCase().includes(term.toLowerCase())
        )
        setSearchResults(filtered)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      searchClients(searchTerm)
    }, 300)

    return () => clearTimeout(debounceTimer)
  }, [searchTerm, searchClients])

  return {
    searchTerm,
    setSearchTerm,
    searchResults,
    loading,
    error,
    searchClients,
  }
}