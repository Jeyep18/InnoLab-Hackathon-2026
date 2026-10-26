import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HomeIntro({ searchSlot }: { searchSlot: ReactNode }) {
  return <>
    <aside className="flex flex-wrap items-center justify-between gap-3 rounded-[24px] bg-sage-50 px-6 py-3">
      <p className="text-base font-medium">Share your lessons and offer paid extras through your contributor profile</p>
      <Button render={<a href="#/share" />} nativeButton={false} variant="outline">Share a lesson <ArrowRight data-icon="inline-end" /></Button>
    </aside>
    <section aria-labelledby="home-title" className="py-10 text-center sm:py-14">
      <h1 id="home-title" className="mx-auto max-w-4xl text-5xl font-semibold leading-[1.02] tracking-[-.05em] sm:text-7xl">A head start on<br />your next lesson</h1>
      <p className="mx-auto mt-5 max-w-xl text-lg text-muted-foreground">Start with lesson plans, slides, and worksheets shared by Bicol teachers, then adapt them for your class.</p>
      {searchSlot}
    </section>
  </>
}
