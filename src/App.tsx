import { useEffect, useRef, useState } from 'react'
import { Catalogue } from './components/Catalogue'
import { Header } from './components/Header'
import { Moderation } from './components/Moderation'
import { Profile } from './components/Profile'
import { ResourceDetail } from './components/ResourceDetail'
import { Saved } from './components/Saved'
import { ShareForm } from './components/ShareForm'
import { Empty } from './components/ui'
import { loadCatalogue } from './data/loadCatalogue'
import type { Catalogue as CatalogueData } from './domain/types'
import { navigate, useRoute } from './router'
import { StoreProvider, useStore } from './store'

export default function App() {
  const [loaded, setLoaded] = useState<{ catalogue: CatalogueData; teacherPackCount: number } | null>(null)
  useEffect(() => {
    loadCatalogue().then(setLoaded)
  }, [])
  if (!loaded) return <p className="loading">Loading lesson packs…</p>
  return (
    <StoreProvider catalogue={loaded.catalogue}>
      <Shell teacherPackCount={loaded.teacherPackCount} />
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

  let content
  if (!page) content = <Catalogue />
  else if (page === 'resource' && id) content = <ResourceDetail id={id} />
  else if (page === 'profile' && id) content = <Profile id={id} />
  else if (page === 'saved') content = <Saved />
  else if (page === 'share') content = <ShareForm parentId={params.get('adapt') ?? undefined} />
  else if (page === 'moderation') content = <Moderation />
  else
    content = (
      <Empty title="This page doesn’t exist">
        <button className="button" onClick={() => navigate('/')}>
          Browse lesson packs
        </button>
      </Empty>
    )

  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <Header />
      <p className="disclosure">
        Demonstration prototype: sample accounts, reviews and activity counts; payments simulated.
        {teacherPackCount > 0 &&
          ` ${teacherPackCount} teacher pack${teacherPackCount === 1 ? '' : 's'} shown for this demonstration only, from this computer.`}
      </p>
      {saveFailed && (
        <p className="warning" role="alert">
          This browser isn’t saving demo changes. They will be lost on reload. Private browsing or full storage can cause this.
        </p>
      )}
      <main id="main" tabIndex={-1}>
        {content}
      </main>
      <div className="toast" role="status" aria-live="polite">
        {notice && <p>{notice}</p>}
      </div>
    </>
  )
}
