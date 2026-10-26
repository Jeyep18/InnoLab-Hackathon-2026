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
    <Container className="pt-10 sm:pt-14">
      <header className="mb-8 border-b border-foreground/20 pb-7">
        <h1 className="library-title text-4xl sm:text-5xl">Saved lesson packs</h1>
        <p className="mt-3 text-muted-foreground">{persona.alias}'s collection, saved in this browser.</p>
      </header>
      {saved.length === 0 ? (
        <EmptyState
          title="Nothing saved yet"
          actions={
            <Button asChild>
              <a href="#/browse">Browse lesson packs</a>
            </Button>
          }
        >
          Save a lesson pack with its bookmark button. It will appear here.
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
