import { Bookmark, LogOut, Plus, RotateCcw, Settings, Sparkles, UserRound, Wallet } from 'lucide-react'
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
import { PersonAvatar } from './PersonAvatar'
import { ProPlanDialog } from './ProPlanDialog'
import { navigate } from '@/router'
import { useStore } from '@/store'

export function AccountMenu() {
  const { catalogue, persona, dispatch, notify } = useStore()
  const [confirmReset, setConfirmReset] = useState(false)
  const [proOpen, setProOpen] = useState(false)
  const personas = catalogue.personas.filter((p) => p.listed !== false)

  const switchPersona = (id: string | null) => {
    if (!id) return
    dispatch({ type: 'select-persona', personaId: id })
    notify(`Now signed in as ${personas.find((p) => p.id === id)?.alias}.`)
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full p-0"
              aria-label={`Account: ${persona.alias}`}
            />
          }
        >
          <PersonAvatar name={persona.alias} seed={persona.id} className="size-8" />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2.5 px-1.5 py-1.5 font-normal">
              <PersonAvatar name={persona.alias} seed={persona.id} className="size-9" />
              <span className="flex min-w-0 flex-col gap-1">
                <span className="truncate text-sm font-semibold leading-none text-foreground">{persona.alias}</span>
                <span className="truncate text-xs leading-none text-muted-foreground">{persona.area}</span>
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          {persona.role === 'teacher' && (
            <>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => navigate('/share')} className="font-medium text-mauve-ink">
                  <Plus /> Share a lesson
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setProOpen(true)} aria-label="Free plan. Upgrade to Pro">
                  <Sparkles /> Free plan
                  <span className="ml-auto text-xs font-medium text-mauve-ink">Upgrade</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
            </>
          )}
          <DropdownMenuGroup>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger openOnHover={false} label="Switch account">
                Switch account
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent className="w-64">
                <DropdownMenuRadioGroup value={persona.id} onValueChange={switchPersona}>
                  {personas.map((p) => (
                    <DropdownMenuRadioItem closeOnClick key={p.id} value={p.id}>
                      {p.alias}
                      {p.role !== 'moderator' && <span className="ml-auto pl-2 text-xs text-muted-foreground">{p.area.split(',')[0]}</span>}
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
            {persona.role === 'teacher' && (
              <DropdownMenuItem onClick={() => navigate(`/profile/${persona.id}?tab=earnings`)}>
                <Wallet /> Earnings
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => navigate('/saved')}>
              <Bookmark /> Saved
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <Settings /> Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/signin')}>
              <LogOut /> Log out
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setConfirmReset(true)}>
              <RotateCcw /> Reset app data
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>
      <ResetDemoDialog open={confirmReset} onOpenChange={setConfirmReset} />
      <ProPlanDialog open={proOpen} onOpenChange={setProOpen} />
    </>
  )
}

function ResetDemoDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const { resetDemo, notify } = useStore()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset app data?</DialogTitle>
          <DialogDescription>
            This clears bookmarks, reviews, downloads, uploads, verification requests and verifier changes made in this browser, and restores the starting library.
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
              notify('App data reset.')
            }}
          >
            Reset
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
