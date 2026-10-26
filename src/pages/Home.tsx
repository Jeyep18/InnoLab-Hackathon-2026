import { ArrowRight } from 'lucide-react'
import { LibraryIntro } from '@/components/home/LibraryIntro'
import { PackGrid } from '@/components/site/PackCard'
import { Container } from '@/components/site/layout'
import { withParams } from '@/router'
import { useHomeLibrary } from './useHomeLibrary'

export function Home() {
  const library = useHomeLibrary()
  return (
    <Container>
      <LibraryIntro library={library} />
      <div className="flex flex-col gap-14 pt-12 sm:gap-16">
        {library.topReviewed.length > 0 && (
          <section aria-labelledby="top-title">
            <SectionHead id="top-title" title="Top reviewed" href={withParams('/browse', { sort: 'top' })} />
            <PackGrid packs={library.topReviewed} />
          </section>
        )}
        <section aria-labelledby="recent-title">
          <SectionHead id="recent-title" title="Recently shared" href={withParams('/browse', { sort: 'new' })} />
          <PackGrid packs={library.recent} />
        </section>
        <section aria-labelledby="cta-title" className="flex flex-col items-start gap-4 border-t py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 id="cta-title" className="library-section-title text-2xl">Have a lesson that worked?</h2>
            <p className="mt-2 max-w-lg text-muted-foreground">Share your pack. Your name stays with the original and its adaptations.</p>
          </div>
          <a href="#/share" className="library-link inline-flex min-h-11 shrink-0 items-center gap-2">Share a lesson <ArrowRight aria-hidden="true" className="size-4" /></a>
        </section>
      </div>
    </Container>
  )
}

export function SectionHead({ id, title, href }: { id: string; title: string; href?: string }) {
  return (
    <div className="mb-5 flex items-baseline justify-between gap-4">
      <h2 id={id} className="library-section-title text-3xl">{title}</h2>
      {href && <a href={`#${href}`} className="library-link inline-flex min-h-10 items-center gap-2 text-sm">See all <ArrowRight aria-hidden="true" className="size-4" /></a>}
    </div>
  )
}
