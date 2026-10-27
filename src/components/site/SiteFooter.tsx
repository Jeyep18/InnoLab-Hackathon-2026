import { useStore } from '@/store'
import { Container, Logo } from './layout'

export function SiteFooter({ library = false }: { library?: boolean }) {
  const moderator = useStore().persona.role === 'moderator'
  if (library) return <LibraryFooter />
  return (
    <footer className="mt-24 border-t bg-secondary/50">
      <Container className="grid gap-8 py-12 md:grid-cols-[1.2fr_1fr_1fr]">
        <div className="space-y-3">
          <Logo />
          <p className="max-w-xs text-sm text-muted-foreground">Lesson packs shared by Bicol teachers, with the teacher and the reviews shown up front.</p>
        </div>
        <nav aria-label="Footer" className="text-sm">
          <p className="mb-3 font-semibold">CherIt</p>
          <ul className="space-y-2 text-muted-foreground">
            <li><a className="hover:text-foreground" href="#/browse">Browse lesson packs</a></li>
            <li><a className="hover:text-foreground" href="#/share">Share a lesson</a></li>
            <li><a className="hover:text-foreground" href="#/saved">Saved</a></li>
            {moderator && <li><a className="hover:text-foreground" href="#/moderation">Verification queue</a></li>}
          </ul>
        </nav>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">About CherIt</p>
          <p>Teachers keep the copyright to what they share. Each pack shows its license and version history.</p>
          <p>© 2026 CherIt · Naga City, Camarines Sur</p>
        </div>
      </Container>
    </footer>
  )
}

function LibraryFooter() {
  const moderator = useStore().persona.role === 'moderator'
  return (
    <footer className="mt-16 border-t">
      <Container className="flex flex-col gap-7 py-8 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-col gap-3">
          <Logo />
          <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <a className="library-link" href="#/browse">Browse</a>
            <a className="library-link" href="#/share">Share a lesson</a>
            <a className="library-link" href="#/saved">Saved</a>
            {moderator && <a className="library-link" href="#/moderation">Verification queue</a>}
          </nav>
        </div>
        <div className="flex max-w-md flex-col gap-2 text-xs leading-relaxed text-muted-foreground">
          <p>Lesson packs shared by Bicol teachers. Teachers keep the copyright to what they share; each pack shows its license and version history.</p>
          <p>© 2026 CherIt · Naga City, Camarines Sur</p>
        </div>
      </Container>
    </footer>
  )
}
