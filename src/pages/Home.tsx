import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PackGrid } from '@/components/site/PackCard'
import { Container, EmptyState } from '@/components/site/layout'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { downloadCount } from '@/domain/logic'
import { useStore } from '@/store'
import { HomeIntro } from './HomeIntro'
import { LevelShelf } from './home/LevelShelf'
import { SearchDialog } from './home/SearchDialog'
import { useHomeFilters, HOME_SORTS, type HomeFilterModel } from './useHomeFilters'
import './home/home.css'

let introPlayed = false

/** True only for the first Home visit of a page load, so the hero intro never replays on return trips. */
function useHomeIntro() {
  const [intro, setIntro] = useState(() => !introPlayed)
  useEffect(() => {
    introPlayed = true
  }, [])
  return [intro, () => setIntro(false)] as const
}

export function Home() {
  const { resources, state } = useStore()
  const model = useHomeFilters(resources)
  const [level, setLevel] = useState('')
  const [expanded, setExpanded] = useState(false)
  const [resultsMode, setResultsMode] = useState(model.hasSearch)
  const packs = resources.filter(pack => pack.status === 'published')
  const popular = useMemo(() => [...packs].sort((a, b) => downloadCount(b, state) - downloadCount(a, state)), [packs, state])
  const [intro, endIntro] = useHomeIntro()
  const showResults = () => { endIntro(); setResultsMode(true) }
  return <Container className="pt-8 pb-12">
    {resultsMode
      ? <HomeResults model={model} onSearch={showResults} onExplore={() => { model.clear(); setResultsMode(false) }} />
      : <>
          <HomeIntro intro={intro} searchSlot={<SearchDialog model={model} onSubmit={showResults} />} />
          {packs.length
            ? <LevelShelf intro={intro} popular={popular} level={level} expanded={expanded} onLevel={value => { setLevel(value); setExpanded(false) }} onAll={() => setExpanded(true)} />
            : <EmptyState title="The library is empty">Published lesson packs will appear here.</EmptyState>}
        </>}
  </Container>
}

function HomeResults({ model, onSearch, onExplore }: { model: HomeFilterModel; onSearch: () => void; onExplore: () => void }) {
  return <section aria-labelledby="home-results">
    <Button variant="ghost" className="mb-3" onClick={onExplore}><ArrowLeft />Back to explore</Button>
    <SearchDialog model={model} onSubmit={onSearch} onClear={model.clear} />
    <div className="discovery-section-heading mt-8">
      <div>
        <h1 id="home-results">{model.query ? `Results for “${model.query}”` : 'Lesson packs'}</h1>
        <p role="status">{model.total} pack{model.total === 1 ? '' : 's'}</p>
      </div>
      <Select value={model.sort} onValueChange={value => { if (value) model.setSort(value) }} items={HOME_SORTS}>
        <SelectTrigger aria-label="Sort lesson packs"><SelectValue /></SelectTrigger>
        <SelectContent><SelectGroup>{Object.entries(HOME_SORTS).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectGroup></SelectContent>
      </Select>
    </div>
    {model.results.length ? <PackGrid packs={model.results} /> : <EmptyState title="No lesson packs match" actions={<Button onClick={model.clear}>Clear search and filters</Button>}>Try a broader topic or remove a filter.</EmptyState>}
  </section>
}
