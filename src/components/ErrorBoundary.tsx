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
      <main className="mx-auto flex min-h-dvh max-w-lg flex-col justify-center px-6">
        <h1 className="text-3xl font-bold tracking-tight">CherIt hit a problem</h1>
        <p className="mt-3 text-muted-foreground">Reload the page first. If it happens again, reset the app data in this browser.</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <button className="inline-flex h-10 items-center rounded-lg bg-primary px-4 font-medium text-primary-foreground" onClick={() => window.location.reload()}>
            Reload
          </button>
          <button
            className="inline-flex h-10 items-center rounded-lg border px-4 font-medium"
            onClick={async () => {
              clearState()
              await clearFiles().catch(() => undefined)
              window.location.hash = '/'
              window.location.reload()
            }}
          >
            Reset and reload
          </button>
        </div>
      </main>
    )
  }
}
