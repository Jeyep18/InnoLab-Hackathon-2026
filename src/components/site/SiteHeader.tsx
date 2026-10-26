import { Bookmark, Menu, RotateCcw, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { initials } from '@/lib/pack'
import { cn } from '@/lib/utils'
import { navigate, useRoute } from '@/router'
import { useStore } from '@/store'
import { Container, Logo } from './layout'
import { ThemeToggle } from './ThemeToggle'

const NAV = [
  { to: '/browse', label: 'Browse', match: 'browse' },
  { to: '/share', label: 'Share a lesson', match: 'share' },
  { to: '/moderation', label: 'Review queue', match: 'moderation' },
]

export function SiteHeader() {
  const { catalogue, persona, dispatch, notify, resetDemo } = useStore()
  const { parts } = useRoute()
  const current = parts[0] ?? ''
  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)
  const personas = catalogue.personas.filter((p) => p.listed !== false)

  const switchPersona = (id: string) => {
    dispatch({ type: 'select-persona', personaId: id })
    notify(`Now browsing as ${personas.find((p) => p.id === id)?.alias} (demo account).`)
  }

  return (
    <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/75">
      <Container className="flex h-16 items-center gap-6">
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
            <TooltipTrigger asChild>
              <Button variant="ghost" size="icon" asChild className={cn(current === 'saved' && 'bg-accent text-foreground')}>
                <a href="#/saved" aria-label="Saved lesson packs" aria-current={current === 'saved' ? 'page' : undefined}>
                  <Bookmark className="size-[18px]" />
                </a>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Saved</TooltipContent>
          </Tooltip>
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="ml-1 h-10 gap-2 rounded-full pr-3 pl-1" aria-label={`Account: ${persona.alias}, demo account`}>
                <Avatar className="size-8">
                  <AvatarFallback className="bg-olive text-xs font-semibold text-white">{initials(persona)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm sm:inline">{persona.alias}</span>
                <span className="hidden text-xs text-muted-foreground sm:inline">· demo</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-72">
              <DropdownMenuLabel className="font-normal">
                <p className="text-xs text-muted-foreground">Viewing as</p>
                <p className="font-semibold text-foreground">{persona.alias}</p>
                <p className="text-xs text-muted-foreground">Demo account · {persona.area}</p>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="text-xs text-muted-foreground">Switch demo account</DropdownMenuLabel>
              <DropdownMenuRadioGroup value={persona.id} onValueChange={switchPersona}>
                {personas.map((p) => (
                  <DropdownMenuRadioItem key={p.id} value={p.id}>
                    {p.alias}
                    {p.role !== 'moderator' && <span className="ml-auto pl-2 text-xs text-muted-foreground">{p.area.replace(' (sample)', '')}</span>}
                  </DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => navigate(`/profile/${persona.id}`)}>
                <UserRound /> My profile
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => navigate('/saved')}>
                <Bookmark /> Saved
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setConfirmReset(true)}>
                <RotateCcw /> Reset demo
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
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

      <Dialog open={confirmReset} onOpenChange={setConfirmReset}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset the demo?</DialogTitle>
            <DialogDescription>
              This clears bookmarks, reviews, downloads, uploads and moderation changes made in this browser, and restores the sample data.
              Teacher files on this computer are not touched.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={async () => {
                await resetDemo()
                setConfirmReset(false)
                navigate('/')
                notify('Demo reset. Sample data restored.')
              }}
            >
              Reset demo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  )
}
