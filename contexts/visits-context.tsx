// contexts/visits-context.tsx
'use client'

import React, { createContext, useContext, useReducer, useCallback, useMemo, useEffect, useState, useRef } from 'react'
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
  fetchVisitsSilently: (filters?: VisitsFilters) => Promise<void>
  updateVisit: (id: string, data: Partial<Visit>) => Promise<void>
  deleteVisit: (id: string) => Promise<void>
  clearCache: () => void
}

const VisitsContext = createContext<VisitsContextType | undefined>(undefined)

export function VisitsProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(visitsReducer, initialState)

  // Простой fetch для пользовательских действий (с лоадером)
  const fetchVisits = useCallback(async (filters: VisitsFilters = {}) => {
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
  }, [])

  // Тихое обновление для фоновых запросов (без лоадера)
  const fetchVisitsSilently = useCallback(async (filters: VisitsFilters = {}) => {
    try {
      const visits = await visitsAPI.getAll(filters)
      // Обновляем только данные, без лоадера
      dispatch({ type: 'FETCH_SUCCESS', visits: visits || [] })
    } catch (error) {
      // Тихо игнорируем ошибки фонового обновления
      console.debug('Background fetch failed:', error)
    }
  }, [])

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

  const contextValue: VisitsContextType = useMemo(() => ({
    state,
    fetchVisits,
    fetchVisitsSilently,
    updateVisit,
    deleteVisit,
    clearCache
  }), [state, fetchVisits, fetchVisitsSilently, updateVisit, deleteVisit, clearCache])

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

// Основной хук для использования визитов с умным обновлением
export function useVisits(filters?: VisitsFilters) {
  const { state, fetchVisits, fetchVisitsSilently } = useVisitsContext()
  const filtersRef = useRef<VisitsFilters | undefined>(undefined)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Только при изменении фильтров
  const filtersChanged = JSON.stringify(filtersRef.current) !== JSON.stringify(filters)
  
  useEffect(() => {
    if (!hasInitialized || filtersChanged) {
      filtersRef.current = filters
      fetchVisits(filters)
      setHasInitialized(true)
    }
  }, [fetchVisits, filtersChanged, hasInitialized, filters])

  // Автообновление каждые 2 минуты только для активной вкладки БЕЗ лоадера
  useEffect(() => {
    if (!hasInitialized) return

    const interval = setInterval(() => {
      // Обновляем только если вкладка активна, БЕЗ лоадера
      if (!document.hidden) {
        fetchVisitsSilently(filtersRef.current)
      }
    }, 120000) // 2 минуты

    return () => clearInterval(interval)
  }, [fetchVisitsSilently, hasInitialized])

  return {
    data: state.visits,
    loading: state.loading,
    error: state.error,
    refetch: () => fetchVisits(filters)
  }
}

// Хук для мутаций с оптимистичными обновлениями
export function useVisitMutations() {
  const { updateVisit, deleteVisit } = useVisitsContext()
  const [loading, setLoading] = useState(false)

  const handleUpdate = useCallback(async (id: string, data: Partial<Visit>) => {
    setLoading(true)
    try {
      await updateVisit(id, data)
      // Локальное обновление уже произошло в updateVisit через dispatch
    } finally {
      setLoading(false)
    }
  }, [updateVisit])

  const handleDelete = useCallback(async (id: string) => {
    setLoading(true)
    try {
      await deleteVisit(id)
      // Локальное удаление уже произошло в deleteVisit через dispatch
    } finally {
      setLoading(false)
    }
  }, [deleteVisit])

  const handleCreate = useCallback(async (data: Omit<Visit, '_id'>) => {
    setLoading(true)
    try {
      const result = await visitsAPI.create(data)
      // После создания можно принудительно обновить если нужно
      return result
    } catch (error) {
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    updateVisit: handleUpdate,
    deleteVisit: handleDelete,
    createVisit: handleCreate,
    loading
  }
}