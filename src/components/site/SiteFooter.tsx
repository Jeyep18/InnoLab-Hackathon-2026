import { Container, Logo } from './layout'

export function SiteFooter({ teacherPackCount }: { teacherPackCount: number }) {
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
            <li><a className="hover:text-foreground" href="#/moderation">Review queue</a></li>
          </ul>
        </nav>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p className="font-semibold text-foreground">About this demo</p>
          <p>Accounts, reviews and activity counts are sample data. Payments are simulated.</p>
          <p>Curriculum references in sample packs are examples, not official DepEd alignment.</p>
          {teacherPackCount > 0 && (
            <p>
              {teacherPackCount} teacher pack{teacherPackCount === 1 ? '' : 's'} shown for this demonstration only, from this computer.
            </p>
          )}
        </div>
      </Container>
    </footer>
  )
}
