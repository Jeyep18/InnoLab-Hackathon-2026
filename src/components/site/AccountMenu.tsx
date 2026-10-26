import { Bookmark, RotateCcw, UserRound } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { initials } from '@/lib/pack'
import { navigate } from '@/router'
import { useStore } from '@/store'

export function AccountMenu() {
  const { catalogue, persona, dispatch, notify } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const personas = catalogue.personas.filter((p) => p.listed !== false)

  const switchPersona = (id: string | null) => {
    if (!id) return
    dispatch({ type: 'select-persona', personaId: id })
    notify(`Now browsing as ${personas.find((p) => p.id === id)?.alias} (demo account).`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              size="icon-sm"
              className="text-xs font-semibold"
              aria-label={`Account: ${persona.alias}, demo account`}
            />
          }
        >
          {initials(persona)}
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col gap-0.5 px-1.5 py-1 font-normal">
              <span className="text-sm font-semibold leading-none text-foreground">{persona.alias}</span>
              <span className="text-xs leading-none text-muted-foreground">Demo · {persona.area.replace(' (sample)', '')}</span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger openOnHover={false} label="Switch demo account">
                Switch demo account
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                <DropdownMenuRadioGroup value={persona.id} onValueChange={switchPersona}>
                  {personas.map((p) => (
                    <DropdownMenuRadioItem closeOnClick key={p.id} value={p.id}>
                      {p.alias}
                      {p.role !== 'moderator' && <span className="ml-auto pl-2 text-xs text-muted-foreground">{p.area.replace(' (sample)', '')}</span>}
                    </DropdownMenuRadioItem>
                  ))}
                </DropdownMenuRadioGroup>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate(`/profile/${persona.id}`)}>
              <UserRound /> My profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/saved')}>
              <Bookmark /> Saved
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setConfirmReset(true)}>
              <RotateCcw /> Reset demo
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ResetDemoDialog open={confirmReset} onOpenChange={setConfirmReset} />
    </>
  )
}

function ResetDemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { resetDemo, notify } = useStore()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset the demo?</DialogTitle>
          <DialogDescription>
            This clears bookmarks, reviews, downloads, uploads and moderation changes made in this browser, and restores the sample data.
            Teacher files on this computer are not touched.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}> Cancel</DialogClose>
          <Button
            onClick={async () => {
              await resetDemo()
              onOpenChange(false)
              navigate('/')
              notify('Demo reset. Sample data restored.')
            }}
          >
            Reset demo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
