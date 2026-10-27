import type { ReactNode } from 'react'
import { Reveal } from '@/components/site/Reveal'

/** `intro` plays a one-time wave on first load: heading leads, then subtext, then search. */
export function HomeIntro({ searchSlot, intro = false }: { searchSlot: ReactNode; intro?: boolean }) {
  return (
    <section aria-labelledby="home-title" className="py-10 text-center sm:py-14">
      <Reveal as="h1" intro={intro} id="home-title" className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-7xl">A head start on<br />your next lesson</Reveal>
      <Reveal as="p" intro={intro} delay={90} className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Start with lesson plans, slides, and worksheets shared by Bicol teachers, then adapt them for your class.</Reveal>
      <Reveal intro={intro} delay={180}>{searchSlot}</Reveal>
    </section>
  )
}
