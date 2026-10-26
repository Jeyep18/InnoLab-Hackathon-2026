import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Agentation } from 'agentation'
import App from './App'
import { ErrorBoundary } from './components/ErrorBoundary'
import { useRoute } from './router'
import './index.css'

/** Annotation toolbar. Lives outside the app shell so it stays up on every route, including loading and the crash screen. */
function FeedbackToolbar() {
  // Browse updates the hash with replaceState, which does not fire hashchange. Subscribing here rerenders Agentation on those navigations.
  useRoute()
  return <Agentation appName="CherIt" endpoint="http://localhost:4747" useHashLocation />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
    <FeedbackToolbar />
  </StrictMode>,
)
