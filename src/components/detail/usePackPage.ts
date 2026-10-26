import { useEffect, useRef, useState } from 'react'
import type { Resource } from '@/domain/types'
import { useStore } from '@/store'
import { usePackDownloads } from './usePackDownloads'

export function usePackPage(resource: Resource) {
  const { resources, persona, personaById } = useStore()
  const [reporting, setReporting] = useState(false)
  const downloads = usePackDownloads(resource)
  const primaryRef = useRef<HTMLDivElement>(null)
  const endRef = useRef<HTMLDivElement>(null)
  const [primaryVisible, setPrimaryVisible] = useState(false)
  const [pastEnd, setPastEnd] = useState(false)

  // Hide the mobile bar while the main action or the page end is visible.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return
    const primary = new IntersectionObserver(([entry]) => setPrimaryVisible(entry.isIntersecting))
    const end = new IntersectionObserver(([entry]) => setPastEnd(entry.isIntersecting || entry.boundingClientRect.top < 0))
    if (primaryRef.current) primary.observe(primaryRef.current)
    if (endRef.current) end.observe(endRef.current)
    return () => {
      primary.disconnect()
      end.disconnect()
    }
  }, [])

  return {
    resource,
    downloads,
    primaryRef,
    endRef,
    reporting,
    setReporting,
    showBar: downloads.canDownload && !primaryVisible && !pastEnd,
    teacherActions: persona.role === 'teacher' && resource.status === 'published',
    canReport: resource.contributorId !== persona.id,
    adaptations: resources.filter((r) => r.parent?.resourceId === resource.id && r.status === 'published'),
    personaById,
  }
}

export type PackPageModel = ReturnType<typeof usePackPage>
