import { emptyState, migrateState } from '../domain/logic'
import type { DemoState } from '../domain/types'

const KEY = 'cherit-demo-state'

export function loadState(defaultPersonaId: string): DemoState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return emptyState(defaultPersonaId)
    return migrateState(JSON.parse(raw), defaultPersonaId)
  } catch {
    return emptyState(defaultPersonaId)
  }
}

/** Returns false when the browser refuses to save (private mode, quota). */
export function saveState(state: DemoState): boolean {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
    return true
  } catch {
    return false
  }
}

export function clearState(): void {
  try {
    localStorage.removeItem(KEY)
  } catch {
    // Nothing saved, nothing to clear.
  }
}
