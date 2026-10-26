import { SearchX, Search, X } from 'lucide-react'
import { useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PackGrid } from '@/components/site/PackCard'
import { Container, EmptyState } from '@/components/site/layout'
import { competencyKey, downloadCount, filterResources, resourceRating, type Filters } from '@/domain/logic'
import { uniqueSorted } from '@/lib/pack'
import { replaceRoute, useRoute, withParams } from '@/router'
import { useStore } from '@/store'

const ANY = 'any'
const SORTS = { relevance: 'Best match', top: 'Top reviewed', new: 'Newest', downloads: 'Most downloaded' } as const
type Sort = keyof typeof SORTS

export function Browse() {
  const { resources, reviews, state } = useStore()
  const { params } = useRoute()
  const filters: Filters = {
    query: params.get('q') ?? '',
    grade: params.get('grade') ?? '',
    subject: params.get('subject') ?? '',
    competency: params.get('competency') ?? '',
  }
  const sort: Sort = (params.get('sort') as Sort) in SORTS ? (params.get('sort') as Sort) : 'relevance'

  // Filters live in the URL so Back, reload and copied links keep them.
  const update = (patch: Partial<Filters & { sort: string }>) => {
    const next = { q: filters.query, grade: filters.grade, subject: filters.subject, competency: filters.competency, sort, ...patch }
    if ('query' in patch) next.q = patch.query ?? ''
    replaceRoute(withParams('/browse', { q: next.q, grade: next.grade, subject: next.subject, competency: next.competency, sort: next.sort === 'relevance' ? '' : next.sort }))
  }

  const published = resources.filter((r) => r.status === 'published')
  const grades = uniqueSorted(published.map((r) => r.grade))
  const subjects = uniqueSorted(published.filter((r) => !filters.grade || r.grade === filters.grade).map((r) => r.subject))
  const competencies = useMemo(() => {
    const seen = new Map<string, string>()
    for (const r of published) {
      if (filters.grade && r.grade !== filters.grade) continue
      if (filters.subject && r.subject !== filters.subject) continue
      if (competencyKey(r)) seen.set(competencyKey(r), r.competency.text || r.competency.code)
    }
    return [...seen].sort(([a], [b]) => a.localeCompare(b))
  }, [published, filters.grade, filters.subject])

  const results = useMemo(() => {
    const found = filterResources(resources, filters)
    const rating = (id: string) => resourceRating(found.find((r) => r.id === id)!, reviews)
    if (sort === 'top')
      return [...found].sort((a, b) => (rating(b.id).mean ?? -1) - (rating(a.id).mean ?? -1) || rating(b.id).count - rating(a.id).count)
    if (sort === 'new') return [...found].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    if (sort === 'downloads') return [...found].sort((a, b) => downloadCount(b, state) - downloadCount(a, state))
    return found
  }, [resources, reviews, state, filters.query, filters.grade, filters.subject, filters.competency, sort])

  const chips = [
    filters.query && { key: 'query', label: `“${filters.query}”`, clear: { query: '' } },
    filters.grade && { key: 'grade', label: filters.grade, clear: { grade: '', subject: '', competency: '' } },
    filters.subject && { key: 'subject', label: filters.subject, clear: { subject: '', competency: '' } },
    filters.competency && {
      key: 'competency',
      label: competencies.find(([k]) => k === filters.competency)?.[1] ?? filters.competency,
      clear: { competency: '' },
    },
  ].filter(Boolean) as { key: string; label: string; clear: Partial<Filters> }[]

  return (
    <Container className="pt-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Browse lesson packs</h1>
        <p className="mt-2 text-muted-foreground">Every pack shows who made it and how teachers rated it, before you download.</p>
      </div>

      <section aria-label="Search and filters" className="sticky top-16 z-30 -mx-4 border-b bg-background/90 px-4 py-4 backdrop-blur-md sm:mx-0 sm:rounded-2xl sm:border sm:bg-card/90 sm:p-4">
        <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
          <div className="relative">
            <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-muted-foreground" />
            <label htmlFor="browse-search" className="sr-only">
              Search by topic, place or material
            </label>
            <input
              id="browse-search"
              type="search"
              value={filters.query}
              onChange={(e) => update({ query: e.target.value })}
              placeholder="Search a topic, place or material"
              className="h-10 w-full rounded-lg border border-input bg-card pr-3 pl-10 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30"
            />
          </div>
          <FilterSelect label="Grade" value={filters.grade} options={grades.map((g) => [g, g])} onChange={(grade) => update({ grade, subject: '', competency: '' })} />
          <FilterSelect label="Subject" value={filters.subject} options={subjects.map((s) => [s, s])} onChange={(subject) => update({ subject, competency: '' })} />
          <FilterSelect label="Competency" value={filters.competency} options={competencies} onChange={(competency) => update({ competency })} />
        </div>
      </section>

      <div className="mt-6 mb-5 flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold tabular-nums" aria-live="polite">
          {results.length} lesson pack{results.length === 1 ? '' : 's'}
        </h2>
        {chips.length > 0 && (
          <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <li key={c.key}>
                <button
                  type="button"
                  onClick={() => update(c.clear)}
                  aria-label={`Remove filter ${c.label}`}
                  className="inline-flex h-8 max-w-64 items-center gap-1.5 rounded-full bg-secondary pr-2 pl-3 text-sm font-medium transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  <span className="truncate">{c.label}</span>
                  <X aria-hidden="true" className="size-3.5 shrink-0" />
                </button>
              </li>
            ))}
            <li>
              <Button variant="link" size="sm" onClick={() => replaceRoute('/browse')}>
                Clear all
              </Button>
            </li>
          </ul>
        )}
        <div className="ml-auto flex items-center gap-2">
          <span id="sort-label" className="text-sm text-muted-foreground">
            Sort
          </span>
          <Select value={sort} onValueChange={(v) => update({ sort: v })}>
            <SelectTrigger aria-labelledby="sort-label" className="min-w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent align="end">
              {Object.entries(SORTS).map(([k, v]) => (
                <SelectItem key={k} value={k}>
                  {v}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {results.length === 0 ? (
        <EmptyState
          icon={<SearchX />}
          title="No lesson packs match"
          actions={
            <>
              <Button onClick={() => replaceRoute('/browse')}>Clear filters</Button>
              <Button variant="outline" asChild>
                <a href="#/share">Share a lesson</a>
              </Button>
            </>
          }
        >
          Try another keyword or widen the grade, subject or competency. You can also share a pack for this topic.
        </EmptyState>
      ) : (
        <PackGrid packs={results} />
      )}

      <p className="mt-8 text-sm text-muted-foreground">Competencies and Budget of Work weeks in the sample packs are examples, not official DepEd alignment.</p>
    </Container>
  )
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: string
  options: [string, string][]
  onChange: (value: string) => void
}) {
  return (
    <Select value={value || ANY} onValueChange={(v) => onChange(v === ANY ? '' : v)}>
      <SelectTrigger aria-label={label} className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ANY}>Any {label.toLowerCase()}</SelectItem>
        {options.map(([v, text]) => (
          <SelectItem key={v} value={v} className="max-w-[min(32rem,90vw)]">
            <span className="truncate">{text}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
