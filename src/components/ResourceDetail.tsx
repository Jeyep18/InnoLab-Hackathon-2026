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
          <p>It may have been removed.</p>
        </EmptyState>
      </Container>
    )
  }

  const canSee = resource.status === 'published' || resource.contributorId === persona.id || persona.role === 'moderator'
  if (!canSee) {
    return (
      <Container className="pt-16">
        <EmptyState title="This lesson pack is hidden" actions={<BrowseButton />}>
          <p>It was hidden after a report. Only the author and the verifier can see it until it’s restored.</p>
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
