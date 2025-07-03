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
export { VisitsProvider, useVisitsContext }