import { Button } from '@/components/ui/button'
import { Container, EmptyState } from '@/components/site/layout'
import type { Resource } from '@/domain/types'
import { useStore } from '@/store'
import { PackPageView } from './detail/PackPageView'
import { usePackPage } from './detail/usePackPage'

export function ResourceDetail({ id }: { id: string }) {
  const { resources, persona } = useStore()
  const resource = resources.find((r) => r.id === id)

  if (!resource) {
    return (
      <Container className="pt-16">
        <EmptyState title="This lesson pack isn’t here" actions={<BrowseButton />}>
          <p>It may have been removed by a demo reset.</p>
        </EmptyState>
      </Container>
    )
  }

  const canSee = resource.status === 'published' || resource.contributorId === persona.id || persona.role === 'moderator'
  if (!canSee) {
    return (
      <Container className="pt-16">
        <EmptyState title="This lesson pack isn’t published" actions={<BrowseButton />}>
          <p>It’s waiting for review or on hold. Switch to the demo moderator persona to see it.</p>
        </EmptyState>
      </Container>
    )
  }

  return <PackPage resource={resource} />
}

function BrowseButton() {
  return <Button render={<a href="#/browse" />} nativeButton={false}>Browse lesson packs</Button>
}

function PackPage({ resource }: { resource: Resource }) {
  const model = usePackPage(resource)
  return <PackPageView model={model} />
}
