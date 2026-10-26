import { useCallback, useSyncExternalStore } from 'react'

export type Theme = 'light' | 'dark'
const KEY = 'cherit-theme'
const media = () => window.matchMedia('(prefers-color-scheme: dark)')

// index.html applies the theme before first paint; this keeps it in sync afterwards.
function subscribe(callback: () => void) {
  const observer = new MutationObserver(callback)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  const onSystem = () => {
    if (readSaved()) return
    document.documentElement.classList.toggle('dark', media().matches)
  }
  media().addEventListener('change', onSystem)
  return () => {
    observer.disconnect()
    media().removeEventListener('change', onSystem)
  }
}

function readSaved(): Theme | null {
  try {
    const saved = localStorage.getItem(KEY)
    return saved === 'dark' || saved === 'light' ? saved : null
  } catch {
    return null
  }
}

const getTheme = (): Theme => (document.documentElement.classList.contains('dark') ? 'dark' : 'light')

export function useTheme() {
  const theme = useSyncExternalStore(subscribe, getTheme, () => 'light' as Theme)
  const setTheme = useCallback((next: Theme) => {
    document.documentElement.classList.toggle('dark', next === 'dark')
    try {
      localStorage.setItem(KEY, next)
    } catch {
      // Storage unavailable: the choice lasts until reload.
    }
  }, [])
  return { theme, setTheme }
}
