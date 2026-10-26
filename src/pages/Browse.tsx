import { Search, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { PackGrid } from '@/components/site/PackCard'
import { Container, EmptyState } from '@/components/site/layout'
import { SORTS, useBrowse, type BrowseModel } from './useBrowse'

const ANY = 'any'

export function Browse() {
  const model = useBrowse()
  return (
    <Container className="pt-10 sm:pt-14">
      <header className="mb-8 max-w-2xl">
        <h1 className="library-title text-4xl sm:text-5xl">Browse lesson packs</h1>
        <p className="mt-3 text-muted-foreground">Find a topic for your class. Check the contributor and reviews before you download.</p>
      </header>
      <BrowseFilters model={model} />
      <ResultsBar model={model} />
      {model.results.length === 0 ? (
        <EmptyState title="No lesson packs match" actions={<Button onClick={model.clear}>Clear filters</Button>}>
          Try another keyword or widen the grade, subject or competency.
        </EmptyState>
      ) : <PackGrid packs={model.results} />}
      <p className="mt-8 max-w-2xl text-sm text-muted-foreground">Competencies and Budget of Work weeks in sample packs are examples, not official DepEd alignment.</p>
    </Container>
  )
}

function BrowseFilters({ model }: { model: BrowseModel }) {
  const { filters, update, grades, subjects, competencies } = model
  return (
    <section aria-label="Search and filters" className="border-y border-foreground/20 bg-background py-4 md:sticky md:top-16 md:z-30">
      <div className="grid gap-3 md:grid-cols-[minmax(0,1.6fr)_repeat(3,minmax(0,1fr))]">
        <div className="relative">
          <Search aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3 size-[18px] -translate-y-1/2 text-muted-foreground" />
          <label htmlFor="browse-search" className="sr-only">Search by topic, place or material</label>
          <input
            id="browse-search" type="search" value={filters.query}
            onChange={(event) => update({ query: event.target.value })}
            placeholder="Topic, place or material"
            className="h-10 w-full rounded-md border border-input bg-card pr-3 pl-10 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        </div>
        <FilterSelect label="Grade" value={filters.grade} options={grades.map((grade) => [grade, grade])} onChange={(grade) => update({ grade, subject: '', competency: '' })} />
        <FilterSelect label="Subject" value={filters.subject} options={subjects.map((subject) => [subject, subject])} onChange={(subject) => update({ subject, competency: '' })} />
        <FilterSelect label="Competency" value={filters.competency} options={competencies} onChange={(competency) => update({ competency })} />
      </div>
    </section>
  )
}

function ResultsBar({ model }: { model: BrowseModel }) {
  const { results, chips, sort, setSort, update, clear } = model
  return (
    <div className="mt-6 mb-5 flex flex-wrap items-center gap-3">
      <h2 className="text-base font-medium tabular-nums" aria-live="polite">
        {results.length} lesson pack{results.length === 1 ? '' : 's'}
      </h2>
      {chips.length > 0 && (
        <ul aria-label="Active filters" className="flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <li key={chip.key}>
              <button
                type="button" onClick={() => update(chip.clear)} aria-label={`Remove filter ${chip.label}`}
                className="inline-flex min-h-9 max-w-64 items-center gap-1.5 rounded-sm bg-secondary pr-2 pl-3 text-sm transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              >
                <span className="truncate">{chip.label}</span>
                <X aria-hidden="true" className="size-3.5 shrink-0" />
              </button>
            </li>
          ))}
          <li><Button variant="link" size="sm" onClick={clear}>Clear all</Button></li>
        </ul>
      )}
      <div className="ml-auto flex items-center gap-2">
        <span id="sort-label" className="text-sm text-muted-foreground">Sort</span>
        <Select items={Object.entries(SORTS).map(([value, label]) => ({ value, label }))} value={sort} onValueChange={(value) => { if (value) setSort(value) }}>
          <SelectTrigger aria-labelledby="sort-label" className="min-w-40"><SelectValue /></SelectTrigger>
          <SelectContent align="end"><SelectGroup>
            {Object.entries(SORTS).map(([key, label]) => <SelectItem key={key} value={key}>{label}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>
      </div>
    </div>
  )
}

function FilterSelect({ label, value, options, onChange }: {
  label: string; value: string; options: [string, string][]; onChange: (value: string) => void
}) {
  return (
    <Select items={[{ value: ANY, label: `Any ${label.toLowerCase()}` }, ...options.map(([value, label]) => ({ value, label }))]} value={value || ANY} onValueChange={(next) => onChange(!next || next === ANY ? '' : next)}>
      <SelectTrigger aria-label={label} className="w-full"><SelectValue /></SelectTrigger>
      <SelectContent><SelectGroup>
        <SelectItem value={ANY}>Any {label.toLowerCase()}</SelectItem>
        {options.map(([key, text]) => (
          <SelectItem key={key} value={key} className="max-w-[min(32rem,90vw)]"><span className="truncate">{text}</span></SelectItem>
        ))}
      </SelectGroup></SelectContent>
    </Select>
  )
}
