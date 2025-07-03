// hooks/use-api.ts
import { useState, useEffect, useCallback } from 'react'
import {
  clientsAPI,
  vehiclesAPI,
  servicesAPI,
  slotsAPI,
  mechanicsAPI,
  type Client,
  type Vehicle,
  type Service,
} from '@/lib/api'

// Экспортируем visits хуки из контекста
export { useVisits, useVisitMutations, VisitsProvider } from '@/contexts/visits-context'

// ============= GENERIC API HOOK =============

function useApiData<T>(
  key: string,
  fetcher: () => Promise<T>
) {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const result = await fetcher()
      setData(result)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }, [fetcher])

  useEffect(() => {
    fetchData()
  }, [key, fetchData])

  return { data, loading, error, refetch: fetchData }
}

// ============= EXPORT HOOKS =============

// Clients hooks
export function useClients() {
  const result = useApiData('clients', clientsAPI.getAll)
  return {
    ...result,
    data: result.data || []
  }
}

export function useClientByPhone(phone: string) {
  return useApiData(
    `client-phone-${phone}`,
    useCallback(() => clientsAPI.getByPhone(phone), [phone])
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
    `vehicles-client-${clientId}`,
    useCallback(() => vehiclesAPI.getByClient(clientId), [clientId])
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
  return useApiData('services', servicesAPI.getAll)
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

// Slots hooks
export function useSlots(date: string, duration: number) {
  return useApiData(
    `slots-${date}-${duration}`,
    useCallback(() => slotsAPI.getAvailable(date, duration), [date, duration])
  )
}

// Mechanics hooks
export function useMechanics() {
  return useApiData('mechanics', mechanicsAPI.getAll)
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