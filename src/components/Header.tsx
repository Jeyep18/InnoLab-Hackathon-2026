import { useState } from 'react'
import { navigate, useRoute } from '../router'
import { useStore } from '../store'
import { Dialog } from './ui'

const NAV = [
  { to: '/', label: 'Browse', match: '' },
  { to: '/saved', label: 'Saved', match: 'saved' },
  { to: '/share', label: 'Share a lesson', match: 'share' },
  { to: '/moderation', label: 'Review queue', match: 'moderation' },
]

export function Header() {
  const { catalogue, persona, dispatch, resetDemo, notify } = useStore()
  const { parts } = useRoute()
  const [confirmReset, setConfirmReset] = useState(false)
  const current = parts[0] ?? ''

  return (
    <header className="site-header">
      <div className="header-inner">
        <a className="wordmark" href="#/" aria-label="CherIt home">
          <span className="wordmark-name">CherIt</span>
          <span className="wordmark-say">say “share it”</span>
        </a>
        <nav aria-label="Main">
          <ul>
            {NAV.map((item) => (
              <li key={item.to}>
                <a href={`#${item.to}`} aria-current={current === item.match ? 'page' : undefined}>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="persona-controls">
          <label className="persona-select">
            <span>Demo persona</span>
            <select
              value={persona.id}
              onChange={(e) => {
                dispatch({ type: 'select-persona', personaId: e.target.value })
                const next = catalogue.personas.find((p) => p.id === e.target.value)
                notify(`Now browsing as ${next?.alias} (demo persona).`)
              }}
            >
              {catalogue.personas.filter((p) => p.listed !== false).map((p) => (
                <option key={p.id} value={p.id}>
                  {p.alias}
                  {p.role === 'moderator' ? '' : `, ${p.area}`}
                </option>
              ))}
            </select>
          </label>
          <a className="text-link" href={`#/profile/${persona.id}`}>
            My profile
          </a>
          <button className="button button-quiet" onClick={() => setConfirmReset(true)}>
            Reset demo
          </button>
        </div>
      </div>
      <Dialog open={confirmReset} title="Reset the demo?" onClose={() => setConfirmReset(false)}>
        <p>
          This clears bookmarks, reviews, downloads, uploads and moderation changes made in this browser, and restores the
          sample data. Teacher files on this computer are not touched.
        </p>
        <div className="actions">
          <button
            className="button"
            onClick={async () => {
              await resetDemo()
              setConfirmReset(false)
              navigate('/')
              notify('Demo reset. Sample data restored.')
            }}
          >
            Reset demo
          </button>
          <button className="button button-quiet" onClick={() => setConfirmReset(false)}>
            Cancel
          </button>
        </div>
      </Dialog>
    </header>
  )
}
