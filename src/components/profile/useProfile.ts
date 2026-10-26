import { contributorRating, currentReviews } from '@/domain/logic'
import { useStore } from '@/store'

export function useProfile(id: string) {
  const { personaById, resources, reviews, persona } = useStore()
  const profile = personaById(id)
  const own = resources.filter((resource) => resource.contributorId === id)
  const published = own.filter((resource) => resource.status === 'published')
  return {
    profile,
    published,
    unpublished: own.filter((resource) => resource.status !== 'published'),
    showUnpublished: profile?.id === persona.id || persona.role === 'moderator',
    summary: contributorRating(id, resources, reviews),
    hasSampleReviews: published.some((resource) => currentReviews(resource, reviews).some((review) => review.seeded)),
  }
}
