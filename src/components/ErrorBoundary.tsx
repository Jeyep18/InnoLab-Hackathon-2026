import { Component, type ReactNode } from 'react'
import { clearFiles } from '../storage/fileStore'
import { clearState } from '../storage/persist'

/** Last line of defence on stage: never leave the presenter with a blank page. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="crash">
        <h1>CherIt hit a problem</h1>
        <p>Reload the page first. If it happens again, reset the demo to restore the sample data.</p>
        <div className="actions">
          <button className="button" onClick={() => window.location.reload()}>
            Reload
          </button>
          <button
            className="button button-quiet"
            onClick={async () => {
              clearState()
              await clearFiles().catch(() => undefined)
              window.location.hash = '/'
              window.location.reload()
            }}
          >
            Reset demo and reload
          </button>
        </div>
      </main>
    )
  }
}
