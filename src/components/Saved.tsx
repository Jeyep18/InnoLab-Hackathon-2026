import { useStore } from '../store'
import { ResourceCard } from './ResourceCard'
import { Empty } from './ui'

export function Saved() {
  const { state, resources, persona } = useStore()
  const saved = state.bookmarks
    .filter((b) => b.personaId === state.personaId)
    .map((b) => resources.find((r) => r.id === b.resourceId))
    .filter((r) => r !== undefined)

  return (
    <div className="page">
      <h1>Saved by {persona.alias}</h1>
      {saved.length === 0 ? (
        <Empty title="Nothing saved yet">
          <p>Save a lesson pack from its page to keep it here for later.</p>
          <a className="button" href="#/">
            Browse lesson packs
          </a>
        </Empty>
      ) : (
        <div className="grid">
          {saved.map((r) => (
            <div key={r.id}>
              {r.status !== 'published' && <p className="status-note">This pack is on hold and hidden from search.</p>}
              <ResourceCard resource={r} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
