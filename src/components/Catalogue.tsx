import { useId, useMemo, useState } from 'react'
import { competencyKey, filterResources, NO_FILTERS, type Filters } from '../domain/logic'
import { useStore } from '../store'
import { ResourceCard } from './ResourceCard'
import { Empty } from './ui'

const unique = (values: string[]) => [...new Set(values)].sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))

export function Catalogue() {
  const { resources } = useStore()
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const ids = { grade: useId(), subject: useId(), competency: useId(), query: useId() }
  const published = resources.filter((r) => r.status === 'published')

  const grades = unique(published.map((r) => r.grade))
  const subjects = unique(published.filter((r) => !filters.grade || r.grade === filters.grade).map((r) => r.subject))
  const competencies = useMemo(() => {
    const seen = new Map<string, string>()
    for (const r of published) {
      if (filters.grade && r.grade !== filters.grade) continue
      if (filters.subject && r.subject !== filters.subject) continue
      seen.set(competencyKey(r), r.competency.text)
    }
    return [...seen].sort(([a], [b]) => a.localeCompare(b))
  }, [published, filters.grade, filters.subject])

  const results = filterResources(resources, filters)
  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }))
  const active = JSON.stringify(filters) !== JSON.stringify(NO_FILTERS)

  return (
    <div className="page">
      <section className="finder" aria-labelledby="finder-title">
        <h1 id="finder-title">What are you teaching this week?</h1>
        <div className="finder-sentence">
          <span>I’m preparing</span>
          <label className="visually-hidden" htmlFor={ids.grade}>
            Grade
          </label>
          <select id={ids.grade} value={filters.grade} onChange={(e) => set({ grade: e.target.value, subject: '', competency: '' })}>
            <option value="">any grade</option>
            {grades.map((g) => (
              <option key={g}>{g}</option>
            ))}
          </select>
          <label className="visually-hidden" htmlFor={ids.subject}>
            Subject
          </label>
          <select id={ids.subject} value={filters.subject} onChange={(e) => set({ subject: e.target.value, competency: '' })}>
            <option value="">any subject</option>
            {subjects.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <span>for</span>
          <label className="visually-hidden" htmlFor={ids.competency}>
            Competency
          </label>
          <select id={ids.competency} value={filters.competency} onChange={(e) => set({ competency: e.target.value })}>
            <option value="">any competency</option>
            {competencies.map(([code, text]) => (
              <option key={code} value={code}>
                {text}
              </option>
            ))}
          </select>
        </div>
        <div className="finder-search">
          <label htmlFor={ids.query}>Search by topic, place or material</label>
          <input
            id={ids.query}
            type="search"
            placeholder="e.g. Mayon, palengke, no projector"
            value={filters.query}
            onChange={(e) => set({ query: e.target.value })}
          />
        </div>
        <p className="finder-note">
          Competencies and Budget of Work weeks in the sample packs are examples, not official DepEd alignment.
        </p>
      </section>

      <section aria-labelledby="results-title">
        <div className="results-head">
          <h2 id="results-title" aria-live="polite">
            {results.length} lesson pack{results.length === 1 ? '' : 's'}
          </h2>
          {active && (
            <button className="button button-quiet" onClick={() => setFilters(NO_FILTERS)}>
              Clear filters
            </button>
          )}
        </div>
        {results.length === 0 ? (
          <Empty title="No lesson packs match">
            <p>Try another keyword or widen the grade, subject or competency. You can also share a pack for this topic.</p>
            <div className="actions">
              <button className="button" onClick={() => setFilters(NO_FILTERS)}>
                Clear filters
              </button>
              <a className="button button-quiet" href="#/share">
                Share a lesson
              </a>
            </div>
          </Empty>
        ) : (
          <div className="grid">
            {results.map((r) => (
              <ResourceCard key={r.id} resource={r} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
