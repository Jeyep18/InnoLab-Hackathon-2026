import { Bookmark, Menu } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useRoute } from '@/router'
import { useStore } from '@/store'
import { AccountMenu } from './AccountMenu'
import { Container, Logo } from './layout'

const NAV = [
  { to: '/browse', label: 'Browse', match: 'browse' },
  { to: '/share', label: 'Share a lesson', match: 'share' },
  { to: '/moderation', label: 'Review queue', match: 'moderation' },
]

export function SiteHeader() {
  const { persona } = useStore()
  const { parts } = useRoute()
  const current = parts[0] ?? ''
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-40 bg-[#fafafc] backdrop-blur-[20px] backdrop-saturate-[1.8] supports-[backdrop-filter]:bg-[#fafafc]/80">
      <Container className="flex h-12 items-center gap-6">
        <Logo />
        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.to}>
                <a
                  href={`#${item.to}`}
                  aria-current={current === item.match ? 'page' : undefined}
                  className="rounded-lg px-3 py-2 text-[15px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground aria-[current=page]:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger
              render={<Button variant="ghost" size="icon" className={cn(current === 'saved' && 'bg-accent text-foreground')} render={<a href="#/saved" aria-label="Saved lesson packs" aria-current={current === 'saved' ? 'page' : undefined} />} nativeButton={false} />}
            >
              <Bookmark className="size-[18px]" />
            </TooltipTrigger>
            <TooltipContent>Saved</TooltipContent>
          </Tooltip>

          <AccountMenu />

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu" />}>
                <Menu className="size-5" />
              </SheetTrigger>
            <SheetContent side="right" className="w-[85vw] max-w-sm">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription>Viewing as {persona.alias} (demo account)</SheetDescription>
              </SheetHeader>
              <nav aria-label="Main" className="px-4">
                <ul className="flex flex-col gap-1">
                  {[...NAV, { to: '/saved', label: 'Saved', match: 'saved' }, { to: `/profile/${persona.id}`, label: 'My profile', match: 'profile' }].map((item) => (
                    <li key={item.to}>
                      <a
                        href={`#${item.to}`}
                        onClick={() => setMenuOpen(false)}
                        aria-current={current === item.match ? 'page' : undefined}
                        className="flex h-12 items-center rounded-lg px-3 text-base font-medium hover:bg-accent aria-[current=page]:bg-accent"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>

    </header>
  )
}
