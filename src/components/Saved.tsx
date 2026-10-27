import { FolderPlus } from 'lucide-react'
import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ProPlanDialog } from '@/components/site/ProPlanDialog'
import { PackCard } from '@/components/site/PackCard'
import { Container, EmptyState } from '@/components/site/layout'
import { useStore } from '@/store'

export function Saved() {
  const { state, resources, persona } = useStore()
  const [proOpen, setProOpen] = useState(false)
  const saved = state.bookmarks
    .filter((b) => b.personaId === state.personaId)
    .map((b) => resources.find((r) => r.id === b.resourceId))
    .filter((r) => r !== undefined)

  return (
    <Container className="pt-10 sm:pt-14">
      <header className="mb-8 border-b border-foreground/20 pb-7">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="library-title text-4xl sm:text-5xl">Saved lesson packs</h1>
            <p className="mt-3 text-muted-foreground">{persona.alias}’s collection, saved in this browser.</p>
          </div>
          <Button type="button" variant="outline" onClick={() => setProOpen(true)}>
            <FolderPlus aria-hidden="true" /> New folder
            <Badge variant="secondary" className="ml-0.5">Pro</Badge>
          </Button>
        </div>
      </header>
      <ProPlanDialog feature="organized-bookmarks" open={proOpen} onOpenChange={setProOpen} />
      {saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          actions={
            <Button render={<a href="#/browse" />} nativeButton={false}>Browse lesson packs</Button>
          }
        >
          Save a lesson pack with its bookmark button. It will appear here.
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((r) => (
            <li key={r.id} className="flex flex-col gap-2">
              {r.status !== 'published' && (
                <p className="rounded-lg bg-destructive/10 px-3 py-1.5 text-sm text-destructive">This pack was hidden after a report.</p>
              )}
              <PackCard resource={r} className="flex-1" />
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
