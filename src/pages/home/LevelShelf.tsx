import type { Resource } from '@/domain/types'
import { Button } from '@/components/ui/button'
import { Reveal } from '@/components/site/Reveal'
import { schoolLevel } from '../useHomeFilters'
import { DiscoveryCard } from './DiscoveryCard'

const LEVELS = [
  { value: 'Preschool', label: 'Preschool' },
  { value: 'Elementary', label: 'Elementary' },
  { value: 'High school', label: 'Junior high' },
  { value: 'Senior high school', label: 'Senior high' },
] as const

export function LevelShelf({ popular, level, expanded, onLevel, onAll, intro = false }: { intro?: boolean; popular: Resource[]; level: string; expanded: boolean; onLevel: (level: string) => void; onAll: () => void }) {
  const collection = level ? popular.filter(pack => schoolLevel(pack.grade) === level) : popular
  const label = LEVELS.find(item => item.value === level)?.label.toLowerCase()
  return <div>
    <Reveal className="level-tabs" aria-label="Explore a school level" intro={intro} delay={intro ? 240 : 0}>
      <Button variant={!level ? 'default' : 'ghost'} aria-pressed={!level} onClick={() => onLevel('')}>All levels</Button>
      {LEVELS.map(item => <Button key={item.value} variant={level === item.value ? 'default' : 'ghost'} aria-pressed={level === item.value} onClick={() => onLevel(item.value)}>{item.label}</Button>)}
    </Reveal>
    <section className="level-shelf" aria-label={`${level || 'All levels'} collection`}>
      <Reveal className="discovery-section-heading" intro={intro} delay={intro ? 300 : 0}><h2>{level ? `Popular in ${label}` : 'Popular in the library'}</h2></Reveal>
      {collection.length ? <>
        {/* Cards follow the heading once; cards added later by level tabs or "View all" appear instantly. */}
        <Reveal as="ul" stagger intro={intro} delay={intro ? 360 : 80} className={expanded ? 'grid gap-5 sm:grid-cols-2 lg:grid-cols-3' : 'discovery-track'} tabIndex={expanded ? undefined : 0} aria-label="Popular packs">
          {collection.slice(0, expanded ? collection.length : 4).map((pack, index) => <li key={pack.id}><DiscoveryCard pack={pack} rank={index + 1} /></li>)}
        </Reveal>
        {!expanded && collection.length > 4 && <Button variant="link" className="mt-2 px-0" onClick={onAll}>View all in this collection ↗</Button>}
      </> : <div className="level-empty"><p>No {label} packs yet.</p><Button variant="link" onClick={() => onLevel('Elementary')}>Explore Elementary</Button></div>}
    </section>
  </div>
}
