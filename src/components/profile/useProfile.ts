import { bookmarkCount, contributorEarnings, contributorRating, currentReviews, downloadCount, ratingDistribution } from '@/domain/logic'
import { useStore } from '@/store'

export const PROFILE_TABS = ['overview', 'packs', 'ratings', 'earnings', 'revisions'] as const
export type ProfileTab = (typeof PROFILE_TABS)[number]

export function useProfile(id: string) {
  const { personaById, resources, reviews, persona, state, catalogue } = useStore()
  const profile = personaById(id)
  const own = resources.filter((resource) => resource.contributorId === id)
  const published = own.filter((resource) => resource.status === 'published')
  const isSelf = profile?.id === persona.id
  const packReviews = published
    .flatMap((resource) => currentReviews(resource, reviews).map((review) => ({ review, resource })))
    .sort((a, b) => b.review.updatedAt.localeCompare(a.review.updatedAt))
  const label = (personaId: string) => personaById(personaId)?.alias ?? 'A teacher'
  return {
    profile,
    isSelf,
    published,
    unpublished: own.filter((resource) => resource.status !== 'published'),
    showUnpublished: isSelf || persona.role === 'moderator',
    summary: contributorRating(id, resources, reviews),
    distribution: ratingDistribution(id, resources, reviews),
    packReviews,
    usedInClass: packReviews.filter(({ review }) => review.usedInClass).length,
    downloads: published.reduce((sum, resource) => sum + downloadCount(resource, state), 0),
    saves: published.reduce((sum, resource) => sum + bookmarkCount(resource, state), 0),
    earnings: contributorEarnings(id, resources, catalogue.seedSales, state, label),
    incoming: state.revisions.filter((revision) => own.some((resource) => resource.id === revision.resourceId)),
    outgoing: state.revisions.filter((revision) => revision.proposerId === id),
  }
}

export type ProfileModel = ReturnType<typeof useProfile>
