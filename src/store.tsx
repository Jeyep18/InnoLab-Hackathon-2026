import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { allResources, allReviews, emptyState, reduce, type Action } from './domain/logic'
import type { Catalogue, DemoState, Persona, Resource, Review } from './domain/types'
import { clearFiles } from './storage/fileStore'
import { clearState, loadState, saveState } from './storage/persist'

export const DEFAULT_PERSONA = 'p-joy'

interface Store {
  catalogue: Catalogue
  state: DemoState
  persona: Persona
  resources: Resource[]
  reviews: Review[]
  personaById: (id: string) => Persona | undefined
  /** Applies an action. Rule violations throw DemoRuleError for the caller to show. */
  dispatch: (action: Action) => void
  saveFailed: boolean
  notice: string
  notify: (message: string) => void
  resetDemo: () => Promise<void>
}

const StoreContext = createContext<Store | null>(null)

export function StoreProvider({ catalogue, children }: { catalogue: Catalogue; children: ReactNode }) {
  const [state, rawDispatch] = useReducer(reduce, DEFAULT_PERSONA, loadState)
  const [saveFailed, setSaveFailed] = useState(false)
  const [notice, setNotice] = useState('')
  const stateRef = useRef(state)
  stateRef.current = state

  useEffect(() => setSaveFailed(!saveState(state)), [state])

  const dispatch = useCallback((action: Action) => {
    // Run the reducer once up front so rule errors surface synchronously to the caller.
    reduce(stateRef.current, action)
    rawDispatch(action)
  }, [])

  const notify = useCallback((message: string) => {
    // Clear first so repeating the same message is announced again.
    setNotice('')
    requestAnimationFrame(() => setNotice(message))
  }, [])

  const resetDemo = useCallback(async () => {
    clearState()
    try {
      await clearFiles()
    } catch {
      // Storage unavailable: nothing was saved there.
    }
    rawDispatch({ type: 'replace', state: emptyState(DEFAULT_PERSONA) })
  }, [])

  const value = useMemo<Store>(() => {
    const personaById = (id: string) => catalogue.personas.find((p) => p.id === id)
    const persona = personaById(state.personaId) ?? catalogue.personas[0]
    return {
      catalogue,
      state,
      persona,
      resources: allResources(catalogue, state),
      reviews: allReviews(catalogue, state),
      personaById,
      dispatch,
      saveFailed,
      notice,
      notify,
      resetDemo,
    }
  }, [catalogue, state, dispatch, saveFailed, notice, notify, resetDemo])

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore(): Store {
  const store = useContext(StoreContext)
  if (!store) throw new Error('useStore must be used inside StoreProvider')
  return store
}
