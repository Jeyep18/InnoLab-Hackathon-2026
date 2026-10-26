import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { Moderation } from './components/Moderation'
import { Profile } from './components/Profile'
import { ResourceDetail } from './components/ResourceDetail'
import { Saved } from './components/Saved'
import { ShareForm } from './components/ShareForm'
import { Container, EmptyState } from './components/site/layout'
import { SiteFooter } from './components/site/SiteFooter'
import { SiteHeader } from './components/site/SiteHeader'
import { Button } from './components/ui/button'
import { Toaster } from './components/ui/sonner'
import { TooltipProvider } from './components/ui/tooltip'
import { loadCatalogue } from './data/loadCatalogue'
import type { Catalogue as CatalogueData } from './domain/types'
import { Browse } from './pages/Browse'
import { Home } from './pages/Home'
import { useRoute } from './router'
import { StoreProvider, useStore } from './store'

export default function App() {
  const [loaded, setLoaded] = useState<{ catalogue: CatalogueData; teacherPackCount: number } | null>(null)
  useEffect(() => {
    loadCatalogue().then(setLoaded)
  }, [])
  if (!loaded)
    return (
      <p role="status" className="grid min-h-dvh place-items-center text-muted-foreground">
        Loading lesson packs…
      </p>
    )
  return (
    <StoreProvider catalogue={loaded.catalogue}>
      <TooltipProvider delay={400}>
        <Shell teacherPackCount={loaded.teacherPackCount} />
      </TooltipProvider>
    </StoreProvider>
  )
}

function Shell({ teacherPackCount }: { teacherPackCount: number }) {
  const { parts, params } = useRoute()
  const { notice, saveFailed } = useStore()
  const [page, id] = parts
  const routeKey = parts.join('/')
  const firstRender = useRef(true)

  // Each route is a new page: start at the top and move keyboard focus to the content.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    window.scrollTo(0, 0)
    document.getElementById('main')?.focus({ preventScroll: true })
  }, [routeKey])

  useEffect(() => {
    if (notice) toast(notice)
  }, [notice])

  let content
  if (!page) content = <Home />
  else if (page === 'browse') content = <Browse />
  else if (page === 'resource' && id) content = <ResourceDetail key={id} id={id} />
  else if (page === 'profile' && id) content = <Profile id={id} />
  else if (page === 'saved') content = <Saved />
  else if (page === 'share') content = <ShareForm key={params.get('adapt') ?? 'new'} parentId={params.get('adapt') ?? undefined} />
  else if (page === 'moderation') content = <Moderation />
  else
    content = (
      <Container className="pt-16">
        <EmptyState
          title="This page doesn’t exist"
          actions={
            <Button render={<a href="#/browse" />} nativeButton={false}>Browse lesson packs</Button>
          }
        />
      </Container>
    )

  return (
    <div className={page === 'share' || page === 'moderation' ? 'flex min-h-dvh flex-col' : 'library-shell flex min-h-dvh flex-col'}>
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Skip to content
      </a>
      <SiteHeader />
      {saveFailed && (
        <p role="alert" className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-center text-sm text-destructive">
          This browser isn’t saving demo changes. They will be lost on reload. Private browsing or full storage can cause this.
        </p>
      )}
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {content}
      </main>
      <SiteFooter teacherPackCount={teacherPackCount} library={page !== 'share' && page !== 'moderation'} />
      <Toaster position="bottom-center" />
    </div>
  )
}
