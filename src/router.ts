import { useSyncExternalStore } from 'react'

// Hash routes keep the app a single static page: #/resource/r-matter, #/saved, ...
function subscribe(callback: () => void) {
  window.addEventListener('hashchange', callback)
  return () => window.removeEventListener('hashchange', callback)
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
