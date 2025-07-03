// hooks/use-api.ts
import React, { useState, useEffect, useCallback, createContext, useContext, useReducer, useMemo } from 'react'
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

// ============= VISITS CONTEXT =============

interface VisitsFilters {
  mechanicId?: string
  status?: string
  from?: string
  to?: string
}

interface VisitsState {
  visits: Visit[]
  loading: boolean
  error: string | null
  lastFetch: number
  currentFilters: VisitsFilters
}

type VisitsAction = 
  | { type: 'FETCH_START'; filters: VisitsFilters }
  | { type: 'FETCH_SUCCESS'; visits: Visit[] }
  | { type: 'FETCH_ERROR'; error: string }
  | { type: 'UPDATE_VISIT'; id: string; data: Partial<Visit> }
  | { type: 'DELETE_VISIT'; id: string }
  | { type: 'CLEAR_CACHE' }

const initialState: VisitsState = {
  visits: [],
  loading: false,
  error: null,
  lastFetch: 0,
  currentFilters: {}
}

function visitsReducer(state: VisitsState, action: VisitsAction): VisitsState {
  switch (action.type) {
    case 'FETCH_START':
      return {
        ...state,
        loading: true,
        error: null,
        currentFilters: action.filters
      }
    case 'FETCH_SUCCESS':
      return {
        ...state,
        visits: action.visits,
        loading: false,
        lastFetch: Date.now()
      }
    case 'FETCH_ERROR':
      return {
        ...state,
        loading: false,
        error: action.error
      }
    case 'UPDATE_VISIT':
      return {
        ...state,
        visits: state.visits.map(visit =>
          visit._id === action.id ? { ...visit, ...action.data } : visit
        )
      }
    case 'DELETE_VISIT':
      return {
        ...state,
        visits: state.visits.filter(visit => visit._id !== action.id)
      }
    case 'CLEAR_CACHE':
      return initialState
    default:
      return state
  }
}

interface VisitsContextType {
  state: VisitsState
  fetchVisits: (filters?: VisitsFilters) => Promise<void>
  updateVisit: (id: string, data: Partial<Visit>) => Promise<void>
  deleteVisit: (id: string) => Promise<void>
  clearCache: () => void
}

const VisitsContext = createContext<VisitsContextType | undefined>(undefined)

const CACHE_DURATION = 30000 // 30 секунд

export function VisitsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(visitsReducer, initialState)

  const fetchVisits = useCallback(async (filters: VisitsFilters = {}) => {
    const now = Date.now()
    const filtersKey = JSON.stringify(filters)
    const currentFiltersKey = JSON.stringify(state.currentFilters)
    
    // Проверяем, нужно ли делать запрос
    const filtersChanged = filtersKey !== currentFiltersKey
    const cacheExpired = now - state.lastFetch > CACHE_DURATION
    const hasData = state.visits.length > 0

    if (!filtersChanged && !cacheExpired && hasData && !state.loading) {
      return // Не делаем запрос, данные актуальные
    }

    dispatch({ type: 'FETCH_START', filters })

    try {
      const visits = await visitsAPI.getAll(filters)
      dispatch({ type: 'FETCH_SUCCESS', visits: visits || [] })
    } catch (error) {
      dispatch({ 
        type: 'FETCH_ERROR', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      })
    }
  }, [state.currentFilters, state.lastFetch, state.visits.length, state.loading])

  const updateVisit = useCallback(async (id: string, data: Partial<Visit>) => {
    try {
      const updatedVisit = await visitsAPI.update(id, data)
      dispatch({ type: 'UPDATE_VISIT', id, data: updatedVisit })
    } catch (error) {
      dispatch({ 
        type: 'FETCH_ERROR', 
        error: error instanceof Error ? error.message : 'Update failed' 
      })
      throw error
    }
  }, [])

  const deleteVisit = useCallback(async (id: string) => {
    try {
      await visitsAPI.delete(id)
      dispatch({ type: 'DELETE_VISIT', id })
    } catch (error) {
      dispatch({ 
        type: 'FETCH_ERROR', 
        error: error instanceof Error ? error.message : 'Delete failed' 
      })
      throw error
    }
  }, [])

  const clearCache = useCallback(() => {
    dispatch({ type: 'CLEAR_CACHE' })
  }, [])

  const contextValue: VisitsContextType = {
    state,
    fetchVisits,
    updateVisit,
    deleteVisit,
    clearCache
  }

  return (
    <VisitsContext.Provider value={contextValue}>
      {children}
    </VisitsContext.Provider>
  )
}

function useVisitsContext() {
  const context = useContext(VisitsContext)
  if (context === undefined) {
    throw new Error('useVisitsContext must be used within a VisitsProvider')
  }
  return context
}

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

// Visits hooks - используют глобальный контекст
export function useVisits(filters?: VisitsFilters) {
  const { state, fetchVisits } = useVisitsContext()

  // Мемоизируем фильтры для стабильности
  const stableFilters = useMemo(() => filters, [
    filters?.mechanicId,
    filters?.status, 
    filters?.from,
    filters?.to
  ])

  useEffect(() => {
    fetchVisits(stableFilters)
  }, [fetchVisits, stableFilters])

  return {
    data: state.visits,
    loading: state.loading,
    error: state.error,
    refetch: () => fetchVisits(stableFilters)
  }
}

export function useVisitMutations() {
  const { updateVisit, deleteVisit } = useVisitsContext()
  const [loading, setLoading] = useState(false)

  const handleUpdate = async (id: string, data: Partial<Visit>) => {
    setLoading(true)
    try {
      await updateVisit(id, data)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    setLoading(true)
    try {
      await deleteVisit(id)
    } finally {
      setLoading(false)
    }
  }

  return {
    updateVisit: handleUpdate,
    deleteVisit: handleDelete,
    loading
  }
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