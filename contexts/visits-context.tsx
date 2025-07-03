// contexts/visits-context.tsx
'use client'

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect } from 'react'
import { visitsAPI, type Visit } from '@/lib/api'

export interface VisitsFilters {
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

export function useVisitsContext() {
  const context = useContext(VisitsContext)
  if (context === undefined) {
    throw new Error('useVisitsContext must be used within a VisitsProvider')
  }
  return context
}

// Основной хук для использования визитов
export function useVisits(filters?: VisitsFilters) {
  const { state, fetchVisits } = useVisitsContext()

  // Мемоизируем фильтры для стабильности
  const stableFilters = useMemo(() => filters, [
    filters,
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

// Хук для мутаций
export function useVisitMutations() {
  const { updateVisit, deleteVisit } = useVisitsContext()
  const [loading, setLoading] = React.useState(false)

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