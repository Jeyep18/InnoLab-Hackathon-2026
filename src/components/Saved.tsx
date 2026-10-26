import { Bookmark } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PackCard } from '@/components/site/PackCard'
import { Container, EmptyState } from '@/components/site/layout'
import { useStore } from '@/store'

export function Saved() {
  const { state, resources, persona } = useStore()
  const saved = state.bookmarks
    .filter((b) => b.personaId === state.personaId)
    .map((b) => resources.find((r) => r.id === b.resourceId))
    .filter((r) => r !== undefined)

  return (
    <Container className="pt-10">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Saved</h1>
      <p className="mt-2 mb-8 text-muted-foreground">Lesson packs saved by {persona.alias} in this browser.</p>
      {saved.length === 0 ? (
        <EmptyState
          icon={<Bookmark />}
          title="Nothing saved yet"
          actions={
            <Button asChild>
              <a href="#/browse">Browse lesson packs</a>
            </Button>
          }
        >
          Tap the bookmark on any lesson pack to keep it here for later.
        </EmptyState>
      ) : (
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {saved.map((r) => (
            <li key={r.id} className="flex flex-col gap-2">
              {r.status !== 'published' && (
                <p className="rounded-lg bg-destructive/10 px-3 py-1.5 text-sm text-destructive">This pack is on hold and hidden from search.</p>
              )}
              <PackCard resource={r} className="flex-1" />
            </li>
          ))}
        </ul>
      )}
    </Container>
  )
}
