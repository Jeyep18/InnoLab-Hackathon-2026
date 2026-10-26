import { useSyncExternalStore } from 'react'

// Hash routes keep the app a single static page: #/resource/r-matter, #/saved, ...
const REPLACED = 'cherit:route-replaced'

function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  window.addEventListener(REPLACED, callback)
  return () => {
    window.removeEventListener('hashchange', callback)
    window.removeEventListener(REPLACED, callback)
  }
}

const getHash = () => window.location.hash.replace(/^#/, '') || '/'

export function useRoute(): { parts: string[]; params: URLSearchParams } {
  const hash = useSyncExternalStore(subscribe, getHash)
  const [path, query = ''] = hash.split('?')
  return { parts: path.split('/').filter(Boolean), params: new URLSearchParams(query) }
}

export function navigate(to: string) {
  window.location.hash = to
}

/** Updates the current route without adding a history entry, e.g. while typing a search. */
export function replaceRoute(to: string) {
  window.history.replaceState(window.history.state, '', `#${to}`)
  window.dispatchEvent(new Event(REPLACED))
}

/** Builds `/path?k=v`, leaving out empty values. */
export function withParams(path: string, params: Record<string, string | undefined>) {
  const query = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) query.set(k, v)
  const qs = query.toString()
  return qs ? `${path}?${qs}` : path
}
