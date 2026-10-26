import { ArrowRight, BadgeCheck, Download, Search, Upload } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { PackGrid } from '@/components/site/PackCard'
import { Container } from '@/components/site/layout'
import { resourceRating } from '@/domain/logic'
import { gradeRange, subjectTone, uniqueSorted } from '@/lib/pack'
import { cn } from '@/lib/utils'
import { navigate, withParams } from '@/router'
import { useStore } from '@/store'

const STEPS = [
  { icon: Search, title: 'Find your week', text: 'Search by grade, subject, competency or Budget of Work week.' },
  { icon: BadgeCheck, title: 'Check who made it', text: 'See the teacher, the reviews and the review status before you open a file.' },
  { icon: Download, title: 'Download and adapt', text: 'Get files you can edit. Share your version and the original credit stays on it.' },
]

export function Home() {
  const { resources, reviews } = useStore()
  const [query, setQuery] = useState('')
  const published = resources.filter((r) => r.status === 'published')
  const contributors = new Set(published.map((r) => r.contributorId)).size
  const grades = uniqueSorted(published.map((r) => r.grade))
  const subjects = uniqueSorted(published.map((r) => r.subject))

  // At least two reviews, so a single 5-star review can't top the list.
  const topReviewed = published
    .map((r) => ({ r, s: resourceRating(r, reviews) }))
    .filter(({ s }) => s.mean !== null && s.count >= 2)
    .sort((a, b) => b.s.mean! - a.s.mean! || b.s.count - a.s.count)
    .slice(0, 3)
    .map(({ r }) => r)
  const recent = [...published].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 3)

  const submit = (e: FormEvent) => {
    e.preventDefault()
    navigate(withParams('/browse', { q: query.trim() }))
  }

  return (
    <>
      <section aria-labelledby="hero-title" className="border-b bg-secondary/60">
        <Container className="py-16 text-center sm:py-20">
          <h1 id="hero-title" className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-[56px] lg:leading-[1.05]">
            Lesson packs shared by Bicol teachers
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-pretty text-muted-foreground">
            Find this week’s lesson, see who made it and how teachers rated it, then download it ready to edit.
          </p>
          <form role="search" onSubmit={submit} className="mx-auto mt-8 flex max-w-2xl items-center gap-2 rounded-2xl border bg-card p-2 pl-4 shadow-[0_1px_2px_rgb(51_44_39/0.05),0_12px_32px_-16px_rgb(51_44_39/0.25)] focus-within:ring-3 focus-within:ring-ring/40">
            <Search aria-hidden="true" className="size-5 shrink-0 text-muted-foreground" />
            <label htmlFor="home-search" className="sr-only">
              Search lesson packs
            </label>
            <input
              id="home-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Try “Mayon” or “palengke”"
              className="h-11 min-w-0 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            <Button type="submit" size="lg" className="h-11">
              Search
            </Button>
          </form>
          <ul aria-label="Quick filters" className="mx-auto mt-5 flex max-w-2xl flex-wrap justify-center gap-2">
            {grades.map((g) => (
              <li key={g}>
                <Chip href={withParams('/browse', { grade: g })}>{g}</Chip>
              </li>
            ))}
            {subjects.map((s) => (
              <li key={s}>
                <Chip href={withParams('/browse', { subject: s })}>{s}</Chip>
              </li>
            ))}
          </ul>
          <dl className="mt-8 flex flex-wrap justify-center gap-x-8 gap-y-2 text-sm text-muted-foreground">
            <Stat value={published.length} label={published.length === 1 ? 'lesson pack' : 'lesson packs'} />
            <Stat value={contributors} label={contributors === 1 ? 'teacher' : 'teachers'} />
            {gradeRange(published) && (
              <div>
                <dt className="sr-only">Grades</dt>
                <dd className="font-semibold text-foreground">{gradeRange(published)}</dd>
              </div>
            )}
          </dl>
        </Container>
      </section>

      <Container className="space-y-16 pt-14">
        <section aria-labelledby="subjects-title">
          <SectionHead id="subjects-title" title="Browse by subject" />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => {
              const packs = published.filter((r) => r.subject === s)
              return (
                <li key={s}>
                  <a
                    href={`#${withParams('/browse', { subject: s })}`}
                    className={cn(
                      'group relative isolate flex h-28 flex-col justify-end overflow-hidden rounded-2xl bg-linear-to-br p-5 text-white outline-none transition-transform duration-200 ease-out focus-visible:ring-3 focus-visible:ring-ring motion-safe:hover:-translate-y-0.5',
                      subjectTone(s),
                    )}
                  >
                    <span aria-hidden="true" className="absolute -top-10 -right-10 -z-10 size-36 rounded-full border-[20px] border-white/10" />
                    <span className="text-2xl font-bold tracking-tight">{s}</span>
                    <span className="text-sm opacity-90">
                      {packs.length} pack{packs.length === 1 ? '' : 's'} · {gradeRange(packs)}
                    </span>
                    <ArrowRight aria-hidden="true" className="absolute right-5 bottom-5 size-5 opacity-70 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </a>
                </li>
              )
            })}
          </ul>
        </section>

        {topReviewed.length > 0 && (
          <section aria-labelledby="top-title">
            <SectionHead id="top-title" title="Top reviewed" href={withParams('/browse', { sort: 'top' })} />
            <PackGrid packs={topReviewed} />
          </section>
        )}

        <section aria-labelledby="recent-title">
          <SectionHead id="recent-title" title="Recently shared" href={withParams('/browse', { sort: 'new' })} />
          <PackGrid packs={recent} />
        </section>

        <section aria-labelledby="how-title">
          <SectionHead id="how-title" title="How CherIt works" />
          <ol className="grid gap-4 md:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <li key={title} className="rounded-2xl bg-secondary/70 p-6">
                <div className="mb-4 flex items-center gap-3">
                  <span className="grid size-9 place-items-center rounded-full bg-primary text-sm font-bold text-primary-foreground">{i + 1}</span>
                  <Icon aria-hidden="true" className="size-5 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-1 text-muted-foreground">{text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="cta-title" className="flex flex-col items-start gap-6 rounded-3xl bg-foreground p-8 text-background sm:p-10 md:flex-row md:items-center">
          <div>
            <h2 id="cta-title" className="text-2xl font-bold tracking-tight">
              Have a lesson that worked?
            </h2>
            <p className="mt-1.5 max-w-lg opacity-75">Share it with Bicol teachers. Your name stays on it, and on every adaptation.</p>
          </div>
          <Button asChild size="lg" variant="secondary" className="md:ml-auto">
            <a href="#/share">
              <Upload /> Share a lesson
            </a>
          </Button>
        </section>
      </Container>
    </>
  )
}

function Chip({ href, children }: { href: string; children: string }) {
  return (
    <a
      href={`#${href}`}
      className="inline-flex h-9 items-center rounded-full border bg-card px-4 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {children}
    </a>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex gap-1.5">
      <dt className="sr-only">{label}</dt>
      <dd>
        <span className="font-semibold text-foreground tabular-nums">{value}</span> {label}
      </dd>
    </div>
  )
}

export function SectionHead({ id, title, href }: { id: string; title: string; href?: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 id={id} className="text-2xl font-bold tracking-tight">
        {title}
      </h2>
      {href && (
        <a href={`#${href}`} className="group inline-flex items-center gap-1 text-sm font-semibold text-mauve-ink hover:underline">
          See all <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-200 group-hover:translate-x-0.5" />
        </a>
      )}
    </div>
  )
}
