import { ArrowUpRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { gradeRange } from '@/lib/pack'
import type { HomeLibrary } from '@/pages/useHomeLibrary'
import { withParams } from '@/router'

export function LibraryIntro({ library }: { library: HomeLibrary }) {
  const { query, setQuery, submit, grades, subjects, published } = library
  return (
    <section aria-labelledby="hero-title" className="grid gap-7 border-b py-10 sm:gap-10 sm:py-16 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-20">
      <div>
        <p className="library-kicker">A lesson library for Bicol teachers · Pronounced “share it”</p>
        <h1 id="hero-title" className="library-title mt-5 max-w-2xl text-[44px] text-balance sm:text-6xl lg:text-7xl">
          This week’s lesson,<br className="hidden sm:block" /> already started.
        </h1>
        <p className="mt-5 max-w-lg text-lg text-pretty text-muted-foreground">
          Find a lesson pack, check the contributor and reviews, then make it your own.
        </p>
        <form role="search" onSubmit={submit} className="mt-8 flex max-w-xl gap-2">
          <label htmlFor="home-search" className="sr-only">Search lesson packs</label>
          <Input id="home-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Try Mayon, fractions or palengke" className="h-12" />
          <Button type="submit" size="lg">Search</Button>
        </form>
        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          <span className="text-muted-foreground">Or choose a grade</span>
          {grades.map((grade) => (
            <a key={grade} href={`#${withParams('/browse', { grade })}`} className="library-link inline-flex min-h-10 items-center">{grade}</a>
          ))}
        </div>
      </div>
      <nav aria-labelledby="subjects-title" className="self-end">
        <h2 id="subjects-title" className="library-kicker pb-3">Browse by subject</h2>
        <ul className="flex flex-wrap gap-x-5 border-t border-foreground/25 pt-1 lg:block lg:pt-0">
          {subjects.map((subject) => {
            const packs = published.filter((resource) => resource.subject === subject)
            return (
              <li key={subject} className="lg:border-b">
                <a href={`#${withParams('/browse', { subject })}`} className="library-subject-link flex min-h-11 items-center justify-between gap-4 py-2 lg:py-4">
                  <span>
                    <span className="block font-medium lg:text-lg">{subject}</span>
                    <span className="mt-0.5 hidden text-sm text-muted-foreground lg:block">{packs.length} pack{packs.length === 1 ? '' : 's'} · {gradeRange(packs)}</span>
                  </span>
                  <ArrowUpRight aria-hidden="true" className="hidden size-4 shrink-0 text-muted-foreground lg:block" />
                </a>
              </li>
            )
          })}
        </ul>
      </nav>
    </section>
  )
}
