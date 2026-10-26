import { Download, Star } from 'lucide-react'
import type { Resource } from '@/domain/types'
import { downloadCount, resourceRating } from '@/domain/logic'
import { useStore } from '@/store'
import { fileKinds, subjectTone } from '@/lib/pack'

export function DiscoveryCard({ pack, rank }: { pack: Resource; rank?: number }) {
  const { reviews, state, personaById } = useStore()
  const rating = resourceRating(pack, reviews)
  const downloads = downloadCount(pack, state)
  return <article>
    <a href={`#/resource/${pack.id}`} className={`discovery-cover ${subjectTone(pack.subject)}`}>
      <span className="discovery-cover-header"><span className="discovery-cover-meta">{pack.grade} · {pack.subject}</span>{rank !== undefined && <span className="discovery-cover-rank" aria-label={`Rank ${rank}`}>{rank.toString().padStart(2, '0')}</span>}</span>
      <span className="discovery-cover-title">{pack.title}</span>
      <span className="discovery-cover-files">{fileKinds(pack).join(' · ') || 'Lesson resource'}</span>
    </a>
    <div className="discovery-card-info">
      <p className="discovery-author">{personaById(pack.contributorId)?.alias ?? 'Contributor'}</p>
      <div className="discovery-stats">
        {rating.mean === null ? <span className="discovery-unrated">No reviews yet</span> : <span className="discovery-rating" aria-label={`Rated ${rating.mean.toFixed(1)} out of 5 from ${rating.count} reviews`}><Star aria-hidden="true" className="size-4 fill-star text-star" /><strong>{rating.mean.toFixed(1)}</strong><span className="text-muted-foreground">({rating.count})</span></span>}
        <span className="discovery-downloads" aria-label={`${downloads} downloads`} title={`${downloads} downloads`}><Download aria-hidden="true" className="size-4" /><strong>{downloads}</strong></span>
      </div>
    </div>
  </article>
}
