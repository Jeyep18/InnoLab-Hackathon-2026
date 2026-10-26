import { useMemo } from 'react'
import { competencyKey, downloadCount, filterResources, resourceRating, type Filters } from '@/domain/logic'
import { uniqueSorted } from '@/lib/pack'
import { replaceRoute, useRoute, withParams } from '@/router'
import { useStore } from '@/store'

export const SORTS = { relevance: 'Best match', top: 'Top reviewed', new: 'Newest', downloads: 'Most downloaded' } as const
type Sort = keyof typeof SORTS
type FilterPatch = Partial<Filters & { sort: Sort }>
interface ActiveFilter { key: keyof Filters; label: string; clear: Partial<Filters> }

function isSort(value: string): value is Sort {
  return Object.hasOwn(SORTS, value)
}

export function useBrowse() {
  const { resources, reviews, state } = useStore()
  const { params } = useRoute()
  const filters: Filters = {
    query: params.get('q') ?? '',
    grade: params.get('grade') ?? '',
    subject: params.get('subject') ?? '',
    competency: params.get('competency') ?? '',
  }
  const requestedSort = params.get('sort') ?? ''
  const sort: Sort = isSort(requestedSort) ? requestedSort : 'relevance'

  // Keep filters in the URL for Back, reload and copied links.
  const update = (patch: FilterPatch) => {
    const next = { ...filters, sort, ...patch }
    replaceRoute(withParams('/browse', {
      q: next.query, grade: next.grade, subject: next.subject,
      competency: next.competency, sort: next.sort === 'relevance' ? '' : next.sort,
    }))
  }
  const published = useMemo(() => resources.filter((r) => r.status === 'published'), [resources])
  const grades = uniqueSorted(published.map((r) => r.grade))
  const subjects = uniqueSorted(published.filter((r) => !filters.grade || r.grade === filters.grade).map((r) => r.subject))
  const competencies = useMemo(() => {
    const seen = new Map<string, string>()
    for (const resource of published) {
      if (filters.grade && resource.grade !== filters.grade) continue
      if (filters.subject && resource.subject !== filters.subject) continue
      const key = competencyKey(resource)
      if (key) seen.set(key, resource.competency.text || resource.competency.code)
    }
    return [...seen].sort(([a], [b]) => a.localeCompare(b))
  }, [published, filters.grade, filters.subject])
  const results = useMemo(() => {
    const found = filterResources(resources, filters)
    if (sort === 'top') return [...found].sort((a, b) => {
      const left = resourceRating(a, reviews)
      const right = resourceRating(b, reviews)
      return (right.mean ?? -1) - (left.mean ?? -1) || right.count - left.count
    })
    if (sort === 'new') return [...found].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sort === 'downloads') return [...found].sort((a, b) => downloadCount(b, state) - downloadCount(a, state))
    return found
  }, [resources, reviews, state, filters.query, filters.grade, filters.subject, filters.competency, sort])

  const chips: ActiveFilter[] = []
  if (filters.query) chips.push({ key: 'query', label: `"${filters.query}"`, clear: { query: '' } })
  if (filters.grade) chips.push({ key: 'grade', label: filters.grade, clear: { grade: '', subject: '', competency: '' } })
  if (filters.subject) chips.push({ key: 'subject', label: filters.subject, clear: { subject: '', competency: '' } })
  if (filters.competency) chips.push({
    key: 'competency', label: competencies.find(([key]) => key === filters.competency)?.[1] ?? filters.competency,
    clear: { competency: '' },
  })

  return {
    filters, sort, grades, subjects, competencies, results, chips, update,
    setSort: (value: string) => { if (isSort(value)) update({ sort: value }) },
    clear: () => replaceRoute('/browse'),
  }
}

export type BrowseModel = ReturnType<typeof useBrowse>
